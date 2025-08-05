import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, MapPin, Save, X, Building2 } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const DistrictManagement = () => {
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [routePoints, setRoutePoints] = useState({})
  const [loading, setLoading] = useState(false)
  const [showDistrictForm, setShowDistrictForm] = useState(false)
  const [showPointForm, setShowPointForm] = useState(false)
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [editingDistrict, setEditingDistrict] = useState(null)
  const [editingPoint, setEditingPoint] = useState(null)

  const [districtForm, setDistrictForm] = useState({
    name: '',
    province: { id: '' }
  })
  const [pointForm, setPointForm] = useState({
    name: '',
    gpsLat: '',
    gpsLong: ''
  })

  useEffect(() => {
    fetchDistricts()
    fetchProvinces()
  }, [])

  const fetchProvinces = async () => {
    try {
      const response = await adminAPI.getProvinces()
      setProvinces(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch provinces')
    }
  }

  const fetchDistricts = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getDistricts()
      setDistricts(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch districts')
    } finally {
      setLoading(false)
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
      toast.error('Failed to fetch route points')
    }
  }

  const handleCreateDistrict = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.createDistrict(districtForm)
      toast.success('District created successfully')
      setDistrictForm({ name: '', province: { id: '' } })
      setShowDistrictForm(false)
      fetchDistricts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create district')
    }
  }

  const handleUpdateDistrict = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.updateDistrict(editingDistrict.id, districtForm)
      toast.success('District updated successfully')
      setDistrictForm({ name: '', province: { id: '' } })
      setEditingDistrict(null)
      fetchDistricts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update district')
    }
  }

  const handleDeleteDistrict = async (id) => {
    if (window.confirm('Are you sure you want to delete this district?')) {
      try {
        await adminAPI.deleteDistrict(id)
        toast.success('District deleted successfully')
        fetchDistricts()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete district')
      }
    }
  }

  const handleCreateRoutePoint = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.addRoutePoint(selectedDistrict.id, {
        ...pointForm,
        gpsLat: parseFloat(pointForm.gpsLat),
        gpsLong: parseFloat(pointForm.gpsLong)
      })
      toast.success('Route point added successfully')
      setPointForm({ name: '', gpsLat: '', gpsLong: '' })
      setShowPointForm(false)
      fetchRoutePoints(selectedDistrict.id)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add route point')
    }
  }

  const handleUpdateRoutePoint = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.updateRoutePoint(selectedDistrict.id, editingPoint.id, {
        ...pointForm,
        gpsLat: parseFloat(pointForm.gpsLat),
        gpsLong: parseFloat(pointForm.gpsLong)
      })
      toast.success('Route point updated successfully')
      setPointForm({ name: '', gpsLat: '', gpsLong: '' })
      setEditingPoint(null)
      fetchRoutePoints(selectedDistrict.id)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update route point')
    }
  }

  const handleDeleteRoutePoint = async (districtId, pointId) => {
    if (window.confirm('Are you sure you want to delete this route point?')) {
      try {
        await adminAPI.deleteRoutePoint(districtId, pointId)
        toast.success('Route point deleted successfully')
        fetchRoutePoints(districtId)
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete route point')
      }
    }
  }

  const startEditDistrict = (district) => {
    setEditingDistrict(district)
    setDistrictForm({
      name: district.name,
      province: { id: district.province?.id || '' }
    })
  }

  const startEditPoint = (point) => {
    setEditingPoint(point)
    setPointForm({
      name: point.name,
      gpsLat: point.gpsLat.toString(),
      gpsLong: point.gpsLong.toString()
    })
  }

  const selectDistrict = (district) => {
    setSelectedDistrict(district)
    fetchRoutePoints(district.id)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">District & Route Points Management</h1>
        <p className="mt-2 text-gray-600">
          Manage districts and their route points (organized by provinces)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Districts Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Districts</h2>
              <button
                onClick={() => setShowDistrictForm(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add District
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">
                <div className="loading-spinner mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {districts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map((district) => (
                  <div
                    key={district.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDistrict?.id === district.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selectDistrict(district)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{district.name}</h3>
                        <p className="text-sm text-gray-500">
                          {district.province?.name || 'No Province'}
                        </p>
                        <p className="text-sm text-gray-500">ID: {district.id}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditDistrict(district)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteDistrict(district.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Route Points Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Route Points
                {selectedDistrict && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    in {selectedDistrict.name}
                  </span>
                )}
              </h2>
              {selectedDistrict && (
                <button
                  onClick={() => setShowPointForm(true)}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Point
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {!selectedDistrict ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a district to view its route points</p>
              </div>
            ) : (
              <div className="space-y-3">
                {routePoints[selectedDistrict.id]?.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map((point) => (
                  <div
                    key={point.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{point.name}</h3>
                        <p className="text-sm text-gray-500">
                          Lat: {point.gpsLat}, Long: {point.gpsLong}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditPoint(point)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoutePoint(selectedDistrict.id, point.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* District Form Modal */}
      {(showDistrictForm || editingDistrict) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingDistrict ? 'Edit District' : 'Add New District'}
              </h3>
              <button
                onClick={() => {
                  setShowDistrictForm(false)
                  setEditingDistrict(null)
                  setDistrictForm({ name: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingDistrict ? handleUpdateDistrict : handleCreateDistrict}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District Name
                </label>
                <input
                  type="text"
                  value={districtForm.name}
                  onChange={(e) => setDistrictForm({ name: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province
                </label>
                <select
                  value={districtForm.province.id}
                  onChange={(e) => setDistrictForm({ ...districtForm, province: { id: e.target.value } })}
                  className="input w-full"
                  required
                >
                  <option value="">Select province</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingDistrict ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDistrictForm(false)
                    setEditingDistrict(null)
                    setDistrictForm({ name: '', province: { id: '' } })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Route Point Form Modal */}
      {(showPointForm || editingPoint) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingPoint ? 'Edit Route Point' : 'Add New Route Point'}
              </h3>
              <button
                onClick={() => {
                  setShowPointForm(false)
                  setEditingPoint(null)
                  setPointForm({ name: '', gpsLat: '', gpsLong: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingPoint ? handleUpdateRoutePoint : handleCreateRoutePoint}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Point Name
                </label>
                <input
                  type="text"
                  value={pointForm.name}
                  onChange={(e) => setPointForm({ ...pointForm, name: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={pointForm.gpsLat}
                    onChange={(e) => setPointForm({ ...pointForm, gpsLat: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={pointForm.gpsLong}
                    onChange={(e) => setPointForm({ ...pointForm, gpsLong: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingPoint ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPointForm(false)
                    setEditingPoint(null)
                    setPointForm({ name: '', gpsLat: '', gpsLong: '' })
                  }}
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

export default DistrictManagement