export function validarEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validarTelefono(telefono: string): boolean {
  // Acepta números colombianos con o sin código de país
  const telefonoRegex = /^(\+57|057)?[1-9]\d{6,9}$/
  return telefonoRegex.test(telefono.replace(/\s/g, ''))
}

export function validarCantidad(cantidad: number): { valido: boolean; mensaje?: string } {
  if (cantidad <= 0) {
    return { valido: false, mensaje: 'La cantidad debe ser mayor a 0' }
  }
  if (cantidad > 10000) {
    return { valido: false, mensaje: 'La cantidad parece demasiado alta' }
  }
  return { valido: true }
}

export function validarPrecio(precio: number): { valido: boolean; mensaje?: string } {
  if (precio < 0) {
    return { valido: false, mensaje: 'El precio no puede ser negativo' }
  }
  if (precio > 1000000) {
    return { valido: false, mensaje: 'El precio parece demasiado alto' }
  }
  return { valido: true }
}

export function limpiarTexto(texto: string): string {
  return texto.trim().replace(/\s+/g, ' ')
}