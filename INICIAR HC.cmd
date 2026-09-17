@echo off
title HC App - servidor local
cd /d "%~dp0"
if not exist node_modules (
  echo Instalando dependencias por unica vez...
  call npm install
)
call npm run local
pause
