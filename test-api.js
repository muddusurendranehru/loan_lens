// Dry run test script for LoanLens Pro APIs
// Run: node test-api.js

const fs = require('fs');
const path = require('path');

console.log('🧪 LoanLens Pro API - Dry Run Test\n');
console.log('=' .repeat(50));

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env.local not found');
  console.log('   Please create .env.local with DATABASE_URL');
} else {
  console.log('✅ .env.local exists');
}

// Check package.json
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log('✅ package.json found');
  console.log(`   Dependencies: ${Object.keys(pkg.dependencies || {}).length} packages`);
  
  // Check key dependencies
  const keyDeps = ['@neondatabase/serverless', 'xlsx', 'next'];
  keyDeps.forEach(dep => {
    if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
      console.log(`   ✅ ${dep} installed`);
    } else {
      console.log(`   ❌ ${dep} NOT installed`);
    }
  });
} else {
  console.log('❌ package.json not found');
}

// Check API routes
console.log('\n📁 API Routes:');
const apiRoutes = [
  'src/app/api/parse/upload/route.ts',
  'src/app/api/report/cashflow/route.ts'
];

apiRoutes.forEach(route => {
  const routePath = path.join(__dirname, route);
  if (fs.existsSync(routePath)) {
    console.log(`   ✅ ${route}`);
  } else {
    console.log(`   ❌ ${route} NOT found`);
  }
});

// Check schema
console.log('\n📊 Database Schema:');
const schemaPath = path.join(__dirname, 'src/lib/schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  if (schema.includes('cashflow_entries')) {
    console.log('   ✅ cashflow_entries table defined');
  } else {
    console.log('   ❌ cashflow_entries table NOT found in schema');
  }
  
  if (schema.includes('ON CONFLICT')) {
    console.log('   ✅ ON CONFLICT clause present');
  }
} else {
  console.log('   ❌ schema.sql not found');
}

console.log('\n' + '='.repeat(50));
console.log('\n📝 Next Steps:');
console.log('1. Start server: npm run dev');
console.log('2. Test upload: POST http://localhost:3000/api/parse/upload');
console.log('3. Test report: GET http://localhost:3000/api/report/cashflow?financial_year=2024-25');
console.log('\n✅ Dry run check complete!\n');

