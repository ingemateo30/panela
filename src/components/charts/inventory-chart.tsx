'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useEffect, useState } from 'react'

type InventoryData = {
  name: string;
  value: number;
  color: string;
  additionalProperties?: Record<string, unknown>; // Use a union type or a specific type if you know what the properties will be
};

export function InventoryChart() {
  const [data, setData] = useState<InventoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard/inventory-stats')
        const result = await response.json()
        
        const chartData: InventoryData[] = [
          {
            name: 'Disponible',
            value: result.disponible || 0,
            color: '#10B981'
          },
          {
            name: 'En Producción',
            value: result.produccion || 0,
            color: '#F59E0B'
          },
          {
            name: 'Vendido',
            value: result.vendido || 0,
            color: '#6B7280'
          },
          {
            name: 'Caducado',
            value: result.caducado || 0,
            color: '#EF4444'
          }
        ].filter(item => item.value > 0)

        setData(chartData)
      } catch (error) {
        console.error('Error fetching inventory data:', error)
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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} lotes`, '']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}