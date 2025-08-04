import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
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

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import DistrictManagement from './pages/admin/DistrictManagement'
import RouteManagement from './pages/admin/RouteManagement'
import AgencyManagement from './pages/admin/AgencyManagement'

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
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardLayout>
                    <AdminDashboard />
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