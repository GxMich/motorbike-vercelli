// Reproducible mobile lab measurements, with demo noindex left enabled.
import lighthouse from '../.design/qa-tools/node_modules/lighthouse/core/index.js';
import * as chromeLauncher from '../.design/qa-tools/node_modules/chrome-launcher/dist/index.js';
import fs from 'node:fs';
import path from 'node:path';

const out=path.resolve('.design/previews/premium');fs.mkdirSync(out,{recursive:true});
const profile=path.resolve('.design','lighthouse-profile-'+Date.now());
fs.mkdirSync(profile,{recursive:true});
const chrome=await chromeLauncher.launch({chromePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',userDataDir:profile,chromeFlags:['--headless','--no-sandbox']});
const results=[];
try{
  for(const file of (process.argv.length>2 ? process.argv.slice(2) : ['index','caschi','abbigliamento','moto','officina','contatti'])){
    const result=await lighthouse(`http://127.0.0.1:4176/motorbike-vercelli/${file}.html`,{port:chrome.port,output:['json','html'],logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']});
    fs.writeFileSync(path.join(out,`lighthouse-${file}.json`),result.report[0]);
    fs.writeFileSync(path.join(out,`lighthouse-${file}.html`),result.report[1]);
    const categories=Object.fromEntries(Object.entries(result.lhr.categories).map(([key,c])=>[key,Math.round(c.score*100)]));
    const metrics=Object.fromEntries(['largest-contentful-paint','cumulative-layout-shift','total-blocking-time'].map(k=>[k,result.lhr.audits[k].displayValue]));
    results.push({file,categories,metrics,lighthouseVersion:result.lhr.lighthouseVersion});
    console.log(file,JSON.stringify(categories),JSON.stringify(metrics));
  }
}finally{await chrome.kill()}
const summary=path.join(out,'lighthouse-summary.json');
const old=process.argv.length>2&&fs.existsSync(summary)?JSON.parse(fs.readFileSync(summary)):[];
fs.writeFileSync(summary,JSON.stringify([...old.filter(r=>!results.some(n=>n.file===r.file)),...results],null,2));
