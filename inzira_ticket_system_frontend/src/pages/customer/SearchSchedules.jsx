import React, { useState, useEffect } from 'react'
import { Search, MapPin, Calendar, Clock, Users, ArrowRight, Download } from 'lucide-react'
import { customerAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const SearchSchedules = () => {
  const [districts, setDistricts] = useState([])
  const [schedules, setSchedules] = useState([])
  const [routePoints, setRoutePoints] = useState({})
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const { user } = useAuth()

  const [searchForm, setSearchForm] = useState({
    originId: '',
    destinationId: '',
    departureDate: ''
  })

  const [bookingForm, setBookingForm] = useState({
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
      // Use customerAPI which has proper access to districts
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
      // Use customerAPI for route points access
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
      // Use customerAPI for schedule search
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
    if (!user) {
      toast.error('Please login to book tickets')
      return
    }
    setSelectedSchedule(schedule)
    setBookingForm({
      numberOfSeats: 1,
      pickupPointId: '',
      dropPointId: ''
    })
    setShowBookingModal(true)
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    try {
      const bookingData = {
        customer: { id: user.roleEntityId },
        schedule: { id: selectedSchedule.id },
        pickupPoint: { id: parseInt(bookingForm.pickupPointId) },
        dropPoint: { id: parseInt(bookingForm.dropPointId) },
        numberOfSeats: parseInt(bookingForm.numberOfSeats)
      }

      const response = await customerAPI.createBooking(bookingData)
      toast.success('Booking created successfully!')
      setShowBookingModal(false)
      
      // Refresh schedules to update available seats
      handleSearch({ preventDefault: () => {} })
      
      // Show booking details
      const booking = response.data.data
      toast.success(`Booking Reference: ${booking.bookingReference}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking')
    }
  }

  const getOriginDistrict = (originId) => {
    return districts.find(d => d.id.toString() === originId)?.name || ''
  }

  const getDestinationDistrict = (destinationId) => {
    return districts.find(d => d.id.toString() === destinationId)?.name || ''
  }

  const originPoints = selectedSchedule ? routePoints[selectedSchedule.agencyRoute.route.origin.id] || [] : []
  const destinationPoints = selectedSchedule ? routePoints[selectedSchedule.agencyRoute.route.destination.id] || [] : []

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 fade-in">
        <div className="text-center py-8">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading districts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search Bus Schedules</h1>
        <p className="mt-2 text-gray-600">
          Find and book bus tickets for your journey across Rwanda
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

      {/* Search Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Available Schedules
            {searchForm.originId && searchForm.destinationId && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                {getOriginDistrict(searchForm.originId)} → {getDestinationDistrict(searchForm.destinationId)}
              </span>
            )}
          </h2>
        </div>

        <div className="p-6">
          {!searchForm.originId || !searchForm.destinationId ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Enter your travel details above to search for available schedules</p>
            </div>
          ) : searching ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-500">Searching for schedules...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No schedules found for your search criteria</p>
              <p className="text-sm mt-2">Try searching for a different date or route</p>
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

                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Bus:</span> {schedule.bus.plateNumber} ({schedule.bus.capacity} seats)
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

      {/* Booking Modal */}
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

            <form onSubmit={handleCreateBooking}>
              <div className="space-y-4">
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

      {/* Popular Routes */}
      <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Routes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { from: 'Kigali', to: 'Butare', price: '3,500 RWF' },
            { from: 'Kigali', to: 'Musanze', price: '2,800 RWF' },
            { from: 'Butare', to: 'Nyanza', price: '1,200 RWF' }
          ].map((route, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    {route.from} → {route.to}
                  </div>
                  <div className="text-sm text-gray-500">Starting from</div>
                </div>
                <div className="text-primary-600 font-semibold">
                  {route.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchSchedules