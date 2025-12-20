import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const emis = await db`
      SELECT 
        id, 
        amount, 
        remark, 
        transaction_date,
        flow_type,
        account_type
      FROM transactions
      WHERE flow_type = 'outflow'
        AND (remark ILIKE '%emi%' OR remark ILIKE '%loan%')
      ORDER BY transaction_date DESC;
    `;
    return NextResponse.json({ emis });
  } catch (err) {
    console.error('EMI summary error:', err);
    return NextResponse.json({ error: 'Failed to load EMI data' }, { status: 500 });
  }
}

