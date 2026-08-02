# Mental Health Support — Node.js Ecosystem

A Node.js/TypeScript migration of the `sb_example1` Streamlit prototype (bilingual EN/ZH mental-health
check-in + hospital directory), restructured to follow the conventions of the
`resource_admin_server` / `resource_admin_client` / `Resource-Engine` reference repos.

See `migration_plan.md` for the full design rationale.

## Apps

- **`mh_admin_server`** — Express + Drizzle + Postgres JSON API. Serves both the public check-in/hospital
  endpoints and a JWT-protected admin API (categories, hospitals, feedback, analytics, audit logs).
- **`mh_admin_client`** — Vite + React admin dashboard for managing categories, hospitals, feedback,
  and viewing analytics/audit logs.
- **`mh_engine`** — Vite + React public-facing app: the check-in tool and hospital finder.
- **`shared/types.ts`** — TypeScript types shared between `mh_engine` and the backend's response shapes.

## Local setup

1. `cd mh_admin_server && cp .env.sample .env` (adjust secrets as needed).
2. Start Postgres: `docker-compose up -d` (from `mh_admin_server/`). Requires Docker Desktop running.
3. `npm install && npm run db:setup` — pushes the schema and seeds categories + hospitals.
4. `npm run dev` — starts the API on `http://localhost:8000`.
5. Bootstrap an admin account: `POST /api/admin/createadmin` with `{name, email, password, superAdminSecret}`.
6. In `mh_admin_client/`: `cp .env.sample .env && npm install && npm run dev` (http://localhost:5173).
7. In `mh_engine/`: `cp .env.sample .env && npm install && npm run dev` (http://localhost:5174).
