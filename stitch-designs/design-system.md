# Obsidian Flow — Design System

**Project:** Swift Freelance Billing  
**Theme:** Equinox  
**Color Mode:** DARK  
**Device:** DESKTOP  

---

## Brand & Style

The design system is engineered for the high-performing freelancer. It prioritizes speed, clarity, and a sense of premium reliability. The aesthetic is rooted in **Minimalism** with a heavy emphasis on structural hierarchy and "dark mode first" utility.

The UI should feel like a precision tool: focused, unobtrusive, and expensive.

---

## Fonts

| Role | Font | Notes |
|------|------|-------|
| Headline | **Geist** | Used for all headings, with negative letter-spacing at large scales |
| Body | **Geist** | Clean, geometric sans-serif |
| Labels | **JetBrains Mono** | Monospaced, used for invoice numbers, monetary values, labels |

## Typography Scale

| Token | Font | Size | Weight | Line Height | Letter Spacing |
|-------|------|------|--------|-------------|----------------|
| display-lg | Geist | 48px | 700 | 56px | -0.02em |
| headline-lg | Geist | 32px | 600 | 40px | -0.01em |
| headline-lg-mobile | Geist | 24px | 600 | 32px | — |
| headline-md | Geist | 24px | 600 | 32px | — |
| body-lg | Geist | 18px | 400 | 28px | — |
| body-md | Geist | 16px | 400 | 24px | — |
| body-sm | Geist | 14px | 400 | 20px | — |
| label-md | JetBrains Mono | 12px | 500 | 16px | 0.05em |
| label-sm | JetBrains Mono | 10px | 500 | 14px | 0.05em |

---

## Color Palette

### Core Colors

| Token | Color | Usage |
|-------|-------|-------|
| background | `#0b1326` | Global background |
| surface | `#0b1326` | Primary surface |
| surface-dim | `#0b1326` | Dimmed surface |
| surface-bright | `#31394d` | Elevated surface |
| surface-container-lowest | `#060e20` | Deepest container |
| surface-container-low | `#131b2e` | Low container |
| surface-container | `#171f33` | Default container |
| surface-container-high | `#222a3d` | Elevated container |
| surface-container-highest | `#2d3449` | Highest container |

### Brand Colors

| Token | Color | Usage |
|-------|-------|-------|
| primary | `#adc6ff` | Primary text/icons |
| primary-container | `#4d8eff` | Primary buttons/containers |
| on-primary | `#002e6a` | Text on primary |
| on-primary-container | `#00285d` | Text on primary container |
| custom (override) | `#3b82f6` | Override primary action color |

### Secondary Colors

| Token | Color |
|-------|-------|
| secondary | `#bcc7de` |
| secondary-container | `#3e495d` |
| on-secondary | `#263143` |

### Tertiary (Accent) Colors

| Token | Color |
|-------|-------|
| tertiary | `#ffb786` |
| tertiary-container | `#df7412` |
| on-tertiary | `#502400` |

### Error Colors

| Token | Color |
|-------|-------|
| error | `#ffb4ab` |
| error-container | `#93000a` |
| on-error | `#690005` |

### Text Colors

| Token | Color | Usage |
|-------|-------|-------|
| on-surface | `#dae2fd` | Primary text |
| on-surface-variant | `#c2c6d6` | Secondary text |
| outline | `#8c909f` | Borders, dividers |
| outline-variant | `#424754` | Subtle borders |

---

## Spacing

| Token | Value |
|-------|-------|
| unit | 4px |
| container-max-width | 1280px |
| gutter | 24px |
| margin-mobile | 16px |
| margin-desktop | 48px |

### Spacing Guidelines
- **Section Spacing:** 80px (20u) or 120px (30u) between major sections
- **Component Padding:** Minimum 24px (6u) internal card padding
- **Visual Rhythm:** Favor generous vertical rhythm over horizontal density

---

## Border Radius

| Token | Value |
|-------|-------|
| sm | 0.25rem (4px) |
| DEFAULT | 0.5rem (8px) |
| md | 0.75rem (12px) |
| lg | 1rem (16px) |
| xl | 1.5rem (24px) |
| full | 9999px |

---

## Elevation & Depth

| Level | Background | Border | Usage |
|-------|-----------|--------|-------|
| Level 0 (Base) | `#0F172A` | — | Global background |
| Level 1 (Cards) | `#1E293B` | 1px solid `#334155` | Cards, sheets |
| Level 2 (Modals) | `#1E293B` | 10% white inner-glow + 20% black shadow | Modals, popovers |

---

## Component Guidelines

### Buttons
- **Primary:** `#3B82F6` background, white text, solid fill, no gradients
- **Secondary:** Ghost style with `#334155` border
- **Radius:** 8px

### Input Fields
- **Background:** `#0F172A` (inset look)
- **Border:** 1px solid
- **Focus:** 2px Electric Blue ring

### Invoice Tables
- **Style:** "No-Border" approach, subtle hover `#1E293B`
- **Monetary values:** JetBrains Mono font

### Status Badges
- **Style:** 10% opacity background tint + solid text
- **Paid:** Emerald (desaturated)
- **Pending:** Amber (desaturated)
- **Overdue:** Rose (desaturated)

### Progress Indicators
- Thin 4px lines for payment bars

---

## Screens

| Screen | Description |
|--------|-------------|
| Landing Page | Hero + features + pricing preview |
| Dashboard | Stats cards, invoice table, sidebar |
| Pricing | Three-tier pricing cards |
| Invoice Creator | Form with line items + live preview |
| History | Invoice history table with filters |
| View Demo | Interactive demo walkthrough |
| Get Started | Onboarding/signup flow |
| Login | Authentication page |
