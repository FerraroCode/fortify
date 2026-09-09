(() => {
  const MONTHLY_LINK = 'https://buy.stripe.com/test_28EcN5dpvg535Xv4SP0Ny00';
  const YEARLY_LINK = 'https://buy.stripe.com/test_4gM6oH5X3aKJ1Hf70X0Ny01';
  const PORTAL_LINK = 'https://billing.stripe.com/p/login/test_28EcN5dpvg535Xv4SP0Ny00';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const cloud = () => window.FortifyCloud;
  const statusEl = $('#plusStatus');
  const monthlyBtn = $('#upgradeBtn');
  const yearlyBtn = $('#upgradeYearBtn');
  const manageBtn = $('#managePlusBtn');
  const plans = $('#plusPlans');
  const manage = $('#plusManage');

  function setStatus(text, good=false) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.classList.toggle('plus-active', good);
  }

  function openUpgrade() {
    if (typeof window.nav === 'function') window.nav('profile');
    else {
      $$('.view').forEach(x=>x.classList.remove('active'));
      $('#profileView')?.classList.add('active');
    }
    setTimeout(() => $('#plusCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function applyEntitlements(active) {
    window.FORTIFY_PLUS_ACTIVE = !!active;
    document.body.classList.toggle('fortify-plus-active', !!active);
    $$('[data-plus-feature]').forEach(el => {
      el.classList.toggle('plus-locked', !active);
      el.classList.toggle('plus-unlocked', !!active);
      if (!active) {
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', `${el.dataset.plusFeature || 'Premium feature'} requires Fortify+`);
        el.onclick = openUpgrade;
        el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openUpgrade(); } };
      } else {
        el.removeAttribute('role');
        el.removeAttribute('tabindex');
        el.removeAttribute('aria-label');
        el.onclick = null;
        el.onkeydown = null;
      }
    });
    window.dispatchEvent(new CustomEvent('fortifypluschange',{detail:{active:!!active}}));
  }

  function loadExtra(src,attr,onload){
    if(document.querySelector(`script[${attr}]`)){onload?.();return;}
    const s=document.createElement('script');s.src=src;s.setAttribute(attr,'1');if(onload)s.onload=onload;document.body.appendChild(s);
  }
  function loadPremiumTools(){
    loadExtra('premium.js','data-fortify-premium',()=>{
      applyEntitlements(!!window.FORTIFY_PLUS_ACTIVE);
      loadExtra('push.js','data-fortify-push',()=>window.FortifyPush?.refresh?.());
    });
  }

  async function getSession() {
    if (!cloud()?.enabled) return null;
    return (await cloud().session()) || null;
  }

  async function getSubscription() {
    const s = await getSession();
    if (!s) return { session: null, subscription: null };
    const { data, error } = await cloud().client.from('subscriptions').select('*').eq('user_id', s.user.id).maybeSingle();
    if (error) throw error;
    return { session: s, subscription: data };
  }

  function checkoutUrl(base, userId) {
    const u = new URL(base);
    u.searchParams.set('client_reference_id', userId);
    return u.toString();
  }

  async function startCheckout(base) {
    try {
      const s = await getSession();
      if (!s) {
        setStatus('Sign in or create a Fortify account before starting Fortify+.');
        $('#accountEmail')?.focus();
        return;
      }
      location.href = checkoutUrl(base, s.user.id);
    } catch (e) { setStatus(e.message || 'Could not start checkout.'); }
  }

  async function openPortal() {
    try {
      const s = await getSession();
      if (!s) return setStatus('Sign in to manage Fortify+.');
      const u = new URL(PORTAL_LINK);
      if (s.user.email) u.searchParams.set('prefilled_email', s.user.email);
      location.href = u.toString();
    } catch (e) { setStatus(e.message || 'Could not open subscription management.'); }
  }

  async function refreshStatus() {
    try {
      const { session, subscription } = await getSubscription();
      if (!session) {
        setStatus('Sign in to start or view your Fortify+ subscription.');
        if (plans) plans.hidden = false;
        if (manage) manage.hidden = true;
        applyEntitlements(false);
        return null;
      }
      if (!subscription) {
        setStatus('No Fortify+ subscription yet. Sandbox checkout is ready below.');
        if (plans) plans.hidden = false;
        if (manage) manage.hidden = true;
        applyEntitlements(false);
        return null;
      }
      const active = ['active','trialing'].includes(subscription.status);
      const label = subscription.status === 'trialing' ? '7-day trial active' : subscription.status === 'active' ? 'Fortify+ active' : `Status: ${subscription.status}`;
      const plan = subscription.plan ? ` · ${subscription.plan}` : '';
      setStatus(`${label}${plan}${active ? ' · premium features unlocked' : ''}`, active);
      if (plans) plans.hidden = active;
      if (manage) manage.hidden = !active;
      applyEntitlements(active);
      return subscription;
    } catch (e) {
      setStatus(e.message || 'Could not load subscription status.');
      applyEntitlements(false);
      return null;
    }
  }

  if (monthlyBtn) monthlyBtn.onclick = () => startCheckout(MONTHLY_LINK);
  if (yearlyBtn) yearlyBtn.onclick = () => startCheckout(YEARLY_LINK);
  if (manageBtn) manageBtn.onclick = openPortal;

  async function init() {
    applyEntitlements(false);
    loadPremiumTools();
    await refreshStatus();
  }

  cloud()?.client?.auth?.onAuthStateChange?.(() => setTimeout(refreshStatus, 100));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshStatus(); });
  window.addEventListener('pageshow', refreshStatus);
  init();
})();
