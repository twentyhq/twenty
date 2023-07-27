#!/usr/bin/env bash
# src/run-integration.sh

npx ts-node ./test/utils/check-db.ts
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo '🟡 - Database is not initialized. Running migrations...'
    npx prisma migrate reset --force && yarn prisma:generate
else
    echo "🟢 - Database is already initialized."
fi

yarn jest --config ./test/jest-e2e.json
