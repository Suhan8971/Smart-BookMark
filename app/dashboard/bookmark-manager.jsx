'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Trash2, Plus, ExternalLink, Loader2, Globe, Search } from 'lucide-react'
import { addBookmark, deleteBookmark } from './actions'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

function ClientDate({ date }) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    if (!mounted) return <span className="opacity-0">Loading...</span>

    return <>{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</>
}

export default function BookmarkManager({ initialBookmarks, userId }) {
    const [bookmarks, setBookmarks] = useState(initialBookmarks)
    const [supabase] = useState(() => createClient())
    const [url, setUrl] = useState('')
    const [title, setTitle] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [search, setSearch] = useState('')

    // Sync state with props (Server Action revalidation)
    useEffect(() => {
        setBookmarks(initialBookmarks)
    }, [initialBookmarks])

    // Realtime Subscription
    useEffect(() => {
        // Unique channel name to prevent conflicts across tabs/instances
        const channelId = `realtime-bookmarks-${userId}-${Math.random()}`

        const channel = supabase
            .channel(channelId)
            .on('postgres_changes', {
                event: '*', // Listen to all events
                schema: 'public',
                table: 'bookmarks'
                // Removed server-side filter to rely on RLS and client-side check
            }, (payload) => {
                console.log('Realtime Event received:', payload)

                // Manual check to ensure we only process our own data
                // (Note: RLS should already enforce this, but this is a safety double-check)
                if (payload.new && payload.new.user_id && payload.new.user_id !== userId) return
                if (payload.old && payload.old.user_id && payload.old.user_id !== userId) {
                    // For deletes, usually user_id isn't in payload.old unless table is REPLICA IDENTITY FULL
                    // So we might skip this check for deletes if strictly needed, 
                    // but let's assume if it's there we check it.
                }

                if (payload.eventType === 'INSERT') {
                    setBookmarks((prev) => {
                        if (prev.find(b => b.id === payload.new.id)) {
                            return prev
                        }
                        return [payload.new, ...prev]
                    })
                } else if (payload.eventType === 'DELETE') {
                    setBookmarks((prev) => prev.filter(b => b.id !== payload.old.id))
                }
            })
            .subscribe((status) => {
                console.log(`Realtime Subscription Status for ${channelId}:`, status)
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, userId])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title || !url) return

        setIsAdding(true)
        try {
            await addBookmark(title, url)
            setTitle('')
            setUrl('')
        } catch (error) {
            console.error('Failed to add bookmark', error)
        } finally {
            setIsAdding(false)
        }
    }

    const handleDelete = async (id) => {
        // Optimistic update removed to rely on Realtime for cross-tab consistency
        // const previousBookmarks = bookmarks
        // setBookmarks(bookmarks.filter(b => b.id !== id))

        try {
            await deleteBookmark(id)
        } catch (error) {
            console.error('Failed to delete', error)
            // Revert on failure
            // setBookmarks(previousBookmarks)
        }
    }

    const filteredBookmarks = bookmarks.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.url.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-8">
            {/* ADD FORM CARD */}
            <Card className="border-t-4 border-indigo-500">
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:flex-1 space-y-2">
                        <label htmlFor="title" className="text-sm font-semibold text-gray-700 ml-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 p-3 transition-shadow"
                            placeholder="e.g., My Favorite Blog"
                            required
                        />
                    </div>
                    <div className="w-full md:flex-1 space-y-2">
                        <label htmlFor="url" className="text-sm font-semibold text-gray-700 ml-1">URL</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                <Globe className="h-4 w-4" />
                            </div>
                            <input
                                type="url"
                                name="url"
                                id="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 p-3 pl-10 transition-shadow"
                                placeholder="https://example.com"
                                required
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={isAdding}
                        className="w-full md:w-auto h-[50px] px-8 rounded-xl"
                    >
                        {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                        <span className="ml-2">Add</span>
                    </Button>
                </form>
            </Card>

            {/* SEARCH BAR */}
            <div className="relative max-w-md mx-auto md:mx-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search bookmarks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* LIST */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <AnimatePresence mode='popLayout'>
                    {filteredBookmarks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="col-span-full py-12 text-center text-gray-500 bg-white/50 rounded-xl border border-dashed border-gray-300"
                        >
                            No bookmarks found.
                        </motion.div>
                    ) : (
                        filteredBookmarks.map((bookmark) => (
                            <motion.div
                                layout
                                key={bookmark.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                className="group relative"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-75 transition duration-500 blur"></div>
                                <div className="relative h-full bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                                    <div>
                                        <div className="flex items-start justify-between">
                                            <h3 className="text-lg font-bold font-heading text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                {bookmark.title}
                                            </h3>
                                            <button
                                                onClick={() => handleDelete(bookmark.id)}
                                                className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <a
                                            href={bookmark.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-gray-500 mt-2 flex items-center gap-1 hover:underline truncate"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            {new URL(bookmark.url).hostname}
                                        </a>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                                        <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-full min-h-[24px] min-w-[80px] inline-flex items-center justify-center">
                                            {/* Date placeholder to prevent hydration mismatch */}
                                            <ClientDate date={bookmark.created_at} />
                                        </span>
                                        <a
                                            href={bookmark.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
                                        >
                                            Visit Site
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
