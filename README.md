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
