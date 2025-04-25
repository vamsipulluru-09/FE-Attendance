import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the path starts with /admin
  if (path.startsWith('/admin')) {
    // Get the token from localStorage
    const token = request.cookies.get('admin_token')?.value

    // If there's no token, redirect to role-select page
    if (!token) {
      return NextResponse.redirect(new URL('/role-select', request.url))
    }
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: '/admin/:path*'
} 