/** URL-safe unique id for club admin login (e.g. coding-club) */
export function slugifyClubLoginId(value) {
  if (!value || typeof value !== 'string') return 'club'
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'club'
  )
}

export function isValidClubLoginId(id) {
  return /^[a-z0-9][a-z0-9-]{0,48}[a-z0-9]$/.test(id) || /^[a-z0-9]$/.test(id)
}

export function parseJsonField(value, fallback = null) {
  if (value == null) return fallback
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export function stringifyJsonField(value) {
  if (value == null) return null
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

export function formatClubRow(row) {
  if (!row) return row
  const formatted = {
    ...row,
    pictures: parseJsonField(row.pictures, []),
    patna_campus_pi: parseJsonField(row.patna_campus_pi, null),
    bihta_campus_pi: parseJsonField(row.bihta_campus_pi, null),
    social_links: parseJsonField(row.social_links, { website: '', linkedin: '', instagram: '', twitter: '' }),
    members: parseJsonField(row.sessions, {}),
  }
  delete formatted.sessions
  delete formatted.description
  
  // Remove top-level legacy properties to avoid duplicate data (already inside members)
  delete formatted.patna_campus_pi
  delete formatted.bihta_campus_pi
  delete formatted.club_president
  delete formatted.club_secretary
  return formatted
}

/** Primary PI label for super-admin table column */
export function getClubPiName(club) {
  if (club?.members && typeof club.members === 'object') {
    const sessionKeys = Object.keys(club.members).sort().reverse()
    if (sessionKeys.length > 0) {
      const latest = club.members[sessionKeys[0]]
      const patna = latest?.patna_campus_pi
      const bihta = latest?.bihta_campus_pi
      if (patna?.name) return patna.name
      if (bihta?.name) return bihta.name
    }
  }
  // Fallback to legacy fields if present
  const patna = club?.patna_campus_pi
  const bihta = club?.bihta_campus_pi
  if (patna?.name) return patna.name
  if (bihta?.name) return bihta.name
  return '—'
}

export function picturesToInput(pictures) {
  if (!Array.isArray(pictures)) return ''
  return pictures.filter(Boolean).join('\n')
}

export function inputToPictures(value) {
  if (!value || typeof value !== 'string') return []
  return value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

