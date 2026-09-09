(() => {
  const $ = s => document.querySelector(s);
  const cloud = () => window.FortifyCloud;
  const status = $('#accountStatus');
  const email = $('#accountEmail');
  const password = $('#accountPassword');
  const signUp = $('#signUpBtn');
  const signIn = $('#signInBtn');
  const signOut = $('#signOutBtn');
  const syncBtn = $('#syncBtn');
  const form = $('#accountForm');
  const signedInBox = $('#signedInBox');
  const accountEmailText = $('#accountEmailText');

  if (!form || !cloud()?.enabled) {
    if (status) status.textContent = 'Cloud accounts are unavailable right now.';
    return;
  }

  const msg = (text, isError=false) => {
    status.textContent = text;
    status.style.color = isError ? '#ff8e8e' : '';
  };

  async function refresh() {
    try {
      const s = await cloud().session();
      const signedIn = !!s;
      form.hidden = signedIn;
      signedInBox.hidden = !signedIn;
      if (signedIn) {
        accountEmailText.textContent = s.user.email || 'Signed in';
        msg('Cloud backup is on.');
      } else {
        msg('Create an account to back up your Fortify progress.');
      }
    } catch (e) {
      msg(e.message || 'Could not check account status.', true);
    }
  }

  signUp.onclick = async () => {
    const e = email.value.trim();
    const p = password.value;
    if (!e || p.length < 6) return msg('Use a valid email and a password with at least 6 characters.', true);
    signUp.disabled = signIn.disabled = true;
    msg('Creating account...');
    try {
      const d = await cloud().signUp(e, p);
      if (d.session) {
        await cloud().pushLocal();
        msg('Account created. Your existing Fortify data is backed up.');
      } else {
        msg('Account created. Check your email to confirm it, then sign in.');
      }
      await refresh();
    } catch (err) {
      msg(err.message || 'Could not create account.', true);
    } finally {
      signUp.disabled = signIn.disabled = false;
    }
  };

  signIn.onclick = async () => {
    const e = email.value.trim();
    const p = password.value;
    if (!e || !p) return msg('Enter your email and password.', true);
    signUp.disabled = signIn.disabled = true;
    msg('Signing in and syncing...');
    try {
      const { data: authData, error: authError } = await cloud().client.auth.signInWithPassword({ email:e, password:p });
      if (authError) throw authError;
      const uid = authData.user.id;
      const { data: profile, error: profileError } = await cloud().client.from('profiles').select('reason').eq('id',uid).maybeSingle();
      if (profileError) throw profileError;
      if (profile?.reason) {
        await cloud().pullCloud();
      } else {
        await cloud().pushLocal();
        await cloud().pullCloud();
      }
      msg('Signed in. Cloud backup is on.');
      await refresh();
      location.reload();
    } catch (err) {
      msg(err.message || 'Could not sign in.', true);
    } finally {
      signUp.disabled = signIn.disabled = false;
    }
  };

  signOut.onclick = async () => {
    try {
      await cloud().signOut();
      msg('Signed out. Your local Fortify data stays on this phone.');
      await refresh();
    } catch (err) {
      msg(err.message || 'Could not sign out.', true);
    }
  };

  syncBtn.onclick = async () => {
    syncBtn.disabled = true;
    msg('Syncing...');
    try {
      await cloud().sync();
      msg('Cloud backup is up to date.');
      location.reload();
    } catch (err) {
      msg(err.message || 'Sync failed.', true);
    } finally {
      syncBtn.disabled = false;
    }
  };

  async function autoBackup() {
    try {
      if (await cloud().session()) await cloud().pushLocal();
    } catch (e) {
      console.error('Fortify cloud backup failed', e);
    }
  }

  setInterval(autoBackup, 15000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') autoBackup(); });
  window.addEventListener('pagehide', autoBackup);
  cloud().client.auth.onAuthStateChange(() => setTimeout(refresh, 0));
  refresh();
})();