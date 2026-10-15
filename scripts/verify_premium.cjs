// User journeys and accessibility. No email or remote mutation is performed.
const path = require('path'), fs = require('fs');
let pw;try{pw=require('playwright')}catch{try{pw=require(path.resolve('.design/qa-tools/node_modules/playwright'))}catch{pw=require(path.join(require('os').tmpdir(),'motorbike-design-tools/node_modules/playwright'))}}
const AxeBuilder = require(path.resolve('.design/qa-tools/node_modules/@axe-core/playwright')).default;
const base = 'http://127.0.0.1:4176/motorbike-vercelli/';
const out = path.resolve('.design/previews/premium');fs.mkdirSync(out,{recursive:true});
const checks=[],errors=[],accessibility=[];
function check(value,label){checks.push({label,passed:!!value});if(!value)console.log('FAIL',label)}
async function loadPhotos(page){
  await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=650){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,45));}window.scrollTo(0,0);await Promise.all([...document.images].filter(i=>!i.closest('.menu')).map(i=>i.decode().catch(()=>{})));});
  await page.waitForTimeout(650);
}
(async()=>{
  const browser=await pw.chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try{
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    const files=fs.readdirSync('.').filter(f=>f.endsWith('.html')&&f!=='proposta.html');
    for(const file of files){
      await page.goto(base+file);await loadPhotos(page);
      const img=await page.evaluate(()=>[...document.images].filter(i=>!i.closest('.menu')).every(i=>i.complete&&i.naturalWidth>0));
      check(img,file+': all photographs, including lazy images, decode');
      const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      accessibility.push({file,width:390,violations:result.violations});
      check(result.violations.length===0,file+': axe WCAG A/AA');
      if(['index.html','caschi.html','abbigliamento.html','moto.html','officina.html','contatti.html'].includes(file))await page.screenshot({path:path.join(out,file.replace('.html','')+'-390-full.png'),fullPage:true});
    }
    // Each primary menu destination is actually navigated under the Pages prefix.
    for(const slug of ['negozio','moto','caschi','abbigliamento','interfoni','cross','accessori','officina','club','contatti','index']){
      await page.locator('#menu-open').click();await page.locator('#menu a[href="'+slug+'.html"]').click();
      await page.waitForURL('**/'+slug+'.html');await page.waitForLoadState('load');
      check(await page.locator('h1').isVisible(),'Menu navigates to '+slug);
    }
    await page.goto(base+'index.html');
    check(await page.locator('.line-panel').count()===3,'Three initial commercial paths');
    await page.locator('.home-hero a[href="#reparti"]').click();
    check(page.url().endsWith('#reparti'),'Hero department CTA reaches the department section');
    await page.locator('.department-tile[href="officina.html"]').count(); // workshop is a separate feature
    const links=await page.locator('a[href^="tel:"]').evaluateAll(a=>a.map(x=>x.getAttribute('href')));
    check(links.every(x=>x==='tel:+390161294987'),'Every phone CTA uses the verified phone number');
    const map=await page.locator('.home-hero a[href*="google.com/maps/dir"]').getAttribute('href');
    check(map.includes('api=1')&&map.includes('Via+Trino+200'),'Store CTA contains Google Maps directions and correct address');
    // Mobile menu focus cycles both directions and Escape restores the opener.
    // The header steps aside after the jump to #reparti; keyboard focus brings it back.
    await page.locator('#menu-open').focus();await page.waitForTimeout(800);
    await page.locator('#menu-open').click();await page.waitForFunction(()=>document.activeElement.id==='menu-close');
    await page.keyboard.press('Shift+Tab');check(await page.evaluate(()=>document.activeElement.closest('#menu')!==null),'Backward menu focus is trapped');
    await page.keyboard.press('Tab');check(await page.locator('#menu-close').evaluate(el=>el===document.activeElement),'Forward menu focus wraps');
    const menuAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    check(!menuAxe.violations.length,'Open dialog passes axe');accessibility.push({file:'open-menu',width:390,violations:menuAxe.violations});
    await page.keyboard.press('Escape');check(await page.locator('#menu-open').evaluate(el=>el===document.activeElement),'Escape restores focus');
    // Motorcycle intent, optional budget, real draft and copy.
    await page.goto(base+'moto.html');
    check(await page.locator('[data-bike-fields]').isVisible(),'Dedicated motorcycle form shows its fields');
    await page.locator('#nome').fill('Verifica locale');await page.locator('#recapito').fill('cliente@example.com');
    await page.locator('#acquisto').selectOption('Usata');await page.locator('#marca-modello').fill('Honda, modello da valutare');await page.locator('#budget').fill('circa 5.000 euro');
    await page.locator('#messaggio-input').fill('Cerco una moto per le uscite del weekend.');await page.locator('[data-send]').click();
    const body=await page.locator('[data-email-preview]').innerText();
    check(body.includes('Usata')&&body.includes('Honda')&&body.includes('5.000')&&body.includes('cliente@example.com'),'Motorcycle draft includes intent, model, budget and contact');
    check((await page.locator('[data-email-link]').getAttribute('href')).startsWith('mailto:motorbikevercelli@gmail.com?'),'Draft targets the verified shop email');
    await page.locator('[data-copy]').click();await page.waitForFunction(()=>document.querySelector('[data-copy-status]').textContent.includes('Messaggio copiato'));
    check((await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,'\n')===body.replace(/\r\n/g,'\n'),'Copy button copies the actual draft');
    const previewAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    check(!previewAxe.violations.length,'Draft preview passes axe');accessibility.push({file:'draft-preview',width:390,violations:previewAxe.violations});
    await page.locator('#budget').fill('6.000 euro');check(!await page.locator('[data-preview]').isVisible(),'Budget edit invalidates the old draft');
    // Contact validation: native errors plus trimmed message and workshop identity.
    await page.goto(base+'officina.html');await page.locator('[data-send]').click();
    check(!await page.locator('[data-preview]').isVisible(),'Empty form produces no draft');
    await page.locator('#nome').fill('   ');await page.locator('#recapito').fill('cliente@example.com');await page.locator('#request-moto').fill('   ');await page.locator('#messaggio-input').fill('                 ');await page.locator('[data-send]').click();
    check(!await page.locator('[data-preview]').isVisible(),'Whitespace-only workshop request is rejected');
    await page.locator('#nome').fill('Test');await page.locator('#request-moto').fill('Honda CB500X');await page.locator('#messaggio-input').fill('abc');await page.locator('[data-send]').click();
    check(!await page.locator('[data-preview]').isVisible(),'Too-short message is rejected');
    await page.locator('#messaggio-input').fill('Richiesta informazioni su un tagliando.');await page.locator('[data-send]').click();check(await page.locator('[data-preview]').isVisible(),'Corrected request prepares a draft');
    check((await page.locator('[data-preview]').innerText()).includes('L’appuntamento si conferma'),'Workshop draft states appointment needs confirmation');
    // Optional preferred dates reject the past through native validity.
    await page.locator('.optional-fields summary').click();await page.locator('#giorno').fill('2020-01-01');await page.locator('[data-send]').click();
    check(!await page.locator('[data-preview]').isVisible(),'Past preferred date is rejected');
    // Tablet and desktop visual/accessibility checks, plus menu geometry.
    for(const width of [320,375,390,768,1280,1920]){
      await page.setViewportSize({width,height:900});await page.goto(base+'index.html');await loadPhotos(page);
      const rect=await page.locator('#menu-open').boundingBox();await page.locator('#menu-open').click();
      const close=await page.locator('#menu-close').boundingBox();
      check(['x','y','width','height'].every(k=>Math.abs(rect[k]-close[k])<.5),'Menu/close aligned at '+width+'px');
      await page.keyboard.press('Escape');
      await page.screenshot({path:path.join(out,'home-'+width+'-full.png'),fullPage:true});
    }
    for(const file of ['index.html','caschi.html','abbigliamento.html','moto.html','officina.html','contatti.html']){
      await page.setViewportSize({width:1280,height:900});await page.goto(base+file);await loadPhotos(page);
      const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      check(!result.violations.length,file+': desktop axe');accessibility.push({file,width:1280,violations:result.violations});
      await page.screenshot({path:path.join(out,file.replace('.html','')+'-1280-full.png'),fullPage:true});
    }
    await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base+'index.html');
    // Preloader plus the cinematic hero intro last about four seconds, then everything rests.
    await page.waitForFunction(()=>document.documentElement.dataset.motionReady==='true');await page.waitForTimeout(4200);
    check(await page.evaluate(()=>gsap.globalTimeline.getChildren().filter(t=>t.isActive()).length===0),'Hero motion completes without continuous animation');
    await page.emulateMedia({reducedMotion:'reduce'});
    check(await page.locator('#home-title .hero-title-line').first().evaluate(el=>getComputedStyle(el).transform==='none')&&await page.evaluate(()=>ScrollTrigger.getAll().length===0),'Changing reduced motion at runtime restores static title and removes scroll motion');
    await page.goto(base+'contatti.html');await page.locator('[data-load-map]').click();
    const iframe=page.locator('[data-map] iframe');check(await iframe.count()===1&&!!await iframe.getAttribute('title'),'Map click creates a labelled Google Maps frame');
    await context.close();
    const noGSAP=await browser.newContext();await noGSAP.route('**/assets/vendor/gsap.min.js',route=>route.abort());const fallback=await noGSAP.newPage();await fallback.goto(base+'index.html');
    check(await fallback.locator('h1').isVisible()&&await fallback.locator('.home-hero .btn').first().isVisible(),'Missing GSAP preserves heading and CTAs');await noGSAP.close();
    check(errors.length===0,'No JavaScript runtime errors in journeys');
  }finally{await browser.close()}
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks,errors,accessibility},null,2));
  console.log(checks.filter(x=>x.passed).length+'/'+checks.length+' premium checks passed');
  if(checks.some(x=>!x.passed))process.exitCode=1;
})();
