# Continuity Guide

This document captures the current state of the Aurora Analytics sales site so that future sessions can resume quickly with full context.

## Project Snapshot
- **Purpose:** High-converting marketing site that positions Aurora Analytics as an AI-powered revenue intelligence platform and funnels visitors toward demos or pricing exploration.
- **Primary conversion paths:** "Book a demo" and "See pricing" CTAs appear in the hero, persistent header, pricing table, and contact form to maintain focus on trials and enterprise outreach.
- **Audience promises:** Accelerated sales cycles, pipeline growth, onboarding ease, and revenue forecasting confidence communicated through stats, testimonials, and feature narratives.

## File Inventory
- `index.html` houses the complete landing flow (hero, product narrative, feature grid, metrics, testimonials, pricing tiers, FAQ accordion, contact form, newsletter signup, and footer utilities). Semantic headings and aria hooks already exist for accessibility and deep-linking between nav and sections.
- `style.css` layers styling by responsibility (`@layer reset`, `base`, `layout`, `components`, `utilities`) and defines CSS custom properties for typography, color themes, spacing, radii, and motion. Responsive grids, flex utilities, and dark-mode overrides ship out of the box.
- `script.js` exports modular controllers: `ThemeController` syncs light/dark mode with system preference and persistence, `MobileNavController` manages the off-canvas mobile navigation lifecycle, `FAQAccordion` handles disclosure toggles, and `FormEnhancer` adds lightweight validation/UX upgrades to the contact form and newsletter capture. A bootstrapping `AuroraApp` wires the controllers and maintains footer year freshness.

## Experience Architecture
1. **Navigation & Hero** – Sticky header with toggleable mobile menu, skip-link for keyboard users, and hero with gradient media panel, social proof avatars, and dual CTA stack.
2. **Product Story** – Split-layout highlight card enumerates included capabilities beside copy-driven value props.
3. **Feature & Proof Layers** – Feature tiles, stat cards, testimonial grid, and marquee customer logos reinforce credibility.
4. **Conversion Stack** – Pricing section with comparison table, FAQ accordion for objection handling, and contact/newsletter forms for lead capture.
5. **Footer** – Resource links, policy references, and auto-updating copyright notice.

## Styling System Notes
- Theme tokens cover grayscale ramps, brand gradients, and focus states; dark theme overrides swap surfaces/typography while keeping contrast ratios compliant.
- Layout layer centralizes `.container`, responsive grid utilities, and breakpoint tokens (notably 900px desktop breakpoint to match `MobileNavController`).
- Component layer contains encapsulated rules for navigation, hero dashboard mock, cards, pricing table, accordions, and forms. Utility layer exposes helpers for visually-hidden text, gradient text, and responsive spacing overrides.
- Reduced-motion media query limits transforms for users who prefer lower animation intensity.

## JavaScript Behavior Notes
- Controllers guard against missing DOM hooks and degrade gracefully if selectors fail, keeping the experience resilient for partial renders.
- Theme preference persists via `localStorage` but falls back safely when storage is unavailable, logging warnings without breaking interactions.
- Mobile navigation closes automatically on escape press, viewport upsizing past desktop breakpoint, or nav link activation to prevent focus traps.
- FAQ accordion toggles aria-expanded/hidden states and ensures only one answer is open at a time for clarity.
- Form enhancer validates required fields, email formatting, and opt-in states while exposing inline feedback messages and focus management after submission.

## Tooling & Testing
- HTMLHint is the designated linting tool (`npx --yes htmlhint index.html`). Recent runs failed due to npm registry restrictions in the execution environment; retry in a networked shell before deployment.
- No build tooling is required; site ships as static assets. Local preview works via any static server (e.g., `npx serve` or VS Code Live Server).

## Backlog & Next Steps
- **Content polish:** Replace placeholder stats/testimonials with verified customer proof before launch.
- **Asset optimization:** Swap inline emoji icons with accessible SVG assets, and deliver optimized hero illustration or animation.
- **Analytics & integrations:** Embed consent-aware analytics (e.g., Plausible) and wire forms to a CRM or marketing automation endpoint.
- **Performance budget:** Add automated Lighthouse checks and bundle-size monitoring, especially if future assets expand.
- **Localization readiness:** Abstract copy into a translation-friendly structure if multi-language support is anticipated.

## Session Ledger
- Latest comprehensive refactor delivered semantic markup, layered styling, and modular scripts for the Aurora Analytics commercial landing page.
- Current task produced this continuity guide plus a repository changelog (see `CHANGELOG.md`) to document history across sessions.
- Pending work should update both documents with any subsequent structural or behavioral changes so future contributors inherit accurate context.
