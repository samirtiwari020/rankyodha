# RankYodha Backend

Backend API built with Node.js, Express, and MongoDB using a modular `src/` architecture.

## Structure

- `src/config` - env and DB connection
- `src/controllers` - request handlers
- `src/routes` - route definitions
- `src/models` - mongoose models
- `src/services` - business logic
- `src/middleware` - auth and error handlers
- `src/utils` - helper utilities
- `src/jobs` - optional background jobs

## Run

1. Install dependencies:
   - `npm install`
2. Configure `.env` values (`MONGO_URI`/`MONGODB_ATLAS_URL`, `JWT_SECRET`, `GEMINI_API_KEY`)
3. Start server:
   - `npm run dev` (development)
   - `npm start` (production-like)

Health route:
- `GET /api/health`

Base API prefix:
- `/api/v1`
