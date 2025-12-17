-- Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'holiday', 'sick')),
  meals_received TEXT[], -- Array of meals: ['breakfast', 'lunch', 'snack']
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, attendance_date)
);

-- Create index
CREATE INDEX idx_attendance_child_date ON public.attendance(child_id, attendance_date DESC);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Workers can manage attendance for children in their center"
  ON public.attendance FOR ALL
  USING (
    child_id IN (
      SELECT id FROM public.children
      WHERE anganwadi_center_id IN (
        SELECT anganwadi_center_id FROM public.profiles
        WHERE profiles.id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents can view their children's attendance"
  ON public.attendance FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM public.children
      WHERE parent_id = auth.uid()
    )
  );
