import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, LogIn, Bus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  useEffect(() => {
    // Prevent access to login page when already authenticated
    if (isAuthenticated()) {
      switch (user?.role) {
        case 'ADMIN':
          navigate('/admin', { replace: true });
          break;
        case 'AGENCY':
          navigate('/agency', { replace: true });
          break;
        case 'BRANCH_MANAGER':
          navigate('/branch-manager', { replace: true });
          break;
        case 'DRIVER':
          navigate('/driver', { replace: true });
          break;
        case 'CUSTOMER':
          navigate('/customer', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate])

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      console.log('Attempting login with:', { email: data.email, password: '***' })
      
      const response = await authAPI.login(data)
      console.log('Login response received:', response.data)
      
      if (response.data && response.data.success && response.data.data) {
        const { token, ...userData } = response.data.data

        console.log('Login successful, user data:', userData)
        login(userData, token)
        toast.success('Login successful!')

        // Redirect based on role
        switch (userData.role) {
          case 'ADMIN':
            navigate('/admin')
            break
          case 'AGENCY':
            navigate('/agency')
            break
          case 'BRANCH_MANAGER':
            navigate('/branch-manager')
            break
          case 'DRIVER':
            navigate('/driver')
            break
          case 'CUSTOMER':
            navigate('/customer')
            break
          default:
            navigate('/')
        }
      } else {
        console.error('Invalid response structure:', response.data)
        toast.error('Login failed. Invalid response from server.')
      }
    } catch (error) {
      console.error('Login error:', error)
      let errorMessage = 'Login failed. Please check your credentials.'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Bus className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to Inzira
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your account to manage bookings and more
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="input w-full"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 3,
                      message: 'Password must be at least 3 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input w-full pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="loading-spinner mr-2"></div>
              ) : (
                <LogIn className="h-4 w-4 mr-2" />
              )}
              Sign In
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                to="/register/customer"
                className="btn-outline w-full text-center col-span-2"
              >
                Register as Customer
              </Link>
          
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h4>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>Admin:</strong> admin@inzira.com / password123</p>
              <p><strong>Customer:</strong> customer@inzira.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login