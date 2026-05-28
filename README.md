# tldraw-private

A private, password-protected tldraw board with persistent storage on Supabase.

It is designed for hobby deployments on Vercel and Supabase free tiers. Drawings are saved to Supabase Postgres, and pasted images/videos are uploaded to a private Supabase Storage bucket.

## Stack

- Next.js App Router
- tldraw
- Supabase Postgres
- Supabase Storage
- Vercel

## Features

- Password-protected access
- Persistent tldraw document snapshots
- Persistent pasted images and videos
- Private Supabase Storage bucket
- Optional tldraw license key
- No user accounts required

## Supabase Setup

Create a Supabase project, then open **SQL Editor** and run the contents of [`supabase.sql`](./supabase.sql).

That script creates:

- `public.drawings` table for the saved tldraw snapshot
- Row level security that blocks browser/client access
- Private `tldraw-assets` storage bucket for pasted files

The app uses the Supabase service role key only on server-side API routes.

## Vercel Environment Variables

Add these in **Vercel → Project → Settings → Environment Variables**:

```env
APP_PASSWORD=choose-a-strong-password
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Optional:

```env
DRAWING_ID=main
SUPABASE_ASSET_BUCKET=tldraw-assets
NEXT_PUBLIC_TLDRAW_LICENSE_KEY=your-tldraw-license-key
```

## Where To Find Supabase Values

In Supabase:

1. Open your project.
2. Go to **Project Settings → API**.
3. Copy **Project URL** into `SUPABASE_URL`.
4. Copy **service_role key** into `SUPABASE_SERVICE_ROLE_KEY`.

Keep `SUPABASE_SERVICE_ROLE_KEY` secret. Do not expose it in browser code.

## Local Development

Create `.env.local`:

```env
APP_PASSWORD=choose-a-strong-password
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Then install dependencies and run the Next.js dev server.

## Importing Existing tldraw Files

Open the deployed board, enter the password, then use tldraw's menu:

**File → Open file**

Select your `.tldr` file. After import, the app autosaves the board to Supabase.

## Security Notes

- The password is checked on the server.
- Auth state is stored in an httpOnly cookie.
- Drawing and asset API routes reject unauthenticated requests.
- Supabase Storage is private.
- Uploaded files are limited to common image/video MIME types and 20 MB per file.
- `SUPABASE_SERVICE_ROLE_KEY` must only be configured as a server-side environment variable.
