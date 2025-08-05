import React, { useRef, useEffect, useState } from 'react'
import { Camera, X, RotateCcw } from 'lucide-react'
import QrScanner from 'qr-scanner'

const QRCodeScanner = ({ onScan, onClose, isOpen }) => {
  const videoRef = useRef(null)
  const [qrScanner, setQrScanner] = useState(null)
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [facingMode, setFacingMode] = useState('environment') // 'user' for front camera, 'environment' for back camera

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen, facingMode])

  const startCamera = async () => {
    try {
      setError(null)
      setScanning(true)

      if (videoRef.current) {
        const scanner = new QrScanner(
          videoRef.current,
          (result) => {
            console.log('QR Code detected:', result.data)
            onScan(result.data)
            setScanning(false)
          },
          {
            onDecodeError: (error) => {
              // Ignore decode errors - they're normal when no QR code is visible
              console.debug('QR decode error (normal):', error)
            },
            preferredCamera: facingMode,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 5,
          }
        )

        await scanner.start()
        setQrScanner(scanner)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera. Please ensure camera permissions are granted and try again.')
      setScanning(false)
    }
  }

  const stopCamera = () => {
    if (qrScanner) {
      qrScanner.stop()
      qrScanner.destroy()
      setQrScanner(null)
    }
    setScanning(false)
  }

  const switchCamera = () => {
    stopCamera()
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const handleManualInput = () => {
    const qrData = prompt('Enter QR code data manually:')
    if (qrData && qrData.trim()) {
      onScan(qrData.trim())
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Scan QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-y-3">
              <button
                onClick={startCamera}
                className="btn-primary w-full"
              >
                <Camera className="h-4 w-4 mr-2" />
                Try Again
              </button>
              <button
                onClick={handleManualInput}
                className="btn-outline w-full"
              >
                Enter Manually
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Camera View */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                  {scanning ? (
                    <div className="text-white text-center">
                      <div className="loading-spinner mx-auto mb-2"></div>
                      <p className="text-sm">Scanning for QR code...</p>
                    </div>
                  ) : (
                    <div className="text-white text-center">
                      <Camera className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Position QR code here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex space-x-3">
              <div className="flex-1 text-center">
                <p className="text-sm text-gray-600">
                  {scanning ? 'Scanning for QR code...' : 'Camera is ready'}
                </p>
              </div>
              
              <button
                onClick={switchCamera}
                className="btn-outline px-3"
                title="Switch Camera"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={handleManualInput}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Can't scan? Enter manually
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Scanning Tips:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Hold the camera steady</li>
                <li>• Ensure good lighting</li>
                <li>• Position QR code within the frame</li>
                <li>• Keep the QR code flat and unobstructed</li>
                <li>• QR code will be detected automatically</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRCodeScanner