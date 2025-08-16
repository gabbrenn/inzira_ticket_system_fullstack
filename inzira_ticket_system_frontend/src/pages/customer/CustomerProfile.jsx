import React, { useState, useEffect } from 'react'
import { Save, User, Mail, Phone, CreditCard, Building2, Users, Key } from 'lucide-react'
import {Link} from 'react-router-dom'
import { customerAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const CustomerProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const { user } = useAuth()

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  })

  useEffect(() => {
    if (user?.roleEntityId) {
      fetchProfile()
    }
  }, [user])
  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await customerAPI.getCustomer(user.roleEntityId)
      const profileData = response.data.data
      setProfile(profileData)
      setProfileForm({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber
      })
    } catch (error) {
      toast.error('Failed to fetch profile')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      setUpdating(true)
      const response = await customerAPI.updateCustomer(user.roleEntityId, profileForm)
      const updatedProfile = response.data.data
      setProfile(updatedProfile)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 fade-in">
        <div className="text-center py-8">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your customer profile information
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Picture Section */}
              <div className="lg:col-span-1">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center mx-auto border border-gray-200">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {profile?.firstName} {profile?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">Customer</p>
                    <div className="mt-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        profile?.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {profile?.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="lg:col-span-1 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
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
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="input w-full bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed. Contact your agency if needed.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary"
                >
                  {updating ? (
                    <div className="loading-spinner mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Update Profile
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Work Information */}
        {profile && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="">
            <div className="flex justify-end">
                <Link
                  to="/change-password"
                  disabled={updating}
                  className=" bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-md px-4 py-2 inline-flex items-center"
                >
                  {updating ? (
                    <div className="loading-spinner mr-2"></div>
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  Change Password
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Joined Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    profile.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerProfile