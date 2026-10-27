import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { createSupabaseStore } from '../src/supabase-store.mjs';

const databasePath = process.env.MIGRATION_SQLITE_PATH || '.data/school.sqlite';
if (!existsSync(databasePath)) throw new Error('Database sumber tidak ditemukan.');
const db = new DatabaseSync(databasePath, { readOnly: true });
const rows = db.prepare("SELECT kind, id, data FROM records WHERE kind != 'sessions' ORDER BY kind, id").all();
db.close();
const store = createSupabaseStore(name => process.env[name]);
const url = process.env.SUPABASE_URL.replace(/\/$/, '');
const key = process.env.SUPABASE_SECRET_KEY;
let copied = 0;
let existing = 0;
for (const row of rows) {
  const data = JSON.parse(row.data);
  const current = (await store.list(row.kind)).find(item => item.id === row.id);
  if (current) {
    const { id, ...stored } = current;
    if (!isDeepStrictEqual(stored, data)) throw new Error(`Konflik data pada ${row.kind}; migrasi dihentikan tanpa menimpa data.`);
    existing++;
    continue;
  }
  const response = await fetch(`${url}/rest/v1/school_records`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ kind: row.kind, id: row.id, data }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Penyalinan ${row.kind} gagal (${response.status}).`);
  const verified = (await store.list(row.kind)).find(item => item.id === row.id);
  if (!verified) throw new Error(`Verifikasi ${row.kind} gagal.`);
  const { id, ...stored } = verified;
  if (!isDeepStrictEqual(stored, data)) throw new Error(`Verifikasi isi ${row.kind} gagal.`);
  copied++;
  console.log(`Terverifikasi: ${row.kind}`);
}
console.log(`Selesai: ${copied} disalin, ${existing} sudah cocok. Sesi login tidak dipindahkan.`);
