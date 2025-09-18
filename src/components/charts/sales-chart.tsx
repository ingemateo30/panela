'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'

interface SalesData {
  month: string
  production: number
  sales: number
}

export function SalesChart() {
  const [data, setData] = useState<SalesData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard/sales-stats')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching sales data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Cargando...</div>
  }

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No hay datos disponibles</div>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [
              `${value} kg`,
              name === 'production' ? 'Producción' : 'Ventas'
            ]}
          />
          <Bar dataKey="production" fill="#a67c52" name="production" />
          <Bar dataKey="sales" fill="#8d5f3c" name="sales" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}