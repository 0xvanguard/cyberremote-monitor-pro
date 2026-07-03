"use client";

import type { GeoPoint } from "../Globe3D";

interface CountryPanelProps {
  country: GeoPoint | null;
  onClose?: () => void;
}

const LEVEL_BAR_COLOR: Record<string, string> = {
  pentesting: "bg-red-500",
  soc: "bg-blue-500",
  cloud_security: "bg-sky-500",
  devsecops: "bg-purple-500",
  appsec: "bg-orange-500",
  grc: "bg-yellow-500",
  osint: "bg-green-500",
  iam: "bg-pink-500",
};

/**
 * CountryPanel
 * Panel lateral contextual que aparece al hacer click en un pais del globo.
 * Muestra KPIs, especialidades, nivel de mercado y rutas de insercion.
 */
export default function CountryPanel({ country, onClose }: CountryPanelProps) {
  if (!country) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600 font-mono text-sm p-6">
        <span className="text-4xl mb-3">🌍</span>
        <p>Haz click en un país del globo</p>
        <p className="text-xs mt-1 text-gray-700">para ver oportunidades e inteligencia de mercado</p>
      </div>
    );
  }

  const intensityLabel =
    country.intensity >= 80 ? "ALTO 🔥" :
    country.intensity >= 55 ? "MEDIO ⚡" :
    country.intensity >= 35 ? "MODERADO" : "EMERGENTE";

  return (
    <div className="flex flex-col gap-4 p-4 font-mono text-sm text-white h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-cyan-400">{country.country_name}</h2>
          <span className="text-xs text-gray-400">{country.country_code}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-lg"
            aria-label="Cerrar panel"
          >
            ×
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
          <p className="text-xs text-gray-400">Vacantes activas</p>
          <p className="text-2xl font-bold text-white">{country.job_count}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
          <p className="text-xs text-gray-400">Intensidad de mercado</p>
          <p className="text-xl font-bold text-orange-400">{country.intensity}/100</p>
          <p className="text-xs text-gray-500">{intensityLabel}</p>
        </div>
      </div>

      {/* Especialidades */}
      {country.top_specialties.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
          <p className="text-xs text-gray-400 mb-2">Top especialidades demandadas</p>
          <div className="space-y-2">
            {country.top_specialties.map((spec) => (
              <div key={spec} className="flex items-center gap-2">
                <div
                  className={`h-2 rounded-full ${LEVEL_BAR_COLOR[spec] ?? "bg-gray-600"}`}
                  style={{ width: `${Math.random() * 40 + 40}%` }}
                />
                <span className="text-xs text-gray-300 capitalize">{spec.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nivel de entrada */}
      <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
        <p className="text-xs text-gray-400 mb-1">💼 Nivel de entrada sugerido</p>
        <p className="text-white">Junior con certificaciones básicas (CompTIA Sec+, OSCP, CEH)</p>
      </div>

      {/* CTA */}
      <a
        href={`/jobs?country=${country.country_code}`}
        className="block w-full text-center bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg py-2 px-4 text-sm font-bold transition-colors"
      >
        Ver vacantes en {country.country_name} →
      </a>
    </div>
  );
}
