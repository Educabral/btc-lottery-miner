const dict = {
  "🚨 UM MINERADOR SOLO ACABOU DE GANHAR 3.125 BTC! 🚨": "🚨 A SOLO MINER JUST WON 3.125 BTC! 🚨",
  "Configure sua Carteira Bitcoin": "Configure your Bitcoin Wallet",
  "Cole o endereço da sua carteira BTC abaixo. Ele será salvo e mantido até que você decida trocar.": "Paste your BTC wallet address below. It will be saved until you decide to change it.",
  "🚀 SALVAR E INICIAR MINERAÇÃO": "🚀 SAVE AND START MINING",
  "Iniciando Motor...": "Starting Engine...",
  "🎰 SEU BILHETE DE LOTERIA": "🎰 YOUR LOTTERY TICKET",
  "📥 BAIXAR IMAGEM": "📥 DOWNLOAD IMAGE",
  "💬 ENVIAR NO WHATSAPP": "💬 SEND ON WHATSAPP",
  "Fechar": "Close",
  "⚡ VELOCIDADE DA APOSTA (CHANCES DE GANHAR)": "⚡ BETTING SPEED (CHANCES TO WIN)",
  "Pico: ": "Peak: ",
  "VELOCIDADE DA APOSTA": "BETTING SPEED",
  "RECOMPENSA DO BLOCO": "BLOCK REWARD",
  "STATUS DA REDE": "NETWORK STATUS",
  "Dificuldade:": "Difficulty:",
  "Último Bloco:": "Last Block:",
  "Próx. Halving:": "Next Halving:",
  "Faltam": "Left",
  "Dias": "Days",
  "SEU HARDWARE": "YOUR HARDWARE",
  "Uso de CPU:": "CPU Usage:",
  "Auto-Iniciar:": "Auto-Start:",
  "MINHAS CHANCES (TICKETS)": "MY CHANCES (TICKETS)",
  "Tickets Enviados:": "Tickets Sent:",
  "Melhor Tentativa:": "Best Attempt:",
  "Tempo Ligado:": "Uptime:",
  "💎 PATROCINADOR OFICIAL": "💎 OFFICIAL SPONSOR",
  "PIXGO PLATAFORMA": "PIXGO PLATFORM",
  "A plataforma completa para impulsionar suas vendas e automações.": "The complete platform to boost your sales and automations.",
  "🚀 CRIAR CONTA GRÁTIS": "🚀 CREATE FREE ACCOUNT",
  "📣 COMPARTILHAR MINHA MINERAÇÃO": "📣 SHARE MY MINING",
  "Compartilhe seu progresso e mostre que você está contribuindo para a rede Bitcoin!": "Share your progress and show that you are contributing to the Bitcoin network!",
  "📤 COMPARTILHAR STATS": "📤 SHARE STATS",
  "📋 COPIAR TEXTO": "📋 COPY TEXT",
  "✅ COPIADO!": "✅ COPIED!",
  "🤔 O QUE É MINERAÇÃO SOLO?": "🤔 WHAT IS SOLO MINING?",
  "A mineração solo não te paga centavos por dia. Ela funciona exatamente como uma": "Solo mining doesn't pay you pennies a day. It works exactly like a",
  "Loteria Global": "Global Lottery",
  "Se o seu computador for o sortudo a resolver o enigma matemático do bloco atual (algo raríssimo), a rede te recompensa com o prêmio total de": "If your computer is the lucky one to solve the math puzzle of the current block (very rare), the network rewards you with the full prize of",
  "3.125 BTC (Milhões de Reais)": "3.125 BTC (Hundreds of thousands of dollars)",
  "direto na sua carteira, sem dividir com ninguém.": "straight to your wallet, without splitting with anyone.",
  "🌍 COMO VOCÊ ESTÁ AJUDANDO A REDE DO BITCOIN?": "🌍 HOW ARE YOU HELPING THE BITCOIN NETWORK?",
  "Ao rodar este terminal, seu computador se torna um": "By running this terminal, your computer becomes an",
  "Nó Minerador Independente": "Independent Mining Node",
  "(Solo Miner). Mesmo que as chances de encontrar um bloco sozinho sejam como uma \"loteria\", cada tentativa matemática (hash) gerada ajuda a proteger a rede descentralizada do Bitcoin.": "(Solo Miner). Even though the chances of finding a block alone are like a \"lottery\", every math attempt (hash) generated helps secure the decentralized Bitcoin network.",
  "Quanto mais pessoas comuns rodam pequenos mineradores em casa, mais difícil fica para grandes corporações ou governos dominarem o processamento global. Você está ajudando a manter o Bitcoin verdadeiramente livre, seguro e descentralizado, e pode ser recompensado com o Jackpot integral da rede pelo seu esforço!": "The more everyday people run small miners at home, the harder it gets for huge corporations or governments to dominate global processing. You are helping keep Bitcoin truly free, secure, and decentralized, and you could be rewarded with the network's full Jackpot for your effort!",
  "AGUARDANDO CARTEIRA": "WAITING FOR WALLET",
  "MINERANDO (SOLO)": "MINING (SOLO)",
  "✅ Formatos aceitos:": "✅ Accepted formats:",
  "— Native SegWit (recomendado)": "— Native SegWit (recommended)",
  "— Taproot": "— Taproot",
  "— Legacy / SegWit": "— Legacy / SegWit",
  "⚠️ Nunca use o endereço de uma exchange": "⚠️ Never use an exchange address",
  "(Binance, Mercado Bitcoin, etc). Use uma carteira própria como": "(Binance, Coinbase, etc). Use a self-custody wallet like",
  "SOFTWARE BTC LOTTERY MINER": "BTC LOTTERY MINER SOFTWARE",
  "SOLO JACKPOT TERMINAL": "SOLO JACKPOT TERMINAL"
};

let currentLang = localStorage.getItem('lang') || 'pt';

function t(ptText) {
  if (currentLang === 'en' && dict[ptText]) return dict[ptText];
  return ptText;
}

function translateTextNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    let text = node.nodeValue.trim();
    if (text === "") return;
    
    // Procura a tradução exata
    let translation = null;
    if (currentLang === 'en') {
      if (dict[text]) translation = dict[text];
    } else {
      // Reverter para PT
      for (const [pt, en] of Object.entries(dict)) {
        if (text === en) {
          translation = pt;
          break;
        }
      }
    }
    
    if (translation) {
      node.nodeValue = node.nodeValue.replace(text, translation);
    }
  } else {
    // Ignora inputs e scripts
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
    for (let i = 0; i < node.childNodes.length; i++) {
      translateTextNode(node.childNodes[i]);
    }
  }
}

function applyTranslation() {
  translateTextNode(document.body);
  
  // Alguns elementos específicos como value de inputs ou placeholders
  const walletInput = document.getElementById('walletInput');
  if (walletInput) {
    walletInput.placeholder = currentLang === 'en' ? "Paste here: bc1q... or bc1p..." : "Cole aqui: bc1q... ou bc1p...";
  }
  
  // Atualiza botão
  const langBtn = document.getElementById('langBtn');
  if (langBtn) {
    langBtn.textContent = currentLang === 'en' ? "🇧🇷" : "🇺🇸";
  }
}

function toggleLanguage() {
  currentLang = currentLang === 'pt' ? 'en' : 'pt';
  localStorage.setItem('lang', currentLang);
  applyTranslation();
  
  // Recarrega stats para aplicar linguagem no status gerado por JS
  if (typeof fetchStats === 'function') fetchStats();
}

document.addEventListener('DOMContentLoaded', () => {
  if (currentLang === 'en') {
    // Timeout curto pra dar tempo do DOM montar (útil se chamado antes do script final)
    setTimeout(applyTranslation, 50);
  }
});
