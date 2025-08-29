import React, { useState, useEffect } from 'react'
import { Search, Calendar, MapPin, Clock, CreditCard, Download, X, CheckCircle, QrCode } from 'lucide-react'
import { customerAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import Pagination from '../../components/Pagination'

const BookingManagement = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.roleEntityId) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await customerAPI.getBookingsByCustomer(user.roleEntityId)
      // Sort bookings by creation date (newest first)
      const sortedBookings = (response.data.data || []).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
      setBookings(sortedBookings)
    } catch (error) {
      toast.error('Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await customerAPI.cancelBooking(bookingId)
        toast.success('Booking cancelled successfully')
        fetchBookings()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel booking')
      }
    }
  }

  const handleConfirmBooking = async (bookingId) => {
    try {
      await customerAPI.confirmBooking(bookingId)
      toast.success('Booking confirmed successfully')
      fetchBookings()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm booking')
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

  const showQRCode = (booking) => {
    setSelectedBooking(booking)
    setShowQRModal(true)
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

  const getPaymentStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'PAID':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'REFUNDED':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.schedule.agencyRoute.route.origin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.schedule.agencyRoute.route.destination.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter
    
    return matchesSearch && matchesStatus
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort newest first

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="mt-2 text-gray-600">
          View and manage your bus ticket bookings
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Bookings
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by reference or route..."
                className="input w-full pl-10"
              />
            </div>
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
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchBookings}
              className="btn-secondary w-full"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Booking History ({filteredBookings.length})
          </h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No bookings found</p>
              {searchTerm || statusFilter !== 'ALL' ? (
                <p className="text-sm mt-2">Try adjusting your search or filter criteria</p>
              ) : (
                <p className="text-sm mt-2">Book your first ticket to see it here</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {paginatedBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {booking.bookingReference}
                        </h3>
                        <span className={getStatusBadge(booking.status)}>
                          {booking.status}
                        </span>
                        <span className={`ml-2 ${getPaymentStatusBadge(booking.paymentStatus)}`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Booked on {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary-600">
                        {booking.totalAmount} RWF
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.numberOfSeats} seat(s)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <div>
                        <div className="font-medium">
                          {booking.schedule.agencyRoute.route.origin.name} → {booking.schedule.agencyRoute.route.destination.name}
                        </div>
                        <div className="text-xs">
                          {booking.pickupPoint.name} → {booking.dropPoint.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{booking.schedule.departureDate}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{booking.schedule.departureTime} - {booking.schedule.arrivalTime}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span>{booking.schedule.bus.plateNumber} ({booking.schedule.bus.busType})</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Agency:</span> {booking.schedule.agencyRoute.agency.agencyName}
                    </div>
                    <div className="flex space-x-2">
                      {booking.status === 'PENDING' && (
                        <>
                          {booking.paymentStatus !== 'PAID' ? (
                            <a
                              href={`/customer/pay?bookingId=${booking.id}`}
                              className="btn-primary text-sm py-2 px-3"
                            >
                              <CreditCard className="h-3 w-3 mr-1 inline" />
                              Pay Now
                            </a>
                          ) : (
                            <button
                              onClick={() => handleConfirmBooking(booking.id)}
                              className="btn-secondary text-sm py-2 px-3"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirm
                            </button>
                          )}
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm"
                          >
                            <X className="h-3 w-3 mr-1 inline" />
                            Cancel
                          </button>
                        </>
                      )}
                      {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && (
                        <>
                          <button
                            onClick={() => showQRCode(booking)}
                            className="btn-outline text-sm py-2 px-3"
                          >
                            <QrCode className="h-3 w-3 mr-1" />
                            QR Code
                          </button>
                          <button
                            onClick={() => handleDownloadTicket(booking.id)}
                            className="btn-outline text-sm py-2 px-3"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredBookings.length}
        />
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ticket QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Booking Reference:</p>
                <p className="font-semibold text-gray-900">{selectedBooking.bookingReference}</p>
              </div>

              {selectedBooking.qrCode && (
                <div className="mb-4">
                  <img
                    src={`data:image/png;base64,${selectedBooking.qrCode}`}
                    alt="QR Code"
                    className="mx-auto border border-gray-200 rounded-lg"
                  />
                </div>
              )}

              <div className="text-sm text-gray-600 mb-4">
                <p>Show this QR code to the driver for verification</p>
              </div>

              <button
                onClick={() => setShowQRModal(false)}
                className="btn-primary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Summary */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {bookings.filter(b => b.status === 'CONFIRMED').length}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {bookings.filter(b => b.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {bookings.filter(b => b.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Spent (RWF)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingManagement