# Frontend rule selection

This is the entry point for the shared rules. Read the relevant files, not every technology section for every task. These are reusable defaults, not a mandate to install a stack or reorganize an existing project.

| Work being done | Read |
| --- | --- |
| Implementation, refactoring, or code review | [code-quality.md](code-quality.md) |
| React components, hooks, state, or routing | [next-react.md](next-react.md): shared React sections |
| Next.js App Router | [next-react.md](next-react.md): also the App Router section |
| Tailwind or shadcn/ui | [tailwind-shadcn.md](tailwind-shadcn.md): sections for the tools actually installed |

## Applying the rules

- Follow applicable session and project instructions. When a generic default differs from an established local convention, use the local convention unless it causes a concrete defect; explain any necessary departure.
- Identify installed versions and nearby reference implementations before selecting APIs. Do not assume that a component, router feature, library, alias, or service exists.
- Treat size thresholds and decomposition examples as review signals, not automatic acceptance failures. Follow enforced project limits when they exist.
- Use relevant installed skills according to their invocation policy. No rule or agent in this kit requires a particular skill, tracker, repository layout, or model.
- Keep changes within the assigned behavior and files. Flag unrelated issues rather than silently expanding the task.

For Supabase work, the `supabase-specialist` profile supplies the database-specific guidance and also uses the shared code-quality rules. Supabase is optional; these frontend rules do not introduce it into a project.


