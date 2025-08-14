import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, Settings, Users, MapPin, Route, Building2, Bus, Calendar, 
  BarChart3, UserCheck, Crown, User, CreditCard, ClipboardList,
  ChevronRight, LogOut, X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { user, hasRole, logout } = useAuth()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    window.location.href = '/'
  }

  const getNavigationItems = () => {
    if (hasRole('ADMIN')) {
      return [
        { name: 'Dashboard', href: '/admin', icon: Home },
        { name: 'Provinces', href: '/admin/provinces', icon: Building2 },
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

    if (hasRole('DRIVER')) {
      return [
        { name: 'Dashboard', href: '/driver', icon: Home },
        { name: 'My Schedules', href: '/driver/schedules', icon: Calendar },
        { name: 'Ticket Verification', href: '/driver/verification', icon: UserCheck },
        { name: 'Profile', href: '/driver/profile', icon: User },
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
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center">
          
          <Bus className="h-8 w-8 text-primary-600" />
          <Link to="/" className="ml-2 text-xl font-bold text-gray-900">Inzira</Link>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-primary-600" />
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-gray-500 truncate">{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${active 
                  ? 'bg-primary-100 text-primary-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className={`h-5 w-5 mr-3 transition-colors ${
                active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              <span className="truncate">{item.name}</span>
              {active && <ChevronRight className="h-4 w-4 ml-auto text-primary-600" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200"
        >
          <LogOut className="h-5 w-5 mr-3 text-gray-400 group-hover:text-red-500" />
          <span>Logout</span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          © 2024 Inzira Ticket System
        </div>
      </div>
    </div>
  )
}

export default Sidebar