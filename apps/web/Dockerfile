# syntax=docker/dockerfile:1.7

# ===== Stage 1: deps =====
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci --workspace=web --include-workspace-root

# ===== Stage 2: builder =====
FROM node:22-alpine AS builder
WORKDIR /app
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY tsconfig.base.json package.json package-lock.json* ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
WORKDIR /app/apps/web
RUN npm run build

# ===== Stage 3: runner (Nginx) =====
FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
