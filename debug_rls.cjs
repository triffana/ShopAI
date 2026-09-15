const { createClient } = require('@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function debugRLS() {
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@shopai.com',
    password: 'AdminPassword123!'
  });

  if (authErr) {
    console.error('Auth error:', authErr);
    return;
  }

  console.log('Logged in user ID:', authData.user.id);
  console.log('JWT access token:', authData.session.access_token);

  // Check what profiles table has for this user
  const { data: profileData, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id);

  console.log('Profile query result:', profileData, profileErr);

  // Check user metadata
  console.log('User metadata:', authData.user.user_metadata);

  // Let's test inserting a product row
  const { data: pData, error: pErr } = await supabase.from('products').insert({
    name: 'Debug RLS Product Test',
    brand: 'Debug',
    category_id: 1,
    price: 19.99,
    discount: 0,
    rating: 4.5,
    stock: 10,
    description: 'Test product for debug',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  }).select();

  console.log('Insert test result:', pData, pErr);
}

debugRLS().catch(console.error);
