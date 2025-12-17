-- Children Table
CREATE TABLE IF NOT EXISTS public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anganwadi_center_id UUID NOT NULL REFERENCES public.anganwadi_centers(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  blood_group TEXT,
  aadhaar_number TEXT,
  parent_id UUID REFERENCES public.profiles(id),
  enrollment_date DATE DEFAULT CURRENT_DATE,
  photo_url TEXT,
  address TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- RLS Policies for children
CREATE POLICY "Workers can view children in their center"
  ON public.children FOR SELECT
  USING (
    anganwadi_center_id IN (
      SELECT anganwadi_center_id FROM public.profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Workers can insert children in their center"
  ON public.children FOR INSERT
  WITH CHECK (
    anganwadi_center_id IN (
      SELECT anganwadi_center_id FROM public.profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Workers can update children in their center"
  ON public.children FOR UPDATE
  USING (
    anganwadi_center_id IN (
      SELECT anganwadi_center_id FROM public.profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their own children"
  ON public.children FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Supervisors can view children in supervised centers"
  ON public.children FOR SELECT
  USING (
    anganwadi_center_id IN (
      SELECT id FROM public.anganwadi_centers
      WHERE supervisor_id = auth.uid()
    )
  );
