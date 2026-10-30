import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sitemapPages,canonicalUrl} from '../scripts/seo.mjs';
test('public pages have unique metadata and sitemap excludes private and empty detail shells',async()=>{
 const descriptions=new Set();const map=await readFile('dist/sitemap.xml','utf8');
 for(const page of sitemapPages){const html=await readFile('dist/'+page,'utf8');const description=html.match(/name="description" content="([^"]+)"/)[1];assert(!descriptions.has(description));descriptions.add(description);assert(html.includes('rel="canonical" href="'+canonicalUrl(page)+'"'));assert(map.includes('<loc>'+canonicalUrl(page)+'</loc>'));}
 for(const page of ['admin','pendaftaran']){assert.match(await readFile('dist/'+page+'.html','utf8'),/name="robots" content="noindex, nofollow"/);assert(!map.includes('/'+page+'</loc>'));}
 for(const page of ['album','artikel-detail']){assert(!map.includes('/'+page+'</loc>'));assert(!(await readFile('dist/'+page+'.html','utf8')).includes('rel="canonical"'));}
 const home=await readFile('dist/index.html','utf8');const schema=JSON.parse(home.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);assert.equal(schema['@type'],'School');assert.equal(schema.address.addressLocality,'Kota Depok');assert.equal(schema.sameAs.length,3);
 assert((await readFile('dist/robots.txt','utf8')).includes('Sitemap: https://mishayatulislamiyahcinangka.sch.id/sitemap.xml'));
});
