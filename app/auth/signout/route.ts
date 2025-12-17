import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
