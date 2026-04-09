@echo off
REM Quick start script for Twenty on Windows
REM For development: runs database services in Docker, app services locally

echo Starting PostgreSQL...
docker run -d --name twenty-db -p 5432:5432 ^
  -e POSTGRES_PASSWORD=postgres ^
  -e POSTGRES_DB=default ^
  postgres:16-alpine

echo Starting Redis...
docker run -d --name twenty-redis -p 6379:6379 ^
  redis:7-alpine redis-server --appendonly yes

echo.
echo Waiting 10 seconds for services to start...
timeout /t 10 /nobreak

echo Installing dependencies...
call yarn install

echo.
echo Starting Twenty (backend on :3000, frontend on :3001)...
echo Press Ctrl+C to stop.
call yarn start

REM To cleanup: docker stop twenty-db twenty-redis && docker rm twenty-db twenty-redis
