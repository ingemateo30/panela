import QRCode from 'qrcode'

export interface TraceabilityData {
  loteId: string
  codigo: string
  fechaProduccion: string
  cantidad: number
  costoTotal: number
  precioSugerido: number
  estado: string
  descripcion?: string
}

export class QRGenerator {
  /**
   * Genera un código QR para un lote de panela
   */
  static async generateQR(data: TraceabilityData): Promise<string> {
    try {
      const qrData = {
        id: data.loteId,
        codigo: data.codigo,
        producto: 'Panela',
        fecha: data.fechaProduccion,
        cantidad: `${data.cantidad} kg`,
        costo: data.costoTotal,
        precio: data.precioSugerido,
        estado: data.estado,
        descripcion: data.descripcion || '',
        url: `${process.env.NEXTAUTH_URL}/trazabilidad/${data.codigo}`
      }

      const qrString = JSON.stringify(qrData)
      
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })

      return qrCodeDataURL
    } catch (error) {
      console.error('Error generating QR code:', error)
      throw new Error('Failed to generate QR code')
    }
  }

  /**
   * Genera QR simple con solo el código del lote
   */
  static async generateSimpleQR(codigo: string): Promise<string> {
    try {
      const url = `${process.env.NEXTAUTH_URL}/trazabilidad/${codigo}`
      
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 200,
        margin: 1,
        color: {
          dark: '#2D4A3E',
          light: '#FFFFFF'
        }
      })

      return qrCodeDataURL
    } catch (error) {
      console.error('Error generating simple QR code:', error)
      throw new Error('Failed to generate QR code')
    }
  }

  /**
   * Genera un código único para el lote
   */
  static generateLotCode(prefix: string = 'PAN'): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
  }

  /**
   * Decodifica datos del QR
   */
  static decodeQRData(qrString: string): TraceabilityData | null {
    try {
      const data = JSON.parse(qrString)
      return {
        loteId: data.id,
        codigo: data.codigo,
        fechaProduccion: data.fecha,
        cantidad: parseFloat(data.cantidad),
        costoTotal: data.costo,
        precioSugerido: data.precio,
        estado: data.estado,
        descripcion: data.descripcion
      }
    } catch (error) {
      console.error('Error decoding QR data:', error)
      return null
    }
  }
}