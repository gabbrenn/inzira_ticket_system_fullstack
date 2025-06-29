import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Shield className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="btn-primary w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Home
          </Link>
          
          <Link
            to="/login"
            className="btn-outline w-full"
          >
            Login with Different Account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized