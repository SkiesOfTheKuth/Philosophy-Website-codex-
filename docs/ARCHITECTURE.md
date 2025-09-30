# Aurora Analytics Architecture

## System Overview

```
┌────────────┐        HTTPS         ┌────────────────────┐
│  Browser   │ ───────────────────▶ │  Express Edge Tier │
│  public/   │ ◀─────────────────── │  server/app.js     │
└────────────┘   static + JSON     └─────────┬──────────┘
                                              │
                                              │ async writes
                                              ▼
                                   ┌────────────────────────┐
                                   │ Lead Persistence Layer │
                                   │ server/services/*      │
                                   └──────────┬─────────────┘
                                              │ file I/O
                                              ▼
                                   ┌────────────────────────┐
                                   │ data/leads.json (fs)   │
                                   └────────────────────────┘
```

### Module Boundaries

| Layer | Responsibilities | Key Modules |
| --- | --- | --- |
| Presentation | Static marketing experience, progressive enhancement controllers, accessibility affordances. | `public/index.html`, `public/style.css`, `public/script.js` |
| Edge/API | HTTP security headers, rate limiting, validation, routing, request logging, dependency health reporting. | `server/app.js`, `server/routes/*`, `server/utils/logger.js`, `server/utils/optionalModule.js` |
| Domain | Lead orchestration, deduplicated persistence, business validation, async write queue. | `server/services/leadService.js`, `server/services/leadStore.js`, `server/validation/*` |
| Infrastructure | Configuration normalization, process lifecycle, environment bootstrap. | `server/config/index.js`, `server/index.js`, `.env.example` |

### Data Contracts

- **Contact Requests:** `{ id, receivedAt, name, email, company, message }`
- **Newsletter Subscriptions:** `{ id, receivedAt, email }`
- **Health Endpoint:** `status`, `service`, `version`, `environment`, `uptime`, `timestamp`, `dependencies`, `storage`.

All contracts are enforced by Zod schemas in `server/validation/schemas.js` and integration tests in `server/tests/api.test.js`.

### Deployment Topology

- Single Node.js process serves static assets and API.
- Static assets cached aggressively except `index.html` (no-store).
- File-based store lives on persistent volume; swap with managed DB by replacing `LeadStore` implementation.
- Optional dependencies (compression, HPP, rate limiting) auto-detect availability so constrained environments can still run tests; production environments must install via `npm ci`.

### Quality Gates

- API integration tests (`npm test`).
- HTML linting via `npx htmlhint public/index.html` when registry access is available.
- CI workflow (`.github/workflows/ci.yml`) enforces tests on each PR.

