import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useSearchParams, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { WebSocketProvider } from './components/WebSocketProvider'
import Layout from './components/Layout'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ChangePassword from './pages/auth/ChangePassword'
import Unauthorized from './pages/Unauthorized'
import FindBooking from './pages/FindBooking'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ProvinceManagement from './pages/admin/ProvinceManagement'
import DistrictManagement from './pages/admin/DistrictManagement'
import RouteManagement from './pages/admin/RouteManagement'
import AgencyManagement from './pages/admin/AgencyManagement'
import AdminBookings from './pages/admin/AdminBookings'
import AdminPayments from './pages/admin/AdminPayments'

// Agency pages
import AgencyDashboard from './pages/agency/AgencyDashboard'
import AgencyProfile from './pages/agency/AgencyProfile'
import BranchOfficeManagement from './pages/agency/BranchOfficeManagement'
import AgentManagement from './pages/agency/AgentManagement'
import AgencyBookingHistory from './pages/agency/AgencyBookingHistory'
import BranchManagerManagement from './pages/agency/BranchManagerManagement'
import BusManagement from './pages/agency/BusManagement'
import DriverManagement from './pages/agency/DriverManagement'
import ScheduleManagement from './pages/agency/ScheduleManagement'
import AgencyRouteManagement from './pages/agency/AgencyRouteManagement'

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard'
import BookingManagement from './pages/customer/BookingManagement'
import SearchSchedules from './pages/customer/SearchSchedules'
import GuestBooking from './pages/customer/GuestBooking'
import CustomerProfile from './pages/customer/CustomerProfile'
import Pay from './pages/customer/Pay'

// Branch Manager pages
import BranchManagerDashboard from './pages/branch_manager/BranchManagerDashboard'
import BranchManagerAgentManagement from './pages/branch_manager/BranchManagerAgentManagement'
import BranchManagerScheduleManagement from './pages/branch_manager/BranchManagerScheduleManagement'
import BranchManagerReports from './pages/branch_manager/BranchManagerReports'

// Agent pages
import AgentDashboard from './pages/agent/AgentDashboard'
import AgentBookingManagement from './pages/agent/AgentBookingManagement'
import AgentProfile from './pages/agent/AgentProfile'
import AgentReports from './pages/agent/AgentReports'

// Driver pages
import DriverDashboard from './pages/driver/DriverDashboard'
import DriverSchedules from './pages/driver/DriverSchedules'
import DriverTicketVerification from './pages/driver/DriverTicketVerification'
import DriverProfile from './pages/driver/DriverProfile'
import api from './services/api'

// Payment success page
const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const ref = searchParams.get('ref')
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const [lastBooking, setLastBooking] = useState(null)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const hasToken = !!localStorage.getItem('token')

  useEffect(() => {
    let isMounted = true
    // Load last booking from localStorage for guests returning from redirect
    try {
      const lb = JSON.parse(localStorage.getItem('lastBooking') || 'null')
      if (lb) setLastBooking(lb)
    } catch {}
    const confirmAndFetch = async () => {
      try {
        // Attempt server-side confirmation without webhook
        if (sessionId && ref) {
          await api.post(`/payments/confirm/stripe?session_id=${encodeURIComponent(sessionId)}&ref=${encodeURIComponent(ref)}`)
        }
        if (ref) {
          const res = await api.get(`/payments/status/${ref}`)
          if (isMounted) setStatus(res.data)
        }
      } catch (e) {
        if (isMounted) setError('Failed to finalize payment. If you were charged, your ticket will appear once processed.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    confirmAndFetch()
    return () => { isMounted = false }
  }, [sessionId, ref])

  // Auto-confirm booking for guests once payment is successful
  useEffect(() => {
    const autoConfirm = async () => {
      if (!loading && status && (status.successful || status.status === 'SUCCESS') && lastBooking?.id && !bookingConfirmed) {
        try {
          await api.put(`/bookings/${lastBooking.id}/confirm`)
          setBookingConfirmed(true)
          toast.success('Booking confirmed')
        } catch (e) {
          // If backend requires auth, this may fail; in that case rely on ticket download outcome
          console.warn('Auto confirmation failed:', e?.response?.data || e?.message)
        }
      }
    }
    autoConfirm()
  }, [loading, status, lastBooking, bookingConfirmed])

  const handleDownloadTicket = async () => {
    if (!lastBooking?.id) return
    try {
      const response = await fetch(`http://localhost:8080/api/tickets/download/${lastBooking.id}`)
      if (!response.ok) throw new Error('Failed to download ticket')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `ticket_${lastBooking.bookingReference}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Ticket downloaded successfully')
    } catch (e) {
      toast.error('Failed to download ticket')
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700 mb-2">Thank you. Your payment was processed by Stripe.</p>
        <div className="text-sm text-gray-600 space-y-1 mb-4">
          {ref && <p><strong>Reference:</strong> {ref}</p>}
        </div>
        {loading ? (
          <p className="text-gray-600">Finalizing your payment...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : status ? (
          <div className="space-y-2">
            <p className="text-green-700"><strong>Status:</strong> {status.successful ? 'PAID' : status.status}</p>
            <p><strong>Amount:</strong> {status.amount} {status.currency}</p>
            {bookingConfirmed && (
              <p className="text-green-700"><strong>Booking:</strong> CONFIRMED</p>
            )}
          </div>
        ) : (
          <p className="text-gray-600">Payment status verification not available.</p>
        )}
        {lastBooking && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-gray-900 mb-2">Your Booking</h2>
            <p className="text-sm text-blue-800">
              Booking Reference: <span className="font-mono">{lastBooking.bookingReference}</span>
            </p>
            <div className="mt-3 flex space-x-3">
              <button onClick={handleDownloadTicket} className="btn-primary px-4 py-2 rounded">Download Ticket</button>
              <button onClick={() => { navigator.clipboard.writeText(lastBooking.bookingReference); toast.success('Reference copied'); }} className="btn-outline px-4 py-2 rounded">Copy Reference</button>
            </div>
            <p className="text-xs text-blue-800 mt-3">
              Keep this reference safe. You can always retrieve your ticket on the Find Booking page using this reference and your contact information.
            </p>
            {!bookingConfirmed && (
              <p className="text-xs text-blue-800 mt-2">If your download fails, please wait a few seconds and refresh this page. The system is confirming your booking automatically.</p>
            )}
          </div>
        )}
        <div className="mt-6 flex space-x-3">
          <Link to="/" className="btn-primary px-4 py-2 rounded">Go Home</Link>
          {hasToken ? (
            <Link to="/customer/bookings" className="btn-outline px-4 py-2 rounded">My Bookings</Link>
          ) : (
            <Link to="/find-booking" className="btn-outline px-4 py-2 rounded">Find Booking</Link>
          )}
        </div>
      </div>
    </div>
  )
}

// Payment cancel page
const PaymentCancel = () => {
  const [searchParams] = useSearchParams()
  const ref = searchParams.get('ref')
  return (
    <div className="max-w-2xl mx-auto py-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700 mb-2">Your payment was cancelled before completion.</p>
        {ref && <p className="text-sm text-gray-600"><strong>Reference:</strong> {ref}</p>}
        <div className="mt-6 flex space-x-3">
          <Link to="/" className="btn-primary px-4 py-2 rounded">Go Home</Link>
          <Link to="/customer/bookings" className="btn-outline px-4 py-2 rounded">My Bookings</Link>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Layout>
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register/:role" element={<Register />} />
              <Route path="/guest-booking" element={<GuestBooking />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/find-booking" element={<FindBooking />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/provinces" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <ProvinceManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/districts" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <DistrictManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/routes" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <RouteManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/agencies" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <AgencyManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/bookings" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <AdminBookings />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/payments" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <AdminPayments />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Agency Routes */}
              <Route path="/agency" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <DashboardLayout>
                    <AgencyDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/agency/profile" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <DashboardLayout>
                    <AgencyProfile />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/agency/branch-offices" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <DashboardLayout>
                    <BranchOfficeManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/agency/agents" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <DashboardLayout>
                    <AgentManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/agency/branch-managers" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <DashboardLayout>
                    <BranchManagerManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/agency/booking-history" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <DashboardLayout>
                    <AgencyBookingHistory />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/agency/buses" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <DashboardLayout>
                    <BusManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/agency/drivers" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <DashboardLayout>
                    <DriverManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/agency/routes" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <DashboardLayout>
                    <AgencyRouteManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/agency/schedules" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <DashboardLayout>
                    <ScheduleManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Branch Manager Routes */}
              <Route path="/branch-manager" element={
                <ProtectedRoute requiredRole="BRANCH_MANAGER">
                  <DashboardLayout>
                    <BranchManagerDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/branch-manager/agents" element={
                <ProtectedRoute requiredRole="BRANCH_MANAGER">
                  <DashboardLayout>
                    <BranchManagerAgentManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/branch-manager/schedules" element={
                <ProtectedRoute requiredRole="BRANCH_MANAGER">
                  <DashboardLayout>
                    <BranchManagerScheduleManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/branch-manager/reports" element={
                <ProtectedRoute requiredRole="BRANCH_MANAGER">
                  <DashboardLayout>
                    <BranchManagerReports />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Agent Routes */}
              <Route path="/agent" element={
                <ProtectedRoute requiredRole="AGENT">
                  <DashboardLayout>
                    <AgentDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/agent/bookings" element={
                <ProtectedRoute requiredRole="AGENT">
                  <DashboardLayout>
                    <AgentBookingManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/agent/profile" element={
                <ProtectedRoute requiredRole="AGENT">
                  <DashboardLayout>
                    <AgentProfile />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/agent/reports" element={
                <ProtectedRoute requiredRole="AGENT">
                  <DashboardLayout>
                    <AgentReports />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Driver Routes */}
              <Route path="/driver" element={
                <ProtectedRoute requiredRole="DRIVER">
                  <DashboardLayout>
                    <DriverDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/driver/schedules" element={
                <ProtectedRoute requiredRole="DRIVER">
                  <DashboardLayout>
                    <DriverSchedules />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/driver/verification" element={
                <ProtectedRoute requiredRole="DRIVER">
                  <DashboardLayout>
                    <DriverTicketVerification />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/driver/profile" element={
                <ProtectedRoute requiredRole="DRIVER">
                  <DashboardLayout>
                    <DriverProfile />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Customer Routes */}
              <Route path="/customer" element={
                <ProtectedRoute requiredRole="CUSTOMER">
                  <DashboardLayout>
                    <CustomerDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/customer/search" element={
                <ProtectedRoute requiredRole="CUSTOMER">
                  <DashboardLayout>
                    <SearchSchedules />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/customer/bookings" element={
                <ProtectedRoute requiredRole="CUSTOMER">
                  <DashboardLayout>
                    <BookingManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/customer/pay" element={
                <ProtectedRoute requiredRole="CUSTOMER">
                  <DashboardLayout>
                    <Pay />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/customer/profile" element={
                <ProtectedRoute requiredRole="CUSTOMER">
                  <DashboardLayout>
                    <CustomerProfile />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Auth Routes */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/change-password" element={<ChangePassword />} />
              </Routes>
            </Layout>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  )
}

export default App