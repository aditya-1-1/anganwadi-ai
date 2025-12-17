import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Scale, AlertCircle, Calendar, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"

export default async function WorkerDashboard() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "anganwadi_worker") {
    redirect("/auth/login")
  }

  // Get Anganwadi center details
  const { data: center } = await supabase
    .from("anganwadi_centers")
    .select("*")
    .eq("id", profile.anganwadi_center_id)
    .single()

  // Get statistics
  const { count: totalChildren } = await supabase
    .from("children")
    .select("*", { count: "exact", head: true })
    .eq("anganwadi_center_id", profile.anganwadi_center_id)
    .eq("status", "active")

  const { count: activeAlerts } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("anganwadi_center_id", profile.anganwadi_center_id)
    .eq("status", "active")

  // Get children with malnutrition
  const { data: malnutritionChildren } = await supabase
    .from("children")
    .select(
      `
      id,
      child_name,
      growth_records (
        nutrition_status,
        measurement_date
      )
    `,
    )
    .eq("anganwadi_center_id", profile.anganwadi_center_id)
    .eq("status", "active")
    .order("measurement_date", { referencedTable: "growth_records", ascending: false })
    .limit(1, { referencedTable: "growth_records" })

  const malnutritionCount = malnutritionChildren?.filter((child: any) => {
    const latestRecord = child.growth_records?.[0]
    return latestRecord?.nutrition_status && latestRecord.nutrition_status !== "normal"
  }).length

  // Get recent alerts
  const { data: recentAlerts } = await supabase
    .from("alerts")
    .select(
      `
      *,
      children (
        child_name
      )
    `,
    )
    .eq("anganwadi_center_id", profile.anganwadi_center_id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(5)

  // Get today's attendance count
  const today = new Date().toISOString().split("T")[0]
  const { count: todayPresent } = await supabase
    .from("attendance")
    .select(
      `
      *,
      children!inner (
        anganwadi_center_id
      )
    `,
      { count: "exact", head: true },
    )
    .eq("attendance_date", today)
    .eq("status", "present")
    .eq("children.anganwadi_center_id", profile.anganwadi_center_id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">Worker Dashboard</h1>
              <p className="text-sm text-emerald-700">
                {center?.center_name} ({center?.center_code})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-900">{profile.full_name}</p>
                <p className="text-xs text-emerald-700">Anganwadi Worker</p>
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
        {/* Quick Actions - Large buttons for low-literacy users */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-emerald-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/worker/children/new">
              <Button className="w-full h-32 bg-emerald-600 hover:bg-emerald-700 flex flex-col gap-3" size="lg">
                <Plus className="w-10 h-10" />
                <span className="text-lg font-bold">Add New Child</span>
              </Button>
            </Link>

            <Link href="/worker/growth/record">
              <Button className="w-full h-32 bg-blue-600 hover:bg-blue-700 flex flex-col gap-3" size="lg">
                <Scale className="w-10 h-10" />
                <span className="text-lg font-bold">Record Growth</span>
              </Button>
            </Link>

            <Link href="/worker/attendance">
              <Button className="w-full h-32 bg-purple-600 hover:bg-purple-700 flex flex-col gap-3" size="lg">
                <Calendar className="w-10 h-10" />
                <span className="text-lg font-bold">Mark Attendance</span>
              </Button>
            </Link>

            <Link href="/worker/children">
              <Button className="w-full h-32 bg-teal-600 hover:bg-teal-700 flex flex-col gap-3" size="lg">
                <Users className="w-10 h-10" />
                <span className="text-lg font-bold">View Children</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-emerald-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-emerald-700">Total Children</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-emerald-900">{totalChildren || 0}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-700">Malnutrition Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-yellow-900">{malnutritionCount || 0}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-red-900">{activeAlerts || 0}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700">Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-900">
                  {todayPresent || 0}/{totalChildren || 0}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts */}
        <Card className="border-red-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-emerald-900">Recent Alerts</CardTitle>
              <Link href="/worker/alerts">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentAlerts && recentAlerts.length > 0 ? (
              <div className="space-y-4">
                {recentAlerts.map((alert: any) => (
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle
                            className={`w-5 h-5 ${
                              alert.severity === "critical"
                                ? "text-red-600"
                                : alert.severity === "high"
                                  ? "text-orange-600"
                                  : alert.severity === "medium"
                                    ? "text-yellow-600"
                                    : "text-blue-600"
                            }`}
                          />
                          <h4 className="font-semibold text-emerald-900">{alert.title}</h4>
                        </div>
                        <p className="text-sm text-emerald-700 mb-1">
                          Child: {alert.children?.child_name || "Unknown"}
                        </p>
                        <p className="text-sm text-emerald-600">{alert.description}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
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
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-emerald-600">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                <p className="text-lg font-medium">No active alerts</p>
                <p className="text-sm">All children are being monitored properly</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
