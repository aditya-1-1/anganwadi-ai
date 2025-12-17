"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, UserPlus } from "lucide-react"
import Link from "next/link"

export default function NewChildPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    childName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    aadhaarNumber: "",
    address: "",
    parentEmail: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Get current user and profile
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: profile } = await supabase.from("profiles").select("anganwadi_center_id").eq("id", user.id).single()

      if (!profile?.anganwadi_center_id) {
        throw new Error("No Anganwadi center assigned to your account")
      }

      // If a parent email is provided, try to find the parent profile
      let parentId: string | null = null
      if (formData.parentEmail.trim()) {
        const { data: parentProfile, error: parentError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("email", formData.parentEmail.trim().toLowerCase())
          .single()

        if (parentError && parentError.code !== "PGRST116") {
          // Unexpected error looking up parent
          console.error("Failed to look up parent profile:", parentError)
        } else if (parentProfile && parentProfile.role === "parent") {
          parentId = parentProfile.id
        }
      }

      // Insert child
      const { data: child, error: insertError } = await supabase
        .from("children")
        .insert({
          anganwadi_center_id: profile.anganwadi_center_id,
          child_name: formData.childName,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          blood_group: formData.bloodGroup || null,
          aadhaar_number: formData.aadhaarNumber || null,
          address: formData.address || null,
          parent_id: parentId,
          status: "active",
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push(`/worker/children/${child.id}`)
    } catch (err: any) {
      setError(err.message || "Failed to register child")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/worker/children">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">Register New Child</h1>
              <p className="text-sm text-emerald-700">Add a child to your Anganwadi center</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-emerald-100 shadow-lg">
          <CardHeader className="bg-emerald-50">
            <CardTitle className="flex items-center gap-3 text-emerald-900">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              Child Registration Form
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Child Name */}
              <div className="space-y-2">
                <Label htmlFor="childName" className="text-base font-semibold text-emerald-900">
                  Child's Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="childName"
                  type="text"
                  placeholder="Enter child's full name"
                  required
                  value={formData.childName}
                  onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                  className="h-12 text-base"
                  disabled={isLoading}
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-base font-semibold text-emerald-900">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="h-12 text-base"
                  disabled={isLoading}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-base font-semibold text-emerald-900">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  disabled={isLoading}
                  required
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Blood Group */}
              <div className="space-y-2">
                <Label htmlFor="bloodGroup" className="text-base font-semibold text-emerald-900">
                  Blood Group (Optional)
                </Label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Aadhaar Number */}
              <div className="space-y-2">
                <Label htmlFor="aadhaarNumber" className="text-base font-semibold text-emerald-900">
                  Aadhaar Number (Optional)
                </Label>
                <Input
                  id="aadhaarNumber"
                  type="text"
                  placeholder="XXXX XXXX XXXX"
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  className="h-12 text-base"
                  disabled={isLoading}
                  maxLength={12}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-base font-semibold text-emerald-900">
                  Home Address (Optional)
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter home address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="min-h-24 text-base"
                  disabled={isLoading}
                />
              </div>

              {/* Parent Email */}
              <div className="space-y-2">
                <Label htmlFor="parentEmail" className="text-base font-semibold text-emerald-900">
                  Parent Email (Optional)
                </Label>
                <Input
                  id="parentEmail"
                  type="email"
                  placeholder="parent@example.com"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  className="h-12 text-base"
                  disabled={isLoading}
                />
                <p className="text-xs text-emerald-700">
                  If the parent has an account with this email (role <code>parent</code>), they will automatically see
                  this child in their dashboard.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Link href="/worker/children" className="flex-1">
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
                  className="flex-1 h-12 text-base bg-emerald-600 hover:bg-emerald-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Register Child
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
