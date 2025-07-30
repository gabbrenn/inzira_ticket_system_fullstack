import React, { useState, useEffect } from 'react'
import { BarChart3, Calendar, Users, DollarSign, TrendingUp, Download } from 'lucide-react'
import { branchManagerAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const BranchManagerReports = () => {
  const [metrics, setMetrics] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [scheduleBookings, setScheduleBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.roleEntityId) {
      fetchMetrics()
      fetchSchedules()
    }
  }, [user])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await branchManagerAPI.getMetrics(user.roleEntityId)
      setMetrics(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch metrics')
    } finally {
      setLoading(false)
    }
  }

  const fetchSchedules = async () => {
    try {
      const response = await branchManagerAPI.getSchedules(user.roleEntityId)
      setSchedules(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch schedules')
    }
  }

  const fetchScheduleBookings = async (scheduleId) => {
    try {
      const response = await branchManagerAPI.getBookingsBySchedule(scheduleId)
      setScheduleBookings(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch schedule bookings')
    }
  }

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule)
    fetchScheduleBookings(schedule.id)
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
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-2 text-gray-600">
          View detailed reports and analytics for your branch operations
        </p>
        {metrics && (
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">{metrics.branchOfficeName}</span> - {metrics.agencyName}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {metrics?.totalAgents || 0}
              </div>
              <div className="text-sm text-gray-600">Total Agents</div>
              <div className="text-xs text-green-600">
                {metrics?.confirmedAgents || 0} confirmed
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {metrics?.totalSchedules || 0}
              </div>
              <div className="text-sm text-gray-600">Total Schedules</div>
              <div className="text-xs text-blue-600">
                {metrics?.todaySchedules || 0} today
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {metrics?.totalBookings || 0}
              </div>
              <div className="text-sm text-gray-600">Total Bookings</div>
              <div className="text-xs text-green-600">
                {metrics?.confirmedBookings || 0} confirmed
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {metrics?.totalRevenue ? `${parseFloat(metrics.totalRevenue).toLocaleString()}` : '0'}
              </div>
              <div className="text-sm text-gray-600">Total Revenue (RWF)</div>
              <div className="text-xs text-green-600">
                {metrics?.monthlyRevenue ? `${parseFloat(metrics.monthlyRevenue).toLocaleString()}` : '0'} this month
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Schedules List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Schedule Performance</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">
                <div className="loading-spinner mx-auto"></div>
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No schedules found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    onClick={() => handleScheduleSelect(schedule)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSchedule?.id === schedule.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          {schedule.agencyRoute.route.origin.name} → {schedule.agencyRoute.route.destination.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {schedule.departureDate} at {schedule.departureTime}
                        </div>
                      </div>
                      <span className={getScheduleStatusBadge(schedule.status)}>
                        {schedule.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{schedule.bus.plateNumber}</span>
                      <span>{schedule.availableSeats} seats available</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Schedule Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedSchedule ? 'Bookings for Selected Schedule' : 'Select a Schedule'}
            </h2>
            {selectedSchedule && (
              <div className="text-sm text-gray-500 mt-1">
                {selectedSchedule.agencyRoute.route.origin.name} → {selectedSchedule.agencyRoute.route.destination.name} 
                on {selectedSchedule.departureDate}
                <div className="mt-1 text-xs">
                  Total bookings: {scheduleBookings.length}
                </div>
              </div>
            )}
          </div>
          <div className="p-6">
            {!selectedSchedule ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Select a schedule to view its bookings</p>
              </div>
            ) : scheduleBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No bookings found for this schedule</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {scheduleBookings.map((booking) => (
                  <div key={booking.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          {booking.bookingReference}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.customer.firstName} {booking.customer.lastName}
                        </div>
                      </div>
                      <div>
                        <span className={getStatusBadge(booking.status)}>
                          {booking.status}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {booking.customer.email ? 'Online Customer' : 'Walk-in Customer'}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{booking.numberOfSeats} seat(s)</span>
                      <span className="font-medium">{booking.totalAmount} RWF</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {booking.pickupPoint.name} → {booking.dropPoint.name}
                      <div className="mt-1">
                        Booked: {new Date(booking.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {metrics?.pendingBookings || 0}
              </div>
              <div className="text-sm text-gray-600">Pending Bookings</div>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {metrics?.completedBookings || 0}
              </div>
              <div className="text-sm text-gray-600">Completed Trips</div>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {metrics?.activeAgents || 0}
              </div>
              <div className="text-sm text-gray-600">Active Agents</div>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BranchManagerReports