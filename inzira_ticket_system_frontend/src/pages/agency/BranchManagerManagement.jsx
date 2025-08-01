import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Users, Save, X, Key, Building2, UserCheck } from 'lucide-react'
import { agencyAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const BranchManagerManagement = () => {
  const [branchManagers, setBranchManagers] = useState([])
  const [branchOffices, setBranchOffices] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingBranchManager, setEditingBranchManager] = useState(null)
  const [showPassword, setShowPassword] = useState({})
  const { user } = useAuth()

  const [branchManagerForm, setBranchManagerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    status: 'ACTIVE',
    agency: { id: '' },
    branchOffice: { id: '' }
  })

  useEffect(() => {
    if (user?.roleEntityId) {
      fetchBranchManagers()
      fetchBranchOffices()
    }
  }, [user])

  const fetchBranchManagers = async () => {
    try {
      setLoading(true)
      const response = await agencyAPI.getBranchManagersByAgency(user.roleEntityId)
      // Sort branch managers by creation date (newest first)
      const sortedManagers = (response.data.data || []).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
      setBranchManagers(sortedManagers)
    } catch (error) {
      toast.error('Failed to fetch branch managers')
    } finally {
      setLoading(false)
    }
  }

  const fetchBranchOffices = async () => {
    try {
      const response = await agencyAPI.getBranchOfficesByAgency(user.roleEntityId)
      setBranchOffices(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch branch offices')
    }
  }

  const handleCreateBranchManager = async (e) => {
    e.preventDefault()
    try {
      await agencyAPI.createBranchManager({
        ...branchManagerForm,
        agency: { id: user.roleEntityId }
      })
      toast.success('Branch manager created successfully')
      resetForm()
      fetchBranchManagers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create branch manager')
    }
  }

  const handleUpdateBranchManager = async (e) => {
    e.preventDefault()
    try {
      await agencyAPI.updateBranchManager(editingBranchManager.id, branchManagerForm)
      toast.success('Branch manager updated successfully')
      resetForm()
      fetchBranchManagers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update branch manager')
    }
  }

  const handleDeleteBranchManager = async (id) => {
    if (window.confirm('Are you sure you want to delete this branch manager?')) {
      try {
        await agencyAPI.deleteBranchManager(id)
        toast.success('Branch manager deleted successfully')
        fetchBranchManagers()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete branch manager')
      }
    }
  }

  const handleResetPassword = async (id) => {
    if (window.confirm('Are you sure you want to reset this branch manager\'s password?')) {
      try {
        const response = await agencyAPI.resetBranchManagerPassword(id)
        const newPassword = response.data.data
        setShowPassword(prev => ({ ...prev, [id]: newPassword }))
        toast.success('Password reset successfully')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to reset password')
      }
    }
  }

  const startEditBranchManager = (branchManager) => {
    setEditingBranchManager(branchManager)
    setBranchManagerForm({
      firstName: branchManager.firstName,
      lastName: branchManager.lastName,
      email: branchManager.email,
      phoneNumber: branchManager.phoneNumber,
      status: branchManager.status,
      agency: { id: branchManager.agency.id.toString() },
      branchOffice: { id: branchManager.branchOffice.id.toString() }
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setBranchManagerForm({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      status: 'ACTIVE',
      agency: { id: '' },
      branchOffice: { id: '' }
    })
    setShowForm(false)
    setEditingBranchManager(null)
  }

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'ACTIVE':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'INACTIVE':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'SUSPENDED':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  // Filter out branch offices that already have a manager
  const availableBranchOffices = branchOffices.filter(office => 
    !branchManagers.some(manager => manager.branchOffice.id === office.id) ||
    (editingBranchManager && editingBranchManager.branchOffice.id === office.id)
  )

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Branch Manager Management</h1>
        <p className="mt-2 text-gray-600">
          Assign managers to your branch offices to oversee operations
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Branch Managers</h2>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
              disabled={availableBranchOffices.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Branch Manager
            </button>
          </div>
          {availableBranchOffices.length === 0 && !editingBranchManager && (
            <p className="text-sm text-gray-500 mt-2">
              All branch offices already have managers assigned.
            </p>
          )}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto"></div>
            </div>
          ) : branchManagers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No branch managers found. Assign your first branch manager to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branchManagers.map((branchManager) => (
                <div key={branchManager.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {branchManager.firstName} {branchManager.lastName}
                      </h3>
                      <span className={getStatusBadge(branchManager.status)}>
                        {branchManager.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><strong>Email:</strong> {branchManager.email}</p>
                    <p><strong>Phone:</strong> {branchManager.phoneNumber}</p>
                    <div className="flex items-center">
                      <Building2 className="h-3 w-3 mr-1" />
                      <span>{branchManager.branchOffice.officeName}</span>
                    </div>
                    <p><strong>Created:</strong> {new Date(branchManager.createdAt).toLocaleDateString()}</p>
                  </div>

                  {showPassword[branchManager.id] && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">New Password:</p>
                      <p className="text-sm text-yellow-700 font-mono">{showPassword[branchManager.id]}</p>
                      <button
                        onClick={() => setShowPassword(prev => ({ ...prev, [branchManager.id]: null }))}
                        className="text-xs text-yellow-600 hover:text-yellow-800 mt-1"
                      >
                        Hide
                      </button>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditBranchManager(branchManager)}
                      className="flex-1 btn-secondary text-sm py-2"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleResetPassword(branchManager.id)}
                      className="flex-1 btn-outline text-sm py-2"
                    >
                      <Key className="h-3 w-3 mr-1" />
                      Reset
                    </button>
                    <button
                      onClick={() => handleDeleteBranchManager(branchManager.id)}
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

      {/* Branch Manager Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingBranchManager ? 'Edit Branch Manager' : 'Add New Branch Manager'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingBranchManager ? handleUpdateBranchManager : handleCreateBranchManager}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={branchManagerForm.firstName}
                      onChange={(e) => setBranchManagerForm({ ...branchManagerForm, firstName: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={branchManagerForm.lastName}
                      onChange={(e) => setBranchManagerForm({ ...branchManagerForm, lastName: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={branchManagerForm.email}
                    onChange={(e) => setBranchManagerForm({ ...branchManagerForm, email: e.target.value })}
                    className="input w-full"
                    required
                    disabled={editingBranchManager} // Email shouldn't be editable
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={branchManagerForm.phoneNumber}
                    onChange={(e) => setBranchManagerForm({ ...branchManagerForm, phoneNumber: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Office
                  </label>
                  <select
                    value={branchManagerForm.branchOffice.id}
                    onChange={(e) => setBranchManagerForm({ ...branchManagerForm, branchOffice: { id: e.target.value } })}
                    className="input w-full"
                    required
                  >
                    <option value="">Select branch office</option>
                    {availableBranchOffices.filter(office => office.status === 'ACTIVE').map((office) => (
                      <option key={office.id} value={office.id}>
                        {office.officeName} - {office.address}
                      </option>
                    ))}
                  </select>
                  {!editingBranchManager && availableBranchOffices.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      All branch offices already have managers. Create a new branch office first.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={branchManagerForm.status}
                    onChange={(e) => setBranchManagerForm({ ...branchManagerForm, status: e.target.value })}
                    className="input w-full"
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingBranchManager ? 'Update' : 'Create'}
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

export default BranchManagerManagement