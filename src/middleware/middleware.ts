import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

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

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })
    response.headers.set('x-pathname', pathname)

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const hasSessionCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-'))

    const protectedRoutes = ['/', '/dashboard', '/transactions', '/goals', '/salaries', '/reports', '/settings', '/subscription']
    const authRoutes = ['/login', '/register']

    const isProtectedRoute = protectedRoutes.some(route =>
        route === '/' ? pathname === '/' : pathname.startsWith(route)
    )

    const isAuthRoute = authRoutes.some(route =>
        pathname.startsWith(route)
    )

    if (isProtectedRoute || isAuthRoute || hasSessionCookie) {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user && isProtectedRoute && !isAuthRoute) {
                const loginUrl = new URL('/login', request.url)
                if (pathname !== '/') {
                    loginUrl.searchParams.set('redirectTo', pathname)
                }
                return NextResponse.redirect(loginUrl)
            }

            if (user && isAuthRoute) {
                return NextResponse.redirect(new URL('/', request.url))
            }
        } catch (e) {
            console.error('Middleware Auth Critical Error:', e)
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

