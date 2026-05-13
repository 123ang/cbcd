# Deploy CBCD to a VPS

This guide deploys the React/Vite frontend as static files behind Nginx on port **3017**, and the FastAPI backend bound to **127.0.0.1:4017** (proxied at `/api`).

Assumptions:

- VPS OS: Ubuntu 22.04/24.04
- Domain: **`cbcd.suntzutechnologies.com`**
- Project folder on VPS: **`/root/projects/cbcd`**
- Nginx listens on **`3017`** for HTTP (SPA + `/api` reverse proxy)
- Backend listens only on localhost: **`127.0.0.1:4017`**

**Permissions:** Nginx workers and systemd often run as `www-data`. A repo under `/root` is normally not readable by `www-data`. After cloning, either:

- **`chown -R www-data:www-data /root/projects/cbcd`** and **`chmod 755 /root`** (simple; consider whether tightening `/root` is acceptable), or  
- Prefer **`/srv/cbcd`** / **`/var/www/cbcd`** with the same user if you want stricter isolation.

Visitors open:

```text
http://cbcd.suntzutechnologies.com:3017/
```

(and `curl` examples below use `:3017`).

---

## 1. Install VPS packages

```bash
sudo apt update
sudo apt install -y git nginx python3 python3-venv python3-pip nodejs npm certbot python3-certbot-nginx
```

Check versions:

```bash
node -v
npm -v
python3 --version
nginx -v
```

If Ubuntu gives you a very old Node version, install Node 20 LTS instead:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## 2. Upload or clone the project

Option A — clone from GitHub (path you chose):

```bash
sudo mkdir -p /root/projects
sudo chown -R "$USER:$USER" /root/projects 2>/dev/null || true
cd /root/projects
sudo git clone <YOUR_REPO_URL> cbcd
cd cbcd
```

If the clone is owned by root, align ownership before running the backend as `www-data` / serving files:

```bash
sudo chown -R www-data:www-data /root/projects/cbcd
```

Option B — upload from your Mac:

```bash
rsync -av --exclude backend/.venv --exclude frontend/node_modules --exclude frontend/dist \
  /path/to/local/cbcd/ USER@YOUR_VPS_IP:/root/projects/cbcd/
```

Then SSH into the VPS:

```bash
ssh USER@YOUR_VPS_IP
cd /root/projects/cbcd
```

---

## 3. Set up the FastAPI backend

```bash
cd /root/projects/cbcd/backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Test manually:

```bash
uvicorn main:app --host 127.0.0.1 --port 4017
```

In another SSH tab:

```bash
curl http://127.0.0.1:4017/health
```

Expected:

```json
{"ok":true,"phase":"phase_1"}
```

Stop the manual server with `Ctrl+C`.

---

## 4. Create a systemd service for backend

```bash
sudo nano /etc/systemd/system/cbcd-api.service
```

Paste:

```ini
[Unit]
Description=CBCD FastAPI backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/root/projects/cbcd/backend
ExecStart=/root/projects/cbcd/backend/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 4017
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Give Nginx/systemd user ownership if needed:

```bash
sudo chown -R www-data:www-data /root/projects/cbcd/backend
```

Start it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable cbcd-api
sudo systemctl start cbcd-api
sudo systemctl status cbcd-api
```

Check logs:

```bash
sudo journalctl -u cbcd-api -f
```

---

## 5. Build the frontend

Because Nginx will proxy `/api` to the backend, build the frontend with:

```bash
cd /root/projects/cbcd/frontend
cat > .env.production <<'EOF'
VITE_API_BASE=/api
EOF
npm install
npm run build
```

The built files will be in:

```bash
/root/projects/cbcd/frontend/dist
```

---

## 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/cbcd
```

Paste:

```nginx
server {
    listen 3017;
    server_name cbcd.suntzutechnologies.com;

    root /root/projects/cbcd/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4017/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Important: `proxy_pass http://127.0.0.1:4017/;` has a trailing `/`. This makes `/api/health` become backend `/health`.

Enable the site:

```bash
sudo ln -sf /etc/nginx/sites-available/cbcd /etc/nginx/sites-enabled/cbcd
sudo nginx -t
sudo systemctl reload nginx
```

Test (from anywhere that can reach the VPS):

```bash
curl http://cbcd.suntzutechnologies.com:3017/api/health
```

Expected:

```json
{"ok":true,"phase":"phase_1"}
```

**Firewall:** allow **3017** (and **80**/**443** if you add HTTPS on standard ports).

```bash
sudo ufw allow 3017/tcp
sudo ufw reload
```

---

## 7. Add HTTPS with Certbot

Certbot’s HTTP-01 challenge usually expects **port 80** on the hostname. Options:

1. Add a **`listen 80;`** server block for the same `server_name` (short-term for issuance), issue the cert, then either keep port 80 for redirect or rely on renewal hooks.  
2. Use **`certbot certonly --dns-*`** / your DNS provider’s plugin if port 80 is not available.

If you extend the nginx site with SSL on **443**:

```bash
sudo certbot --nginx -d cbcd.suntzutechnologies.com
```

Then visitors would use **`https://cbcd.suntzutechnologies.com`** (without `:3017` if you migrate the app to `listen 443 ssl` and drop or proxy the custom port). Adjust the `server` block after Certbot’s edits to match how you want **3017** vs **443** to behave.

---

## 8. Update deployment after code changes

If using Git:

```bash
cd /root/projects/cbcd
git pull

cd backend
source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart cbcd-api

cd ../frontend
npm install
npm run build
sudo systemctl reload nginx
```

If uploading with `rsync`, upload first, then run the same backend/frontend restart commands on VPS.

---

## 9. Quick troubleshooting

### Frontend says “Failed to fetch”

Check API through Nginx:

```bash
curl http://cbcd.suntzutechnologies.com:3017/api/health
```

If this fails, check backend:

```bash
sudo systemctl status cbcd-api
sudo journalctl -u cbcd-api -n 100
```

Check Nginx:

```bash
sudo nginx -t
sudo tail -n 100 /var/log/nginx/error.log
```

### Backend works locally but `/api` fails

Confirm Nginx location has:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:4017/;
}
```

Then reload:

```bash
sudo systemctl reload nginx
```

### Port conflict

```bash
sudo lsof -nP -iTCP:3017 -sTCP:LISTEN
sudo lsof -nP -iTCP:4017 -sTCP:LISTEN
```

Align **systemd `ExecStart`** and **`proxy_pass`** if you change the backend port.

### www-data cannot read `/root/projects/cbcd`

Either fix ownership/path as in section 2, run the backend as **`User=root`** only if you accept that tradeoff, or move the checkout to **`/srv/cbcd`** / **`/var/www/cbcd`** and update paths in systemd and nginx.

---

## 10. Local development reminder

For local development, this project commonly uses:

```env
# frontend/.env
VITE_API_BASE=http://localhost:8001
```

Run backend locally:

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8001
```

Run frontend locally:

```bash
cd frontend
npm run dev
```

Local ports are independent of VPS **3017** / **4017**.
