#!/bin/bash
# ============================================
# SOFTWARE BTC LOTTERY MINER - MODO LINUX
# ============================================

echo "Verificando Node.js..."
if ! command -v node &> /dev/null
then
    echo "Erro: Node.js não encontrado!"
    echo "Por favor, instale o Node.js (https://nodejs.org) para continuar."
    exit 1
fi

echo "Encerrando instâncias anteriores..."
pkill -f server.js || true
pkill -f cpuminer-linux || true

echo "Configurando permissões do minerador..."
chmod +x miner/cpuminer-linux

echo "Instalando dependências..."
npm install

echo "Iniciando Software BTC Lottery Miner..."
nohup node server.js > btc-miner.log 2>&1 &

sleep 3

echo "Abrindo painel no navegador..."
if command -v xdg-open &> /dev/null
then
    xdg-open http://localhost:3500
elif command -v gnome-open &> /dev/null
then
    gnome-open http://localhost:3500
elif command -v python3 &> /dev/null
then
    python3 -m webbrowser "http://localhost:3500"
else
    echo "Por favor, abra manualmente no seu navegador:"
    echo "http://localhost:3500"
fi

echo "O minerador está rodando no fundo! Feche esta janela."
