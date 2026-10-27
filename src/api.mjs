import { randomUUID,createHmac,timingSafeEqual,createHash } from 'node:crypto';
import { seed } from './seed.mjs';
import { youtubeId } from '../public/youtube.js';
const json=(data,status=200,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
const kinds=['programs','extracurriculars','facilities','gallery','albums','videos','announcement','ppdb','articles','organization','teachers','hero'];
const text=(v,n=5000)=>typeof v==='string'?v.trim().slice(0,n):'';
const calendarDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value&&Number(value.slice(0,4))>=1900;
export function createHandler(store,env) {
 const attempts=new Map();
 const sign=s=>createHmac('sha256',env('SESSION_SECRET')).update(s).digest('hex');
 const equal=(a,b)=>{const x=createHash('sha256').update(a).digest(),y=createHash('sha256').update(b).digest();return timingSafeEqual(x,y);};
 return async (request,context={})=>{
  try {
   const url=new URL(request.url), path=url.pathname.replace(/^\/api\/?/,'').split('/'), method=request.method;
   if(!['GET','POST','PUT','DELETE'].includes(method)) return json({error:'Metode tidak tersedia'},405);
   if(method!=='GET' && request.headers.get('origin') && request.headers.get('origin')!==url.origin) return json({error:'Origin ditolak'},403);
   if(Number(request.headers.get('content-length')||0)>2000000) return json({error:'Data terlalu besar'},413);
   let body={}; if(['POST','PUT'].includes(method)){const raw=await request.text();if(Buffer.byteLength(raw)>2000000)return json({error:'Data terlalu besar'},413);try{body=JSON.parse(raw||'{}');}catch{return json({error:'Format JSON tidak valid'},400);}if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Data harus berupa objek JSON'},400);}
   const secure=url.protocol==='https:'?'; Secure':'';
   const cookie=(value,age)=>`school_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure}`;
   const token=(request.headers.get('cookie')||'').match(/school_session=([^;]+)/)?.[1]||'';
   const [expires,nonce,signature,...extra]=token.split('.');
   const configured=!!env('ADMIN_PASSWORD') && (env('SESSION_SECRET')||'').length>=32;
   const sessionId=createHash('sha256').update(token).digest('hex');
   const signed=configured&&!extra.length&&Number(expires)>Date.now()&&equal(signature||'',sign((expires||'')+'.'+(nonce||'')));
   const credential=configured?createHash('sha256').update(env('ADMIN_PASSWORD')+env('SESSION_SECRET')).digest('hex'):'';
   const authed=signed&&(await store.list('sessions')).some(s=>s.id===sessionId&&s.expires>Date.now()&&s.credential===credential);
   if(path[0]==='login' && method==='POST'){
    if(!configured)return json({error:'Akun admin belum dikonfigurasi di server.'},503);
    const key=context.ip||'local',now=Date.now();for(const[k,v]of attempts)if(v.until<=now)attempts.delete(k);
    const bucket=attempts.get(key)||{count:0,until:now+15*60000};
    if(bucket.count>=10)return json({error:'Terlalu banyak percobaan. Coba lagi dalam 15 menit.'},429,{'Retry-After':String(Math.ceil((bucket.until-now)/1000))});
    if(!equal(text(body.password,200),env('ADMIN_PASSWORD'))){bucket.count++;attempts.set(key,bucket);return json({error:'Kata sandi salah'},401);}
    attempts.delete(key);for(const session of await store.list('sessions'))if(session.expires<=now)await store.remove('sessions',session.id);
    const expiry=String(now+8*3600000),payload=expiry+'.'+randomUUID(),value=payload+'.'+sign(payload);
    await store.put('sessions',createHash('sha256').update(value).digest('hex'),{expires:Number(expiry),credential});
    return json({ok:true},200,{'Set-Cookie':cookie(value,28800)});
   }
   if(path[0]==='logout'){if(method!=='POST')return json({error:'Gunakan POST'},405);if(authed)await store.remove('sessions',sessionId);return json({ok:true},200,{'Set-Cookie':cookie('',0)});}
   if(path[0]==='session')return json({authenticated:authed});
   if(path[0]==='content' && method==='GET'){
const result={};for(const kind of kinds){const rows=await store.list(kind);const deleted=rows.filter(r=>r.deleted).map(r=>r.id);const merged=new Map((seed[kind]||[]).filter(r=>!deleted.includes(r.id)).map(r=>[r.id,r]));rows.filter(r=>!r.deleted).forEach(r=>merged.set(r.id,r));result[kind]=[...merged.values()];}result.organization=seed.organization.map(position=>{const saved=result.organization.find(r=>r.id===position.id);return {...position,title:saved?.title||position.title,image:saved?.image||position.image};});if(result.gallery.length){const legacy={id:'album-legacy',title:'Dokumentasi Madrasah',description:'Dokumentasi kegiatan MIS Hayatul Islamiyah Cinangka.',photos:result.gallery.slice(0,12).map(r=>r.image)};legacy.image=legacy.photos[0];const stored=await store.list('albums');if(!stored.some(r=>r.id===legacy.id))result.albums.unshift(legacy);}if(!authed)result.articles=result.articles.filter(r=>r.status==='published');return json(result);
   }
   if(path[0]==='registrations' && method==='POST'){
    if(body.website)return json({error:'Pendaftaran ditolak'},400);
    const data=Object.fromEntries(['name','birthplace','birthdate','gender','parent','phone','address','origin'].map(k=>[k,text(body[k],1000)]));
    if(!data.name||!data.parent||!data.address||!data.birthplace||!['Laki-laki','Perempuan'].includes(data.gender)||!/^\+?[0-9 -]{9,18}$/.test(data.phone)||!/^(0|62)\d{8,13}$/.test(data.phone.replace(/[+ -]/g,''))||!calendarDate(data.birthdate)||Date.parse(data.birthdate)>Date.now()||body.consent!==true)return json({error:'Lengkapi data dan persetujuan pendaftaran dengan tanggal dan nomor WhatsApp yang valid.'},400);
    const id=randomUUID();await store.put('registrations',id,{...data,status:'Baru',createdAt:new Date().toISOString()});return json({id,ok:true},201);
   }
   if(!authed)return json({error:'Silakan login sebagai admin'},401);
   if(path[0]==='registrations'){
    if(method==='GET')return json(await store.list('registrations'));
    if(method==='PUT'){const row=(await store.list('registrations')).find(r=>r.id===path[1]);if(!row)return json({error:'Data tidak ditemukan'},404);if(!['Baru','Diproses','Diterima','Ditolak'].includes(body.status))return json({error:'Status tidak valid'},400);const {id,...rest}=row;await store.put('registrations',id,{...rest,status:body.status});return json({ok:true});}
    if(method==='DELETE'){await store.remove('registrations',path[1]);return json({ok:true});}
   }
   if(path[0]==='content' && kinds.includes(path[1])){
    if(path[1]==='hero'&&(method!=='PUT'||path[2]!=='hero-main'))return json({error:'Gunakan pengaturan hero utama.'},405);
    if(path[1]==='organization'&&(method!=='PUT'||!seed.organization.some(r=>r.id===path[2])))return json({error:'Struktur tetap. Hanya nama dan foto jabatan yang dapat diperbarui.'},405);
    if(['PUT','DELETE'].includes(method)&&!path[2])return json({error:'ID wajib diisi'},400);
    if(['PUT','DELETE'].includes(method)){
     const exists=(await store.list(path[1])).some(r=>r.id===path[2]&&!r.deleted)||(seed[path[1]]||[]).some(r=>r.id===path[2])||(path[1]==='albums'&&path[2]==='album-legacy');
     if(!exists)return json({error:'Data tidak ditemukan'},404);
    }
    const id=path[2]||randomUUID();if(method==='DELETE'){await store.put(path[1],id,{deleted:true});return json({ok:true});}
    if(['POST','PUT'].includes(method)){
     const data={title:text(body.title,200),description:text(body.description),image:text(body.image,1800000)};
     if(path[1]==='organization'){
      const position=seed.organization.find(r=>r.id===id);
      data.description=position.description;data.level=position.level;data.order=position.order;
     }
     if(path[1]==='teachers'){
      if(!['Wali Kelas','Guru Mata Pelajaran','Staf Pengajar'].includes(body.role)||!Array.isArray(body.classes)||!body.classes.length||body.classes.some(n=>!Number.isInteger(n)||n<1||n>6))return json({error:'Pilih kategori dan kelas 1–6.'},400);
      data.role=body.role;data.classes=[...new Set(body.classes)].sort();data.description=text(body.description,200);
     }
     if(path[1]==='hero'){data.subtitle=text(body.subtitle,200);data.tagline=text(body.tagline,300);}
     if(['albums','hero'].includes(path[1])){
      if(!Array.isArray(body.photos)||body.photos.length<1||body.photos.length>12)return json({error:'Album harus berisi 1 sampai 12 foto.'},400);
      data.photos=body.photos.map(photo=>text(photo,1800000));
      if(data.photos.some(photo=>! /^(\/assets\/|assets\/|https:\/\/|data:image\/(png|jpeg|webp);base64,)/.test(photo)))return json({error:'Foto album tidak valid.'},400);
      data.image=data.photos[0];
     }
     if(path[1]==='videos'){
      data.videoId=youtubeId(text(body.url,1000));
      if(!data.videoId)return json({error:'Masukkan tautan video YouTube yang valid.'},400);
      data.url='https://www.youtube.com/watch?v='+data.videoId;
      data.image='https://i.ytimg.com/vi/'+data.videoId+'/hqdefault.jpg';
     }
     if(path[1]==='articles'){
      data.body=text(body.body,30000);
      data.category=['Berita','Kegiatan','Program'].includes(body.category)?body.category:'Berita';
      data.status=body.status==='published'?'published':'draft';
      data.date=text(body.date,10);
      if(!calendarDate(data.date))return json({error:'Tanggal artikel tidak valid'},400);
      if(data.status==='published'&&!data.body)return json({error:'Isi artikel wajib untuk diterbitkan'},400);
     }
     if(!data.title)return json({error:'Judul wajib diisi'},400);
     if(data.image&&!/^(\/assets\/|assets\/|https:\/\/|data:image\/(png|jpeg|webp);base64,)/.test(data.image))return json({error:'Gambar tidak valid'},400);
     await store.put(path[1],id,data);return json({id,...data});
    }
   }
   return json({error:'Tidak ditemukan'},404);
  } catch(error){console.error(error.message);return json({error:'Permintaan gagal. Coba kembali.'},500);}
 };
}
