# 🕷️ Scrapers — CyberRemote Monitor Pro

Este directorio contiene los conectores y scrapers para fuentes de empleo remoto en ciberseguridad.

## Fuentes Implementadas

| Fuente | Estado | Método | Notas |
|--------|--------|--------|-------|
| RemoteOK | ✅ Listo | API pública JSON | Ver `../../backend/app/services/jobs_ingestor/remoteok.py` |
| We Work Remotely | 🚧 En desarrollo | RSS Feed | `/jobs.rss` |
| LinkedIn Jobs | 🔜 Planificado | API oficial (OAuth) | Requiere LinkedIn Developer App |
| Glassdoor | 🔜 Planificado | Scraping ético | robots.txt compliant |
| Indeed | 🔜 Planificado | Scraping ético | Rate limiting estricto |
| APIs gubernamentales | 🔜 Planificado | REST APIs | Por país |

## Principios de Scraping Ético

1. Respetar `robots.txt` de cada sitio
2. Rate limiting: máximo 1 request/segundo por dominio
3. Identificarse con User-Agent propio (`CyberRemote-Monitor/2.0`)
4. No sobrecargar servidores de terceros
5. Solo datos públicos y de empleo (no datos personales de candidatos)
6. Cumplir términos de servicio de cada fuente

## Ejecutar un scraper manualmente

```bash
cd backend
python -m app.services.jobs_ingestor.remoteok
```
