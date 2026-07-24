#!/usr/bin/env bash
# Production status overview for FloorExpert (never prints secrets).
set -Eeuo pipefail

APP_NAME="${APP_NAME:-floorexpert}"
APP_DIR="${APP_DIR:-/opt/floorexpert}"
APP_PORT="${APP_PORT:-3000}"
NGINX_SITE_AVAILABLE="/etc/nginx/sites-available/${APP_NAME}"

log()  { printf '[INFO]  %s\n' "$*"; }
err()  { printf '[ERROR] %s\n' "$*" >&2; }
die()  { err "$*"; exit 1; }
section() {
  printf '\n======== %s ========\n' "$*"
}

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    die "This script must be run as root. Try: sudo $0"
  fi
}

detect_domain() {
  if [[ -n "${DOMAIN:-}" ]]; then
    printf '%s' "${DOMAIN}"
    return 0
  fi
  if [[ -f "${NGINX_SITE_AVAILABLE}" ]]; then
    awk '/server_name/ {
      for (i = 2; i <= NF; i++) {
        gsub(/;/, "", $i)
        if ($i != "_" && $i != "") {
          printf "%s%s", (out ? " " : ""), $i
          out = 1
        }
      }
      if (out) exit
    }' "${NGINX_SITE_AVAILABLE}"
    return 0
  fi
  printf ''
}

main() {
  require_root

  section "Git"
  if [[ -d "${APP_DIR}/.git" ]]; then
    printf 'Directory : %s\n' "${APP_DIR}"
    printf 'Branch    : %s\n' "$(git -C "${APP_DIR}" rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
    printf 'Commit    : %s\n' "$(git -C "${APP_DIR}" rev-parse HEAD 2>/dev/null || echo unknown)"
    printf 'Subject   : %s\n' "$(git -C "${APP_DIR}" log -1 --pretty=%s 2>/dev/null || echo unknown)"
  else
    printf 'Not a git repository: %s\n' "${APP_DIR}"
  fi

  section "Docker Compose"
  if [[ -f "${APP_DIR}/compose.yaml" || -f "${APP_DIR}/compose.yml" || -f "${APP_DIR}/docker-compose.yml" ]]; then
    (
      cd "${APP_DIR}"
      docker compose ps || true
    )
  else
    printf 'compose file not found in %s\n' "${APP_DIR}"
  fi

  section "Container health"
  local container_id
  container_id="$(docker ps -aqf "name=^/${APP_NAME}$" || true)"
  if [[ -n "${container_id}" ]]; then
    docker inspect --format='Name={{.Name}} Status={{.State.Status}} Health={{if .State.Health}}{{.State.Health.Status}}{{else}}n/a{{end}} Started={{.State.StartedAt}}' "${container_id}" || true
  else
    printf 'Container %s not found\n' "${APP_NAME}"
  fi

  section "Recent application logs"
  if [[ -d "${APP_DIR}" ]]; then
    (
      cd "${APP_DIR}"
      docker compose logs --tail=50 app 2>/dev/null || true
    )
  fi

  section "Nginx"
  if systemctl is-active --quiet nginx; then
    printf 'service: active\n'
  else
    printf 'service: %s\n' "$(systemctl is-active nginx 2>/dev/null || echo unknown)"
  fi
  if command -v nginx >/dev/null 2>&1; then
    if nginx -t 2>&1; then
      :
    fi
  else
    printf 'nginx binary not found\n'
  fi

  section "UFW"
  if command -v ufw >/dev/null 2>&1; then
    ufw status verbose || true
  else
    printf 'ufw not installed\n'
  fi

  section "Local health check"
  printf 'GET http://127.0.0.1:%s -> ' "${APP_PORT}"
  curl -sS -o /dev/null -w 'HTTP %{http_code} (%{time_total}s)\n' "http://127.0.0.1:${APP_PORT}" || printf 'failed\n'

  local domains primary
  domains="$(detect_domain)"
  if [[ -n "${domains}" ]]; then
    # shellcheck disable=SC2206
    local -a domain_arr=(${domains})
    primary="${domain_arr[0]}"
    section "Public HTTPS check (${primary})"
    printf 'GET https://%s -> ' "${primary}"
    curl -sS -o /dev/null -w 'HTTP %{http_code} (%{time_total}s)\n' "https://${primary}" || printf 'failed (or SSL not configured)\n'
  else
    section "Public HTTPS check"
    printf 'No domain configured (set DOMAIN or configure Nginx server_name)\n'
  fi

  printf '\n'
  log "Status complete (Telegram secrets intentionally omitted)"
}

main "$@"
