// src/app/api/parse/upload/route.ts
import { NextRequest } from 'next/server';
import * as XLSX from 'xlsx';
import { neon } from '@neondatabase/serverless';

// ✅ Initialize Neon with explicit DATABASE_URL (required in App Router)
const sql = neon(process.env.DATABASE_URL!);

// ✅ Safe amount parser: handles "29,39,040.87", "0.0", "-", etc.
function cleanAmount(value: any): number {
  if (value == null || value === '' || value === '-') return 0;
  const str = String(value).replace(/[^0-9.]/g, ''); // Remove commas, spaces, etc.
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

// ✅ Parse dd/mm/yyyy → yyyy-mm-dd
function parseIndianDate(dateStr: string): string {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  throw new Error(`Invalid date: ${dateStr}`);
}

// ✅ Categorize by remark
function categorize(remark: string, flow: 'inflow' | 'outflow'): string {
  const lower = remark.toLowerCase();
  if (flow === 'inflow') {
    if (lower.includes('loan') || lower.includes('l and t') || lower.includes('finance limited')) {
      return 'business_loan';
    }
    if (lower.includes('salary') || lower.includes('cbm') || lower.includes('anjani')) {
      return 'clinic_income';
    }
    return 'income';
  }
  if (lower.includes('hdfc') || lower.includes('tata') || lower.includes('bajaj')) return 'emi';
  if (lower.includes('rent') || lower.includes('homarent')) return 'rent';
  if (lower.includes('tax') || lower.includes('itax')) return 'tax';
  if (lower.includes('partner') || lower.includes('david') || lower.includes('suresh')) return 'transfer';
  return 'vendor_payment';
}

// Find column indexes by header name (case-insensitive, partial match)
function findColumnIndex(headers: string[], target: string): number {
  const cleanHeaders = headers.map(h => h.toLowerCase().trim());
  const keywords = target.toLowerCase().split(' ');
  for (let i = 0; i < cleanHeaders.length; i++) {
    if (keywords.every(kw => cleanHeaders[i].includes(kw))) {
      return i;
    }
  }
  return -1;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file || !file.name.endsWith('.xlsx')) {
      return Response.json({ error: 'Please upload an .xlsx file' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];

    if (rows.length < 2) {
      return Response.json({ error: 'Empty sheet' }, { status: 400 });
    }

    // 🔍 Find columns by header name (case-insensitive, partial match)
    const headers = (rows[0] as string[]).map(h => h?.toString().trim() || '');
    const dateCol = findColumnIndex(headers, "Transaction Date");
    const remarksCol = findColumnIndex(headers, "Transaction Remarks");
    const withdrawalCol = findColumnIndex(headers, "Withdrawal Amount");
    const depositCol = findColumnIndex(headers, "Deposit Amount");

    // ADD THIS RIGHT AFTER finding columns
    console.log("🔍 COLUMN DETECTION:");
    console.log("Headers:", headers);
    console.log("Date col:", dateCol);
    console.log("Remarks col:", remarksCol);
    console.log("Withdrawal col:", withdrawalCol);
    console.log("Deposit col:", depositCol);

    if (dateCol === -1 || remarksCol === -1 || withdrawalCol === -1 || depositCol === -1) {
      console.error("❌ REQUIRED COLUMNS NOT FOUND!");
      return Response.json({ 
        error: "Required columns not found in sheet", 
        headers 
      }, { status: 400 });
    }

    const transactions: any[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const dateCell = row[dateCol];
      const remarksCell = row[remarksCol];
      const withdrawalCell = row[withdrawalCol];
      const depositCell = row[depositCol];

      // Skip legend rows
      if (typeof dateCell === 'string' && dateCell.includes('Legends')) continue;
      if (!dateCell) continue;

      const txnDateStr = String(dateCell).trim();
      const remarks = String(remarksCell || '').trim();
      const withdrawal = cleanAmount(row[withdrawalCol]);
      const deposit = cleanAmount(row[depositCol]);

      // 🔍 Debug log (visible in terminal)
      console.log(`DEBUG Row ${i}: Date="${row[dateCol]}", Remarks="${row[remarksCol]}", Withdrawal=${withdrawal}, Deposit=${deposit}`);

      // Apply your rule: ≥ ₹15,000
      if (deposit >= 15000) {
        transactions.push({
          txn_date: parseIndianDate(txnDateStr),
          amount: deposit,
          flow_type: 'inflow',
          category: categorize(remarks, 'inflow'),
          description: remarks,
          source_sheet: file.name,
          financial_year: (parseInt(txnDateStr.split('/')[2]) >= 4) 
            ? `${txnDateStr.split('/')[2]}-${String(parseInt(txnDateStr.split('/')[2]) + 1).slice(-2)}`
            : `${String(parseInt(txnDateStr.split('/')[2]) - 1)}-${txnDateStr.split('/')[2].slice(-2)}`
        });
      } else if (withdrawal >= 15000) {
        transactions.push({
          txn_date: parseIndianDate(txnDateStr),
          amount: withdrawal,
          flow_type: 'outflow',
          category: categorize(remarks, 'outflow'),
          description: remarks,
          source_sheet: file.name,
          financial_year: (parseInt(txnDateStr.split('/')[2]) >= 4) 
            ? `${txnDateStr.split('/')[2]}-${String(parseInt(txnDateStr.split('/')[2]) + 1).slice(-2)}`
            : `${String(parseInt(txnDateStr.split('/')[2]) - 1)}-${txnDateStr.split('/')[2].slice(-2)}`
        });
      }
    }

    // Save to DB
    let saved = 0;
    let duplicateCount = 0;
    
    if (transactions.length > 0) {
      for (const txn of transactions) {
        try {
          const result = await sql`
            INSERT INTO cashflow_entries (
              txn_date,
              amount,
              flow_type,
              category,
              description,
              source_sheet,
              financial_year
            ) VALUES (
              ${txn.txn_date}::date,
              ${txn.amount}::numeric(12,2),
              ${txn.flow_type},
              ${txn.category},
              ${txn.description},
              ${txn.source_sheet},
              ${txn.financial_year}
            )
            ON CONFLICT (txn_date, amount, description) DO NOTHING
            RETURNING id
          `;

          if (result && result.length > 0) {
            saved++;
          } else {
            duplicateCount++;
          }
        } catch (error: any) {
          console.error('Error saving transaction:', error);
          // Continue with next transaction
        }
      }
    }

    return Response.json({
      success: true,
      saved,
      duplicates: duplicateCount,
      parsed: transactions.length,
      message: saved > 0 ? `${saved} transactions saved` : 'No transactions saved'
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return Response.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
