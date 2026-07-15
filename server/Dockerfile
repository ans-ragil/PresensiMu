FROM node:20-bookworm-slim

WORKDIR /app

# Prisma requires OpenSSL; Debian/glibc also avoids libsql musl incompatibility.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
