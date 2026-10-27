import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,access} from 'node:fs/promises';
import {join} from 'node:path';
test('all generated pages have working local references, language, heading and private-file separation',async()=>{
 const files=await readdir('dist');const pages=files.filter(f=>f.endsWith('.html'));assert.equal(pages.length,11);
 for(const file of pages){const html=await readFile(join('dist',file),'utf8');assert.match(html,/<html lang="id">/);assert.match(html,/<meta name="viewport"/);if(!['album.html','artikel-detail.html'].includes(file))assert.match(html,/<h1[ >]/,file);
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){const link=match[1];if(/^(https?:|data:|#|mailto:|tel:)/.test(link))continue;await access(join('dist',link.split(/[?#]/)[0]));}
 }
 for(const privateFile of ['.env','server.mjs','src','netlify','.data','.git'])assert(!files.includes(privateFile),privateFile);
 const manifest=JSON.parse(await readFile('dist/manifest.webmanifest','utf8'));assert.equal(manifest.start_url,'/admin.html');
 for(const icon of manifest.icons){const data=await readFile(join('dist',icon.src));const [w,h]=icon.sizes.split('x').map(Number);assert.equal(data.readUInt32BE(16),w);assert.equal(data.readUInt32BE(20),h);}
 const sw=await readFile('dist/sw.js','utf8');assert(sw.includes("url.pathname.startsWith('/api/')"));
});
