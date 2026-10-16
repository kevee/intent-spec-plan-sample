# Code style

We follow [Standard JS](https://standardjs.com/) conventions, enforced by **Prettier** (`.prettierrc`) and **ESLint** (`eslint.config.mjs`).

## Formatting

- Two spaces, no tabs.
- Single quotes.
- No semicolons, except before a line that starts with `(` or `[`.
- No trailing commas.

Run `pnpm format` before you commit if your editor doesn't format on save.

## TypeScript

- **Strict mode ---** no `any`. Use `unknown` and narrow it.
- **Arrow functions ---** for everything except exported Next.js route handlers and page components, where the framework expects a function declaration.
- **Named exports ---** except where Next.js requires a default (`page.tsx`, `layout.tsx`, `not-found.tsx`).

## Naming

- **Files ---** kebab-case: `sign-up-form.tsx`, `status-message.tsx`.
- **Components ---** PascalCase. **Functions and variables ---** camelCase. **True constants ---** UPPER_SNAKE_CASE (`TIME_ZONE`).

## Imports

External packages first, then `@/` imports, then relative ones, with a blank line between groups.

## Styling

Tailwind only. No inline styles, no CSS modules.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `ci:`. Lowercase description, imperative mood, no trailing period. A story's planning artifacts go in with its first code commit, or alone as `docs: intent for #<number> <title>` when the story isn't built yet.
