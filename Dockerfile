# ---- Стадия 1: сборка (полный образ) ----
FROM node:20 AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# И только потом остальной код
COPY . .

# ---- Стадия 2: production-зависимости (без dev-зависимостей) ----
FROM node:20 AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Стадия 3: рабочий образ (компактный slim + COPY --from) ----
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

# Свежие security-патчи Debian, а то Trivy находит уязвимости
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/*

RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["node", "src/server.js"]