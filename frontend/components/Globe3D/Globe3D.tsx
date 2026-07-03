"use client";

import { useEffect, useRef, useCallback } from "react";

export interface GeoPoint {
  lat: number;
  lng: number;
  country_code: string;
  country_name: string;
  intensity: number; // 0-100
  job_count: number;
  top_specialties: string[];
}

interface Globe3DProps {
  data: GeoPoint[];
  onCountryClick?: (point: GeoPoint) => void;
  height?: string;
}

/**
 * Globe3D
 * Globo 3D interactivo usando globe.gl (WebGL / Three.js).
 * Muestra puntos de intensidad por pais, inspirado en WorldMonitor.
 *
 * Uso:
 *   <Globe3D data={geoPoints} onCountryClick={handleClick} />
 */
export default function Globe3D({
  data,
  onCountryClick,
  height = "600px",
}: Globe3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);

  const initGlobe = useCallback(async () => {
    if (!containerRef.current || typeof window === "undefined") return;

    // Importacion dinamica (evita SSR en Next.js)
    const Globe = (await import("globe.gl")).default;

    const globe = Globe()(containerRef.current)
      .globeImageUrl(
        "//unpkg.com/three-globe/example/img/earth-night.jpg"
      )
      .backgroundImageUrl(
        "//unpkg.com/three-globe/example/img/night-sky.png"
      )
      .pointsData(data)
      .pointLat((d: GeoPoint) => d.lat)
      .pointLng((d: GeoPoint) => d.lng)
      .pointColor((d: GeoPoint) => {
        // Escala de color: bajo=amarillo, medio=naranja, alto=rojo
        if (d.intensity >= 80) return "rgba(239,68,68,0.9)";   // rojo
        if (d.intensity >= 55) return "rgba(249,115,22,0.9)";  // naranja
        if (d.intensity >= 35) return "rgba(234,179,8,0.9)";   // amarillo
        return "rgba(34,197,94,0.6)";                          // verde tenue
      })
      .pointRadius((d: GeoPoint) => Math.max(0.3, d.intensity / 25))
      .pointAltitude((d: GeoPoint) => d.intensity / 500)
      .pointLabel((d: GeoPoint) =>
        `<div style="background:#111;padding:8px 12px;border-radius:8px;border:1px solid #333;font-family:monospace;">
          <b style="color:#22d3ee">${d.country_name}</b><br/>
          <span style="color:#aaa">Vacantes activas:</span> <b style="color:#fff">${d.job_count}</b><br/>
          <span style="color:#aaa">Intensidad:</span> <b style="color:#f97316">${d.intensity}/100</b><br/>
          <span style="color:#aaa">Top roles:</span> ${d.top_specialties.slice(0, 3).join(", ")}
        </div>`
      )
      .onPointClick((d: GeoPoint) => onCountryClick?.(d))
      .atmosphereColor("rgba(34,211,238,0.15)")
      .atmosphereAltitude(0.15);

    // Auto-rotacion suave
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.3;

    globeRef.current = globe;
  }, [data, onCountryClick]);

  useEffect(() => {
    initGlobe();
    return () => {
      if (globeRef.current) {
        globeRef.current._destructor?.();
      }
    };
  }, [initGlobe]);

  // Actualiza datos sin reinicializar
  useEffect(() => {
    if (globeRef.current && data.length > 0) {
      globeRef.current.pointsData(data);
    }
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height }}
      className="rounded-xl overflow-hidden bg-black"
      aria-label="Mapa 3D de oportunidades de ciberseguridad remota por pais"
    />
  );
}
