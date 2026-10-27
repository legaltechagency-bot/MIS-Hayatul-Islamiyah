import { getDatabase } from '@netlify/database';
import { createHandler } from '../../src/api.mjs';
import { createSupabaseStore } from '../../src/supabase-store.mjs';
const useSupabase = Netlify.env.get('DATA_BACKEND') === 'supabase';
const db = useSupabase ? null : getDatabase();
const store = {
  async list(kind) { return (await db.sql`SELECT id,data FROM school_records WHERE kind=${kind}`).map(r=>({id:r.id,...r.data})); },
  async put(kind,id,data) { await db.sql`INSERT INTO school_records(id,kind,data) VALUES(${id},${kind},${JSON.stringify(data)}::jsonb) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data WHERE school_records.kind=EXCLUDED.kind`; },
  async remove(kind,id) { await db.sql`DELETE FROM school_records WHERE id=${id} AND kind=${kind}`; }
};
export default createHandler(useSupabase ? createSupabaseStore(name => Netlify.env.get(name)) : store, name => Netlify.env.get(name));
export const config = { path:'/api/*', rateLimit:{windowLimit:80,windowSize:60,aggregateBy:['ip','domain'],action:'rate_limit'} };
