## Shared engineering rules and agents

For implementation or review, use `.agents/rules/code-quality.md`. For frontend work, read `.agents/rules/frontend.md` and load only the relevant React/Next.js and Tailwind/shadcn modules. Apply these as defaults alongside the project's specific conventions. Paths are relative to the repository root; custom Codex profiles live in `.codex/agents/`.

When delegation is requested, select the relevant available profile:

- `senior-react-dev` for React implementation, refactoring, or explicit review-only work.
- `supabase-specialist` for Supabase schema, access policies, and service-layer work.
- `verifier` for independent verification after changes.

Pass the task or specification, acceptance criteria, assigned files/area, mode, and absolute shared rules directory to each agent. For review or verification, specify the changed files and comparison base. Keep implementation and verification sequential for overlapping files; the parent owns integration.

The parent owns the overall workflow: delegate scoped implementation to specialists, integrate their changes, and coordinate one final code review of the complete change set. Specialists run checks relevant to their work and return evidence; they do not restart the whole implementation workflow or independently schedule a final review unless assigned that responsibility. If using an implementation skill that already calls `code-review`, use that review rather than scheduling a duplicate.

Code review evaluates correctness, project standards, and agreement with the spec. Include the shared rules above among the review's standards sources. State whether the review covers committed changes, working-tree changes, or both; inspect relevant untracked files separately. A comparison ending at `HEAD` alone does not include uncommitted work.

Use `verifier` when requested, or when independent execution would materially increase confidence in critical flows, cross-layer integrations, or broad refactors and delegation is authorized. Give it specific acceptance scenarios and existing check results. It verifies behavior and reports evidence; code review remains responsible for the overall design and spec assessment. After fixes, recheck affected scenarios and invalidate earlier evidence when the relevant code has changed.

Agent availability does not authorize automatic delegation, further subagents, commits, pushes, merges, database deployment, or publication. Follow session authorization. The verifier may produce ordinary check artifacts but must not fix source files.
