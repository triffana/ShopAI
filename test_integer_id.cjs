const { createClient } = require('@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function testIntegerId() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'admin@shopai.com',
    password: 'AdminPassword123!'
  });

  console.log('Logged in as:', authData.user.id);

  // Test inserting with explicit integer id 101
  const { data, error } = await supabase.from('products').insert({
    id: 101,
    name: 'Explicit ID 101 Product',
    brand: 'ShopAI',
    category_id: 1,
    price: 49.99,
    discount: 10,
    rating: 4.5,
    stock: 50,
    description: 'Test description',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  }).select();

  console.log('Insert result with explicit ID 101 data:', data);
  console.log('Insert result with explicit ID 101 error:', error);

  if (data && data.length > 0) {
    console.log('🎉 BINGO! EXPLICIT INTEGER ID WORKED!');
    // Delete test row
    await supabase.from('products').delete().eq('id', 101);
  }
}

testIntegerId().catch(console.error);
