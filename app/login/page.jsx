'use client'

import { createClient } from '@/utils/supabase/client'
import { getURL } from '@/utils/url'
import { useState } from 'react'
import { Loader2, Bookmark, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleLogin = async () => {
        setLoading(true)
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${getURL()}auth/callback`,
            },
        })
    }

    return (
        <div className="flex h-screen items-center justify-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-2000"></div>

            {/* Back Button */}
            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
                <Link href="/">
                    <Button variant="ghost" className="bg-white/50 backdrop-blur-sm hover:bg-white/80 text-gray-700 text-xs px-3 py-2 md:text-sm md:px-4 h-auto">
                        <ArrowLeft className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                        Back
                    </Button>
                </Link>
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10 px-4"
            >
                <Card className="text-center p-10 backdrop-blur-xl bg-white/80 border-white/40 shadow-2xl">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                        <Bookmark className="h-8 w-8 text-white" />
                    </div>

                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-gray-500 mb-8">
                        Sign in to access your synchronized bookmarks
                    </p>

                    <div className="space-y-4">
                        <Button
                            onClick={handleLogin}
                            loading={loading}
                            className="w-full h-12 text-base shadow-indigo-200"
                        >
                            {!loading && (
                                <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                            )}
                            Continue with Google
                        </Button>
                        <p className="text-xs text-gray-400">
                            By clicking continue, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
