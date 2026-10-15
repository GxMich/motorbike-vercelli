// Regression: the entire photograph stays pinned until the shutter is open.
const path=require('path'),fs=require('fs');
let pw;try{pw=require('playwright')}catch{try{pw=require(path.resolve('.design/qa-tools/node_modules/playwright'))}catch{pw=require(path.join(require('os').tmpdir(),'motorbike-design-tools/node_modules/playwright'))}}
const checks=[],errors=[],out=path.resolve('.design/previews/shutter');fs.mkdirSync(out,{recursive:true});
function check(value,label){checks.push({label,passed:!!value});if(!value)console.log('FAIL',label)}
async function opening(page){return page.locator('.workshop-shutter').evaluate(el=>{const matrix=getComputedStyle(el).transform;return matrix==='none'?0:-new DOMMatrixReadOnly(matrix).m42/el.getBoundingClientRect().height})}
async function scroll(page,y){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(550)}
(async()=>{
 const browser=await pw.chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const context=await browser.newContext({reducedMotion:'no-preference'});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const [width,height] of [[320,900],[375,900],[390,844],[768,900],[1280,900],[1920,900],[844,390]]){
   await page.setViewportSize({width,height});
   for(const slug of ['index','officina']){
    await page.goto('http://127.0.0.1:4176/motorbike-vercelli/'+slug+'.html');
    await page.waitForFunction(()=>document.documentElement.dataset.motionReady==='true');await page.waitForTimeout(550);
    check(await opening(page)<.01,`${slug} ${width}x${height}: closed after initial load`);
    const scene=await page.locator('.workshop-scene').evaluate(el=>({top:el.getBoundingClientRect().top+scrollY,height:el.offsetHeight}));
    if(slug==='index'){
     const inset=width<=760?await page.locator('.mobile-actions').evaluate(el=>el.offsetHeight)+20:24;
     await scroll(page,scene.top-(height-inset-60));
     check(await opening(page)<.01,`${slug} ${width}x${height}: still closed at first 60 visible pixels`);
    }
    const trigger=await page.evaluate(()=>{const t=ScrollTrigger.getById('workshop-shutter');return {start:t.start,end:t.end}});
    await scroll(page,Math.max(0,trigger.start-2));
    check(await opening(page)<.01,`${slug} ${width}x${height}: closed until visibility threshold`);
    if(width===390)await page.screenshot({path:path.join(out,slug+'-closed-390.png')});
    await scroll(page,trigger.start+(trigger.end-trigger.start)*.25);
    const first=await page.locator('.workshop-scene').boundingBox();
    const copy=page.locator(slug==='index'?'.workshop-copy':'.page-hero-copy');
    const copyFirst=await copy.boundingBox();
    await scroll(page,trigger.start+(trigger.end-trigger.start)*.5);
    const half=await opening(page);
    check(half>.45&&half<.6,`${slug} ${width}x${height}: halfway open halfway through scroll`);
    const middle=await page.locator('.workshop-scene').boundingBox();
    const copyMiddle=await copy.boundingBox();
    const bounds=await page.evaluate(()=>({top:document.querySelector('#top').getBoundingClientRect().bottom,bottom:innerHeight-(innerWidth<=760?document.querySelector('.mobile-actions').offsetHeight:0),overflow:document.documentElement.scrollWidth>innerWidth+1}));
    check(middle.y>=bounds.top-1&&middle.y+middle.height<=bounds.bottom+1,`${slug} ${width}x${height}: entire photograph visible between header and contacts`);
    check(!bounds.overflow,`${slug} ${width}x${height}: no horizontal overflow`);
    if(width===390)await page.screenshot({path:path.join(out,slug+'-half-390.png')});
    if(width===1280||height===390)await page.screenshot({path:path.join(out,slug+'-half-'+width+'.png')});
    await scroll(page,trigger.start+(trigger.end-trigger.start)*.9);
    const last=await page.locator('.workshop-scene').boundingBox();
    const copyLast=await copy.boundingBox();
    check(Math.abs(first.y-middle.y)<2&&Math.abs(first.y-last.y)<2,`${slug} ${width}x${height}: photograph remains stationary throughout opening`);
    check(Math.abs(copyFirst.y-copyMiddle.y)<2&&Math.abs(copyFirst.y-copyLast.y)<2,`${slug} ${width}x${height}: copy remains stationary throughout opening`);
    await scroll(page,trigger.end+2);
    check(await opening(page)>1.02,`${slug} ${width}x${height}: completely open at end`);
    await scroll(page,trigger.end+152);
    const released=await page.locator('.workshop-scene').boundingBox();
    const copyReleased=await copy.boundingBox();
    check(released.y<last.y-140,`${slug} ${width}x${height}: ordinary page scroll resumes after opening`);
    check(copyReleased.y<copyLast.y-140,`${slug} ${width}x${height}: copy resumes scrolling with the photograph`);
    // The hero (no spacing) and the horizontal departments story are the only other approved pins.
    check(await page.evaluate(()=>{const pins=ScrollTrigger.getAll().filter(t=>t.pin);return pins.some(t=>t.vars.id==='workshop-shutter')&&pins.every(t=>['workshop-shutter','departments'].includes(t.vars.id)||t.vars.pinSpacing===false)}),`${slug} ${width}x${height}: shutter pinned alongside approved scenes only`);
   }
  }
  await page.setViewportSize({width:1280,height:900});
  await page.goto('http://127.0.0.1:4176/motorbike-vercelli/index.html');
  await page.waitForFunction(()=>document.documentElement.dataset.motionReady==='true');
  await page.setViewportSize({width:1280,height:651});await page.waitForTimeout(550);
  await page.evaluate(()=>{const t=ScrollTrigger.getById('workshop-shutter');scrollTo(0,(t.start+t.end)/2)});await page.waitForTimeout(550);
  const resized=await page.locator('.workshop-scene').boundingBox();
  check(resized.y>=99&&resized.y+resized.height<=651,'Resizing within the desktop breakpoint keeps the entire photo visible');
  await page.setViewportSize({width:1280,height:900});await page.waitForTimeout(550);
  const pinnedRange=await page.evaluate(()=>{const t=ScrollTrigger.getById('workshop-shutter');return {start:t.start,end:t.end}});
  await scroll(page,pinnedRange.start+40);
  const wheelBefore=await page.locator('.workshop-scene').boundingBox();
  const beforeOpening=await opening(page);
  await page.mouse.wheel(0,120);await page.waitForTimeout(550);
  const wheelAfter=await page.locator('.workshop-scene').boundingBox();
  check(await opening(page)>beforeOpening&&Math.abs(wheelBefore.y-wheelAfter.y)<2,'Actual mouse wheel opens the shutter while the photo stays fixed');
  // The header steps aside while scrolling down; keyboard focus brings it back.
  await page.locator('#menu-open').focus();await page.waitForTimeout(800);
  await page.locator('#menu-open').click();
  check(await page.locator('#menu').evaluate(el=>!el.inert),'Menu remains usable during the pinned scene');
  await page.keyboard.press('Escape');
  check(await page.locator('#menu').evaluate(el=>el.inert),'Escape closes the menu during the pinned scene');
  await scroll(page,pinnedRange.end-50);
  await page.keyboard.press('PageDown');await page.waitForTimeout(550);
  check(await opening(page)>1.02&&(await page.locator('.workshop-scene').boundingBox()).y<wheelAfter.y-100,'Keyboard scroll releases the completed scene');
  await page.goto('http://127.0.0.1:4176/motorbike-vercelli/officina.html#richiesta');
  await page.waitForFunction(()=>document.documentElement.dataset.motionReady==='true');await page.waitForTimeout(550);
  const request=await page.locator('#richiesta').boundingBox();
  check(request.y>=0&&request.y<400,'Direct request anchor reaches the form after pin initialization');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>ScrollTrigger.getAll().length===0);
  check(await page.locator('.workshop-shutter').evaluate(el=>getComputedStyle(el).display==='none'),'Reduced motion exposes the workshop photograph');
  check(await page.locator('.pin-spacer').count()===0,'Reduced motion removes the pin and scroll spacing');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.waitForFunction(()=>document.documentElement.dataset.motionReady==='true');
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>document.documentElement.dataset.motionReady==='true');
  check(await page.evaluate(()=>ScrollTrigger.getAll().filter(t=>t.pin).length===1)&&await page.locator('.pin-spacer').count()===1,'Responsive rebuild restores exactly one pin without duplicate spacers');
  check(errors.length===0,'No runtime errors');
  await context.close();
 }finally{await browser.close()}
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks,errors},null,2));
 console.log(checks.filter(x=>x.passed).length+'/'+checks.length+' shutter checks passed');if(checks.some(x=>!x.passed))process.exitCode=1;
})();
