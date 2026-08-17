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
echo No momento voce esta tentando rodar direto de dentro do WinRAR/ZIP.
echo.
echo PASSOS PARA RESOLVER:
echo 1 - Feche esta janela.
echo 2 - Clique com o botao direito no arquivo ZIP na sua Area de Trabalho.
echo 3 - Selecione "Extrair Tudo..." (ou "Extrair para Software_BTC_Lottery_Miner").
echo 4 - Abra a pasta amarela descompactada que foi criada.
echo 5 - De 2 cliques no INICIAR.bat.
echo.
pause
exit /b

:found_sistema
cd /d "%SISTEMA_DIR%"

where node >nul 2>nul
if %errorlevel% equ 0 goto :node_found

echo [!] Node.js nao foi encontrado no seu PC!
echo [!] Abrindo o site oficial do Node.js para instalar...
echo.
ping 127.0.0.1 -n 3 >nul
start https://nodejs.org/en/download/prebuilt-installer
echo PASSOS:
echo 1 - Baixe e instale o Node.js (.msi).
echo 2 - Abra este arquivo INICIAR.bat novamente.
echo.
pause
exit /b

:node_found
if exist "node_modules" goto :modules_found
echo [+] Instalando componentes do sistema (aguarde alguns segundos)...
call npm install

:modules_found
echo [+] Iniciando o servidor do minerador...
start "BTC Lottery Miner Server" /min node server.js

echo [+] Abrindo o painel no navegador: http://localhost:3500
ping 127.0.0.1 -n 3 >nul
start http://localhost:3500

echo.
echo ============================================================
echo  OK - MINERADOR INICIADO COM SUCESSO!
echo  O painel foi aberto no seu navegador: http://localhost:3500
echo ============================================================
echo.
pause
