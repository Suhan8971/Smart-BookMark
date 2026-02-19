# Smart Bookmark Manager

A production-ready Smart Bookmark Manager web application where users can log in with Google and manage private bookmarks in real time across multiple tabs.

## 🚀 Features

- **Authentication**: Secure Google OAuth login via Supabase.
- **Realtime Sync**: Bookmarks update instantly across all open tabs.
- **Privacy**: Row Level Security (RLS) ensures users only see their own bookmarks.
- **Modern UI**: Clean, responsive interface built with Next.js 14+, Tailwind CSS, Glassmorphism, and Framer Motion animations.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide React, Framer Motion
- **Backend**: Supabase (Auth, Postgres, Realtime)
- **Deployment**: Vercel

## 📦 Setup Instructions

### 1. Clone the repository
```bash
cd smart-bookmark-manager
npm install
```

### 2. Configure Supabase
1. Create a new Supabase project.
2. Go to **Authentication -> Providers** and enable **Google**.
3. Go to **SQL Editor** and run the following script to set up the database:

```sql
-- Create bookmarks table
create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table bookmarks enable row level security;

-- Policy: Users can view their own bookmarks
create policy "Users can view own bookmarks"
on bookmarks for select
using (auth.uid() = user_id);

-- Policy: Users can insert their own bookmarks
create policy "Users can insert own bookmarks"
on bookmarks for insert
with check (auth.uid() = user_id);

-- Policy: Users can delete their own bookmarks
create policy "Users can delete own bookmarks"
on bookmarks for delete
using (auth.uid() = user_id);

-- Enable Realtime for bookmarks table
alter publication supabase_realtime add table bookmarks;
```

### 3. Set up Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## Troubleshooting & Recent Fixes

During development, we encountered and resolved several critical issues to ensure a smooth, cross-device experience.

### 1. Authentication Redirect Loop
**Issue:** Users encountered an infinite redirect loop or were redirected to the homepage instead of the dashboard after Google Sign-In on Vercel.
**Solution:**
- **Proxy Handling:** Updated the `auth/callback` route to prioritize the `x-forwarded-host` header over `origin` when constructing the redirect URL. This ensures correct redirection when the app is running behind Vercel's edge proxies.
- **Dynamic Redirects:** The callback route now dynamically builds the final URL based on the environment (Localhost vs. Production), preventing mismatches between HTTP/HTTPS and domain names.

## 🔐 Authentication Implementation

The application uses **Supabase Auth** with Google OAuth 2.0 for secure, passwordless login.

### Flow Overview
1. **Client-Side Initiation (`/login`):**
   - The user clicks "Continue with Google".
   - `supabase.auth.signInWithOAuth` is called with `redirectTo` set to `[Current-URL]/auth/callback`.
2. **Supabase Processing:**
   - Supabase handles the Google consent screen and redirects the user back to the `/auth/callback` route with a temporary `code`.
3. **Server-Side Exchange (`/auth/callback`):**
   - The Next.js Route Handler intercepts the request.
   - It exchanges the `code` for a secure User Session using `supabase.auth.exchangeCodeForSession(code)`.
   - The session is stored in a secure, HTTP-only cookie.
4. **Middleware Protection:**
   - Middleware runs on every request to protected routes (like `/dashboard`).
   - It verifies the session cookie. Valid sessions are allowed through; invalid sessions are redirected to `/login`.

### 2. Bookmark Deletion Failure
**Issue:** Clicking the delete button did not remove the bookmark from the database.
**Solution:**
- Updated the server action `deleteBookmark` to use specific `.eq('id', id).eq('user_id', user.id)` filters instead of `.match()`, ensuring the query correctly targeted the row to delete.


### 3. Real-Time Cross-Tab Synchronization
**Issue:** Adding or deleting a bookmark in one tab updated that tab and mobile devices, but a second open desktop tab would not update without a refresh.
**Solution:**
- **Unique Channels:** Assigned a unique channel ID to each tab connection (`realtime-bookmarks-${userId}-${Math.random()}`) to prevent the browser from merging connections and dropping events.
- **Event Filtering:** Removed restrictive server-side filters for `DELETE` events (as they often lack full row data) and implemented robust client-side filtering to ensure updates are processed correctly.
- **State Sync:** Added a `useEffect` to sync the local `bookmarks` state whenever the `initialBookmarks` prop updates (triggered by server action revalidation).
- **Optimistic Updates Removed:** Removed manual optimistic updates to rely entirely on the server's Realtime broadcast, guaranteeing that all tabs remain in perfect sync.


## 🌍 Deployment on Vercel

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add the **Environment Variables** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. **Important**: Add your Vercel deployment URL (e.g., `https://your-app.vercel.app`) to your Supabase **Authentication -> URL Configuration -> Site URL** and **Redirect URLs**.

## 🧩 Project Structure

- `app/`: Next.js App Router pages and layouts.
- `app/dashboard/`: Protected dashboard routes.
- `utils/supabase/`: Supabase client and server utilities.
- `middleware.ts`: Authenticated route protection.
- `components/`: UI components.




