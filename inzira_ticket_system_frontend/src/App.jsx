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
import BusManagement from './pages/agency/BusManagement'
import DriverManagement from './pages/agency/DriverManagement'
import ScheduleManagement from './pages/agency/ScheduleManagement'
import AgencyRouteManagement from './pages/agency/AgencyRouteManagement'

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard'
import BookingManagement from './pages/customer/BookingManagement'
import SearchSchedules from './pages/customer/SearchSchedules'

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