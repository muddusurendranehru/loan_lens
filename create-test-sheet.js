const XLSX = require('xlsx');

// Sample HOMA Clinic transactions for March 2025
const testData = [
  // Headers
  ['Date', 'Description', 'Credit', 'Debit'],
  // Inflows
  ['2025-03-05', 'NEFT HOMA CLINIC REV', '250000', ''],
  ['2025-03-10', 'NEFT HOMA CLINIC REV', '150000', ''],
  ['2025-03-15', 'NEFT HOMA CLINIC REV', '125000', ''],
  ['2025-03-20', 'LOAN DISBURSEMENT HDFC', '2500000', ''],
  // Outflows
  ['2025-03-01', 'INT PAYMENT HDFC', '', '12500'],
  ['2025-03-01', 'RENT JAN 2025', '', '45000'],
  ['2025-03-05', 'SALARY JAN STAFF', '', '180000'],
  ['2025-03-05', 'EMI HDFC HL', '', '78200'],
  ['2025-03-10', 'ELECTRICITY BILL', '', '18000'],
  ['2025-03-15', 'VENDOR PAYMENT SUPPLIER', '', '44000'],
];

// Create workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(testData);

// Set column widths
ws['!cols'] = [
  { wch: 12 }, // Date
  { wch: 30 }, // Description
  { wch: 15 }, // Credit
  { wch: 15 }  // Debit
];

XLSX.utils.book_append_sheet(wb, ws, 'March 2025');
XLSX.writeFile(wb, 'test-homa-march-2025.xlsx');

console.log('✅ Test Excel file created: test-homa-march-2025.xlsx');
console.log('\nSample transactions:');
console.log('- Clinic Revenue: ₹2,50,000 + ₹1,50,000 + ₹1,25,000 = ₹5,25,000');
console.log('- Business Loan: ₹25,00,000');
console.log('- Salaries: ₹1,80,000');
console.log('- Rent: ₹45,000');
console.log('- EMI: ₹78,200');
console.log('- Vendor Payments: ₹18,000 + ₹44,000 = ₹62,000');
console.log('- Bank Interest: ₹12,500');
console.log('\nExpected EBITDA: ₹5,25,000 - (₹1,80,000 + ₹45,000 + ₹62,000) = ₹2,38,000');

