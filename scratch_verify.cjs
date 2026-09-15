const http = require('http');
const fs = require('fs');

console.log('=== SHOPAI VERIFICATION SUITE ===\n');

// 1. Check FALLBACK_PRODUCTS count and validity
const productsContent = fs.readFileSync('./src/data/productsData.ts', 'utf8');
const ids = productsContent.match(/id:\s*'[^']+'/g) || [];
const count = ids.length;
console.log('1. Product Data Catalog Count:', count, count >= 80 ? '✅ PASSED' : '❌ FAILED');

// 2. Check Logo.tsx circular style implementation
const logoContent = fs.readFileSync('./src/components/common/Logo.tsx', 'utf8');
const isCircular = logoContent.includes("borderRadius: '50%'") && logoContent.includes("overflow: 'hidden'");
console.log('2. Navbar Logo Circular Implementation:', isCircular ? '✅ PASSED' : '❌ FAILED');

// 3. Check ProductImage component fallback logic
const imageContent = fs.readFileSync('./src/components/common/ProductImage.tsx', 'utf8');
const hasFallback = imageContent.includes('handleError') && imageContent.includes('SVG_FALLBACK_PRODUCT');
console.log('3. Product Image Fallback System:', hasFallback ? '✅ PASSED' : '❌ FAILED');

// 4. Test HTTP connection to running dev server
http.get('http://localhost:5174/', (res) => {
  console.log('4. Running Web Server Status:', res.statusCode === 200 ? '✅ 200 OK (SERVER RUNNING)' : '❌ Server Error');
  console.log('\n=== VERIFICATION COMPLETE ===');
}).on('error', (err) => {
  console.error('4. Web Server Error:', err.message);
});
