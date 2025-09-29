# Changelog

All notable changes to this project will be documented in this file. This log follows reverse chronological order.

## [Unreleased]
- No pending changes have been merged yet.

## [2025-09-29] Documentation overhaul
- Rebuilt the README with architecture diagrams, configuration tables, API reference, deployment runbook, and operational guidance for maintainers.
- Expanded the continuity guide into a comprehensive playbook covering repository layout, architecture flows, testing standards, and prioritized backlog.
- Refreshed the staged improvement prompt to emphasize SMART goal setting, vertical slice delivery, and explicit hardening/knowledge transfer steps.

## [2025-09-28] Iteration planning prompt
- Authored `docs/IMPROVEMENT_PROMPT.md`, a reusable staged prompt that guides future sessions through discovery, planning, implementation, hardening, and documentation cycles.
- Linked the prompt inside the continuity guide so maintainers know where to start when launching major improvement efforts.

## [2025-09-27] Production hardening
- Introduced configuration loading with environment overrides, rate limiting, security middleware, and disk-backed lead storage to prepare the Express API for deployment.
- Extended the health endpoint, added honeypot validation, and refreshed the automated API tests to cover spam protection and service metadata.
- Enhanced the sales site with SEO metadata, JSON-LD schema, resilient API client timeouts, offline-aware messaging, and hidden bot-trap fields for both forms.
- Documented runtime expectations with a committed `.env.example`, ignored persisted lead data, and created a data directory scaffold for production builds.

## [2025-09-26] Full-stack enablement
- Introduced an Express backend with hardened middleware, health endpoint, and REST APIs for contact and newsletter capture.
- Wired the marketing forms to the new API via a shared client, surfacing server validation feedback and success messaging inline.
- Added automated Jest + Supertest coverage for critical endpoints and documented the new architecture within the continuity guide.

## [2025-09-25] Documentation and continuity scaffolding
- Added `docs/CONTINUITY_GUIDE.md` to capture architecture, tooling, and backlog context for future sessions.
- Established this changelog to track repository evolution alongside planned follow-up work.

## [2025-09-25] Aurora Analytics landing rebuild
- Replaced the legacy page with a full Aurora Analytics sales experience spanning hero, product overview, feature grid, stats, testimonials, pricing, FAQ, and contact capture funnels.
- Introduced layered design tokens, responsive layouts, and dark-mode aware components to modernize the visual system.
- Modularized client-side behavior with controllers that manage theming, mobile navigation, FAQ accordion state, and form enhancements with persistence safeguards.
