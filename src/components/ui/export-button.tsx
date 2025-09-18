'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Download, FileText, Table } from 'lucide-react'
import { ReportExporter } from '@/lib/exporters'
// Cambiar esta línea según la ubicación actual del archivo
import { useToast } from '@/app/hooks/use-toast'
// O crear la carpeta hooks en src y usar: import { useToast } from '@/hooks/use-toast'

interface ExportButtonProps {
  data: any[]
  filename: string
  type: 'lotes' | 'proveedores' | 'insumos' | 'ventas'
}

export function ExportButton({ data, filename, type }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (data.length === 0) {
      toast({
        title: 'Sin datos',
        description: 'No hay datos disponibles para exportar',
        variant: 'destructive'
      })
      return
    }

    setIsExporting(true)

    try {
      let reportData

      switch (type) {
        case 'lotes':
          reportData = ReportExporter.formatLotesData(data)
          break
        case 'proveedores':
          reportData = ReportExporter.formatProveedoresData(data)
          break
        case 'insumos':
          reportData = ReportExporter.formatInsumosData(data)
          break
        case 'ventas':
          // Implementar formatVentasData cuando sea necesario
          throw new Error('Formato de ventas no implementado aún')
        default:
          throw new Error('Tipo de reporte no soportado')
      }

      if (format === 'pdf') {
        ReportExporter.exportToPDF(reportData)
      } else {
        ReportExporter.exportToExcel(reportData)
      }

      toast({
        title: 'Exportación exitosa',
        description: `El archivo ${format.toUpperCase()} ha sido descargado`
      })
    } catch (error) {
      console.error('Error exporting:', error)
      toast({
        title: 'Error de exportación',
        description: 'No se pudo exportar el archivo. Intenta de nuevo.',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting || data.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <Table className="h-4 w-4 mr-2" />
          Exportar Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}