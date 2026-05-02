# Team Task Manager (MERN)

A full-stack project management app with JWT auth, role-based permissions, project/task workflows, and dashboard analytics.

## Why This Project Is Interview-Ready

- Clear role-based authorization model (`admin` vs `member`)
- Practical full-stack architecture (React + REST API + MongoDB)
- Defensive backend startup checks (required env validation)
- Request payload validation at route boundary
- Centralized API error handling with consistent JSON responses
- Explainable business metrics (task status + overdue dashboard)
- Deployable to Railway as separate frontend/backend services

## Core Features

- Signup/Login with JWT authentication
- Role-based access control
  - Admin: create projects, view all tasks, manage assignments
  - Member: view assigned work and update status
- Project creation with member assignment (email or user ID)
- Task lifecycle management (`todo`, `in-progress`, `done`)
- Dashboard stats (`total`, `todo`, `inProgress`, `done`, `overdue`)
- Health endpoint for runtime checks: `GET /health`

## Tech Stack

- Frontend: React + Vite + Axios
- Backend: Node.js + Express + Mongoose
- Database: MongoDB Atlas / MongoDB
- Auth/Security: JWT + bcryptjs

## Architecture Overview

```
Client (React) --> REST API (Express) --> MongoDB (Mongoose)
                 |-- JWT middleware
                 |-- Role guards
                 |-- Controllers + Models
```

Backend modules:
- `src/server.js`: app bootstrap, middleware, routes, health check
- `src/app.js`: express app composition (test-friendly)
- `src/config/env.js`: environment loading and validation
- `src/config/db.js`: MongoDB connection
- `src/middleware/authMiddleware.js`: auth + role guards
- `src/middleware/errorHandler.js`: centralized 404 + error responses
- `src/controllers/*`: request handlers
- `src/validators/*`: request payload validation
- `src/models/*`: Mongoose schemas

## Quality Checks

Backend test command:

```bash
cd server
npm test
```

Current automated checks include:
- `GET /health` API smoke test
- Auth payload validation check
- Protected task route auth guard check

## Local Setup

### 1) Backend (`server`)

```bash
cd server
cp .env.example .env
# fill MONGO_URI and JWT_SECRET
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2) Frontend (`client`)

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Environment Variables

Backend (`server/.env`):
- `PORT=5000`
- `MONGO_URI=<mongodb-connection-string>`
- `JWT_SECRET=<strong-random-secret>`
- `CLIENT_URL=http://localhost:5173`

Frontend (`client/.env`):
- `VITE_API_URL=http://localhost:5000/api`

## API Endpoints

Auth:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` (protected)
- `GET /api/auth/users` (protected, admin)

Projects:
- `GET /api/projects` (protected)
- `POST /api/projects` (protected, admin)
- `DELETE /api/projects/:id` (protected, admin)

Tasks:
- `GET /api/tasks` (protected)
- `POST /api/tasks` (protected)
- `PUT /api/tasks/:id` (protected, admin or assignee)
- `DELETE /api/tasks/:id` (protected, admin)

Dashboard:
- `GET /api/dashboard` (protected)

Ops:
- `GET /` (basic service message)
- `GET /health` (uptime/health status)

## Suggested Demo Flow (2-5 min)

1. Sign up one admin and one member account.
2. Log in as admin, create a project, assign members.
3. Create tasks with due dates and assignees.
4. Log in as member and update task status.
5. Show dashboard totals and overdue counts changing in real-time.

## Interview Talking Points

- **Authorization design:** middleware-first auth (`protect`) + role checks (`authorizeRoles`)
- **Data modeling:** relationships across `User`, `Project`, and `Task`
- **Scalability path:** move dashboard stats to Mongo aggregation for very large task volumes
- **Production hardening ideas:** request validation, rate limiting, refresh tokens, tests, and CI

## Railway Deployment

Deploy as a single combined service (recommended)

This repo now includes a root `package.json` and `Procfile` so you can deploy the whole app as one service on Railway. The flow is:

- Railway installs root dependencies and runs the `postinstall` script which builds the React app in `client/`.
- The `web` process in `Procfile` runs `npm start` which starts the Express server in `server/`.

What to set on Railway:

- `MONGO_URI` - your MongoDB connection string
- `JWT_SECRET` - JWT secret
- (optional) `PORT` - Railway provides one automatically

How it works locally:

1. From project root, install and build then start the server (this builds the client and then starts the server):

```powershell
npm install
npm start
```

2. The server serves API routes under `/api/*` and the React app from `/` when `NODE_ENV=production` and `client/dist` exists.

If you prefer separate services (frontend + backend), the previous instructions above still apply.

### Fast deploy tips

- If you want Railway (or any host) to start instantly, build the client locally and commit the `client/dist` folder to the repo. This avoids the Vite build step on every deploy.
- Alternatively, the root `postinstall` uses `npm ci` for the client which is faster and deterministic; ensure `package-lock.json` is present in `client/`.

