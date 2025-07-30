import React, { useState, useEffect } from 'react'
import { Calendar, Users, DollarSign, Download, Filter, BarChart3, Clock } from 'lucide-react'
import { agentAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const AgentReports = () => {
  const [dailyBookings, setDailyBookings] = useState([])
  const [scheduleBookings, setScheduleBookings] = useState([])
  const [schedules, setSchedules] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.roleEntityId) {
      // Set default date to today
      const today = new Date().toISOString().split('T')[0]
      setSelectedDate(today)
      fetchDailyBookings(today)
      fetchAgentSchedules()
    }
  }, [user])

  const fetchDailyBookings = async (date) => {
    try {
      setLoading(true)
      const response = await agentAPI.getDailyBookings(user.roleEntityId, date)
      setDailyBookings(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch daily bookings')
    } finally {
      setLoading(false)
    }
  }

  const fetchScheduleBookings = async (scheduleId) => {
    try {
      setLoading(true)
      const response = await agentAPI.getScheduleBookings(user.roleEntityId, scheduleId)
      setScheduleBookings(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch schedule bookings')
    } finally {
      setLoading(false)
    }
  }

  const fetchAgentSchedules = async () => {
    try {
      // Get agent info first to get agency schedules
      const agentResponse = await agentAPI.getProfile(user.roleEntityId)
      const agentData = agentResponse.data.data
      
      const response = await agentAPI.getAgencySchedules(agentData.agency.id)
      setSchedules(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch schedules')
    }
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    fetchDailyBookings(date)
  }

  const handleScheduleChange = (scheduleId) => {
    setSelectedSchedule(scheduleId)
    if (scheduleId) {
      fetchScheduleBookings(scheduleId)
    } else {
      setScheduleBookings([])
    }
  }

  const handleDownloadTicket = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/tickets/download/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to download ticket')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `ticket_${dailyBookings.find(b => b.id === bookingId)?.bookingReference || scheduleBookings.find(b => b.id === bookingId)?.bookingReference}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Ticket downloaded successfully')
    } catch (error) {
      toast.error('Failed to download ticket')
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

  const dailyTotal = dailyBookings.reduce((sum, booking) => sum + parseFloat(booking.totalAmount), 0)
  const scheduleTotal = scheduleBookings.reduce((sum, booking) => sum + parseFloat(booking.totalAmount), 0)

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agent Reports</h1>
        <p className="mt-2 text-gray-600">
          View reports of tickets you've created and manage bookings
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date for Daily Report
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Schedule for Detailed Report
            </label>
            <select
              value={selectedSchedule}
              onChange={(e) => handleScheduleChange(e.target.value)}
              className="input w-full"
            >
              <option value="">Select a schedule</option>
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.agencyRoute.route.origin.name} → {schedule.agencyRoute.route.destination.name} 
                  ({schedule.departureDate} at {schedule.departureTime})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Bookings Report */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Daily Report - {selectedDate}
              </h2>
              <div className="text-sm text-gray-500">
                Total: {dailyTotal.toLocaleString()} RWF
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">
                <div className="loading-spinner mx-auto"></div>
              </div>
            ) : dailyBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No bookings found for this date</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dailyBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          {booking.bookingReference}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.customer.firstName} {booking.customer.lastName}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={getStatusBadge(booking.status)}>
                          {booking.status}
                        </span>
                        <button
                          onClick={() => handleDownloadTicket(booking.id)}
                          className="ml-2 p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex justify-between">
                        <span>{booking.schedule.agencyRoute.route.origin.name} → {booking.schedule.agencyRoute.route.destination.name}</span>
                        <span className="font-medium">{booking.totalAmount} RWF</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{booking.numberOfSeats} seat(s)</span>
                        <span>{new Date(booking.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Schedule Bookings Report */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Schedule Report
              </h2>
              {selectedSchedule && (
                <div className="text-sm text-gray-500">
                  Total: {scheduleTotal.toLocaleString()} RWF
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {!selectedSchedule ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Select a schedule to view its bookings</p>
              </div>
            ) : loading ? (
              <div className="text-center py-4">
                <div className="loading-spinner mx-auto"></div>
              </div>
            ) : scheduleBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No bookings found for this schedule</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {scheduleBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          {booking.bookingReference}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.customer.firstName} {booking.customer.lastName}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={getStatusBadge(booking.status)}>
                          {booking.status}
                        </span>
                        <button
                          onClick={() => handleDownloadTicket(booking.id)}
                          className="ml-2 p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex justify-between">
                        <span>{booking.pickupPoint.name} → {booking.dropPoint.name}</span>
                        <span className="font-medium">{booking.totalAmount} RWF</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{booking.numberOfSeats} seat(s)</span>
                        <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
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
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {dailyBookings.length}
              </div>
              <div className="text-sm text-gray-600">Today's Bookings</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {dailyBookings.reduce((sum, b) => sum + b.numberOfSeats, 0)}
              </div>
              <div className="text-sm text-gray-600">Seats Sold Today</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {dailyTotal.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Daily Revenue (RWF)</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {dailyBookings.filter(b => b.status === 'CONFIRMED').length}
              </div>
              <div className="text-sm text-gray-600">Confirmed Bookings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentReports