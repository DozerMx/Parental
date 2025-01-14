@echo on
cd %~dp0

echo Verificando Node.js...
node --version
if errorlevel 1 (
    echo Node.js no está instalado. Por favor, instala Node.js desde https://nodejs.org
    pause
    exit
)

echo Verificando módulos...
if not exist node_modules (
    echo Instalando módulos necesarios...
    npm install electron socket.io-client
)

:loop
echo Iniciando aplicación...
node start.js
timeout /t 5 /nobreak >nul
tasklist /FI "IMAGENAME eq electron.exe" 2>NUL | find /I /N "electron.exe">NUL
if "%ERRORLEVEL%"=="1" goto loop
pause
