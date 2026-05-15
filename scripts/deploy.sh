#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${HOME}/apps/hush"
BRANCH="main"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if [ ! -d "$PROJECT_DIR" ]; then
  log_error "Projet introuvable : $PROJECT_DIR"
  exit 1
fi

cd "$PROJECT_DIR"

if [ ! -f "$ENV_FILE" ]; then
  log_error "$ENV_FILE introuvable. Crée-le depuis .env.prod.example et génère les secrets via scripts/generate-secrets.sh"
  exit 1
fi

log_info "Pull dernière version depuis $BRANCH..."
git fetch origin
git reset --hard "origin/$BRANCH"

log_info "Build des images Docker..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build

log_info "Restart de la stack..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --remove-orphans

log_info "Nettoyage des images orphelines..."
docker image prune -f

log_info "Attente du démarrage..."
sleep 8
for i in {1..6}; do
  if docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps --services --filter "status=running" | grep -q .; then
    log_info "Stack opérationnelle ✓"
    break
  fi
  log_warn "Attente... ($i/6)"
  sleep 5
done

log_info "Status final :"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

log_info ""
log_info "Déploiement terminé."
log_info "Test API : curl http://localhost:8080/api/health"
log_info "Test web : curl -I http://localhost:8080"
