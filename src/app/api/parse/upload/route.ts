import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import * as XLSX from 'xlsx';
import { parseDate, formatDateISO, getFinancialYear } from '@/lib/dateUtils';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

// Helper: clean amount string
function parseAmount(str: string | number): number | null {
  if (typeof str !== 'string') str = String(str);
  const clean = str.replace(/[^\d.-]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

// Helper: detect category from description + amount + flow
function detectCategory(
  description: string,
  amount: number,
  isCredit: boolean,
  accountType: 'savings' | 'current'
): { category: string; flow_type: 'inflow' | 'outflow' } {
  const lower = description.toLowerCase();

  // === INFLOWS ===
  if (isCredit) {
    if (lower.includes('homa') || lower.includes('clinic') || lower.includes('consultation')) {
      return { category: 'clinic_revenue', flow_type: 'inflow' };
    }
    if (lower.includes('loan') || lower.includes('disbursed') || lower.includes('credit') || amount >= 500000) {
      return { category: 'business_loan', flow_type: 'inflow' };
    }
    return { category: 'other_income', flow_type: 'inflow' };
  }

  // === OUTFLOWS ===
  // Bank interest (often small, labeled "INT")
  if (lower.includes('int') && amount < 50000) {
    return { category: 'bank_interest', flow_type: 'outflow' };
  }

  // Rent
  if (lower.includes('rent') || lower.includes('house tax') || lower.includes('property')) {
    return { category: 'rent', flow_type: 'outflow' };
  }

  // Salaries
  if (lower.includes('salary') || lower.includes('staff') || lower.includes('payroll')) {
    return { category: 'salaries', flow_type: 'outflow' };
  }

  // EMIs — assume all large debits (>=15000) are EMIs unless known otherwise
  if (amount >= 15000) {
    // Later: split into principal/interest if amortization data exists
    // For now: mark as "emi_interest" → user will split during review
    return { category: 'emi_interest', flow_type: 'outflow' };
  }

  // Vendor payments
  if (lower.includes('electricity') || lower.includes('water') || lower.includes('internet') || 
      lower.includes('amazon') || lower.includes('flipkart') || lower.includes('vendor')) {
    return { category: 'vendor_payment', flow_type: 'outflow' };
  }

  // Default large outflow
  if (amount >= 5000) {
    return { category: 'vendor_payment', flow_type: 'outflow' };
  }

  // Small spends → ignore or mark personal
  return { category: 'personal', flow_type: 'outflow' };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const sheetUrl = formData.get('sheetUrl') as string | null;
    const accountType = formData.get('accountType') as 'savings' | 'current' | null;

    if (!accountType || (accountType !== 'savings' && accountType !== 'current')) {
      return NextResponse.json({ error: 'Account type required: savings or current' }, { status: 400 });
    }

    let rows: (string | number)[][] = [];
    let sourceName = 'Uploaded';

    // Parse file or Google Sheet
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true, raw: false });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' }) as (string | number)[][];
      sourceName = file.name;
    } else if (sheetUrl) {
      const sheetId = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (!sheetId) {
        return NextResponse.json({ error: 'Invalid Google Sheet URL' }, { status: 400 });
      }

      try {
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'A:Z',
        });
        rows = (response.data.values || []) as (string | number)[][];
        sourceName = 'Google Sheet';
      } catch (googleError: any) {
        // Fallback to public CSV if service account fails
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        const csvResponse = await fetch(csvUrl);
        if (!csvResponse.ok) {
          return NextResponse.json({ 
            error: 'Could not access Google Sheet. Make sure it is public or service account has access.',
            details: googleError?.message 
          }, { status: 400 });
        }
        const csvText = await csvResponse.text();
        rows = csvText.split('\n').map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
      }
    } else {
      return NextResponse.json({ error: 'No file or URL provided' }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data found' }, { status: 400 });
    }

    // Auto-detect columns
    const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
    let dateCol = headers.findIndex(h => /date|txn|transaction/i.test(h));
    let debitCol = headers.findIndex(h => /debit|withdrawal|dr/i.test(h));
    let creditCol = headers.findIndex(h => /credit|deposit|cr/i.test(h));
    let descCol = headers.findIndex(h => /desc|narration|particulars|details/i.test(h));

    if (dateCol === -1 || descCol === -1 || (debitCol === -1 && creditCol === -1)) {
      return NextResponse.json({
        error: 'Could not auto-detect columns. Please ensure your sheet has: Date, Debit/Credit, Description.'
      }, { status: 400 });
    }

    const candidates: any[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const dateStr = String(row[dateCol] || '').trim();
      const debitStr = String(row[debitCol] || '').trim();
      const creditStr = String(row[creditCol] || '').trim();
      const desc = String(row[descCol] || '').trim();

      if (!dateStr || (!debitStr && !creditStr)) continue;

      const date = parseDate(dateStr);
      if (!date || isNaN(date.getTime())) continue;

      // Determine if credit (inflow) or debit (outflow)
      const creditAmount = parseAmount(creditStr);
      const debitAmount = parseAmount(debitStr);
      let amount: number | null = null;
      let isCredit = false;

      if (creditAmount !== null && creditAmount > 0) {
        amount = creditAmount;
        isCredit = true;
      } else if (debitAmount !== null && debitAmount > 0) {
        amount = debitAmount;
        isCredit = false;
      } else {
        continue;
      }

      // Skip tiny transactions (optional - can be enabled)
      // if (amount < 1000) continue;

      const { category, flow_type } = detectCategory(desc, amount, isCredit, accountType);

      const financial_year = getFinancialYear(date);

      candidates.push({
        date: formatDateISO(date),
        amount,
        type: flow_type,  // Frontend expects 'type'
        category,
        description: desc,
        account_type: accountType,
        rawRow: i + 1,
        financial_year,
        source_sheet: sourceName
      });
    }

    // Separate inflows and outflows for frontend
    const inflows = candidates.filter(c => c.type === 'inflow');
    const outflows = candidates.filter(c => c.type === 'outflow');
    const totalInflow = inflows.reduce((sum, c) => sum + c.amount, 0);
    const totalOutflow = outflows.reduce((sum, c) => sum + c.amount, 0);

    return NextResponse.json({ 
      success: true,
      candidates,
      transactions: candidates,  // For compatibility
      inflows,
      outflows,
      summary: {
        totalInflow,
        totalOutflow,
        netBalance: totalInflow - totalOutflow,
        inflowCount: inflows.length,
        outflowCount: outflows.length
      },
      accountType,
      source: sourceName,
      message: `Detected ${candidates.length} transactions from ${accountType} account.`
    });

  } catch (err: any) {
    console.error('Parse error:', err);
    return NextResponse.json({ error: err.message || 'Failed to parse sheet' }, { status: 500 });
  }
}
