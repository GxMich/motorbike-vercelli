// Browser smoke and user-flow verification against the served static site.
let playwright;
try { playwright = require('playwright'); }
catch { try {playwright = require(require('path').resolve('.design/qa-tools/node_modules/playwright'));} catch {playwright = require(require('path').join(require('os').tmpdir(),'motorbike-design-tools/node_modules/playwright'));} }
const { chromium } = playwright;
const fs = require('fs');
const path = require('path');
const pages = fs.readdirSync('.').filter(p=>p.endsWith('.html')&&p!=='proposta.html');
const out = path.resolve('.design/previews/multipage');
fs.mkdirSync(out,{recursive:true});
const checks=[], errors=[], failures=[];
const base=(process.argv[2]||'http://127.0.0.1:4175/').replace(/\/?$/,'/');
function check(value,label) {checks.push({label,passed:Boolean(value)});if(!value) console.log('FAIL:',label);}
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('response',r=>{if(r.status()>=400&&r.url().startsWith('http://127.0.0.1'))failures.push(`${r.status()} ${r.url()}`);});
    for(const width of [320,375,390,768,1280,1920]) {
      await page.setViewportSize({width,height:900});
      for(const file of pages) {
        await page.goto(`${base}${file}`,{waitUntil:'load'});
        await page.evaluate(()=>document.fonts.ready);
        const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,h1:document.querySelectorAll('h1').length,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),menuHidden:document.getElementById('menu').inert}));
        check(!result.overflow,`${file}: ${width}px no horizontal overflow`);
        check(result.h1===1&&result.broken.length===0&&result.menuHidden,`${file}: ${width}px heading, assets, closed menu`);
        check(await page.locator('meta[name="robots"]').getAttribute('content')==='noindex, nofollow',`${file}: ${width}px demo excluded from indexing`);
        if(['index.html','caschi.html','officina.html','contatti.html','moto.html','abbigliamento.html','negozio.html'].includes(file)&&[390,1280].includes(width)) await page.screenshot({path:path.join(out,`${file.slice(0,-5)}-${width}.png`)});
      }
      console.log('Verified width',width,pages.length,'pages');
    }
    await page.goto('http://127.0.0.1:4175/abbigliamento.html');
    await page.getByRole('button',{name:'Mani',exact:true}).click();
    check(await page.locator('.category-card:visible').count()===1&&(await page.locator('.category-card:visible h3').innerText()).includes('Guanti'),'Filter selects gloves');
    await page.reload();
    check(await page.locator('.category-card:visible').count()===1,'Filter persists through shared URL');
    await page.getByRole('button',{name:'Tutte',exact:true}).click();
    await page.goBack();
    check(await page.locator('.category-card:visible').count()===1,'Filter history goes back');
    await page.goto('http://127.0.0.1:4175/officina.html');
    await page.locator('#menu-open').click();
    await page.waitForFunction(()=>document.activeElement.id==='menu-close');
    check(await page.locator('#menu-close').evaluate(el=>el===document.activeElement),'Menu focuses close');
    await page.keyboard.press('Shift+Tab');
    check(await page.evaluate(()=>document.activeElement.closest('#menu')!==null),'Menu contains keyboard focus');
    await page.keyboard.press('Escape');
    check(await page.locator('#menu').evaluate(el=>el.inert)&&await page.locator('#menu-open').evaluate(el=>el===document.activeElement),'Escape closes menu and restores focus');
    await page.locator('#nome').fill('Test Moto');
    await page.locator('#recapito').fill('test@example.com');
    await page.locator('#request-moto').fill('Honda CB500X 2022');
    await page.locator('#messaggio-input').fill('Vorrei concordare un tagliando, 12000 km.');
    await page.getByRole('button',{name:'Prepara la bozza email'}).click();
    check(await page.locator('[data-preview]').isVisible(),'Workshop shows reviewable draft');
    const draft=decodeURIComponent(await page.locator('[data-email-link]').getAttribute('href'));
    check(draft.includes('Honda CB500X')&&draft.includes('test@example.com')&&draft.startsWith('mailto:motorbikevercelli@gmail.com'),'Workshop email draft contains correct recipient and fields');
    await page.locator('#request-moto').fill('Suzuki V-Strom');
    check(!await page.locator('[data-preview]').isVisible(),'Editing invalidates stale draft');
    await page.goto('http://127.0.0.1:4175/contatti.html?reparto=caschi-integrali#messaggio');
    check(await page.locator('#argomento').inputValue()==='Caschi','Department request preselects category');
    check(await page.locator('[data-map] iframe').count()===0,'Map not requested before consent');
    await page.getByRole('button',{name:'Mostra la mappa Google'}).click();
    check(await page.locator('[data-map] iframe').count()===1,'Map loads on click');
    await page.goto('http://127.0.0.1:4175/ricerca.html');
    await page.locator('#cerca').fill('tagliando');
    check(await page.locator('.search-result').count()>=1&&await page.locator('.search-result').first().getAttribute('href')==='officina.html#richiesta','Search finds workshop service');
    await page.locator('#cerca').fill('zzzzzz');
    check(await page.locator('.search-result').count()===0&&(await page.locator('[data-search-status]').innerText()).includes('Nessun risultato'),'Search has usable empty state');
    await page.locator('#cerca').fill('<script>alert(1)</script>');
    check(await page.locator('.search-result').count()===0,'Search treats input as text');
    await context.close();
    const fallback=await browser.newContext({javaScriptEnabled:false,viewport:{width:360,height:800}});
    const fp=await fallback.newPage();
    for(const file of ['index.html','caschi.html','officina.html','contatti.html','ricerca.html']) {
      await fp.goto(`http://127.0.0.1:4175/${file}`);
      check(await fp.locator('h1').isVisible(),`${file}: no-JS content visible`);
      check(await fp.locator('.foot a[href="contatti.html"]').count()>0,`${file}: no-JS page navigation`);
    }
    await fallback.close();
    const motion=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
    const mp=await motion.newPage();mp.on('pageerror',e=>errors.push(String(e)));
    await mp.goto('http://127.0.0.1:4175/index.html');
    check(await mp.locator('#ignition').count()===0,'No mandatory introduction');
    check(await mp.locator('.home-hero .btn').first().isVisible(),'Hero action immediately usable');
    await mp.waitForFunction(()=>document.documentElement.dataset.motionReady==='true');
    check(await mp.evaluate(()=>!window.Lenis&&ScrollTrigger.getAll().every(t=>!t.pin||t.vars.id==='workshop-shutter')),'Native scroll with only the requested workshop pin');
    await mp.waitForTimeout(800);
    await mp.screenshot({path:path.join(out,'home-motion.png')});
    await mp.locator('#menu-open').click();
    check(await mp.locator('#menu').evaluate(el=>!el.inert),'Home menu enabled');
    await mp.locator('#menu a[href="caschi.html"]').click();
    await mp.waitForURL('**/caschi.html');
    check(await mp.locator('h1').isVisible(),'Home navigates to a real department page');
    await motion.close();
    check(errors.length===0,'No browser runtime errors');
    check(failures.length===0,'No missing local assets');
  } finally {await browser.close();}
  const result={pages:pages.length,checks,errors,failures};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2));
  console.log(`${checks.filter(x=>x.passed).length}/${checks.length} checks passed`,JSON.stringify({errors,failures}));
  if(checks.some(x=>!x.passed)) process.exitCode=1;
})();
