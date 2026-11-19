# AppPilot design system

Owner: Person 1 (frontend). Source of truth for tokens: `apps/web/src/app/globals.css`.

## Direction: "Aurora"

AppPilot is a premium AI SaaS workspace. Deep ink-violet surfaces (dark-first, with a cool-white light theme), soft
glass panels, and one signature brand gradient (electric indigo into orchid) used for primary actions, the logo tile,
headline emphasis and ambient glows. The **agent colour (orchid)** still marks everything an AI touched: files in the
tree, editor gutter lines, the timeline, the assistant and "Agent" badges.

Principles:

1. **Depth through light, not noise.** Soft borders, card shadows, blurred glows and glass headers. Overlays get the strongest shadow.
2. **Colour is never the only signal.** Every status has an icon and a label; git states have letters (M/A/D/U).
3. **Two typefaces, one voice.** Bricolage Grotesque for display (h1, h2, stat numbers, logo); Figtree for UI; JetBrains Mono for code.
4. **Honest states.** Loading (shimmer skeletons), empty (icon tile with glow), error and *waiting for backend* are designed states.
5. **One accent per job.** Brand gradient/indigo = interactive, orchid = AI, green/amber/red/cyan = outcome only.
6. **Motion with restraint.** 150-300ms transitions, one-time fade-up on page headers and landing sections, slow ambient glow. All motion is disabled under prefers-reduced-motion.

## Colour tokens

Defined as CSS variables on `:root, .dark` (dark) and `.light`, exposed to Tailwind through `@theme inline`. Use the
Tailwind names (`bg-surface`, `text-ai`, `border-border-strong`); never hard-code hex values in components.

| Token | Dark | Light | Use |
|---|---|---|---|
| `background` | `#0a0912` | `#f6f5fc` | Page and editor background |
| `surface` / `surface-2` / `surface-3` | `#110f1c` / `#19162a` / `#231f36` | `#fff` / `#f0eefa` / `#e6e3f6` | Panels / hover / pressed |
| `foreground` | `#efecf8` | `#16122b` | Primary text |
| `muted-foreground` | `#a8a3c2` | `#565172` | Secondary text |
| `border` / `border-strong` | `#272238` / `#3a3452` | `#e3e0f1` / `#ccc7e3` | Dividers / control outlines |
| `primary` | `#9488ff` | `#5a47e6` | Links, focus ring, active nav, text accents |
| `brand-1/2/3` | `#6a5cf5` `#9a5cf2` `#e46bd0` | `#5b46e8` `#8a4bea` `#d8479f` | Gradient stops (`bg-brand`, `text-brand`) |
| `ai` | `#f07ad8` | `#b3238f` | AI-authored code and agent activity only |
| `success` / `warning` / `destructive` / `info` | `#3dd6a0` `#f2b04a` `#f6717f` `#62c3f0` | `#12805a` `#9c5c00` `#c4303f` `#1a77ad` | Outcomes |

Each semantic colour has a `-soft` variant for badge and alert backgrounds. Utilities in `globals.css`: `bg-brand`,
`text-brand`, `glow-sm`, `glass`, `hairline-top`, `dot-grid`, `app-ambient`, `skeleton-shimmer`, `stagger`, plus
`animate-fade-up | fade-in | float | glow | pan`.

## Typography

- **Bricolage Grotesque Variable** for display (applied automatically to `h1`, `h2` and `.font-display`).
- **Figtree Variable** for UI text.
- **JetBrains Mono Variable** for code, paths, SHAs, Gradle tasks and logs.
- All self-hosted through `@fontsource-variable/*`.

Scale (px): 11 · 12 · 13 · 14 · 16 · 20 · 24 · 32 · 44+. App body 14px; page titles 28-32px; landing headline up to 76px
with -0.035em tracking. Sentence case everywhere.

## Spacing, radius, elevation

- Tailwind 4px spacing scale. Page gutters `px-4 sm:px-6` below `lg`; from `lg` up the content column is 90% of the
  area beside the sidebar (5% each side), capped at 1600px and centred (`lg:w-[min(90%,1600px)]`). Page vertical
  padding 32px; card padding 20px; dense rows 8–10px vertical.
- Radius hierarchy: controls 8px (`rounded-sm`), inputs/menus 10-14px, cards `rounded-xl` 20px, hero frames 28px.
- Interactive cards and list rows use a 150–200ms colour transition and a stronger border or `surface-2` fill on hover.
- Elevation: cards use `shadow-card`; popovers, menus, dialogs and toasts use `shadow-pop`. Primary buttons carry a soft brand glow.

## Components

Location: `apps/web/src/components/ui/`. Built on Radix primitives in the shadcn/ui pattern (`components.json` is set up
so `npx shadcn add <name>` works for teammates).

| File | Components |
|---|---|
| `button.tsx` | `Button` — variants `default`, `secondary`, `outline`, `ghost`, `subtle`, `destructive`, `ai`, `link`; sizes `sm`, `default`, `lg`, `icon`, `icon-sm`, `icon-xs`; `loading` prop |
| `primitives.tsx` | `Input`, `Textarea`, `Label`, `Field` (label + hint + error wiring), `Card*`, `Badge` (tones), `Separator`, `Skeleton`, `Kbd`, `Progress`, `Alert`, `Table`/`THead`/`TBody`/`TR`/`TH`/`TD`, `Avatar`, `Switch`, `Checkbox` |
| `overlays.tsx` | `Dialog*`, `ConfirmDialog`, `DropdownMenu*`, `ContextMenu*`, `Tooltip`, `Popover*`, `Tabs*`, `Select`, `Segmented` |

Shared building blocks:

- `components/states/states.tsx` — `QueryView` (loading → error/pending → empty → data), `EmptyState`, `ErrorState`,
  `PendingBackend` (names the missing endpoint, its owner and contract status), `LoadingRows`.
- `components/status/status-badge.tsx` — the only place status vocabulary lives: 12 agent statuses, 5 build statuses,
  5 validation statuses, each with label, tone, icon and a plain-language description (used in tooltips).
- `components/layout/` — `AppShell` (collapsible sidebar, mobile drawer), `AuthGuard`, `PageBody`, `PageHeader`,
  `SectionTitle`, `Meter`, `MockModeBadge`, `ThemeToggle`, `UserMenu`.
- `components/logs/log-viewer.tsx` — filterable, follow-tail log view used by builds, tests and the IDE.

## Status vocabulary

| Domain | Statuses |
|---|---|
| Agent task | Queued · Planning · Analyzing · Generating · Reviewing · Building · Testing · Repairing · Completed · Failed · Blocked · Cancelled |
| Build | Queued · Running · Succeeded · Failed · Cancelled |
| Validation (tests) | Passed · Failed · Blocked · Unverified · Skipped |

AI working states (planning → reviewing) use the violet tone; building/testing use info; repairing and blocked use
warning. "Unverified" is cyan, never green: it means the check ran but couldn't be confirmed.

## IDE conventions

- Panel layout: explorer | editor + bottom panel | assistant. Sizes persist per browser (`react-resizable-panels`
  `autoSaveId`); visibility persists in the IDE store.
- AI-written lines: 3px violet gutter bar + 14% violet line tint, hover shows the task id.
- Tabs: blue top edge for the active tab, filled dot for unsaved, close button on hover.
- Explorer: git letter at the right, violet file icon and sparkle for AI-modified files, folders inherit change state
  when collapsed, strike-through for deleted files.
- Monaco theme is generated at runtime from the CSS tokens, so editor colours follow the app theme.

## Writing

Sentence case, plain verbs, actions named by outcome ("Start build", "Accept 2 files", "Delete project"). The toast
after an action reuses the action's word ("Build #15 started"). Errors say what happened and what to do next; empty
states invite the next action. Never describe a pending integration as broken: say what it's waiting for.

## Accessibility checklist

- Visible focus ring (`outline-ring`, 2px) on every interactive element.
- Icon-only buttons have `aria-label`; tooltips repeat the label and show the shortcut.
- Forms wire errors with `aria-invalid` + `aria-describedby` and `role="alert"`.
- Tree, tablist, listbox and log roles in the IDE; live regions for agent progress and streaming logs.
- `prefers-reduced-motion` disables animations globally.
- Contrast (measured): foreground 13.9–17.4:1; muted 5.2–6.2:1; primary and AI buttons 5.3–7.7:1; light-theme
  status text 4.6–5.4:1. `subtle-foreground` is about 3.5:1 — use it only for placeholders, line numbers and
  repeated secondary meta, never for the only copy of essential information.
