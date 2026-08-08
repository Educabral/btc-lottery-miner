#!/bin/bash
cd "$(dirname "$0")/../sistema"

export PATH="/usr/local/bin:/usr/bin:/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:$PATH"

chmod +x "$0" 2>/dev/null

echo "========================================="
echo "  Software BTC Lottery Miner - Linux/Pi"
echo "========================================="
echo ""

if ! command -v node >/dev/null 2>&1; then
    echo "[!] Node.js nao foi encontrado!"
    echo "[!] Para instalar no Debian/Ubuntu/Raspberry Pi, execute no terminal:"
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
        echo "[+] Preparando ambiente de compilacao..."
        
        if command -v apt-get >/dev/null 2>&1; then
            sudo apt-get update -y 2>/dev/null || true
            sudo apt-get install -y build-essential automake autoconf pkg-config libcurl4-openssl-dev libjansson-dev libssl-dev libgmp-dev make curl 2>/dev/null || true
        fi
        
        mkdir -p miner/temp_linux
        curl -L -s -o miner/temp_linux/source.tar.gz "https://github.com/pooler/cpuminer/releases/download/v2.5.1/pooler-cpuminer-2.5.1.tar.gz"
        tar -xzf miner/temp_linux/source.tar.gz -C miner/temp_linux/
        
        cd miner/temp_linux/cpuminer-2.5.1
        if [ "$ARCH" = "aarch64" ]; then
            ./configure --build=aarch64-unknown-linux-gnu CFLAGS="-O3" || ./configure CFLAGS="-O3"
        elif [ "$ARCH" = "armv7l" ] || [ "$ARCH" = "armv6l" ]; then
            ./configure --build=arm-linux-gnueabihf CFLAGS="-O3" || ./configure CFLAGS="-O3"
        else
            ./configure CFLAGS="-O3"
        fi
        
        make -j$(nproc 2>/dev/null || echo 2)
        cd ../../../
        
        if [ -f "miner/temp_linux/cpuminer-2.5.1/minerd" ]; then
            mv miner/temp_linux/cpuminer-2.5.1/minerd miner/minerd-linux
            chmod +x miner/minerd-linux
        fi
        rm -rf miner/temp_linux
    fi
fi

if [ -f "miner/minerd-linux" ]; then
    chmod +x miner/minerd-linux 2>/dev/null
fi

echo "[+] Iniciando o Servidor..."
pkill -f "node server.js" 2>/dev/null
nohup node server.js > /dev/null 2>&1 &

echo "[+] Abrindo o painel no navegador..."
sleep 2
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:3500" 2>/dev/null &
fi
echo "Pode fechar esta janela, o minerador continuara rodando no fundo!"
sleep 2
exit
