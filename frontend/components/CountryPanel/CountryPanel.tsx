'use client'

import { useEffect, useState } from 'react'

interface CountryData {
  code: string
  name: string
  region: string
  intensity: number
  jobs: number
  freelance: number
  contract: number
  fastEntry: boolean
  salary: string
  topRoles: Array<{ role: string; demand: number }>
  signals: string[]
  cities: Array<{ name: string; score: number }>
}

interface CountryPanelProps {
  countryCode: string
  onSelect?: (code: string) => void
}

export function CountryPanel({ countryCode, onSelect }: CountryPanelProps) {
  const [country, setCountry] = useState<CountryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCountry = async () => {
      setLoading(true)
      try {
        // TODO: Conectar a API real
        const mockData: CountryData = {
          code: countryCode,
          name: getCountryName(countryCode),
          region: getRegion(countryCode),
          intensity: Math.floor(Math.random() * 30) + 70,
          jobs: Math.floor(Math.random() * 200) + 100,
          freelance: Math.floor(Math.random() * 50) + 20,
          contract: Math.floor(Math.random() * 30) + 10,
          fastEntry: Math.random() > 0.5,
          salary: '$3,000 - $8,000 USD/mes',
          topRoles: [
            { role: 'SOC Analyst', demand: 85 },
            { role: 'Pentester', demand: 72 },
            { role: 'Cloud Security', demand: 68 },
          ],
          signals: [
            'Mercado en crecimiento para juniors',
            'Alta demanda de SOC analysts',
            'Salarios competitivos en USD',
          ],
          cities: [
            { name: 'Bogotá', score: 85 },
            { name: 'Medellín', score: 78 },
            { name: 'Cali', score: 65 },
          ],
        }
        setCountry(mockData)
      } catch (error) {
        console.error('Error loading country:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCountry()
  }, [countryCode])

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 90) return 'text-green-500'
    if (intensity >= 75) return 'text-green-400'
    if (intensity >= 60) return 'text-yellow-500'
    if (intensity >= 45) return 'text-blue-500'
    return 'text-indigo-500'
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-700 rounded w-2/3" />
          <div className="h-4 bg-slate-700 rounded w-1/2" />
          <div className="h-20 bg-slate-700 rounded" />
        </div>
      </div>
    )
  }

  if (!country) return null

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="border-b border-slate-700/50 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              {country.name}
              {country.fastEntry && <span className="ml-2">⚡</span>}
            </h2>
            <p className="text-xs text-slate-400">{country.region}</p>
          </div>
          <span className={`text-2xl font-bold ${getIntensityColor(country.intensity)}`}>
            {country.intensity}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="intel-card p-2">
          <div className="text-lg font-bold text-cyber-accent">{country.jobs}</div>
          <div className="text-xs text-slate-400">💼 Empleos</div>
        </div>
        <div className="intel-card p-2">
          <div className="text-lg font-bold text-cyber-purple">{country.freelance}</div>
          <div className="text-xs text-slate-400">🛠️ Freelance</div>
        </div>
        <div className="intel-card p-2">
          <div className="text-lg font-bold text-cyber-warning">{country.contract}</div>
          <div className="text-xs text-slate-400">📋 Contratos</div>
        </div>
      </div>

      {/* Salary */}
      <div className="intel-card p-3">
        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
          💰 Rango Salarial
        </div>
        <div className="text-sm font-medium text-white">{country.salary}</div>
      </div>

      {/* Top Roles */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          🔥 Roles Más Demandados
        </h3>
        <div className="space-y-2">
          {country.topRoles.map((role, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="text-sm text-white">{role.role}</div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-cyber-accent h-1.5 rounded-full"
                    style={{ width: `${role.demand}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-slate-400">{role.demand}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cities */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          🏙️ Ciudades Principales
        </h3>
        <div className="space-y-1">
          {country.cities.map((city, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded hover:bg-slate-700/50 cursor-pointer"
            >
              <span className="text-sm text-white">{city.name}</span>
              <span className={`text-xs font-bold ${getIntensityColor(city.score)}`}>
                {city.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Signals */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          📡 Señales
        </h3>
        <div className="space-y-1">
          {country.signals.map((signal, i) => (
            <div key={i} className="text-xs text-slate-300 p-2 bg-slate-800/50 rounded">
              • {signal}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getCountryName(code: string): string {
  const names: Record<string, string> = {
    US: 'Estados Unidos',
    GB: 'Reino Unido',
    DE: 'Alemania',
    CA: 'Canadá',
    CO: 'Colombia',
    BR: 'Brasil',
    ES: 'España',
    AU: 'Australia',
  }
  return names[code] || code
}

function getRegion(code: string): string {
  const regions: Record<string, string> = {
    US: 'North America',
    GB: 'Europe',
    DE: 'Europe',
    CA: 'North America',
    CO: 'LATAM',
    BR: 'LATAM',
    ES: 'Europe',
    AU: 'Oceania',
  }
  return regions[code] || 'Unknown'
}
