import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function WorkerAttendancePage() {
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

  // Get children in this worker's center
  const { data: children } = await supabase
    .from("children")
    .select("id, child_name, date_of_birth, gender")
    .eq("anganwadi_center_id", profile.anganwadi_center_id)
    .eq("status", "active")
    .order("child_name")

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">Mark Attendance</h1>
            <p className="text-sm text-emerald-700">Select a child to record attendance for today</p>
          </div>
          <Link href="/worker/dashboard">
            <Button variant="outline" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {(!children || children.length === 0) && (
          <Card className="mb-6">
            <CardContent className="py-6">
              <p className="text-sm text-emerald-800">
                No active children found for your Anganwadi center yet. Please add children from the{" "}
                <Link href="/worker/children/new" className="text-emerald-700 underline font-semibold">
                  Add New Child
                </Link>{" "}
                page.
              </p>
            </CardContent>
          </Card>
        )}

        {children && children.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-900">Children in Your Center</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {children.map((child) => (
                <Link
                  key={child.id}
                  href={`/worker/children/${child.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-emerald-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-emerald-900">{child.child_name}</p>
                    <p className="text-xs text-emerald-700">{child.gender}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    View &amp; Mark Attendance
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}


