import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Heart } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
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
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-900">Account Created Successfully!</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Please check your email to verify your account. We've sent a confirmation link to complete your
              registration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h4 className="font-semibold text-emerald-900 mb-2">Next Steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-emerald-700">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>Return here and sign in to your account</li>
              </ol>
            </div>

            <Link href="/auth/login" className="block">
              <Button className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700">
                Go to Sign In
              </Button>
            </Link>

            <p className="text-center text-sm text-emerald-600">Didn't receive the email? Check your spam folder</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
