import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Bus, Save, X } from 'lucide-react'
import { agencyAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const BusManagement = () => {
  const [buses, setBuses] = useState([])
  const [agencies, setAgencies] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingBus, setEditingBus] = useState(null)
  const { user } = useAuth()

  const [busForm, setBusForm] = useState({
    plateNumber: '',
    busType: 'Normal',
    capacity: '',
    status: 'ACTIVE',
    agency: { id: '' }
  })

  useEffect(() => {
    if (user?.roleEntityId) {
      fetchBuses()
    }
  }, [])

  const fetchBuses = async () => {
    try {
      setLoading(true)
      // Fetch buses for the authenticated agency
      const response = await agencyAPI.getBusesByAgency(user.roleEntityId)
      // Sort buses by creation date (newest first)
      const sortedBuses = (response.data.data || []).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
      setBuses(sortedBuses)
    } catch (error) {
      toast.error('Failed to fetch buses')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBus = async (e) => {
    e.preventDefault()
    try {
      await agencyAPI.createBus({
        ...busForm,
        capacity: parseInt(busForm.capacity),
        agency: { id: user.roleEntityId }
      })
      toast.success('Bus created successfully')
      resetForm()
      fetchBuses()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create bus')
    }
  }

  const handleUpdateBus = async (e) => {
    e.preventDefault()
    try {
      await agencyAPI.updateBus(editingBus.id, {
        ...busForm,
        capacity: parseInt(busForm.capacity)
      })
      toast.success('Bus updated successfully')
      resetForm()
      fetchBuses()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update bus')
    }
  }

  const handleDeleteBus = async (id) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await agencyAPI.deleteBus(id)
        toast.success('Bus deleted successfully')
        fetchBuses()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete bus')
      }
    }
  }

  const startEditBus = (bus) => {
    setEditingBus(bus)
    setBusForm({
      plateNumber: bus.plateNumber,
      busType: bus.busType,
      capacity: bus.capacity.toString(),
      status: bus.status,
      agency: { id: bus.agency.id.toString() }
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setBusForm({
      plateNumber: '',
      busType: 'Normal',
      capacity: '',
      status: 'ACTIVE',
      agency: { id: '' }
    })
    setShowForm(false)
    setEditingBus(null)
  }

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'ACTIVE':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'MAINTENANCE':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'INACTIVE':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bus Management</h1>
        <p className="mt-2 text-gray-600">
          Manage your fleet of buses and their operational status
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">All Buses</h2>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Bus
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto"></div>
            </div>
          ) : buses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No buses found. Add your first bus to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plate Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {buses.map((bus) => (
                    <tr key={bus.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{bus.plateNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{bus.busType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{bus.capacity} seats</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(bus.status)}>
                          {bus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(bus.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => startEditBus(bus)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBus(bus.id)}
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

      {/* Bus Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingBus ? 'Edit Bus' : 'Add New Bus'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingBus ? handleUpdateBus : handleCreateBus}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plate Number
                  </label>
                  <input
                    type="text"
                    value={busForm.plateNumber}
                    onChange={(e) => setBusForm({ ...busForm, plateNumber: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bus Type
                  </label>
                  <select
                    value={busForm.busType}
                    onChange={(e) => setBusForm({ ...busForm, busType: e.target.value })}
                    className="input w-full"
                    required
                  >
                    <option value="Normal">Normal</option>
                    <option value="VIP">VIP</option>
                    <option value="Express">Express</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (seats)
                  </label>
                  <input
                    type="number"
                    value={busForm.capacity}
                    onChange={(e) => setBusForm({ ...busForm, capacity: e.target.value })}
                    className="input w-full"
                    min="1"
                    max="100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={busForm.status}
                    onChange={(e) => setBusForm({ ...busForm, status: e.target.value })}
                    className="input w-full"
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingBus ? 'Update' : 'Add'}
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

export default BusManagement