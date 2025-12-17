import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Calendar, Heart, MapPin, Baby } from "lucide-react"

export default async function ParentDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "parent") {
    redirect("/auth/login")
  }

  // Get parent's children with their latest growth records
  const { data: children } = await supabase
    .from("children")
    .select(
      `
      *,
      anganwadi_centers (
        center_name,
        center_code,
        address,
        district
      ),
      growth_records (
        id,
        nutrition_status,
        measurement_date,
        weight_kg,
        height_cm,
        muac_cm,
        age_months
      )
    `,
    )
    .eq("parent_id", user.id)
    .eq("status", "active")
    .order("child_name")

  const processedChildren = children?.map((child: any) => {
    const sortedRecords = child.growth_records?.sort(
      (a: any, b: any) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime(),
    )
    const latestRecord = sortedRecords?.[0]
    return {
      ...child,
      latestRecord,
      growthHistory: sortedRecords?.slice(0, 5) || [],
    }
  })

  // Get recent attendance for all children
  const today = new Date()
  const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const childIds = children?.map((c) => c.id) || []

  const { data: recentAttendance } = await supabase
    .from("attendance")
    .select("*")
    .in("child_id", childIds)
    .gte("attendance_date", last7Days)
    .order("attendance_date", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-teal-900">Parent Dashboard</h1>
              <p className="text-sm text-teal-700">Track your children's health and growth</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-teal-900">{profile.full_name}</p>
                <p className="text-xs text-teal-700">Parent</p>
              </div>
              <form action="/auth/signout" method="post">
                <Button variant="outline" size="sm">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {processedChildren && processedChildren.length > 0 ? (
          <div className="space-y-8">
            {processedChildren.map((child: any) => {
              const age = Math.floor(
                (new Date().getTime() - new Date(child.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 30),
              )
              const nutritionStatus = child.latestRecord?.nutrition_status || "unknown"

              // Get attendance for this child
              const childAttendance = recentAttendance?.filter((a) => a.child_id === child.id) || []
              const presentDays = childAttendance.filter((a) => a.status === "present").length

              return (
                <Card key={child.id} className="border-teal-100 shadow-lg overflow-hidden">
                  {/* Child Header */}
                  <CardHeader
                    className={`${
                      nutritionStatus === "normal"
                        ? "bg-green-50"
                        : nutritionStatus === "mam"
                          ? "bg-orange-50"
                          : nutritionStatus === "sam"
                            ? "bg-red-50"
                            : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${
                            nutritionStatus === "normal"
                              ? "bg-green-200 text-green-800"
                              : nutritionStatus === "mam"
                                ? "bg-orange-200 text-orange-800"
                                : nutritionStatus === "sam"
                                  ? "bg-red-200 text-red-800"
                                  : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {child.child_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-teal-900">{child.child_name}</h2>
                          <p className="text-teal-700">
                            {age} months old • {child.gender}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <MapPin className="w-4 h-4 text-teal-600" />
                            <p className="text-sm text-teal-700">
                              {child.anganwadi_centers?.center_name} ({child.anganwadi_centers?.center_code})
                            </p>
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`text-base px-4 py-2 ${
                          nutritionStatus === "normal"
                            ? "bg-green-200 text-green-900"
                            : nutritionStatus === "mam"
                              ? "bg-orange-200 text-orange-900"
                              : nutritionStatus === "sam"
                                ? "bg-red-200 text-red-900"
                                : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        {nutritionStatus === "normal"
                          ? "Healthy"
                          : nutritionStatus === "mam"
                            ? "Moderate Malnutrition"
                            : nutritionStatus === "sam"
                              ? "Severe Malnutrition"
                              : "No Data"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* Latest Measurements */}
                      <Card className="border-teal-100">
                        <CardHeader>
                          <CardTitle className="text-teal-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Latest Measurements
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {child.latestRecord ? (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-teal-700 font-medium">Date</span>
                                <span className="text-teal-900 font-semibold">
                                  {new Date(child.latestRecord.measurement_date).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-teal-700 font-medium">Weight</span>
                                <span className="text-teal-900 font-semibold text-lg">
                                  {child.latestRecord.weight_kg} kg
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-teal-700 font-medium">Height</span>
                                <span className="text-teal-900 font-semibold text-lg">
                                  {child.latestRecord.height_cm} cm
                                </span>
                              </div>
                              {child.latestRecord.muac_cm && (
                                <div className="flex justify-between items-center py-2 border-b">
                                  <span className="text-teal-700 font-medium">MUAC</span>
                                  <span className="text-teal-900 font-semibold text-lg">
                                    {child.latestRecord.muac_cm} cm
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-teal-600">
                              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-teal-400" />
                              <p>No measurements recorded yet</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Attendance */}
                      <Card className="border-teal-100">
                        <CardHeader>
                          <CardTitle className="text-teal-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Attendance (Last 7 Days)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <div className="text-center p-4 bg-teal-50 rounded-lg">
                              <div className="text-3xl font-bold text-teal-900">{presentDays}/7</div>
                              <p className="text-sm text-teal-700">Days Present</p>
                            </div>
                          </div>
                          {childAttendance.length > 0 ? (
                            <div className="grid grid-cols-7 gap-2">
                              {childAttendance.slice(0, 7).map((record) => (
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
                                    <span className="text-lg font-bold">
                                      {record.status === "present" ? "P" : record.status === "absent" ? "A" : "S"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-teal-600">
                                    {new Date(record.attendance_date).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-teal-600">
                              <p className="text-sm">No attendance records available</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Growth History */}
                    {child.growthHistory.length > 0 && (
                      <Card className="border-teal-100">
                        <CardHeader>
                          <CardTitle className="text-teal-900 flex items-center gap-2">
                            <Heart className="w-5 h-5" />
                            Growth History
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {child.growthHistory.map((record: any) => (
                              <div key={record.id} className="p-4 bg-teal-50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-semibold text-teal-900">
                                      {new Date(record.measurement_date).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </p>
                                    <p className="text-sm text-teal-700">Age: {record.age_months} months</p>
                                  </div>
                                  <Badge
                                    className={`${
                                      record.nutrition_status === "normal"
                                        ? "bg-green-200 text-green-900"
                                        : record.nutrition_status === "mam"
                                          ? "bg-orange-200 text-orange-900"
                                          : record.nutrition_status === "sam"
                                            ? "bg-red-200 text-red-900"
                                            : "bg-gray-200 text-gray-900"
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
                                      <span className="text-teal-600">Weight:</span>
                                      <span className="ml-1 font-semibold text-teal-900">{record.weight_kg} kg</span>
                                    </div>
                                  )}
                                  {record.height_cm && (
                                    <div>
                                      <span className="text-teal-600">Height:</span>
                                      <span className="ml-1 font-semibold text-teal-900">{record.height_cm} cm</span>
                                    </div>
                                  )}
                                  {record.muac_cm && (
                                    <div>
                                      <span className="text-teal-600">MUAC:</span>
                                      <span className="ml-1 font-semibold text-teal-900">{record.muac_cm} cm</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border-teal-100">
            <CardContent className="py-16 text-center">
              <Baby className="w-16 h-16 mx-auto mb-4 text-teal-400" />
              <h3 className="text-xl font-bold text-teal-900 mb-2">No Children Registered</h3>
              <p className="text-teal-700 mb-6">
                You don't have any children registered yet. Please contact your Anganwadi worker to link your children
                to your account.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Information Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="border-green-100 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Healthy Nutrition</h3>
                  <p className="text-sm text-green-800">
                    Your child is growing well! Continue providing nutritious meals and regular attendance at the
                    Anganwadi center.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-orange-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900 mb-2">Moderate Malnutrition (MAM)</h3>
                  <p className="text-sm text-orange-800">
                    Your child needs extra nutrition. Follow the Anganwadi worker's diet plan and attend regularly for
                    supplementary feeding.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-100 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-red-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Severe Malnutrition (SAM)</h3>
                  <p className="text-sm text-red-800">
                    Immediate medical attention required. Contact your Anganwadi worker or visit the nearest health
                    center for urgent care.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
