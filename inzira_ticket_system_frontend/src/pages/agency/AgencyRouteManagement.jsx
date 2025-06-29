import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Route, Save, X, MapPin } from 'lucide-react'
import { agencyAPI, adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const AgencyRouteManagement = () => {
  const [agencyRoutes, setAgencyRoutes] = useState([])
  const [routes, setRoutes] = useState([])
  const [routePoints, setRoutePoints] = useState({})
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [routeForm, setRouteForm] = useState({
    agencyId: 1, // Hardcoded for demo
    routeId: '',
    price: '',
    pickupPointIds: [],
    dropPointIds: []
  })

  useEffect(() => {
    fetchAgencyRoutes()
    fetchRoutes()
  }, [])

  const fetchAgencyRoutes = async () => {
    try {
      setLoading(true)
      const response = await agencyAPI.getAgencyRoutes()
      setAgencyRoutes(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch agency routes')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoutes = async () => {
    try {
      const response = await adminAPI.getRoutes()
      setRoutes(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch routes')
    }
  }

  const fetchRoutePoints = async (districtId) => {
    try {
      const response = await adminAPI.getRoutePoints(districtId)
      setRoutePoints(prev => ({
        ...prev,
        [districtId]: response.data.data || []
      }))
    } catch (error) {
      console.error('Failed to fetch route points for district', districtId)
    }
  }

  const handleRouteChange = async (routeId) => {
    setRouteForm({ ...routeForm, routeId, pickupPointIds: [], dropPointIds: [] })
    
    if (routeId) {
      const selectedRoute = routes.find(r => r.id.toString() === routeId)
      if (selectedRoute) {
        await fetchRoutePoints(selectedRoute.origin.id)
        await fetchRoutePoints(selectedRoute.destination.id)
      }
    }
  }

  const handleCreateAgencyRoute = async (e) => {
    e.preventDefault()
    try {
      await agencyAPI.createAgencyRoute({
        ...routeForm,
        price: parseFloat(routeForm.price)
      })
      toast.success('Agency route created successfully')
      resetForm()
      fetchAgencyRoutes()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create agency route')
    }
  }

  const handleDeleteAgencyRoute = async (id) => {
    if (window.confirm('Are you sure you want to delete this agency route?')) {
      try {
        await agencyAPI.deleteAgencyRoute(id)
        toast.success('Agency route deleted successfully')
        fetchAgencyRoutes()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete agency route')
      }
    }
  }

  const resetForm = () => {
    setRouteForm({
      agencyId: 1,
      routeId: '',
      price: '',
      pickupPointIds: [],
      dropPointIds: []
    })
    setShowForm(false)
  }

  const selectedRoute = routes.find(r => r.id.toString() === routeForm.routeId)
  const originPoints = selectedRoute ? routePoints[selectedRoute.origin.id] || [] : []
  const destinationPoints = selectedRoute ? routePoints[selectedRoute.destination.id] || [] : []

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agency Route Management</h1>
        <p className="mt-2 text-gray-600">
          Manage your agency routes, pricing, and pickup/drop points
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Agency Routes</h2>
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
          ) : agencyRoutes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Route className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No agency routes found. Add your first route to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {agencyRoutes.map((agencyRoute) => (
                <div key={agencyRoute.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {agencyRoute.route.origin.name} → {agencyRoute.route.destination.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Distance: {agencyRoute.route.distanceKm} km
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">
                        {agencyRoute.price} RWF
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Pickup Points:</h4>
                      <div className="flex flex-wrap gap-1">
                        {agencyRoute.pickupPoints.map((point) => (
                          <span key={point.id} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {point.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Drop Points:</h4>
                      <div className="flex flex-wrap gap-1">
                        {agencyRoute.dropPoints.map((point) => (
                          <span key={point.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {point.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDeleteAgencyRoute(agencyRoute.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Agency Route Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Agency Route</h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgencyRoute}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Route
                  </label>
                  <select
                    value={routeForm.routeId}
                    onChange={(e) => handleRouteChange(e.target.value)}
                    className="input w-full"
                    required
                  >
                    <option value="">Select a route</option>
                    {routes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.origin.name} → {route.destination.name} ({route.distanceKm} km)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (RWF)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={routeForm.price}
                    onChange={(e) => setRouteForm({ ...routeForm, price: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                {selectedRoute && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Points in {selectedRoute.origin.name}
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                        {originPoints.map((point) => (
                          <label key={point.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={routeForm.pickupPointIds.includes(point.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRouteForm({
                                    ...routeForm,
                                    pickupPointIds: [...routeForm.pickupPointIds, point.id]
                                  })
                                } else {
                                  setRouteForm({
                                    ...routeForm,
                                    pickupPointIds: routeForm.pickupPointIds.filter(id => id !== point.id)
                                  })
                                }
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm">{point.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Drop Points in {selectedRoute.destination.name}
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                        {destinationPoints.map((point) => (
                          <label key={point.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={routeForm.dropPointIds.includes(point.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRouteForm({
                                    ...routeForm,
                                    dropPointIds: [...routeForm.dropPointIds, point.id]
                                  })
                                } else {
                                  setRouteForm({
                                    ...routeForm,
                                    dropPointIds: routeForm.dropPointIds.filter(id => id !== point.id)
                                  })
                                }
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm">{point.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Create Route
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

export default AgencyRouteManagement