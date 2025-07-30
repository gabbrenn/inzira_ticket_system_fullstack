import React, { useState, useEffect } from 'react'
import { Search, Calendar, MapPin, Clock, Users, ArrowRight, Plus, X, Save } from 'lucide-react'
import { agentAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const AgentBookingManagement = () => {
  const [bookings, setBookings] = useState([])
  const [districts, setDistricts] = useState([])
  const [schedules, setSchedules] = useState([])
  const [routePoints, setRoutePoints] = useState({})
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const { user } = useAuth()

  const [searchForm, setSearchForm] = useState({
    originId: '',
    destinationId: '',
    departureDate: ''
  })

  const [bookingForm, setBookingForm] = useState({
    customerFirstName: '',
    customerLastName: '',
    customerEmail: '',
    customerPhoneNumber: '',
    numberOfSeats: 1,
    pickupPointId: '',
    dropPointId: ''
  })

  useEffect(() => {
    fetchDistricts()
    fetchBookings()
    // Set default date to today
    const today = new Date().toISOString().split('T')[0]
    setSearchForm(prev => ({ ...prev, departureDate: today }))
  }, [])

  const fetchDistricts = async () => {
    try {
      const response = await agentAPI.getDistricts()
      setDistricts(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch districts')
    }
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await agentAPI.getBookingsByAgent(user.roleEntityId)
      setBookings(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoutePoints = async (districtId) => {
    try {
      const response = await agentAPI.getRoutePoints(districtId)
      setRoutePoints(prev => ({
        ...prev,
        [districtId]: response.data.data || []
      }))
    } catch (error) {
      console.error('Failed to fetch route points for district', districtId)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchForm.originId || !searchForm.destinationId || !searchForm.departureDate) {
      toast.error('Please fill in all search fields')
      return
    }

    if (searchForm.originId === searchForm.destinationId) {
      toast.error('Origin and destination cannot be the same')
      return
    }

    try {
      setSearching(true)
      // Get agent info first to filter schedules by agency
      const agentResponse = await agentAPI.getProfile(user.roleEntityId)
      const agentData = agentResponse.data.data
      
      const response = await agentAPI.searchSchedulesByAgency({
        originId: searchForm.originId,
        destinationId: searchForm.destinationId,
        departureDate: searchForm.departureDate,
        agencyId: agentData.agency.id
      })
      setSchedules(response.data.data || [])
      
      if (response.data.data.length === 0) {
        toast.info('No schedules found for your search criteria')
      } else {
        // Fetch route points for origin and destination
        await fetchRoutePoints(searchForm.originId)
        await fetchRoutePoints(searchForm.destinationId)
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Failed to search schedules. Please try again.')
      setSchedules([])
    } finally {
      setSearching(false)
    }
  }

  const handleBookTicket = (schedule) => {
    setSelectedSchedule(schedule)
    setBookingForm({
      customerFirstName: '',
      customerLastName: '',
      customerEmail: '',
      customerPhoneNumber: '',
      numberOfSeats: 1,
      pickupPointId: '',
      dropPointId: ''
    })
    setShowBookingForm(true)
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    try {
      const bookingData = {
        agentId: user.roleEntityId,
        scheduleId: selectedSchedule.id,
        pickupPointId: parseInt(bookingForm.pickupPointId),
        dropPointId: parseInt(bookingForm.dropPointId),
        numberOfSeats: parseInt(bookingForm.numberOfSeats),
        customerFirstName: bookingForm.customerFirstName,
        customerLastName: bookingForm.customerLastName,
        customerEmail: bookingForm.customerEmail || null,
        customerPhoneNumber: bookingForm.customerPhoneNumber
      }

      const response = await agentAPI.createBooking(bookingData)
      toast.success('Booking created successfully!')
      setShowBookingForm(false)
      
      // Refresh bookings and schedules
      fetchBookings()
      await handleSearch({ preventDefault: () => {} })
      
      // Show booking details
      const booking = response.data.data
      toast.success(`Booking Reference: ${booking.bookingReference}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking')
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
      a.download = `ticket_${bookings.find(b => b.id === bookingId)?.bookingReference}.pdf`
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

  const originPoints = selectedSchedule ? routePoints[selectedSchedule.agencyRoute.route.origin.id] || [] : []
  const destinationPoints = selectedSchedule ? routePoints[selectedSchedule.agencyRoute.route.destination.id] || [] : []

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
        <p className="mt-2 text-gray-600">
          Create bookings for walk-in customers and manage existing bookings
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Search Available Schedules</h2>
          <button
            onClick={() => setShowBookingForm(true)}
            className="btn-primary"
            disabled={!selectedSchedule}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </button>
        </div>
        
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <select
                value={searchForm.originId}
                onChange={(e) => setSearchForm({ ...searchForm, originId: e.target.value })}
                className="input w-full"
                required
              >
                <option value="">Select origin</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <select
                value={searchForm.destinationId}
                onChange={(e) => setSearchForm({ ...searchForm, destinationId: e.target.value })}
                className="input w-full"
                required
              >
                <option value="">Select destination</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departure Date
              </label>
              <input
                type="date"
                value={searchForm.departureDate}
                onChange={(e) => setSearchForm({ ...searchForm, departureDate: e.target.value })}
                className="input w-full"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={searching}
                className="btn-primary w-full"
              >
                {searching ? (
                  <div className="loading-spinner mr-2"></div>
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Available Schedules */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Available Schedules</h2>
        </div>

        <div className="p-6">
          {schedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Search for schedules to create bookings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div 
                  key={schedule.id} 
                  className={`border rounded-lg p-6 cursor-pointer transition-colors ${
                    selectedSchedule?.id === schedule.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSchedule(schedule)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="text-lg font-semibold text-gray-900">
                          {schedule.agencyRoute.agency.agencyName}
                        </div>
                        <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {schedule.bus.busType}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>
                            {schedule.agencyRoute.route.origin.name} → {schedule.agencyRoute.route.destination.name}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{schedule.departureDate}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{schedule.departureTime} - {schedule.arrivalTime}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{schedule.availableSeats} seats available</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 text-right">
                      <div className="text-2xl font-bold text-primary-600 mb-2">
                        {schedule.agencyRoute.price} RWF
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBookTicket(schedule)
                        }}
                        disabled={schedule.availableSeats === 0}
                        className={`btn-primary ${
                          schedule.availableSeats === 0 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                      >
                        {schedule.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
                        {schedule.availableSeats > 0 && <ArrowRight className="h-4 w-4 ml-2" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create Booking</h3>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Journey Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Route:</strong> {selectedSchedule.agencyRoute.route.origin.name} → {selectedSchedule.agencyRoute.route.destination.name}</p>
                <p><strong>Date:</strong> {selectedSchedule.departureDate}</p>
                <p><strong>Time:</strong> {selectedSchedule.departureTime} - {selectedSchedule.arrivalTime}</p>
                <p><strong>Bus:</strong> {selectedSchedule.bus.plateNumber} ({selectedSchedule.bus.busType})</p>
                <p><strong>Price per seat:</strong> {selectedSchedule.agencyRoute.price} RWF</p>
              </div>
            </div>

            <form onSubmit={handleCreateBooking}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={bookingForm.customerFirstName}
                      onChange={(e) => setBookingForm({ ...bookingForm, customerFirstName: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={bookingForm.customerLastName}
                      onChange={(e) => setBookingForm({ ...bookingForm, customerLastName: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={bookingForm.customerPhoneNumber}
                    onChange={(e) => setBookingForm({ ...bookingForm, customerPhoneNumber: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={bookingForm.customerEmail}
                    onChange={(e) => setBookingForm({ ...bookingForm, customerEmail: e.target.value })}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Seats
                  </label>
                  <select
                    value={bookingForm.numberOfSeats}
                    onChange={(e) => setBookingForm({ ...bookingForm, numberOfSeats: e.target.value })}
                    className="input w-full"
                    required
                  >
                    {[...Array(Math.min(selectedSchedule.availableSeats, 5))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} seat{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Point
                  </label>
                  <select
                    value={bookingForm.pickupPointId}
                    onChange={(e) => setBookingForm({ ...bookingForm, pickupPointId: e.target.value })}
                    className="input w-full"
                    required
                  >
                    <option value="">Select pickup point</option>
                    {originPoints.map((point) => (
                      <option key={point.id} value={point.id}>
                        {point.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Drop Point
                  </label>
                  <select
                    value={bookingForm.dropPointId}
                    onChange={(e) => setBookingForm({ ...bookingForm, dropPointId: e.target.value })}
                    className="input w-full"
                    required
                  >
                    <option value="">Select drop point</option>
                    {destinationPoints.map((point) => (
                      <option key={point.id} value={point.id}>
                        {point.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Amount:</span>
                    <span className="text-xl font-bold text-primary-600">
                      {(selectedSchedule.agencyRoute.price * bookingForm.numberOfSeats).toLocaleString()} RWF
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Create Booking
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentBookingManagement