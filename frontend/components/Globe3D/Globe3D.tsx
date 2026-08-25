'use client'

import { useEffect, useRef, useState } from 'react'

// globe.gl types
interface GlobeInstance {
  globeImageUrl: (url: string) => GlobeInstance
  bumpImageUrl: (url: string) => GlobeInstance
  backgroundImageUrl: (url: string) => GlobeInstance
  atmosphereColor: (color: string) => GlobeInstance
  atmosphereAltitude: (alt: number) => GlobeInstance
  pointsData: (data: any[]) => GlobeInstance
  pointAltitude: (fn: (d: any) => number) => GlobeInstance
  pointRadius: (fn: (d: any) => number) => GlobeInstance
  pointColor: (fn: (d: any) => string) => GlobeInstance
  onPointClick: (fn: (point: any) => void) => GlobeInstance
  pointOfView: (pov: { lat: number; lng: number; altitude: number }, transition?: number) => GlobeInstance
  controls: () => { autoRotate: boolean; autoRotateSpeed: number }
  _destructor: () => void
}

declare global {
  interface Window {
    Globe: new (element: HTMLElement) => GlobeInstance
  }
}

export interface Globe3DProps {
  selectedCountry?: string
  onSelectCountry?: (code: string) => void
}

interface CountryData {
  code: string
  name: string
  lat: number
  lng: number
  intensity: number
  jobs: number
}

export function Globe3D({ selectedCountry = 'US', onSelectCountry }: Globe3DProps) {
  const globeRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [countries, setCountries] = useState<CountryData[]>([])

  // Cargar datos de países
  useEffect(() => {
    const loadData = async () => {
      try {
        const responses = await Promise.all([
          fetch('/data/countries.json'),
          fetch('/data/countries-extra.json'),
        ])
        const [main, extra] = await Promise.all(responses.map(r => r.json()))
        const merged = { ...main, ...extra }
        
        const countryList: CountryData[] = Object.entries(merged).map(([code, data]: [string, any]) => ({
          code,
          name: data.name,
          lat: data.latlng?.[0] || 0,
          lng: data.latlng?.[1] || 0,
          intensity: data.intensity || 0,
          jobs: data.jobs || 0,
        }))
        
        setCountries(countryList)
      } catch (error) {
        console.error('Error loading country data:', error)
      }
    }
    loadData()
  }, [])

  // Inicializar Globe
  useEffect(() => {
    if (!globeRef.current || countries.length === 0) return

    // Dynamically import globe.gl on client side
    import('globe.gl').then(({ default: GlobeConstructor }) => {
      const globe = new GlobeConstructor(globeRef.current!)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .atmosphereColor('#0ea5e9')
        .atmosphereAltitude(0.25)

      // Agregar puntos de países
      globe
        .pointsData(countries.filter(c => c.intensity > 0))
        .pointAltitude((d: any) => d.intensity / 100)
        .pointRadius((d: any) => Math.max(0.5, d.intensity / 20))
        .pointColor((d: any) => {
          if (d.intensity >= 90) return '#16a34a'
          if (d.intensity >= 75) return '#4ade80'
          if (d.intensity >= 60) return '#f59e0b'
          if (d.intensity >= 45) return '#0ea5e9'
          return '#6366f1'
        })
        .onPointClick((point: any) => {
          onSelectCountry?.(point.code)
        })

      // Configurar vista inicial
      globe
        .pointOfView({ lat: 20, lng: -40, altitude: 2.5 }, 1000)

      // Auto-rotación
      globe.controls().autoRotate = true
      globe.controls().autoRotateSpeed = 0.5

      setIsLoaded(true)

      // Store reference for cleanup
      const globeRefCurrent = globeRef.current!
      return () => {
        globe._destructor()
      }
    })
  }, [countries, onSelectCountry])

  // Actualizar selección
  useEffect(() => {
    if (!isLoaded || !selectedCountry || !globeRef.current) return
    
    const country = countries.find(c => c.code === selectedCountry)
    if (country && country.lat && country.lng) {
      // Importar y usar globe.gl
      import('globe.gl').then(({ default: GlobeConstructor }) => {
        const globe = new GlobeConstructor(globeRef.current!)
        globe.pointOfView({ 
          lat: country.lat, 
          lng: country.lng, 
          altitude: 1.5 
        }, 1000)
      })
    }
  }, [selectedCountry, countries, isLoaded])

  return (
    <div className="w-full h-full relative">
      <div ref={globeRef} className="w-full h-full" />
      
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-cyber-dark/80">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyber-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Cargando globo...</p>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-cyber-dark/90 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="font-semibold text-white mb-2">Intensidad Laboral</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-400">90+ (Alta)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-slate-400">75-89</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-slate-400">60-74</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-400">45-59</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-slate-400">&lt;45 (Baja)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
