import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Building2, Save, X, Key, Eye, EyeOff } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const AgencyManagement = () => {
  const [agencies, setAgencies] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingAgency, setEditingAgency] = useState(null)
  const [showPassword, setShowPassword] = useState({})

  const [agencyForm, setAgencyForm] = useState({
    agencyName: '',
    email: '',
    phoneNumber: '',
    address: '',
    status: 'ACTIVE',
    password: ''
  })
  const [logoFile, setLogoFile] = useState(null)

  useEffect(() => {
    fetchAgencies()
  }, [])

  const fetchAgencies = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getAgencies()
      setAgencies(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch agencies')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAgency = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      
      // Add agency data
      Object.keys(agencyForm).forEach(key => {
        formData.append(key, agencyForm[key])
      })
      
      // Add logo file
      if (logoFile) {
        formData.append('image', logoFile)
      }

      await adminAPI.createAgency(formData)
      toast.success('Agency created successfully')
      resetForm()
      fetchAgencies()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create agency')
    }
  }

  const handleUpdateAgency = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      
      // Add agency data (excluding password for updates)
      const updateData = { ...agencyForm }
      delete updateData.password
      
      // Create a JSON blob for the agency data
      const agencyBlob = new Blob([JSON.stringify(updateData)], {
        type: 'application/json'
      })
      formData.append('agency', agencyBlob)
      
      // Add logo file if selected
      if (logoFile) {
        formData.append('logo', logoFile)
      }

      await adminAPI.updateAgency(editingAgency.id, formData)
      toast.success('Agency updated successfully')
      resetForm()
      fetchAgencies()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update agency')
    }
  }

  const handleDeleteAgency = async (id) => {
    if (window.confirm('Are you sure you want to delete this agency?')) {
      try {
        await adminAPI.deleteAgency(id)
        toast.success('Agency deleted successfully')
        fetchAgencies()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete agency')
      }
    }
  }

  const handleResetPassword = async (id) => {
    if (window.confirm('Are you sure you want to reset this agency\'s password?')) {
      try {
        const response = await adminAPI.resetAgencyPassword(id)
        const newPassword = response.data.data
        setShowPassword(prev => ({ ...prev, [id]: newPassword }))
        toast.success('Password reset successfully')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to reset password')
      }
    }
  }

  const startEditAgency = (agency) => {
    setEditingAgency(agency)
    setAgencyForm({
      agencyName: agency.agencyName,
      email: agency.email,
      phoneNumber: agency.phoneNumber,
      address: agency.address,
      status: agency.status,
      password: '' // Don't populate password for security
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setAgencyForm({
      agencyName: '',
      email: '',
      phoneNumber: '',
      address: '',
      status: 'ACTIVE',
      password: ''
    })
    setLogoFile(null)
    setShowForm(false)
    setEditingAgency(null)
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
        <h1 className="text-3xl font-bold text-gray-900">Agency Management</h1>
        <p className="mt-2 text-gray-600">
          Register and manage bus agencies in the system
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">All Agencies</h2>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Register Agency
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto"></div>
            </div>
          ) : agencies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No agencies found. Register your first agency to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agencies.map((agency) => (
                <div key={agency.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {agency.logoPath && (
                        <img
                          src={agency.logoPath}
                          alt={agency.agencyName}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{agency.agencyName}</h3>
                        <span className={getStatusBadge(agency.status)}>
                          {agency.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><strong>Email:</strong> {agency.email}</p>
                    <p><strong>Phone:</strong> {agency.phoneNumber}</p>
                    <p><strong>Address:</strong> {agency.address}</p>
                    <p><strong>Created:</strong> {new Date(agency.createdAt).toLocaleDateString()}</p>
                  </div>

                  {showPassword[agency.id] && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">New Password:</p>
                      <p className="text-sm text-yellow-700 font-mono">{showPassword[agency.id]}</p>
                      <button
                        onClick={() => setShowPassword(prev => ({ ...prev, [agency.id]: null }))}
                        className="text-xs text-yellow-600 hover:text-yellow-800 mt-1"
                      >
                        Hide
                      </button>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditAgency(agency)}
                      className="flex-1 btn-secondary text-sm py-2"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleResetPassword(agency.id)}
                      className="flex-1 btn-outline text-sm py-2"
                    >
                      <Key className="h-3 w-3 mr-1" />
                      Reset
                    </button>
                    <button
                      onClick={() => handleDeleteAgency(agency.id)}
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

      {/* Agency Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingAgency ? 'Edit Agency' : 'Register New Agency'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingAgency ? handleUpdateAgency : handleCreateAgency}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agency Name
                  </label>
                  <input
                    type="text"
                    value={agencyForm.agencyName}
                    onChange={(e) => setAgencyForm({ ...agencyForm, agencyName: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={agencyForm.email}
                    onChange={(e) => setAgencyForm({ ...agencyForm, email: e.target.value })}
                    className="input w-full"
                    required
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={agencyForm.phoneNumber}
                    onChange={(e) => setAgencyForm({ ...agencyForm, phoneNumber: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={agencyForm.address}
                    onChange={(e) => setAgencyForm({ ...agencyForm, address: e.target.value })}
                    className="input w-full"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={agencyForm.status}
                    onChange={(e) => setAgencyForm({ ...agencyForm, status: e.target.value })}
                    className="input w-full"
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files[0])}
                    className="input w-full"
                    required={!editingAgency}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingAgency ? 'Update' : 'Register'}
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

export default AgencyManagement