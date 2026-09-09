(() => {
  if (window.__FORTIFY_RECOVERY_LOADED) return;
  window.__FORTIFY_RECOVERY_LOADED = true;

  const KEY='fortify_mvp_v1';
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const today=()=>new Date().toISOString().slice(0,10);
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
  const write=d=>{localStorage.setItem(KEY,JSON.stringify(d));window.dispatchEvent(new Event('storage'))};

  function style(){
    if($('#recoveryStyles'))return;
    const s=document.createElement('style');s.id='recoveryStyles';s.textContent=`
      .recovery-progress{display:flex;gap:6px;margin:15px 0 24px}.recovery-progress i{height:4px;flex:1;border-radius:99px;background:var(--line)}.recovery-progress i.on{background:var(--gold)}
      .recovery-choice{width:100%;text-align:left;padding:14px 15px;border:1px solid var(--line);border-radius:14px;background:#202328;color:var(--text);font-weight:700}.recovery-choice.selected{border-color:var(--gold);background:#211c10;color:var(--gold2)}
      .recovery-grid{display:grid;gap:9px;margin:16px 0}.recovery-note{padding:14px;border-radius:14px;background:#101214;border:1px solid var(--line);color:var(--muted);line-height:1.45}.recovery-summary{display:grid;gap:10px;margin:18px 0}.recovery-summary div{padding:13px;border-radius:13px;background:#101214;border:1px solid var(--line)}.recovery-summary small,.recovery-summary b{display:block}.recovery-summary small{color:var(--muted);margin-bottom:4px}.recovery-finish{text-align:center}.recovery-finish .onboard-mark{margin:0 auto 18px}.recovery-prayer{font-family:Georgia,serif;font-size:18px;line-height:1.55;padding:18px;border-left:3px solid var(--gold);background:#101214;text-align:left;margin:17px 0}
    `;document.head.appendChild(s);
  }

  const progress=n=>`<div class="recovery-progress">${[1,2,3,4,5].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</div>`;
  function show(html){const dlg=$('#flowDialog'),fc=$('#flowContent');if(!dlg||!fc)return;fc.innerHTML=`<div class="flow">${html}</div>`;if(!dlg.open)dlg.showModal();$('#flowClose')?.addEventListener('click',()=>dlg.close(),{once:true})}

  function begin(trigger='Other'){
    style();
    const state={trigger:trigger||'Other',leadup:'',change:'',action:'',prayer:''};
    step1(state);
  }
  function step1(s){
    const opts=['Boredom','Stress','Social media','Being alone','Anger','Sexual content','Habit','Can’t sleep','Other'];
    show(`${progress(1)}<div class="eyebrow">RECOVERY · 1 OF 5</div><h2>What pulled you toward it?</h2><p class="muted">Name the pattern without beating yourself up. The goal is to learn from it.</p><div class="recovery-grid">${opts.map(x=>`<button class="recovery-choice ${x===s.trigger?'selected':''}" data-rtrigger="${esc(x)}">${esc(x)}</button>`).join('')}</div><button class="primary" id="recoveryNext1">Continue</button><button class="close-link" id="flowClose">Finish later</button>`);
    $$('[data-rtrigger]').forEach(b=>b.onclick=()=>{s.trigger=b.dataset.rtrigger;$$('[data-rtrigger]').forEach(x=>x.classList.toggle('selected',x===b))});
    $('#recoveryNext1').onclick=()=>step2(s);
  }
  function step2(s){
    show(`${progress(2)}<div class="eyebrow">RECOVERY · 2 OF 5</div><h2>What happened before the slip?</h2><p class="muted">Think about the 15–30 minutes leading up to it. Where were you? What were you feeling or doing?</p><textarea id="recoveryLeadup" rows="5" placeholder="Example: I was alone, tired, scrolling in bed...">${esc(s.leadup)}</textarea><button class="primary" id="recoveryNext2">Continue</button><button class="close-link" id="recoveryBack2">Back</button>`);
    $('#recoveryNext2').onclick=()=>{s.leadup=$('#recoveryLeadup').value.trim();step3(s)};$('#recoveryBack2').onclick=()=>{s.leadup=$('#recoveryLeadup').value.trim();step1(s)};
  }
  function step3(s){
    const opts=['Keep my phone out of the bedroom','Get around another person','Stop scrolling when I notice the trigger','Go to bed earlier','Use Quick Reset immediately','Text my accountability partner','Pray and leave the room','Something else'];
    show(`${progress(3)}<div class="eyebrow">RECOVERY · 3 OF 5</div><h2>Change one part of the pattern.</h2><p class="muted">Pick something concrete enough that you can actually do it next time.</p><div class="recovery-grid">${opts.map(x=>`<button class="recovery-choice ${x===s.change?'selected':''}" data-rchange="${esc(x)}">${esc(x)}</button>`).join('')}</div><textarea id="customChange" rows="3" placeholder="Optional: make the plan more specific">${s.change==='Something else'?'':esc(s.changeDetail||'')}</textarea><button class="primary" id="recoveryNext3">Continue</button><button class="close-link" id="recoveryBack3">Back</button>`);
    $$('[data-rchange]').forEach(b=>b.onclick=()=>{s.change=b.dataset.rchange;$$('[data-rchange]').forEach(x=>x.classList.toggle('selected',x===b))});
    $('#recoveryNext3').onclick=()=>{s.changeDetail=$('#customChange').value.trim();if(!s.change)s.change='Use Quick Reset immediately';step4(s)};$('#recoveryBack3').onclick=()=>step2(s);
  }
  function step4(s){
    const opts=['Take a walk','Pray for 2 minutes','Put my phone in another room','Do a workout or pushups','Take a shower','Text someone I trust','Read scripture','Go be around people'];
    show(`${progress(4)}<div class="eyebrow">RECOVERY · 4 OF 5</div><h2>What will you do right now?</h2><p class="muted">The next 10 minutes matter more than replaying what happened.</p><div class="recovery-grid">${opts.map(x=>`<button class="recovery-choice ${x===s.action?'selected':''}" data-raction="${esc(x)}">${esc(x)}</button>`).join('')}</div><button class="primary" id="recoveryNext4">Continue</button><button class="close-link" id="recoveryBack4">Back</button>`);
    $$('[data-raction]').forEach(b=>b.onclick=()=>{s.action=b.dataset.raction;$$('[data-raction]').forEach(x=>x.classList.toggle('selected',x===b))});
    $('#recoveryNext4').onclick=()=>{if(!s.action)s.action='Pray for 2 minutes';step5(s)};$('#recoveryBack4').onclick=()=>step3(s);
  }
  function step5(s){
    show(`${progress(5)}<div class="eyebrow">RECOVERY · 5 OF 5</div><h2>Bring the next step to God.</h2><div class="recovery-prayer">God, I don’t want to hide from this moment. Give me wisdom to learn from it, strength to change what needs changing, and grace to make the next right decision. Help me walk in honesty, discipline, and freedom. Amen.</div><label>Optional personal prayer or reflection</label><textarea id="recoveryPrayer" rows="4" placeholder="Write your own words here..."></textarea><button class="gold" id="completeRecovery">Reset and begin again</button><button class="close-link" id="recoveryBack5">Back</button>`);
    $('#completeRecovery').onclick=()=>{s.prayer=$('#recoveryPrayer').value.trim();complete(s)};$('#recoveryBack5').onclick=()=>step4(s);
  }
  function complete(s){
    const d=read();d.relapses=d.relapses||[];const already=d.relapses.find(x=>x.date===today());const lesson=[s.leadup?`Lead-up: ${s.leadup}`:'',`Plan: ${s.change}${s.changeDetail?' — '+s.changeDetail:''}`,`Next action: ${s.action}`,s.prayer?`Prayer/reflection: ${s.prayer}`:''].filter(Boolean).join('\n');
    if(already){already.trigger=s.trigger;already.lesson=lesson;already.recoveryPlan=s.change;already.nextAction=s.action;already.prayer=s.prayer;already.ts=already.ts||Date.now()}else d.relapses.push({date:today(),ts:Date.now(),trigger:s.trigger,lesson,recoveryPlan:s.change,nextAction:s.action,prayer:s.prayer});
    d.startDate=today();write(d);
    show(`<div class="recovery-finish"><div class="onboard-mark">✓</div><div class="eyebrow">RESET COMPLETE</div><h2>Your next decision starts now.</h2><p>A slip is information, not permission to keep going. You identified the pattern and made a plan.</p><div class="recovery-summary"><div><small>TRIGGER</small><b>${esc(s.trigger)}</b></div><div><small>NEXT-TIME PLAN</small><b>${esc(s.change)}${s.changeDetail?' — '+esc(s.changeDetail):''}</b></div><div><small>RIGHT NOW</small><b>${esc(s.action)}</b></div></div><button class="gold" id="finishRecovery">Do my next action</button></div>`);
    $('#finishRecovery').onclick=()=>{const dlg=$('#flowDialog');dlg?.close();location.reload()};
  }

  window.relapse=begin;
  window.FortifyRecovery={begin};
})();