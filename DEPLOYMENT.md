# Deployment Guide

## Prerequisites

- ✅ Build passes locally (`npm run build`)
- ✅ Supabase project is set up
- ✅ Database scripts have been run in Supabase SQL Editor
- ✅ Environment variables are ready

## Deploy to Vercel (Recommended)

### Option 1: Deploy via Vercel Dashboard

1. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"
   - Select your repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**:
   Go to Project Settings → Environment Variables and add:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://vbposnipujztnsubtoji.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZicG9zbmlwdWp6dG5zdWJ0b2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MzIzNzksImV4cCI6MjA4MTUwODM3OX0.KM07ckSGLBFZoBLpRswjX2oY2kiGsyAiqTqcdMMaiOs
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://your-app.vercel.app/auth/sign-up-success
   ```

4. **Deploy**: Click "Deploy" button

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

When prompted, add your environment variables.

## Update Supabase Redirect URLs

After deployment, update your Supabase project settings:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/_/auth/url-configuration)
2. Add your Vercel URL to **Redirect URLs**:
   - `https://your-app.vercel.app/auth/sign-up-success`
   - `https://your-app.vercel.app/auth/callback` (if using OAuth)

## Verify Deployment

1. Visit your Vercel deployment URL
2. Test sign-up and login
3. Verify database connections work
4. Check that all routes are accessible

## Troubleshooting

### Build Fails
- Check that all TypeScript errors are resolved
- Ensure `npm run build` works locally
- Check Vercel build logs for specific errors

### Environment Variables Not Working
- Verify variables are set in Vercel project settings
- Ensure variable names match exactly (case-sensitive)
- Redeploy after adding new variables

### Database Connection Issues
- Verify Supabase project is active
- Check that RLS (Row Level Security) policies allow access
- Ensure database scripts have been run

## Other Deployment Options

### Netlify
Similar process to Vercel. Add environment variables in Netlify dashboard.

### Self-Hosted
1. Build the app: `npm run build`
2. Start production server: `npm start`
3. Set up reverse proxy (nginx/Apache)
4. Configure SSL certificate

