// Officer - FDR registry: natural-language search (GET /api/search/nl), filters, sortable table (GET /api/fdrs),
// CSV export (GET /api/reports/fdrs.csv). Filters, sort and page live in the URL so dashboard links land filtered.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang, getLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, mount, toast, withBusy, loading, emptyState, errorState, renderTable, pagination,
  statusBadge, trustBadge, riskBadge, lienBadge, maturityChip, fmtINR, fmtINRShort, fmtDate, fmtNum,
  getParam, setParams, downloadBlob,
} from '../assets/js/ui.js';

extend({
  en: {
    'reg.title': 'FDR registry',
    'reg.subtitle': 'Every security-deposit instrument on the portal - search in plain words or filter precisely',
    'reg.queue': 'Verification queue',
    'reg.ss_title': 'Smart search - ask in plain words',
    'reg.ss_label': 'Describe the instruments you are looking for',
    'reg.ss_ph': 'Try "expiring in 60 days in Tamil Nadu above 50 lakh"',
    'reg.ss_how': 'Understands states, banks, amounts in lakh or crore, maturity windows, status, trust level, risk, lien and institution type. The query is read by rules on the portal itself - nothing is sent to an outside AI service.',
    'reg.try': 'Try:',
    'reg.understood': 'Understood as:',
    'reg.active_filters': 'Filters:',
    'reg.clear_all': 'Clear all',
    'reg.remove': 'Remove filter: {label}',
    'reg.implied': 'added automatically',
    'reg.unparsed': 'Not understood: "{w}". Rephrase it or use the advanced filters.',
    'reg.nl_empty': 'Type what you are looking for, for example "matured and not renewed".',
    'reg.nl_none': 'No filters were recognised in "{q}". Try one of the examples.',
    'reg.cats_label': 'Quick category',
    'reg.cat_all': 'All instruments',
    'reg.adv_toggle': 'Advanced filters',
    'reg.adv_title': 'Advanced filters',
    'reg.adv_sub': 'Combine any of these; empty fields are ignored',
    'reg.any': 'Any',
    'reg.f.category': 'Category',
    'reg.f.risk_band': 'Risk band',
    'reg.f.type': 'Institution type',
    'reg.f.maturity': 'Maturity between',
    'reg.f.from': 'From',
    'reg.f.to': 'To',
    'reg.f.amount': 'Amount (in lakh ₹)',
    'reg.f.min': 'Minimum',
    'reg.f.max': 'Maximum',
    'reg.f.open_disc': 'Only with an open discrepancy',
    'reg.f.flagged': 'Only flagged instruments',
    'reg.opt.not_bank': 'Not bank-verified (claimed or matched)',
    'reg.opt.high_crit': 'High or critical',
    'reg.opt.lien_yes': 'Confirmed by bank',
    'reg.opt.lien_no': 'Not confirmed by bank',
    'reg.err.dates': 'The "from" maturity date must be on or before the "to" date.',
    'reg.err.amount': 'The minimum amount cannot be more than the maximum.',
    'reg.chip.q': 'Text: "{v}"',
    'reg.chip.status': 'Workflow: {v}',
    'reg.chip.display_status': 'Status: {v}',
    'reg.chip.category': 'Category: {v}',
    'reg.chip.trust': 'Trust: {v}',
    'reg.chip.flagged': 'Flagged only',
    'reg.chip.risk_band': 'Risk: {v}',
    'reg.chip.state': 'State: {v}',
    'reg.chip.type': 'Type: {v}',
    'reg.chip.bank': 'Bank: {v}',
    'reg.chip.institution': 'Institution: {v}',
    'reg.chip.institution_any': 'One institution',
    'reg.chip.mat_between': 'Matures {a} – {b}',
    'reg.chip.mat_from': 'Matures on or after {a}',
    'reg.chip.mat_to': 'Matures on or before {b}',
    'reg.chip.amt_between': 'Amount {a} – {b}',
    'reg.chip.amt_min': 'Amount ≥ {a}',
    'reg.chip.amt_max': 'Amount ≤ {b}',
    'reg.chip.disc': 'Open discrepancy',
    'reg.chip.lien_yes': 'Lien confirmed by bank',
    'reg.chip.lien_no': 'Lien not confirmed by bank',
    'reg.or': ' or ',
    'reg.table_title': 'Instruments',
    'reg.instrument': 'instrument',
    'reg.instruments': 'instruments',
    'reg.total_value': 'total value',
    'reg.closed': 'Instrument closed',
    'reg.empty_title': 'No instruments match these filters',
    'reg.empty_text': 'Remove a filter chip above, or clear everything to see the whole registry.',
    'reg.empty_all_title': 'The registry is empty',
    'reg.empty_all_text': 'Instruments appear here as soon as institutions submit them.',
    'reg.export': 'Export CSV',
    'reg.csv_ok': 'Downloaded {n} instruments as a CSV file.',
    'reg.csv_fail': 'The CSV file could not be prepared. Please try again.',
    'reg.nl_fail': 'The search could not be understood right now. Please try again.',
    'reg.open_fdr': 'Open {ref}',
  },
  hi: {
    'reg.title': 'एफडीआर रजिस्टर',
    'reg.subtitle': 'पोर्टल पर हर सुरक्षा जमा दस्तावेज़ - सरल शब्दों में खोजें या सटीक फ़िल्टर लगाएँ',
    'reg.queue': 'सत्यापन कतार',
    'reg.ss_title': 'स्मार्ट खोज - सरल शब्दों में पूछें',
    'reg.ss_label': 'आप जो दस्तावेज़ ढूँढ रहे हैं उसका वर्णन करें',
    'reg.ss_ph': 'उदाहरण: "expiring in 60 days in Tamil Nadu above 50 lakh"',
    'reg.ss_how': 'राज्य, बैंक, लाख या करोड़ में राशि, परिपक्वता अवधि, स्थिति, विश्वास स्तर, जोखिम, लियन और संस्थान का प्रकार समझती है। प्रश्न पोर्टल पर ही नियमों से पढ़ा जाता है - किसी बाहरी एआई सेवा को कुछ नहीं भेजा जाता। (प्रश्न अंग्रेज़ी में लिखें)',
    'reg.try': 'उदाहरण:',
    'reg.understood': 'इस प्रकार समझा गया:',
    'reg.active_filters': 'फ़िल्टर:',
    'reg.clear_all': 'सभी हटाएँ',
    'reg.remove': 'फ़िल्टर हटाएँ: {label}',
    'reg.implied': 'स्वतः जोड़ा गया',
    'reg.unparsed': 'समझ में नहीं आया: "{w}"। दूसरे शब्दों में लिखें या उन्नत फ़िल्टर का उपयोग करें।',
    'reg.nl_empty': 'जो खोजना है वह लिखें, जैसे "matured and not renewed"।',
    'reg.nl_none': '"{q}" में कोई फ़िल्टर पहचाना नहीं गया। कोई उदाहरण आज़माएँ।',
    'reg.cats_label': 'त्वरित श्रेणी',
    'reg.cat_all': 'सभी दस्तावेज़',
    'reg.adv_toggle': 'उन्नत फ़िल्टर',
    'reg.adv_title': 'उन्नत फ़िल्टर',
    'reg.adv_sub': 'इनमें से कोई भी मिलाकर लगाएँ; खाली फ़ील्ड अनदेखे किए जाते हैं',
    'reg.any': 'कोई भी',
    'reg.f.category': 'श्रेणी',
    'reg.f.risk_band': 'जोखिम श्रेणी',
    'reg.f.type': 'संस्थान का प्रकार',
    'reg.f.maturity': 'परिपक्वता अवधि',
    'reg.f.from': 'से',
    'reg.f.to': 'तक',
    'reg.f.amount': 'राशि (लाख ₹ में)',
    'reg.f.min': 'न्यूनतम',
    'reg.f.max': 'अधिकतम',
    'reg.f.open_disc': 'केवल खुली विसंगति वाले',
    'reg.f.flagged': 'केवल चिह्नित दस्तावेज़',
    'reg.opt.not_bank': 'बैंक से असत्यापित (दावा या मिलान)',
    'reg.opt.high_crit': 'उच्च या गंभीर',
    'reg.opt.lien_yes': 'बैंक द्वारा पुष्ट',
    'reg.opt.lien_no': 'बैंक द्वारा पुष्ट नहीं',
    'reg.err.dates': 'परिपक्वता की "से" तिथि "तक" तिथि से पहले या उसी दिन होनी चाहिए।',
    'reg.err.amount': 'न्यूनतम राशि अधिकतम से अधिक नहीं हो सकती।',
    'reg.chip.q': 'पाठ: "{v}"',
    'reg.chip.status': 'कार्यप्रवाह: {v}',
    'reg.chip.display_status': 'स्थिति: {v}',
    'reg.chip.category': 'श्रेणी: {v}',
    'reg.chip.trust': 'विश्वास: {v}',
    'reg.chip.flagged': 'केवल चिह्नित',
    'reg.chip.risk_band': 'जोखिम: {v}',
    'reg.chip.state': 'राज्य: {v}',
    'reg.chip.type': 'प्रकार: {v}',
    'reg.chip.bank': 'बैंक: {v}',
    'reg.chip.institution': 'संस्थान: {v}',
    'reg.chip.institution_any': 'एक संस्थान',
    'reg.chip.mat_between': 'परिपक्वता {a} – {b}',
    'reg.chip.mat_from': 'परिपक्वता {a} या उसके बाद',
    'reg.chip.mat_to': 'परिपक्वता {b} या उससे पहले',
    'reg.chip.amt_between': 'राशि {a} – {b}',
    'reg.chip.amt_min': 'राशि ≥ {a}',
    'reg.chip.amt_max': 'राशि ≤ {b}',
    'reg.chip.disc': 'खुली विसंगति',
    'reg.chip.lien_yes': 'बैंक द्वारा लियन पुष्ट',
    'reg.chip.lien_no': 'बैंक द्वारा लियन पुष्ट नहीं',
    'reg.or': ' या ',
    'reg.table_title': 'दस्तावेज़',
    'reg.instrument': 'दस्तावेज़',
    'reg.instruments': 'दस्तावेज़',
    'reg.total_value': 'कुल मूल्य',
    'reg.closed': 'दस्तावेज़ बंद',
    'reg.empty_title': 'इन फ़िल्टरों से कोई दस्तावेज़ मेल नहीं खाता',
    'reg.empty_text': 'ऊपर से कोई फ़िल्टर हटाएँ, या पूरा रजिस्टर देखने के लिए सभी फ़िल्टर हटाएँ।',
    'reg.empty_all_title': 'रजिस्टर खाली है',
    'reg.empty_all_text': 'संस्थानों द्वारा प्रस्तुत करते ही दस्तावेज़ यहाँ दिखाई देंगे।',
    'reg.export': 'सीएसवी निर्यात',
    'reg.csv_ok': '{n} दस्तावेज़ सीएसवी फ़ाइल के रूप में डाउनलोड किए गए।',
    'reg.csv_fail': 'सीएसवी फ़ाइल तैयार नहीं हो सकी। कृपया पुनः प्रयास करें।',
    'reg.nl_fail': 'अभी खोज को समझा नहीं जा सका। कृपया पुनः प्रयास करें।',
    'reg.open_fdr': '{ref} खोलें',
  },
});

const FILTER_KEYS = ['q', 'status', 'display_status', 'category', 'trust', 'flagged', 'risk_band', 'state', 'type',
  'bank_id', 'institution_id', 'maturity_from', 'maturity_to', 'amount_min', 'amount_max', 'has_open_discrepancy', 'lien'];
const SORTS = ['maturity_date', 'amount', 'risk_score', 'submitted_at'];
const PAGE_SIZE = 25;
const CATS = ['active', 'expiring', 'matured', 'renewed', 'released', 'pending', 'rejected'];
const DISPLAY = ['submitted', 'under_verification', 'discrepancy', 'active', 'expiring', 'matured', 'renewed',
  'release_requested', 'released', 'rejected', 'invoked'];
const EXAMPLES = ['expiring in 60 days in Tamil Nadu', 'matured and not renewed', 'above 50 lakh not bank verified',
  'high risk engineering', 'lien not marked'];
const TYPE_HI = {
  'Engineering & Technology': 'अभियांत्रिकी एवं प्रौद्योगिकी', Management: 'प्रबंधन', Pharmacy: 'फ़ार्मेसी',
  Architecture: 'वास्तुकला', 'Computer Applications': 'कंप्यूटर अनुप्रयोग',
  'Hotel Management & Catering': 'होटल प्रबंधन एवं कैटरिंग', 'Polytechnic (Diploma)': 'पॉलिटेक्निक (डिप्लोमा)',
  'Applied Arts & Crafts': 'अनुप्रयुक्त कला एवं शिल्प',
};
const typeLabel = (v) => (getLang() === 'hi' && TYPE_HI[v]) || v;
const list = (v) => String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const truthy = (v) => ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
const fdrHref = (r) => site(`officer/fdr.html?id=${encodeURIComponent(r.id)}`);

const exportBtn = () => el('button', {
  class: 'btn secondary', type: 'button', onclick: (e) => exportCsv(e.currentTarget),
  html: `${icon('download', 16)}<span>${esc(t('reg.export'))}</span>`,
});
const { meta } = await initPage({
  roles: ['officer', 'authority', 'admin'],
  active: 'registry',
  title: 'reg.title',
  subtitle: 'reg.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'officer/dashboard.html' }, { label: 'reg.title' }],
  actions: () => el('div', { class: 'row' },
    el('a', { class: 'btn ghost', href: site('officer/queue.html'), html: `${icon('queue', 16)}<span>${esc(t('reg.queue'))}</span>` }),
    exportBtn()),
});

const banks = (meta && meta.banks) || [];
const states = (meta && meta.states) || [];
const types = (meta && meta.institution_types) || [];

const ssForm = $('#reg-ss-form');
const ssInput = $('#reg-ss-input');
const ssBtn = $('#reg-ss-btn');
const activeEl = $('#reg-active');
const catsEl = $('#reg-cats');
const advToggle = $('#reg-adv-toggle');
const advEl = $('#reg-adv');
const advForm = $('#reg-adv-form');
const advErr = $('#reg-adv-error');
const bodyEl = $('#reg-body');
const pagerEl = $('#reg-pager');
const totalsEl = $('#reg-totals');
const busyEl = $('#reg-busy');

/* ------------------------------------------------------------------ state (from the URL) */
const state = {
  filters: {},
  sort: SORTS.includes(getParam('sort')) ? getParam('sort') : null,
  order: ['asc', 'desc'].includes(getParam('order')) ? getParam('order') : null,
  userSort: SORTS.includes(getParam('sort')),
  page: Math.max(1, parseInt(getParam('page'), 10) || 1),
  nl: getParam('nl') || '',
  fromNL: false,
  unparsed: '',
  implied: new Set(),
  instName: '',
};
for (const k of FILTER_KEYS) { const v = getParam(k); if (v !== null && v !== '') state.filters[k] = v; }
// Without an explicit sort: maturity-driven filters read best soonest-first, everything else newest-first.
function autoSort() {
  if (state.userSort) return;
  const f = state.filters;
  const byMaturity = f.maturity_from || f.maturity_to || /expiring|matured/.test(`${f.category || ''},${f.display_status || ''}`);
  state.sort = byMaturity ? 'maturity_date' : 'submitted_at';
  state.order = byMaturity ? 'asc' : 'desc';
}
if (state.sort) { if (!state.order) state.order = state.sort === 'maturity_date' ? 'asc' : 'desc'; } else autoSort();
let data = null;
let loadSeq = 0;
ssInput.value = state.nl;

function cleanFilters(f) {
  const out = {};
  for (const k of FILTER_KEYS) {
    const v = f[k];
    if (v === undefined || v === null || v === '' || v === false) continue;
    out[k] = String(v);
  }
  return out;
}

function queryParams(extra = {}) {
  return { ...state.filters, sort: state.sort, order: state.order, ...extra };
}

function syncUrl() {
  const obj = {};
  for (const k of FILTER_KEYS) obj[k] = state.filters[k] || '';
  obj.sort = state.userSort ? state.sort : '';
  obj.order = state.userSort ? state.order : '';
  obj.page = state.page > 1 ? state.page : '';
  obj.nl = state.nl;
  setParams(obj);
}

/* ------------------------------------------------------------------ chips for the active filters */
function chipDefs() {
  const f = state.filters;
  const out = [];
  const add = (keys, label) => out.push({ keys, label, implied: keys.some((k) => state.implied.has(k)) });
  const joinOr = (arr) => arr.join(t('reg.or'));
  if (f.q) add(['q'], t('reg.chip.q', { v: f.q }));
  if (f.status) add(['status'], t('reg.chip.status', { v: joinOr(list(f.status).map((s) => t(`status.${s.toLowerCase()}`, { _default: s }))) }));
  if (f.display_status) add(['display_status'], t('reg.chip.display_status', { v: joinOr(list(f.display_status).map((s) => t(`status.${s}`, { _default: s }))) }));
  if (f.category) add(['category'], t('reg.chip.category', { v: joinOr(list(f.category).map((s) => t(`cat.${s}`, { _default: s }))) }));
  if (f.trust) {
    const tl = list(f.trust);
    const v = tl.join(',') === '0,1' ? t('reg.opt.not_bank') : joinOr(tl.map((x) => t(`trust.${x}`, { _default: x })));
    add(['trust'], t('reg.chip.trust', { v }));
  }
  if (f.flagged && truthy(f.flagged)) add(['flagged'], t('reg.chip.flagged'));
  if (f.risk_band) add(['risk_band'], t('reg.chip.risk_band', { v: joinOr(list(f.risk_band).map((b) => t(`risk.${b}`, { _default: b }))) }));
  if (f.state) add(['state'], t('reg.chip.state', { v: list(f.state).join(', ') }));
  if (f.type) add(['type'], t('reg.chip.type', { v: typeLabel(f.type) }));
  if (f.bank_id) {
    const b = banks.find((x) => String(x.id) === String(f.bank_id));
    add(['bank_id'], t('reg.chip.bank', { v: b ? b.name : t('common.unknown') }));
  }
  if (f.institution_id) add(['institution_id'], state.instName ? t('reg.chip.institution', { v: state.instName }) : t('reg.chip.institution_any'));
  if (f.maturity_from || f.maturity_to) {
    const a = f.maturity_from ? fmtDate(f.maturity_from) : '';
    const b = f.maturity_to ? fmtDate(f.maturity_to) : '';
    add(['maturity_from', 'maturity_to'], t(a && b ? 'reg.chip.mat_between' : a ? 'reg.chip.mat_from' : 'reg.chip.mat_to', { a, b }));
  }
  if (f.amount_min || f.amount_max) {
    const a = f.amount_min ? fmtINRShort(Number(f.amount_min)) : '';
    const b = f.amount_max ? fmtINRShort(Number(f.amount_max)) : '';
    add(['amount_min', 'amount_max'], t(a && b ? 'reg.chip.amt_between' : a ? 'reg.chip.amt_min' : 'reg.chip.amt_max', { a, b }));
  }
  if (f.has_open_discrepancy && truthy(f.has_open_discrepancy)) add(['has_open_discrepancy'], t('reg.chip.disc'));
  if (f.lien === 'confirmed') add(['lien'], t('reg.chip.lien_yes'));
  else if (f.lien === 'not_confirmed') add(['lien'], t('reg.chip.lien_no'));
  return out;
}

function renderChips() {
  const defs = chipDefs();
  const hint = state.fromNL && state.unparsed;
  if (!defs.length && !hint) { activeEl.hidden = true; mount(activeEl); return; }
  activeEl.hidden = false;
  mount(activeEl,
    el('span', { class: 'lbl' }, t(state.fromNL ? 'reg.understood' : 'reg.active_filters')),
    defs.map((d) => el('span', { class: `chip${d.implied ? ' implied' : ''}`, title: d.implied ? t('reg.implied') : null },
      el('span', {}, d.label),
      el('button', {
        type: 'button', 'aria-label': t('reg.remove', { label: d.label }), title: t('reg.remove', { label: d.label }),
        html: icon('x', 13), onclick: () => removeChip(d.keys),
      }))),
    defs.length ? el('button', { type: 'button', class: 'link-btn small', onclick: clearAll }, t('reg.clear_all')) : null,
    hint ? el('div', { class: 'reg-unparsed', html: `${icon('alert', 14)}<span>${esc(t('reg.unparsed', { w: state.unparsed }))}</span>` }) : null);
}

function removeChip(keys) {
  for (const k of keys) delete state.filters[k];
  keys.forEach((k) => state.implied.delete(k));
  state.fromNL = false;
  state.unparsed = '';
  state.page = 1;
  load();
}

function clearAll() {
  state.filters = {};
  state.implied = new Set();
  state.fromNL = false;
  state.unparsed = '';
  state.nl = '';
  state.page = 1;
  ssInput.value = '';
  load();
}

/* ------------------------------------------------------------------ quick categories + advanced panel */
function renderCats() {
  const cur = state.filters.category || '';
  const btn = (key, label) => el('button', {
    type: 'button', class: `btn sm secondary${cur === key ? ' active' : ''}`, 'aria-pressed': String(cur === key),
    onclick: () => {
      if (key) state.filters.category = key; else delete state.filters.category;
      state.fromNL = false; state.page = 1; load();
    },
  }, label);
  mount(catsEl, btn('', t('reg.cat_all')), CATS.map((c) => btn(c, t(`cat.${c}`))));
}

function renderAdvToggle() {
  const n = chipDefs().length;
  const open = !advEl.hidden;
  advToggle.setAttribute('aria-expanded', String(open));
  advToggle.classList.toggle('active', open);
  advToggle.innerHTML = `${icon('filter', 16)}<span>${esc(t('reg.adv_toggle'))}</span>${n ? `<span class="badge b-primary">${n}</span>` : ''}${icon('chevron-down', 15, open ? 'reg-rot' : '')}`;
}

function fillSelect(sel, options) {
  const keep = sel.value;
  mount(sel, el('option', { value: '' }, t('reg.any')), options.map(([v, label]) => el('option', { value: v }, label)));
  sel.value = keep;
}

function buildPanelOptions() {
  fillSelect($('#f-category'), CATS.map((c) => [c, t(`cat.${c}`)]));
  fillSelect($('#f-display_status'), DISPLAY.map((s) => [s, t(`status.${s}`)]));
  fillSelect($('#f-trust'), [['2', t('trust.2')], ['1', t('trust.1')], ['0', t('trust.0')], ['0,1', t('reg.opt.not_bank')]]);
  fillSelect($('#f-risk_band'), [['critical', t('risk.critical')], ['high', t('risk.high')], ['medium', t('risk.medium')], ['low', t('risk.low')], ['high,critical', t('reg.opt.high_crit')]]);
  fillSelect($('#f-state'), states.map((s) => [s, s]));
  fillSelect($('#f-bank_id'), banks.map((b) => [String(b.id), b.name]));
  fillSelect($('#f-type'), types.map((v) => [v, typeLabel(v)]));
  fillSelect($('#f-lien'), [['confirmed', t('reg.opt.lien_yes')], ['not_confirmed', t('reg.opt.lien_no')]]);
}

const SELECT_KEYS = ['category', 'display_status', 'trust', 'risk_band', 'state', 'bank_id', 'type', 'lien'];
function syncPanel() {
  const f = state.filters;
  for (const k of SELECT_KEYS) {
    const sel = $(`#f-${k}`);
    const v = f[k] || '';
    if (v && ![...sel.options].some((o) => o.value === v)) {
      // a combination that came from the URL or the smart search: show it as its own option
      const def = chipDefs().find((d) => d.keys.includes(k));
      sel.appendChild(el('option', { value: v }, def ? def.label.replace(/^[^:]+:\s*/, '') : v));
    }
    sel.value = v;
  }
  $('#f-maturity_from').value = f.maturity_from || '';
  $('#f-maturity_to').value = f.maturity_to || '';
  $('#f-amount_min').value = f.amount_min ? String(Number(f.amount_min) / 1e5) : '';
  $('#f-amount_max').value = f.amount_max ? String(Number(f.amount_max) / 1e5) : '';
  $('#f-has_open_discrepancy').checked = truthy(f.has_open_discrepancy || '');
  $('#f-flagged').checked = truthy(f.flagged || '');
  advErr.hidden = true;
}

function applyPanel(e) {
  e.preventDefault();
  const next = { ...state.filters };
  for (const k of SELECT_KEYS) next[k] = $(`#f-${k}`).value;
  next.maturity_from = $('#f-maturity_from').value;
  next.maturity_to = $('#f-maturity_to').value;
  const lakh = (id) => { const v = $(id).value.trim(); return v === '' ? '' : Math.round(parseFloat(v) * 1e5); };
  next.amount_min = lakh('#f-amount_min');
  next.amount_max = lakh('#f-amount_max');
  next.has_open_discrepancy = $('#f-has_open_discrepancy').checked ? '1' : '';
  next.flagged = $('#f-flagged').checked ? '1' : '';
  let err = '';
  if (next.maturity_from && next.maturity_to && next.maturity_from > next.maturity_to) err = t('reg.err.dates');
  else if (next.amount_min !== '' && next.amount_max !== '' && Number(next.amount_min) > Number(next.amount_max)) err = t('reg.err.amount');
  else if ([next.amount_min, next.amount_max].some((v) => v !== '' && (Number.isNaN(v) || v < 0))) err = t('reg.err.amount');
  if (err) { advErr.textContent = err; advErr.hidden = false; return; }
  advErr.hidden = true;
  state.filters = cleanFilters(next);
  state.implied = new Set([...state.implied].filter((k) => state.filters[k]));
  state.fromNL = false;
  state.unparsed = '';
  state.page = 1;
  load();
}

/* ------------------------------------------------------------------ smart search */
function renderExamples() {
  mount($('#reg-try'), el('span', { class: 'lbl' }, t('reg.try')), EXAMPLES.map((q) => el('button', {
    type: 'button', class: 'chip', onclick: () => { ssInput.value = q; runNL(q); },
  }, q)));
}

async function runNL(text) {
  const q = text.trim();
  if (!q) {
    if (Object.keys(state.filters).length) { clearAll(); return; }
    toast(t('reg.nl_empty'), 'info');
    ssInput.focus();
    return;
  }
  let res;
  try {
    res = await withBusy(ssBtn, () => api.get('/search/nl', { q }));
  } catch (err) {
    toast(err.message || t('reg.nl_fail'), 'error');
    return;
  }
  state.nl = q;
  state.filters = cleanFilters(res.filters || {});
  state.implied = new Set((res.chips || []).filter((c) => c.implied).map((c) => c.key));
  state.unparsed = (res.unparsed || '').trim();
  state.fromNL = true;
  state.page = 1;
  if (!Object.keys(state.filters).length) toast(t('reg.nl_none', { q }), 'warning');
  await load();
}

/* ------------------------------------------------------------------ table */
function columns() {
  return [
    {
      key: 'ref_no', label: t('f.ref_no'),
      render: (r) => el('div', {},
        el('div', { class: 'cell-main', html: `<a class="mono" href="${esc(fdrHref(r))}" aria-label="${esc(t('reg.open_fdr', { ref: r.ref_no }))}">${esc(r.ref_no)}</a>` }),
        el('div', { class: 'cell-sub' }, [r.bank && r.bank.name, r.fdr_number].filter(Boolean).join(' · '))),
    },
    {
      key: 'institution', label: t('f.institution'),
      render: (r) => {
        const inst = r.institution || {};
        return el('div', {},
          el('div', { class: 'cell-main' }, inst.name || '—'),
          el('div', { class: 'cell-sub' }, [inst.city, inst.state].filter(Boolean).join(', ')));
      },
    },
    { key: 'amount', label: t('f.amount'), align: 'right', sortable: true, render: (r) => `<strong class="nowrap">${esc(fmtINR(r.amount))}</strong>` },
    {
      key: 'maturity_date', label: t('f.maturity_date'), sortable: true,
      render: (r) => `<div class="reg-mat"><span class="nowrap">${esc(fmtDate(r.maturity_date))}</span>${r.validity === 'CLOSED' ? `<span class="small muted">${esc(t('reg.closed'))}</span>` : maturityChip(r.days_to_maturity)}</div>`,
    },
    { key: 'display_status', label: t('f.status'), render: (r) => statusBadge(r.display_status) },
    { key: 'trust_level', label: t('f.trust'), render: (r) => trustBadge(r.trust_level, r.flagged) },
    { key: 'risk_score', label: t('f.risk'), sortable: true, render: (r) => riskBadge(r.risk_score, r.risk_band) },
    { key: 'lien', label: t('f.lien'), render: (r) => lienBadge(r.lien_confirmed, r.lien_claimed) },
    { key: 'submitted_at', label: t('f.submitted_at'), sortable: true, render: (r) => `<span class="nowrap small">${esc(fmtDate(r.submitted_at))}</span>` },
  ];
}

function renderTotals() {
  if (!data) { mount(totalsEl); return; }
  const n = data.total || 0;
  const amt = (data.totals && data.totals.amount) || 0;
  totalsEl.innerHTML = `<span><strong>${esc(fmtNum(n))}</strong> ${esc(t(n === 1 ? 'reg.instrument' : 'reg.instruments'))}</span><span aria-hidden="true">·</span><span><strong>${esc(fmtINRShort(amt))}</strong> ${esc(t('reg.total_value'))}</span>`;
}

function renderTableArea() {
  if (!data) return;
  const rows = data.items || [];
  if (!rows.length) {
    mount(pagerEl);
    const filtered = Object.keys(state.filters).length > 0;
    emptyState(bodyEl, filtered
      ? {
        icon: 'search', title: t('reg.empty_title'), text: t('reg.empty_text'),
        action: el('button', { class: 'btn secondary sm', type: 'button', onclick: clearAll, html: `${icon('x', 15)}<span>${esc(t('reg.clear_all'))}</span>` }),
      }
      : { icon: 'inbox', title: t('reg.empty_all_title'), text: t('reg.empty_all_text') });
    return;
  }
  renderTable(bodyEl, {
    columns: columns(),
    rows,
    onRowClick: (r) => { location.href = fdrHref(r); },
    rowClass: (r) => (r.risk_band === 'critical' ? 'row-danger' : r.risk_band === 'high' ? 'row-warning' : ''),
    sort: { key: state.sort, dir: state.order },
    onSort: (key, dir) => { state.sort = key; state.order = dir; state.userSort = true; state.page = 1; load(); },
  });
  pagination(pagerEl, {
    page: state.page, pageSize: PAGE_SIZE, total: data.total || 0,
    onChange: (p) => { state.page = p; load(); $('#reg-table-title').scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  });
}

function renderFilterUi() {
  renderChips();
  renderCats();
  renderAdvToggle();
  syncPanel();
}

/* ------------------------------------------------------------------ data */
async function load() {
  const seq = ++loadSeq;
  autoSort();
  syncUrl();
  renderFilterUi();
  if (!data) loading(bodyEl); else { bodyEl.classList.add('dim'); busyEl.hidden = false; }
  try {
    const res = await api.get('/fdrs', queryParams({ page: state.page, page_size: PAGE_SIZE }));
    if (seq !== loadSeq) return;
    // a page beyond the end (e.g. after filters shrank the list): go to the last page
    const last = Math.max(1, Math.ceil((res.total || 0) / PAGE_SIZE));
    if (state.page > last) { state.page = last; load(); return; }
    data = res;
    if (state.filters.institution_id && res.items && res.items[0] && res.items[0].institution) {
      state.instName = res.items[0].institution.name;
      renderChips();
    }
    renderTotals();
    renderTableArea();
  } catch (err) {
    if (seq !== loadSeq) return;
    data = null;
    mount(pagerEl);
    renderTotals();
    errorState(bodyEl, err, () => load());
  } finally {
    if (seq === loadSeq) { bodyEl.classList.remove('dim'); busyEl.hidden = true; }
  }
}

async function exportCsv(btn) {
  try {
    const blob = await withBusy(btn, () => api.blob('/reports/fdrs.csv', queryParams()));
    const day = (meta && meta.today) || new Date().toISOString().slice(0, 10);
    downloadBlob(blob, `nidhi-kavach_fdr-registry_${day}.csv`);
    toast(t('reg.csv_ok', { n: fmtNum(data ? data.total : 0) }), 'success');
  } catch (err) {
    toast(err.message || t('reg.csv_fail'), 'error');
  }
}

/* ------------------------------------------------------------------ wiring */
ssForm.addEventListener('submit', (e) => { e.preventDefault(); runNL(ssInput.value); });
advForm.addEventListener('submit', applyPanel);
$('#reg-adv-clear').addEventListener('click', () => { advErr.hidden = true; clearAll(); });
advToggle.addEventListener('click', () => {
  advEl.hidden = !advEl.hidden;
  renderAdvToggle();
  if (!advEl.hidden) $('#f-category').focus();
});

function staticIcons() {
  $('#reg-ss-eyebrow-icon').innerHTML = icon('sparkles', 16);
  $('#reg-ss-icon').innerHTML = icon('search', 20);
  $('#reg-ss-btn-icon').innerHTML = icon('sparkles', 16);
  $('#reg-how-icon').innerHTML = icon('info', 15);
  $('#reg-adv-icon').innerHTML = icon('filter', 18);
  $('#reg-table-icon').innerHTML = icon('list', 18);
}

onLang(() => {
  staticIcons();
  buildPanelOptions();
  renderExamples();
  renderFilterUi();
  renderTotals();
  renderTableArea();
});
staticIcons();
buildPanelOptions();
renderExamples();
load();
