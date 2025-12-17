-- Insert sample Anganwadi center
INSERT INTO public.anganwadi_centers (id, center_name, center_code, address, district, state, pincode, contact_number)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Model Anganwadi Center', 'AWC001', 'Village Road, Near Primary School', 'Sample District', 'Sample State', '123456', '9876543210')
ON CONFLICT (center_code) DO NOTHING;
