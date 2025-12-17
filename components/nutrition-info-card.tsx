import { Card, CardContent } from "@/components/ui/card"
import { Heart, TrendingUp, AlertTriangle } from "lucide-react"

interface NutritionInfoCardProps {
  status: "normal" | "mam" | "sam"
}

export function NutritionInfoCard({ status }: NutritionInfoCardProps) {
  const config = {
    normal: {
      icon: Heart,
      title: "Healthy Nutrition",
      description:
        "Your child is growing well! Continue providing nutritious meals and regular attendance at the Anganwadi center.",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      iconBgColor: "bg-green-200",
      iconColor: "text-green-700",
      titleColor: "text-green-900",
      descColor: "text-green-800",
    },
    mam: {
      icon: TrendingUp,
      title: "Moderate Malnutrition (MAM)",
      description:
        "Your child needs extra nutrition. Follow the Anganwadi worker's diet plan and attend regularly for supplementary feeding.",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
      iconBgColor: "bg-orange-200",
      iconColor: "text-orange-700",
      titleColor: "text-orange-900",
      descColor: "text-orange-800",
    },
    sam: {
      icon: AlertTriangle,
      title: "Severe Malnutrition (SAM)",
      description:
        "Immediate medical attention required. Contact your Anganwadi worker or visit the nearest health center for urgent care.",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
      iconBgColor: "bg-red-200",
      iconColor: "text-red-700",
      titleColor: "text-red-900",
      descColor: "text-red-800",
    },
  }

  const {
    icon: Icon,
    title,
    description,
    bgColor,
    borderColor,
    iconBgColor,
    iconColor,
    titleColor,
    descColor,
  } = config[status]

  return (
    <Card className={`${borderColor} ${bgColor}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 ${iconBgColor} rounded-full flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <h3 className={`font-semibold ${titleColor} mb-2`}>{title}</h3>
            <p className={`text-sm ${descColor}`}>{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
