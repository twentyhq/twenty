#!/usr/bin/env bash
# src/run-integration.sh

# Check for MacOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🔵 MacOS detected."
    # Check for Homebrew
    if ! command -v brew &>/dev/null; then
        echo "🔴 Homebrew could not be found. Please install it and rerun the script."
        exit 1
    else
        echo "🟢 Homebrew detected."
        # Check for coreutils
        if brew ls --versions coreutils > /dev/null; then
            echo "🟢 coreutils detected."
            # Create an alias for timeout
            alias timeout=gtimeout
        else
            echo "🟡 coreutils not found. Installing..."
            brew install coreutils
            alias timeout=gtimeout
        fi
    fi
fi

DIR="$(cd "$(dirname "$0")" && pwd)"
source $DIR/setenv.sh

if [ -z "$(docker ps --filter "name=test-db" --filter "status=running" -q)" ]; then
    docker-compose up -d
    echo '🟡 - Waiting for database to be ready...'
    echo '🟡 - This may take a while...'
    echo "${PG_DATABASE_URL}"
    $DIR/wait-for-it.sh "${PG_DATABASE_URL}" -- echo '🟢 - Database is ready!'
else
    echo "🟢 - Database container is already running."
fi

if npx ts-node ./test/check-db.ts | grep -qw 1; then
    echo "🟢 - Database is already initialized."
else
    echo '🟡 - Database is not initialized. Running migrations...'
    npx prisma migrate reset --force && yarn prisma:generate
fi

yarn jest --config ./test/jest-e2e.json

echo '🟡 - Stopping the Docker container...'
docker-compose stop test-db
echo '🟢 - Docker container has been stopped.'
