'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/app/hooks/use-toast'
import { ArrowLeft, Save, User, Mail, Phone, MapPin } from 'lucide-react'

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

  const handleInputChange = (field: keyof ProveedorFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateEmail = (email: string): boolean => {
    if (!email) return true // Email es opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true // Teléfono es opcional
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/
    return phoneRegex.test(phone)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validaciones
    if (!formData.nombre.trim()) {
      toast({
        title: 'Error de validación',
        description: 'El nombre del proveedor es obligatorio',
        variant: 'destructive'
      })
      return
    }

    if (formData.nombre.trim().length < 2) {
      toast({
        title: 'Error de validación',
        description: 'El nombre debe tener al menos 2 caracteres',
        variant: 'destructive'
      })
      return
    }

    if (formData.email && !validateEmail(formData.email)) {
      toast({
        title: 'Error de validación',
        description: 'El formato del email no es válido',
        variant: 'destructive'
      })
      return
    }

    if (formData.telefono && !validatePhone(formData.telefono)) {
      toast({
        title: 'Error de validación',
        description: 'El formato del teléfono no es válido',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      // Preparar datos para envío (convertir strings vacíos a null)
      const dataToSend = {
        nombre: formData.nombre.trim(),
        contacto: formData.contacto.trim() || null,
        telefono: formData.telefono.trim() || null,
        email: formData.email.trim() || null,
        direccion: formData.direccion.trim() || null,
        activo: formData.activo
      }

      const response = await fetch('/api/proveedores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear el proveedor')
      }

      const proveedor = await response.json()

      toast({
        title: 'Éxito',
        description: `Proveedor "${proveedor.nombre}" creado correctamente`,
      })

      router.push('/proveedores')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo crear el proveedor',
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
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Proveedor</h1>
          <p className="text-gray-600">
            Registra un nuevo proveedor de panela en el sistema
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Proveedor *</Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Ingrese el nombre del proveedor"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  required
                  maxLength={100}
                />
                <p className="text-xs text-gray-500">
                  Nombre comercial o razón social del proveedor
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contacto">Persona de Contacto</Label>
                <Input
                  id="contacto"
                  type="text"
                  placeholder="Nombre del contacto principal"
                  value={formData.contacto}
                  onChange={(e) => handleInputChange('contacto', e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-gray-500">
                  Nombre de la persona responsable o contacto principal
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="activo">Proveedor Activo</Label>
                  <p className="text-sm text-gray-500">
                    Permitir realizar compras a este proveedor
                  </p>
                </div>
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => handleInputChange('activo', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="+57 300 000 0000"
                    className="pl-10"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    maxLength={20}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Número de teléfono principal (incluir código de país si es necesario)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="proveedor@email.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    maxLength={100}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Dirección de correo electrónico para comunicaciones
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                  <Textarea
                    id="direccion"
                    placeholder="Dirección completa del proveedor..."
                    className="pl-10 min-h-[80px]"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    rows={3}
                    maxLength={255}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Dirección física del proveedor (opcional)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.nombre.trim()}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando Proveedor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Crear Proveedor
              </>
            )}
          </Button>
        </div>

        {!formData.nombre.trim() && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md mt-3">
            <p>• El nombre del proveedor es obligatorio</p>
          </div>
        )}
      </form>
    </div>
  )
}