import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all EMIs or filter by query params
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const financial_year = searchParams.get('financial_year');
    const loan_ref_id = searchParams.get('loan_ref_id');
    const loan_type = searchParams.get('loan_type');

    let result;

    if (financial_year && loan_ref_id) {
      result = await sql`
        SELECT * FROM loan_emis 
        WHERE financial_year = ${financial_year} AND loan_ref_id = ${loan_ref_id}
        ORDER BY emi_date DESC
      `;
    } else if (financial_year) {
      result = await sql`
        SELECT * FROM loan_emis 
        WHERE financial_year = ${financial_year}
        ORDER BY emi_date DESC
      `;
    } else if (loan_ref_id) {
      result = await sql`
        SELECT * FROM loan_emis 
        WHERE loan_ref_id = ${loan_ref_id}
        ORDER BY emi_date DESC
      `;
    } else if (loan_type) {
      result = await sql`
        SELECT * FROM loan_emis 
        WHERE loan_type = ${loan_type}
        ORDER BY emi_date DESC
      `;
    } else {
      result = await sql`
        SELECT * FROM loan_emis 
        ORDER BY emi_date DESC
        LIMIT 100
      `;
    }

    return NextResponse.json({ 
      success: true, 
      data: result,
      count: result.length 
    });
  } catch (err) {
    console.error('Fetch EMIs error:', err);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

// POST: Insert single EMI
export async function POST(req: NextRequest) {
  try {
    const { emi_date, amount, loan_ref_id, loan_type, description } = await req.json();

    // Validate required fields
    if (!emi_date || !amount || !loan_ref_id || !loan_type) {
      return NextResponse.json({ 
        error: 'Missing required fields: emi_date, amount, loan_ref_id, loan_type' 
      }, { status: 400 });
    }

    const date = new Date(emi_date);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Calculate Indian financial year
    const year = date.getFullYear();
    const month = date.getMonth();
    const financial_year = month >= 3 
      ? `${year}-${String(year + 1).slice(-2)}`
      : `${year - 1}-${String(year).slice(-2)}`;

    const result = await sql`
      INSERT INTO loan_emis (
        emi_date, amount, loan_ref_id, loan_type, source_description, financial_year
      ) VALUES (
        ${date.toISOString().split('T')[0]},
        ${Number(amount)},
        ${loan_ref_id},
        ${loan_type},
        ${description || ''},
        ${financial_year}
      )
      ON CONFLICT (emi_date, amount, loan_ref_id) DO NOTHING
      RETURNING *
    `;

    if (result && result.length > 0) {
      return NextResponse.json({ success: true, data: result[0] });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'EMI already exists (duplicate)' 
      });
    }
  } catch (err) {
    console.error('Insert EMI error:', err);
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }
}

// DELETE: Delete EMI by ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing EMI id' }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM loan_emis WHERE id = ${id}::uuid RETURNING id
    `;

    if (result && result.length > 0) {
      return NextResponse.json({ success: true, deleted: id });
    } else {
      return NextResponse.json({ error: 'EMI not found' }, { status: 404 });
    }
  } catch (err) {
    console.error('Delete EMI error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

