## Shared engineering rules and agents

For implementation or review, use `.agents/rules/code-quality.md`. For frontend work, read `.agents/rules/frontend.md` and load only the relevant React/Next.js and Tailwind/shadcn modules. Apply these as defaults alongside the project's specific conventions. Paths are relative to the repository root; custom Codex profiles live in `.codex/agents/`.

When delegation is requested, select the relevant available profile:

- `senior-react-dev` for React implementation, refactoring, or explicit review-only work.
- `supabase-specialist` for Supabase schema, access policies, and service-layer work.
- `verifier` for independent verification after changes.

Pass the task or specification, acceptance criteria, assigned files/area, mode, and absolute shared rules directory to each agent. For review or verification, specify the changed files and comparison base. Keep implementation and verification sequential for overlapping files; the parent owns integration.

Agent availability does not authorize automatic delegation, further subagents, commits, pushes, merges, database deployment, or publication. Follow session authorization. The verifier may produce ordinary check artifacts but must not fix source files.
