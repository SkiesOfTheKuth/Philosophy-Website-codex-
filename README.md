# Aurora Analytics Sales Platform

Modern marketing site and API backend that powers Aurora Analytics’ commercial sales funnel. The project ships as a Node.js application that serves the static landing experience, captures leads through hardened REST endpoints, and persists submissions to disk so deployments start production-ready.

## Features

- **Conversion-focused landing page** with modular sections for product storytelling, feature highlights, testimonials, pricing, FAQ, and dual lead funnels (contact + newsletter).
- **Responsive, theme-aware UI** built with semantic HTML, layered CSS design tokens, dark-mode support, accessible navigation, and reduced-motion fallbacks.
- **Hardened Express backend** featuring Helmet, HPP, compression, rate limiting, optional CORS allow-lists, structured error responses, and a comprehensive health check.
- **Disk-backed lead storage** using a queued JSON store so submissions survive restarts without requiring an external database.
- **Robust form handling** with shared validation, backend-driven feedback, honeypot spam protection, network timeouts, and user-friendly offline messaging.
- **Automated API tests** via Jest and Supertest covering success, validation, spam defenses, and service observability responses.

## Getting Started

```bash
git clone <repo-url>
cd Philosophy-Website-codex-
npm install
cp .env.example .env
npm run dev
```

The `dev` script launches Nodemon for hot reloading. Visit `http://localhost:3000` to view the site locally.

> **Note:** The execution environment used during automated evaluation blocks npm registry access, so `npm install` may fail with `403 Forbidden`. Run the command from a networked machine before deploying.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Express server with Nodemon for local development. |
| `npm start` | Launch the production server (reads configuration from `.env`). |
| `npm test` | Execute Jest + Supertest API tests (uses a temporary on-disk store). |

Run HTML linting with `npx --yes htmlhint public/index.html` once dependencies are installed (HTMLHint may require global/npm installation outside the restricted sandbox).

## Configuration

Environment variables are documented in `.env.example`. Key settings:

- `PORT` – Server port (defaults to `3000`).
- `CORS_ORIGIN` – Comma-separated allow-list or `*` to open the API to all origins.
- `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` – Control API rate limiting.
- `LEAD_STORE_PATH` – Absolute or relative path to the JSON file used for lead persistence (defaults to `./data/leads.json`).
- `STATIC_CACHE_SECONDS` – Cache duration for static assets (HTML is always served uncached).

Update `APP_NAME` / `APP_VERSION` if deploying under a different brand/version; the health endpoint echoes these values for observability.

## Directory Structure

```
public/            Static landing page assets (HTML, CSS, JS)
server/            Express application, routes, validation, persistence
├─ config/         Environment normalization helpers
├─ routes/         REST endpoints for health, contact, newsletter
├─ services/       Lead service + disk-backed store implementation
├─ utils/          Error + async helpers
├─ validation/     Zod schemas and error formatters
└─ tests/          Jest + Supertest suites
data/              Runtime directory for persisted leads (ignored)
docs/              Continuity guide and supporting documentation
```

## Deployment Checklist

- Install dependencies and run `npm test` in a fully networked environment.
- Provide a writable location for `LEAD_STORE_PATH` (default `data/leads.json`). Ensure the process user has read/write permissions.
- Configure `CORS_ORIGIN` to only include trusted domains for the production frontend.
- Frontload TLS termination (or enable `TRUST_PROXY=true` if operating behind a load balancer) so rate limiting works with real client IPs.
- Monitor `/api/health` — it returns status, uptime, version, and environment for infrastructure checks.

## Roadmap

- Swap the JSON lead store with a CRM/marketing automation integration (HubSpot, Salesforce, etc.).
- Add analytics with user consent handling (e.g., Plausible, PostHog).
- Automate accessibility/performance checks (Lighthouse CI) in a future pipeline.
- Localize copy once target regions expand beyond English-speaking markets.

Contributions and follow-on sessions should update `CHANGELOG.md` and `docs/CONTINUITY_GUIDE.md` with any structural changes or deployment learnings.
