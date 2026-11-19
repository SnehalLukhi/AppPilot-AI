# AppPilot AI — Frontend implementation plan

Owner: Person 1 (frontend). Last updated: 2026-11-18.

## Starting point

The repository was empty when frontend work began: no framework, no backend,
no API contracts. These decisions follow from that and need team confirmation:

| Decision | Choice | Confirm with |
|---|---|---|
| Repo layout | npm-workspaces monorepo. Frontend in `apps/web`, shared API types in `packages/contracts`. Backend/workers add their own `apps/*` or `services/*`. | Whole team |
| Frontend folder ownership | Person 1 owns `apps/web/**`, `docs/DESIGN_SYSTEM.md`, `docs/FRONTEND_*.md`. `packages/contracts/**` is **shared** — frontend drafted it; each group owner must approve changes to their group. | Whole team |
| API contracts | Drafted in `packages/contracts` and registered in `packages/contracts/src/endpoints.ts` with `status: "draft"`. Nothing is treated as final until the owner flips it to `agreed`/`live`. | Persons 2–4 |
| Auth transport | httpOnly session cookie set by backend; Next.js rewrites `/api/v1/*` to `BACKEND_URL` so cookies stay first-party. No tokens in JS storage. | Backend (Person 4) |
| Mock data | `NEXT_PUBLIC_API_MODE=mock` enables an in-memory mock adapter for UI development only. A persistent "Mock data" badge is shown whenever it is on. Default mode is `live`. Production builds refuse mock mode unless `ALLOW_MOCK_IN_PRODUCTION=true`. | Whole team |
| Terminal | Frontend only ever connects to a per-project sandbox WebSocket URL returned by `POST /projects/{id}/terminal/sessions`. There is no code path to a server shell. In mock mode the terminal shows an explanation instead of a fake shell. | Backend (Person 4) |

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5.9 · Tailwind CSS 4 ·
shadcn/ui-pattern components on Radix primitives · Monaco + Monaco Diff via
`@monaco-editor/react` · xterm.js · TanStack Query (server state) · Zustand
(client state, persisted where noted) · react-resizable-panels · next-themes.

## Route map

```
/                                   Landing                 (marketing)
/login  /register                  Auth                    (auth)
/forgot-password  /reset-password  Password recovery       (auth)
/dashboard                          Dashboard               (app shell)
/projects                           Projects
/projects/new                       New project wizard
/projects/[id]                      -> redirects to /ide
/projects/[id]/ide                  Browser IDE             (full-screen, own layout)
/projects/[id]/agent                AI agent activity
/projects/[id]/builds               Build center
/projects/[id]/tests                Testing center
/projects/[id]/visual-editor        Visual UI editor (optional; gated on contract)
/projects/[id]/settings             Project settings
/billing                            Billing and usage
/settings                           User profile and settings
/admin                              Admin dashboard (role = admin)
```

## Build order

1. Contracts + plan (this doc).
2. Foundation: monorepo, Next.js app, tokens, themes, base components, state screens.
3. Data layer: API client, query hooks, SSE/WebSocket helpers, dev-only mock adapter.
4. Shell + auth + dashboard + projects + wizard.
5. Browser IDE (largest piece).
6. Agent, builds, tests, settings, billing, profile, admin, visual editor shell.
7. Verification, `docs/FRONTEND_PROGRESS.md`.

## Screen-by-screen plan

### 1. Landing (`/`)
Header (logo, sign in, get started), hero describing the three entry points
(prompt, Android Studio ZIP, APK), a static product illustration of the IDE
with an agent change under review, the agent loop (plan → generate → build →
test → repair), how results and reviews work, footer. No pricing on the
landing page until plans are confirmed by the business (billing shows live plans).
No live data. Marketing illustration is clearly decorative, not product data.

### 2–4. Login / Registration / Forgot password
Centered card layout. Client-side validation for required fields, email
format, password length; server `fields` errors mapped onto inputs.
Forgot password always shows the same confirmation (no account enumeration).
The emailed link lands on `/reset-password?token=…`.
APIs: `auth.login`, `auth.register`, `auth.forgotPassword`, `auth.resetPassword`, `auth.session`.

### 5. Dashboard (`/dashboard`)
Stat row: total projects, active AI tasks, successful builds, failed builds.
Usage meters: AI tokens, storage, build minutes. Recent builds list. Recent
activity feed. Quick-create card (prompt box that hands off to the wizard).
Each widget loads independently with its own loading/error/empty state.
APIs: `projects.list`, `agent.tasks.list?status=active`, `builds.list`,
`usage.summary`, `projects.activity`.

### 6. Projects (`/projects`)
Search, filter by source/status, sort; grid/list toggle. Project card shows
language/toolkit, source (APK projects visibly labelled "APK analysis"),
active tasks, last build status. Row actions: open IDE, builds, settings, delete
(confirm dialog). Empty state invites creating the first project.

### 7. New project wizard (`/projects/new`)
Step 1 choose method; step 2 method form; step 3 progress/result.
- A. Prompt: name, description, requirements list (add/remove), Kotlin/Java,
  Compose/XML, package name, min/target SDK, extra key-value config,
  "Generate project" → navigates to the agent activity of the new task.
- B. ZIP: drag-drop, client checks (.zip, size limit), upload progress (XHR),
  server validation errors, analysis status + summary (modules, build system,
  AGP/Kotlin versions, warnings), "Open in IDE" and "Describe a change" next steps.
- C. APK: drag-drop, upload progress, analysis progress, analysis report
  (package, versions, SDKs, permissions, components, ABIs, libraries,
  findings). A persistent notice explains APK analysis is decompiled
  inspection, not the original source, and that changes produce new code
  rather than editing the original project.

### 8. Browser IDE (`/projects/[id]/ide`)
```
+--+-------------+---------------------------------+-----------------+
|  | EXPLORER    | tabs  Main.kt ●  build.gradle   | AI ASSISTANT    |
|  | search      | breadcrumbs app > src > ...     | chat history    |
|  | tree w/     |                                 | plan / changes  |
|  | M/A/D/AI    |      Monaco editor / diff       | accept/reject   |
|  | markers     |                                 | intent + prompt |
|  |             +---------------------------------+                 |
|  |             | Terminal | Build | Problems | Tests | Git | Preview |
+--+-------------+---------------------------------+-----------------+
| status bar: problems · agent status · live/offline · cursor · language |
```
- Panels resizable (react-resizable-panels, sizes persisted) and collapsible
  (Ctrl/Cmd+B explorer, Ctrl/Cmd+J bottom, Ctrl/Cmd+Alt+B assistant; Ctrl/Cmd+Alt+I is reserved by browsers for dev tools).
- Explorer: recursive tree, expand/collapse, create file/folder, rename, delete
  (confirm), filter by name, content search, git + AI markers.
- Editor: multiple tabs, dirty dot, close-with-unsaved warning, `beforeunload`
  guard, breadcrumbs, Kotlin/Java/XML/JSON/YAML/Markdown/Gradle (Groovy via a
  registered Monarch grammar, `.kts` as Kotlin), Monaco's find/replace and
  undo/redo, AI-range gutter decorations, Ctrl/Cmd+S save with version
  conflict handling.
- Diff: per-file Monaco Diff Editor for agent change sets; per-file and
  all-files accept/reject.
- Assistant: history, intents (Chat, Explain, Generate, Modify, Fix, Refactor),
  sends active file + selection + open tabs as context, renders plan and
  change set, live updates via task SSE.
- Bottom: xterm terminal (sandbox session only), build output (live log
  stream), problems (click → jump to line), test results, git history, preview
  (shown as unavailable until an emulator-streaming contract exists).
- Persistence (localStorage via Zustand): open tabs + active file per
  project, editor settings (font size, tab size, word wrap, minimap), panel
  layout. Unsaved buffers are kept only in memory.

### 9. AI agent activity (`/projects/[id]/agent`)
Task list (filter by status) + selected task detail: status badge (12
statuses), description, current step, execution timeline, files being
analysed/modified, build progress, repair iterations x/max, token usage,
recorded cost (as reported by backend), cancel action. Live via SSE.

### 10. Build center (`/projects/[id]/builds`)
New build (APK/AAB, debug/release). Table: number, type, variant, status,
trigger, duration, started. Detail drawer: config, error list, log viewer
(streaming for running builds, searchable), artifacts with download, retry,
cancel.

### 11. Testing center (`/projects/[id]/tests`)
Run unit/instrumentation/emulator tests. Job list with summary counts using
the five validation statuses. Detail: test cases grouped by suite with
failure message/stack trace, screenshots gallery, logs. "Unverified" and
"Blocked" have explanatory tooltips so they're not confused with pass/fail.

### 12. Project settings
General (name, description), Android config (package, min/target SDK),
build environment variables (secret values write-only), danger zone (delete).

### 13. Billing and usage
Current plan, usage meters, daily usage chart, plans grid, invoices.
Upgrade/manage open backend-provided hosted URLs; no card fields in our UI.

### 14. User profile and settings
Profile, password, preferences (theme, default language/toolkit,
notifications), editor defaults, API keys list.

### 15. Admin dashboard
Hidden from nav unless `role === "admin"`; route also guarded. Overview
stats, queue depth, worker pool status, users table, audit log.

### Optional: visual UI editor
UI shell (screen list, preview pane, component tree, property inspector,
AI edit prompt, undo/redo) wired to the draft `ui.*` contract. Until the
code-generation owner agrees the contract, the page shows a
"waiting for backend" state rather than a static fake preview.

## Cross-cutting

- Every data view has loading (skeleton), error (message + retry), and empty
  (call to action) states, plus a "waiting for backend" state that names the
  missing endpoint when the API returns 404/501 for a draft contract.
- Status vocabulary (agent/build/validation) lives in one place:
  `apps/web/src/components/status/status-badge.tsx`.
- Accessibility: Radix primitives, visible focus rings, aria-labels on icon
  buttons, reduced-motion respected, colour never the only signal.
