import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base='http://localhost:3000';
const password=(await readFile('.env','utf8')).match(/^ADMIN_PASSWORD=(.+)$/m)[1];
for(const path of ['index.html','profil.html','program-fasilitas.html','galeri.html','ppdb.html','pendaftaran.html','admin.html','manifest.webmanifest','sw.js']) assert((await fetch(base+'/'+path)).ok,path);
const login=await fetch(base+'/api/login',{method:'POST',body:JSON.stringify({password})});assert(login.ok);
const cookie=login.headers.get('set-cookie').split(';')[0];
const response=await fetch(base+'/api/registrations',{method:'POST',body:JSON.stringify({name:'TEST SISTEM',birthplace:'Depok',birthdate:'2020-01-01',gender:'Laki-laki',parent:'TEST WALI',phone:'089900000000',address:'TEST',consent:true})});assert.equal(response.status,201);
const {id}=await response.json();
try {const rows=await fetch(base+'/api/registrations',{headers:{cookie}}).then(r=>r.json());assert(rows.some(r=>r.id===id));assert.equal((await fetch(base+'/api/registrations')).status,401);}finally{await fetch(base+'/api/registrations/'+id,{method:'DELETE',headers:{cookie}});}
console.log('HTTP integration passed: pages, login, persistent registration, admin read/delete, private access control.');
