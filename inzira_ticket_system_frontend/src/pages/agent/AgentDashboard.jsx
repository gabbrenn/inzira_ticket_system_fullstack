import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Calendar, CreditCard, User, MapPin, Clock, Building2, BarChart3 } from 'lucide-react'
import { agentAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const AgentDashboard = () => {
  const [recentBookings, setRecentBookings] = useState([])
  const [agentProfile, setAgentProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.roleEntityId) {
      fetchAgentProfile()
      fetchRecentBookings()
    }
  }, [user])

  const fetchAgentProfile = async () => {
    try {
      const response = await agentAPI.getProfile(user.roleEntityId)
      setAgentProfile(response.data.data)
    } catch (error) {
      console.error('Failed to fetch agent profile:', error)
    }
  }

  const fetchRecentBookings = async () => {
    try {
      setLoading(true)
      const response = await agentAPI.getBookingsByAgent(user.roleEntityId)
      // Get only the 5 most recent bookings
      const bookings = response.data.data || []
      setRecentBookings(bookings.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch recent bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const agentModules = [
    {
      title: 'Create Booking',
      description: 'Create tickets for walk-in customers',
      link: '/agent/bookings',
      icon: CreditCard,
      color: 'bg-blue-500',
      actions: ['Search Schedules', 'Book Tickets', 'Customer Details']
    },
    {
      title: 'Booking Management',
      description: 'View and manage all your bookings',
      link: '/agent/bookings',
      icon: Calendar,
      color: 'bg-green-500',
      actions: ['View Bookings', 'Confirm Payments', 'Print Tickets']
    },
    {
      title: 'My Profile',
      description: 'Update your profile information',
      link: '/agent/profile',
      icon: User,
      color: 'bg-purple-500',
      actions: ['Update Info', 'Change Password', 'Contact Details']
    },
    {
      title: 'Reports & Analytics',
      description: 'View your booking reports and performance',
      link: '/agent/reports',
      icon: BarChart3,
      color: 'bg-orange-500',
      actions: ['Daily Reports', 'Schedule Reports', 'Download Tickets']
    }
  ]

  const quickActions = [
    { title: 'New Booking', action: 'new-booking', icon: CreditCard, link: '/agent/bookings' },
    { title: 'View Reports', action: 'view-reports', icon: BarChart3, link: '/agent/reports' },
    { title: 'Update Profile', action: 'update-profile', icon: User, link: '/agent/profile' },
  ]

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'CONFIRMED':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'CANCELLED':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'COMPLETED':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome {user?.firstName}! Help customers book their bus tickets
        </p>
        {agentProfile && (
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">{agentProfile.branchOffice.officeName}</span> - {agentProfile.agency.agencyName}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={index}
                to={action.link}
                className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <Icon className="h-5 w-5 text-primary-600 mr-3" />
                  <span className="font-medium text-gray-900">{action.title}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Modules */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agentModules.map((module, index) => {
              const Icon = module.icon
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`inline-flex items-center justify-center w-10 h-10 ${module.color} rounded-lg mr-3`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {module.title}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {module.description}
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      {module.actions.map((action, actionIndex) => (
                        <div key={actionIndex} className="flex items-center text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                          {action}
                        </div>
                      ))}
                    </div>
                    
                    <Link
                      to={module.link}
                      className="btn-primary w-full text-center"
                    >
                      {module.title}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Bookings Sidebar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              <Link to="/agent/bookings" className="text-sm text-primary-600 hover:text-primary-800">
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">
                <div className="loading-spinner mx-auto"></div>
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent bookings</p>
                <Link 
                  to="/agent/bookings" 
                  className="text-sm text-primary-600 hover:text-primary-800 mt-2 inline-block"
                >
                  Create your first booking
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.bookingReference}
                      </div>
                      <span className={getStatusBadge(booking.status)}>
                        {booking.status}
    </div>
  )
}

export default AgentDashboard