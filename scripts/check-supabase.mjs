import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { createSupabaseStore } from '../src/supabase-store.mjs';
const store = createSupabaseStore(name => process.env[name]);
const id = 'connection-check-' + randomUUID();
try {
  await store.put('connection_checks', id, { checked: true });
  assert((await store.list('connection_checks')).some(row => row.id === id && row.checked));
  await store.put('connection_checks', id, { checked: false });
  assert((await store.list('connection_checks')).some(row => row.id === id && row.checked === false));
} finally {
  await store.remove('connection_checks', id);
}
assert(!(await store.list('connection_checks')).some(row => row.id === id));
console.log('Supabase: create/read/update/delete berhasil; data uji sudah dihapus.');
