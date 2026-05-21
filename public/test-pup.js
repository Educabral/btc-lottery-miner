const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:3500', { waitUntil: 'networkidle2' });
  
  // Click the translate button
  await page.click('#langBtn');
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 1000));
  
  // Get the text of the grid item
  const blockHtml = await page.evaluate(() => document.querySelector('.st-label').innerHTML);
  console.log("First grid item HTML:", blockHtml);
  
  const textContent = await page.evaluate(() => document.body.innerText);
  console.log("Body contains CURRENT BLOCK?", textContent.includes('CURRENT BLOCK'));
  console.log("Body contains BLOCO ATUAL?", textContent.includes('BLOCO ATUAL'));
  
  await browser.close();
})();
