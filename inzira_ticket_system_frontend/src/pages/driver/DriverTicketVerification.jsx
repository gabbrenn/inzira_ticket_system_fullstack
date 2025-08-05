import React, { useState, useEffect } from 'react'
import { QrCode, Search, CheckCircle, XCircle, AlertTriangle, User, Phone, MapPin, Calendar, Clock, Camera } from 'lucide-react'
import { driverAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import QRCodeScanner from '../../components/QRCodeScanner'
import toast from 'react-hot-toast'

const DriverTicketVerification = () => {
  const [verificationMethod, setVerificationMethod] = useState('reference') // 'reference' or 'qr'
  const [bookingReference, setBookingReference] = useState('')
  const [qrData, setQrData] = useState('')
  const [verificationResult, setVerificationResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recentVerifications, setRecentVerifications] = useState([])
  const [showQRScanner, setShowQRScanner] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    // Load recent verifications from localStorage
    const saved = localStorage.getItem(`driver_verifications_${user?.roleEntityId}`)
    if (saved) {
      try {
        setRecentVerifications(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load recent verifications:', error)
      }
    }
  }, [user])

  const saveVerificationToHistory = (result) => {
    const verification = {
      ...result,
      timestamp: new Date().toISOString(),
      id: Date.now()
    }
    
    const updated = [verification, ...recentVerifications.slice(0, 9)] // Keep last 10
    setRecentVerifications(updated)
    localStorage.setItem(`driver_verifications_${user?.roleEntityId}`, JSON.stringify(updated))
  }

  const handleVerifyByReference = async (e) => {
    e.preventDefault()
    if (!bookingReference.trim()) {
      toast.error('Please enter a booking reference')
      return
    }

    try {
      setLoading(true)
      const response = await driverAPI.verifyTicketByReference({
        driverId: user.roleEntityId,
        bookingReference: bookingReference.trim().toUpperCase()
      })
      
      const result = response.data.data
      setVerificationResult(result)
      saveVerificationToHistory(result)
      
      if (result.valid) {
        toast.success('Ticket verified successfully!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify ticket')
      setVerificationResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyByQR = async (e) => {
    e.preventDefault()
    if (!qrData.trim()) {
      toast.error('Please enter QR code data')
      return
    }

    try {
      setLoading(true)
      const response = await driverAPI.verifyTicketByQR({
        driverId: user.roleEntityId,
        qrData: qrData.trim()
      })
      
      const result = response.data.data
      setVerificationResult(result)
      saveVerificationToHistory(result)
      
      if (result.valid) {
        toast.success('Ticket verified successfully!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify ticket')
      setVerificationResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleQRScan = async (qrData) => {
    setShowQRScanner(false)
    setQrData(qrData)
    
    // Automatically verify the scanned QR code
    try {
      setLoading(true)
      const response = await driverAPI.verifyTicketByQR({
        driverId: user.roleEntityId,
        qrData: qrData.trim()
      })
      
      const result = response.data.data
      setVerificationResult(result)
      saveVerificationToHistory(result)
      
      if (result.valid) {
        toast.success('Ticket verified successfully!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify ticket')
      setVerificationResult(null)
    } finally {
      setLoading(false)
    }
  }

  const clearForm = () => {
    setBookingReference('')
    setQrData('')
    setVerificationResult(null)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VALID':
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case 'ALREADY_USED':
        return <AlertTriangle className="h-8 w-8 text-yellow-600" />
      default:
        return <XCircle className="h-8 w-8 text-red-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'VALID':
        return 'border-green-200 bg-green-50'
      case 'ALREADY_USED':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-red-200 bg-red-50'
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ticket Verification</h1>
        <p className="mt-2 text-gray-600">
          Verify passenger tickets by scanning QR codes or entering booking references
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verification Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Verify Ticket</h2>
              
              {/* Verification Method Selector */}
              <div className="flex space-x-4 mb-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="reference"
                    checked={verificationMethod === 'reference'}
                    onChange={(e) => setVerificationMethod(e.target.value)}
                    className="mr-2"
                  />
                  <Search className="h-4 w-4 mr-1" />
                  Booking Reference
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="qr"
                    checked={verificationMethod === 'qr'}
                    onChange={(e) => setVerificationMethod(e.target.value)}
                    className="mr-2"
                  />
                  <QrCode className="h-4 w-4 mr-1" />
                  QR Code
                </label>
              </div>

              {/* Reference Verification Form */}
              {verificationMethod === 'reference' && (
                <form onSubmit={handleVerifyByReference} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Reference Number
                    </label>
                    <input
                      type="text"
                      value={bookingReference}
                      onChange={(e) => setBookingReference(e.target.value.toUpperCase())}
                      className="input w-full"
                      placeholder="Enter booking reference (e.g., BK20241201123456ABCD)"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1"
                    >
                      {loading ? (
                        <div className="loading-spinner mr-2"></div>
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Verify Ticket
                    </button>
                    <button
                      type="button"
                      onClick={clearForm}
                      className="btn-secondary"
                    >
                      Clear
                    </button>
                  </div>
                </form>
              )}

              {/* QR Code Verification Form */}
              {verificationMethod === 'qr' && (
                <div className="space-y-4">
                  {/* Camera Scan Button */}
                  <div className="text-center">
                    <button
                      onClick={() => setShowQRScanner(true)}
                      className="btn-primary w-full mb-4"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Scan QR Code with Camera
                    </button>
                    <p className="text-sm text-gray-500 mb-4">
                      Use your device's camera to scan the QR code on the ticket
                    </p>
                  </div>

                  {/* Manual Input Option */}
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600 mb-3 text-center">
                      Or enter QR code data manually:
                    </p>
                    <form onSubmit={handleVerifyByQR}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          QR Code Data
                        </label>
                        <textarea
                          value={qrData}
                          onChange={(e) => setQrData(e.target.value)}
                          className="input w-full"
                          rows="3"
                          placeholder="Paste QR data here..."
                        />
                      </div>
                      <div className="flex space-x-3 mt-3">
                        <button
                          type="submit"
                          disabled={loading || !qrData.trim()}
                          className="btn-primary flex-1"
                        >
                          {loading ? (
                            <div className="loading-spinner mr-2"></div>
                          ) : (
                            <QrCode className="h-4 w-4 mr-2" />
                          )}
                          Verify QR Code
                        </button>
                        <button
                          type="button"
                          onClick={clearForm}
                          className="btn-secondary"
                        >
                          Clear
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* QR Code Scanner Modal */}
            <QRCodeScanner
              isOpen={showQRScanner}
              onScan={handleQRScan}
              onClose={() => setShowQRScanner(false)}
            />

            {/* Verification Result */}
            {verificationResult && (
              <div className={`mt-6 p-6 border rounded-lg ${getStatusColor(verificationResult.status)}`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getStatusIcon(verificationResult.status)}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {verificationResult.message}
                    </h3>
                    
                    {verificationResult.bookingReference && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Booking Reference:</span>
                            <div className="font-mono text-gray-900">{verificationResult.bookingReference}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Passenger:</span>
                            <div className="text-gray-900">{verificationResult.customerName}</div>
                          </div>
                          {verificationResult.customerPhone && (
                            <div>
                              <span className="font-medium text-gray-700">Phone:</span>
                              <div className="text-gray-900">{verificationResult.customerPhone}</div>
                            </div>
                          )}
                          {verificationResult.numberOfSeats && (
                            <div>
                              <span className="font-medium text-gray-700">Seats:</span>
                              <div className="text-gray-900">{verificationResult.numberOfSeats}</div>
                            </div>
                          )}
                          {verificationResult.totalAmount && (
                            <div>
                              <span className="font-medium text-gray-700">Amount:</span>
                              <div className="text-gray-900">{verificationResult.totalAmount} RWF</div>
                            </div>
                          )}
                          {verificationResult.routeInfo && (
                            <div>
                              <span className="font-medium text-gray-700">Route:</span>
                              <div className="text-gray-900">{verificationResult.routeInfo}</div>
                            </div>
                          )}
                          {verificationResult.pickupPointName && verificationResult.dropPointName && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700">Journey:</span>
                              <div className="text-gray-900">
                                {verificationResult.pickupPointName} → {verificationResult.dropPointName}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {verificationResult.verifiedAt && (
                          <div className="pt-3 border-t border-gray-200">
                            <span className="text-sm text-gray-600">
                              Verified at: {new Date(verificationResult.verifiedAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Verifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Verifications</h2>
            <button
              onClick={() => {
                setRecentVerifications([])
                localStorage.removeItem(`driver_verifications_${user?.roleEntityId}`)
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear History
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentVerifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent verifications</p>
              </div>
            ) : (
              recentVerifications.map((verification) => (
                <div key={verification.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {verification.bookingReference}
                    </div>
                    <div className="flex items-center">
                      {verification.valid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : verification.status === 'ALREADY_USED' ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="truncate mb-1">
                      {verification.customerName}
                    </div>
                    <div className="flex justify-between">
                      <span>{verification.status}</span>
                      <span>{formatTimestamp(verification.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Verification Instructions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Camera Scanning (Recommended):</h4>
            <ul className="space-y-1">
              <li>• Click "Scan QR Code with Camera"</li>
              <li>• Allow camera access when prompted</li>
              <li>• Point camera at the QR code on the ticket</li>
              <li>• Wait for automatic detection and verification</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Manual Methods:</h4>
            <ul className="space-y-1">
              <li>• Use booking reference if QR code is damaged</li>
              <li>• Enter QR data manually if camera fails</li>
              <li>• All methods provide the same verification result</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Security Note:</strong> You can only verify tickets for your own schedules and agency. 
            Each ticket can only be verified once. Camera scanning provides the fastest and most accurate verification.
          </p>
        </div>
      </div>

      {/* Verification Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {recentVerifications.filter(v => v.valid).length}
          </div>
          <div className="text-sm text-gray-600">Valid Tickets</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {recentVerifications.filter(v => v.status === 'ALREADY_USED').length}
          </div>
          <div className="text-sm text-gray-600">Already Used</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-red-600 mb-1">
            {recentVerifications.filter(v => !v.valid && v.status !== 'ALREADY_USED').length}
          </div>
          <div className="text-sm text-gray-600">Invalid Tickets</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {recentVerifications.length}
          </div>
          <div className="text-sm text-gray-600">Total Checked</div>
        </div>
      </div>
    </div>
  )
}

export default DriverTicketVerification