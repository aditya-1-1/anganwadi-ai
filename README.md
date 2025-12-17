This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project

## Supabase Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api)
2. Create a new project or select an existing one
3. Navigate to **Settings** → **API**
4. Copy your **Project URL** and **anon/public key**

## Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Database Setup

Run the SQL scripts in the `scripts/` directory in order to set up your database schema:
1. `001_create_auth_profiles.sql`
2. `002_create_anganwadi_centers.sql`
3. `003_create_children.sql`
4. `004_create_growth_records.sql`
5. `005_create_nutrition_interventions.sql`
6. `006_create_alerts.sql`
7. `007_create_attendance.sql`
8. `008_create_triggers.sql`
9. `009_seed_sample_data.sql` (optional - for sample data)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Quick Deploy Steps:

1. **Push your code to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add Environment Variables**:
   In your Vercel project settings, add these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://vbposnipujztnsubtoji.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZicG9zbmlwdWp6dG5zdWJ0b2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MzIzNzksImV4cCI6MjA4MTUwODM3OX0.KM07ckSGLBFZoBLpRswjX2oY2kiGsyAiqTqcdMMaiOs`
   - `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` = `https://your-app.vercel.app/auth/sign-up-success` (optional)

4. **Deploy**: Click "Deploy" and your app will be live!

### Alternative: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and add your environment variables when asked.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
