# SizeSure — Black Bitles

**An academic, local-only, full-stack clothing measurement comparison prototype.**

Team: Ryan A. Acebedo, Paolo Ricci A. Manugas, Arnold Michael P. Tabada · Cebu Institute of Technology – University.

## Stack

Java 21, Spring Boot 3.3.5, Spring Web, Spring Data JPA, Flyway, MySQL 8, React 18, TypeScript, Vite.

## Prerequisites

- Java 21 and **Maven 3.9+** installed (this package does **not** include the Maven wrapper).
- Node.js 20+ and npm.
- Docker with Compose, or a manually configured MySQL 8 server.
- Internet access on the setup computer to download Maven and npm dependencies.

## Run locally

1. At repository root, run `docker compose up -d db`. The default credentials are **for localhost-only development**; change them using environment variables before any other use.
2. In a second terminal, `cd backend` and run `mvn spring-boot:run` (Windows: same command). Spring Boot reads DB_URL, DB_USERNAME, DB_PASSWORD and CORS_ALLOWED_ORIGINS from environment if set. Defaults match the example Docker Compose setup.
3. In a third terminal, `cd frontend`, run `npm install`, then `npm run dev`.
4. Open `http://localhost:5173`. Backend health: `http://localhost:8080/api/v1/health`.
5. On Windows PowerShell, use `cd backend; mvn spring-boot:run` and `cd frontend; npm install; npm run dev` in separate terminals.

**Note:** The app currently lacks the Maven wrapper and a committed `package-lock.json`; use `npm install` rather than `npm ci`. The source has not been dependency-installed or end-to-end tested in the creation environment because Maven, Docker, and network package downloads were unavailable.

## Tests and build

- Backend: `cd backend && mvn test`
- Frontend: `cd frontend && npm run typecheck && npm run build`
- Frontend unit tests: `npm test` (test runner is configured; comprehensive UI test cases remain to be authored).

## Important behavior

- Enter reusable body measurements and fitted/regular/loose preference.
- Manually enter circumference size charts with S/M/L or other labels.
- Store profiles and charts in MySQL; create, edit, read, delete with dependent-comparison restrictions.
- Match chest to chest, waist to waist, hip to hip; convert 1 in to 2.54 cm.
- Display signed garment-minus-body differences, **not physical-fit verdicts**.
- Recommendation endpoint returns `RULES_UNAPPROVED` until approved policies are provided.

## Security and limitations

**Local single-user academic demonstration only.** No accounts, ownership isolation, CSRF strategy, HTTPS termination, or production-grade security review. Do not deploy publicly or enter real personal measurements in shared environments. This prototype does not scrape seller charts, connect to marketplaces, use AI or guarantee fit. Chart convention is circumference only. Domain model remains subject to reconciliation with final workbook/ERD.

## Documentation

See `docs/api.md`, `docs/decision-log.md`, `docs/requirements-traceability.md`, `docs/professor-demo.md`, and `docs/qa-evidence.md`.
