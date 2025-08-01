import React from 'react'
import { Link } from 'react-router-dom'
import { Bus, Users, MapPin, Calendar, ArrowRight, Shield, Clock, CreditCard } from 'lucide-react'
import BookingReferenceSearch from '../components/BookingReferenceSearch';

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Safe and secure ticket booking with real-time seat availability'
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Get instant updates on schedules, delays, and booking confirmations'
    },
    {
      icon: CreditCard,
      title: 'Easy Payments',
      description: 'Multiple payment options for your convenience'
    },
    {
      icon: MapPin,
      title: 'Route Management',
      description: 'Comprehensive route and destination management system'
    }
  ]

  const userRoles = [
    {
      title: 'Admin Panel',
      description: 'Manage districts, routes, agencies, and system-wide operations',
      link: '/admin',
      icon: Shield,
      color: 'bg-red-500'
    },
    {
      title: 'Agency Panel',
      description: 'Manage buses, drivers, schedules, and agency operations',
      link: '/agency',
      icon: Bus,
      color: 'bg-blue-500'
    },
    {
      title: 'Customer Panel',
      description: 'Search schedules, book tickets, and manage your bookings',
      link: '/customer',
      icon: Users,
      color: 'bg-green-500'
    }
  ]

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Inzira Ticket System
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Modern bus ticket management system for Rwanda
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/guest-booking"
                className="btn-primary text-lg px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Book a Ticket
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/customer/search"
                className="btn-outline text-lg px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors text-white border-white hover:text-gray-900"
              >
                Book with Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Inzira?
            </h2>
            <p className="text-lg text-gray-600">
              Experience the future of bus ticket booking in Rwanda
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* User Roles Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Access Your Dashboard
            </h2>
            <p className="text-lg text-gray-600">
              Choose your role to access the appropriate management panel
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {userRoles.map((role, index) => {
              const Icon = role.icon
              return (
                <Link
                  key={index}
                  to={role.link}
                  className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-primary-300"
                >
                  <div className="flex items-center mb-4">
                    <div className={`inline-flex items-center justify-center w-10 h-10 ${role.color} rounded-lg mr-3`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {role.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {role.description}
                  </p>
                  <div className="flex items-center text-primary-600 font-medium">
                    Access Panel
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-primary-200">Bus Routes</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">100+</div>
              <div className="text-primary-200">Daily Schedules</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">1000+</div>
              <div className="text-primary-200">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-primary-200">Customer Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Reference Search Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Find Your Booking
            </h2>
            <p className="text-lg text-gray-600">
              Lost your ticket? Search by booking reference to download it again
            </p>
          </div>
          
          <BookingReferenceSearch />
        </div>
      </div>
    </div>
  )
}

export default Home