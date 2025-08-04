import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, UserCheck, User, Clock, MapPin, Activity, TrendingUp, Bus, AlertTriangle } from 'lucide-react'
import { driverAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import DashboardCard from '../../components/DashboardCard'
import toast from 'react-hot-toast'

const DriverDashboard = () => {
  const [todaySchedules, setTodaySchedules] = useState([])
  const [upcomingSchedules, setUpcomingSchedules] = useState([])
  const [driverProfile, setDriverProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.roleEntityId) {
      fetchDriverProfile()
      fetchTodaySchedules()
      fetchUpcomingSchedules()
    }
  }, [user])

  const fetchDriverProfile = async () => {
    try {
      const response = await driverAPI.getProfile(user.roleEntityId)
      setDriverProfile(response.data.data)
    } catch (error) {
      console.error('Failed to fetch driver profile:', error)
    }
  }

  const fetchTodaySchedules = async () => {
    try {
      setLoading(true)
      const response = await driverAPI.getTodaySchedules(user.roleEntityId)
      setTodaySchedules(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch today schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUpcomingSchedules = async () => {
    try {
      const response = await driverAPI.getUpcomingSchedules(user.roleEntityId)
      setUpcomingSchedules(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch upcoming schedules:', error)
    }
  }

  const getStatusBadge = (status) => {
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
        <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome {user?.firstName}! Manage your schedules and verify passenger tickets
        </p>
        {driverProfile && (
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">License: {driverProfile.licenseNumber}</span> - {driverProfile.agency.agencyName}
          </div>
        )}
      </div>

      {/* Today's Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Today's Schedules"
          value={todaySchedules.length}
          icon={Calendar}
          color="text-blue-600"
          bgColor="bg-blue-50"
          subtitle="Assigned for today"
        />
        <DashboardCard
          title="Upcoming Trips"
          value={upcomingSchedules.length}
          icon={TrendingUp}
          color="text-green-600"
          bgColor="bg-green-50"
          subtitle="Future schedules"
        />
        <DashboardCard
          title="Bus Assigned"
          value={todaySchedules.length > 0 ? todaySchedules[0].bus.plateNumber : 'None'}
          icon={Bus}
          color="text-purple-600"
          bgColor="bg-purple-50"
          subtitle={todaySchedules.length > 0 ? todaySchedules[0].bus.busType : 'No assignment'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/driver/schedules"
                className="group p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">View Schedules</h3>
                    <p className="text-sm text-gray-600">Check your assigned trips</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/driver/verification"
                className="group p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Verify Tickets</h3>
                    <p className="text-sm text-gray-600">Scan or check passenger tickets</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Today's Schedule Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Today's Schedule Summary</h3>
              {todaySchedules.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No schedules assigned for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySchedules.slice(0, 3).map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {schedule.agencyRoute.route.origin.name} → {schedule.agencyRoute.route.destination.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {schedule.departureTime} - {schedule.arrivalTime}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={getStatusBadge(schedule.status)}>
                          {schedule.status}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {schedule.bus.plateNumber}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Trips</h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="loading-spinner mx-auto"></div>
              </div>
            ) : upcomingSchedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No upcoming schedules</p>
              </div>
            ) : (
              upcomingSchedules.slice(0, 5).map((schedule) => (
                <div key={schedule.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {schedule.agencyRoute.route.origin.name} → {schedule.agencyRoute.route.destination.name}
                    </div>
                    <span className={getStatusBadge(schedule.status)}>
                      {schedule.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="flex justify-between mb-1">
                      <span>{schedule.departureDate}</span>
                      <span>{schedule.departureTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{schedule.bus.plateNumber}</span>
                      <span>{schedule.availableSeats} seats left</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Driver Status */}
      {driverProfile && driverProfile.status !== 'ACTIVE' && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
            <h3 className="text-lg font-semibold text-yellow-900">Driver Status: {driverProfile.status}</h3>
          </div>
          <div className="text-sm text-yellow-800">
            <p>Your driver status is currently {driverProfile.status.toLowerCase()}. Contact your agency if you believe this is an error.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DriverDashboard