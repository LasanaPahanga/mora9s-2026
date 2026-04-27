# Scenarios: when Vercel + AWS come together

This document explains **how the two hosting guides connect** — not as two isolated tutorials, but as **one system**: browsers on **Vercel** talking to **APIs on AWS**, with **DNS**, **HTTPS**, **CORS**, and **Socket.IO** all aligned.

**Prerequisites:** you have read (or will follow) [HOSTING_VERCEL.md](HOSTING_VERCEL.md) and [HOSTING_AWS.md](HOSTING_AWS.md).

**Domain in examples:** `mora9s.live` (Name.com).

---

## 1. One picture: who does what

```text
Visitor browser
   │
   ├─ HTML/JS/ CSS from  Vercel  →  www.mora9s.live  (user React app)
   │                    Vercel  →  admin.mora9s.live (admin React app)
   │
   └─ API + WebSocket to  AWS EC2  (via Nginx, HTTPS)
            →  api.mora9s.live       (user server: REST + Socket.IO)
            →  admin-api.mora9s.live (admin server: REST + auth)
```

- **Vercel** never runs your **Node** or **MySQL** — only static files + build-time `VITE_*` variables.
- **AWS EC2** runs **MySQL** + both **Node** processes. Browsers and the admin **do not** connect to MySQL directly.

**Admin server’s special link:** the admin **backend** opens an **outbound** Socket.IO connection **to** the **user** server (`USER_SERVER_URL`) so that when an admin changes data, the **user** server can **broadcast** to all public site visitors. So the user API URL must be **one** canonical HTTPS base everywhere.

---

## 2. DNS: split by role (Name.com)

You configure **one** zone **`mora9s.live`**, but different **subdomains** go to different providers:

| Subdomain / host | Points to | Provider |
|------------------|-----------|----------|
| `www` | Vercel (CNAME from Vercel’s UI) | Vercel |
| `admin` | Vercel (CNAME) | Vercel |
| `api` | EC2 public IPv4 (**A** record) | AWS |
| `admin-api` | **Same** EC2 IPv4 (**A** record) | AWS |
| `@` (apex) | Vercel **A** record **or** Name.com **redirect** to `https://www.mora9s.live` | Vercel or Name.com (see [HOSTING_VERCEL.md](HOSTING_VERCEL.md) §5.2) |

**Typical failure:** CNAME for `api` to Vercel by mistake — then **APIs never hit AWS** and the site breaks. **A** for `api` and `admin-api` must be the **EC2** IP (or a load balancer in front of EC2 if you add one later).

---

## 3. Environment variables: who sets what (matrix)

| Variable | Where it lives | Value (production example) | Purpose |
|----------|----------------|----------------------------|--------|
| `VITE_API_URL` | **Vercel** → **user** project (Production build env) | `https://api.mora9s.live` | Browser → user **REST** + **Socket.IO** (same host). No trailing `/`. |
| `VITE_ADMIN_API` | **Vercel** → **admin** project | `https://admin-api.mora9s.live` | Admin React → **admin** REST. |
| `USER_SERVER_URL` | **EC2** file `admin-mode/server/.env` | `https://api.mora9s.live` | Admin **Node** → connects **out** to user server for real-time **broadcasts**. |
| `DB_*`, `JWT_SECRET` | **EC2** only (both server `.env` files) | — | Databases and tokens never go to Vercel. |

**Rule:** the **string** for the public user API is the same in **three places** in spirit:

1. `VITE_API_URL` (browser)
2. `USER_SERVER_URL` (admin **server**)
3. **Nginx** `server_name api.mora9s.live` → port **4000**

If any one uses `http://`, a wrong host, or a trailing slash inconsistency, you get **CORS**, **Socket.IO**, or **mixed content** bugs.

**After you change a `VITE_*` variable:** redeploy the Vercel project so the new value is **baked into the built JS**.

---

## 4. Scenarios: order of work (what to do first)

### Scenario A — “I only have Vercel so far”

- Frontends work on `*.vercel.app` with **placeholder** or **wrong** `VITE_*` → pages load, but **data** and **real-time** fail until **AWS** is up and env vars are fixed.
- **Action:** follow [HOSTING_AWS.md](HOSTING_AWS.md), set DNS for `api` / `admin-api`, then return to Vercel and set `VITE_API_URL` and `VITE_ADMIN_API` to the **https** API URLs, then **redeploy**.

### Scenario B — “I only have AWS so far”

- `curl https://api.mora9s.live` (or `/` returning JSON) can work before any Vercel app exists.
- **Action:** add Vercel projects, set `VITE_*`, add `www` / `admin` CNAMEs. Tighten **CORS** on servers to your Vercel URLs (§6).

### Scenario C — “Full production cutover”

1. EC2, MySQL, both servers, **PM2**, Nginx, Certbot, **`USER_SERVER_URL`**.
2. Name.com **A** for `api` and `admin-api` propagated; **HTTPS** works on both.
3. Vercel **CNAME** for `www` and `admin`; **HTTPS** on Vercel.
4. Vercel **env** set; **redeploy** both frontends.
5. Tighten **CORS** + **Socket.IO** origin on the **user** server (§6).
6. Test: open **public** site, load data; open **admin**, log in, change a match, confirm **public** site updates without refresh (Socket.IO path).

### Scenario D — “Preview vs production”

- Vercel **Preview** deploys (per-branch URLs) can call **production** APIs if you set Preview env to the same `https://api...` — convenient but **risky** (test data on prod DB). Safer: separate **staging** EC2 or DB, or use Preview only with mock APIs.
- **CORS** must include preview origins if you need them: e.g. `https://mora-9s-xxx.vercel.app` (exact URL from the preview).

---

## 5. CORS and Socket.IO (where “merge” often breaks)

Browsers **send an `Origin` header** that matches the **Vercel** page URL, not the API URL. Your **Express** CORS and **Socket.IO** `cors` on the **user** server should **allow** at least:

- `https://www.mora9s.live`
- `https://admin.mora9s.live`
- `https://mora9s.live` (if you use apex on Vercel)
- Any **preview** `https://*.vercel.app` you still use (optional, only for development)

**Socket.IO** on the user server: do **not** leave `origin: "*"` in production if you can avoid it; mirror the same allowlist as Express.

(Implement allowlists in `user-mode/server/src/app.js` and `admin-mode/server/src/app.js` + Socket.IO options on the user server. This document only lists **what** must match; see [HOSTING_AWS.md](HOSTING_AWS.md) §9.)

---

## 6. Data flow: why admin changes reach the public site

1. **Admin** browser → **HTTPS** `admin-api.mora9s.live` (admin **Express**).
2. Admin **Express** writes to **MySQL** and may call `emitToUsers` → which uses a **Socket.IO client** to **`USER_SERVER_URL`** (`https://api.mora9s.live`).
3. **User** **Express** receives that and **broadcasts** to browsers connected to **Socket.IO** on the same `api.mora9s.live`.
4. **Public** browser (loaded from `www.mora9s.live`) is connected to **`VITE_API_URL`** = same host — so it gets the event.

If **`USER_SERVER_URL` is wrong** or **Nginx** lacks WebSocket headers on **`api`**, step 3 or 4 fails → no live updates on the public site.

---

## 7. CI/CD: what deploys when (this repo)

| Workflow | When it runs (roughly) | Effect |
|----------|------------------------|--------|
| `.github/workflows/deploy-vercel-frontends.yml` | Push to `main` under `user-mode/client` or `admin-mode/client` | Pushes new **static** build to Vercel production (needs Vercel token secrets) |
| `.github/workflows/deploy-aws-backend.yml` | Push to `main` under `user-mode/server` or `admin-mode/server` | **SSH** to EC2, `git pull`, `npm ci`, `pm2` restart |

You can also use **Vercel’s** built-in “Deploy on Git” without the GitHub Action.  
**Edit `DEPLOY_PATH`** in the AWS workflow if your clone is not at `/var/www/mora9s-2026`.

**Important:** changing **only** frontend code does **not** run the AWS workflow, and **only** backend code does **not** run the Vercel workflow — that is intentional. **Full-stack** changes need **both** or a **manual** deploy of the other side.

---

## 8. Checklist: integration (before you call it “done”)

- [ ] `https://api.mora9s.live` and `https://admin-api.mora9s.live` return valid responses (browser or `curl`), valid TLS.
- [ ] Vercel **Production** `VITE_API_URL` = `https://api.mora9s.live` and `VITE_ADMIN_API` = `https://admin-api.mora9s.live`; **redeployed** after setting.
- [ ] `USER_SERVER_URL` on EC2 = `https://api.mora9s.live` (no trailing slash).
- [ ] CORS + Socket.IO allow your **Vercel** origins.
- [ ] Public site loads data; admin can log in and mutate data; **live** updates appear on the public site.

---

## 9. Quick troubleshooting (cross-service)

| Symptom | Likely cause |
|--------|----------------|
| **CORS error** in browser | API `Access-Control-Allow-Origin` / Socket.IO origin does not list your **Vercel** site URL. |
| **WebSocket / failed** on public site | Nginx on **`api`**: missing `Upgrade` / `Connection` headers; or wrong `VITE_API_URL` (https, correct host). |
| **API works in Postman, not in browser** | Mixed content (page **https**, API **http**); CORS; wrong `VITE_*`. |
| **Admin works, public never live-updates** | `USER_SERVER_URL` wrong; user server down; Nginx; firewall. |

---

## 10. Related docs

- **Vercel only:** [HOSTING_VERCEL.md](HOSTING_VERCEL.md)  
- **AWS only:** [HOSTING_AWS.md](HOSTING_AWS.md)  
- **Index / overview:** [HOSTING.md](HOSTING.md)  
