# 🚗 Car Rental Management System — Backend

A production-ready REST API for managing a car rental fleet, built with **Node.js**, **Express**, **MySQL 8.0**, and **Supabase Auth**.

---

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Runtime        | Node.js (ES Modules)                |
| Framework      | Express.js 4                        |
| Database       | MySQL 8.0 (via `mysql2/promise`)    |
| Authentication | Supabase Auth (JWT verification)    |
| Libraries      | dotenv, cors, jsonwebtoken          |

---

## Quick Start

### 1. Prerequisites

- **Node.js** ≥ 18
- **MySQL** 8.0 running locally (or remote)
- A **Supabase** project (for Auth — free tier is fine)

### 2. Clone & Install

```bash
cd backend
npm install
```

### 3. Create the database

```bash
mysql -u root -p < schema.sql
```

### 4. Configure environment

```bash
cp .env.example .env
# Edit .env with your MySQL credentials and Supabase keys
```

**Where to find your Supabase JWT Secret:**
Supabase Dashboard → Project Settings → API → JWT Secret

### 5. Run

```bash
# Development (auto-reload with nodemon)
npm run dev

# Production
npm start
```

The server starts at `http://localhost:3000` by default.

---

## API Endpoints

All endpoints are prefixed with `/api`.

### Auth
| Method | Endpoint           | Auth | Description                           |
| ------ | ------------------ | ---- | ------------------------------------- |
| POST   | `/auth/sync-user`  | ✅   | Sync Supabase user → MySQL customer   |
| GET    | `/auth/profile`    | ✅   | Get logged-in user's MySQL profile    |

### Customers
| Method | Endpoint         | Auth | Description       |
| ------ | ---------------- | ---- | ----------------- |
| GET    | `/customers/me`  | ✅   | Get my profile    |
| PUT    | `/customers/me`  | ✅   | Update my profile |

### Vehicles
| Method | Endpoint         | Auth | Description                           |
| ------ | ---------------- | ---- | ------------------------------------- |
| GET    | `/vehicles`      | ❌   | List all (supports `?available=true`) |
| GET    | `/vehicles/:id`  | ❌   | Get one vehicle                       |
| POST   | `/vehicles`      | ✅   | Create vehicle                        |
| PUT    | `/vehicles/:id`  | ✅   | Update vehicle                        |
| DELETE | `/vehicles/:id`  | ✅   | Delete vehicle                        |

### Reservations
| Method | Endpoint              | Auth | Description                          |
| ------ | --------------------- | ---- | ------------------------------------ |
| POST   | `/reservations`       | ✅   | Create + mark vehicle unavailable    |
| GET    | `/reservations/my`    | ✅   | My reservations with estimated total |
| GET    | `/reservations/:id`   | ✅   | Get one reservation                  |
| PUT    | `/reservations/:id`   | ✅   | Update dates / location              |
| DELETE | `/reservations/:id`   | ✅   | Cancel + restore vehicle availability|

### Rents
| Method | Endpoint      | Auth | Description                    |
| ------ | ------------- | ---- | ------------------------------ |
| POST   | `/rents`      | ✅   | Record payment (auto-calc total) |
| GET    | `/rents/my`   | ✅   | My rent records                |
| GET    | `/rents/:id`  | ✅   | Get one rent record            |

### Employees
| Method | Endpoint      | Auth | Description                    |
| ------ | ------------- | ---- | ------------------------------ |
| GET    | `/employees`  | ✅   | List with manager name (JOIN)  |
| POST   | `/employees`  | ✅   | Create employee                |

### Dashboard
| Method | Endpoint           | Auth | Description                      |
| ------ | ------------------ | ---- | -------------------------------- |
| GET    | `/dashboard/stats` | ✅   | Aggregated system statistics     |

### Health Check
| Method | Endpoint     | Auth | Description          |
| ------ | ------------ | ---- | -------------------- |
| GET    | `/api/health`| ❌   | Server status check  |

---

## Authentication Flow

```
┌──────────┐       ┌───────────┐       ┌───────────┐
│ Frontend │──1──▶ │ Supabase  │       │  Backend  │
│ (React)  │◀──2── │   Auth    │       │ (Express) │
│          │──3──────────────────────▶ │           │
│          │◀──4────────────────────── │           │
└──────────┘       └───────────┘       └───────────┘

1. Frontend calls supabase.auth.signUp() / signInWithPassword()
2. Supabase returns a JWT (access_token)
3. Frontend sends requests with "Authorization: Bearer <JWT>"
4. Backend verifies JWT with SUPABASE_JWT_SECRET and responds
```

Backend **never** handles passwords — Supabase manages all auth.

---

## Project Structure

```
backend/
├── src/
│   ├── config/          ← Database & Supabase configuration
│   ├── controllers/     ← Request handlers (business logic)
│   ├── models/          ← Raw SQL queries (data access layer)
│   ├── routes/          ← Express route definitions
│   ├── middleware/      ← Auth verification & error handling
│   ├── utils/           ← Shared helpers (asyncHandler, ApiError)
│   ├── app.js           ← Express setup & route mounting
│   └── server.js        ← Entry point (app.listen)
├── schema.sql           ← MySQL CREATE TABLE statements
├── package.json
├── .env.example
└── README.md
```

---

## Key Concepts for Students

### 1. Connection Pool (`config/db.js`)
Instead of opening one connection per request (slow), we maintain a **pool** of reusable connections.

### 2. Prepared Statements
All queries use `?` placeholders — this prevents **SQL injection**:
```js
db.execute('SELECT * FROM customer WHERE cust_id = ?', [id]);
```

### 3. Transactions (`reservationController.js`)
When two tables must change together (reservation + vehicle availability), we wrap them in a **transaction** — if one fails, both roll back.

### 4. asyncHandler (`utils/asyncHandler.js`)
Express v4 doesn't catch async errors. This wrapper calls `.catch(next)` on every promise so errors reach the global error handler.

### 5. Derived Attributes
- `number_of_days` → MySQL `GENERATED STORED` column (auto-calculated)
- `total_pay` → calculated in `rentController.js` at insert time

---

## License

MIT
