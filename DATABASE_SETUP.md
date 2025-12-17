# Database Setup Guide

## Important: Run These SQL Scripts in Supabase

Your login is failing because the database tables haven't been created yet. Follow these steps:

### Step 1: Access Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `vbposnipujztnsubtoji`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run SQL Scripts in Order

Run each script **one at a time** in this exact order:

#### 1. Create Profiles Table
```sql
-- Copy and paste the entire contents of scripts/001_create_auth_profiles.sql
```
**Or run this:**
```sql
-- Create profiles table with role-based access
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('anganwadi_worker', 'supervisor', 'parent', 'admin')),
  anganwadi_center_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### 2. Create Other Tables
Run the remaining scripts in order:
- `002_create_anganwadi_centers.sql`
- `003_create_children.sql`
- `004_create_growth_records.sql`
- `005_create_nutrition_interventions.sql`
- `006_create_alerts.sql`
- `007_create_attendance.sql`

#### 3. Create Triggers (IMPORTANT!)
Run `008_create_triggers.sql` - This auto-creates profiles when users sign up.

#### 4. (Optional) Seed Sample Data
Run `009_seed_sample_data.sql` if you want test data.

### Step 3: Verify Setup

After running the scripts, verify:

1. **Check Tables Exist:**
   - Go to **Table Editor** in Supabase
   - You should see: `profiles`, `anganwadi_centers`, `children`, etc.

2. **Check RLS Policies:**
   - Go to **Authentication** → **Policies**
   - Verify policies are created for `profiles` table

3. **Test Login:**
   - Try logging in again
   - If profile doesn't exist, the app will auto-create one

### Troubleshooting

#### Error: "relation does not exist"
- Make sure you ran `001_create_auth_profiles.sql` first
- Check that you're in the correct database/schema

#### Error: "permission denied"
- Check RLS policies are created
- Verify the INSERT policy exists for profiles

#### Error: "duplicate key value"
- Profile already exists - this is fine, the app will handle it

#### Still Getting 500 Error?
1. Check Supabase logs: **Logs** → **Postgres Logs**
2. Verify the `profiles` table exists
3. Check RLS policies are enabled
4. Try creating a new user account

### Quick Fix for Existing Users

If you already have users but no profiles:

```sql
-- Create profiles for existing users
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  COALESCE(raw_user_meta_data->>'role', 'parent')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
```

