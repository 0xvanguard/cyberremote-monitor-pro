# 🌐 CyberRemote Monitor — World Jobs Intelligence

> Monitor mundial interactivo de empleo remoto junior en ciberseguridad.  
> Dashboard tipo intelligence board con mapa coroplético, panel lateral dinámico, ranking de mercados y signal feed.

[![GitHub Pages](https://img.shields.io/badge/Live-GitHub%20Pages-blueviolet?style=flat-square)](https://0xvanguard.github.io/cyberremote-monitor-pro/)

---

## ✨ Features

- **Mapa mundial coroplético** — países pintados por intensidad de mercado
- **Filtros interactivos** — empleo, servicios freelance, capacitación
- **Panel lateral dinámico** — intensidad, ruta sugerida, nivel, señales tácticas
- **Ranking top 5 mercados** — actualizado con el filtro activo
- **Signal feed** — microseñales orientadas a perfiles junior
- **KPIs globales** — conteos por región y tipo de oportunidad
- **100% estático** — HTML + CSS + JS + JSON, fácil de desplegar

---

## 🚀 Deploy local

```bash
git clone https://github.com/0xvanguard/cyberremote-monitor-pro.git
cd cyberremote-monitor-pro

# Con Python
python3 -m http.server 8080

# Con Node
npx serve .
```

Abre `http://localhost:8080`

---

## 📁 Estructura

```
/
├── index.html           # Markup principal
├── styles.css           # Estilos del dashboard
├── app.js               # Lógica del mapa, filtros, panel y feed
├── data/
│   └── countries.json   # Dataset de mercados (editable)
└── README.md
```

---

## 🗂️ Extender el dataset

Edita `data/countries.json` para agregar países o conectar a una API:

```json
{
  "XX": {
    "name": "País",
    "region": "Region",
    "intensity": 70,
    "jobs": 5,
    "freelance": 3,
    "training": 4,
    "salary": "Media",
    "route": "Ruta sugerida",
    "level": "Junior",
    "note": "Descripción táctica.",
    "signals": ["Señal 1", "Señal 2"],
    "latlng": [LAT, LNG]
  }
}
```

---

## 🔌 Roadmap

- [ ] Conectar a scraper o API de vacantes reales
- [ ] Autenticación + dashboard privado
- [ ] Newsletter / alertas semanales por país
- [ ] Marketplace de servicios junior
- [ ] SEO y sitemap para captación orgánica

---

## 👤 Autor

**0xvanguard** — Cybersecurity | OSINT | Application Security  
[github.com/0xvanguard](https://github.com/0xvanguard)