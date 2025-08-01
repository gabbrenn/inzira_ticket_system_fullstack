import React, { useState } from 'react'
import { Search, Phone, Mail, Download, QrCode } from 'lucide-react'
import { customerAPI } from '../services/api'
import toast from 'react-hot-toast'

const BookingReferenceSearch = () => {
  const [searchForm, setSearchForm] = useState({
    bookingReference: '',
    verificationMethod: 'phone',
    phoneNumber: '',
    email: ''
  })
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!searchForm.bookingReference.trim()) {
      toast.error('Please enter a booking reference')
      return
    }

    const verificationValue = searchForm.verificationMethod === 'phone' 
      ? searchForm.phoneNumber 
      : searchForm.email

    if (!verificationValue.trim()) {
      toast.error(`Please enter your ${searchForm.verificationMethod === 'phone' ? 'phone number' : 'email'}`)
      return
    }

    try {
      setLoading(true)
      const response = await customerAPI.getBookingByReference(searchForm.bookingReference)
      const foundBooking = response.data.data

      // Verify the booking belongs to the person searching
      const customerMatch = searchForm.verificationMethod === 'phone'
        ? foundBooking.customer.phoneNumber === searchForm.phoneNumber
        : foundBooking.customer.email === searchForm.email

      if (!customerMatch) {
        toast.error('Booking reference does not match the provided contact information')
        return
      }

      setBooking(foundBooking)
      toast.success('Booking found successfully!')
    } catch (error) {
      toast.error('Booking not found or verification failed')
      setBooking(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTicket = async () => {
    if (!booking) return
    
    try {
      const response = await fetch(`http://localhost:8080/api/tickets/download/${booking.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
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
      a.download = `ticket_${booking.bookingReference}.pdf`
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center mb-6">
          <Search className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Find Your Booking</h2>
          <p className="text-gray-600 mt-2">
            Enter your booking reference and contact information to retrieve your ticket
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking Reference
            </label>
            <input
              type="text"
              value={searchForm.bookingReference}
              onChange={(e) => setSearchForm({ ...searchForm, bookingReference: e.target.value.toUpperCase() })}
              className="input w-full"
              placeholder="Enter booking reference (e.g., BK20241201123456ABCD)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="phone"
                  checked={searchForm.verificationMethod === 'phone'}
                  onChange={(e) => setSearchForm({ ...searchForm, verificationMethod: e.target.value })}
                  className="mr-2"
                />
                <Phone className="h-4 w-4 mr-1" />
                Phone Number
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="email"
                  checked={searchForm.verificationMethod === 'email'}
                  onChange={(e) => setSearchForm({ ...searchForm, verificationMethod: e.target.value })}
                  className="mr-2"
                />
                <Mail className="h-4 w-4 mr-1" />
                Email Address
              </label>
            </div>
          </div>

          {searchForm.verificationMethod === 'phone' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={searchForm.phoneNumber}
                onChange={(e) => setSearchForm({ ...searchForm, phoneNumber: e.target.value })}
                className="input w-full"
                placeholder="Enter your phone number"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={searchForm.email}
                onChange={(e) => setSearchForm({ ...searchForm, email: e.target.value })}
                className="input w-full"
                placeholder="Enter your email address"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <div className="loading-spinner mr-2"></div>
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Find Booking
          </button>
        </form>

        {/* Booking Details */}
        {booking && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Booking Found: {booking.bookingReference}
                </h3>
                <span className={getStatusBadge(booking.status)}>
                  {booking.status}
                </span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Journey Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Route:</strong> {booking.schedule.agencyRoute.route.origin.name} → {booking.schedule.agencyRoute.route.destination.name}</p>
                  <p><strong>Date:</strong> {booking.schedule.departureDate}</p>
                  <p><strong>Time:</strong> {booking.schedule.departureTime} - {booking.schedule.arrivalTime}</p>
                  <p><strong>Agency:</strong> {booking.schedule.agencyRoute.agency.agencyName}</p>
                  <p><strong>Bus:</strong> {booking.schedule.bus.plateNumber} ({booking.schedule.bus.busType})</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Pickup & Drop</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Pickup:</strong> {booking.pickupPoint.name}</p>
                  <p><strong>Drop:</strong> {booking.dropPoint.name}</p>
                  <p><strong>Booked:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && (
              <div className="flex space-x-3">
                <button
                  onClick={handleDownloadTicket}
                  className="btn-primary flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Ticket
                </button>
                <button
                  onClick={() => setShowQRModal(true)}
                  className="btn-outline flex-1"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Show QR Code
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && booking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ticket QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Booking Reference:</p>
                <p className="font-semibold text-gray-900">{booking.bookingReference}</p>
              </div>

              {booking.qrCode && (
                <div className="mb-4">
                  <img
                    src={`data:image/png;base64,${booking.qrCode}`}
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
    </div>
  )
}

export default BookingReferenceSearch