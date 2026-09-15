const { createClient } = require('@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function probeRLS() {
  const email = 'admin@shopai.com';
  const password = 'AdminPassword123!';

  const { data: authData } = await supabase.auth.signInWithPassword({ email, password });
  console.log('JWT auth token present:', !!authData?.session?.access_token);

  // Read profile
  const { data: profile, error: pErr } = await supabase.from('profiles').select('*').eq('id', authData.user.id);
  console.log('Profile select result:', profile, pErr);

  // Try insert product with authenticated client
  const client = createClient(url, key, {
    global: {
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`
      }
    }
  });

  const { data: insData, error: insErr } = await client.from('products').insert({
    name: 'Admin Product Test 2',
    brand: 'TestBrand',
    category_id: 1,
    price: 49.99,
    discount: 5,
    rating: 4.5,
    stock: 20,
    description: 'Test',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  }).select();

  console.log('Insert with auth header data:', insData);
  console.log('Insert with auth header error:', insErr);
}

probeRLS().catch(console.error);
