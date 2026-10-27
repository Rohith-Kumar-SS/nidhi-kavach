// Officer · Institutions: security-deposit coverage of every institution (required vs covered, shortfall, risk).
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang, getLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, kpi, mount, loading, errorState, renderTable, pagination, riskBadge,
  fmtINR, fmtINRShort, fmtNum, getParam, setParams, debounce,
} from '../assets/js/ui.js';

extend({
  en: {
    'inst.title': 'Institutions',
    'inst.subtitle': 'Security-deposit coverage of every institution - required vs covered, shortfalls and open issues',
    'inst.summary': 'Coverage summary',
    'inst.k_total': 'Institutions',
    'inst.k_total_sub': 'across {n} states',
    'inst.k_short': 'With shortfall',
    'inst.k_short_sub': '{p} of institutions',
    'inst.k_amount': 'Total shortfall',
    'inst.k_amount_sub': 'still to be deposited',
    'inst.k_cov': 'Overall coverage',
    'inst.k_cov_sub': '{c} of {r} required',
    'inst.f_search': 'Search institutions',
    'inst.f_search_ph': 'Name, AICTE ID, city or trust',
    'inst.f_sort': 'Sort by',
    'inst.f_short': 'Shortfall only',
    'inst.all_states': 'All states',
    'inst.all_types': 'All types',
    'inst.sort.name': 'Name (A-Z)',
    'inst.sort.shortfall': 'Largest shortfall',
    'inst.sort.risk': 'Highest risk',
    'inst.sort.fdr_count': 'Most FDRs',
    'inst.clear': 'Clear filters',
    'inst.count': '{n} institutions',
    'inst.count_one': '1 institution',
    'inst.c_inst': 'Institution',
    'inst.c_type': 'Type',
    'inst.c_required': 'Required',
    'inst.c_covered': 'Covered',
    'inst.c_coverage': 'Coverage',
    'inst.c_shortfall': 'Shortfall',
    'inst.c_fdrs': 'FDRs',
    'inst.c_fdrs_title': 'Active / total instruments',
    'inst.c_disc': 'Open issues',
    'inst.c_risk': 'Max risk',
    'inst.nil': 'Nil',
    'inst.covered_full': 'Fully covered',
    'inst.empty': 'No institutions match',
    'inst.empty_text': 'Try a different search or clear the filters.',
    'inst.leg_short': 'Row marker = shortfall',
    'inst.leg_meter': 'Meter = covered ÷ required',
    'inst.report': 'Shortfall report',
    'inst.approval.new': 'New',
    'inst.approval.closure_requested': 'Closure requested',
    'inst.approval.closed': 'Closed',
    'inst.approval.approved': 'Approved',
    'inst.disc_title': '{n} open discrepancies',
    'inst.open_hint': 'Open institution',
  },
  hi: {
    'inst.title': 'संस्थान',
    'inst.subtitle': 'प्रत्येक संस्थान की प्रतिभूति जमा स्थिति - अपेक्षित बनाम जमा राशि, कमी और लंबित मुद्दे',
    'inst.summary': 'जमा सारांश',
    'inst.k_total': 'संस्थान',
    'inst.k_total_sub': '{n} राज्यों में',
    'inst.k_short': 'कमी वाले संस्थान',
    'inst.k_short_sub': 'कुल संस्थानों का {p}',
    'inst.k_amount': 'कुल कमी',
    'inst.k_amount_sub': 'अभी जमा की जानी है',
    'inst.k_cov': 'समग्र जमा अनुपात',
    'inst.k_cov_sub': '{r} अपेक्षित में से {c}',
    'inst.f_search': 'संस्थान खोजें',
    'inst.f_search_ph': 'नाम, एआईसीटीई आईडी, शहर या ट्रस्ट',
    'inst.f_sort': 'क्रम',
    'inst.f_short': 'केवल कमी वाले',
    'inst.all_states': 'सभी राज्य',
    'inst.all_types': 'सभी प्रकार',
    'inst.sort.name': 'नाम (अ-ज्ञ)',
    'inst.sort.shortfall': 'सबसे अधिक कमी',
    'inst.sort.risk': 'सबसे अधिक जोखिम',
    'inst.sort.fdr_count': 'सबसे अधिक एफडीआर',
    'inst.clear': 'फ़िल्टर हटाएँ',
    'inst.count': '{n} संस्थान',
    'inst.count_one': '1 संस्थान',
    'inst.c_inst': 'संस्थान',
    'inst.c_type': 'प्रकार',
    'inst.c_required': 'अपेक्षित',
    'inst.c_covered': 'जमा',
    'inst.c_coverage': 'जमा अनुपात',
    'inst.c_shortfall': 'कमी',
    'inst.c_fdrs': 'एफडीआर',
    'inst.c_fdrs_title': 'सक्रिय / कुल लिखत',
    'inst.c_disc': 'लंबित मुद्दे',
    'inst.c_risk': 'अधिकतम जोखिम',
    'inst.nil': 'शून्य',
    'inst.covered_full': 'पूर्ण जमा',
    'inst.empty': 'कोई संस्थान नहीं मिला',
    'inst.empty_text': 'दूसरी खोज आज़माएँ या फ़िल्टर हटाएँ।',
    'inst.leg_short': 'पंक्ति चिह्न = कमी',
    'inst.leg_meter': 'मीटर = जमा ÷ अपेक्षित',
    'inst.report': 'कमी रिपोर्ट',
    'inst.approval.new': 'नया',
    'inst.approval.closure_requested': 'बंद करने का अनुरोध',
    'inst.approval.closed': 'बंद',
    'inst.approval.approved': 'अनुमोदित',
    'inst.disc_title': '{n} लंबित विसंगतियाँ',
    'inst.open_hint': 'संस्थान खोलें',
  },
});

// Hindi names for institution types and states (data stays in English on the server).
const TYPE_HI = {
  'Engineering & Technology': 'अभियांत्रिकी एवं प्रौद्योगिकी', Management: 'प्रबंधन', Pharmacy: 'फार्मेसी',
  Architecture: 'वास्तुकला', 'Computer Applications': 'कंप्यूटर अनुप्रयोग', 'Hotel Management & Catering': 'होटल प्रबंधन एवं कैटरिंग',
  'Polytechnic (Diploma)': 'पॉलिटेक्निक (डिप्लोमा)', 'Applied Arts & Crafts': 'अनुप्रयुक्त कला एवं शिल्प',
};
const STATE_HI = {
  'Andhra Pradesh': 'आंध्र प्रदेश', 'Arunachal Pradesh': 'अरुणाचल प्रदेश', Assam: 'असम', Bihar: 'बिहार', Chhattisgarh: 'छत्तीसगढ़',
  Delhi: 'दिल्ली', Goa: 'गोवा', Gujarat: 'गुजरात', Haryana: 'हरियाणा', 'Himachal Pradesh': 'हिमाचल प्रदेश',
  'Jammu and Kashmir': 'जम्मू और कश्मीर', Jharkhand: 'झारखंड', Karnataka: 'कर्नाटक', Kerala: 'केरल', 'Madhya Pradesh': 'मध्य प्रदेश',
  Maharashtra: 'महाराष्ट्र', Manipur: 'मणिपुर', Meghalaya: 'मेघालय', Mizoram: 'मिज़ोरम', Nagaland: 'नागालैंड', Odisha: 'ओडिशा',
  Punjab: 'पंजाब', Rajasthan: 'राजस्थान', Sikkim: 'सिक्किम', 'Tamil Nadu': 'तमिलनाडु', Telangana: 'तेलंगाना', Tripura: 'त्रिपुरा',
  'Uttar Pradesh': 'उत्तर प्रदेश', Uttarakhand: 'उत्तराखंड', 'West Bengal': 'पश्चिम बंगाल', Chandigarh: 'चंडीगढ़', Puducherry: 'पुदुच्चेरी',
  Ladakh: 'लद्दाख', 'Andaman and Nicobar Islands': 'अंडमान और निकोबार द्वीप समूह', Lakshadweep: 'लक्षद्वीप',
  'Dadra and Nagar Haveli and Daman and Diu': 'दादरा और नगर हवेली और दमन और दीव',
};
const typeName = (v) => (getLang() === 'hi' && TYPE_HI[v]) || v || '—';
const stateName = (v) => (getLang() === 'hi' && STATE_HI[v]) || v || '—';

const reportLink = () => el('a', { class: 'btn secondary', href: site('officer/reports.html?r=institution-coverage'), html: `${icon('file-text', 16)}<span>${esc(t('inst.report'))}</span>` });

const { meta } = await initPage({
  roles: ['officer', 'authority', 'admin'],
  active: 'institutions',
  title: 'inst.title',
  subtitle: 'inst.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'officer/dashboard.html' }, { label: 'inst.title' }],
  actions: reportLink,
});

const PAGE_SIZE = 25;
const SORTS = ['name', 'shortfall', 'risk', 'fdr_count'];
const kpisEl = $('#kpis');
const listEl = $('#list');
const pagerEl = $('#pager');
const fq = $('#f-q');
const fState = $('#f-state');
const fType = $('#f-type');
const fSort = $('#f-sort');
const fShort = $('#f-short');

// filters live in the URL so a filtered view can be shared or bookmarked
const state = {
  q: getParam('q') || '',
  state: getParam('state') || '',
  type: getParam('type') || '',
  sort: SORTS.includes(getParam('sort')) ? getParam('sort') : 'name',
  short: getParam('shortfall') === '1',
  page: Math.max(1, parseInt(getParam('page') || '1', 10) || 1),
};
let lastList = null;
let lastSummary = null;
let listSeq = 0;
let sumSeq = 0;

$('#f-q-icon').outerHTML = icon('search', 17);

function fillSelects() {
  const states = (meta && meta.states) || [];
  const types = (meta && meta.institution_types) || [];
  mount(fState, el('option', { value: '' }, t('inst.all_states')), states.map((s) => el('option', { value: s }, stateName(s))));
  mount(fType, el('option', { value: '' }, t('inst.all_types')), types.map((s) => el('option', { value: s }, typeName(s))));
  mount(fSort, SORTS.map((s) => el('option', { value: s }, t(`inst.sort.${s}`))));
  fState.value = state.state;
  fType.value = state.type;
  fSort.value = state.sort;
  fq.value = state.q;
  fShort.checked = state.short;
  $('#f-clear').innerHTML = `${icon('x', 15)} ${esc(t('inst.clear'))}`;
  mount($('#legend'),
    el('span', {}, el('i', { style: { background: 'var(--nk-danger)' } }), t('inst.leg_short')),
    el('span', {}, el('i', { style: { background: 'var(--nk-success)' } }), t('inst.leg_meter')));
}

function syncUrl() {
  setParams({ q: state.q, state: state.state, type: state.type, sort: state.sort === 'name' ? '' : state.sort, shortfall: state.short ? '1' : '', page: state.page > 1 ? state.page : '' });
}

function baseParams() {
  return { q: state.q || undefined, state: state.state || undefined, type: state.type || undefined };
}

/* ---------------------------------------------------------------- summary tiles */
// The list endpoint has no aggregate totals, so the tiles fetch the whole filtered set (60-odd rows) once per filter change.
async function loadSummary() {
  const seq = ++sumSeq;
  if (!lastSummary) mount(kpisEl, [1, 2, 3, 4].map(() => el('div', { class: 'kpi' }, el('div', { class: 'skeleton', style: { width: '50%' } }), el('div', { class: 'skeleton', style: { height: '28px', width: '70%', marginTop: '6px' } }))));
  try {
    const rows = [];
    let page = 1;
    for (;;) {
      const r = await api.get('/institutions', { ...baseParams(), page, page_size: 200 });
      rows.push(...r.items);
      if (rows.length >= r.total || !r.items.length || page >= 20) break;
      page += 1;
    }
    if (seq !== sumSeq) return;
    const short = rows.filter((r) => r.shortfall > 0);
    lastSummary = {
      total: rows.length,
      states: new Set(rows.map((r) => r.state)).size,
      withShort: short.length,
      shortAmount: short.reduce((a, r) => a + r.shortfall, 0),
      required: rows.reduce((a, r) => a + (r.required_deposit || 0), 0),
      covered: rows.reduce((a, r) => a + Math.min(r.covered_amount || 0, r.required_deposit || 0), 0),
    };
    renderSummary();
  } catch (err) {
    if (seq !== sumSeq) return;
    errorState(kpisEl, err, loadSummary);
  }
}

function renderSummary() {
  const s = lastSummary;
  if (!s) return;
  const pctShort = s.total ? Math.round((100 * s.withShort) / s.total) : 0;
  const cov = s.required ? Math.round((1000 * s.covered) / s.required) / 10 : 100;
  mount(kpisEl,
    kpi({ label: t('inst.k_total'), value: fmtNum(s.total), sub: esc(t('inst.k_total_sub', { n: s.states })), color: '', iconName: 'building' }),
    kpi({
      label: t('inst.k_short'), value: fmtNum(s.withShort), sub: esc(t('inst.k_short_sub', { p: `${pctShort}%` })), color: s.withShort ? 'danger' : 'success', iconName: 'alert',
      onClick: s.withShort ? () => { state.short = true; fShort.checked = true; state.sort = 'shortfall'; fSort.value = 'shortfall'; state.page = 1; refresh(false); } : undefined,
    }),
    kpi({ label: t('inst.k_amount'), value: fmtINRShort(s.shortAmount), sub: esc(t('inst.k_amount_sub')), color: s.shortAmount ? 'orange' : 'success', iconName: 'rupee', title: fmtINR(s.shortAmount) }),
    kpi({ label: t('inst.k_cov'), value: `${cov}%`, sub: esc(t('inst.k_cov_sub', { c: fmtINRShort(s.covered), r: fmtINRShort(s.required) })), color: cov >= 95 ? 'success' : cov >= 80 ? 'warning' : 'danger', iconName: 'shield-check' }));
}

/* ---------------------------------------------------------------- table */
function approvalBadge(status) {
  if (!status || status === 'approved') return '';
  const cls = status === 'new' ? 'b-info' : status === 'closed' ? 'b-slate' : 'b-warning';
  return ` <span class="badge ${cls}">${esc(t(`inst.approval.${status}`, { _default: status }))}</span>`;
}

function coverageCell(r) {
  const req = r.required_deposit || 0;
  const pct = req ? Math.min(100, Math.round((100 * (r.covered_amount || 0)) / req)) : 100;
  const tone = pct >= 100 ? '' : pct >= 60 ? 'warning' : 'danger';
  return `<div class="inst-cov" title="${esc(fmtINR(r.covered_amount))} / ${esc(fmtINR(req))}">
    <div class="row between nowrap"><span class="pct">${pct}%</span>${pct >= 100 ? `<span class="small" style="color:var(--nk-success)">${icon('check', 13)}</span>` : ''}</div>
    <div class="meter ${tone}" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="${esc(t('inst.c_coverage'))}"><span style="width:${pct}%"></span></div>
  </div>`;
}

const columns = () => [
  {
    key: 'name', label: t('inst.c_inst'), render: (r) => `<div class="inst-name"><a class="cell-main" href="${esc(site(`officer/institution.html?id=${r.id}`))}">${esc(r.name)}</a>${approvalBadge(r.approval_status)}</div>
      <div class="cell-sub"><span class="mono">${esc(r.aicte_id)}</span> · ${esc(r.city || '')}${r.city ? ', ' : ''}${esc(stateName(r.state))}</div>`,
  },
  { key: 'type', label: t('inst.c_type'), render: (r) => `<span class="text-2 small">${esc(typeName(r.type))}</span>` },
  { key: 'required_deposit', label: t('inst.c_required'), align: 'right', render: (r) => `<span class="nowrap">${esc(fmtINR(r.required_deposit))}</span>` },
  { key: 'covered_amount', label: t('inst.c_covered'), align: 'right', render: (r) => `<span class="nowrap">${esc(fmtINR(r.covered_amount))}</span>` },
  { key: 'coverage', label: t('inst.c_coverage'), render: coverageCell },
  {
    key: 'shortfall', label: t('inst.c_shortfall'), align: 'right',
    render: (r) => (r.shortfall > 0 ? `<span class="inst-short">${esc(fmtINR(r.shortfall))}</span>` : `<span class="inst-ok">${icon('check-circle', 14)}${esc(t('inst.nil'))}</span>`),
  },
  { key: 'fdrs', label: t('inst.c_fdrs'), align: 'center', render: (r) => `<span class="num nowrap" title="${esc(t('inst.c_fdrs_title'))}"><strong>${r.active_count}</strong><span class="muted"> / ${r.fdr_count}</span></span>` },
  {
    key: 'open_discrepancies', label: t('inst.c_disc'), align: 'center',
    render: (r) => `<span class="inst-count ${r.open_discrepancies ? 'some' : 'zero'}" title="${esc(t('inst.disc_title', { n: r.open_discrepancies }))}">${r.open_discrepancies || '0'}</span>`,
  },
  { key: 'max_risk', label: t('inst.c_risk'), align: 'center', render: (r) => riskBadge(r.max_risk) },
];

function renderList() {
  const d = lastList;
  if (!d) return;
  $('#list-title').innerHTML = `${icon('building', 18)} ${esc(d.total === 1 ? t('inst.count_one') : t('inst.count', { n: fmtNum(d.total) }))}`;
  renderTable(listEl, {
    columns: columns(),
    rows: d.items,
    onRowClick: (r) => { location.href = site(`officer/institution.html?id=${r.id}`); },
    rowClass: (r) => (r.shortfall > 0 ? 'row-danger' : ''),
    empty: { icon: 'building', title: t('inst.empty'), text: t('inst.empty_text') },
  });
  if (d.items.length) {
    pagination(pagerEl, { page: state.page, pageSize: PAGE_SIZE, total: d.total, onChange: (p) => { state.page = p; syncUrl(); loadList(); listEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } });
  } else {
    mount(pagerEl);
  }
}

async function loadList() {
  const seq = ++listSeq;
  loading(listEl);
  mount(pagerEl);
  try {
    const d = await api.get('/institutions', { ...baseParams(), has_shortfall: state.short ? 1 : undefined, sort: state.sort, page: state.page, page_size: PAGE_SIZE });
    if (seq !== listSeq) return;
    // a stale ?page= beyond the last page: go back to page 1
    if (!d.items.length && d.total && state.page > 1) { state.page = 1; syncUrl(); loadList(); return; }
    lastList = d;
    renderList();
  } catch (err) {
    if (seq !== listSeq) return;
    errorState(listEl, err, loadList);
  }
}

function refresh(withSummary = true) {
  syncUrl();
  loadList();
  if (withSummary) loadSummary();
}

/* ---------------------------------------------------------------- events */
fq.addEventListener('input', debounce(() => { state.q = fq.value.trim(); state.page = 1; refresh(); }, 350));
fState.addEventListener('change', () => { state.state = fState.value; state.page = 1; refresh(); });
fType.addEventListener('change', () => { state.type = fType.value; state.page = 1; refresh(); });
fSort.addEventListener('change', () => { state.sort = fSort.value; state.page = 1; refresh(false); });
fShort.addEventListener('change', () => { state.short = fShort.checked; state.page = 1; refresh(false); });
$('#f-clear').addEventListener('click', () => {
  Object.assign(state, { q: '', state: '', type: '', sort: 'name', short: false, page: 1 });
  fillSelects();
  refresh();
});

onLang(() => { fillSelects(); renderSummary(); renderList(); });
fillSelects();
loadSummary();
loadList();
