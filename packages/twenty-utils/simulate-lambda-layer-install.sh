#!/usr/bin/env bash

# Reproduces what the logic-function layer Lambda does with an app's manifests
# (see twenty-server logic-function-drivers/constants/yarn-install/index.mjs):
# it writes package.json + yarn.lock into a bare directory next to the pinned
# yarn-engine (yarn 4.9.2 + its .yarnrc.yml) and runs
# `yarn workspaces focus --all --production`. Running the same engine and
# configuration from a temp directory outside the repo proves the manifests
# install without the monorepo around them - in particular that portal:
# devDependencies (which the Lambda never sees thanks to --production) do not
# break resolution.

set -euo pipefail

APP_PATH="${1:?usage: simulate-lambda-layer-install.sh <app-path>}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
YARN_ENGINE_DIR="$REPO_ROOT/packages/twenty-server/src/engine/core-modules/application/application-package/constants/yarn-engine"

if [ ! -f "$APP_PATH/package.json" ] || [ ! -f "$APP_PATH/yarn.lock" ]; then
  echo "No package.json + yarn.lock in $APP_PATH, nothing to simulate"
  exit 0
fi

SIMULATION_DIR="$(mktemp -d)"
trap 'rm -rf "$SIMULATION_DIR"' EXIT

cp -R "$YARN_ENGINE_DIR/." "$SIMULATION_DIR/"
cp "$APP_PATH/package.json" "$APP_PATH/yarn.lock" "$SIMULATION_DIR/"

cd "$SIMULATION_DIR"
YARN_RELEASE="$(ls "$SIMULATION_DIR"/.yarn/releases/yarn-*.cjs | head -1)"
node "$YARN_RELEASE" workspaces focus --all --production

echo "Lambda layer install simulation succeeded for $APP_PATH"
