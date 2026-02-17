'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button' // Assuming we export Button from here
import { Bookmark, Star, Shield, Zap } from 'lucide-react'

// Since Button is a default export or named? I used named export in my file creation.
// Let's check imports in next file.

export default function Home() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    }

    return (
        <div className="flex min-h-screen flex-col font-sans">
            <header className="px-6 h-16 flex items-center justify-between glass sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <Bookmark className="h-6 w-6 text-indigo-600" />
                    <span className="font-bold font-heading text-xl tracking-tight text-gray-900">Smart Bookmarks</span>
                </div>
                <nav className="flex gap-4">
                    <Link href="/login">
                        <Button variant="ghost">Sign In</Button>
                    </Link>
                    <Link href="/login">
                        <Button>Get Started</Button>
                    </Link>
                </nav>
            </header>

            <main className="flex-1 flex flex-col justify-center items-center relative overflow-hidden">
                {/* Background blobs */}
                <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

                <motion.div
                    className="container px-4 md:px-6 relative z-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="flex flex-col items-center space-y-8 text-center">
                        <motion.div variants={itemVariants} className="space-y-4">
                            <h1 className="text-5xl font-extrabold font-heading tracking-tighter sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-shimmer bg-[length:200%_auto] drop-shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                                Bookmarks Reimagined.
                            </h1>
                            <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl font-medium">
                                Sync your favorite sites instantly across all your devices.
                                Secure, private, and beautifully designed.
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex gap-4">
                            <Link href="/login">
                                <Button className="px-8 py-6 text-lg rounded-full">Start for Free</Button>
                            </Link>
                            <Link href="https://github.com" target="_blank">
                                <Button variant="secondary" className="px-8 py-6 text-lg rounded-full">
                                    View on GitHub
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Features Grid */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-5xl"
                        >
                            {[
                                { icon: Zap, title: "Instant Sync", desc: "Realtime updates across every tab and device." },
                                { icon: Shield, title: "Private & Secure", desc: "Your data is yours. Protected by Row Level Security." },
                                { icon: Star, title: "Modern Design", desc: "Clean interface focused on productivity." }
                            ].map((feature, i) => (
                                <div key={i} className="glass p-6 rounded-2xl text-left hover:scale-105 transition-transform duration-300">
                                    <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.desc}</p>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            </main>

            <footer className="py-8 w-full shrink-0 items-center px-4 md:px-6 border-t border-white/20 glass mt-auto">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">© 2024 Smart Bookmarks. Built with Next.js & Supabase.</p>
                    <nav className="flex gap-6">
                        <Link className="text-sm hover:text-indigo-600 transition-colors text-gray-500" href="#">Terms</Link>
                        <Link className="text-sm hover:text-indigo-600 transition-colors text-gray-500" href="#">Privacy</Link>
                    </nav>
                </div>
            </footer>
        </div>
    )
}
