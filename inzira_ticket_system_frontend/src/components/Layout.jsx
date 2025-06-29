import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bus, Users, MapPin, Calendar, User, Home, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Layout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated, hasRole } = useAuth()
  
  const navigation = [
    { name: 'Home', href: '/', icon: Home, public: true },
    { name: 'Admin Panel', href: '/admin', icon: Settings, role: 'ADMIN' },
    { name: 'Agency Panel', href: '/agency', icon: Bus, role: 'AGENCY' },
    { name: 'Customer Panel', href: '/customer', icon: User, role: 'CUSTOMER' },
  ]

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const filteredNavigation = navigation.filter(item => {
    if (item.public) return true
    if (!isAuthenticated()) return false
    if (item.role) return hasRole(item.role)
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Bus className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Inzira</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/' && location.pathname.startsWith(item.href))
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              {isAuthenticated() ? (
                <>
                  <div className="text-sm text-gray-700">
                    Welcome, <span className="font-medium">{user.firstName}</span>
                    <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register/customer"
                    className="btn-primary"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default Layout