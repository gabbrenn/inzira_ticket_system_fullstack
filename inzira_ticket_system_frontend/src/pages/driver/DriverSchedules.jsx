import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Users, Bus, Filter, Eye } from 'lucide-react'
import { driverAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const DriverSchedules = () => {
  const [schedules, setSchedules] = useState([])
  const [filteredSchedules, setFilteredSchedules] = useState([])
  const [loading, setLoading] = useState(false)
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [showBookingsModal, setShowBookingsModal] = useState(false)
  const [scheduleBookings, setScheduleBookings] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (user?.roleEntityId) {
      fetchSchedules()
    }
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [schedules, dateFilter, statusFilter])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const response = await driverAPI.getSchedules(user.roleEntityId)
      const schedulesData = response.data.data || []
      // Sort schedules by departure date and time (newest first)
      const sortedSchedules = schedulesData.sort((a, b) => {
        const dateA = new Date(`${a.departureDate}T${a.departureTime}`)
        const dateB = new Date(`${b.departureDate}T${b.departureTime}`)
        return dateB - dateA
      })
      setSchedules(sortedSchedules)
    } catch (error) {
      toast.error('Failed to fetch schedules')
    } finally {
      setLoading(false)
    }
  }

  const fetchScheduleBookings = async (scheduleId) => {
  try {
    const response = await driverAPI.getScheduleBookings(scheduleId, user.roleEntityId)
    const bookingsArray = Array.isArray(response.data.data.bookings) ? response.data.data.bookings : []
    console.log(bookingsArray)
    setScheduleBookings(bookingsArray)
  } catch (error) {
    toast.error('Failed to fetch schedule bookings')
    setScheduleBookings([])
  }
}


  const applyFilters = () => {
    let filtered = [...schedules]

    if (dateFilter) {
      filtered = filtered.filter(schedule => schedule.departureDate === dateFilter)
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(schedule => schedule.status === statusFilter)
    }

    setFilteredSchedules(filtered)
  }

  const handleViewBookings = async (schedule) => {
    setSelectedSchedule(schedule)
    await fetchScheduleBookings(schedule.id)
    setShowBookingsModal(true)
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

  const getBookingStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'CONFIRMED':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'COMPLETED':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'CANCELLED':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getTotalPassengers = (schedule) => {
    return schedule.bus.capacity - schedule.availableSeats
  }

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Schedules</h1>
        <p className="mt-2 text-gray-600">
          View your assigned bus schedules and passenger information
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-full"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="DEPARTED">Departed</option>
              <option value="ARRIVED">Arrived</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchSchedules}
              className="btn-secondary w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Assigned Schedules ({filteredSchedules.length})
          </h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto"></div>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No schedules found</p>
              {dateFilter || statusFilter !== 'ALL' ? (
                <p className="text-sm mt-2">Try adjusting your filter criteria</p>
              ) : (
                <p className="text-sm mt-2">No schedules have been assigned to you yet</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSchedules.map((schedule) => (
                <div key={schedule.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {schedule.agencyRoute.route.origin.name} → {schedule.agencyRoute.route.destination.name}
                        </h3>
                        <span className={getStatusBadge(schedule.status)}>
                          {schedule.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Distance: {schedule.agencyRoute.route.distanceKm} km • Price: {schedule.agencyRoute.price} RWF
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">
                        {getTotalPassengers(schedule)} passengers
                      </div>
                      <div className="text-sm text-gray-500">
                        {schedule.availableSeats} seats left
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{schedule.departureDate}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{schedule.departureTime} - {schedule.arrivalTime}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Bus className="h-4 w-4 mr-2" />
                      <span>{schedule.bus.plateNumber} ({schedule.bus.busType})</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{schedule.bus.capacity} total seats</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Agency:</span> {schedule.agencyRoute.agency.agencyName}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewBookings(schedule)}
                        className="btn-outline text-sm py-2 px-3"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Passengers
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Bookings Modal */}
      {showBookingsModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Passengers - {selectedSchedule.agencyRoute.route.origin.name} → {selectedSchedule.agencyRoute.route.destination.name}
              </h3>
              <button
                onClick={() => setShowBookingsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div><strong>Date:</strong> {selectedSchedule.departureDate}</div>
                <div><strong>Time:</strong> {selectedSchedule.departureTime} - {selectedSchedule.arrivalTime}</div>
                <div><strong>Bus:</strong> {selectedSchedule.bus.plateNumber}</div>
                <div><strong>Total Passengers:</strong> {scheduleBookings.length}</div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {scheduleBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No passengers booked for this schedule</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Passenger
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking Reference
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pickup → Drop
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scheduleBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.customer.firstName} {booking.customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.customer.phoneNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            {booking.bookingReference}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.pickupPoint.name} → {booking.dropPoint.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.numberOfSeats}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getBookingStatusBadge(booking.status)}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.totalAmount} RWF
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowBookingsModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {schedules.filter(s => s.status === 'SCHEDULED').length}
          </div>
          <div className="text-sm text-gray-600">Scheduled</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {schedules.filter(s => s.status === 'DEPARTED').length}
          </div>
          <div className="text-sm text-gray-600">Departed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {schedules.filter(s => s.status === 'ARRIVED').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {schedules.length}
          </div>
          <div className="text-sm text-gray-600">Total Assigned</div>
        </div>
      </div>
    </div>
  )
}

export default DriverSchedules