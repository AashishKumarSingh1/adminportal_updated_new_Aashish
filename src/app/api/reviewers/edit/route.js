import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req) {
  try {
    const { id, name, from_date, to_date, is_continuing,email } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    await query(
      `UPDATE international_journal_reviewers SET name = ?, from_date = ?, to_date = ?, is_continuing = ? WHERE id = ?`,
      [name, from_date, to_date || null, is_continuing, id]
    );

    return NextResponse.json({ message: 'Reviewer updated successfully' });
  } catch (err) {
    console.error('EDIT error:', err);
    return NextResponse.json({ message: 'Failed to update reviewer' }, { status: 500 });
  }
}
