# EduPortal — Mount Kenya University Student Registration Portal

A full-stack student registration system: static HTML/CSS/JS frontend backed by a Node/Express API on TiDB Serverless (MySQL-compatible). Handles student registration, login, hostel accommodation booking, and fee management.

---

## Project Structure

```
mku-student-portal/
│
├── eduportal/                      Frontend — static site
│   ├── index.html                  Homepage / dashboard
│   ├── admissions.html             Registration form
│   ├── courses.html                Course catalogue (static)
│   ├── accommodation.html          Booking form (requires login)
│   ├── fees.html                   Fee form + live calculator (requires login)
│   ├── login.html                  Sign in
│   ├── about.html                  Institution info (static)
│   ├── help.html                   Contact / help desk (static)
│   ├── signout.html                Clears session, redirects to login
│   ├── css/
│   │   └── styles.css              Shared stylesheet for the whole site
│   └── js/
│       └── api.js                  Fetch wrapper, token/session handling
│
└── eduportal-backend/               Backend — Node/Express API
    ├── server.js                    Entry point — mounts routes, starts on :4000
    ├── package.json
    ├── .env                         Real credentials (local only, gitignored)
    ├── .env.example                 Template, safe to commit
    ├── .gitignore
    ├── db/
    │   ├── pool.js                  mysql2 connection pool (SSL, for TiDB)
    │   ├── schema.sql                Table definitions
    │   └── migrate.js                Runs schema.sql against the cluster
    └── routes/
        ├── auth.js                   /api/auth/register, /api/auth/login
        ├── authMiddleware.js         Verifies JWT on protected routes
        ├── accommodation.js          /api/accommodation (protected)
        └── fees.js                   /api/fees (protected)
```

---

## Tech Stack

- **Frontend:** Static HTML/CSS/vanilla JS (no framework, no build step)
- **Backend:** Node.js + Express
- **Database:** TiDB Serverless (MySQL-compatible), via `mysql2`
- **Auth:** JWT (`jsonwebtoken`) + bcrypt password hashing (`bcryptjs`)
- **Intended hosting:** Frontend on Vercel, backend on Render

---

## Setup

### 1. Backend

```bash
cd eduportal-backend
npm install
```

Fill in `.env` with your TiDB Serverless connection details (see `.env.example` for the shape). Get these from your TiDB Cloud cluster's **Connect** tab:

```
PORT=4000
DB_HOST=your-tidb-host.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=your-username.root
DB_PASSWORD=your-password
DB_NAME=test
DB_SSL=true
JWT_SECRET=a-long-random-string
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

> **Note on `CORS_ORIGIN`:** include both `localhost` and `127.0.0.1` variants of your frontend's dev server address — browsers treat them as different origins even though they're the same machine. VS Code's Live Server defaults to `127.0.0.1`.

Create the database tables (one-time):

```bash
npm run migrate
```

Start the server:

```bash
npm run dev      # auto-restarts on file changes
# or
npm start        # plain run
```

You should see `EduPortal API running on http://localhost:4000`.

### 2. Frontend

The frontend must be served over `http://`, not opened as a `file://` path — `fetch` calls require a real origin.

```bash
cd eduportal
python -m http.server 5500
# or use VS Code's Live Server extension
```

Open `http://localhost:5500/index.html` (or `127.0.0.1:5500` — just make sure it matches an origin listed in `CORS_ORIGIN`).

If you change the frontend's port or deploy it elsewhere, update `API_BASE` in `eduportal/js/api.js` and `CORS_ORIGIN` in the backend's `.env` to match.

---

## Database Schema

Tables are prefixed `eduportal_` since the TiDB Serverless free tier doesn't allow `CREATE DATABASE` — everything lives in the shared `test` database, namespaced by prefix instead.

| Table | Purpose |
|---|---|
| `eduportal_students` | Registered students — name, email, DOB, gender, course, hashed password |
| `eduportal_accommodation_bookings` | Hostel bookings, linked to a student by `registration_number` |
| `eduportal_fee_records` | Fee submissions — tuition, statutory fee, discount, total, payment method |

See `eduportal-backend/db/schema.sql` for full column definitions and constraints.

[]()
---

## API Endpoints

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Create a student account, returns a JWT + generated registration number |
| POST | `/api/auth/login` | No | Log in with registration number + password, returns a JWT |
| POST | `/api/accommodation` | Yes | Submit a hostel booking (registration number taken from the JWT, not the form) |
| POST | `/api/fees` | Yes | Submit a fee record (total is recalculated server-side, never trusted from the client) |

Protected routes expect `Authorization: Bearer <token>`. The frontend's `js/api.js` attaches this automatically once a student is logged in (token is stored in `localStorage`).

---

## Viewing / Editing Saved Data

Use TiDB Cloud's built-in **SQL Editor** (Cluster → SQL Editor):

```sql
USE test;
SELECT * FROM eduportal_students;
SELECT * FROM eduportal_accommodation_bookings;
SELECT * FROM eduportal_fee_records;
```

Edit or remove a row:

```sql
UPDATE eduportal_students SET full_name = 'New Name' WHERE registration_number = '...';
DELETE FROM eduportal_students WHERE registration_number = '...';
```

Note: `eduportal_accommodation_bookings` and `eduportal_fee_records` have foreign keys on `registration_number` — delete a student's dependent rows first if you need to remove them.

Alternatively, use a desktop client like DBeaver or TablePlus with the same connection details from `.env` (SSL required).

## 📜 License

[© 2026 **Pantane**](https://github.com/Pantane1/MY-PROJECT/blob/main/LICENSE). All rights reserved. Built with precision in Kenya 🇰🇪

<p align="center">
  <a href="https://www.pantane.is-a.dev"><img src="http://readme-typing-svg.herokuapp.com?color=ACAF50&center=true&vCenter=true&multiline=false&lines=Built+Different" alt="pantane"></a>
</p>
