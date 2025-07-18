import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Route, Building2, Users, Plus, Settings } from 'lucide-react'

const AdminDashboard = () => {
  const adminModules = [
    {
      title: 'District Management',
      description: 'Manage districts and route points across Rwanda',
      link: '/admin/districts',
      icon: MapPin,
      color: 'bg-blue-500',
      actions: ['Create Districts', 'Add Route Points', 'Manage Locations']
    },
    {
      title: 'Route Management',
      description: 'Create and manage routes between districts',
      link: '/admin/routes',
      icon: Route,
      color: 'bg-green-500',
      actions: ['Create Routes', 'Set Distances', 'Route Analytics']
    },
    {
      title: 'Agency Management',
      description: 'Register and manage bus agencies',
      link: '/admin/agencies',
      icon: Building2,
      color: 'bg-purple-500',
      actions: ['Register Agencies', 'Reset Passwords', 'Agency Status']
    }
  ]

  const quickActions = [
    { title: 'Register New Admin', action: 'register-admin', icon: Users },
    { title: 'System Settings', action: 'settings', icon: Settings },
    { title: 'View Reports', action: 'reports', icon: Plus },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage the entire Inzira ticket system from this central hub
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

      {/* Main Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {adminModules.map((module, index) => {
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

      {/* System Overview */}
      <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">12</div>
            <div className="text-sm text-gray-600">Total Districts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">45</div>
            <div className="text-sm text-gray-600">Active Routes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">8</div>
            <div className="text-sm text-gray-600">Registered Agencies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">156</div>
            <div className="text-sm text-gray-600">Route Points</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard