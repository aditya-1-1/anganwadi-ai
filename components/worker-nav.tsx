import Link from "next/link"
import { Users, Scale, Calendar, AlertCircle, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WorkerNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden z-50">
      <div className="flex items-center justify-around py-2">
        <Link href="/worker/dashboard">
          <Button variant="ghost" size="lg" className="flex flex-col gap-1 h-auto py-2">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Button>
        </Link>
        <Link href="/worker/children">
          <Button variant="ghost" size="lg" className="flex flex-col gap-1 h-auto py-2">
            <Users className="w-6 h-6" />
            <span className="text-xs">Children</span>
          </Button>
        </Link>
        <Link href="/worker/growth/record">
          <Button variant="ghost" size="lg" className="flex flex-col gap-1 h-auto py-2">
            <Scale className="w-6 h-6" />
            <span className="text-xs">Growth</span>
          </Button>
        </Link>
        <Link href="/worker/attendance">
          <Button variant="ghost" size="lg" className="flex flex-col gap-1 h-auto py-2">
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Attendance</span>
          </Button>
        </Link>
        <Link href="/worker/alerts">
          <Button variant="ghost" size="lg" className="flex flex-col gap-1 h-auto py-2">
            <AlertCircle className="w-6 h-6" />
            <span className="text-xs">Alerts</span>
          </Button>
        </Link>
      </div>
    </nav>
  )
}
