'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/app/hooks/use-toast'
import {
  Settings,
  DollarSign,
  Package,
  Bell,
  Building,
  Save,
  RefreshCw
} from 'lucide-react'

interface ConfigData {
  margenUtilidadDefecto: number
  moneda: string
  nombreEmpresa: string
  descripcionEmpresa: string
  stockMinimoAlerta: number
  diasVencimiento: number
  notificacionesEmail: boolean
  notificacionesStockBajo: boolean
  formatoCodigoLote: string
}

export default function ConfiguracionPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<ConfigData>({
    margenUtilidadDefecto: 20,
    moneda: 'COP',
    nombreEmpresa: 'Mi Finca Panelera',
    descripcionEmpresa: '',
    stockMinimoAlerta: 10,
    diasVencimiento: 90,
    notificacionesEmail: false,
    notificacionesStockBajo: true,
    formatoCodigoLote: 'PAN-{YEAR}-{MONTH}-{COUNT}'
  })

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch('/api/configuracion')
        if (response.ok) {
          const data = await response.json()
          setConfig(prev => ({ ...prev, ...data }))
        }
      } catch (error) {
        console.error('Error loading config:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/configuracion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        throw new Error('Error al guardar configuración')
      }

      toast({
        title: 'Configuración guardada',
        description: 'Los cambios se han guardado correctamente'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setConfig({
      margenUtilidadDefecto: 20,
      moneda: 'COP',
      nombreEmpresa: 'Mi Finca Panelera',
      descripcionEmpresa: '',
      stockMinimoAlerta: 10,
      diasVencimiento: 90,
      notificacionesEmail: false,
      notificacionesStockBajo: true,
      formatoCodigoLote: 'PAN-{YEAR}-{MONTH}-{COUNT}'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Settings className="h-12 w-12 text-panela-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600">
          Personaliza el sistema según las necesidades de tu finca
        </p>
      </div>

      {/* Información de la Empresa */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-panela-600" />
            <CardTitle>Información de la Empresa</CardTitle>
          </div>
          <CardDescription>
            Datos generales de tu finca panelera
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombreEmpresa">Nombre de la Finca</Label>
            <Input
              id="nombreEmpresa"
              value={config.nombreEmpresa}
              onChange={(e) => setConfig(prev => ({ ...prev, nombreEmpresa: e.target.value }))}
              placeholder="Ej: Finca La Esperanza"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcionEmpresa">Descripción</Label>
            <Textarea
              id="descripcionEmpresa"
              value={config.descripcionEmpresa}
              onChange={(e) => setConfig(prev => ({ ...prev, descripcionEmpresa: e.target.value }))}
              placeholder="Breve descripción de tu finca y producción..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Producción */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-panela-600" />
            <CardTitle>Producción y Precios</CardTitle>
          </div>
          <CardDescription>
            Configuración de costos y márgenes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="margenUtilidad">Margen de Utilidad Predeterminado (%)</Label>
              <Input
                id="margenUtilidad"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={config.margenUtilidadDefecto}
                onChange={(e) => setConfig(prev => ({ ...prev, margenUtilidadDefecto: parseFloat(e.target.value) || 0 }))}
              />
              <p className="text-xs text-gray-500">
                Margen aplicado por defecto al calcular precios
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="moneda">Moneda</Label>
              <Input
                id="moneda"
                value={config.moneda}
                onChange={(e) => setConfig(prev => ({ ...prev, moneda: e.target.value }))}
                placeholder="Ej: COP, USD, EUR"
              />
              <p className="text-xs text-gray-500">
                Código de moneda ISO (actualmente: {config.moneda})
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="formatoCodigo">Formato de Código de Lote</Label>
            <Input
              id="formatoCodigo"
              value={config.formatoCodigoLote}
              onChange={(e) => setConfig(prev => ({ ...prev, formatoCodigoLote: e.target.value }))}
              placeholder="PAN-{YEAR}-{MONTH}-{COUNT}"
            />
            <p className="text-xs text-gray-500">
              Variables disponibles: {'{YEAR}'}, {'{MONTH}'}, {'{DAY}'}, {'{COUNT}'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diasVencimiento">Días para Vencimiento de Lotes</Label>
            <Input
              id="diasVencimiento"
              type="number"
              min="1"
              value={config.diasVencimiento}
              onChange={(e) => setConfig(prev => ({ ...prev, diasVencimiento: parseInt(e.target.value) || 90 }))}
            />
            <p className="text-xs text-gray-500">
              Número de días antes de que un lote se considere caducado
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Inventario y Alertas */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-panela-600" />
            <CardTitle>Inventario y Alertas</CardTitle>
          </div>
          <CardDescription>
            Configuración de notificaciones y umbrales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stockMinimo">Umbral de Stock Mínimo (%)</Label>
            <Input
              id="stockMinimo"
              type="number"
              min="0"
              max="100"
              value={config.stockMinimoAlerta}
              onChange={(e) => setConfig(prev => ({ ...prev, stockMinimoAlerta: parseInt(e.target.value) || 10 }))}
            />
            <p className="text-xs text-gray-500">
              Alerta cuando el stock esté bajo este porcentaje del mínimo
            </p>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div className="space-y-0.5">
              <Label>Notificaciones de Stock Bajo</Label>
              <p className="text-sm text-gray-500">
                Recibir alertas cuando los insumos estén bajo el mínimo
              </p>
            </div>
            <Switch
              checked={config.notificacionesStockBajo}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, notificacionesStockBajo: checked }))}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="space-y-0.5">
              <Label>Notificaciones por Email</Label>
              <p className="text-sm text-gray-500">
                Enviar notificaciones importantes por correo electrónico
              </p>
            </div>
            <Switch
              checked={config.notificacionesEmail}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, notificacionesEmail: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Información del Sistema */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Versión</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div>
              <p className="text-gray-600">Base de Datos</p>
              <p className="font-medium">MySQL + Prisma</p>
            </div>
            <div>
              <p className="text-gray-600">Framework</p>
              <p className="font-medium">Next.js 15</p>
            </div>
            <div>
              <p className="text-gray-600">Última Actualización</p>
              <p className="font-medium">{new Date().toLocaleDateString('es-CO')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={saving}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Restablecer
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
