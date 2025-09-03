import React, { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Bus, Users, MapPin, Calendar, ArrowRight, Shield, Clock, CreditCard, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { customerAPI } from '../services/api'

const Home = () => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [districts, setDistricts] = useState([])
  const [searchForm, setSearchForm] = useState({
    originId: '',
    destinationId: '',
    departureDate: ''
  })

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await customerAPI.getDistricts()
        setDistricts(response.data.data || [])
      } catch (e) {
        // silent fail on homepage
      }
    }
    fetchDistricts()
    const today = new Date().toISOString().split('T')[0]
    setSearchForm(prev => ({ ...prev, departureDate: today }))
  }, [])

  const handleHeroSearch = (e) => {
    e.preventDefault()
    const { originId, destinationId, departureDate } = searchForm
    if (!originId || !destinationId || !departureDate) return
    const query = `?originId=${encodeURIComponent(originId)}&destinationId=${encodeURIComponent(destinationId)}&date=${encodeURIComponent(departureDate)}`
    if (isAuthenticated() && user?.role === 'CUSTOMER') {
      navigate(`/customer/search${query}`)
    } else {
      navigate(`/guest-booking${query}`)
    }
  }

  // Redirect logged-in users to their appropriate dashboards
  if (isAuthenticated()) {
    switch (user?.role) {
      case 'ADMIN':
        return <Navigate to="/admin" replace />
      case 'AGENCY':
        return <Navigate to="/agency" replace />
      case 'BRANCH_MANAGER':
        return <Navigate to="/branch-manager" replace />
      case 'AGENT':
        return <Navigate to="/agent" replace />
      case 'DRIVER':
        return <Navigate to="/driver" replace />
      case 'CUSTOMER':
        return <Navigate to="/customer" replace />
      default:
        break
    }
  }

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
      {/* Hero Section with Search */}
      <div className="bg-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">Inzira Ticket System</h1>
            <p className="text-lg md:text-xl mb-8 text-white">Modern bus ticket booking across Rwanda</p>
          </div>
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleHeroSearch} className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <select
                    value={searchForm.originId}
                    onChange={(e) => setSearchForm({ ...searchForm, originId: e.target.value })}
                    className="input w-full"
                    required
                  >
                    <option value="">Select district</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
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
                    <option value="">Select district</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
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
                  <button type="submit" className="btn-primary w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </button>
                </div>
              </div>
            </form>
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

          </div>
  )
}

export default Home