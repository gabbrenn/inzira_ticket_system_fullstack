import React from 'react'

const DashboardCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'text-blue-600',
  bgColor = 'bg-blue-50',
  subtitle,
  trend,
  onClick 
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <div className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className="text-sm text-gray-600">{title}</div>
          {subtitle && (
            <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
          )}
          {trend && (
            <div className={`text-xs mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardCard