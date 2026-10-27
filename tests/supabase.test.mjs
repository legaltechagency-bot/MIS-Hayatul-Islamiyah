import test from 'node:test';
import assert from 'node:assert/strict';
import {createSupabaseStore} from '../src/supabase-store.mjs';
const env = name => ({SUPABASE_URL:'https://example.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_test'}[name]);
test('Supabase refuses missing or public credentials', () => {
  assert.throws(() => createSupabaseStore(() => undefined));
  assert.throws(() => createSupabaseStore(name => name === 'SUPABASE_SECRET_KEY' ? 'sb_publishable_test' : env(name)));
});
test('Supabase pagination preserves all records and authoritative IDs', async () => {
  let calls = 0;
  const store = createSupabaseStore(env, async url => {
    const offset = new URL(url).searchParams.get('offset');
    calls++;
    return Response.json(offset === '0' ? Array.from({length:500},(_,id)=>({id:String(id),data:{id:'wrong'}})) : [{id:'last',data:{}}]);
  });
  const rows = await store.list('registrations');
  assert.equal(rows.length,501); assert.equal(calls,2); assert.equal(rows[0].id,'0');
});
test('Supabase mutations scope records by kind and ID; errors never reveal secrets', async () => {
  const calls = [];
  const store = createSupabaseStore(env, async (url,options) => {calls.push({url,options}); return new Response(null,{status:204});});
  await store.put('albums','one',{title:'test'});
  await store.remove('albums','one');
  assert.equal(new URL(calls[0].url).searchParams.get('on_conflict'),'kind,id');
  assert.equal(new URL(calls[1].url).searchParams.get('kind'),'eq.albums');
  assert.equal(new URL(calls[1].url).searchParams.get('id'),'eq.one');
  const failed = createSupabaseStore(env, async () => new Response('secret data',{status:403}));
  await assert.rejects(failed.list('sessions'), {message:'Supabase database request failed (403).'});
});
