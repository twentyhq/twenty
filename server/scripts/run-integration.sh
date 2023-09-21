#!/usr/bin/env bash
# src/run-integration.sh

DIR="$(cd "$(dirname "$0")" && pwd)"
source $DIR/set-env-test.sh

npx ts-node ./test/utils/check-db.ts
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo '🟡 - Database is not initialized. Running migrations...'
    npx prisma migrate reset --force && yarn prisma:generate
    yarn typeorm:migrate
else
    echo "🟢 - Database is already initialized."
fi

yarn jest --config ./test/jest-e2e.json
