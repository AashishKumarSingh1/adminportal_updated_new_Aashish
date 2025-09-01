import {  NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req) {
  try {
    const { name, from_date, to_date, is_continuing,email } = await req.json();

    const result = await query(
      `INSERT INTO international_journal_reviewers (name, from_date, to_date, is_continuing,email) VALUES (?, ?, ?, ?,?)`,
      [name, from_date, to_date || null, is_continuing,email]
    );

    return NextResponse.json({ message: 'Reviewer created successfully',result:result });
  } catch (err) {
    console.error('CREATE error:', err);
    return NextResponse.json({ message: 'Failed to create reviewer' }, { status: 500 });
  }
}
