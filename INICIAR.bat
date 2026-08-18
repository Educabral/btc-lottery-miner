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
echo [!] O Node.js e necessario para rodar o minerador.
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
if exist "node_modules" goto :modules_found
echo [+] Instalando dependencias iniciais (aguarde alguns segundos)...
call npm install

:modules_found
echo [+] Criando atalho oficial na Area de Trabalho...
powershell -ExecutionPolicy Bypass -Command "$desktop = [Environment]::GetFolderPath('Desktop'); $lnkPath = Join-Path $desktop 'Software BTC Lottery Miner.lnk'; $batPath = '%~f0'; $workDir = '%~dp0'; $iconPath = Join-Path '%SISTEMA_DIR%' 'public\bitcoin_hd.ico'; $ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut($lnkPath); $s.TargetPath = $batPath; $s.WorkingDirectory = $workDir; if (Test-Path $iconPath) { $s.IconLocation = $iconPath }; $s.Save()" >nul 2>&1

echo [+] Iniciando minerador em segundo plano com icone no relogio...
start "" powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "%SISTEMA_DIR%\tray_icon.ps1"

echo.
echo ============================================================
echo  OK - MINERADOR INICIADO EM SEGUNDO PLANO!
echo  O icone do Bitcoin foi ativado proximo ao relogio.
echo  O painel foi aberto no seu navegador: http://localhost:3500
echo ============================================================
echo.
ping 127.0.0.1 -n 3 >nul
exit
