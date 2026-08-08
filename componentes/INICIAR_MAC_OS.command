#!/bin/bash
cd "$(dirname "$0")"

export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:$PATH"

xattr -d com.apple.quarantine "$0" 2>/dev/null
xattr -rd com.apple.quarantine . 2>/dev/null
chmod +x "$0" 2>/dev/null

echo "========================================="
echo "  Software BTC Lottery Miner - Mac OS"
echo "========================================="
echo ""

if ! command -v node >/dev/null 2>&1; then
    echo "[!] Node.js nao foi encontrado no seu Mac!"
    echo "[!] O motor Node.js e necessario para a interface."
    echo ""
    echo "Abrindo o site oficial para download em 3 segundos..."
    sleep 3
    open "https://nodejs.org/en/download/prebuilt-installer"
    echo ""
    echo "PASSOS:"
    echo "1. Baixe o instalador (.pkg) no site que abriu e instale."
    echo "2. Clique neste arquivo INICIAR novamente apos instalar."
    echo ""
    read -p "Pressione Enter para sair..."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[+] Instalando dependencias do sistema..."
    npm install
fi

if [ ! -f "miner/minerd-mac" ]; then
    echo "[+] Baixando motor de mineracao otimizado para Mac..."
    mkdir -p miner/temp_mac
    curl -L -s -o miner/temp_mac/cpuminer-mac.zip "https://github.com/pooler/cpuminer/releases/download/v2.5.1/pooler-cpuminer-2.5.1-osx64.zip"
    unzip -q miner/temp_mac/cpuminer-mac.zip -d miner/temp_mac/
    mv miner/temp_mac/minerd miner/minerd-mac
    chmod +x miner/minerd-mac
    xattr -d com.apple.quarantine miner/minerd-mac 2>/dev/null
    rm -rf miner/temp_mac
fi

chmod +x miner/minerd-mac 2>/dev/null
xattr -d com.apple.quarantine miner/minerd-mac 2>/dev/null

echo "[+] Iniciando o Servidor Oculto..."
pkill -f "node server.js" 2>/dev/null
nohup node server.js > /dev/null 2>&1 &

echo "[+] Abrindo o painel no navegador..."
sleep 2
open "http://localhost:3500"
echo "Pode fechar esta janela, o minerador continuara rodando!"
sleep 2
exit
