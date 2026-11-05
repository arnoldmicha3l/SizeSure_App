# Implementation 02 — Authentication milestone

## Implemented in source
- New additive Flyway V2 migration for buyer and seller accounts.
- BCrypt password hashes; registration and login endpoints; authenticated server session; logout; account lookup.
- Spring Security protects `/api/v1/**` except health and auth initialization/login/registration.
- CSRF token endpoint and frontend CSRF header on modifying requests.
- Responsive account sign-in / registration / signed-in view using Obsidian Atelier visual system.

## Important limitations — NOT PRODUCTION READY
- **Legacy measurement profiles and seller charts lack account ownership columns.** Existing authenticated accounts can currently access shared legacy data. Do not deploy with real personal measurements until ownership and authorization are added.
- No email verification, password reset, rate limiting, or account lockout yet.
- Buyer–seller messaging, transactions, inventory, disputes, and real avatar assets are not implemented.
- Session cookies and HTTPS production configuration require deployment testing.
- Maven compilation and database integration tests could not be run in this environment (Maven is unavailable). Frontend build verification is recorded separately.
- Prior npm audit found vulnerabilities; investigate and resolve before deployment.
- Never use real customer data in this phase.

## Migration and rollback
- Keep existing database backups. V2 only creates `app_accounts` and leaves V1 intact.
- Do not modify applied Flyway migrations or drop tables to roll back. Restore a database backup if required.
- No Git history was changed; import into a feature branch, not main.
