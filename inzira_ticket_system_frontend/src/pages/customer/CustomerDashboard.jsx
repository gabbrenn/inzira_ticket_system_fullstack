import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Calendar, CreditCard, User, MapPin, Clock } from 'lucide-react'
import { customerAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const CustomerDashboard = () => {
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.roleEntityId) {
      fetchRecentBookings()
    }
  }, [user])

  const fetchRecentBookings = async () => {
    try {
      setLoading(true)
      const response = await customerAPI.getBookingsByCustomer(user.roleEntityId)
      // Get only the 3 most recent bookings
      const bookings = response.data.data || []
      setRecentBookings(bookings.slice(0, 3))
    } catch (error) {
      console.error('Failed to fetch recent bookings:', error)
      // Don't show error toast for this as it's not critical
    } finally {
      setLoading(false)
    }
  }

  const customerModules = [
    {
      title: 'Search Schedules',
      description: 'Find and book bus tickets for your journey',
      link: '/customer/search',
      icon: Search,
      color: 'bg-blue-500',
      actions: ['Search Routes', 'Compare Prices', 'Check Availability']
    },
    {
      title: 'My Bookings',
      description: 'View and manage your ticket bookings',
      link: '/customer/bookings',
      icon: Calendar,
      color: 'bg-green-500',
      actions: ['View Tickets', 'Cancel Bookings', 'Download Receipts']
    }
  ]

  const quickActions = [
    { title: 'Book a Ticket', action: 'book-ticket', icon: Search, link: '/customer/search' },
    { title: 'Check Booking', action: 'check-booking', icon: Calendar, link: '/customer/bookings' },
    { title: 'Payment History', action: 'payment-history', icon: CreditCard, link: '/customer/bookings' },
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
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
        <p className="mt-2 text-gray-600">
          Book tickets and manage your travel with ease
        </p>
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
                className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left block"
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
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customerModules.map((module, index) => {
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
              <Link to="/customer/bookings" className="text-sm text-primary-600 hover:text-primary-800">
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
                  to="/customer/search" 
                  className="text-sm text-primary-600 hover:text-primary-800 mt-2 inline-block"
                >
                  Book your first ticket
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
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex items-center mb-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {booking.schedule.agencyRoute.route.origin.name} → {booking.schedule.agencyRoute.route.destination.name}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {booking.schedule.departureDate} at {booking.schedule.departureTime}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-primary-600">
                      {booking.totalAmount} RWF
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Travel Stats */}
      <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Travel Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {recentBookings.filter(b => b.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-gray-600">Completed Trips</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {recentBookings.filter(b => b.status === 'CONFIRMED').length}
            </div>
            <div className="text-sm text-gray-600">Upcoming Trips</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {recentBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Spent (RWF)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {recentBookings.reduce((sum, b) => sum + (b.numberOfSeats || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Seats Booked</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard