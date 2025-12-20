'use client';

import MonthlyCashflowCard from '@/components/MonthlyCashflowCard';

export default function TestCashflowCard() {
  // Example data matching the requirements
  const testData = {
    month: 'October 2024',
    income: [
      { label: 'Business Loan', amount: 200000, description: 'L&T Finance' },
      { label: 'Clinic Income', amount: 19800, description: 'Anjani Foods' },
      { label: 'Other Income', amount: 2437286, description: 'RTGS from HDFC' },
    ],
    expenses: [
      { label: 'EMI', amount: 188522 },
      { label: 'Vendor Payments', amount: 437512.70 },
      { label: 'Tax', amount: 43950 },
    ],
    netCashflow: 1432062.47,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <MonthlyCashflowCard {...testData} />
    </div>
  );
}

