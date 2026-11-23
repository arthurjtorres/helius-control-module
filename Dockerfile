# Node com major fixo: a tag lts muda de versão sozinha
FROM node:24-alpine3.22 AS builder
WORKDIR /modulo-controle
COPY package.json yarn.lock tsconfig.json ./
RUN yarn install --frozen-lockfile
COPY src ./src
RUN yarn build

# Só dependências de produção na imagem final
FROM node:24-alpine3.22 AS deps
WORKDIR /modulo-controle
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

FROM node:24-alpine3.22
WORKDIR /modulo-controle
ENV NODE_ENV=production
COPY --from=deps /modulo-controle/node_modules ./node_modules
COPY --from=builder /modulo-controle/build ./build
COPY package.json ./
USER node
CMD ["node", "build/server.js"]
