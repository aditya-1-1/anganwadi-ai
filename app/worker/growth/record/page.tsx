"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Scale, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface Child {
  id: string
  child_name: string
  date_of_birth: string
  gender: string
}

export default function RecordGrowthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedChildId = searchParams.get("childId")

  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingChildren, setIsLoadingChildren] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nutritionWarning, setNutritionWarning] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    childId: preselectedChildId || "",
    measurementDate: new Date().toISOString().split("T")[0],
    weightKg: "",
    heightCm: "",
    muacCm: "",
    headCircumferenceCm: "",
    hemoglobinLevel: "",
    vitaminAGiven: false,
    dewormingGiven: false,
    notes: "",
  })

  useEffect(() => {
    loadChildren()
  }, [])

  useEffect(() => {
    if (formData.childId) {
      const child = children.find((c) => c.id === formData.childId)
      setSelectedChild(child || null)
      analyzeNutrition()
    }
  }, [formData.childId, formData.weightKg, formData.heightCm, formData.muacCm, children])

  const loadChildren = async () => {
    const supabase = createClient()
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from("profiles").select("anganwadi_center_id").eq("id", user.id).single()

      if (!profile?.anganwadi_center_id) return

      const { data, error } = await supabase
        .from("children")
        .select("id, child_name, date_of_birth, gender")
        .eq("anganwadi_center_id", profile.anganwadi_center_id)
        .eq("status", "active")
        .order("child_name")

      if (error) throw error
      setChildren(data || [])

      if (preselectedChildId) {
        const child = data?.find((c) => c.id === preselectedChildId)
        setSelectedChild(child || null)
      }
    } catch (err: any) {
      setError("Failed to load children")
    } finally {
      setIsLoadingChildren(false)
    }
  }

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    return ageInMonths
  }

  const analyzeNutrition = () => {
    if (!selectedChild || !formData.weightKg || !formData.heightCm) {
      setNutritionWarning(null)
      return
    }

    const ageMonths = calculateAge(selectedChild.date_of_birth)
    const weight = Number.parseFloat(formData.weightKg)
    const height = Number.parseFloat(formData.heightCm)
    const muac = formData.muacCm ? Number.parseFloat(formData.muacCm) : null

    // Simple malnutrition detection logic
    // In production, this would use WHO z-score tables
    const warnings: string[] = []

    // MUAC-based detection (simplified)
    if (muac) {
      if (muac < 11.5) {
        warnings.push("SEVERE: MUAC indicates Severe Acute Malnutrition (SAM)")
      } else if (muac < 12.5) {
        warnings.push("MODERATE: MUAC indicates Moderate Acute Malnutrition (MAM)")
      }
    }

    // Weight for age (very simplified)
    const expectedWeight = ageMonths * 0.4 + 3.5 // Rough estimate
    const weightRatio = weight / expectedWeight

    if (weightRatio < 0.7) {
      warnings.push("SEVERE: Weight is significantly below expected for age")
    } else if (weightRatio < 0.8) {
      warnings.push("MODERATE: Weight is below expected for age")
    }

    // Height for age (simplified)
    const expectedHeight = ageMonths * 0.8 + 50 // Rough estimate
    const heightRatio = height / expectedHeight

    if (heightRatio < 0.85) {
      warnings.push("WARNING: Height indicates possible stunting")
    }

    if (warnings.length > 0) {
      setNutritionWarning(warnings.join(". "))
    } else {
      setNutritionWarning("Child's measurements appear to be within normal range")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      if (!selectedChild) throw new Error("Please select a child")

      const ageMonths = calculateAge(selectedChild.date_of_birth)

      // Calculate nutrition status (simplified logic)
      let nutritionStatus: "normal" | "mam" | "sam" | "overweight" | "obese" = "normal"

      const muac = formData.muacCm ? Number.parseFloat(formData.muacCm) : null
      if (muac) {
        if (muac < 11.5) nutritionStatus = "sam"
        else if (muac < 12.5) nutritionStatus = "mam"
      }

      // Insert growth record
      const { data: growthRecord, error: insertError } = await supabase
        .from("growth_records")
        .insert({
          child_id: formData.childId,
          measurement_date: formData.measurementDate,
          age_months: ageMonths,
          weight_kg: formData.weightKg ? Number.parseFloat(formData.weightKg) : null,
          height_cm: formData.heightCm ? Number.parseFloat(formData.heightCm) : null,
          muac_cm: formData.muacCm ? Number.parseFloat(formData.muacCm) : null,
          head_circumference_cm: formData.headCircumferenceCm ? Number.parseFloat(formData.headCircumferenceCm) : null,
          hemoglobin_level: formData.hemoglobinLevel ? Number.parseFloat(formData.hemoglobinLevel) : null,
          vitamin_a_given: formData.vitaminAGiven,
          deworming_given: formData.dewormingGiven,
          nutrition_status: nutritionStatus,
          recorded_by: user.id,
          notes: formData.notes || null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Create alert if malnutrition detected
      if (nutritionStatus === "sam" || nutritionStatus === "mam") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("anganwadi_center_id")
          .eq("id", user.id)
          .single()

        if (!profile?.anganwadi_center_id) {
          throw new Error("Profile not found or missing center assignment")
        }

        await supabase.from("alerts").insert({
          child_id: formData.childId,
          anganwadi_center_id: profile.anganwadi_center_id,
          alert_type: "malnutrition_detected",
          severity: nutritionStatus === "sam" ? "critical" : "high",
          title: `${nutritionStatus === "sam" ? "Severe" : "Moderate"} Malnutrition Detected`,
          description: `Child ${selectedChild.child_name} has been identified with ${nutritionStatus === "sam" ? "Severe Acute Malnutrition (SAM)" : "Moderate Acute Malnutrition (MAM)"}. Immediate intervention required.`,
          status: "active",
        })
      }

      router.push(`/worker/children/${formData.childId}`)
    } catch (err: any) {
      setError(err.message || "Failed to record growth data")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingChildren) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/worker/dashboard">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">Record Growth Measurements</h1>
              <p className="text-sm text-emerald-700">Track child's weight, height, and nutrition indicators</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="border-emerald-100 shadow-lg">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-3 text-blue-900">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Scale className="w-6 h-6 text-white" />
              </div>
              Growth Measurement Form
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Select Child */}
              <div className="space-y-2">
                <Label htmlFor="childId" className="text-base font-semibold text-emerald-900">
                  Select Child <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.childId}
                  onValueChange={(value) => setFormData({ ...formData, childId: value })}
                  disabled={isLoading || !!preselectedChildId}
                  required
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Choose a child" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.child_name} ({calculateAge(child.date_of_birth)} months, {child.gender})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Measurement Date */}
              <div className="space-y-2">
                <Label htmlFor="measurementDate" className="text-base font-semibold text-emerald-900">
                  Measurement Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="measurementDate"
                  type="date"
                  required
                  value={formData.measurementDate}
                  onChange={(e) => setFormData({ ...formData, measurementDate: e.target.value })}
                  className="h-12 text-base"
                  disabled={isLoading}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Weight */}
                <div className="space-y-2">
                  <Label htmlFor="weightKg" className="text-base font-semibold text-emerald-900">
                    Weight (kg) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="weightKg"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 12.5"
                    required
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    className="h-12 text-base"
                    disabled={isLoading}
                  />
                </div>

                {/* Height */}
                <div className="space-y-2">
                  <Label htmlFor="heightCm" className="text-base font-semibold text-emerald-900">
                    Height (cm) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="heightCm"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 85.5"
                    required
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                    className="h-12 text-base"
                    disabled={isLoading}
                  />
                </div>

                {/* MUAC */}
                <div className="space-y-2">
                  <Label htmlFor="muacCm" className="text-base font-semibold text-emerald-900">
                    MUAC (cm) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="muacCm"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 13.2"
                    required
                    value={formData.muacCm}
                    onChange={(e) => setFormData({ ...formData, muacCm: e.target.value })}
                    className="h-12 text-base"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-emerald-600">Mid-Upper Arm Circumference</p>
                </div>

                {/* Head Circumference */}
                <div className="space-y-2">
                  <Label htmlFor="headCircumferenceCm" className="text-base font-semibold text-emerald-900">
                    Head Circumference (cm)
                  </Label>
                  <Input
                    id="headCircumferenceCm"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 45.5"
                    value={formData.headCircumferenceCm}
                    onChange={(e) => setFormData({ ...formData, headCircumferenceCm: e.target.value })}
                    className="h-12 text-base"
                    disabled={isLoading}
                  />
                </div>

                {/* Hemoglobin */}
                <div className="space-y-2">
                  <Label htmlFor="hemoglobinLevel" className="text-base font-semibold text-emerald-900">
                    Hemoglobin (g/dL)
                  </Label>
                  <Input
                    id="hemoglobinLevel"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 11.5"
                    value={formData.hemoglobinLevel}
                    onChange={(e) => setFormData({ ...formData, hemoglobinLevel: e.target.value })}
                    className="h-12 text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Interventions */}
              <div className="space-y-4 p-4 bg-emerald-50 rounded-lg">
                <h3 className="font-semibold text-emerald-900">Health Interventions</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.vitaminAGiven}
                      onChange={(e) => setFormData({ ...formData, vitaminAGiven: e.target.checked })}
                      className="w-5 h-5 rounded border-emerald-300"
                      disabled={isLoading}
                    />
                    <span className="text-emerald-900">Vitamin A supplementation given</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.dewormingGiven}
                      onChange={(e) => setFormData({ ...formData, dewormingGiven: e.target.checked })}
                      className="w-5 h-5 rounded border-emerald-300"
                      disabled={isLoading}
                    />
                    <span className="text-emerald-900">Deworming medicine given</span>
                  </label>
                </div>
              </div>

              {/* Nutrition Warning */}
              {nutritionWarning && (
                <Alert
                  className={
                    nutritionWarning.includes("SEVERE")
                      ? "border-red-500 bg-red-50"
                      : nutritionWarning.includes("MODERATE")
                        ? "border-orange-500 bg-orange-50"
                        : nutritionWarning.includes("WARNING")
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-green-500 bg-green-50"
                  }
                >
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      nutritionWarning.includes("SEVERE")
                        ? "text-red-600"
                        : nutritionWarning.includes("MODERATE")
                          ? "text-orange-600"
                          : nutritionWarning.includes("WARNING")
                            ? "text-yellow-600"
                            : "text-green-600"
                    }`}
                  />
                  <AlertDescription
                    className={
                      nutritionWarning.includes("SEVERE")
                        ? "text-red-900"
                        : nutritionWarning.includes("MODERATE")
                          ? "text-orange-900"
                          : nutritionWarning.includes("WARNING")
                            ? "text-yellow-900"
                            : "text-green-900"
                    }
                  >
                    {nutritionWarning}
                  </AlertDescription>
                </Alert>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base font-semibold text-emerald-900">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any observations or concerns..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="min-h-24 text-base"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Link href="/worker/dashboard" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base bg-transparent"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 h-12 text-base bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Scale className="w-5 h-5 mr-2" />
                      Save Measurements
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-blue-100 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-3">MUAC Malnutrition Guidelines</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-blue-900">
                  <strong>SAM (Severe):</strong> MUAC less than 11.5 cm
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-blue-900">
                  <strong>MAM (Moderate):</strong> MUAC between 11.5 - 12.5 cm
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-blue-900">
                  <strong>Normal:</strong> MUAC greater than 12.5 cm
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
