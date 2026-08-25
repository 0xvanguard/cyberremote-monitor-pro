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

const ColombiaDashboard = dynamic(
  () => import('@/components/ColombiaDashboard/ColombiaDashboard').then(mod => mod.ColombiaDashboard),
  { ssr: false }
)

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<string>('US')
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
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">🌐 Globo 3D · arrastra · scroll · clic</span>
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

        {/* Center - Globe 3D only */}
        <div className="flex-1 relative">
          <Globe3D 
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
          />
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
