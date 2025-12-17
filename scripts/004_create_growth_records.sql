-- Growth Records Table (Height, Weight, MUAC measurements)
CREATE TABLE IF NOT EXISTS public.growth_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  age_months INTEGER NOT NULL,
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  muac_cm DECIMAL(4,1),
  head_circumference_cm DECIMAL(5,2),
  
  -- WHO Z-scores (calculated)
  weight_for_age_zscore DECIMAL(4,2),
  height_for_age_zscore DECIMAL(4,2),
  weight_for_height_zscore DECIMAL(4,2),
  bmi_for_age_zscore DECIMAL(4,2),
  
  -- Nutrition status classification
  nutrition_status TEXT CHECK (nutrition_status IN ('normal', 'mam', 'sam', 'overweight', 'obese')),
  stunting_status TEXT CHECK (stunting_status IN ('normal', 'moderate', 'severe')),
  wasting_status TEXT CHECK (wasting_status IN ('normal', 'moderate', 'severe')),
  
  -- Additional health indicators
  hemoglobin_level DECIMAL(4,1),
  vitamin_a_given BOOLEAN DEFAULT false,
  deworming_given BOOLEAN DEFAULT false,
  
  -- Record metadata
  recorded_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_growth_records_child_date ON public.growth_records(child_id, measurement_date DESC);

-- Enable RLS
ALTER TABLE public.growth_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Workers can view records for children in their center"
  ON public.growth_records FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM public.children
      WHERE anganwadi_center_id IN (
        SELECT anganwadi_center_id FROM public.profiles
        WHERE profiles.id = auth.uid()
      )
    )
  );

CREATE POLICY "Workers can insert records for children in their center"
  ON public.growth_records FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT id FROM public.children
      WHERE anganwadi_center_id IN (
        SELECT anganwadi_center_id FROM public.profiles
        WHERE profiles.id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents can view their children's records"
  ON public.growth_records FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM public.children
      WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Supervisors can view records in supervised centers"
  ON public.growth_records FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM public.children
      WHERE anganwadi_center_id IN (
        SELECT id FROM public.anganwadi_centers
        WHERE supervisor_id = auth.uid()
      )
    )
  );
