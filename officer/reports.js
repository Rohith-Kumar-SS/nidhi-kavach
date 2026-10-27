// Officer · Reports: ready-made registers with on-screen preview, CSV download and a print view.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang, getLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, mount, loading, errorState, emptyState, renderTable, pagination, toast, withBusy,
  statusBadge, releaseBadge, severityBadge, riskBadge, maturityChip, fmtINR, fmtDate, fmtDateTime, fmtNum,
  getParam, setParams, downloadBlob,
} from '../assets/js/ui.js';

extend({
  en: {
    'rep.title': 'Reports',
    'rep.subtitle': 'Ready-made registers for monitoring and follow-up - preview on screen, download as CSV or print',
    'rep.registry_csv': 'Full FDR registry (CSV)',
    'rep.grid_h': 'Available reports',
    'rep.grid_sub': 'Generated live from the portal records',
    'rep.preview': 'Preview',
    'rep.csv': 'CSV',
    'rep.records': '{n} records',
    'rep.record_one': '1 record',
    'rep.none': 'Nothing to report',
    'rep.download': 'Download CSV',
    'rep.print': 'Print',
    'rep.close': 'Close preview',
    'rep.generated': 'Generated {d}',
    'rep.rows': '{n} rows',
    'rep.days': 'Window',
    'rep.days_n': 'Next {n} days',
    'rep.empty': 'No records in this report',
    'rep.empty_text': 'Nothing currently needs attention here.',
    'rep.downloaded': '{f} downloaded.',
    'rep.download_fail': 'The CSV could not be downloaded. Please try again.',
    'rep.print_head': 'Nidhi Kavach · AICTE security deposit & FDR management (prototype)',
    'rep.load_list_fail': 'The list of reports could not be loaded.',
    'rep.yes': 'Yes', 'rep.no': 'No',
    'rep.breached': 'Breached', 'rep.hours_left': '{n} h left', 'rep.hours_over': '{n} h over',
    'rep.days_unit': '{n} days',
    'rep.day_one': '1 day',
    'rep.src.system': 'System', 'rep.src.bank': 'Bank', 'rep.src.officer': 'Officer', 'rep.src.institution': 'Institution',
  },
  hi: {
    'rep.title': 'रिपोर्ट',
    'rep.subtitle': 'निगरानी और अनुवर्ती कार्रवाई के लिए तैयार रजिस्टर - स्क्रीन पर देखें, सीएसवी डाउनलोड करें या प्रिंट करें',
    'rep.registry_csv': 'संपूर्ण एफडीआर रजिस्टर (सीएसवी)',
    'rep.grid_h': 'उपलब्ध रिपोर्ट',
    'rep.grid_sub': 'पोर्टल के अभिलेखों से तत्काल तैयार',
    'rep.preview': 'पूर्वावलोकन',
    'rep.csv': 'सीएसवी',
    'rep.records': '{n} अभिलेख',
    'rep.record_one': '1 अभिलेख',
    'rep.none': 'रिपोर्ट करने योग्य कुछ नहीं',
    'rep.download': 'सीएसवी डाउनलोड करें',
    'rep.print': 'प्रिंट करें',
    'rep.close': 'पूर्वावलोकन बंद करें',
    'rep.generated': '{d} को तैयार',
    'rep.rows': '{n} पंक्तियाँ',
    'rep.days': 'अवधि',
    'rep.days_n': 'अगले {n} दिन',
    'rep.empty': 'इस रिपोर्ट में कोई अभिलेख नहीं',
    'rep.empty_text': 'अभी यहाँ किसी कार्रवाई की आवश्यकता नहीं है।',
    'rep.downloaded': '{f} डाउनलोड हो गई।',
    'rep.download_fail': 'सीएसवी डाउनलोड नहीं हो सकी। कृपया पुनः प्रयास करें।',
    'rep.print_head': 'निधि कवच · एआईसीटीई प्रतिभूति जमा एवं एफडीआर प्रबंधन (प्रोटोटाइप)',
    'rep.load_list_fail': 'रिपोर्ट की सूची लोड नहीं हो सकी।',
    'rep.yes': 'हाँ', 'rep.no': 'नहीं',
    'rep.breached': 'समय-सीमा पार', 'rep.hours_left': '{n} घंटे शेष', 'rep.hours_over': '{n} घंटे अधिक',
    'rep.days_unit': '{n} दिन',
    'rep.day_one': '1 दिन',
    'rep.src.system': 'सिस्टम', 'rep.src.bank': 'बैंक', 'rep.src.officer': 'अधिकारी', 'rep.src.institution': 'संस्थान',
  },
});

// Presentation per report key (icon, tone, Hindi title/description; English comes from the server).
const META = {
  'pending-verifications': { ic: 'hourglass', tone: '', hi: ['लंबित सत्यापन', 'प्रस्तुत, सत्यापनाधीन या लौटाए गए लिखत, सबसे पुराने पहले।'] },
  'upcoming-maturities': { ic: 'calendar', tone: 'saffron', hi: ['आगामी परिपक्वताएँ', 'अगले N दिनों (डिफ़ॉल्ट 90) में परिपक्व होने वाले स्वीकृत लिखत और क्या नवीनीकरण प्रस्तुत हो चुका है।'] },
  'overdue-renewals': { ic: 'alert-circle', tone: 'danger', hi: ['अतिदेय नवीनीकरण', 'बिना स्वीकृत नवीनीकरण के परिपक्व लिखत, पहुँचे हुए एस्केलेशन स्तर सहित।'] },
  'missing-documents': { ic: 'file', tone: 'violet', hi: ['अनुपलब्ध दस्तावेज़ एवं अपूर्ण अभिलेख', 'जिन चालू लिखतों में रसीद, शाखा/आईएफएससी/जमाकर्ता विवरण या कोई सत्यापन जाँच नहीं है।'] },
  discrepancies: { ic: 'flag', tone: 'danger', hi: ['लंबित विसंगतियाँ', 'चालू लिखतों पर प्रत्येक लंबित विसंगति, सबसे गंभीर पहले।'] },
  interventions: { ic: 'target', tone: 'saffron', hi: ['हस्तक्षेप आवश्यक', 'उच्च और गंभीर जोखिम वाले लिखत, प्रमुख जोखिम कारणों सहित।'] },
  releases: { ic: 'wallet', tone: 'teal', hi: ['रिलीज़ एवं वापसी अनुरोध', 'सभी रिलीज़ अनुरोध, उनके चरण और एसएलए स्थिति सहित।'] },
  'institution-coverage': { ic: 'building', tone: 'green', hi: ['संस्थानवार जमा कमी', 'जिन संस्थानों की स्वीकृत जमा राशि अपेक्षित राशि से कम है।'] },
  'bank-verification': { ic: 'bank', tone: 'teal', hi: ['बैंक सत्यापन शेष', 'जिन चालू लिखतों की बैंक ने पुष्टि नहीं की है (विश्वसनीयता स्तर "बैंक सत्यापित" से नीचे)।'] },
};
// Hindi column labels by key (English labels come from the server).
const COL_HI = {
  ref_no: 'संदर्भ', fdr_ref_no: 'एफडीआर संदर्भ', institution: 'संस्थान', aicte_id: 'एआईसीटीई आईडी', state: 'राज्य', bank: 'बैंक', type: 'प्रकार',
  fdr_number: 'एफडीआर सं.', amount: 'राशि (₹)', status: 'स्थिति', submitted_at: 'प्रस्तुत', waiting_days: 'प्रतीक्षा (दिन)', trust_label: 'विश्वसनीयता स्तर',
  risk_score: 'जोखिम अंक', risk_band: 'जोखिम श्रेणी', open_discrepancies: 'लंबित विसंगतियाँ', maturity_date: 'परिपक्वता तिथि', days_to_maturity: 'शेष दिन',
  renewal_submitted: 'नवीनीकरण प्रस्तुत', days_overdue: 'अतिदेय दिन', escalated_to: 'एस्केलेशन स्तर', missing: 'अनुपलब्ध', code: 'कोड', severity: 'गंभीरता',
  message: 'विसंगति', source: 'दर्ज करने वाला', raised_at: 'दर्ज तिथि', days_open: 'लंबित दिन', institution_responded: 'संस्थान का उत्तर', reasons: 'प्रमुख कारण',
  request_type: 'अनुरोध प्रकार', requested_at: 'अनुरोध तिथि', stage_entered_at: 'चरण आरंभ', sla_due_at: 'एसएलए देय', sla_hours_left: 'एसएलए शेष',
  sla_breached: 'एसएलए उल्लंघन', released_at: 'रिलीज़ तिथि', required_deposit: 'अपेक्षित (₹)', covered_amount: 'जमा (₹)', shortfall: 'कमी (₹)',
  coverage_pct: 'जमा %', active_count: 'सक्रिय एफडीआर', last_bank_check_at: 'अंतिम बैंक जाँच', last_bank_result: 'अंतिम बैंक परिणाम',
};
const PAGE_SIZE = 25;
const DAY_OPTIONS = [30, 60, 90, 180];

const registryBtn = () => el('button', {
  class: 'btn secondary', type: 'button', html: `${icon('download', 16)}<span>${esc(t('rep.registry_csv'))}</span>`,
  onclick: (e) => download(e.currentTarget, '/reports/fdrs.csv', {}, 'fdr-registry'),
});

await initPage({
  roles: ['officer', 'authority', 'admin'],
  active: 'reports',
  title: 'rep.title',
  subtitle: 'rep.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'officer/dashboard.html' }, { label: 'rep.title' }],
  actions: registryBtn,
});

const gridEl = $('#report-grid');
const prevEl = $('#preview');
let reports = null;          // [{key,title,description}]
let listErr = null;
const counts = {};           // key -> number | 'err'
let current = getParam('r') || '';
let days = DAY_OPTIONS.includes(Number(getParam('days'))) ? Number(getParam('days')) : 90;
let report = null;           // last loaded report JSON
let reportErr = null;
let page = 1;
let sort = null;
let printing = false;
let seq = 0;

const titleOf = (r) => (getLang() === 'hi' && META[r.key] ? META[r.key].hi[0] : r.title);
const descOf = (r) => (getLang() === 'hi' && META[r.key] ? META[r.key].hi[1] : r.description);
const colLabel = (c) => (getLang() === 'hi' && COL_HI[c.key]) || c.label;
const paramsFor = (key) => (key === 'upcoming-maturities' ? { days } : {});
const today = () => new Date().toISOString().slice(0, 10);

/* ---------------------------------------------------------------- downloads */
async function download(btn, path, params, base) {
  await withBusy(btn, async () => {
    try {
      const blob = await api.blob(path, path.endsWith('.csv') ? params : { ...params, format: 'csv' });
      const name = `${base}-${today()}.csv`;
      downloadBlob(blob, name);
      toast(t('rep.downloaded', { f: name }), 'success');
    } catch (err) {
      toast(t('rep.download_fail'), 'error');
    }
  });
}

/* ---------------------------------------------------------------- cards */
function renderGrid() {
  $('#grid-h').textContent = t('rep.grid_h');
  $('#grid-sub').textContent = t('rep.grid_sub');
  if (listErr) { errorState(gridEl, listErr, loadList); return; }
  if (!reports) { loading(gridEl); return; }
  mount(gridEl, reports.map((r) => {
    const m = META[r.key] || { ic: 'file-text', tone: '' };
    const n = counts[r.key];
    const countLine = n === undefined ? el('span', { class: 'skeleton', style: { width: '70px', display: 'inline-block' } })
      : n === 'err' ? el('span', {}, '—')
        : el('span', { html: n ? `<strong>${esc(n === 1 ? t('rep.record_one') : t('rep.records', { n: fmtNum(n) }))}</strong>` : esc(t('rep.none')) });
    return el('article', { class: `card hoverable rep-card ${r.key === current ? 'current' : ''}` },
      el('div', { class: 'card-body' },
        el('div', { class: `feature-icon ${m.tone}`, html: icon(m.ic, 22), 'aria-hidden': 'true' }),
        el('div', { style: { minWidth: 0 } }, el('h3', {}, titleOf(r)), el('p', {}, descOf(r)))),
      el('div', { class: 'card-foot' },
        el('div', { class: 'rep-count' }, countLine),
        el('div', { class: 'row nowrap' },
          el('button', { class: 'btn sm secondary', type: 'button', html: `${icon('eye', 15)}<span>${esc(t('rep.preview'))}</span>`, 'aria-label': `${t('rep.preview')}: ${titleOf(r)}`, onclick: () => open(r.key, true) }),
          el('button', { class: 'btn sm ghost', type: 'button', html: `${icon('download', 15)}<span>${esc(t('rep.csv'))}</span>`, 'aria-label': `${t('rep.download')}: ${titleOf(r)}`, onclick: (e) => download(e.currentTarget, `/reports/${r.key}`, paramsFor(r.key), r.key) }))));
  }));
}

async function loadCounts() {
  await Promise.all((reports || []).map(async (r) => {
    try { counts[r.key] = ((await api.get(`/reports/${r.key}`, paramsFor(r.key))).rows || []).length; } catch { counts[r.key] = 'err'; }
  }));
  renderGrid();
}

async function loadList() {
  listErr = null;
  renderGrid();
  try {
    reports = await api.get('/reports');
    renderGrid();
    if (current && reports.some((r) => r.key === current)) open(current, false);
    loadCounts();
  } catch (err) {
    listErr = err;
    renderGrid();
  }
}

/* ---------------------------------------------------------------- cell formatting */
const yesNo = (v) => (v ? `<span class="badge b-success">${esc(t('rep.yes'))}</span>` : `<span class="badge b-slate">${esc(t('rep.no'))}</span>`);
const BAD_WHEN_NO = ['renewal_submitted', 'institution_responded'];

function cell(key, v, row, reportKey) {
  if (v === null || v === undefined || v === '') return '<span class="muted">—</span>';
  if (key === 'ref_no' && row.fdr_id) return `<a class="mono small nowrap" href="${esc(site(`officer/fdr.html?id=${row.fdr_id}`))}">${esc(v)}</a>`;
  if (key === 'ref_no' && row.release_id) return `<a class="mono small nowrap" href="${esc(site(`officer/release.html?id=${row.release_id}`))}">${esc(v)}</a>`;
  if (key === 'institution' && row.institution_id) return `<a class="rep-inst" href="${esc(site(`officer/institution.html?id=${row.institution_id}`))}">${esc(v)}</a>`;
  if (/amount|deposit|shortfall/.test(key) && typeof v === 'number') return `<span class="nowrap">${esc(fmtINR(v))}</span>`;
  if (/_date$/.test(key)) return `<span class="nowrap">${esc(fmtDate(v))}</span>`;
  if (/_at$/.test(key)) return `<span class="nowrap" title="${esc(fmtDateTime(v))}">${esc(fmtDate(v))}</span>`;
  if (key === 'status') return reportKey === 'releases' ? releaseBadge(String(v).toUpperCase()) : statusBadge(String(v).toLowerCase());
  if (key === 'severity') return severityBadge(v);
  if (key === 'risk_score') return riskBadge(v, row.risk_band);
  if (key === 'risk_band') return `<span class="badge sev-${esc(v)}">${esc(t(`risk.${v}`, { _default: v }))}</span>`;
  if (key === 'request_type') return esc(t(`rtype.${v}`, { _default: v }));
  if (key === 'source') return esc(t(`rep.src.${v}`, { _default: v }));
  if (key === 'days_to_maturity') return maturityChip(v);
  if (key === 'days_overdue') return `<span class="badge b-danger">${esc(t('rel.overdue', { n: v }))}</span>`;
  if (key === 'waiting_days' || key === 'days_open') return `<span class="nowrap ${v > 7 ? 'text-2' : ''}" style="${v > 7 ? 'color:var(--nk-orange);font-weight:600' : ''}">${esc(v === 1 ? t('rep.day_one') : t('rep.days_unit', { n: v }))}</span>`;
  if (key === 'sla_hours_left') {
    const n = Math.round(Math.abs(Number(v)));
    return Number(v) < 0 ? `<span class="badge b-danger">${esc(t('rep.hours_over', { n }))}</span>` : `<span class="badge ${n <= 12 ? 'b-warning' : 'b-slate'}">${esc(t('rep.hours_left', { n }))}</span>`;
  }
  if (key === 'sla_breached') return v ? `<span class="badge b-danger">${esc(t('rep.breached'))}</span>` : `<span class="badge b-success">${esc(t('rep.no'))}</span>`;
  if (typeof v === 'boolean') return BAD_WHEN_NO.includes(key) && !v ? `<span class="badge b-warning">${esc(t('rep.no'))}</span>` : yesNo(v);
  if (key === 'coverage_pct') {
    const p = Math.max(0, Math.min(100, Number(v)));
    return `<div class="rep-cov"><strong class="small">${esc(fmtNum(v, 1))}%</strong><div class="meter ${p >= 100 ? '' : p >= 60 ? 'warning' : 'danger'}"><span style="width:${p}%"></span></div></div>`;
  }
  if (Array.isArray(v)) return v.length ? `<ul class="rep-list">${v.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<span class="muted">—</span>';
  if (key === 'code' || key === 'fdr_number' || key === 'aicte_id' || key === 'fdr_ref_no') return `<span class="mono small nowrap">${esc(v)}</span>`;
  if (key === 'message' || key === 'last_bank_result') return `<div class="rep-text">${esc(v)}</div>`;
  if (typeof v === 'number') return `<span class="num">${esc(fmtNum(v))}</span>`;
  if (key === 'institution') return `<span class="rep-inst">${esc(v)}</span>`;
  return esc(v);
}

const isRight = (key) => /amount|deposit|shortfall|count|score|open_discrepancies/.test(key);

/* ---------------------------------------------------------------- preview */
function sortedRows() {
  const rows = [...(report.rows || [])];
  if (!sort) return rows;
  const dir = sort.dir === 'desc' ? -1 : 1;
  return rows.sort((a, b) => {
    const x = a[sort.key]; const y = b[sort.key];
    if (x === y) return 0;
    if (x === null || x === undefined) return 1;
    if (y === null || y === undefined) return -1;
    return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * dir;
  });
}

function renderPreview() {
  if (!current) { prevEl.hidden = true; mount(prevEl); return; }
  prevEl.hidden = false;
  const r = (reports || []).find((x) => x.key === current) || { key: current, title: current, description: '' };
  const m = META[current] || { ic: 'file-text', tone: '' };
  const head = el('div', { class: 'card-head' },
    el('h2', { html: `${icon(m.ic, 18)} ${esc(titleOf(r))}` }),
    el('div', { class: 'rep-toolbar' },
      current === 'upcoming-maturities' ? el('label', { class: 'row nowrap small', style: { gap: '6px' } },
        el('span', { class: 'muted' }, t('rep.days')),
        (() => {
          const s = el('select', { class: 'select sm', 'aria-label': t('rep.days') }, DAY_OPTIONS.map((n) => el('option', { value: String(n) }, t('rep.days_n', { n }))));
          s.value = String(days);
          s.addEventListener('change', () => { days = Number(s.value); setParams({ days: days === 90 ? '' : days }); counts[current] = undefined; open(current, false); });
          return s;
        })()) : null,
      el('button', { class: 'btn sm', type: 'button', disabled: !report, html: `${icon('download', 15)}<span>${esc(t('rep.download'))}</span>`, onclick: (e) => download(e.currentTarget, `/reports/${current}`, paramsFor(current), current) }),
      el('button', { class: 'btn sm secondary', type: 'button', disabled: !report, html: `${icon('print', 15)}<span>${esc(t('rep.print'))}</span>`, onclick: () => window.print() }),
      el('button', { class: 'btn sm ghost icon-only', type: 'button', title: t('rep.close'), 'aria-label': t('rep.close'), html: icon('x', 16), onclick: close })));
  const body = el('div', { class: 'card-body' });
  const tableBox = el('div', { class: 'card-body flush' });
  const pager = el('div', { id: 'rep-pager' });
  mount(prevEl, head, body, tableBox, pager);
  if (reportErr) { errorState(body, reportErr, () => open(current, false)); return; }
  if (!report) { loading(body); return; }
  const rows = sortedRows();
  mount(body,
    el('div', { class: 'rep-print-head' },
      el('div', { class: 'p1' }, titleOf(r)),
      el('div', { class: 'small' }, `${t('rep.print_head')} · ${t('rep.generated', { d: fmtDateTime(report.generated_at) })}`)),
    el('div', { class: 'alert info', html: `${icon('info', 18)}<div>${esc(report.summary || descOf(r))}</div>` }),
    el('div', { class: 'rep-meta' },
      el('span', { html: `${icon('clock', 14)} ${esc(t('rep.generated', { d: fmtDateTime(report.generated_at) }))}` }),
      el('span', { html: `${icon('list', 14)} ${esc(t('rep.rows', { n: fmtNum(rows.length) }))}` })));
  const visible = printing ? rows : rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  renderTable(tableBox, {
    columns: (report.columns || []).map((c) => ({
      key: c.key, label: colLabel(c), sortable: true, align: isRight(c.key) ? 'right' : undefined,
      render: (row) => cell(c.key, row[c.key], row, current),
    })),
    rows: visible,
    sort: sort || undefined,
    onSort: (key, dir) => { sort = { key, dir }; page = 1; renderPreview(); },
    rowClass: (row) => (row.sla_breached || row.severity === 'critical' || row.risk_band === 'critical' || row.days_overdue > 60 ? 'row-danger' : ''),
    empty: { icon: 'check-circle', title: t('rep.empty'), text: t('rep.empty_text') },
  });
  if (!printing && rows.length > PAGE_SIZE) {
    pagination(pager, { page, pageSize: PAGE_SIZE, total: rows.length, onChange: (p) => { page = p; renderPreview(); prevEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
  }
}

async function open(key, scroll) {
  const my = ++seq;
  if (key !== current) { sort = null; }
  current = key;
  page = 1;
  report = null;
  reportErr = null;
  setParams({ r: key, days: key === 'upcoming-maturities' && days !== 90 ? days : '' });
  renderGrid();
  renderPreview();
  if (scroll) prevEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  try {
    const d = await api.get(`/reports/${key}`, paramsFor(key));
    if (my !== seq) return;
    report = d;
    counts[key] = (d.rows || []).length;
    renderGrid();
    renderPreview();
    if (scroll) prevEl.focus({ preventScroll: true });
  } catch (err) {
    if (my !== seq) return;
    reportErr = err;
    renderPreview();
  }
}

function close() {
  seq += 1;
  current = '';
  report = null;
  setParams({ r: '', days: '' });
  renderPreview();
  renderGrid();
  gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// print every row, not just the current page
window.addEventListener('beforeprint', () => { if (report) { printing = true; renderPreview(); } });
window.addEventListener('afterprint', () => { if (printing) { printing = false; renderPreview(); } });

onLang(() => { renderGrid(); renderPreview(); });
loadList();
