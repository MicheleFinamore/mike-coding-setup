# Tailwind and shadcn/ui

Apply Tailwind guidance only where Tailwind is used, and shadcn guidance only where shadcn/ui is installed. Keep the existing component system, aliases, primitive base, icon library, and form strategy.

## Components

- Check existing UI components before writing custom styled markup. Compose installed primitives and use their built-in variants before adding overrides.
- Add missing shadcn primitives through the project's configured CLI and package runner. Inspect the generated diff, dependencies, and imports; preserve local edits instead of overwriting existing components blindly.
- shadcn components are editable source owned by the project. Intentional local changes are allowed; keep them coherent rather than duplicating an almost identical primitive elsewhere.
- Follow the installed primitive base and API: Radix composition and Base UI composition are not interchangeable. Verify trigger, group, and overlay contracts before copying an example.
- Preserve accessible composition: dialog/sheet titles, tab triggers inside their list, and avatar fallback content. Use visually hidden titles when a visible title is inappropriate.

## Forms

- Reuse the form and validation tools already present. For a new form in a modern shadcn setup, use available `Field`/`FieldGroup` primitives and associated labels, descriptions, and errors.
- Keep an established `Form`/React Hook Form/Zod pattern when that is what the codebase uses. Do not assume those packages or components exist, or migrate unrelated forms to a newer API.
- Connect invalid state and error descriptions to the actual input. Where supported, use `data-invalid` on the field and `aria-invalid` on the control.
- Handle pending, failed, and successful submission states; preserve entered data and avoid duplicate mutations. Client validation does not replace server validation.

## Styling

- Use the existing `cn()` or equivalent class utility for conditional and merged classes instead of ad-hoc string concatenation.
- Prefer semantic tokens such as `bg-background`, `text-muted-foreground`, and `border-border` over raw colors. Check light and dark themes when both are supported.
- Express reusable component variation through existing variants or `cva` where already adopted. Do not introduce a variant library for a one-off class change.
- Prefer the spacing and sizing scale. Use arbitrary values when an actual layout constraint requires them, rather than approximating the requirement with an incorrect token.
- Prefer flex/grid with `gap-*` for layout spacing. Do not rewrite working `space-*` layouts merely to satisfy this default.
- Design mobile-first and add larger breakpoint rules where needed. Check long text, zoom, overflow, and realistic content rather than only a single viewport.
- Keep the existing Tailwind configuration model for the installed version; do not mix configuration assumptions from different major versions.

## Icons and accessibility

- Use the configured icon library consistently; Lucide is an option, not a dependency to impose on every project.
- Follow the component's icon sizing contract. Let primitives manage icon size when they do; use shared utility classes for standalone icons.
- Preserve native semantics, associated labels, visible focus, keyboard operation, and overlay focus behavior. Use ARIA when needed, not as a substitute for correct structure.
- Icon-only buttons need an accessible name; decorative icons should not duplicate it. Do not communicate meaning solely through color or hover.
- Respect reduced-motion preferences and the project's contrast requirements. Automated checks alone do not establish accessibility compliance.

For current form composition, see the [official shadcn React Hook Form guide](https://ui.shadcn.com/docs/forms/react-hook-form); match it to the components actually installed.


