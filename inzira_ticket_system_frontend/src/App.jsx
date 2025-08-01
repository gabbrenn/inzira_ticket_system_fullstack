import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
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

function App() {
  return (
    <AuthProvider>
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
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/districts" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DistrictManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/routes" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <RouteManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/agencies" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AgencyManagement />
                </ProtectedRoute>
              } />
              
              {/* Agency Routes */}
              <Route path="/agency" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <AgencyDashboard />
                </ProtectedRoute>
              } />
              <Route path="/agency/profile" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <AgencyProfile />
                </ProtectedRoute>
              } />
              <Route path="/agency/branch-offices" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <BranchOfficeManagement />
                </ProtectedRoute>
              } />
              <Route path="/agency/agents" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <AgentManagement />
                </ProtectedRoute>
              } />
              <Route path="/agency/branch-managers" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <BranchManagerManagement />
                </ProtectedRoute>
              } />
              <Route path="/agency/booking-history" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <AgencyBookingHistory />
                </ProtectedRoute>
              } />
              <Route path="/agency/buses" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <BusManagement />
                </ProtectedRoute>
              } />
              <Route path="/agency/drivers" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <DriverManagement />
                </ProtectedRoute>
              } />
              <Route path="/agency/routes" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <AgencyRouteManagement />
                </ProtectedRoute>
              } />
              <Route path="/agency/schedules" element={
                <ProtectedRoute requiredRole="AGENCY">
                  <ScheduleManagement />
                </ProtectedRoute>
              } />
              
              {/* Branch Manager Routes */}
              <Route path="/branch-manager" element={
                <ProtectedRoute requiredRole="BRANCH_MANAGER">
                  <BranchManagerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/branch-manager/agents" element={
                <ProtectedRoute requiredRole="BRANCH_MANAGER">
                  <BranchManagerAgentManagement />
                </ProtectedRoute>
              } />
              <Route path="/branch-manager/schedules" element={
                <ProtectedRoute requiredRole="BRANCH_MANAGER">
                  <BranchManagerScheduleManagement />
                </ProtectedRoute>
              } />
              <Route path="/branch-manager/reports" element={
                <ProtectedRoute requiredRole="BRANCH_MANAGER">
                  <BranchManagerReports />
                </ProtectedRoute>
              } />
              
              {/* Agent Routes */}
              <Route path="/agent" element={
                <ProtectedRoute requiredRole="AGENT">
                  <AgentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/agent/bookings" element={
                <ProtectedRoute requiredRole="AGENT">
                  <AgentBookingManagement />
                </ProtectedRoute>
              } />
              <Route path="/agent/profile" element={
                <ProtectedRoute requiredRole="AGENT">
                  <AgentProfile />
                </ProtectedRoute>
              } />
              <Route path="/agent/reports" element={
                <ProtectedRoute requiredRole="AGENT">
                  <AgentReports />
                </ProtectedRoute>
              } />
              
              {/* Customer Routes */}
              <Route path="/customer" element={
                <ProtectedRoute requiredRole="CUSTOMER">
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/customer/search" element={
                <ProtectedRoute requiredRole="CUSTOMER">
                  <SearchSchedules />
                </ProtectedRoute>
              } />
              <Route path="/customer/bookings" element={
                <ProtectedRoute requiredRole="CUSTOMER">
                  <BookingManagement />
                </ProtectedRoute>
              } />
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
    </AuthProvider>
  )
}

export default App