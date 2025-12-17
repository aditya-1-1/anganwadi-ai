"use client"

import type React from "react"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (!data.user) {
        throw new Error("Login failed. Please try again.")
      }

      // Get user profile to determine role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      // If profile doesn't exist, create one with default role
      if (profileError || !profile) {
        console.warn("Profile not found, creating default profile:", profileError)
        
        // Try to create a default profile
        const { error: createError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email || email,
          full_name: data.user.user_metadata?.full_name || data.user.email || "User",
          role: data.user.user_metadata?.role || "parent",
        })

        if (createError) {
          console.error("Failed to create profile:", createError)
          // Still allow login, redirect to dashboard
          window.location.href = "/dashboard"
          return
        }

        // Fetch the newly created profile
        const { data: newProfile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()

        if (newProfile?.role === "anganwadi_worker") {
          window.location.href = "/worker/dashboard"
        } else if (newProfile?.role === "supervisor") {
          window.location.href = "/supervisor/dashboard"
        } else if (newProfile?.role === "parent") {
          window.location.href = "/parent/dashboard"
        } else {
          window.location.href = "/dashboard"
        }
        return
      }

      // Redirect based on role - use window.location for full page reload to establish session
      if (profile.role === "anganwadi_worker") {
        window.location.href = "/worker/dashboard"
      } else if (profile.role === "supervisor") {
        window.location.href = "/supervisor/dashboard"
      } else if (profile.role === "parent") {
        window.location.href = "/parent/dashboard"
      } else if (profile.role === "admin") {
        window.location.href = "/dashboard"
      } else {
        window.location.href = "/dashboard"
      }
    } catch (error: unknown) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during login")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-emerald-900">Anganwadi Digital</h1>
              <p className="text-sm text-emerald-700">ICDS Monitoring System</p>
            </div>
          </Link>
        </div>

        <Card className="border-emerald-100 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-emerald-900">Welcome Back</CardTitle>
            <CardDescription className="text-center text-base">
              Sign in to access your Anganwadi dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold text-emerald-900">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="worker@anganwadi.gov.in"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-semibold text-emerald-900">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-emerald-700">
                Don't have an account?{" "}
                <Link href="/auth/sign-up" className="font-semibold text-emerald-600 hover:text-emerald-700">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-emerald-600 mt-6">Secure login powered by government-grade encryption</p>
      </div>
    </div>
  )
}
