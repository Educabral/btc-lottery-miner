const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(`
  <div class="stats-grid">
      <div class="stat-item" data-tip="Número do bloco atual sendo minerado pela rede Bitcoin. A cada bloco encontrado, toda a rede avança. Você compete por todos eles em tempo real.">
        <div class="st-icon">📦</div>
        <div class="st-label">BLOCO ATUAL (REDE)</div>
        <div class="st-val new-block" id="blockHeight">—</div>
        <div class="st-sub">Sincronizado</div>
      </div>
  </div>
`);

const dict = {
  "BLOCO ATUAL (REDE)": "CURRENT BLOCK (NETWORK)",
  "Sincronizado": "Synchronized"
};

let currentLang = 'en';

function translateTextNode(node) {
  if (node.nodeType === 3) {
    let text = node.nodeValue.trim();
    if (text === "") return;
    
    let translation = null;
    if (currentLang === 'en') {
      if (dict[text]) translation = dict[text];
    }
    
    if (translation) {
      console.log("Translating:", text, "to", translation, "| Original nodeValue:", JSON.stringify(node.nodeValue));
      node.nodeValue = node.nodeValue.replace(text, translation);
      console.log("New nodeValue:", JSON.stringify(node.nodeValue));
    } else {
      console.log("No translation found for:", JSON.stringify(text));
    }
  } else {
    for (let i = 0; i < node.childNodes.length; i++) {
      translateTextNode(node.childNodes[i]);
    }
  }
}

translateTextNode(dom.window.document.body);
console.log(dom.window.document.body.innerHTML);
