import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, Users, TrendingUp, Bell, Heart, Shield } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-900">Anganwadi Digital</h1>
              <p className="text-xs text-emerald-700">ICDS Monitoring System</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="outline" size="lg">
                Login
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
              Government of India Initiative
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance text-emerald-950 leading-tight">
              Digital Nutrition Monitoring for Every Child
            </h1>
            <p className="text-lg md:text-xl text-emerald-800 text-pretty leading-relaxed">
              Empowering Anganwadi workers with AI-powered tools to track child growth, detect malnutrition early, and
              ensure every child gets the nutrition they deserve.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-14 px-8 text-lg">
                  Get Started
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-900">10K+</div>
                <div className="text-sm text-emerald-700">Children Monitored</div>
              </div>
              <div className="w-px h-12 bg-emerald-200" />
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-900">500+</div>
                <div className="text-sm text-emerald-700">Anganwadi Centers</div>
              </div>
              <div className="w-px h-12 bg-emerald-200" />
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-900">95%</div>
                <div className="text-sm text-emerald-700">Early Detection Rate</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl shadow-2xl overflow-hidden">
              <img
                src="/happy-indian-children-at-anganwadi-center-with-hea.jpg"
                alt="Children at Anganwadi center"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-900">98%</div>
                  <div className="text-sm text-emerald-700">Health Improvement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-950 mb-4 text-balance">
              Comprehensive Child Nutrition Management
            </h2>
            <p className="text-lg text-emerald-700 max-w-2xl mx-auto text-pretty">
              Everything you need to monitor, track, and improve child nutrition in one platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <Activity className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">Growth Monitoring</h3>
                <p className="text-emerald-700 leading-relaxed">
                  Track weight, height, MUAC, and WHO z-scores with automatic malnutrition detection using AI
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <Bell className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">Smart Alerts</h3>
                <p className="text-emerald-700 leading-relaxed">
                  Get instant notifications for malnutrition cases, missed measurements, and follow-up reminders
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">Parent Portal</h3>
                <p className="text-emerald-700 leading-relaxed">
                  Parents can view their child's growth charts, attendance, and receive health updates on their phone
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">Analytics Dashboard</h3>
                <p className="text-emerald-700 leading-relaxed">
                  Supervisors get real-time insights on center performance, malnutrition trends, and intervention
                  effectiveness
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                  <Heart className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">Offline Support</h3>
                <p className="text-emerald-700 leading-relaxed">
                  Record measurements even without internet. Data syncs automatically when connection is restored
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">Secure & Compliant</h3>
                <p className="text-emerald-700 leading-relaxed">
                  Government-grade security with role-based access control and complete data privacy compliance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-balance">
            Ready to Transform Child Nutrition Monitoring?
          </h2>
          <p className="text-lg md:text-xl text-emerald-50 mb-8 max-w-2xl mx-auto text-pretty">
            Join hundreds of Anganwadi centers already using our platform to improve child health outcomes
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-lg">Anganwadi Digital</span>
              </div>
              <p className="text-emerald-300 text-sm">
                Empowering healthcare workers to ensure every child receives proper nutrition
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-emerald-300">
                <li>
                  <Link href="#" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-emerald-300">
                <li>
                  <Link href="#" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Training
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-emerald-300">
                <li>
                  <Link href="#" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Data Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-emerald-800 pt-8 text-center text-sm text-emerald-400">
            <p>© 2025 Anganwadi Digital Platform. Part of India's ICDS Ecosystem. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
