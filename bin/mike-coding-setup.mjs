#!/usr/bin/env node

import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatesRoot = path.join(packageRoot, "templates");

const usage = `Usage: mike-coding-setup init [options]

Install reusable Codex and Claude Code project setup in the current directory.

Options:
  --target <path>  Install into this directory instead of the current directory.
  --tools <list>   Target codex, claude, or codex,claude (default: codex).
  --rules          Install .agents/rules (selected by default).
  --agents         Install specialist profiles for the selected tools.
  --skills         Install Matt Pocock's skills using the official Skills CLI.
  --design-skills  Install Emil Kowalski's design skills using the official Skills CLI.
  --graphify       Install Graphify for the selected tools (alias: --grapi).
  --all            Install rules, agents, workflow skills, design skills, and Graphify.
  --dry-run        Show files and commands without making changes.
  --force          Replace existing destination files.
  --help           Show this help.`;

function parseArguments(argumentsList) {
  const options = {
    agents: false,
    designSkills: false,
    dryRun: false,
    force: false,
    graphify: false,
    rules: false,
    skills: false,
    target: process.cwd(),
    tools: ["codex"],
  };
  let hasSelection = false;

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--help" || argument === "-h") return { help: true };
    if (argument === "--rules" || argument === "--agents" || argument === "--skills") {
      options[argument.slice(2)] = true;
      hasSelection = true;
    } else if (argument === "--design-skills") {
      options.designSkills = true;
      hasSelection = true;
    } else if (argument === "--graphify" || argument === "--grapi") {
      options.graphify = true;
      hasSelection = true;
    } else if (argument === "--all") {
      options.rules = true;
      options.agents = true;
      options.skills = true;
      options.designSkills = true;
      options.graphify = true;
      hasSelection = true;
    } else if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--force") {
      options.force = true;
    } else if (argument === "--tools") {
      const value = argumentsList[index + 1];
      if (!value || value.startsWith("--")) throw new Error("--tools requires codex, claude, or codex,claude.");
      const selectedTools = value.split(",").map((tool) => tool.trim());
      if (selectedTools.some((tool) => !["codex", "claude"].includes(tool))) {
        throw new Error("--tools supports only codex and claude, separated by commas.");
      }
      options.tools = [...new Set(selectedTools)];
      index += 1;
    } else if (argument === "--target") {
      const target = argumentsList[index + 1];
      if (!target) throw new Error("--target requires a path.");
      options.target = path.resolve(target);
      index += 1;
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }

  if (!hasSelection) {
    options.rules = true;
    options.agents = true;
  }

  return options;
}

function commandLabel(command, argumentsList) {
  return [command, ...argumentsList].join(" ");
}

function runExternalCommand(command, argumentsList, options) {
  const label = commandLabel(command, argumentsList);
  if (options.dryRun) {
    console.log(`would run  ${label}`);
    return;
  }

  console.log(`run       ${label}`);
  const result = spawnSync(command, argumentsList, {
    cwd: options.target,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${label} exited with status ${result.status}.`);
}

function installSkills(repository, options) {
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  const agents = options.tools.map((tool) => tool === "claude" ? "claude-code" : tool);
  runExternalCommand(npx, ["skills@latest", "add", repository, "--agent", ...agents], options);
}

function installGraphify(options) {
  runExternalCommand("uv", ["tool", "install", "--reinstall", "graphifyy"], options);
  for (const tool of options.tools) {
    const platform = tool === "claude" ? (process.platform === "win32" ? "windows" : "claude") : tool;
    runExternalCommand("uvx", ["--from", "graphifyy", "graphify", "install", "--project", "--platform", platform], options);
  }
}

// These bundled profiles use basic TOML strings and a multiline literal prompt.
// Fail rather than silently losing instructions if their format changes.
function claudeAgentTemplate(source) {
  const name = source.match(/^name = (".*")\r?$/m)?.[1];
  const description = source.match(/^description = (".*")\r?$/m)?.[1];
  const instructions = source.match(/^developer_instructions = """\r?\n([\s\S]*?)^"""\s*$/m)?.[1];
  if (!name || !description || !instructions) throw new Error("Unsupported bundled agent template format.");
  const prompt = instructions.replace(
    "The workspace-write setting exists so tools can create build output, caches, coverage, and temporary reports; it is not permission to fix code.",
    "Tools may create build output, caches, coverage, and temporary reports; this is not permission to fix code.",
  );
  return `---\nname: ${name}\ndescription: ${description}\n---\n\n${prompt.trim()}\n`;
}

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(entryPath) : [entryPath];
  }));
  return files.flat();
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function installGroup(group, options) {
  const sourceDirectory = path.join(templatesRoot, group.source);
  const files = await walkFiles(sourceDirectory);
  let installed = 0;
  let skipped = 0;

  for (const sourceFile of files) {
    const relativeFile = path.relative(sourceDirectory, sourceFile);
    const filename = group.claude ? relativeFile.replace(/\.toml$/, ".md") : relativeFile;
    const source = await readFile(sourceFile, "utf8");
    const added = await installFile(path.join(group.destination, filename), group.claude ? claudeAgentTemplate(source) : source, options);
    if (added) installed += 1;
    else skipped += 1;
  }

  return { installed, skipped };
}

async function installFile(relativeFile, content, options) {
  const destinationFile = path.join(options.target, relativeFile);
  if (await exists(destinationFile) && !options.force) {
    console.log(`skip     ${relativeFile} (already exists)`);
    return false;
  }
  console.log(`${options.dryRun ? "would add" : "install"}  ${relativeFile}`);
  if (!options.dryRun) {
    await mkdir(path.dirname(destinationFile), { recursive: true });
    await writeFile(destinationFile, content, "utf8");
  }
  return true;
}

async function installClaudeInstructions(options) {
  const shared = await readFile(path.join(templatesRoot, "AGENTS.snippet.md"), "utf8");
  const workflow = await readFile(path.join(templatesRoot, "WORKFLOW.snippet.md"), "utf8");
  const claude = await readFile(path.join(templatesRoot, "CLAUDE.md"), "utf8");
  const addedShared = await installFile("AGENTS.md", `${shared.trim()}\n\n${workflow}`, options);
  const addedClaude = await installFile("CLAUDE.md", claude, options);
  return { installed: Number(addedShared) + Number(addedClaude), skipped: Number(!addedShared) + Number(!addedClaude) };
}

async function main() {
  const [command, ...argumentsList] = process.argv.slice(2);
  if (command === "--help" || command === "-h") {
    console.log(usage);
    return;
  }
  if (command !== "init") throw new Error("The first argument must be init.\n\n" + usage);

  const options = parseArguments(argumentsList);
  if (options.help) {
    console.log(usage);
    return;
  }

  const groups = [
    options.rules && { source: "rules", destination: ".agents/rules" },
    options.agents && options.tools.includes("codex") && { source: "agents", destination: ".codex/agents" },
    options.agents && options.tools.includes("claude") && { source: "agents", destination: ".claude/agents", claude: true },
  ].filter(Boolean);

  if (!options.dryRun) await mkdir(options.target, { recursive: true });
  let installed = 0;
  let skipped = 0;
  for (const group of groups) {
    const result = await installGroup(group, options);
    installed += result.installed;
    skipped += result.skipped;
  }

  if ((options.rules || options.agents) && options.tools.includes("claude")) {
    const result = await installClaudeInstructions(options);
    installed += result.installed;
    skipped += result.skipped;
  }

  if (options.skills) installSkills("mattpocock/skills", options);
  if (options.designSkills) installSkills("emilkowalski/skills", options);
  if (options.graphify) installGraphify(options);

  console.log(`\n${options.dryRun ? "Would install" : "Installed"} ${installed} file(s); skipped ${skipped}.`);
  if (options.rules || options.agents) {
    if (options.tools.includes("claude")) {
      console.log("If instruction files were skipped, merge templates/AGENTS.snippet.md and templates/WORKFLOW.snippet.md into AGENTS.md and add @AGENTS.md to CLAUDE.md if missing.");
    } else {
      console.log("Add templates/AGENTS.snippet.md to the target project's AGENTS.md after reviewing its project-specific instructions.");
    }
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
