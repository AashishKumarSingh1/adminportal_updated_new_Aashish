import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions'

function formatDateForMySQL(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { type, ...params } = await request.json();

    if (type === 'about_me') {
      if (session.user.email !== params.email && session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
      }

      const { email, content } = params;

      if (!content) {
        return NextResponse.json({ message: 'Content is required' }, { status: 400 });
      }

      const currentDate = formatDateForMySQL(new Date());

      try {
        const existingRecord = await query(
          `SELECT * FROM about_me WHERE email = ?`,
          [email]
        );

        if (existingRecord.length > 0) {
          const updateResult = await query(
            `UPDATE about_me SET content = ?, updated_at = ? WHERE email = ?`,
            [content, currentDate, email]
          );

          if (updateResult.affectedRows === 0) {
            console.error('Update failed: No rows affected.');
            return NextResponse.json({ message: 'Failed to update content' }, { status: 500 });
          }

          return NextResponse.json({ message: 'Successfully updated' }, { status: 200 });
        } else {
          const insertResult = await query(
            `INSERT INTO about_me (email, content, created_at, updated_at) VALUES (?, ?, ?, ?)`,
            [email, content, currentDate, currentDate]
          );

          if (insertResult.affectedRows === 0) {
            console.error('Insert failed: No rows affected.');
            return NextResponse.json({ message: 'Failed to create content' }, { status: 500 });
          }

          return NextResponse.json({ message: 'Successfully created' }, { status: 200 });
        }
      } catch (dbError) {
        console.error('Database query error:', dbError);
        return NextResponse.json({ message: 'Database query failed', error: dbError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Invalid request type' }, { status: 400 });

  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const result = await query(`SELECT * FROM about_me WHERE email = ?`, [email]);

    if (result.length === 0) {
      return NextResponse.json({ message: 'No content found' }, { status: 404 });
    }

    return NextResponse.json({ content: result[0].content }, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
