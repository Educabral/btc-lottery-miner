const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('C:\\Software_BTC_Lottery_Miner\\Loto\\public\\index.html', 'utf8');
const dom = new JSDOM(html);

const texts = new Set();
function walk(node) {
  if (node.nodeType === 3) {
    let t = node.nodeValue.trim();
    if (t) texts.add(t);
  } else {
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
    for (let i = 0; i < node.childNodes.length; i++) {
      walk(node.childNodes[i]);
    }
  }
}
walk(dom.window.document.body);

console.log("TEXT NODES IN HTML:");
for (let t of texts) {
  if (t.includes("BLOCO ATUAL") || t.includes("MOTOR") || t.includes("Aviso")) {
    console.log(JSON.stringify(t));
  }
}
