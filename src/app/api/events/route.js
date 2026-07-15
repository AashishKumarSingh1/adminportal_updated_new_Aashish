import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const now = new Date().getTime()

    const idParam = searchParams.get('id')
    const clubIdParam = searchParams.get('clubId')

    const page = Math.max(1, parseInt(searchParams.get('page')) || 1)
    const limit = Math.min(50, parseInt(searchParams.get('limit')) || 20)
    const offset = (page - 1) * limit

    if (idParam) {
      // 1. Search in club_events
      let rows = await query('SELECT * FROM club_events WHERE id = ? LIMIT 1', [idParam])
      if (rows.length > 0) {
        const event = JSON.parse(JSON.stringify(rows[0]))
        if (event.attachments) {
          try {
            event.attachments = typeof event.attachments === 'string' ? JSON.parse(event.attachments) : event.attachments
          } catch (e) {
            event.attachments = []
          }
        } else {
          event.attachments = []
        }
        if (event.gallery) {
          try {
            event.gallery = typeof event.gallery === 'string' ? JSON.parse(event.gallery) : event.gallery
          } catch (e) {
            event.gallery = []
          }
        } else {
          event.gallery = []
        }
        return NextResponse.json(event)
      }

      // 2. Search in administrative events
      rows = await query('SELECT * FROM events WHERE id = ? LIMIT 1', [idParam])
      if (rows.length > 0) {
        const event = JSON.parse(JSON.stringify(rows[0]))
        if (event.attachments) {
          try {
            event.attachments = typeof event.attachments === 'string' ? JSON.parse(event.attachments) : event.attachments
          } catch (e) {
            event.attachments = []
          }
        } else {
          event.attachments = []
        }
        return NextResponse.json(event)
      }

      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    let results = []
    let total = 0

    if (clubIdParam) {
      const clubRows = await query('SELECT id FROM clubs WHERE club_login_id = ? OR id = ? LIMIT 1', [clubIdParam, clubIdParam])
      if (clubRows.length > 0) {
        const actualClubId = clubRows[0].id
        const countRes = await query('SELECT COUNT(*) as count FROM club_events WHERE club_id = ?', [actualClubId])
        total = Number(countRes[0].count)
        results = await query(
          `SELECT * FROM club_events WHERE club_id = ? ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
          [actualClubId]
        )
      }
    } else {
      switch (type) {
        case 'all':{
          const countRes = await query(`SELECT COUNT(*) as count FROM events`)
          total = Number(countRes[0].count)
          results = await query(
            `SELECT * FROM events ORDER BY openDate DESC LIMIT ${limit} OFFSET ${offset}`
          )
          break
        }
        case 'active':{
          const countRes = await query(`SELECT COUNT(*) as count FROM events WHERE openDate < ? AND closeDate > ?`,[now,now])
          total = Number(countRes[0].count)
          results = await query(
            `SELECT * FROM events WHERE openDate < ? AND closeDate > ? ORDER BY openDate DESC LIMIT ${limit} OFFSET ${offset}`,
            [now, now]
          )
          break
        }
        default:
          return NextResponse.json(
            { message: 'Invalid type parameter' },
            { status: 400 }
          )
      }
    }

    // Parse attachments and gallery for each event
    const events = JSON.parse(JSON.stringify(results))
    events.forEach(event => {
      if (event.attachments) {
        try {
          event.attachments = typeof event.attachments === 'string' ? JSON.parse(event.attachments) : event.attachments
        } catch (e) {
          event.attachments = []
        }
      } else {
        event.attachments = []
      }
      if (event.gallery) {
        try {
          event.gallery = typeof event.gallery === 'string' ? JSON.parse(event.gallery) : event.gallery
        } catch (e) {
          event.gallery = []
        }
      } else {
        event.gallery = []
      }
    })

    return NextResponse.json({
      page,
      limit,
      offset,
      total,
      totalPages: Math.ceil(total / limit),
      data: events
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    let { type } = body
    let { from, to } = body

    from = parseInt(from) || 0
    to = parseInt(to) || 20

    if (from < 0) from = 0
    if (to <= from) to = from + 10

    const limit = Math.max(1, Math.min(50, to - from))
    const offset = Math.max(0, from)
    const page = Math.floor(offset / limit) + 1

    let results = []
    let total = 0
    switch (type) {
      case 'all':{
        const countRes = await query(`SELECT COUNT(*) as count FROM events`)
        total = Number(countRes[0].count)

        results = await query(
          `SELECT * FROM events 
           ORDER BY openDate DESC
           LIMIT ${limit} OFFSET ${offset}`
        )
        break
      }
      case 'range':{
        const { start_date, end_date } = body
        const countRes = await query(
          `SELECT COUNT(*) as count FROM events 
           WHERE closeDate <= ? AND openDate >= ?`,
          [end_date, start_date]
        )
        total = Number(countRes[0].count)       
        results = await query(
          `SELECT * FROM events 
           WHERE closeDate <= ? AND openDate >= ? 
           ORDER BY openDate DESC
           LIMIT ${limit} OFFSET ${offset}`,
          [end_date, start_date]
        )
        break
      }
      default:
        return NextResponse.json(
          { message: 'Invalid type parameter' },
          { status: 400 }
        )
    }

    // Parse attachments for each event
    const events = JSON.parse(JSON.stringify(results))
    events.forEach(event => {
      if (event.attachments) {
        try {
          event.attachments = JSON.parse(event.attachments)
        } catch (e) {
          event.attachments = []
        }
      } else {
        event.attachments = []
      }
    })

    return NextResponse.json({
      page,
      limit,
      offset,
      total,
      totalPages: Math.ceil(total / limit),
      data: events
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
} 