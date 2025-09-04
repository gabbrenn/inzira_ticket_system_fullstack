import React, { useState, useEffect } from 'react'
import { MapPin, Route, Building2, Users, TrendingUp, Activity, AlertCircle, CheckCircle, Trash2 } from 'lucide-react'
import { adminAPI } from '../../services/api'
import DashboardCard from '../../components/DashboardCard'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [systemStats, setSystemStats] = useState({
    totalDistricts: 0,
    totalRoutes: 0,
    totalAgencies: 0,
    totalRoutePoints: 0,
    activeAgencies: 0,
    inactiveAgencies: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSystemStats()
    fetchRecentActivities()
  }, [])

  const fetchSystemStats = async () => {
    try {
      setLoading(true)
      const [summaryRes, scheduleStatsRes] = await Promise.all([
        adminAPI.getMetricsSummary(),
        adminAPI.getScheduleStats()
      ])

      const summary = summaryRes.data.data || {}
      const scheduleStats = scheduleStatsRes.data.data || {}

      setSystemStats({
        totalProvinces: summary.totalProvinces || 0,
        totalDistricts: summary.totalDistricts || 0,
        totalRoutes: summary.totalRoutes || 0,
        totalAgencies: summary.totalAgencies || 0,
        activeAgencies: summary.activeAgencies || 0,
        inactiveAgencies: summary.inactiveAgencies || 0,
        totalRoutePoints: scheduleStats.totalSchedules || 0,
        bookings: {
          total: summary.totalBookings || 0,
          confirmed: summary.confirmedBookings || 0,
          pending: summary.pendingBookings || 0,
          cancelled: summary.cancelledBookings || 0,
          completed: summary.completedBookings || 0,
        },
        payments: {
          success: summary.paymentsSuccess || 0,
          pending: summary.paymentsPending || 0,
          refunded: summary.paymentsRefunded || 0,
        },
        scheduleStats
      })
    } catch (error) {
      console.error('Failed to fetch system stats:', error)
      toast.error('Failed to load system statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleCleanupExpired = async () => {
    try {
      const res = await adminAPI.cleanupExpiredSchedules()
      toast.success(res.data.message || 'Expired schedules cleaned')
      fetchSystemStats()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to cleanup schedules')
    }
  }

  const fetchRecentActivities = async () => {
    // Mock recent activities - in a real app, this would come from an API
    setRecentActivities([
      {
        id: 1,
        type: 'agency_created',
        message: 'New agency "Horizon Express" was registered',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        icon: Building2,
        color: 'text-green-600'
      },
      {
        id: 2,
        type: 'route_created',
        message: 'New route "Kigali → Butare" was created',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        icon: Route,
        color: 'text-blue-600'
      },
      {
        id: 3,
        type: 'district_created',
        message: 'New district "Nyagatare" was added',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        icon: MapPin,
        color: 'text-purple-600'
      }
    ])
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage the entire Inzira ticket system
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <DashboardCard
          title="Total Provinces"
          value={systemStats.totalProvinces || 0}
          icon={Building2}
          color="text-purple-600"
          bgColor="bg-purple-50"
          subtitle={`${systemStats.totalDistricts} districts`}
        />
        <DashboardCard
          title="Total Districts"
          value={systemStats.totalDistricts}
          icon={MapPin}
          color="text-blue-600"
          bgColor="bg-blue-50"
          subtitle={`${systemStats.scheduleStats?.scheduled || 0} scheduled / ${systemStats.scheduleStats?.cancelled || 0} cancelled`
          }
        />
  <DashboardCard
          title="Active Routes"
          value={systemStats.totalRoutes}
          icon={Route}
          color="text-green-600"
          bgColor="bg-green-50"
          subtitle="Inter-district connections"
        />
  <DashboardCard
          title="Registered Agencies"
          value={systemStats.totalAgencies}
          icon={Building2}
          color="text-purple-600"
          bgColor="bg-purple-50"
          subtitle={`${systemStats.activeAgencies} active`}
        />
  <DashboardCard
          title="System Health"
          value={systemStats.activeAgencies > 0 ? "Operational" : "Setup Required"}
          icon={systemStats.activeAgencies > 0 ? CheckCircle : AlertCircle}
          color={systemStats.activeAgencies > 0 ? "text-green-600" : "text-yellow-600"}
          bgColor={systemStats.activeAgencies > 0 ? "bg-green-50" : "bg-yellow-50"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Statistics */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">System Statistics</h2>
              <button
                onClick={fetchSystemStats}
                disabled={loading}
                className="text-sm text-primary-600 hover:text-primary-800 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {systemStats.activeAgencies}
                </div>
                <div className="text-sm text-gray-600">Active Agencies</div>
                <div className="text-xs text-gray-500 mt-1">
                  {((systemStats.activeAgencies / Math.max(systemStats.totalAgencies, 1)) * 100).toFixed(0)}% of total
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {systemStats.inactiveAgencies}
                </div>
                <div className="text-sm text-gray-600">Inactive Agencies</div>
                <div className="text-xs text-gray-500 mt-1">
                  Require attention
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {systemStats.bookings?.total || 0}
                </div>
                <div className="text-sm text-gray-600">Total Bookings</div>
                <div className="text-xs text-gray-500 mt-1">
                  {systemStats.bookings?.confirmed || 0} confirmed · {systemStats.bookings?.pending || 0} pending
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {systemStats.payments?.success || 0}
                </div>
                <div className="text-sm text-gray-600">Successful Payments</div>
                <div className="text-xs text-gray-500 mt-1">
                  {systemStats.payments?.pending || 0} pending · {systemStats.payments?.refunded || 0} refunded
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="text-sm text-orange-800">
                <strong>Schedules:</strong> {systemStats.scheduleStats?.totalSchedules || 0} total · {systemStats.scheduleStats?.expired || 0} expired · {systemStats.scheduleStats?.cancelled || 0} cancelled
              </div>
              <button className="btn-outline flex items-center" onClick={handleCleanupExpired}>
                <Trash2 className="h-4 w-4 mr-2" /> Cleanup expired
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent activities</p>
              </div>
            ) : (
              recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Icon className={`h-5 w-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Setup Guide */}
      {systemStats.totalAgencies === 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-blue-900">Getting Started</h3>
          </div>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold">1</span>
              </div>
              <span>Create districts and route points</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold">2</span>
              </div>
              <span>Define routes between districts</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold">3</span>
              </div>
              <span>Register your first bus agency</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard