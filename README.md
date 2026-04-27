# Mora 9s Hockey Tournament 2026

A full-stack web platform for running the **Mora 9s** field hockey tournament: a **public** site for fans (teams, matches, results, points, top scorers) and a **protected admin** app to manage groups, teams, matches, results, and goal scorers. Data is stored in **MySQL**; the user-facing app uses **real-time updates** via **Socket.IO**.

---

## Architecture

```text
┌─────────────────────────┐     ┌─────────────────────────┐
│   Public site (React)   │     │  Admin app (React)     │
│   user-mode/client      │     │  admin-mode/client     │
└───────────┬─────────────┘     └───────────┬─────────────┘
            │ VITE_API_URL                  │ VITE_ADMIN_API
            ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│  User API + Socket.IO   │     │  Admin API + JWT        │
│  user-mode/server :4000 │     │  admin-mode/server :5000│
└───────────┬─────────────┘     └───────────┬─────────────┘
            │                               │
            └───────────────┬───────────────┘
                            ▼
                    ┌───────────────┐
                    │     MySQL     │
                    └───────────────┘
```

In production, frontends are often on **Vercel** and APIs + database on a host such as **AWS EC2** (Nginx, HTTPS, PM2). Align `VITE_*` env vars with your API URLs and configure CORS on the servers for your domains.

---

## Tech stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Public UI   | React 18, Vite 5, Tailwind, React Router |
| Admin UI    | React 18, Vite 5, Tailwind, React Router |
| APIs        | Node.js, Express, mysql2, Socket.IO |
| Admin auth  | JWT (bcrypt for passwords)          |
| Database    | MySQL                               |

---

## Repository layout

| Path | Role |
|------|------|
| `user-mode/client` | Vite + React public site |
| `user-mode/server` | REST + Socket.IO for the public app |
| `admin-mode/client` | Vite + React admin dashboard |
| `admin-mode/server` | REST + auth for the admin app |
| `.github/workflows/` | CI: Vercel frontends, optional AWS backend deploy |

---

## Prerequisites

- **Node.js** 18+ (20.x recommended for parity with Vercel builds)
- **MySQL** 8.x (or compatible)
- A database and schema the servers expect (run migrations or SQL from your setup; both servers share the same `DB_NAME` in typical setups)

---

## Local development

### 1. Database and environment

1. Create a MySQL database (e.g. `mora9s_2026`).
2. Copy and edit environment files:
   - `user-mode/server/.env` from [user-mode/server/.env.example](user-mode/server/.env.example)
   - `admin-mode/server/.env` from [admin-mode/server/.env.example](admin-mode/server/.env.example)  
   Set `DB_*` and `JWT_SECRET` (admin) consistently.

3. **First admin user** (if you use the provided script):
   ```bash
   cd admin-mode/server
   node create-admin.js
   ```
   Follow prompts; requires DB connectivity and valid `.env`.

### 2. Install dependencies

```bash
cd user-mode/server && npm install
cd ../client && npm install
cd ../../admin-mode/server && npm install
cd ../client && npm install
```

### 3. Start the APIs

```bash
# Terminal 1 — user API (default port 4000)
cd user-mode/server && npm run dev

# Terminal 2 — admin API (default port 5000)
cd admin-mode/server && npm run dev
```

### 4. Start the frontends

```bash
# Terminal 3 — public site (Vite default: http://localhost:5173)
cd user-mode/client && npm run dev

# Terminal 4 — admin UI (separate Vite port, e.g. 5174)
cd admin-mode/client && npm run dev
```

**Optional:** create `user-mode/client/.env` / `admin-mode/client/.env` with `VITE_API_URL` and `VITE_ADMIN_API` if you do not want to use the dev defaults (`http://localhost:4000` and `http://localhost:5000` are the fallbacks in code).

### 5. Open the apps

- **Public:** Vite’s URL (e.g. `http://localhost:5173`)
- **Admin:** login at the admin Vite URL; API must be running on the URL your `VITE_ADMIN_API` points to

---

## Environment variables (summary)

| App | Variable | Purpose |
|-----|----------|---------|
| User client | `VITE_API_URL` | Base URL of the **user** server (no trailing `/`) |
| Admin client | `VITE_ADMIN_API` | Base URL of the **admin** server (no trailing `/`) |
| User server | `USER_SERVER_PORT`, `DB_*` | Port and MySQL |
| Admin server | `ADMIN_SERVER_PORT`, `DB_*`, `JWT_SECRET` | Port, MySQL, signing key |

---

## Production builds

```bash
cd user-mode/client && npm run build    # output: dist/
cd admin-mode/client && npm run build
```

Upload or connect CI (e.g. GitHub Actions in this repo) to build and deploy `dist/`. Configure Vercel **root directories** (`user-mode/client` vs `admin-mode/client`), production **branch** `main`, and repository **secrets** if you use the included Vercel workflow. Deploy APIs separately (Node + process manager + reverse proxy + TLS) and point `VITE_API_URL` / `VITE_ADMIN_API` at those HTTPS bases.

---

## Real-time updates

The user server emits Socket.IO events so the public site can refresh lists when data changes. Ensure production URLs use **HTTPS** and **wss://** where applicable, and that proxies pass WebSocket upgrades.

---

## License

This project is private / all rights reserved unless you add an explicit open-source license.
