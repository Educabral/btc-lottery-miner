// ═══════════════════════════════════════════════════════
// REAL SHA-256d + Stratum WebSocket Miner - BTC Lottery
// Conecta via Relay na nuvem → Public Pool
// Funciona direto no navegador/APK sem instalar nada
// ═══════════════════════════════════════════════════════

const RELAY_URL = 'wss://btc-lottery-relay.onrender.com';

// SHA-256 puro em JavaScript
function sha256(data) {
  const K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ];
  const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];

  if (typeof data === 'string') { const enc = new TextEncoder(); data = enc.encode(data); }

  const len = data.length;
  const bitLen = len * 8;
  const padLen = ((len + 9 + 63) & ~63);
  const padded = new Uint8Array(padLen);
  padded.set(data);
  padded[len] = 0x80;
  new DataView(padded.buffer).setUint32(padLen - 4, bitLen & 0xffffffff, false);
  new DataView(padded.buffer).setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);

  const h = [...H];
  for (let i = 0; i < padLen; i += 64) {
    const w = new Array(64);
    const dv = new DataView(padded.buffer, i, 64);
    for (let j = 0; j < 16; j++) w[j] = dv.getUint32(j * 4, false);
    for (let j = 16; j < 64; j++) {
      const s0 = (w[j-15]>>>7|w[j-15]<<25)^(w[j-15]>>>18|w[j-15]<<14)^(w[j-15]>>>3);
      const s1 = (w[j-2]>>>17|w[j-2]<<15)^(w[j-2]>>>19|w[j-2]<<13)^(w[j-2]>>>10);
      w[j] = (w[j-16]+s0+w[j-7]+s1) >>> 0;
    }
    let [a,b,c,d,e,f,g,hh] = h;
    for (let j = 0; j < 64; j++) {
      const S1 = (e>>>6|e<<26)^(e>>>11|e<<21)^(e>>>25|e<<7);
      const ch = (e&f)^(~e&g);
      const temp1 = (hh+S1+ch+K[j]+w[j]) >>> 0;
      const S0 = (a>>>2|a<<30)^(a>>>13|a<<19)^(a>>>22|a<<10);
      const maj = (a&b)^(a&c)^(b&c);
      const temp2 = (S0+maj) >>> 0;
      hh=g; g=f; f=e; e=(d+temp1)>>>0;
      d=c; c=b; b=a; a=(temp1+temp2)>>>0;
    }
    h[0]=(h[0]+a)>>>0; h[1]=(h[1]+b)>>>0; h[2]=(h[2]+c)>>>0; h[3]=(h[3]+d)>>>0;
    h[4]=(h[4]+e)>>>0; h[5]=(h[5]+f)>>>0; h[6]=(h[6]+g)>>>0; h[7]=(h[7]+hh)>>>0;
  }
  const out = new Uint8Array(32);
  const dv2 = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) dv2.setUint32(i*4, h[i], false);
  return out;
}

function sha256d(data) { return sha256(sha256(data)); }

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2)
    bytes[i/2] = parseInt(hex.substr(i, 2), 16);
  return bytes;
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
}

function reverseBytes(hex) {
  return hex.match(/../g).reverse().join('');
}

// ─── Estado do Stratum ────────────────────────────
let ws = null;
let wallet = '';
let extraNonce1 = '';
let extraNonce2Size = 4;
let currentJob = null;
let running = false;
let totalHashes = 0;
let lastHashTime = Date.now();
let msgId = 1;

function sendMsg(method, params) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  const msg = JSON.stringify({ id: msgId++, method, params });
  ws.send(msg);
}

// ─── Conexão WebSocket → Relay → Public Pool ──────
function connectRelay(btcWallet) {
  wallet = btcWallet;
  ws = new WebSocket(RELAY_URL);

  ws.onopen = () => {
    self.postMessage({ type: 'status', msg: 'Conectando na Public Pool...' });
    // Stratum subscribe
    sendMsg('mining.subscribe', ['BtcLotteryMiner/1.0']);
  };

  ws.onmessage = (event) => {
    const lines = event.data.split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);
        handleStratumMsg(msg);
      } catch(e) {}
    }
  };

  ws.onclose = () => {
    self.postMessage({ type: 'status', msg: 'Reconectando...' });
    if (running) setTimeout(() => connectRelay(wallet), 5000);
  };

  ws.onerror = () => {
    self.postMessage({ type: 'status', msg: 'Erro de conexao' });
  };
}

function handleStratumMsg(msg) {
  // Resposta ao subscribe
  if (msg.id && msg.result && Array.isArray(msg.result) && !currentJob) {
    if (msg.result[1]) extraNonce1 = msg.result[1];
    if (msg.result[2]) extraNonce2Size = msg.result[2];
    // Authorize
    sendMsg('mining.authorize', [wallet, 'x']);
    self.postMessage({ type: 'status', msg: 'Autenticando carteira...' });
    return;
  }

  // Resposta ao authorize
  if (msg.result === true && msg.id === 2) {
    self.postMessage({ type: 'status', msg: 'MINERANDO NA PUBLIC POOL!' });
    return;
  }

  // Novo job de mineração
  if (msg.method === 'mining.notify') {
    const p = msg.params;
    currentJob = {
      jobId: p[0],
      prevHash: p[1],
      coinb1: p[2],
      coinb2: p[3],
      merkleBranches: p[4],
      version: p[5],
      nBits: p[6],
      nTime: p[7],
      cleanJobs: p[8]
    };
    totalHashes = 0;
    startMining();
    return;
  }

  // Dificuldade
  if (msg.method === 'mining.set_difficulty') {
    self.postMessage({ type: 'difficulty', diff: msg.params[0] });
  }
}

// ─── Motor de Mineração Real ───────────────────────
function startMining() {
  if (!currentJob || !running) return;
  mineStep();
}

function mineStep() {
  if (!running || !currentJob) return;

  const BATCH = 2000;
  const job = currentJob;
  const extraNonce2 = bytesToHex(crypto.getRandomValues(new Uint8Array(extraNonce2Size)));

  // Monta coinbase
  const coinbase = hexToBytes(job.coinb1 + extraNonce1 + extraNonce2 + job.coinb2);
  let merkleRoot = sha256d(coinbase);

  // Aplica merkle branches
  for (const branch of job.merkleBranches) {
    const combined = new Uint8Array(64);
    combined.set(merkleRoot);
    combined.set(hexToBytes(branch), 32);
    merkleRoot = sha256d(combined);
  }

  // Monta header (80 bytes)
  const header = new Uint8Array(80);
  const dv = new DataView(header.buffer);
  dv.setUint32(0, parseInt(job.version, 16), false);
  header.set(hexToBytes(job.prevHash), 4);
  header.set(merkleRoot, 36);
  dv.setUint32(68, parseInt(job.nTime, 16), false);
  dv.setUint32(72, parseInt(job.nBits, 16), false);

  // Target da dificuldade
  const target = BigInt('0x' + '0'.repeat(8) + 'f'.repeat(56));

  let nonce = Math.floor(Math.random() * 0xFFFFFFFF);

  for (let i = 0; i < BATCH; i++) {
    nonce = (nonce + 1) >>> 0;
    dv.setUint32(76, nonce, true);
    const hash = sha256d(header);
    totalHashes++;

    // Verifica se encontrou share válido
    const hashBig = BigInt('0x' + bytesToHex(hash));
    if (hashBig < target) {
      // Submit share!
      sendMsg('mining.submit', [
        wallet,
        job.jobId,
        extraNonce2,
        job.nTime,
        nonce.toString(16).padStart(8,'0')
      ]);
      self.postMessage({ type: 'share', msg: 'Share enviado para Public Pool!' });
    }
  }

  self.postMessage({ type: 'hashrate', hashes: totalHashes });
  setTimeout(mineStep, 0);
}

// ─── Interface com o app principal ────────────────
self.onmessage = (e) => {
  if (e.data.cmd === 'start') {
    running = true;
    totalHashes = 0;
    connectRelay(e.data.wallet);
  }
  if (e.data.cmd === 'stop') {
    running = false;
    if (ws) ws.close();
  }
};
