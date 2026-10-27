// Institution: own release / refund / discharge requests, plus a form to raise a new one.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, mount, renderTable, tabs, releaseBadge, fmtINR, fmtDate, fmtNum,
  loading, errorState, toast, withBusy, getParam, setParams,
} from '../assets/js/ui.js';

extend({
  en: {
    'irel.title': 'Release & refund requests',
    'irel.subtitle': 'Ask AICTE to release, refund or discharge a security deposit, and follow every request through its stages',
    'irel.all': 'All',
    'irel.col.ref': 'Request',
    'irel.col.fdr': 'FDR / amount',
    'irel.col.type': 'Type',
    'irel.col.stage': 'Stage / time limit',
    'irel.col.requested': 'Requested',
    'irel.empty': 'No requests here',
    'irel.empty_text': 'Raise a request from the form and it will be tracked here.',
    'irel.foot.count': '{n} requests shown',
    'irel.foot.open': 'Open: {n}',
    'irel.sla.left': '{d} left',
    'irel.sla.over': '{d} overdue',
    'irel.sla.you': 'With your institution',
    'irel.sla.closed': 'Closed',
    'irel.dur_m': '{m} min',
    'irel.dur_h': '{h} h',
    'irel.dur_d': '{d} d',
    'irel.dur_dh': '{d} d {h} h',
    'irel.new.title': 'New request',
    'irel.new.fdr': 'Deposit (FDR)',
    'irel.new.fdr_hint': 'Only active deposits without an open request are listed.',
    'irel.new.pick': 'Select a deposit',
    'irel.new.type': 'Request type',
    'irel.new.reason': 'Reason',
    'irel.new.reason_ph': 'Explain why the deposit should be released, refunded or discharged',
    'irel.new.submit': 'Submit request',
    'irel.new.none': 'No deposit is eligible right now',
    'irel.new.none_text': 'A request can be raised only for an active deposit that has no open request.',
    'irel.new.err_fdr': 'Choose the deposit this request is for.',
    'irel.new.err_reason': 'Please give a reason for this request.',
    'irel.new.created': 'Request {ref} submitted',
    'irel.new.fail': 'Could not submit the request: {msg}',
    'irel.type.release': 'Release of lien once the deposit has completed its tenure.',
    'irel.type.refund': 'Refund of the deposit amount to the institution.',
    'irel.type.discharge': 'Discharge of the deposit on closure of the institution or programme.',
  },
  hi: {
    'irel.title': 'मुक्ति एवं वापसी अनुरोध',
    'irel.subtitle': 'प्रतिभूति जमा की मुक्ति, वापसी या उन्मोचन के लिए एआईसीटीई से अनुरोध करें और हर अनुरोध को उसके चरणों में देखते रहें',
    'irel.all': 'सभी',
    'irel.col.ref': 'अनुरोध',
    'irel.col.fdr': 'एफडीआर / राशि',
    'irel.col.type': 'प्रकार',
    'irel.col.stage': 'चरण / समय-सीमा',
    'irel.col.requested': 'अनुरोध की तिथि',
    'irel.empty': 'यहाँ कोई अनुरोध नहीं',
    'irel.empty_text': 'फ़ॉर्म से अनुरोध करें; वह यहाँ ट्रैक होता रहेगा।',
    'irel.foot.count': '{n} अनुरोध प्रदर्शित',
    'irel.foot.open': 'खुले: {n}',
    'irel.sla.left': '{d} शेष',
    'irel.sla.over': '{d} विलंब',
    'irel.sla.you': 'आपके संस्थान के पास',
    'irel.sla.closed': 'बंद',
    'irel.dur_m': '{m} मिनट',
    'irel.dur_h': '{h} घंटे',
    'irel.dur_d': '{d} दिन',
    'irel.dur_dh': '{d} दिन {h} घंटे',
    'irel.new.title': 'नया अनुरोध',
    'irel.new.fdr': 'जमा (एफडीआर)',
    'irel.new.fdr_hint': 'केवल वे चालू जमाएँ दिखाई गई हैं जिन पर कोई अनुरोध खुला नहीं है।',
    'irel.new.pick': 'कोई जमा चुनें',
    'irel.new.type': 'अनुरोध का प्रकार',
    'irel.new.reason': 'कारण',
    'irel.new.reason_ph': 'बताएँ कि जमा क्यों मुक्त, वापस या उन्मोचित की जानी चाहिए',
    'irel.new.submit': 'अनुरोध जमा करें',
    'irel.new.none': 'अभी कोई जमा पात्र नहीं है',
    'irel.new.none_text': 'अनुरोध केवल ऐसी चालू जमा पर किया जा सकता है जिस पर कोई अनुरोध खुला न हो।',
    'irel.new.err_fdr': 'वह जमा चुनें जिसके लिए यह अनुरोध है।',
    'irel.new.err_reason': 'कृपया इस अनुरोध का कारण लिखें।',
    'irel.new.created': 'अनुरोध {ref} जमा हो गया',
    'irel.new.fail': 'अनुरोध जमा नहीं हो सका: {msg}',
    'irel.type.release': 'जमा की अवधि पूरी होने पर ग्रहणाधिकार की मुक्ति।',
    'irel.type.refund': 'जमा राशि की संस्थान को वापसी।',
    'irel.type.discharge': 'संस्थान या पाठ्यक्रम के बंद होने पर जमा का उन्मोचन।',
  },
});

await initPage({
  roles: ['institution'],
  active: 'releases',
  title: 'irel.title',
  subtitle: 'irel.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'institution/dashboard.html' }, { label: 'irel.title' }],
});

const OPEN = ['SUBMITTED', 'SCRUTINY', 'RECOMMENDED', 'APPROVED', 'RETURNED'];
const STATUSES = ['SUBMITTED', 'SCRUTINY', 'RECOMMENDED', 'APPROVED', 'RETURNED', 'RELEASED', 'REJECTED'];
const TYPES = ['release', 'refund', 'discharge'];
const tableEl = $('#table');
const form = $('#form');
const selFdr = $('#f-fdr');
const selType = $('#f-type');
const reason = $('#f-reason');

let items = null;
let eligible = null;      // ACTIVE FDRs with no open request (null = not loaded)
let filter = STATUSES.includes(getParam('st')) ? getParam('st') : 'all';
let preFdr = getParam('fdr');
let sort = { key: 'requested_at', dir: 'desc' };

function fmtDur(hours) {
  const abs = Math.abs(hours);
  if (abs < 1) return t('irel.dur_m', { m: Math.max(1, Math.round(abs * 60)) });
  const total = Math.round(abs);
  const days = Math.floor(total / 24);
  const h = total % 24;
  if (!days) return t('irel.dur_h', { h });
  return h ? t('irel.dur_dh', { d: days, h }) : t('irel.dur_d', { d: days });
}
const stageLabel = (s) => t(`rstage.${s}`, { _default: s });
const typeLabel = (r) => t(`rtype.${r.request_type}`, { _default: r.request_type });

function slaCell(r) {
  if (!OPEN.includes(r.status)) return `<div>${esc(stageLabel(r.status))}</div><div class="cell-sub">${esc(t('irel.sla.closed'))}</div>`;
  let line = '';
  if (r.status === 'RETURNED') line = `<span class="cell-sub">${esc(t('irel.sla.you'))}</span>`;
  else if (r.sla_hours_left !== null && r.sla_hours_left !== undefined) {
    const left = r.sla_hours_left;
    const cls = left < 0 || r.sla_breached ? 'irel-sla-bad' : left <= 24 ? 'irel-sla-warn' : 'irel-sla-ok';
    line = `<span class="${cls}">${esc(left < 0 ? t('irel.sla.over', { d: fmtDur(left) }) : t('irel.sla.left', { d: fmtDur(left) }))}</span>`;
  }
  return `<div>${esc(stageLabel(r.status))}</div><div>${line}</div>`;
}

/* ------------------------------------------------------------------ list */
function filtered() {
  const rows = items.filter((r) => filter === 'all' || r.status === filter);
  const dir = sort.dir === 'desc' ? -1 : 1;
  const val = (r) => (sort.key === 'amount' ? r.amount : sort.key === 'ref_no' ? r.ref_no : r.requested_at || '');
  return rows.slice().sort((a, b) => (val(a) > val(b) ? dir : val(a) < val(b) ? -dir : 0));
}

function renderTabs() {
  const defs = [{ key: 'all', label: t('irel.all'), count: items.length }]
    .concat(STATUSES.map((s) => ({ key: s, label: stageLabel(s), count: items.filter((r) => r.status === s).length })));
  tabs($('#tabs'), defs, {
    active: filter,
    onChange: (k) => { if (k !== filter) { filter = k; setParams({ st: k === 'all' ? null : k }); renderRows(); } },
  });
}

function renderRows() {
  const rows = filtered();
  renderTable(tableEl, {
    columns: [
      { key: 'ref_no', label: t('irel.col.ref'), sortable: true, render: (r) => `<div class="cell-main mono">${esc(r.ref_no)}</div><div>${releaseBadge(r.status)}</div>` },
      { key: 'amount', label: t('irel.col.fdr'), sortable: true, render: (r) => `<div class="cell-main mono">${esc(r.fdr_ref_no)}</div><div class="cell-sub">${fmtINR(r.amount)}</div>` },
      { key: 'type', label: t('irel.col.type'), render: (r) => esc(typeLabel(r)) },
      { key: 'sla', label: t('irel.col.stage'), render: slaCell },
      { key: 'requested_at', label: t('irel.col.requested'), sortable: true, render: (r) => esc(fmtDate(r.requested_at)) },
    ],
    rows,
    sort,
    onSort: (key, dir) => { sort = { key, dir }; renderRows(); },
    onRowClick: (r) => { location.href = site(`institution/release.html?id=${r.id}`); },
    rowClass: (r) => (r.sla_breached && OPEN.includes(r.status) ? 'row-danger' : r.status === 'RETURNED' ? 'row-warning' : ''),
    empty: { icon: 'file', title: t('irel.empty'), text: t('irel.empty_text') },
  });
  const amt = rows.reduce((s, r) => s + (r.amount || 0), 0);
  mount($('#foot'),
    el('span', {}, t('irel.foot.count', { n: fmtNum(rows.length) })),
    el('span', {}, t('irel.foot.open', { n: fmtNum(items.filter((r) => OPEN.includes(r.status)).length) })),
    el('strong', {}, fmtINR(amt)));
}

/* ------------------------------------------------------------------ form */
function renderForm() {
  const fdrVal = selFdr.value || (preFdr ? String(preFdr) : '');
  const typeVal = selType.value || 'release';
  const list = eligible || [];
  mount(selFdr, el('option', { value: '' }, t('irel.new.pick')),
    list.map((f) => el('option', { value: String(f.id) }, `${f.ref_no} · ${f.fdr_number} · ${fmtINR(f.amount)}${f.bank ? ` · ${f.bank.name}` : ''}`)));
  if (list.some((f) => String(f.id) === fdrVal)) selFdr.value = fdrVal;
  mount(selType, TYPES.map((x) => el('option', { value: x }, t(`rtype.${x}`, { _default: x }))));
  selType.value = typeVal;
  $('#type-hint').textContent = t(`irel.type.${selType.value}`);
  const none = eligible && !list.length;
  mount($('#new-state'), none ? el('div', { class: 'alert info' }, el('div', {}, el('div', { class: 'a-title' }, t('irel.new.none')), el('div', {}, t('irel.new.none_text')))) : null);
  form.hidden = !!none;
}

function fieldError(id, input, msg) {
  const e = $(id);
  e.hidden = !msg;
  e.textContent = msg || '';
  input.classList.toggle('invalid', !!msg);
}

selType.addEventListener('change', () => { $('#type-hint').textContent = t(`irel.type.${selType.value}`); });
selFdr.addEventListener('change', () => { preFdr = null; fieldError('#e-fdr', selFdr, ''); });
reason.addEventListener('input', () => fieldError('#e-reason', reason, ''));

form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const text = reason.value.trim();
  let bad = false;
  if (!selFdr.value) { fieldError('#e-fdr', selFdr, t('irel.new.err_fdr')); bad = true; }
  if (!text) { fieldError('#e-reason', reason, t('irel.new.err_reason')); bad = true; }
  if (bad) { (selFdr.value ? reason : selFdr).focus(); return; }
  withBusy($('#submit'), async () => {
    try {
      const r = await api.post('/releases', { fdr_id: Number(selFdr.value), request_type: selType.value, reason: text });
      toast(t('irel.new.created', { ref: r.ref_no }), 'success');
      setTimeout(() => { location.href = site(`institution/release.html?id=${r.id}`); }, 700);
    } catch (err) {
      toast(t('irel.new.fail', { msg: err.message || t('common.error') }), 'danger');
    }
  });
});

/* ------------------------------------------------------------------ load */
function render() {
  renderForm();
  if (!items) return;
  renderTabs();
  renderRows();
}

async function load() {
  loading(tableEl);
  const [rels, fdrs] = await Promise.allSettled([
    api.get('/releases', { page_size: 200 }),
    api.get('/fdrs', { status: 'ACTIVE', page_size: 200 }),
  ]);
  if (rels.status === 'rejected') {
    mount($('#foot'));
    errorState(tableEl, rels.reason, load);
  } else {
    items = rels.value.items || [];
  }
  if (fdrs.status === 'fulfilled') {
    const busy = new Set((items || []).filter((r) => OPEN.includes(r.status)).map((r) => r.fdr_id));
    eligible = (fdrs.value.items || []).filter((f) => f.status === 'ACTIVE' && !busy.has(f.id));
  } else {
    eligible = [];
    toast(fdrs.reason.message || t('common.error'), 'danger');
  }
  render();
}

onLang(render);
load();
