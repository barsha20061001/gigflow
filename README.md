# GigFlow - Smart Leads Dashboard

MERN stack lead management dashboard built for the ServiceHive Full Stack Internship assignment. It includes JWT auth, role-based access control, backend filtering/pagination, debounced search, CSV export, Docker setup, and a responsive React dashboard.

## Tech Stack

- Frontend: React, TypeScript, TailwindCSS, Vite
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose
- Auth: JWT, bcrypt password hashing
- DevOps: Docker Compose

## Features

- User registration and login
- JWT protected routes
- Admin and Sales User roles
- Create, view, update, and delete leads
- Sales users can create and update leads; only admins can delete leads
- Status/source filters with search by name or email
- Sort by latest or oldest
- Backend pagination with 10 leads per page
- Debounced search on the dashboard
- CSV export using the active filters
- Loading, empty, and error states
- Dark mode toggle
- Centralized backend error handling and validation

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example server/.env
cp .env.example client/.env
```

3. Update `server/.env` with your MongoDB URI and JWT secret. For local Vite, keep:

```bash
VITE_API_URL=http://localhost:5000/api
```

4. Start both apps:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`. Backend runs at `http://localhost:5000`.

## Docker Setup

```bash
docker compose up --build
```

This starts MongoDB, the Express API, and the production-built frontend.

## Demo Accounts

The app does not seed demo users automatically. Register from the UI and choose either `Admin` or `Sales User`. Use an admin account to demonstrate delete permissions.

## API Documentation

Base URL: `/api`

### Auth

`POST /auth/register`

```json
{
  "name": "Asha Mehta",
  "email": "asha@example.com",
  "password": "password123",
  "role": "admin"
}
```

`POST /auth/login`

```json
{
  "email": "asha@example.com",
  "password": "password123"
}
```

Both endpoints return:

```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "...",
      "name": "Asha Mehta",
      "email": "asha@example.com",
      "role": "admin"
    }
  }
}
```

### Leads

All lead routes require `Authorization: Bearer <token>`.

- `GET /leads?page=1&status=Qualified&source=Instagram&search=rahul&sort=latest`
- `GET /leads/:id`
- `POST /leads`
- `PUT /leads/:id`
- `DELETE /leads/:id` admin only
- `GET /leads/export/csv` exports filtered CSV

Lead payload:

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "status": "Qualified",
  "source": "Instagram"
}
```

Paginated response:

```json
{
  "success": true,
  "data": {
    "leads": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "pages": 0
    }
  }
}
```

## Submission Checklist

- GitHub repository with complete source code
- Hosted frontend and backend links
- Updated resume
- 2-minute Loom or screen recording demonstrating auth and hiring/lead workflow
- Email subject: `MERN Internship Assignment Submission - Your Name`

## Git Note

No commits in this repository include `Co-authored-by` trailers.
