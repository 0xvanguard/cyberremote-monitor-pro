# 🛡️ CyberRemote Monitor Pro

> **Intelligence Board Global de Empleo Remoto en Ciberseguridad**  
> El WorldMonitor de empleos remotos junior/semi-junior en ciberseguridad — a escala gubernamental y estratégica.

[![Live Demo](https://img.shields.io/badge/Live-GitHub%20Pages-blueviolet?style=flat-square)](https://0xvanguard.github.io/cyberremote-monitor-pro/)
[![CI](https://img.shields.io/github/actions/workflow/status/0xvanguard/cyberremote-monitor-pro/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/0xvanguard/cyberremote-monitor-pro/actions)
![Tests](https://img.shields.io/badge/tests-38%20passed-brightgreen?style=flat-square)
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
| 🗺️ **Mapa 2D Pro + Globo 3D** | Mapa coroplético con marcadores glow/pulso, viñeta atmosférica y capa de etiquetas + globo 3D con auto-rotación, atmósfera y vuelo de cámara |
| 🔍 **Búsqueda Global País/Ciudad** | Buscador flotante con 141 países y 60 ciudades cyber hub (aliases ES/EN, navegación por teclado ↑↓/Enter) — funciona en vista 2D y 3D |
| 🚀 **API MVP Funcional** | FastAPI + SQLAlchemy async (SQLite dev / PostgreSQL Docker): vacantes con filtros, analytics, rankings y KPIs — 38 tests |
| 📊 **Intelligence Dashboard** | Signal feed en tiempo real, ranking Top 10 países, KPIs nacionales, alertas tácticas |
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
├── backend/                   # API FastAPI (Python) — MVP funcional
│   ├── app/
│   │   ├── api/v1/            # Routers: jobs, analytics, countries, auth*, alerts*
│   │   ├── core/              # Config, database async, seed demo
│   │   ├── models/            # Modelo Job (SQLAlchemy async)
│   │   ├── services/
│   │   │   ├── jobs_ingestor/ # Conector RemoteOK + pipeline + upsert
│   │   │   └── geo_enricher/  # Actualización de métricas geo
│   │   └── main.py            # App FastAPI con lifespan (create_all + seed)
│   ├── tests/                 # 38 tests (API de integración + conectores)
│   ├── requirements.txt       # Dependencias mínimas del MVP
│   └── Dockerfile             # Imagen ligera (python:3.12-slim)
│
├── infra/                     # Infraestructura
│   ├── docker-compose.mvp.yml # ⭐ MVP: backend + PostgreSQL (healthchecks)
│   ├── docker-compose.yml     # Stack completo (planificado, requiere frontend)
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
├── index.html                 # Frontend v1 (mapa 2D + globo 3D + buscador)
├── map-pro.css                # Estilos del buscador global y marcadores glow
├── app.js                     # Lógica del mapa 2D, búsqueda y analytics
├── globe3d.js                 # Globo 3D (Three.js) con focusGlobeOn()
├── CONTRIBUTING.md
└── README.md
```

---

## 🚀 Inicio Rápido

### Opción 1 — ⭐ Backend MVP + PostgreSQL con Docker (recomendado)

```bash
git clone https://github.com/0xvanguard/cyberremote-monitor-pro.git
cd cyberremote-monitor-pro/infra
docker compose -f docker-compose.mvp.yml up --build
```

- **API Docs (Swagger):** http://localhost:8000/docs
- **Health:** http://localhost:8000/health
- Al arrancar, el backend crea las tablas y carga **16 vacantes demo** automáticamente (seed idempotente).

### Opción 2 — Backend sin Docker (dev local, cero infraestructura)

```bash
cd cyberremote-monitor-pro/backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# SQLite local por defecto — no necesita PostgreSQL ni Redis
```

### Opción 3 — Demo estático del frontend (sin backend)

```bash
git clone https://github.com/0xvanguard/cyberremote-monitor-pro.git
cd cyberremote-monitor-pro
python3 -m http.server 8080
# Abre http://localhost:8080 — mapa 2D + globo 3D + búsqueda país/ciudad
```

### Opción 4 — Stack completo (Next.js + Celery + Redis)

> ⚠️ Planificado: requiere el Dockerfile del frontend Next.js (EPIC 1 en curso).

```bash
cd cyberremote-monitor-pro/infra
cp .env.example .env   # Configura variables
docker compose up -d
```

---

## 📡 API MVP (EPIC 1)

Backend FastAPI con SQLAlchemy async. Usa SQLite en desarrollo local y PostgreSQL (`asyncpg`) en Docker vía `DATABASE_URL`.

### Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/jobs` | Vacantes activas con filtros: `country_code`, `city`, `level`, `specialty`, `language`, `q` (búsqueda libre), `limit`, `offset` |
| `GET` | `/api/v1/jobs/{id}` | Detalle de vacante |
| `GET` | `/api/v1/countries` | Países con conteo de vacantes y salario promedio (fuente del mapa coroplético) |
| `GET` | `/api/v1/analytics/rankings` | Top países por volumen, filtrable por `level` |
| `GET` | `/api/v1/analytics/kpis` | KPIs globales o por país: total, países, top especialidades, distribución por nivel |
| `POST` | `/api/v1/auth/login` | 🔜 EPIC 3 (responde 501 en el MVP) |
| `POST` | `/api/v1/alerts/subscribe` | 🔜 EPIC 4 (responde 501 en el MVP) |

### Ejemplos

```bash
# Vacantes junior SOC en Colombia
curl "http://localhost:8000/api/v1/jobs?country_code=CO&level=junior&specialty=soc"

# Búsqueda libre por texto
curl "http://localhost:8000/api/v1/jobs?q=penetration"

# KPIs globales
curl "http://localhost:8000/api/v1/analytics/kpis"

# Ranking de mercados para juniors
curl "http://localhost:8000/api/v1/analytics/rankings?level=junior"
```

### Niveles y especialidades válidos

- **level:** `junior` · `semi-junior` · `mid` · `senior`
- **specialty:** `pentesting` · `soc` · `cloud_security` · `devsecops` · `appsec` · `grc` · `osint` · `iam`

### Tests

```bash
cd backend
pip install -r requirements.txt
python -m pytest tests/ -v   # 38 tests — API de integración sobre SQLite temporal + conectores
```

---

## 🗺️ Roadmap

### EPIC 1 — MVP WorldMonitor Jobs *(activo)*
- [x] Dashboard estático + mapa coroplético
- [x] Globo 3D básico (globe3d.js) con vuelo de cámara (`focusGlobeOn`)
- [x] Búsqueda global de países y ciudades en vista 2D y 3D
- [x] API base FastAPI + PostgreSQL (`docker-compose.mvp.yml`, seed demo, 38 tests)
- [x] Endpoints de vacantes con filtros, analytics, rankings, KPIs y países
- [ ] Migrar frontend a Next.js con globe.gl
- [ ] Capa geoespacial PostGIS (columna `geom` + queries espaciales)

### EPIC 2 — Datos en Tiempo Real
- [x] Conector RemoteOK API (normalización + pipeline de upsert)
- [ ] Conectar el pipeline de ingesta a la BD del MVP end-to-end
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
