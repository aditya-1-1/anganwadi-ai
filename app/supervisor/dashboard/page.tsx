import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, AlertCircle, TrendingDown, Activity } from "lucide-react"
import Link from "next/link"

export default async function SupervisorDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "supervisor") {
    redirect("/auth/login")
  }

  // Get supervised centers
  const { data: centers } = await supabase
    .from("anganwadi_centers")
    .select("*")
    .eq("supervisor_id", user.id)
    .order("center_name")

  const centerIds = centers?.map((c) => c.id) || []

  // Get overall statistics
  const { count: totalChildren } = await supabase
    .from("children")
    .select("*", { count: "exact", head: true })
    .in("anganwadi_center_id", centerIds)
    .eq("status", "active")

  const { count: totalAlerts } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .in("anganwadi_center_id", centerIds)
    .eq("status", "active")

  // Get malnutrition cases
  const { data: allChildren } = await supabase
    .from("children")
    .select(
      `
      id,
      anganwadi_center_id,
      growth_records (
        nutrition_status,
        measurement_date
      )
    `,
    )
    .in("anganwadi_center_id", centerIds)
    .eq("status", "active")

  const malnutritionCount = allChildren?.filter((child: any) => {
    const latestRecord = child.growth_records?.sort(
      (a: any, b: any) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime(),
    )[0]
    return latestRecord?.nutrition_status && latestRecord.nutrition_status !== "normal"
  }).length

  const samCount = allChildren?.filter((child: any) => {
    const latestRecord = child.growth_records?.sort(
      (a: any, b: any) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime(),
    )[0]
    return latestRecord?.nutrition_status === "sam"
  }).length

  const mamCount = allChildren?.filter((child: any) => {
    const latestRecord = child.growth_records?.sort(
      (a: any, b: any) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime(),
    )[0]
    return latestRecord?.nutrition_status === "mam"
  }).length

  // Get center-wise statistics
  const centerStats = await Promise.all(
    (centers || []).map(async (center) => {
      const { count: childCount } = await supabase
        .from("children")
        .select("*", { count: "exact", head: true })
        .eq("anganwadi_center_id", center.id)
        .eq("status", "active")

      const { count: alertCount } = await supabase
        .from("alerts")
        .select("*", { count: "exact", head: true })
        .eq("anganwadi_center_id", center.id)
        .eq("status", "active")

      const { data: centerChildren } = await supabase
        .from("children")
        .select(
          `
          id,
          growth_records (
            nutrition_status,
            measurement_date
          )
        `,
        )
        .eq("anganwadi_center_id", center.id)
        .eq("status", "active")

      const centerMalnutrition = centerChildren?.filter((child: any) => {
        const latestRecord = child.growth_records?.sort(
          (a: any, b: any) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime(),
        )[0]
        return latestRecord?.nutrition_status && latestRecord.nutrition_status !== "normal"
      }).length

      return {
        ...center,
        childCount: childCount || 0,
        alertCount: alertCount || 0,
        malnutritionCount: centerMalnutrition || 0,
      }
    }),
  )

  // Get critical alerts across all centers
  const { data: criticalAlerts } = await supabase
    .from("alerts")
    .select(
      `
      *,
      children (
        child_name
      ),
      anganwadi_centers (
        center_name,
        center_code
      )
    `,
    )
    .in("anganwadi_center_id", centerIds)
    .eq("status", "active")
    .in("severity", ["critical", "high"])
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-purple-900">Supervisor Dashboard</h1>
              <p className="text-sm text-purple-700">Monitoring {centers?.length || 0} Anganwadi Centers</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-purple-900">{profile.full_name}</p>
                <p className="text-xs text-purple-700">Supervisor</p>
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
        {/* Overall Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-purple-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700">Total Centers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-900">{centers?.length || 0}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700">Total Children</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-900">{totalChildren || 0}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-700">Malnutrition Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-900">{malnutritionCount || 0}</div>
                  <div className="text-xs text-orange-700">
                    SAM: {samCount || 0} | MAM: {mamCount || 0}
                  </div>
                </div>
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
                <div className="text-3xl font-bold text-red-900">{totalAlerts || 0}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        <Card className="mb-8 border-red-100">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-purple-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Critical & High Priority Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {criticalAlerts && criticalAlerts.length > 0 ? (
              <div className="space-y-4">
                {criticalAlerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === "critical" ? "border-red-500 bg-red-50" : "border-orange-500 bg-orange-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-purple-900">{alert.title}</h4>
                          <Badge
                            className={`${
                              alert.severity === "critical"
                                ? "bg-red-200 text-red-900"
                                : "bg-orange-200 text-orange-900"
                            }`}
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-purple-700 mb-1">
                          Child: {alert.children?.child_name || "Unknown"} | Center:{" "}
                          {alert.anganwadi_centers?.center_name} ({alert.anganwadi_centers?.center_code})
                        </p>
                        <p className="text-sm text-purple-600">{alert.description}</p>
                      </div>
                      <p className="text-xs text-purple-500">
                        {new Date(alert.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-purple-600">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                <p className="text-lg font-medium">No critical alerts</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Centers Overview */}
        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-purple-900 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Anganwadi Centers Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {centerStats && centerStats.length > 0 ? (
              <div className="space-y-4">
                {centerStats.map((center: any) => {
                  const malnutritionRate =
                    center.childCount > 0 ? ((center.malnutritionCount / center.childCount) * 100).toFixed(1) : "0"
                  const isHighRisk = Number.parseFloat(malnutritionRate) > 20

                  return (
                    <div
                      key={center.id}
                      className={`p-6 rounded-lg border-2 ${isHighRisk ? "border-red-200 bg-red-50" : "border-purple-100 bg-purple-50"}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-purple-900">{center.center_name}</h3>
                          <p className="text-sm text-purple-700">{center.center_code}</p>
                          <p className="text-xs text-purple-600 mt-1">
                            {center.district}, {center.state}
                          </p>
                        </div>
                        {isHighRisk && (
                          <Badge className="bg-red-200 text-red-900">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            High Risk
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-purple-700">Children</span>
                          </div>
                          <div className="text-2xl font-bold text-purple-900">{center.childCount}</div>
                        </div>

                        <div className="bg-white p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-4 h-4 text-orange-600" />
                            <span className="text-sm text-purple-700">Malnutrition</span>
                          </div>
                          <div className="text-2xl font-bold text-orange-900">{center.malnutritionCount}</div>
                        </div>

                        <div className="bg-white p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-purple-700">Rate</span>
                          </div>
                          <div className="text-2xl font-bold text-purple-900">{malnutritionRate}%</div>
                        </div>

                        <div className="bg-white p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-purple-700">Alerts</span>
                          </div>
                          <div className="text-2xl font-bold text-red-900">{center.alertCount}</div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Link href={`/supervisor/centers/${center.id}`}>
                          <Button variant="outline" className="w-full bg-white">
                            View Center Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-purple-600">
                <Building2 className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                <p className="text-lg font-medium">No centers assigned</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
