-- Fix the infinite recursion in RLS policy
-- The "Admins can view all profiles" policy causes infinite recursion
-- We need to fix it by checking the user's role directly from auth.users metadata

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a better admin policy that doesn't cause recursion
-- This checks the user's role from their own profile (which they can always see)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    -- User can always see their own profile
    auth.uid() = id
    OR
    -- Check if current user is an admin by looking at their own profile
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'admin'
    )
  );

