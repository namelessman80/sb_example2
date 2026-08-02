# Migrate sb_example1 (Streamlit) → Node.js 3-app ecosystem in sb_example2

## Context

`sb_example1` is a single-file Python/Streamlit prototype (`app.py` + `hospitals.csv`): a bilingual (English/Chinese) mental-health self check-in tool. Users describe their feelings in free text; a keyword matcher (`categorize_feelings`) tags the text against 4 hardcoded categories (Stress, Sleep-related concern, Low mood, Anxiety/Panic) plus a "General concern" fallback, each with an icon, "relates to" bullets, suggested support type, a "when to seek professional help" note, and a gentle self-care tip. Below the results, a hardcoded 30-major-Chinese-city dropdown filters `hospitals.csv` to show matching hospital cards (with a "needs verification" badge). Heavy non-diagnostic disclaimers throughout. Fully anonymous/stateless — no accounts, no server-side persistence of user input.

The user wants this ported to Node.js while adopting, as closely as possible, the structure/conventions of three local reference repos under `/Users/keithshin/Github/Community-resource-engine/`:
- `resource_admin_server` — Express + TS (CommonJS) + Drizzle/Postgres admin API, JWT auth, controller/route/middleware layering, `{message,data}` response convention, audit-log table.
- `resource_admin_client` — Vite + React 18 + react-router-dom + axios + shadcn/ui admin dashboard.
- `Resource-Engine` — Vite + React 19 + wouter + react-query + shadcn/ui public-facing app (its `client/` conventions specifically).

User confirmed (via AskUserQuestion): **full 3-app split** (mirror all three repos, not a single simplified app) and **real Postgres via Docker Compose** (not SQLite). This turns a 1:1 port into a proper admin/public ecosystem: hospitals and categories become admin-manageable DB-backed resources (CRUD + bulk CSV upload + audit log + analytics) instead of hardcoded Python dicts/CSV, while the bilingual keyword-categorization algorithm itself is preserved exactly as the app's core originality.

Local environment check: Node v25.1.0, npm 11.6.2 present; **pnpm is not installed**; Docker CLI present but **daemon is not currently running**. Plan uses **npm** instead of pnpm (reference repos keep npm lockfiles as a documented fallback convention; avoids an extra global install). Docker daemon must be started (`open -a Docker` / Docker Desktop) before `docker-compose up` — will prompt user if needed during implementation.

## Target layout

```
/Users/keithshin/Github/sb_example2/
├── README.md, .gitignore
├── shared/types.ts                 # Hospital, Category, CategorizeResult, Feedback — consumed by mh_engine
├── mh_admin_server/                # Express + Drizzle + Postgres API (mirrors resource_admin_server)
├── mh_admin_client/                # Vite/React admin dashboard (mirrors resource_admin_client)
└── mh_engine/                      # Vite/React public check-in + hospital finder (mirrors Resource-Engine/client)
```

`docker-compose.yml` lives in `mh_admin_server/` (single `postgres:16` service, matches reference placement).

## `mh_admin_server` (backend)

- Express 4 + TS, CommonJS (`tsconfig`: `target ES2020`, `module commonjs`, `strict: true`), `drizzle-orm/postgres-js` + `postgres` driver, `tsx watch` for dev, `drizzle-kit` for schema push.
- `src/environments.ts` — central env object (`DATABASE_URL`, `DIRECT_DB_URL`, `PORT=8000`, `JWT_SECRET`, `JWT_EXPIRES_IN=24h`, `SUPER_ADMIN_SECRET`); nothing else touches `process.env`.
- `src/db/{index.ts,schema.ts}` + `drizzle.config.ts` — connection/`checkDbConnection()`, and schema below.
- `src/index.ts` bootstrap → `checkDbConnection()` → `routes(app)` → `app.listen`, mirroring reference exactly.
- `src/routes/index.ts`: `cors()` → request-timing logger → `express.json({limit:"100mb"})` → `urlencoded` → `GET /api/health` → mount all domain routers → `errorMiddleware` last.
- `src/middlewares/error.middleware.ts`: `AppResponse(res,status,message?,data?)` + `AppError` base and `BadRequestError`/`UnauthorizedError`/`ForbiddenError`/`NotFoundError`/`ConflictError` subclasses + `errorMiddleware` (masks 500s).
- `src/middlewares/adminMiddleware.ts` + `src/utils/jwt.utils.ts`: stateless JWT (`Authorization: Bearer`), re-verifies admin exists+active in DB, attaches `req.admin`. `src/utils/helper.ts`: `getLogContext(req)`.
- `src/middlewares/upload.middleware.ts`: multer disk storage, `.csv` filter, for hospital bulk upload.
- Controllers (plain exported async functions, not classes) in `src/controllers/`: `admin.controller.ts` (login + gated createadmin), `adminCategory.controller.ts`, `adminHospital.controller.ts` (incl. CSV bulk upload, audit-logged), `hospital.controller.ts` (public read), `checkin.controller.ts` (the ported categorization logic — see below), `feedback.controller.ts`, `analytics.controller.ts`, `logs.controller.ts`. Every mutation writes an audit row via `createLog(logContext, ...)`.
- Routes in `src/routes/*.route.ts`: thin handlers (`try { ...controller...; AppResponse(...) } catch(e){ next(e) }`). Admin category/hospital/analytics/logs routers are mounted behind `adminMiddleware`; `feedback.route.ts` mixes public `POST /` with inline-guarded `GET /` and `PUT /:id/status`; `hospital.route.ts` and a `cities.route.ts` (hardcoded 30-city list) are fully public; `checkin.route.ts` is public.

### Drizzle schema (`src/db/schema.ts`)

- `adminsTable`: id identity PK, email(unique), password, name, role(default "admin"), isActive, timestamps.
- `logsTable`: id, adminId→admins.id, tableName, recordId, action, previousData, newData, ipAddress, userAgent, createdAt.
- `categoriesTable` — **replaces the hardcoded Python dicts**: id, name(unique), icon, `keywordsEn: text().array()`, `keywordsZh: text().array()`, `relatesTo: text().array()`, supportType, seekProfessionalWhen, gentleSuggestion, displayOrder, `isFallback` (true only for "General concern" — `deleteCategory` refuses to delete it), isActive, timestamps.
- `hospitalsTable` — **replaces hospitals.csv**: id, name, city, district, department, specialty, address, phone, website, verified, isActive, timestamps. Plain text `city`/`district` columns (matches CSV fidelity, mirrors reference's flat `facilitiesTable.city/state`).
- `checkinsTable` — anonymous analytics only, **no raw user text stored** (privacy-first, stricter than reference's `eventsTable`): id, sessionId (client-generated random UUID), `matchedCategoryIds: integer().array()`, isFallbackMatch, textLength, createdAt. No IP/user-agent either.
- `feedbacksTable`: id, name, email, category(default "general"), message, status(default "new"), timestamps.
- Only formal `relations()` export: `logsTable.adminId → adminsTable.id`. Array columns (`matchedCategoryIds`, keyword arrays) resolved in application code, matching the reference's `serviceIds: integer().array()` precedent (drizzle doesn't support declarative array relations).

### Categorization logic (core originality — port exactly)

`categorizeFeelings(text, categories)` in `checkin.controller.ts`: lowercase-normalize input, for each active category (ordered by `displayOrder`) check if any `keywordsEn`/`keywordsZh` entry is a substring; a check-in can match **multiple** categories; if none match, return the `isFallback` category. This is a direct, pure-function port of `app.py`'s `categorize_feelings`, just data-driven from `categoriesTable` instead of hardcoded dicts.

### API endpoints

Public: `GET /api/health`, `POST /api/checkin/analyze {text, sessionId}` → matched category details + logs a `checkinsTable` row, `GET /api/hospitals?city=`, `GET /api/cities` (hardcoded 30-city constant, not DB-derived — preserves original UX where all 30 cities are always browsable), `POST /api/feedback`.

Admin (JWT): `POST /api/admin/login`, `POST /api/admin/createadmin` (gated by `SUPER_ADMIN_SECRET` body field — this is how the first admin account gets bootstrapped; no separate seed script), full CRUD `/api/admin/categories[/:id]`, full CRUD `/api/admin/hospitals[/:id]` + `POST /api/admin/hospitals/bulk-upload` (multipart CSV, same header schema as the original `hospitals.csv`), `GET /api/admin/analytics/checkins?days=`, `GET /api/admin/logs`, `GET /api/feedback` + `PUT /api/feedback/:id/status`.

### Seed data (`scripts/load-data.ts`)

Ports `src/data/categories.json` (hand-authored from `app.py`'s `CATEGORY_KEYWORDS`/`CATEGORY_ICONS`/`CATEGORY_DETAILS`, values copied verbatim including the Chinese keyword lists) and `src/data/hospitals.csv` (the original file, copied as-is) into Postgres, idempotent (skip existing by unique name). `db:setup` npm script = `db:push && load-data`. `scripts/clear-data.ts`/`drop-tables.ts` mirror reference dev-reset helpers.

## `mh_admin_client` (admin dashboard)

Vite 6 + React 18 + TS (strict + `noUnusedLocals`/`noUnusedParameters`), react-router-dom v7, axios (`src/lib/apiClient.ts` with request interceptor attaching `Bearer` token + response interceptor handling 401/session-expiry via `sonner` toasts), shadcn/ui ("new-york"/"neutral", Tailwind v4 via `@tailwindcss/vite`), `@` path alias.

- `src/context/AuthContext.tsx`: localStorage-persisted admin+token, `login()` → `/api/admin/login`, unwraps `response.data.data`.
- `src/queries/{categories,hospitals,analytics,logs,feedback}.ts`: typed async wrapper functions around `apiClient`.
- `src/pages/{Login,Dashboard,Analytics,ManageData,Logs,Feedback}.tsx`; `App.tsx` wires `ThemeProvider → AuthProvider → BrowserRouter` with `PrivateRoute`+`SidebarWrapper` around protected routes.
- `src/components/{ui/ (shadcn CLI), dialog/ (CategoryDialog, HospitalDialog, BulkUploadDialog, DeleteConfirmDialog, LogDetailDialog), navigation/Sidebar.tsx, wrappers/{PrivateRoute,PublicRoute,SidebarWrapper}.tsx}`.
- `ManageData.tsx` is tabbed: Categories CRUD tab + Hospitals CRUD tab (with bulk CSV upload, city filter). `Analytics.tsx` uses recharts for check-ins-by-category and daily trend (apply the `dataviz` skill for chart/color choices when implementing).

## `mh_engine` (public check-in + hospital finder)

Vite 7 + React 19 + TS, **wouter** (not react-router) + **@tanstack/react-query**, shadcn/ui with a real `tailwind.config.ts` (per Resource-Engine convention), `react-hook-form`+`zod` for the feedback form, `shared/types.ts` consumed via `@shared/*` alias.

- `src/lib/queryClient.ts`: `apiRequest`/`getQueryFn` fetch wrapper (`credentials:"include"`, `staleTime: Infinity`), `src/lib/api.ts`: `analyzeCheckin`, `fetchHospitals`, `fetchCities`, `submitFeedback`.
- `src/pages/Home.tsx`: single-page flow mirroring the original Streamlit app exactly — top disclaimer → `CheckinForm` (textarea + Analyze button, client generates/persists an anonymous `sessionId` UUID in localStorage) → inline `CategoryResultCard` list on submit (icon, relates-to bullets, support-type info box, seek-professional-help text, collapsible gentle self-care tip) → `HospitalNavigation` (city `<Select>` from the 30-city list, doesn't reset check-in results on change) → `HospitalCard` list (with "needs verification" badge) → crisis-line note → footer disclaimer.
- `src/pages/{Feedback,not-found}.tsx`. `App.tsx`: `QueryClientProvider → TooltipProvider → Toaster → wouter Router`.
- Deliberate deviation from `Resource-Engine`: `mh_engine` is built as its own standalone deployable SPA (own `environments.ts`/`VITE_SERVER_ORIGIN`, like `mh_admin_client`) rather than embedded into the Express backend's static/Vite-middleware serving — keeps `mh_admin_server` a pure CommonJS JSON API matching `resource_admin_server` exactly, avoiding the ESM/CommonJS clash that embedding Vite would cause.

## Env files

- `mh_admin_server/.env.sample`: `DATABASE_URL`, `DIRECT_DB_URL` (both `postgresql://mh_admin:mh_admin_password@localhost:5432/mh_admin`), `PORT=8000`, `JWT_SECRET`, `JWT_EXPIRES_IN=24h`, `SUPER_ADMIN_SECRET`.
- `mh_admin_client/.env.sample` and `mh_engine/.env.sample`: `VITE_SERVER_ORIGIN=http://localhost:8000`.

## Build order

1. `mh_admin_server` skeleton (package.json/tsconfig/environments/db/index.ts) → start Docker Postgres (`docker-compose up -d`, prompting user to start Docker Desktop if the daemon isn't running) → `schema.ts` → `drizzle-kit push`.
2. Port seed data (`categories.json`, `hospitals.csv`) → `load-data.ts` → run it → spot-check via `drizzle-kit studio` or a `SELECT`.
3. Backend core: error middleware, JWT utils, admin middleware, `admin.controller/route` (login+bootstrap), `logs.controller/route`; bootstrap first admin via `/createadmin`.
4. Backend domain logic: `checkin` (categorization ported + unit-checked against original keyword lists), `adminCategory`, `hospital` (public) + `adminHospital` (incl. bulk upload) + `cities`, `feedback`, `analytics`; wire `routes/index.ts`; CORS allow-list for the two frontend origins.
5. Smoke-test every endpoint with curl before touching frontend code.
6. `mh_admin_client` scaffold (Vite/Tailwind/shadcn, `environments.ts`, `apiClient.ts`, `AuthContext`, route guards) → wire real login.
7. `mh_admin_client` CRUD pages: Categories tab → Hospitals tab + bulk upload → Logs → Feedback → Dashboard → Analytics.
8. `mh_engine` scaffold (Vite/React 19/wouter/react-query/shadcn) → `shared/types.ts` → `queryClient.ts`/`api.ts`.
9. `mh_engine` pages: `Home` (ported feature-for-feature) → `Feedback` → `not-found`.
10. End-to-end walkthrough of all three apps running concurrently: verify bilingual multi-category matching, city dropdown not resetting results, disclaimers, "needs verification" badges, admin CRUD reflected in the public app, audit log entries, analytics charts populate from real check-ins.

## Verification

- Backend: `npm run dev` in `mh_admin_server`, curl `GET /api/health`, `POST /api/checkin/analyze` with English and Chinese sample text (reuse phrases from the original keyword lists, e.g. "I've been very stressed and not sleeping well" and "我压力很大，睡不着"), `GET /api/hospitals?city=Beijing`, full admin login → CRUD → bulk-upload → logs → analytics flow via curl/Postman.
- `mh_admin_client`: `npm run dev`, log in with the bootstrapped admin, exercise Categories/Hospitals CRUD + bulk CSV upload, confirm Logs and Analytics reflect the actions taken.
- `mh_engine`: `npm run dev`, run through the exact original Streamlit flow in a browser — enter feelings text, confirm correct multi-category matches (including Chinese input), confirm city dropdown doesn't clear results, confirm hospital cards and verification badges render correctly, submit feedback.
- Confirm no raw user check-in text is ever persisted (inspect `checkinsTable` rows after testing).
