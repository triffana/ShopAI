const { createClient } = require('@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function testFreshLoginInsert() {
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@shopai.com',
    password: 'AdminPassword123!'
  });

  if (authErr) {
    console.error('Login error:', authErr);
    return;
  }

  console.log('Logged in freshly as user:', authData.user.id);

  // Test insert product row
  const { data: pRes, error: pErr } = await supabase.from('products').insert({
    name: 'Fresh Login Product Test',
    brand: 'ShopAI',
    category_id: 1,
    price: 49.99,
    discount: 10,
    rating: 4.5,
    stock: 50,
    description: 'Test description',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  }).select();

  console.log('Product insert result data:', pRes);
  console.log('Product insert result error:', pErr);

  if (pRes && pRes.length > 0) {
    console.log('🎉 INSERT SUCCESSFUL! Deleting test product...');
    await supabase.from('products').delete().eq('id', pRes[0].id);
    console.log('Cleaned up test product.');
  }
}

testFreshLoginInsert().catch(console.error);
