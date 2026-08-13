@echo off
title BTC Lottery Miner - Windows

:: Verificacao de seguranca contra execucao direta de dentro do WinRAR/ZIP
if not exist "%~dp0sistema\server.js" (
    echo ============================================================
    echo [AVISO IMPORTANTE] VOCE ESTA DENTRO DO ARQUIVO ZIP!
    echo ============================================================
    echo.
    echo Para que o software funcione corretamente:
    echo 1. Feche esta janela.
    echo 2. Clique com o botao direito no arquivo ZIP e escolha "Extrair Tudo".
    echo 3. Abra a pasta extraida e de 2 cliques no INICIAR.
    echo.
    pause
    exit /b
)

cd /d "%~dp0sistema"

:: Verificar Node.js
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
    exit /b
)

:: Instalar dependencias se necessario
if not exist "node_modules" (
    echo [+] Instalando dependencias do sistema pela primeira vez...
    call npm install
)

:: Iniciar o icone de bandeja e servidor de forma 100% oculta
echo [+] Iniciando o BTC Lottery Miner...
start "" powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0sistema\tray_icon.ps1"
exit
