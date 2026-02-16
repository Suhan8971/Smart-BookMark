import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'

            console.log('Auth Callback Debug:', {
                code: '***',
                next,
                origin,
                forwardedHost,
                isLocalEnv
            })

            let finalUrl = ''
            if (isLocalEnv) {
                finalUrl = `${origin}${next}`
            } else if (forwardedHost) {
                finalUrl = `https://${forwardedHost}${next}`
            } else {
                finalUrl = `${origin}${next}`
            }

            console.log('Redirecting to:', finalUrl)
            return NextResponse.redirect(finalUrl)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
}
