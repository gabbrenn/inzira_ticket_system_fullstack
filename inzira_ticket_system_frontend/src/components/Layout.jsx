import React from 'react'
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { Bus, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Layout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  // Check if current route is a dashboard route
  const isDashboardRoute = location.pathname.startsWith('/admin') || 
                          location.pathname.startsWith('/agency') || 
                          location.pathname.startsWith('/branch-manager') || 
                          location.pathname.startsWith('/agent') || 
                          location.pathname.startsWith('/customer')

  // Don't show layout for dashboard routes (they have their own layout)
  if (isDashboardRoute) {
    return children
  }

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
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              {isAuthenticated() ? (
                <>
                  <div className="hidden sm:block text-sm text-gray-700">
                    Welcome, <span className="font-medium">{user.firstName}</span>
                    <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                      {user.role}
                    </span>
                  </div>
                  <div className="sm:hidden text-sm text-gray-700">
                    <span className="font-medium">{user.firstName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
                  >
                    <LogOut className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Logout</span>
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
                    className="btn-primary text-sm px-3 py-2"
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
      <main>
        {children}
      </main>
    </div>
  )
}

export default Layout