const fs = require('fs');
const content = fs.readFileSync('C:\\Software_BTC_Lottery_Miner\\Loto\\public\\translations.js', 'utf8');

// just log if the string exists in the file
console.log("Has BLOCO ATUAL (REDE)?", content.includes("BLOCO ATUAL (REDE)"));
console.log("Has MOTOR DE MINERAÇÃO?", content.includes("MOTOR DE MINERAÇÃO"));
