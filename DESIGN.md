---
name: EdTech Clean Minimalist
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006329'
  on-tertiary: '#ffffff'
  tertiary-container: '#007f36'
  on-tertiary-container: '#c7ffca'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Be Vietnam Pro
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  data-metric:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  data-table:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style
The brand personality reflects institutional trust, operational efficiency, modern academic excellence, and cognitive clarity. Tailored for school administrators, educators, students, and parents, the interface eliminates cognitive friction across data-dense administrative workflows. 

The aesthetic adheres strictly to **Clean & Minimal Corporate SaaS**—drawing functional inspiration from refined dashboard utilities (Tailwind/Shadcn ethos). It prioritizes structural predictability, high contrast legibility, tight micro-interactions, and a calm, uncluttered workspace engineered for long continuous usage sessions.

## Colors
The color architecture relies on a controlled, role-specific hierarchy designed for EdTech analytical dashboards:

- **Primary (`#2563eb`, Hover: `#1d4ed8`, Active: `#1e40af`)**: Used selectively for primary call-to-actions, active navigational states, linked record titles, and key progress indicators.
- **Secondary (`#0f172a` - Slate 900)**: Used for primary content headers, critical text hierarchies, and structural chrome framing.
- **Neutral Palette (Slate 50 to Slate 900)**:
  - Surface Canvas: `#f8fafc` (Slate 50)
  - Surface Card / Table Row: `#ffffff`
  - Subtle Borders & Dividers: `#e2e8f0` (Slate 200)
  - Secondary Text / Meta: `#64748b` (Slate 500)
  - Body Text: `#1e293b` (Slate 800)
- **Status & Feedback Signals**:
  - Success (`#16a34a`): Passing grades, verified tuition, completed attendance.
  - Warning (`#ea580c`): Pending documents, probationary thresholds, approaching deadlines.
  - Destructive / Critical (`#dc2626`): Failing academic thresholds (<5.0), unauthorized absences, uncollected dues.

## Typography
The system standardizes on **Be Vietnam Pro** for textual narratives, headings, and student/faculty profiles, ensuring optimal Vietnamese diacritical marks rendering. **Inter** is designated for functional micro-UI, tabular data rows, numeric records, and form labels due to its tall x-height and tabular numeral alignment.

- Use tabular numeric figures (`font-variant-numeric: tabular-nums`) across all gradebooks, financial tables, and attendance percentages.
- Truncate data labels strictly with ellipses rather than wrapping lines within spreadsheet grids.

## Layout & Spacing
The layout follows a fluid-responsive enterprise SaaS model anchored by a fixed left navigation rail (collapsible from 260px to 68px):

- **Grid Architecture**: 12-column layout with 16px (`gutter`) gutters on compact screens, expanding to 24px (`gutter-lg`) on desktop viewports (>1280px).
- **Responsive Adaptations**:
  - **Desktop (≥ 1280px)**: Multi-column KPI metrics (4 cards per row), expanded horizontal action toolbars, and sticky table header ribbons.
  - **Tablet (768px - 1279px)**: 2-column KPI layouts; secondary table columns collapse into expandable drawers or popovers.
  - **Mobile (< 768px)**: Canvas margins drop to 16px; data tables activate horizontal scrolling containers with sticky first columns (Student ID/Name).

## Elevation & Depth
Elevation minimizes skeuomorphic shadows in favor of **Tonal Layers** combined with crisp **Low-Contrast Outlines** (`border: 1px solid #e2e8f0`):

- **Level 0 (Canvas Base)**: `#f8fafc` without borders or shadows.
- **Level 1 (Card & Data Containers)**: `#ffffff` surface, bounded by `1px solid #e2e8f0`, accompanied by a minimal ambient shadow: `box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.04)`.
- **Level 2 (Popovers, Filter Menus, Dropdowns)**: `#ffffff` surface with `1px solid #cbd5e1` and a focused ambient lift: `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Modal Dialogs & Slide-over Drawers)**: High-priority overlays featuring `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`, anchored over a backdrop blur overlay (`rgba(15, 23, 42, 0.4)` with `backdrop-filter: blur(4px)`).

## Shapes
The design adopts a **Soft (Level 1)** geometric standard (0.25rem - 0.5rem base radius) aligned with Shadcn aesthetics:

- **Interactive Inputs & Buttons**: 6px (`0.375rem`) border radius, delivering a clean, modern, and compact business software feel.
- **Cards, Panels & Modal Shells**: 8px (`0.5rem`) outer border radius.
- **Status Badges, Filter Chips & Avatars**: Circular/pill-shaped radii are reserved exclusively for badges (`9999px`) and user identification avatars to distinguish them from actionable form components.

## Components

### Buttons
- **Primary**: Solid background `#2563eb`, text `#ffffff`, hover `#1d4ed8`, active `#1e40af`. 36px standard height (`h-9`), padding `px-4`, font `label-md`.
- **Secondary / Outline**: White background `#ffffff`, border `1px solid #e2e8f0`, text `#0f172a`, hover `#f1f5f9`.
- **Destructive**: Solid `#dc2626` or outline with `#dc2626` text and hover background `#fef2f2`.

### KPI Metric Cards
- White surface, `1px solid #e2e8f0`, inner padding 16px–20px.
- Structure: Top row features muted label (`label-sm`, `#64748b`) paired with a contextual micro-icon; center displays prominent value (`data-metric`, `#0f172a`); bottom indicates positive/negative trend chip (`+4.2%` with `#16a34a` or `-1.5%` with `#dc2626`).

### Excel-like Data Tables
- **Header**: `#f8fafc` background, text `#475569`, uppercase `label-sm`, letter spacing `0.05em`, height 40px, bottom border `1px solid #cbd5e1`.
- **Rows**: Alternating subtle state or clean white rows with `1px solid #f1f5f9` bottom borders; row height 44px (compact) or 52px (standard); hover state `#f8fafc`.
- **Grade Cells**: Color-coded micro-indicators (scores `< 5.0` automatically receive `#fef2f2` background with `#dc2626` bold numeric text; scores `≥ 8.0` tagged with `#f0fdf4` and `#16a34a`).

### Filter Toolbar
- Horizontal flex ribbon grouping search input, class/semester select dropdowns, column visibility toggles, and export triggers.
- Search input equipped with leading magnifier icon, height 36px, clearable button (`x`).

### Chips & Badges
- Compact height (22px), `label-sm`, font-weight 500, padding `px-2.5 py-0.5`.
- Variants:
  - *Active / Present*: `#f0fdf4` background, `#15803d` text.
  - *Late / Pending*: `#fff7ed` background, `#c2410c` text.
  - *Absent / Failed*: `#fef2f2` background, `#b91c1c` text.
  - *Neutral / Grade Tag*: `#f1f5f9` background, `#334155` text.

### Form Inputs & Checkboxes
- **Text Inputs**: Height 36px, border `1px solid #cbd5e1`, placeholder `#94a3b8`, focus ring `2px solid #2563eb` with 0 offset.
- **Checkboxes**: 16px square, radius 4px, border `1px solid #cbd5e1`, checked background `#2563eb` with white checkmark.