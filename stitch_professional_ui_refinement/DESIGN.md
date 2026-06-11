---
name: Industrial Syntax
colors:
  surface: '#0f1417'
  surface-dim: '#0f1417'
  surface-bright: '#343a3d'
  surface-container-lowest: '#090f12'
  surface-container-low: '#171c1f'
  surface-container: '#1B1F24'
  surface-container-high: '#252b2e'
  surface-container-highest: '#303638'
  on-surface: '#dee3e7'
  on-surface-variant: '#bcc8cf'
  inverse-surface: '#dee3e7'
  inverse-on-surface: '#2c3134'
  outline: '#879399'
  outline-variant: '#3d484e'
  surface-tint: '#5cd4ff'
  primary: '#5cd4ff'
  on-primary: '#003545'
  primary-container: '#00add8'
  on-primary-container: '#003c4d'
  inverse-primary: '#006782'
  secondary: '#ffb870'
  on-secondary: '#4a2800'
  secondary-container: '#e18501'
  on-secondary-container: '#4d2b00'
  tertiary: '#ffb873'
  on-tertiary: '#4a2800'
  tertiary-container: '#e18c2d'
  on-tertiary-container: '#532d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#baeaff'
  primary-fixed-dim: '#5cd4ff'
  on-primary-fixed: '#001f29'
  on-primary-fixed-variant: '#004d62'
  secondary-fixed: '#ffdcbe'
  secondary-fixed-dim: '#ffb870'
  on-secondary-fixed: '#2c1600'
  on-secondary-fixed-variant: '#693c00'
  tertiary-fixed: '#ffdcbf'
  tertiary-fixed-dim: '#ffb873'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6a3b00'
  background: '#0f1417'
  on-background: '#dee3e7'
  surface-variant: '#303638'
  surface-deep: '#0A0C10'
  surface-base: '#111418'
  border-subtle: '#2D333B'
  text-muted: '#8B949E'
  java-orange: '#F89820'
  go-blue: '#00ADD8'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1200px
---

## Brand & Style

The brand personality is **authoritative, pragmatic, and highly technical**. It positions itself as a specialized conversion engine for professional developers, moving away from soft, rounded consumer SaaS aesthetics toward a look defined by **Industrial Precision**.

The design style is **Modern Industrial Minimalism**. It utilizes a dark, high-contrast environment to reduce eye strain during long technical reading sessions. The aesthetic is characterized by sharp edges, distinct modular sections, and a "mechanical" feel that mirrors the efficiency of the Go language. 

**Visual Principles:**
- **Modular Containment:** Content is housed in clearly defined cards with crisp borders rather than floating in space.
- **Precision Spacing:** Generous tracking in headings and strict alignment to a geometric grid.
- **Functional Decoration:** Use of mono-spaced accents and subtle hairlines to evoke the feeling of an IDE or a high-end technical manual.

## Colors

The palette is anchored in a **Deep Slate and Charcoal** spectrum to create a stable, professional dark mode environment. Unlike generic dark modes, this system uses low-vibrancy neutrals for the UI to allow syntax-critical colors to stand out.

- **Primary (Go Blue):** Used for Go-specific progress, successful state transitions, and primary interactive signals.
- **Secondary (Java Orange):** Used for Java-side references, legacy state markers, and comparative highlights.
- **Neutral Tier:** The background is a near-black `#0A0C10`, while containers use a slightly elevated `#1B1F24` to create depth without relying on shadows.
- **Syntax Highlighting:** Colors should be desaturated to ensure they don't overwhelm the text but remain distinct enough for instant pattern recognition in code comparisons.

## Typography

The typography system prioritizes legibility and technical rigor. **Inter** provides a neutral, highly readable base for Simplified Chinese and English text, while **JetBrains Mono** is utilized for technical labels, shortcuts, and all code-related content.

**Key Conventions:**
- **Hierarchy:** Large display headings use tighter letter spacing and heavy weights to command attention. 
- **Tracking:** Headings and labels use expanded tracking (letter spacing) to enhance the "Industrial" feel.
- **Mono Integration:** Monospaced fonts are not just for code blocks; use them for "Metadata" (e.g., Chapter numbers, keyboard shortcuts like ⌘K).
- **Line Height:** Body text maintains a generous 1.6x line height to prevent fatigue during long-form documentation reading.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop to ensure that side-by-side code comparisons maintain a predictable width and don't become excessively long on ultra-wide monitors.

- **Grid:** A 12-column grid with a 24px gutter.
- **Modules:** Content is organized into "Modules" (Cards). In comparative views, these modules should split 50/50, or use a 40/60 ratio when Java context is lighter than the Go explanation.
- **Responsive Behavior:** 
    - **Desktop:** Max-width container of 1200px, centered.
    - **Tablet:** 8-column grid, margins reduce to 32px.
    - **Mobile:** 4-column grid. Side-by-side comparisons reflow to a vertical "Java (Top) -> Go (Bottom)" stack.
- **Spacing Rhythm:** All margins and paddings are multiples of 4px, emphasizing a structured, mathematical layout.

## Elevation & Depth

This system rejects soft ambient shadows in favor of **Tonal Layering and Sharp Outlines**. 

- **Surface Tiers:** 
    - `Level 0 (Background)`: The deepest slate.
    - `Level 1 (Card/Section)`: A slightly lighter grey to define the content area.
    - `Level 2 (Interactive/Overlay)`: The lightest grey, reserved for tooltips and search modals.
- **Borders:** Instead of shadows, use 1px solid borders (`#2D333B`) to define card boundaries. 
- **Active State:** Use a 1px border of the Primary (Go Blue) color to indicate focus or active selection, rather than a glow or lift effect.
- **Glassmorphism:** Reserved exclusively for the Top Navigation Bar, using a subtle backdrop blur (12px) to provide context of the content scrolling beneath it.

## Shapes

The shape language is **Strict and Geometric**. Roundedness is kept to a minimum (4px) to reinforce the "Industrial Precision" theme.

- **Buttons & Inputs:** Use the `soft` (0.25rem/4px) radius.
- **Content Cards:** Also use the `soft` radius. 
- **Tags/Chips:** May use a slightly higher radius (8px) but never full pills, as full pills feel too "organic" for this aesthetic.
- **Iconography:** Use square-capped strokes rather than rounded terminals to match the font and shape language.

## Components

### Cards & Modules
Cards are the primary container. They feature a 1px border (`#2D333B`), no shadow, and a subtle background fill. The header of a card should often include a `label-caps` mono-spaced tag to indicate the category (e.g., "STRUCTS", "CONCURRENCY").

### Comparison Split-Pane
The core component of the platform. A horizontal container divided by a vertical hairline. The left side (Java) features a subtle orange top-border-accent; the right side (Go) features a blue top-border-accent.

### Buttons
- **Primary:** Solid Go Blue fill, sharp corners, white text.
- **Secondary:** Transparent with a 1px border, monochrome text.
- **Code Action:** Monospaced text with a subtle background hover state.

### Data Visualization
Progress bars should be thin (4px height), using a neutral track and a vibrant Go Blue fill. Avoid rounded ends on the progress bar; keep them square for a more "meter-like" appearance.

### Input Fields (Search)
Integrated into the top nav with a visible keyboard shortcut hint (`⌘K`) in a monospaced font. The input should have a dark background (`Level 0`) to contrast against the navigation surface (`Level 1`).

### Lists
Lists should avoid bullet points. Use horizontal dividers or monospaced index numbers (01, 02, 03) to maintain the technical, ordered aesthetic.