const { createClient } = require('@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function probeProfiles() {
  const candidates = ['id', 'email', 'full_name', 'avatar_url', 'role', 'created_at', 'updated_at'];
  for (const c of candidates) {
    const { error } = await supabase.from('profiles').select(c).limit(1);
    console.log(`Column profiles.${c}:`, error ? `NO (${error.message})` : 'YES');
  }
}

probeProfiles().catch(console.error);
