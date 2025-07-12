import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Users, Save, X, Key, Building2, CheckCircle, Clock } from 'lucide-react'
import { branchManagerAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const BranchManagerAgentManagement = () => {
  const [agents, setAgents] = useState([])
  const [branchOffice, setBranchOffice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingAgent, setEditingAgent] = useState(null)
  const [showPassword, setShowPassword] = useState({})
  const { user } = useAuth()

  const [agentForm, setAgentForm] = useState({
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
      fetchBranchManagerInfo()
      fetchAgents()
    }
  }, [user])

  const fetchBranchManagerInfo = async () => {
    try {
      const response = await branchManagerAPI.getBranchManager(user.roleEntityId)
      const branchManagerData = response.data.data
      setBranchOffice(branchManagerData.branchOffice)
      
      // Set default values for agent form
      setAgentForm(prev => ({
        ...prev,
        agency: { id: branchManagerData.agency.id },
        branchOffice: { id: branchManagerData.branchOffice.id }
      }))
    } catch (error) {
      toast.error('Failed to fetch branch manager information')
    }
  }

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const response = await branchManagerAPI.getAgentsByBranchManager(user.roleEntityId)
      setAgents(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch agents')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAgent = async (e) => {
    e.preventDefault()
    try {
      await branchManagerAPI.createAgent(agentForm)
      toast.success('Agent created successfully. Waiting for agency confirmation.')
      resetForm()
      fetchAgents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create agent')
    }
  }

  const handleUpdateAgent = async (e) => {
    e.preventDefault()
    try {
      await branchManagerAPI.updateAgent(editingAgent.id, agentForm)
      toast.success('Agent updated successfully')
      resetForm()
      fetchAgents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update agent')
    }
  }

  const handleDeleteAgent = async (id) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await branchManagerAPI.deleteAgent(id)
        toast.success('Agent deleted successfully')
        fetchAgents()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete agent')
      }
    }
  }

  const handleResetPassword = async (id) => {
    if (window.confirm('Are you sure you want to reset this agent\'s password?')) {
      try {
        const response = await branchManagerAPI.resetAgentPassword(id)
        const newPassword = response.data.data
        setShowPassword(prev => ({ ...prev, [id]: newPassword }))
        toast.success('Password reset successfully')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to reset password')
      }
    }
  }

  const startEditAgent = (agent) => {
    setEditingAgent(agent)
    setAgentForm({
      firstName: agent.firstName,
      lastName: agent.lastName,
      email: agent.email,
      phoneNumber: agent.phoneNumber,
      status: agent.status,
      agency: { id: agent.agency.id.toString() },
      branchOffice: { id: agent.branchOffice.id.toString() }
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setAgentForm({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      status: 'ACTIVE',
      agency: { id: branchOffice?.agency?.id || '' },
      branchOffice: { id: branchOffice?.id || '' }
    })
    setShowForm(false)
    setEditingAgent(null)
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

  const getConfirmationBadge = (confirmed) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    if (confirmed) {
      return `${baseClasses} bg-green-100 text-green-800`
    } else {
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
        <p className="mt-2 text-gray-600">
          Manage agents in your branch office
        </p>
        {branchOffice && (
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">{branchOffice.officeName}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Branch Agents</h2>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto"></div>
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No agents found. Add your first agent to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <div key={agent.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {agent.firstName} {agent.lastName}
                      </h3>
                      <div className="space-y-1">
                        <span className={getStatusBadge(agent.status)}>
                          {agent.status}
                        </span>
                        <div className="flex items-center">
                          {agent.confirmedByAgency ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          <span className={getConfirmationBadge(agent.confirmedByAgency)}>
                            {agent.confirmedByAgency ? 'Confirmed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><strong>Email:</strong> {agent.email}</p>
                    <p><strong>Phone:</strong> {agent.phoneNumber}</p>
                    <p><strong>Joined:</strong> {new Date(agent.createdAt).toLocaleDateString()}</p>
                  </div>

                  {showPassword[agent.id] && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">New Password:</p>
                      <p className="text-sm text-yellow-700 font-mono">{showPassword[agent.id]}</p>
                      <button
                        onClick={() => setShowPassword(prev => ({ ...prev, [agent.id]: null }))}
                        className="text-xs text-yellow-600 hover:text-yellow-800 mt-1"
                      >
                        Hide
                      </button>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditAgent(agent)}
                      className="flex-1 btn-secondary text-sm py-2"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleResetPassword(agent.id)}
                      className="flex-1 btn-outline text-sm py-2"
                    >
                      <Key className="h-3 w-3 mr-1" />
                      Reset
                    </button>
                    <button
                      onClick={() => handleDeleteAgent(agent.id)}
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

      {/* Agent Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingAgent ? 'Edit Agent' : 'Add New Agent'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingAgent ? handleUpdateAgent : handleCreateAgent}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={agentForm.firstName}
                      onChange={(e) => setAgentForm({ ...agentForm, firstName: e.target.value })}
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
                      value={agentForm.lastName}
                      onChange={(e) => setAgentForm({ ...agentForm, lastName: e.target.value })}
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
                    value={agentForm.email}
                    onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                    className="input w-full"
                    required
                    disabled={editingAgent} // Email shouldn't be editable
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={agentForm.phoneNumber}
                    onChange={(e) => setAgentForm({ ...agentForm, phoneNumber: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={agentForm.status}
                    onChange={(e) => setAgentForm({ ...agentForm, status: e.target.value })}
                    className="input w-full"
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                {!editingAgent && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> New agents will need to be confirmed by the agency before they can start working.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingAgent ? 'Update' : 'Create'}
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

export default BranchManagerAgentManagement