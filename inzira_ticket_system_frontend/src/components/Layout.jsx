import React from 'react'
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { Bus, LogOut, Search } from 'lucide-react'
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
                          location.pathname.startsWith('/driver') || 
                          location.pathname.startsWith('/customer')

  // Don't show layout for dashboard routes (they have their own layout)
  if (isDashboardRoute) {
    return children
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Brand */}
            <div className="flex items-center">
              <Bus className="h-8 w-8 text-white" />
              <Link to="/" className="ml-2 text-xl font-bold text-white">Inzira</Link>
            </div>

            {/* Center links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="#" className="text-white hover:text-gray-900 text-sm font-medium">Download App</Link>
              <Link to="#" className="text-white hover:text-gray-900 text-sm font-medium">Language</Link>
              <Link to="/find-booking" className="text-white hover:text-gray-900" aria-label="Find your booking">
                <Search className="h-5 w-5" />
              </Link>
            </div>

            {/* Right section */}
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
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-600 hover:text-gray-900 focus:outline-none transition"
                  >
                    <LogOut className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-white hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Inzira. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="#" className="text-gray-600 hover:text-gray-900">Support Center</Link>
              <div className="flex items-center gap-4">
                <a href="#" className="text-gray-600 hover:text-gray-900">Twitter</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Facebook</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Instagram</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout