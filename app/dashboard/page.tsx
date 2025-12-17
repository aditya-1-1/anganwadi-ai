import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile to determine role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Redirect based on role
  if (profile?.role === "anganwadi_worker") {
    redirect("/worker/dashboard")
  } else if (profile?.role === "supervisor") {
    redirect("/supervisor/dashboard")
  } else if (profile?.role === "parent") {
    redirect("/parent/dashboard")
  } else if (profile?.role === "admin") {
    redirect("/worker/dashboard")
  } else {
    redirect("/auth/login")
  }
}
