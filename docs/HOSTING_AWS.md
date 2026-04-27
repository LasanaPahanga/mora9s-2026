# Hosting the backends on AWS (beginner)

This guide is **only** about running the **two Node/Express** servers and **MySQL** on **one Amazon EC2** instance (simple and cheap for events):

- **User API + Socket.IO** — `user-mode/server` (port **4000** inside the machine)
- **Admin API** — `admin-mode/server` (port **5000**)
- **MySQL** — same EC2, accessed only from localhost by the two servers

**Public URLs in examples:** `https://api.mora9s.live` and `https://admin-api.mora9s.live` (HTTPS via **Nginx** + **Let’s Encrypt**). Your domain DNS (Name.com) must point `api` and `admin-api` to this server’s public IP. The **React apps** on Vercel are covered in [HOSTING_VERCEL.md](HOSTING_VERCEL.md); how everything fits together is in [HOSTING_INTEGRATION.md](HOSTING_INTEGRATION.md).

---

## 1. What you need

| Item | Why |
|------|-----|
| **AWS account** | To create an EC2 instance. |
| **Domain DNS** (e.g. Name.com) | **A** records for `api.mora9s.live` and `admin-api.mora9s.live` → your EC2 public IPv4. |
| **.pem key** | Created when you launch EC2; used for **SSH** (and optional GitHub Actions deploy). |
| **GitHub** | To `git clone` the repo on the server (PAT or deploy key). |

**Frontends (Vercel) are not required** to get the APIs running: you can test with `curl` or temporary open ports before Nginx is set up.

---

## 2. Create an EC2 instance

1. **AWS Console** → **EC2** → **Launch instance**.
2. **Name:** e.g. `mora9s-backend`
3. **OS:** **Ubuntu 22.04** LTS (or newer LTS).
4. **Instance type:** `t3.micro` or `t2.micro` (see **Free Tier** in your account).
5. **Key pair:** create **new** → type **RSA** or **ED25519** → download the **`.pem`** file. Store it in a **safe** folder.
6. **Network:** allow:
   - **SSH (22)** from **My IP** (for your PC only, best practice) or **0.0.0.0/0** for learning (weaker).
   - **HTTP (80)** and **HTTPS (443)** for the world (needed for Nginx + Let’s Encrypt).
   - Optionally, for first tests only, **4000** and **5000** to **My IP** — close them later and use only **Nginx** on **443** (see §7).

7. **Storage:** 8–20 GiB is usually enough.
8. **Launch** → wait for **2/2 status checks** → note the **public IPv4** (consider an **Elastic IP** if the IP should not change when you stop the instance).

---

## 3. Connect with SSH (Windows: PowerShell)

```bash
ssh -i "C:\path\to\your-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

First time, type `yes` if asked to trust the host.

---

## 4. Install system packages, Node, PM2, MySQL

Run on the **EC2** machine (as `ubuntu`, use `sudo` where below).

### 4.1 Update and install Nginx + Certbot

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx certbot python3-certbot-nginx
```

### 4.2 Node.js 20 (NodeSource)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

### 4.3 PM2 (keeps your Node processes alive)

```bash
sudo npm install -g pm2
```

### 4.4 MySQL

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

Create database and user (change the password!):

```bash
sudo mysql -u root
```

```sql
CREATE DATABASE mora9s_2026 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mora9s_app'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON mora9s_2026.* TO 'mora9s_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Import your **schema and data** (use your own `.sql` dump or migration):

```bash
mysql -u mora9s_app -p mora9s_2026 < /path/to/your/schema.sql
```

---

## 5. Clone the app and install backend dependencies

```bash
sudo mkdir -p /var/www
sudo chown ubuntu:ubuntu /var/www
cd /var/www
git clone https://github.com/YOUR_GITHUB_USER/YOUR_REPO.git mora9s-2026
cd mora9s-2026
```

(Use a **GitHub Personal Access Token** in the HTTPS URL if the repo is private, or set up a **deploy key**.)

```bash
cd /var/www/mora9s-2026/user-mode/server && npm ci
cd /var/www/mora9s-2026/admin-mode/server && npm ci
```

**Default path in this repo’s GitHub Action:** `/var/www/mora9s-2026` — if you use another path, update **`.github/workflows/deploy-aws-backend.yml`** (`DEPLOY_PATH`).

---

## 6. Environment files (`.env`) on the server

### 6.1 User server

File: **`/var/www/mora9s-2026/user-mode/server/.env`**

```env
USER_SERVER_PORT=4000
DB_HOST=127.0.0.1
DB_USER=mora9s_app
DB_PASSWORD=STRONG_PASSWORD_HERE
DB_NAME=mora9s_2026
```

### 6.2 Admin server

File: **`/var/www/mora9s-2026/admin-mode/server/.env`**

```env
ADMIN_SERVER_PORT=5000
DB_HOST=127.0.0.1
DB_USER=mora9s_app
DB_PASSWORD=STRONG_PASSWORD_HERE
DB_NAME=mora9s_2026
JWT_SECRET=use-a-long-random-string-at-least-32-chars
USER_SERVER_URL=https://api.mora9s.live
```

- **`USER_SERVER_URL`** must be the **public HTTPS** address of the **user** server (the one browsers and Socket.IO use). No trailing slash.  
- The admin server **connects to** the user server to broadcast real-time events to public clients.

**Start the user process before the admin** the first time (PM2 start order below).

### 6.3 Run with PM2

```bash
cd /var/www/mora9s-2026
# Use absolute paths for the script (PM2 can double the path if you use user-mode/server/... with --cwd)
pm2 start /var/www/mora9s-2026/user-mode/server/src/app.js --name mora9s-user --cwd /var/www/mora9s-2026/user-mode/server
pm2 start /var/www/mora9s-2026/admin-mode/server/src/app.js --name mora9s-admin --cwd /var/www/mora9s-2026/admin-mode/server
pm2 save
pm2 startup
```

Run the command `pm2 startup` prints (with `sudo`) so processes survive reboot.

```bash
pm2 logs
```

### 6.4 Admin user (if your project uses `create-admin.js`)

```bash
cd /var/www/mora9s-2026/admin-mode/server
node create-admin.js
```

Read the script in the repo for exact flags and defaults.

---

## 7. DNS at Name.com (API hostnames)

Before **Let’s Encrypt** can issue certificates for your API domain names, DNS must point to this EC2 address.

| Type | Host | Value |
|------|------|--------|
| **A** | `api` | **Public IPv4** of this EC2 (same for both if one server) |
| **A** | `admin-api` | **Same** IPv4 |

(If you use **Elastic IP**, use that as the A record value.)

**Do not** CNAME `api` to Vercel — APIs stay on this machine.

---

## 8. Nginx + HTTPS (Certbot)

1. You should have **Nginx** and **Certbot** installed (§4.1). Create **server blocks** for:
   - `api.mora9s.live` → `http://127.0.0.1:4000` (**WebSocket** support required for Socket.IO)
   - `admin-api.mora9s.live` → `http://127.0.0.1:5000`

2. Issue certificates (example; Certbot can modify Nginx for you):

```bash
sudo certbot --nginx -d api.mora9s.live -d admin-api.mora9s.live
```

3. **Socket.IO (user server)** needs these headers in the **location** block for `api.mora9s.live`:

```nginx
location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

4. **Admin** API block: normal `proxy_pass` to `127.0.0.1:5000` with `Host` and `X-Forwarded-*` is usually enough (no WebSockets required for the admin **server** in this app’s design).

5. Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

6. In the **EC2 security group**, remove public access to **4000** and **5000** if you were testing with them; keep **22**, **80**, **443** as needed.

---

## 9. CORS and Socket.IO (production hardening)

The sample code uses open `cors()`. In production, restrict **origins** to your Vercel sites (see [HOSTING_INTEGRATION.md](HOSTING_INTEGRATION.md)) and set **Socket.IO** `cors.origin` on the **user** server the same way.

---

## 10. Optional: deploy from GitHub Actions

This repository includes **`.github/workflows/deploy-aws-backend.yml`**. It SSHs into the server, `git pull`, `npm ci`, and **PM2** restart.

**GitHub secrets:** `EC2_HOST`, `EC2_USER` (e.g. `ubuntu`), `EC2_SSH_KEY` (full `.pem` text).

The server must already have a clone at **`DEPLOY_PATH`** in that workflow and `git` able to `pull`.

---

## 11. Checklist (AWS)

- [ ] EC2 up; security group allows 22, 80, 443 (and not 4000/5000 to the public if Nginx is used).
- [ ] MySQL running; `mora9s_2026` and `mora9s_app` work; data imported.
- [ ] Both `.env` files present; `USER_SERVER_URL` = `https://api.mora9s.live`.
- [ ] `JWT_SECRET` is strong.
- [ ] `pm2` shows both apps **online**; `pm2 save` + `pm2 startup` done.
- [ ] `api` + `admin-api` **A** records → EC2 IP; Certbot **HTTPS** works.
- [ ] Nginx **WebSocket** headers on **api** host.

---

## 12. Troubleshooting (AWS)

| Problem | What to check |
|--------|----------------|
| **502 / Bad Gateway** | `pm2 status`; are apps listening? `pm2 logs`; Nginx `error.log`. |
| **Cannot `git pull` on server** | Credentials for private repo; deploy key. |
| **Admin cannot broadcast to public** | `USER_SERVER_URL` matches public **user** URL; user server running; Nginx websockets for **api**. |
| **Certificate errors** | DNS **A** records propagated; `certbot` succeeded; time on server (`date`). |

---

## 13. After the event (save money)

Stop or **terminate** the EC2 if you do not need it. Release an unused **Elastic IP** to avoid charges (AWS rules vary by account).

---

## 14. Related docs

- **Vercel (two frontends):** [HOSTING_VERCEL.md](HOSTING_VERCEL.md)  
- **Merging Vercel + AWS (DNS, env, order):** [HOSTING_INTEGRATION.md](HOSTING_INTEGRATION.md)  
- **Index:** [HOSTING.md](HOSTING.md)  
