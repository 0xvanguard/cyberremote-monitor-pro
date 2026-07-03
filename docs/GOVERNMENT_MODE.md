# 🏛️ Modo Gobierno — CyberRemote Monitor Pro

## ¿Qué es el Modo Gobierno?

El Modo Gobierno es un conjunto de funcionalidades diseñadas para que **ministerios, agencias de ciberseguridad, universidades, ONGs y organismos multilaterales** puedan usar CyberRemote Monitor Pro como herramienta de inteligencia y formulación de políticas públicas de talento digital.

---

## Casos de Uso

| Organización | Caso de Uso |
|---|---|
| Ministerio de Trabajo | Monitorear demanda de talento en ciberseguridad por región, identificar brechas y diseñar programas de formación |
| Agencia de Ciberseguridad Nacional | Mapear disponibilidad de talento remoto local, detectar fuga de cerebros hacia mercados extranjeros |
| Universidad | Orientar a egresados hacia mercados con alta demanda, medir inserción laboral remota por programa |
| ONG / Programa de Becas | Identificar candidatos en regiones con menor acceso y conectarlos con oportunidades globales |
| Organismo Multilateral (OCDE, BID) | Construir índices regionales de madurez de mercado de ciberseguridad |

---

## Funcionalidades Exclusivas del Modo Gobierno

### 1. Multi-Tenant y Roles
- Cada organización tiene su propio espacio aislado (tenant)
- Roles: `gov-admin`, `analyst`, `report-viewer`, `api-consumer`
- SSO via OIDC/SAML con directorio institucional

### 2. Dashboards de Política Pública
- KPIs nacionales/regionales: volumen de vacantes, ratio oferta/demanda, especialidades más demandadas
- Comparativo histórico (tendencias mensuales/anuales)
- Proyecciones de demanda a 12/24 meses
- Segmentación por nivel (junior, semi-junior, mid), idioma, modalidad

### 3. Reportes Exportables
- PDF ejecutivo con branding de la institución
- Excel/CSV con datos crudos para análisis adicional
- Endpoint API JSON para integración con otros sistemas gubernamentales
- Programación automática de reportes (diario, semanal, mensual)

### 4. Panel de Alertas Institucionales
- Alertas cuando una región supera umbral de vacantes (oportunidad)
- Alertas de fuga de talento (empleos en el exterior con alta demanda local)
- Notificaciones a múltiples destinatarios institucionales

### 5. Integración con Fuentes Oficiales
- APIs de ministerios y agencias nacionales
- Datos de OCDE, Banco Mundial, OIT
- Importación de programas de becas y formación oficiales

---

## Requisitos de Despliegue Soberano

Para instituciones que requieren **soberanía de datos** (datos no salen del país):

```bash
# Despliegue on-premise con Kubernetes
git clone https://github.com/0xvanguard/cyberremote-monitor-pro.git
cd cyberremote-monitor-pro/infra/k8s

# Configurar valores soberanos
cp helm/values.yaml helm/values.sovereign.yaml
# Editar: imageRegistry, storageClass, ingressDomain, etc.

helm install cyberremote ./helm -f helm/values.sovereign.yaml
```

### Lista de verificación de despliegue soberano
- [ ] Imágenes Docker almacenadas en registry privado
- [ ] Base de datos PostgreSQL en infraestructura propia
- [ ] Redis en infraestructura propia
- [ ] Certificados TLS propios (no Let's Encrypt si se requiere)
- [ ] Backups automáticos en almacenamiento soberano
- [ ] Logs enviados a SIEM institucional
- [ ] Acceso a internet restringido (modo air-gap configurable)

---

## Estándares de Cumplimiento

Ver [`SECURITY.md`](SECURITY.md) para detalles completos.

- GDPR / LGPD / Ley 1581 (Colombia)
- ISO 27001 (en roadmap)
- SOC 2 Type I (en roadmap)
- Auditoría: todos los accesos quedan registrados en `audit_logs` (inmutables)

---

## Contacto para Implementación Gubernamental

Para demos, pilotos o implementaciones gubernamentales:  
📧 Abrir un issue con la etiqueta `government-inquiry` en este repositorio.
