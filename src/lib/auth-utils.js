import { getServerSession } from 'next-auth'
import { authOptions } from './authOptions'
import { NextResponse } from 'next/server'

// Session cache to avoid repeated calls
const sessionCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get session with caching to improve performance
 * @param {Request} request - The request object
 * @returns {Promise<Session|null>} - The session object or null
 */
export async function getCachedSession(request = null) {
  const key = request?.headers?.get('authorization') || 'default'
  const cached = sessionCache.get(key)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.session
  }
  
  try {
    const session = await getServerSession(authOptions)
    
    // Cache the session
    sessionCache.set(key, {
      session,
      timestamp: Date.now()
    })
    
    return session
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

/**
 * Validate authentication and return standardized responses
 * @param {Request} request - The request object
 * @returns {Promise<{session: Session, error: null} | {session: null, error: Response}>}
 */
export async function validateAuth(request = null) {
  const session = await getCachedSession(request)
  
  if (!session) {
    return {
      session: null,
      error: NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }
  }
  
  return { session, error: null }
}

/**
 * Check if user has specific role access
 * @param {Session} session - The session object
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {boolean} - Whether user has access
 */
export function hasRoleAccess(session, allowedRoles) {
  if (!session?.user?.role) return false
  return allowedRoles.includes(session.user.role)
}

/**
 * Validate role-based access
 * @param {Session} session - The session object
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {Response|null} - Error response or null if authorized
 */
export function validateRoleAccess(session, allowedRoles) {
  if (!hasRoleAccess(session, allowedRoles)) {
    return NextResponse.json(
      { message: 'Not authorized for this action' },
      { status: 403 }
    )
  }
  return null
}

/**
 * Clear session cache (useful for logout)
 */
export function clearSessionCache() {
  sessionCache.clear()
}

// Clean up expired cache entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of sessionCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      sessionCache.delete(key)
    }
  }
}, CACHE_DURATION)
