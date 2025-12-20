import { NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recent transactions
    const transactions = await sql`
      SELECT 
        id,
        txn_date,
        amount,
        flow_type,
        category,
        description,
        source_sheet
      FROM cashflow_entries
      ORDER BY txn_date DESC, created_at DESC
      LIMIT ${limit}
    `;

    const formattedTransactions = transactions.map((txn: any) => ({
      id: txn.id,
      txn_date: txn.txn_date.toISOString().split('T')[0],
      amount: Number(txn.amount),
      flow_type: txn.flow_type,
      category: txn.category,
      description: txn.description,
    }));

    return Response.json({
      success: true,
      transactions: formattedTransactions,
    });
  } catch (err: any) {
    console.error('Recent transactions API error:', err);
    return Response.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

