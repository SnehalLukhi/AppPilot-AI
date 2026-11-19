# AppPilot AI

AI-powered Android development platform: generate apps from a prompt, import Android Studio projects, analyze APKs,
and work with autonomous agents in a browser IDE.

## Repository layout

```
apps/web/            Next.js frontend (Person 1)
packages/contracts/  Shared API contract types + endpoint registry (shared; each group owner approves changes)
docs/                Plans, design system, progress and contract docs
```

Backend, agent orchestration, code generation and build workers add their own folders (for example `apps/api`,
`services/*`). Folder ownership is still to be confirmed by the team — see `docs/FRONTEND_PLAN.md`.

## Frontend quick start

Requires Node 20.9+ (22 recommended).

```bash
npm install

# UI development without a backend (shows a "Mock data" badge everywhere):
npm run dev:web:mock

# Against a running backend (proxied from /api/v1 to BACKEND_URL):
cp apps/web/.env.example apps/web/.env.local     # then edit BACKEND_URL
npm run dev:web
```

Open http://localhost:3000. In mock mode you're signed in as a demo admin; use password `wrong` on the login page
to see the error state, or upload a file whose name contains `invalid` to see upload validation errors.

Checks:

```bash
npm run typecheck
npm run lint
npm run build:web
```

## Docs

- `docs/FRONTEND_PLAN.md` — screen-by-screen plan and team decisions to confirm
- `docs/DESIGN_SYSTEM.md` — tokens, components, status vocabulary, accessibility
- `docs/API_CONTRACTS_PENDING.md` — every endpoint the frontend needs, by owner (regenerate with
  `node packages/contracts/scripts/generate-docs.mjs`)
- `docs/FRONTEND_PROGRESS.md` — per-feature status
