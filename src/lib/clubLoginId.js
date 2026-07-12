import { query } from '@/lib/db'
import { slugifyClubLoginId, isValidClubLoginId } from '@/lib/clubUtils'

export async function resolveUniqueClubLoginId(name, provided, excludeClubId = null) {
  const base = slugifyClubLoginId(provided || name)

  if (provided?.trim() && !isValidClubLoginId(base)) {
    throw new Error(
      'Club Login ID must be 2–50 characters: lowercase letters, numbers, and hyphens only'
    )
  }

  let candidate = base
  let suffix = 1

  while (true) {
    const dup = excludeClubId
      ? await query('SELECT id FROM clubs WHERE club_login_id = ? AND id != ?', [
          candidate,
          excludeClubId,
        ])
      : await query('SELECT id FROM clubs WHERE club_login_id = ?', [candidate])

    if (!dup.length) return candidate
    candidate = `${base}-${suffix++}`
  }
}
