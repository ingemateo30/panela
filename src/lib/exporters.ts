import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export interface ReportData {
  title: string
  subtitle?: string
  headers: string[]
  data: any[][]
  summary?: Array<{ label: string, value: string | number }>
}

export class ReportExporter {
  /**
   * Exporta datos a PDF
   */
  static exportToPDF(reportData: ReportData): void {
    const doc = new jsPDF()
    
    // Configurar fuente
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    
    // Título
    doc.text(reportData.title, 20, 20)
    
    if (reportData.subtitle) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(reportData.subtitle, 20, 30)
    }

    // Fecha del reporte
    const fecha = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })
    doc.setFontSize(10)
    doc.text(`Generado el: ${fecha}`, 20, 40)

    // Tabla
    autoTable(doc, {
      head: [reportData.headers],
      body: reportData.data,
      startY: 50,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [45, 74, 62], // Verde panela
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 246]
      }
    })

    // Resumen si existe
    if (reportData.summary && reportData.summary.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 50
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Resumen:', 20, finalY + 20)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      reportData.summary.forEach((item, index) => {
        doc.text(`${item.label}: ${item.value}`, 20, finalY + 35 + (index * 7))
      })
    }

    // Descargar
    const filename = `${reportData.title.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`
    doc.save(filename)
  }

  /**
   * Exporta datos a Excel
   */
  static exportToExcel(reportData: ReportData): void {
    const wb = XLSX.utils.book_new()
    
    // Crear hoja de datos
    const wsData = [
      [reportData.title],
      reportData.subtitle ? [reportData.subtitle] : [],
      [`Generado el: ${format(new Date(), "dd/MM/yyyy HH:mm")}`],
      [], // Fila vacía
      reportData.headers,
      ...reportData.data
    ].filter(row => row.length > 0)

    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Estilos básicos
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    
    // Ajustar ancho de columnas
    const colWidths = reportData.headers.map(() => ({ width: 15 }))
    ws['!cols'] = colWidths

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Datos')

    // Crear hoja de resumen si existe
    if (reportData.summary && reportData.summary.length > 0) {
      const summaryData = [
        ['Resumen'],
        [],
        ...reportData.summary.map(item => [item.label, item.value])
      ]
      
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen')
    }

    // Descargar
    const filename = `${reportData.title.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`
    XLSX.writeFile(wb, filename)
  }

  /**
   * Formatea datos de lotes para reporte
   */
  static formatLotesData(lotes: any[]): ReportData {
    return {
      title: 'Reporte de Lotes de Panela',
      subtitle: 'Inventario de producción propia',
      headers: [
        'Código',
        'Fecha Producción',
        'Cantidad (kg)',
        'Costo Total',
        'Precio Sugerido',
        'Estado',
        'Usuario'
      ],
      data: lotes.map(lote => [
        lote.codigo,
        format(new Date(lote.fechaProduccion), 'dd/MM/yyyy'),
        lote.cantidad.toString(),
        `$${lote.costoTotal.toLocaleString()}`,
        `$${lote.precioSugerido.toLocaleString()}`,
        lote.estado,
        lote.usuario?.name || 'N/A'
      ]),
      summary: [
        { label: 'Total de lotes', value: lotes.length },
        { label: 'Cantidad total (kg)', value: lotes.reduce((sum, l) => sum + l.cantidad, 0) },
        { label: 'Valor del inventario', value: `$${lotes.reduce((sum, l) => sum + l.costoTotal, 0).toLocaleString()}` }
      ]
    }
  }

  /**
   * Formatea datos de proveedores para reporte
   */
  static formatProveedoresData(proveedores: any[]): ReportData {
    return {
      title: 'Reporte de Proveedores',
      subtitle: 'Listado de proveedores y compras',
      headers: [
        'Nombre',
        'Contacto',
        'Teléfono',
        'Email',
        'Total Compras',
        'Estado'
      ],
      data: proveedores.map(proveedor => [
        proveedor.nombre,
        proveedor.contacto || 'N/A',
        proveedor.telefono || 'N/A',
        proveedor.email || 'N/A',
        `$${(proveedor._sum?.total || 0).toLocaleString()}`,
        proveedor.activo ? 'Activo' : 'Inactivo'
      ]),
      summary: [
        { label: 'Total proveedores', value: proveedores.length },
        { label: 'Proveedores activos', value: proveedores.filter(p => p.activo).length },
        { label: 'Total compras', value: `$${proveedores.reduce((sum, p) => sum + (p._sum?.total || 0), 0).toLocaleString()}` }
      ]
    }
  }

  /**
   * Formatea datos de insumos para reporte
   */
  static formatInsumosData(insumos: any[]): ReportData {
    return {
      title: 'Reporte de Insumos',
      subtitle: 'Estado actual del inventario de insumos',
      headers: [
        'Nombre',
        'Stock Actual',
        'Stock Mínimo',
        'Unidad',
        'Costo Unitario',
        'Valor Total',
        'Estado'
      ],
      data: insumos.map(insumo => [
        insumo.nombre,
        insumo.stockActual.toString(),
        insumo.stockMinimo.toString(),
        insumo.unidadMedida,
        `$${insumo.costoUnitario.toLocaleString()}`,
        `$${(insumo.stockActual * insumo.costoUnitario).toLocaleString()}`,
        insumo.stockActual <= insumo.stockMinimo ? 'Bajo stock' : 'Disponible'
      ]),
      summary: [
        { label: 'Total insumos', value: insumos.length },
        { label: 'Insumos con bajo stock', value: insumos.filter(i => i.stockActual <= i.stockMinimo).length },
        { label: 'Valor total inventario', value: `$${insumos.reduce((sum, i) => sum + (i.stockActual * i.costoUnitario), 0).toLocaleString()}` }
      ]
    }
  }
}