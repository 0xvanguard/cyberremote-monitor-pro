# 🔐 Seguridad — CyberRemote Monitor Pro

## Modelo de Amenazas

### Activos a Proteger
- Datos de vacantes y fuentes (integridad)
- Información de tenants gubernamentales (confidencialidad)
- Logs de auditoría (no repudio, integridad)
- Credenciales y tokens de integración
- Datos personales de usuarios (GDPR/LGPD)

### Vectores de Amenaza
| Amenaza | Impacto | Control |
|---------|---------|--------|
| Inyección SQL | Alto | SQLAlchemy ORM, queries parametrizadas |
| XSS / CSRF | Medio | CSP headers, SameSite cookies, CORS |
| Acceso no autorizado entre tenants | Alto | Row-Level Security (PostgreSQL RLS) |
| Exposición de API keys | Alto | Variables de entorno, Secret Manager |
| Scraping abusivo de fuentes | Medio | Rate limiting, robots.txt, backoff |
| Ataques DDoS | Medio | Rate limiting (Redis), WAF (Cloudflare) |
| Tokens comprometidos | Alto | JWT de corta vida + refresh tokens |

---

## Controles de Seguridad

### Autenticación y Autorización
- **JWT** (access token 15 min, refresh token 7 días)
- **OIDC/SAML** para SSO gubernamental e institucional
- **RBAC**: `admin` | `analyst` | `viewer` | `api-consumer`
- **Multi-tenant**: Row-Level Security en PostgreSQL por `tenant_id`

### Comunicaciones
- HTTPS obligatorio en todos los endpoints (TLS 1.2+)
- WebSocket sobre WSS
- HSTS, CSP, X-Frame-Options en headers HTTP

### Datos
- Cifrado en reposo: columnas sensibles con `pgcrypto`
- Cifrado en tránsito: TLS end-to-end
- PII mínimo: solo almacenar lo necesario, anonimización de logs

### Auditoría
- Todos los accesos a recursos sensibles se registran en `audit_logs`
- Inmutabilidad de logs (append-only, sin UPDATE/DELETE)
- Retención configurable por tenant (mín. 1 año para gubernamentales)

### Infraestructura
- Contenedores sin privilegios (non-root)
- Imágenes base mínimas (python:3.12-slim, node:20-alpine)
- Escaneo de vulnerabilidades con Trivy en CI/CD
- Secrets gestionados con variables de entorno o Vault

---

## Cumplimiento

| Estándar | Estado | Notas |
|----------|--------|-------|
| GDPR | En progreso | Minimización de datos, derecho al olvido |
| ISO 27001 | Roadmap | Controles A.5 – A.18 |
| SOC 2 Type I | Roadmap | Seguridad, disponibilidad, confidencialidad |
| LGPD (Brasil) | En progreso | Similar a GDPR |
| Ley 1581 (Colombia) | En progreso | Protección de datos personales |

---

## Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, **NO abras un issue público**.

Envía el reporte a: `security@[dominio-del-proyecto]`  
O usa [GitHub Security Advisories](https://github.com/0xvanguard/cyberremote-monitor-pro/security/advisories) (privado).

Incluir:
1. Descripción de la vulnerabilidad
2. Pasos para reproducir
3. Impacto estimado
4. Versión afectada

Responderemos en máximo 72 horas.
