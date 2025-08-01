import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, Settings, Users, MapPin, Route, Building2, Bus, Calendar, 
  BarChart3, UserCheck, Crown, User, CreditCard, ClipboardList,
  ChevronRight, ChevronDown
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { user, hasRole } = useAuth()

  const getNavigationItems = () => {
    if (hasRole('ADMIN')) {
      return [
        { name: 'Dashboard', href: '/admin', icon: Home },
        { name: 'Districts', href: '/admin/districts', icon: MapPin },
        { name: 'Routes', href: '/admin/routes', icon: Route },
        { name: 'Agencies', href: '/admin/agencies', icon: Building2 },
      ]
    }

    if (hasRole('AGENCY')) {
      return [
        { name: 'Dashboard', href: '/agency', icon: Home },
        { name: 'Profile', href: '/agency/profile', icon: User },
        { name: 'Branch Offices', href: '/agency/branch-offices', icon: Building2 },
        { name: 'Branch Managers', href: '/agency/branch-managers', icon: Crown },
        { name: 'Agents', href: '/agency/agents', icon: UserCheck },
        { name: 'Buses', href: '/agency/buses', icon: Bus },
        { name: 'Drivers', href: '/agency/drivers', icon: Users },
        { name: 'Routes', href: '/agency/routes', icon: Route },
        { name: 'Schedules', href: '/agency/schedules', icon: Calendar },
        { name: 'Booking History', href: '/agency/booking-history', icon: BarChart3 },
      ]
    }

    if (hasRole('BRANCH_MANAGER')) {
      return [
        { name: 'Dashboard', href: '/branch-manager', icon: Home },
        { name: 'Agents', href: '/branch-manager/agents', icon: Users },
        { name: 'Schedules', href: '/branch-manager/schedules', icon: Calendar },
        { name: 'Reports', href: '/branch-manager/reports', icon: BarChart3 },
      ]
    }

    if (hasRole('AGENT')) {
      return [
        { name: 'Dashboard', href: '/agent', icon: Home },
        { name: 'Booking Management', href: '/agent/bookings', icon: CreditCard },
        { name: 'Profile', href: '/agent/profile', icon: User },
        { name: 'Reports', href: '/agent/reports', icon: ClipboardList },
      ]
    }

    if (hasRole('CUSTOMER')) {
      return [
        { name: 'Dashboard', href: '/customer', icon: Home },
        { name: 'Search Schedules', href: '/customer/search', icon: Calendar },
        { name: 'My Bookings', href: '/customer/bookings', icon: CreditCard },
      ]
    }

    return []
  }

  const navigationItems = getNavigationItems()

  const isActive = (href) => {
    return location.pathname === href || 
           (href !== '/' && location.pathname.startsWith(href))
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none lg:border-r lg:border-gray-200
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Bus className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Inzira</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${active 
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                  {active && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © 2024 Inzira Ticket System
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar