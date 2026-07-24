#!/usr/bin/env bash
# First-time production installation for FloorExpert on Ubuntu 24.04.
set -Eeuo pipefail

APP_NAME="${APP_NAME:-floorexpert}"
REPO_URL="${REPO_URL:-https://github.com/MikeMin32/floorexpert.git}"
APP_DIR="${APP_DIR:-/opt/floorexpert}"
BRANCH="${BRANCH:-main}"
APP_PORT="${APP_PORT:-3000}"
DOMAIN="${DOMAIN:-}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-}"

NGINX_SITE_AVAILABLE="/etc/nginx/sites-available/${APP_NAME}"
NGINX_SITE_ENABLED="/etc/nginx/sites-enabled/${APP_NAME}"
NGINX_DEFAULT_ENABLED="/etc/nginx/sites-enabled/default"

log()  { printf '[INFO]  %s\n' "$*"; }
warn() { printf '[WARN]  %s\n' "$*" >&2; }
err()  { printf '[ERROR] %s\n' "$*" >&2; }
die()  { err "$*"; exit 1; }

trap 'err "Install failed at line ${LINENO}. See messages above."' ERR

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    die "This script must be run as root. Try: sudo $0"
  fi
}

is_pkg_installed() {
  dpkg -s "$1" >/dev/null 2>&1
}

apt_install_missing() {
  local packages=("$@")
  local missing=()
  local pkg

  for pkg in "${packages[@]}"; do
    if ! is_pkg_installed "${pkg}"; then
      missing+=("${pkg}")
    fi
  done

  if ((${#missing[@]} > 0)); then
    log "Installing packages: ${missing[*]}"
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y
    apt-get install -y "${missing[@]}"
  else
    log "Required apt packages already installed"
  fi
}

install_docker_if_missing() {
  if command -v docker >/dev/null 2>&1 \
    && docker compose version >/dev/null 2>&1; then
    log "Docker Engine and Compose plugin already installed"
    return 0
  fi

  log "Installing Docker Engine from Docker's official apt repository"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y ca-certificates curl

  install -m 0755 -d /etc/apt/keyrings
  if [[ ! -f /etc/apt/keyrings/docker.asc ]]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
  fi

  local arch
  local codename
  arch="$(dpkg --print-architecture)"
  # shellcheck source=/dev/null
  codename="$(. /etc/os-release && printf '%s' "${VERSION_CODENAME}")"

  printf 'deb [arch=%s signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu %s stable\n' \
    "${arch}" "${codename}" \
    > /etc/apt/sources.list.d/docker.list

  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
}

enable_services() {
  local svc
  for svc in docker nginx fail2ban; do
    systemctl enable --now "${svc}"
  done
  log "Enabled and started: docker, nginx, fail2ban"
}

clone_or_update_repo() {
  if [[ -d "${APP_DIR}/.git" ]]; then
    log "Repository already exists at ${APP_DIR}"
    local remote_url
    remote_url="$(git -C "${APP_DIR}" remote get-url origin 2>/dev/null || true)"
    if [[ -z "${remote_url}" ]]; then
      die "${APP_DIR} is a git repo but has no origin remote"
    fi
    # Accept either .git or non-.git URL forms
    local normalized_remote normalized_expected
    normalized_remote="${remote_url%.git}"
    normalized_expected="${REPO_URL%.git}"
    if [[ "${normalized_remote}" != "${normalized_expected}" ]]; then
      die "Existing repo origin is '${remote_url}', expected '${REPO_URL}'"
    fi
    git -C "${APP_DIR}" fetch --prune origin
    git -C "${APP_DIR}" checkout "${BRANCH}"
    git -C "${APP_DIR}" pull --ff-only origin "${BRANCH}"
    log "Updated ${APP_DIR} to latest ${BRANCH}"
  elif [[ -e "${APP_DIR}" ]]; then
    die "${APP_DIR} exists but is not a git repository"
  else
    log "Cloning ${REPO_URL} into ${APP_DIR}"
    mkdir -p "$(dirname "${APP_DIR}")"
    git clone --branch "${BRANCH}" "${REPO_URL}" "${APP_DIR}"
  fi
}

load_env_value() {
  local key="$1"
  local env_file="${APP_DIR}/.env"
  local line value

  line="$(grep -E "^${key}=" "${env_file}" | tail -n 1 || true)"
  if [[ -z "${line}" ]]; then
    printf ''
    return 0
  fi
  value="${line#"${key}="}"
  value="${value%$'\r'}"
  if [[ "${value}" == \"*\" && "${value}" == *\" ]]; then
    value="${value:1:-1}"
  elif [[ "${value}" == \'*\' && "${value}" == *\' ]]; then
    value="${value:1:-1}"
  fi
  printf '%s' "${value}"
}

telegram_env_populated() {
  local token chat_id
  token="$(load_env_value TELEGRAM_BOT_TOKEN)"
  chat_id="$(load_env_value TELEGRAM_CHAT_ID)"
  [[ -n "${token}" && -n "${chat_id}" ]]
}

ensure_env_file() {
  local env_file="${APP_DIR}/.env"
  local example_file="${APP_DIR}/.env.example"

  if [[ -f "${env_file}" ]]; then
    log ".env already exists — leaving it unchanged"
    chmod 600 "${env_file}" || true
    return 0
  fi

  if [[ -f "${example_file}" ]]; then
    cp "${example_file}" "${env_file}"
    log "Created .env from .env.example"
  else
    cat > "${env_file}" <<'EOF'
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
EOF
    log "Created template .env (no .env.example found)"
  fi

  chmod 600 "${env_file}"
  warn "Edit ${env_file} and set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID, then re-run this script."
  warn "Example: nano ${env_file} && chmod 600 ${env_file}"

  if ! telegram_env_populated; then
    # Newly created empty env — stop before any build
    die "Required environment variables are empty. Fill ${env_file}, then re-run."
  fi
}

validate_telegram_env() {
  if ! telegram_env_populated; then
    err "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set and non-empty in ${APP_DIR}/.env"
    err "Edit the file, then re-run this script. Secrets will not be printed."
    exit 1
  fi
  log "Telegram environment variables are present"
}

wait_for_app_healthy() {
  local max_attempts="${1:-60}"
  local attempt=1
  local container_id
  local health
  local http_code

  log "Waiting for application to become healthy..."
  while ((attempt <= max_attempts)); do
    container_id="$(docker ps -qf "name=^/${APP_NAME}$" || true)"
    if [[ -n "${container_id}" ]]; then
      health="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "${container_id}" 2>/dev/null || true)"
      if [[ "${health}" == "healthy" ]]; then
        log "Container is healthy"
        return 0
      fi
    fi

    http_code="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${APP_PORT}" || true)"
    if [[ "${http_code}" =~ ^(200|301|302|307|308)$ ]]; then
      log "Application responds on http://127.0.0.1:${APP_PORT} (HTTP ${http_code})"
      return 0
    fi

    sleep 2
    attempt=$((attempt + 1))
  done

  err "Application failed to become healthy in time"
  (
    cd "${APP_DIR}"
    docker compose logs --tail=200 app || true
  )
  return 1
}

start_application() {
  log "Building and starting ${APP_NAME} with Docker Compose"
  (
    cd "${APP_DIR}"
    docker compose up -d --build --remove-orphans
  )
  wait_for_app_healthy 90
}

configure_ufw() {
  log "Configuring UFW (OpenSSH + Nginx Full only; app port stays local)"
  ufw allow OpenSSH
  ufw allow "Nginx Full"
  ufw --force enable
  # Explicitly avoid opening APP_PORT publicly
  if ufw status | grep -Eq "(^|[[:space:]])${APP_PORT}(/tcp)?[[:space:]]"; then
    warn "UFW already has a rule involving port ${APP_PORT}; ensure it is not public if unintended"
  fi
  log "UFW enabled"
}

validate_domains() {
  local raw="$1"
  local domain
  local -a domains=()

  # shellcheck disable=SC2206
  domains=(${raw})
  if ((${#domains[@]} == 0)); then
    die "DOMAIN is empty"
  fi

  for domain in "${domains[@]}"; do
    if [[ ! "${domain}" =~ ^[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)+$ ]]; then
      die "Invalid domain: ${domain}"
    fi
  done
}

primary_domain() {
  # shellcheck disable=SC2206
  local -a domains=(${DOMAIN})
  printf '%s' "${domains[0]}"
}

write_nginx_common_body() {
  cat <<EOF
    client_max_body_size 2m;

    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml
        application/rss+xml
        image/svg+xml;

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
EOF
}

write_nginx_config() {
  log "Writing Nginx site config to ${NGINX_SITE_AVAILABLE}"

  if [[ -z "${DOMAIN}" ]]; then
    log "DOMAIN not set — configuring Nginx as default_server (server_name _)"
    {
      cat <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

EOF
      write_nginx_common_body
      printf '}\n'
    } > "${NGINX_SITE_AVAILABLE}"
  else
    local server_names="${DOMAIN}"
    {
      cat <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${server_names};

EOF
      write_nginx_common_body
      printf '}\n'
    } > "${NGINX_SITE_AVAILABLE}"
  fi

  # Ensure connection_upgrade map exists (idempotent)
  # Intentional literal $ in patterns (not shell expansion)
  # shellcheck disable=SC2016
  if ! grep -q 'map \$http_upgrade \$connection_upgrade' /etc/nginx/nginx.conf \
    && ! grep -Rqs 'map \$http_upgrade \$connection_upgrade' /etc/nginx/conf.d 2>/dev/null; then
    cat > /etc/nginx/conf.d/connection_upgrade.conf <<'EOF'
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}
EOF
  fi

  ln -sfn "${NGINX_SITE_AVAILABLE}" "${NGINX_SITE_ENABLED}"
  nginx -t
  if [[ -L "${NGINX_DEFAULT_ENABLED}" || -f "${NGINX_DEFAULT_ENABLED}" ]]; then
    rm -f "${NGINX_DEFAULT_ENABLED}"
    log "Removed default Nginx site"
  fi
  systemctl reload nginx
  log "Nginx configured and reloaded"
}

dns_resolves() {
  local host="$1"
  if command -v getent >/dev/null 2>&1; then
    getent ahosts "${host}" >/dev/null 2>&1 && return 0
  fi
  if command -v dig >/dev/null 2>&1; then
    dig +short "${host}" A | grep -q . && return 0
    dig +short "${host}" AAAA | grep -q . && return 0
  fi
  python3 - <<PY >/dev/null 2>&1
import socket
socket.getaddrinfo("${host}", None)
PY
}

configure_ssl_if_requested() {
  local primary
  local -a domains
  local domain
  local certbot_args=()

  if [[ -z "${DOMAIN}" ]]; then
    log "DOMAIN not set — skipping Certbot (HTTP default_server only)"
    return 0
  fi

  if [[ -z "${LETSENCRYPT_EMAIL}" ]]; then
    warn "LETSENCRYPT_EMAIL not set — leaving HTTP only"
    # shellcheck disable=SC2206
    domains=(${DOMAIN})
    printf '\nTo enable SSL later, run:\n  sudo certbot --nginx'
    for domain in "${domains[@]}"; do
      printf ' -d %s' "${domain}"
    done
    printf ' -m YOUR_EMAIL --agree-tos --redirect --non-interactive\n\n'
    return 0
  fi

  primary="$(primary_domain)"
  log "Verifying DNS for ${primary} before Certbot"
  if ! dns_resolves "${primary}"; then
    die "DNS does not resolve for ${primary}. Fix DNS, then re-run or use certbot manually."
  fi

  # shellcheck disable=SC2206
  domains=(${DOMAIN})
  for domain in "${domains[@]}"; do
    if ! dns_resolves "${domain}"; then
      die "DNS does not resolve for ${domain}"
    fi
    certbot_args+=(-d "${domain}")
  done

  log "Requesting Let's Encrypt certificate"
  certbot --nginx \
    --non-interactive \
    --agree-tos \
    --email "${LETSENCRYPT_EMAIL}" \
    --redirect \
    "${certbot_args[@]}"

  nginx -t
  systemctl reload nginx
  log "SSL configured; HTTP redirects to HTTPS"
}

ssl_status() {
  if [[ -z "${DOMAIN}" ]]; then
    printf 'HTTP only (default_server, no domain)'
    return 0
  fi
  local primary
  primary="$(primary_domain)"
  if [[ -d "/etc/letsencrypt/live/${primary}" ]]; then
    printf 'enabled (Let'\''s Encrypt)'
  else
    printf 'HTTP only (no certificate yet)'
  fi
}

print_summary() {
  local container_status="unknown"
  local health="unknown"
  local container_id

  container_id="$(docker ps -aqf "name=^/${APP_NAME}$" || true)"
  if [[ -n "${container_id}" ]]; then
    container_status="$(docker inspect --format='{{.State.Status}}' "${container_id}" 2>/dev/null || echo unknown)"
    health="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}n/a{{end}}' "${container_id}" 2>/dev/null || echo unknown)"
  fi

  cat <<EOF

========== FloorExpert install summary ==========
Application directory : ${APP_DIR}
Container status      : ${container_status} (health: ${health})
Local health URL      : http://127.0.0.1:${APP_PORT}
Public domain         : ${DOMAIN:-not set}
SSL status            : $(ssl_status)
Update command        : sudo ${APP_DIR}/deploy/update.sh
=================================================

EOF
}

main() {
  require_root
  log "Starting ${APP_NAME} first-time installation"

  apt_install_missing \
    git curl ca-certificates nginx ufw fail2ban certbot python3-certbot-nginx

  install_docker_if_missing
  enable_services
  clone_or_update_repo

  chmod +x "${APP_DIR}/deploy/"*.sh 2>/dev/null || true

  ensure_env_file
  validate_telegram_env
  start_application
  configure_ufw

  if [[ -n "${DOMAIN}" ]]; then
    validate_domains "${DOMAIN}"
  else
    log "DOMAIN not set — Nginx will use default_server (no interactive prompt)"
  fi
  write_nginx_config
  configure_ssl_if_requested
  print_summary
}

main "$@"
