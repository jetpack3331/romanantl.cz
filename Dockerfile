# Local development image (hot reload via bind mount in docker-compose.dev.yml)
FROM node:20-bookworm-slim AS development

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

EXPOSE 3000
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["npm", "run", "dev"]

# Production build
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production runtime (Hetzner / self-hosted Docker)
FROM node:20-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "./dist/server/entry.mjs"]
