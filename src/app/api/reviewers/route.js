import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(req) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    await query('DELETE FROM international_journal_reviewers WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Reviewer deleted successfully' });
  } catch (err) {
    console.error('DELETE error:', err);
    return NextResponse.json({ message: 'Failed to delete reviewer' }, { status: 500 });
  }
}
