import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Calendar, BarChart3, Building2, Plus, UserCheck, ClipboardList } from 'lucide-react'
import { branchManagerAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const BranchManagerDashboard = () => {
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
      const response = await branchManagerAPI.getMetrics(user.roleEntityId)
      setMetrics(response.data.data)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
      // Don't show error toast as it's not critical
    } finally {
      setLoading(false)
    }
  }

  const branchManagerModules = [
    {
      title: 'Agent Management',
      description: 'Create and manage agents in your branch office',
      link: '/branch-manager/agents',
      icon: Users,
      color: 'bg-blue-500',
      actions: ['Create Agents', 'Manage Status', 'Reset Passwords']
    },
    {
      title: 'Schedule Management',
      description: 'Create and manage bus schedules for your agency',
      link: '/branch-manager/schedules',
      icon: Calendar,
      color: 'bg-green-500',
      actions: ['Create Schedules', 'Assign Buses', 'Assign Drivers']
    },
    {
      title: 'Reports & Analytics',
      description: 'View ticket sales and branch performance reports',
      link: '/branch-manager/reports',
      icon: BarChart3,
      color: 'bg-purple-500',
      actions: ['Sales Reports', 'Schedule Analytics', 'Agent Performance']
    }
  ]

  const quickActions = [
    { title: 'Create Agent', action: 'create-agent', icon: UserCheck, link: '/branch-manager/agents' },
    { title: 'Create Schedule', action: 'create-schedule', icon: Calendar, link: '/branch-manager/schedules' },
    { title: 'View Reports', action: 'view-reports', icon: ClipboardList, link: '/branch-manager/reports' },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Branch Manager Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome {user?.firstName}! Manage your branch office operations
        </p>
        {metrics && (
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">{metrics.branchOfficeName}</span> - {metrics.agencyName}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        {branchManagerModules.map((module, index) => {
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

      {/* Branch Overview */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Branch Overview</h2>
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {metrics?.totalAgents || 0}
              </div>
              <div className="text-sm text-gray-600">Total Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {metrics?.activeAgents || 0}
              </div>
              <div className="text-sm text-gray-600">Active Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {metrics?.confirmedAgents || 0}
              </div>
              <div className="text-sm text-gray-600">Confirmed Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {metrics?.totalSchedules || 0}
              </div>
              <div className="text-sm text-gray-600">Total Schedules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {metrics?.totalBookings || 0}
              </div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600 mb-1">
                {metrics?.totalRevenue ? `${parseFloat(metrics.totalRevenue).toLocaleString()}` : '0'}
              </div>
              <div className="text-sm text-gray-600">Revenue (RWF)</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Additional Metrics */}
      {metrics && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {metrics.todaySchedules || 0}
              </div>
              <div className="text-sm text-gray-600">Today's Schedules</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {metrics.confirmedBookings || 0}
              </div>
              <div className="text-sm text-gray-600">Confirmed Bookings</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {metrics.monthlyRevenue ? `${parseFloat(metrics.monthlyRevenue).toLocaleString()}` : '0'}
              </div>
              <div className="text-sm text-gray-600">Monthly Revenue (RWF)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BranchManagerDashboard