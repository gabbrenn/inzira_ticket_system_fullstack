import React, { useState, useEffect } from 'react'
import { Bus, Users, Route, Calendar, Building2, UserCheck, TrendingUp, DollarSign, Activity, AlertTriangle } from 'lucide-react'
import { agencyAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import DashboardCard from '../../components/DashboardCard'
import toast from 'react-hot-toast'

const AgencyDashboard = () => {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.roleEntityId) {
      fetchMetrics()
      fetchRecentBookings()
    }
  }, [user])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await agencyAPI.getMetrics(user.roleEntityId)
      setMetrics(response.data.data)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentBookings = async () => {
    try {
      const response = await agencyAPI.getBookingsByAgency(user.roleEntityId)
      const bookings = response.data.data || []
      setRecentBookings(bookings.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch recent bookings:', error)
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
        <h1 className="text-3xl font-bold text-gray-900">Agency Overview</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.firstName}! Here's what's happening with your agency
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Fleet Size"
          value={metrics?.totalBuses || 0}
          icon={Bus}
          color="text-blue-600"
          bgColor="bg-blue-50"
          subtitle={`${metrics?.activeBuses || 0} active buses`}
        />
        <DashboardCard
          title="Staff Members"
          value={(metrics?.totalDrivers || 0) + (metrics?.totalAgents || 0)}
          icon={Users}
          color="text-green-600"
          bgColor="bg-green-50"
          subtitle={`${metrics?.activeDrivers || 0} drivers, ${metrics?.activeAgents || 0} agents`}
        />
        <DashboardCard
          title="Today's Revenue"
          value={metrics?.monthlyRevenue ? `${parseFloat(metrics.monthlyRevenue).toLocaleString()} RWF` : '0 RWF'}
          icon={DollarSign}
          color="text-purple-600"
          bgColor="bg-purple-50"
          subtitle="This month"
        />
        <DashboardCard
          title="Active Bookings"
          value={metrics?.confirmedBookings || 0}
          icon={Calendar}
          color="text-orange-600"
          bgColor="bg-orange-50"
          subtitle={`${metrics?.totalBookings || 0} total bookings`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {metrics?.todaySchedules || 0}
                </div>
                <div className="text-sm text-gray-600">Today's Schedules</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {metrics?.activeBranchOffices || 0}
                </div>
                <div className="text-sm text-gray-600">Branch Offices</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {metrics?.uniqueCustomers || 0}
                </div>
                <div className="text-sm text-gray-600">Unique Customers</div>
              </div>
            </div>

            {/* Revenue Trend */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Revenue Summary</h3>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {metrics?.totalRevenue ? `${parseFloat(metrics.totalRevenue).toLocaleString()} RWF` : '0 RWF'}
                  </div>
                  <div className="text-sm text-gray-500">Total Revenue</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {metrics?.monthlyRevenue ? `${parseFloat(metrics.monthlyRevenue).toLocaleString()} RWF` : '0 RWF'}
                  </div>
                  <div className="text-sm text-gray-500">This Month</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent bookings</p>
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
                    <div className="truncate">
                      {booking.customer.firstName} {booking.customer.lastName}
                    </div>
                    <div className="flex justify-between mt-1">
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

      {/* Setup Alerts */}
      {metrics && (metrics.totalBuses === 0 || metrics.totalDrivers === 0 || metrics.totalSchedules === 0) && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
            <h3 className="text-lg font-semibold text-yellow-900">Setup Required</h3>
          </div>
          <div className="space-y-2 text-sm text-yellow-800">
            {metrics.totalBuses === 0 && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                <span>Add buses to your fleet</span>
              </div>
            )}
            {metrics.totalDrivers === 0 && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                <span>Register drivers for your buses</span>
              </div>
            )}
            {metrics.totalSchedules === 0 && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                <span>Create schedules to start accepting bookings</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AgencyDashboard