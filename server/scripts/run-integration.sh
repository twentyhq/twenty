#!/usr/bin/env bash
# src/run-integration.sh

# wait-for-it.sh need coreutils to work properly
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

if [ -z "$(docker ps --filter "name=postgres" --filter "status=running" -q)" ]; then
    echo '🟡 - Waiting for database to be ready...'
    echo '🟡 - This may take a while...'
    echo "${PG_DATABASE_URL}"
    $DIR/wait-for-it.sh "${PG_DATABASE_URL}"
    EXIT_CODE=$?
    echo $EXIT_CODE
    if [ $EXIT_CODE -ne 0 ]; then
        echo '🔴 - Database connection failed!'
        echo '🔴 - Please check if the database is running and accessible.'
        echo '🔴 - If you are running the database in a container, please check if the container is running and accessible. ("make up" command should be run in "infra/dev" folder)'
        echo '🔴 - Otherwise check if your local settings.'
        echo '🔴 - Exiting...'
        exit 1
    else
        echo '🟢 - Database is ready!'
    fi
else
    echo "🟢 - Database container is already running."
fi

npx ts-node ./test/utils/check-db.ts
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo '🟡 - Database is not initialized. Running migrations...'
    npx prisma migrate reset --force && yarn prisma:generate
else
    echo "🟢 - Database is already initialized."
fi

yarn jest --config ./test/jest-e2e.json
