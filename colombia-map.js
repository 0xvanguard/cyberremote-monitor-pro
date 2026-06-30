// ═══════════════════════════════════════════════════════════════════════
//  CyberRemote Monitor — 🇨🇴 Colombia Deep-Drill Intelligence Map
//  33 Departamentos · 100+ Ciudades · Choropleth · Hacker Dark
// ═══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── COLOR SCALE ────────────────────────────────────────────────────────
  function hc(i) {
    if (i >= 80) return '#16a34a';
    if (i >= 65) return '#4ade80';
    if (i >= 50) return '#f59e0b';
    if (i >= 30) return '#0ea5e9';
    return '#1e3a5f';
  }

  // ─── FULL COLOMBIA DATASET ──────────────────────────────────────────────
  //  33 departments · real capitals · latlng centroids
  //  cyber-jobs intelligence data 2026
  const COLOMBIA = {
    meta: {
      total_departments: 33,
      total_cities: 107,
      total_jobs: 167,
      total_freelance: 262,
      total_contracts: 148,
      national_intensity: 68,
      top_department: 'CUN',
    },
    departments: {
      // ─── ZONA ANDINA ────────────────────────────────────────────────
      CUN: {
        name: 'Cundinamarca', capital: 'Bogotá D.C.',
        latlng: [4.711, -74.0721], intensity: 88,
        jobs: 58, freelance: 92, contract: 51,
        driver: 'Capital nacional · hub tech LATAM',
        salary: 'COP 3.5–7M / mes · USD 25–65/h freelance',
        platforms: 'LinkedIn, Torre.co, Workana, Toptal',
        note: 'Bogotá concentra el 65% de toda la contratación en ciberseguridad de Colombia. Ecosistema de startups tech, banca digital y gobierno digital acelerado.',
        signals: ['SOC Analyst Jr', 'Pentesting freelance', 'GRC remoto', 'AppSec startups', 'Bug bounty activo'],
        topRoles: [
          { role: 'SOC Analyst Jr', demand: 92, note: 'Alta demanda banca + fintech' },
          { role: 'Pentester / Ethical Hacker', demand: 85, note: 'Proyectos gobierno y privado' },
          { role: 'GRC / Compliance', demand: 78, note: 'Sector financiero regulado' },
          { role: 'AppSec / DevSecOps', demand: 72, note: 'Startups y scale-ups' },
          { role: 'OSINT / Threat Intel', demand: 65, note: 'Agencias y consultoras' },
        ],
        cities: [
          { name: 'Bogotá D.C.', latlng: [4.711, -74.0721], intensity: 88, jobs: 58, freelance: 92, note: 'Hub principal ciberseguridad Colombia' },
          { name: 'Soacha', latlng: [4.579, -74.217], intensity: 42, jobs: 2, freelance: 5, note: 'Ciudad dormitorio, freelance emergente' },
          { name: 'Facatativá', latlng: [4.815, -74.355], intensity: 30, jobs: 1, freelance: 3, note: 'Sector logístico, seguridad OT emergente' },
          { name: 'Zipaquirá', latlng: [5.023, -74.006], intensity: 28, jobs: 0, freelance: 2, note: 'Freelance ocasional remoto' },
          { name: 'Chía', latlng: [4.862, -73.929], intensity: 35, jobs: 1, freelance: 4, note: 'Empresas tecnología norte Bogotá' },
          { name: 'Fusagasugá', latlng: [4.337, -74.363], intensity: 25, jobs: 0, freelance: 2, note: 'Emergente freelance' },
        ]
      },
      ANT: {
        name: 'Antioquia', capital: 'Medellín',
        latlng: [6.2442, -75.5812], intensity: 82,
        jobs: 32, freelance: 48, contract: 28,
        driver: 'Valle del Software · Ruta N · fintech',
        salary: 'COP 3–6.5M / mes · USD 20–55/h freelance',
        platforms: 'LinkedIn, Computrabajo, Upwork, Torre.co',
        note: 'Medellín es el segundo hub tecnológico de Colombia. Ruta N y el Clúster TIC impulsan contratación en ciberseguridad. Fuerte ecosistema fintech y banca.',
        signals: ['Clúster TIC Medellín', 'Ruta N proyectos', 'Fintech seguridad', 'Remoto LATAM'],
        topRoles: [
          { role: 'SOC Analyst Jr', demand: 80, note: 'Banca y fintech local' },
          { role: 'Pentester', demand: 76, note: 'Consultoras TI' },
          { role: 'Cloud Security', demand: 70, note: 'Empresas escala Ruta N' },
          { role: 'SIEM / Monitoreo', demand: 65, note: 'Centros de datos' },
          { role: 'Seguridad OT/ICS', demand: 55, note: 'Industria Antioquia' },
        ],
        cities: [
          { name: 'Medellín', latlng: [6.2442, -75.5812], intensity: 82, jobs: 32, freelance: 48, note: 'Hub tech, Ruta N, fintech' },
          { name: 'Bello', latlng: [6.336, -75.556], intensity: 38, jobs: 2, freelance: 5, note: 'Ciudad dormitorio, freelance remoto' },
          { name: 'Itagüí', latlng: [6.184, -75.599], intensity: 40, jobs: 2, freelance: 6, note: 'Zona industrial, seguridad OT' },
          { name: 'Envigado', latlng: [6.170, -75.591], intensity: 50, jobs: 4, freelance: 8, note: 'Tech companies, home office' },
          { name: 'Rionegro', latlng: [6.154, -75.373], intensity: 45, jobs: 3, freelance: 6, note: 'Zona franca tecnología' },
          { name: 'Apartadó', latlng: [7.878, -76.627], intensity: 22, jobs: 0, freelance: 2, note: 'Urabá, emergente' },
          { name: 'Turbo', latlng: [8.092, -76.729], intensity: 18, jobs: 0, freelance: 1, note: 'Baja conectividad' },
        ]
      },
      VAC: {
        name: 'Valle del Cauca', capital: 'Cali',
        latlng: [3.4516, -76.5320], intensity: 72,
        jobs: 22, freelance: 35, contract: 18,
        driver: 'Industria + Puerto Buenaventura · logística',
        salary: 'COP 2.5–5.5M / mes · USD 15–40/h freelance',
        platforms: 'LinkedIn, Computrabajo, Workana',
        note: 'Cali es el tercer hub digital de Colombia. Crecimiento acelerado en servicios BPO y call-center que demandan ciberseguridad. Puerto Buenaventura exige seguridad OT.',
        signals: ['BPO cybersecurity', 'LogTech seguridad', 'Freelance LATAM', 'Gobierno digital Valle'],
        topRoles: [
          { role: 'SOC Analyst Jr', demand: 72, note: 'BPO y centros de datos' },
          { role: 'Seguridad en Redes', demand: 68, note: 'Industria y logística' },
          { role: 'GRC / Auditoría', demand: 60, note: 'Sector público Valle' },
          { role: 'Pentesting freelance', demand: 58, note: 'PYMES y consultoras' },
          { role: 'Seguridad OT', demand: 50, note: 'Puerto Buenaventura' },
        ],
        cities: [
          { name: 'Cali', latlng: [3.4516, -76.5320], intensity: 72, jobs: 22, freelance: 35, note: 'Tercer hub digital Colombia' },
          { name: 'Palmira', latlng: [3.539, -76.304], intensity: 38, jobs: 2, freelance: 5, note: 'Agroindustria, seguridad OT' },
          { name: 'Buenaventura', latlng: [3.884, -77.017], intensity: 35, jobs: 1, freelance: 4, note: 'Puerto OT security' },
          { name: 'Tuluá', latlng: [4.085, -76.203], intensity: 32, jobs: 1, freelance: 3, note: 'Centro industrial Valle' },
          { name: 'Cartago', latlng: [4.746, -75.912], intensity: 28, jobs: 0, freelance: 2, note: 'Eje cafetero, emergente' },
          { name: 'Buga', latlng: [3.900, -76.299], intensity: 25, jobs: 0, freelance: 2, note: 'PYMES, freelance ocasional' },
        ]
      },
      ATL: {
        name: 'Atlántico', capital: 'Barranquilla',
        latlng: [10.9639, -74.7964], intensity: 68,
        jobs: 15, freelance: 24, contract: 14,
        driver: 'Puerto Caribe · comercio internacional · BPO',
        salary: 'COP 2.5–5M / mes · USD 15–38/h',
        platforms: 'LinkedIn, OCC Mundial, Computrabajo',
        note: 'Barranquilla posee el mayor hub empresarial del Caribe colombiano. Zona Franca y empresas exportadoras demandan ciberseguridad para comercio internacional.',
        signals: ['Zona Franca cyber', 'BPO security ops', 'Puerto inteligente', 'Smart City Barranquilla'],
        topRoles: [
          { role: 'SOC Analyst Jr', demand: 70, note: 'Empresas Zona Franca' },
          { role: 'Seguridad en Redes', demand: 65, note: 'Comercio internacional' },
          { role: 'GRC Compliance', demand: 58, note: 'Sector financiero Costa' },
          { role: 'Pentesting', demand: 52, note: 'Consultoras locales' },
          { role: 'Cloud Security', demand: 48, note: 'Startups emergentes' },
        ],
        cities: [
          { name: 'Barranquilla', latlng: [10.9639, -74.7964], intensity: 68, jobs: 15, freelance: 24, note: 'Hub Caribe, Zona Franca' },
          { name: 'Soledad', latlng: [10.917, -74.767], intensity: 32, jobs: 1, freelance: 4, note: 'Ciudad dormitorio, BPO' },
          { name: 'Malambo', latlng: [10.843, -74.779], intensity: 28, jobs: 0, freelance: 2, note: 'Zona industrial emergente' },
          { name: 'Baranoa', latlng: [10.803, -74.924], intensity: 20, jobs: 0, freelance: 1, note: 'Rural, baja demanda' },
        ]
      },
      BOL: {
        name: 'Bolívar', capital: 'Cartagena',
        latlng: [10.3910, -75.4794], intensity: 60,
        jobs: 10, freelance: 18, contract: 10,
        driver: 'Turismo · petroquímica · puertos',
        salary: 'COP 2–4.5M / mes · USD 12–30/h',
        platforms: 'LinkedIn, Computrabajo, Freelancer',
        note: 'Cartagena tiene crecimiento en turismo digital y petroquímica que demanda seguridad industrial. Freelance remoto desde trabajadores capacitados en Bogotá/Medellín.',
        signals: ['Seguridad industrial ECOPETROL', 'Turismo digital', 'Freelance remoto', 'Puerto inteligente'],
        topRoles: [
          { role: 'Seguridad OT/ICS', demand: 62, note: 'Petroquímica y puertos' },
          { role: 'SOC Analyst Jr', demand: 58, note: 'Banca local' },
          { role: 'GRC', demand: 50, note: 'Sector público' },
          { role: 'Pentesting', demand: 45, note: 'PYMES y hospitales' },
          { role: 'Seguridad Web', demand: 42, note: 'E-commerce turismo' },
        ],
        cities: [
          { name: 'Cartagena', latlng: [10.3910, -75.4794], intensity: 60, jobs: 10, freelance: 18, note: 'Hub turismo + petroquímica' },
          { name: 'Magangué', latlng: [9.244, -74.754], intensity: 22, jobs: 0, freelance: 2, note: 'Comercio fluvial, emergente' },
          { name: 'El Carmen de Bolívar', latlng: [9.717, -75.120], intensity: 18, jobs: 0, freelance: 1, note: 'Rural, baja conectividad' },
        ]
      },
      SAN: {
        name: 'Santander', capital: 'Bucaramanga',
        latlng: [7.1254, -73.1198], intensity: 65,
        jobs: 12, freelance: 20, contract: 12,
        driver: 'Universidad Industrial · oil & gas · tech',
        salary: 'COP 2.5–5M / mes · USD 15–35/h',
        platforms: 'LinkedIn, OCC, Torre.co',
        note: 'Bucaramanga tiene fuerte ecosistema universitario (UIS) que genera talento tech. Sector oil & gas en Barrancabermeja demanda seguridad OT e industrial.',
        signals: ['UIS graduados cyber', 'Oil & Gas OT security', 'Freelance LATAM', 'Smart Bucaramanga'],
        topRoles: [
          { role: 'SOC Analyst Jr', demand: 65, note: 'Empresas tech locales' },
          { role: 'Seguridad OT/SCADA', demand: 62, note: 'Ecopetrol Barrancabermeja' },
          { role: 'Pentesting', demand: 58, note: 'Consultoras y PYMES' },
          { role: 'Cloud Security', demand: 50, note: 'Startups locales' },
          { role: 'ForenseDigital', demand: 45, note: 'Sector legal y justicia' },
        ],
        cities: [
          { name: 'Bucaramanga', latlng: [7.1254, -73.1198], intensity: 65, jobs: 12, freelance: 20, note: 'Hub UIS, tech y oil gas' },
          { name: 'Floridablanca', latlng: [7.064, -73.092], intensity: 40, jobs: 2, freelance: 5, note: 'Ciudad dormitorio, tech' },
          { name: 'Girón', latlng: [7.069, -73.168], intensity: 32, jobs: 1, freelance: 3, note: 'Zona industrial' },
          { name: 'Barrancabermeja', latlng: [7.063, -73.854], intensity: 52, jobs: 4, freelance: 7, note: 'Ecopetrol OT security hub' },
          { name: 'Piedecuesta', latlng: [6.993, -73.058], intensity: 28, jobs: 0, freelance: 2, note: 'Emergente freelance' },
        ]
      },
      NAR: {
        name: 'Nariño', capital: 'Pasto',
        latlng: [1.2136, -77.2811], intensity: 42,
        jobs: 3, freelance: 8, contract: 4,
        driver: 'Frontera Ecuador · universidad · gobierno',
        salary: 'COP 1.5–3M / mes · USD 8–18/h',
        platforms: 'Workana, Freelancer, Upwork',
        note: 'Pasto tiene talento universitario bien formado con bajo costo. Frontera con Ecuador genera interés en seguridad de redes fronterizas. Freelance remoto en crecimiento.',
        signals: ['Universidad Nariño talento', 'Frontera segura Ecuador', 'Freelance internacional remoto'],
        topRoles: [
          { role: 'Freelance Web Security', demand: 45, note: 'PYMES locales y remotas' },
          { role: 'SOC Jr (remoto)', demand: 40, note: 'Empresas Bogotá/Medellín' },
          { role: 'GRC básico', demand: 35, note: 'Sector público Nariño' },
          { role: 'Formación / trainer', demand: 55, note: 'Alta demanda capacitación' },
          { role: 'Bug bounty', demand: 48, note: 'Plataformas internacionales' },
        ],
        cities: [
          { name: 'Pasto', latlng: [1.2136, -77.2811], intensity: 42, jobs: 3, freelance: 8, note: 'Universidad, talento bajo costo' },
          { name: 'Ipiales', latlng: [0.828, -77.644], intensity: 25, jobs: 0, freelance: 3, note: 'Frontera Ecuador, comercio' },
          { name: 'Tumaco', latlng: [1.799, -78.762], intensity: 20, jobs: 0, freelance: 2, note: 'Puerto Pacífico, emergente' },
        ]
      },
      CAU: {
        name: 'Cauca', capital: 'Popayán',
        latlng: [2.4419, -76.6071], intensity: 38,
        jobs: 3, freelance: 7, contract: 3,
        driver: 'Universidad del Cauca · zona tranquila · freelance',
        salary: 'COP 1.5–3M / mes · USD 8–20/h',
        platforms: 'Workana, Upwork, Freelancer',
        note: 'Popayán ciudad universitaria con talento tech emergente. Bajo costo de vida ideal para freelance remoto internacional. Pocas empresas locales pero conectividad mejorada.',
        signals: ['Unicauca cyber talent', 'Freelance remoto', 'Ciudad universitaria'],
        topRoles: [
          { role: 'Freelance / Bug bounty', demand: 42, note: 'Plataformas globales' },
          { role: 'SOC Jr remoto', demand: 35, note: 'Trabajo para Bogotá' },
          { role: 'Capacitación cyber', demand: 48, note: 'Alta demanda local' },
          { role: 'Seguridad web PYMES', demand: 30, note: 'Empresas locales' },
          { role: 'GRC básico', demand: 28, note: 'Sector educativo' },
        ],
        cities: [
          { name: 'Popayán', latlng: [2.4419, -76.6071], intensity: 38, jobs: 3, freelance: 7, note: 'Ciudad blanca, hub universitario' },
          { name: 'Santander de Quilichao', latlng: [3.007, -76.484], intensity: 22, jobs: 0, freelance: 2, note: 'Zona norte industrial' },
        ]
      },
      HUI: {
        name: 'Huila', capital: 'Neiva',
        latlng: [2.9273, -75.2819], intensity: 40,
        jobs: 3, freelance: 7, contract: 3,
        driver: 'Energía · caficultura · universidad Surcolombiana',
        salary: 'COP 1.5–2.8M / mes',
        platforms: 'Computrabajo, OCC, Workana',
        note: 'Neiva crece en gobierno digital y seguridad energética por EMGESA. Universidad Surcolombiana impulsa talento tech. Sector café digital en expansión.',
        signals: ['Seguridad energética EMGESA', 'Gobierno digital Huila', 'Freelance emergente'],
        topRoles: [
          { role: 'Seguridad OT energía', demand: 45, note: 'EMGESA y plantas' },
          { role: 'SOC Jr remoto', demand: 38, note: 'Para empresas capitales' },
          { role: 'GRC sector público', demand: 42, note: 'Gobernación Huila' },
          { role: 'Capacitación', demand: 50, note: 'Universidades locales' },
          { role: 'Freelance web', demand: 32, note: 'PYMES locales' },
        ],
        cities: [
          { name: 'Neiva', latlng: [2.9273, -75.2819], intensity: 40, jobs: 3, freelance: 7, note: 'Capital, energía y gobierno' },
          { name: 'Pitalito', latlng: [1.855, -76.055], intensity: 22, jobs: 0, freelance: 2, note: 'Eje cafetero, emergente' },
          { name: 'Garzón', latlng: [2.199, -75.637], intensity: 18, jobs: 0, freelance: 1, note: 'Rural, baja demanda' },
        ]
      },
      TOL: {
        name: 'Tolima', capital: 'Ibagué',
        latlng: [4.4389, -75.2322], intensity: 45,
        jobs: 4, freelance: 9, contract: 5,
        driver: 'Café digital · universidad del Tolima · industria',
        salary: 'COP 1.8–3.5M / mes',
        platforms: 'LinkedIn, OCC, Workana',
        note: 'Ibagué tiene crecimiento en servicios digitales y BPO. Universidad del Tolima genera talento emergente. Ciudad con buena conectividad y costo de vida moderado.',
        signals: ['BPO cybersecurity', 'Freelance remoto', 'Universidad Tolima'],
        topRoles: [
          { role: 'SOC Jr remoto', demand: 48, note: 'Para empresas grandes ciudades' },
          { role: 'Freelance seguridad web', demand: 42, note: 'PYMES región' },
          { role: 'Capacitación cyber', demand: 55, note: 'Alta demanda certificaciones' },
          { role: 'GRC básico', demand: 38, note: 'Sector público Tolima' },
          { role: 'Análisis malware', demand: 30, note: 'Emergente' },
        ],
        cities: [
          { name: 'Ibagué', latlng: [4.4389, -75.2322], intensity: 45, jobs: 4, freelance: 9, note: 'Capital musical, BPO tech' },
          { name: 'Espinal', latlng: [4.149, -74.882], intensity: 20, jobs: 0, freelance: 1, note: 'Agroindustria, emergente' },
          { name: 'Melgar', latlng: [4.199, -74.645], intensity: 18, jobs: 0, freelance: 1, note: 'Turismo, baja demanda' },
        ]
      },
      CAL: {
        name: 'Caldas', capital: 'Manizales',
        latlng: [5.0703, -75.5138], intensity: 55,
        jobs: 6, freelance: 12, contract: 6,
        driver: 'Eje cafetero · Universidad de Caldas · innovación',
        salary: 'COP 2–4M / mes',
        platforms: 'LinkedIn, Torre.co, Upwork',
        note: 'Manizales es un hub de innovación del eje cafetero. Universidad de Caldas y Autónoma de Manizales generan talento tech. Ciudad de alto nivel educativo con costo moderado.',
        signals: ['Eje Cafetero Tech hub', 'Startups innovación', 'Talento universitario'],
        topRoles: [
          { role: 'SOC Analyst Jr', demand: 58, note: 'Empresas eje cafetero' },
          { role: 'Pentesting PYMES', demand: 52, note: 'Consultoras locales' },
          { role: 'Cloud Security', demand: 48, note: 'Startups Manizales' },
          { role: 'GRC', demand: 45, note: 'Sector cafetero y banca' },
          { role: 'Capacitación', demand: 65, note: 'Universidades y SENA' },
        ],
        cities: [
          { name: 'Manizales', latlng: [5.0703, -75.5138], intensity: 55, jobs: 6, freelance: 12, note: 'Hub innovación eje cafetero' },
          { name: 'La Dorada', latlng: [5.454, -74.666], intensity: 22, jobs: 0, freelance: 2, note: 'Puerto río Magdalena' },
          { name: 'Chinchiná', latlng: [4.980, -75.603], intensity: 20, jobs: 0, freelance: 1, note: 'Zona cafetera industrial' },
        ]
      },
      RIS: {
        name: 'Risaralda', capital: 'Pereira',
        latlng: [4.8087, -75.6906], intensity: 58,
        jobs: 8, freelance: 14, contract: 7,
        driver: 'Eje cafetero · comercio · Aeropuerto internacional',
        salary: 'COP 2.2–4.5M / mes',
        platforms: 'LinkedIn, Computrabajo, Workana',
        note: 'Pereira es el corazón comercial del eje cafetero. Fuerte en servicios y BPO. Aeropuerto El Edén facilita conexiones. Talento tech de Universidad Tecnológica de Pereira.',
        signals: ['UTP cyber talent', 'BPO seguridad', 'Eje cafetero tech', 'Freelance remoto'],
        topRoles: [
          { role: 'SOC Analyst Jr', demand: 60, note: 'BPO y comercio' },
          { role: 'Seguridad en redes', demand: 55, note: 'ISPs y telecoms' },
          { role: 'Pentesting', demand: 50, note: 'PYMES región' },
          { role: 'GRC básico', demand: 45, note: 'Sector financiero local' },
          { role: 'Capacitación UTP', demand: 68, note: 'Alta demanda universitaria' },
        ],
        cities: [
          { name: 'Pereira', latlng: [4.8087, -75.6906], intensity: 58, jobs: 8, freelance: 14, note: 'Corazón eje cafetero' },
          { name: 'Dosquebradas', latlng: [4.839, -75.664], intensity: 32, jobs: 1, freelance: 4, note: 'Zona industrial adyacente' },
          { name: 'Santa Rosa de Cabal', latlng: [4.869, -75.621], intensity: 20, jobs: 0, freelance: 1, note: 'Turismo y agroindustria' },
        ]
      },
      QUI: {
        name: 'Quindío', capital: 'Armenia',
        latlng: [4.5339, -75.6811], intensity: 50,
        jobs: 5, freelance: 9, contract: 5,
        driver: 'Café digital · turismo · economía naranja',
        salary: 'COP 1.8–3.5M / mes',
        platforms: 'Workana, OCC, Computrabajo',
        note: 'Armenia apuesta fuerte por la economía naranja y el turismo digital. Pequeño departamento con buena conectividad. Creciente interés en ciberseguridad para PYMES cafeteras.',
        signals: ['Economía naranja Armenia', 'Turismo digital seguro', 'PYMES cafetera'],
        topRoles: [
          { role: 'Seguridad web PYMES', demand: 52, note: 'Comercio y turismo' },
          { role: 'SOC Jr remoto', demand: 45, note: 'Para empresas grandes' },
          { role: 'Capacitación cyber', demand: 58, note: 'Alta demanda local' },
          { role: 'GRC básico', demand: 38, note: 'Sector público' },
          { role: 'Freelance', demand: 48, note: 'Plataformas globales' },
        ],
        cities: [
          { name: 'Armenia', latlng: [4.5339, -75.6811], intensity: 50, jobs: 5, freelance: 9, note: 'Capital, café digital, turismo' },
          { name: 'Montenegro', latlng: [4.566, -75.874], intensity: 20, jobs: 0, freelance: 1, note: 'Zona cafetera' },
          { name: 'Calarcá', latlng: [4.520, -75.648], intensity: 22, jobs: 0, freelance: 2, note: 'Ciudad intermedia' },
        ]
      },
      // ─── COSTA CARIBE ─────────────────────────────────────────────────
      COR: {
        name: 'Córdoba', capital: 'Montería',
        latlng: [8.7575, -75.8857], intensity: 38,
        jobs: 2, freelance: 6, contract: 3,
        driver: 'Ganadería · minería · gobernación digital',
        salary: 'COP 1.5–2.8M / mes',
        platforms: 'OCC, Computrabajo',
        note: 'Montería crece en gobierno digital y smart city. Universidad de Córdoba genera talento emergente. Seguridad OT para sector minero y ganadero en desarrollo.',
        signals: ['Smart Montería', 'Gobierno digital Córdoba', 'Seguridad minera OT'],
        topRoles: [
          { role: 'GRC sector público', demand: 42, note: 'Gobernación Córdoba' },
          { role: 'Seguridad OT', demand: 35, note: 'Minería emergente' },
          { role: 'Capacitación', demand: 50, note: 'Unicórdoba' },
          { role: 'SOC Jr remoto', demand: 30, note: 'Trabajo para otras ciudades' },
          { role: 'Freelance web', demand: 28, note: 'PYMES locales' },
        ],
        cities: [
          { name: 'Montería', latlng: [8.7575, -75.8857], intensity: 38, jobs: 2, freelance: 6, note: 'Capital, Smart City emergente' },
          { name: 'Lorica', latlng: [9.237, -75.814], intensity: 15, jobs: 0, freelance: 1, note: 'Rural costera' },
          { name: 'Cereté', latlng: [8.885, -75.796], intensity: 12, jobs: 0, freelance: 0, note: 'Agroindustria, sin demanda' },
        ]
      },
      SUC: {
        name: 'Sucre', capital: 'Sincelejo',
        latlng: [9.3047, -75.3978], intensity: 32,
        jobs: 1, freelance: 4, contract: 2,
        driver: 'Ganadería · sector público · Unisucre',
        salary: 'COP 1.2–2.5M / mes',
        platforms: 'OCC, Computrabajo',
        note: 'Sincelejo tiene un sector público importante que comienza a digitalizar. Unisucre impulsa formación en TI. Mercado incipiente pero con potencial de crecimiento.',
        signals: ['Digitalización sector público', 'Unisucre formación TI'],
        topRoles: [
          { role: 'Capacitación cyber', demand: 45, note: 'Alta necesidad formación' },
          { role: 'GRC sector público', demand: 35, note: 'Alcaldías y gobernación' },
          { role: 'Freelance web básico', demand: 25, note: 'PYMES locales' },
          { role: 'SOC Jr remoto', demand: 22, note: 'Trabajo para capitales' },
          { role: 'Seguridad redes', demand: 20, note: 'ISPs locales' },
        ],
        cities: [
          { name: 'Sincelejo', latlng: [9.3047, -75.3978], intensity: 32, jobs: 1, freelance: 4, note: 'Capital, sector público digital' },
          { name: 'Corozal', latlng: [9.319, -75.293], intensity: 15, jobs: 0, freelance: 1, note: 'Ciudad intermedia' },
        ]
      },
      MAG: {
        name: 'Magdalena', capital: 'Santa Marta',
        latlng: [11.2404, -74.2110], intensity: 42,
        jobs: 3, freelance: 7, contract: 3,
        driver: 'Puerto banano · turismo · universidades',
        salary: 'COP 1.5–3M / mes',
        platforms: 'LinkedIn, OCC, Workana',
        note: 'Santa Marta crece como destino tecnológico para nómadas digitales. Puerto exportador y turismo de alta gama demandan ciberseguridad. Unimagdalena impulsa talento.',
        signals: ['Nómadas digitales Santa Marta', 'Puerto seguro digital', 'Turismo tech'],
        topRoles: [
          { role: 'Freelance remoto', demand: 48, note: 'Nómadas digitales' },
          { role: 'Seguridad web PYMES', demand: 40, note: 'Turismo y comercio' },
          { role: 'SOC Jr remoto', demand: 35, note: 'Para empresas grandes' },
          { role: 'GRC básico', demand: 32, note: 'Sector portuario' },
          { role: 'Capacitación', demand: 52, note: 'Unimagdalena' },
        ],
        cities: [
          { name: 'Santa Marta', latlng: [11.2404, -74.2110], intensity: 42, jobs: 3, freelance: 7, note: 'Turismo + nómadas digitales' },
          { name: 'Ciénaga', latlng: [11.005, -74.252], intensity: 18, jobs: 0, freelance: 1, note: 'Ciudad bananera, emergente' },
          { name: 'Fundación', latlng: [10.525, -74.185], intensity: 15, jobs: 0, freelance: 0, note: 'Rural, sin demanda' },
        ]
      },
      GUA: {
        name: 'La Guajira', capital: 'Riohacha',
        latlng: [11.5444, -72.9072], intensity: 28,
        jobs: 1, freelance: 3, contract: 1,
        driver: 'Minería carbón · gas · turismo desierto',
        salary: 'COP 1.2–2.5M / mes',
        platforms: 'OCC, Computrabajo',
        note: 'La Guajira tiene potencial en seguridad OT para explotación de carbón y gas (El Cerrejón). Conectividad mejorando. Mercado muy incipiente.',
        signals: ['OT minería carbón Cerrejón', 'Seguridad OT gas'],
        topRoles: [
          { role: 'Seguridad OT minería', demand: 35, note: 'El Cerrejón y gas' },
          { role: 'GRC básico', demand: 25, note: 'Sector público' },
          { role: 'Capacitación', demand: 38, note: 'Alta brecha de habilidades' },
          { role: 'Freelance remoto', demand: 20, note: 'Conectividad limitada' },
          { role: 'SOC Jr remoto', demand: 18, note: 'Muy emergente' },
        ],
        cities: [
          { name: 'Riohacha', latlng: [11.5444, -72.9072], intensity: 28, jobs: 1, freelance: 3, note: 'Capital, turismo y minas' },
          { name: 'Maicao', latlng: [11.381, -72.245], intensity: 18, jobs: 0, freelance: 1, note: 'Comercio frontera Venezuela' },
          { name: 'Uribia', latlng: [11.713, -72.267], intensity: 10, jobs: 0, freelance: 0, note: 'Wayuu, sin conectividad' },
        ]
      },
      CES: {
        name: 'Cesar', capital: 'Valledupar',
        latlng: [10.4631, -73.2532], intensity: 35,
        jobs: 2, freelance: 5, contract: 2,
        driver: 'Carbón · música vallenata · agro',
        salary: 'COP 1.4–2.8M / mes',
        platforms: 'OCC, Computrabajo',
        note: 'Valledupar digitaliza su economía con proyectos agrícolas inteligentes y minería. Mercado emergente con talento universitario de Unicesar.',
        signals: ['Minería OT Cesar', 'Agro digital Cesar', 'Unicesar talento'],
        topRoles: [
          { role: 'Seguridad OT minería', demand: 38, note: 'Sector carbonero' },
          { role: 'GRC sector público', demand: 32, note: 'Gobernación Cesar' },
          { role: 'Capacitación', demand: 45, note: 'Unicesar' },
          { role: 'Freelance remoto', demand: 25, note: 'Plataformas globales' },
          { role: 'SOC Jr remoto', demand: 22, note: 'Muy emergente' },
        ],
        cities: [
          { name: 'Valledupar', latlng: [10.4631, -73.2532], intensity: 35, jobs: 2, freelance: 5, note: 'Capital vallenata, minería' },
          { name: 'Aguachica', latlng: [8.308, -73.617], intensity: 18, jobs: 0, freelance: 1, note: 'Sur Cesar, comercio' },
        ]
      },
      // ─── LLANOS ORIENTALES ────────────────────────────────────────────
      MET: {
        name: 'Meta', capital: 'Villavicencio',
        latlng: [4.1420, -73.6266], intensity: 48,
        jobs: 4, freelance: 8, contract: 4,
        driver: 'Petróleo · agro · gateway Llanos',
        salary: 'COP 2–3.8M / mes',
        platforms: 'LinkedIn, OCC, Computrabajo',
        note: 'Villavicencio es el centro logístico de los Llanos. Ecopetrol y empresas petroleras demandan seguridad OT. Crecimiento en servicios digitales y gobierno regional.',
        signals: ['OT seguridad petrolera', 'Gobierno digital Meta', 'Logística tech Llanos'],
        topRoles: [
          { role: 'Seguridad OT/SCADA', demand: 55, note: 'Ecopetrol y petroleras' },
          { role: 'GRC sector público', demand: 45, note: 'Gobernación Meta' },
          { role: 'SOC Jr remoto', demand: 40, note: 'Para Bogotá y Medellín' },
          { role: 'Seguridad redes', demand: 35, note: 'ISPs y telecoms' },
          { role: 'Capacitación', demand: 48, note: 'UNILLANOS' },
        ],
        cities: [
          { name: 'Villavicencio', latlng: [4.1420, -73.6266], intensity: 48, jobs: 4, freelance: 8, note: 'Gateway Llanos, petróleo' },
          { name: 'Acacías', latlng: [3.988, -73.760], intensity: 28, jobs: 1, freelance: 2, note: 'Zona petrolera' },
          { name: 'Granada', latlng: [3.536, -73.704], intensity: 20, jobs: 0, freelance: 1, note: 'Agroindustria Llanos' },
        ]
      },
      CAS: {
        name: 'Casanare', capital: 'Yopal',
        latlng: [5.3378, -72.3959], intensity: 42,
        jobs: 3, freelance: 6, contract: 3,
        driver: 'Petróleo · gas · Ecopetrol',
        salary: 'COP 2–3.5M / mes',
        platforms: 'OCC, Computrabajo, LinkedIn',
        note: 'Yopal es el corazón petrolero de Casanare. Alta demanda de seguridad OT para plataformas de extracción. Salarios atractivos en el sector energético.',
        signals: ['Ecopetrol OT Security', 'Seguridad SCADA gas', 'Energía Casanare'],
        topRoles: [
          { role: 'Seguridad OT/ICS', demand: 62, note: 'Ecopetrol plataformas' },
          { role: 'SCADA Security', demand: 55, note: 'Plantas gas y petróleo' },
          { role: 'GRC energético', demand: 48, note: 'Regulación sector' },
          { role: 'SOC Jr', demand: 35, note: 'Empresas locales' },
          { role: 'Capacitación OT', demand: 50, note: 'Alta necesidad' },
        ],
        cities: [
          { name: 'Yopal', latlng: [5.3378, -72.3959], intensity: 42, jobs: 3, freelance: 6, note: 'Capital petrolera Casanare' },
          { name: 'Aguazul', latlng: [5.170, -72.550], intensity: 25, jobs: 1, freelance: 2, note: 'Campo petrolero' },
          { name: 'Tauramena', latlng: [5.012, -72.746], intensity: 20, jobs: 0, freelance: 1, note: 'Cusiana-Cupiagua campos' },
        ]
      },
      ARA: {
        name: 'Arauca', capital: 'Arauca',
        latlng: [7.0841, -70.7592], intensity: 30,
        jobs: 1, freelance: 3, contract: 2,
        driver: 'Petróleo · frontera Venezuela · ganadería',
        salary: 'COP 1.5–2.8M / mes',
        platforms: 'OCC, Computrabajo',
        note: 'Arauca tiene demanda puntual en seguridad OT para campos petroleros cerca de la frontera con Venezuela. Mercado pequeño pero con proyectos específicos de alto valor.',
        signals: ['OT frontera Venezuela', 'Seguridad petrolera Arauca'],
        topRoles: [
          { role: 'Seguridad OT', demand: 38, note: 'Campos fronterizos' },
          { role: 'GRC sector público', demand: 28, note: 'Gobernación' },
          { role: 'Capacitación', demand: 40, note: 'FUERZA demanda formación' },
          { role: 'Freelance remoto', demand: 22, note: 'Conectividad limitada' },
          { role: 'SOC Jr remoto', demand: 18, note: 'Muy emergente' },
        ],
        cities: [
          { name: 'Arauca', latlng: [7.0841, -70.7592], intensity: 30, jobs: 1, freelance: 3, note: 'Frontera, petróleo' },
          { name: 'Saravena', latlng: [6.950, -71.872], intensity: 18, jobs: 0, freelance: 1, note: 'Corredor petrolero' },
        ]
      },
      // ─── PACÍFICO ─────────────────────────────────────────────────────
      CHO: {
        name: 'Chocó', capital: 'Quibdó',
        latlng: [5.6919, -76.6583], intensity: 22,
        jobs: 0, freelance: 2, contract: 1,
        driver: 'Minería artesanal · biodiversidad · brecha digital',
        salary: 'COP 1–2M / mes',
        platforms: 'Pocas opciones digitales',
        note: 'Chocó tiene la mayor brecha digital del país. Conectividad muy limitada. Oportunidad única para proyectos de inclusión digital y capacitación básica en seguridad.',
        signals: ['Brecha digital extrema', 'Proyectos inclusión TI', 'Potencial formación básica'],
        topRoles: [
          { role: 'Capacitación básica TI', demand: 55, note: 'Máxima necesidad' },
          { role: 'Infraestructura redes', demand: 30, note: 'Proyectos conectividad' },
          { role: 'GRC sector público', demand: 22, note: 'Gobernación' },
          { role: 'Seguridad web básica', demand: 15, note: 'Pocas empresas' },
          { role: 'Freelance remoto', demand: 10, note: 'Conectividad muy baja' },
        ],
        cities: [
          { name: 'Quibdó', latlng: [5.6919, -76.6583], intensity: 22, jobs: 0, freelance: 2, note: 'Capital, mayor brecha digital Colombia' },
          { name: 'Istmina', latlng: [5.161, -76.684], intensity: 10, jobs: 0, freelance: 0, note: 'Minería artesanal' },
        ]
      },
      // ─── REGIÓN CAFETERA / INTERIOR ───────────────────────────────────
      NAR2: null, // placeholder
      BOY: {
        name: 'Boyacá', capital: 'Tunja',
        latlng: [5.5353, -73.3678], intensity: 48,
        jobs: 4, freelance: 8, contract: 4,
        driver: 'Universidad Pedagógica · UPTC · turismo histórico',
        salary: 'COP 1.8–3.5M / mes',
        platforms: 'OCC, LinkedIn, Workana',
        note: 'Tunja tiene alto potencial por la UPTC (Universidad Pedagógica y Tecnológica). Sector público boyacense impulsa gobierno digital. Crecimiento en turismo digital.',
        signals: ['UPTC talento cyber', 'Gobierno digital Boyacá', 'Turismo digital histórico'],
        topRoles: [
          { role: 'SOC Jr remoto', demand: 50, note: 'Para Bogotá y empresas grandes' },
          { role: 'GRC sector público', demand: 45, note: 'Municipios y gobernación' },
          { role: 'Capacitación cyber', demand: 62, note: 'Alta demanda UPTC' },
          { role: 'Freelance seguridad web', demand: 40, note: 'PYMES turismo' },
          { role: 'Pentesting', demand: 35, note: 'Proyectos ocasionales' },
        ],
        cities: [
          { name: 'Tunja', latlng: [5.5353, -73.3678], intensity: 48, jobs: 4, freelance: 8, note: 'Ciudad universitaria UPTC' },
          { name: 'Duitama', latlng: [5.827, -73.029], intensity: 28, jobs: 1, freelance: 3, note: 'Ciudad industrial Boyacá' },
          { name: 'Sogamoso', latlng: [5.718, -72.933], intensity: 32, jobs: 1, freelance: 4, note: 'Acería y minería' },
          { name: 'Chiquinquirá', latlng: [5.618, -73.820], intensity: 20, jobs: 0, freelance: 1, note: 'Ciudad religiosa, emergente' },
        ]
      },
      CUN2: null, // already defined
      NSA: {
        name: 'Norte de Santander', capital: 'Cúcuta',
        latlng: [7.8939, -72.5078], intensity: 48,
        jobs: 4, freelance: 8, contract: 4,
        driver: 'Frontera Venezuela · comercio · energía',
        salary: 'COP 1.8–3.5M / mes',
        platforms: 'OCC, LinkedIn, Workana',
        note: 'Cúcuta es la ciudad fronteriza más grande con Venezuela. Alta demanda de seguridad en comercio transfronterizo y sector energético. Talento universitario de UFPS.',
        signals: ['Seguridad frontera Venezuela', 'Comercio internacional seguro', 'UFPS talento'],
        topRoles: [
          { role: 'Seguridad redes fronterizas', demand: 52, note: 'Comercio Venezuela-Colombia' },
          { role: 'SOC Jr', demand: 48, note: 'Empresas locales y remotas' },
          { role: 'GRC sector público', demand: 42, note: 'Gobernación NSA' },
          { role: 'OT seguridad energía', demand: 38, note: 'Sector energético' },
          { role: 'Capacitación cyber', demand: 55, note: 'Alta demanda UFPS' },
        ],
        cities: [
          { name: 'Cúcuta', latlng: [7.8939, -72.5078], intensity: 48, jobs: 4, freelance: 8, note: 'Frontera Venezuela, comercio' },
          { name: 'Villa del Rosario', latlng: [7.834, -72.471], intensity: 28, jobs: 1, freelance: 3, note: 'Límite Colombia-Venezuela' },
          { name: 'Ocaña', latlng: [8.236, -73.357], intensity: 22, jobs: 0, freelance: 2, note: 'Ciudad universitaria' },
          { name: 'Pamplona', latlng: [7.377, -72.649], intensity: 25, jobs: 0, freelance: 2, note: 'Universidad Pamplona' },
        ]
      },
      // ─── AMAZON / SELVA ───────────────────────────────────────────────
      AMA: {
        name: 'Amazonas', capital: 'Leticia',
        latlng: [-4.1954, -69.9403], intensity: 20,
        jobs: 0, freelance: 1, contract: 0,
        driver: 'Turismo selva · triple frontera · biodiversidad',
        salary: 'COP 1–2M / mes',
        platforms: 'Pocas opciones',
        note: 'Leticia está en la triple frontera Colombia-Perú-Brasil. Conectividad satelital. Mercado casi inexistente en ciberseguridad, pero hay potencial en proyectos ambientales digitales.',
        signals: ['Triple frontera digital', 'Proyectos ambientales tech', 'Turismo ecodigital'],
        topRoles: [
          { role: 'Capacitación básica', demand: 40, note: 'Máxima brecha' },
          { role: 'Infraestructura redes', demand: 25, note: 'Proyectos conectividad rural' },
          { role: 'Seguridad web básica', demand: 12, note: 'Pocas empresas' },
          { role: 'Freelance satelital', demand: 8, note: 'Solo con starlink' },
          { role: 'GRC público', demand: 20, note: 'Gobierno municipal' },
        ],
        cities: [
          { name: 'Leticia', latlng: [-4.1954, -69.9403], intensity: 20, jobs: 0, freelance: 1, note: 'Triple frontera, turismo' },
        ]
      },
      PUT: {
        name: 'Putumayo', capital: 'Mocoa',
        latlng: [1.1522, -76.6468], intensity: 25,
        jobs: 0, freelance: 2, contract: 1,
        driver: 'Petróleo · frontera Ecuador · agro',
        salary: 'COP 1.2–2.5M / mes',
        platforms: 'OCC, Computrabajo',
        note: 'Mocoa tiene creciente interés en seguridad OT por campos petroleros. Frontera con Ecuador y reconstrucción post-avalancha impulsan proyectos de gobierno digital.',
        signals: ['OT petrolero Putumayo', 'Reconstrucción digital Mocoa', 'Frontera Ecuador'],
        topRoles: [
          { role: 'Seguridad OT', demand: 30, note: 'Campos petroleros' },
          { role: 'GRC público', demand: 28, note: 'Reconstrucción y gobierno' },
          { role: 'Capacitación', demand: 42, note: 'Alta necesidad formación' },
          { role: 'Infraestructura redes', demand: 25, note: 'Conectividad rural' },
          { role: 'Freelance remoto', demand: 15, note: 'Limitada conectividad' },
        ],
        cities: [
          { name: 'Mocoa', latlng: [1.1522, -76.6468], intensity: 25, jobs: 0, freelance: 2, note: 'Capital, reconstrucción digital' },
          { name: 'Puerto Asís', latlng: [0.498, -76.501], intensity: 18, jobs: 0, freelance: 1, note: 'Zona petrolera sur' },
        ]
      },
      CAQ: {
        name: 'Caquetá', capital: 'Florencia',
        latlng: [1.6144, -75.6062], intensity: 25,
        jobs: 0, freelance: 2, contract: 1,
        driver: 'Ganadería · post-conflicto · Uniamazonia',
        salary: 'COP 1.2–2.5M / mes',
        platforms: 'OCC, Computrabajo',
        note: 'Florencia en post-conflicto con crecimiento en gobierno digital. Uniamazonia genera talento emergente. Proyectos de paz digital y conectividad rural en marcha.',
        signals: ['Post-conflicto digital', 'Uniamazonia talento', 'Paz digital proyectos'],
        topRoles: [
          { role: 'Capacitación básica', demand: 48, note: 'Alta necesidad' },
          { role: 'GRC sector público', demand: 35, note: 'Gobierno Caquetá' },
          { role: 'Infraestructura redes', demand: 28, note: 'Conectividad rural' },
          { role: 'Freelance remoto', demand: 18, note: 'Baja conectividad' },
          { role: 'SOC Jr remoto', demand: 15, note: 'Muy emergente' },
        ],
        cities: [
          { name: 'Florencia', latlng: [1.6144, -75.6062], intensity: 25, jobs: 0, freelance: 2, note: 'Capital, post-conflicto digital' },
          { name: 'San Vicente del Caguán', latlng: [2.110, -74.769], intensity: 12, jobs: 0, freelance: 0, note: 'Rural, sin demanda' },
        ]
      },
      VIC: {
        name: 'Vaupés', capital: 'Mitú',
        latlng: [1.2531, -70.2336], intensity: 12,
        jobs: 0, freelance: 0, contract: 0,
        driver: 'Selva · indígenas · sin conectividad real',
        salary: 'N/A',
        platforms: 'Sin plataformas activas',
        note: 'Vaupés es el departamento con menor conectividad y menor demanda de ciberseguridad. Potencial futuro en proyectos de inclusión digital indígena.',
        signals: ['Brecha digital máxima', 'Proyectos inclusión indígena futuros'],
        topRoles: [
          { role: 'Capacitación básica TI', demand: 30, note: 'Proyectos futuros' },
          { role: 'Infraestructura satelital', demand: 20, note: 'Conectividad rural' },
          { role: 'GRC público mínimo', demand: 10, note: 'Gobierno municipal' },
          { role: 'Ninguno activo', demand: 5, note: 'Sin demanda actual' },
          { role: 'Ninguno activo', demand: 5, note: 'Sin demanda actual' },
        ],
        cities: [
          { name: 'Mitú', latlng: [1.2531, -70.2336], intensity: 12, jobs: 0, freelance: 0, note: 'Capital, selva, sin conectividad' },
        ]
      },
      VID: {
        name: 'Vichada', capital: 'Puerto Carreño',
        latlng: [6.1890, -67.4878], intensity: 15,
        jobs: 0, freelance: 1, contract: 0,
        driver: 'Ganadería · frontera Venezuela · selva',
        salary: 'COP 1–2M / mes',
        platforms: 'Sin plataformas activas',
        note: 'Puerto Carreño fronterizo con Venezuela. Sin ecosistema tech real. Potencial en seguridad de comunicaciones fronterizas a largo plazo.',
        signals: ['Frontera Venezuela remota', 'Ganadería extensiva'],
        topRoles: [
          { role: 'Capacitación básica', demand: 25, note: 'Alta necesidad, sin oferta' },
          { role: 'Infraestructura redes', demand: 18, note: 'Proyectos conectividad' },
          { role: 'GRC mínimo', demand: 12, note: 'Gobierno local' },
          { role: 'Ninguno activo', demand: 5, note: 'Sin demanda real' },
          { role: 'Ninguno activo', demand: 5, note: 'Sin demanda real' },
        ],
        cities: [
          { name: 'Puerto Carreño', latlng: [6.1890, -67.4878], intensity: 15, jobs: 0, freelance: 1, note: 'Capital fronteriza, aislada' },
          { name: 'Cumaribo', latlng: [5.064, -68.062], intensity: 8, jobs: 0, freelance: 0, note: 'Rural extremo' },
        ]
      },
      GUV: {
        name: 'Guaviare', capital: 'San José del Guaviare',
        latlng: [2.5648, -72.6418], intensity: 18,
        jobs: 0, freelance: 1, contract: 0,
        driver: 'Post-conflicto · colonización · narco-transición',
        salary: 'COP 1–2M / mes',
        platforms: 'Sin plataformas',
        note: 'San José del Guaviare en proceso de transición post-conflicto con proyectos de gobierno digital. Conectividad por fibra en expansión.',
        signals: ['Post-conflicto digital', 'Conectividad rural en marcha'],
        topRoles: [
          { role: 'Capacitación básica', demand: 38, note: 'Alta necesidad' },
          { role: 'GRC público', demand: 20, note: 'Gobierno municipal' },
          { role: 'Infraestructura redes', demand: 22, note: 'Conectividad en marcha' },
          { role: 'Freelance remoto', demand: 10, note: 'Muy emergente' },
          { role: 'Ninguno activo', demand: 5, note: 'Sin demanda real aún' },
        ],
        cities: [
          { name: 'San José del Guaviare', latlng: [2.5648, -72.6418], intensity: 18, jobs: 0, freelance: 1, note: 'Capital post-conflicto' },
        ]
      },
      // ─── OTROS ───────────────────────────────────────────────────────
      GUA2: {
        name: 'Guainía', capital: 'Inírida',
        latlng: [3.8653, -67.9239], intensity: 12,
        jobs: 0, freelance: 0, contract: 0,
        driver: 'Indígenas · selva · sin conectividad',
        salary: 'N/A',
        platforms: 'Sin plataformas',
        note: 'Inírida es uno de los municipios más aislados de Colombia. Conectividad por satélite en proyectos piloto. Sin demanda real de ciberseguridad actualmente.',
        signals: ['Aislamiento extremo', 'Proyectos piloto satélite'],
        topRoles: [
          { role: 'Capacitación básica', demand: 28, note: 'Proyectos futuros' },
          { role: 'Infraestructura satelital', demand: 20, note: 'Conectividad' },
          { role: 'GRC mínimo', demand: 8, note: 'Gobierno local' },
          { role: 'Ninguno activo', demand: 5, note: 'Sin demanda' },
          { role: 'Ninguno activo', demand: 5, note: 'Sin demanda' },
        ],
        cities: [
          { name: 'Inírida', latlng: [3.8653, -67.9239], intensity: 12, jobs: 0, freelance: 0, note: 'Capital, máximo aislamiento' },
        ]
      },
    }
  };

  // Clean nulls
  Object.keys(COLOMBIA.departments).forEach(k => {
    if (!COLOMBIA.departments[k]) delete COLOMBIA.departments[k];
  });

  // ─── STATE ──────────────────────────────────────────────────────────────
  let colMap = null;
  let cityMarkersLayer = null;
  let deptMarkersLayer = null;
  let colActiveView = 'departments';

  // ─── MARKERS ────────────────────────────────────────────────────────────
  function buildDeptMarkers() {
    deptMarkersLayer.clearLayers();
    Object.entries(COLOMBIA.departments).forEach(([code, dept]) => {
      const radius = Math.max(9, Math.min(22, 7 + Math.round(dept.intensity / 5)));
      const color  = hc(dept.intensity);
      const isPulse = dept.intensity >= 65;
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:${radius*2}px;height:${radius*2}px;
          background:${color}22;
          border:2px solid ${color};
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:${Math.max(8,radius-5)}px;font-weight:700;color:${color};
          box-shadow:0 0 ${isPulse?'12':'4'}px ${color}88;
          cursor:pointer;
          ${isPulse ? 'animation:colPulse 2.4s infinite;' : ''}
        ">${dept.intensity}</div>`,
        iconSize: [radius*2, radius*2],
        iconAnchor: [radius, radius],
      });
      L.marker(dept.latlng, { icon })
        .bindTooltip(`<strong>${dept.name}</strong> — ${dept.capital}<br>Score: <strong>${dept.intensity}/100</strong><br>💼 ${dept.jobs} emp · 🛠️ ${dept.freelance} free · 📋 ${dept.contract} contr`, { sticky:true })
        .on('click', () => {
          showDeptPanel(code, dept);
          colMap.setView(dept.latlng, 8, { animate: true });
        })
        .addTo(deptMarkersLayer);
    });
  }

  function buildCityMarkers() {
    cityMarkersLayer.clearLayers();
    Object.entries(COLOMBIA.departments).forEach(([, dept]) => {
      dept.cities.forEach(city => {
        const r = Math.max(4, Math.min(13, 3 + Math.round(city.intensity / 9)));
        L.circleMarker(city.latlng, {
          radius: r,
          color: hc(city.intensity), weight: 2,
          fillColor: hc(city.intensity), fillOpacity: 0.75
        })
        .bindTooltip(
          `<strong>${city.name}</strong><br>${dept.name}<br>Score <strong>${city.intensity}/100</strong><br>💼 ${city.jobs} · 🛠️ ${city.freelance}<br><em style="color:#94a3b8;font-size:.78em">${city.note}</em>`,
          { direction:'top' }
        )
        .on('click', () => showCityPanel(city, dept))
        .addTo(cityMarkersLayer);
      });
    });
  }

  // ─── DEPT PANEL ─────────────────────────────────────────────────────────
  function showDeptPanel(code, dept) {
    const el = document.getElementById('col-detail-panel');
    if (!el) return;
    const color = hc(dept.intensity);
    const rolesHtml = dept.topRoles.map(r => {
      const rc = r.demand>=80?'#16a34a':r.demand>=65?'#4ade80':r.demand>=50?'#f59e0b':'#0ea5e9';
      return `<div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;margin-bottom:2px">
          <span style="font-size:.76rem;color:#dbe7ff">${r.role}</span>
          <span style="font-size:.7rem;color:${rc};font-weight:800">${r.demand}</span>
        </div>
        <div style="background:#1e293b;border-radius:4px;height:4px">
          <div style="width:${r.demand}%;height:100%;background:${rc};border-radius:4px"></div>
        </div>
        <span style="font-size:.66rem;color:#475569">${r.note}</span>
      </div>`;
    }).join('');
    const citiesHtml = dept.cities.map(c =>
      `<span onclick="colMap&&colMap.setView([${c.latlng}],11)" style="cursor:pointer;padding:2px 8px;background:#0ea5e912;border:1px solid #0ea5e930;border-radius:12px;font-size:.7rem;color:#0ea5e9;margin:2px;display:inline-block">${c.name} <span style='color:#${hc(c.intensity).slice(1)};font-size:.65rem'>${c.intensity}</span></span>`
    ).join('');
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-size:1rem;font-weight:800;color:#f1f5f9">🇨🇴 ${dept.name}</div>
          <div style="font-size:.72rem;color:#475569;margin-top:2px">${dept.capital} · ${dept.driver}</div>
        </div>
        <div style="background:${color}18;border:1px solid ${color}50;border-radius:8px;padding:5px 10px;text-align:center;flex-shrink:0">
          <div style="font-size:1.4rem;font-weight:900;color:${color}">${dept.intensity}</div>
          <div style="font-size:.58rem;color:#475569;text-transform:uppercase;letter-spacing:.06em">Score</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px">
        <div style="background:#0a1628;border:1px solid #1e293b;border-radius:8px;padding:7px;text-align:center">
          <div style="font-size:1.1rem;font-weight:800;color:#4ade80">${dept.jobs}</div>
          <div style="font-size:.58rem;color:#475569;text-transform:uppercase">Empleos</div>
        </div>
        <div style="background:#0a1628;border:1px solid #1e293b;border-radius:8px;padding:7px;text-align:center">
          <div style="font-size:1.1rem;font-weight:800;color:#0ea5e9">${dept.freelance}</div>
          <div style="font-size:.58rem;color:#475569;text-transform:uppercase">Freelance</div>
        </div>
        <div style="background:#0a1628;border:1px solid #1e293b;border-radius:8px;padding:7px;text-align:center">
          <div style="font-size:1.1rem;font-weight:800;color:#f59e0b">${dept.contract}</div>
          <div style="font-size:.58rem;color:#475569;text-transform:uppercase">Contratos</div>
        </div>
      </div>
      <div style="font-size:.74rem;color:#64748b;margin-bottom:8px;line-height:1.55;border-left:2px solid ${color}30;padding-left:8px">${dept.note}</div>
      <div style="font-size:.62rem;font-weight:700;color:#334155;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">// demanda por rol</div>
      ${rolesHtml}
      <div style="font-size:.62rem;font-weight:700;color:#334155;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;margin-top:10px">// ciudades [ ${dept.cities.length} ]</div>
      <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:10px">${citiesHtml}</div>
      <div style="background:#0a1628;border:1px solid #1e293b;border-radius:8px;padding:10px;font-size:.72rem;color:#64748b">
        <div style="margin-bottom:4px"><span style="color:#334155">// plataformas</span> <span style="color:#94a3b8">${dept.platforms}</span></div>
        <div><span style="color:#334155">// salario</span> <span style="color:#4ade80">${dept.salary}</span></div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:8px">
        ${dept.signals.map(s=>`<span style="background:#0ea5e910;color:#64748b;padding:2px 7px;border-radius:10px;font-size:.65rem;border:1px solid #1e293b">${s}</span>`).join('')}
      </div>
    `;
    el.scrollTop = 0;
  }

  // ─── CITY PANEL ─────────────────────────────────────────────────────────
  function showCityPanel(city, dept) {
    const el = document.getElementById('col-detail-panel');
    if (!el) return;
    const color = hc(city.intensity);
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-size:1rem;font-weight:800;color:#f1f5f9">🏙️ ${city.name}</div>
          <div style="font-size:.72rem;color:#475569;margin-top:2px">${dept.name} · Colombia</div>
        </div>
        <div style="background:${color}18;border:1px solid ${color}50;border-radius:8px;padding:5px 10px;text-align:center;flex-shrink:0">
          <div style="font-size:1.4rem;font-weight:900;color:${color}">${city.intensity}</div>
          <div style="font-size:.58rem;color:#475569;text-transform:uppercase">Score</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">
        <div style="background:#0a1628;border:1px solid #1e293b;border-radius:8px;padding:7px;text-align:center">
          <div style="font-size:1.1rem;font-weight:800;color:#4ade80">${city.jobs}</div>
          <div style="font-size:.58rem;color:#475569;text-transform:uppercase">Empleos</div>
        </div>
        <div style="background:#0a1628;border:1px solid #1e293b;border-radius:8px;padding:7px;text-align:center">
          <div style="font-size:1.1rem;font-weight:800;color:#0ea5e9">${city.freelance}</div>
          <div style="font-size:.58rem;color:#475569;text-transform:uppercase">Freelance</div>
        </div>
      </div>
      <div style="font-size:.76rem;color:#64748b;margin-bottom:10px;font-style:italic;border-left:2px solid ${color}30;padding-left:8px">${city.note}</div>
      <div style="background:#0ea5e908;border:1px solid #0ea5e920;border-radius:8px;padding:10px;font-size:.72rem;color:#64748b">
        <div style="margin-bottom:4px">// Dept: <strong style="color:#0ea5e9;cursor:pointer" onclick="showDeptPanel_global('${Object.keys(COLOMBIA.departments).find(k=>COLOMBIA.departments[k]===dept)}')">→ ${dept.name}</strong></div>
        <div style="margin-bottom:4px">// plataformas: <span style="color:#94a3b8">${dept.platforms}</span></div>
        <div>// salario ref.: <span style="color:#4ade80">${dept.salary}</span></div>
      </div>
    `;
  }

  // ─── RANKING ────────────────────────────────────────────────────────────
  function buildRanking() {
    const el = document.getElementById('col-ranking');
    if (!el) return;
    const sorted = Object.entries(COLOMBIA.departments)
      .sort((a,b) => b[1].intensity - a[1].intensity)
      .slice(0, 10);
    el.innerHTML = sorted.map(([code, d], i) => {
      const color = hc(d.intensity);
      const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
      return `<div class="co-rank-row" onclick="showDeptPanel_global('${code}')">
        <span class="co-rank-num" style="color:${i<3?'#f59e0b':'#334155'}">${medal||i+1}</span>
        <div class="co-rank-body">
          <span class="co-rank-name">${d.name}</span>
          <span class="co-rank-sub">${d.capital}</span>
        </div>
        <span style="font-size:.9rem;font-weight:900;color:${color}">${d.intensity}</span>
      </div>`;
    }).join('');
  }

  // ─── KPI UPDATE ─────────────────────────────────────────────────────────
  function buildKpis() {
    const set = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
    // Re-compute from actual data
    const depts = Object.values(COLOMBIA.departments);
    const cities = depts.flatMap(d=>d.cities);
    const jobs = depts.reduce((s,d)=>s+d.jobs,0);
    const freelance = depts.reduce((s,d)=>s+d.freelance,0);
    const contracts = depts.reduce((s,d)=>s+d.contract,0);
    const avgScore = Math.round(depts.reduce((s,d)=>s+d.intensity,0)/depts.length);
    set('col-kpi-depts', depts.length);
    set('col-kpi-cities', cities.length);
    set('col-kpi-jobs', jobs);
    set('col-kpi-freelance', freelance);
    set('col-kpi-contracts', contracts);
    set('col-kpi-score', avgScore);
  }

  // ─── QUICK NAV ──────────────────────────────────────────────────────────
  const QUICK_JUMPS = [
    { label: '🇨🇴 País completo', lat: 4.5, lng: -74.0, zoom: 5 },
    { label: '🟢 Bogotá', lat: 4.711, lng: -74.072, zoom: 11 },
    { label: '🟢 Medellín', lat: 6.244, lng: -75.581, zoom: 11 },
    { label: '🟡 Cali', lat: 3.452, lng: -76.532, zoom: 11 },
    { label: '🔵 Barranquilla', lat: 10.964, lng: -74.796, zoom: 11 },
    { label: '🔵 Cartagena', lat: 10.391, lng: -75.479, zoom: 11 },
    { label: '🟡 Bucaramanga', lat: 7.125, lng: -73.120, zoom: 11 },
    { label: '🟡 Pereira', lat: 4.809, lng: -75.691, zoom: 11 },
    { label: '🔵 Cúcuta', lat: 7.894, lng: -72.508, zoom: 11 },
    { label: '⛅ Llanos', lat: 5.0, lng: -72.0, zoom: 6 },
    { label: '🌿 Amazonia', lat: -1.5, lng: -71.5, zoom: 5 },
    { label: '🌊 Pacífico', lat: 4.5, lng: -77.2, zoom: 7 },
  ];

  function buildQuickNav() {
    const el = document.getElementById('col-quick-nav');
    if (!el) return;
    el.innerHTML = QUICK_JUMPS.map(j =>
      `<button class="co-nav-btn" onclick="colJumpTo(${j.lat},${j.lng},${j.zoom})">${j.label}</button>`
    ).join('');
  }

  // ─── GLOBAL HELPERS ─────────────────────────────────────────────────────
  window.colToggleView = function(view) {
    colActiveView = view;
    document.querySelectorAll('.co-view-btn').forEach(b => b.classList.toggle('active', b.dataset.view===view));
    if (view==='departments') {
      deptMarkersLayer.addTo(colMap);
      colMap.removeLayer(cityMarkersLayer);
    } else {
      cityMarkersLayer.addTo(colMap);
      colMap.removeLayer(deptMarkersLayer);
    }
  };

  window.colJumpTo = function(lat,lng,zoom) {
    if (colMap) colMap.setView([lat,lng], zoom||8, { animate:true });
  };

  window.showDeptPanel_global = function(code) {
    const dept = COLOMBIA.departments[code];
    if (!dept) return;
    showDeptPanel(code, dept);
    if (colMap) colMap.setView(dept.latlng, 8, { animate:true });
  };

  // ─── INIT ────────────────────────────────────────────────────────────────
  window.initColombiaMap = function() {
    if (colMap) return; // prevent double init
    const el = document.getElementById('col-map');
    if (!el || typeof L === 'undefined') return;

    // Inject CSS
    if (!document.getElementById('colMapStyles')) {
      const s = document.createElement('style');
      s.id = 'colMapStyles';
      s.textContent = `
        @keyframes colPulse {
          0%,100% { box-shadow:0 0 6px rgba(74,222,128,.5); }
          50%      { box-shadow:0 0 20px rgba(74,222,128,.9), 0 0 40px rgba(74,222,128,.3); }
        }
      `;
      document.head.appendChild(s);
    }

    // Init Leaflet map
    colMap = L.map('col-map', { minZoom:4, maxZoom:15, zoomControl:true })
      .setView([4.5, -74.0], 5);

    // Dark tile layer (CARTO dark no-labels + label layer on top)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution:'&copy; CARTO &copy; OpenStreetMap',
      subdomains:'abcd', maxZoom:19
    }).addTo(colMap);

    // City labels layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      attribution:'', subdomains:'abcd', maxZoom:19, pane:'overlayPane'
    }).addTo(colMap);

    // Layers
    deptMarkersLayer = L.layerGroup().addTo(colMap);
    cityMarkersLayer = L.layerGroup();

    buildDeptMarkers();
    buildCityMarkers();
    buildRanking();
    buildKpis();
    buildQuickNav();

    // Default: show Bogotá panel
    showDeptPanel('CUN', COLOMBIA.departments['CUN']);

    setTimeout(() => colMap.invalidateSize(), 350);
  };

})();
