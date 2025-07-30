import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Building2, Save, X, MapPin, Phone, Mail } from 'lucide-react'
import { agencyAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const BranchOfficeManagement = () => {
  const [branchOffices, setBranchOffices] = useState([])
  const [districts, setDistricts] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingOffice, setEditingOffice] = useState(null)
  const { user } = useAuth()

  const [officeForm, setOfficeForm] = useState({
    officeName: '',
    address: '',
    phoneNumber: '',
    email: '',
    status: 'ACTIVE',
    agency: { id: '' },
    district: { id: '' }
  })

  useEffect(() => {
    if (user?.roleEntityId) {
      fetchBranchOffices()
      fetchDistricts()
    }
  }, [user])

  const fetchBranchOffices = async () => {
    try {
      setLoading(true)
      const response = await agencyAPI.getBranchOfficesByAgency(user.roleEntityId)
      setBranchOffices(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch branch offices')
    } finally {
      setLoading(false)
    }
  }

  const fetchDistricts = async () => {
    try {
      const response = await agencyAPI.getDistricts()
      setDistricts(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch districts')
    }
  }

  const handleCreateOffice = async (e) => {
    e.preventDefault()
    try {
      await agencyAPI.createBranchOffice({
        ...officeForm,
        agency: { id: user.roleEntityId }
      })
      toast.success('Branch office created successfully')
      resetForm()
      fetchBranchOffices()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create branch office')
    }
  }

  const handleUpdateOffice = async (e) => {
    e.preventDefault()
    try {
      await agencyAPI.updateBranchOffice(editingOffice.id, officeForm)
      toast.success('Branch office updated successfully')
      resetForm()
      fetchBranchOffices()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update branch office')
    }
  }

  const handleDeleteOffice = async (id) => {
    if (window.confirm('Are you sure you want to delete this branch office?')) {
      try {
        await agencyAPI.deleteBranchOffice(id)
        toast.success('Branch office deleted successfully')
        fetchBranchOffices()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete branch office')
      }
    }
  }

  const startEditOffice = (office) => {
    setEditingOffice(office)
    setOfficeForm({
      officeName: office.officeName,
      address: office.address,
      phoneNumber: office.phoneNumber,
      email: office.email || '',
      status: office.status,
      agency: { id: office.agency.id.toString() },
      district: { id: office.district.id.toString() }
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setOfficeForm({
      officeName: '',
      address: '',
      phoneNumber: '',
      email: '',
      status: 'ACTIVE',
      agency: { id: '' },
      district: { id: '' }
    })
    setShowForm(false)
    setEditingOffice(null)
  }

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'ACTIVE':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'INACTIVE':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Branch Office Management</h1>
        <p className="mt-2 text-gray-600">
          Manage your agency's branch offices and locations
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Branch Offices</h2>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Branch Office
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto"></div>
            </div>
          ) : branchOffices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No branch offices found. Add your first branch office to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branchOffices.map((office) => (
                <div key={office.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {office.officeName}
                      </h3>
                      <span className={getStatusBadge(office.status)}>
                        {office.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{office.address}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>District: {office.district?.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{office.phoneNumber}</span>
                    </div>
                    {office.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{office.email}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {new Date(office.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditOffice(office)}
                      className="flex-1 btn-secondary text-sm py-2"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteOffice(office.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Branch Office Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingOffice ? 'Edit Branch Office' : 'Add New Branch Office'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingOffice ? handleUpdateOffice : handleCreateOffice}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Office Name
                  </label>
                  <input
                    type="text"
                    value={officeForm.officeName}
                    onChange={(e) => setOfficeForm({ ...officeForm, officeName: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={officeForm.address}
                    onChange={(e) => setOfficeForm({ ...officeForm, address: e.target.value })}
                    className="input w-full"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={officeForm.phoneNumber}
                    onChange={(e) => setOfficeForm({ ...officeForm, phoneNumber: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={officeForm.email}
                    onChange={(e) => setOfficeForm({ ...officeForm, email: e.target.value })}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District
                  </label>
                  <select
                    value={officeForm.district.id}
                    onChange={(e) => setOfficeForm({ ...officeForm, district: { id: e.target.value } })}
                    className="input w-full"
                    required
                  >
                    <option value="">Select district</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={officeForm.status}
                    onChange={(e) => setOfficeForm({ ...officeForm, status: e.target.value })}
                    className="input w-full"
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingOffice ? 'Update' : 'Create'}
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

export default BranchOfficeManagement