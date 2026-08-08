# 🎰 Software BTC Lottery Miner

<div align="center">

![Bitcoin](https://img.shields.io/badge/Bitcoin-Solo_Mining-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Windows](https://img.shields.io/badge/Windows-Compatible-0078D6?style=for-the-badge&logo=windows&logoColor=white)
![macOS](https://img.shields.io/badge/macOS-Compatible-000000?style=for-the-badge&logo=apple&logoColor=white)
![Linux](https://img.shields.io/badge/Linux%20%2F%20Raspberry%20Pi-Compatible-FCC624?style=for-the-badge&logo=linux&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Transforme qualquer PC, Mac ou Raspberry Pi em um Nó Minerador Solo real do Bitcoin.**

[⚡ Comunidade no Telegram: @BilheteDoBloco](https://t.me/BilheteDoBloco) • [🌐 Verificar na Public Pool](https://web.public-pool.io)

</div>

---

## 🎯 O que é este projeto?

O **Software BTC Lottery Miner** é uma interface premium para mineração solo de Bitcoin em qualquer computador. O objetivo não é ganhar centavos todo dia — é participar da **loteria do bloco**: cada cálculo gerado é um ticket real na disputa pelos **3.125 BTC** do prêmio oficial da rede Bitcoin.

> ⚠️ **Este NÃO é um simulador.** O software conecta diretamente à rede Bitcoin via protocolo Stratum (SHA-256d) usando a Public Pool. Cada share é verificável ao vivo.

---

## 🚀 Por que usar?

| Característica | Detalhe |
|---|---|
| ⚡ **Multi-motor inteligente** | Autodetecta AVX-512, AVX2, SHA-NI ou SSE2 conforme seu hardware |
| 🔗 **Protocolo real** | `stratum+tcp://public-pool.io:21496` — rede Bitcoin oficial |
| 🧠 **Algoritmo** | SHA-256d (algoritmo nativo do Bitcoin) |
| 📊 **Dashboard em tempo real** | Hashrate real da pool, shares válidos, melhor dificuldade, dados da rede |
| 🎯 **Equivalência NerdMiner** | Mostra quantos NerdMiners (60 kH/s cada) seu PC substitui em tempo real |
| 🔒 **100% Seguro** | Sua carteira é sua. Minera direto para o seu endereço, sem intermediários |
| 🖥️ **Multi-PC** | Use o mesmo endereço em quantos PCs quiser — o hashrate se soma na pool |
| 🏃 **Modo invisível** | Roda em segundo plano, ícone na bandeja do sistema (Windows) |
| 🌍 **Multiplataforma** | Windows, Mac OS e Linux/Raspberry Pi |

### ⚡ Velocidade por tipo de processador

| Processador | Motor Usado | Hashrate Real | Equiv. NerdMiners |
|---|---|---|---|
| i5/i7 antigo (2012-2015) | SSE2 | ~7 MH/s | ~120 NerdMiners |
| Intel 8ª+ geração | AVX2 | ~25 MH/s | ~416 NerdMiners |
| AMD Ryzen (Zen 3+) | SHA-NI | ~38 MH/s | ~633 NerdMiners |
| Intel i9 / AMD Ryzen 9 | AVX2+SHA | ~65 MH/s | ~1.083 NerdMiners |
| Xeon / Servidor | AVX-512 | +100 MH/s | +1.666 NerdMiners |

---

## 📦 Como baixar e instalar

### 📥 Download mais fácil (recomendado)

1. Clique no botão verde **`< > Code`** no topo desta página
2. Clique em **`Download ZIP`**
3. Extraia o arquivo ZIP na sua Área de Trabalho ou Documentos
4. Siga o passo a passo do seu sistema operacional abaixo

---

### 🪟 Windows — Passo a Passo

> ⚠️ **ANTES DE TUDO:** Adicione a pasta nas **Exceções do Windows Defender** ou desative o antivírus temporariamente. Mineradores são detectados como falso-positivo e podem ser apagados automaticamente!

1. Extraia o ZIP para a Área de Trabalho ou Documentos
2. Abra a pasta extraída
3. Dê **2 cliques** no arquivo **`INICIAR.bat`**
4. Se aparecer aviso do Windows, clique em **"Mais informações" → "Executar assim mesmo"**
5. O painel abre automaticamente no seu navegador em `http://localhost:3500`
6. Clique em **"CONFIGURAR CARTEIRA"** e cole seu endereço Bitcoin
7. Clique em **"GIRAR A ROLETA (INICIAR)"** e pronto!

---

### 🍎 Mac OS — Passo a Passo

1. Extraia o ZIP e abra a pasta
2. **Clique com o botão direito** no arquivo **`INICIAR.command`**
3. Selecione **"Abrir"** (não dê duplo clique na primeira vez)
4. Clique em **"Abrir"** na janela de confirmação
5. O sistema instala as dependências automaticamente (apenas na primeira vez)
6. O painel abre no navegador em `http://localhost:3500`
7. Configure sua carteira e inicie!

---

### 🐧 Linux / Raspberry Pi — Passo a Passo

1. Extraia o ZIP e abra o terminal dentro da pasta
2. Execute o comando abaixo para dar permissão e iniciar:

```bash
chmod +x INICIAR.sh && ./INICIAR.sh
```

3. Na **primeira execução**, o sistema instala Node.js e as dependências automaticamente
4. No **Raspberry Pi (ARM)**, o minerador é compilado sob medida automaticamente
5. Acesse o painel em: `http://localhost:3500`

---

## 🖼️ Painel de Controle

O dashboard inclui:

- **⚡ Velocidade da Aposta** — Hashrate real confirmado pela Public Pool
- **🎯 Equivalência em NerdMiners** — Quantos NerdMiners de 60 kH/s você equivale
- **📈 Gráfico de Velocidade** — Histórico do seu hashrate em tempo real
- **🎰 Jackpot do Bloco** — Valor atual do prêmio em BTC e reais
- **📦 Bloco Atual** — Número do bloco sincronizado com a rede
- **⏳ Halving** — Quantos blocos e dias faltam para o próximo halving
- **✅ Shares Válidos** — Total de tickets aceitos pela pool
- **🏆 Melhor Dificuldade** — Seu recorde de dificuldade histórico
- **🔗 Verificar na Public Pool** — Link direto para confirmar seus dados na pool

---

## 🔬 Transparência Técnica

O coração deste projeto é **100% open source**:

- **Motores de mineração:** [tpruvot/cpuminer-opt](https://github.com/JayDDee/cpuminer-opt) — Open Source
- **Interface:** HTML + JavaScript puro (auditável por qualquer pessoa)
- **Backend:** Node.js + Express
- **Pool:** [Public Pool](https://public-pool.io) — Solo mining transparente

O código da interface e do servidor pode ser auditado diretamente neste repositório.

---

## 🎲 Entenda a Loteria

A rede Bitcoin gera um novo bloco a cada ~10 minutos. Cada bloco é um sorteio novo. Ao deixar este software rodando, você participa de **todos os sorteios**, 24h por dia.

- **PC mais rápido → mais tickets por segundo → mais chances**
- **Mais PCs com a mesma carteira → hashrate somado → mais chances ainda**
- **O prêmio atual: 3.125 BTC** direto para a sua carteira se você encontrar o bloco

> ⚠️ Mineração solo é como jogar na loteria — as chances são pequenas, mas o prêmio é enorme. Use um computador que já estaria ligado de qualquer forma para não gerar custo extra de energia.

---

## ❓ Dúvidas Frequentes

**P: Preciso deixar a janela preta aberta?**
R: Não! O minerador roda em segundo plano. Pode fechar o navegador à vontade.

**P: Que endereço de carteira usar?**
R: Use uma carteira própria (Electrum, Exodus, Ledger). Nunca use endereço de exchange (Binance, Mercado Bitcoin). O endereço deve começar com `bc1q`, `bc1p`, `1` ou `3`.

**P: Como confirmar que está minerando de verdade?**
R: Clique em **"VERIFICAR NA PUBLIC POOL"** no painel. Você verá seus shares validados na pool oficial em tempo real.

**P: Por que o número de NerdMiners muda?**
R: A pool calcula o hashrate pela média dos shares recebidos. Nos momentos em que um share difícil entra, o número sobe. Depois normaliza. É comportamento normal.

**P: Posso usar em vários PCs?**
R: Sim! Use o mesmo endereço Bitcoin em todos. O hashrate se soma automaticamente na pool.

---

## ⚡ Apoie o Projeto

Se este projeto te ajudou, considere enviar qualquer valor via Lightning Network:

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
