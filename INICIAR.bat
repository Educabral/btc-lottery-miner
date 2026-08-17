@echo off
title Software BTC Lottery Miner
cls

echo ============================================================
echo         SOFTWARE BTC LOTTERY MINER
echo ============================================================
echo.

set "SISTEMA_DIR="
if exist "%~dp0sistema\server.js" set "SISTEMA_DIR=%~dp0sistema"
if exist "%~dp0..\sistema\server.js" set "SISTEMA_DIR=%~dp0..\sistema"
if exist "%~dp0..\..\sistema\server.js" set "SISTEMA_DIR=%~dp0..\..\sistema"

if defined SISTEMA_DIR goto :found_sistema

echo [AVISO] VOCE PRECISA EXTRAIR O ARQUIVO ZIP PRIMEIRO!
echo.
echo 1 - Feche esta janela.
echo 2 - Clique com o botao direito no arquivo ZIP na Area de Trabalho.
echo 3 - Escolha "Extrair Tudo".
echo 4 - Abra a pasta descompactada e de 2 cliques no INICIAR.bat.
echo.
pause
exit /b

:found_sistema
cd /d "%SISTEMA_DIR%"

where node >nul 2>nul
if %errorlevel% equ 0 goto :node_found

echo [!] ATENCAO: O Node.js nao esta instalado no seu computador.
echo [!] O Node.js e necessario para rodar o painel do minerador.
echo.
echo [1/2] Abrindo o site oficial do Node.js no seu navegador...
ping 127.0.0.1 -n 3 >nul
start https://nodejs.org/en/download/prebuilt-installer
echo.
echo [2/2] PASSOS SIMPLES:
echo   a) Baixe e instale o Node.js no site que acabou de abrir.
echo   b) Apos terminar a instalacao, de 2 cliques no INICIAR.bat novamente!
echo.
pause
exit /b

:node_found
echo [+] Node.js detectado com sucesso!
echo [+] Verificando componentes...

if exist "node_modules" goto :modules_found
echo [+] Instalando dependencias iniciais (aguarde alguns segundos)...
call npm install

:modules_found
echo [+] Abrindo o painel no navegador: http://localhost:3500
start http://localhost:3500

echo.
echo ============================================================
echo  OK - SERVIDOR INICIADO!
echo  Mantenha esta janela aberta enquanto estiver minerando.
echo ============================================================
echo.

node server.js
pause
