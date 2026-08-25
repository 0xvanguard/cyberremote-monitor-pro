'use client'

import { useEffect, useState } from 'react'

export interface Signal {
  id: string
  country: string
  countryCode: string
  text: string
  intensity: number
  timestamp: Date
}

export function SignalFeed() {
  const [signals, setSignals] = useState<Signal[]>([])

  useEffect(() => {
    // TODO: Conectar a WebSocket o polling de API real
    const mockSignals: Signal[] = [
      {
        id: '1',
        country: 'Colombia',
        countryCode: 'CO',
        text: 'Nueva vacante SOC Analyst en Bogotá - Salario competitivo en USD',
        intensity: 85,
        timestamp: new Date(Date.now() - 5 * 60000),
      },
      {
        id: '2',
        country: 'Estados Unidos',
        countryCode: 'US',
        text: 'Startup de San Francisco busca Pentester remoto - Equity disponible',
        intensity: 92,
        timestamp: new Date(Date.now() - 15 * 60000),
      },
      {
        id: '3',
        country: 'Alemania',
        countryCode: 'DE',
        text: 'Empresa de Múnich contrata Cloud Security Engineer - Visa sponsorship',
        intensity: 88,
        timestamp: new Date(Date.now() - 30 * 60000),
      },
      {
        id: '4',
        country: 'Brasil',
        countryCode: 'BR',
        text: 'Consultora de São Paulo necesita DevSecOps - Horario flexible',
        intensity: 76,
        timestamp: new Date(Date.now() - 45 * 60000),
      },
    ]
    setSignals(mockSignals)
  }, [])

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    return `${hours}h`
  }

  const getIntensityBadge = (intensity: number) => {
    if (intensity >= 90) return 'bg-green-500/20 text-green-400'
    if (intensity >= 75) return 'bg-green-400/20 text-green-300'
    if (intensity >= 60) return 'bg-yellow-500/20 text-yellow-400'
    return 'bg-blue-500/20 text-blue-400'
  }

  return (
    <div className="signal-feed space-y-2">
      {signals.map((signal) => (
        <div
          key={signal.id}
          className="p-2 bg-slate-800/50 rounded border border-slate-700/50 hover:border-cyber-accent/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-white">
              📍 {signal.country}
            </span>
            <span className="text-xs text-slate-500">
              {getTimeAgo(signal.timestamp)}
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-1 line-clamp-2">
            {signal.text}
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-1.5 py-0.5 rounded ${getIntensityBadge(signal.intensity)}`}>
              {signal.intensity}
            </span>
            <span className="text-xs text-slate-500">🔥</span>
          </div>
        </div>
      ))}
      
      {signals.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-sm">Esperando señales...</p>
        </div>
      )}
    </div>
  )
}
