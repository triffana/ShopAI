const { createClient } = require('@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function checkRpc() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'admin@shopai.com',
    password: 'AdminPassword123!'
  });

  console.log('Logged in as:', authData.user.id);

  // Test inserting with supabase client directly
  const { data, error } = await supabase.from('products').insert([{
    name: 'RPC Test Product',
    description: 'Test',
    price: 29.99,
    discount: 0,
    rating: 4.5,
    stock: 10,
    brand: 'ShopAI',
    category_id: 1,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  }]).select();

  console.log('Insert res:', data, error);
}

checkRpc().catch(console.error);
