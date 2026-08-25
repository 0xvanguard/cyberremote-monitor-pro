'use client'

import { useEffect, useState } from 'react'

interface RankingItem {
  rank: number
  code: string
  name: string
  intensity: number
  jobs: number
  topRole?: string
}

interface RankingListProps {
  onSelect?: (code: string) => void
}

export function RankingList({ onSelect }: RankingListProps) {
  const [rankings, setRankings] = useState<RankingItem[]>([])

  useEffect(() => {
    // TODO: Conectar a API real
    const mockRankings: RankingItem[] = [
      { rank: 1, code: 'US', name: 'Estados Unidos', intensity: 98, jobs: 456, topRole: 'SOC Analyst' },
      { rank: 2, code: 'GB', name: 'Reino Unido', intensity: 94, jobs: 312, topRole: 'Pentester' },
      { rank: 3, code: 'DE', name: 'Alemania', intensity: 91, jobs: 287, topRole: 'Cloud Security' },
      { rank: 4, code: 'CA', name: 'Canadá', intensity: 88, jobs: 234, topRole: 'DevSecOps' },
      { rank: 5, code: 'CO', name: 'Colombia', intensity: 82, jobs: 189, topRole: 'SOC Analyst' },
      { rank: 6, code: 'BR', name: 'Brasil', intensity: 79, jobs: 167, topRole: 'AppSec' },
      { rank: 7, code: 'ES', name: 'España', intensity: 76, jobs: 145, topRole: 'GRC' },
      { rank: 8, code: 'AU', name: 'Australia', intensity: 74, jobs: 132, topRole: 'Pentester' },
    ]
    setRankings(mockRankings)
  }, [])

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 90) return 'text-green-500'
    if (intensity >= 75) return 'text-green-400'
    if (intensity >= 60) return 'text-yellow-500'
    if (intensity >= 45) return 'text-blue-500'
    return 'text-indigo-500'
  }

  return (
    <div className="space-y-1">
      {rankings.map((item) => (
        <div
          key={item.code}
          onClick={() => onSelect?.(item.code)}
          className="flex items-center gap-2 p-2 rounded hover:bg-slate-700/50 cursor-pointer transition-colors"
        >
          <span className="text-xs font-bold text-slate-500 w-4">
            {item.rank}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {item.name}
            </div>
            <div className="text-xs text-slate-400 truncate">
              🔥 {item.topRole}
            </div>
          </div>
          <span className={`text-sm font-bold ${getIntensityColor(item.intensity)}`}>
            {item.intensity}
          </span>
        </div>
      ))}
    </div>
  )
}
