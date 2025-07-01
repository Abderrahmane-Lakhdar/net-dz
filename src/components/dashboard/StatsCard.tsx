import { Card, CardContent } from '../ui/Card'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  color?: 'primary' | 'secondary' | 'accent' | 'warning'
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  color = 'primary' 
}: StatsCardProps) {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    accent: 'from-accent-500 to-accent-600',
    warning: 'from-yellow-500 to-orange-600'
  }

  const changeColors = {
    positive: 'text-secondary-600 dark:text-secondary-400',
    negative: 'text-accent-600 dark:text-accent-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  }

  return (
    <Card hover className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {value}
            </p>
            {change && (
              <p className={`text-sm ${changeColors[changeType]}`}>
                {change}
              </p>
            )}
          </div>
          
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* Decorative gradient */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-5 rounded-full -translate-y-16 translate-x-16`} />
      </CardContent>
    </Card>
  )
}