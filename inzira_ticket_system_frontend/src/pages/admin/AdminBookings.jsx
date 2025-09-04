import React, { useEffect, useMemo, useState } from 'react'
import { adminAPI } from '../../services/api'
import Pagination from '../../components/Pagination'
import { Download, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminBookings = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    status: '',
    agencyId: '',
    start: '',
    end: '',
    search: '',
  })
  const [agencies, setAgencies] = useState([])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminAPI.listBookings({
        status: filters.status || undefined,
        agencyId: filters.agencyId || undefined,
        start: filters.start || undefined,
        end: filters.end || undefined,
      })
      const data = res.data?.data || []
      // simple client-side paging for now
      setTotal(data.length)
      const startIdx = (page - 1) * perPage
      setRows(data.slice(startIdx, startIdx + perPage))
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, perPage])

  useEffect(() => {
    // load agencies for filter dropdown
    (async ()=>{
      try {
        const res = await adminAPI.getAgencies?.()
        setAgencies(res?.data?.data || [])
      } catch {}
    })()
  }, [])

  const handleFilter = (e) => {
    e.preventDefault()
    setPage(1)
    fetchData()
  }

  const exportCsv = async () => {
    try {
      const res = await adminAPI.exportBookingsCsv({
        status: filters.status || undefined,
        start: filters.start || undefined,
        end: filters.end || undefined,
      })
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bookings.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Exported bookings.csv')
    } catch (e) {
      toast.error('Export failed')
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">All Bookings</h1>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="btn-primary px-3 py-2 rounded inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <form onSubmit={handleFilter} className="bg-white p-4 rounded shadow mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Status</label>
          <select value={filters.status} onChange={(e)=>setFilters(f=>({...f, status:e.target.value}))} className="w-full border rounded px-3 py-2">
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Agency</label>
          <select value={filters.agencyId} onChange={(e)=>setFilters(f=>({...f, agencyId:e.target.value}))} className="w-full border rounded px-3 py-2">
            <option value="">All</option>
            {agencies.map(a => (
              <option key={a.id} value={a.id}>{a.agencyName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Start date</label>
          <input type="date" value={filters.start} onChange={(e)=>setFilters(f=>({...f, start:e.target.value}))} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">End date</label>
          <input type="date" value={filters.end} onChange={(e)=>setFilters(f=>({...f, end:e.target.value}))} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-outline px-3 py-2 rounded inline-flex items-center gap-2 w-full justify-center">
            <Filter className="w-4 h-4" /> Apply
          </button>
        </div>
      </form>

  <div className="bg-white rounded shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
        <th className="px-4 py-2 text-left">Reference</th>
        <th className="px-4 py-2 text-left">Agency</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Payment</th>
                <th className="px-4 py-2 text-left">Seats</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-3" colSpan={7}>Loading...</td></tr>
              ) : error ? (
                <tr><td className="px-4 py-3 text-red-600" colSpan={7}>{error}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="px-4 py-3" colSpan={7}>No bookings</td></tr>
              ) : rows.map((b)=> {
                const agencyName = b?.schedule?.agencyRoute?.agency?.agencyName || ''
                return (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2 font-mono">{b.bookingReference}</td>
                  <td className="px-4 py-2">{agencyName}</td>
                  <td className="px-4 py-2">{b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : ''}</td>
                  <td className="px-4 py-2">{b.status}</td>
                  <td className="px-4 py-2">{b.paymentStatus}</td>
                  <td className="px-4 py-2">{b.numberOfSeats}</td>
                  <td className="px-4 py-2">{b.totalAmount}</td>
                  <td className="px-4 py-2">{b.createdAt}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Items per page</span>
            <select value={perPage} onChange={(e)=>{setPerPage(Number(e.target.value)); setPage(1)}} className="border rounded px-2 py-1">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} itemsPerPage={perPage} totalItems={total} onPageChange={setPage} />
        </div>
      </div>
    </div>
  )
}

export default AdminBookings
