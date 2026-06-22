import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    return createBrowserClient(
        supabaseUrl,
        supabaseKey,
        {
            global: {
                fetch: async (url, options) => {
                    try {
                        const response = await fetch(url, options)
                        return response
                    } catch (error: any) {
                        console.error(`[Supabase Fetch Error] URL: ${url}`, error)
                        // This will surface the "Failed to fetch" error with more context in the console
                        throw error
                    }
                }
            }
        }
    )
}
