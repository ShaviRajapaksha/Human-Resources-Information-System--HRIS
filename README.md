# HRIS System

A full-stack **Human Resource Information System** built with NestJS, Prisma, PostgreSQL, and React.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Database Setup](#1-database-setup)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables](#environment-variables)
- [Default Credentials](#default-credentials)
- [Modules & Features](#modules--features)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Folder Structure](#folder-structure)
- [Scripts Reference](#scripts-reference)
- [Troubleshooting](#troubleshooting)

---

## Overview

HRIS is a web application that helps HR teams manage the core operations of a company — employees, departments, leave requests, daily attendance, and monthly payroll — from a single dashboard.

**What it does:**

- Tracks employees across departments with full profile management
- Manages leave requests with an approval/rejection workflow
- Records daily attendance with check-in and check-out times
- Processes monthly payroll with bonus, deduction, and net salary calculation
- Provides a real-time dashboard with charts for headcount, leave status, and payroll trends
- Secures all routes with JWT authentication

---

## Tech Stack

### Backend

| Package | Version | Purpose |
|---|---|---|
| `@nestjs/common` | ^11.0.1 | Core NestJS framework |
| `@nestjs/jwt` | ^11.0.2 | JWT token generation and verification |
| `@nestjs/passport` | ^11.0.5 | Authentication strategy integration |
| `@nestjs/swagger` | ^11.4.4 | Auto-generated OpenAPI documentation |
| `@nestjs/config` | ^4.0.4 | Environment variable management |
| `prisma` | ^7.8.0 | ORM and migration tooling |
| `@prisma/client` | ^7.8.0 | Type-safe database client |
| `bcrypt` | ^6.0.0 | Password hashing |
| `passport-jwt` | ^4.0.1 | JWT passport strategy |
| `class-validator` | ^0.15.1 | DTO validation decorators |
| `class-transformer` | ^0.5.1 | Object transformation |
| `typescript` | ^5.7.3 | Language |

### Frontend

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.6 | UI framework |
| `react-router-dom` | ^6.30.4 | Client-side routing |
| `axios` | ^1.17.0 | HTTP client with interceptors |
| `recharts` | ^3.8.1 | Charts and data visualisation |
| `react-hot-toast` | ^2.6.0 | Toast notifications |
| `lucide-react` | ^1.17.0 | Icon library |
| `tailwindcss` | ^3.4.19 | Utility-first CSS framework |
| `vite` | ^8.0.12 | Build tool and dev server |
| `typescript` | ~6.0.2 | Language |

---

## Project Structure

```
hris-system/
├── hris-backend/
│   ├── prisma/
│   │   └── schema.prisma          # All models and enums
│   ├── src/
│   │   ├── auth/                  # Login, register, JWT strategy, guard
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.dto.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── public.decorator.ts
│   │   ├── employees/             # Employee CRUD
│   │   ├── departments/           # Department CRUD
│   │   ├── leaves/                # Leave request management
│   │   ├── attendance/            # Daily attendance tracking
│   │   ├── payroll/               # Payroll processing
│   │   ├── dashboard/             # Aggregated stats endpoints
│   │   ├── prisma/                # Global Prisma service and module
│   │   ├── app.module.ts          # Root module
│   │   ├── main.ts                # Bootstrap with Swagger + CORS + validation
│   │   └── seed.ts                # Demo data seeder
│   ├── .env.example
│   └── package.json
│
└── hris-frontend/
    ├── src/
    │   ├── api/
    │   │   └── index.ts           # All API calls + Axios interceptors
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Layout.tsx     # App shell with sidebar + outlet
    │   │   │   └── Sidebar.tsx    # Collapsible navigation
    │   │   └── ui/
    │   │       ├── Modal.tsx
    │   │       ├── PageHeader.tsx
    │   │       ├── StatCard.tsx
    │   │       └── ConfirmDialog.tsx
    │   ├── context/
    │   │   └── AuthContext.tsx    # JWT auth state + login/logout
    │   ├── pages/
    │   │   ├── LoginPage.tsx
    │   │   ├── DashboardPage.tsx
    │   │   ├── employees/
    │   │   ├── departments/
    │   │   ├── leaves/
    │   │   ├── attendance/
    │   │   └── payroll/
    │   ├── App.tsx                # Router setup
    │   └── main.tsx
    ├── .env.example
    └── package.json
```

---

## Prerequisites

Make sure the following are installed before you begin:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- **PostgreSQL** v14 or higher — [postgresql.org](https://www.postgresql.org/download)

Verify your setup:

```bash
node --version    # v18+
npm --version     # v9+
psql --version    # PostgreSQL 14+
```

---

## Getting Started

### 1. Database Setup

Start PostgreSQL and create the database:

```bash
psql -U postgres
```

```sql
CREATE DATABASE hris_db;
\q
```

If your PostgreSQL user or password is different from the default (`postgres` / `postgres`), note it down — you'll need it in the next step.

---

### 2. Backend Setup

```bash
cd hris-backend
```

**Install dependencies:**

```bash
npm install
```

**Configure environment:**

```bash
cp .env.example .env
```

Open `.env` and update `DATABASE_URL` if your PostgreSQL credentials differ:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/hris_db"
JWT_SECRET="hris-super-secret-jwt-key-2024"
JWT_EXPIRES_IN="7d"
PORT=3000
```

**Generate the Prisma client:**

```bash
npx prisma generate
```

**Run database migrations** (creates all tables):

```bash
npx prisma migrate dev --name init
```

**Seed demo data** (creates admin user, departments, employees, and sample records):

```bash
npx ts-node src/seed.ts
```

**Start the development server:**

```bash
npm run start:dev
```

The backend is running at:

- **API base:** `http://localhost:3000/api`
- **Swagger docs:** `http://localhost:3000/api/docs`

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd hris-frontend
```

**Install dependencies:**

```bash
npm install
```

**Configure environment:**

```bash
cp .env.example .env
```

The default `.env` points to the local backend — no changes needed unless you changed the backend port:

```env
VITE_API_URL=http://localhost:3000/api
```

**Start the development server:**

```bash
npm run dev
```

The frontend is running at: **`http://localhost:5173`**

---

## Environment Variables

### Backend (`hris-backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/hris_db` | PostgreSQL connection string |
| `JWT_SECRET` | `hris-super-secret-jwt-key-2024` | Secret used to sign JWT tokens. Change this in production. |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `PORT` | `3000` | Port the API listens on |

### Frontend (`hris-frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api` | Backend API base URL |

---

## Default Credentials

After running the seed script, you can log in with:

| Field | Value |
|---|---|
| Email | `admin@hris.com` |
| Password | `admin123` |

The seed also creates 8 sample employees across 5 departments, leave records, attendance records, and payroll entries so the dashboard has data to display immediately.

---

## Modules & Features

### Dashboard

- Total employees, active employees, department count, pending leaves
- Today's attendance summary (present / absent / late)
- Monthly payroll trend bar chart (current year)
- Leave status breakdown pie chart (pending / approved / rejected)
- Department headcount bar chart
- Recently added employees list

### Employees

- List all employees with search (name, email, position) and department filter
- Create employee with auto-generated employee ID
- Edit all fields including status (Active / Inactive / Terminated)
- View employee detail panel with recent leaves and payroll history
- Delete employee

### Departments

- Card-based list view with employee count per department
- Create, edit, delete departments
- Description field for each department

### Leave Management

- Submit leave requests (Annual, Sick, Maternity, Paternity, Unpaid)
- Filter by status (All / Pending / Approved / Rejected)
- Approve or reject pending requests in one click
- Displays duration in days automatically
- Delete requests

### Attendance

- Mark attendance with check-in and check-out times
- Statuses: Present, Absent, Late, Half Day
- Filter records by date
- Today's summary stat cards at the top
- Hours worked calculated automatically from check-in and check-out
- Edit and delete records

### Payroll

- Create monthly payroll records per employee
- Basic salary auto-filled from employee profile
- Add bonus and deductions; net salary calculated live in the form
- Status workflow: Pending → Processed → Paid
- Monthly filter with summary stats (total net payout, pending count, paid count)

### Authentication

- JWT-based login with token stored in `localStorage`
- All API routes protected by a global `JwtAuthGuard`
- Routes marked with `@Public()` decorator bypass the guard
- Token automatically attached to every request via Axios interceptor
- Redirect to login on 401 response

---

## API Reference

All endpoints are prefixed with `/api`. Authenticated endpoints require the header:

```
Authorization: Bearer <your_token>
```

The full interactive docs (with request/response schemas and try-it-out) are available at `http://localhost:3000/api/docs`.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Login and receive JWT token |
| `GET` | `/auth/profile` | Yes | Get currently logged-in user |

**Login request body:**
```json
{
  "email": "admin@hris.com",
  "password": "admin123"
}
```

**Login response:**
```json
{
  "access_token": "eyJhbGci...",
  "user": {
    "id": 1,
    "email": "admin@hris.com",
    "role": "ADMIN"
  }
}
```

---

### Employees

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/employees` | Yes | List all employees |
| `GET` | `/employees?search=alice` | Yes | Search by name, email, or position |
| `GET` | `/employees?departmentId=2` | Yes | Filter by department |
| `GET` | `/employees/:id` | Yes | Get one employee with full detail |
| `POST` | `/employees` | Yes | Create a new employee |
| `PUT` | `/employees/:id` | Yes | Update an employee |
| `DELETE` | `/employees/:id` | Yes | Delete an employee |

**Create employee body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@company.com",
  "phone": "+1234567890",
  "position": "Software Engineer",
  "salary": 85000,
  "hireDate": "2024-03-01",
  "departmentId": 1
}
```

---

### Departments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/departments` | Yes | List all with employee count |
| `GET` | `/departments/:id` | Yes | Get one with employee list |
| `POST` | `/departments` | Yes | Create a department |
| `PUT` | `/departments/:id` | Yes | Update a department |
| `DELETE` | `/departments/:id` | Yes | Delete a department |

---

### Leaves

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/leaves` | Yes | List all leave records |
| `GET` | `/leaves?status=PENDING` | Yes | Filter by status |
| `GET` | `/leaves?employeeId=3` | Yes | Filter by employee |
| `GET` | `/leaves/:id` | Yes | Get one record |
| `POST` | `/leaves` | Yes | Create a leave request |
| `PUT` | `/leaves/:id/status` | Yes | Approve or reject |
| `DELETE` | `/leaves/:id` | Yes | Delete a record |

**Leave status values:** `PENDING` · `APPROVED` · `REJECTED`

**Leave type values:** `ANNUAL` · `SICK` · `MATERNITY` · `PATERNITY` · `UNPAID`

---

### Attendance

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/attendance` | Yes | List all records |
| `GET` | `/attendance?date=2024-06-01` | Yes | Filter by date |
| `GET` | `/attendance?employeeId=2` | Yes | Filter by employee |
| `GET` | `/attendance/today-summary` | Yes | Present / absent / late counts for today |
| `POST` | `/attendance` | Yes | Create a record |
| `PUT` | `/attendance/:id` | Yes | Update a record |
| `DELETE` | `/attendance/:id` | Yes | Delete a record |

**Attendance status values:** `PRESENT` · `ABSENT` · `LATE` · `HALF_DAY`

---

### Payroll

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/payroll` | Yes | List all records |
| `GET` | `/payroll?month=6&year=2024` | Yes | Filter by period |
| `GET` | `/payroll?employeeId=1` | Yes | Filter by employee |
| `GET` | `/payroll/summary?month=6&year=2024` | Yes | Aggregated totals for a period |
| `GET` | `/payroll/:id` | Yes | Get one record |
| `POST` | `/payroll` | Yes | Create a record |
| `PUT` | `/payroll/:id/status` | Yes | Advance status |
| `DELETE` | `/payroll/:id` | Yes | Delete a record |

**Payroll status flow:** `PENDING` → `PROCESSED` → `PAID`

**Payroll summary response:**
```json
{
  "month": 6,
  "year": 2024,
  "total": 8,
  "totalBasic": 648000,
  "totalBonus": 8000,
  "totalDeductions": 4000,
  "totalNet": 652000,
  "pending": 2,
  "processed": 3,
  "paid": 3
}
```

---

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/dashboard/stats` | Yes | Employee, department, leave, attendance counts |
| `GET` | `/dashboard/recent-employees` | Yes | Last 5 employees added |
| `GET` | `/dashboard/department-headcount` | Yes | Employee count per department |
| `GET` | `/dashboard/leave-stats` | Yes | Leave totals by status |
| `GET` | `/dashboard/payroll-trend` | Yes | Monthly net payroll for the current year |

---

## Database Schema

```
┌─────────────┐       ┌──────────────┐
│    User     │       │  Department  │
│─────────────│       │──────────────│
│ id          │       │ id           │
│ email       │       │ name         │
│ password    │       │ description  │
│ role        │       └──────┬───────┘
└──────┬──────┘              │ 1:N
       │ 1:1                 │
       ▼                     ▼
┌─────────────────────────────────────┐
│               Employee              │
│─────────────────────────────────────│
│ id · employeeId · firstName         │
│ lastName · email · phone            │
│ position · salary · hireDate        │
│ status (ACTIVE/INACTIVE/TERMINATED) │
│ departmentId · userId               │
└───────┬────────────────────────────-┘
        │ 1:N to each below
   ┌────┴──────┬────────────┬──────────┐
   ▼           ▼            ▼          ▼
┌──────┐  ┌────────┐  ┌──────────┐  ┌────────┐
│Leave │  │Attend- │  │ Payroll  │  │        │
│──────│  │ance    │  │──────────│  │        │
│type  │  │────────│  │month     │  │        │
│start │  │date    │  │year      │  │        │
│end   │  │checkIn │  │basic     │  │        │
│status│  │checkOut│  │bonus     │  │        │
│reason│  │status  │  │deductions│  │        │
└──────┘  └────────┘  │net       │  │        │
                      │status    │  └────────┘
                      └──────────┘
```

**Enums:**

| Enum | Values |
|---|---|
| `Role` | `ADMIN` · `HR` · `EMPLOYEE` |
| `EmployeeStatus` | `ACTIVE` · `INACTIVE` · `TERMINATED` |
| `LeaveType` | `ANNUAL` · `SICK` · `MATERNITY` · `PATERNITY` · `UNPAID` |
| `LeaveStatus` | `PENDING` · `APPROVED` · `REJECTED` |
| `AttendanceStatus` | `PRESENT` · `ABSENT` · `LATE` · `HALF_DAY` |
| `PayrollStatus` | `PENDING` · `PROCESSED` · `PAID` |

---

## Scripts Reference

### Backend

```bash
# Development
npm run start:dev          # Start with hot-reload (watch mode)
npm run start              # Start normally
npm run build              # Compile TypeScript to dist/

# Database
npx prisma generate        # Regenerate Prisma client after schema changes
npx prisma migrate dev     # Create and apply a new migration
npx prisma migrate reset   # Drop all tables and re-run all migrations
npx prisma studio          # Open visual database browser at localhost:5555
npx ts-node src/seed.ts    # Load demo data

# Code quality
npm run lint               # ESLint check
npm run format             # Prettier format
npm run test               # Unit tests (Jest)
npm run test:e2e           # End-to-end tests
```

### Frontend

```bash
npm run dev                # Start Vite dev server with HMR
npm run build              # Type-check + build to dist/
npm run preview            # Serve the production build locally
npm run lint               # ESLint check
```

---
