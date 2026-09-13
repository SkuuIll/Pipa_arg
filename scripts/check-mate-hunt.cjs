// Run with PLAYWRIGHT_MODULE pointing to an installed Playwright module.
// Start the site first; BASE_URL defaults to the local Vite server.
const { chromium, firefox, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const engines = { chromium, firefox, webkit };
const selected = (process.env.BROWSERS || 'chromium,firefox,webkit').split(',');
const key = 'pipaa:mate-hunt:v1';

(async () => {
 for (const name of selected) {
  const browser = await engines[name].launch({headless:true});
  try {
   for (const width of [360,390,768,1440]) {
    const context = await browser.newContext({ viewport:{width,height:900}, reducedMotion:'reduce' });
    const page = await context.newPage();
    const errors=[]; page.on('pageerror', e=>errors.push(e.message));
    await page.goto(baseURL);
    await page.locator('.hidden-mate').first().waitFor({state:'attached'});
    assert.equal(await page.locator('.hidden-mate').count(),3);
    assert.equal(await page.locator('.mate-progress').count(),0);
    for (let i=0;i<3;i++) {
     const button=page.locator('.hidden-mate').nth(i);
     await button.scrollIntoViewIfNeeded();
     await button.focus();
     await page.keyboard.press(i===1?'Space':'Enter');
     await page.waitForFunction(n=>document.querySelectorAll('.hidden-mate.is-found').length===n,i+1);
     await page.keyboard.press('Enter'); // Repeated collection must not advance progress.
     assert.equal(await page.locator('.hidden-mate.is-found').count(),i+1);
     assert.equal(await button.getAttribute('aria-disabled'),'true');
     const size=await button.boundingBox(); assert(size.width>=44&&size.height>=44);
     assert.match(await page.locator('[role=status]').textContent(), i===2 ? /Cebador oficial/ : new RegExp(`${i+1}/3`));
     if(i===2) assert.equal(await page.locator('.mate-sparks').isVisible(),false);
     if(width<=768) {
      const toast=await page.locator('.mate-notice').boundingBox();
      const dock=await page.locator('.mobile-dock').boundingBox();
      assert(toast.y+toast.height<=dock.y,'Notice overlaps mobile dock');
     }
     await page.getByRole('button',{name:'Cerrar aviso del mate'}).click();
    }
    assert.match(await page.locator('#mate-progress-title').textContent(),/CEBADOR OFICIAL/);
    await page.reload();
    await page.locator('.hidden-mate.is-found').first().waitFor({state:'attached'});
    assert.equal(await page.locator('.hidden-mate.is-found').count(),3);
    assert.equal(await page.locator('.mate-notice').count(),0);
    await page.getByRole('button',{name:'Reiniciar búsqueda'}).click();
    assert.equal(await page.locator('.hidden-mate.is-found').count(),0);
    assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),'[]');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    assert.deepEqual(errors,[]);
    console.log(`${name} ${width}px: collect, repeat, keyboard, reload, reset, layout OK`);
    await context.close();
   }
   for(const mode of ['blocked','malformed','invalid-ids']) {
    const context=await browser.newContext();
    await context.addInitScript(({key,mode})=>{
     if(mode==='blocked') {
      Storage.prototype.getItem=()=>{throw new DOMException('Blocked','SecurityError')};
      Storage.prototype.setItem=()=>{throw new DOMException('Blocked','QuotaExceededError')};
     } else localStorage.setItem(key,mode==='malformed'?'broken json':JSON.stringify(['setup','setup','fake',null]));
    },{key,mode});
    const page=await context.newPage(); await page.goto(baseURL);
    await page.locator('.hidden-mate').first().waitFor({state:'attached'});
    assert.equal(await page.locator('.hidden-mate.is-found').count(),mode==='invalid-ids'?1:0);
    while(await page.locator('.hidden-mate:not(.is-found)').count()) {
     const button=page.locator('.hidden-mate:not(.is-found)').first();
     await button.scrollIntoViewIfNeeded(); await button.click();
     await page.getByRole('button',{name:'Cerrar aviso del mate'}).click();
    }
    assert.equal(await page.locator('.hidden-mate.is-found').count(),3);
    if(mode==='blocked') assert.match(await page.locator('.mate-progress').textContent(),/durante esta visita/);
    console.log(`${name} ${mode}: OK`); await context.close();
   }
  } finally { await browser.close(); }
 }
})().catch(e=>{console.error(e);process.exitCode=1});
