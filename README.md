# mike-coding-setup

Reusable Codex setup for a project: engineering rules, optional specialist agents, and optional workflow skills.

## Usage

```sh
npx mike-coding-setup init
npx mike-coding-setup init --rules --agents
npx mike-coding-setup init --skills
npx mike-coding-setup init --dry-run
npx mike-coding-setup init --force
```

Run the command from the project root. It installs rules and agents by default, and never overwrites an existing file unless `--force` is present. `--skills` adds the bundled Matt Pocock-derived workflow skills and their license notice.

The command prints the `AGENTS.md` snippet instead of editing that project-specific file automatically.

## Development

```sh
npm test
node bin/mike-coding-setup.mjs init --dry-run
```

## License

The package is MIT licensed. Bundled workflow skills retain the Matt Pocock MIT license in `templates/skills/AI-HERO-LICENSE.txt`.
