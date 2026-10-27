// Server-only adapter. Never import this module into public browser code.
export function createSupabaseStore(env, fetcher = fetch) {
  const url = env('SUPABASE_URL');
  const key = env('SUPABASE_SECRET_KEY');
  if (!url || !key) throw new Error('SUPABASE_URL dan SUPABASE_SECRET_KEY wajib diisi.');
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url)) throw new Error('SUPABASE_URL tidak valid.');
  if (!key.startsWith('sb_secret_')) throw new Error('Gunakan Supabase secret key untuk backend.');
  async function request(query, options = {}) {
    const response = await fetcher(`${url.replace(/\/$/, '')}/rest/v1/school_records?${query}`, {
      ...options,
      headers: { apikey: key, 'Content-Type': 'application/json', ...options.headers },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Supabase database request failed (${response.status}).`);
    return response.status === 204 || response.headers.get('content-length') === '0' ? null : response.text();
  }
  return {
    async list(kind) {
      const rows = [];
      for (let offset = 0; ; offset += 500) {
        const query = new URLSearchParams({ kind: `eq.${kind}`, select: 'id,data', order: 'id.asc', limit: '500', offset: String(offset) });
        const page = JSON.parse(await request(query));
        rows.push(...page.map(row => ({ ...row.data, id: row.id })));
        if (page.length < 500) return rows;
      }
    },
    async put(kind, id, data) {
      await request('on_conflict=kind,id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ kind, id, data }) });
    },
    async remove(kind, id) {
      await request(new URLSearchParams({ kind: `eq.${kind}`, id: `eq.${id}` }), { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
    },
  };
}
