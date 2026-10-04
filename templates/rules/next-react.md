# React and Next.js

The shared sections apply to React in Next.js, Vite, or another setup. The App Router section applies only when that router is actually in use. Inspect the installed framework version and existing conventions before using version-sensitive APIs.

## Components and hooks

- Keep components small and feature-focused. Extract a component, hook, or helper when it gives a concern a clear boundary, not just to move lines elsewhere.
- Keep render logic pure. Derive values from props and state during render instead of duplicating them in state.
- Prefer local state before shared or global state. Distinguish UI state, remote server data, URL state, and persistent state; avoid maintaining competing copies of the same fact.
- Follow the Rules of Hooks for the hook being used. Do not suppress dependency warnings to conceal stale closures; restructure the logic or use the documented API when necessary.
- Use effects for external synchronization, not derived values or event-specific actions. Clean up listeners, subscriptions, timers, and obsolete async work.
- Use stable, meaningful list keys. Avoid array indices when items can reorder or preserve local state.
- Add memoization after a demonstrated need, considering the project's compiler and framework behavior. Avoid blanket `memo`, `useMemo`, and `useCallback` policies.

## Data and interaction

- Use the router's data APIs or the established query layer for remote data. Avoid waterfalls and duplicate fetching; keep cache, invalidation, and error handling consistent with the actual setup.
- Do not introduce effect-based initial fetching when the project already provides a server, loader, or query mechanism. A justified effect must handle failures and obsolete responses.
- For affected flows, handle loading, empty, error, and recovery states. Preserve user input after failure and prevent duplicate submissions when they would have unintended effects.
- Use semantic HTML, keyboard-operable controls, associated labels, and accessible names for icon-only controls. Preserve visible focus and dialog focus management.
- Model props and external contracts explicitly. Use discriminated unions when component variants accept different valid combinations of props.

## Feature page folders

When a page stops being a thin shell, prefer the existing feature decomposition. If the project has none, this is a default example, not a required set of empty folders:

```text
feature-page/
  FeaturePage.tsx       # SPA container or feature entry
  components/          # feature UI; kebab-case files
  hooks/               # use-*.ts state and synchronization
  helpers/             # pure functions and constants
  types.ts             # or a types folder when warranted
```

- Keep the entry focused on composition. A custom hook owns coherent state or effects; pure calculations belong in helpers, not hooks by default.
- Use relative imports within a feature unless the project's aliases specify otherwise. Cross-feature UI and services belong in the existing shared locations.
- Use `helpers/index.ts` or `types/index.ts` for a useful module entry, not as mandatory barrels for every directory. Avoid circular dependencies.
- Component symbols remain PascalCase; component filenames default to kebab-case. Framework route files retain their prescribed names, such as `page.tsx` and `layout.tsx` in Next.js.

## Next.js App Router only

- Default to Server Components for server-rendered data and non-interactive UI. Add `"use client"` at the smallest useful boundary for client hooks, browser APIs, and event handlers; consider the import graph, not only the filename.
- Keep credentials and privileged access on the server. Pass only the data the client needs; respect serializable server/client contracts and prevent accidental server-only imports into client code.
- Fetch initial data on the server where appropriate. Verify caching and revalidation behavior for the installed version rather than assuming historical defaults.
- Use the project's existing mutation boundary: Server Actions, Route Handlers, or an external API. When using Server Actions, validate input and enforce authentication and authorization inside each exposed action; hiding a button is not access control.
- Resolve and validate `params` and `searchParams` according to the installed API, including async contracts where applicable. Use `notFound()` and `redirect()` for their intended routing cases, not every empty state.
- Keep route entries thin where useful; place substantial UI and domain logic in the project's feature and service modules. Reuse service interfaces such as `authService.login()` when established; do not mandate closures or classes.
- Use route groups and nested layouts for shared page chrome. Place `loading.tsx` and `error.tsx` at boundaries where their behavior is needed rather than creating one for every segment.
- Define `metadata` or `generateMetadata` where the route needs distinct metadata; keep shared defaults in the appropriate layout.

For effects and derived state, see [React's official guidance](https://react.dev/learn/you-might-not-need-an-effect). For version-sensitive boundaries and mutations, see [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) and [data security](https://nextjs.org/docs/app/guides/data-security).


