const { createClient } = require('@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function testProfilesRLS() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'admin@shopai.com',
    password: 'AdminPassword123!'
  });

  console.log('Logged in as:', authData.user.id);
  const { data, error } = await supabase.from('profiles').select('*');
  console.log('Profiles read result count:', data ? data.length : 0);
  console.log('Profiles read error:', error);
}

testProfilesRLS().catch(console.error);
