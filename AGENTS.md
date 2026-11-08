# Folio agent instructions

## Scope and product

- This folder is the Folio: Currency Converter Chrome extension, not the neighbouring trashsync project.
- Preserve the Ledger design: compact ledger rows, restrained blue accent, clear numeric alignment.
- Rates come only from `https://latest.currency-api.pages.dev/v1/currencies/usd.json`. Keep the last validated snapshot locally, without history or a backend. Never claim new rates were received when only checking unchanged data.
- Offer every currency code from the validated snapshot, including cryptocurrency, metals and historical currencies. Keep older 12-currency caches compatible; never assign country flags to crypto or metals.
- The extension name is `Folio: Currency Converter`, the JSX heading is `Folio` with a separate subtitle, and the package is `folio-currency-converter`.
- Keep donation disabled until the user supplies a URL; never invent one.

## Before changes

- Read applicable parent instructions and the user's global code-style guides when available.
- Inspect `git status`, branch and configured remotes. Preserve existing uncommitted work.
- Name branches by the purpose of the change: `feature/` for new functionality, `bugfix/` for bug fixes, and `chore/` for refactoring, documentation, maintenance, and small improvements to existing functionality. Use a short, descriptive lowercase name with hyphens after the prefix, such as `chore/rewrite-readme`. Follow an explicit user request for a different branch name.
- Do not commit, push or merge unless explicitly requested; merging needs specific confirmation.
- Use pnpm. Ask before adding a production dependency unless the user already explicitly authorized it.
- Do not read or expose secrets, `.env` files, cookies or browser sessions.

## Architecture and style

- Keep UI in components, conversion rules in `src/converter/amounts.ts`, and persistence in `src/storage/`.
- Group code by capability. Avoid generic abstraction layers and application-wide barrels.
- Prefer existing Ariakit components for accessible menus, dialogs, comboboxes, selects and controls.
- Use Framer Motion for interactive transitions. Respect reduced motion.
- Use `type Props` immediately before its component, inline `type` imports and named hook exports.
- Use `const` by default, including local values; use `let` only when reassignment is needed. Biome `useConst` is set to `error`.
- Use UPPER_SNAKE_CASE for named fixed constants such as `STORAGE_KEY`; ordinary local bindings keep descriptive camelCase names even with `const`. Keep one declaration per statement.
- Every `if` body has braces and newlines. Add JSDoc to new utilities; explain regular expressions beside them.
- Biome owns formatting, linting and default import sorting. Do not add ESLint, Prettier or a separate import sorter.
- Keep side-effect imports in place. Do not disable broad lint rule groups to hide individual issues.
- Use CSS tokens from `src/styles.css`, visible focus states and native button types.
- Avoid U+2013 and U+2014 in authored copy, documentation and comments.

## Interaction requirements

- Multiple rows highlight only while their amount input has focus. Do not use the saved base currency as a focus indicator.
- Editing either mode must update the shared amount. Invalid drafts must not overwrite the last valid calculation.
- Keep drag handles separate from editable inputs; menu move actions provide a keyboard alternative.
- Render row menus through a portal, outside draggable rows. Preserve outside-click dismissal, Escape and focus return.
- Settings open and close with animation. Keep Ariakit mounted through the exit using AnimatePresence and alwaysVisible.
- Language uses Ariakit Select. Currency display settings update one shared live preview below their controls using CurrencyLabel. Do not add a separate number example, drag handle or actions menu to the preview.
- Amount fields retain locale grouping during editing, preserve the caret and fractional drafts, and round only on blur. Numeric calculation stays separate from draft formatting.
- Currency flags are decorative; currency codes and names remain available to assistive technology.
- Show at most one toast. New actions replace older feedback. Undo is tied to the displayed removal.
- Do not auto-dismiss Undo. Pause timed notifications during hover or focus. Never move focus merely to announce a message.
- Invalid amounts use a theme-aware red card background and left stripe, aria-invalid and a short screen-reader description, without visible error prose. A valid edit clears other invalid drafts even if the amount is unchanged.
- Storage errors remain persistent near the affected interface, not only in a toast.
- Translate new UI copy in English, Russian and Ukrainian. Browser language remains the default.

## Storage and extension boundaries

- Preserve `folio.state.v1` unless implementing an explicit compatible migration.
- Validate all persisted data through `restoreState`. New settings need defaults for older saves.
- Use `chrome.storage.local` in the extension and localStorage only for browser preview.
- Keep writes ordered. Never overwrite restored preferences with defaults while loading.
- Do not add network access, analytics, content scripts or permissions without a requested feature that needs them.
- Do not edit generated `dist/` files. Run `pnpm build` to regenerate them.

## Verification and delivery

- Run `pnpm check`, `pnpm test`, and `pnpm build` after meaningful code changes.
- Add focused tests for conversion, validation or persistence changes; avoid tests that only mirror markup.
- For UI fixes, verify the affected interaction in the built-in Codex browser: keyboard, focus return, outside click, both modes and persistence after reload.
- Check narrow popup dimensions, light/dark themes and reduced motion when relevant.
- State whether verification covered a browser preview or an actual installed Chrome extension. Do not imply they are equivalent.
- Report unresolved warnings honestly, including the current bundle-size warning if it remains.
- Update README when behavior or setup changes. Do not create extra guides unless requested.
- Explain outcomes in plain language. Include relevant checks and concrete remaining limitations.
