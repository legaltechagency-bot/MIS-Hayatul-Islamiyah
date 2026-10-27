import test from 'node:test';
import assert from 'node:assert/strict';
import {youtubeId} from '../public/youtube.js';
import {createHandler} from '../src/api.mjs';
test('YouTube link formats and host validation',()=>{
 for(const url of ['https://youtu.be/dQw4w9WgXcQ?si=test','https://www.youtube.com/watch?v=dQw4w9WgXcQ','https://youtube.com/shorts/dQw4w9WgXcQ','https://www.youtube.com/live/dQw4w9WgXcQ'])assert.equal(youtubeId(url),'dQw4w9WgXcQ');
 for(const url of ['javascript:alert(1)','https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ','https://youtube.com/watch?v=bad','https://youtube.com/channel/dQw4w9WgXcQ'])assert.equal(youtubeId(url),null);
});
test('albums preserve legacy images, enforce twelve photos, and videos support CRUD',async()=>{
 const rows=new Map();const store={async list(k){return [...rows.values()].filter(r=>r.kind===k).map(r=>({id:r.id,...r.data}));},async put(kind,id,data){rows.set(id,{kind,id,data});},async remove(k,id){rows.delete(id);}};
 const handler=createHandler(store,n=>({ADMIN_PASSWORD:'test-password',SESSION_SECRET:'a'.repeat(40)}[n]));
 const call=(path,method='GET',body,cookie)=>handler(new Request('http://localhost/api/'+path,{method,headers:cookie?{cookie}:{},...(body?{body:JSON.stringify(body)}:{})}));
 const cookie=(await call('login','POST',{password:'test-password'})).headers.get('set-cookie').split(';')[0];
 let data=await (await call('content')).json();assert.equal(data.albums[0].id,'album-legacy');assert.equal(data.albums[0].photos.length,10);
 const album={title:'Album Uji',photos:Array(12).fill('assets/kegiatan-pramuka.webp')};
 assert.equal((await call('content/albums','POST',album)).status,401);
 assert.equal((await call('content/albums','POST',{...album,photos:[...album.photos,'assets/extra.webp']},cookie)).status,400);
 assert.equal((await call('content/albums','POST',{...album,photos:['javascript:alert(1)']},cookie)).status,400);
 const created=await (await call('content/albums','POST',album,cookie)).json();assert.equal(created.photos.length,12);
 await call('content/albums/'+created.id,'PUT',{...album,title:'Album Diperbarui',photos:album.photos.slice(0,2)},cookie);data=await (await call('content')).json();assert.equal(data.albums.find(a=>a.id===created.id).photos.length,2);
await call('content/albums/'+created.id,'DELETE',undefined,cookie);await call('content/albums/album-legacy','DELETE',undefined,cookie);assert.ok((await (await call('content')).json()).albums.every(a=>a.id!==created.id&&a.id!=='album-legacy'));
 assert.equal((await call('content/videos','POST',{title:'Video',url:'https://evil.test'},cookie)).status,400);
 const video=await (await call('content/videos','POST',{title:'Video Sekolah',url:'https://youtu.be/dQw4w9WgXcQ'},cookie)).json();assert.equal(video.videoId,'dQw4w9WgXcQ');assert.equal(video.image,'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
 assert.equal((await (await call('content')).json()).videos.length,1);await call('content/videos/'+video.id,'DELETE',undefined,cookie);assert.equal((await (await call('content')).json()).videos.length,0);
});
