#!/usr/bin/env bash
# Tail Docker Compose logs for the FloorExpert app service.
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/opt/floorexpert}"
LINES="${1:-200}"

if [[ "${EUID}" -ne 0 ]]; then
  printf '[ERROR] This script must be run as root. Try: sudo %s\n' "$0" >&2
  exit 1
fi

if [[ ! "${LINES}" =~ ^[0-9]+$ ]]; then
  printf '[ERROR] Lines argument must be a positive integer (got: %s)\n' "${LINES}" >&2
  exit 1
fi

if [[ ! -d "${APP_DIR}" ]]; then
  printf '[ERROR] Application directory not found: %s\n' "${APP_DIR}" >&2
  exit 1
fi

cd "${APP_DIR}"
exec docker compose logs --tail="${LINES}" --timestamps app
