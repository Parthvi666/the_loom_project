# The Loom Project

Scaffold for a React/Vite frontend and an Express/Prisma backend.

## Setup

Install dependencies in each app:

```bash
cd frontend
npm install
npm run dev
```

In a second terminal:

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

The frontend runs on `http://localhost:5173` and the API runs on `http://localhost:4000`.
Copy `backend/.env.example` to `backend/.env` and update values as needed.
