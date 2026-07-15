FROM node:20-bookworm-slim

WORKDIR /app

# Prisma requires OpenSSL; Debian/glibc avoids libsql musl incompatibility.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./

COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
RUN cd client && npm run build

COPY server/package*.json ./server/
COPY server/prisma ./server/prisma/
RUN cd server && npm ci && npx prisma generate
COPY server/ ./server/
RUN cd server && npm run build

EXPOSE 5000

CMD ["npm", "start"]
