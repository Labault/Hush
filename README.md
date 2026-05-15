# Hush

Tiens le silence le plus longtemps possible : un timer qui monte tant que l'onglet est caché.

## Stack

- **Web** — React + Vite + TypeScript
- **API** — NestJS + TypeScript + Prisma
- **Base de données** — PostgreSQL (Docker)
- **Shared** — types TypeScript partagés (`@hush/shared`)

## Prérequis

- Node 20+
- Docker

## Démarrage

```bash
git clone git@github.com:Labault/Hush.git
cd Hush
npm install
cp .env.example .env
docker compose up -d
cd apps/api && npx prisma migrate dev
cd ../..
npm run dev
```

## URLs locales

- API : http://localhost:3000
- Web : http://localhost:5173

## Déploiement

### Pré-requis VPS
- Docker + Docker Compose v2
- Caddy installé
- Domaine pointant vers le VPS (DNS A → IP du VPS)

### Premier déploiement

```bash
ssh user@vps
mkdir -p ~/apps && cd ~/apps
git clone git@github.com:Labault/hush.git
cd hush

./scripts/generate-secrets.sh > .env.prod
# Vérifier .env.prod, éventuellement ajuster POSTGRES_USER/DB et WEB_PORT

./scripts/deploy.sh

# Tester
curl http://localhost:8080/api/health
curl -I http://localhost:8080

# Créer le premier admin
docker exec -it hush-api-prod node -e "
  const { PrismaClient } = require('@prisma/client');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const bcrypt = require('bcrypt');
  (async () => {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    const prisma = new PrismaClient({ adapter });
    const hash = await bcrypt.hash('CHANGE_ME_STRONG_PROD_PASSWORD', 12);
    await prisma.admin.create({ data: { username: 'labault', passwordHash: hash } });
    console.log('Admin créé');
    await prisma.\$disconnect();
  })();
"

# Coller le contenu de Caddyfile.example dans /etc/caddy/Caddyfile
nano /hone/thibault/proxy-global/Caddyfile
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile

# Vérifier en HTTPS
curl -I https://hush.labault.dev
```

### Déploiements ultérieurs

```bash
sudo -u deploy -i
cd /srv/hush
./scripts/deploy.sh
```

### Commandes utiles

```bash
npm run prod:logs                            # voir les logs en live
npm run prod:down                            # arrêter la stack
docker compose -f docker-compose.prod.yml ps # status
docker exec hush-postgres-prod pg_dump -U hush hush | gzip > backup-$(date +%Y%m%d).sql.gz  # backup
```

### Dev (au choix)

```bash
npm run dev          # natif (rapide, recommandé pour la dev quotidienne)
npm run dev:docker   # Docker complet (plus proche prod, HMR via polling)
```
