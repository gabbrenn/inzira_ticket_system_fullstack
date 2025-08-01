import React, { useState, useEffect } from 'react'
import { Search, MapPin, Calendar, Clock, Users, ArrowRight, Download, User, Phone, Mail } from 'lucide-react'
import { customerAPI } from '../../services/api'
import toast from 'react-hot-toast'

const GuestBooking = () => {
  const [districts, setDistricts] = useState([])
  const [schedules, setSchedules] = useState([])
  const [routePoints, setRoutePoints] = useState({})
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [completedBooking, setCompletedBooking] = useState(null)

  const [searchForm, setSearchForm] = useState({
    originId: '',
    destinationId: '',
    departureDate: ''
  })

  const [bookingForm, setBookingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    numberOfSeats: 1,
    pickupPointId: '',
    dropPointId: ''
  })

  useEffect(() => {
    fetchDistricts()
    // Set default date to today
    const today = new Date().toISOString().split('T')[0]
    setSearchForm(prev => ({ ...prev, departureDate: today }))
  }, [])

  const fetchDistricts = async () => {
    try {
      setLoading(true)
      const response = await customerAPI.getDistricts()
      setDistricts(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch districts:', error)
      toast.error('Failed to fetch districts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoutePoints = async (districtId) => {
    try {
      const response = await customerAPI.getRoutePoints(districtId)
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
      const response = await customerAPI.searchSchedules({
        originId: searchForm.originId,
        destinationId: searchForm.destinationId,
        departureDate: searchForm.departureDate
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
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      numberOfSeats: 1,
      pickupPointId: '',
      dropPointId: ''
    })
    setShowBookingModal(true)
  }

  const handleCreateGuestBooking = async (e) => {
    e.preventDefault()
    try {
      // Create guest booking through agent booking endpoint
      const bookingData = {
        agentId: null, // Guest booking
        scheduleId: selectedSchedule.id,
        pickupPointId: parseInt(bookingForm.pickupPointId),
        dropPointId: parseInt(bookingForm.dropPointId),
        numberOfSeats: parseInt(bookingForm.numberOfSeats),
        customerFirstName: bookingForm.firstName,
        customerLastName: bookingForm.lastName,
        customerEmail: bookingForm.email || null,
        customerPhoneNumber: bookingForm.phoneNumber,
        isGuestBooking: true
      }

      const response = await customerAPI.createGuestBooking(bookingData)
      const booking = response.data.data
      
      setCompletedBooking(booking)
      setBookingComplete(true)
      setShowBookingModal(false)
      
      toast.success('Booking created successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking')
    }
  }

  const handleDownloadTicket = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/tickets/download/${bookingId}`)
      
      if (!response.ok) {
        throw new Error('Failed to download ticket')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `ticket_${completedBooking?.bookingReference}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Ticket downloaded successfully')
    } catch (error) {
      toast.error('Failed to download ticket')
    }
  }

  const originPoints = selectedSchedule ? routePoints[selectedSchedule.agencyRoute.route.origin.id] || [] : []
  const destinationPoints = selectedSchedule ? routePoints[selectedSchedule.agencyRoute.route.destination.id] || [] : []

  if (bookingComplete && completedBooking) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 fade-in">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Successful!</h2>
              <p className="text-gray-600">Your ticket has been booked successfully</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Details</h3>
              <div className="text-left space-y-2 text-sm">
                <p><strong>Booking Reference:</strong> {completedBooking.bookingReference}</p>
                <p><strong>Passenger:</strong> {completedBooking.customer.firstName} {completedBooking.customer.lastName}</p>
                <p><strong>Route:</strong> {completedBooking.schedule.agencyRoute.route.origin.name} → {completedBooking.schedule.agencyRoute.route.destination.name}</p>
                <p><strong>Date:</strong> {completedBooking.schedule.departureDate}</p>
                <p><strong>Time:</strong> {completedBooking.schedule.departureTime} - {completedBooking.schedule.arrivalTime}</p>
                <p><strong>Seats:</strong> {completedBooking.numberOfSeats}</p>
                <p><strong>Total:</strong> {completedBooking.totalAmount} RWF</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleDownloadTicket(completedBooking.id)}
                className="btn-primary w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Ticket
              </button>
              
              <button
                onClick={() => {
                  setBookingComplete(false)
                  setCompletedBooking(null)
                }}
                className="btn-outline w-full"
              >
                Book Another Ticket
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> Save your booking reference <strong>{completedBooking.bookingReference}</strong> 
                and download your ticket. You can use the booking reference to find your ticket later.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Book Without Account</h1>
        <p className="mt-2 text-gray-600">
          Book your bus ticket quickly without creating an account
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Available Schedules</h2>
        </div>

        <div className="p-6">
          {schedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Search for schedules to book your ticket</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
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
                        onClick={() => handleBookTicket(schedule)}
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

      {/* Guest Booking Modal */}
      {showBookingModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Book Your Ticket</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Journey Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Agency:</strong> {selectedSchedule.agencyRoute.agency.agencyName}</p>
                <p><strong>Route:</strong> {selectedSchedule.agencyRoute.route.origin.name} → {selectedSchedule.agencyRoute.route.destination.name}</p>
                <p><strong>Date:</strong> {selectedSchedule.departureDate}</p>
                <p><strong>Time:</strong> {selectedSchedule.departureTime} - {selectedSchedule.arrivalTime}</p>
                <p><strong>Bus:</strong> {selectedSchedule.bus.plateNumber} ({selectedSchedule.bus.busType})</p>
                <p><strong>Price per seat:</strong> {selectedSchedule.agencyRoute.price} RWF</p>
              </div>
            </div>

            <form onSubmit={handleCreateGuestBooking}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={bookingForm.firstName}
                      onChange={(e) => setBookingForm({ ...bookingForm, firstName: e.target.value })}
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
                      value={bookingForm.lastName}
                      onChange={(e) => setBookingForm({ ...bookingForm, lastName: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={bookingForm.phoneNumber}
                    onChange={(e) => setBookingForm({ ...bookingForm, phoneNumber: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                    className="input w-full"
                    placeholder="For booking confirmations"
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
                  Confirm Booking
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
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

export default GuestBooking