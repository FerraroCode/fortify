(() => {
  const MONTHLY_LINK = 'https://buy.stripe.com/test_28EcN5dpvg535Xv4SP0Ny00';
  const YEARLY_LINK = 'https://buy.stripe.com/test_4gM6oH5X3aKJ1Hf70X0Ny01';
  const PORTAL_LINK = 'https://billing.stripe.com/p/login/test_28EcN5dpvg535Xv4SP0Ny00';
  const $ = s => document.querySelector(s);
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
        return null;
      }
      if (!subscription) {
        setStatus('No Fortify+ subscription yet. Sandbox checkout is ready below.');
        if (plans) plans.hidden = false;
        if (manage) manage.hidden = true;
        return null;
      }
      const active = ['active','trialing'].includes(subscription.status);
      const label = subscription.status === 'trialing' ? '7-day trial active' : subscription.status === 'active' ? 'Fortify+ active' : `Status: ${subscription.status}`;
      const plan = subscription.plan ? ` · ${subscription.plan}` : '';
      setStatus(`${label}${plan}`, active);
      if (plans) plans.hidden = active;
      if (manage) manage.hidden = !active;
      return subscription;
    } catch (e) {
      setStatus(e.message || 'Could not load subscription status.');
      return null;
    }
  }

  if (monthlyBtn) monthlyBtn.onclick = () => startCheckout(MONTHLY_LINK);
  if (yearlyBtn) yearlyBtn.onclick = () => startCheckout(YEARLY_LINK);
  if (manageBtn) manageBtn.onclick = openPortal;

  async function init() {
    await refreshStatus();
  }

  cloud()?.client?.auth?.onAuthStateChange?.(() => setTimeout(refreshStatus, 100));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshStatus(); });
  window.addEventListener('pageshow', refreshStatus);
  init();
})();
