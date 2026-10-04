#!/usr/bin/env node

import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatesRoot = path.join(packageRoot, "templates");

const usage = `Usage: mike-coding-setup init [options]

Install reusable Codex project setup in the current directory.

Options:
  --target <path>  Install into this directory instead of the current directory.
  --rules          Install .agents/rules (selected by default).
  --agents         Install .codex/agents (selected by default).
  --skills         Install .agents/skills, including license material.
  --dry-run        Show the files that would be installed.
  --force          Replace existing destination files.
  --help           Show this help.`;

function parseArguments(argumentsList) {
  const options = { agents: false, dryRun: false, force: false, rules: false, skills: false, target: process.cwd() };
  let hasSelection = false;

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--help" || argument === "-h") return { help: true };
    if (argument === "--rules" || argument === "--agents" || argument === "--skills") {
      options[argument.slice(2)] = true;
      hasSelection = true;
    } else if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--force") {
      options.force = true;
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
    const destinationFile = path.join(options.target, group.destination, relativeFile);
    const destinationExists = await exists(destinationFile);

    if (destinationExists && !options.force) {
      console.log(`skip     ${path.relative(options.target, destinationFile)} (already exists)`);
      skipped += 1;
      continue;
    }

    console.log(`${options.dryRun ? "would add" : "install"}  ${path.relative(options.target, destinationFile)}`);
    if (!options.dryRun) {
      await mkdir(path.dirname(destinationFile), { recursive: true });
      await cp(sourceFile, destinationFile, { force: true });
    }
    installed += 1;
  }

  return { installed, skipped };
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
    options.agents && { source: "agents", destination: ".codex/agents" },
    options.skills && { source: "skills", destination: ".agents/skills" },
  ].filter(Boolean);

  if (!options.dryRun) await mkdir(options.target, { recursive: true });
  let installed = 0;
  let skipped = 0;
  for (const group of groups) {
    const result = await installGroup(group, options);
    installed += result.installed;
    skipped += result.skipped;
  }

  console.log(`\n${options.dryRun ? "Would install" : "Installed"} ${installed} file(s); skipped ${skipped}.`);
  if (options.rules || options.agents) {
    console.log("Add templates/AGENTS.snippet.md to the target project's AGENTS.md after reviewing its project-specific instructions.");
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
