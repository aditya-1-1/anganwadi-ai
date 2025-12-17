import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Calendar,
  Scale,
  TrendingUp,
  AlertCircle,
  User,
  MapPin,
  Droplet,
  FileText,
  Activity,
} from "lucide-react"
import Link from "next/link"

export default async function ChildDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "anganwadi_worker") {
    redirect("/auth/login")
  }

  // Get child details
  const { data: child } = await supabase
    .from("children")
    .select(
      `
      *,
      anganwadi_centers (
        center_name,
        center_code
      )
    `,
    )
    .eq("id", params.id)
    .single()

  if (!child) {
    redirect("/worker/children")
  }

  // Get growth records
  const { data: growthRecords } = await supabase
    .from("growth_records")
    .select("*")
    .eq("child_id", params.id)
    .order("measurement_date", { ascending: false })
    .limit(5)

  // Get recent attendance
  const { data: attendanceRecords } = await supabase
    .from("attendance")
    .select("*")
    .eq("child_id", params.id)
    .order("attendance_date", { ascending: false })
    .limit(7)

  // Get active alerts
  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("child_id", params.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  // Calculate age
  const age = Math.floor((new Date().getTime() - new Date(child.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 30))

  const latestRecord = growthRecords?.[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/worker/children">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-emerald-900">{child.child_name}</h1>
                <p className="text-sm text-emerald-700">
                  {age} months • {child.gender}
                </p>
              </div>
            </div>
            <Link href={`/worker/growth/record?childId=${child.id}`}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Scale className="w-5 h-5 mr-2" />
                Record Growth
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Health Status Card */}
        <Card className="mb-6 border-2 border-emerald-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-emerald-900 mb-2">Current Health Status</h3>
                {latestRecord ? (
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`text-base px-4 py-2 ${
                        latestRecord.nutrition_status === "normal"
                          ? "bg-green-100 text-green-800"
                          : latestRecord.nutrition_status === "mam"
                            ? "bg-yellow-100 text-yellow-800"
                            : latestRecord.nutrition_status === "sam"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {latestRecord.nutrition_status === "normal"
                        ? "Healthy"
                        : latestRecord.nutrition_status === "mam"
                          ? "MAM (Moderate Acute Malnutrition)"
                          : latestRecord.nutrition_status === "sam"
                            ? "SAM (Severe Acute Malnutrition)"
                            : "Unknown"}
                    </Badge>
                  </div>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800 text-base px-4 py-2">No measurements recorded</Badge>
                )}
              </div>
              {latestRecord && (
                <div className="text-right">
                  <p className="text-sm text-emerald-700">Last measured</p>
                  <p className="text-lg font-semibold text-emerald-900">
                    {new Date(latestRecord.measurement_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        {alerts && alerts.length > 0 && (
          <Card className="mb-6 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertCircle className="w-5 h-5" />
                Active Alerts ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === "critical"
                      ? "border-red-500 bg-red-50"
                      : alert.severity === "high"
                        ? "border-orange-500 bg-orange-50"
                        : alert.severity === "medium"
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-emerald-900">{alert.title}</h4>
                    <Badge
                      className={`${
                        alert.severity === "critical"
                          ? "bg-red-200 text-red-900"
                          : alert.severity === "high"
                            ? "bg-orange-200 text-orange-900"
                            : alert.severity === "medium"
                              ? "bg-yellow-200 text-yellow-900"
                              : "bg-blue-200 text-blue-900"
                      }`}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-emerald-700">{alert.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-emerald-700 font-medium">Date of Birth</span>
                <span className="text-emerald-900 font-semibold">
                  {new Date(child.date_of_birth).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-emerald-700 font-medium">Age</span>
                <span className="text-emerald-900 font-semibold">{age} months</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-emerald-700 font-medium">Gender</span>
                <span className="text-emerald-900 font-semibold capitalize">{child.gender}</span>
              </div>
              {child.blood_group && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-emerald-700 font-medium flex items-center gap-2">
                    <Droplet className="w-4 h-4" />
                    Blood Group
                  </span>
                  <span className="text-emerald-900 font-semibold">{child.blood_group}</span>
                </div>
              )}
              {child.aadhaar_number && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-emerald-700 font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Aadhaar
                  </span>
                  <span className="text-emerald-900 font-semibold">{child.aadhaar_number}</span>
                </div>
              )}
              {child.address && (
                <div className="py-2">
                  <span className="text-emerald-700 font-medium flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </span>
                  <p className="text-emerald-900 text-sm">{child.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Latest Measurements */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Activity className="w-5 h-5" />
                Latest Measurements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestRecord ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-emerald-700 font-medium">Weight</span>
                    <span className="text-emerald-900 font-semibold text-lg">
                      {latestRecord.weight_kg ? `${latestRecord.weight_kg} kg` : "Not recorded"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-emerald-700 font-medium">Height</span>
                    <span className="text-emerald-900 font-semibold text-lg">
                      {latestRecord.height_cm ? `${latestRecord.height_cm} cm` : "Not recorded"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-emerald-700 font-medium">MUAC</span>
                    <span className="text-emerald-900 font-semibold text-lg">
                      {latestRecord.muac_cm ? `${latestRecord.muac_cm} cm` : "Not recorded"}
                    </span>
                  </div>
                  {latestRecord.hemoglobin_level && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-emerald-700 font-medium">Hemoglobin</span>
                      <span className="text-emerald-900 font-semibold text-lg">
                        {latestRecord.hemoglobin_level} g/dL
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Scale className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                  <p className="text-emerald-700 mb-4">No measurements recorded yet</p>
                  <Link href={`/worker/growth/record?childId=${child.id}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Scale className="w-5 h-5 mr-2" />
                      Record First Measurement
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Growth History */}
        <Card className="mt-6 border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <TrendingUp className="w-5 h-5" />
              Growth History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {growthRecords && growthRecords.length > 0 ? (
              <div className="space-y-3">
                {growthRecords.map((record) => (
                  <div key={record.id} className="p-4 bg-emerald-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-emerald-900">
                          {new Date(record.measurement_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-emerald-700">Age: {record.age_months} months</p>
                      </div>
                      <Badge
                        className={`${
                          record.nutrition_status === "normal"
                            ? "bg-green-100 text-green-800"
                            : record.nutrition_status === "mam"
                              ? "bg-yellow-100 text-yellow-800"
                              : record.nutrition_status === "sam"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {record.nutrition_status === "normal"
                          ? "Healthy"
                          : record.nutrition_status === "mam"
                            ? "MAM"
                            : record.nutrition_status === "sam"
                              ? "SAM"
                              : "Unknown"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {record.weight_kg && (
                        <div>
                          <span className="text-emerald-600">Weight:</span>
                          <span className="ml-1 font-semibold text-emerald-900">{record.weight_kg} kg</span>
                        </div>
                      )}
                      {record.height_cm && (
                        <div>
                          <span className="text-emerald-600">Height:</span>
                          <span className="ml-1 font-semibold text-emerald-900">{record.height_cm} cm</span>
                        </div>
                      )}
                      {record.muac_cm && (
                        <div>
                          <span className="text-emerald-600">MUAC:</span>
                          <span className="ml-1 font-semibold text-emerald-900">{record.muac_cm} cm</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-emerald-600">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                <p>No growth records available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Summary */}
        <Card className="mt-6 border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <Calendar className="w-5 h-5" />
              Recent Attendance (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceRecords && attendanceRecords.length > 0 ? (
              <div className="grid grid-cols-7 gap-2">
                {attendanceRecords.reverse().map((record) => (
                  <div key={record.id} className="text-center">
                    <div
                      className={`w-full aspect-square rounded-lg flex items-center justify-center mb-1 ${
                        record.status === "present"
                          ? "bg-green-100 text-green-700"
                          : record.status === "absent"
                            ? "bg-red-100 text-red-700"
                            : record.status === "sick"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span className="text-xl font-bold">
                        {record.status === "present" ? "P" : record.status === "absent" ? "A" : "S"}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-600">
                      {new Date(record.attendance_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-emerald-600">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                <p>No attendance records available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
