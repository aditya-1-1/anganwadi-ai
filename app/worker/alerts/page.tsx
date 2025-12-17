import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default async function WorkerAlertsPage() {
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

  if (!profile.anganwadi_center_id) {
    redirect("/worker/dashboard")
  }

  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("anganwadi_center_id", profile.anganwadi_center_id)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">All Alerts</h1>
            <p className="text-sm text-emerald-700">Active nutrition and growth alerts for your center</p>
          </div>
          <Link href="/worker/dashboard">
            <Button variant="outline" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {!alerts || alerts.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-emerald-800 font-medium mb-2">No active alerts</p>
              <p className="text-sm text-emerald-700">
                Children in your center currently have no active nutrition or growth alerts.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert: any) => (
              <Card
                key={alert.id}
                className={`border-l-4 ${
                  alert.severity === "critical"
                    ? "border-red-500"
                    : alert.severity === "high"
                      ? "border-orange-500"
                      : alert.severity === "medium"
                        ? "border-yellow-500"
                        : "border-blue-500"
                }`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        className={`w-5 h-5 mt-1 ${
                          alert.severity === "critical"
                            ? "text-red-600"
                            : alert.severity === "high"
                              ? "text-orange-600"
                              : alert.severity === "medium"
                                ? "text-yellow-600"
                                : "text-blue-600"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-emerald-900">{alert.title}</p>
                          <Badge
                            className={
                              alert.severity === "critical"
                                ? "bg-red-100 text-red-800"
                                : alert.severity === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : alert.severity === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                            }
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-emerald-800 mb-1">{alert.description}</p>
                        <p className="text-xs text-emerald-700">
                          Created on{" "}
                          {new Date(alert.created_at).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


