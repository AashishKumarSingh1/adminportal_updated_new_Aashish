import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { query } from '@/lib/db'
import { parseJsonField, stringifyJsonField } from '@/lib/clubUtils'

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

function formatClubEvent(row) {
  if (!row) return row
  return {
    ...row,
    gallery: parseJsonField(row.gallery, []),
    attachments: parseJsonField(row.attachments, []),
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clubIdParam = searchParams.get('club_id')

    // 1. Fetch single event by ID (Public)
    if (id) {
      const rows = await query('SELECT * FROM club_events WHERE id = ? LIMIT 1', [id])
      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: formatClubEvent(rows[0]) })
    }

    // 2. Fetch events by club ID (Public)
    if (clubIdParam) {
      const rows = await query('SELECT * FROM club_events WHERE club_id = ? ORDER BY created_at DESC', [clubIdParam])
      return NextResponse.json({ success: true, data: rows.map(formatClubEvent) })
    }

    // 3. Admin view (Admin Only)
    const { session, error } = await requireClubAdmin()
    if (error) return error

    const clubId = session.user.clubId
    const rows = await query('SELECT * FROM club_events WHERE club_id = ? ORDER BY created_at DESC', [clubId])
    return NextResponse.json({ success: true, data: rows.map(formatClubEvent) })

  } catch (err) {
    console.error('GET /api/club/event:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { session, error } = await requireClubAdmin()
    if (error) return error

    const clubId = session.user.clubId
    const body = await request.json()
    const {
      id,
      title,
      poster,
      description,
      category,
      usually_held,
      duration,
      venue,
      gallery,
      attachments
    } = body

    if (!id?.trim() || !title?.trim()) {
      return NextResponse.json({ error: 'Event ID and title are required' }, { status: 400 })
    }

    // Check duplicate event ID
    const duplicate = await query('SELECT id FROM club_events WHERE id = ? LIMIT 1', [id.trim()])
    if (duplicate.length > 0) {
      return NextResponse.json({ error: 'Event ID already exists' }, { status: 400 })
    }

    await query(
      `INSERT INTO club_events (
        id, club_id, title, poster, description, category, usually_held, duration, venue, gallery, attachments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id.trim(),
        clubId,
        title.trim(),
        poster || null,
        description || null,
        category || null,
        usually_held || null,
        duration || null,
        venue || null,
        stringifyJsonField(gallery || []),
        stringifyJsonField(attachments || []),
      ]
    )

    const created = await query('SELECT * FROM club_events WHERE id = ? LIMIT 1', [id.trim()])
    return NextResponse.json({ success: true, data: formatClubEvent(created[0]) })

  } catch (err) {
    console.error('POST /api/club/event:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { session, error } = await requireClubAdmin()
    if (error) return error

    const clubId = session.user.clubId
    const body = await request.json()
    const {
      id,
      title,
      poster,
      description,
      category,
      usually_held,
      duration,
      venue,
      gallery,
      attachments
    } = body

    if (!id?.trim()) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const existing = await query('SELECT id, club_id FROM club_events WHERE id = ? LIMIT 1', [id.trim()])
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (existing[0].club_id !== clubId) {
      return NextResponse.json({ error: 'Unauthorized to modify this event' }, { status: 403 })
    }

    await query(
      `UPDATE club_events SET
        title = ?, poster = ?, description = ?, category = ?, usually_held = ?,
        duration = ?, venue = ?, gallery = ?, attachments = ?
      WHERE id = ? AND club_id = ?`,
      [
        title?.trim() || 'Untitled Event',
        poster !== undefined ? poster : null,
        description !== undefined ? description : null,
        category !== undefined ? category : null,
        usually_held !== undefined ? usually_held : null,
        duration !== undefined ? duration : null,
        venue !== undefined ? venue : null,
        gallery !== undefined ? stringifyJsonField(gallery) : null,
        attachments !== undefined ? stringifyJsonField(attachments) : null,
        id.trim(),
        clubId,
      ]
    )

    const updated = await query('SELECT * FROM club_events WHERE id = ? LIMIT 1', [id.trim()])
    return NextResponse.json({ success: true, data: formatClubEvent(updated[0]) })

  } catch (err) {
    console.error('PUT /api/club/event:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { session, error } = await requireClubAdmin()
    if (error) return error

    const clubId = session.user.clubId
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id?.trim()) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const existing = await query('SELECT id, club_id FROM club_events WHERE id = ? LIMIT 1', [id.trim()])
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (existing[0].club_id !== clubId) {
      return NextResponse.json({ error: 'Unauthorized to delete this event' }, { status: 403 })
    }

    await query('DELETE FROM club_events WHERE id = ? AND club_id = ?', [id.trim(), clubId])
    return NextResponse.json({ success: true, message: 'Event deleted successfully' })

  } catch (err) {
    console.error('DELETE /api/club/event:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
