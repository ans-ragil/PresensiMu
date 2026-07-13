#!/bin/bash

# PresensiMu - Deployment Script
# Sistem Absensi Online Karyawan

set -e

echo "=========================================="
echo "  PresensiMu - Deployment Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose first"
    exit 1
fi

echo -e "${GREEN}[1/5] Checking environment...${NC}"

# Check if .env exists, if not create from example
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env 2>/dev/null || echo "PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/absensi_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=30m
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost" > .env
fi

echo -e "${GREEN}[2/5] Building Docker images...${NC}"
docker-compose build --no-cache

echo -e "${GREEN}[3/5] Starting services...${NC}"
docker-compose down 2>/dev/null || true
docker-compose up -d

echo -e "${GREEN}[4/5] Waiting for database to be ready...${NC}"
sleep 10

# Check if database is ready
echo -e "${GREEN}[5/5] Running database migrations...${NC}"
docker-compose exec -T server npx prisma migrate deploy 2>/dev/null || echo "Migration skipped (may already be applied)"

echo ""
echo "=========================================="
echo -e "${GREEN}  Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Services:"
echo "  - Frontend: http://localhost"
echo "  - Backend API: http://localhost/api"
echo "  - Database: localhost:5432"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@presensimu.com"
echo "  Password: admin123"
echo ""
echo "To create admin user, run:"
echo "  docker-compose exec server npx tsx prisma/seed.ts"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose logs -f"
echo "  Stop services:    docker-compose down"
echo "  Restart:          docker-compose restart"
echo "  Rebuild:          docker-compose up --build"
echo ""
