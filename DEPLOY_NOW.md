# Quick Deploy Instructions

## Deploy to Vercel Now

### Step 1: Login to Vercel
```bash
vercel login
```
This will open a browser for you to authenticate.

### Step 2: Deploy
```bash
vercel
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No (for first time)
- **Project name?** → Press Enter (uses default) or type a name
- **Directory?** → Press Enter (uses current directory)
- **Override settings?** → No

### Step 3: Add Environment Variables
When prompted, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://vbposnipujztnsubtoji.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZicG9zbmlwdWp6dG5zdWJ0b2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MzIzNzksImV4cCI6MjA4MTUwODM3OX0.KM07ckSGLBFZoBLpRswjX2oY2kiGsyAiqTqcdMMaiOs
```

**OR** add them later in Vercel Dashboard:
1. Go to your project on vercel.com
2. Settings → Environment Variables
3. Add each variable

### Step 4: Deploy to Production
```bash
vercel --prod
```

### Step 5: Update Supabase Redirect URLs
After deployment, you'll get a URL like: `https://your-app.vercel.app`

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/vbposnipujztnsubtoji/auth/url-configuration)
2. Add to **Redirect URLs**:
   - `https://your-app.vercel.app/auth/sign-up-success`
   - `https://your-app.vercel.app/auth/callback` (if using OAuth)

## Alternative: Deploy via GitHub

If you prefer GitHub integration:

1. **Create GitHub repo:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import from GitHub
   - Add environment variables
   - Deploy

