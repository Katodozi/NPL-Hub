# NPL Hub — Vercel Deployment Guide

## Step 1 — Push to GitHub

```bash
cd npl-hub
git init                          # if not already a git repo
git add .
git commit -m "feat: NPL Hub complete prototype"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/npl-hub.git
git push -u origin main
```

## Step 2 — Connect to Vercel

1. Go to vercel.com → Log in with GitHub
2. Click **Add New → Project**
3. Import your `npl-hub` repository
4. Framework preset: **Next.js** (auto-detected)
5. Root directory: leave as-is (it's the repo root)
6. Click **Deploy** — it will fail the first time (env vars missing)

## Step 3 — Add Environment Variables

In Vercel → your project → **Settings → Environment Variables**
Add all of these (copy from your .env.local):

| Key | Value |
|-----|-------|
| NEXT_PUBLIC_SUPABASE_URL | your supabase URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | your anon key |
| SUPABASE_SERVICE_ROLE_KEY | your service role key |
| NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME | your cloud name |
| CLOUDINARY_API_KEY | your api key |
| CLOUDINARY_API_SECRET | your api secret |
| NEXT_PUBLIC_SANITY_PROJECT_ID | your sanity project id |
| NEXT_PUBLIC_SANITY_DATASET | production |
| CRICKET_API_KEY | your cricketdata.org key |
| CRICKET_API_BASE | https://api.cricketdata.org/api/v1 |
| CRON_SECRET | generate-a-long-random-string |
| NEXT_PUBLIC_APP_URL | https://your-domain.vercel.app |

## Step 4 — Redeploy

After adding env vars:
Vercel → your project → **Deployments → Redeploy** latest

## Step 5 — Set up Supabase for production

In Supabase → Settings → Authentication → **URL Configuration**:
- Site URL: `https://your-domain.vercel.app`
- Redirect URLs: `https://your-domain.vercel.app/admin`

## Step 6 — Verify the cron job

vercel.json already has the cron configured:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-matches",
      "schedule": "0 18 * * *"
    }
  ]
}
```

This runs at 18:00 UTC daily (11:45 PM Nepal time — after matches end).
Vercel → your project → **Settings → Cron Jobs** to verify it shows up.

## Step 7 — Custom domain (optional)

Vercel → your project → **Settings → Domains**
Add `nplhub.com` (or whatever domain you buy)
Point DNS to Vercel's nameservers.

## Automatic deployments going forward

Every `git push origin main` → Vercel auto-deploys in ~2 minutes.
Pull requests → Vercel creates preview URLs automatically.

## Production checklist

- [ ] All env vars added to Vercel
- [ ] Supabase redirect URLs updated
- [ ] seed.sql run on production Supabase
- [ ] Admin account created in Supabase Auth
- [ ] Cloudinary upload preset created
- [ ] First player photos uploaded
- [ ] Cron job visible in Vercel dashboard
- [ ] sitemap accessible at /sitemap.xml
- [ ] robots.txt accessible at /robots.txt
- [ ] Lighthouse score > 85 on homepage
