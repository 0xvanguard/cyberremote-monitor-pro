'use client'

import { useEffect, useRef, useState } from 'react'

interface Department {
  name: string
  capital: string
  latlng: [number, number]
  intensity: number
  jobs: number
  freelance: number
  contract: number
  training: number
  fastEntry: boolean
  salary: string
  driver: string
  topRoles: Array<{ role: string; demand: number; note: string }>
  signals: string[]
  platforms: string
  note: string
  cities: Array<{ name: string; latlng: [number, number]; intensity: number; jobs: number; freelance: number; note: string }>
}

interface ColombiaData {
  departments: Record<string, Department & { code: string }>
  meta: {
    country: string
    code: string
    total_departments: number
    total_cities: number
    updated: string
    national_intensity: number
    total_jobs: number
    total_freelance: number
    total_contracts: number
  }
}

interface ColombiaDashboardProps {
  onClose: () => void
}

function getIntensityColor(intensity: number): string {
  if (intensity >= 80) return '#22c55e'
  if (intensity >= 65) return '#84cc16'
  if (intensity >= 50) return '#eab308'
  if (intensity >= 30) return '#f97316'
  return '#ef4444'
}

function getIntensityBg(intensity: number): string {
  if (intensity >= 80) return 'bg-green-500/20 text-green-400'
  if (intensity >= 65) return 'bg-lime-500/20 text-lime-400'
  if (intensity >= 50) return 'bg-yellow-500/20 text-yellow-400'
  if (intensity >= 30) return 'bg-orange-500/20 text-orange-400'
  return 'bg-red-500/20 text-red-400'
}

export function ColombiaDashboard({ onClose }: ColombiaDashboardProps) {
  const [data, setData] = useState<ColombiaData | null>(null)
  const [selectedDept, setSelectedDept] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'map' | 'ranking' | 'cities'>('map')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Cargar datos de Colombia
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/data/colombia.json')
        const colombiaData = await res.json()
        
        // Agregar código a cada departamento
        const departmentsWithCode: Record<string, Department & { code: string }> = {}
        Object.entries(colombiaData.departments).forEach(([code, dept]: [string, any]) => {
          departmentsWithCode[code] = { ...dept, code }
        })
        
        setData({
          departments: departmentsWithCode,
          meta: colombiaData.meta,
        })
      } catch (error) {
        console.error('Error loading Colombia data:', error)
      }
    }
    loadData()
  }, [])

  // Dibujar mapa de Colombia en canvas
  useEffect(() => {
    if (!data || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Limpiar
    ctx.fillStyle = '#0a0f1a'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Calcular bounds de Colombia
    const depts = Object.values(data.departments)
    const allLats = depts.flatMap(d => [d.latlng[0], ...d.cities.map(c => c.latlng[0])])
    const allLngs = depts.flatMap(d => [d.latlng[1], ...d.cities.map(c => c.latlng[1])])
    const minLat = Math.min(...allLats) - 0.5
    const maxLat = Math.max(...allLats) + 0.5
    const minLng = Math.min(...allLngs) - 0.5
    const maxLng = Math.max(...allLngs) + 0.5

    // Función para convertir lat/lng a coordenadas de canvas
    const toCanvas = (lat: number, lng: number): [number, number] => {
      const x = ((lng - minLng) / (maxLng - minLng)) * (rect.width - 80) + 40
      const y = ((maxLat - lat) / (maxLat - minLat)) * (rect.height - 80) + 40
      return [x, y]
    }

    // Dibujar conexiones entre departamentos (bordes compartidos simplificados)
    ctx.strokeStyle = '#1e3a5f'
    ctx.lineWidth = 0.5
    ctx.globalAlpha = 0.3

    // Dibujar departamentos como puntos con radio proporcional
    depts.forEach(dept => {
      const [x, y] = toCanvas(dept.latlng[0], dept.latlng[1])
      const radius = Math.max(8, Math.min(25, dept.intensity / 3))
      const color = getIntensityColor(dept.intensity)
      const isSelected = selectedDept === dept.code

      // Glow effect
      if (isSelected || dept.intensity >= 60) {
        ctx.globalAlpha = 0.3
        ctx.beginPath()
        ctx.arc(x, y, radius * 2, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      }

      // Punto principal
      ctx.globalAlpha = isSelected ? 1 : 0.85
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // Borde si está seleccionado
      if (isSelected) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Label del departamento
      ctx.globalAlpha = 0.9
      ctx.fillStyle = '#ffffff'
      ctx.font = `${isSelected ? 'bold ' : ''}${radius > 15 ? 11 : 9}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(dept.name, x, y + radius + 14)

      // Score
      ctx.font = `bold ${radius > 15 ? 10 : 8}px Inter, sans-serif`
      ctx.fillText(`${dept.intensity}`, x, y + 4)
    })

    ctx.globalAlpha = 1

    // Leyenda
    ctx.fillStyle = '#0a0f1a'
    ctx.globalAlpha = 0.8
    ctx.fillRect(10, rect.height - 100, 160, 90)
    ctx.globalAlpha = 1
    
    const legendItems = [
      { label: 'Muy alto (80+)', color: '#22c55e' },
      { label: 'Alto (65–79)', color: '#84cc16' },
      { label: 'Medio (50–64)', color: '#eab308' },
      { label: 'Emergente (30–49)', color: '#f97316' },
      { label: 'Bajo (<30)', color: '#ef4444' },
    ]
    
    legendItems.forEach((item, i) => {
      ctx.fillStyle = item.color
      ctx.beginPath()
      ctx.arc(25, rect.height - 85 + i * 16, 5, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = '#94a3b8'
      ctx.font = '10px Inter, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(item.label, 38, rect.height - 81 + i * 16)
    })

  }, [data, selectedDept])

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!data || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const depts = Object.values(data.departments)
    const allLats = depts.flatMap(d => [d.latlng[0], ...d.cities.map(c => c.latlng[0])])
    const allLngs = depts.flatMap(d => [d.latlng[1], ...d.cities.map(c => c.latlng[1])])
    const minLat = Math.min(...allLats) - 0.5
    const maxLat = Math.max(...allLats) + 0.5
    const minLng = Math.min(...allLngs) - 0.5
    const maxLng = Math.max(...allLngs) + 0.5

    // Encontrar departamento más cercano
    let closestDept: string | null = null
    let closestDist = Infinity

    depts.forEach(dept => {
      const [dx, dy] = [
        ((dept.latlng[1] - minLng) / (maxLng - minLng)) * (rect.width - 80) + 40,
        ((maxLat - dept.latlng[0]) / (maxLat - minLat)) * (rect.height - 80) + 40,
      ]
      const dist = Math.sqrt((x - dx) ** 2 + (y - dy) ** 2)
      const radius = Math.max(8, Math.min(25, dept.intensity / 3))
      
      if (dist < radius + 10 && dist < closestDist) {
        closestDist = dist
        closestDept = dept.code
      }
    })

    setSelectedDept(closestDept)
  }

  if (!data) {
    return (
      <div className="fixed inset-0 bg-cyber-darker/95 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando datos de Colombia...</p>
        </div>
      </div>
    )
  }

  const dept = selectedDept ? data.departments[selectedDept] : null
  const sortedDepts = Object.entries(data.departments)
    .sort(([, a], [, b]) => b.intensity - a.intensity)

  return (
    <div className="fixed inset-0 bg-cyber-darker z-50 overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-cyber-dark/95 border-b border-green-500/30 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🇨🇴</span>
          <div>
            <h1 className="text-lg font-bold text-white">Colombia · Deep-Drill Intelligence</h1>
            <p className="text-xs text-slate-400">
              {data.meta.total_departments} departamentos · {data.meta.total_cities} ciudades · cyber jobs {data.meta.updated}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium">LIVE · Score {data.meta.national_intensity}/100</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors"
          >
            ✕ Cerrar
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Panel izquierdo - Stats */}
        <aside className="w-72 bg-cyber-dark/50 border-r border-green-500/20 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* KPIs principales */}
            <div className="grid grid-cols-2 gap-2">
              <div className="intel-card p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{data.meta.total_departments}</div>
                <div className="text-xs text-slate-400">Departamentos</div>
              </div>
              <div className="intel-card p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{data.meta.total_cities}</div>
                <div className="text-xs text-slate-400">Ciudades</div>
              </div>
              <div className="intel-card p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">{data.meta.total_jobs}</div>
                <div className="text-xs text-slate-400">Empleos</div>
              </div>
              <div className="intel-card p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">{data.meta.total_freelance}</div>
                <div className="text-xs text-slate-400">Freelance</div>
              </div>
              <div className="intel-card p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">{data.meta.total_contracts}</div>
                <div className="text-xs text-slate-400">Contratos</div>
              </div>
              <div className="intel-card p-3 text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {Object.values(data.departments).filter(d => d.fastEntry).length}/{data.meta.total_departments}
                </div>
                <div className="text-xs text-slate-400">⚡ Entrada rápida</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('map')}
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                  activeTab === 'map' ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                🗺️ Mapa
              </button>
              <button
                onClick={() => setActiveTab('ranking')}
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                  activeTab === 'ranking' ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                🏆 Ranking
              </button>
              <button
                onClick={() => setActiveTab('cities')}
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                  activeTab === 'cities' ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                🏙️ Ciudades
              </button>
            </div>

            {/* Contenido según tab */}
            {activeTab === 'ranking' && (
              <div className="space-y-1">
                {sortedDepts.slice(0, 10).map(([code, d], i) => (
                  <button
                    key={code}
                    onClick={() => setSelectedDept(code)}
                    className={`w-full flex items-center gap-2 p-2 rounded text-left transition-colors ${
                      selectedDept === code ? 'bg-green-500/20' : 'hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-500 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{d.name}</div>
                      <div className="text-xs text-slate-400">{d.capital}</div>
                    </div>
                    <span className="text-sm font-bold" style={{ color: getIntensityColor(d.intensity) }}>
                      {d.intensity}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'cities' && (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {sortedDepts.flatMap(([code, d]) =>
                  d.cities
                    .sort((a, b) => b.intensity - a.intensity)
                    .slice(0, 3)
                    .map(city => ({
                      ...city,
                      deptName: d.name,
                      deptCode: code,
                    }))
                )
                .sort((a, b) => b.intensity - a.intensity)
                .slice(0, 15)
                .map((city, i) => (
                  <div
                    key={`${city.deptCode}-${city.name}`}
                    className="flex items-center gap-2 p-2 rounded hover:bg-slate-700/50"
                  >
                    <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white">{city.name}</div>
                      <div className="text-xs text-slate-400">{city.deptName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold" style={{ color: getIntensityColor(city.intensity) }}>
                        {city.intensity}
                      </div>
                      <div className="text-xs text-slate-500">
                        {city.jobs}💼 {city.freelance}🛠️
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Centro - Mapa */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-pointer"
            style={{ display: activeTab === 'map' ? 'block' : 'none' }}
          />
          
          {activeTab !== 'map' && dept && (
            <div className="absolute inset-0 flex items-center justify-center bg-cyber-darker p-8">
              <div className="max-w-2xl w-full">
                <div className="intel-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{dept.name}</h2>
                      <p className="text-slate-400">Capital: {dept.capital}</p>
                    </div>
                    <span className="text-3xl font-bold" style={{ color: getIntensityColor(dept.intensity) }}>
                      {dept.intensity}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-slate-800/50 rounded">
                      <div className="text-lg font-bold text-cyan-400">{dept.jobs}</div>
                      <div className="text-xs text-slate-400">💼 Empleos</div>
                    </div>
                    <div className="text-center p-2 bg-slate-800/50 rounded">
                      <div className="text-lg font-bold text-purple-400">{dept.freelance}</div>
                      <div className="text-xs text-slate-400">🛠️ Freelance</div>
                    </div>
                    <div className="text-center p-2 bg-slate-800/50 rounded">
                      <div className="text-lg font-bold text-yellow-400">{dept.contract}</div>
                      <div className="text-xs text-slate-400">📋 Contratos</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">💰 Salario</div>
                      <div className="text-sm text-white">{dept.salary}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">🏢 Driver</div>
                      <div className="text-sm text-white">{dept.driver}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">📊 Roles demandados</div>
                      <div className="space-y-1">
                        {dept.topRoles.slice(0, 5).map((role, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="text-sm text-white">{role.role}</div>
                              <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                                <div
                                  className="h-1.5 rounded-full"
                                  style={{ width: `${role.demand}%`, backgroundColor: getIntensityColor(role.demand) }}
                                />
                              </div>
                            </div>
                            <span className="text-xs text-slate-400">{role.demand}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel derecho - Detalle del depto seleccionado */}
        {selectedDept && dept && activeTab === 'map' && (
          <aside className="w-80 bg-cyber-dark/50 border-l border-green-500/20 overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{dept.name}</h3>
                  <p className="text-xs text-slate-400">Capital: {dept.capital}</p>
                </div>
                <button
                  onClick={() => setSelectedDept(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${getIntensityBg(dept.intensity)}`}>
                  Score: {dept.intensity}
                </span>
                {dept.fastEntry && (
                  <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400">
                    ⚡ Entrada rápida
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-slate-800/50 rounded">
                  <div className="text-lg font-bold text-cyan-400">{dept.jobs}</div>
                  <div className="text-xs text-slate-400">💼</div>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded">
                  <div className="text-lg font-bold text-purple-400">{dept.freelance}</div>
                  <div className="text-xs text-slate-400">🛠️</div>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded">
                  <div className="text-lg font-bold text-yellow-400">{dept.contract}</div>
                  <div className="text-xs text-slate-400">📋</div>
                </div>
              </div>

              <div className="intel-card p-3">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">💰 Salario</div>
                <div className="text-sm text-white font-medium">{dept.salary}</div>
              </div>

              <div className="intel-card p-3">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">🏢 Driver</div>
                <div className="text-sm text-white">{dept.driver}</div>
              </div>

              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">📊 Roles más demandados</div>
                <div className="space-y-2">
                  {dept.topRoles.map((role, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{role.role}</div>
                        <div className="text-xs text-slate-500 truncate">{role.note}</div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: `${role.demand}%`, backgroundColor: getIntensityColor(role.demand) }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold" style={{ color: getIntensityColor(role.demand) }}>
                        {role.demand}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">🏙️ Ciudades ({dept.cities.length})</div>
                <div className="space-y-1">
                  {dept.cities
                    .sort((a, b) => b.intensity - a.intensity)
                    .map((city, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-slate-700/50">
                        <div>
                          <div className="text-sm text-white">{city.name}</div>
                          <div className="text-xs text-slate-500">{city.note}</div>
                        </div>
                        <span className="text-sm font-bold" style={{ color: getIntensityColor(city.intensity) }}>
                          {city.intensity}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="intel-card p-3">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">📡 Señales</div>
                <div className="space-y-1">
                  {dept.signals.map((signal, i) => (
                    <div key={i} className="text-xs text-slate-300">• {signal}</div>
                  ))}
                </div>
              </div>

              <div className="intel-card p-3">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">🔗 Plataformas</div>
                <div className="text-xs text-white">{dept.platforms}</div>
              </div>

              <div className="intel-card p-3">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">📝 Nota</div>
                <div className="text-xs text-slate-300">{dept.note}</div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
