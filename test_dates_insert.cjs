const { createClient } = require('@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function testDatesInsert() {
  const { data: authData, error: lErr } = await supabase.auth.signInWithPassword({
    email: 'admin@shopai.com',
    password: 'AdminPassword123!'
  });

  if (lErr) {
    console.error('Login error:', lErr);
    return;
  }

  console.log('Login success user:', authData.user.id);

  const payload = {
    name: 'Dates Insert Test Product',
    brand: 'ShopAI',
    category_id: 1,
    price: 99.99,
    discount: 10,
    rating: 4.8,
    stock: 50,
    description: 'Test description',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('products').insert(payload).select();
  console.log('Insert with created_at data:', data);
  console.log('Insert with created_at error:', error);
}

testDatesInsert().catch(console.error);
