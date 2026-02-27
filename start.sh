#!/bin/bash
cd /data/.openclaw/workspace/projects/plane-mini-app
pkill -f "node.*plane-mini" 2>/dev/null
sleep 1
node server.js > /tmp/plane-mini.log 2>&1 &
echo $! > /tmp/plane-mini.pid
echo "Server started on PID $(cat /tmp/plane-mini.pid)"
