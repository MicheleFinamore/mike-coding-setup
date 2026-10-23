## Workflow across tools

When using both Codex and Claude Code, Codex owns specifications, tickets, and the final review; Claude Code owns implementation and fixes. With one tool, it can perform the whole workflow. These are default responsibilities, not permission controls; follow the user's assignment.

- Store specifications in `docs/specs/` and tickets in `docs/tickets/`, or use the project's established locations. Each ticket references its spec and records scope, acceptance criteria, dependencies, and required checks. Use available workflow skills when relevant.
- Before implementation, read the assigned ticket, spec, and applicable shared rules. Report unresolved requirements instead of silently changing the spec. Use the available design skills for UI implementation and review.
- The implementer records changed files, checks actually run, results, and remaining limitations in the handoff. Keep implementation and review sequential on overlapping files.
- The reviewer checks the actual diff, including relevant uncommitted and untracked files, against the ticket, spec, and shared rules. Record findings and acceptance evidence; return fixes to the implementer before rechecking affected behavior.
- Conversations and memory are separate across tools. Persist decisions and handoffs in project files; never assume the other tool can read this conversation.

Shared skills live in `.agents/skills/`; the Skills CLI links Claude's selected skills from `.claude/skills/`. Claude specialist profiles live in `.claude/agents/`; Codex profiles live in `.codex/agents/`. Profiles are installed only for selected tools. If optional rules or skills were not installed, report the limitation and use existing project instructions.
