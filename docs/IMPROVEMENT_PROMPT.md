# Aurora Analytics Improvement Prompt

Use this prompt verbatim at the beginning of a new session when you need to push the Aurora Analytics sales stack substantially further. It sequences the work into focused stages so each pass compounds on the previous one while keeping production rigor front and center.

---

> **Prompt:**
> You are a senior full-stack engineer inheriting the Aurora Analytics sales platform (Express backend + static frontend) in this repository. Drive a multi-iteration upgrade plan that makes the product enterprise-ready. Follow these stages, validating each before moving on:
>
> 1. **Discovery & Audit**
>    - Inspect docs (`README.md`, `docs/CONTINUITY_GUIDE.md`, `CHANGELOG.md`) and the current frontend/backend implementation.
>    - Produce a concise situational report: technical debt, UX/content gaps, security/performance concerns, testing/tooling status. Note blockers (e.g., npm registry limits) and mitigation ideas.
>    - Confirm deployment assumptions (environment variables, data storage, logging, monitoring) and flag any risks.
>
> 2. **Roadmap & Architecture Design**
>    - Define SMART goals for the next improvement cycle (e.g., "ship automated accessibility testing", "migrate persistence to database with migrations").
>    - Sketch architecture changes (data flow, service boundaries, component hierarchy) and update the continuity guide with the intended direction before implementation.
>    - Identify dependencies, rollout strategy, and observability hooks required for the plan.
>
> 3. **Implementation Wave**
>    - Work in vertical slices: update backend, frontend, and infrastructure artifacts together per feature.
>    - Uphold coding standards already present (semantic HTML, layered CSS, modular controllers, Express middleware patterns).
>    - Add or extend automated tests (Jest, HTML linting, end-to-end as feasible). Document unavoidable tooling gaps.
>
> 4. **Hardening & Verification**
>    - Run accessible/static analysis (HTMLHint, Lighthouse budget, ESLint if introduced) and capture results.
>    - Perform performance/security passes: caching, input sanitization, rate limiting, dependency upgrades, monitoring endpoints.
>    - Update `.env.example`, README, and operational docs with any new configuration, deployment steps, or runbooks.
>
> 5. **Documentation & Knowledge Transfer**
>    - Summarize changes in `CHANGELOG.md` and refresh the continuity guide with the new architecture, testing strategy, and pending backlog.
>    - Provide a verification checklist (tests run, manual QA scenarios, deploy steps) to ease handoff.
>    - Highlight open questions or experiments for the next iteration.
>
> Throughout every stage: keep commits scoped, prefer progressive enhancement, defend accessibility, and treat observability (logging, metrics, tracing) as first-class deliverables. Surface blockers transparently in the PR body so future maintainers know what still needs attention.

---

## Usage Notes
- Drop the prompt into the next session verbatim, then follow it literally.
- If a stage reveals new information that invalidates previous assumptions, revise the roadmap before coding.
- Record major decisions and follow-up items in both the changelog and continuity guide so future contributors inherit full context.
