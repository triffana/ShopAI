const http = require('http');
const https = require('https');
const fs = require('fs');

console.log('=== REAL RUNTIME VERIFICATION ===\n');

// 1. Check FALLBACK_PRODUCTS count
const productsContent = fs.readFileSync('./src/data/productsData.ts', 'utf8');
const ids = productsContent.match(/id:\s*'[^']+'/g) || [];
console.log('ACTUAL FINAL PRODUCT COUNT:', ids.length, ids.length >= 80 ? '✅ PASSED' : '❌ FAILED');

// 2. Check Luminous Foundation image URL status
const { FALLBACK_PRODUCTS } = require('./src/data/productsData.ts');
const luminous = FALLBACK_PRODUCTS.find(p => p.name.includes('Luminous Foundation'));
console.log('Luminous Foundation Image URL:', luminous ? luminous.image_url : 'NOT FOUND');

if (luminous && luminous.image_url) {
  https.get(luminous.image_url, (res) => {
    console.log('Luminous Foundation Image HTTP Status:', res.statusCode, res.statusCode === 200 ? '✅ 200 OK' : '❌ FAILED');
  }).on('error', e => console.error(e.message));
}

// 3. Test HTTP GET to running dev server at port 5176
http.get('http://localhost:5176/products', (res) => {
  console.log('Dev Server /products Status:', res.statusCode === 200 ? '✅ 200 OK (SERVER RUNNING)' : '❌ Error');
}).on('error', (err) => {
  console.error('Dev server connection error:', err.message);
});
