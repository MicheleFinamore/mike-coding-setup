# mike-coding-setup

Reusable Codex setup for a project: engineering rules, optional specialist agents, Matt Pocock's workflow skills, and Graphify.

## Usage

```sh
npx mike-coding-setup init
npx mike-coding-setup init --rules --agents
npx mike-coding-setup init --skills
npx mike-coding-setup init --graphify
npx mike-coding-setup init --all
npx mike-coding-setup init --dry-run
npx mike-coding-setup init --force
```

Run the command from the project root. It installs rules and agents by default, and never overwrites an existing file unless `--force` is present.

- `--skills` runs the official installer, `npx skills@latest add mattpocock/skills`. Choose the desired skills and Codex when prompted. They are installed as ordinary project files, so future upstream releases can be applied from that project with `npx skills update`.
- `--graphify` (or the shorter alias `--grapi`) installs the official `graphifyy` CLI through `uv`, then registers Graphify project-scoped for Codex. It requires [uv](https://docs.astral.sh/uv/). Use `$graphify .` in Codex after installation.
- `--all` installs rules, agents, skills, and Graphify together.

The command prints the `AGENTS.md` snippet instead of editing that project-specific file automatically.

## Credits and respect

The agent-workflow portion of this package is intentionally built around [Matt Pocock's Skills for Real Engineers](https://github.com/mattpocock/skills). Matt is one of the practitioners we most respect in AI-assisted software engineering, and his open-source work is the source of the skill installation this package delegates to.

Those skills, their ideas, wording, and ongoing evolution belong to their respective authors and remain subject to their upstream licence. This package does not claim ownership of them and is not affiliated with or endorsed by Matt Pocock. Our aim is simply to make it easier to pair his work with a small, practical Codex setup. If this integration is unwelcome or needs changing, we will gladly adjust it.

## Development

```sh
npm test
node bin/mike-coding-setup.mjs init --dry-run
```

## License

The package is MIT licensed. Matt Pocock's skills and Graphify are installed from their official upstream projects and retain their own licences.
