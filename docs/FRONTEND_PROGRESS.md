# Frontend progress

Owner: Person 1 (frontend). Last updated: 2026-11-18.

**Context:** the repository was empty when frontend work started. No backend endpoint exists yet, so every
data-backed feature is built against the **draft** contracts in `packages/contracts` and is marked
*Waiting for backend*. Each of those screens also runs against the dev-only mock adapter
(`NEXT_PUBLIC_API_MODE=mock`, always shown with a "Mock data" badge) so the UI can be developed and reviewed now.
The mock never ships as production behaviour: production builds refuse mock mode unless
`ALLOW_MOCK_IN_PRODUCTION=true` is set deliberately.

Status legend (one per feature):

- **Implemented** — complete, needs nothing from other teams.
- **Partially implemented** — usable, with listed gaps.
- **Waiting for backend** — UI complete against the draft contract; needs the endpoint(s) to exist.
- **Mocked** — only works through the dev mock (none today: every mocked screen is also wired to the real client).
- **Not implemented** — not started.

Verification done: `tsc --noEmit`, `eslint`, `next build` (19 routes) all pass. Every screen was loaded in headless
Chrome in mock mode (dark, light, 390px mobile) with no console errors, and the IDE flow was exercised end to end:
quick-open → edit → save → review agent diff → accept → AI markers update → agent request runs to a reviewable change.

## Foundation

| Feature | Status | Notes |
|---|---|---|
| Monorepo layout (`apps/web`, `packages/contracts`) | Implemented | Needs team sign-off on folder ownership (see FRONTEND_PLAN.md). |
| Design tokens, light/dark themes, typography | Implemented | `globals.css`; docs/DESIGN_SYSTEM.md. |
| Component library (shadcn pattern on Radix) | Implemented | `components/ui/*`. |
| Loading / error / empty / waiting-for-backend states | Implemented | `QueryView`, `PendingBackend`. |
| Central API client + endpoint registry | Implemented | `lib/api/client.ts`, `packages/contracts/src/endpoints.ts`. |
| React Query hooks, Zustand stores (persisted where needed) | Implemented | `lib/api/hooks.ts`, `stores/*`. |
| SSE helper with reconnect status | Implemented | `lib/realtime/use-event-stream.ts`; needs backend streams. |
| Dev mock adapter | Implemented | Dev only. 65 of 73 endpoints work in mock mode (including the 3 live streams). Terminal, checkout, billing portal and artifact download return 501 on purpose; the visual-editor endpoints aren't mocked. |
| Same-origin API proxy (`/api/v1/*` → `BACKEND_URL`) | Implemented | `next.config.ts`; backend must confirm cookie auth. |
| Monaco self-hosted (no CDN) | Implemented | `scripts/copy-monaco.mjs` runs before dev/build. |
| Automated tests (unit / e2e) | Not implemented | Only manual Playwright smoke runs so far. Next: Vitest for stores/utils, Playwright for the IDE flow. |

## Screens

| # | Screen | Status | Notes |
|---|---|---|---|
| 1 | Landing | Implemented | Static marketing page with a theme-aware HTML illustration. |
| 2 | Login | Waiting for backend | `auth.login`, `auth.session`. Safe `next=` redirect handling. |
| 3 | Registration | Waiting for backend | `auth.register`; maps server `fields` errors to inputs. |
| 4 | Forgot password + reset | Waiting for backend | `auth.forgotPassword`, `auth.resetPassword`; non-enumerating copy. Email verification page not built (flow undefined). |
| 5 | Dashboard | Waiting for backend | Totals, active tasks, build outcomes, usage meters, recent builds, activity feed, quick create. Each widget fails independently. |
| 6 | Projects | Waiting for backend | Search, source filter, sort, grid/list (persisted), delete with typed confirmation. |
| 7 | New project wizard | Waiting for backend | Prompt form (requirements, Kotlin/Java, Compose/XML, package, SDKs, extra config); ZIP and APK upload with client validation, XHR progress, server validation errors, analysis progress and reports. APK flow states clearly that it isn't source access. |
| 8 | Browser IDE | Partially implemented | See IDE table. |
| 9 | AI agent activity | Waiting for backend | All 12 statuses, timeline, current step, files analysed/modified, build progress, repair iterations, tokens, recorded cost, cancel, live stream indicator. |
| 10 | Build center | Waiting for backend | History, APK/AAB + debug/release, status, duration, errors with jump-to-file, streaming log viewer, artifacts + download, retry, cancel. |
| 11 | Testing center | Waiting for backend | Unit/instrumentation/emulator jobs, five validation statuses with explanations, cases grouped by suite with stack traces, screenshots, logs. |
| 12 | Project settings | Waiting for backend | General + Android config, build env vars with write-only secrets, delete. |
| 13 | Billing and usage | Waiting for backend | Plan, meters, 30-day chart, plans, invoices. Upgrade/manage redirect to provider-hosted pages; no card fields in our UI. |
| 14 | Profile and settings | Partially implemented | Profile, password, synced preferences, editor settings (local, implemented). API keys are list-only — create/revoke needs a contract. |
| 15 | Admin dashboard | Partially implemented | Role-gated nav + route; overview, workers, users (search), audit log. User actions (suspend, change plan) not built — need contract. |
| — | Visual UI editor (optional) | Waiting for backend | Screen list, component tree, grouped property inspector, AI prompt, undo/redo history, review hand-off. Deliberately **not mocked**: it shows *Waiting for backend* until the code-generation owner agrees `ui.*`. |

## Browser IDE

| Feature | Status | Notes |
|---|---|---|
| Resizable panels (persisted sizes) | Implemented | `react-resizable-panels` `autoSaveId`. |
| Collapsible panels + shortcuts | Implemented | Ctrl/⌘+B explorer, Ctrl/⌘+J bottom, Ctrl/⌘+Alt+B assistant. |
| Keyboard shortcuts + help dialog | Implemented | Ctrl/⌘+P quick open, Ctrl/⌘+Shift+F content search, Alt+W close tab, Ctrl/⌘+/ help. |
| File tree (recursive, expand/collapse, reveal active) | Waiting for backend | `projects.files.tree`. |
| Create / rename / delete files and folders | Waiting for backend | Inline inputs, context menu, confirm delete; open tabs follow renames. |
| Name filter + content search | Waiting for backend | Content search uses `projects.files.search`. |
| Git / AI markers in the tree | Waiting for backend | M/A/D/U letters, violet AI marker, folder roll-up. |
| Monaco editor, multiple tabs, persisted active file | Implemented | Tabs and active file persist per project in localStorage; one editor keeps a model + undo stack per file. |
| Kotlin, Java, XML, JSON, YAML, Markdown, Gradle | Implemented | Groovy grammar registered for `.gradle`; `.kts` uses Kotlin. |
| Find/replace, undo/redo | Implemented | Monaco built-ins. |
| Save with conflict handling | Waiting for backend | Optimistic concurrency via `baseVersion`; on 409 offers overwrite or load latest. |
| Unsaved-change warnings | Implemented | Tab dot, close prompt (save / don't save), `beforeunload`, status-bar count, server-changed banner. Buffers survive in-app navigation. |
| Breadcrumbs, AI-edited badge, AI line markers | Implemented | Needs `aiRanges` from the backend to show real data. |
| Diff view | Implemented | Agent change review (per-file accept/reject) and "compare with saved" for local edits. |
| AI assistant (history, intents, context, plan, change set, live progress) | Waiting for backend | Sends active file, selection, open tabs and errors as context. Quick actions: explain selection, fix errors, refactor file. |
| Terminal (xterm) | Waiting for backend | Connects only to the sandbox `wss://` URL issued by `projects.terminal.create`; no other code path. Not mocked. |
| Build output | Waiting for backend | Latest build with streaming log. |
| Problems | Waiting for backend | Click jumps to file and line. |
| Test results | Waiting for backend | Latest jobs, links to testing center. |
| Git history | Partially implemented | Read-only log. Commit, branch and revert UI need contracts. |
| Preview | Not implemented | Needs an emulator-streaming service; no contract exists. Shows an explanation and links to test screenshots. |
| Agent activity indicators | Waiting for backend | Status bar, assistant task cards, project SSE. |
| Code intelligence (completion, go-to-definition for Kotlin/Java) | Not implemented | Would need a language-server endpoint; out of scope until requested. |

## Open items for the team

1. Confirm folder ownership and the monorepo layout.
2. Review the draft contracts with each owner (`docs/API_CONTRACTS_PENDING.md`). In particular: cookie auth, error
   envelope, SSE event names, upload flow, terminal session handshake, `aiRanges` on file reads, change-set decisions.
3. Decide which group owns the visual-editor contract and the preview/emulator stream.
4. Add contracts for API key create/revoke, admin user actions, and git write operations if they're in scope.
