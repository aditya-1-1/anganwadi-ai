import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ChildrenListPage() {
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

  // Get all children with their latest growth record
  const { data: children } = await supabase
    .from("children")
    .select(
      `
      *,
      growth_records (
        nutrition_status,
        measurement_date,
        weight_kg,
        height_cm
      )
    `,
    )
    .eq("anganwadi_center_id", profile.anganwadi_center_id)
    .eq("status", "active")
    .order("child_name")

  // Process children to get latest record
  const processedChildren = children?.map((child: any) => {
    const latestRecord = child.growth_records?.sort(
      (a: any, b: any) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime(),
    )[0]
    return {
      ...child,
      latestRecord,
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/worker/dashboard">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-emerald-900">All Children</h1>
                <p className="text-sm text-emerald-700">{children?.length || 0} registered children</p>
              </div>
            </div>
            <Link href="/worker/children/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Add New Child
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
            <Input
              type="search"
              placeholder="Search by child name..."
              className="pl-10 h-12 text-base"
              id="search-children"
            />
          </div>
        </div>

        {/* Children Grid */}
        {processedChildren && processedChildren.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedChildren.map((child: any) => {
              const age = Math.floor(
                (new Date().getTime() - new Date(child.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 30),
              )
              const nutritionStatus = child.latestRecord?.nutrition_status || "unknown"

              return (
                <Link key={child.id} href={`/worker/children/${child.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-emerald-100">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                            nutritionStatus === "normal"
                              ? "bg-green-100 text-green-700"
                              : nutritionStatus === "mam"
                                ? "bg-yellow-100 text-yellow-700"
                                : nutritionStatus === "sam"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {child.child_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-emerald-900 truncate">{child.child_name}</h3>
                          <p className="text-sm text-emerald-700 mb-2">
                            {age} months • {child.gender}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                nutritionStatus === "normal"
                                  ? "bg-green-100 text-green-700"
                                  : nutritionStatus === "mam"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : nutritionStatus === "sam"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {nutritionStatus === "normal"
                                ? "Healthy"
                                : nutritionStatus === "mam"
                                  ? "MAM"
                                  : nutritionStatus === "sam"
                                    ? "SAM"
                                    : "No Data"}
                            </span>
                          </div>
                          {child.latestRecord && (
                            <p className="text-xs text-emerald-600">
                              Last checked:{" "}
                              {new Date(child.latestRecord.measurement_date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card className="border-emerald-100">
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
              <h3 className="text-xl font-bold text-emerald-900 mb-2">No children registered yet</h3>
              <p className="text-emerald-700 mb-6">Start by adding your first child to the system</p>
              <Link href="/worker/children/new">
                <Button className="bg-emerald-600 hover:bg-emerald-700" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Add First Child
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
