#!/usr/bin/env bash
# scripts/setenv.sh

# Get script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Construct the absolute path of .env file in the project root directory
ENV_PATH="${SCRIPT_DIR}/../.env.test"

# Check if the file exists
if [ -f "${ENV_PATH}" ]; then
  echo "🔵 - Loading environment variables from "${ENV_PATH}"..."
  # Export env vars
  while IFS= read -r line || [ -n "$line" ]; do
    if echo "$line" | grep -F = &>/dev/null
    then
      varname=$(echo "$line" | cut -d '=' -f 1)
      varvalue=$(echo "$line" | cut -d '=' -f 2-)
      export "$varname"="$varvalue"
    fi
  done < <(grep -v '^#' "${ENV_PATH}")
else
  echo "Error: ${ENV_PATH} does not exist."
  exit 1
fi
