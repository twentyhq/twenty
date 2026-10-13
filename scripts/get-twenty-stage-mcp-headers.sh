#!/bin/zsh

set -euo pipefail

stageToken="$(/usr/bin/security find-generic-password -a "$USER" -s "twenty-stage-mcp-token" -w)"

printf '{"Authorization":"Bearer %s"}\n' "$stageToken"
