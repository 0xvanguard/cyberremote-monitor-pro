# 🏗️ Arquitectura — CyberRemote Monitor Pro

## Visión General

CyberRemote Monitor Pro sigue un modelo **API-first, real-time, multi-tenant** inspirado en WorldMonitor.
La plataforma se divide en 4 capas principales:

1. **Frontend** — Intelligence Board + 3D Globe
2. **Backend** — API REST/WebSocket + microservicios
3. **Datos** — PostgreSQL + PostGIS + Redis
4. **Infraestructura** — Docker / Kubernetes

---

## Diagrama de Componentes

```
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js + React + TypeScript)                         │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Globe3D     │  │ Dashboard    │  │ GovernmentMode         │  │
│  │ (globe.gl)  │  │ (Intel Board)│  │ (Multi-tenant, Exports)│  │
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ SignalFeed  │  │ CountryPanel │  │ AlertsModule           │  │
│  │ (real-time) │  │ (KPIs/Routes)│  │ (Telegram/Email/WA)    │  │
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS REST + WebSocket (WSS)
┌────────────────────────────▼─────────────────────────────────────┐
│  BACKEND (Python FastAPI)                                        │
│                                                                  │
│  ┌──────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ jobs-ingestor    │  │ geo-enricher    │  │ analytics      │  │
│  │ Scrapers/APIs    │  │ Geocodificación │  │ KPIs, Rankings │  │
│  │ Normalización    │  │ Clusters        │  │ Predicciones   │  │
│  └──────────────────┘  └─────────────────┘  └────────────────┘  │
│  ┌──────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ auth-service     │  │ alerts-service  │  │ ai-service     │  │
│  │ JWT/OIDC/SAML    │  │ Email/TG/WA     │  │ LLM Matching   │  │
│  │ Multi-tenant     │  │ Suscripciones   │  │ Resumen/Trends │  │
│  └──────────────────┘  └─────────────────┘  └────────────────┘  │
└──────────┬──────────────────────────────────────┬────────────────┘
           │                                      │
┌──────────▼──────────┐              ┌────────────▼───────────────┐
│  PostgreSQL + PostGIS│              │  Redis                     │
│  - jobs              │              │  - Caché API               │
│  - countries/cities  │              │  - Pub/Sub WebSocket       │
│  - tenants/users     │              │  - Colas de scraping       │
│  - audit_logs        │              │  - Rate limiting           │
└─────────────────────┘              └────────────────────────────┘
```

---

## Módulos del Backend

### `jobs-ingestor`
- Conectores a RemoteOK, We Work Remotely, LinkedIn (API), Glassdoor, Indeed
- Scraping ético con rate limiting y respeto de robots.txt
- Normalización a esquema unificado `Job`
- Clasificación automática: junior / semi-junior / mid
- Worker asíncrono con Celery + Redis

### `geo-enricher`
- Geocodificación de empresas y vacantes (lat/lng por ciudad/país)
- Agregación de métricas por `country_code`, `city`, `region`
- Cálculo de `intensity_score` (vacantes, salarios, hubs, tendencias)
- Actualización de capas geoespaciales del mapa

### `analytics-engine`
- KPIs en tiempo real: volumen de vacantes, ratio oferta/demanda
- Rankings dinámicos Top 10 países/ciudades
- Especialidades más demandadas (pentesting, SOC, cloud security, etc.)
- Proyecciones de demanda (modelos ML simples)
- Exportables: PDF, Excel, JSON

### `auth-service`
- JWT para usuarios individuales
- OIDC/SAML para integración gubernamental/universitaria
- Multi-tenant estricto: cada tenant tiene su vista aislada
- RBAC: admin, analyst, viewer, api-consumer

### `alerts-service`
- Suscripciones por país, ciudad, especialidad, nivel
- Canales: Email (SMTP/SendGrid), Telegram Bot, WhatsApp (Twilio)
- Motor de reglas configurable por tenant

### `ai-service`
- Resumen de vacantes con LLM (OpenAI / local LLM)
- Matching perfil ↔ vacante (embeddings)
- Clasificación y etiquetado automático
- Predicción de tendencias por región

---

## Modelo de Datos Principal

```sql
-- Tenants (multi-tenant)
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(50),  -- government | university | ngo | enterprise
  country_code CHAR(2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vacantes normalizadas
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  title VARCHAR(500),
  company VARCHAR(255),
  country_code CHAR(2),
  city VARCHAR(255),
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  specialties TEXT[],       -- pentesting, soc, cloud, devsecops...
  level VARCHAR(50),        -- junior | semi-junior | mid
  contract_type VARCHAR(50),-- full-time | part-time | freelance
  salary_min INT,
  salary_max INT,
  currency CHAR(3),
  languages TEXT[],
  source VARCHAR(100),
  source_url TEXT,
  posted_at TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Entidades geográficas con métricas
CREATE TABLE geo_entities (
  id SERIAL PRIMARY KEY,
  country_code CHAR(2),
  city VARCHAR(255),
  region VARCHAR(255),
  geom GEOMETRY(POINT, 4326),
  intensity_score DECIMAL(5,2),
  job_count INT DEFAULT 0,
  avg_salary_usd INT,
  top_specialties JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs (cumplimiento gubernamental)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID,
  action VARCHAR(100),
  resource VARCHAR(100),
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Flujo de Datos en Tiempo Real

```
[Fuentes externas] → [jobs-ingestor] → [PostgreSQL]
                                           ↓
                                    [geo-enricher]
                                           ↓
                                    [Redis Pub/Sub]
                                           ↓
                               [WebSocket Server (FastAPI)]
                                           ↓
                               [Frontend SignalFeed / Globe]
```

---

## Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | Next.js 14 + React + TypeScript | SSR, SEO, performance |
| 3D Globe | globe.gl + three.js | Inspirado en WorldMonitor, WebGL |
| Flat Map | deck.gl + Mapbox GL | Capas geoespaciales avanzadas |
| Backend | Python FastAPI | Async, tipado, documentación automática |
| Task Queue | Celery + Redis | Scrapers periódicos y alertas |
| Base de datos | PostgreSQL + PostGIS | Geodatos, queries espaciales |
| Caché | Redis | Real-time, rate limiting |
| Auth | JWT + OIDC (python-jose, authlib) | Gubernamental y enterprise |
| Infra | Docker Compose + Kubernetes | Dev local y despliegue soberano |
| CI/CD | GitHub Actions | Tests, linting, SAST (Trivy) |
