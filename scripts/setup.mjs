import {randomBytes} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
const password=randomBytes(18).toString('base64url');
try{await writeFile('.env',`ADMIN_PASSWORD=${password}\nSESSION_SECRET=${randomBytes(48).toString('hex')}\nPORT=3000\n`,{flag:'wx',mode:0o600});console.log('Konfigurasi admin dibuat di .env. Buka file itu untuk melihat ADMIN_PASSWORD.');}catch(e){if(e.code==='EEXIST')console.log('.env sudah ada dan dipertahankan.');else throw e;}
