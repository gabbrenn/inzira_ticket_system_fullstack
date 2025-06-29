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

// Admin APIs
export const adminAPI = {
  // Admin registration
  registerAdmin: (data) => api.post('/admins/register', data),
  
  // District management
  createDistrict: (data) => api.post('/admin/districts', data),
  getDistricts: () => api.get('/admin/districts'),
  getDistrict: (id) => api.get(`/admin/districts/${id}`),
  updateDistrict: (id, data) => api.put(`/admin/districts/${id}`, data),
  deleteDistrict: (id) => api.delete(`/admin/districts/${id}`),
  
  // Route points
  addRoutePoint: (districtId, data) => api.post(`/admin/districts/${districtId}/points`, data),
  getRoutePoints: (districtId) => api.get(`/admin/districts/${districtId}/points`),
  updateRoutePoint: (districtId, pointId, data) => api.put(`/admin/districts/${districtId}/points/${pointId}`, data),
  deleteRoutePoint: (districtId, pointId) => api.delete(`/admin/districts/${districtId}/points/${pointId}`),
  
  // Route management
  createRoute: (data) => api.post('/admin/routes', data),
  getRoutes: () => api.get('/admin/routes'),
  getRoute: (id) => api.get(`/admin/routes/${id}`),
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
  searchSchedules: (params) => api.get('/agency/schedules/search', { params }),
  updateSchedule: (id, data) => api.put(`/agency/schedules/${id}`, data),
  cancelSchedule: (id) => api.put(`/agency/schedules/${id}/cancel`),
  deleteSchedule: (id) => api.delete(`/agency/schedules/${id}`),
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
}

export default api