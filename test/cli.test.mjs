import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
  await assert.rejects(readFile(path.join(target, ".agents/skills/implement/SKILL.md"), "utf8"));
});

test("all dry-run includes rules, agents, skills, and Graphify", async (context) => {
  const target = await createTarget();
  context.after(() => rm(target, { force: true, recursive: true }));

  const result = run(target, "--all", "--dry-run");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /would add\s+\.agents[\\/]rules[\\/]code-quality\.md/);
  assert.match(result.stdout, /would add\s+\.codex[\\/]agents[\\/]verifier\.toml/);
  assert.match(result.stdout, /skills@latest add mattpocock\/skills/);
  assert.match(result.stdout, /uv tool install --reinstall graphifyy/);
  assert.match(result.stdout, /uvx --from graphifyy graphify install --project --platform codex/);
});
