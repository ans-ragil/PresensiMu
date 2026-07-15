FROM node:20-slim

WORKDIR /app

# Copy root package.json
COPY package.json ./

# Copy client
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client/ ./client/
RUN cd client && npm run build

# Copy server - install correct platform binary
COPY server/package*.json ./server/
RUN cd server && npm install && \
    npm install @libsql/linux-x64-gnu --save-optional && \
    rm -rf node_modules/@libsql/linux-x64-musl

COPY server/ ./server/
RUN cd server && npx prisma generate
RUN cd server && npm run build

EXPOSE 5000

CMD ["npm", "start"]
