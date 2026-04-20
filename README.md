# SyncSpace

## Backend Database Foundation (Prisma + PostgreSQL)

1. Install backend dependencies:
   - `cd backend && npm install`
2. Copy environment template:
   - `cp .env.example .env`
3. Start local PostgreSQL (Docker):
   - `docker compose up -d`
4. Generate Prisma client:
   - `npm run prisma:generate`
5. Start backend:
   - `npm run dev`

### Required Environment Variable

- `DATABASE_URL` in PostgreSQL format, for example:
  - `postgresql://postgres:postgres@localhost:5432/syncspace?schema=public`
