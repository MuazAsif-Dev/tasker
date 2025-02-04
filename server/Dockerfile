FROM node:22.13.1

WORKDIR /app

COPY package.json bun.lock ./

RUN npm install -g bun

RUN bun install

COPY . .

COPY firebase-service-account.json ./

RUN bun run build

EXPOSE 8000

ENV NODE_OPTIONS="--max-old-space-size=4096"

CMD ["node", "dist/src/index.js"]
