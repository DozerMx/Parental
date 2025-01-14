@echo off
cd %~dp0
:loop
start /min cmd /c "node start.js"
timeout /t 5 /nobreak >nul
tasklist /FI "IMAGENAME eq electron.exe" 2>NUL | find /I /N "electron.exe">NUL
if "%ERRORLEVEL%"=="1" goto loop
