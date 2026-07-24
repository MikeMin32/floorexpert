# Production deployment

Host Nginx reverse-proxies public traffic to a Docker Compose app bound only on `127.0.0.1:3000`. Telegram credentials live in a server-side `.env` and are never committed.

## Requirements

- Ubuntu 24.04 server
- Root / sudo access
- DNS A/AAAA records pointing at the server (for HTTPS / Certbot)
- Telegram bot token and chat ID

## First deployment

```bash
sudo -i
git clone https://github.com/MikeMin32/floorexpert.git /tmp/floorexpert-bootstrap
cd /tmp/floorexpert-bootstrap
chmod +x deploy/*.sh
DOMAIN="example.com www.example.com" \
LETSENCRYPT_EMAIL="admin@example.com" \
./deploy/install.sh
```

`install.sh` will:

1. Install system packages (Nginx, UFW, Fail2Ban, Certbot, Docker from Docker’s official apt repo)
2. Clone or update `/opt/floorexpert`
3. Create `/opt/floorexpert/.env` from `.env.example` if missing (never overwrites an existing `.env`)
4. Stop and ask you to fill Telegram values if they are empty
5. Build and start the Compose stack
6. Configure UFW (OpenSSH + Nginx Full only; port 3000 stays local)
7. Configure Nginx and optionally Let’s Encrypt

### Environment setup

If the installer created an empty `.env`, edit it before continuing (or before re-running):

```bash
nano /opt/floorexpert/.env
chmod 600 /opt/floorexpert/.env
```

Required variables:

```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

Do not use `NEXT_PUBLIC_` for these values.

### Enable SSL later

If you omit `LETSENCRYPT_EMAIL`, HTTP is left working. Enable HTTPS afterwards with:

```bash
sudo certbot --nginx \
  -d example.com \
  -d www.example.com \
  -m admin@example.com \
  --agree-tos \
  --redirect \
  --non-interactive
```

## Updates

```bash
sudo /opt/floorexpert/deploy/update.sh
```

Behavior:

- Fast-forward pull of `main` (override with `BRANCH=...`)
- Rebuilds and restarts with `docker compose up -d --build --remove-orphans`
- Does **not** run `docker compose down` (avoids unnecessary downtime)
- Waits for health; on failure prints logs and rolls back to the previous Git commit
- Prunes dangling images only after a successful deploy
- Reloads Nginx after `nginx -t`

## Status

```bash
sudo /opt/floorexpert/deploy/status.sh
```

Shows Git revision, Compose status, container health, recent logs, Nginx/UFW status, and local (and HTTPS when configured) curl checks. Secrets are never printed.

## Logs

```bash
sudo /opt/floorexpert/deploy/logs.sh
sudo /opt/floorexpert/deploy/logs.sh 500
```

Default is the last 200 lines from the `app` service.

## Rollback

`update.sh` attempts an automatic rollback if the new container does not become healthy:

1. Resets Git to the previous commit
2. Rebuilds and restarts Compose
3. Exits with failure (even if rollback recovers the site)

Manual rollback:

```bash
cd /opt/floorexpert
sudo git log --oneline -n 20
sudo git checkout <good-commit>
sudo docker compose up -d --build --remove-orphans
sudo /opt/floorexpert/deploy/status.sh
```

## Architecture

| Layer | Detail |
| --- | --- |
| Public | Host Nginx (`80` / `443`) |
| App | Docker Compose service `app`, container `floorexpert` |
| Bind | `127.0.0.1:3000:3000` only |
| Secrets | `/opt/floorexpert/.env` (mode `600`) |

## Optional install overrides

| Variable | Default |
| --- | --- |
| `APP_NAME` | `floorexpert` |
| `REPO_URL` | `https://github.com/MikeMin32/floorexpert.git` |
| `APP_DIR` | `/opt/floorexpert` |
| `BRANCH` | `main` |
| `APP_PORT` | `3000` |
| `DOMAIN` | interactive prompt if unset |
| `LETSENCRYPT_EMAIL` | unset (HTTP only) |

## Troubleshooting

```bash
# Container / Compose
sudo docker compose -f /opt/floorexpert/compose.yaml ps
sudo /opt/floorexpert/deploy/logs.sh 300
sudo docker inspect floorexpert --format '{{.State.Health.Status}}'

# Local app (bypasses Nginx)
curl -I http://127.0.0.1:3000

# Nginx
sudo nginx -t
sudo systemctl status nginx
sudo tail -n 100 /var/log/nginx/error.log

# Firewall
sudo ufw status verbose

# Rebuild without pulling Git
cd /opt/floorexpert
sudo docker compose up -d --build --remove-orphans
```

Common issues:

- **Empty Telegram env** — fill `/opt/floorexpert/.env`, then re-run `install.sh` or `update.sh`
- **Certbot DNS failure** — ensure A/AAAA records resolve to this server before requesting certificates
- **502 from Nginx** — confirm the container is healthy and listening on `127.0.0.1:3000`
- **Port 3000 unreachable publicly** — expected; only Nginx should be public
