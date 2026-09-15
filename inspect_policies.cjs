const { createClient } = require('@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function inspectPolicies() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'admin@shopai.com',
    password: 'AdminPassword123!'
  });

  console.log('Logged in user ID:', authData.user.id);

  // Test selecting profiles for authData.user.id
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', authData.user.id);
  console.log('Profile for user:', profile);

  // Let's test if we can update products or delete products
  const { data: prod } = await supabase.from('products').select('*').limit(1);
  console.log('First product:', prod[0]);

  if (prod.length > 0) {
    const updateRes = await supabase.from('products').update({ stock: prod[0].stock }).eq('id', prod[0].id).select();
    console.log('Update product result:', updateRes.error ? updateErr.message : updateRes.data);
  }
}

inspectPolicies().catch(console.error);
