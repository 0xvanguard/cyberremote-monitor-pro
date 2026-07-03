/**
 * remotive-feed.js  v2.0
 * CyberRemote Monitor Pro — Remotive Live Feed
 *
 * Exports (window):
 *   initRemotiveFeed(dataset)   → fetch + enrich + update badge
 *   renderRemotivePanel(code)   → render job cards in sidebar
 *   remotiveJobs                → raw filtered jobs array
 *
 * API: https://remotive.com/api/remote-jobs  (public, no key)
 * CORS proxy: allorigins.win
 */

(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────────────────────── */
  const REMOTIVE_API = 'https://remotive.com/api/remote-jobs';
  const PROXY        = 'https://api.allorigins.win/get?url=';

  const CATEGORIES = ['software-dev', 'devops-sysadmin', 'product'];

  const CYBER_KEYWORDS = [
    'security', 'cybersecurity', 'cyber security', 'infosec',
    'information security', 'soc analyst', 'soc engineer',
    'security analyst', 'security engineer', 'security architect',
    'penetration', 'pentest', 'ethical hack',
    'cloud security', 'appsec', 'application security',
    'grc', 'compliance analyst', 'risk analyst',
    'vulnerability', 'threat intel', 'threat hunting',
    'incident response', 'devsecops', 'siem', 'ids', 'ips',
    'firewall', 'network security', 'zero trust',
    'iam', 'identity', 'access management',
    'red team', 'blue team', 'purple team',
    'malware', 'forensics', 'digital forensics', 'sast', 'dast'
  ];

  // Lowercase partial-match → ISO-2
  const LOC_MAP = {
    'united states': 'US', 'usa': 'US', 'u.s.': 'US', 'u.s': 'US',
    'canada': 'CA',
    'united kingdom': 'GB', 'uk': 'GB', 'england': 'GB', 'great britain': 'GB',
    'germany': 'DE', 'deutschland': 'DE',
    'france': 'FR',
    'spain': 'ES', 'españa': 'ES',
    'netherlands': 'NL', 'the netherlands': 'NL',
    'portugal': 'PT',
    'italy': 'IT',
    'switzerland': 'CH',
    'sweden': 'SE',
    'norway': 'NO',
    'denmark': 'DK',
    'finland': 'FI',
    'poland': 'PL',
    'czech republic': 'CZ', 'czechia': 'CZ',
    'romania': 'RO',
    'ukraine': 'UA',
    'ireland': 'IE',
    'belgium': 'BE',
    'austria': 'AT',
    'israel': 'IL',
    'turkey': 'TR', 'türkiye': 'TR',
    'egypt': 'EG',
    'morocco': 'MA',
    'south africa': 'ZA',
    'nigeria': 'NG',
    'kenya': 'KE',
    'india': 'IN',
    'pakistan': 'PK',
    'australia': 'AU',
    'new zealand': 'NZ',
    'singapore': 'SG',
    'japan': 'JP',
    'south korea': 'KR', 'korea': 'KR',
    'philippines': 'PH',
    'malaysia': 'MY',
    'indonesia': 'ID',
    'thailand': 'TH',
    'vietnam': 'VN',
    'brazil': 'BR', 'brasil': 'BR',
    'colombia': 'CO',
    'argentina': 'AR',
    'mexico': 'MX', 'méxico': 'MX',
    'chile': 'CL',
    'peru': 'PE', 'perú': 'PE',
    'uae': 'AE', 'united arab emirates': 'AE', 'dubai': 'AE',
    'saudi arabia': 'SA'
  };

  const WORLDWIDE_TOKENS = ['worldwide', 'anywhere', 'global', 'international', 'all countries', 'remote'];

  /* ── STATE ──────────────────────────────────────────────────────── */
  let _jobs      = [];
  let _byCountry = {};
  let _worldwide = [];
  let _loaded    = false;

  /* ── HELPERS ────────────────────────────────────────────────────── */

  function isCyberJob(job) {
    const hay = [
      job.title || '',
      (job.tags  || []).join(' '),
      (job.description || '').slice(0, 400)
    ].join(' ').toLowerCase();
    return CYBER_KEYWORDS.some(kw => hay.includes(kw));
  }

  function resolveCode(locationStr) {
    if (!locationStr) return 'WORLDWIDE';
    const l = locationStr.toLowerCase();
    for (const [key, code] of Object.entries(LOC_MAP)) {
      if (l.includes(key)) return code;
    }
    if (WORLDWIDE_TOKENS.some(w => l.includes(w))) return 'WORLDWIDE';
    return 'WORLDWIDE'; // default: show as global
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (d === 0) return 'hoy';
    if (d === 1) return 'ayer';
    if (d < 7)  return `hace ${d}d`;
    if (d < 30) return `hace ${Math.floor(d / 7)}sem`;
    return `hace ${Math.floor(d / 30)}m`;
  }

  function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 130);
  }

  function levelBadge(title) {
    const t = (title || '').toLowerCase();
    if (/senior|lead|principal|staff|head/.test(t)) return { label: 'Senior', color: '#f59e0b' };
    if (/junior|jr\b|entry|associate|trainee|intern/.test(t)) return { label: 'Junior ⚡', color: '#4ade80' };
    return { label: 'Mid', color: '#0ea5e9' };
  }

  /* ── FETCH (with CORS proxy) ────────────────────────────────────── */

  async function fetchCategory(cat) {
    try {
      const apiUrl = `${REMOTIVE_API}?category=${cat}&limit=100`;
      const proxyUrl = PROXY + encodeURIComponent(apiUrl);
      const res = await fetch(proxyUrl, { cache: 'default' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const wrapper = await res.json();
      const data = JSON.parse(wrapper.contents);
      return data.jobs || [];
    } catch (e) {
      console.warn(`[Remotive] fetch "${cat}" failed — trying direct:`, e.message);
      // Fallback: direct request (works if server sets CORS headers)
      try {
        const res2 = await fetch(`${REMOTIVE_API}?category=${cat}&limit=100`, { cache: 'default' });
        if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
        const data2 = await res2.json();
        return data2.jobs || [];
      } catch (e2) {
        console.error(`[Remotive] category "${cat}" completely failed:`, e2.message);
        return [];
      }
    }
  }

  /* ── STYLES (injected once) ─────────────────────────────────────── */

  function injectStyles() {
    if (document.getElementById('remotive-feed-css')) return;
    const s = document.createElement('style');
    s.id = 'remotive-feed-css';
    s.textContent = `
      .rjc {
        display:block; text-decoration:none; color:inherit;
        background:#0d1b2a; border:1px solid #1e3a5f; border-radius:9px;
        padding:.6rem .75rem; margin-bottom:.45rem;
        transition:border-color .18s,background .18s;
      }
      .rjc:hover { border-color:#0ea5e9; background:#0d2235; }
      .rjc-top { display:flex; align-items:center; gap:.5rem; margin-bottom:.3rem; }
      .rjc-logo {
        width:26px; height:26px; border-radius:5px;
        object-fit:contain; background:#030d1a; flex-shrink:0;
      }
      .rjc-logo-ph {
        width:26px; height:26px; border-radius:5px;
        background:#030d1a; display:flex; align-items:center;
        justify-content:center; font-size:13px; flex-shrink:0;
      }
      .rjc-body { flex:1; min-width:0; }
      .rjc-title {
        font-size:.74rem; font-weight:700; color:#dbe7ff;
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        line-height:1.2;
      }
      .rjc-company { font-size:.64rem; color:#475569; }
      .rjc-lvl {
        font-size:.58rem; font-weight:800; border-radius:999px;
        padding:1px 7px; border:1px solid; flex-shrink:0; white-space:nowrap;
      }
      .rjc-meta {
        font-size:.64rem; color:#334155;
        display:flex; flex-wrap:wrap; gap:.3rem; margin-bottom:.3rem;
      }
      .rjc-snippet {
        font-size:.63rem; color:#334155; line-height:1.4;
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        margin-bottom:.3rem;
      }
      .rjc-tags { display:flex; flex-wrap:wrap; gap:.25rem; }
      .rjc-tag {
        font-size:.58rem; background:#030d1a; border:1px solid #1e3a5f;
        color:#475569; padding:1px 6px; border-radius:999px;
      }
      .rjc-footer {
        display:block; text-align:center; font-size:.65rem;
        color:#1e3a5f; padding:.35rem 0;
        transition:color .2s; text-decoration:none;
      }
      .rjc-footer:hover { color:#0ea5e9; }
      .rjc-empty { font-size:.72rem; color:#334155; text-align:center; padding:.8rem 0; }
    `;
    document.head.appendChild(s);
  }

  /* ── MAIN INIT ──────────────────────────────────────────────────── */

  async function initRemotiveFeed(dataset) {
    injectStyles();
    const badge = document.getElementById('remotiveBadge');
    if (badge) {
      badge.innerHTML = '&#x27F3; Cargando empleos...';
      badge.style.color = '#64748b';
      badge.style.borderColor = '#1e3a5f';
    }

    try {
      // Parallel fetch all categories
      const results = await Promise.all(CATEGORIES.map(fetchCategory));
      const all = results.flat();

      // Deduplicate
      const seen = new Set();
      const unique = all.filter(j => { if (seen.has(j.id)) return false; seen.add(j.id); return true; });

      // Filter cyber-only
      _jobs = unique.filter(isCyberJob);
      window.remotiveJobs = _jobs;

      // Group by country
      _byCountry = {};
      _worldwide = [];
      _jobs.forEach(job => {
        const code = resolveCode(job.candidate_required_location);
        if (code === 'WORLDWIDE') {
          _worldwide.push(job);
        } else {
          (_byCountry[code] = _byCountry[code] || []).push(job);
        }
      });

      // Enrich dataset: boost intensity + inject live signals
      Object.entries(_byCountry).forEach(([code, jobs]) => {
        if (!dataset || !dataset[code]) return;
        const d = dataset[code];
        d.liveJobs     = jobs.length;
        d.liveJobsList = jobs;
        // Soft-boost intensity (capped at 99)
        d.intensity = Math.min(99, d.intensity + Math.round(jobs.length * 0.5));
        // Prepend live signal to feed
        const top = jobs[0];
        d.signals = [
          `🔴 LIVE "${top.title}" @ ${top.company_name} (${timeAgo(top.publication_date)})`,
          ...(d.signals || []).slice(0, 3)
        ];
      });

      _loaded = true;
      window.remotiveByCode = _byCountry;

      // Update badge
      if (badge) {
        if (_jobs.length > 0) {
          badge.innerHTML = `
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;
              background:#00ff88;margin-right:4px;vertical-align:middle;
              box-shadow:0 0 6px #00ff8888"></span>${_jobs.length} empleos LIVE`;
          badge.style.color = '#00ff88';
          badge.style.borderColor = '#00ff8830';
        } else {
          badge.textContent = '⚠ 0 resultados';
          badge.style.color = '#f59e0b';
        }
      }

      console.log(`[Remotive] ✅ ${_jobs.length} cyber jobs | ${Object.keys(_byCountry).length} países | ${_worldwide.length} worldwide`);
    } catch (err) {
      console.error('[Remotive] initRemotiveFeed error:', err);
      if (badge) { badge.textContent = '⚠ Error API'; badge.style.color = '#f87171'; }
    }
  }

  /* ── RENDER PANEL ───────────────────────────────────────────────── */

  function renderRemotivePanel(countryCode) {
    const container = document.getElementById('remotiveJobsList');
    const wrap      = document.getElementById('remotivePanelWrap');
    if (!container) return;
    if (wrap) wrap.style.display = 'block';

    if (!_loaded) {
      container.innerHTML = '<div class="rjc-empty">⟳ Cargando empleos en tiempo real…</div>';
      return;
    }

    // Country jobs + worldwide, newest first, max 7
    const pool = [
      ...(_byCountry[countryCode] || []),
      ..._worldwide
    ]
      .sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date))
      .slice(0, 7);

    if (pool.length === 0) {
      container.innerHTML = `<div class="rjc-empty">Sin vacantes activas en Remotive para este país.</div>`;
      container.innerHTML += `<a href="https://remotive.com/remote-jobs/security" target="_blank" rel="noreferrer" class="rjc-footer">Ver todos en Remotive ↗</a>`;
      return;
    }

    container.innerHTML = pool.map(job => {
      const lvl     = levelBadge(job.title);
      const snippet = stripHtml(job.description);
      const ago     = timeAgo(job.publication_date);
      const logo    = job.company_logo
        ? `<img src="${job.company_logo}" class="rjc-logo" alt="" onerror="this.style.display='none'">`
        : `<div class="rjc-logo-ph">🔐</div>`;
      const tags = (job.tags || []).slice(0, 4).map(t => `<span class="rjc-tag">${t}</span>`).join('');

      return `<a href="${job.url}" target="_blank" rel="noreferrer" class="rjc">
        <div class="rjc-top">
          ${logo}
          <div class="rjc-body">
            <div class="rjc-title">${job.title || '—'}</div>
            <div class="rjc-company">${job.company_name || '—'}</div>
          </div>
          <span class="rjc-lvl" style="color:${lvl.color};border-color:${lvl.color}40;background:${lvl.color}14">${lvl.label}</span>
        </div>
        <div class="rjc-meta">
          <span>📍 ${(job.candidate_required_location || 'Remoto').slice(0, 30)}</span>
          <span>🕐 ${ago}</span>
          ${job.salary ? `<span>💰 ${job.salary}</span>` : ''}
        </div>
        ${snippet ? `<div class="rjc-snippet">${snippet}</div>` : ''}
        <div class="rjc-tags">${tags}</div>
      </a>`;
    }).join('');

    container.innerHTML += `<a href="https://remotive.com/remote-jobs/security" target="_blank" rel="noreferrer" class="rjc-footer">Ver más en Remotive ↗</a>`;
  }

  /* ── EXPORT ─────────────────────────────────────────────────────── */
  window.initRemotiveFeed    = initRemotiveFeed;
  window.renderRemotivePanel = renderRemotivePanel;

})();
