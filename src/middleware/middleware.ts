import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Skip middleware for static assets and public files to ensure performance
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('/public/') ||
        pathname.includes('.') ||
        pathname.match(/\.(css|js|json|png|jpg|jpeg|svg|ico|webp|woff|woff2)$/)
    ) {
        return NextResponse.next()
    }

    // 2. Initialize response and supabase client with proper cookie handling
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    // Update request cookies for current handler
                    request.cookies.set({ name, value, ...options })
                    // Create new response to sync cookies to client
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    // 3. Define route protection configuration
    const protectedRoutes = ['/', '/dashboard', '/transactions', '/goals', '/salaries', '/reports', '/settings', '/subscription']
    const authRoutes = ['/login', '/register']

    const isProtectedRoute = protectedRoutes.some(route =>
        route === '/' ? pathname === '/' : pathname.startsWith(route)
    )

    const isAuthRoute = authRoutes.some(route =>
        pathname.startsWith(route)
    )

    // 4. Validate authentication state
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Redirect to login if accessing a protected route without being authenticated
    if (!user && isProtectedRoute && !isAuthRoute) {
        const loginUrl = new URL('/login', request.url)
        if (pathname !== '/') {
            loginUrl.searchParams.set('redirectTo', pathname)
        }
        return NextResponse.redirect(loginUrl)
    }

    // Redirect to dashboard if an authenticated user attempts to access login/register
    if (user && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Pass the pathname in headers for server components visibility
    response.headers.set('x-pathname', pathname)

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
