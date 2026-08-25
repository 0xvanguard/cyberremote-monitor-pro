'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { SignalFeed } from '@/components/SignalFeed/SignalFeed'
import { CountryPanel } from '@/components/CountryPanel/CountryPanel'
import { KPIGrid } from '@/components/Dashboard/KPIGrid'
import { RankingList } from '@/components/Dashboard/RankingList'

// Componentes dinámicos (necesitan window)
const Globe3D = dynamic(
  () => import('@/components/Globe3D/Globe3D').then(mod => mod.Globe3D),
  { ssr: false }
)

const Map2D = dynamic(
  () => import('@/components/Map2D/Map2D').then(mod => mod.Map2D),
  { ssr: false }
)

const ColombiaDashboard = dynamic(
  () => import('@/components/ColombiaDashboard/ColombiaDashboard').then(mod => mod.ColombiaDashboard),
  { ssr: false }
)

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<string>('US')
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d')
  const [showColombia, setShowColombia] = useState(false)

  // Abrir Colombia Dashboard cuando se selecciona CO
  useEffect(() => {
    if (selectedCountry === 'CO') {
      setShowColombia(true)
    }
  }, [selectedCountry])

  return (
    <main className="min-h-screen bg-cyber-darker">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-cyber-dark/90 backdrop-blur-sm border-b border-cyber-accent/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyber-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🛡️</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">CyberRemote Monitor Pro</h1>
              <p className="text-xs text-slate-400">Intelligence Board Global</p>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === '2d'
                  ? 'bg-cyber-accent text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              🗺️ 2D
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === '3d'
                  ? 'bg-cyber-accent text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              🌐 3D
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16 h-screen flex">
        {/* Left Sidebar - Country Panel */}
        <aside className="w-80 bg-cyber-dark/50 border-r border-cyber-accent/20 overflow-y-auto">
          <CountryPanel 
            countryCode={selectedCountry} 
            onSelect={setSelectedCountry} 
          />
        </aside>

        {/* Center - Globe or Map */}
        <div className="flex-1 relative">
          {viewMode === '3d' ? (
            <Globe3D 
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
            />
          ) : (
            <Map2D
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
            />
          )}
        </div>

        {/* Right Sidebar - Intelligence */}
        <aside className="w-80 bg-cyber-dark/50 border-l border-cyber-accent/20 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* KPIs */}
            <section>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                📊 KPIs Globales
              </h2>
              <KPIGrid />
            </section>

            {/* Rankings */}
            <section>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                🏆 Top Países
              </h2>
              <RankingList onSelect={setSelectedCountry} />
            </section>

            {/* Signal Feed */}
            <section>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                📡 Señales en Vivo
              </h2>
              <SignalFeed />
            </section>
          </div>
        </aside>
      </div>

      {/* Colombia Dashboard - Full screen overlay */}
      {showColombia && (
        <ColombiaDashboard onClose={() => {
          setShowColombia(false)
          setSelectedCountry('US')
        }} />
      )}
    </main>
  )
}
