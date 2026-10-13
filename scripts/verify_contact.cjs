// Verify both form modes. All external submissions are intercepted; no email is sent.
let playwright;
try {playwright=require('playwright');} catch {playwright=require(require('path').join(require('os').tmpdir(),'motorbike-design-tools/node_modules/playwright'));}
const fs=require('fs');
const checks=[];
function check(value,label){checks.push({label,passed:Boolean(value)});if(!value)throw new Error(label);}
(async()=>{
  const browser=await playwright.chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page=await browser.newPage({reducedMotion:'reduce',viewport:{width:390,height:844}});
    let payloads=[];
    await page.route('https://formspree.io/**',async route=>{payloads.push(route.request().postDataJSON());await new Promise(r=>setTimeout(r,300));await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true})});});
    await page.goto('http://127.0.0.1:4175/contatti.html');
    await page.locator('#nome').fill('Cliente test');
    await page.locator('#recapito').fill('abc');
    await page.locator('#messaggio-input').fill('Vorrei informazioni sui caschi modulari.');
    await page.locator('[data-send]').click();
    check(!await page.locator('[data-preview]').isVisible(),'Invalid contact rejected');
    await page.locator('#recapito').fill('+39 333 1234567');
    await page.locator('[data-send]').click();
    check(await page.locator('[data-preview]').isVisible(),'Phone-only request accepted in draft mode');
    check(payloads.length===0,'Blank endpoint never submits external data');
    check(decodeURIComponent(await page.locator('[data-email-link]').getAttribute('href')).includes('Telefono: +39 333 1234567'),'Phone preserved in draft');
    await page.goto('http://127.0.0.1:4175/moto.html');
    await page.locator('a[href*="esigenza=Moto%20usata"]').click();
    check((await page.locator('#messaggio-input').inputValue()).includes('moto usata'),'Used-bike intent prefilled');
    await page.goto('http://127.0.0.1:4175/caschi.html');
    await page.locator('a[href*="categoria=Turismo"]').click();
    await page.waitForFunction(()=>document.querySelector('[data-filter="Turismo"]')?.getAttribute('aria-pressed')==='true');
    check(await page.locator('.category-card:visible').count()===1&&(await page.locator('.category-card:visible h3').innerText()).includes('Modulari'),'Helmet guide opens correct filtered category');
    await page.goto('http://127.0.0.1:4175/officina.html');
    await page.locator('[data-service="Cambio pneumatici"]').click();
    check(await page.locator('#argomento').inputValue()==='Cambio pneumatici','Service links preselect workshop request');
    // Switch configuration only inside this intercepted browser session.
    await page.route('**/assets/js/site-config.js',route=>route.fulfill({contentType:'application/javascript',body:"window.MOTORBIKE_CONFIG={contactEndpoint:'https://formspree.io/f/testform',workshopEndpoint:''};"}));
    async function fill(){await page.locator('#nome').fill('Cliente test');await page.locator('#recapito').fill('test@example.com');await page.locator('#messaggio-input').fill('Vorrei concordare una prova in negozio.');}
    await page.goto('http://127.0.0.1:4175/contatti.html');
    check(await page.locator('[data-send]').innerText()==='Invia la richiesta','Configured endpoint enables direct submission');
    await fill();
    await page.locator('[data-send]').click();
    check(await page.locator('[data-send]').isDisabled(),'Submit disabled during delivery');
    await page.waitForFunction(()=>document.querySelector('[data-form-status]').dataset.kind==='success');
    check(payloads.length===1&&payloads[0].email==='test@example.com'&&payloads[0].message.includes('prova in negozio'),'Exactly one complete payload submitted');
    check(await page.locator('#nome').inputValue()==='','Form clears after accepted submission');
    await page.unroute('https://formspree.io/**');
    await page.route('https://formspree.io/**',route=>route.fulfill({status:429,contentType:'application/json',body:JSON.stringify({errors:[{message:'Limit'}]})}));
    await fill();await page.locator('[data-send]').click();
    await page.waitForFunction(()=>document.querySelector('[data-form-status]').dataset.kind==='error');
    check(await page.locator('#nome').inputValue()==='Cliente test'&&await page.locator('[data-preview]').isVisible(),'Error preserves data and offers draft fallback');
    check((await page.locator('[data-form-status]').innerText()).includes('Non abbiamo ricevuto la conferma'),'Failed request does not claim delivery');
    await page.unroute('https://formspree.io/**');
    await page.route('https://formspree.io/**',route=>route.fulfill({status:200,contentType:'application/json',body:'{"ok":false}'}));
    await page.locator('[data-send]').click();
    await page.waitForFunction(()=>document.querySelector('[data-form-status]').dataset.kind==='error');
    check(!await page.locator('#nome').evaluate(el=>el.disabled),'Rejected 200 response restores editable form');
    await page.unroute('https://formspree.io/**');
    await page.route('https://formspree.io/**',route=>route.abort());
    await page.locator('[data-send]').click();
    await page.waitForFunction(()=>document.querySelector('[data-form-status]').dataset.kind==='error');
    check(await page.locator('[data-preview]').isVisible(),'Network failure retains email alternative');
    await page.goto('http://127.0.0.1:4175/index.html');
    check(await page.locator('[data-request-form]').count()===1,'Home uses the same simplified request flow');
    await page.goto('http://127.0.0.1:4175/caschi.html');
    const opening=await page.locator('#menu-open').boundingBox();await page.locator('#menu-open').click();
    await page.waitForFunction(()=>document.activeElement.id==='menu-close');const closing=await page.locator('#menu-close').boundingBox();
    check(['x','y','width','height'].every(k=>Math.abs(opening[k]-closing[k])<.5),'Menu and close remain aligned');
    await page.close();
  } finally {await browser.close();}
  fs.mkdirSync('.design/previews/multipage',{recursive:true});
  fs.writeFileSync('.design/previews/multipage/contact-report.json',JSON.stringify(checks,null,2));
  console.log(`${checks.length}/${checks.length} contact and conversion checks passed; no actual submissions`);
})();
