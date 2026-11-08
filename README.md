# Folio: Currency Converter

Folio converts one amount into several currencies at once or works with a single currency pair. It is a local Chrome extension built with Preact and Ariakit, with currency search, action menus, settings, and keyboard controls.

Rates come directly from [exchange-api](https://github.com/fawazahmed0/exchange-api) at one address: `https://latest.currency-api.pages.dev/v1/currencies/usd.json`. The source updates its data daily. Folio has no server of its own, fallback address, or rate history.

## Development commands

Install Node.js 22.12 or later and pnpm, the package manager used by this project, then run `pnpm install` in the project folder before using these commands. Biome formats code, checks it for common problems, and organizes imports. TypeScript checks that values and function calls match their declared types.

Formatting means indentation, spacing, and line wrapping. Lint rules detect code problems, such as unused variables and suspicious conditions. Import organization checks the order of import statements and imported names.

| Command             | Formatting  | Lint rules                 | Import order | TypeScript types         | Changes files? |
| ------------------- | ----------- | -------------------------- | ------------ | ------------------------ | -------------- |
| `pnpm check`        | Check       | Check                      | Check        | Check after Biome passes | No             |
| `pnpm check:fix`    | Apply       | Check and apply safe fixes | Apply        | Not checked              | Yes            |
| `pnpm format`       | Apply       | Not checked                | Not checked  | Not checked              | Yes            |
| `pnpm format:check` | Check       | Not checked                | Not checked  | Not checked              | No             |
| `pnpm lint`         | Not checked | Check                      | Not checked  | Not checked              | No             |
| `pnpm imports`      | Not checked | Not checked                | Apply        | Not checked              | Yes            |

`pnpm check` includes everything checked by `pnpm lint` and `pnpm format:check`, plus import order and TypeScript types. You do not need to run those narrower checks separately after a successful `pnpm check`.

Use `pnpm format` to change formatting only. Use `pnpm check:fix` to apply formatting, safe lint fixes, and import order together; a separate `pnpm format` afterward is unnecessary. Run `pnpm check` after applying fixes because some problems require manual changes and `check:fix` does not run the separate TypeScript type check.

For format on save in Cursor or VS Code, install the recommended Biome extension. The project settings select Biome explicitly for TypeScript, TSX, JavaScript, JSON, JSONC, HTML, and CSS so that user settings selecting another formatter for these languages do not override the project's formatter. Saving and the terminal commands then use the same Biome configuration. Biome removes trailing commas from JSON and JSONC by default, including `biome.jsonc`; allowing those commas in the JSON schema only affects validation, not formatting.

After checking the code:

- `pnpm test` runs the automated tests once without editing source files.
- `pnpm build` checks TypeScript types and creates the extension files in `dist`. It does not run Biome or tests.

## Features

- Every currency in the source response, including cryptocurrencies, metals, and historical currencies. On November 3, 2026, the source returned 340 codes.
- Single mode: two editable fields and a button to swap currencies.
- Multiple mode: edit any amount and add, replace, or remove currencies.
- Reorder currencies by dragging or through the action menu with a keyboard.
- Undo the last removal through a notification.
- English, Russian, and Ukrainian extension names, descriptions, and interfaces. Chrome uses the browser language for the extension name, description, and toolbar tooltip. The popup subtitle and document title follow the selected interface language. The browser language is used by default. Rate dates follow the selected language's date format, or the browser locale when using Browser default.
- Light, dark, and system themes, compact rows, and adjustable display precision.
- Currency names, symbols, and flags with a preview in settings.
- The currency list and order, amounts, mode, and settings are saved on the device.
- Rates are checked on opening and when you press refresh. The last valid set is saved for offline use.
- Settings include an email link for reporting bugs and suggesting improvements.

## Project structure

| Path                         | Purpose                                                              |
| ---------------------------- | -------------------------------------------------------------------- |
| `src/App.tsx`                | Assembles shared providers and independent interface sections        |
| `src/converter/`             | Converter modes, currency rows, calculations, and actions            |
| `src/converter/money-input/` | Amount input and draft formatting                                    |
| `src/converter/currency/`    | Currency information, labels, and search                             |
| `src/settings/`              | Settings model and dialog                                            |
| `src/notifications/`         | A single notification with undo                                      |
| `src/i18n/`                  | Translations and locale selection for language and number formatting |
| `src/rates/`                 | Rate fetching, validation, and refresh state                         |
| `src/storage/`               | Saved data validation, reading, and writing                          |
| `src/styles.css`             | Colors, sizes, states, and responsive layout                         |
| `src/branding.ts`            | Author, feedback email, and donation address                         |
| `public/manifest.json`       | Extension description, permissions, and Chrome restrictions          |
| `biome.jsonc`                | Formatting, code checks, and import order                            |
| `AGENTS.md`                  | Instructions for agents working on the project                       |

## Run locally

You need Node.js 22.12 or later and pnpm, a JavaScript package manager. In the project folder, run:

```sh
pnpm install
pnpm dev
```

Open the address printed by Vite, the local development and build tool. It is usually `http://127.0.0.1:5173`. This shows the interface in a regular browser tab.

## Install in Chrome

```sh
pnpm build
```

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Click Load unpacked and select the `dist` folder inside the project.
4. Pin Folio to the Chrome toolbar and open it using its extension button.

After changing the code, run `pnpm build` again, click Reload on the extension card, and reopen it. The build creates the ready-to-use files in `dist`; do not edit them by hand.

The browser preview and the extension store data separately. Chrome uses `chrome.storage.local`, the extension's built-in storage. A regular tab uses `localStorage`, storage tied to the website address. Data is not synchronized between devices.

## Use the converter

Click the amount on any card. The highlight shows which field you are editing. Changing a valid amount immediately recalculates the other values. Thousands separators remain visible while editing and are added as you type. The period and comma keys enter the decimal separator for the selected locale. Paste complete numbers in that locale's format, for example `1,234.50` for English or `1 234,50` for Russian. Fractional digits and a trailing decimal separator are preserved while editing; the configured rounding is applied when you leave the field. Amounts can have up to 12 digits before the separator and 8 after it. An invalid amount has a red background and a stripe on the left, with no visible error text. The other fields keep the last valid result. Entering a valid amount in another currency replaces the invalid draft with the recalculated value, even if the amount has not changed. Escape also cancels an invalid draft.

In Multiple mode, open the ⋮ menu to replace, remove, or move a currency. Drag a row using the handle on the left. Search by currency code, name, country, or a locale with a region, such as `en-US`, `uk-UA`, or `hr-HR`. Search results update after a short pause in typing. Country names are searchable in English, Russian, Ukrainian, Croatian, and the interface locale; common aliases include USA, UK, and UAE. Use the arrow keys to select a result, Enter to confirm, and Escape to close the dialog. The list comes from the current set of rates. Popular currencies appear first: USD, EUR, the currency of the browser’s first explicitly specified region, then GBP, CHF, JPY, CAD, AUD, and CNY, when available. The browser region is independent of the selected interface language; a language without a region does not imply a local currency. Remaining currencies appear once in groups for fiat, crypto, metals, historical currencies, units of account, and other assets, sorted by code. Empty groups are hidden. Typing hides group headings and ranks results by relevance, with exact codes first and historical country matches below current currencies. The browser translates regular currency names; cryptocurrency names are included in the build. If the source adds an unknown code, it appears in the picker with its code in place of a name. Country flags are not assigned to cryptocurrencies or metals.

After you add or replace a currency, it is highlighted briefly. Adding a currency also scrolls smoothly to the new row. If reduced motion is enabled in the system, scrolling happens immediately.

Settings apply immediately. One shared preview below the display controls shows names, symbols, flags, precision, and compactness using the same styling as the list. The preview has no drag handle or menu. The Browser default language option follows the browser's language preferences; unsupported interface languages fall back to English. With automatic language selection, number formatting follows the browser's first locale. Flags are visual hints: EUR uses the EU flag and USD uses the US flag. They do not list every country where a currency is used. Their appearance depends on the operating system's emoji support.

Notifications do not stack: a new action replaces the previous message. Ordinary messages disappear after 5 seconds. A removal message with an Undo button stays until you undo it, close it, or another action replaces it. Hovering over it or focusing an element inside it pauses the timer. Invalid input highlighting and storage error messages do not disappear on a timer.

The Support button opens the author's Base by mono page in a new tab. Its address is configured through `donationUrl` in `src/branding.ts`.

## Technology and how it works

- Preact 11 and TypeScript provide the interface and type checking. The Preact Vite preset redirects React imports to `preact/compat`, a compatibility layer that lets React libraries run on Preact. React type definitions remain for Ariakit and Framer Motion; the React and React DOM runtime code is absent from the built extension.
- Ariakit provides accessible, unstyled controls: Dialog, Menu, Combobox, Select, Radio, and Checkbox.
- Framer Motion animates mode changes, dragging, notifications, and the opening and closing of settings. It respects the system's reduced motion preference.
- Manifest V3 defines the Chrome extension format. Folio requests the `storage` permission to save data and access only to `https://latest.currency-api.pages.dev/*` to fetch rates.
- Vite builds the files, and Terser reduces JavaScript size. Vitest checks calculations, localization, and storage; Biome formats and checks the code.

The installed Ariakit version needs two local dependency patches to work with Preact. `pnpm install` applies them automatically from `patches/`, using the entries in `pnpm-workspace.yaml`:

- `@ariakit/react-utils@0.2.8` uses Preact's effect event hook to keep callbacks available when refs attach, before layout effects run.
- `@ariakit/react-components@0.7.1` handles the read-only `currentTarget` property on native browser events and preserves keyboard fields when forwarding events to the active option. Without these fixes, focus handling reports errors and Enter cannot confirm a selection.

Recheck these patches when updating Ariakit or Preact. Framer Motion itself is unchanged. `LayoutGroup` measures the currency rows together before Preact moves their browser elements; without it, dragging a row can move it past the intended position. The Vite configuration also directs Ariakit's external-store subscription hook to Preact's own implementation, including during tests.

`useConverter` coordinates actions, while `amounts.ts` contains the calculations. All values are calculated through a shared amount in euros, which is saved in a format compatible with the previous version. The source provides rates relative to USD; conversion through EUR uses the ratio of rates, for example `usd.uah / usd.eur`. Entering amounts and changing currencies do not trigger network requests. The precision setting affects display, not the rates themselves. Calculations use ordinary JavaScript numbers and are not intended for accounting that requires guaranteed cent-level precision.

`SavedStateProvider` shares one state store per popup document. In the browser preview, it reads and validates `localStorage` synchronously, so the first render already has `isReady = true`. Mounting the interface again in the same document reuses loaded data and pending writes. A newly opened extension popup creates a new document, so it still waits for the asynchronous `chrome.storage.local` read. Edits are blocked until that read finishes; subsequent saves run in order, including across interface remounts. `restoreState` validates unknown data and restores safe values for damaged fields. The storage key `folio.state.v1` remains the same across updates. New settings need defaults that do not reset existing preferences.

The version of Ariakit used here does not include a ready-made toast, a brief notification. Folio uses a small custom component built with Preact and Framer Motion. It announces text to screen readers through `role="status"`, does not take focus when it appears, and has a close button.

While storage is loading or the first set of rates is being fetched, Single shows skeleton cards and Multiple shows skeleton rows. These placeholders follow the selected mode, theme, compactness and currency-name setting, and stop animating when reduced motion is enabled. With saved rates available, switching modes or checking for updates keeps real amounts visible.

`App.tsx` assembles the header, mode picker, rate status, converter, notifications and dialogs. Components subscribe to individual values using `useSavedState`, backed by Preact's `useSyncExternalStore`, a hook that updates a component only when its selected value changes. A selector must return a primitive or an existing stable reference, such as `state.settings`, rather than creating a new object. Converter actions, input feedback, picker coordination and notifications have separate contexts, shared values available directly to their consumers. Editing an amount updates the converter fields without rerendering the header, footer, settings or currency search. All displayed conversions still update because they share one amount.

After reading saved data, the extension immediately shows the last set of rates and checks for an update. The ↻ button starts the same check. Pressing it again during a request does not start another request in parallel; there is no waiting period between completed requests and no automatic retry. The browser manages its HTTP cache, a previously downloaded copy of the response, and checks whether that copy is still current using HTTP 304 responses. The date next to the converter comes from the source response, not from the time the button was pressed.

Only the last valid set of supported rates is saved in the `rates` field under the existing `folio.state.v1` key. A new complete response replaces the previous set. A network error, HTTP error, invalid JSON, or a non-numeric or non-positive rate leaves the previous set unchanged. USD and EUR rates are required for calculations. If a new response is missing a currency in the selected list or pair, the previous set is retained so calculations remain available. Requests time out after 15 seconds. If rates have never loaded, calculations are unavailable: connect to the internet and press refresh. Saved settings and the amount remain available without rates, but the first download is required for calculations.

There is no background process or code injected into websites. The security policy allows network connections only to the specified source and blocks external scripts. Requests do not include amounts, settings, or the currencies selected by the user.

## Build size

On November 4, 2026, replacing React with Preact reduced the main JavaScript file from 573.54 kB to 374.58 kB, a 34.7% reduction. Both measurements use the same production build settings and include the currency interface, Ariakit controls, Framer Motion animations, and row dragging. The Preact measurement includes the compatibility patches and `LayoutGroup` described above.

| Build          | JavaScript | Gzip equivalent | Entire extension folder |
| -------------- | ---------: | --------------: | ----------------------: |
| React baseline |  573.54 kB |       185.89 kB |               589.05 kB |
| Preact         |  374.58 kB |       126.10 kB |               390.08 kB |

Sizes use decimal kB. CSS remains 13.63 kB and is byte-for-byte identical. The extension reads installed files locally, so gzip is useful for comparison rather than describing a network download. The production folder contains no source maps, the files that connect built code to its sources. An analysis build confirmed that React, React DOM, and their scheduler are absent.

For the earlier 559.70 kB build, the approximate contributions measured using source maps, which connect the built code to its source, were:

| Part                                                     | JavaScript size |
| -------------------------------------------------------- | --------------: |
| React, React DOM, and the scheduler                      |          223 kB |
| Ariakit and its dependencies, including menu positioning |          161 kB |
| Framer Motion and its dependencies                       |          148 kB |
| Folio code and dictionaries                              |           27 kB |

These are approximate portions of the already minified file, not package sizes in `node_modules`. To reduce the build size, Terser runs two passes. In the original measurement, it reduced JavaScript from 559.70 to 551.54 kB and gzip size from 184.32 to 176.33 kB. These figures compare the same functionality before later interface changes. Terser is used only during the build and is not included in the extension.

Importing individual Ariakit modules did not reduce the final file because the build tool already removes unused exports.

Before the Preact migration on November 4, 2026, the [Motion bundle-size recommendations](https://motion.dev/docs/react-reduce-bundle-size) were checked against the installed Framer Motion 14.9.0. All animated elements used the lightweight `framer-motion/m` entry point, including its `Reorder`, with `LazyMotion` providing features. These experiments kept the existing animation and drag settings:

| Motion setup                                                                                 | Initial JavaScript | Total JavaScript |
| -------------------------------------------------------------------------------------------- | -----------------: | ---------------: |
| Existing `motion` and `Reorder`                                                              |          573.54 kB |        573.54 kB |
| `m`, lightweight `Reorder`, synchronous `domMax`                                             |          574.01 kB |        574.01 kB |
| Same, selecting only renderer, animation, exit, tap, drag, and layout features from `domMax` |          574.11 kB |        574.11 kB |
| `m`, lightweight `Reorder`, asynchronous `domMax`                                            |          483.38 kB |        575.72 kB |

`domMax` includes the drag gestures and layout animations required by `Reorder`; `domAnimation` alone cannot preserve this behavior. Asynchronous loading moved 92.33 kB into another file but increased the total by 2.17 kB. None of these experiments reduced the extension's total size, so the standard `motion` and `Reorder` components remain. The later Preact migration additionally wraps the rows in `LayoutGroup`. The experimental variants were measured with production builds, but were not verified interactively in a browser.

An experiment with separate settings and search files produced a 516.66 kB initial file and 555.87 kB of JavaScript in total. This could defer loading about 35 kB until a dialog opens, but it would not reduce the total size. Deferred loading is not implemented: the benefit is small for a local popup and would require handling dialog loading and errors. Simply splitting libraries into separate files does not reduce the total size either.

## Check changes

```sh
pnpm check
pnpm test
pnpm build
```

See [Development commands](#development-commands) for the difference between checking, formatting, and linting. The language-setting compatibility test uses Happy DOM, a browser-like environment used only by tests, to cover Ariakit refs, native focus events, and keyboard confirmation with Preact.

Browser compatibility is not currently enforced by these commands. Biome's [`useBaseline`](https://biomejs.dev/linter/rules/use-baseline/css/) rule is explicitly disabled because it checks support across the main browsers rather than a chosen minimum Chrome version. It does not read Browserslist configuration. A minimum Chrome version has not yet been verified for the complete extension.

Biome reports empty CSS files and duplicate selectors as errors. The experimental [`noUnusedClasses`](https://biomejs.dev/linter/rules/no-unused-classes/css/) rule reports CSS classes with no detected references in JSX or HTML as warnings. It does not check every kind of selector and currently reports false positives for classes used in template strings in this project; review its findings before removing styles.

The project uses Biome's default order: URLs, modules with protocols such as `node:`, packages, path aliases, and file paths. Names within imports are also sorted. Side-effect imports, such as CSS imports, remain boundaries between groups. Separate ESLint and Prettier tools are not needed.

After interface changes, check both modes, keyboard use, outside-click menu dismissal, Escape, focus return, both themes, a narrow window, and persistence after reload. Testing in a regular tab does not replace testing the built extension in Chrome. The Preact production build stays below 500 kB of JavaScript and no longer produces the chunk-size warning. Compatibility was checked in the built-in Codex browser using a browser preview, including narrow windows, light and dark themes, reduced motion, both converter modes, menus, language selection, currency search, Undo, dragging in both directions, and persistence after reload. These checks do not replace testing an installed Chrome extension.

## Extend the project

New codes from the source appear automatically; there is no separate list of allowed currencies. When needed, add names in `src/converter/currency/currencyNames.ts`, and symbols and decorative flags in `src/converter/currency/currencies.ts`. Previously saved sets of 12 currencies remain compatible; the full list becomes available after a successful refresh. Add interface text to all three dictionaries in `src/i18n/messages.ts`. The name and description shown by Chrome live separately in `public/_locales/<language>/messages.json` and follow Chrome’s interface language rather than the language selected inside Folio. Define new settings in `src/settings/model.ts` and validate them during restoration in `src/storage/model.ts`.

Keep calculations and storage rules separate from components. Before adding a dependency, check whether an installed library already solves the problem. Do not present the time of a check as the rate date, and retain the last valid set when a refresh fails.
