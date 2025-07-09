import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    // Handle internationalization first
    const intlResponse = intlMiddleware(request);
    
    // If intl middleware returns a redirect, return that response
    if (intlResponse.status === 307 || intlResponse.status === 308) {
        return intlResponse;
    }
    
    // Otherwise, proceed with Supabase session update
    return await updateSession(request);
}

export const config = {
    matcher: [
        // Enable a redirect to a matching locale at the root
        '/',

        // Set a cookie to remember the previous locale for
        // all requests that have a locale prefix
        '/(hu|en)/:path*',

        // Enable redirects that add missing locales
        // (e.g. `/pathnames` -> `/en/pathnames`)
        '/((?!_next|_vercel|.*\\..*).*)'
    ],
}