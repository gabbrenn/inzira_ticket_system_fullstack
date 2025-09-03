import React from 'react'
import BookingReferenceSearch from '../components/BookingReferenceSearch'

const FindBooking = () => {
  return (
    <div className="fade-in">
      <div className="bg-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-white">Find Your Booking</h1>
          <p className="mt-2 text-white/90">Search using your booking reference and contact to retrieve your ticket.</p>
        </div>
      </div>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <BookingReferenceSearch />
      </main>
    </div>
  )
}

export default FindBooking
