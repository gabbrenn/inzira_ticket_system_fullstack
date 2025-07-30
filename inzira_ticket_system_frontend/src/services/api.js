import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
}

// Shared APIs (accessible by multiple roles)
export const sharedAPI = {
  // Districts - accessible by all authenticated users
  getDistricts: () => api.get('/admin/districts'),
  getDistrict: (id) => api.get(`/admin/districts/${id}`),
  getRoutePoints: (districtId) => api.get(`/admin/districts/${districtId}/points`),
  
  // Routes - accessible by admin and agency
  getRoutes: () => api.get('/admin/routes'),
  getRoute: (id) => api.get(`/admin/routes/${id}`),
  
  // Schedules search - accessible by customers and agencies
  searchSchedules: (params) => api.get('/agency/schedules/search', { params }),
}

// Admin APIs
export const adminAPI = {
  // Admin registration
  registerAdmin: (data) => api.post('/admins/register', data),
  
  // District management
  createDistrict: (data) => api.post('/admin/districts', data),
  getDistricts: () => sharedAPI.getDistricts(),
  getDistrict: (id) => sharedAPI.getDistrict(id),
  updateDistrict: (id, data) => api.put(`/admin/districts/${id}`, data),
  deleteDistrict: (id) => api.delete(`/admin/districts/${id}`),
  
  // Route points
  addRoutePoint: (districtId, data) => api.post(`/admin/districts/${districtId}/points`, data),
  getRoutePoints: (districtId) => sharedAPI.getRoutePoints(districtId),
  updateRoutePoint: (districtId, pointId, data) => api.put(`/admin/districts/${districtId}/points/${pointId}`, data),
  deleteRoutePoint: (districtId, pointId) => api.delete(`/admin/districts/${districtId}/points/${pointId}`),
  
  // Route management
  createRoute: (data) => api.post('/admin/routes', data),
  getRoutes: () => sharedAPI.getRoutes(),
  getRoute: (id) => sharedAPI.getRoute(id),
  updateRoute: (id, data) => api.put(`/admin/routes/${id}`, data),
  deleteRoute: (id) => api.delete(`/admin/routes/${id}`),
  
  // Agency management
  createAgency: (formData) => {
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
    return api.post('/admin/agencies', formData, config)
  },
  getAgencies: () => api.get('/admin/agencies'),
  getAgency: (id) => api.get(`/admin/agencies/${id}`),
  updateAgency: (id, formData) => {
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
    return api.put(`/admin/agencies/${id}`, formData, config)
  },
  resetAgencyPassword: (id) => api.post(`/admin/agencies/${id}/reset-password`),
  deleteAgency: (id) => api.delete(`/admin/agencies/${id}`),
}

// Agency APIs
export const agencyAPI = {
  // Bus management
  createBus: (data) => api.post('/agency/buses', data),
  getBuses: () => api.get('/agency/buses'),
  getBus: (id) => api.get(`/agency/buses/${id}`),
  getBusesByAgency: (agencyId) => api.get(`/agency/buses/agency/${agencyId}`),
  getActiveBusesByAgency: (agencyId) => api.get(`/agency/buses/agency/${agencyId}/active`),
  updateBus: (id, data) => api.put(`/agency/buses/${id}`, data),
  deleteBus: (id) => api.delete(`/agency/buses/${id}`),
  
  // Driver management
  createDriver: (data) => api.post('/agency/drivers', data),
  getDrivers: () => api.get('/agency/drivers'),
  getDriver: (id) => api.get(`/agency/drivers/${id}`),
  getDriversByAgency: (agencyId) => api.get(`/agency/drivers/agency/${agencyId}`),
  getActiveDriversByAgency: (agencyId) => api.get(`/agency/drivers/agency/${agencyId}/active`),
  updateDriver: (id, data) => api.put(`/agency/drivers/${id}`, data),
  resetDriverPassword: (id) => api.post(`/agency/drivers/${id}/reset-password`),
  deleteDriver: (id) => api.delete(`/agency/drivers/${id}`),
  
  // Agency route management
  createAgencyRoute: (data) => api.post('/agency/routes', data),
  getAgencyRoutes: () => api.get('/agency/routes'),
  getAgencyRoute: (id) => api.get(`/agency/routes/${id}`),
  getRoutesByAgency: (agencyId) => api.get(`/agency/routes/agency/${agencyId}`),
  deleteAgencyRoute: (id) => api.delete(`/agency/routes/${id}`),
  
  // Schedule management
  createSchedule: (data) => api.post('/agency/schedules', data),
  getSchedules: () => api.get('/agency/schedules'),
  getSchedule: (id) => api.get(`/agency/schedules/${id}`),
  getSchedulesByAgency: (agencyId) => api.get(`/agency/schedules/agency/${agencyId}`),
  searchSchedules: (params) => sharedAPI.searchSchedules(params),
  updateSchedule: (id, data) => api.put(`/agency/schedules/${id}`, data),
  cancelSchedule: (id) => api.put(`/agency/schedules/${id}/cancel`),
  deleteSchedule: (id) => api.delete(`/agency/schedules/${id}`),
  
  // Agency profile management
  getProfile: (agencyId) => api.get(`/agency/profile/${agencyId}`),
  updateProfile: (agencyId, formData) => {
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
    return api.put(`/agency/profile/${agencyId}`, formData, config)
  },
  
  // Branch office management
  createBranchOffice: (data) => api.post('/agency/branch-offices', data),
  getBranchOffices: () => api.get('/agency/branch-offices'),
  getBranchOffice: (id) => api.get(`/agency/branch-offices/${id}`),
  getBranchOfficesByAgency: (agencyId) => api.get(`/agency/branch-offices/agency/${agencyId}`),
  getActiveBranchOfficesByAgency: (agencyId) => api.get(`/agency/branch-offices/agency/${agencyId}/active`),
  updateBranchOffice: (id, data) => api.put(`/agency/branch-offices/${id}`, data),
  deleteBranchOffice: (id) => api.delete(`/agency/branch-offices/${id}`),
  
  // Agent management
  createAgent: (data) => api.post('/agency/agents', data),
  getAgents: () => api.get('/agency/agents'),
  getAgent: (id) => api.get(`/agency/agents/${id}`),
  getAgentsByAgency: (agencyId) => api.get(`/agency/agents/agency/${agencyId}`),
  getAgentsByBranchOffice: (branchOfficeId) => api.get(`/agency/agents/branch-office/${branchOfficeId}`),
  getActiveAgentsByAgency: (agencyId) => api.get(`/agency/agents/agency/${agencyId}/active`),
  getUnconfirmedAgentsByAgency: (agencyId) => api.get(`/agency/agents/unconfirmed/agency/${agencyId}`),
  confirmAgent: (id) => api.post(`/agency/agents/${id}/confirm`),
  updateAgent: (id, data) => api.put(`/agency/agents/${id}`, data),
  resetAgentPassword: (id) => api.post(`/agency/agents/${id}/reset-password`),
  deleteAgent: (id) => api.delete(`/agency/agents/${id}`),
  
  // Agency metrics
  getMetrics: (agencyId) => api.get(`/agency/metrics/${agencyId}`),
  
  // Agency booking history
  getBookingsByAgency: (agencyId) => api.get(`/agency/bookings/agency/${agencyId}`),
  getBookingsBySchedule: (scheduleId) => api.get(`/agency/bookings/schedule/${scheduleId}`),
  
  // Branch manager management
  createBranchManager: (data) => api.post('/agency/branch-managers', data),
  getBranchManagers: () => api.get('/agency/branch-managers'),
  getBranchManager: (id) => api.get(`/agency/branch-managers/${id}`),
  getBranchManagersByAgency: (agencyId) => api.get(`/agency/branch-managers/agency/${agencyId}`),
  getBranchManagerByBranchOffice: (branchOfficeId) => api.get(`/agency/branch-managers/branch-office/${branchOfficeId}`),
  getActiveBranchManagersByAgency: (agencyId) => api.get(`/agency/branch-managers/agency/${agencyId}/active`),
  updateBranchManager: (id, data) => api.put(`/agency/branch-managers/${id}`, data),
  resetBranchManagerPassword: (id) => api.post(`/agency/branch-managers/${id}/reset-password`),
  deleteBranchManager: (id) => api.delete(`/agency/branch-managers/${id}`),

  // Shared access
  getDistricts: () => sharedAPI.getDistricts(),
  getRoutePoints: (districtId) => sharedAPI.getRoutePoints(districtId),
  getRoutes: () => sharedAPI.getRoutes(),
}

// Customer APIs
export const customerAPI = {
  // Customer management
  registerCustomer: (data) => api.post('/customers/register', data),
  getCustomers: () => api.get('/customers'),
  getCustomer: (id) => api.get(`/customers/${id}`),
  getCustomerByEmail: (email) => api.get(`/customers/email/${email}`),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
  
  // Booking management
  createBooking: (data) => api.post('/bookings', data),
  getBookings: () => api.get('/bookings'),
  getBooking: (id) => api.get(`/bookings/${id}`),
  getBookingByReference: (reference) => api.get(`/bookings/reference/${reference}`),
  getBookingsByCustomer: (customerId) => api.get(`/bookings/customer/${customerId}`),
  getBookingsBySchedule: (scheduleId) => api.get(`/bookings/schedule/${scheduleId}`),
  confirmBooking: (id) => api.put(`/bookings/${id}/confirm`),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
  
  // Shared access
  getDistricts: () => sharedAPI.getDistricts(),
  getRoutePoints: (districtId) => sharedAPI.getRoutePoints(districtId),
  searchSchedules: (params) => sharedAPI.searchSchedules(params),
  
  // Agent booking functionality
  createAgentBooking: (data) => api.post('/agent/bookings', data),
  getBookingsByAgent: (agentId) => api.get(`/agent/bookings/agent/${agentId}`),
  confirmAgentBooking: (id) => api.put(`/agent/bookings/${id}/confirm`),
  cancelAgentBooking: (id) => api.put(`/agent/bookings/${id}/cancel`),
}

// Branch Manager APIs
export const branchManagerAPI = {
  // Branch manager management
  createBranchManager: (data) => api.post('/agency/branch-managers', data),
  getBranchManagers: () => api.get('/agency/branch-managers'),
  getBranchManager: (id) => api.get(`/agency/branch-managers/${id}`),
  getBranchManagersByAgency: (agencyId) => api.get(`/agency/branch-managers/agency/${agencyId}`),
  getBranchManagerByBranchOffice: (branchOfficeId) => api.get(`/agency/branch-managers/branch-office/${branchOfficeId}`),
  getActiveBranchManagersByAgency: (agencyId) => api.get(`/agency/branch-managers/agency/${agencyId}/active`),
  updateBranchManager: (id, data) => api.put(`/agency/branch-managers/${id}`, data),
  resetBranchManagerPassword: (id) => api.post(`/agency/branch-managers/${id}/reset-password`),
  deleteBranchManager: (id) => api.delete(`/agency/branch-managers/${id}`),
  
  // Branch manager metrics and reports
  getMetrics: (branchManagerId) => api.get(`/branch-manager/metrics/${branchManagerId}`),
  getSchedules: (branchManagerId) => api.get(`/branch-manager/metrics/${branchManagerId}/schedules`),
  getBookingsBySchedule: (scheduleId) => api.get(`/branch-manager/metrics/bookings/schedule/${scheduleId}`),
  
  // Agent management by branch manager
  createAgent: (data) => api.post('/agency/agents', data),
  getAgentsByBranchManager: (branchOfficeId) => api.get(`/agency/agents/branch-office/${branchOfficeId}`),
  updateAgent: (id, data) => api.put(`/agency/agents/${id}`, data),
  resetAgentPassword: (id) => api.post(`/agency/agents/${id}/reset-password`),
  deleteAgent: (id) => api.delete(`/agency/agents/${id}`),
  
  // Schedule management by branch manager
  createSchedule: (data) => api.post('/agency/schedules', data),
  getSchedulesByBranchManager: (branchManagerId) => api.get(`/branch-manager/metrics/${branchManagerId}/schedules`),
  updateSchedule: (id, data) => api.put(`/agency/schedules/${id}`, data),
  cancelSchedule: (id) => api.put(`/agency/schedules/${id}/cancel`),
  deleteSchedule: (id) => api.delete(`/agency/schedules/${id}`),
  
  // Access to agency resources
  getAgencyRoutes: () => api.get('/agency/routes'),
  getBuses: () => api.get('/agency/buses'),
  getDrivers: () => api.get('/agency/drivers'),
}

// Agent APIs
export const agentAPI = {
  // Agent booking functionality
  createBooking: (data) => api.post('/agent/bookings', data),
  getBookings: () => api.get('/agent/bookings'),
  getBookingsByAgent: (agentId) => api.get(`/agent/bookings/agent/${agentId}`),
  confirmBooking: (id) => api.put(`/agent/bookings/${id}/confirm`),
  cancelBooking: (id) => api.put(`/agent/bookings/${id}/cancel`),
  
  // Agent profile
  getProfile: (agentId) => api.get(`/agent/profile/${agentId}`),
  updateProfile: (agentId, data) => api.put(`/agent/profile/${agentId}`, data),
  
  // Access to schedules for booking
  searchSchedulesByAgency: (params) => api.get('/agency/schedules/search', { params }),
  
  // Access to districts and route points
  getDistricts: () => sharedAPI.getDistricts(),
  getRoutePoints: (districtId) => sharedAPI.getRoutePoints(districtId),
  
  // Agent reports
  getDailyBookings: (agentId, date) => api.get(`/agent/reports/daily/${agentId}?date=${date}`),
  getScheduleBookings: (agentId, scheduleId) => api.get(`/agent/reports/schedule/${agentId}/${scheduleId}`),
  getAgencySchedules: (agencyId) => api.get(`/agency/schedules/agency/${agencyId}`),
}

export default api