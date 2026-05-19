# 🎰 Software BTC Lottery Miner

<div align="center">

![Bitcoin](https://img.shields.io/badge/Bitcoin-Solo_Mining-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Windows](https://img.shields.io/badge/Windows-Compatible-0078D6?style=for-the-badge&logo=windows&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Transforme seu PC com Windows em um Nó Minerador Solo real do Bitcoin.**

[⚡ Comunidade no Telegram](https://t.me/Degenzone21) • [🌐 Public Pool](https://web.public-pool.io)

</div>

---

## 🎯 O que é este projeto?

O **Software BTC Lottery Miner** é uma interface premium para mineração solo de Bitcoin em qualquer PC com Windows. O objetivo não é ganhar centavos todo dia — é participar da **loteria do bloco**: cada cálculo gerado é um ticket real na disputa pelos **3.125 BTC** do prêmio oficial da rede.

> ⚠️ **Este NÃO é um simulador.** O software utiliza o motor `cpuminer-sse2.exe` conectado diretamente à rede Bitcoin via protocolo Stratum (SHA-256d). Cada hash é verificável ao vivo na Public Pool.

---

## 🚀 Por que usar?

| Característica | Detalhe |
|---|---|
| ⚡ **Motor real** | `cpuminer-sse2.exe` (Pooler's CPUMiner — Open Source) |
| 🔗 **Protocolo** | `stratum+tcp://public-pool.io:21496` |
| 🧠 **Algoritmo** | SHA-256d (algoritmo nativo do Bitcoin) |
| 💎 **Dashboard premium** | Interface luxuosa com hashrate, tickets, uptime e dados da rede em tempo real |
| 🔒 **Seguro** | Sua carteira é sua. O software minera direto para o seu endereço, sem intermediários |
| 🖥️ **Multi-PC** | Use o mesmo endereço em quantos PCs quiser — o hashrate se soma |
| 🏃 **Modo invisível** | Roda em segundo plano via ícone na bandeja do sistema (perto do relógio) |

### 🥊 Vantagem sobre o NerdMiner físico

| Hardware | Hashrate |
|---|---|
| NerdMiner físico | ~50–70 KH/s |
| PC comum (este software) | ~800 MH/s a 3.000 MH/s |

**10x a 40x mais tickets de sorte por segundo**, sem importar nenhum hardware adicional.

---

## 📦 Instalação

### Requisitos
- Windows 10 ou 11
- Node.js instalado ([download aqui](https://nodejs.org))
- Carteira Bitcoin própria (`bc1q...`, `bc1p...`, `1...` ou `3...`)

> ⚠️ **Nunca use endereço de exchange** (Binance, Mercado Bitcoin, etc.). Use uma carteira própria como Electrum, Exodus ou Ledger.

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/btc-lottery-miner.git

# 2. Entre na pasta
cd btc-lottery-miner

# 3. Instale as dependências
npm install

# 4. Inicie o software
# Dê dois cliques em INICIAR.bat
# OU execute via terminal:
node server.js
```

Após iniciar, o painel abre automaticamente em `http://localhost:3500`.

---

## 🖼️ Interface

O painel inclui:
- **⚡ Velocidade da aposta** — Hashrate em tempo real com gauge animado
- **🎫 Tickets gerados** — Total de hashes aceitos pela rede
- **📦 Bloco atual** — Sincronizado com a rede Bitcoin
- **⏳ Contagem do Halving** — Quantos blocos faltam para o próximo corte de recompensa
- **🔬 Prova de trabalho** — Dados verificáveis ao vivo na Public Pool
- **📱 Acesso pelo celular** — QR Code para abrir o painel na mesma rede WiFi

---

## 🔬 Transparência Técnica

O coração deste projeto é **100% open source**:

- **Motor de mineração:** [pooler/cpuminer](https://github.com/pooler/cpuminer) e [tpruvot/cpuminer-multi](https://github.com/tpruvot/cpuminer-multi)
- **Interface:** HTML + JavaScript puro (auditável por qualquer pessoa)
- **Backend:** Node.js + Express

O código da interface e do servidor pode ser auditado por qualquer desenvolvedor diretamente neste repositório.

---

## 🎲 Entenda a Loteria

A rede Bitcoin gera um novo bloco a cada ~10 minutos. Cada bloco é um sorteio novo. Ao deixar este software rodando, você participa de **todos os sorteios**, 24h por dia.

- **Mais rápido o PC → mais tickets por segundo → mais chances**
- **Mais PCs com a mesma carteira → hashrate somado → mais chances**
- **O prêmio atual:** 3.125 BTC por bloco encontrado

Este software é mais poderoso que o NerdMiner físico, porém mais fraco que ASICs profissionais como o Bitaxe. É um minerador de loteria — honesto, real e verificável.



---

## ⚡ Apoie o Projeto

Se este projeto te ajudou, considere enviar qualquer valor em Satoshis via Lightning Network:

```
lnurl1dp68gurn8ghj7ampd3kx2ar0veekzar0wd5xjtnrdakj7tnhv4kxctttdehhwm30d3h82unvwqhkzmn8v4kxjcm3w45kcape8q0kt3hq
```

---

## 📄 Licença

MIT License — veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<div align="center">
Criado por <strong>EDUCABRAL</strong> para a comunidade Bitcoin brasileira ₿
</div>
