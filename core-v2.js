(() => {
  if (window.__FORTIFY_CORE_V2) return;
  window.__FORTIFY_CORE_V2 = true;
  const STORAGE='fortify_mvp_v1';
  const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
  const dateToday=()=>new Date().toISOString().slice(0,10);
  const parse=()=>{try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{return {}}};
  const dateDiff=(a,b)=>Math.floor((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000);
  const cutoff=days=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-(days-1));return d.toISOString().slice(0,10)};

  function current(d){
    const t=dateToday(), rel=[...(d.relapses||[])].filter(x=>x.date&&x.date<=t).sort((a,b)=>a.date.localeCompare(b.date));
    if(rel.length) return Math.max(0,dateDiff(rel[rel.length-1].date,t));
    return Math.max(1,dateDiff(d.startDate||t,t)+1);
  }
  function longest(d){
    const t=dateToday(), start=d.startDate||t, rel=[...(d.relapses||[])].filter(x=>x.date&&x.date>=start&&x.date<=t).sort((a,b)=>a.date.localeCompare(b.date));
    if(!rel.length) return Math.max(1,dateDiff(start,t)+1,d.longest||0);
    let best=Math.max(0,dateDiff(start,rel[0].date));
    for(let i=1;i<rel.length;i++) best=Math.max(best,dateDiff(rel[i-1].date,rel[i].date)-1);
    best=Math.max(best,dateDiff(rel[rel.length-1].date,t));
    return Math.max(best,d.longest||0);
  }
  function recorded(d,days){
    const cut=cutoff(days), map=new Map();
    (d.checkins||[]).filter(x=>x.date>=cut&&x.date<=dateToday()).forEach(x=>map.set(x.date,{clean:!!x.clean,source:'checkin'}));
    (d.relapses||[]).filter(x=>x.date>=cut&&x.date<=dateToday()).forEach(x=>map.set(x.date,{clean:false,source:'relapse'}));
    const vals=[...map.values()], clean=vals.filter(x=>x.clean).length;
    return {recorded:vals.length,clean,rate:vals.length?Math.round(clean/vals.length*100):null};
  }
  function urgeStats(d,days){const cut=cutoff(days),u=(d.urges||[]).filter(x=>x.date>=cut&&x.date<=dateToday());return {total:u.length,won:u.filter(x=>x.overcome).length}}

  function refreshMetrics(){
    const d=parse(), s=current(d), l=longest(d), m30=recorded(d,30), w=recorded(d,7);
    if(q('#streakDays')) q('#streakDays').textContent=s;
    if(q('#longestStreak')) q('#longestStreak').textContent=l;
    if(q('#pCurrent')) q('#pCurrent').textContent=s;
    if(q('#pLongest')) q('#pLongest').textContent=l;
    if(q('#pClean')) q('#pClean').textContent=m30.clean;
    if(q('#successRate')) q('#successRate').textContent=m30.rate===null?'—':m30.rate+'%';
    const rateLabel=q('.hero .muted.center'); if(rateLabel) rateLabel.textContent=m30.recorded?`30-day recorded victory rate · ${m30.recorded} day${m30.recorded===1?'':'s'} logged`:'Complete a check-in to start your 30-day rate';
    if(q('#weekClean')) q('#weekClean').textContent=w.clean;
    const pCleanSmall=q('#pClean')?.parentElement?.querySelector('small');if(pCleanSmall)pCleanSmall.textContent=m30.recorded?`${m30.recorded} recorded days`:'no days logged yet';
    try{if(l>(d.longest||0)){d.longest=l;localStorage.setItem(STORAGE,JSON.stringify(d));data.longest=l}}catch{}
    renderMilestone(s);
    renderPremiumHistory(d);
  }

  function renderMilestone(s){
    const home=q('#homeView'), hero=home?.querySelector('.hero'); if(!home||!hero)return;
    let card=q('#milestoneCard'); if(!card){card=document.createElement('div');card.id='milestoneCard';card.className='milestone-strip';hero.insertAdjacentElement('afterend',card)}
    const marks=[1,3,7,14,30,60,90,180,365], next=marks.find(x=>x>s)||Math.ceil((s+1)/365)*365, remain=Math.max(0,next-s);
    card.innerHTML=`<div><span>NEXT MILESTONE</span><b>${next} ${next===1?'day':'days'}</b></div><div class="milestone-right"><b>${remain}</b><small>${remain===1?'day':'days'} to go</small></div>`;
  }

  function renderPremiumHistory(d){
    const root=q('#plusHistory');if(!root)return;
    root.innerHTML=[30,60,90].map(days=>{const r=recorded(d,days),u=urgeStats(d,days);return `<div class="history-row"><div><b>${days} days</b><small>${r.recorded} recorded</small></div><div><b>${r.clean}</b><small>clean</small></div><div><b>${r.rate===null?'—':r.rate+'%'}</b><small>recorded rate</small></div><div><b>${u.won}/${u.total}</b><small>urges won</small></div></div>`}).join('');
  }

  function openCheckin(){
    if(typeof show!=='function')return;
    show(`<div class="eyebrow">DAILY CHECK-IN</div><h2>Take an honest look at today.</h2><p class="muted">This is information, not a grade.</p><label>How are you feeling?</label><div class="check-pills" id="moodPills">${[['1','Rough'],['2','Low'],['3','Okay'],['4','Good'],['5','Strong']].map(([v,t])=>`<button type="button" data-mood-v2="${v}" class="${v==='3'?'selected':''}">${t}</button>`).join('')}</div><label>How strong was temptation today? <b id="temptValueV2">4/10</b></label><input id="temptV2" type="range" min="0" max="10" value="4"><label>Were you porn-free today?</label><div class="check-pills two" id="cleanPills"><button type="button" data-clean-v2="yes" class="selected">Yes</button><button type="button" data-clean-v2="no">No</button></div><label>Biggest trigger today <span class="muted">(optional)</span></label><div class="check-pills wrap" id="triggerPillsV2">${['Boredom','Stress','Social media','Being alone','Anger','Sexual content','Habit','Can’t sleep'].map(x=>`<button type="button" data-trigger-v2="${x}">${x}</button>`).join('')}</div><label>One win from today <span class="muted">(optional)</span></label><input id="winV2" maxlength="120" placeholder="I walked away, prayed, stayed busy..."><label>Anything else? <span class="muted">(optional)</span></label><textarea id="noteV2" rows="3" placeholder="A short note for your future self"></textarea><button class="gold" id="saveCheckV2">Complete check-in</button><button class="close-link" id="flowClose">Cancel</button>`);
    let mood=3,clean=true,trigger='';
    qa('[data-mood-v2]').forEach(b=>b.onclick=()=>{mood=+b.dataset.moodV2;qa('[data-mood-v2]').forEach(x=>x.classList.toggle('selected',x===b))});
    qa('[data-clean-v2]').forEach(b=>b.onclick=()=>{clean=b.dataset.cleanV2==='yes';qa('[data-clean-v2]').forEach(x=>x.classList.toggle('selected',x===b))});
    qa('[data-trigger-v2]').forEach(b=>b.onclick=()=>{trigger=b.dataset.triggerV2;qa('[data-trigger-v2]').forEach(x=>x.classList.toggle('selected',x===b))});
    q('#temptV2').oninput=e=>q('#temptValueV2').textContent=e.target.value+'/10';
    q('#saveCheckV2').onclick=()=>saveCheckin({mood,clean,trigger,temptation:+q('#temptV2').value,win:q('#winV2').value.trim(),note:q('#noteV2').value.trim()});
  }

  function saveCheckin(entry){
    const d=parse(), stamp=Date.now(), t=dateToday();
    d.checkins=(d.checkins||[]).filter(x=>x.date!==t);
    d.checkins.push({date:t,ts:stamp,mood:entry.mood,temptation:entry.temptation,clean:entry.clean,trigger:entry.trigger,win:entry.win,note:entry.note});
    localStorage.setItem(STORAGE,JSON.stringify(d));
    try{data=d;render()}catch{}
    refreshMetrics();
    if(!entry.clean){try{relapse(entry.trigger||'Daily check-in')}catch{location.reload()}return}
    const s=current(d), marks=[1,3,7,14,30,60,90,180,365], hit=marks.includes(s);
    if(typeof show==='function')show(`<div class="check-complete"><div class="checkmark-big">✓</div><div class="eyebrow">CHECK-IN COMPLETE</div><h2>${hit?`${s}-day milestone.`:'Day recorded.'}</h2><p>${entry.win?`Today’s win: <b>${escapeHtml(entry.win)}</b>`:'Keep stacking honest days and good decisions.'}</p><div class="mini-stat"><span>Current streak</span><b>${s} ${s===1?'day':'days'}</b></div><button class="gold" id="finishCheckV2">Back to Fortify</button></div>`);
    q('#finishCheckV2').onclick=()=>{try{dlg.close()}catch{};refreshMetrics()};
    try{window.FortifyCloud?.pushLocal?.()}catch{}
  }
  function escapeHtml(v=''){return v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  function bind(){
    const btn=q('#checkinBtn');if(btn)btn.onclick=openCheckin;
    refreshMetrics();
    window.addEventListener('storage',refreshMetrics);
    window.addEventListener('fortifypluschange',()=>setTimeout(refreshMetrics,0));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refreshMetrics()});
    const obs=new MutationObserver(()=>{if(q('#plusHistory')&&!q('#plusHistory').dataset.v2){q('#plusHistory').dataset.v2='1';refreshMetrics()}});obs.observe(document.body,{childList:true,subtree:true});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind):bind();
  window.FortifyMetrics={refresh:refreshMetrics,current:()=>current(parse()),recorded:days=>recorded(parse(),days)};
})();