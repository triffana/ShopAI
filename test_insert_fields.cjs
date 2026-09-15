const { createClient } = require('@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function testInsertFields() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'admin@shopai.com',
    password: 'AdminPassword123!'
  });

  console.log('Logged in user:', authData.user.id);

  // Test 1: plain fields
  const test1 = await supabase.from('products').insert({
    name: 'Test Product 1',
    description: 'Desc',
    price: 10,
    stock: 5,
    rating: 4.5,
    discount: 0,
    brand: 'Brand',
    category_id: 1,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  }).select();
  console.log('Test 1 (plain):', test1.error ? test1.error.message : test1.data);

  // Test 2: with slug
  const test2 = await supabase.from('products').insert({
    name: 'Test Product 2',
    slug: 'test-product-2',
    description: 'Desc',
    price: 10,
    stock: 5,
    rating: 4.5,
    discount: 0,
    brand: 'Brand',
    category_id: 1,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  }).select();
  console.log('Test 2 (with slug):', test2.error ? test2.error.message : test2.data);
}

testInsertFields().catch(console.error);
