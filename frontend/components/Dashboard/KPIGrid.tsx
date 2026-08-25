'use client'

import { useEffect, useState } from 'react'

interface KPIData {
  label: string
  value: number | string
  icon: string
  color?: string
}

export function KPIGrid() {
  const [kpis, setKpis] = useState<KPIData[]>([
    { label: 'Total Vacantes', value: '...', icon: '💼', color: 'text-cyber-accent' },
    { label: 'Países Activos', value: '...', icon: '🌍', color: 'text-cyber-glow' },
    { label: 'Empleos Remotos', value: '...', icon: '🏠', color: 'text-cyber-purple' },
    { label: 'Entrada Rápida', value: '...', icon: '⚡', color: 'text-cyber-warning' },
  ])

  useEffect(() => {
    // TODO: Conectar a API real
    const mockKpis: KPIData[] = [
      { label: 'Total Vacantes', value: 2847, icon: '💼', color: 'text-cyber-accent' },
      { label: 'Países Activos', value: 94, icon: '🌍', color: 'text-cyber-glow' },
      { label: 'Empleos Remotos', value: 1923, icon: '🏠', color: 'text-cyber-purple' },
      { label: 'Entrada Rápida', value: 127, icon: '⚡', color: 'text-cyber-warning' },
    ]
    setKpis(mockKpis)
  }, [])

  return (
    <div className="grid grid-cols-2 gap-2">
      {kpis.map((kpi, i) => (
        <div key={i} className="intel-card p-3">
          <div className="text-2xl mb-1">{kpi.icon}</div>
          <div className={`text-xl font-bold ${kpi.color}`}>
            {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">
            {kpi.label}
          </div>
        </div>
      ))}
    </div>
  )
}
