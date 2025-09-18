'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRGeneratorProps {
  value: string
  size?: number
  className?: string
}

export function QRGenerator({ value, size = 200, className }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(console.error)
    }
  }, [value, size])

  return (
    <canvas 
      ref={canvasRef}
      className={className}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  )
}