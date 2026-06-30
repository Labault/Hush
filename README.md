# Hush

> Stay silent as long as you can. A timer that climbs while you disappear.

**Live demo → [hush.labault.dev](https://hush.labault.dev)**

Hush is a focus/patience game with an unusual rule: the timer only counts while
your browser tab is **hidden**. Switch away, lock your screen, walk off — Hush
keeps counting. Come back, and your silence is scored against the rest of the
world. It doesn't punish distraction. It measures it.

The interesting part isn't the game. It's that **the score cannot be faked**,
even though there is no user account, and even though the timer reacts to a
purely client-side event. This README is mostly about how that's done.

---

## Stack

| Layer    | Tech                                                          |
| -------- | ------------------------------------------------------------- |
| Web      | React 19 · Vite · TypeScript · TanStack Query · React Router  |
| API      | NestJS 11 · TypeScript · Passport (JWT) · Swagger             |
| Database | PostgreSQL · Prisma 7                                          |
| Shared   | `@hush/shared` — TypeScript types shared across web & API     |
| Infra    | Docker Compose · Caddy (reverse proxy, automatic TLS)         |

A TypeScript monorepo (`apps/web`, `apps/api`, `packages/shared`) so the
contract between front and back is a single source of types, not a guess on
each side.

---

## Design decisions

### 1. A server-authoritative, anti-cheat timer

The naive version of this game lives entirely in the browser: a JS counter
that ticks on `visibilitychange`. That's also trivially cheatable — open the
console, set the score to a million, submit.

In Hush, the browser is never trusted with the score. The client only reports
**events** ("tab hidden at T", "tab visible at T"); the **NestJS `sessions`
module is the single source of truth** for elapsed silent time. The server
timestamps and validates each transition, so the final score is computed
server-side from a sequence it has verified — not from a number the client
sends. The `visibilitychange` API and the [Screen Wake Lock
API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
(to keep the page alive on mobile) are inputs to the experience, never the
authority over the result.

### 2. A global leaderboard with no authentication

Hush has a worldwide top-100 leaderboard and **no sign-up**. No email, no
password, no friction — you just play. That raises the obvious question: how do
you attribute a score to "a player" with nobody logged in?

On first play, the `players` module creates an anonymous player and the server
generates a random UUID for it (`@default(uuid())`). The browser keeps that
UUID in `localStorage` (`hush.playerId`) and sends it back to attribute scores
across sessions, with no account, no email and no password. The only data a
player provides is a public display pseudo, shown on the leaderboard. Auth in
the app is therefore split in two: **anonymous players** (a server-generated
UUID kept client-side in `localStorage`, plus a chosen pseudo) for the game
itself, and a separate **admin** path (`auth` + `admin` modules, bcrypt-hashed
credentials, Passport JWT in an `HttpOnly` cookie) for moderation.

### 3. Self-hosted infrastructure, reproducible from scratch

Hush runs on a single VPS, no PaaS. The whole stack is described in Docker
Compose with a dedicated production file, fronted by **Caddy** as a reverse
proxy with automatic HTTPS (Let's Encrypt) — TLS in a couple of lines instead
of hand-written Nginx vhosts.

Secrets are never committed: a `scripts/generate-secrets.sh` generates the
production secrets with `openssl` into a git-ignored `.env.prod`. A
`scripts/deploy.sh` handles repeatable deployments, and a `/health` endpoint
(its own NestJS module) gives the proxy and monitoring something to probe.

---

## Project structure

```
apps/
  web/          React + Vite front-end
  api/
    src/
      sessions/ server-authoritative timer (source of truth for scores)
      players/  anonymous signed identity + leaderboard
      auth/     admin authentication (Passport JWT)
      admin/    moderation endpoints
      health/   health-check endpoint
      prisma/   Prisma service
packages/
  shared/       TypeScript types shared between web & api
```

---

## Getting started (local)

Requirements: Node 20+, Docker.

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

Local URLs:

- API → http://localhost:3000 (Swagger at `/api`)
- Web → http://localhost:5173

Dev modes:

```bash
npm run dev          # native, fast — recommended for day-to-day
npm run dev:docker   # full Docker, closer to prod (HMR via polling)
```

---

## Deployment

A single-VPS, push-to-deploy style flow behind Caddy.

**VPS prerequisites:** Docker + Compose v2, Caddy, and a DNS A record pointing
your domain at the VPS.

**First deploy:**

```bash
ssh user@vps
mkdir -p ~/apps && cd ~/apps
git clone git@github.com:Labault/Hush.git
cd Hush
./scripts/generate-secrets.sh > .env.prod   # review POSTGRES_USER/DB and WEB_PORT
./scripts/deploy.sh

# smoke test
curl http://localhost:8080/api/health
curl -I http://localhost:8080
```

Create the first admin (bcrypt-hashed credentials, no plaintext stored):

```bash
docker exec -it hush-api-prod node -e "
  const { PrismaClient } = require('@prisma/client');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const bcrypt = require('bcrypt');
  (async () => {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    const prisma = new PrismaClient({ adapter });
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await prisma.admin.create({ data: { username: 'labault', passwordHash: hash } });
    console.log('Admin created');
    await prisma.\$disconnect();
  })();
"
```

Wire up Caddy (copy `Caddyfile.example` into your global Caddyfile), then:

```bash
caddy validate --config /etc/caddy/Caddyfile
caddy reload   --config /etc/caddy/Caddyfile
curl -I https://hush.labault.dev
```

**Subsequent deploys:**

```bash
cd /srv/hush
./scripts/deploy.sh
```

**Useful commands:**

```bash
npm run prod:logs                              # live logs
npm run prod:down                              # stop the stack
docker compose -f docker-compose.prod.yml ps   # status

# database backup
docker exec hush-postgres-prod pg_dump -U hush hush \
  | gzip > backup-$(date +%Y%m%d).sql.gz
```

---

## License

All rights reserved.
