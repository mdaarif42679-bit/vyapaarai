@echo off
if not exist .env.local copy .env.example .env.local
if not exist node_modules call npm install
start http://localhost:3001
call npm run dev
