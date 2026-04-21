# SyncSpace

SyncSpace is a collaborative workspace and task management system built for the "Full Stack Developer Intern Assignment (24 Hours)" brief. It focuses on the assignment's core requirement: multiple users should be able to create shared workspaces, manage tasks, and see important updates in real time without giving up clean architecture or server-side access control.

The project ships as a two-app TypeScript monorepo:

- `frontend/`: Next.js App Router client for authentication, workspace navigation, and the realtime task board
- `backend/`: Express API with Better Auth, Prisma, PostgreSQL, and Socket.IO

## What Is Implemented

### Core requirements

- Email/password sign-up and sign-in
- Session-based authentication with protected frontend routes
- Create workspaces
- Join workspaces with invite code or invite link
- Member listing per workspace
- Create, edit, delete, assign, and update tasks
- Task comments
- Real-time task, comment, activity, and membership updates

### Bonus features included

- Due dates on tasks
- Task search and status filtering in the workspace UI
- Activity log
- Dashboard and workspace overview views

## Tech Stack

- Frontend: Next.js 16, React 18, TypeScript, Tailwind CSS 4
- Backend: Express 4, TypeScript
- Auth: Better Auth with secure session cookies
- Database: PostgreSQL with Prisma
- Realtime: Socket.IO
- Validation: Zod
- Testing: Node test runner

## Architecture Overview

```text
Browser
  -> Next.js app (server-rendered entry + client interactions)
  -> Express API / Better Auth / Socket.IO
  -> Prisma
  -> PostgreSQL
```

### Frontend responsibilities

- Uses the App Router with route groups for:
  - public marketing pages in `frontend/src/app/(site)`
  - auth pages in `frontend/src/app/(auth)`
  - protected application pages in `frontend/src/app/(app)`
- Fetches initial authenticated data on the server by forwarding cookies to the backend
- Hydrates into client components for task creation, task editing, comments, filtering, and realtime updates
- Connects to Socket.IO only after the authenticated app loads and joins workspace-scoped rooms

### Backend responsibilities

- Mounts Better Auth at `/api/auth/*`
- Exposes REST endpoints for workspaces, tasks, comments, members, and activity
- Keeps controllers thin and pushes business logic into services
- Enforces workspace membership and task permissions on every protected action
- Emits realtime events only after successful database writes
- Centralizes validation and API error handling in middleware

### Why this split

This keeps the backend authoritative for security-sensitive logic while still giving the frontend a fast, polished UX. Initial data is rendered server-side for a better first load, and Socket.IO handles the live collaboration layer after the page is ready.

## Project Structure

```text
SyncSpace/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/auth.ts
│   ├── src/config/
│   ├── src/controllers/
│   ├── src/middleware/
│   ├── src/realtime/
│   ├── src/routes/
│   ├── src/schemas/
│   └── src/services/
├── frontend/
│   ├── src/app/
│   ├── src/components/
│   ├── src/lib/
│   └── src/types/
└── docs/
```

## Data Model

The Prisma schema is intentionally stronger than the minimum UI surface because it aims to prevent invalid cross-workspace writes at the database level, not only in application code.

### Core entities

- `User`, `Session`, `Account`, `Verification`: Better Auth tables
- `Workspace`: owner, invite metadata, and workspace identity
- `WorkspaceMember`: membership and role (`ADMIN` or `MEMBER`)
- `Task`: belongs to a workspace and supports assignee, due date, completion time, and soft delete
- `Comment`: belongs to both a task and workspace
- `ActivityLog`: audit-style feed for workspace events

### Important schema decisions

- `WorkspaceMember` is the source of truth for active membership.
- `Task` uses composite foreign keys so the creator and assignee must belong to the same workspace.
- `Comment` duplicates `workspaceId` intentionally so comment authorship can also be constrained to workspace membership.
- Tasks are soft-deleted with `deletedAt` so activity history and related context stay intact.

The schema also contains `Notification` and expanded task status/priority enums for future growth, but the current API and UI deliberately stay scoped to the assignment's needs.

## Authentication, Authorization, and Security

### Authentication

- Better Auth handles email/password registration and login
- Session cookies are used instead of client-managed JWT state
- Frontend server components resolve the active session by forwarding cookies to the backend

### Authorization rules

- Any workspace member can view workspace data
- Any workspace member can create tasks and comments
- Only `ADMIN` users or the task creator can edit task details
- Only `ADMIN` users, the task creator, or the assignee can change task status
- Only `ADMIN` users or the task creator can delete a task
- Invite code and invite link details are only returned to admins

### Security measures

- CORS restricted to configured trusted origins
- `helmet()` enabled
- Zod validation on write endpoints
- Auth rate limits on email sign-in and sign-up
- Secure cookies in production
- Socket connections authenticated from the existing session

## Realtime Design

Socket.IO is used for collaborative updates after the initial page load.

### Connection flow

1. The client opens a socket connection with credentials enabled.
2. The server reads the Better Auth session from the handshake headers.
3. The client emits `workspaceJoin` with the current workspace ID.
4. The server verifies active membership before joining the socket to `workspace:{workspaceId}`.
5. Successful writes emit workspace-scoped events to all active members.

### Realtime events

- `workspaceMemberJoined`
- `taskCreated`
- `taskUpdated`
- `taskDeleted`
- `taskStatusChanged`
- `commentCreated`
- `activityCreated`

This approach keeps the realtime layer simple: the database remains the source of truth, and sockets are only responsible for fan-out after a write succeeds.

## API Overview

### Auth

- Better Auth routes under `/api/auth/*`

### Workspaces

- `GET /api/workspaces`
- `POST /api/workspaces`
- `POST /api/workspaces/join`
- `GET /api/workspaces/:workspaceId`
- `GET /api/workspaces/:workspaceId/members`
- `GET /api/workspaces/:workspaceId/activity`

### Tasks

- `GET /api/workspaces/:workspaceId/tasks`
- `POST /api/workspaces/:workspaceId/tasks`
- `PATCH /api/tasks/:taskId`
- `PATCH /api/tasks/:taskId/status`
- `DELETE /api/tasks/:taskId`

### Comments

- `GET /api/tasks/:taskId/comments`
- `POST /api/tasks/:taskId/comments`

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL 16+ locally, or Docker Desktop for the provided Postgres container

### 1. Start PostgreSQL

Using Docker:

```bash
cd backend
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` with:

- database: `syncspace`
- user: `postgres`
- password: `postgres`

### 2. Configure backend environment

Create `backend/.env`:

```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/syncspace"
BETTER_AUTH_URL="http://localhost:4000"
FRONTEND_URL="http://localhost:3000"
BETTER_AUTH_SECRET="replace-with-a-long-random-secret-at-least-32-characters"
TRUSTED_ORIGINS=""
```

Notes:

- `BETTER_AUTH_URL` should point to the backend base URL.
- `FRONTEND_URL` is used to seed trusted origins.
- `TRUSTED_ORIGINS` can be a comma-separated list if frontend/backend run on additional hosts.

### 3. Install backend dependencies and prepare the database

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

### 4. Configure frontend environment

```bash
cd frontend
cp .env.example .env.local
```

The default frontend env file is:

```env
NEXT_SERVER_API_URL="http://localhost:4000"
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

Notes:

- `NEXT_PUBLIC_API_URL` is the browser-facing backend URL.
- `NEXT_SERVER_API_URL` is used by Next.js server components. It is useful if your server-side network path differs from the browser path.

### 5. Install frontend dependencies

```bash
cd frontend
npm install
```

### 6. Run the apps

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

The app should now be available at:

- frontend: `http://localhost:3000`
- backend: `http://localhost:4000`

## Available Scripts

### Backend

- `npm run dev`: start the backend in watch mode
- `npm run build`: compile TypeScript
- `npm test`: build and run backend tests
- `npm run start`: run compiled output
- `npm run prisma:generate`: generate Prisma client
- `npm run prisma:studio`: open Prisma Studio

### Frontend

- `npm run dev`: start Next.js dev server
- `npm run build`: build production assets
- `npm run start`: run production server
- `npm run test`: run frontend smoke tests

## Verification Checklist

### Manual flow

- Create a new account
- Create a workspace
- Copy the invite code or invite link
- Join from a second account or browser session
- Confirm both users can see the same workspace members
- Create a task and assign it
- Update task status
- Add a comment
- Confirm task and comment updates appear in the second session without refresh
- Confirm the activity feed reflects the recent actions

### Automated tests

Backend tests currently cover:

- root health response
- unknown-route JSON 404 handling
- blocked-origin CORS response

Frontend tests currently cover:

- landing page feature/workflow anchors
- navigation links pointing to shipped sections
- user-facing copy staying free of internal implementation jargon
- presence of the dedicated `NEXT_SERVER_API_URL` config

## Key Trade-offs

### 1. Session cookies over JWT-heavy client auth

I chose Better Auth session cookies so the backend can stay authoritative and Socket.IO can authenticate against the same server-managed session. This is simpler and safer for the assignment than pushing more auth state into the client.

### 2. Service-layer structure over ultra-fast inline handlers

Controllers, services, middleware, and schemas add some upfront structure, but they make permissions, validation, and realtime side effects much easier to reason about under a 24-hour timebox.

### 3. Server-rendered first load, client-driven live updates

Workspace pages fetch initial data on the server for a strong first render and then switch to client-side realtime updates. This avoids an empty shell while still supporting collaboration.

### 4. `prisma db push` instead of a formal migration history

For a take-home assignment, `db push` keeps setup fast and iteration friction low. For a production system, I would replace this with explicit migrations and seeded development data.

### 5. Scoped realtime instead of complex synchronization infrastructure

The app uses workspace rooms and event broadcasts after successful writes. It does not attempt conflict resolution, offline queues, or event replay. That keeps the collaboration model reliable enough for the assignment without over-engineering it.

### 6. Forward-looking schema, intentionally narrower product surface

The schema supports more statuses, priorities, and notifications than the current UI exposes. I kept the shipped experience focused on the required workflow: create work, assign work, discuss work, and see changes live.

## What I Would Improve Next

- Add Prisma migrations and seed scripts
- Add end-to-end tests for authenticated multi-user flows
- Implement notification delivery and read states using the existing schema
- Add richer task views such as columns or swimlanes
- Introduce presence indicators and reconnect-aware UX for realtime collaboration
- Add production deployment config, observability, and background jobs for due-date reminders

## Submission Notes

This repository intentionally prioritizes correctness, access control, and maintainable architecture over feature sprawl. The goal was to deliver the assignment end-to-end with a codebase that is still easy to explain, extend, and review.
