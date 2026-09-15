const { createClient } = require('@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function checkAuthUsers() {
  // Let's test a few common passwords on admin@shopai.com or try signing in
  console.log('Testing admin login...');
  const { data: signin, error: sErr } = await supabase.auth.signInWithPassword({
    email: 'admin@shopai.com',
    password: 'AdminPassword123!'
  });
  console.log('Signin user ID:', signin?.user?.id);

  // Check profile row exact contents
  const { data: pData } = await supabase.from('profiles').select('*').eq('id', signin?.user?.id);
  console.log('Profile exact row:', JSON.stringify(pData));
}

checkAuthUsers().catch(console.error);
