import React, { useState, useEffect } from 'react'
import { Users, Calendar, BarChart3, Building2, TrendingUp, DollarSign, Activity, AlertTriangle } from 'lucide-react'
import { branchManagerAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import DashboardCard from '../../components/DashboardCard'
import toast from 'react-hot-toast'

const BranchManagerDashboard = () => {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [recentSchedules, setRecentSchedules] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.roleEntityId) {
      fetchMetrics()
      fetchRecentSchedules()
    }
  }, [user])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await branchManagerAPI.getMetrics(user.roleEntityId)
      setMetrics(response.data.data)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentSchedules = async () => {
    try {
      const response = await branchManagerAPI.getSchedules(user.roleEntityId)
      const schedules = response.data.data || []
      setRecentSchedules(schedules.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch recent schedules:', error)
    }
  }

  const getScheduleStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'SCHEDULED':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'DEPARTED':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'ARRIVED':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'CANCELLED':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Branch Overview</h1>
        <p className="mt-2 text-gray-600">
          Welcome {user?.firstName}! Monitor your branch performance and operations
        </p>
        {metrics && (
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">{metrics.branchOfficeName}</span> - {metrics.agencyName}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Branch Agents"
          value={metrics?.totalAgents || 0}
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-50"
          subtitle={`${metrics?.confirmedAgents || 0} confirmed`}
        />
        <DashboardCard
          title="Active Schedules"
          value={metrics?.totalSchedules || 0}
          icon={Calendar}
          color="text-green-600"
          bgColor="bg-green-50"
          subtitle={`${metrics?.todaySchedules || 0} today`}
        />
        <DashboardCard
          title="Total Bookings"
          value={metrics?.totalBookings || 0}
          icon={BarChart3}
          color="text-purple-600"
          bgColor="bg-purple-50"
          subtitle={`${metrics?.confirmedBookings || 0} confirmed`}
        />
        <DashboardCard
          title="Monthly Revenue"
          value={metrics?.monthlyRevenue ? `${parseFloat(metrics.monthlyRevenue).toLocaleString()} RWF` : '0 RWF'}
          icon={DollarSign}
          color="text-orange-600"
          bgColor="bg-orange-50"
          subtitle="This month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Branch Performance</h2>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {metrics?.activeAgents || 0}
                </div>
                <div className="text-sm text-gray-600">Active Agents</div>
                <div className="text-xs text-gray-500 mt-1">
                  {metrics?.totalAgents ? ((metrics.activeAgents / metrics.totalAgents) * 100).toFixed(0) : 0}% of total
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {metrics?.pendingBookings || 0}
                </div>
                <div className="text-sm text-gray-600">Pending Bookings</div>
                <div className="text-xs text-gray-500 mt-1">
                  Require attention
                </div>
              </div>
            </div>

            {/* Revenue Summary */}
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
                    {metrics?.completedBookings || 0}
                  </div>
                  <div className="text-sm text-gray-500">Completed Trips</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Schedules */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Schedules</h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentSchedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent schedules</p>
              </div>
            ) : (
              recentSchedules.map((schedule) => (
                <div key={schedule.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {schedule.agencyRoute.route.origin.name} → {schedule.agencyRoute.route.destination.name}
                    </div>
                    <span className={getScheduleStatusBadge(schedule.status)}>
                      {schedule.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>{schedule.departureDate}</span>
                      <span>{schedule.departureTime}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>{schedule.bus.plateNumber}</span>
                      <span>{schedule.availableSeats} seats</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Setup Alerts */}
      {metrics && metrics.totalAgents === 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
            <h3 className="text-lg font-semibold text-yellow-900">Setup Required</h3>
          </div>
          <div className="text-sm text-yellow-800">
            <p>Your branch office doesn't have any agents yet. Add agents to start processing customer bookings.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default BranchManagerDashboard