import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHandler} from '../src/api.mjs';
test('SQLite persistence, content CRUD for each admin collection, admissions lifecycle',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'mis-store-qa-'));const file=join(directory,'test.sqlite');let db;
 const open=()=>{db=new DatabaseSync(file);db.exec('CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY,kind TEXT,data TEXT)');return {async list(kind){return db.prepare('SELECT id,data FROM records WHERE kind=?').all(kind).map(r=>({id:r.id,...JSON.parse(r.data)}));},async put(kind,id,data){db.prepare('INSERT INTO records VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data WHERE records.kind=excluded.kind').run(id,kind,JSON.stringify(data));},async remove(kind,id){db.prepare('DELETE FROM records WHERE kind=? AND id=?').run(kind,id);}};};
 const env=n=>({ADMIN_PASSWORD:'qa-persistence-only',SESSION_SECRET:'persist-'.repeat(6)}[n]);let handler=createHandler(open(),env);
 const call=(path,method='GET',body,cookie)=>handler(new Request('http://localhost/api/'+path,{method,headers:cookie?{cookie}:{},...(body?{body:JSON.stringify(body)}:{})}));
 try{
 const cookie=(await call('login','POST',{password:env('ADMIN_PASSWORD')})).headers.get('set-cookie').split(';')[0];const ids=[];
 for(const kind of ['programs','extracurriculars','facilities','announcement','ppdb','gallery','articles','albums','videos']){
  const body={title:'QA '+kind,description:'QA original',image:'assets/icon-192.png',body:'QA article',category:'Program',date:'2026-10-19',status:'published',photos:Array(12).fill('assets/icon-192.png'),url:'https://youtu.be/dQw4w9WgXcQ'};
  const create=await call('content/'+kind,'POST',body,cookie);assert.equal(create.status,200,kind);const {id}=await create.json();ids.push([kind,id]);
  assert.equal((await call('content/'+kind+'/'+id,'PUT',{...body,title:'Updated '+kind},cookie)).status,200);
 }
 db.close();handler=createHandler(open(),env);
 const after=await (await call('content')).json();for(const[kind,id]of ids)assert.equal(after[kind].find(r=>r.id===id).title,'Updated '+kind);
 for(const[kind,id]of ids){assert.equal((await call('content/'+kind+'/'+id,'DELETE',undefined,cookie)).status,200);assert(!(await (await call('content')).json())[kind].some(r=>r.id===id));}
 const student={name:'QA Student',birthplace:'Depok',birthdate:'2020-01-01',parent:'QA Parent',gender:'Laki-laki',phone:'+62 8990257323',address:'QA Address',consent:true};
 const admission=await call('registrations','POST',student);assert.equal(admission.status,201);const {id}=await admission.json();
 for(const status of ['Diproses','Diterima','Ditolak','Baru'])assert.equal((await call('registrations/'+id,'PUT',{status},cookie)).status,200);
 await call('registrations/'+id,'DELETE',undefined,cookie);assert.equal((await (await call('registrations','GET',undefined,cookie)).json()).length,0);
 assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
 }finally{db?.close();await rm(directory,{recursive:true,force:true});}
});
