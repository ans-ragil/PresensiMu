@echo off
REM PresensiMu - Deployment Script for Windows
REM Sistem Absensi Online Karyawan

echo ==========================================
echo   PresensiMu - Deployment Script
echo ==========================================
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Docker is not installed
    echo Please install Docker Desktop first: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

echo [1/4] Building Docker images...
docker-compose build --no-cache

echo [2/4] Starting services...
docker-compose down 2>nul
docker-compose up -d

echo [3/4] Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo [4/4] Running database migrations...
docker-compose exec -T server npx prisma migrate deploy 2>nul

echo.
echo ==========================================
echo   Deployment Complete!
echo ==========================================
echo.
echo Services:
echo   - Frontend: http://localhost
echo   - Backend API: http://localhost/api
echo   - Database: localhost:5432
echo.
echo Default admin credentials:
echo   Email: admin@presensimu.com
echo   Password: admin123
echo.
echo Default employee credentials:
echo   Email: karyawan@presensimu.com
echo   Password: karyawan123
echo.
echo To create sample data, run:
echo   docker-compose exec server npx tsx prisma/seed.ts
echo.
echo Usefull commands:
echo   View logs:        docker-compose logs -f
echo   Stop services:    docker-compose down
echo   Restart:          docker-compose restart
echo   Rebuild:          docker-compose up --build
echo.
pause
