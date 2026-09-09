(() => {
  const KEY='fortify_mvp_v1';
  const PREF='fortify_plus_prefs_v1';
  const $=s=>document.querySelector(s);
  const today=()=>new Date().toISOString().slice(0,10);
  const parse=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
  const prefs=()=>{try{return JSON.parse(localStorage.getItem(PREF)||'{}')}catch{return {}}};
  const savePrefs=p=>localStorage.setItem(PREF,JSON.stringify(p));
  const daysAgo=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.toISOString().slice(0,10)};
  const active=()=>!!window.FORTIFY_PLUS_ACTIVE;

  const devotionals=[
    ['Discipline before desire','Freedom grows when the next right action matters more than the strongest current feeling. Ask God for strength for the next ten minutes, not the next ten years.','2 Timothy 1:7'],
    ['Guard the doorway','Most failures begin earlier than the final decision. Notice the first doorway: boredom, isolation, scrolling, fatigue, resentment. Close that doorway sooner.','Proverbs 4:23'],
    ['Replace, don’t only resist','A habit leaves a space when it is removed. Fill that space with prayer, movement, meaningful work, conversation, and rest.','Romans 12:2'],
    ['Grace with a plan','Grace is not permission to stay passive. Receive forgiveness, study the pattern, change the environment, and start again with a concrete plan.','1 John 1:9'],
    ['Train the mind','What you repeatedly focus on becomes easier to return to. Deliberately feed your mind what strengthens the person you want to become.','Philippians 4:8'],
    ['Bring it into the light','Secrecy strengthens compulsive habits. Safe, wise accountability weakens isolation and makes the next good choice easier.','James 5:16'],
    ['Win today','You do not need to solve your whole future tonight. Faithfulness today is enough. Stack one clean day onto another.','Matthew 6:34']
  ];

  function renderHistory(){
    const root=$('#plusHistory'); if(!root)return;
    const d=parse(), rel=(d.relapses||[]), urges=(d.urges||[]), checks=(d.checkins||[]);
    const windows=[30,60,90].map(days=>{
      const cut=daysAgo(days-1);
      const r=rel.filter(x=>x.date>=cut).length;
      const u=urges.filter(x=>x.date>=cut).length;
      const won=urges.filter(x=>x.date>=cut&&x.overcome).length;
      const c=checks.filter(x=>x.date>=cut).length;
      return {days,clean:Math.max(0,days-r),rate:Math.round(Math.max(0,days-r)/days*100),urges:u,won,checks:c};
    });
    root.innerHTML=windows.map(x=>`<div class="history-row"><div><b>${x.days} days</b><small>${x.checks} check-ins</small></div><div><b>${x.clean}</b><small>clean</small></div><div><b>${x.rate}%</b><small>victory</small></div><div><b>${x.won}/${x.urges}</b><small>urges won</small></div></div>`).join('');
  }

  function renderDevotional(){
    const root=$('#plusDevotional'); if(!root)return;
    const start=new Date(new Date().getFullYear(),0,0), diff=new Date()-start, day=Math.floor(diff/86400000);
    const x=devotionals[day%devotionals.length];
    root.innerHTML=`<div class="eyebrow">FORTIFY+ DEVOTIONAL</div><h3>${x[0]}</h3><p>${x[1]}</p><div class="ref">${x[2]}</div><textarea id="devotionalNote" rows="3" placeholder="What is one action you will take today?"></textarea><button class="primary compact" id="saveDevotionalNote">Save reflection</button>`;
    $('#saveDevotionalNote').onclick=()=>{
      if(!active())return;
      const text=$('#devotionalNote').value.trim(); if(!text)return;
      const d=parse(); d.journal=d.journal||[]; d.journal.push({date:today(),ts:Date.now(),text:`Devotional reflection — ${x[0]}\n${text}`}); localStorage.setItem(KEY,JSON.stringify(d));
      $('#devotionalNote').value=''; window.dispatchEvent(new Event('fortifydatachange'));
    };
  }

  function renderAccountability(){
    const p=prefs();
    if($('#accountabilityName')) $('#accountabilityName').value=p.accountabilityName||'';
    if($('#accountabilityContact')) $('#accountabilityContact').value=p.accountabilityContact||'';
    if($('#reminderTime')) $('#reminderTime').value=p.reminderTime||'21:00';
    const due=$('#reminderDue');
    if(due){
      const now=new Date(), hm=now.toTimeString().slice(0,5), last=p.lastReminderDate||'';
      due.hidden=!(active()&&p.reminderTime&&hm>=p.reminderTime&&last!==today());
    }
  }

  function bind(){
    $('#saveAccountability')?.addEventListener('click',()=>{
      if(!active())return;
      const p=prefs(); p.accountabilityName=$('#accountabilityName').value.trim();p.accountabilityContact=$('#accountabilityContact').value.trim();savePrefs(p);renderAccountability();
    });
    $('#copyCheckin')?.addEventListener('click',async()=>{
      if(!active())return;
      const d=parse(), streak=document.querySelector('#streakDays')?.textContent||'0';
      const msg=`Fortify check-in: ${streak} day streak. I’m staying intentional today. Please check in with me when you can.`;
      try{await navigator.clipboard.writeText(msg);alert('Check-in message copied.');}catch{prompt('Copy this message:',msg)}
    });
    $('#saveReminder')?.addEventListener('click',()=>{
      if(!active())return;
      const p=prefs();p.reminderTime=$('#reminderTime').value;p.lastReminderDate='';savePrefs(p);renderAccountability();
    });
    $('#markReminderDone')?.addEventListener('click',()=>{const p=prefs();p.lastReminderDate=today();savePrefs(p);renderAccountability()});
  }

  function refresh(){renderHistory();renderDevotional();renderAccountability()}
  window.addEventListener('fortifypluschange',refresh);
  window.addEventListener('fortifydatachange',refresh);
  window.addEventListener('storage',refresh);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
  bind();refresh();
})();
