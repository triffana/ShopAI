const { createClient } = require('@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function testVariations() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'admin@shopai.com',
    password: 'AdminPassword123!'
  });

  // Try category_id null
  const res1 = await supabase.from('products').insert({
    name: 'Var Test 1',
    price: 10
  }).select();
  console.log('Var 1 (minimal):', res1.error ? res1.error.message : res1.data);

  // Try with user_id if column exists?
  const res2 = await supabase.from('products').insert({
    name: 'Var Test 2',
    price: 10,
    user_id: authData.user.id
  }).select();
  console.log('Var 2 (with user_id):', res2.error ? res2.error.message : res2.data);
}

testVariations().catch(console.error);
