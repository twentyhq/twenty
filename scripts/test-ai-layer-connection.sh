#!/bin/bash

# Test connection to AI Layer services from Twenty container

echo "Testing AI Layer connections from Twenty server..."
echo ""

# Test ctx-mcp
echo -n "ctx-mcp (Context Engine): "
if docker exec twenty-server-1 curl -s -o /dev/null -w "%{http_code}" http://ctx-mcp:3100/healthz | grep -q "200"; then
    echo "OK"
else
    echo "FAILED"
fi

# Test kb-mcp
echo -n "kb-mcp (Knowledge Base): "
if docker exec twenty-server-1 curl -s -o /dev/null -w "%{http_code}" http://kb-mcp:3110/health | grep -q "200"; then
    echo "OK"
else
    echo "FAILED"
fi

# Test n8n
echo -n "n8n (Workflow Engine): "
if docker exec twenty-server-1 curl -s -o /dev/null -w "%{http_code}" http://n8n:5678/healthz | grep -q "200"; then
    echo "OK"
else
    echo "FAILED"
fi

echo ""
echo "AI Layer connection test complete."
