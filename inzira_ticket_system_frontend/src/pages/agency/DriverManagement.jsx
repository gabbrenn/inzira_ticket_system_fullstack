import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Users, Save, X, Key, Eye, EyeOff } from 'lucide-react'
import { agencyAPI } from '../../services/api'
import toast from 'react-hot-toast'

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingDriver, setEditingDriver] = useState(null)
  const [showPassword, setShowPassword] = useState({})

  const [driverForm, setDriverForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    licenseNumber: '',
    status: 'ACTIVE',
    agency: { id: '' }
  })

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const response = await agencyAPI.getDrivers()
      setDrivers(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch drivers')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDriver = async (e) => {
    e.preventDefault()
    try {
      await agencyAPI.createDriver({
        ...driverForm,
        agency: { id: 1 } // Hardcoded for demo
      })
      toast.success('Driver created successfully')
      resetForm()
      fetchDrivers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create driver')
    }
  }

  const handleUpdateDriver = async (e) => {
    e.preventDefault()
    try {
      await agencyAPI.updateDriver(editingDriver.id, driverForm)
      toast.success('Driver updated successfully')
      resetForm()
      fetchDrivers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update driver')
    }
  }

  const handleDeleteDriver = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await agencyAPI.deleteDriver(id)
        toast.success('Driver deleted successfully')
        fetchDrivers()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete driver')
      }
    }
  }

  const handleResetPassword = async (id) => {
    if (window.confirm('Are you sure you want to reset this driver\'s password?')) {
      try {
        const response = await agencyAPI.resetDriverPassword(id)
        const newPassword = response.data.data
        setShowPassword(prev => ({ ...prev, [id]: newPassword }))
        toast.success('Password reset successfully')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to reset password')
      }
    }
  }

  const startEditDriver = (driver) => {
    setEditingDriver(driver)
    setDriverForm({
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      licenseNumber: driver.licenseNumber,
      status: driver.status,
      agency: { id: driver.agency.id.toString() }
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setDriverForm({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      licenseNumber: '',
      status: 'ACTIVE',
      agency: { id: '' }
    })
    setShowForm(false)
    setEditingDriver(null)
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

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
        <p className="mt-2 text-gray-600">
          Manage your drivers, licenses, and assignments
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">All Drivers</h2>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Register Driver
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto"></div>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No drivers found. Register your first driver to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.map((driver) => (
                <div key={driver.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {driver.firstName} {driver.lastName}
                      </h3>
                      <span className={getStatusBadge(driver.status)}>
                        {driver.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><strong>Email:</strong> {driver.email}</p>
                    <p><strong>Phone:</strong> {driver.phoneNumber}</p>
                    <p><strong>License:</strong> {driver.licenseNumber}</p>
                    <p><strong>Joined:</strong> {new Date(driver.createdAt).toLocaleDateString()}</p>
                  </div>

                  {showPassword[driver.id] && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">New Password:</p>
                      <p className="text-sm text-yellow-700 font-mono">{showPassword[driver.id]}</p>
                      <button
                        onClick={() => setShowPassword(prev => ({ ...prev, [driver.id]: null }))}
                        className="text-xs text-yellow-600 hover:text-yellow-800 mt-1"
                      >
                        Hide
                      </button>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditDriver(driver)}
                      className="flex-1 btn-secondary text-sm py-2"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleResetPassword(driver.id)}
                      className="flex-1 btn-outline text-sm py-2"
                    >
                      <Key className="h-3 w-3 mr-1" />
                      Reset
                    </button>
                    <button
                      onClick={() => handleDeleteDriver(driver.id)}
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

      {/* Driver Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingDriver ? 'Edit Driver' : 'Register New Driver'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingDriver ? handleUpdateDriver : handleCreateDriver}>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={driverForm.firstName}
                      onChange={(e) => setDriverForm({ ...driverForm, firstName: e.target.value })}
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
                      value={driverForm.lastName}
                      onChange={(e) => setDriverForm({ ...driverForm, lastName: e.target.value })}
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
                    value={driverForm.email}
                    onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                    className="input w-full"
                    required
                    disabled={editingDriver} // Email shouldn't be editable
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={driverForm.phoneNumber}
                    onChange={(e) => setDriverForm({ ...driverForm, phoneNumber: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={driverForm.licenseNumber}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={driverForm.status}
                    onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value })}
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
                  {editingDriver ? 'Update' : 'Register'}
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

export default DriverManagement