import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { query } from '@/lib/db';
import { formatClubRow, stringifyJsonField } from '@/lib/clubUtils';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}

async function requireClubAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'CLUB_ADMIN') {
    return { session: null, error: unauthorized() }
  }
  if (!session.user.clubId) {
    return {
      session: null,
      error: NextResponse.json(
        { error: 'No club linked to your login. Contact Super Admin.' },
        { status: 403 }
      ),
    }
  }
  return { session, error: null }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // e.g., 'all' or 'coding-club'

    // 1. PUBLIC: Fetch ALL clubs
    if (type === 'all') {
      const rows = await query('SELECT * FROM clubs');

      console.log("All data : ", rows);

      return NextResponse.json(rows.map(formatClubRow));
    }

    // 2. PUBLIC: Fetch ONE club by slug or ID
    if (type) {
      const rows = await query(
        'SELECT * FROM clubs WHERE club_login_id = ? OR id = ? LIMIT 1',
        [type, type]
      );
      if (rows.length === 0) {
        return NextResponse.json({ error: 'Club not found' }, { status: 404 });
      }

      console.log("One club data : ",formatClubRow(rows[0]) );
      return NextResponse.json(formatClubRow(rows[0]));
    }

    // 3. ADMIN ONLY: Fetch current admin's club
    const { session, error } = await requireClubAdmin();
    if (error) return error;

    const rows = await query('SELECT * FROM clubs WHERE id = ? LIMIT 1', [session.user.clubId]);
    return NextResponse.json(rows[0] ? formatClubRow(rows[0]) : { error: 'Club not found' });

  } catch (err) {
    console.error('GET /api/clubs:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { session, error } = await requireClubAdmin()
    if (error) return error

    const clubId = session.user.clubId
    const existing = await getClubById(clubId)
    if (!existing) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, category, about, description, logo, pictures, patna_campus_pi, bihta_campus_pi } =
      body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Club title is required' }, { status: 400 })
    }
    if (!category?.trim()) {
      return NextResponse.json({ error: 'Club category is required' }, { status: 400 })
    }
    if (!patna_campus_pi?.name?.trim() || !patna_campus_pi?.email?.trim()) {
      return NextResponse.json(
        { error: 'Patna Campus PI name and email are required' },
        { status: 400 }
      )
    }
    if (!bihta_campus_pi?.name?.trim() || !bihta_campus_pi?.email?.trim()) {
      return NextResponse.json(
        { error: 'Bihta Campus PI name and email are required' },
        { status: 400 }
      )
    }

    await query(
      `UPDATE clubs SET
        name = ?, category = ?, about = ?, description = ?, logo = ?,
        pictures = ?, patna_campus_pi = ?, bihta_campus_pi = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name.trim(),
        category.trim(),
        about ?? null,
        description ?? null,
        logo ?? null,
        pictures !== undefined
          ? stringifyJsonField(pictures)
          : stringifyJsonField(existing.pictures),
        patna_campus_pi !== undefined
          ? stringifyJsonField(patna_campus_pi)
          : stringifyJsonField(existing.patna_campus_pi),
        bihta_campus_pi !== undefined
          ? stringifyJsonField(bihta_campus_pi)
          : stringifyJsonField(existing.bihta_campus_pi),
        clubId,
      ]
    )

    await query('UPDATE user SET name = ? WHERE club_id = ?', [name.trim(), clubId])

    const updated = await getClubById(clubId)
    return NextResponse.json({ club: updated })
  } catch (err) {
    console.error('PUT /api/club:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
