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
git clone <repository_url>
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

## ⚡ Realtime Implementation Explanation

The application achieves real-time synchronization using Supabase's Realtime capabilities, specifically PostgreSQL Change Data Capture (CDC).

**How it works:**
1.  **Subscription**: In `bookmark-manager.jsx`, we create a subscription to the `bookmarks` table using `supabase.channel()`.
2.  **Event Listening**: We listen for `postgres_changes` events. Specifically, we filter for `INSERT` and `DELETE` operations where the `user_id` matches the currently logged-in user.
3.  **State Update**:
    -   **On INSERT**: The new bookmark payload is immediately prepended to the local `bookmarks` state array.
    -   **On DELETE**: The bookmark with the matching ID is filtered out of the local state.
4.  **UI Reflection**: Because React state updates trigger a re-render, and `AnimatePresence` from framer-motion is used, the UI updates instantly with smooth entry/exit animations without needing a page refresh.

## ⚠️ Problems Encountered & Solutions

### 1. Unknown font `Geist` Build Error
- **Problem**: The initial Next.js boilerplate used a font called `Geist` which was not available in the installed version of Next.js, causing a "Module not found" error.
- **Solution**: Replaced the `Geist` font import with the standard `Inter` font from `next/font/google` in `app/layout.jsx`. Later, we upgraded the design to use `Outfit` and `Inter`.

### 2. PostCSS Config Syntax Error
- **Problem**: The `postcss.config.mjs` file (an ES Module) was using CommonJS `module.exports`, causing a `ReferenceError: module is not defined`.
- **Solution**: Updated the file to use ES Module syntax: `export default { ... }`.

### 3. 500 Internal Server Error & Port Conflicts
- **Problem**: The development server crashed with a 500 error because multiple instances of Node.js were trying to use port 3000.
- **Solution**: Used `taskkill /F /IM node.exe` to terminate all zombie Node processes and then restarted the server.

### 4. Missing `autoprefixer` Dependency
- **Problem**: Tailwind CSS styles were not building correctly because `autoprefixer` was missing from `devDependencies` after migrating the project structure.
- **Solution**: Installed it via `npm install -D autoprefixer --legacy-peer-deps`.

### 5. Double Loading Spinners
- **Problem**: Authenticating with Google showed two loading spinners simultaneously—one inside the `Button` component (which auto-detects `disabled` state) and another manually rendered in the `LoginPage`.
- **Solution**: Refactored the `Button` component to accept a dedicated `loading` prop and updated `LoginPage` to pass the loading state to the button instead of rendering a separate spinner.

### 6. ESLint 9 vs eslint-config-next Version Conflict
- **Problem**: Deployment failed on Vercel because `eslint-config-next@16` requires `eslint@^9`, but the project had `eslint@^8` installed.
- **Solution**: Upgraded `eslint` to version `^9` in `package.json` to match the peer dependency requirement.

### 7. Auth Redirect to Localhost in Production
- **Problem**: After signing in on the deployed Vercel app, users were redirected to `localhost:3000`, causing a "Connection Refused" error.
- **Solution**:
    - Created a utility function `getURL()` that dynamically determines the site URL based on environment variables (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_VERCEL_URL`) or defaults to localhost only in development.
    - Updated `app/login/page.jsx` to use this dynamic URL for the `redirectTo` parameter.
    - Updated `app/auth/callback/route.js` to correctly handle `x-forwarded-host` headers for proper redirection behind Vercel's proxy.
