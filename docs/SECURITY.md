# Security Guide

## Reporting Vulnerabilities

- Email: security@auroraan.ai (placeholder – update with real inbox).
- Include reproduction steps, impacted endpoints, and any data exposure evidence.
- Expect acknowledgment within 2 business days and remediation ETA within 5.

## Defensive Posture

| Control | Implementation |
| --- | --- |
| TLS | Terminate at CDN or reverse proxy; enforce HTTPS redirect upstream. |
| HTTP Hardening | Helmet (CSP disabled for now), HPP, optional compression, optional rate limiting. |
| Input Validation | Zod schemas in `server/validation/schemas.js`, honeypot field rejects bots. |
| Logging | Structured JSON logger in `server/utils/logger.js`; redact PII before external aggregation. |
| Secrets | Store `.env` values in secret manager (AWS SSM, GCP Secret Manager). Never commit `.env`. |

## Data Privacy & Retention

- **Data Collected:** Name, email, company, message for contacts; email for newsletter.
- **Consent:** Add checkbox text in forms referencing privacy policy; default to unchecked.
- **Retention:** Purge contact records older than 18 months unless converted; maintain newsletter opt-outs per CAN-SPAM/GDPR.
- **Access Controls:** Limit file access to application user/service account. When migrating to database, enforce row-level RBAC.

## Operational Security Tasks

- Rotate secrets (API keys, SMTP credentials) every 90 days.
- Review logs weekly for rate limit bypass attempts or honeypot hits.
- Perform dependency vulnerability scans (`npm audit --production`) monthly.
- Enable Web Application Firewall rules for bots and injection attacks when fronted by CDN.

