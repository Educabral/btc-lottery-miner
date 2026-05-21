const fs = require('fs');

const html = fs.readFileSync('C:\\Software_BTC_Lottery_Miner\\Loto\\public\\index.html', 'utf8');
const js = fs.readFileSync('C:\\Software_BTC_Lottery_Miner\\Loto\\public\\translations.js', 'utf8');

const htmlMatch = html.match(/[\u2600-\u27BF\u1F300-\u1F9FF\u2B50]\s*MOTOR DE MINERAÇÃO/);
const jsMatch = js.match(/[\u2600-\u27BF\u1F300-\u1F9FF\u2B50]\s*MOTOR DE MINERAÇÃO/);

console.log("HTML match:", htmlMatch ? htmlMatch[0] : null);
if (htmlMatch) {
    console.log("HTML hex:", Buffer.from(htmlMatch[0]).toString('hex'));
}

console.log("JS match:", jsMatch ? jsMatch[0] : null);
if (jsMatch) {
    console.log("JS hex:", Buffer.from(jsMatch[0]).toString('hex'));
}

console.log("Are they strictly equal?", htmlMatch && jsMatch && htmlMatch[0] === jsMatch[0]);

const htmlBlock = html.match(/BLOCO ATUAL \(REDE\)/);
const jsBlock = js.match(/BLOCO ATUAL \(REDE\)/);
console.log("HTML Block hex:", htmlBlock ? Buffer.from(htmlBlock[0]).toString('hex') : null);
console.log("JS Block hex:", jsBlock ? Buffer.from(jsBlock[0]).toString('hex') : null);
console.log("Block strictly equal?", htmlBlock && jsBlock && htmlBlock[0] === jsBlock[0]);

