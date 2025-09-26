# Changelog

All notable changes to this project will be documented in this file. This log follows reverse chronological order.

## [Unreleased]
- No pending changes have been merged yet.

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
