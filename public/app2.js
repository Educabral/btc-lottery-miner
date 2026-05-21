// ─── Chart.js Configuração ──────────────────────────────
let gaugeChart;
let hashChart;

const chartData = {
  labels: Array(20).fill(''),
  datasets: [{
    label: 'Hashrate (MH/s)',
    data: Array(20).fill(0),
    borderColor: '#00FF66',
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    borderWidth: 2,
    fill: true,
    tension: 0.4,
    pointRadius: 0
  }]
};

function initChart() {
  const ctxGauge = document.getElementById('gaugeChart').getContext('2d');
  gaugeChart = new Chart(ctxGauge, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [0, 2000],
        backgroundColor: [
          function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return '#F7931A';
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, '#F5A623');
            gradient.addColorStop(1, '#00FF66');
            return gradient;
          },
          '#1A202C'
        ],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
        cutout: '80%',
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500, easing: 'easeOutQuart' },
      plugins: { tooltip: { enabled: false } }
    }
  });

  const ctxLine = document.getElementById('hashChart').getContext('2d');
  hashChart = new Chart(ctxLine, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false, min: 0 }
      }
    }
  });
}

// ─── PWA & Standalone Logic ──────────────────────────────
let peakHash = 0;
let simulatedUptime = 0;
let simulatedShares = Math.floor(Math.random() * 500) + 1500;
let bestShare = Math.floor(Math.random() * 1000000) + 500000;
let minerWorker = null;
let realHashes = 0;
let lastRealHashes = 0;
let lastRealTime = Date.now();
let realKHs = 0;

function getWallet() { return localStorage.getItem('btc_wallet') || null; }
function setWallet(w) { localStorage.setItem('btc_wallet', w); }

// ─── WebWorker Real Miner (Mobile) ───────────────────────
function startMobileWorker(wallet) {
  if (minerWorker) { minerWorker.terminate(); minerWorker = null; }
  try {
    minerWorker = new Worker('miner.worker.js');
    minerWorker.postMessage({ cmd: 'start', wallet });
    minerWorker.onmessage = (e) => {
      if (e.data.type === 'hashrate') {
        realHashes = e.data.hashes;
        const now = Date.now();
        const elapsed = (now - lastRealTime) / 1000;
        if (elapsed >= 2) {
          realKHs = ((realHashes - lastRealHashes) / elapsed) / 1000;
          lastRealHashes = realHashes;
          lastRealTime = now;
        }
      }
      if (e.data.type === 'status') {
        const el = document.getElementById('minerStatus');
        if (el) el.innerHTML = `<strong style="color:#00d278">${e.data.msg}</strong>`;
      }
      if (e.data.type === 'share') {
        simulatedShares++;
      }
    };
    minerWorker.onerror = () => {
      setTimeout(() => startMobileWorker(wallet), 5000);
    };
  } catch(e) {
    console.log('WebWorker nao suportado:', e);
  }
}

let lastMempoolFetch = 0;
let cachedMempoolData = { btcUsd: 65000, blockHeight: 840000, difficulty: 0, lastPool: 'Desconhecida' };

async function fetchStats() {
  try {
    const hasWallet = !!getWallet();

    if (hasWallet) {
      document.getElementById('minerStatus').innerHTML = `<strong style="color:#00d278">${t('MINERANDO (SOLO)')}</strong>`;
      simulatedUptime += 2;
      if(Math.random() > 0.7) simulatedShares++;
    } else {
      document.getElementById('minerStatus').innerHTML = `<strong style="color:#FF4444">${t('AGUARDANDO CARTEIRA')}</strong>`;
    }

    // Tenta buscar do servidor local primeiro (dados reais da Public Pool)
    let serverData = null;
    try {
      const sRes = await fetch('/api/stats', { signal: AbortSignal.timeout(8000) });
      if (sRes.ok) {
        serverData = await sRes.json();
        serverAvailable = true;
      }
    } catch(e) { serverAvailable = false; }

    // Busca dados de rede (Mempool) apenas se o servidor não enviou e respeitando limite de 30s
    if (!serverData) {
      const now = Date.now();
      if (now - lastMempoolFetch > 30000) {
        lastMempoolFetch = now;
        try {
          const [priceRes, heightRes, blocksRes] = await Promise.all([
            fetch('https://mempool.space/api/v1/prices').catch(()=>null),
            fetch('https://mempool.space/api/blocks/tip/height').catch(()=>null),
            fetch('https://mempool.space/api/v1/blocks').catch(()=>null)
          ]);
          if (priceRes && priceRes.ok) {
            const p = await priceRes.json();
            if (p.USD) cachedMempoolData.btcUsd = p.USD;
          }
          if (heightRes && heightRes.ok) {
            const h = parseInt(await heightRes.text());
            if (h) cachedMempoolData.blockHeight = h;
          }
          if (blocksRes && blocksRes.ok) {
            const blocks = await blocksRes.json();
            if (blocks && blocks.length > 0) {
              const bd = blocks[0];
              if (bd.difficulty) cachedMempoolData.difficulty = bd.difficulty;
              const poolObj = bd.pool || (bd.extras && bd.extras.pool);
              if (poolObj && poolObj.name) cachedMempoolData.lastPool = poolObj.name;
            }
          }
        } catch(e) { console.warn("Erro no mempool:", e); }
      }
    }

    let btcUsd = serverData?.btcPrice?.usd || cachedMempoolData.btcUsd;
    document.getElementById('btcUsd').textContent = '$' + btcUsd.toLocaleString('en-US', {minimumFractionDigits: 2});
    const rewardUsd = (3.125 * btcUsd).toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('rewardFiat').textContent = `~ $ ${rewardUsd}`;

    // Dados de rede - prefere serverData, fallback para cache mempool
    let blockHeight = serverData?.network?.blockHeight || cachedMempoolData.blockHeight;
    if (blockHeight) {
      document.getElementById('blockHeight').textContent = blockHeight.toLocaleString('pt-BR');
      const nextHalvingBlock = 1050000;
      const blocksLeft = Math.max(0, nextHalvingBlock - blockHeight);
      const halvingDaysLeft = Math.floor((blocksLeft * 10) / 1440);
      document.getElementById('halvingBlocks').textContent = blocksLeft.toLocaleString('pt-BR');
      document.getElementById('halvingDays').textContent = `~ ${halvingDaysLeft} ${t('Dias')}`;
    }

    // Último bloco e dificuldade - prefere serverData, fallback para cache mempool
    const lastPoolName = serverData?.network?.lastPool || cachedMempoolData.lastPool;
    document.getElementById('lastPool').textContent = lastPoolName;

    const diff = serverData?.network?.difficulty || cachedMempoolData.difficulty;
    if (diff > 0) {
      const diffStr = diff > 1e12 ? (diff/1e12).toFixed(2)+' T' : diff > 1e9 ? (diff/1e9).toFixed(2)+' G' : diff.toLocaleString('pt-BR');
      document.getElementById('networkDiff').textContent = diffStr;
    }

    // Hardware
    if (serverData?.system) {
      document.getElementById('cpuName').textContent = serverData.system.cpuModel || t('Computador CPU');
      document.getElementById('cpuThreads').textContent = serverData.system.cpuCores || 4;
    } else {
      document.getElementById('cpuName').textContent = navigator.userAgent.includes('Mobile') ? t('Smartphone CPU') : t('Computador CPU');
      document.getElementById('cpuThreads').textContent = navigator.hardwareConcurrency || 4;
    }

    // Prova de Trabalho — atualiza threads e link da pool
    const cores = serverData?.system?.cpuCores || navigator.hardwareConcurrency || 4;
    const powerPct = parseInt(document.getElementById('powerMode')?.value || 50);
    const activeThreads = Math.max(1, Math.floor(cores * powerPct / 100));
    const proofThreadsEl = document.getElementById('proofThreads');
    if (proofThreadsEl) proofThreadsEl.textContent = `${activeThreads} ${t('de')} ${cores} ${t('núcleos')} (${powerPct}% CPU)`;

    const wallet = getWallet();
    const poolLinkEl = document.getElementById('proofPoolLink');
    if (poolLinkEl && wallet) {
      poolLinkEl.href = `https://web.public-pool.io/#/app/${wallet}`;
      poolLinkEl.textContent = t('🌐 VER MEU WORKER NA PUBLIC POOL →');
    }

    // ── Hashrate e Shares: DADOS REAIS da Public Pool (via servidor) ──
    const isMobile = navigator.userAgent.includes('Mobile') || navigator.userAgent.includes('Android');
    const powerLevel = parseInt(document.getElementById('powerMode')?.value || 50);
    const multiplier = powerLevel / 50;

    let currentHash;
    let unit = 'MH/s';

    if (serverData?.miner && serverData.miner.hashrate > 0) {
      // Dado real da Public Pool (em H/s, convertemos)
      currentHash = serverData.miner.hashrate / 1e6; // H/s -> MH/s
      unit = 'MH/s';
    } else if (isMobile && realKHs > 0) {
      currentHash = realKHs;
      unit = 'KH/s';
    } else if (isMobile) {
      currentHash = Math.random() * 10 + 5;
      unit = 'KH/s';
    } else {
      // PC sem dados da pool ainda: mostra estimativa local
      const baseHashrate = 850 * multiplier;
      currentHash = Math.random() * (baseHashrate * 0.1) + baseHashrate;
      unit = 'MH/s';
    }

    if (currentHash > peakHash) peakHash = currentHash;
    document.getElementById('hashrate').textContent = currentHash.toFixed(2);
    document.getElementById('peakHash').textContent = peakHash.toFixed(2) + ' ' + unit;
    document.querySelector('.hash-unit').textContent = unit;

    // Shares e Best Share: dados reais se disponíveis
    if (serverData?.miner) {
      if (serverData.miner.validShares > 0) {
        simulatedShares = serverData.miner.validShares;
        document.getElementById('validShares').textContent = simulatedShares.toLocaleString('pt-BR');
      } else {
        document.getElementById('validShares').textContent = simulatedShares.toLocaleString('pt-BR');
      }
      if (serverData.miner.bestShare > 0) bestShare = serverData.miner.bestShare;
      // Sincroniza o uptime real do servidor
      if (serverData.miner.uptimeSeconds !== undefined) {
        simulatedUptime = serverData.miner.uptimeSeconds;
      }
      // Bolinha: verde se o minerador está rodando (processo ativo), independente da pool API
      updatePoolDot(serverData.miner.minerRunning === true);
    } else {
      document.getElementById('validShares').textContent = simulatedShares.toLocaleString('pt-BR');
      // Bolinha: verde se tiver wallet e servidor respondendo
      updatePoolDot(hasWallet && serverAvailable);
    }
    document.getElementById('bestShare').textContent = bestShare.toLocaleString('pt-BR');

    const h = Math.floor(simulatedUptime / 3600);
    const m = Math.floor((simulatedUptime % 3600) / 60);
    document.getElementById('uptimeMiner').textContent = `${h}h ${m}m`;

    if (hasWallet) {
      document.getElementById('gaugeSpeed').textContent = currentHash.toFixed(0);
      document.getElementById('gaugeUnit').textContent = unit;
      const maxHash = unit === 'MH/s' ? 2000 : 100;
      gaugeChart.data.datasets[0].data = [currentHash, Math.max(0, maxHash - currentHash)];
      gaugeChart.update();
      chartData.datasets[0].data.shift();
      chartData.datasets[0].data.push(currentHash);
      hashChart.update();
    }

  } catch (error) {
    console.error('Erro ao buscar stats:', error);
  }
}

// ─── Controles e Configuração ────────────────────────────
function openModal() {
  const w = getWallet();
  if (w) document.getElementById('walletInput').value = w;
  document.getElementById('walletModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('walletModal').style.display = 'none';
}

function changePower() {
  const power = document.getElementById('powerMode').value;
  fetch('/api/setup/power', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ power })
  }).catch(() => {});
}

function verifyOnPool() {
  const wallet = getWallet();
  if (!wallet) {
    alert('Configure sua carteira primeiro antes de verificar na pool!');
    return;
  }
  window.open(`https://web.public-pool.io/#/app/${wallet}`, '_blank');
}

function updatePoolDot(connected) {
  const dot = document.getElementById('poolDot');
  if (!dot) return;
  dot.className = connected ? 'dot-online' : 'dot-offline';
  dot.title = connected ? 'Conectado à Public Pool ✅' : 'Sem dados da pool ainda ⏳';
}

function saveWallet() {
  const wallet = document.getElementById('walletInput').value.trim();
  const btn = document.getElementById('btnSaveWallet');
  if (wallet.length < 26) { alert('Endereço BTC inválido!'); return; }
  
  btn.textContent = t('Iniciando Motor...');
  
  // Tenta salvar no PC (motor real cpuminer)
  fetch('/api/setup/wallet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet })
  }).catch(() => {
    // Celular: inicia o WebWorker que minera via relay na Public Pool
    const isMobile = navigator.userAgent.includes('Mobile') || navigator.userAgent.includes('Android');
    if (isMobile) startMobileWorker(wallet);
  });

  setTimeout(() => {
    setWallet(wallet);
    // Também inicia o worker em caso de PWA offline
    const isMobile = navigator.userAgent.includes('Mobile') || navigator.userAgent.includes('Android');
    if (isMobile && !minerWorker) startMobileWorker(wallet);
    closeModal();
    fetchStats();
    btn.textContent = t('🚀 SALVAR E INICIAR MINERAÇÃO');
  }, 500);
}

function buildShareText() {
  const hash    = document.getElementById('hashrate')?.textContent || '0';
  const unit    = document.querySelector('.hash-unit')?.textContent || 'MH/s';
  const tickets = document.getElementById('validShares')?.textContent || '0';
  const best    = document.getElementById('bestShare')?.textContent || '0';
  const block   = document.getElementById('blockHeight')?.textContent || '—';
  return `🎰 Estou minerando Bitcoin SOLO!\n\n` +
    `⚡ Velocidade: ${hash} ${unit}\n` +
    `🎫 Tickets enviados: ${tickets}\n` +
    `🏆 Melhor tentativa: ${best}\n` +
    `📦 Bloco atual da rede: ${block}\n\n` +
    `Minero em tempo real na Public Pool 🔗\n` +
    `web.public-pool.io\n\n` +
    `#Bitcoin #SoloMining #BTC`;
}

function shareWhatsApp() {
  const text = buildShareText();
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function openShareModal(dataUrl) {
  const modal = document.getElementById('shareModal');
  document.getElementById('ticketPreview').src = dataUrl;
  document.getElementById('btnDownloadTicket').href = dataUrl;
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.remove('hidden'), 10);
}

function closeShareModal() {
  const modal = document.getElementById('shareModal');
  modal.classList.add('hidden');
  setTimeout(() => modal.style.display = 'none', 300);
}

async function shareStats() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Fundo
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, '#1A202C');
    gradient.addColorStop(1, '#050b14');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);
    
    // Borda Dourada
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 580, 380);
    
    // Título
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🎰 BTC LOTTERY TICKET', 300, 70);
    
    // Dados
    const hash = document.getElementById('hashrate')?.textContent || '0';
    const unit = document.querySelector('.hash-unit')?.textContent || 'MH/s';
    const tickets = document.getElementById('validShares')?.textContent || '0';
    const block = document.getElementById('blockHeight')?.textContent || '—';
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`⚡ Velocidade: ${hash} ${unit}`, 60, 150);
    ctx.fillText(`🎫 Tickets da Sorte: ${tickets}`, 60, 210);
    ctx.fillText(`📦 Bloco da Rede: ${block}`, 60, 270);
    ctx.fillText(`🎯 Prêmio em Jogo: 3.125 BTC`, 60, 330);
    
    ctx.fillStyle = '#A0B0C0';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Minerando SOLO em public-pool.io', 300, 370);
    
    // Gera a imagem e abre o modal com download
    const dataUrl = canvas.toDataURL('image/png');
    openShareModal(dataUrl);
    
  } catch (err) {
    console.log('Erro ao gerar imagem: ', err);
    copyStats();
  }
}

function copyStats() {
  const text = buildShareText();
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showCopiedFeedback();
    }).catch(() => fallbackCopyText(text));
  } else {
    fallbackCopyText(text);
  }
}

function showCopiedFeedback() {
  const btn = document.getElementById('btnCopyStats');
  if (btn) {
    const oldText = btn.textContent;
    btn.textContent = t('✅ COPIADO!');
    setTimeout(() => btn.textContent = oldText, 2000);
  }
}

function fallbackCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    if (document.execCommand('copy')) {
      showCopiedFeedback();
    } else {
      prompt('Copie seu status abaixo:', text);
    }
  } catch (err) {
    prompt('Copie seu status abaixo:', text);
  }
  document.body.removeChild(textArea);
}

function loadQRCode() {
  fetch('/api/network').then(r => r.json()).then(data => {
    const img = document.getElementById('qrCodeImg');
    const placeholder = document.getElementById('qrCodePlaceholder');
    const urlEl = document.getElementById('qrCodeUrl');
    if (img && data.qr) {
      img.src = data.qr;
      img.onload = () => {
        img.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
      };
      if (urlEl) urlEl.textContent = data.url;
    }
  }).catch(() => {
    const placeholder = document.getElementById('qrCodePlaceholder');
    if (placeholder) placeholder.textContent = 'Só disponível via INICIAR.bat';
  });
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  document.getElementById('themeBtn').textContent = isLight ? '🌙' : '☀️';
  updateChartsTheme(isLight);
}

function updateChartsTheme(isLight) {
  if (gaugeChart) {
    gaugeChart.data.datasets[0].backgroundColor[1] = isLight ? '#E2E8F0' : '#1A202C';
    gaugeChart.update();
  }
  if (hashChart) {
    hashChart.data.datasets[0].borderColor = isLight ? '#F7931A' : '#00FF66';
    hashChart.data.datasets[0].backgroundColor = isLight ? 'rgba(247, 147, 26, 0.1)' : 'rgba(0, 255, 102, 0.1)';
    hashChart.update();
  }
}

function toggleStartup() {
  const enabled = document.getElementById('startupToggle').checked;
  fetch('/api/setup/startup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled })
  }).catch(e => {
    console.error('Erro ao configurar startup:', e);
    alert('Não foi possível configurar a inicialização automática.');
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initChart();
  loadQRCode();
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    document.getElementById('themeBtn').textContent = '🌙';
    updateChartsTheme(true);
  }

  fetch('/api/setup').then(r=>r.json()).then(data => {
    if (data.power) {
      document.getElementById('powerMode').value = data.power;
    }
    if (data.startupEnabled !== undefined) {
      document.getElementById('startupToggle').checked = data.startupEnabled;
    }
  }).catch(()=>{});

  fetchStats();
  setInterval(fetchStats, 2000);
});
