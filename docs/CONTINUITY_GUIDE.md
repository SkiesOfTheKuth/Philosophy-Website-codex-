# Continuity Guide

This document captures the current state of the Aurora Analytics sales site so that future sessions can resume quickly with full context.

## Project Snapshot
- **Purpose:** High-converting marketing site that positions Aurora Analytics as an AI-powered revenue intelligence platform and funnels visitors toward demos or pricing exploration.
- **Primary conversion paths:** "Book a demo" and "See pricing" CTAs appear in the hero, persistent header, pricing table, and contact form to maintain focus on trials and enterprise outreach.
- **Audience promises:** Accelerated sales cycles, pipeline growth, onboarding ease, and revenue forecasting confidence communicated through stats, testimonials, and feature narratives.

## File Inventory
- `public/index.html` houses the complete landing flow (hero, product narrative, feature grid, metrics, testimonials, pricing tiers, FAQ accordion, contact form, newsletter signup, and footer utilities). Semantic headings and aria hooks already exist for accessibility and deep-linking between nav and sections.
- `public/style.css` layers styling by responsibility (`@layer reset`, `base`, `layout`, `components`, `utilities`) and defines CSS custom properties for typography, color themes, spacing, radii, and motion. Responsive grids, flex utilities, and dark-mode overrides ship out of the box.
- `public/script.js` exports modular controllers: `ThemeController` syncs light/dark mode with system preference and persistence, `MobileNavController` manages the off-canvas mobile navigation lifecycle, `FAQAccordion` handles disclosure toggles, and dedicated form controllers reuse a shared `FormValidator` and `ApiClient` to handle inline validation plus API submissions. A bootstrapping `AuroraApp` wires the controllers and maintains footer year freshness.
- `server/app.js` builds the Express application with Helmet, HPP, compression, optional CORS allow-lists, rate limiting, environment-driven configuration, API routing, static asset hosting, and centralized error handling.
- `server/routes/` contains REST endpoints for `/api/health`, `/api/contact`, and `/api/newsletter`.
- `server/config/index.js` normalizes environment variables (port, rate limits, static caching, storage paths) for use across the app.
- `server/services/leadService.js` orchestrates lead persistence through the underlying store abstraction.
- `server/services/leadStore.js` persists contacts/newsletter signups to a disk-backed JSON store with basic write-queue coordination.
- `server/validation/` defines the Zod schemas and helpers used to normalize/validate inbound payloads, ensuring consistent API responses for both client-side fetches and progressive-enhancement form posts.
- `package.json` declares the runtime (Express, Helmet, Zod, etc.), testing stack (Jest + Supertest), and npm scripts for development, testing, and production startup.
- `.env.example` documents required configuration for production deploys; `data/.gitkeep` reserves the persistence directory while keeping generated lead files out of version control.
- `docs/IMPROVEMENT_PROMPT.md` provides a staged prompt to guide future upgrade cycles and should be used when kicking off major initiatives.

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
- Contact and newsletter controllers reuse `FormValidator` plus an `ApiClient` wrapper to submit to the Express backend, surface server-side validation errors inline, and provide optimistic feedback when calls succeed.
- API client calls include request timeouts, offline-aware messaging, and rate-limit handling; both forms submit hidden honeypot fields to reduce bot spam while maintaining progressive enhancement for non-JS submissions.

## Backend Overview
- **Framework:** Express 4 hardened with Helmet, HPP, compression, optional CORS allow-lists, JSON/urlencoded body parsing, rate limiting, and combined logging via Morgan.
- **Endpoints:**
  - `POST /api/contact` – Accepts `{ name, email, company, message }`, validates via Zod (including a hidden honeypot), stores the payload through the disk-backed `LeadStore`, and returns a 201 with an identifier/timestamp. Responds with a 422 status and field-level errors when validation fails or spam is detected.
  - `POST /api/newsletter` – Accepts `{ email }` plus the honeypot field, writes new subscribers to persistent storage, and returns structured success/error responses.
  - `GET /api/health` – Returns service metadata (name, version, environment, uptime) for monitoring probes.
- **Static delivery:** Assets in `public/` are served after API routes, with a catch-all handler that returns `index.html` for deep links while ensuring `/api/*` paths consistently emit JSON responses.
- **Error handling:** Central middleware normalizes error payloads. Validation errors surface structured `{ errors: { field: [messages] } }` data; unexpected exceptions log server-side and return a generic 500 response to callers. Rate limits return a JSON error with HTTP 429.
- **Testing:** Jest + Supertest cover happy/validation paths, honeypot spam protection, persistence, and the enhanced health probe (see `server/tests/api.test.js`).

## Tooling & Testing
- Install dependencies with `npm install`.
- Run automated API tests via `npm test` (Jest boots the Express app with a temporary on-disk store per test for realistic persistence coverage).
- Start the full stack in development using `npm run dev` (nodemon) or `npm start` for production-style execution.
- HTMLHint remains the designated HTML linting tool (`npx --yes htmlhint public/index.html`). Recent runs failed due to npm registry restrictions in the execution environment; retry in a networked shell before deployment.
- No front-end build tooling is required; assets ship static from `public/`. Local preview still works via `npm start` (serves both API and static site) or a dedicated static server if you prefer separating responsibilities.

## Backlog & Next Steps
- **Content polish:** Replace placeholder stats/testimonials with verified customer proof before launch.
- **Asset optimization:** Swap inline emoji icons with accessible SVG assets, and deliver optimized hero illustration or animation.
- **Analytics & integrations:** Embed consent-aware analytics (e.g., Plausible) and connect the lead store to a production-grade CRM or marketing automation platform.
- **Performance budget:** Add automated Lighthouse checks and bundle-size monitoring, especially if future assets expand.
- **Localization readiness:** Abstract copy into a translation-friendly structure if multi-language support is anticipated.

## Session Ledger
- Latest comprehensive refactor delivered semantic markup, layered styling, modular scripts, and now a production-ready Express backend powering form submissions for the Aurora Analytics commercial landing page.
- Current task produced this continuity guide plus a repository changelog (see `CHANGELOG.md`) to document history across sessions.
- Pending work should update both documents with any subsequent structural or behavioral changes so future contributors inherit accurate context.
