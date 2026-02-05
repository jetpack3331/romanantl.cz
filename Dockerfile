# Pouze pro lokální vývoj. Produkce běží na Vercelu (bez Dockeru).
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Zdroj se montuje z hostitele (docker-compose), takže next dev má hot reload
EXPOSE 3000

ENV NODE_ENV=development
ENV PORT=3000

CMD ["npm", "run", "dev"]
