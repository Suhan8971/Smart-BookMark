import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BookmarkManager from './bookmark-manager'
import { SignOutButton } from './sign-out-button'
import { Bookmark, LayoutGrid } from 'lucide-react'

export default async function Dashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Modern Glass Header */}
            <nav className="glass sticky top-0 z-40 border-b border-gray-200/50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 text-white">
                                <Bookmark className="h-6 w-6" />
                            </div>
                            <h1 className="text-xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 hidden sm:block">
                                Smart Bookmarks
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col items-end mr-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Signed in as</span>
                                <span className="text-sm font-medium text-gray-900">{user.email}</span>
                            </div>
                            <div className="h-8 w-[1px] bg-gray-200 hidden md:block"></div>
                            <SignOutButton />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold font-heading text-gray-900">Your Collection</h2>
                    <p className="text-gray-500 mt-1">Manage and sync your favorite links.</p>
                </div>
                <BookmarkManager initialBookmarks={bookmarks ?? []} userId={user.id} />
            </main>
        </div>
    )
}
