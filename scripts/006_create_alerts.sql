-- Alerts Table (for malnutrition alerts, missed measurements, etc.)
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  anganwadi_center_id UUID NOT NULL REFERENCES public.anganwadi_centers(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('malnutrition_detected', 'missed_measurement', 'deteriorating_health', 'follow_up_due')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_by UUID REFERENCES public.profiles(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_alerts_center_status ON public.alerts(anganwadi_center_id, status);

-- Enable RLS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Workers can view alerts for their center"
  ON public.alerts FOR SELECT
  USING (
    anganwadi_center_id IN (
      SELECT anganwadi_center_id FROM public.profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Workers can update alerts for their center"
  ON public.alerts FOR UPDATE
  USING (
    anganwadi_center_id IN (
      SELECT anganwadi_center_id FROM public.profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Supervisors can view alerts in supervised centers"
  ON public.alerts FOR SELECT
  USING (
    anganwadi_center_id IN (
      SELECT id FROM public.anganwadi_centers
      WHERE supervisor_id = auth.uid()
    )
  );
