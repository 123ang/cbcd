# Deploy CBCD to a VPS

This guide deploys the React/Vite frontend as static files and the FastAPI backend on port `8001` behind Nginx.

Assumptions:

- VPS OS: Ubuntu 22.04/24.04
- Domain example: `cbcd.example.com`
- Project folder on VPS: `/var/www/cbcd`
- Backend listens only on localhost: `127.0.0.1:8001`
- Public browser calls the API through Nginx at `/api`

Replace `cbcd.example.com` with your real domain.

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

Option A — clone from GitHub:

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone <YOUR_REPO_URL> cbcd
cd cbcd
```

Option B — upload from your Mac:

```bash
rsync -av --exclude backend/.venv --exclude frontend/node_modules --exclude frontend/dist \
  /Users/123ang/Desktop/Websites/cbcd/ USER@YOUR_VPS_IP:/var/www/cbcd/
```

Then SSH into the VPS:

```bash
ssh USER@YOUR_VPS_IP
cd /var/www/cbcd
```

---

## 3. Set up the FastAPI backend

```bash
cd /var/www/cbcd/backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Test manually:

```bash
uvicorn main:app --host 127.0.0.1 --port 8001
```

In another SSH tab:

```bash
curl http://127.0.0.1:8001/health
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
WorkingDirectory=/var/www/cbcd/backend
ExecStart=/var/www/cbcd/backend/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8001
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Give Nginx/systemd user ownership if needed:

```bash
sudo chown -R www-data:www-data /var/www/cbcd/backend
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
cd /var/www/cbcd/frontend
cat > .env.production <<'EOF'
VITE_API_BASE=/api
EOF
npm install
npm run build
```

The built files will be in:

```bash
/var/www/cbcd/frontend/dist
```

---

## 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/cbcd
```

Paste:

```nginx
server {
    listen 80;
    server_name cbcd.example.com;

    root /var/www/cbcd/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Important: `proxy_pass http://127.0.0.1:8001/;` has a trailing `/`. This makes `/api/health` become backend `/health`.

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/cbcd /etc/nginx/sites-enabled/cbcd
sudo nginx -t
sudo systemctl reload nginx
```

Test:

```bash
curl http://cbcd.example.com/api/health
```

Expected:

```json
{"ok":true,"phase":"phase_1"}
```

---

## 7. Add HTTPS with Certbot

Make sure your domain DNS A record points to the VPS IP first.

```bash
sudo certbot --nginx -d cbcd.example.com
```

Then test:

```bash
curl https://cbcd.example.com/api/health
```

Open:

```text
https://cbcd.example.com
```

---

## 8. Update deployment after code changes

If using Git:

```bash
cd /var/www/cbcd
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

If uploading from Mac with `rsync`, upload first, then run the same backend/frontend restart commands on VPS.

---

## 9. Quick troubleshooting

### Frontend says “Failed to fetch”

Check API through Nginx:

```bash
curl https://cbcd.example.com/api/health
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
    proxy_pass http://127.0.0.1:8001/;
}
```

Then reload:

```bash
sudo systemctl reload nginx
```

### Port conflict

Check what is using port `8001`:

```bash
sudo lsof -nP -iTCP:8001 -sTCP:LISTEN
```

Change the backend systemd port if needed, and update Nginx `proxy_pass` to the same port.

---

## 10. Local development reminder

For local Mac development, this project currently uses:

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
