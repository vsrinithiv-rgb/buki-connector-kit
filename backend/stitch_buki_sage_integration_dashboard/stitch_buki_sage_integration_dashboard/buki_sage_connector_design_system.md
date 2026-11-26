---
name: "Buki Sage Connector — Enterprise Ledger"
description: "Clean, high-contrast enterprise SaaS design system with slate neutrals, indigo primary accents, and semantic status badges for financial integration workflows."
---

## Overview

The **Buki Sage Connector** design system is built for finance and accounting professionals managing automated ledger synchronization between Buki and Sage (Sage Intacct / Sage 50). Inspired by Linear and Stripe Dashboard, the interface prioritizes precision, scannability, and calm authority. It pairs crisp slate surfaces and hairline borders with focused indigo interactive accents and unambiguous emerald, amber, and rose status indicators.

## Colors

The palette uses a restrained slate-neutral foundation so dense financial tables, account codes, and sync logs remain effortless to scan. Indigo serves exclusively as the primary action and active navigation accent. Semantic status tokens—emerald for success, amber for warning, and rose for error—are reserved strictly for connection states, mapping statuses, and sync log outcomes.

```yaml
colors:
  success: "#047857"
  on-success: "#FFFFFF"
  success-container: "#D1FAE5"
  on-success-container: "#065F46"
  warning: "#B45309"
  on-warning: "#FFFFFF"
  warning-container: "#FEF3C7"
  on-warning-container: "#92400E"
  light:
    primary: "#4F46E5"
    on-primary: "#FFFFFF"
    primary-container: "#E0E7FF"
    on-primary-container: "#312E81"
    secondary: "#475569"
    on-secondary: "#FFFFFF"
    secondary-container: "#E2E8F0"
    on-secondary-container: "#1E293B"
    tertiary: "#0F172A"
    on-tertiary: "#FFFFFF"
    tertiary-container: "#F1F5F9"
    on-tertiary-container: "#0F172A"
    error: "#BE123C"
    on-error: "#FFFFFF"
    error-container: "#FFE4E6"
    on-error-container: "#9F1239"
    background: "#F8FAFC"
    on-background: "#0F172A"
    surface: "#F8FAFC"
    surface-dim: "#E2E8F0"
    surface-bright: "#FFFFFF"
    surface-container-lowest: "#FFFFFF"
    surface-container-low: "#F8FAFC"
    surface-container: "#F1F5F9"
    surface-container-high: "#E2E8F0"
    surface-container-highest: "#CBD5E1"
    on-surface: "#0F172A"
    surface-variant: "#E2E8F0"
    on-surface-variant: "#475569"
    outline: "#64748B"
    outline-variant: "#E2E8F0"
    inverse-surface: "#0F172A"
    inverse-on-surface: "#F8FAFC"
    inverse-primary: "#A5B4FC"
    shadow: "#0F172A"
    scrim: "#0F172A"
  dark:
    primary: "#A5B4FC"
    on-primary: "#1E1B4B"
    primary-container: "#3730A3"
    on-primary-container: "#E0E7FF"
    secondary: "#94A3B8"
    on-secondary: "#0F172A"
    secondary-container: "#334155"
    on-secondary-container: "#F1F5F9"
    tertiary: "#E2E8F0"
    on-tertiary: "#0F172A"
    tertiary-container: "#1E293B"
    on-tertiary-container: "#F8FAFC"
    error: "#FDA4AF"
    on-error: "#4C0519"
    error-container: "#881337"
    on-error-container: "#FFE4E6"
    background: "#0F172A"
    on-background: "#F8FAFC"
    surface: "#0F172A"
    surface-dim: "#020617"
    surface-bright: "#1E293B"
    surface-container-lowest: "#020617"
    surface-container-low: "#0F172A"
    surface-container: "#1E293B"
    surface-container-high: "#334155"
    surface-container-highest: "#475569"
    on-surface: "#F8FAFC"
    surface-variant: "#334155"
    on-surface-variant: "#CBD5E1"
    outline: "#94A3B8"
    outline-variant: "#334155"
    inverse-surface: "#F8FAFC"
    inverse-on-surface: "#0F172A"
    inverse-primary: "#4F46E5"
    shadow: "#020617"
    scrim: "#020617"
```

## Typography

This design system uses a three-role typographic hierarchy tuned for financial dashboards. **Wix Madefor Display** brings crisp geometric clarity to page titles and KPI figures. **Instrument Sans** handles all UI labels, table cells, and body copy with high legibility at compact sizes. **Red Hat Mono** renders Sage ledger account codes, tax IDs, webhook URLs, and timestamps with tabular alignment.

```yaml
typography:
  display-lg:
    fontFamily: "Wix Madefor Display"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 44px
    letterSpacing: -0.5px
  display-lg-mobile:
    fontFamily: "Wix Madefor Display"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 34px
    letterSpacing: -0.25px
  headline-lg:
    fontFamily: "Wix Madefor Display"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: -0.25px
  headline-md:
    fontFamily: "Wix Madefor Display"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 26px
    letterSpacing: -0.15px
  title-md:
    fontFamily: "Instrument Sans"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 22px
    letterSpacing: 0px
  body-md:
    fontFamily: "Instrument Sans"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  body-sm:
    fontFamily: "Instrument Sans"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: 0px
  label-lg:
    fontFamily: "Instrument Sans"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 18px
    letterSpacing: 0px
  label-sm:
    fontFamily: "Instrument Sans"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.3px
  mono-md:
    fontFamily: "Red Hat Mono"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 18px
    letterSpacing: 0px
  mono-sm:
    fontFamily: "Red Hat Mono"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0px
```

## Layout & Spacing

The application uses a persistent collapsible sidebar shell (`240px` expanded, `68px` collapsed) paired with a fluid main content area capped at `1280px` max-width. A strict `4px` base unit drives all spacing: `12px`–`16px` inside cards and table cells, and `24px` between major dashboard sections. On mobile viewports (`<768px`), the sidebar collapses into a slide-over drawer, metric cards stack in a single column, and data tables scroll horizontally within their container.

```yaml
spacing:
  gutter-xs: 4px
  gutter-sm: 8px
  gutter-md: 12px
  gutter-lg: 16px
  gutter-xl: 24px
  section: 32px
  page-margin: 24px
```

## Elevation & Depth

Hierarchy relies on **low-contrast hairline outlines** (`1px` `outline-variant` borders) and subtle tonal surface stepping (`surface` `#F8FAFC` behind `surface-container-lowest` `#FFFFFF` cards). Shadows are avoided on resting cards and reserved strictly for floating overlays such as edit drawers, dropdown menus, and confirmation dialogs (`0 4px 16px rgba(15, 23, 42, 0.08)`).

## Shapes

Corners are crisp and understated to match enterprise financial tooling. Cards and drawers use `8px` (`DEFAULT`), inputs, buttons, and table wrappers use `6px` (`sm`), and status badges or pills use `full` (`9999px`) or `sm` (`6px`).

```yaml
rounded:
  xs: 4px
  sm: 6px
  DEFAULT: 8px
  md: 12px
  lg: 16px
  full: 9999px
```

## Motion & Micro-interaction

Interactions are crisp, fast, and restrained. Hover and focus transitions on buttons, table rows, and toggles settle in `120ms`. Expanding error rows and sliding edit drawers use a smooth decelerating curve over `200ms`. Only `transform`, `opacity`, and color properties are animated; nothing bounces or loops decoratively, except the live connection pulse indicator which signifies active sync health.

```yaml
motion:
  state-change:
    duration: 120ms
    delay: 0ms
    timingFunction: ease-out
  surface-enter:
    duration: 200ms
    delay: 0ms
    timingFunction: cubic-bezier(0.2, 0, 0, 1)
  surface-exit:
    duration: 150ms
    delay: 0ms
    timingFunction: cubic-bezier(0.3, 0, 1, 1)
```

## Voice & Content Strategy

Copy is concise, factual, and written for accounting teams. Use sentence case for headings, labels, and table headers. Action buttons use direct verb phrases (`Sync Now`, `Test Connection`, `Save Mapping`, `Retry Sync`). Error messages state the exact Sage API or validation reason (e.g., `Tax code mismatch: Buki VAT-20 not found in Sage ledger`) alongside a clear recovery action. All counts, timestamps, and ledger codes use `tabular-nums` or monospace styling.

## Components

Component implementations live as individual HTML sticker sheet files in
`components/`. Each file contains the canonical, styled HTML components with
`<!-- COMPONENT: name -->` comment markers. Read each file before use.

- **Badge** → `@components/badge.html` — `badge-numeric`, `badge-dot`
- **Button** → `@components/button.html` — `button-primary`, `button-icon`, `button-with-icon`
- **Card** → `@components/card.html` — `card-elevated`, `card-action`, `card-interactive`, `card-interactive-2`
- **Input Field** → `@components/input-field.html` — `input-field-text`, `input-field-icon`
- **Table** → `@components/table.html` — `table-standard`, `table-interactive`, `table-selectable`
- **Toggle** → `@components/toggle.html` — `toggle-standard`, `toggle-label`, `toggle-description`
