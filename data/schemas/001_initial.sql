-- ============================================================
-- CyberRemote Monitor Pro — Schema inicial
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tenants (multi-tenant gubernamental)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('government', 'university', 'ngo', 'enterprise', 'individual')),
    country_code CHAR(2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password TEXT,
    role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('admin', 'analyst', 'viewer', 'api-consumer')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vacantes normalizadas
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    company VARCHAR(255),
    country_code CHAR(2),
    city VARCHAR(255),
    lat DECIMAL(9,6),
    lng DECIMAL(9,6),
    geom GEOMETRY(POINT, 4326) GENERATED ALWAYS AS
        (CASE WHEN lat IS NOT NULL AND lng IS NOT NULL
         THEN ST_SetSRID(ST_MakePoint(lng, lat), 4326) END) STORED,
    specialties TEXT[] DEFAULT '{}',
    level VARCHAR(50) CHECK (level IN ('junior', 'semi-junior', 'mid', 'senior')),
    contract_type VARCHAR(50),
    salary_min INT,
    salary_max INT,
    currency CHAR(3) DEFAULT 'USD',
    languages TEXT[] DEFAULT '{}',
    source VARCHAR(100),
    source_id VARCHAR(255),
    source_url TEXT,
    description_summary TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    posted_at TIMESTAMPTZ,
    ingested_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source, source_id)
);

-- Índices espaciales
CREATE INDEX IF NOT EXISTS idx_jobs_geom ON jobs USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_jobs_country ON jobs(country_code);
CREATE INDEX IF NOT EXISTS idx_jobs_level ON jobs(level);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active, posted_at DESC);

-- Entidades geográficas con métricas de mercado
CREATE TABLE IF NOT EXISTS geo_entities (
    id SERIAL PRIMARY KEY,
    country_code CHAR(2) NOT NULL,
    country_name VARCHAR(255),
    city VARCHAR(255),
    region VARCHAR(255),
    geom GEOMETRY(POINT, 4326),
    intensity_score DECIMAL(5,2) DEFAULT 0,
    job_count INT DEFAULT 0,
    avg_salary_usd INT,
    top_specialties JSONB DEFAULT '[]',
    market_maturity VARCHAR(50) DEFAULT 'emerging',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(country_code, city)
);

CREATE INDEX IF NOT EXISTS idx_geo_country ON geo_entities(country_code);
CREATE INDEX IF NOT EXISTS idx_geo_geom ON geo_entities USING GIST(geom);

-- Suscripciones a alertas
CREATE TABLE IF NOT EXISTS alert_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    country_code CHAR(2),
    city VARCHAR(255),
    specialty VARCHAR(100),
    level VARCHAR(50),
    channel VARCHAR(50) CHECK (channel IN ('email', 'telegram', 'whatsapp', 'slack')),
    channel_target TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs (inmutables — sin UPDATE/DELETE)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id, created_at DESC);
