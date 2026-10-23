# mike-coding-setup

Reusable Codex and Claude Code setup for a project: shared engineering rules, optional specialist agents, Matt Pocock's workflow skills, Emil Kowalski's design skills, and Graphify.

## Usage

```sh
npx mike-coding-setup init
npx mike-coding-setup init --rules --agents
npx mike-coding-setup init --skills
npx mike-coding-setup init --design-skills
npx mike-coding-setup init --graphify
npx mike-coding-setup init --all
npx mike-coding-setup init --all --tools codex,claude
npx mike-coding-setup init --all --tools claude
npx mike-coding-setup init --dry-run
npx mike-coding-setup init --force
```

Run the command from the project root. It installs rules and agents for Codex by default. Use `--tools claude` for Claude Code or `--tools codex,claude` for both. `--tools` selects the tools, not the packages: combine it with `--skills`, `--design-skills`, `--graphify`, or `--all` as needed. Use Node.js 22.20+ for the latest Skills CLI, and install the coding tools you plan to use separately.

- `--skills` runs the official installer, `npx skills@latest add mattpocock/skills --agent <selected agents>`.
- `--design-skills` installs only [Emil Kowalski's design skills](https://github.com/emilkowalski/skills) through `npx skills@latest add emilkowalski/skills --agent <selected agents>`.
- Both skill installers receive `codex`, `claude-code`, or both according to `--tools`. You still choose the desired skills and installation method when prompted. Choose **Symlink** to keep one canonical copy under `.agents/skills/` and link Claude's skills from `.claude/skills/`. The upstream CLI uses directory junctions on Windows and can fall back to copies if linking fails; inspect its installation summary. Updates are managed from the project with `npx skills update`. Existing skills installed only for Codex can be exposed to Claude by rerunning the relevant skill option with both tools selected.
- `--graphify` (or `--grapi`) installs the official `graphifyy` CLI through [uv](https://docs.astral.sh/uv/) once, then registers it project-scoped for each selected tool. Codex uses `--platform codex`; Claude uses `--platform claude` on macOS/Linux or `--platform windows` on Windows. Use `$graphify .` in Codex or `/graphify .` in Claude Code. Graphify retains its own platform-specific skill instructions.
- `--all` installs rules, agents, Matt Pocock's workflow skills, Emil Kowalski's design skills, and Graphify together.

Bundled templates never replace existing files unless `--force` is present. External Skills CLI and Graphify commands follow their own prompts and update behavior; `--force` applies only to this package's templates. `--dry-run` reports templates and external commands without writing files or invoking installers.

## Shared configuration

Rules are installed once in `.agents/rules/`. Codex profiles go to `.codex/agents/*.toml`; Claude profiles go to `.claude/agents/*.md`. Claude profiles are generated from the same bundled instructions as Codex profiles, preserving the specialist behavior without maintaining duplicate prompts. Permissions remain controlled by each tool; the verifier's source-read-only policy is an instruction, not an OS restriction.

When Claude is selected with rules or agents, the installer also creates an `AGENTS.md` with shared rules and workflow guidance and a `CLAUDE.md` importing it via `@AGENTS.md`. These files are skipped if they already exist. Merge `templates/AGENTS.snippet.md` and `templates/WORKFLOW.snippet.md` into existing project instructions as appropriate, and add `@AGENTS.md` to an existing `CLAUDE.md` if missing. In Codex-only setups the command continues to print the snippet reminder without creating `AGENTS.md` automatically. Skills-only and Graphify-only selections do not install these instruction templates.

Shared instruction import: [Claude Code documentation](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools). Skill destinations and linking: [Skills CLI agents](https://github.com/vercel-labs/skills/blob/main/docs/agents.md) and [installation reference](https://github.com/vercel-labs/skills/blob/main/docs/commands.md).

## Codex and Claude workflow

With both tools, the default responsibilities are:

1. Codex writes a spec in `docs/specs/` and small tickets in `docs/tickets/`, each with acceptance criteria, scope, dependencies, and required checks. Existing project locations can be used instead.
2. Claude reads the assigned ticket, its spec, and shared rules, then implements it using the relevant development and design skills. It records changed files, checks actually run, results, and remaining limitations for handoff.
3. Codex reviews the actual diff against the ticket and spec, including relevant uncommitted and untracked files, and records findings and acceptance evidence.
4. Claude addresses the findings; Codex rechecks the affected behavior.

Both tools can use the same skills. Conversations and memory are separate, so decisions and handoffs must be saved in project files. Keep implementation and review sequential on overlapping files. With only one tool, it can perform all phases. The setup supplies instructions and profiles; it does not launch the other tool or automate cross-tool orchestration. Spec and ticket directories are created when first needed, rather than as empty installation folders.

## Credits and respect

The agent-workflow portion of this package is intentionally built around [Matt Pocock's Skills for Real Engineers](https://github.com/mattpocock/skills). Matt is one of the practitioners we most respect in AI-assisted software engineering, and his open-source work is the source of the skill installation this package delegates to.

Those skills, their ideas, wording, and ongoing evolution belong to their respective authors and remain subject to their upstream licence. This package does not claim ownership of them and is not affiliated with or endorsed by Matt Pocock. Our aim is simply to make it easier to pair his work with a small, practical Codex setup. If this integration is unwelcome or needs changing, we will gladly adjust it.

The design skills come from [Emil Kowalski's Skills for Designers and Engineers](https://github.com/emilkowalski/skills). This package delegates installation to the upstream repository; the skills remain Emil's work under their upstream licence. This package is not affiliated with or endorsed by Emil Kowalski.

## Development

```sh
npm test
node bin/mike-coding-setup.mjs init --dry-run
```

## License

The package is MIT licensed. Matt Pocock's skills, Emil Kowalski's skills, and Graphify are installed from their official upstream projects and retain their own licences.
