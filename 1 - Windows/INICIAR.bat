@echo off
title BTC Lottery Miner - Windows
cd /d "%~dp0..\sistema"

if not exist "%APPDATA%\npm\node.exe" (
    where node >nul 2>nul
    if %errorlevel% neq 0 (
        echo [!] Node.js nao foi encontrado no seu PC!
        echo [!] O motor Node.js e necessario para rodar o software.
        echo.
        echo Abrindo o site oficial para download em 3 segundos...
        timeout /t 3 >nul
        start https://nodejs.org/en/download/prebuilt-installer
        echo.
        echo PASSOS:
        echo 1. Baixe o instalador (.msi) no site que abriu e instale.
        echo 2. Clique neste arquivo INICIAR novamente apos instalar.
        echo.
        pause
        exit
    )
)

if not exist "node_modules" (
    echo [+] Instalando dependencias do sistema...
    call npm install
)

echo [+] Iniciando o Servidor Oculto...
powershell -ExecutionPolicy Bypass -File "%~dp0..\sistema\tray_icon.ps1"
echo [+] Abrindo o painel no navegador...
timeout /t 2 >nul
start http://localhost:3500
