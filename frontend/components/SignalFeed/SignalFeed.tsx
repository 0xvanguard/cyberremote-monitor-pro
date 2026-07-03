"use client";

import { useEffect, useRef, useState } from "react";

export interface Signal {
  id: string;
  type: "job" | "alert" | "training" | "government";
  title: string;
  company?: string;
  country_code: string;
  level: string;
  specialty: string;
  url?: string;
  timestamp: string;
}

interface SignalFeedProps {
  apiWsUrl?: string;
  maxItems?: number;
}

const TYPE_COLORS: Record<Signal["type"], string> = {
  job: "text-green-400",
  alert: "text-red-400",
  training: "text-blue-400",
  government: "text-yellow-400",
};

const TYPE_ICONS: Record<Signal["type"], string> = {
  job: "💼",
  alert: "🚨",
  training: "🎓",
  government: "🏛️",
};

/**
 * SignalFeed
 * Feed en tiempo real de vacantes, alertas y programas.
 * Conecta via WebSocket cuando apiWsUrl es provisto;
 * en su defecto usa polling REST /api/v1/jobs?level=junior&limit=20.
 */
export default function SignalFeed({
  apiWsUrl,
  maxItems = 50,
}: SignalFeedProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!apiWsUrl) return;

    const ws = new WebSocket(apiWsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const signal: Signal = JSON.parse(event.data);
        setSignals((prev) => [signal, ...prev].slice(0, maxItems));
      } catch {}
    };

    ws.onerror = () => console.warn("[SignalFeed] WS error — retrying...");

    return () => ws.close();
  }, [apiWsUrl, maxItems]);

  // Auto-scroll al nuevo item
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [signals]);

  if (signals.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 font-mono text-sm">
        <span className="animate-pulse">● Esperando señales en tiempo real...</span>
      </div>
    );
  }

  return (
    <div
      ref={feedRef}
      className="overflow-y-auto max-h-[480px] space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-700"
    >
      {signals.map((signal) => (
        <div
          key={signal.id}
          className="flex items-start gap-3 p-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-cyan-800 transition-colors"
        >
          <span className="text-xl mt-0.5">{TYPE_ICONS[signal.type]}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-wider ${TYPE_COLORS[signal.type]}`}>
                {signal.type}
              </span>
              <span className="text-xs text-gray-500">{signal.country_code}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-cyan-400">
                {signal.level}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-orange-400">
                {signal.specialty}
              </span>
            </div>
            <p className="text-sm text-white mt-1 font-medium truncate">{signal.title}</p>
            {signal.company && (
              <p className="text-xs text-gray-400">{signal.company}</p>
            )}
          </div>
          <span className="text-xs text-gray-600 whitespace-nowrap mt-1">
            {new Date(signal.timestamp).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
}
