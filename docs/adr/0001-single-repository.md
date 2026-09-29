# ADR 0001: Single repository for backend and frontend

- **Status:** Accepted
- **Date:** 2026-09-28

## Context

lifeOS has a Spring Boot backend and a web frontend, built by one developer. Almost every feature touches both sides: a new endpoint plus the screen that uses it.

## Decision

Use one repository with `/backend`, `/frontend` and `/docs` as independent folders. Each app has its own build and tests. The frontend depends on the backend only through the OpenAPI contract, and no code is shared between them. CI uses path filters so a backend change runs backend CI and a frontend change runs frontend CI.

## Consequences

- One issue, one PR and one history per feature; no cross-repo version syncing.
- One README and one link to show the whole system.
- Splitting later is possible with `git filter-repo` or `git subtree split`.
- Revisit if the two sides need independent release schedules, different owners, or a second client.
