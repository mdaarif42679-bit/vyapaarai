#!/bin/bash
[ -f .env.local ] || cp .env.example .env.local
[ -d node_modules ] || npm install
(sleep 4; (xdg-open http://localhost:3001 || open http://localhost:3001) >/dev/null 2>&1) &
npm run dev
