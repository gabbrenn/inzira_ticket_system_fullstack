import React from 'react'
import { Link } from 'react-router-dom'
import { Search, Calendar, CreditCard, User, MapPin, Clock } from 'lucide-react'

const CustomerDashboard = () => {
  const customerModules = [
    {
      title: 'Search Schedules',
      description: 'Find and book bus tickets for your journey',
      link: '/customer/search',
      icon: Search,
      color: 'bg-blue-500',
      actions: ['Search Routes', 'Compare Prices', 'Check Availability']
    },
    {
      title: 'My Bookings',
      description: 'View and manage your ticket bookings',
      link: '/customer/bookings',
      icon: Calendar,
      color: 'bg-green-500',
      actions: ['View Tickets', 'Cancel Bookings', 'Download Receipts']
    }
  ]

  const quickActions = [
    { title: 'Book a Ticket', action: 'book-ticket', icon: Search },
    { title: 'Check Booking', action: 'check-booking', icon: Calendar },
    { title: 'Payment History', action: 'payment-history', icon: CreditCard },
  ]

  const recentBookings = [
    {
      id: 1,
      reference: 'BK20241201001',
      route: 'Kigali → Butare',
      date: '2024-12-15',
      time: '08:00',
      status: 'Confirmed',
      amount: 3500
    },
    {
      id: 2,
      reference: 'BK20241201002',
      route: 'Butare → Kigali',
      date: '2024-12-20',
      time: '14:30',
      status: 'Pending',
      amount: 3500
    }
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Book tickets and manage your travel with ease
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <Icon className="h-5 w-5 text-primary-600 mr-3" />
                  <span className="font-medium text-gray-900">{action.title}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Modules */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customerModules.map((module, index) => {
              const Icon = module.icon
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`inline-flex items-center justify-center w-10 h-10 ${module.color} rounded-lg mr-3`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {module.title}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {module.description}
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      {module.actions.map((action, actionIndex) => (
                        <div key={actionIndex} className="flex items-center text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                          {action}
                        </div>
                      ))}
                    </div>
                    
                    <Link
                      to={module.link}
                      className="btn-primary w-full text-center"
                    >
                      {module.title}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Bookings Sidebar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          </div>
          <div className="p-6">
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent bookings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.reference}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'Confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex items-center mb-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {booking.route}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {booking.date} at {booking.time}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-primary-600">
                      {booking.amount} RWF
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Travel Stats */}
      <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Travel Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
            <div className="text-sm text-gray-600">Total Trips</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">8</div>
            <div className="text-sm text-gray-600">This Year</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">42,000</div>
            <div className="text-sm text-gray-600">Total Spent (RWF)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">5</div>
            <div className="text-sm text-gray-600">Favorite Routes</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard