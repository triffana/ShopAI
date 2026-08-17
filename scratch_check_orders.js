const { createClient } = require('./node_modules/@supabase/supabase-js');

const url = 'https://jkdexnctchzprkbdbsnq.supabase.co';
const key = 'sb_publishable_WC5vC3p-iaYxNvef8dpgXQ_kNKTed-9';

const supabase = createClient(url, key);

async function checkOrders() {
  console.log('Testing orders select...');
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  console.log('Select result data:', data);
  console.log('Select result error:', error);

  console.log('Testing orders insert with payment_method...');
  const testInsert = await supabase.from('orders').insert({
    total_amount: 10,
    shipping_address: { test: true },
    payment_method: 'credit_card',
    status: 'pending'
  });
  console.log('Insert with payment_method:', testInsert.error);

  console.log('Testing orders insert WITHOUT payment_method...');
  const testInsertNoPayment = await supabase.from('orders').insert({
    total_amount: 10,
    shipping_address: { test: true },
    status: 'pending'
  });
  console.log('Insert without payment_method:', testInsertNoPayment.error);
}

checkOrders();
