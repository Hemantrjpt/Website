# TITANIC HUB

Next.js 16 + Supabase + Vercel creator-resource platform.

## Features
- Public catalogue for original Roblox Studio scripts, plugins, assets and tutorials.
- Supabase email/password authentication and member library.
- Admin control room for catalogue publishing, announcements and licence assignment.
- Public cover-image bucket and private download bucket.
- Private downloads require a signed-in account and an active access grant; signed URLs expire after 60 seconds.
- Row Level Security on all new tables. Admin checks use server-managed `app_metadata.role`, never user-editable metadata.

## Environment
Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel and local `.env.local`. No service-role key is used in the web app.

## Admin setup
1. Create an account at `/login`.
2. In Supabase Auth user management, assign `app_metadata.role = admin` to the intended account (server-side only).
3. Sign out and back in so the refreshed JWT contains the role.
4. Open `/admin`.

## Storage
The migration creates public `titanichub-assets` for images and private `titanichub-downloads` for files. Private objects use the path `<catalog-item-uuid>/<filename>`.

## Deploy
Use the Next.js framework preset on Vercel with Node 22 or newer. Configure the two public Supabase variables for Production, Preview and Development. Apply the Supabase migration before publishing content.

## Content scope
For original Roblox Studio development resources, plugins, assets and educational tutorials only. No exploit-loader or unfair-gameplay automation distribution.
