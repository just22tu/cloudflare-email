import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 如果是认证页面或静态资源，直接放行
  if (
    request.nextUrl.pathname === '/auth' ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  // 检查是否有认证token
  const authStorage = request.cookies.get('auth-storage')
  if (!authStorage) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  try {
    const authData = JSON.parse(authStorage.value)
    if (!authData.state?.token) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * /auth (认证页面)
     * /_next (Next.js 系统文件)
     * /api (API 路由)
     * /favicon.ico, /images 等静态文件
     */
    '/((?!auth|_next|api|favicon.ico|images).*)',
  ],
} 