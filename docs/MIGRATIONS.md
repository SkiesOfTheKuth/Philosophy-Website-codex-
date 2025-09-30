# Migration Playbook

Use this template for schema or infrastructure changes. Copy sections into PR description and link to this file.

## Overview
- **Change Owner:**
- **Summary:** What data/store is changing and why.
- **Impact Radius:** Systems, customers, and teams touched.

## Pre-Migration Checklist
- [ ] Create backup of `data/leads.json` (or target database snapshot).
- [ ] Announce maintenance window to stakeholders.
- [ ] Validate new schema locally with `npm test` and sample data.
- [ ] Prepare rollback script (e.g., restore backup, revert config).

## Execution Steps
1. Deploy code behind feature flag or maintenance mode.
2. Apply schema/data change (SQL migration, file transformation, etc.).
3. Run smoke test: submit contact + newsletter form.
4. Monitor `/api/health` and logs for anomalies.

## Validation
- Query record counts before/after and compare.
- Manually review random sample of records for accuracy.
- Confirm background jobs/processes still operate.

## Rollback Plan
- Restore latest backup.
- Revert deployment to previous release.
- Clear caches and restart service.
- Post-mortem within 24h capturing root cause and prevention.

