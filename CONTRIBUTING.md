# 🤝 Guía de Contribución — CyberRemote Monitor Pro

¡Bienvenido/a! Este proyecto busca colaboradores para construir el **WorldMonitor de empleos remotos en ciberseguridad**.

---

## ¿Cómo Contribuir?

### 1. Forkea y clona el repo

```bash
git clone https://github.com/TU_USUARIO/cyberremote-monitor-pro.git
cd cyberremote-monitor-pro
```

### 2. Levanta el entorno de desarrollo

```bash
# Opción rápida — solo frontend estático (legacy v1)
python3 -m http.server 8080

# Stack completo (requiere Docker)
cd infra
cp .env.example .env
docker compose up -d
```

### 3. Crea una rama para tu feature

```bash
git checkout -b feat/nombre-de-tu-feature
# o
git checkout -b fix/descripcion-del-bug
```

### 4. Haz tus cambios, commitea y abre un PR

```bash
git add .
git commit -m "feat: descripción clara del cambio"
git push origin feat/nombre-de-tu-feature
```

Luego abre un Pull Request hacia `main` con descripción de qué hace y por qué.

---

## Perfiles de Colaboradores Buscados

| Perfil | Tareas |
|--------|--------|
| 🌍 Frontend Geospatial | React + globe.gl + deck.gl, capas del mapa, heatmaps |
| ⚙️ Backend / Real-time | FastAPI, WebSocket, Redis Pub/Sub, microservicios |
| 🗃️ Data Engineering | Scrapers, ETL, geocodificación, PostGIS |
| 🔐 Security / DevSecOps | OIDC, hardening, logging, Trivy, CI/CD seguro |
| 🎨 UX/UI | Diseño de dashboards de inteligencia, modo oscuro, accesibilidad |
| 📝 Docs | Documentación técnica, tutoriales, traducción |

---

## Issues para Empezar

Busca issues etiquetados con:
- `good first issue` — para nuevos colaboradores
- `help wanted` — necesitamos ayuda específica
- `geospatial` — visualización geoespacial
- `backend-api` — endpoints y servicios
- `data-pipeline` — scrapers y ETL
- `security` — controles y cumplimiento
- `docs` — documentación

---

## Estándares de Código

### Python (backend)
- Formato: `black` + `isort`
- Linting: `flake8` o `ruff`
- Tipos: `mypy` (strict recomendado)
- Tests: `pytest` con mínimo 70% cobertura en módulos nuevos

### TypeScript/JavaScript (frontend)
- Formato: `prettier`
- Linting: `eslint` con config `next/recommended`
- Tipos: TypeScript strict mode
- Tests: `jest` + `react-testing-library`

### Commits
Usar [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambio en documentación
refactor: refactorización sin cambio de comportamiento
test: agregar o corregir tests
chore: mantenimiento (deps, config)
```

---

## Código de Conducta

Este proyecto adopta el [Contributor Covenant](https://www.contributor-covenant.org/).  
Tratamos a todos los colaboradores con respeto, independientemente de su nivel de experiencia, país de origen o especialidad.

---

## Preguntas

Abre una [Discussion](https://github.com/0xvanguard/cyberremote-monitor-pro/discussions) o un issue con la etiqueta `question`.
