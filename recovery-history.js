(() => {
  const KEY='fortify_mvp_v1';
  const $=s=>document.querySelector(s);
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=ts=>{try{return new Date(ts).toLocaleString(undefined,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'})}catch{return ''}};

  function completed(r){return !!(r.leadup||r.recoveryPlan||r.nextAction||r.prayer||r.lesson)}

  function item(r){
    const done=completed(r), trigger=esc(r.trigger||'Other'), when=esc(fmt(r.ts)), lead=esc(r.leadup||''), plan=esc(r.recoveryPlan||''), next=esc(r.nextAction||''), prayer=esc(r.prayer||'');
    return `<details class="recovery-history-item"><summary><div><span class="recovery-date">${when}</span><b>${trigger}</b></div><span class="recovery-status ${done?'complete':'pending'}">${done?'Recovery completed':'Finish later'}</span></summary><div class="recovery-history-body">${done?`${lead?`<div><small>What was happening before</small><p>${lead}</p></div>`:''}${plan?`<div><small>Environment change</small><p>${plan}</p></div>`:''}${next?`<div><small>Next action</small><p>${next}</p></div>`:''}${prayer?`<div><small>Prayer / reflection</small><p>${prayer}</p></div>`:''}`:`<p class="muted">This slip was recorded, but the recovery reflection was not completed.</p>`}</div></details>`;
  }

  function render(){
    const root=$('#recoveryHistory'); if(!root)return;
    const rel=[...(read().relapses||[])].sort((a,b)=>(b.ts||0)-(a.ts||0));
    if(!rel.length){root.innerHTML='<div class="recovery-empty"><b>No recovery entries yet.</b><span>Your history will appear here after a slip so you can learn from patterns without losing sight of your progress.</span></div>';return;}
    root.innerHTML=rel.map(item).join('');
  }

  window.addEventListener('storage',render);
  window.addEventListener('focus',render);
  window.addEventListener('fortifypluschange',render);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')render()});
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="progress"]'))setTimeout(render,0)});
  setInterval(render,5000);
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',render):render();
  window.FortifyRecoveryHistory={render};
})();