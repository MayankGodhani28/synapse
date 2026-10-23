(function () {
  let client;
  async function init() {
    const response = await fetch('/auth/config');
    if (!response.ok) throw new Error('Supabase Auth is not configured');
    const { supabaseUrl, supabasePublishableKey } = await response.json();
    if (!window.supabase || !window.supabase.createClient) throw new Error('Supabase SDK failed to load');
    client = window.supabase.createClient(supabaseUrl, supabasePublishableKey, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
    });
    window.synapseSupabase = client;
    const { data } = await client.auth.getSession();
    await update(data.session);
    client.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => update(session), 0);
    });
    return client;
  }
  async function update(session) {
    if (session && session.access_token) {
      localStorage.setItem('synapse_token', session.access_token);
    } else {
      localStorage.removeItem('synapse_token');
    }
    window.dispatchEvent(new Event('synapse-auth-changed'));
  }
  window.synapseAuthReady = init().catch(err => {
    console.error('[synapse auth]', err);
    throw err;
  });
  window.synapseGoogleLogin = async () => {
    const sb = await window.synapseAuthReady;
    return sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/app' }
    });
  };
  window.synapseLogout = async () => {
    const sb = await window.synapseAuthReady;
    await sb.auth.signOut();
    localStorage.removeItem('synapse_token');
    window.location.assign('/app');
  };
}());
