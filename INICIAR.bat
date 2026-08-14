@echo off
title Software BTC Lottery Miner
chcp 65001 >nul

echo ============================================================
echo         🎰 SOFTWARE BTC LOTTERY MINER 🎰
echo ============================================================
echo.

:: Verificacao de seguranca contra execucao direta de dentro do WinRAR/ZIP
if not exist "%~dp0sistema\server.js" (
    echo [AVISO] VOCE ESTA DENTRO DO ARQUIVO ZIP!
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
    echo [+] Instalando componentes pela primeira vez (aguarde alguns segundos)...
    call npm install --silent
)

echo [+] Iniciando o motor do minerador e servidor...
start "" powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0sistema\tray_icon.ps1"

echo [+] Abrindo o painel no navegador: http://localhost:3500
start http://localhost:3500

echo.
echo ============================================================
echo  ✅ MINERADOR ATIVO COM SUCESSO!
echo  O painel foi aberto no seu navegador.
echo  O icone do Bitcoin esta rodando perto do relogio.
echo ============================================================
echo.
timeout /t 3 >nul
exit
