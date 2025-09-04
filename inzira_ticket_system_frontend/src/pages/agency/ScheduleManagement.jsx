import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Calendar, Save, X, Clock, Ban } from 'lucide-react'
import { agencyAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import Pagination from '../../components/Pagination'

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([])
  const [agencyRoutes, setAgencyRoutes] = useState([])
  const [buses, setBuses] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [scheduleForm, setScheduleForm] = useState({
    agencyRoute: { id: '' },
    bus: { id: '' },
    driver: { id: '' },
    departureDate: '',
    departureTime: '',
    arrivalTime: ''
  })

  useEffect(() => {
    if (user?.roleEntityId) {
      fetchSchedules()
      fetchAgencyRoutes()
      fetchBuses()
      fetchDrivers()
    }
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      // Fetch schedules for the authenticated agency
      const response = await agencyAPI.getSchedulesByAgency(user.roleEntityId)
      // Sort schedules by departure date and time (newest first)
      const sortedSchedules = (response.data.data || []).sort((a, b) => {
        const dateA = new Date(`${a.departureDate}T${a.departureTime}`)
        const dateB = new Date(`${b.departureDate}T${b.departureTime}`)
        return dateB - dateA
      })
      setSchedules(sortedSchedules)
    } catch (error) {
      toast.error('Failed to fetch schedules')
    } finally {
      setLoading(false)
    }
  }

  const fetchAgencyRoutes = async () => {
    try {
      // Fetch agency routes for the authenticated agency
      const response = await agencyAPI.getRoutesByAgency(user.roleEntityId)
      setAgencyRoutes(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch agency routes')
    }
  }

  const fetchBuses = async () => {
    try {
      // Fetch buses for the authenticated agency
      const response = await agencyAPI.getBusesByAgency(user.roleEntityId)
      setBuses(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch buses')
    }
  }

  const fetchDrivers = async () => {
    try {
      // Fetch drivers for the authenticated agency
      const response = await agencyAPI.getDriversByAgency(user.roleEntityId)
      setDrivers(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch drivers')
    }
  }

  const handleCreateSchedule = async (e) => {
    e.preventDefault()
    try {
      await agencyAPI.createSchedule(scheduleForm)
      toast.success('Schedule created successfully')
      resetForm()
      fetchSchedules()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create schedule')
    }
  }

  const handleUpdateSchedule = async (e) => {
    e.preventDefault()
    try {
      await agencyAPI.updateSchedule(editingSchedule.id, scheduleForm)
      toast.success('Schedule updated successfully')
      resetForm()
      fetchSchedules()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update schedule')
    }
  }

  const handleCancelSchedule = async (id) => {
    if (window.confirm('Are you sure you want to cancel this schedule?')) {
      try {
        await agencyAPI.cancelSchedule(id)
        toast.success('Schedule cancelled successfully')
        fetchSchedules()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel schedule')
      }
    }
  }

  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await agencyAPI.deleteSchedule(id)
        toast.success('Schedule deleted successfully')
        fetchSchedules()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete schedule')
      }
    }
  }

  const startEditSchedule = (schedule) => {
    setEditingSchedule(schedule)
    setScheduleForm({
      agencyRoute: { id: schedule.agencyRoute.id.toString() },
      bus: { id: schedule.bus.id.toString() },
      driver: { id: schedule.driver.id.toString() },
      departureDate: schedule.departureDate,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setScheduleForm({
      agencyRoute: { id: '' },
      bus: { id: '' },
      driver: { id: '' },
      departureDate: '',
      departureTime: '',
      arrivalTime: ''
    })
    setShowForm(false)
    setEditingSchedule(null)
  }

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'SCHEDULED':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'DEPARTED':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'ARRIVED':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'CANCELLED':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
        <p className="mt-2 text-gray-600">
          Create and manage bus schedules for your routes
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">All Schedules</h2>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto"></div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No schedules found. Create your first schedule to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <div className="text-sm text-gray-600">
                  Total schedules: {schedules.length}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Items per page</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="input w-28"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bus
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available Seats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedules
                    .slice((currentPage - 1) * itemsPerPage, (currentPage - 1) * itemsPerPage + itemsPerPage)
                    .map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {schedule.agencyRoute.route.origin.name} → {schedule.agencyRoute.route.destination.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {schedule.agencyRoute.price} RWF
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{schedule.departureDate}</div>
                        <div className="text-sm text-gray-500">
                          {schedule.departureTime} - {schedule.arrivalTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{schedule.bus.plateNumber}</div>
                        <div className="text-sm text-gray-500">{schedule.bus.busType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {schedule.driver.firstName} {schedule.driver.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{schedule.availableSeats}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(schedule.status)}>
                          {schedule.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {schedule.status === 'SCHEDULED' && (
                            <>
                              <button
                                onClick={() => startEditSchedule(schedule)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleCancelSchedule(schedule.id)}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
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
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(schedules.length / itemsPerPage) || 1}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={schedules.length}
              />
            </div>
          )}
        </div>
      </div>

      {/* Schedule Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agency Route
                  </label>
                  <select
                    value={scheduleForm.agencyRoute.id}
                    onChange={(e) => setScheduleForm({
                      ...scheduleForm,
                      agencyRoute: { id: e.target.value }
                    })}
                    className="input w-full"
                    required
                  >
                    <option value="">Select route</option>
                    {agencyRoutes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.route.origin.name} → {route.route.destination.name} ({route.price} RWF)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bus
                  </label>
                  <select
                    value={scheduleForm.bus.id}
                    onChange={(e) => setScheduleForm({
                      ...scheduleForm,
                      bus: { id: e.target.value }
                    })}
                    className="input w-full"
                    required
                  >
                    <option value="">Select bus</option>
                    {buses.filter(bus => bus.status === 'ACTIVE').map((bus) => (
                      <option key={bus.id} value={bus.id}>
                        {bus.plateNumber} - {bus.busType} ({bus.capacity} seats)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Driver
                  </label>
                  <select
                    value={scheduleForm.driver.id}
                    onChange={(e) => setScheduleForm({
                      ...scheduleForm,
                      driver: { id: e.target.value }
                    })}
                    className="input w-full"
                    required
                  >
                    <option value="">Select driver</option>
                    {drivers.filter(driver => driver.status === 'ACTIVE').map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.firstName} {driver.lastName} - {driver.licenseNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.departureDate}
                    onChange={(e) => setScheduleForm({
                      ...scheduleForm,
                      departureDate: e.target.value
                    })}
                    className="input w-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Time
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.departureTime}
                      onChange={(e) => setScheduleForm({
                        ...scheduleForm,
                        departureTime: e.target.value
                      })}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arrival Time
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.arrivalTime}
                      onChange={(e) => setScheduleForm({
                        ...scheduleForm,
                        arrivalTime: e.target.value
                      })}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingSchedule ? 'Update' : 'Create'}
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

export default ScheduleManagement