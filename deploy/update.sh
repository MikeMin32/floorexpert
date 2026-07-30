#!/usr/bin/env bash
# Zero-downtime-friendly update for FloorExpert (fast-forward pull + rebuild).
set -Eeuo pipefail

APP_NAME="${APP_NAME:-floorexpert}"
APP_DIR="${APP_DIR:-/opt/floorexpert}"
BRANCH="${BRANCH:-main}"
APP_PORT="${APP_PORT:-3000}"

log()  { printf '[INFO]  %s\n' "$*"; }
warn() { printf '[WARN]  %s\n' "$*" >&2; }
err()  { printf '[ERROR] %s\n' "$*" >&2; }
die()  { err "$*"; exit 1; }

trap 'err "Update failed at line ${LINENO}. See messages above."' ERR

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    die "This script must be run as root. Try: sudo $0"
  fi
}

require_git_repo() {
  if [[ ! -d "${APP_DIR}/.git" ]]; then
    die "${APP_DIR} is not a git repository"
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

validate_env() {
  local env_file="${APP_DIR}/.env"
  local token chat_id

  if [[ ! -f "${env_file}" ]]; then
    die "Missing ${env_file}. Create it from .env.example and set Telegram credentials."
  fi

  token="$(load_env_value TELEGRAM_BOT_TOKEN)"
  chat_id="$(load_env_value TELEGRAM_CHAT_ID)"
  if [[ -z "${token}" || -z "${chat_id}" ]]; then
    die "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set and non-empty in ${env_file}"
  fi
  log "Environment file validated (secrets not shown)"
}

wait_for_app_healthy() {
  local max_attempts="${1:-90}"
  local attempt=1
  local container_id health http_code

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

  return 1
}

compose_up() {
  ensure_leads_data_dir
  (
    cd "${APP_DIR}"
    docker compose up -d --build --remove-orphans
  )
}

ensure_leads_data_dir() {
  # Bind-mounted JSON store; uid 1001 matches the Dockerfile nextjs user.
  mkdir -p "${APP_DIR}/data"
  chown -R 1001:1001 "${APP_DIR}/data"
  chmod 750 "${APP_DIR}/data"
  log "Lead store directory ready at ${APP_DIR}/data"
}

rollback_to_commit() {
  local previous_commit="$1"
  warn "Attempting rollback to ${previous_commit}"
  # Keep the branch pointer on the previous commit (avoid detached HEAD)
  git -C "${APP_DIR}" reset --hard "${previous_commit}"
  compose_up
  if wait_for_app_healthy 90; then
    err "Rollback to ${previous_commit} succeeded, but the update itself failed"
    return 1
  fi
  err "Rollback also failed to become healthy"
  (
    cd "${APP_DIR}"
    docker compose logs --tail=200 app || true
  )
  return 1
}

reload_nginx() {
  if command -v nginx >/dev/null 2>&1; then
    nginx -t
    systemctl reload nginx
    log "Nginx validated and reloaded"
  else
    warn "nginx not found; skipping reload"
  fi
}

main() {
  require_root
  require_git_repo

  local previous_commit
  local remote_tip
  previous_commit="$(git -C "${APP_DIR}" rev-parse HEAD)"

  log "Fetching origin..."
  git -C "${APP_DIR}" fetch --prune origin

  if ! git -C "${APP_DIR}" rev-parse --verify "origin/${BRANCH}" >/dev/null 2>&1; then
    die "Remote branch origin/${BRANCH} not found"
  fi

  remote_tip="$(git -C "${APP_DIR}" rev-parse "origin/${BRANCH}")"

  log "Commits that will be deployed (local HEAD..origin/${BRANCH}):"
  if [[ "${previous_commit}" == "${remote_tip}" ]]; then
    log "(no new commits — rebuilding current revision)"
  else
    git -C "${APP_DIR}" log --oneline "${previous_commit}..origin/${BRANCH}" || true
  fi

  log "Pulling ${BRANCH} with fast-forward only"
  git -C "${APP_DIR}" checkout "${BRANCH}"
  git -C "${APP_DIR}" pull --ff-only origin "${BRANCH}"

  validate_env

  log "Building and starting updated containers"
  compose_up

  if ! wait_for_app_healthy 90; then
    err "New deployment is unhealthy — printing logs"
    (
      cd "${APP_DIR}"
      docker compose logs --tail=200 app || true
    )
    rollback_to_commit "${previous_commit}"
    exit 1
  fi

  log "Pruning dangling Docker images"
  docker image prune -f

  reload_nginx

  local deployed
  deployed="$(git -C "${APP_DIR}" rev-parse --short HEAD)"
  log "Deployed Git commit: ${deployed} ($(git -C "${APP_DIR}" rev-parse HEAD))"
  log "Update complete"
}

main "$@"
