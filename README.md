# SyncSpace

SyncSpace is a full stack authentication-first app foundation with:
- Next.js frontend
- Express + Prisma backend
- Better Auth email/password authentication

## Current Status

Shipped today:
- sign up, sign in, and sign out flows
- protected dashboard routing
- Better Auth backend integration
- Prisma schema and backend foundation for future modules

Not shipped yet:
- workspace management UI
- task management UI or API
- real-time collaboration features

## Quick Start

1. Start backend services
- `cd backend`
- `npm install`
- `cp .env.example .env`
- `docker compose up -d`
- `npx prisma db push`
- `npm run prisma:generate`
- `npm run dev`

2. Start frontend
- `cd frontend`
- `npm install`
- `cp .env.example .env.local`
- `npm run dev`

3. Open app
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## Backend Environment Variables

Defined in `backend/.env`:
- `PORT` default `4000`
- `DATABASE_URL` PostgreSQL connection string
- `BETTER_AUTH_URL` backend origin used by Better Auth (for local: `http://localhost:4000`)
- `FRONTEND_URL` frontend origin allowed for auth and CORS (for local: `http://localhost:3000`)
- `BETTER_AUTH_SECRET` required in production, minimum 32 characters
- `TRUSTED_ORIGINS` optional comma-separated extra origins

## Frontend Environment Variables

Defined in `frontend/.env.local`:
- `NEXT_SERVER_API_URL` backend origin used by the Next.js server for server-side session lookups when needed
- `NEXT_PUBLIC_API_URL` backend origin used by auth client (for local: `http://localhost:4000`)

## Production Notes

- Use a strong random `BETTER_AUTH_SECRET` in every non-local environment.
- Set `BETTER_AUTH_URL`, `FRONTEND_URL`, and `TRUSTED_ORIGINS` to exact deployed origins.
- Set `NEXT_SERVER_API_URL` when the server-rendered frontend cannot reach the backend through `NEXT_PUBLIC_API_URL`.
- Run both apps with production build commands before release:
  - frontend: `npm run test && npm run lint && npm run build`
  - backend: `npm run test && npm run build`
