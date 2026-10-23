import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(packageRoot, "bin/mike-coding-setup.mjs");

async function createTarget() {
  return mkdtemp(path.join(tmpdir(), "mike-coding-setup-"));
}

function run(target, ...argumentsList) {
  return spawnSync(process.execPath, [cliPath, "init", "--target", target, ...argumentsList], { encoding: "utf8" });
}

test("installs rules and agents without changing AGENTS.md", async (context) => {
  const target = await createTarget();
  context.after(() => rm(target, { force: true, recursive: true }));
  await writeFile(path.join(target, "AGENTS.md"), "# Project instructions\n");

  const result = run(target);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Installed 7 file\(s\)/);
  assert.equal(await readFile(path.join(target, "AGENTS.md"), "utf8"), "# Project instructions\n");
  assert.match(await readFile(path.join(target, ".codex/agents/verifier.toml"), "utf8"), /name = "verifier"/);
});

test("does not overwrite a destination file without force", async (context) => {
  const target = await createTarget();
  context.after(() => rm(target, { force: true, recursive: true }));
  const existingRule = path.join(target, ".agents/rules/code-quality.md");
  await mkdir(path.dirname(existingRule), { recursive: true });
  await writeFile(existingRule, "custom rule\n");

  const result = run(target, "--rules");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /skip     \.agents[\\/]rules[\\/]code-quality\.md/);
  assert.equal(await readFile(existingRule, "utf8"), "custom rule\n");
});

test("dry-run reports files without creating them", async (context) => {
  const target = await createTarget();
  context.after(() => rm(target, { force: true, recursive: true }));

  const result = run(target, "--agents", "--dry-run");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /would add/);
  await assert.rejects(readFile(path.join(target, ".codex/agents/verifier.toml"), "utf8"));
});

test("skills dry-run uses Matt Pocock's official installer", async (context) => {
  const target = await createTarget();
  context.after(() => rm(target, { force: true, recursive: true }));

  const result = run(target, "--skills", "--dry-run");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /would run\s+npx(?:\.cmd)? skills@latest add mattpocock\/skills/);
  assert.match(result.stdout, /mattpocock\/skills --agent codex\r?\n/);
  assert.doesNotMatch(result.stdout, /emilkowalski\/skills/);
  await assert.rejects(readFile(path.join(target, ".agents/skills/implement/SKILL.md"), "utf8"));
});

test("Claude setup installs native profiles and shared instructions without Codex profiles", async (context) => {
  const target = await createTarget();
  context.after(() => rm(target, { force: true, recursive: true }));

  const result = run(target, "--tools", "claude");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Installed 9 file\(s\)/);
  await assert.rejects(readdir(path.join(target, ".codex")));
  assert.match(await readFile(path.join(target, "CLAUDE.md"), "utf8"), /^@AGENTS\.md/);
  assert.match(await readFile(path.join(target, "AGENTS.md"), "utf8"), /\.agents\/rules\/code-quality\.md/);
  assert.match(await readFile(path.join(target, "AGENTS.md"), "utf8"), /docs\/tickets\//);
  const profiles = await readdir(path.join(target, ".claude/agents"));
  assert.deepEqual(profiles.sort(), ["senior-react-dev.md", "supabase-specialist.md", "verifier.md"]);
  for (const filename of profiles) {
    const source = await readFile(path.join(packageRoot, "templates/agents", filename.replace(/\.md$/, ".toml")), "utf8");
    const generated = await readFile(path.join(target, ".claude/agents", filename), "utf8");
    assert.match(generated, /^---\nname: ".+"\ndescription: ".+"\n---\n/);
    const prompt = source.split('developer_instructions = """')[1].split('"""')[0].trim();
    // Verify every instruction survives conversion apart from Codex-specific sandbox wording.
    assert.equal(generated.split("---\n\n")[1].trim(), prompt.replace(
      "The workspace-write setting exists so tools can create build output, caches, coverage, and temporary reports; it is not permission to fix code.",
      "Tools may create build output, caches, coverage, and temporary reports; this is not permission to fix code.",
    ));
  }
});

test("dual-tool setup installs both profile formats and is repeatable", async (context) => {
  const target = await createTarget();
  context.after(() => rm(target, { force: true, recursive: true }));

  const first = run(target, "--tools", "codex,claude");
  assert.equal(first.status, 0, first.stderr);
  assert.match(first.stdout, /Installed 12 file\(s\); skipped 0/);
  const codexProfile = await readFile(path.join(target, ".codex/agents/verifier.toml"), "utf8");
  assert.equal(codexProfile, await readFile(path.join(packageRoot, "templates/agents/verifier.toml"), "utf8"));
  assert.match(await readFile(path.join(target, ".claude/agents/verifier.md"), "utf8"), /must not change application source/);

  const second = run(target, "--tools", "codex,claude");
  assert.equal(second.status, 0, second.stderr);
  assert.match(second.stdout, /Installed 0 file\(s\); skipped 12/);
});

test("existing project instructions and Claude profiles are preserved unless forced", async (context) => {
  const target = await createTarget();
  context.after(() => rm(target, { force: true, recursive: true }));
  const existingFiles = ["AGENTS.md", "CLAUDE.md", ".claude/agents/verifier.md"];
  for (const filename of existingFiles) {
    await mkdir(path.dirname(path.join(target, filename)), { recursive: true });
    await writeFile(path.join(target, filename), "custom instructions\n");
  }

  const result = run(target, "--tools", "claude");
  assert.equal(result.status, 0, result.stderr);
  for (const filename of existingFiles) {
    assert.equal(await readFile(path.join(target, filename), "utf8"), "custom instructions\n");
  }
  assert.match(result.stdout, /merge templates\/AGENTS\.snippet\.md and templates\/WORKFLOW\.snippet\.md/);

  const forced = run(target, "--tools", "claude", "--force");
  assert.equal(forced.status, 0, forced.stderr);
  assert.match(await readFile(path.join(target, "CLAUDE.md"), "utf8"), /^@AGENTS\.md/);
  assert.match(await readFile(path.join(target, ".claude/agents/verifier.md"), "utf8"), /^---/);
});

test("dual-tool all dry-run routes both skill repositories and Graphify to selected tools", async (context) => {
  const target = await createTarget();
  context.after(() => rm(target, { force: true, recursive: true }));
  const result = run(target, "--all", "--tools", "codex,claude", "--dry-run");

  assert.equal(result.status, 0, result.stderr);
  for (const repository of ["mattpocock/skills", "emilkowalski/skills"]) {
    assert.ok(result.stdout.includes(`${repository} --agent codex claude-code`));
  }
  assert.match(result.stdout, /graphify install --project --platform codex/);
  const claudePlatform = process.platform === "win32" ? "windows" : "claude";
  assert.ok(result.stdout.includes(`graphify install --project --platform ${claudePlatform}`));
  assert.equal(result.stdout.match(/uv tool install/g)?.length, 1);
  assert.match(result.stdout, /Would install 12 file\(s\)/);
  assert.deepEqual(await readdir(target), []);
});

test("Claude-only skills and Graphify do not select Codex or install unrelated templates", async (context) => {
  const target = await createTarget();
  context.after(() => rm(target, { force: true, recursive: true }));
  const result = run(target, "--skills", "--design-skills", "--grapi", "--tools", "claude", "--dry-run");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /mattpocock\/skills --agent claude-code\r?\n/);
  assert.match(result.stdout, /emilkowalski\/skills --agent claude-code\r?\n/);
  assert.doesNotMatch(result.stdout, /codex|would add|AGENTS\.snippet/);
  assert.deepEqual(await readdir(target), []);
});

test("tool lists reject invalid or missing values before writing files", async (context) => {
  const target = await createTarget();
  context.after(() => rm(target, { force: true, recursive: true }));
  for (const args of [["--tools"], ["--tools", "--all"], ["--tools", "cursor"], ["--tools", "codex,"], ["--tools", ""], ["--tools", "claude;echo"]]) {
    const result = run(target, ...args);
    assert.equal(result.status, 1, JSON.stringify(args));
    assert.match(result.stderr, /--tools/);
    assert.deepEqual(await readdir(target), []);
  }
});

test("tool lists trim whitespace, deduplicate, and preserve selection order", async (context) => {
  const target = await createTarget();
  context.after(() => rm(target, { force: true, recursive: true }));
  const result = run(target, "--skills", "--tools", " claude, codex,claude ", "--dry-run");
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /--agent claude-code codex\r?\n/);
});

test("design skills dry-run selects only Emil Kowalski's official installer", async (context) => {
  const target = await createTarget();
  context.after(() => rm(target, { force: true, recursive: true }));

  const result = run(target, "--design-skills", "--dry-run");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /would run\s+npx(?:\.cmd)? skills@latest add emilkowalski\/skills/);
  assert.match(result.stdout, /Would install 0 file\(s\)/);
  assert.doesNotMatch(result.stdout, /mattpocock\/skills|graphify|would add|AGENTS\.snippet/);
});

test("all dry-run includes rules, agents, workflow skills, design skills, and Graphify", async (context) => {
  const target = await createTarget();
  context.after(() => rm(target, { force: true, recursive: true }));

  const result = run(target, "--all", "--dry-run");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /would add\s+\.agents[\\/]rules[\\/]code-quality\.md/);
  assert.match(result.stdout, /would add\s+\.codex[\\/]agents[\\/]verifier\.toml/);
  assert.match(result.stdout, /skills@latest add mattpocock\/skills/);
  assert.match(result.stdout, /skills@latest add emilkowalski\/skills/);
  assert.match(result.stdout, /uv tool install --reinstall graphifyy/);
  assert.match(result.stdout, /uvx --from graphifyy graphify install --project --platform codex/);
});
