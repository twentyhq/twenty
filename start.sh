#!/bin/bash
NODE_OPTIONS="--max-old-space-size=4096" npx nx start twenty-server &
NODE_OPTIONS="--max-old-space-size=4096" npx nx worker twenty-server &
NODE_OPTIONS="--max-old-space-size=4096" npx nx start twenty-front --host
wait 
