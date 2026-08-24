# 🛡️ CyberRemote Monitor Pro

> **Intelligence Board Global de Empleo Remoto en Ciberseguridad**  
> El WorldMonitor de empleos remotos junior/semi-junior en ciberseguridad — a escala gubernamental y estratégica.

[![Live Demo](https://img.shields.io/badge/Live-GitHub%20Pages-blueviolet?style=flat-square)](https://0xvanguard.github.io/cyberremote-monitor-pro/)
[![CI](https://img.shields.io/github/actions/workflow/status/0xvanguard/cyberremote-monitor-pro/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/0xvanguard/cyberremote-monitor-pro/actions)
![Tests](https://img.shields.io/badge/tests-21%20passed-brightgreen?style=flat-square)
[![License](https://img.shields.io/badge/license-AGPL--3.0-blue?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)
[![Stack](https://img.shields.io/badge/stack-React%20%7C%20FastAPI%20%7C%20PostgreSQL%20%7C%20Globe.gl-informational?style=flat-square)](docs/ARCHITECTURE.md)

---

## 🌐 ¿Qué es CyberRemote Monitor Pro?

Una plataforma de inteligencia laboral global que permite a **gobiernos, agencias de ciberseguridad, ministerios de trabajo, universidades y programas de inserción** monitorear, priorizar y actuar sobre oportunidades remotas de talento junior en ciberseguridad a escala mundial.

Inspirando en [WorldMonitor](https://github.com/koala73/worldmonitor) — el panel de inteligencia geopolítica global — pero enfocado 100% en el mercado laboral remoto de ciberseguridad.

---

## ✨ Características Principales

| Módulo | Descripción |
|---|---|
| 🌍 **3D Globe + Choropleth** | Globo 3D (globe.gl) + mapa plano (deck.gl) con capas de densidad de vacantes, hubs, salarios y madurez de mercado |
| 📊 **Intelligence Dashboard** | Signal feed en tiempo real, ranking Top 10 países, KPIs nacionales, alertas tácticas |
| 🔍 **Búsqueda Avanzada** | Filtros por nivel, habilidad, idioma, zona horaria, tipo de contrato |
| 🏛️ **Modo Gobierno** | Multi-tenant, roles, reportes PDF/Excel, dashboards de política pública |
| 🔔 **Alertas Proactivas** | Email / Telegram / WhatsApp por ciudad, perfil o especialidad |
| 🤖 **IA Integrada** | Resumen de vacantes, matching de perfiles, predicción de tendencias |
| 🔐 **Enterprise Security** | Autenticación federada (OIDC/SAML), logs auditables, cifrado, multi-tenant |
| 🐳 **Self-hosted / Cloud** | Docker Compose + Kubernetes, despliegue soberano disponible |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  Globe 3D (globe.gl) + Dashboard + Intelligence Board   │
└────────────────────────┬────────────────────────────────┘
                         │ REST / WebSocket
┌────────────────────────▼────────────────────────────────┐
│                   BACKEND (FastAPI)                      │
│  jobs-ingestor │ geo-enricher │ analytics │ auth-service │
└──────┬─────────────────────────────────────┬────────────┘
       │                                     │
┌──────▼──────┐                    ┌─────────▼──────────┐
│ PostgreSQL  │                    │       Redis         │
│ + PostGIS   │                    │  Cache + Pub/Sub    │
└─────────────┘                    └────────────────────┘
```

Ver detalles completos en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 📁 Estructura del Repositorio

```
cyberremote-monitor-pro/
├── frontend/                  # App Next.js + React
│   ├── components/
│   │   ├── Globe3D/           # Globo 3D con globe.gl
│   │   ├── Dashboard/         # Intelligence Board principal
│   │   ├── SignalFeed/        # Feed en tiempo real
│   │   ├── CountryPanel/      # Panel lateral por país
│   │   └── GovernmentMode/    # Módulo gubernamental
│   ├── pages/
│   ├── styles/
│   └── package.json
│
├── backend/                   # API FastAPI (Python)
│   ├── app/
│   │   ├── api/               # Routers y endpoints
│   │   ├── services/
│   │   │   ├── jobs_ingestor/ # Scrapers y conectores
│   │   │   ├── geo_enricher/  # Geocodificación y clusters
│   │   │   └── analytics/     # KPIs, rankings, predicciones
│   │   ├── models/            # Modelos SQLAlchemy
│   │   ├── auth/              # JWT, OIDC, SAML, multi-tenant
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── infra/                     # Infraestructura
│   ├── docker-compose.yml     # Desarrollo local completo
│   ├── k8s/                   # Manifests Kubernetes
│   └── helm/                  # Helm charts (enterprise)
│
├── data/
│   ├── countries.json         # Dataset base de países
│   ├── schemas/               # Esquemas SQL
│   └── seeds/                 # Datos iniciales
│
├── docs/
│   ├── ARCHITECTURE.md        # Arquitectura detallada
│   ├── SECURITY.md            # Modelo de amenazas y controles
│   ├── GOVERNMENT_MODE.md     # Guía modo gubernamental
│   └── API.md                 # Referencia de endpoints
│
├── scripts/                   # ETL, scrapers, utilidades
│   ├── scrapers/
│   └── etl/
│
├── index.html                 # Prototipo estático (v1 legacy)
├── CONTRIBUTING.md
└── README.md
```

---

## 🚀 Inicio Rápido

### Opción 1 — Demo estático (v1 legacy, sin backend)

```bash
git clone https://github.com/0xvanguard/cyberremote-monitor-pro.git
cd cyberremote-monitor-pro
python3 -m http.server 8080
# Abre http://localhost:8080
```

### Opción 2 — Stack completo con Docker

```bash
git clone https://github.com/0xvanguard/cyberremote-monitor-pro.git
cd cyberremote-monitor-pro/infra
cp .env.example .env   # Configura variables
docker compose up -d
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
```

---

## 🗺️ Roadmap

### EPIC 1 — MVP WorldMonitor Jobs *(activo)*
- [x] Dashboard estático + mapa coroplético
- [x] Globo 3D básico (globe3d.js)
- [ ] Migrar frontend a Next.js con globe.gl
- [ ] API base FastAPI + PostgreSQL
- [ ] Capa geoespacial básica (vacantes por país/ciudad)

### EPIC 2 — Datos en Tiempo Real
- [ ] Conector RemoteOK API
- [ ] Conector We Work Remotely (scraping ético)
- [ ] Normalizador de vacantes junior/semi-junior
- [ ] WebSocket feed en tiempo real

### EPIC 3 — Módulo Gubernamental
- [ ] Multi-tenant (tenants, roles, permisos)
- [ ] KPIs por país/ciudad (volumen, oferta/demanda, especialidades)
- [ ] Exportables PDF/Excel
- [ ] API para consumo institucional externo

### EPIC 4 — Alertas y Contactos
- [ ] Suscripción por ciudad/perfil/especialidad
- [ ] Bot Telegram + WhatsApp
- [ ] Directorio de empresas, universidades, programas de talento

### EPIC 5 — IA y Analítica
- [ ] Resumen automático de vacantes (LLM)
- [ ] Matching perfil ↔ vacante
- [ ] Predicción de tendencias de demanda

---

## 🤝 Colaboradores Buscados

Buscamos colaboradores con experiencia en:

- **Geospatial Frontend** — React, globe.gl, deck.gl, Mapbox GL
- **Backend / Real-time** — FastAPI, WebSocket, Redis, Python
- **Data Engineering** — Scrapers, ETL, geocodificación, PostGIS
- **Security / DevSecOps** — Hardening, OIDC, logging, cumplimiento
- **UX/UI** — Dashboards de inteligencia, diseño de gobierno

Ver [`CONTRIBUTING.md`](CONTRIBUTING.md) para empezar.

---

## 🔐 Seguridad

Ver [`docs/SECURITY.md`](docs/SECURITY.md) para el modelo de amenazas, controles de seguridad y proceso de reporte de vulnerabilidades.

---

## 👤 Autor

**0xvanguard** — Cybersecurity | OSINT | DevSecOps | Application Security  
[github.com/0xvanguard](https://github.com/0xvanguard)

---

> *¿Listo para construir la próxima generación de inteligencia laboral remota a escala gubernamental?*
