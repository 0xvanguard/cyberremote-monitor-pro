// ═══════════════════════════════════════════════════════════
//  CyberRemote Monitor — Africa Analytics · Plotly Charts
//  4 charts: Intensidad · Vacantes Stack · Radar · Ratio
// ═══════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── Dataset África ──────────────────────────────────────
  const AFRICA = [
    { name: 'Algeria',      code: 'DZ', region: 'Norte', intensity: 42, jobs: 5,  freelance: 10, contract: 5,  training: 7,  salary: 'DZD 80k–160k/mes',  fastEntry: true,  driver: 'Sector público' },
    { name: 'Tunisia',      code: 'TN', region: 'Norte', intensity: 50, jobs: 6,  freelance: 12, contract: 6,  training: 8,  salary: 'TND 2k–4k/mes',     fastEntry: true,  driver: 'Nearshore FR' },
    { name: 'Morocco',      code: 'MA', region: 'Norte', intensity: 55, jobs: 8,  freelance: 14, contract: 8,  training: 9,  salary: 'MAD 8k–20k/mes',    fastEntry: true,  driver: 'Outsourcing FR/ES' },
    { name: 'Egypt',        code: 'EG', region: 'Norte', intensity: 58, jobs: 10, freelance: 16, contract: 10, training: 10, salary: 'EGP 15k–35k/mes',   fastEntry: true,  driver: 'Hub bancario + Gov' },
    { name: 'Nigeria',      code: 'NG', region: 'Sub',   intensity: 55, jobs: 8,  freelance: 16, contract: 8,  training: 10, salary: '$700–1800 USD/mes',  fastEntry: true,  driver: 'Fintech Lagos' },
    { name: 'Kenya',        code: 'KE', region: 'Sub',   intensity: 52, jobs: 7,  freelance: 14, contract: 7,  training: 9,  salary: '$600–1600 USD/mes',  fastEntry: true,  driver: 'Silicon Savannah' },
    { name: 'South Africa', code: 'ZA', region: 'Sub',   intensity: 62, jobs: 12, freelance: 14, contract: 10, training: 8,  salary: 'R20k–R50k/mes',     fastEntry: true,  driver: 'POPIA compliance' },
  ];

  const NAMES = AFRICA.map(d => d.name);
  const BAR_COLORS = AFRICA.map(d => d.region === 'Norte' ? '#0ea5e9' : '#f59e0b');

  const LAYOUT_BASE = {
    paper_bgcolor: '#0f172a',
    plot_bgcolor:  '#0f172a',
    font: { family: 'Inter, system-ui, sans-serif', color: '#e2e8f0', size: 12 },
    margin: { t: 90, r: 24, b: 60, l: 48 },
    title: { font: { size: 15, color: '#f1f5f9' }, x: 0.03 },
  };

  const AXIS_STYLE = {
    gridcolor: '#1e293b',
    linecolor: '#334155',
    tickcolor: '#475569',
    zerolinecolor: '#334155',
  };

  // ── Chart 1 · Intensidad ────────────────────────────────
  function renderIntensidad(divId) {
    const data = [{
      type: 'bar',
      x: NAMES,
      y: AFRICA.map(d => d.intensity),
      marker: { color: BAR_COLORS, opacity: 0.9 },
      text: AFRICA.map(d => d.intensity + ''),
      textposition: 'outside',
      textfont: { color: '#f1f5f9', size: 12, weight: 700 },
      cliponaxis: false,
      hovertemplate: '<b>%{x}</b><br>Score: %{y}/100<extra></extra>',
    }];
    const layout = Object.assign({}, LAYOUT_BASE, {
      title: { text: '🔥 Intensidad de Mercado — Ciberseguridad África', font: { size: 14, color: '#f1f5f9' }, x: 0.03 },
      yaxis: Object.assign({ title: 'Score /100', range: [0, 80] }, AXIS_STYLE),
      xaxis: Object.assign({ title: '' }, AXIS_STYLE),
      annotations: [
        { x: 'South Africa', y: 62, text: '🏆 Líder', showarrow: true, arrowhead: 2, ax: 0, ay: -28, font: { color: '#4ade80', size: 11 }, arrowcolor: '#4ade80' },
      ],
      shapes: [{ type: 'line', x0: -0.5, x1: NAMES.length - 0.5, y0: 55, y1: 55, line: { color: '#475569', dash: 'dot', width: 1 } }],
    });
    Plotly.newPlot(divId, data, layout, { responsive: true, displayModeBar: false });
  }

  // ── Chart 2 · Vacantes Stack ────────────────────────────
  function renderVacantes(divId) {
    const colors = { jobs: '#4ade80', freelance: '#0ea5e9', contract: '#f59e0b', training: '#a78bfa' };
    const traces = [
      { name: 'Empleos',   key: 'jobs',      color: colors.jobs },
      { name: 'Freelance', key: 'freelance', color: colors.freelance },
      { name: 'Contratos', key: 'contract',  color: colors.contract },
      { name: 'Formación', key: 'training',  color: colors.training },
    ].map(t => ({
      type: 'bar', name: t.name,
      x: NAMES,
      y: AFRICA.map(d => d[t.key]),
      marker: { color: t.color, opacity: 0.88 },
      hovertemplate: '<b>%{x}</b> — ' + t.name + ': %{y}<extra></extra>',
    }));
    const layout = Object.assign({}, LAYOUT_BASE, {
      barmode: 'stack',
      title: { text: '💼 Vacantes por Modalidad (Algeria → South Africa)', font: { size: 14, color: '#f1f5f9' }, x: 0.03 },
      yaxis: Object.assign({ title: 'Vacantes' }, AXIS_STYLE),
      xaxis: Object.assign({ title: '' }, AXIS_STYLE),
      legend: { orientation: 'h', y: 1.12, x: 0.5, xanchor: 'center', font: { size: 11 }, bgcolor: 'rgba(0,0,0,0)' },
    });
    Plotly.newPlot(divId, traces, layout, { responsive: true, displayModeBar: false });
  }

  // ── Chart 3 · Radar top 4 ───────────────────────────────
  function renderRadar(divId) {
    const top4 = AFRICA.filter(d => ['Egypt','Morocco','Nigeria','South Africa'].includes(d.name));
    const cats = ['Empleos','Freelance','Contratos','Formación','Intensidad'];
    const scales = [42, 38, 30, 20, 100];
    const palette = ['#4ade80','#0ea5e9','#f59e0b','#f87171'];
    const traces = top4.map((d, i) => {
      const raw = [d.jobs, d.freelance, d.contract, d.training, d.intensity];
      const vals = raw.map((v, j) => Math.round(v / scales[j] * 100));
      vals.push(vals[0]);
      return {
        type: 'scatterpolar', name: d.name,
        r: vals, theta: [...cats, cats[0]],
        fill: 'toself',
        line: { color: palette[i], width: 2 },
        fillcolor: palette[i].replace(')', ',0.12)').replace('rgb', 'rgba'),
        opacity: 0.9,
        hovertemplate: '<b>' + d.name + '</b><br>%{theta}: %{r}<extra></extra>',
      };
    });
    const layout = Object.assign({}, LAYOUT_BASE, {
      title: { text: '🕸️ Perfil Multidimensional — Top 4 Países', font: { size: 14, color: '#f1f5f9' }, x: 0.03 },
      polar: {
        bgcolor: '#0f172a',
        radialaxis: { visible: true, range: [0, 100], color: '#475569', gridcolor: '#1e293b', tickfont: { size: 9, color: '#64748b' } },
        angularaxis: { color: '#64748b', gridcolor: '#1e293b', tickfont: { size: 11, color: '#94a3b8' } },
      },
      legend: { orientation: 'h', y: -0.08, x: 0.5, xanchor: 'center', font: { size: 11 }, bgcolor: 'rgba(0,0,0,0)' },
    });
    Plotly.newPlot(divId, traces, layout, { responsive: true, displayModeBar: false });
  }

  // ── Chart 4 · Ratio freelance/empleo ────────────────────
  function renderRatio(divId) {
    const ratios = AFRICA.map(d => Math.round((d.freelance / d.jobs) * 100) / 100);
    const rColors = ratios.map(r => r > 1.8 ? '#f87171' : r > 1.2 ? '#f59e0b' : '#4ade80');
    const data = [{
      type: 'bar', x: NAMES, y: ratios,
      marker: { color: rColors, opacity: 0.9 },
      text: ratios.map(r => r + 'x'),
      textposition: 'outside',
      textfont: { color: '#f1f5f9', size: 12, weight: 700 },
      cliponaxis: false,
      hovertemplate: '<b>%{x}</b><br>Ratio: %{y}x<extra></extra>',
    }];
    const layout = Object.assign({}, LAYOUT_BASE, {
      title: { text: '⚡ Termómetro de Madurez — Ratio Freelance / Empleos', font: { size: 14, color: '#f1f5f9' }, x: 0.03 },
      yaxis: Object.assign({ title: 'Ratio', range: [0, 3.2] }, AXIS_STYLE),
      xaxis: Object.assign({ title: '' }, AXIS_STYLE),
      shapes: [
        { type: 'line', x0: -0.5, x1: NAMES.length - 0.5, y0: 1, y1: 1, line: { color: '#4ade80', dash: 'dot', width: 1.5 } },
        { type: 'line', x0: -0.5, x1: NAMES.length - 0.5, y0: 1.8, y1: 1.8, line: { color: '#f87171', dash: 'dot', width: 1.5 } },
      ],
      annotations: [
        { x: NAMES.length - 0.5, y: 1, text: 'Equilibrio', showarrow: false, xanchor: 'right', font: { color: '#4ade80', size: 10 }, yshift: 8 },
        { x: NAMES.length - 0.5, y: 1.8, text: 'Alta informalidad', showarrow: false, xanchor: 'right', font: { color: '#f87171', size: 10 }, yshift: 8 },
      ],
    });
    Plotly.newPlot(divId, data, layout, { responsive: true, displayModeBar: false });
  }

  // ── Tabla ejecutiva ─────────────────────────────────────
  function renderTable(divId) {
    const flags = { DZ:'🇩🇿', TN:'🇹🇳', MA:'🇲🇦', EG:'🇪🇬', NG:'🇳🇬', KE:'🇰🇪', ZA:'🇿🇦' };
    const sorted = [...AFRICA].sort((a, b) => b.intensity - a.intensity);
    const rows = sorted.map(d => `
      <tr class="africa-tr">
        <td>${flags[d.code] || ''} <strong>${d.name}</strong></td>
        <td><span class="africa-score" style="--clr:${d.intensity >= 58 ? '#4ade80' : d.intensity >= 50 ? '#f59e0b' : '#0ea5e9'}">${d.intensity}</span></td>
        <td>${d.jobs}</td><td>${d.freelance}</td><td>${d.contract}</td>
        <td class="africa-salary">${d.salary}</td>
        <td class="africa-driver">${d.driver}</td>
        <td>${d.fastEntry ? '<span class="fast-badge">⚡ Sí</span>' : '—'}</td>
      </tr>`).join('');
    document.getElementById(divId).innerHTML = `
      <table class="africa-table">
        <thead><tr>
          <th>País</th><th>Score</th><th>Empleos</th><th>Freelance</th><th>Contratos</th>
          <th>Salario Ref.</th><th>Driver</th><th>Entrada</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  // ── Public init ─────────────────────────────────────────
  window.initAfricaCharts = function () {
    if (typeof Plotly === 'undefined') { console.warn('Plotly not loaded'); return; }
    renderIntensidad('chart-africa-intensidad');
    renderVacantes('chart-africa-vacantes');
    renderRadar('chart-africa-radar');
    renderRatio('chart-africa-ratio');
    renderTable('africa-table-wrap');
  };

})();
