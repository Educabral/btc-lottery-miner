const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const os = require('os');
const si = require('systeminformation');

let cachedCpuInfo = null;
si.cpu().then(c => cachedCpuInfo = c).catch(() => null);

const app = express();
const PORT = 3500; 

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── SEGURANÇA: APIs de configuração só aceitam requisições do próprio PC ───
function localhostOnly(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || '';
  const isLocal = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  if (!isLocal) {
    return res.status(403).json({ error: 'Acesso negado. Configurações só podem ser feitas do computador local.' });
  }
  next();
}

const fs = require('fs');
const { spawn } = require('child_process');

const STATS_FILE = path.join(__dirname, 'stats.json');

function loadStats() {
  try { if (fs.existsSync(STATS_FILE)) return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8')); } catch (e) {}
  return { wallet: null, power: 50 };
}
function saveStats(s) {
  try { fs.writeFileSync(STATS_FILE, JSON.stringify(s, null, 2)); } catch (e) {}
}
let persistentStats = loadStats();

// Controle do Minerador Real (cpuminer)
let minerProcess = null;
let minerStartTime = 0;

const { execSync } = require('child_process');

// Verifica se o cpuminer está de fato rodando (fonte de verdade)
function isMinerRunning() {
  try {
    if (os.platform() === 'win32') {
      const result = execSync('tasklist /fi "imagename eq cpuminer-sse2.exe" /fo csv /nh', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      return result.toLowerCase().includes('cpuminer-sse2.exe');
    } else {
      const result = execSync('pgrep -f cpuminer-linux', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      return result.trim().length > 0;
    }
  } catch(e) { return false; }
}

function startMinerReal(wallet, power = 50) {
  if (minerProcess) {
    try { minerProcess.kill(); } catch(e) {}
    minerProcess = null;
  }
  try { 
    if (os.platform() === 'win32') {
      execSync('taskkill /f /im cpuminer-sse2.exe', { stdio: 'ignore' }); 
    } else {
      execSync('pkill -f cpuminer-linux', { stdio: 'ignore' }); 
    }
  } catch(e) {}

  if (!wallet) return;

  const minerExec = os.platform() === 'win32' ? 'cpuminer-sse2.exe' : 'cpuminer-linux';
  const minerPath = path.join(__dirname, 'miner', minerExec);
  if (!fs.existsSync(minerPath)) return;

  if (os.platform() !== 'win32') {
    try { fs.chmodSync(minerPath, '755'); } catch(e) {}
  }

  let threads = Math.max(1, Math.floor((os.cpus().length * power) / 100));
  if (power >= 100) threads = os.cpus().length;

  // Adiciona Hostname para evitar conflitos se o usuário rodar em 2 PCs com a mesma carteira
  const safeHostname = os.hostname().replace(/\W/g, '');
  const poolWallet = wallet.includes('.') ? wallet : `${wallet}.${safeHostname}`;

  minerProcess = spawn(minerPath, [
    '-a', 'sha256d',
    '-o', 'stratum+tcp://public-pool.io:21496',
    '-u', poolWallet,
    '-p', 'x',
    '-t', threads.toString()
  ], { detached: true, stdio: 'ignore' });

  minerStartTime = Date.now();
  minerProcess.unref();
}

// WATCHDOG inteligente: só reinicia após 3 falhas consecutivas (evita criar sessões desnecessárias na pool)
let watchdogFailCount = 0;
setInterval(() => {
  if (!persistentStats.wallet) { watchdogFailCount = 0; return; }
  if (isMinerRunning()) {
    watchdogFailCount = 0; // está rodando, reseta o contador
  } else {
    watchdogFailCount++;
    if (watchdogFailCount >= 3) {
      console.log(`[WATCHDOG] Minerador inativo por ${watchdogFailCount * 20}s. Reiniciando...`);
      const savedStart = minerStartTime;
      startMinerReal(persistentStats.wallet, persistentStats.power || 50);
      minerStartTime = savedStart;
      watchdogFailCount = 0;
    } else {
      console.log(`[WATCHDOG] Minerador não detectado (tentativa ${watchdogFailCount}/3)...`);
    }
  }
}, 20000);

// Inicia se já tiver wallet salva ao abrir
if (persistentStats.wallet) {
  startMinerReal(persistentStats.wallet, persistentStats.power || 50);
}


// ─── API: Setup e Configuração ───
const STARTUP_LNK = path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup', 'BTCLotteryMiner.lnk');

app.get('/api/setup', (req, res) => {
  res.json({
    walletConfigured: !!persistentStats.wallet,
    wallet: persistentStats.wallet,
    power: persistentStats.power || 50,
    startupEnabled: fs.existsSync(STARTUP_LNK)
  });
});

app.post('/api/setup/wallet', localhostOnly, (req, res) => {
  const { wallet } = req.body;
  if (!wallet || wallet.length < 26) return res.status(400).json({ error: 'Wallet inválida' });
  persistentStats.wallet = wallet.trim();
  saveStats(persistentStats);
  
  // Dispara o minerador real invisível no PC
  startMinerReal(persistentStats.wallet, persistentStats.power || 50);

  res.json({ ok: true });
});

app.post('/api/setup/power', (req, res) => {
  const { power } = req.body;
  persistentStats.power = parseInt(power);
  saveStats(persistentStats);
  
  // Reinicia com a nova força
  if (persistentStats.wallet) {
    startMinerReal(persistentStats.wallet, persistentStats.power);
  }
  res.json({ ok: true });
});

app.post('/api/setup/startup', localhostOnly, (req, res) => {
  const { enabled } = req.body;
  try {
    if (enabled) {
      const batPath = path.join(__dirname, 'INICIAR.bat');
      const { execSync } = require('child_process');
      const psCommand = `$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('${STARTUP_LNK}'); $Shortcut.TargetPath = '${batPath}'; $Shortcut.WorkingDirectory = '${__dirname}'; $Shortcut.Save()`;
      execSync(`powershell -Command "${psCommand}"`, { stdio: 'ignore' });
    } else {
      if (fs.existsSync(STARTUP_LNK)) fs.unlinkSync(STARTUP_LNK);
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Estatísticas (Bitcoin Mempool + Mock do Minerador) ───
// ─── API: Rede Local (para QR Code) ───
app.get('/api/network', (req, res) => {
  const nets = os.networkInterfaces();
  let localIP = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) { localIP = net.address; break; }
    }
  }
  const url = `http://${localIP}:${PORT}`;
  const qr  = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}&bgcolor=050b14&color=00FF66&margin=10`;
  res.json({ url, qr });
});

// Cache para não chamar a API a cada 2s
let cachedPublicPool = { hashrate: 0, shares: 0, workers: 0, bestShare: 0, lastFetch: 0 };

async function fetchPublicPoolStats(wallet) {
  if (!wallet) return cachedPublicPool;
  const now = Date.now();
  if (now - cachedPublicPool.lastFetch < 30000) return cachedPublicPool; // cache 30s
  try {
    const r = await fetch(`https://web.public-pool.io/api/client/${wallet}`, { signal: AbortSignal.timeout(5000) }).catch(() => null);
    if (r && r.ok) {
      const data = await r.json();
      cachedPublicPool = {
        hashrate: data.hashRate || 0,
        shares: data.shares || 0,
        workers: data.workerCount || 1,
        bestShare: data.bestShare || 0,
        lastFetch: now
      };
    }
  } catch(e) {}
  return cachedPublicPool;
}

let cachedServerMempool = {
  lastFetch: 0,
  btcUsd: 65000,
  btcBrl: 65000 * 5.15,
  blockHeight: 840000,
  networkDiff: 0,
  lastPool: "Desconhecida",
  blocksLeft: 210000,
  halvingDaysLeft: 1450
};

async function fetchMempoolServerStats() {
  const now = Date.now();
  if (now - cachedServerMempool.lastFetch < 30000) return cachedServerMempool;
  
  try {
    const [btcPriceRes, blockHeightRes, blocksListRes] = await Promise.all([
      fetch('https://mempool.space/api/v1/prices', { signal: AbortSignal.timeout(3000) }).catch(() => null),
      fetch('https://mempool.space/api/blocks/tip/height', { signal: AbortSignal.timeout(3000) }).catch(() => null),
      fetch('https://mempool.space/api/v1/blocks', { signal: AbortSignal.timeout(3000) }).catch(() => null)
    ]);

    if (btcPriceRes && btcPriceRes.ok) {
      const p = await btcPriceRes.json();
      if (p.USD) {
        cachedServerMempool.btcUsd = p.USD;
        cachedServerMempool.btcBrl = p.USD * 5.15;
      }
    }

    if (blockHeightRes && blockHeightRes.ok) {
      const h = parseInt(await blockHeightRes.text());
      if (h) {
        cachedServerMempool.blockHeight = h;
        const nextHalvingBlock = 1050000;
        cachedServerMempool.blocksLeft = Math.max(0, nextHalvingBlock - h);
        cachedServerMempool.halvingDaysLeft = Math.floor((cachedServerMempool.blocksLeft * 10) / 1440);
      }
    }

    if (blocksListRes && blocksListRes.ok) {
      const blocks = await blocksListRes.json();
      if (blocks && blocks.length > 0) {
        const bd = blocks[0];
        if (bd.difficulty) cachedServerMempool.networkDiff = bd.difficulty;
        const poolObj = bd.pool || (bd.extras && bd.extras.pool);
        if (poolObj && poolObj.name) cachedServerMempool.lastPool = poolObj.name;
      }
    }
    
    cachedServerMempool.lastFetch = now;
  } catch(e) {}
  
  return cachedServerMempool;
}

app.get('/api/stats', async (req, res) => {
  try {
    const [mempool, poolStats] = await Promise.all([
      fetchMempoolServerStats(),
      persistentStats.wallet ? fetchPublicPoolStats(persistentStats.wallet) : Promise.resolve({ hashrate: 0, shares: 0, workers: 0, bestShare: 0, lastFetch: 0 })
    ]);

    // 3. Usa o cache de CPU (calculado uma vez)
    const cpuInfo = cachedCpuInfo;
    
    // 4. Retorno
    res.json({
      online: !!persistentStats.wallet,
      walletConfigured: !!persistentStats.wallet,
      wallet: persistentStats.wallet,
      btcPrice: { usd: mempool.btcUsd, brl: mempool.btcBrl },
      network: {
        blockHeight: mempool.blockHeight,
        difficulty: mempool.networkDiff,
        rewardBTC: 3.125,
        lastPool: mempool.lastPool,
        halvingBlocksLeft: mempool.blocksLeft,
        halvingDaysLeft: mempool.halvingDaysLeft
      },
      system: {
        cpuModel: cpuInfo ? cpuInfo.brand : 'Processador BTC',
        cpuCores: cpuInfo ? cpuInfo.physicalCores : 4
      },
      miner: {
        hashrate: poolStats.hashrate,
        validShares: poolStats.shares,
        bestShare: poolStats.bestShare,
        workers: poolStats.workers,
        poolConnected: poolStats.lastFetch > 0,
        minerRunning: isMinerRunning(),
        uptimeSeconds: isMinerRunning() && minerStartTime > 0 ? Math.floor((Date.now() - minerStartTime) / 1000) : 0
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  let localIP = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIP = net.address;
        break;
      }
    }
  }
  
  const mobileUrl = `http://${localIP}:${PORT}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mobileUrl)}`;
  
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║   SOFTWARE BTC LOTTERY MINER - ATIVO!  ║`);
  console.log(`╚══════════════════════════════════════════╝`);
  console.log(`\n🖥️  Acesso PC:      http://localhost:${PORT}`);
  console.log(`📱 Acesso Celular: ${mobileUrl}`);
  console.log(`\n📲 QR CODE para o celular:`);
  console.log(`   ${qrUrl}`);
  console.log(`\n   (Cole o link acima no navegador para ver o QR Code)`);
  console.log(`\n✅ Celular e PC usam o MESMO minerador real!`);
  console.log(`   Tudo verificável em: web.public-pool.io\n`);
});
