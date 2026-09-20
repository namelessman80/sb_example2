# mh_admin_server

Express + Drizzle + Postgres JSON API for the Mental Health Support project. Serves both the
public check-in/hospital endpoints and a JWT-protected admin API.

## Prerequisites

Node >= 18, Docker (for local Postgres).

## Setup

```bash
cp .env.sample .env
npm install
docker-compose up -d
npm run db:setup   # drizzle-kit push + seed categories/hospitals
npm run dev        # http://localhost:8000
```

Bootstrap the first admin account:

```bash
curl -X POST http://localhost:8000/api/admin/createadmin \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"changeme","superAdminSecret":"change-me-bootstrap-secret"}'
```

## Key endpoints

- `GET /api/health`
- `POST /api/checkin/analyze` `{ text, sessionId }`
- `GET /api/hospitals?city=`
- `GET /api/cities`
- `POST /api/feedback`
- `POST /api/admin/login`
- `GET/POST/PUT/DELETE /api/admin/categories[/:id]`
- `GET/POST/PUT/DELETE /api/admin/hospitals[/:id]`, `POST /api/admin/hospitals/bulk-upload`
- `GET /api/admin/analytics/checkins?days=`
- `GET /api/admin/logs`
