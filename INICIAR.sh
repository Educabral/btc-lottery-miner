#!/bin/bash
cd "$(dirname "$0")"
echo "========================================="
echo "  Software BTC Lottery Miner - Linux/Pi"
echo "========================================="
echo ""

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
    echo "[!] Node.js nao foi encontrado!"
    echo "[!] Para instalar no Debian/Ubuntu/Raspberry, rode:"
    echo "    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "    sudo apt-get install -y nodejs"
    echo ""
    read -p "Pressione Enter para sair..."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[+] Instalando dependencias do sistema..."
    npm install
fi

ARCH=$(uname -m)

if [ ! -f "miner/minerd-linux" ]; then
    if [ "$ARCH" = "x86_64" ]; then
        echo "[+] Baixando motor de mineracao para Linux (x64)..."
        mkdir -p miner/temp_linux
        curl -L -s -o miner/temp_linux/cpuminer-linux.tar.gz "https://github.com/pooler/cpuminer/releases/download/v2.5.1/pooler-cpuminer-2.5.1-linux-x86_64.tar.gz"
        tar -xzf miner/temp_linux/cpuminer-linux.tar.gz -C miner/temp_linux/
        mv miner/temp_linux/minerd miner/minerd-linux
        chmod +x miner/minerd-linux
        rm -rf miner/temp_linux
    else
        echo "[+] Arquitetura ARM ($ARCH) detectada (Raspberry Pi ou similar)."
        echo "[+] Preparando ambiente de compilacao (pode demorar alguns minutos)..."
        
        # Pede senha do sudo pro usuário caso não tenha dependências
        sudo apt-get update
        sudo apt-get install -y build-essential automake autoconf pkg-config libcurl4-openssl-dev libjansson-dev libssl-dev libgmp-dev make curl
        
        mkdir -p miner/temp_linux
        curl -L -s -o miner/temp_linux/source.tar.gz "https://github.com/pooler/cpuminer/releases/download/v2.5.1/pooler-cpuminer-2.5.1.tar.gz"
        tar -xzf miner/temp_linux/source.tar.gz -C miner/temp_linux/
        
        cd miner/temp_linux/cpuminer-2.5.1
        ./configure CFLAGS="-O3"
        make -j4
        cd ../../../
        
        mv miner/temp_linux/cpuminer-2.5.1/minerd miner/minerd-linux
        chmod +x miner/minerd-linux
        rm -rf miner/temp_linux
    fi
fi

echo "[+] Iniciando o Servidor..."
nohup node server.js > /dev/null 2>&1 &

echo "[+] Abrindo o painel no navegador..."
sleep 2
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:3500"
fi
echo "Pode fechar esta janela, o minerador continuara rodando no fundo!"
sleep 2
exit
