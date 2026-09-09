// Fortify Supabase cloud bridge. Local storage remains the offline source of truth.
(() => {
  const cfg = window.FORTIFY_SUPABASE;
  const hasConfig = cfg && cfg.url && cfg.anonKey && !cfg.url.includes('YOUR_PROJECT');
  if (!hasConfig || !window.supabase?.createClient) {
    window.FortifyCloud = { enabled: false };
    return;
  }

  const client = window.supabase.createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  const KEY = 'fortify_mvp_v1';
  const local = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
  };

  const tsToIso = ts => new Date(ts || Date.now()).toISOString();

  async function session() {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async function signUp(email, password) {
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await pushLocal();
    return data;
  }

  async function signOut() {
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }

  async function pushLocal() {
    const s = await session();
    if (!s) return false;
    const userId = s.user.id;
    const d = local();

    const profile = {
      user_id: userId,
      reason: d.reason || '',
      start_date: d.startDate || new Date().toISOString().slice(0, 10),
      longest_streak: Math.max(0, Number(d.longest || 0)),
      updated_at: new Date().toISOString()
    };
    let r = await client.from('profiles').upsert(profile, { onConflict: 'user_id' });
    if (r.error) throw r.error;

    if (Array.isArray(d.checkins) && d.checkins.length) {
      const rows = d.checkins.map(x => ({
        user_id: userId, checkin_date: x.date, mood: x.mood, temptation: x.temptation,
        clean: !!x.clean, note: x.note || '', created_at: tsToIso(x.ts)
      }));
      r = await client.from('checkins').upsert(rows, { onConflict: 'user_id,checkin_date' });
      if (r.error) throw r.error;
    }

    const tables = [
      ['urges', d.urges, x => ({ user_id:userId, urge_date:x.date, trigger:x.trigger || 'Other', action:x.action || '', overcome:!!x.overcome, created_at:tsToIso(x.ts) })],
      ['relapses', d.relapses, x => ({ user_id:userId, relapse_date:x.date, trigger:x.trigger || 'Other', lesson:x.lesson || '', created_at:tsToIso(x.ts) })],
      ['journal_entries', d.journal, x => ({ user_id:userId, entry_date:x.date, body:x.text || '', created_at:tsToIso(x.ts) })],
      ['prayers', d.prayers, x => ({ user_id:userId, body:x.text || '', done:!!x.done, created_at:tsToIso(x.ts || Date.now()) })]
    ];

    // First migration only: avoid duplicating append-only local history on every sync.
    if (!localStorage.getItem('fortify_cloud_migrated_v1')) {
      for (const [name, items, map] of tables) {
        if (!Array.isArray(items) || !items.length) continue;
        r = await client.from(name).insert(items.map(map));
        if (r.error) throw r.error;
      }
      localStorage.setItem('fortify_cloud_migrated_v1', '1');
    }
    return true;
  }

  async function pullCloud() {
    const s = await session();
    if (!s) return null;
    const uid = s.user.id;
    const [p,c,u,r,j,pr] = await Promise.all([
      client.from('profiles').select('*').eq('user_id',uid).single(),
      client.from('checkins').select('*').eq('user_id',uid).order('checkin_date'),
      client.from('urges').select('*').eq('user_id',uid).order('created_at'),
      client.from('relapses').select('*').eq('user_id',uid).order('created_at'),
      client.from('journal_entries').select('*').eq('user_id',uid).order('created_at'),
      client.from('prayers').select('*').eq('user_id',uid).order('created_at')
    ]);
    for (const x of [p,c,u,r,j,pr]) if (x.error && x.error.code !== 'PGRST116') throw x.error;
    const merged = {
      startDate: p.data?.start_date,
      longest: p.data?.longest_streak || 0,
      reason: p.data?.reason || '',
      checkins: (c.data||[]).map(x=>({date:x.checkin_date,ts:+new Date(x.created_at),mood:x.mood,temptation:x.temptation,clean:x.clean,note:x.note})),
      urges: (u.data||[]).map(x=>({date:x.urge_date,ts:+new Date(x.created_at),trigger:x.trigger,action:x.action,overcome:x.overcome})),
      relapses: (r.data||[]).map(x=>({date:x.relapse_date,ts:+new Date(x.created_at),trigger:x.trigger,lesson:x.lesson})),
      journal: (j.data||[]).map(x=>({date:x.entry_date,ts:+new Date(x.created_at),text:x.body})),
      prayers: (pr.data||[]).map(x=>({text:x.body,done:x.done,ts:+new Date(x.created_at)}))
    };
    localStorage.setItem(KEY, JSON.stringify(merged));
    return merged;
  }

  async function sync() {
    await pushLocal();
    return pullCloud();
  }

  window.FortifyCloud = { enabled:true, client, session, signUp, signIn, signOut, pushLocal, pullCloud, sync };
})();
