'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MetricCard from '@/components/MetricCard';

// Format Indian Rupees
const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface DailyData {
  date: string;
  income: number;
  expense: number;
}

interface Transaction {
  id: number;
  description: string;
  amount: number;
  flow_type: 'inflow' | 'outflow';
  txn_date: string;
  category: string;
  patient_name?: string;
}

export default function ModernDashboard() {
  const [report, setReport] = useState<any>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch current month report
      const now = new Date();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentYear = now.getFullYear();
      const financialYear = currentMonth >= '04' 
        ? `${currentYear}-${String(currentYear + 1).slice(-2)}`
        : `${currentYear - 1}-${String(currentYear).slice(-2)}`;

      const reportRes = await fetch(`/api/report/cashflow?financial_year=${financialYear}&month=${currentMonth}`);
      const reportData = await reportRes.json();

      if (reportData.success) {
        setReport(reportData);
        
        // Fetch daily data for bar chart
        fetchDailyData(currentMonth, currentYear);
        
        // Fetch recent transactions
        fetchRecentTransactions();
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyData = async (month: string, year: number) => {
    try {
      const res = await fetch(`/api/dashboard/daily?month=${month}&year=${year}`);
      const data = await res.json();
      if (data.success) {
        setDailyData(data.dailyData || []);
      }
    } catch (err) {
      console.error('Failed to fetch daily data:', err);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const res = await fetch('/api/dashboard/recent-transactions?limit=10');
      const data = await res.json();
      if (data.success) {
        setRecentTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  // Calculate metrics
  const netBalance = report?.summary?.net_balance || 0;
  const totalIncome = report?.summary?.total_inflow || 0;
  const totalExpense = report?.summary?.total_outflow || 0;

  // Calculate max value for bar chart scaling
  const maxValue = Math.max(
    ...dailyData.map(d => Math.max(d.income, d.expense)),
    1
  );

  // Filter transactions by search
  const filteredTransactions = recentTransactions.filter(txn =>
    txn.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate category breakdown for pie chart
  const incomeBreakdown = report?.income?.reduce((acc: any, item: any) => {
    acc[item.label] = item.amount;
    return acc;
  }, {}) || {};

  const expenseBreakdown = report?.expenses?.reduce((acc: any, item: any) => {
    acc[item.label] = item.amount;
    return acc;
  }, {}) || {};

  const totalForPie = Object.values(expenseBreakdown).reduce((sum: number, val: any) => sum + val, 0);

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="p-6 space-y-6">
        {/* Header with Search and Refresh */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, Dr. Nehru</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-6">
          <MetricCard
            title="Net Balance"
            value={formatINR(Math.abs(netBalance))}
            icon="💰"
            color={netBalance >= 0 ? 'green' : 'yellow'}
          />
          <MetricCard
            title="Total Income"
            value={formatINR(totalIncome)}
            icon="📈"
            color="yellow"
          />
          <MetricCard
            title="Upgrade to Pro"
            value="Get Insights"
            icon="⭐"
            color="purple"
            onClick={() => alert('Upgrade feature coming soon!')}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="col-span-2 space-y-6">
            {/* Bar Chart - Daily Income/Expenses */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Daily Cashflow - Current Month</h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Expenses</span>
                  </div>
                </div>
              </div>
              <div className="h-64 flex items-end justify-between gap-2">
                {dailyData.length > 0 ? (
                  dailyData.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col justify-end h-full gap-1">
                        {day.income > 0 && (
                          <div
                            className="bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer"
                            style={{ height: `${(day.income / maxValue) * 100}%` }}
                            title={`Income: ${formatINR(day.income)}`}
                          />
                        )}
                        {day.expense > 0 && (
                          <div
                            className="bg-red-500 rounded-t hover:bg-red-600 transition-colors cursor-pointer"
                            style={{ height: `${(day.expense / maxValue) * 100}%` }}
                            title={`Expense: ${formatINR(day.expense)}`}
                          />
                        )}
                      </div>
                      <span className="text-xs text-gray-500 mt-2">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center text-gray-400 py-12">
                    No data available for this month
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((txn) => (
                        <tr key={txn.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{txn.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {txn.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(txn.txn_date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className={`px-4 py-3 text-sm font-medium text-right ${
                            txn.flow_type === 'inflow' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {txn.flow_type === 'inflow' ? '+' : '-'}{formatINR(txn.amount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              txn.flow_type === 'inflow'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {txn.flow_type === 'inflow' ? 'Income' : 'Expense'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Monthly Profits Pie Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Expenses</h2>
              {totalForPie > 0 ? (
                <div className="space-y-4">
                  {/* Simple CSS Pie Chart Representation */}
                  <div className="flex flex-col gap-3">
                    {Object.entries(expenseBreakdown).map(([label, amount]: [string, any]) => {
                      const percentage = ((amount / totalForPie) * 100).toFixed(1);
                      const colors = [
                        'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 
                        'bg-yellow-500', 'bg-indigo-500', 'bg-red-500'
                      ];
                      const colorIndex = Object.keys(expenseBreakdown).indexOf(label) % colors.length;
                      return (
                        <div key={label} className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${colors[colorIndex]}`}></div>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">{label}</span>
                              <span className="font-medium text-gray-900">{percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className={`${colors[colorIndex]} h-2 rounded-full`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">{formatINR(amount)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">No expense data available</div>
              )}
            </div>

            {/* Recent Sales/Income List */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Income</h2>
              <div className="space-y-3">
                {report?.income && report.income.length > 0 ? (
                  report.income.slice(0, 5).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                        {item.label.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description || 'Income'}</div>
                      </div>
                      <div className="text-sm font-bold text-green-600">
                        {formatINR(item.amount)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">No income data available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

