const { createClient } = require('@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function testNewAdminSignup() {
  const email = `admin_${Date.now()}@shopai.com`;
  const password = 'AdminPassword123!';

  console.log('Signing up new admin:', email);
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'ShopAI Admin User',
        role: 'admin'
      }
    }
  });

  if (signUpErr) {
    console.error('Signup error:', signUpErr);
    return;
  }

  console.log('Signed up user ID:', signUpData.user?.id);

  // Check profile created by trigger
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', signUpData.user.id).single();
  console.log('Profile created by trigger:', profile);

  // Now test product insert!
  const { data: pRes, error: pErr } = await supabase.from('products').insert({
    name: `New Admin Product ${Date.now()}`,
    brand: 'ShopAI',
    category_id: 1,
    price: 99.99,
    discount: 10,
    rating: 4.8,
    stock: 50,
    description: 'Test',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  }).select();

  console.log('Insert result data:', pRes);
  console.log('Insert result error:', pErr);
}

testNewAdminSignup().catch(console.error);
