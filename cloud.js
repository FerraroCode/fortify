// Fortify Supabase cloud bridge. Local storage remains the offline source of truth.
(() => {
  const cfg=window.FORTIFY_SUPABASE,hasConfig=cfg&&cfg.url&&cfg.publishableKey;
  if(!hasConfig||!window.supabase?.createClient){window.FortifyCloud={enabled:false};return}
  const client=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}),KEY='fortify_mvp_v1';
  const local=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}},tsToIso=ts=>new Date(ts||Date.now()).toISOString(),dateFromTs=ts=>tsToIso(ts).slice(0,10);
  const writeLocal=d=>localStorage.setItem(KEY,JSON.stringify(d));
  function ensureClientIds(d){
    let changed=false;
    for(const [field,prefix] of [['urges','urge'],['relapses','relapse'],['journal','journal'],['prayers','prayer']]){
      const counts=new Map();
      for(const x of (d[field]||[])){
        const base=Number(x.ts)||Date.now(),n=(counts.get(base)||0)+1;counts.set(base,n);
        if(!x.clientId){x.clientId=`${prefix}-${base}${n>1?'-'+n:''}`;changed=true}
      }
    }
    if(changed)writeLocal(d);return d;
  }
  async function session(){const{data,error}=await client.auth.getSession();if(error)throw error;return data.session}
  async function signUp(email,password){const{data,error}=await client.auth.signUp({email,password});if(error)throw error;if(data.session)await pushLocal();return data}
  async function signIn(email,password){const{data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;await pushLocal();await pullCloud();return data}
  async function signOut(){const{error}=await client.auth.signOut();if(error)throw error}
  async function pushLocal(){
    const s=await session();if(!s)return false;const userId=s.user.id,d=ensureClientIds(local());
    let r=await client.from('profiles').upsert({id:userId,reason:d.reason||'',start_date:d.startDate||new Date().toISOString().slice(0,10),longest_streak:Math.max(0,Number(d.longest||0)),updated_at:new Date().toISOString()},{onConflict:'id'});if(r.error)throw r.error;
    if(Array.isArray(d.checkins)&&d.checkins.length){r=await client.from('daily_check_ins').upsert(d.checkins.map(x=>({user_id:userId,check_in_date:x.date,mood:x.mood,temptation:x.temptation,clean:!!x.clean,notes:x.note||'',trigger:x.trigger||null,win:x.win||null,updated_at:tsToIso(x.ts)})),{onConflict:'user_id,check_in_date'});if(r.error)throw r.error}
    if(Array.isArray(d.urges)&&d.urges.length){r=await client.from('urges').upsert(d.urges.map(x=>({user_id:userId,client_id:x.clientId,trigger:x.trigger||'Other',action:x.action||'',coping_strategy:x.action||'',overcome:!!x.overcome,occurred_at:tsToIso(x.ts)})),{onConflict:'user_id,client_id'});if(r.error)throw r.error}
    if(Array.isArray(d.relapses)&&d.relapses.length){r=await client.from('relapses').upsert(d.relapses.map(x=>({user_id:userId,client_id:x.clientId,trigger:x.trigger||'Other',lesson:x.lesson||'',notes:x.lesson||'',before_context:x.leadup||null,environment_change:x.recoveryPlan||null,next_action:x.nextAction||null,prayer:x.prayer||null,occurred_at:tsToIso(x.ts)})),{onConflict:'user_id,client_id'});if(r.error)throw r.error}
    if(Array.isArray(d.journal)&&d.journal.length){r=await client.from('journal_entries').upsert(d.journal.map(x=>({user_id:userId,client_id:x.clientId,content:x.text||'',entry_date:x.date||dateFromTs(x.ts),created_at:tsToIso(x.ts),updated_at:tsToIso(x.ts)})),{onConflict:'user_id,client_id'});if(r.error)throw r.error}
    if(Array.isArray(d.prayers)&&d.prayers.length){r=await client.from('prayers').upsert(d.prayers.map(x=>({user_id:userId,client_id:x.clientId,content:x.text||'',answered:!!x.done,answered_at:x.done?tsToIso(x.ts):null,created_at:tsToIso(x.ts),updated_at:new Date().toISOString()})),{onConflict:'user_id,client_id'});if(r.error)throw r.error}
    return true
  }
  async function pullCloud(){
    const s=await session();if(!s)return null;const uid=s.user.id,[p,c,u,r,j,pr]=await Promise.all([client.from('profiles').select('*').eq('id',uid).maybeSingle(),client.from('daily_check_ins').select('*').eq('user_id',uid).order('check_in_date'),client.from('urges').select('*').eq('user_id',uid).order('occurred_at'),client.from('relapses').select('*').eq('user_id',uid).order('occurred_at'),client.from('journal_entries').select('*').eq('user_id',uid).order('created_at'),client.from('prayers').select('*').eq('user_id',uid).order('created_at')]);for(const x of[p,c,u,r,j,pr])if(x.error)throw x.error;
    const existing=local(),merged={...existing,startDate:p.data?.start_date||existing.startDate,longest:p.data?.longest_streak??existing.longest??0,reason:p.data?.reason||existing.reason||'',checkins:(c.data||[]).map(x=>({date:x.check_in_date,ts:+new Date(x.updated_at||x.created_at),mood:x.mood,temptation:x.temptation,clean:x.clean,trigger:x.trigger||'',win:x.win||'',note:x.notes||''})),urges:(u.data||[]).map(x=>({clientId:x.client_id,date:(x.occurred_at||x.created_at).slice(0,10),ts:+new Date(x.occurred_at||x.created_at),trigger:x.trigger||'Other',action:x.action||x.coping_strategy||'',overcome:!!x.overcome})),relapses:(r.data||[]).map(x=>({clientId:x.client_id,date:(x.occurred_at||x.created_at).slice(0,10),ts:+new Date(x.occurred_at||x.created_at),trigger:x.trigger||'Other',lesson:x.lesson||x.notes||'',leadup:x.before_context||'',recoveryPlan:x.environment_change||'',nextAction:x.next_action||'',prayer:x.prayer||''})),journal:(j.data||[]).map(x=>({clientId:x.client_id,date:x.entry_date||x.created_at.slice(0,10),ts:+new Date(x.created_at),text:x.content||''})),prayers:(pr.data||[]).map(x=>({clientId:x.client_id,text:x.content||'',done:!!x.answered,ts:+new Date(x.created_at)}))};
    writeLocal(merged);return merged
  }
  async function sync(){await pushLocal();return pullCloud()}let syncTimer;function syncSoon(){clearTimeout(syncTimer);syncTimer=setTimeout(()=>pushLocal().catch(console.error),700)}window.FortifyCloud={enabled:true,client,session,signUp,signIn,signOut,pushLocal,pullCloud,sync,syncSoon};
})();