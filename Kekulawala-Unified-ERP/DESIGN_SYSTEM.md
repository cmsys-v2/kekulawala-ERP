# Aurora Command — Kekulawala ERP Design System v6

> A living interface for a 40-year-old Sri Lankan advertising & print house.
> Deep-space glass, kinetic aurora light, electric blue → emerald gradients and
> precision micro-motion. Built for people who quote, build and print all day.

---

## 1. Design principles

| Principle | What it means in the product |
| :-- | :-- |
| **Light in the dark** | The workspace sits on a near-black canvas with animated aurora light. Glass panels float above it — content never fights the background. |
| **Motion explains** | Nothing moves for decoration alone. Panels rise, numbers count up, progress fills, the Gemini frame rotates only where the AI is actually working. |
| **Brand first** | The Kekulawala aperture mark, the "Since 1982" lockup and the print studio imagery are part of the UI — not a logo dump. |
| **Blue → green energy** | Cyan `#22d3ee` → blue `#3b82f6` → emerald `#10b981` is the signature gradient for primary actions, KPIs and progress. |
| **Density with air** | Financial data is compact and tabular, but every panel has breathing room, soft radii (16–28 px) and a single visual focus. |

---

## 2. Foundation

### 2.1 Colour tokens

All colour lives in CSS custom properties on `[data-theme]` so views never
hard-code a hex. Semantic tokens used throughout:

```
--page-bg / --surface-0/1/2      canvas layers
--card-bg / --card-bg-solid     glass panel fill (translucent + fallback)
--card-border / -strong         hairline borders
--text-primary / secondary / muted / accent
--accent-blue / -sky / -cyan / -emerald / -lime / -violet / -amber / -rose
--color-success / danger / warning / info / purple  (+ -bg tints)
--brand-gradient                cyan → blue → emerald
--btn-primary / --btn-primary-shadow
--input-* / --table-* / --scrollbar-*
--aurora-1…4                    animated backdrop light
```

Legacy tokens (`--sidebar-*`, `--header-*`, `--header-user-*`, `--tipbar-*`,
`--db-pill-*`, `--mobile-nav-*`, `--gradient-primary`, `--glass-*`) are kept so
every existing view keeps working unchanged.

### 2.2 Four themes

| id | Name | Mood |
| :-- | :-- | :-- |
| `ocean-dark` *(default)* | **Midnight Aurora** | Deep space navy, cyan + emerald aurora |
| `aurora` | **Emerald Flux** | Living green energy, teal + lime |
| `obsidian` | **Onyx Neon** | Black glass, violet + magenta sparks |
| `pearl` | **Daylight Pearl** | Airy light mode, sapphire accents |

Theme is stored in `localStorage` (`erp-theme`) and applied via
`document.documentElement[data-theme]` by `ThemeContext`.

### 2.3 Typography

| Role | Family | Usage |
| :-- | :-- | :-- |
| Display | **Sora** | page titles, hero, metrics (`--font-display`) |
| Body | **Inter** | UI copy, tables, forms (`--font-body`) |
| Data | **JetBrains Mono** | money, codes, timestamps (`--font-mono`) |

Titles use `letter-spacing: -0.035em → -0.05em` for an editorial, AI-landing feel.

### 2.4 Radii, elevation, motion

- Radii: `12 / 16 / 22 / 28 px` (`--radius-sm/md/lg/xl`).
- Glass: `backdrop-filter: blur(22px) saturate(135%)` + 1 px top sheen line.
- Easing: `--ease-out: cubic-bezier(.16,1,.3,1)` and a spring for popovers.
- Motion budget: page rise 500 ms, KPI stagger 60 ms, modal 340 ms,
  aurora drift 26–36 s, conic frame 7 s.
- `prefers-reduced-motion: reduce` disables all of it.

---

## 3. Layout

```
┌───────────────┐  ┌─────────────────────────────────────────────┐
│  floating     │  │  topbar (glass pill, 68 px)                 │
│  glass        │  ├─────────────────────────────────────────────┤
│  sidebar      │  │  .erp-content  →  .page (max-width 1560)    │
│  (262 / 84)   │  │    hero · kpi-grid · dash-grid · cards      │
└───────────────┘  └─────────────────────────────────────────────┘
        aurora backdrop (fixed, animated blobs + grid + grain)
```

- **Sidebar** — floating card with 24 px radius, brand mark, six grouped nav
  sections, live-sync pill, Gemini copilot card, collapse control.
- **Topbar** — breadcrumb + live badge, ⌘K search trigger, greeting, theme
  picker, notification tray, profile chip.
- **Mobile (≤1023 px)** — sidebar becomes a drawer (scrim + slide), topbar
  compresses, and a floating glass bottom-nav (Home · Projects · Clients ·
  Finance · Menu) docks at the bottom. Content padding reserves 100 px.
- **Breakpoints** — 1023 (nav), 1180 (dashboard split), 1240/980 (studio
  columns), 560 (hero typography).

---

## 4. Component library (`src/components/CommonUI.jsx`)

| Component | Purpose / notable props |
| :-- | :-- |
| `PageHeader` | eyebrow + display title with gradient highlight + subtitle + actions |
| `StatCard` | glass KPI tile: icon glow, count-up value, trend chip, sparkline |
| `Sparkline` | SVG area+line, auto gradient fill |
| `ProgressRing` | gradient donut for completion / margins |
| `CountUp` | eased numeric animation with formatter |
| `Badge` | 20+ semantic statuses (ongoing, overdue, present, …) |
| `Modal` | glass sheet with brand gradient top edge + eyebrow/subtitle |
| `FormField` | uppercase micro-label + optional hint |
| `SearchField`, `Segmented`, `Avatar`, `Divider`, `EmptyState`, `StarRating` |
| `Toast` | gradient success / warning / error toast |

Non-React utilities in `index.css`: `.card`, `.card-surface`, `.kpi-tile`,
`.hero`, `.hero-stat`, `.pill`, `.filter-chip`, `.segmented`, `.spotlight`,
`.glow-frame`, `.media-card`, `.tile-link`, `.progress-track/.fill`,
`.skeleton`, `.live-dot`, `.kbd`, `.popover`.

### Signature moments

1. **Command Center hero** — live clock pill, greeting, gradient headline,
   rotating rings, liquid orb, four glass stat chips, primary actions.
2. **Bento dashboard** — financial pulse area chart, project portfolio ring +
   budget bars, Gemini copilot panel with rotating conic frame, legal pulse,
   stock signals, live activity, people on deck, creative studio media cards.
3. **Command palette (⌘K / Ctrl+K)** — fuzzy jump to any module; ↑/↓/⏎/Esc.
4. **Boot splash** — brand mark, pulsing rings, gradient loader; fades out on
   first paint.
5. **Theme picker** — four live swatches, instant retheme, persisted.

---

## 5. Brand assets (`public/brand/`)

| File | Use |
| :-- | :-- |
| `app-icon.jpg` | sidebar mark, avatar, boot splash, PWA-style icon |
| `banner.png` | settings brand strip |
| `company-logo.png` | brand library / letterhead attachment |
| `watermark-sinhala.png` | Sinhala watermark for printed documents |
| `promo-banner.jpg`, `promo-digital.jpg` | creative studio showcase cards |

Print surfaces (`LetterheadCanvas`, document previews in the Studio and
Quotations views) deliberately stay **white A4** — the dark UI chrome exists to
make the physical output look trustworthy.

---

## 6. Boot reliability & caching

The interface must never depend on a warm cache to start.

| Layer | Behaviour |
| :-- | :-- |
| **Serving** | The live preview runs `vite build` + `vite preview` (static, hashed assets) rather than the dev ESM graph, so no per-module cache-busting requests are involved. `npm run serve` reproduces this locally. |
| **Service worker** | Off by default. Registered only for a production build **and** when `?sw=1` is present. On every other load, existing registrations and all cache buckets are removed. |
| **Cache hygiene** | `index.html` purges registrations + caches idempotently on load — it never triggers a navigation, so it cannot loop inside sandboxed iframes. |
| **Watchdog** | If the bundle has not mounted after 12 s, a recovery card replaces the black screen with *Reload fresh copy* and *Safe mode*. |
| **ErrorBoundary** | Runtime render errors show the failing component, the message and a one-click cache reset — the app never white-screens. |
| **Safe mode** | `?safe=1` disables blur, aurora blobs and all animation for low-power GPUs. |
| **Build stamp** | `window.__KERP_BUILD__` (v6.3.0) is shown in the sidebar and in Settings → Cloud so the running build is always verifiable. |

## 7. Accessibility & performance

- WCAG AA text contrast on all four themes; focus rings use
  `--input-border-focus`.
- Touch targets ≥ 34 px (`button, a, [role=button]`), bottom nav 46 px.
- Animations are GPU-only (`transform`, `opacity`, `filter`) and disabled under
  `prefers-reduced-motion`.
- Aurora is four blurred blobs + one grain tile — no canvas, no RAF loop.
- Charts use Recharts with tokenised axis/grid colours.
- Service worker (`public/sw.js`) is network-first for scripts/styles so new
  builds are never stale, cache fallback when offline.

---

## 8. Extending

1. Add a view to `NAV_ITEMS` in `src/components/HeaderSidebar.jsx`
   (`id`, `label`, `icon`, `category`, `hint`).
2. Wrap the page in `<div className="page">` and open with `<PageHeader … />`.
3. Use `.card` / `.kpi-tile` / `.filter-chip` / `.btn btn-primary` instead of
   inline colours — never hard-code a hex.
4. Mount the view in `App.jsx` `renderView()`.
