const { createClient } = require('@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function findExistingAdmins() {
  const testEmails = [
    'admin@shopai.com',
    'admin@shopai.io',
    'admin@shopai.dev',
    'admin@gmail.com',
    'shopai@admin.com',
    'admin@admin.com'
  ];
  const pass = 'AdminPassword123!';

  for (const email of testEmails) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (!error && data.user) {
      console.log(`FOUND EXISTING USER: ${email} -> ID: ${data.user.id}`);
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id);
      console.log('Profile:', p);
    }
  }
}

findExistingAdmins().catch(console.error);
