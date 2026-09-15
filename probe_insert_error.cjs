const { createClient } = require('@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function probeInsertError() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'admin@shopai.com',
    password: 'AdminPassword123!'
  });

  console.log('Logged in user ID:', authData.user.id);
  console.log('User metadata role:', authData.user.user_metadata?.role);

  // Let's test updating user metadata to include role: 'admin'
  const { data: uData, error: uErr } = await supabase.auth.updateUser({
    data: { role: 'admin' }
  });
  console.log('Update user metadata:', uErr ? uErr.message : 'SUCCESS');

  // Let's try inserting into products
  const { data, error } = await supabase.from('products').insert({
    name: 'Diagnostic Test Product',
    brand: 'ShopAI',
    category_id: 1,
    price: 99.99,
    discount: 10,
    rating: 4.8,
    stock: 50,
    description: 'Test',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  }).select();

  console.log('Insert result:', data, error);
}

probeInsertError().catch(console.error);
