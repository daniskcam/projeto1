@echo off
echo Iniciando servidor HVAC Viewer...
cd /d "%~dp0"
start "" cmd /c "npx serve . --listen 8765"
timeout /t 2 /nobreak >nul
start "" "http://localhost:8765/planta_hvac_v2.html"
echo Planta aberta em http://localhost:8765/planta_hvac_v2.html
