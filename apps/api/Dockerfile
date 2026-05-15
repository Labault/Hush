# syntax=docker/dockerfile:1.7

# ===== Stage 1: deps =====
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci --workspace=api --include-workspace-root

# ===== Stage 2: builder =====
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.base.json package.json package-lock.json* ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# ===== Stage 3: runner =====
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared ./packages/shared

USER nestjs
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
