import {spawn} from 'node:child_process';
import {mkdtemp,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const dataDir=await mkdtemp(join(tmpdir(),'mis-qa-'));
const base='http://127.0.0.1:3107',password='QA-only-password-2026';
const server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'3107',DATA_DIR:dataDir,ADMIN_PASSWORD:password,SESSION_SECRET:'qa-secret-'.repeat(6)},stdio:'pipe'});
const report={pages:[],checks:[],errors:[],networkFailures:[]};
await mkdir('work/qa',{recursive:true});
const check=(name,fn)=>async()=>{try{await fn();report.checks.push({name,pass:true});}catch(error){report.checks.push({name,pass:false,error:error.message});}};
let browser;
try{
 for(let i=0;i<60;i++){try{if((await fetch(base+'/api/content')).ok)break;}catch{}await new Promise(r=>setTimeout(r,150));}
 browser=await chromium.launch({headless:true,...(process.env.QA_BROWSER_PATH?{executablePath:process.env.QA_BROWSER_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1366,height:900}}),page=await context.newPage();
 page.setDefaultTimeout(8000);
 await context.route('**/*',route=>{const url=new URL(route.request().url());if(!['127.0.0.1','localhost'].includes(url.hostname))return route.abort();return route.continue();});
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400&&!r.url().includes('/api/login')&&!r.url().includes('/api/content')&&!r.url().includes('/seed.json'))report.networkFailures.push({url:r.url(),status:r.status()});});
 await mkdir('work/qa',{recursive:true});
 for(const width of [1366,768,390,320]){
  await page.setViewportSize({width,height:900});
  for(const route of ['index.html','profil.html','program-fasilitas.html','galeri.html','album.html?id=album-legacy','artikel.html','artikel-detail.html?id=missing','ppdb.html','pendaftaran.html','kontak.html','admin.html']){
   await page.goto(base+'/'+route,{waitUntil:'domcontentloaded'});await page.locator('html[data-app-ready]').waitFor();
   for(const img of await page.locator('img').all())if(await img.isVisible())await img.scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>[...document.images].every(i=>i.complete));
   const state=await page.evaluate(()=>({heading:document.querySelector('h1')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth+1,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src')),h1:document.querySelectorAll('h1').length}));
   report.pages.push({width,route,...state});
  }
 }
 await page.setViewportSize({width:1366,height:900});
 await check('Admin login, CRUD program through editor',async()=>{
  await page.goto(base+'/admin.html');await page.locator('#login input').fill(password);await page.locator('#login button').click();await page.locator('[data-view="programs"]').waitFor();
  await page.locator('[data-view="programs"]').click();await page.locator('#add').click();await page.locator('dialog input[name=title]').fill('QA Program');await page.locator('dialog textarea[name=description]').fill('<img src=x onerror=alert(1)>');await page.locator('dialog button[type=submit], dialog .btn-primary').click();await page.locator('dialog').waitFor({state:'detached'});await page.getByRole('heading',{name:'QA Program',exact:true}).waitFor();
  const row=page.locator('.admin-row').filter({has:page.getByRole('heading',{name:'QA Program',exact:true})});await row.locator('[data-edit]').click();await page.locator('dialog input[name=title]').fill('QA Program Edited');await page.locator('dialog .btn-primary').click();await page.locator('dialog').waitFor({state:'detached'});await page.getByRole('heading',{name:'QA Program Edited',exact:true}).waitFor();
 })();
 await check('Article editor, publication, detail and search',async()=>{
  await page.locator('[data-view="articles"]').click();await page.locator('#add').click();await page.locator('dialog input[name=title]').fill('QA News');await page.locator('dialog textarea[name=description]').fill('QA summary');await page.locator('dialog textarea[name=body]').fill('QA article paragraph.\n\nSecond paragraph.');await page.locator('dialog select[name=status]').selectOption('published');await page.locator('dialog .btn-primary').click();await page.locator('dialog').waitFor({state:'detached'});await page.goto(base+'/artikel.html');await page.locator('#article-search').fill('QA News');await page.getByRole('heading',{name:'QA News',exact:true}).getByRole('link').click();await page.locator('.article-body').waitFor();assert((await page.locator('.article-body').innerText()).includes('Second paragraph.'));
 })();
 await check('Album editor, multi-upload, remove photo, lightbox',async()=>{
  await page.goto(base+'/admin.html');await page.locator('[data-view="albums"]').click();await page.locator('#add').click();await page.locator('dialog input[name=title]').fill('QA Album');await page.locator('dialog input[type=file]').setInputFiles(['assets/icon-192.png','assets/icon-512.png']);await page.getByText('2 / 12 foto',{exact:true}).waitFor();await page.locator('[data-remove="1"]').click();await page.locator('dialog [data-save]').click();await page.locator('dialog').waitFor({state:'detached'});await page.goto(base+'/galeri.html');await page.getByRole('heading',{name:'QA Album',exact:true}).click();await page.locator('[data-photo="0"]').click();await page.locator('.photo-viewer').waitFor();await page.locator('[data-next]').click();await page.keyboard.press('Escape');await page.locator('.photo-viewer').waitFor({state:'detached'});
 })();
 await check('YouTube admin editor and public thumbnail',async()=>{
  await page.goto(base+'/admin.html');await page.locator('[data-view="videos"]').click();await page.locator('#add').click();await page.locator('dialog input[name=title]').fill('QA Video');await page.locator('dialog input[name=url]').fill('https://youtu.be/dQw4w9WgXcQ');await page.locator('.video-preview img').waitFor();await page.locator('[data-save]').click();await page.locator('dialog').waitFor({state:'detached'});await page.goto(base+'/galeri.html');const link=page.locator('.video-card a');assert((await link.getAttribute('href')).includes('dQw4w9WgXcQ'));assert((await link.locator('img').getAttribute('src')).includes('i.ytimg.com'));
 })();
 await check('PPDB form to admin status and Excel download',async()=>{
  await page.goto(base+'/pendaftaran.html');for(const [name,value]of Object.entries({name:'QA Student',birthplace:'Depok',birthdate:'2020-01-01',parent:'QA Parent',phone:'089900000000',address:'QA Address'}))await page.locator('[name="'+name+'"]').fill(value);await page.locator('[name=gender]').selectOption('Perempuan');await page.locator('[name=consent]').check();await page.locator('#registration button').click();await page.getByRole('heading',{name:'Pendaftaran diterima'}).waitFor();await page.goto(base+'/admin.html');await page.locator('[data-view=registrations]').click();await page.locator('#search').fill('QA Student');await page.locator('[data-status]').selectOption('Diterima');await page.getByText('Status diperbarui.',{exact:true}).waitFor();const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;assert(download.suggestedFilename().endsWith('.xlsx'));
 })();
 await check('Mobile navigation',async()=>{await page.setViewportSize({width:390,height:844});await page.goto(base+'/index.html');await page.locator('.menu-toggle').click();await page.locator('.nav-dropdown').filter({hasText:'Program'}).locator('summary').click();await page.locator('.nav-links a[href="program-fasilitas.html#extracurriculars"]').click();await page.locator('#extracurriculars .mini-card').first().waitFor();assert(page.url().includes('program-fasilitas'));})();
 await page.goto(base+'/index.html');await page.screenshot({path:'work/qa/home-mobile.png',fullPage:true});await page.setViewportSize({width:1366,height:900});await page.reload();await page.screenshot({path:'work/qa/home-desktop.png',fullPage:true});
 await check('PWA offline dashboard shell',async()=>{await page.goto(base+'/admin.html');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await context.setOffline(true);await page.reload();await page.waitForTimeout(300);assert(await page.getByRole('heading',{name:'Dashboard',exact:true}).count());assert.equal(await page.locator('#connection').innerText(),'Tidak terhubung');await context.setOffline(false);})();
}catch(e){report.errors.push(e.stack);}finally{await browser?.close();server.kill();await writeFile('work/qa/browser-results.json',JSON.stringify(report,null,2));if(report.errors.length||report.networkFailures.length||report.checks.some(c=>!c.pass)||report.pages.some(p=>p.overflow||p.broken.length))process.exitCode=1;console.log(JSON.stringify({pages:report.pages.length,overflow:report.pages.filter(p=>p.overflow),broken:report.pages.filter(p=>p.broken.length),checks:report.checks,errors:report.errors,networkFailures:report.networkFailures},null,2));}
