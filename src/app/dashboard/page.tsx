'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';

type Transaction = {
  date: string;
  amount: number;
  type: 'inflow' | 'outflow';
  category: string;
  description: string;
  rawRow?: number;
  financial_year: string;
};

type MonthSummary = {
  month: string;
  year: number;
  month_num: number;
  financial_year: string;
  total_inflow: number;
  total_outflow: number;
  net_balance: number;
  inflow_count: number;
  outflow_count: number;
};

type SavedTransaction = {
  id: number;
  txn_date: string;
  amount: number;
  type: 'inflow' | 'outflow';
  category: string;
  description: string;
  financial_year: string;
};

const CATEGORIES = {
  inflow: [
    { id: 'clinic_revenue', label: 'Clinic Revenue (HOMA)' },
    { id: 'other_income', label: 'Other Income' },
    { id: 'business_loan', label: 'Business Loan' },
  ],
  outflow: [
    { id: 'salaries', label: 'Salaries' },
    { id: 'rent', label: 'Rent' },
    { id: 'vendor_payment', label: 'Vendor Payment' },
    { id: 'emi_interest', label: 'EMI Interest' },
    { id: 'emi_principal', label: 'EMI Principal' },
    { id: 'bank_interest', label: 'Bank Interest' },
    { id: 'personal', label: 'Personal' },
  ],
};

// Helper to split EMI into principal and interest (user can do this manually)
const splitEMI = (totalEMI: number, interestPortion: number = 0.3) => {
  const interest = totalEMI * interestPortion;
  const principal = totalEMI - interest;
  return { interest, principal };
};

// Format amount in Indian Rupees
const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [sheetUrl, setSheetUrl] = useState('');
  const [accountType, setAccountType] = useState<'savings' | 'current'>('savings');
  const [monthName, setMonthName] = useState('');
  const [inflows, setInflows] = useState<Transaction[]>([]);
  const [outflows, setOutflows] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ totalInflow: 0, totalOutflow: 0, netBalance: 0 });
  const [ebitdaData, setEbitdaData] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'ready' | 'saving'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [savedMonths, setSavedMonths] = useState<MonthSummary[]>([]);
  const [txnsByMonth, setTxnsByMonth] = useState<Record<string, SavedTransaction[]>>({});
  const [totals, setTotals] = useState({ total_inflow: 0, total_outflow: 0, net_balance: 0, total_transactions: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch saved data
  const fetchSavedData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/months');
      const data = await res.json();
      if (data.success) {
        setSavedMonths(data.summary || []);
        setTxnsByMonth(data.txnsByMonth || {});
        setTotals(data.totals || { total_inflow: 0, total_outflow: 0, net_balance: 0, total_transactions: 0 });
      }
      
      // Fetch EBITDA data for current month
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const ebitdaRes = await fetch(`/api/dashboard/monthly?month=${month}&year=${year}`);
      const ebitdaData = await ebitdaRes.json();
      if (ebitdaData.success) {
        setEbitdaData(ebitdaData.summary);
        // Set month name from current date
        setMonthName(now.toLocaleString('en-IN', { month: 'long', year: 'numeric' }));
      }
    } catch (err) {
      console.error('Failed to fetch saved data:', err);
    }
  }, []);

  useEffect(() => {
    fetchSavedData();
  }, [fetchSavedData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setSheetUrl('');
  };

  const handleUpload = async () => {
    if (!file && !sheetUrl.trim()) {
      setError('Please enter a Google Sheet URL or upload a file.');
      return;
    }

    if (!accountType) {
      setError('Please select account type (Savings or Current).');
      return;
    }

    setError(null);
    setStatus('uploading');

    const formData = new FormData();
    formData.append('accountType', accountType);
    if (file) {
      formData.append('file', file);
    } else if (sheetUrl) {
      formData.append('sheetUrl', sheetUrl);
    }

    try {
      const res = await fetch('/api/parse/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process sheet');
      }

      if ((data.transactions && data.transactions.length > 0) || (data.emis && data.emis.length > 0)) {
        // Get month from first transaction or EMI
        const firstTxn = data.transactions?.[0] || data.emis?.[0];
        if (firstTxn) {
          const firstDate = new Date(firstTxn.date);
          const month = firstDate.toLocaleString('en-IN', {
            month: 'long',
            year: 'numeric',
          });
          setMonthName(month);
        }
        setInflows(data.inflows || []);
        setOutflows(data.outflows || []);
        setSummary(data.summary || { totalInflow: 0, totalOutflow: 0, netBalance: 0 });
        setStatus('ready');
      } else {
        setError('No transactions found matching thresholds (Inflow ≥ ₹50,000 or Outflow ≥ ₹15,000, EMI ₹16,000-₹1,87,000).');
        setStatus('idle');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      setStatus('idle');
    }
  };

  const updateCategory = (type: 'inflow' | 'outflow', index: number, category: string) => {
    if (type === 'inflow') {
      setInflows(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], category };
        return updated;
      });
    } else {
      setOutflows(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], category };
        return updated;
      });
    }
  };

  const removeTransaction = (type: 'inflow' | 'outflow', index: number) => {
    if (type === 'inflow') {
      setInflows(prev => prev.filter((_, i) => i !== index));
      setSummary(prev => {
        const removed = inflows[index].amount;
        return {
          ...prev,
          totalInflow: prev.totalInflow - removed,
          netBalance: prev.netBalance - removed,
        };
      });
    } else {
      setOutflows(prev => prev.filter((_, i) => i !== index));
      setSummary(prev => {
        const removed = outflows[index].amount;
        return {
          ...prev,
          totalOutflow: prev.totalOutflow - removed,
          netBalance: prev.netBalance + removed,
        };
      });
    }
  };

  const handleSaveAll = async () => {
    const allTransactions = [...inflows, ...outflows].map(txn => ({
      ...txn,
      account_type: accountType  // Add account_type to each transaction
    }));

    if (allTransactions.length === 0) {
      alert('No transactions to save.');
      return;
    }

    setStatus('saving');

    try {
      const res = await fetch('/api/parse/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: allTransactions,
          sheetName: monthName || 'Uploaded Sheet',
        }),
      });

      if (res.ok) {
        const result = await res.json();
        alert(`✅ Saved ${result.saved} transaction(s)! (${result.skipped} duplicates skipped)`);
        // Reset
        setSheetUrl('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setInflows([]);
        setOutflows([]);
        setSummary({ totalInflow: 0, totalOutflow: 0, netBalance: 0 });
        setStatus('idle');
        fetchSavedData();
      } else {
        throw new Error('Save failed');
      }
    } catch {
      alert('Failed to save. Please try again.');
      setStatus('ready');
    }
  };

  const resetUpload = () => {
    setStatus('idle');
    setInflows([]);
    setOutflows([]);
    setSummary({ totalInflow: 0, totalOutflow: 0, netBalance: 0 });
    setFile(null);
    setSheetUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">LoanLens Pro</h1>
          <p className="text-gray-500 text-xs">Business Cashflow Tracker</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 border rounded"
        >
          Logout
        </button>
      </div>

      {/* Monthly EBITDA Card */}
      {ebitdaData && (
        <div className="bg-white rounded-xl p-5 shadow-lg mb-4 border-2 border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">📅 {monthName || 'Current Month'} — HOMA Clinic</h2>
          </div>

          {/* INCOME Section */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-green-700 mb-2">💰 INCOME</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">• Clinic Revenue:</span>
                <span className="font-bold text-green-700">{formatINR(ebitdaData.revenue.clinic_revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">• Other Income:</span>
                <span className="font-bold text-green-700">{formatINR(ebitdaData.revenue.other_income)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="font-semibold text-gray-800">→ Total Income:</span>
                <span className="font-bold text-green-700">{formatINR(ebitdaData.revenue.total)}</span>
              </div>
            </div>
          </div>

          {/* EXPENSES Section */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-red-700 mb-2">💸 EXPENSES</h3>
            <div className="space-y-1 text-sm">
              {ebitdaData.expenses.salaries > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">• Salaries:</span>
                  <span className="font-bold text-red-700">{formatINR(ebitdaData.expenses.salaries)}</span>
                </div>
              )}
              {ebitdaData.expenses.rent > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">• Rent:</span>
                  <span className="font-bold text-red-700">{formatINR(ebitdaData.expenses.rent)}</span>
                </div>
              )}
              {ebitdaData.expenses.vendor_payment > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">• Vendor Payments:</span>
                  <span className="font-bold text-red-700">{formatINR(ebitdaData.expenses.vendor_payment)}</span>
                </div>
              )}
              {ebitdaData.interest.emi_interest > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">• EMI Interest:</span>
                  <span className="font-bold text-red-700">{formatINR(ebitdaData.interest.emi_interest)}</span>
                </div>
              )}
              {ebitdaData.interest.bank_interest > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">• Bank Interest:</span>
                  <span className="font-bold text-red-700">{formatINR(ebitdaData.interest.bank_interest)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="font-semibold text-gray-800">→ Total Expenses:</span>
                <span className="font-bold text-red-700">
                  {formatINR(ebitdaData.expenses.total_operating + ebitdaData.interest.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="space-y-3">
            {/* EBITDA */}
            <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">📊 EBITDA</p>
              <p className={`text-2xl font-bold ${ebitdaData.metrics.ebitda >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                {formatINR(ebitdaData.metrics.ebitda)}
              </p>
            </div>

            {/* Net Cashflow (after principal) */}
            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">📊 Net Cashflow</p>
              <p className={`text-xl font-bold ${(ebitdaData.metrics.net_cashflow_after_principal || ebitdaData.metrics.net_cashflow) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {(ebitdaData.metrics.net_cashflow_after_principal || ebitdaData.metrics.net_cashflow) >= 0 ? '' : '-'}
                {formatINR(Math.abs(ebitdaData.metrics.net_cashflow_after_principal || ebitdaData.metrics.net_cashflow))}
                {ebitdaData.loans.emi_principal > 0 && (
                  <span className="text-xs text-gray-500 block mt-1">(after principal)</span>
                )}
              </p>
            </div>

            {/* New Loans Info */}
            {ebitdaData.loans.new_loans > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-sm text-gray-700 text-center">
                  🔁 New Loans: <span className="font-bold text-yellow-700">{formatINR(ebitdaData.loans.new_loans)}</span>
                  {ebitdaData.loans.total_emi > 0 && (
                    <span> → used to fund EMI</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {totals.total_transactions > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-xs text-green-600">Total Inflow</p>
            <p className="text-sm font-bold text-green-700">{formatINR(Number(totals.total_inflow))}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-xs text-red-600">Total Outflow</p>
            <p className="text-sm font-bold text-red-700">{formatINR(Number(totals.total_outflow))}</p>
          </div>
          <div className={`${Number(totals.net_balance) >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-3 text-center`}>
            <p className="text-xs text-gray-600">Net Balance</p>
            <p className={`text-sm font-bold ${Number(totals.net_balance) >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatINR(Number(totals.net_balance))}
            </p>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      {status === 'idle' && (
        <div className="bg-white rounded-xl p-4 shadow mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">📤 Upload Bank Statement</h2>
          
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Account Type *</label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as 'savings' | 'current')}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              required
            >
              <option value="">Select Account Type</option>
              <option value="savings">Savings Account</option>
              <option value="current">Current Account</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Google Sheet URL</label>
            <input
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
          </div>

          <div className="text-center my-2 text-gray-400 text-sm">— OR —</div>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Upload Excel/CSV</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-gray-600 text-sm"
            >
              {file ? `📄 ${file.name}` : '📁 Choose File'}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}

          <button
            onClick={handleUpload}
            disabled={status === 'uploading'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {status === 'uploading' ? '🔍 Scanning...' : '🔍 Scan for Transactions'}
          </button>

          <p className="text-xs text-gray-400 text-center mt-2">
            Detects: Inflows ≥ ₹50,000 | Outflows ≥ ₹15,000
          </p>
        </div>
      )}

      {/* Results Card */}
      {status === 'ready' && (
        <div className="bg-white rounded-xl p-5 shadow-lg mb-4 border-2 border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-xl text-gray-800">📅 {monthName}</h2>
            <button onClick={resetUpload} className="text-gray-400 hover:text-gray-600 text-sm">✕ Cancel</button>
          </div>

          {/* Inflows Section */}
          {inflows.length > 0 && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-green-700 text-lg">💰 INFLOWS</h3>
                <span className="text-sm font-bold text-green-700">Total: {formatINR(summary.totalInflow)}</span>
              </div>
              <div className="space-y-2">
                {inflows.map((txn, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-green-50 rounded-lg p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        • {txn.category === 'clinic_revenue' ? 'Clinic Revenue' : 
                           txn.category === 'other_income' ? 'Other Income' :
                           txn.category === 'business_loan' ? 'Business Loan' : txn.category}: {formatINR(txn.amount)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{txn.description || 'No description'}</p>
                    </div>
                    <select
                      value={txn.category}
                      onChange={(e) => updateCategory('inflow', idx, e.target.value)}
                      className="ml-2 p-1 text-xs border rounded bg-white"
                    >
                      {CATEGORIES.inflow.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                    <button onClick={() => removeTransaction('inflow', idx)} className="ml-2 text-red-400 text-sm">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outflows Section */}
          {outflows.length > 0 && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-red-700 text-lg">💸 OUTFLOWS</h3>
                <span className="text-sm font-bold text-red-700">Total: {formatINR(summary.totalOutflow)}</span>
              </div>
              <div className="space-y-2">
                {outflows.map((txn, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-red-50 rounded-lg p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        • {txn.category === 'salaries' ? 'Salaries' :
                           txn.category === 'rent' ? 'Rent' :
                           txn.category === 'vendor_payment' ? 'Vendor Payment' :
                           txn.category === 'emi_interest' ? 'EMI Interest' :
                           txn.category === 'emi_principal' ? 'EMI Principal' :
                           txn.category === 'bank_interest' ? 'Bank Interest' :
                           txn.category === 'personal' ? 'Personal' : txn.category}: {formatINR(txn.amount)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{txn.description || 'No description'}</p>
                    </div>
                    <select
                      value={txn.category}
                      onChange={(e) => updateCategory('outflow', idx, e.target.value)}
                      className="ml-2 p-1 text-xs border rounded bg-white"
                    >
                      {CATEGORIES.outflow.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                    <button onClick={() => removeTransaction('outflow', idx)} className="ml-2 text-red-400 text-sm">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Net Balance */}
          <div className="mb-4">
            <div className={`${summary.netBalance >= 0 ? 'bg-blue-100 border-blue-300' : 'bg-orange-100 border-orange-300'} border-2 rounded-lg p-4 text-center`}>
              <p className="text-sm text-gray-600 mb-1">📊 NET BALANCE</p>
              <p className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                {summary.netBalance >= 0 ? '+' : ''}{formatINR(summary.netBalance)}
              </p>
            </div>
          </div>

          {/* Inflows */}
          {inflows.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-green-700 mb-2">💰 INFLOWS ({inflows.length})</p>
              <div className="space-y-2">
                {inflows.map((txn, idx) => (
                  <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">{txn.date}</p>
                        <p className="font-bold text-green-700">{formatINR(txn.amount)}</p>
                        <p className="text-xs text-gray-600 truncate">{txn.description || 'No description'}</p>
                      </div>
                      <button onClick={() => removeTransaction('inflow', idx)} className="text-red-400 text-sm ml-2">✕</button>
                    </div>
                    <select
                      value={txn.category}
                      onChange={(e) => updateCategory('inflow', idx, e.target.value)}
                      className="mt-2 w-full p-2 text-xs border rounded bg-white"
                    >
                      {CATEGORIES.inflow.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outflows */}
          {outflows.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-red-700 mb-2">💸 OUTFLOWS ({outflows.length})</p>
              <div className="space-y-2">
                {outflows.map((txn, idx) => (
                  <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">{txn.date}</p>
                        <p className="font-bold text-red-700">{formatINR(txn.amount)}</p>
                        <p className="text-xs text-gray-600 truncate">{txn.description || 'No description'}</p>
                      </div>
                      <button onClick={() => removeTransaction('outflow', idx)} className="text-red-400 text-sm ml-2">✕</button>
                    </div>
                    <select
                      value={txn.category}
                      onChange={(e) => updateCategory('outflow', idx, e.target.value)}
                      className="mt-2 w-full p-2 text-xs border rounded bg-white"
                    >
                      {CATEGORIES.outflow.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSaveAll}
            disabled={status === 'saving'}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold disabled:opacity-50"
          >
            {status === 'saving' ? '💾 Saving...' : '💾 SAVE ALL'}
          </button>
        </div>
      )}

      {/* Saved Months */}
      {savedMonths.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700">📊 Saved Months</h2>
          {savedMonths.map((month, idx) => {
            const monthKey = `${month.month.trim()} ${month.year}`;
            const txns = txnsByMonth[monthKey] || [];
            const monthInflows = txns.filter(t => t.type === 'inflow');
            const monthOutflows = txns.filter(t => t.type === 'outflow');

            return (
              <div key={idx} className="bg-white rounded-xl p-4 shadow">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">{monthKey}</h3>
                    <p className="text-xs text-gray-500">FY {month.financial_year}</p>
                  </div>
                  <div className={`text-right ${Number(month.net_balance) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    <p className="text-xs">Net Balance</p>
                    <p className="font-bold">{formatINR(Number(month.net_balance))}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-green-50 rounded p-2">
                    <p className="text-xs text-green-600">Inflows ({month.inflow_count})</p>
                    <p className="font-semibold text-green-700">{formatINR(Number(month.total_inflow))}</p>
                  </div>
                  <div className="bg-red-50 rounded p-2">
                    <p className="text-xs text-red-600">Outflows ({month.outflow_count})</p>
                    <p className="font-semibold text-red-700">{formatINR(Number(month.total_outflow))}</p>
                  </div>
                </div>

                {/* Transaction details */}
                {monthInflows.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-green-700 font-semibold mb-2">💰 INFLOWS:</p>
                    {monthInflows.map(t => {
                      const categoryLabel = t.category === 'clinic_revenue' ? 'Clinic Revenue' : 
                                          t.category === 'other_income' ? 'Other Income' :
                                          t.category === 'business_loan' ? 'Business Loan' : t.category;
                      return (
                        <div key={t.id} className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                          <span className="text-gray-700">• {categoryLabel}</span>
                          <span className="text-green-700 font-medium">{formatINR(Number(t.amount))}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {monthOutflows.length > 0 && (
                  <div>
                    <p className="text-sm text-red-700 font-semibold mb-2">💸 OUTFLOWS:</p>
                    {monthOutflows.map(t => {
                      const categoryLabel = t.category === 'salaries' ? 'Salaries' :
                                          t.category === 'rent' ? 'Rent' :
                                          t.category === 'vendor_payment' ? 'Vendor Payment' :
                                          t.category === 'emi_interest' ? 'EMI Interest' :
                                          t.category === 'emi_principal' ? 'EMI Principal' :
                                          t.category === 'bank_interest' ? 'Bank Interest' :
                                          t.category === 'personal' ? 'Personal' : t.category;
                      return (
                        <div key={t.id} className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                          <span className="text-gray-700">• {categoryLabel}</span>
                          <span className="text-red-700 font-medium">{formatINR(Number(t.amount))}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {savedMonths.length === 0 && status === 'idle' && (
        <div className="text-center text-gray-400 text-sm mt-8 p-6 bg-white rounded-xl">
          <p className="text-2xl mb-2">📊</p>
          <p>No transactions saved yet.</p>
          <p>Upload a bank statement to get started.</p>
        </div>
      )}
    </div>
  );
}
