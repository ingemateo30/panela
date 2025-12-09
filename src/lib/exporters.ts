import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ReportData {
  title: string
  headers: string[]
  rows: string[][]
  filename: string
}

interface Lote {
  id: string
  codigo: string
  estado: string
  fechaProduccion: Date
  fechaVencimiento: Date
  cantidad: number
  proveedor?: {
    nombre: string
  }
}

interface Proveedor {
  id: string
  nombre: string
  email: string
  telefono: string
  direccion: string
  activo: boolean
}

interface Insumo {
  id: string
  nombre: string
  categoria: string
  cantidad: number
  unidad: string
  precioUnitario: number
  stockMinimo: number
}

interface Venta {
  id: string
  fecha: Date
  cantidad: number
  precioUnitario: number
  total: number
  cliente?: string
  lote?: {
    codigo: string
  }
}

interface Compra {
  id: string
  fecha: Date
  cantidad: number
  precioUnitario: number
  total: number
  observaciones?: string
  proveedor?: {
    nombre: string
  }
}

export class ReportExporter {
  static formatLotesData(lotes: Lote[]): ReportData {
    return {
      title: 'Reporte de Lotes',
      headers: ['Código', 'Estado', 'Fecha Producción', 'Fecha Vencimiento', 'Cantidad', 'Proveedor'],
      rows: lotes.map(lote => [
        lote.codigo,
        lote.estado,
        format(new Date(lote.fechaProduccion), 'dd/MM/yyyy', { locale: es }),
        format(new Date(lote.fechaVencimiento), 'dd/MM/yyyy', { locale: es }),
        lote.cantidad.toString(),
        lote.proveedor?.nombre || 'N/A'
      ]),
      filename: `lotes_${format(new Date(), 'yyyy-MM-dd')}`
    }
  }

  static formatProveedoresData(proveedores: Proveedor[]): ReportData {
    return {
      title: 'Reporte de Proveedores',
      headers: ['Nombre', 'Email', 'Teléfono', 'Dirección', 'Estado'],
      rows: proveedores.map(proveedor => [
        proveedor.nombre,
        proveedor.email || 'N/A',
        proveedor.telefono || 'N/A',
        proveedor.direccion || 'N/A',
        proveedor.activo ? 'Activo' : 'Inactivo'
      ]),
      filename: `proveedores_${format(new Date(), 'yyyy-MM-dd')}`
    }
  }

  static formatInsumosData(insumos: Insumo[]): ReportData {
    return {
      title: 'Reporte de Insumos',
      headers: ['Nombre', 'Categoría', 'Cantidad', 'Unidad', 'Precio Unitario', 'Stock Mínimo'],
      rows: insumos.map(insumo => [
        insumo.nombre,
        insumo.categoria,
        insumo.cantidad.toString(),
        insumo.unidad,
        `$${insumo.precioUnitario.toFixed(2)}`,
        insumo.stockMinimo.toString()
      ]),
      filename: `insumos_${format(new Date(), 'yyyy-MM-dd')}`
    }
  }

  static formatVentasData(ventas: Venta[]): ReportData {
    return {
      title: 'Reporte de Ventas',
      headers: ['Fecha', 'Lote', 'Cliente', 'Cantidad (kg)', 'Precio Unitario', 'Total'],
      rows: ventas.map(venta => [
        format(new Date(venta.fecha), 'dd/MM/yyyy', { locale: es }),
        venta.lote?.codigo || 'N/A',
        venta.cliente || 'Sin cliente',
        venta.cantidad.toFixed(2),
        `$${venta.precioUnitario.toLocaleString('es-CO')}`,
        `$${venta.total.toLocaleString('es-CO')}`
      ]),
      filename: `ventas_${format(new Date(), 'yyyy-MM-dd')}`
    }
  }

  static formatComprasData(compras: Compra[]): ReportData {
    return {
      title: 'Reporte de Compras',
      headers: ['Fecha', 'Proveedor', 'Cantidad (kg)', 'Precio Unitario', 'Total', 'Observaciones'],
      rows: compras.map(compra => [
        format(new Date(compra.fecha), 'dd/MM/yyyy', { locale: es }),
        compra.proveedor?.nombre || 'N/A',
        compra.cantidad.toFixed(2),
        `$${compra.precioUnitario.toLocaleString('es-CO')}`,
        `$${compra.total.toLocaleString('es-CO')}`,
        compra.observaciones || '-'
      ]),
      filename: `compras_${format(new Date(), 'yyyy-MM-dd')}`
    }
  }

  static exportToPDF(data: ReportData) {
    const doc = new jsPDF()
    
    // Configurar fuente
    doc.setFont("helvetica")
    
    // Título
    doc.setFontSize(18)
    doc.text(data.title, 20, 20)
    
    // Fecha del reporte
    doc.setFontSize(10)
    doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, 30)
    
    // Tabla
    autoTable(doc, {
      head: [data.headers],
      body: data.rows,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 40 }
    })
    
    // Descargar
    doc.save(`${data.filename}.pdf`)
  }

  static exportToExcel(data: ReportData) {
    // Crear workbook
    const wb = XLSX.utils.book_new()
    
    // Preparar datos con headers
    const wsData = [data.headers, ...data.rows]
    
    // Crear worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    
    // Aplicar estilos a los headers
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!ws[cellAddress]) continue
      
      ws[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "CCCCCC" } }
      }
    }
    
    // Ajustar anchos de columna
    const colWidths = data.headers.map(header => ({
      wch: Math.max(header.length, 15)
    }))
    ws['!cols'] = colWidths
    
    // Añadir worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, "Datos")
    
    // Descargar
    XLSX.writeFile(wb, `${data.filename}.xlsx`)
  }
}