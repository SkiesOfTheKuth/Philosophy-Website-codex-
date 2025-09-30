# Continuity Guide

This playbook preserves the collective memory of the Aurora Analytics sales platform so future sessions can resume work with confidence. Read it start-to-finish at the beginning of a new iteration.

---

## 1. Project Snapshot

- **Mission:** Deliver a commercial-grade sales experience for Aurora Analytics, an AI-assisted revenue intelligence product. The site must inspire trust, convert visitors into demos, and keep operational rigor high.
- **Current State (2025-09-29):** Production-ready Express backend serving a modular, accessible landing page with dual lead funnels (contact + newsletter). Disk-based lead storage is still in place and flagged for future CRM integration.
- **Primary Conversion Paths:** "Book a demo" and "See pricing" CTAs persist across hero, navigation, pricing, testimonials, and footer. Both forms post to the backend for server-side validation.
- **Audience Promises:** Shorter sales cycles, smarter pipeline forecasts, and effortless onboarding — reinforced through stats, marquee logos, testimonials, and a pricing comparison table.

## 2. Repository Map

```
public/            Static marketing site
├─ index.html      Full landing experience and lead forms
├─ script.js       Controllers for theme, mobile nav, FAQ, and forms
└─ style.css       Layered styles with design tokens and themes
server/            Express application
├─ app.js          App bootstrap, middleware, routing, error handling
├─ index.js        Entry point used by npm scripts
├─ config/         Environment normalization helpers
├─ routes/         `health`, `contact`, and `newsletter` endpoints
├─ services/       Lead domain logic + disk-backed store
├─ validation/     Zod schemas and error formatter utilities
├─ utils/          Async wrapper, HTTP error helpers, optional dependency loader, structured logger
└─ tests/          Jest + Supertest coverage for API behavior
docs/              This guide and the staged improvement prompt
data/              Runtime storage for persisted leads (gitignored)
```

## 3. Architecture Overview

### Frontend flow

1. **Navigation & Hero:** Sticky header with skip-link, theme toggle, and mobile drawer. Hero section features gradient media, social proof avatars, and a dual CTA stack.
2. **Storytelling:** Product narrative, feature grid, stats strip, testimonial carousel, and customer logos build credibility.
3. **Conversion Stack:** Pricing tiers with comparison cards, FAQ accordion (ARIA-linked buttons + panels), newsletter signup, and full contact form with progressive enhancement.
4. **Footer:** Resource links, policy anchors, social icons, and auto-updating copyright.

### Backend flow

1. `server/app.js` configures Express with Helmet, optional compression/HPP/rate limiting (auto-detecting missing modules), body parsing, optional CORS, static delivery, and centralized error handling.
2. `/api/contact` and `/api/newsletter` routes validate payloads using Zod schemas (`server/validation/schemas.js`), reject honeypot submissions, and pass sanitized data to the lead service.
3. `LeadService` queues writes to the disk-backed store (`data/leads.json`). Writes are serialized to avoid race conditions and the directory is ignored from Git.
4. `/api/health` returns uptime, app metadata, environment, and timestamp for monitoring.

### Integration points

- Client-side controllers post JSON payloads via a shared API client with request timeouts and offline detection.
- Forms include hidden honeypot fields (`website`) to deter bots. Backend enforces the same rule.
- Observability includes a structured JSON logger and `/api/health`. Future iterations should add metrics and tracing exporters.

## 4. Experience Design Principles

- **Accessibility:** Semantic headings, labelled controls, aria-expanded/aria-controls patterns, focus outlines, reduced-motion fallbacks, and keyboard navigable mobile menu.
- **Progressive enhancement:** Critical flows remain functional without JavaScript; the backend responds with JSON but can be adapted for classic form posts if needed.
- **Theming:** CSS custom properties define light and dark palettes. `ThemeController` respects system preference, persists selection, and keeps the toggle state in sync.
- **Responsiveness:** Breakpoints favor a single 900px pivot, with flexbox/grid layouts adapting sections. Mobile menu transforms into an off-canvas drawer.

## 5. Operational Runbook

1. **Local setup:** `npm install`, `cp .env.example .env`, then `npm run dev`. Nodemon hot reloads server changes.
2. **Testing:** `npm test` executes Jest + Supertest suites. HTML linting via `npx --yes htmlhint public/index.html` once registry access is available.
3. **Deployment:** Use `npm start` (Node 18). Provide a writable path for `LEAD_STORE_PATH` and configure `TRUST_PROXY=true` behind load balancers.
4. **Monitoring:** Poll `/api/health` for uptime and version. Watch for repeated 422/429 responses which indicate validation or rate-limiting adjustments are needed.
5. **Data hygiene:** Rotate `data/leads.json` or export to a CRM regularly. File growth is the primary operational risk in the current architecture.

## 6. Testing & Quality Bar

- **Automated:** `server/tests/api.test.js` covers happy paths, validation errors, honeypot defenses, and health endpoint metadata.
- **Manual QA checklist:**
  - Toggle dark/light mode and verify persistence across reloads.
  - Resize to mobile (<900px) and ensure navigation drawer, accordions, and forms remain accessible.
  - Submit both forms with valid data, invalid email, and honeypot filled to confirm server responses.
  - Activate reduced-motion OS preference and confirm animations are softened.
- **Linting:** HTMLHint is recommended; CSS/JS linting has not been introduced yet.

## 7. Documentation Expectations

- Update `README.md` whenever deployment steps, architecture, or scripts change.
- Append a dated section to `CHANGELOG.md` summarizing notable work (reverse chronological order).
- Extend this continuity guide with new architecture decisions, testing strategies, and backlog priorities. Keep the backlog ordered by impact.
- Use `docs/IMPROVEMENT_PROMPT.md` to kick off major improvement cycles. Refresh the prompt if process expectations evolve.

## 8. Known Gaps & Opportunities

1. **Persistence:** Migrate from JSON file to managed storage or CRM sync. Introduce migrations/seeding strategy once a database is selected.
2. **Observability:** Layer in request metrics/tracing and analytics with consent management. Consider integrating with Datadog or OpenTelemetry exporters.
3. **Automation:** Stand up CI to run Jest, HTMLHint, and Lighthouse budgets. Sandbox currently blocks npm install, so configure pipelines in an unrestricted environment.
4. **Content polish:** Replace placeholder stats/testimonials with verified data and ensure pricing tiers align with go-to-market strategy.
5. **Internationalization:** Abstract copy for localization if expansion beyond English markets is planned.
6. **Front-end testing:** Add Playwright or Cypress smoke tests for key conversion flows once infrastructure allows headless browsers.

## 9. Backlog Priorities (Next Iteration Targets)

1. **CRM Integration (High):** Replace `LeadStore` with an adapter for HubSpot/Salesforce. Update tests to mock the new client and document API keys in `.env.example`.
2. **Observability Layer (High):** Extend structured logging with Sentry (or similar) and ship metrics (OpenTelemetry + Prometheus). Expose metrics via `/api/health` or a new `/api/status` endpoint.
3. **Accessibility Audit (Medium):** Run Lighthouse/AXE CI, address findings, and document results.
4. **Analytics with Consent (Medium):** Implement a privacy-compliant analytics integration (Plausible or PostHog) with a consent banner.
5. **Marketing Automation (Low):** Add drip campaign hooks after newsletter submissions once CRM integration lands.

## 10. Release & Collaboration Rituals

- **Before coding:** Review this guide and the latest changelog entry. Re-run the staged improvement prompt if embarking on a significant change set.
- **During development:** Keep commits focused, document surprises in the changelog, and capture TODOs/backlog items in section 9.
- **Before handoff:** Update README, changelog, and this guide. Include verification notes (tests run, manual QA) in the PR body.
- **After release:** Monitor `/api/health`, inspect logs for spam/validation anomalies, and schedule backlog grooming.

## 11. Contact Points

- **Product voice:** Maintain the confident, enterprise-ready tone established in the current copy.
- **Design language:** Retain gradient hero treatments, card radii, and spacing scale defined in `public/style.css` to keep brand continuity.
- **Security posture:** Honeypot fields, rate limiting, Helmet/HPP, and validation must never be removed without replacing them with stronger controls.

Keep this guide authoritative. If reality diverges from what’s written here, update the document immediately so future maintainers inherit truth, not tribal knowledge.
