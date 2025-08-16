import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Calendar, User, ArrowLeft, Home, Key } from 'lucide-react'

const CustomerNavigation = () => {
  const location = useLocation()

  const navigationItems = [
    { name: 'Dashboard', href: '/customer', icon: Home },
    { name: 'Search Schedules', href: '/customer/search', icon: Search },
    { name: 'My Bookings', href: '/customer/bookings', icon: Calendar },
    { name: 'My Profile', href: '/customer/profile', icon: User },
  
  ]

  const isActive = (href) => {
    return location.pathname === href
  }

  return (
    <div className="bg-white border-b border-gray-200 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  active
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default CustomerNavigation