import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Route, Save, X } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const RouteManagement = () => {
  const [routes, setRoutes] = useState([])
  const [districts, setDistricts] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingRoute, setEditingRoute] = useState(null)

  const [routeForm, setRouteForm] = useState({
    origin: { id: '' },
    destination: { id: '' },
    distanceKm: ''
  })

  useEffect(() => {
    fetchRoutes()
    fetchDistricts()
  }, [])

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getRoutes()
      setRoutes(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch routes')
    } finally {
      setLoading(false)
    }
  }

  const fetchDistricts = async () => {
    try {
      const response = await adminAPI.getDistricts()
      setDistricts(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch districts')
    }
  }

  const handleCreateRoute = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.createRoute({
        ...routeForm,
        distanceKm: parseFloat(routeForm.distanceKm)
      })
      toast.success('Route created successfully')
      resetForm()
      fetchRoutes()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create route')
    }
  }

  const handleUpdateRoute = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.updateRoute(editingRoute.id, {
        ...routeForm,
        distanceKm: parseFloat(routeForm.distanceKm)
      })
      toast.success('Route updated successfully')
      resetForm()
      fetchRoutes()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update route')
    }
  }

  const handleDeleteRoute = async (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await adminAPI.deleteRoute(id)
        toast.success('Route deleted successfully')
        fetchRoutes()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete route')
      }
    }
  }

  const startEditRoute = (route) => {
    setEditingRoute(route)
    setRouteForm({
      origin: { id: route.origin.id.toString() },
      destination: { id: route.destination.id.toString() },
      distanceKm: route.distanceKm.toString()
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setRouteForm({
      origin: { id: '' },
      destination: { id: '' },
      distanceKm: ''
    })
    setShowForm(false)
    setEditingRoute(null)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Route Management</h1>
        <p className="mt-2 text-gray-600">
          Create and manage routes between districts
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">All Routes</h2>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Route
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto"></div>
            </div>
          ) : routes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Route className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No routes found. Create your first route to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Origin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distance (KM)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {routes.map((route) => (
                    <tr key={route.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Route #{route.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{route.origin.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{route.destination.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{route.distanceKm} km</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => startEditRoute(route)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoute(route.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Route Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingRoute ? 'Edit Route' : 'Add New Route'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingRoute ? handleUpdateRoute : handleCreateRoute}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origin District
                </label>
                <select
                  value={routeForm.origin.id}
                  onChange={(e) => setRouteForm({
                    ...routeForm,
                    origin: { id: e.target.value }
                  })}
                  className="input w-full"
                  required
                >
                  <option value="">Select origin district</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination District
                </label>
                <select
                  value={routeForm.destination.id}
                  onChange={(e) => setRouteForm({
                    ...routeForm,
                    destination: { id: e.target.value }
                  })}
                  className="input w-full"
                  required
                >
                  <option value="">Select destination district</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance (KM)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={routeForm.distanceKm}
                  onChange={(e) => setRouteForm({
                    ...routeForm,
                    distanceKm: e.target.value
                  })}
                  className="input w-full"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingRoute ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RouteManagement