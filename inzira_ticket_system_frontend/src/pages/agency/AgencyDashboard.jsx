import React from 'react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bus, Users, Route, Calendar, Plus, BarChart3, Building2, UserCheck, User, Crown, TrendingUp, DollarSign } from 'lucide-react'
import { agencyAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import DashboardCard from '../../components/DashboardCard'
import toast from 'react-hot-toast'

const AgencyDashboard = () => {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.roleEntityId) {
      fetchMetrics()
    }
  }, [user])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await agencyAPI.getMetrics(user.roleEntityId)
      setMetrics(response.data.data)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
      // Don't show error toast as it's not critical
    } finally {
      setLoading(false)
    }
  }

  const agencyModules = [
    {
      title: 'Agency Profile',
      description: 'Update your agency information and settings',
      link: '/agency/profile',
      icon: User,
      color: 'bg-indigo-500',
      actions: ['Update Profile', 'Change Logo', 'Contact Info']
    },
    {
      title: 'Branch Offices',
      description: 'Manage your branch offices and locations',
      link: '/agency/branch-offices',
      icon: Building2,
      color: 'bg-teal-500',
      actions: ['Add Branches', 'Manage Locations', 'Office Status']
    },
    {
      title: 'Agent Management',
      description: 'Manage agents working in your offices',
      link: '/agency/agents',
      icon: UserCheck,
      color: 'bg-pink-500',
      actions: ['Add Agents', 'Assign Offices', 'Reset Passwords']
    },
    {
      title: 'Branch Managers',
      description: 'Assign managers to oversee branch operations',
      link: '/agency/branch-managers',
      icon: Crown,
      color: 'bg-indigo-500',
      actions: ['Assign Managers', 'Manage Access', 'Reset Passwords']
    },
    {
      title: 'Bus Management',
      description: 'Manage your fleet of buses and their status',
      link: '/agency/buses',
      icon: Bus,
      color: 'bg-blue-500',
      actions: ['Add Buses', 'Update Status', 'Maintenance Records']
    },
    {
      title: 'Driver Management',
      description: 'Manage drivers, licenses, and assignments',
      link: '/agency/drivers',
      icon: Users,
      color: 'bg-green-500',
      actions: ['Register Drivers', 'Reset Passwords', 'Driver Status']
    },
    {
      title: 'Route Management',
      description: 'Manage agency routes and pricing',
      link: '/agency/routes',
      icon: Route,
      color: 'bg-purple-500',
      actions: ['Create Routes', 'Set Prices', 'Pickup Points']
    },
    {
      title: 'Schedule Management',
      description: 'Create and manage bus schedules',
      link: '/agency/schedules',
      icon: Calendar,
      color: 'bg-orange-500',
      actions: ['Create Schedules', 'Assign Drivers', 'Manage Bookings']
    },
    {
      title: 'Booking History',
      description: 'View and manage all customer bookings',
      link: '/agency/booking-history',
      icon: BarChart3,
      color: 'bg-red-500',
      actions: ['View Bookings', 'Track Revenue', 'Customer Reports']
    }
  ]

  const quickActions = [
    { title: 'Add New Bus', action: 'add-bus', icon: Bus, link: '/agency/buses' },
    { title: 'Register Driver', action: 'add-driver', icon: Users, link: '/agency/drivers' },
    { title: 'Create Schedule', action: 'add-schedule', icon: Calendar, link: '/agency/schedules' },
    { title: 'View Bookings', action: 'view-bookings', icon: BarChart3, link: '/agency/booking-history' },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agency Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome {user?.firstName}! Manage your bus agency operations from this central hub
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={index}
                to={action.link}
                className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <Icon className="h-5 w-5 text-primary-600 mr-3" />
                  <span className="font-medium text-gray-900">{action.title}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {agencyModules.map((module, index) => {
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
                  Manage {module.title.split(' ')[0]}s
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Agency Overview */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Agency Overview</h2>
          {!loading && (
            <button
              onClick={fetchMetrics}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              Refresh
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="loading-spinner mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <DashboardCard
              title="Total Buses"
              value={metrics?.totalBuses || 0}
              icon={Bus}
              color="text-blue-600"
              bgColor="bg-blue-50"
              subtitle={`${metrics?.activeBuses || 0} active`}
            />
            <DashboardCard
              title="Active Drivers"
              value={metrics?.activeDrivers || 0}
              icon={Users}
              color="text-green-600"
              bgColor="bg-green-50"
              subtitle={`${metrics?.totalDrivers || 0} total`}
            />
            <DashboardCard
              title="Branch Offices"
              value={metrics?.totalBranchOffices || 0}
              icon={Building2}
              color="text-purple-600"
              bgColor="bg-purple-50"
              subtitle={`${metrics?.activeBranchOffices || 0} active`}
            />
            <DashboardCard
              title="Active Agents"
              value={metrics?.activeAgents || 0}
              icon={UserCheck}
              color="text-orange-600"
              bgColor="bg-orange-50"
              subtitle={`${metrics?.totalAgents || 0} total`}
            />
            <DashboardCard
              title="Total Bookings"
              value={metrics?.totalBookings || 0}
              icon={Calendar}
              color="text-red-600"
              bgColor="bg-red-50"
              subtitle={`${metrics?.confirmedBookings || 0} confirmed`}
            />
            <DashboardCard
              title="Total Revenue"
              value={metrics?.totalRevenue ? `${parseFloat(metrics.totalRevenue).toLocaleString()} RWF` : '0 RWF'}
              icon={DollarSign}
              color="text-teal-600"
              bgColor="bg-teal-50"
              subtitle={`${metrics?.monthlyRevenue ? parseFloat(metrics.monthlyRevenue).toLocaleString() : '0'} this month`}
            />
          </div>
        )}
      </div>
      
      {/* Additional Metrics */}
      {metrics && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Today's Schedules"
            value={metrics.todaySchedules || 0}
            icon={Calendar}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <DashboardCard
            title="Confirmed Bookings"
            value={metrics.confirmedBookings || 0}
            icon={TrendingUp}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <DashboardCard
            title="Unique Customers"
            value={metrics.uniqueCustomers || 0}
            icon={Users}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
        </div>
      )}
    </div>
  )
}

export default AgencyDashboard