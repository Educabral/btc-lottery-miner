#!/bin/bash
cd "$(dirname "$0")"
echo "========================================="
echo "  Software BTC Lottery Miner - Mac OS"
echo "========================================="
echo ""

# Verifica se o Node.js esta instalado
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
    echo "2. Clique neste arquivo INICIAR.command novamente apos instalar."
    echo ""
    read -p "Pressione Enter para sair..."
    exit 1
fi

# Instala as dependencias se necessario
if [ ! -d "node_modules" ]; then
    echo "[+] Instalando dependencias do sistema..."
    npm install
fi

# Baixa o minerador especifico para Mac caso nao exista
if [ ! -f "miner/minerd-mac" ]; then
    echo "[+] Baixando motor de mineracao otimizado para Mac..."
    mkdir -p miner/temp_mac
    curl -L -s -o miner/temp_mac/cpuminer-mac.zip "https://github.com/pooler/cpuminer/releases/download/v2.5.1/pooler-cpuminer-2.5.1-osx64.zip"
    unzip -q miner/temp_mac/cpuminer-mac.zip -d miner/temp_mac/
    mv miner/temp_mac/minerd miner/minerd-mac
    chmod +x miner/minerd-mac
    rm -rf miner/temp_mac
fi

# Inicia o servidor Node em background
echo "[+] Iniciando o Servidor Oculto..."
nohup node server.js > /dev/null 2>&1 &

# Abre o navegador
echo "[+] Abrindo o painel no navegador..."
sleep 2
open "http://localhost:3500"
echo "Pode fechar esta janela, o minerador continuara rodando!"
sleep 2
exit
