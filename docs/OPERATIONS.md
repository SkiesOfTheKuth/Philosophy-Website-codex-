# Aurora Analytics Operations Runbook

## Service Management

| Task | Command | Notes |
| --- | --- | --- |
| Start (prod) | `LOG_LEVEL=info NODE_ENV=production npm start` | Ensure `.env` is populated and writable volume mounted. |
| Start (dev) | `npm run dev` | Nodemon reloads on file changes; logs at `debug`. |
| Stop | `Ctrl+C` or send `SIGTERM` | Graceful shutdown implemented in `server/index.js`; allow up to 10s for in-flight requests. |

## Health & Diagnostics

1. **Health Endpoint:** `curl -s http://localhost:3000/api/health | jq` – verify `status: ok`, `dependencies.*.available`, and storage location.
2. **Logs:** Structured JSON written to stdout. Pipe to file or aggregator (e.g., `node server/index.js | pino-pretty`).
3. **Dependency Warnings:** If `dependencies.*.available` is `false`, run `npm ci` to install missing middleware (compression, rate limiting, HPP).

## Incident Playbooks

### Rate Limiting Disabled
- **Symptom:** Health endpoint shows `dependencies.rateLimit.available=false` or logs warn about missing module.
- **Action:** `npm ci`, restart service. If running in restricted environment, enforce limits at ingress proxy (NGINX/Cloudflare).

### Lead Persistence Errors
- **Symptom:** 500 errors on form submissions or logs with `LeadStore` write failures.
- **Action:** Check disk permissions on `LEAD_STORE_PATH`. Ensure volume exists and has free space. Run `node -e "require('./server/services/leadStore');"` to verify access.
- **Recovery:** If file corrupt, restore from backup or truncate file to `{ "contacts": [], "newsletterSubscribers": [] }` after copying aside.

### Unexpected Shutdown
- **Symptom:** Process exits due to uncaught exception.
- **Action:** Inspect recent log lines for `level=error`. Reproduce via `npm test` locally. If due to dependency missing, install and redeploy.

## Deployment Checklist

1. Run `npm test` locally.
2. Confirm `.env` matches `.env.example` and secrets stored in secret manager.
3. Deploy using CI/CD pipeline or manual `npm start` behind process manager (PM2/systemd).
4. Verify `/api/health` and submit test contact/newsletter forms.
5. Rotate application logs and back up `data/leads.json` nightly.

