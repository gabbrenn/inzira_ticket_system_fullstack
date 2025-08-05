import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, MapPin, Save, X, Building2 } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const ProvinceManagement = () => {
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState({})
  const [loading, setLoading] = useState(false)
  const [showProvinceForm, setShowProvinceForm] = useState(false)
  const [showDistrictForm, setShowDistrictForm] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState(null)
  const [editingProvince, setEditingProvince] = useState(null)
  const [editingDistrict, setEditingDistrict] = useState(null)

  const [provinceForm, setProvinceForm] = useState({
    name: '',
    description: ''
  })

  const [districtForm, setDistrictForm] = useState({
    name: '',
    province: { id: '' }
  })

  useEffect(() => {
    fetchProvinces()
  }, [])

  const fetchProvinces = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getProvinces()
      setProvinces(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch provinces')
    } finally {
      setLoading(false)
    }
  }

  const fetchDistricts = async (provinceId) => {
    try {
      const response = await adminAPI.getDistrictsByProvince(provinceId)
      setDistricts(prev => ({
        ...prev,
        [provinceId]: response.data.data || []
      }))
    } catch (error) {
      toast.error('Failed to fetch districts')
    }
  }

  const handleCreateProvince = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.createProvince(provinceForm)
      toast.success('Province created successfully')
      setProvinceForm({ name: '', description: '' })
      setShowProvinceForm(false)
      fetchProvinces()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create province')
    }
  }

  const handleUpdateProvince = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.updateProvince(editingProvince.id, provinceForm)
      toast.success('Province updated successfully')
      setProvinceForm({ name: '', description: '' })
      setEditingProvince(null)
      fetchProvinces()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update province')
    }
  }

  const handleDeleteProvince = async (id) => {
    if (window.confirm('Are you sure you want to delete this province? This will also delete all districts in this province.')) {
      try {
        await adminAPI.deleteProvince(id)
        toast.success('Province deleted successfully')
        fetchProvinces()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete province')
      }
    }
  }

  const handleCreateDistrict = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.createDistrict({
        ...districtForm,
        province: { id: selectedProvince.id }
      })
      toast.success('District created successfully')
      setDistrictForm({ name: '', province: { id: '' } })
      setShowDistrictForm(false)
      fetchDistricts(selectedProvince.id)
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
      fetchDistricts(selectedProvince.id)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update district')
    }
  }

  const handleDeleteDistrict = async (id) => {
    if (window.confirm('Are you sure you want to delete this district?')) {
      try {
        await adminAPI.deleteDistrict(id)
        toast.success('District deleted successfully')
        fetchDistricts(selectedProvince.id)
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete district')
      }
    }
  }

  const startEditProvince = (province) => {
    setEditingProvince(province)
    setProvinceForm({
      name: province.name,
      description: province.description || ''
    })
  }

  const startEditDistrict = (district) => {
    setEditingDistrict(district)
    setDistrictForm({
      name: district.name,
      province: { id: district.province?.id || selectedProvince.id }
    })
  }

  const selectProvince = (province) => {
    setSelectedProvince(province)
    fetchDistricts(province.id)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Province & District Management</h1>
        <p className="mt-2 text-gray-600">
          Manage provinces and their districts across Rwanda
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Provinces Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Provinces</h2>
              <button
                onClick={() => setShowProvinceForm(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Province
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
                {provinces.map((province) => (
                  <div
                    key={province.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedProvince?.id === province.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selectProvince(province)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{province.name}</h3>
                        {province.description && (
                          <p className="text-sm text-gray-500">{province.description}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {districts[province.id]?.length || 0} districts
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditProvince(province)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteProvince(province.id)
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

        {/* Districts Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Districts
                {selectedProvince && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    in {selectedProvince.name}
                  </span>
                )}
              </h2>
              {selectedProvince && (
                <button
                  onClick={() => setShowDistrictForm(true)}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add District
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {!selectedProvince ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a province to view its districts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {districts[selectedProvince.id]?.map((district) => (
                  <div
                    key={district.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{district.name}</h3>
                        <p className="text-sm text-gray-500">ID: {district.id}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditDistrict(district)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDistrict(district.id)}
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

      {/* Province Form Modal */}
      {(showProvinceForm || editingProvince) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingProvince ? 'Edit Province' : 'Add New Province'}
              </h3>
              <button
                onClick={() => {
                  setShowProvinceForm(false)
                  setEditingProvince(null)
                  setProvinceForm({ name: '', description: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingProvince ? handleUpdateProvince : handleCreateProvince}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province Name
                  </label>
                  <input
                    type="text"
                    value={provinceForm.name}
                    onChange={(e) => setProvinceForm({ ...provinceForm, name: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={provinceForm.description}
                    onChange={(e) => setProvinceForm({ ...provinceForm, description: e.target.value })}
                    className="input w-full"
                    rows="3"
                    placeholder="Brief description of the province"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingProvince ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProvinceForm(false)
                    setEditingProvince(null)
                    setProvinceForm({ name: '', description: '' })
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
                  setDistrictForm({ name: '', province: { id: '' } })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingDistrict ? handleUpdateDistrict : handleCreateDistrict}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District Name
                  </label>
                  <input
                    type="text"
                    value={districtForm.name}
                    onChange={(e) => setDistrictForm({ ...districtForm, name: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province
                  </label>
                  <select
                    value={districtForm.province.id || selectedProvince?.id || ''}
                    onChange={(e) => setDistrictForm({ ...districtForm, province: { id: e.target.value } })}
                    className="input w-full"
                    required
                    disabled={selectedProvince && !editingDistrict}
                  >
                    <option value="">Select province</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
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
    </div>
  )
}

export default ProvinceManagement