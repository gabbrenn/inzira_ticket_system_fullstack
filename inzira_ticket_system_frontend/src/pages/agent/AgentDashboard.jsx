import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, BarChart3, User, Calendar, Clock, MapPin, Activity, TrendingUp } from 'lucide-react'
import { agentAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import DashboardCard from '../../components/DashboardCard'
import toast from 'react-hot-toast'

const AgentDashboard = () => {
  const [recentBookings, setRecentBookings] = useState([])
  const [agentProfile, setAgentProfile] = useState(null)
  const [todayStats, setTodayStats] = useState({
    bookingsCreated: 0,
    totalRevenue: 0,
    seatsBooked: 0
  })
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.roleEntityId) {
      fetchAgentProfile()
      fetchRecentBookings()
      fetchTodayStats()
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
      const bookings = response.data.data || []
      setRecentBookings(bookings.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch recent bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTodayStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await agentAPI.getDailyBookings(user.roleEntityId, today)
      const todayBookings = response.data.data || []
      
      setTodayStats({
        bookingsCreated: todayBookings.length,
        totalRevenue: todayBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0),
        seatsBooked: todayBookings.reduce((sum, b) => sum + b.numberOfSeats, 0)
      })
    } catch (error) {
      console.error('Failed to fetch today stats:', error)
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

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome {user?.firstName}! Help customers book their perfect journey
        </p>
        {agentProfile && (
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">{agentProfile.branchOffice.officeName}</span> - {agentProfile.agency.agencyName}
          </div>
        )}
      </div>

      {/* Today's Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Today's Bookings"
          value={todayStats.bookingsCreated}
          icon={CreditCard}
          color="text-blue-600"
          bgColor="bg-blue-50"
          subtitle="Tickets created today"
        />
        <DashboardCard
          title="Seats Sold"
          value={todayStats.seatsBooked}
          icon={TrendingUp}
          color="text-green-600"
          bgColor="bg-green-50"
          subtitle="Today's sales"
        />
        <DashboardCard
          title="Revenue Generated"
          value={`${todayStats.totalRevenue.toLocaleString()} RWF`}
          icon={BarChart3}
          color="text-purple-600"
          bgColor="bg-purple-50"
          subtitle="Today's earnings"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/agent/bookings"
                className="group p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Create Booking</h3>
                    <p className="text-sm text-gray-600">Help customers book tickets</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/agent/reports"
                className="group p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">View Reports</h3>
                    <p className="text-sm text-gray-600">Check your performance</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Performance Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Performance Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {recentBookings.length}
                  </div>
                  <div className="text-xs text-gray-600">Recent Bookings</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {recentBookings.filter(b => b.status === 'CONFIRMED').length}
                  </div>
                  <div className="text-xs text-gray-600">Confirmed</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {recentBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Revenue (RWF)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
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
              recentBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {booking.bookingReference}
                    </div>
                    <span className={getStatusBadge(booking.status)}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="truncate mb-1">
                      {booking.customer.firstName} {booking.customer.lastName}
                    </div>
                    <div className="flex justify-between">
                      <span>{booking.numberOfSeats} seat(s)</span>
                      <span className="font-medium">{booking.totalAmount} RWF</span>
                    </div>
                    <div className="text-gray-500 mt-1">
                      {formatTimeAgo(booking.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Agent Status */}
      {agentProfile && !agentProfile.confirmedByAgency && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
            <h3 className="text-lg font-semibold text-yellow-900">Account Pending Confirmation</h3>
          </div>
          <div className="text-sm text-yellow-800">
            <p>Your agent account is pending confirmation from your agency. You may have limited access until confirmed.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentDashboard