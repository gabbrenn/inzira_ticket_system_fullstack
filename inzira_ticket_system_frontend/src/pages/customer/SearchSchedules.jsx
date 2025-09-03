import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, MapPin, Calendar, Clock, Users, ArrowRight } from 'lucide-react'
import { customerAPI, getFileUrl } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useWebSocket } from '../../components/WebSocketProvider'
import PaymentForm from '../../components/PaymentForm'
import PaymentStatus from '../../components/PaymentStatus'
import toast from 'react-hot-toast'

const timeToMinutes = (hhmm) => {
  if (!hhmm) return 0
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

const inRange = (minutes, start, end) => minutes >= start && minutes <= end

const SearchSchedules = () => {
  const { seatUpdates, subscribeTo } = useWebSocket()
  const [searchParams] = useSearchParams()
  const [districts, setDistricts] = useState([])
  const [schedules, setSchedules] = useState([])
  const [routePoints, setRoutePoints] = useState({})
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [currentBooking, setCurrentBooking] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState(null)
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

  const [sortBy, setSortBy] = useState('') // '', 'price', 'early', 'late'
  const [departureFilter, setDepartureFilter] = useState('') // '', 'morning', 'afternoon', 'evening'

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const res = await customerAPI.getDistricts()
        setDistricts(res.data.data || [])
      } catch (e) {
        toast.error('Failed to load districts')
      } finally {
        setLoading(false)
      }
    }
    init()

    // Default date to today
    const today = new Date().toISOString().split('T')[0]
    setSearchForm(prev => ({ ...prev, departureDate: today }))
  }, [])

  useEffect(() => {
    // Prefill from query params if present and auto-search without requiring form state update
    const originId = searchParams.get('originId') || ''
    const destinationId = searchParams.get('destinationId') || ''
    const date = searchParams.get('date') || ''

    if (originId || destinationId || date) {
      // Update UI state for inputs
      setSearchForm(prev => ({
        ...prev,
        originId: originId || prev.originId,
        destinationId: destinationId || prev.destinationId,
        departureDate: date || prev.departureDate,
      }))

      // Run search immediately using params to avoid "Please fill in all search fields" race
      if (originId && destinationId && (date || new Date().toISOString().split('T')[0])) {
        const params = {
          originId,
          destinationId,
          departureDate: date || new Date().toISOString().split('T')[0]
        }
        ;(async () => {
          try {
            setSearching(true)
            const response = await customerAPI.searchSchedules(params)
            const data = response.data.data || []
            if (data.length === 0) {
              toast.info('No schedules found for your search criteria')
              setSchedules([])
            } else {
              data.forEach((s) => subscribeTo(s.id))
              setSchedules(data)
              await fetchRoutePoints(originId)
              await fetchRoutePoints(destinationId)
            }
          } catch (error) {
            console.error('Search error:', error)
            toast.error('Failed to search schedules. Please try again.')
            setSchedules([])
          } finally {
            setSearching(false)
          }
        })()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

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
      const data = response.data.data || []

      if (data.length === 0) {
        toast.info('No schedules found for your search criteria')
        setSchedules([])
      } else {
        // subscribe to seat updates
        data.forEach((s) => subscribeTo(s.id))
        setSchedules(data)
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
    setBookingForm({ numberOfSeats: 1, pickupPointId: '', dropPointId: '' })
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
      const booking = response.data.data

      setCurrentBooking(booking)
      setShowBookingModal(false)
      setShowPaymentModal(true)

      toast.success(`Booking created successfully! Reference: ${booking.bookingReference}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking')
    }
  }

  const getDistrictName = (id) => districts.find(d => d.id.toString() === String(id))?.name || ''

  const handlePaymentSuccess = (paymentResponse) => {
    setPaymentStatus(paymentResponse)
    setShowPaymentModal(false)
    toast.success('Payment completed successfully!')
    handleSearch({ preventDefault: () => {} })
  }

  const handlePaymentCancel = () => {
    setShowPaymentModal(false)
    setCurrentBooking(null)
    toast.info('Payment cancelled. You can try again later.')
  }

  const handlePaymentStatusChange = (status) => {
    setPaymentStatus(status)
    if (status.isSuccessful) {
      toast.success('Payment confirmed! Your ticket is ready.')
    }
  }

  const originPoints = selectedSchedule ? routePoints[selectedSchedule.agencyRoute.route.origin.id] || [] : []
  const destinationPoints = selectedSchedule ? routePoints[selectedSchedule.agencyRoute.route.destination.id] || [] : []

  // Update schedules with real-time seat availability
  const schedulesWithUpdates = schedules.map(schedule => ({
    ...schedule,
    availableSeats: seatUpdates[schedule.id] !== undefined ? seatUpdates[schedule.id] : schedule.availableSeats
  }))

  const filteredAndSorted = useMemo(() => {
    let arr = [...schedulesWithUpdates]

    // departure time filter
    if (departureFilter) {
      arr = arr.filter((s) => {
        const m = timeToMinutes(s.departureTime)
        if (departureFilter === 'morning') return inRange(m, 5 * 60, 12 * 60)
        if (departureFilter === 'afternoon') return inRange(m, 12 * 60 + 30, 17 * 60 + 30)
        if (departureFilter === 'evening') return inRange(m, 18 * 60, 22 * 60)
        return true
      })
    }

    // sorting
    if (sortBy === 'price') {
      arr.sort((a, b) => a.agencyRoute.price - b.agencyRoute.price)
    } else if (sortBy === 'early') {
      arr.sort((a, b) => timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime))
    } else if (sortBy === 'late') {
      arr.sort((a, b) => timeToMinutes(b.departureTime) - timeToMinutes(a.departureTime))
    }

    return arr
  }, [schedulesWithUpdates, sortBy, departureFilter])

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
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search Bus Schedules</h1>
        <p className="mt-2 text-gray-600">Find and book bus tickets for your journey across Rwanda</p>
      </div>

      {/* Search Form - districts only */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-500 p-6 mb-8">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <select
                value={searchForm.originId}
                onChange={(e) => setSearchForm({ ...searchForm, originId: e.target.value })}
                className="input w-full"
                required
              >
                <option value="">Select origin</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>{district.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <select
                value={searchForm.destinationId}
                onChange={(e) => setSearchForm({ ...searchForm, destinationId: e.target.value })}
                className="input w-full"
                required
              >
                <option value="">Select destination</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>{district.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date</label>
              <input
                type="date"
                value={searchForm.departureDate}
                onChange={(e) => setSearchForm({ ...searchForm, departureDate: e.target.value })}
                className="input w-full"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="flex items-end md:col-span-2">
              <button type="submit" disabled={searching} className="btn-primary w-full">
                {searching ? <div className="loading-spinner mr-2"></div> : <Search className="h-4 w-4 mr-2" />}
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Content layout: 30% filters (left), 70% schedules (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Filters */}
        <aside className="lg:col-span-3 order-2 lg:order-1">
          {/* Sort By */}
          <div className="bg-white rounded-lg shadow-sm border border-blue-500 p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Sort By</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="sort" value="price" checked={sortBy==='price'} onChange={() => setSortBy('price')} />
                <span>Price (lowest to highest)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="sort" value="early" checked={sortBy==='early'} onChange={() => setSortBy('early')} />
                <span>Early departure</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="sort" value="late" checked={sortBy==='late'} onChange={() => setSortBy('late')} />
                <span>Late departure</span>
              </label>
              <button onClick={() => setSortBy('')} className="text-xs text-blue-500 hover:text-blue-700 mt-2">Clear sort</button>
            </div>
          </div>

          {/* Departure Time */}
          <div className="bg-white rounded-lg shadow-sm border border-blue-500 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Departure Time</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="dep" value="morning" checked={departureFilter==='morning'} onChange={() => setDepartureFilter('morning')} />
                <span>5:00 – 12:00 (Morning)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="dep" value="afternoon" checked={departureFilter==='afternoon'} onChange={() => setDepartureFilter('afternoon')} />
                <span>12:30 – 17:30 (Afternoon)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="dep" value="evening" checked={departureFilter==='evening'} onChange={() => setDepartureFilter('evening')} />
                <span>18:00 – 22:00 (Evening)</span>
              </label>
              <button onClick={() => setDepartureFilter('')} className="text-xs text-blue-500 hover:text-blue-700 mt-2">Clear filter</button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section className="lg:col-span-7 order-1 lg:order-2">
          <div className="bg-white rounded-lg shadow-sm border border-blue-500">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Schedules ({filteredAndSorted.length})
                {searchForm.originId && searchForm.destinationId && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    {getDistrictName(searchForm.originId)} → {getDistrictName(searchForm.destinationId)}
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
              ) : filteredAndSorted.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No schedules found for your search criteria</p>
                  <p className="text-sm mt-2">Try searching for a different date or route</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSorted.map((schedule) => (
                    <div 
                      key={schedule.id} 
                      className="bg-white border border-blue-500 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Left Section - Trip Info */}
                        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-gray-100">
                          {/* Agency Logo + Name */}
                          <div className="flex items-center mb-4">
                            {schedule.agencyRoute.agency.logoPath ? (
                              <img 
                                src={getFileUrl(schedule.agencyRoute.agency.logoPath)} 
                                alt={schedule.agencyRoute.agency.agencyName} 
                                className="w-10 h-10 rounded-md object-cover border border-gray-200 mr-3" 
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-700 mr-3">
                                {schedule.agencyRoute.agency.agencyName?.slice(0,2).toUpperCase()}
                              </div>
                            )}
                            <h3 className="text-lg font-semibold text-gray-900">
                              {schedule.agencyRoute.agency.agencyName}
                            </h3>
                            <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                              {schedule.bus.busType}
                            </span>
                          </div>

                          {/* Route Info */}
                          <div className="mb-4">
                            <div className="flex items-center text-gray-700 text-sm">
                              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                              <span>
                                <span className="font-semibold">{schedule.agencyRoute.route.origin.name}</span> → 
                                <span className="font-bold text-gray-900"> {schedule.agencyRoute.route.destination.name}</span>
                              </span>
                            </div>
                          </div>

                          {/* Schedule Info */}
                          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                              {schedule.departureDate}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              {schedule.departureTime}
                              {/* - {schedule.arrivalTime} */}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-gray-500" />
                              {schedule.availableSeats} seats left
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-700">Bus:</span>&nbsp;
                              {schedule.bus.plateNumber}
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Price & Action */}
                        <div className="flex flex-col justify-between p-6 text-center md:text-right bg-gray-50 w-full md:w-56">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{schedule.agencyRoute.price} RWF</div>
                            <div className="text-xs text-gray-500 mt-1">per ticket</div>
                          </div>
                          <button
                            onClick={() => handleBookTicket(schedule)}
                            disabled={schedule.availableSeats === 0}
                            className={`mt-4 flex items-center justify-center w-full md:w-auto px-5 py-2 rounded-lg font-medium transition-colors
                              ${schedule.availableSeats === 0 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'}
                            `}
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
        </section>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Book Your Ticket</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Seats</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Point</label>
                  <select
                    value={bookingForm.pickupPointId}
                    onChange={(e) => setBookingForm({ ...bookingForm, pickupPointId: e.target.value })}
                    className="input w-full"
                    required
                  >
                    <option value="">Select pickup point</option>
                    {originPoints.map((point) => (
                      <option key={point.id} value={point.id}>{point.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Drop Point</label>
                  <select
                    value={bookingForm.dropPointId}
                    onChange={(e) => setBookingForm({ ...bookingForm, dropPointId: e.target.value })}
                    className="input w-full"
                    required
                  >
                    <option value="">Select drop point</option>
                    {destinationPoints.map((point) => (
                      <option key={point.id} value={point.id}>{point.name}</option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Amount:</span>
                    <span className="text-xl font-bold text-primary-600">{(selectedSchedule.agencyRoute.price * bookingForm.numberOfSeats).toLocaleString()} RWF</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">Confirm Booking</button>
                <button type="button" onClick={() => setShowBookingModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && currentBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Complete Your Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <PaymentForm booking={currentBooking} onPaymentSuccess={handlePaymentSuccess} onPaymentCancel={handlePaymentCancel} allowCash={false} />
              </div>
              <div>
                <PaymentStatus transactionReference={paymentStatus?.transactionReference} onStatusChange={handlePaymentStatusChange} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popular Routes (optional retained) */}
      <div className="mt-12 bg-white rounded-lg shadow-sm border border-blue-500 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Routes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { from: 'Kigali', to: 'Butare', price: '3,500 RWF' },
            { from: 'Kigali', to: 'Musanze', price: '2,800 RWF' },
            { from: 'Butare', to: 'Nyanza', price: '1,200 RWF' }
          ].map((route, index) => (
            <div key={index} className="p-4 border border-blue-500 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{route.from} → {route.to}</div>
                  <div className="text-sm text-gray-500">Starting from</div>
                </div>
                <div className="text-primary-600 font-semibold">{route.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchSchedules
