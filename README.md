# Aurora Analytics Sales Platform

Modern marketing site and API backend that powers Aurora Analytics’ commercial sales funnel. The project ships as a Node.js application that serves the static landing experience, captures leads through hardened REST endpoints, and persists submissions to disk so deployments start production-ready.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture at a Glance](#architecture-at-a-glance)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [Runtime Configuration](#runtime-configuration)
6. [Operational Scripts](#operational-scripts)
7. [Frontend Guide](#frontend-guide)
8. [API Reference](#api-reference)
9. [Quality & Testing](#quality--testing)
10. [Deployment Runbook](#deployment-runbook)
11. [Observability & Support](#observability--support)
12. [Maintenance Backlog](#maintenance-backlog)
13. [Further Reading](#further-reading)

---

## Overview

Aurora Analytics enables revenue teams to forecast with confidence. This repository contains:

- A conversion-first landing experience built for accessibility, SEO, and responsiveness.
- An Express.js backend that accepts contact/newsletter submissions, enforces validation, and persists leads to disk.
- A testing suite, documentation set, and operational runbooks that let new maintainers deploy confidently.

## Architecture at a Glance

```
┌────────────┐     submit via Fetch      ┌───────────────┐
│  Browser   │ ───────────────────────▶ │ Express API    │
│  (public/) │                          │ (server/)      │
└────────────┘ ◀────── hydrated UI ─────┴───────┬────────┘
     ▲   │         static assets served                │
     │   │                                             ▼
     │   └────────────── Service worker free ─────────┐
     │                                                │ queued writes
     │                                       ┌────────▼────────┐
     └───── Progressive enhancement ──────── │  Lead Store      │
                                             │ (data/leads.json)│
                                             └──────────────────┘
```

Key traits:

- **Separation of concerns:** Static assets live in `public/`; the backend simply serves them and exposes JSON APIs.
- **Security first:** Helmet, HPP, compression, rate limiting, and honeypot validation protect the lead capture endpoints.
- **Offline resilience:** Client-side controllers surface network failures gracefully and retry-friendly messaging.
- **Documentation trail:** `docs/` contains in-depth continuity and improvement prompts that keep iterations aligned.

## Prerequisites

| Tool | Minimum Version | Notes |
| --- | --- | --- |
| Node.js | 18.x LTS | Server uses native fetch and `AbortController`. |
| npm | 9.x | Required for dependency management and scripts. |
| Git | Any modern version | Needed for source control and deployment pipelines. |

> **Sandbox warning:** The automated evaluation environment blocks outbound npm traffic, so `npm install` may return `403 Forbidden`. Run dependency installation from a machine with registry access when validating locally.

## Quick Start

```bash
git clone <repo-url>
cd Philosophy-Website-codex-
npm install
cp .env.example .env
npm run dev
```

Visit <http://localhost:3000> to preview the marketing site. The `dev` script runs Nodemon so server changes hot reload.

## Runtime Configuration

All environment variables live in `.env.example`. Copy it to `.env` and override as needed.

| Variable | Default | Description |
| --- | --- | --- |
| `NODE_ENV` | `development` | Controls Express environment and logging verbosity. |
| `PORT` | `3000` | Port where the server listens. |
| `APP_NAME` | `Aurora Analytics` | Echoed in health responses and logs. |
| `APP_VERSION` | `1.0.0` | Health endpoint semantic version. |
| `CORS_ORIGIN` | _unset_ | Comma-separated list of allowed origins. Omit or `*` to allow all. |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window in milliseconds. |
| `RATE_LIMIT_MAX` | `60` | Maximum requests per window per IP. |
| `LEAD_STORE_PATH` | `./data/leads.json` | Disk location for persisted leads. Ensure it is writable. |
| `STATIC_CACHE_SECONDS` | `3600` | Cache headers for static assets (HTML always served uncached). |
| `TRUST_PROXY` | `false` | Set `true` when running behind a proxy/load balancer so rate limiting sees real IPs. |

Configuration updates must be reflected in `.env.example`, this README, and `docs/CONTINUITY_GUIDE.md` to keep environments aligned.

## Operational Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Express server with Nodemon and watch mode. |
| `npm start` | Launch the production server using `node server/index.js`. |
| `npm test` | Run Jest + Supertest suites against the API. |
| `npm run lint:html` | (Manual) Run `npx --yes htmlhint public/index.html` once npm registry access is available. |

## Frontend Guide

- **HTML (`public/index.html`):** Semantic sectioning organizes hero, product narrative, features, social proof, pricing, FAQ, and dual lead forms. Skip links and ARIA relationships ensure accessible navigation.
- **CSS (`public/style.css`):** Uses cascade layers (`reset`, `base`, `layout`, `components`, `utilities`) plus CSS custom properties for themes, spacing, and typography. Includes dark-mode overrides, responsive grids, and reduced-motion safeguards.
- **JavaScript (`public/script.js`):** Bootstraps controllers for theme toggling, mobile navigation, FAQ accordion logic, and form validation/submission. The API client wraps `fetch` with timeouts, offline detection, and server error parsing.

Follow progressive enhancement principles: forms still submit when JavaScript is disabled, and controllers bail gracefully if DOM hooks are missing.

## API Reference

All endpoints are prefixed with `/api`. Requests and responses are JSON.

### `GET /api/health`
- **Purpose:** Monitoring and readiness checks.
- **Response:** `{ status, uptime, environment, app: { name, version } }`
- **Status Codes:** `200` on success.

### `POST /api/contact`
- **Payload:** `{ name, email, company, message, website }` (`website` is the honeypot and must stay empty).
- **Success Response:** `201` with `{ id, receivedAt }`.
- **Errors:** `422` with `{ errors: { field: [messages] } }` for validation/honeypot failures, `429` for rate limiting.

### `POST /api/newsletter`
- **Payload:** `{ email, website }` (`website` honeypot field).
- **Success Response:** `201` with `{ id, receivedAt }`.
- **Errors:** Same structure as contact endpoint.

Responses always include normalized error messages for easy client handling. See `server/tests/api.test.js` for canonical examples.

## Quality & Testing

1. Install dependencies: `npm install`
2. Run API tests: `npm test`
3. Lint HTML (optional in restricted environments): `npx --yes htmlhint public/index.html`

The Jest suite spins up the Express app with an isolated temporary lead store per test file. Add new tests alongside features to preserve regression coverage.

## Deployment Runbook

1. **Build confidence:** Run automated tests locally. Manually submit each form in a staging environment to verify lead persistence.
2. **Provision infrastructure:**
   - Node.js 18 runtime (container, VM, or serverless function).
   - Writable volume for `LEAD_STORE_PATH` (or override to a managed storage path).
   - Reverse proxy or load balancer with TLS termination.
3. **Configure environment:** Export variables from the [Runtime Configuration](#runtime-configuration) table.
4. **Deploy:** Use `npm start` or a process manager (PM2, systemd) for long-lived instances. Enable health checks against `/api/health`.
5. **Post-deploy verification:**
   - Confirm health endpoint returns `status: "ok"`.
   - Submit smoke tests for contact/newsletter forms.
   - Review logs for Helmet/honeypot/rate-limit warnings.

If migrating to a managed datastore, update `server/services/leadStore.js` to integrate with the provider and adjust tests accordingly.

## Observability & Support

- **Logging:** Morgan outputs combined logs in development. Extend with structured logging (e.g., pino) before production if centralized logging is required.
- **Metrics:** `/api/health` reports uptime and version. Add platform-specific probes (Datadog, New Relic) as part of your deployment pipeline.
- **Alerts:** Set up monitors for sustained 422 spikes (potential bot/spam traffic) and 429 responses (rate limit tuning).
- **Data management:** Lead files accumulate in `data/`. Rotate or archive regularly, or integrate with a CRM to avoid local storage growth.

## Maintenance Backlog

- Replace the disk-backed store with a proper CRM or database connector (HubSpot, Salesforce, Supabase, etc.).
- Automate Lighthouse accessibility/performance checks and enforce budgets in CI.
- Internationalize copy and pricing once expanding beyond English-speaking markets.
- Swap emoji icons with SVGs for consistent rendering and screen-reader labeling.
- Expand automated coverage with front-end smoke tests (Playwright/Cypress) once infrastructure allows.

## Further Reading

- [`docs/CONTINUITY_GUIDE.md`](docs/CONTINUITY_GUIDE.md) – Detailed architecture deep-dive and backlog.
- [`docs/IMPROVEMENT_PROMPT.md`](docs/IMPROVEMENT_PROMPT.md) – Ready-to-use prompt for the next improvement cycle.
- [`CHANGELOG.md`](CHANGELOG.md) – Repository history and prior iterations.

Contributions and follow-on sessions must update the changelog and continuity guide with any structural changes or deployment learnings.
