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
  return {
    ...row,
    pictures: parseJsonField(row.pictures, []),
    patna_campus_pi: parseJsonField(row.patna_campus_pi, null),
    bihta_campus_pi: parseJsonField(row.bihta_campus_pi, null),
  }
}

/** Primary PI label for super-admin table column */
export function getClubPiName(club) {
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
