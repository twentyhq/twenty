#!/usr/bin/env bash
# scripts/setenv.sh

# Get script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Construct the absolute path of .env file in the project root directory
ENV_PATH="${SCRIPT_DIR}/../.env.test"

# Check if the file exists
if [ -f "${ENV_PATH}" ]; then
  echo "🟡 - Loading environment variables from "${ENV_PATH}"..."
  # Export env vars
  export $(grep -v '^#' ${ENV_PATH} | xargs)
else
  echo "Error: ${ENV_PATH} does not exist."
  exit 1
fi
