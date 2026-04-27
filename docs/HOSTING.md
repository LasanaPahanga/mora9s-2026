# Mora 9s 2026 — Hosting documentation (index)

**Domain used in these guides:** **`mora9s.live`** (Name.com, e.g. via **GitHub Student Developer Pack**).

This project runs **two React (Vite) sites** and **two Node (Express) backends** plus **MySQL**. In the recommended layout, **frontends** live on **Vercel** and **backends + database** on **AWS EC2**. The guides are **split on purpose** so you can follow one path at a time, then connect them using the integration doc.

---

## Which file should I read?

| Document | What it covers |
|----------|----------------|
| **[HOSTING_VERCEL.md](HOSTING_VERCEL.md)** | **Beginner steps** to host **both websites** on Vercel: two projects, `user-mode/client` vs `admin-mode/client`, root directory, `VITE_API_URL` / `VITE_ADMIN_API`, `vercel.json`, custom domains (`www`, `admin`, optional apex), redeploys, troubleshooting **only** for the static apps. |
| **[HOSTING_AWS.md](HOSTING_AWS.md)** | **Beginner steps** to host the **backends** on **AWS EC2** (one server): Ubuntu, Node, PM2, MySQL, `git clone`, `.env` files, Nginx, Let’s Encrypt, DNS **`api` / `admin-api` → A record**, WebSockets for the user API, optional GitHub Actions deploy, troubleshooting **only** for servers. |
| **[HOSTING_INTEGRATION.md](HOSTING_INTEGRATION.md)** | **Scenarios where Vercel + AWS merge:** architecture diagram, DNS split (what goes to Vercel vs EC2), **full env variable matrix** (`VITE_*` vs `USER_SERVER_URL` vs Nginx), **order of operations** (A/B/C cutover), CORS + Socket.IO, data flow (admin → user server → browsers), CI/CD when both repos change, **cross-service** troubleshooting, final checklist. |

**Suggested order for a full production setup:** Vercel doc (sites up, even on `*.vercel.app`) → AWS doc (APIs + DB + HTTPS) → Integration doc (align DNS, env, CORS, test end-to-end).

---

## High-level architecture

```text
Internet
   ├─► Vercel (HTTPS)
   │     ├─  www.mora9s.live   →  user-mode/client
   │     └─  admin.mora9s.live →  admin-mode/client
   └─► AWS EC2 (Nginx + HTTPS)
         ├─  api.mora9s.live       →  user-mode/server (4000) + Socket.IO
         ├─  admin-api.mora9s.live →  admin-mode/server (5000)
         └─  MySQL (on EC2 or RDS)
```

**Rule:** the browser **never** talks to MySQL directly; only the Node servers on AWS do. For **why** the admin and user servers both need the same public **user** API URL in different ways, read **§1 and §6** in [HOSTING_INTEGRATION.md](HOSTING_INTEGRATION.md).

---

## CI/CD in this repository

| File | Role |
|------|------|
| [`.github/workflows/deploy-vercel-frontends.yml`](../.github/workflows/deploy-vercel-frontends.yml) | Deploy both Vercel frontends (needs Vercel token / org / project id secrets) |
| [`.github/workflows/deploy-aws-backend.yml`](../.github/workflows/deploy-aws-backend.yml) | SSH to EC2, `git pull`, `npm ci`, `pm2` (needs `EC2_*` secrets) |

Details and secret names: [HOSTING_INTEGRATION.md §7](HOSTING_INTEGRATION.md#7-cicd-what-deploys-when-this-repo) and the older inline notes in the workflow files.

---

## Legacy note

The previous **single** long `HOSTING.md` was replaced by the three files above + this **index** so each topic has one clear home. If a bookmark pointed to a section in the old file, use the table at the top to pick the new guide.
