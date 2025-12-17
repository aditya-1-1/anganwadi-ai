export type UserRole = "anganwadi_worker" | "supervisor" | "parent" | "admin"

export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  role: UserRole
  anganwadi_center_id?: string
  created_at: string
  updated_at: string
}

export interface AnganwadiCenter {
  id: string
  center_name: string
  center_code: string
  address: string
  district: string
  state: string
  pincode?: string
  contact_number?: string
  supervisor_id?: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface Child {
  id: string
  anganwadi_center_id: string
  child_name: string
  date_of_birth: string
  gender: "male" | "female" | "other"
  blood_group?: string
  aadhaar_number?: string
  parent_id?: string
  enrollment_date: string
  photo_url?: string
  address?: string
  status: "active" | "inactive" | "transferred"
  created_at: string
  updated_at: string
}

export interface GrowthRecord {
  id: string
  child_id: string
  measurement_date: string
  age_months: number
  weight_kg?: number
  height_cm?: number
  muac_cm?: number
  head_circumference_cm?: number
  weight_for_age_zscore?: number
  height_for_age_zscore?: number
  weight_for_height_zscore?: number
  bmi_for_age_zscore?: number
  nutrition_status?: "normal" | "mam" | "sam" | "overweight" | "obese"
  stunting_status?: "normal" | "moderate" | "severe"
  wasting_status?: "normal" | "moderate" | "severe"
  hemoglobin_level?: number
  vitamin_a_given: boolean
  deworming_given: boolean
  recorded_by?: string
  notes?: string
  created_at: string
}

export interface Alert {
  id: string
  child_id: string
  anganwadi_center_id: string
  alert_type: "malnutrition_detected" | "missed_measurement" | "deteriorating_health" | "follow_up_due"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  status: "active" | "acknowledged" | "resolved"
  acknowledged_by?: string
  acknowledged_at?: string
  created_at: string
}
