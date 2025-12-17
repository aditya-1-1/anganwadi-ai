import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, AlertCircle, MapPin, Phone } from "lucide-react"
import Link from "next/link"

export default async function CenterDetailPage({ params }: { params: { id: string } }) {
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

  // Get center details
  const { data: center } = await supabase.from("anganwadi_centers").select("*").eq("id", params.id).single()

  if (!center || center.supervisor_id !== user.id) {
    redirect("/supervisor/dashboard")
  }

  // Get children with their latest growth records
  const { data: children } = await supabase
    .from("children")
    .select(
      `
      *,
      growth_records (
        nutrition_status,
        measurement_date,
        weight_kg,
        height_cm,
        muac_cm
      )
    `,
    )
    .eq("anganwadi_center_id", params.id)
    .eq("status", "active")
    .order("child_name")

  const processedChildren = children?.map((child: any) => {
    const latestRecord = child.growth_records?.sort(
      (a: any, b: any) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime(),
    )[0]
    return {
      ...child,
      latestRecord,
    }
  })

  // Get active alerts
  const { data: alerts } = await supabase
    .from("alerts")
    .select(
      `
      *,
      children (
        child_name
      )
    `,
    )
    .eq("anganwadi_center_id", params.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  // Calculate statistics
  const totalChildren = children?.length || 0
  const samChildren = processedChildren?.filter((c: any) => c.latestRecord?.nutrition_status === "sam").length || 0
  const mamChildren = processedChildren?.filter((c: any) => c.latestRecord?.nutrition_status === "mam").length || 0
  const normalChildren =
    processedChildren?.filter((c: any) => c.latestRecord?.nutrition_status === "normal").length || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/supervisor/dashboard">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-purple-900">{center.center_name}</h1>
              <p className="text-sm text-purple-700">{center.center_code}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Center Information */}
        <Card className="mb-6 border-purple-100">
          <CardHeader>
            <CardTitle className="text-purple-900">Center Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm text-purple-700">Address</p>
                <p className="font-semibold text-purple-900">
                  {center.address}, {center.district}, {center.state}
                </p>
                {center.pincode && <p className="text-sm text-purple-700">PIN: {center.pincode}</p>}
              </div>
            </div>
            {center.contact_number && (
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-700">Contact</p>
                  <p className="font-semibold text-purple-900">{center.contact_number}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700">Total Children</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{totalChildren}</div>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700">Healthy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{normalChildren}</div>
              <p className="text-xs text-green-700">
                {totalChildren > 0 ? ((normalChildren / totalChildren) * 100).toFixed(1) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-700">MAM Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{mamChildren}</div>
              <p className="text-xs text-orange-700">
                {totalChildren > 0 ? ((mamChildren / totalChildren) * 100).toFixed(1) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700">SAM Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{samChildren}</div>
              <p className="text-xs text-red-700">
                {totalChildren > 0 ? ((samChildren / totalChildren) * 100).toFixed(1) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Alerts */}
        <Card className="mb-6 border-red-100">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Active Alerts ({alerts?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts && alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert: any) => (
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
                          <h4 className="font-semibold text-purple-900">{alert.title}</h4>
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
                        <p className="text-sm text-purple-700 mb-1">Child: {alert.children?.child_name || "Unknown"}</p>
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
                <p>No active alerts</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Children List */}
        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Children Enrolled ({totalChildren})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {processedChildren && processedChildren.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {processedChildren.map((child: any) => {
                  const age = Math.floor(
                    (new Date().getTime() - new Date(child.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 30),
                  )
                  const nutritionStatus = child.latestRecord?.nutrition_status || "unknown"

                  return (
                    <div
                      key={child.id}
                      className={`p-4 rounded-lg border-2 ${
                        nutritionStatus === "normal"
                          ? "border-green-200 bg-green-50"
                          : nutritionStatus === "mam"
                            ? "border-orange-200 bg-orange-50"
                            : nutritionStatus === "sam"
                              ? "border-red-200 bg-red-50"
                              : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-purple-900">{child.child_name}</h4>
                          <p className="text-sm text-purple-700">
                            {age} months • {child.gender}
                          </p>
                        </div>
                        <Badge
                          className={`${
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
                              ? "MAM"
                              : nutritionStatus === "sam"
                                ? "SAM"
                                : "No Data"}
                        </Badge>
                      </div>
                      {child.latestRecord && (
                        <div className="text-xs text-purple-600 space-y-1">
                          <p>Weight: {child.latestRecord.weight_kg} kg</p>
                          <p>Height: {child.latestRecord.height_cm} cm</p>
                          {child.latestRecord.muac_cm && <p>MUAC: {child.latestRecord.muac_cm} cm</p>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-purple-600">
                <Users className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                <p>No children enrolled</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
