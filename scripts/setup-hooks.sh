#!/bin/sh
cp hooks/pre-push .git/hooks/
chmod +x .git/hooks/pre-push
echo "Git hooks installed successfully."
