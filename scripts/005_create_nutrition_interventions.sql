-- Nutrition Interventions Table
CREATE TABLE IF NOT EXISTS public.nutrition_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  intervention_type TEXT NOT NULL CHECK (intervention_type IN ('referral', 'counseling', 'supplementation', 'monitoring')),
  intervention_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  follow_up_date DATE,
  outcome TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.nutrition_interventions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Workers can manage interventions for children in their center"
  ON public.nutrition_interventions FOR ALL
  USING (
    child_id IN (
      SELECT id FROM public.children
      WHERE anganwadi_center_id IN (
        SELECT anganwadi_center_id FROM public.profiles
        WHERE profiles.id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents can view interventions for their children"
  ON public.nutrition_interventions FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM public.children
      WHERE parent_id = auth.uid()
    )
  );
