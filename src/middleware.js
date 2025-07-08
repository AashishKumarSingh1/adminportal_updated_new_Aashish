// This file should be in the root of your src directory
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request) {
  // Handle preflight requests quickly
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  // Create response with CORS headers
  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Only check authentication for protected routes
  const { pathname } = request.nextUrl
  
  // Skip auth check for public API routes
  const publicRoutes = ['/api/auth', '/api/webteam', '/api/events/*','/api/notice/*','/api/faculty/*']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicRoute) {
    return response
  }

  // Only perform token validation for non-public routes
  try {
    const token = await getToken({ req: request })
    if (!token && pathname.startsWith('/api/')) {
      // Only return 401 for API routes that require auth
      const protectedApiRoutes = ['/api/create', '/api/update', '/api/delete', '/api/upload']
      const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route))
      
      if (isProtectedApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
  } catch (error) {
    console.error('Middleware auth error:', error)
  }
  
  return response
}

export const config = {
  matcher: [
    '/api/((?!auth|webteam|events/active).*)',
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ],
} 