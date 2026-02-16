'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addBookmark(title, url) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase.from('bookmarks').insert({
        title,
        url,
        user_id: user.id
    })

    if (error) {
        console.error('Error adding bookmark:', error)
        throw new Error('Failed to add bookmark')
    }

    revalidatePath('/dashboard')
}

export async function deleteBookmark(id) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase.from('bookmarks').delete().match({ id, user_id: user.id })

    if (error) {
        console.error('Error deleting bookmark:', error)
        throw new Error('Failed to delete bookmark')
    }

    revalidatePath('/dashboard')
}
