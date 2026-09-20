# Shenyang Hospital Navigation — Full Working Copy

A complete, self-contained snapshot of the newest working version of the
hospital-navigation feature — frontend (`mh_engine`), backend
(`mh_admin_server`), and their shared types (`shared/`) — duplicated into
this folder so it can be prepared for GitHub/deployment without touching
the original project.

This preserves the current functionality exactly: quick-select feeling
categories, free-text check-in, category→service mapping, hospital
filtering by service tags, distance ranking, the Leaflet map, the hospital
dataset, bilingual (EN/中) UI, and the verification-status/disclaimer
system.

See the conversation this was built in for the full dependency analysis,
verification steps, and deployment options (static GitHub Pages vs.
keeping a live backend). Short version:

## Run it locally

```bash
# 1. Backend (from this folder's mh_admin_server/)
cd mh_admin_server
npm install
npm run dev            # http://localhost:8000 by default

# 2. Frontend (from this folder's mh_engine/, in another terminal)
cd mh_engine
npm install
npm run dev             # http://localhost:5173 (or the port Vite picks)
```

The backend's `.env` (copied as-is) points at the same local Postgres
database the original project uses — no separate database or reseeding is
needed. `.env`/`.env.sample` are already git-ignored in both subfolders.

## Deployment

This version is **not** a static site as-is — it calls a real backend API
for check-in analysis, hospital search/filtering, and geocoding. To
deploy:
- **Static (GitHub Pages)**: requires porting the check-in matching,
  distance/service filtering, and geocoding to run client-side first
  (not done in this copy).
- **Simplest as-is**: deploy `mh_admin_server` + Postgres to a host like
  Render (already referenced as the intended target in
  `mh_engine/src/environments.ts`), then deploy `mh_engine`'s static
  `npm run build` output anywhere static (GitHub Pages, Vercel, Netlify)
  with `VITE_SERVER_ORIGIN` pointed at the hosted backend.
