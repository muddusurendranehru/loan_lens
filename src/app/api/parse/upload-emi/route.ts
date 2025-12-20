import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import * as XLSX from 'xlsx';
import { parseDateToDate, formatDateISO, getFinancialYear, cleanAmount } from '@/lib/dateUtils';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

// Helper: Extract loan reference ID from description
function extractLoanRefId(description: string): string {
  const lower = description.toLowerCase();
  
  // Patterns: "EMI HDFC HL" -> "HL-01", "HDFC HOME LOAN" -> "HDFC-HL"
  if (lower.includes('hdfc')) {
    if (lower.includes('hl') || lower.includes('home')) return 'HDFC-HL';
    if (lower.includes('pl') || lower.includes('personal')) return 'HDFC-PL';
    return 'HDFC-01';
  }
  if (lower.includes('sbi')) {
    if (lower.includes('hl') || lower.includes('home')) return 'SBI-HL';
    if (lower.includes('pl') || lower.includes('personal')) return 'SBI-PL';
    return 'SBI-01';
  }
  if (lower.includes('icici')) {
    if (lower.includes('hl') || lower.includes('home')) return 'ICICI-HL';
    if (lower.includes('pl') || lower.includes('personal')) return 'ICICI-PL';
    return 'ICICI-01';
  }
  if (lower.includes('axis')) {
    if (lower.includes('hl') || lower.includes('home')) return 'AXIS-HL';
    if (lower.includes('pl') || lower.includes('personal')) return 'AXIS-PL';
    return 'AXIS-01';
  }
  
  // Generic: extract any loan identifier
  const loanMatch = description.match(/([A-Z]{2,})-?([A-Z]{2})?/);
  if (loanMatch) {
    return loanMatch[0].substring(0, 10); // Limit to 10 chars
  }
  
  return 'LOAN-01'; // Default
}

// Helper: Detect loan type from description
function detectLoanType(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes('home') || lower.includes('hl') || lower.includes('housing')) return 'home_loan';
  if (lower.includes('personal') || lower.includes('pl')) return 'personal_loan';
  if (lower.includes('car') || lower.includes('auto')) return 'car_loan';
  if (lower.includes('education')) return 'education_loan';
  return 'personal_loan'; // Default
}

// Helper: Detect EMI from description and amount
// EMIs are between ₹16,000 and ₹1,87,000
function isEMI(description: string, amount: number, isDebit: boolean): boolean {
  if (!isDebit) return false; // EMIs are always debits (outflows)
  
  const lower = description.toLowerCase();
  
  // Check amount range
  if (amount < 16000 || amount > 187000) return false;
  
  // Check for EMI keywords
  if (lower.includes('emi') || 
      lower.includes('installment') || 
      lower.includes('loan') ||
      lower.includes('hdfc') ||
      lower.includes('sbi') ||
      lower.includes('icici') ||
      lower.includes('axis') ||
      lower.includes('hl') ||
      lower.includes('pl')) {
    return true;
  }
  
  // If amount is in range and description is short (likely EMI)
  if (description.length < 50 && amount >= 16000 && amount <= 187000) {
    return true;
  }
  
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const sheetUrl = formData.get('sheetUrl') as string | null;

    if (!file && !sheetUrl) {
      return NextResponse.json({ error: 'No file or URL provided' }, { status: 400 });
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
        const sheets = google.sheets({ version: 'v4', auth: client as any });
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'A:Z',
        });
        rows = (response.data.values || []) as (string | number)[][];
        sourceName = 'Google Sheet';
      } catch (googleError: any) {
        // Fallback to public CSV
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
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data found' }, { status: 400 });
    }

    // Auto-detect columns
    const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
    let dateCol = headers.findIndex(h => /date|txn|transaction/i.test(h));
    let debitCol = headers.findIndex(h => /debit|withdrawal|dr|amount/i.test(h));
    let creditCol = headers.findIndex(h => /credit|deposit|cr/i.test(h));
    let descCol = headers.findIndex(h => /desc|narration|particulars|details|remarks/i.test(h));

    // If no separate debit/credit, look for single amount column
    if (debitCol === -1 && creditCol === -1) {
      debitCol = headers.findIndex(h => /amount|value/i.test(h));
    }

    if (dateCol === -1 || descCol === -1 || (debitCol === -1 && creditCol === -1)) {
      return NextResponse.json({
        error: 'Could not auto-detect columns. Please ensure your sheet has: Date, Debit/Amount, Description.'
      }, { status: 400 });
    }

    const detectedEMIs: any[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const dateStr = String(row[dateCol] || '').trim();
      const debitStr = String(row[debitCol] || '').trim();
      const creditStr = creditCol >= 0 ? String(row[creditCol] || '').trim() : '';
      const desc = String(row[descCol] || '').trim();

      if (!dateStr || (!debitStr && !creditStr)) continue;

      const date = parseDateToDate(dateStr);
      if (!date || isNaN(date.getTime())) continue;

      // Determine amount (EMIs are debits)
      let amount: number | null = null;
      let isDebit = false;

      if (debitStr) {
        amount = cleanAmount(debitStr);
        isDebit = true;
      } else if (creditStr) {
        amount = cleanAmount(creditStr);
        isDebit = false;
      }

      if (!amount || amount === 0) continue;

      // Check if this is an EMI
      if (isEMI(desc, amount, isDebit)) {
        const loanRefId = extractLoanRefId(desc);
        const loanType = detectLoanType(desc);
        const financial_year = getFinancialYear(date);

        detectedEMIs.push({
          emi_date: formatDateISO(date),
          amount: amount,
          loan_ref_id: loanRefId,
          loan_type: loanType,
          source_description: desc,
          source_sheet_name: sourceName,
          source_row_number: i + 1,
          financial_year: financial_year,
          towards: 'EMI',
          transaction_id: null
        });
      }
    }

    // Group by month for display
    const byMonth: Record<string, any[]> = {};
    detectedEMIs.forEach(emi => {
      const date = new Date(emi.emi_date);
      const monthKey = `${date.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}`;
      if (!byMonth[monthKey]) byMonth[monthKey] = [];
      byMonth[monthKey].push(emi);
    });

    return NextResponse.json({ 
      success: true,
      emis: detectedEMIs,
      byMonth,
      total: detectedEMIs.length,
      message: `Detected ${detectedEMIs.length} EMI(s) from ${sourceName}.`
    });

  } catch (err: any) {
    console.error('Parse EMI error:', err);
    return NextResponse.json({ error: err.message || 'Failed to parse sheet' }, { status: 500 });
  }
}

