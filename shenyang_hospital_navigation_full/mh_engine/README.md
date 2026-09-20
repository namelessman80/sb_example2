# mh_engine

Public-facing bilingual (EN/ZH) mental-health check-in tool and hospital finder — the
migrated `sb_example1` Streamlit prototype's user-facing flow, backed by `mh_admin_server`.

## Setup

```bash
cp .env.sample .env
npm install
npm run dev   # http://localhost:5174
```

Requires `mh_admin_server` running at the URL configured in `VITE_SERVER_ORIGIN`.
