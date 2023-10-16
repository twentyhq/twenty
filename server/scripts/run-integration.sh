#!/usr/bin/env bash
# src/run-integration.sh

DIR="$(cd "$(dirname "$0")" && pwd)"
source $DIR/set-env-test.sh

yarn database:setup && yarn database:reset
yarn jest --config ./test/jest-e2e.json
