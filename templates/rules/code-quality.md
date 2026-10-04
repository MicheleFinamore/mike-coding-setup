# Code quality

Applies to implementation, refactoring, and review. Preserve the project's established conventions; use these defaults where no local convention exists.

## Structure

- Give each file a coherent responsibility. Split modules that mix unrelated concerns rather than growing a do-everything file.
- Soft review thresholds: approximately 300 lines per handwritten file, 40 lines per function, and four parameters. Beyond these, consider extracting a meaningful component or helper. Do not split cohesive code mechanically, hide complexity behind an options bag, or restructure generated files to satisfy a count.
- Co-locate code with its feature; put cross-feature logic in a clearly named shared module or package.
- For a complex React page, consider the container/components/hooks/helpers structure in [next-react.md](next-react.md), following the repository's canonical pattern.
- Remove dead code made obsolete by the change: unused exports, commented-out implementations, and speculative abstractions. Keep unrelated cleanup outside the task.

## Naming

- Use intention-revealing names; avoid unexplained abbreviations and single letters except conventional local indices.
- Booleans read as predicates: `isLoading`, `hasAccess`, `canEdit`.
- Functions use verb phrases: `getUser`, `formatDate`. Types and component symbols use nouns: `User`, `UserCard`.
- In JavaScript and TypeScript, use `camelCase` for values, `PascalCase` for types and component symbols, and `SCREAMING_SNAKE_CASE` for named module-level constants where consistent with the codebase.
- Default component filenames to kebab-case (`user-card.tsx`) and hook filenames to `use-*.ts`. Feature page entry files may use PascalCase. Framework-required filenames and established sibling conventions take precedence.

## Control flow and contracts

- Prefer early returns and guard clauses. Beyond roughly three nesting levels, look for a clearer decomposition.
- Make invalid states difficult to represent; use explicit variants or discriminated unions where several flags permit contradictory states.
- Validate untrusted inputs at the boundary, then pass a clear internal contract onward. Static types do not validate runtime input.
- Avoid unnecessary `any`, unsafe assertions, and suppression of errors that should be handled. Preserve the project's public error and return-value conventions.

## Comments and reuse

- Comments explain intent, trade-offs, or constraints rather than narrating obvious code.
- Use the project's TODO format; otherwise prefer `TODO(owner): reason` when an owner is known. Describe deferred work rather than leaving a silent gap.
- Search for an existing utility, component, or service before adding one.
- As a rule of thumb, tolerate small duplication before extracting on the third similar use. Extract earlier for a shared domain rule; keep superficially similar code separate when it changes for different reasons.

## Verification

- Use existing checks relevant to the change. Add behavior-focused regression coverage for significant behavior or bug fixes; avoid tests that merely mirror private implementation details.
- Do not introduce a test framework or new abstraction solely to verify a trivial edit.
- Report checks actually performed, their outcomes, and material gaps. Never infer successful behavior from type-checking or a build alone.


