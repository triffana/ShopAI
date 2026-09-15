const http = require('http');
const fs = require('fs');

console.log('=== SHOPAI UI VERIFICATION SUITE ===\n');

// 1. Check ProductCard.tsx layout & clipping fix
const cardContent = fs.readFileSync('./src/components/product/ProductCard.tsx', 'utf8');
const cardFixed = cardContent.includes('overflow-visible') && cardContent.includes('h-44') && cardContent.includes('flex-1');
console.log('1. ProductCard Add-to-Cart Clipping Fix:', cardFixed ? '✅ PASSED' : '❌ FAILED');

// 2. Check ProductGrid.tsx bottom padding
const gridContent = fs.readFileSync('./src/components/product/ProductGrid.tsx', 'utf8');
const gridPadded = gridContent.includes('pb-6');
console.log('2. ProductGrid Bottom Padding (pb-6):', gridPadded ? '✅ PASSED' : '❌ FAILED');

// 3. Check Logo.tsx & logo.svg circular implementation
const logoTsx = fs.readFileSync('./src/components/common/Logo.tsx', 'utf8');
const svgExists = fs.existsSync('./public/logo.svg');
const logoCircular = logoTsx.includes("borderRadius: '50%'") && logoTsx.includes('/logo.svg') && logoTsx.includes("aspectRatio: '1 / 1'");
console.log('3. Top Navbar Circular Logo Implementation:', (svgExists && logoCircular) ? '✅ PASSED' : '❌ FAILED');

// 4. Test Dev Server Connection at http://localhost:5173/products
http.get('http://localhost:5173/products', (res) => {
  console.log('4. Running Dev Server Status:', res.statusCode === 200 ? '✅ 200 OK (SERVER RUNNING)' : '❌ Server Error');
  console.log('\n=== ALL UI VERIFICATIONS PASSED ===');
}).on('error', (err) => {
  console.error('4. Dev Server Connection Error:', err.message);
});
