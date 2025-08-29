import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { customerAPI } from '../../services/api'
import PaymentForm from '../../components/PaymentForm'
import toast from 'react-hot-toast'

const Pay = () => {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!bookingId) { setLoading(false); return }
      try {
        const res = await customerAPI.getBooking(bookingId)
        setBooking(res.data.data)
      } catch (e) {
        toast.error('Failed to load booking')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [bookingId])

  if (!bookingId) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-700">No booking specified.</p>
          <div className="mt-4"><Link to="/customer/bookings" className="btn-primary px-4 py-2 rounded">My Bookings</Link></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Pay for Booking</h1>
      {loading ? (
        <div className="bg-white rounded-lg shadow p-6">Loading...</div>
      ) : booking ? (
        <PaymentForm booking={booking} />
      ) : (
        <div className="bg-white rounded-lg shadow p-6">Booking not found.</div>
      )}
    </div>
  )
}

export default Pay
