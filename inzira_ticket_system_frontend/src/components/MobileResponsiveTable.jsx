import React from 'react'

const MobileResponsiveTable = ({ 
  headers, 
  data, 
  renderRow, 
  renderMobileCard,
  emptyMessage = "No data available",
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="loading-spinner mx-auto"></div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => renderRow(item, index))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((item, index) => renderMobileCard(item, index))}
      </div>
    </>
  )
}

export default MobileResponsiveTable