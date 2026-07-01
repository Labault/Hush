#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Contrat de déploiement attendu par le webhook push-to-deploy : le dispatcher
# fait `git reset --hard origin/main` puis lance CE ./deploy.sh à la racine du
# repo. Il DOIT donc vivre ici (pas sous scripts/) et se localiser lui-même via
# `cd "$(dirname "$0")"` — surtout pas un chemin absolu type ~/apps/hush.

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
HEALTH_RETRIES=20

dc()  { docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"; }
log() { echo "[$(date '+%H:%M:%S')] [hush] $*"; }

[ -f "$ENV_FILE" ] || { log "ERREUR : $ENV_FILE introuvable (cf scripts/generate-secrets.sh)"; exit 1; }

log "Build des images…"
dc build --pull

log "(Re)démarrage des conteneurs…"
dc up -d --remove-orphans

# Le web (nginx alpine) n'expose pas de port hôte : il passe par le Caddy
# global. On teste donc depuis l'intérieur du conteneur (busybox wget dispo).
# 127.0.0.1 explicite : `localhost` résout ::1 (IPv6) sous busybox alors que
# nginx n'écoute qu'en IPv4 → connection refused faussement.
log "Healthcheck → web (nginx)"
for i in $(seq 1 "$HEALTH_RETRIES"); do
  if dc exec -T web wget -q -O /dev/null http://127.0.0.1:80/; then
    log "Healthy ✓"
    docker image prune -f >/dev/null 2>&1 || true
    log "Déploiement terminé ✓"
    exit 0
  fi
  sleep 3
done

log "ÉCHEC : le web ne répond pas après $((HEALTH_RETRIES * 3))s ✗"
dc ps
exit 1
