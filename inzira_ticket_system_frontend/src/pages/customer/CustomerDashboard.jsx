import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Calendar, CreditCard, MapPin, Clock, ArrowRight, TrendingUp, Users, CheckCircle, Star, Award } from 'lucide-react'
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
      const bookings = response.data.data || []
      setRecentBookings(bookings.slice(0, 3))
    } catch (error) {
      console.error('Failed to fetch recent bookings:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - new Date(timestamp)
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const totalSpent = recentBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0)
  const upcomingTrips = recentBookings.filter(b => b.status === 'CONFIRMED').length
  const completedTrips = recentBookings.filter(b => b.status === 'COMPLETED').length

  return (
    <div className="fade-in">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Ready for your next journey? Let's find the perfect bus for you.
        </p>
      </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {completedTrips}
                </div>
                <div className="text-sm text-gray-600">Completed Trips</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {upcomingTrips}
                </div>
                <div className="text-sm text-gray-600">Upcoming Trips</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {totalSpent.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Spent (RWF)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
              
              <div className="space-y-4">
                <Link
                  to="/customer/search"
                  className="group flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Search className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Search & Book Tickets</h3>
                    <p className="text-sm text-gray-600">Find available schedules and book your journey</p>
                  </div>
                </Link>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              <Link to="/customer/bookings" className="text-sm text-primary-600 hover:text-primary-800">
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="loading-spinner mx-auto"></div>
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No bookings yet</p>
                  <Link 
                    to="/customer/search" 
                    className="text-sm text-primary-600 hover:text-primary-800 mt-2 inline-block"
                  >
                    Book your first ticket
                  </Link>
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {booking.bookingReference}
                      </div>
                      <span className={getStatusBadge(booking.status)}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">
                          {booking.schedule.agencyRoute.route.origin.name} → {booking.schedule.agencyRoute.route.destination.name}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{booking.schedule.departureDate}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{formatTimeAgo(booking.createdAt)}</span>
                        <span className="font-medium text-primary-600">{booking.totalAmount} RWF</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Popular Routes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Popular Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { from: 'Kigali', to: 'Butare', price: '3,500 RWF', duration: '2h 30m' },
              { from: 'Kigali', to: 'Musanze', price: '2,800 RWF', duration: '2h 15m' },
              { from: 'Butare', to: 'Nyanza', price: '1,200 RWF', duration: '45m' }
            ].map((route, index) => (
              <Link
                key={index}
                to="/customer/search"
                className="group p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all cursor-pointer block"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">
                    {route.from} → {route.to}
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{route.duration}</span>
                  <span className="font-semibold text-primary-600">{route.price}</span>
                </div>
              </Link>
            ))}
          </div>
          </div>
        </div>
    </div>
  )
}

export default CustomerDashboard