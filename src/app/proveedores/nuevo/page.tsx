'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save } from 'lucide-react'

interface ProveedorFormData {
  nombre: string
  contacto: string
  telefono: string
  email: string
  direccion: string
  activo: boolean
}

export default function NuevoProveedorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ProveedorFormData>({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    activo: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      toast({
        title: 'Error de validación',
        description: 'El nombre del proveedor es obligatorio',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/proveedores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Error al crear el proveedor')
      }

      toast({
        title: 'Éxito',
        description: 'Proveedor creado correctamente',
      })

      router.push('/proveedores')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el proveedor',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Insumos</h1>
          <p className="text-gray-600">
            Controla el inventario de insumos y materiales
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={insumos}
            filename="insumos"
            type="insumos"
          />
          <Button asChild>
            <Link href="/insumos/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Insumo
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid de Insumos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insumos.length > 0 ? (
          insumos.map((insumo) => (
            <InsumoCard key={insumo.id} insumo={insumo} />
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay insumos registrados
                </h3>
                <p className="text-gray-600 mb-4">
                  Comienza registrando tu primer insumo
                </p>
                <Button asChild>
                  <Link href="/insumos/nuevo">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Insumo
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
