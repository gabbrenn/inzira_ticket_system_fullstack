import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Home from './pages/Home'
import AdminDashboard from './pages/admin/AdminDashboard'
import AgencyDashboard from './pages/agency/AgencyDashboard'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import DistrictManagement from './pages/admin/DistrictManagement'
import RouteManagement from './pages/admin/RouteManagement'
import AgencyManagement from './pages/admin/AgencyManagement'
import BusManagement from './pages/agency/BusManagement'
import DriverManagement from './pages/agency/DriverManagement'
import ScheduleManagement from './pages/agency/ScheduleManagement'
import AgencyRouteManagement from './pages/agency/AgencyRouteManagement'
import BookingManagement from './pages/customer/BookingManagement'
import SearchSchedules from './pages/customer/SearchSchedules'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/districts" element={<DistrictManagement />} />
            <Route path="/admin/routes" element={<RouteManagement />} />
            <Route path="/admin/agencies" element={<AgencyManagement />} />
            
            {/* Agency Routes */}
            <Route path="/agency" element={<AgencyDashboard />} />
            <Route path="/agency/buses" element={<BusManagement />} />
            <Route path="/agency/drivers" element={<DriverManagement />} />
            <Route path="/agency/routes" element={<AgencyRouteManagement />} />
            <Route path="/agency/schedules" element={<ScheduleManagement />} />
            
            {/* Customer Routes */}
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/customer/search" element={<SearchSchedules />} />
            <Route path="/customer/bookings" element={<BookingManagement />} />
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
  )
}

export default App