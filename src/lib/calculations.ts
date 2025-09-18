export interface CostosProduccion {
  costoCana: number
  costoManoObra: number
  costoEnergia: number
  costoEmpaques: number
  costoTransporte: number
}

export interface CalculoLote extends CostosProduccion {
  cantidad: number
  margenUtilidad: number
}

export function calcularCostoTotal(costos: CostosProduccion): number {
  return costos.costoCana + 
         costos.costoManoObra + 
         costos.costoEnergia + 
         costos.costoEmpaques + 
         costos.costoTransporte
}

export function calcularPrecioSugerido(
  costoTotal: number, 
  margenUtilidad: number
): number {
  return costoTotal * (1 + margenUtilidad / 100)
}

export function calcularCostoPorKilo(costoTotal: number, cantidad: number): number {
  return cantidad > 0 ? costoTotal / cantidad : 0
}

export function calcularPrecioVentaPorKilo(
  precioSugerido: number, 
  cantidad: number
): number {
  return cantidad > 0 ? precioSugerido / cantidad : 0
}

export function generarCodigoLote(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 5).toUpperCase()
  return `LOTE-${timestamp}-${random}`
}

export function calcularRentabilidad(precioVenta: number, costoTotal: number): number {
  return costoTotal > 0 ? ((precioVenta - costoTotal) / costoTotal) * 100 : 0
}