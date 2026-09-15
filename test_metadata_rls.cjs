const { createClient } = require('@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function testMetadataRls() {
  // Sign in as admin
  const { data: authData, error: lErr } = await supabase.auth.signInWithPassword({
    email: 'admin@shopai.com',
    password: 'AdminPassword123!'
  });

  if (lErr) {
    console.error('Login error:', lErr);
    return;
  }

  console.log('Logged in user:', authData.user.id);

  // Update user metadata
  const { data: uData, error: uErr } = await supabase.auth.updateUser({
    data: {
      role: 'admin',
      is_admin: true
    }
  });

  if (uErr) {
    console.error('Update user error:', uErr);
  } else {
    console.log('User metadata updated:', uData.user.user_metadata);
  }

  // Refresh session
  const { data: refreshData } = await supabase.auth.refreshSession();
  console.log('Refreshed session token present:', !!refreshData?.session?.access_token);

  // Try insert product
  const { data: pRes, error: pErr } = await supabase.from('products').insert({
    name: 'Metadata Test Product 999',
    brand: 'ShopAI',
    category_id: 1,
    price: 89.99,
    discount: 10,
    rating: 4.8,
    stock: 50,
    description: 'Test',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  }).select();

  console.log('Product insert result data:', pRes);
  console.log('Product insert result error:', pErr);
}

testMetadataRls().catch(console.error);
