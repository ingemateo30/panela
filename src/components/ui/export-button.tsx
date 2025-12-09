'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Download, FileText, Table, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ReportExporter } from '@/lib/exporters'

// Interfaces para los diferentes tipos de datos
interface Lote {
  id: string
  codigo: string
  cantidad: number
  fechaProduccion: string
  estado: string
  costoTotal: number
  precioSugerido: number
  descripcion?: string
}

interface Proveedor {
  id: string
  nombre: string
  contacto?: string | null
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  activo: boolean
  createdAt: string
}

interface Insumo {
  id: string
  nombre: string
  descripcion?: string | null
  unidadMedida: string
  stockActual: number
  stockMinimo: number
  costoUnitario: number
  activo: boolean
}

interface Venta {
  id: string
  cantidad: number
  precioUnitario: number
  total: number
  cliente?: string | null
  fecha: string
  lote: {
    codigo: string
  }
}

type ExportData = Lote | Proveedor | Insumo | Venta

interface ExportButtonProps {
  data: ExportData[]
  filename: string
  type: 'lotes' | 'proveedores' | 'insumos' | 'ventas' | 'compras'
  buttonText?: string
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon'
}

interface ReportData {
  title: string
  headers: string[]
  rows: (string | number)[][]
  filename: string
}

export function ExportButton({ data, filename, type, buttonText = 'Exportar', buttonSize = 'default' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('es-CO')
  }

  const formatLotesData = (lotes: Lote[]): ReportData => {
    return {
      title: 'Reporte de Lotes de Panela',
      headers: ['Código', 'Cantidad (kg)', 'Fecha Producción', 'Estado', 'Costo Total', 'Precio Sugerido', 'Descripción'],
      rows: lotes.map(lote => [
        lote.codigo,
        lote.cantidad,
        formatDate(lote.fechaProduccion),
        lote.estado,
        formatCurrency(lote.costoTotal),
        formatCurrency(lote.precioSugerido),
        lote.descripcion || 'N/A'
      ]),
      filename: `lotes_${new Date().toISOString().split('T')[0]}`
    }
  }

  const formatProveedoresData = (proveedores: Proveedor[]): ReportData => {
    return {
      title: 'Reporte de Proveedores',
      headers: ['Nombre', 'Contacto', 'Teléfono', 'Email', 'Dirección', 'Estado', 'Fecha Registro'],
      rows: proveedores.map(proveedor => [
        proveedor.nombre,
        proveedor.contacto || 'N/A',
        proveedor.telefono || 'N/A',
        proveedor.email || 'N/A',
        proveedor.direccion || 'N/A',
        proveedor.activo ? 'Activo' : 'Inactivo',
        formatDate(proveedor.createdAt)
      ]),
      filename: `proveedores_${new Date().toISOString().split('T')[0]}`
    }
  }

  const formatInsumosData = (insumos: Insumo[]): ReportData => {
    return {
      title: 'Reporte de Insumos',
      headers: ['Nombre', 'Descripción', 'Unidad', 'Stock Actual', 'Stock Mínimo', 'Costo Unitario', 'Estado'],
      rows: insumos.map(insumo => [
        insumo.nombre,
        insumo.descripcion || 'N/A',
        insumo.unidadMedida,
        insumo.stockActual,
        insumo.stockMinimo,
        formatCurrency(insumo.costoUnitario),
        insumo.activo ? 'Activo' : 'Inactivo'
      ]),
      filename: `insumos_${new Date().toISOString().split('T')[0]}`
    }
  }

  const formatVentasData = (ventas: Venta[]): ReportData => {
    return {
      title: 'Reporte de Ventas',
      headers: ['Código Lote', 'Cantidad (kg)', 'Precio Unitario', 'Total', 'Cliente', 'Fecha'],
      rows: ventas.map(venta => [
        venta.lote.codigo,
        venta.cantidad,
        formatCurrency(venta.precioUnitario),
        formatCurrency(venta.total),
        venta.cliente || 'N/A',
        formatDate(venta.fecha)
      ]),
      filename: `ventas_${new Date().toISOString().split('T')[0]}`
    }
  }

  const getReportData = (): ReportData => {
    switch (type) {
      case 'lotes':
        return formatLotesData(data as Lote[])
      case 'proveedores':
        return formatProveedoresData(data as Proveedor[])
      case 'insumos':
        return formatInsumosData(data as Insumo[])
      case 'ventas':
        return formatVentasData(data as Venta[])
      default:
        throw new Error(`Tipo de reporte no soportado: ${type}`)
    }
  }

  const exportToPDF = async (reportData: ReportData) => {
    try {
      // Importar jsPDF dinámicamente
      const jsPDFModule = await import('jspdf')
      const jsPDF = jsPDFModule.default
      await import('jspdf-autotable')

      const doc = new jsPDF()
      
      // Configuración del documento
      doc.setFontSize(18)
      doc.text(reportData.title, 14, 22)
      
      doc.setFontSize(11)
      doc.text(`Generado el: ${new Date().toLocaleString('es-CO')}`, 14, 32)
      doc.text(`Total de registros: ${reportData.rows.length}`, 14, 40)

      // Crear tabla con extensión autoTable
      const docWithAutoTable = doc as typeof doc & {
        autoTable: (options: {
          head: string[][]
          body: (string | number)[][]
          startY: number
          styles: {
            fontSize: number
            cellPadding: number
          }
          headStyles: {
            fillColor: number[]
            textColor: number
            fontSize: number
            fontStyle: string
          }
          alternateRowStyles: {
            fillColor: number[]
          }
          margin: {
            top: number
          }
        }) => void
      }
      
      docWithAutoTable.autoTable({
        head: [reportData.headers],
        body: reportData.rows,
        startY: 50,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [51, 51, 51],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 50 },
      })

      // Descargar PDF
      doc.save(`${reportData.filename}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw new Error('Error al generar el archivo PDF')
    }
  }

  const exportToExcel = async (reportData: ReportData) => {
    try {
      // Importar XLSX dinámicamente
      const XLSXModule = await import('xlsx')
      const XLSX = XLSXModule.default

      // Crear worksheet
      const ws = XLSX.utils.aoa_to_sheet([
        reportData.headers,
        ...reportData.rows
      ])

      // Crear workbook
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Datos')

      // Configurar estilos para los headers
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
        if (!ws[cellAddress]) continue
        
        // Configurar estilo de celda
        ws[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "EEEEEE" } }
        }
      }

      // Ajustar ancho de columnas
      const colWidths = reportData.headers.map(header => ({
        wch: Math.max(header.length + 2, 15)
      }))
      ws['!cols'] = colWidths

      // Descargar Excel
      XLSX.writeFile(wb, `${reportData.filename}.xlsx`)
    } catch (error) {
      console.error('Error generating Excel:', error)
      throw new Error('Error al generar el archivo Excel')
    }
  }

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
          reportData = ReportExporter.formatLotesData(data as any)
          break
        case 'proveedores':
          reportData = ReportExporter.formatProveedoresData(data as any)
          break
        case 'insumos':
          reportData = ReportExporter.formatInsumosData(data as any)
          break
        case 'ventas':
          // Implementar formatVentasData cuando sea necesario
          throw new Error('Formato de ventas no implementado aún')
        default:
          throw new Error('Tipo de reporte no soportado')
      }

      if (format === 'pdf') {
        await exportToPDF(reportData)
      } else {
        await exportToExcel(reportData)
      }

      toast({
        title: 'Exportación exitosa',
        description: `El archivo ${format.toUpperCase()} ha sido descargado correctamente`
      })
    } catch (error) {
      console.error('Error exporting:', error)
      toast({
        title: 'Error de exportación',
        description: error instanceof Error ? error.message : 'No se pudo exportar el archivo. Intenta de nuevo.',
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
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
        >
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('excel')}
          disabled={isExporting}
        >
          <Table className="h-4 w-4 mr-2" />
          Exportar Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}