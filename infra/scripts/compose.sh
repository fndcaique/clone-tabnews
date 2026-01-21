#!/usr/bin/env bash
set -e

COMPOSE_FILE="infra/compose.yaml"

if docker compose version >/dev/null 2>&1; then
  echo "➡️ Usando: docker compose"
  docker compose -f "$COMPOSE_FILE" "$@"
elif command -v docker-compose >/dev/null 2>&1; then
  echo "➡️ Usando: docker-compose"
  docker-compose -f "$COMPOSE_FILE" "$@"
else
  echo "❌ Docker Compose não encontrado"
  exit 1
fi
