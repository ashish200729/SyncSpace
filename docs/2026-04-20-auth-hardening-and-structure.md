# Decision Note: Auth Hardening and Route Structure Cleanup

Date: 2026-04-20

## Context

Better Auth and login/signup flows were added, but production hardening and structure boundaries needed tightening for API safety and maintainability.

## What Changed

- Centralized backend environment parsing in `backend/src/config/env.ts`.
- Hardened Better Auth config in `backend/src/auth.ts` with:
  - trusted origins from normalized env values
  - secure-cookie behavior tied to production mode
  - endpoint-level auth rate limits
  - session cookie caching defaults
  - proxy IP header configuration
- Added consistent JSON API error handling in `backend/src/middleware/error-handler.ts` and wired it in `backend/src/index.ts`.
- Refactored frontend app routing to route groups:
  - `frontend/src/app/(site)` for shared header/footer pages
  - `frontend/src/app/(auth)` for auth pages without global shell chrome
- Improved client auth error handling and resilience:
  - safe user-facing message mapping
  - guarded submit handlers with try/catch/finally
  - absolute callback URL generation for cross-origin frontend/backend setups

## Why This Approach

- Keeps auth/security logic centralized and explicit.
- Reduces leakage of internal errors while preserving actionable user feedback.
- Improves page/layout responsibility boundaries without changing public routes.
- Minimizes blast radius by changing only auth-related surfaces.

## Alternatives Considered

- Keeping auth and CORS parsing inline in `index.ts` and `auth.ts`.
  - Rejected because duplication increases drift risk.
- Leaving auth pages under global header/footer.
  - Rejected because full-screen auth UX and route responsibility become coupled.

## Trade-offs

- Added a small amount of config and utility code.
- Route group structure is slightly more advanced than flat app routing, but clearer as the app scales.