'use client';

interface IncomeItem {
  label: string;
  amount: number;
  description?: string;
}

interface ExpenseItem {
  label: string;
  amount: number;
}

interface MonthlyCashflowCardProps {
  month: string; // e.g., "October 2024"
  income: IncomeItem[];
  expenses: ExpenseItem[];
  netCashflow: number;
}

const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function MonthlyCashflowCard({
  month,
  income,
  expenses,
  netCashflow,
}: MonthlyCashflowCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mx-auto max-w-sm">
      {/* Header */}
      <h2 className="text-xl font-bold text-center mb-4 text-gray-800">
        📅 {month}
      </h2>

      {/* INCOME Section */}
      {income.length > 0 && (
        <div className="mb-4">
          <h3 className="text-green-600 font-bold mb-2 text-base">💰 INCOME</h3>
          <div className="space-y-1">
            {income.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-start text-sm text-gray-800"
              >
                <span className="flex-1">
                  • {item.label}
                  {item.description && (
                    <span className="text-gray-500 ml-1">({item.description})</span>
                  )}
                </span>
                <span className="text-green-600 font-medium ml-2 whitespace-nowrap">
                  → {formatINR(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXPENSES Section */}
      {expenses.length > 0 && (
        <div className="mb-4">
          <h3 className="text-red-600 font-bold mb-2 text-base">💸 EXPENSES</h3>
          <div className="space-y-1">
            {expenses.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-start text-sm text-gray-800"
              >
                <span className="flex-1">• {item.label}</span>
                <span className="text-red-600 font-medium ml-2 whitespace-nowrap">
                  → {formatINR(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NET CASHFLOW */}
      <div className="pt-3 border-t border-gray-200 text-center">
        <div
          className={`text-lg font-bold ${
            netCashflow >= 0 ? 'text-green-700' : 'text-red-700'
          }`}
        >
          📊 NET CASHFLOW:{' '}
          <span className={netCashflow >= 0 ? 'text-green-700' : 'text-red-700'}>
            {netCashflow >= 0 ? '+' : ''}
            {formatINR(Math.abs(netCashflow))}
          </span>
        </div>
      </div>
    </div>
  );
}

