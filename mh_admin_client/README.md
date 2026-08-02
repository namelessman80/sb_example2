# mh_admin_client

Admin dashboard for the Mental Health Support project: manage check-in categories and
their bilingual (EN/ZH) keyword lists, manage the hospital directory (with CSV bulk
upload), review submitted feedback, view the audit log, and see check-in analytics.

## Setup

```bash
cp .env.sample .env
npm install
npm run dev   # http://localhost:5173
```

Requires `mh_admin_server` running at the URL configured in `VITE_SERVER_ORIGIN`, and
at least one admin account bootstrapped via `POST /api/admin/createadmin`.
