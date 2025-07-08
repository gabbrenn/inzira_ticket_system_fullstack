import React, { useState, useEffect } from 'react'
import { Save, Upload, User, Mail, Phone, MapPin, Building2 } from 'lucide-react'
import { agencyAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const AgencyProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const { user } = useAuth()

  const [profileForm, setProfileForm] = useState({
    agencyName: '',
    phoneNumber: '',
    address: '',
    status: 'ACTIVE'
  })

  useEffect(() => {
    if (user?.roleEntityId) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await agencyAPI.getProfile(user.roleEntityId)
      const profileData = response.data.data
      setProfile(profileData)
      setProfileForm({
        agencyName: profileData.agencyName,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address,
        status: profileData.status
      })
    } catch (error) {
      toast.error('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      setUpdating(true)
      const formData = new FormData()
      
      // Create a JSON blob for the agency data
      const agencyBlob = new Blob([JSON.stringify(profileForm)], {
        type: 'application/json'
      })
      formData.append('agency', agencyBlob)
      
      // Add logo file if selected
      if (logoFile) {
        formData.append('logo', logoFile)
      }

      const response = await agencyAPI.updateProfile(user.roleEntityId, formData)
      const updatedProfile = response.data.data
      setProfile(updatedProfile)
      setLogoFile(null)
      setLogoPreview(null)
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
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agency Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your agency information and settings
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Logo Section */}
              <div className="lg:col-span-1">
                <div className="text-center">
                  <div className="mb-4">
                    {logoPreview || profile?.logoPath ? (
                      <img
                        src={logoPreview || profile?.logoPath}
                        alt="Agency Logo"
                        className="w-32 h-32 rounded-lg object-cover mx-auto border border-gray-200"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center mx-auto border border-gray-200">
                        <Building2 className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="logo-upload" className="btn-secondary cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Change Logo
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG up to 2MB
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Agency Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.agencyName}
                    onChange={(e) => setProfileForm({ ...profileForm, agencyName: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    className="input w-full bg-gray-50"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed. Contact admin if needed.
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Address
                  </label>
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
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
                    value={profileForm.status}
                    onChange={(e) => setProfileForm({ ...profileForm, status: e.target.value })}
                    className="input w-full"
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
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

        {/* Profile Stats */}
        {profile && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {new Date(profile.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgencyProfile