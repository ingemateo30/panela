// Calculadora de costos y precios para panela

export interface CostInputs {
  costoCana: number
  costoManoObra: number
  costoEnergia: number
  costoEmpaques: number
  costoTransporte: number
  cantidad: number // kg
}

export interface PriceCalculation {
  costoTotal: number
  costoUnitario: number
  precioSugerido: number
  margenUtilidad: number
  utilidadTotal: number
}

export class CostCalculator {
  /**
   * Calcula el costo total de un lote de panela
   */
  static calculateTotalCost(inputs: CostInputs): number {
    const { costoCana, costoManoObra, costoEnergia, costoEmpaques, costoTransporte } = inputs
    return costoCana + costoManoObra + costoEnergia + costoEmpaques + costoTransporte
  }

  /**
   * Calcula el costo unitario por kg
   */
  static calculateUnitCost(inputs: CostInputs): number {
    const totalCost = this.calculateTotalCost(inputs)
    return inputs.cantidad > 0 ? totalCost / inputs.cantidad : 0
  }

  /**
   * Calcula el precio sugerido con margen de utilidad
   */
  static calculateSuggestedPrice(inputs: CostInputs, marginPercent: number = 20): PriceCalculation {
    const costoTotal = this.calculateTotalCost(inputs)
    const costoUnitario = this.calculateUnitCost(inputs)
    const margenDecimal = marginPercent / 100
    const precioSugerido = costoUnitario * (1 + margenDecimal)
    const utilidadTotal = costoTotal * margenDecimal

    return {
      costoTotal,
      costoUnitario,
      precioSugerido,
      margenUtilidad: marginPercent,
      utilidadTotal
    }
  }

  /**
   * Calcula rentabilidad de un proveedor
   */
  static calculateSupplierProfitability(
    purchasePrice: number, 
    sellingPrice: number, 
    quantity: number
  ): { profit: number, profitMargin: number } {
    const totalCost = purchasePrice * quantity
    const totalRevenue = sellingPrice * quantity
    const profit = totalRevenue - totalCost
    const profitMargin = totalCost > 0 ? (profit / totalCost) * 100 : 0

    return { profit, profitMargin }
  }

  /**
   * Proyección de ventas basada en datos históricos
   */
  static calculateSalesForecast(
    historicalData: Array<{ month: string, sales: number }>,
    periods: number = 3
  ): Array<{ month: string, projected: number }> {
    if (historicalData.length < 3) {
      return []
    }

    // Cálculo simple de tendencia (promedio móvil)
    const recentSales = historicalData.slice(-3).map(d => d.sales)
    const average = recentSales.reduce((a, b) => a + b, 0) / recentSales.length
    
    // Calcular tendencia
    const trend = historicalData.length > 1 
      ? (historicalData[historicalData.length - 1].sales - historicalData[0].sales) / historicalData.length
      : 0

    const forecast: Array<{ month: string, projected: number }> = []
    
    for (let i = 1; i <= periods; i++) {
      const projected = Math.max(0, average + (trend * i))
      forecast.push({
        month: `Mes ${historicalData.length + i}`,
        projected: Math.round(projected)
      })
    }

    return forecast
  }

  /**
   * Análisis de punto de equilibrio
   */
  static calculateBreakEven(
    fixedCosts: number,
    variableCostPerUnit: number,
    sellingPricePerUnit: number
  ): { breakEvenUnits: number, breakEvenRevenue: number } {
    const contributionMargin = sellingPricePerUnit - variableCostPerUnit
    
    if (contributionMargin <= 0) {
      return { breakEvenUnits: 0, breakEvenRevenue: 0 }
    }

    const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin)
    const breakEvenRevenue = breakEvenUnits * sellingPricePerUnit

    return { breakEvenUnits, breakEvenRevenue }
  }
}