// Check the rendered card geometry and observable motion; no remote writes.
const path=require('path'),fs=require('fs');
let pw;try{pw=require('playwright')}catch{pw=require(path.join(require('os').tmpdir(),'motorbike-design-tools/node_modules/playwright'))}
const AxeBuilder=require(path.resolve('.design/qa-tools/node_modules/@axe-core/playwright')).default;
const base='http://127.0.0.1:4176/motorbike-vercelli/',out=path.resolve('.design/previews/card-motion');fs.mkdirSync(out,{recursive:true});
const checks=[],errors=[];function check(v,label){checks.push({label,passed:!!v});if(!v)console.log('FAIL',label)}
async function photos(page){await page.evaluate(()=>Promise.all([...document.images].filter(i=>!i.closest('.menu')).map(i=>i.decode().catch(()=>{}))))}
(async()=>{
 const b=await pw.chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const c=await b.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
  for(const width of [320,375,390,768,1280,1920]){
   await p.setViewportSize({width,height:900});
   for(const slug of ['caschi','abbigliamento','interfoni','accessori','cross','caschi-integrali','abbigliamento-giacche','interfoni-cardo']){
    await p.goto(base+slug+'.html');
    const result=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,geometry:[...document.querySelectorAll('.category-card')].map(card=>{
     const frame=card.querySelector('.category-image').getBoundingClientRect(),image=card.querySelector('img').getBoundingClientRect(),copy=card.querySelector('.category-copy').getBoundingClientRect(),r=card.getBoundingClientRect();
     return image.width<=frame.width+1&&image.height<=frame.height+1&&Math.abs(image.width-frame.width)<1&&Math.abs(image.height-frame.height)<1&&copy.left>=r.left&&copy.right<=r.right+1;
    })}));
    check(!result.overflow&&result.geometry.every(Boolean),slug+': '+width+'px photo inside card frame and text inside border');
    check(await p.evaluate(()=>!window.ScrollTrigger||ScrollTrigger.getAll().length===0),slug+': '+width+'px reduced motion disables triggers');
   }
  }
  await p.setViewportSize({width:1280,height:900});
  for(const slug of ['caschi','abbigliamento','interfoni','accessori']){
   await p.goto(base+slug+'.html#scopri');await photos(p);
   const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
   check(!axe.violations.length,slug+': accessible card text and links');
   await p.locator('.category-grid').first().screenshot({path:path.join(out,slug+'-1280.png')});
   const geometry=await p.evaluate(()=>[...document.querySelectorAll('.category-card')].map(card=>({top:card.getBoundingClientRect().top,bottom:card.querySelector('.category-more').getBoundingClientRect().bottom})));
   check(geometry.every((r,i)=>geometry.every((s,j)=>i===j||Math.abs(r.top-s.top)>1||Math.abs(r.bottom-s.bottom)<2)),slug+': CTA bottoms aligned within each row');
  }
  // Hover responds to the pointer, while frame size stays constant.
  await p.emulateMedia({reducedMotion:'no-preference'});await p.goto(base+'caschi.html');await p.waitForFunction(()=>document.documentElement.dataset.motionReady==='true');await p.waitForTimeout(1100);
  const card=p.locator('.category-card').first();await card.scrollIntoViewIfNeeded();await p.waitForTimeout(1100);
  const size=await card.boundingBox();await card.hover();await p.waitForTimeout(700);
  check(await card.locator('.category-image img').evaluate(el=>getComputedStyle(el).transform!=='none'),'Hover visibly scales category photograph');
  const after=await card.boundingBox();check(Math.abs(size.width-after.width)<1&&Math.abs(size.height-after.height)<1,'Hover keeps card dimensions stable');
  await p.locator('[data-filter="Turismo"]').click();await p.waitForTimeout(700);
  check(await p.locator('.category-card:visible').count()===1&&(await p.locator('.category-card:visible h3').textContent()).trim()==='Modulari','Animated filter keeps the correct category visible');
  await p.emulateMedia({reducedMotion:'reduce'});
  await p.waitForFunction(()=>ScrollTrigger.getAll().length===0);
  check(await p.evaluate(()=>[...document.querySelectorAll('.category-card')].every(el=>getComputedStyle(el).opacity==='1')&&ScrollTrigger.getAll().length===0),'Reducing motion after a filter leaves all card content opaque');
  // At least one card is actually moving as it enters, rather than playing offscreen.
  await p.emulateMedia({reducedMotion:'no-preference'});await p.goto(base+'caschi.html');await p.waitForTimeout(1100);
  await p.evaluate(()=>window.scrollTo(0,document.querySelector('.category-grid').getBoundingClientRect().top+scrollY-innerHeight*.72));
  await p.waitForTimeout(90);
  check(await p.locator('.category-card').first().evaluate(el=>getComputedStyle(el).transform!=='none'),'Category entrance is observable during scroll');await p.waitForTimeout(1100);
  // The five helmets unfold, and the workshop shutter opens with the page's scroll.
  await p.goto(base+'index.html');await p.waitForTimeout(1200);
  check(await p.evaluate(()=>ScrollTrigger.getAll().length>8&&ScrollTrigger.getAll().filter(t=>t.pin).length===1&&ScrollTrigger.getAll().every(t=>!t.pin||t.vars.id==='workshop-shutter')&&!window.Lenis),'Home has active motion scenes and only the requested workshop pin');
  const shutter=p.locator('.workshop-shutter');const closed=await shutter.evaluate(el=>getComputedStyle(el).transform);
  await p.evaluate(()=>window.scrollTo(0,document.querySelector('.helmet-scene').getBoundingClientRect().top+scrollY-innerHeight*.68));await p.waitForTimeout(100);
  await p.locator('.helmet-scene').screenshot({path:path.join(out,'helmets-during.png')});await p.waitForTimeout(1300);
  check(await p.locator('.helmet-panel').count()===5,'Helmet composition presents five real category images');
  await p.locator('.helmet-scene').screenshot({path:path.join(out,'helmets-open.png')});
  await p.evaluate(()=>{const t=ScrollTrigger.getById('workshop-shutter');window.scrollTo(0,t.end)});await p.waitForTimeout(800);
  const open=await shutter.evaluate(el=>getComputedStyle(el).transform);check(closed!==open&&open!=='none','Workshop shutter position changes as the user scrolls');
  check(await p.locator('.home-workshop a[href="officina.html"]').isVisible(),'Workshop CTA remains visible outside the shutter');
  await p.locator('.workshop-scene').screenshot({path:path.join(out,'workshop-open.png')});
  await p.emulateMedia({reducedMotion:'reduce'});
  check(await shutter.evaluate(el=>getComputedStyle(el).display==='none')&&await p.evaluate(()=>ScrollTrigger.getAll().length===0),'Reduced motion hides the shutter and exposes the photograph');
  await p.goto(base+'officina.html');await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForTimeout(1500);
  await p.evaluate(()=>{const t=ScrollTrigger.getById('workshop-shutter');window.scrollTo(0,(t.start+t.end)/2)});await p.waitForTimeout(150);
  check(await p.locator('.workshop-shutter').evaluate(el=>getComputedStyle(el).transform!=='none'),'Workshop page animates its shutter as well');
  await c.close();
  const fallback=await b.newContext({viewport:{width:390,height:844}});await fallback.route('**/assets/vendor/gsap.min.js',r=>r.abort());const q=await fallback.newPage();q.on('pageerror',e=>errors.push(e.message));
  await q.goto(base+'officina.html');check(await q.locator('h1').isVisible()&&await q.locator('.workshop-shutter').evaluate(el=>getComputedStyle(el).display==='none'),'Missing GSAP leaves the workshop photo unobstructed');await fallback.close();
  check(errors.length===0,'No JavaScript errors in motion/card flows');
 }finally{await b.close()}
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks,errors},null,2));console.log(checks.filter(x=>x.passed).length+'/'+checks.length+' motion/card checks passed');if(checks.some(x=>!x.passed))process.exitCode=1;
})();
