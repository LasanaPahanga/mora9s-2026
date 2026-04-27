# Hosting the two websites on Vercel (beginner)

This guide is **only** about putting the **two React (Vite) frontends** on **Vercel**:

- **Public site** → `user-mode/client` (e.g. `https://www.mora9s.live`)
- **Admin site** → `admin-mode/client` (e.g. `https://admin.mora9s.live`)

The **APIs** (Node + MySQL) are **not** on Vercel. They are hosted separately (e.g. AWS). After Vercel works, you will point the frontends at your API URLs using **environment variables** (see [HOSTING_INTEGRATION.md](HOSTING_INTEGRATION.md) for the full picture).

**Domain used in examples:** `mora9s.live` (Name.com), same as the rest of this project’s docs.

---

## 1. What you need

| Item | Why |
|------|-----|
| **GitHub account** | Your code must live in a GitHub repository that Vercel can read. |
| **Vercel account** | [vercel.com](https://vercel.com) — free tier is enough for static sites. |
| **This repo** | Monorepo with `user-mode/client` and `admin-mode/client` as separate folders. |

You do **not** need AWS or a domain to see the first deploy — Vercel gives you a `*.vercel.app` URL for each project. For production, you will add **`mora9s.live`** subdomains (see §5).

---

## 2. Put the project on GitHub (if you have not already)

1. Create a new repository (public or private) on GitHub.
2. Push this project so the folders **`user-mode/client`** and **`admin-mode/client`** exist in the repo.
3. Note your **default branch** name. These docs assume **`main`**. If yours is `master`, use that in Vercel’s **Production Branch** setting.

---

## 3. Create the first Vercel project — public website

### 3.1 Import the repo

1. Log in to [Vercel](https://vercel.com) → **Add New** → **Project**.
2. **Import** your GitHub repository (install the GitHub app for Vercel if asked).
3. Before you click **Deploy**, find **Root Directory** → click **Edit** → set it to:

   ```text
   user-mode/client
   ```

4. Vercel should **auto-detect** Vite. Check:
   - **Framework Preset:** Vite (or “Other” with the commands below)
   - **Build Command:** `npm run build` (or `vite build` — the default from `package.json` is `vite build` via `npm run build`)
   - **Output Directory:** `dist`
5. **Node.js Version** (Project → **Settings** → **General**, after first deploy if needed): **20.x** is a good match for development.

### 3.2 Environment variables (first deploy)

Vite bakes in variables that start with `VITE_` at **build** time.

For a **first test** (no custom domain, APIs not on AWS yet), you can use **empty** or **local**-style values, but the app expects:

| Name | What it is |
|------|------------|
| `VITE_API_URL` | Base URL of the **user** backend (REST + Socket.IO), **no trailing slash** |

**Example for early testing (replace with your real API later):**

```text
VITE_API_URL  →  http://localhost:4000
```

That only works if you run the user server on your **PC** and open the Vercel **preview** — not a real production setup. For production you will set:

```text
VITE_API_URL  →  https://api.mora9s.live
```

Do this in: **Project → Settings → Environment Variables** → add for **Production** (and **Preview** if you want).

### 3.3 Deploy

1. Click **Deploy**.
2. When it finishes, open the **`*.vercel.app`** link. You should see the public site.
3. If the home page loads but data never appears, the **API** is not reachable at `VITE_API_URL` — that is expected until AWS (or a tunnel) is set up. See [HOSTING_INTEGRATION.md](HOSTING_INTEGRATION.md).

### 3.4 SPA routing (refreshes on `/matches`, etc.)

This repo includes **`user-mode/client/vercel.json`** with a rewrite to `index.html` so **React Router** works on hard refresh. If you delete it, add the same in **Vercel → Project → `vercel.json`** or **Rewrites** in the dashboard.

---

## 4. Create the second Vercel project — admin website

1. In Vercel: **Add New** → **Project** again.
2. **Import the same GitHub repository.**
3. **Root Directory:** set to

   ```text
   admin-mode/client
   ```

4. **Build / Output:** same as above — `npm run build`, output **`dist`**.

5. **Environment variable:**

| Name | What it is |
|------|------------|
| `VITE_ADMIN_API` | Base URL of the **admin** backend, **no trailing slash** |

**Production example (when AWS is live):**

```text
VITE_ADMIN_API  →  https://admin-api.mora9s.live
```

6. **Deploy** and open the second `*.vercel.app` URL.

**Common mistake:** a sample `.env` used `VITE_USER_API` in the user client — the **code** actually reads **`VITE_API_URL`**. For the user site, only **`VITE_API_URL`** matters.

---

## 5. Custom domains on `mora9s.live` (Name.com)

You will point **only** the **web** subdomains to Vercel. **Do not** point `api` or `admin-api` here — those go to **AWS** (see [HOSTING_AWS.md](HOSTING_AWS.md)).

| Site | Vercel project | Custom domain to add in Vercel |
|------|----------------|---------------------------------|
| Public | user client | `www.mora9s.live` (and optional apex `mora9s.live`) |
| Admin | admin client | `admin.mora9s.live` |

### 5.1 Add a domain in Vercel

1. Open the **user** project → **Settings** → **Domains** → **Add**.
2. Enter `www.mora9s.live` and follow the wizard.
3. Vercel will show a **CNAME** target (e.g. `cname.vercel-dns.com` or a long `*.vercel-dns.com` name).
4. In **Name.com** → **My Domains** → **mora9s.live** → **Manage DNS**:
   - **Type:** CNAME  
   - **Name / Host:** `www`  
   - **Value:** exactly what Vercel shows  
   - **TTL:** automatic or 3600  

5. Wait until Vercel marks the domain **Valid** and HTTPS is active (can take a few minutes to hours).

Repeat for the **admin** project and **`admin.mora9s.live`** (CNAME for host **`admin`).

### 5.2 Apex domain `mora9s.live` (optional)

Two ways (pick **one** — do not set conflicting records):

- **A — Point apex at Vercel:** In the **user** project, add domain **`mora9s.live`**. Vercel shows an **A** record with an **IPv4** — add that for **`@`** at Name.com. **Copy the IP from Vercel**; do not use random IPs from old blog posts.
- **B — Redirect at Name.com:** Set **URL redirect** (301) from `mora9s.live` → `https://www.mora9s.live` using Name.com’s tools only (no Vercel apex A record in that case).

---

## 6. After you change `VITE_*` variables

Vite **embeds** env vars when it **builds**. If you change `VITE_API_URL` or `VITE_ADMIN_API` in the Vercel dashboard:

- Trigger a **new deployment** (e.g. **Redeploy** the latest build, or push a small commit).

---

## 7. Connect Git: automatic deploys on push

1. In each Vercel project, confirm **Settings → Git** has the correct **repository** and **Production Branch** = `main`.
2. Every push to `main` (that Vercel watches) can trigger a new production build — depending on your “Ignored Build Step” settings.

**Alternative:** this repo can use **GitHub Actions** to deploy (`.github/workflows/deploy-vercel-frontends.yml`) with a Vercel token — optional; the dashboard “Import Git” method is enough for most beginners.

---

## 8. Checklist (Vercel only)

- [ ] Two projects, roots **`user-mode/client`** and **`admin-mode/client`**
- [ ] **Production** env: `VITE_API_URL` (user) and `VITE_ADMIN_API` (admin) set to your real API **HTTPS** URLs when APIs exist
- [ ] **`vercel.json`** rewrites present (or equivalent) in both clients
- [ ] Custom domains `www` + `admin` (and optional apex) verified on Vercel
- [ ] Redeploy after any `VITE_*` change

---

## 9. Troubleshooting (Vercel)

| Problem | What to do |
|--------|------------|
| **Build failed** | Check **Root Directory**; in **Build & Development Settings**, set **Node** to 20.x; run `npm run build` locally in that folder. |
| **White screen on refresh** for `/something` | Keep **`vercel.json`** rewrites to `/index.html`. |
| **API errors / CORS in browser** | The browser calls whatever you put in `VITE_API_URL` / `VITE_ADMIN_API`. Fix the **API** host and CORS on the **server** (see [HOSTING_INTEGRATION.md](HOSTING_INTEGRATION.md)). |
| **“Invalid environment variable”** | Names must be exactly **`VITE_API_URL`** and **`VITE_ADMIN_API`**. |

---

## 10. Next step

- **APIs + database on AWS:** [HOSTING_AWS.md](HOSTING_AWS.md)  
- **How the pieces connect (DNS, order, CORS, Socket.IO):** [HOSTING_INTEGRATION.md](HOSTING_INTEGRATION.md)  

**Index of all hosting docs:** [HOSTING.md](HOSTING.md)
