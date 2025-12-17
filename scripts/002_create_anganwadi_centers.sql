-- Anganwadi Centers Table
CREATE TABLE IF NOT EXISTS public.anganwadi_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_name TEXT NOT NULL,
  center_code TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT,
  contact_number TEXT,
  supervisor_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.anganwadi_centers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Workers can view their own center"
  ON public.anganwadi_centers FOR SELECT
  USING (
    id IN (
      SELECT anganwadi_center_id FROM public.profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Supervisors can view centers they supervise"
  ON public.anganwadi_centers FOR SELECT
  USING (supervisor_id = auth.uid());

CREATE POLICY "Admins can view all centers"
  ON public.anganwadi_centers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
