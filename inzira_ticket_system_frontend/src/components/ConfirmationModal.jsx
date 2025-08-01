import React from 'react'
import { AlertTriangle, CheckCircle, X } from 'lucide-react'

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'danger':
        return <AlertTriangle className="h-6 w-6 text-red-600" />
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700'
      case 'danger':
        return 'bg-red-600 hover:bg-red-700'
      default:
        return 'bg-yellow-600 hover:bg-yellow-700'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center mb-4">
          {getIcon()}
          <h3 className="text-lg font-semibold text-gray-900 ml-3">{title}</h3>
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-white rounded-md font-medium ${getButtonColor()}`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal