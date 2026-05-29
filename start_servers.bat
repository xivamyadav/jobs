@echo off
echo ==============================================
echo 🚀 Starting ByTeBuZz Backend ^& Internet Tunnel
echo ==============================================
echo.

echo Starting Django Backend...
start cmd /k "venv\Scripts\activate && python manage.py runserver"

echo.
echo Starting Internet Tunnel...
echo Your public API URL will be: https://bytebuzz-api-shivam123.loca.lt
start cmd /k "npx localtunnel --port 8000 --subdomain bytebuzz-api-shivam123"

echo.
echo Servers are starting in separate windows. 
echo IMPORTANT: Leave both black windows open to keep your sites running!
echo You can minimize them, but do not close them.
pause
