(() => {
  if (window.__FORTIFY_PUSH_LOADED) return;
  window.__FORTIFY_PUSH_LOADED = true;
  const $=s=>document.querySelector(s), cloud=()=>window.FortifyCloud;
  const baseUrl=()=>window.FORTIFY_SUPABASE?.url || '';
  const endpoint=()=>`${baseUrl()}/functions/v1/send-push-reminders`;
  const supported=()=>('serviceWorker' in navigator)&&('PushManager' in window)&&('Notification' in window);
  const standalone=()=>window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone===true;
  const b64ToU8=s=>{const p='='.repeat((4-s.length%4)%4),b=(s+p).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(b);return Uint8Array.from(raw,c=>c.charCodeAt(0))};
  async function session(){return cloud()?.enabled ? await cloud().session() : null}
  function status(text,good=false){const el=$('#pushStatus');if(!el)return;el.textContent=text;el.classList.toggle('good',good)}
  async function publicKey(){const r=await fetch(endpoint(),{method:'GET',cache:'no-store'});if(!r.ok)throw new Error('Could not load push configuration.');const j=await r.json();return j.publicKey}
  async function currentSub(){if(!supported())return null;const reg=await navigator.serviceWorker.ready;return await reg.pushManager.getSubscription()}
  async function savePref(userId,enabled,time){const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'America/New_York';const {error}=await cloud().client.from('push_preferences').upsert({user_id:userId,enabled,reminder_time:time||$('#reminderTime')?.value||'21:00',timezone:tz,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(error)throw error}
  async function enable(){
    try{
      if(!window.FORTIFY_PLUS_ACTIVE)return status('Fortify+ is required for push reminders.');
      const s=await session();if(!s)return status('Sign in to your Fortify account first.');
      if(!supported())return status('Push notifications are not supported in this browser.');
      if(/iPhone|iPad|iPod/.test(navigator.userAgent)&&!standalone())return status('On iPhone, add Fortify to your Home Screen and open the Home Screen app first.');
      const perm=await Notification.requestPermission();if(perm!=='granted')return status('Notification permission was not allowed. You can change this in iPhone Settings.');
      const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
      if(!sub){const key=await publicKey();sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToU8(key)})}
      const json=sub.toJSON(),keys=json.keys||{};
      const {error}=await cloud().client.from('push_subscriptions').upsert({user_id:s.user.id,endpoint:sub.endpoint,p256dh:keys.p256dh,auth:keys.auth,user_agent:navigator.userAgent,updated_at:new Date().toISOString()},{onConflict:'endpoint'});if(error)throw error;
      await savePref(s.user.id,true,$('#reminderTime')?.value||'21:00');
      status('Push reminders are ON for this device.',true);const b=$('#pushEnableBtn');if(b)b.textContent='Disable push';
    }catch(e){status(e.message||'Could not enable push notifications.')}
  }
  async function disable(){try{const s=await session(),sub=await currentSub();if(sub){await cloud()?.client.from('push_subscriptions').delete().eq('endpoint',sub.endpoint);await sub.unsubscribe()}if(s)await savePref(s.user.id,false,$('#reminderTime')?.value||'21:00');status('Push reminders are off.');const b=$('#pushEnableBtn');if(b)b.textContent='Enable push'}catch(e){status(e.message||'Could not disable push notifications.')}}
  async function toggle(){const sub=await currentSub();return sub?disable():enable()}
  async function saveTime(time){
    try{
      const s=await session(),sub=await currentSub();
      if(!s||!sub)return;
      const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'America/New_York';
      const {error}=await cloud().client.from('push_preferences').upsert({user_id:s.user.id,enabled:true,reminder_time:time||'21:00',timezone:tz,last_sent_date:null,updated_at:new Date().toISOString()},{onConflict:'user_id'});
      if(error)throw error;
    }catch(e){console.warn('Fortify push time sync failed',e)}
  }
  async function test(){
    try{
      if(!window.FORTIFY_PLUS_ACTIVE)return status('Fortify+ is required for push reminders.');
      const s=await session();if(!s)return status('Sign in first.');
      const sub=await currentSub();if(!sub)return status('Enable push notifications first.');
      status('Sending test notification…');
      const r=await fetch(endpoint(),{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${s.access_token}`},body:JSON.stringify({test:true})});const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Test push failed.');status(j.sent? 'Test notification sent.' : 'No active push subscription was found.',!!j.sent)
    }catch(e){status(e.message||'Could not send test notification.')}
  }
  async function refresh(){
    const b=$('#pushEnableBtn');if(!b)return;
    b.onclick=toggle;$('#pushTestBtn')?.addEventListener('click',test,{once:true});
    if(!supported())return status('Push notifications are not supported on this device.');
    if(/iPhone|iPad|iPod/.test(navigator.userAgent)&&!standalone())return status('Install Fortify to your Home Screen to enable iPhone push notifications.');
    const sub=await currentSub();b.textContent=sub?'Disable push':'Enable push';
    if(sub)status('Push is enabled on this device.',true);else status('Push is available. Tap Enable push to turn it on.');
  }
  window.FortifyPush={enable,disable,toggle,saveTime,test,refresh};
  window.addEventListener('fortifypluschange',()=>setTimeout(refresh,50));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(refresh,50)});
  setTimeout(refresh,250);
  if(new URLSearchParams(location.search).get('open')==='checkin'){setTimeout(()=>$('#checkinBtn')?.click(),600);history.replaceState({},'',location.pathname)}
})();
