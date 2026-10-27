// Institution: every instrument lodged with AICTE, grouped by category, searchable.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, mount, kpi, renderTable, tabs, statusBadge, trustBadge, maturityChip, fmtINR, fmtINRShort, fmtDate,
  loading, errorState, getParam, setParams, debounce,
} from '../assets/js/ui.js';

extend({
  en: {
    'ifdrs.title': 'My FDRs',
    'ifdrs.subtitle': 'Every fixed deposit receipt your institution has lodged with AICTE as security deposit',
    'ifdrs.new': 'Submit new FDR',
    'ifdrs.search': 'Search by reference, FDR number or bank',
    'ifdrs.hint': 'Select a row to open the instrument',
    'ifdrs.all': 'All',
    'ifdrs.k.held': 'Currently held',
    'ifdrs.k.held_sub': 'Instruments protecting AICTE: {n}',
    'ifdrs.k.verified': 'Bank verified',
    'ifdrs.k.verified_sub': 'of {n} live instruments',
    'ifdrs.k.next': 'Next maturity',
    'ifdrs.k.next_none': 'None due',
    'ifdrs.k.action': 'Need your action',
    'ifdrs.k.action_sub': 'Discrepancies or renewals due',
    'ifdrs.col.ref': 'Reference / FDR no.',
    'ifdrs.col.bank': 'Bank',
    'ifdrs.col.maturity': 'Maturity',
    'ifdrs.empty': 'No instruments in this category',
    'ifdrs.empty_text': 'Submit an FDR receipt and it will appear here once lodged.',
    'ifdrs.nomatch': 'No instrument matches "{q}"',
    'ifdrs.foot.count': '{n} instruments shown',
    'ifdrs.foot.amount': 'Total value {amount}',
    'ifdrs.open_disc': 'Open discrepancies: {n}',
    'ifdrs.lien': 'Lien in favour of AICTE',
  },
  hi: {
    'ifdrs.title': 'मेरी एफडीआर',
    'ifdrs.subtitle': 'आपके संस्थान द्वारा एआईसीटीई के पास प्रतिभूति जमा के रूप में रखी गई सभी सावधि जमा रसीदें',
    'ifdrs.new': 'नई एफडीआर जमा करें',
    'ifdrs.search': 'संदर्भ, एफडीआर संख्या या बैंक से खोजें',
    'ifdrs.hint': 'लिखत खोलने के लिए किसी पंक्ति को चुनें',
    'ifdrs.all': 'सभी',
    'ifdrs.k.held': 'वर्तमान में धारित',
    'ifdrs.k.held_sub': 'एआईसीटीई को सुरक्षा दे रही लिखतें: {n}',
    'ifdrs.k.verified': 'बैंक द्वारा सत्यापित',
    'ifdrs.k.verified_sub': '{n} चालू लिखतों में से',
    'ifdrs.k.next': 'अगली परिपक्वता',
    'ifdrs.k.next_none': 'कोई देय नहीं',
    'ifdrs.k.action': 'आपकी कार्रवाई आवश्यक',
    'ifdrs.k.action_sub': 'विसंगतियाँ या देय नवीनीकरण',
    'ifdrs.col.ref': 'संदर्भ / एफडीआर सं.',
    'ifdrs.col.bank': 'बैंक',
    'ifdrs.col.maturity': 'परिपक्वता',
    'ifdrs.empty': 'इस श्रेणी में कोई लिखत नहीं',
    'ifdrs.empty_text': 'एफडीआर रसीद जमा करें; दर्ज होने पर वह यहाँ दिखाई देगी।',
    'ifdrs.nomatch': '"{q}" से मेल खाती कोई लिखत नहीं',
    'ifdrs.foot.count': '{n} लिखतें प्रदर्शित',
    'ifdrs.foot.amount': 'कुल मूल्य {amount}',
    'ifdrs.open_disc': 'खुली विसंगतियाँ: {n}',
    'ifdrs.lien': 'एआईसीटीई के पक्ष में ग्रहणाधिकार',
  },
});

const newBtn = () => el('a', { class: 'btn saffron', href: site('institution/submit.html'), html: `${icon('upload', 16)}<span>${esc(t('ifdrs.new'))}</span>` });

await initPage({
  roles: ['institution'],
  active: 'fdrs',
  title: 'ifdrs.title',
  subtitle: 'ifdrs.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'institution/dashboard.html' }, { label: 'ifdrs.title' }],
  actions: newBtn,
});

const CATS = ['pending', 'active', 'expiring', 'matured', 'renewed', 'released', 'rejected'];
const LIVE = ['SUBMITTED', 'UNDER_VERIFICATION', 'DISCREPANCY', 'ACTIVE', 'RELEASE_REQUESTED'];
const tableEl = $('#table');
const qInput = $('#q');
$('#search-ic').innerHTML = icon('search', 16);

let all = null;
let cat = CATS.includes(getParam('cat')) ? getParam('cat') : 'all';
let query = getParam('q') || '';
let sort = { key: 'maturity_date', dir: 'asc' };
qInput.value = query;

function filtered() {
  const q = query.trim().toLowerCase();
  let rows = all.filter((f) => cat === 'all' || f.category === cat);
  if (q) {
    rows = rows.filter((f) => [f.ref_no, f.fdr_number, f.bank && f.bank.name, f.bank && f.bank.code]
      .some((v) => String(v || '').toLowerCase().includes(q)));
  }
  const dir = sort.dir === 'desc' ? -1 : 1;
  const val = (f) => (sort.key === 'amount' ? f.amount : sort.key === 'ref_no' ? f.ref_no : f.maturity_date || '');
  return rows.slice().sort((a, b) => (val(a) > val(b) ? dir : val(a) < val(b) ? -dir : 0));
}

function renderSummary() {
  const live = all.filter((f) => LIVE.includes(f.status));
  const held = all.filter((f) => ['ACTIVE', 'RELEASE_REQUESTED'].includes(f.status));
  const heldAmt = held.reduce((s, f) => s + (f.amount || 0), 0);
  const verified = live.filter((f) => f.trust_level === 2).length;
  const next = held.filter((f) => f.status === 'ACTIVE').sort((a, b) => a.days_to_maturity - b.days_to_maturity)[0];
  const action = live.filter((f) => f.open_discrepancies > 0 || f.status === 'DISCREPANCY' || (f.status === 'ACTIVE' && f.days_to_maturity <= 90)).length;
  mount($('#summary'),
    kpi({ label: t('ifdrs.k.held'), value: fmtINRShort(heldAmt), sub: esc(t('ifdrs.k.held_sub', { n: held.length })), color: 'success', iconName: 'shield-check' }),
    kpi({ label: t('ifdrs.k.verified'), value: String(verified), sub: esc(t('ifdrs.k.verified_sub', { n: live.length })), color: 'teal', iconName: 'check-circle' }),
    kpi({
      label: t('ifdrs.k.next'), value: next ? fmtDate(next.maturity_date) : t('ifdrs.k.next_none'),
      sub: next ? `${esc(next.ref_no)} · ${maturityChip(next.days_to_maturity)}` : '', color: next && next.days_to_maturity <= 90 ? 'warning' : 'info', iconName: 'calendar',
      onClick: next ? () => { location.href = site(`institution/fdr.html?id=${next.id}`); } : undefined,
    }),
    kpi({ label: t('ifdrs.k.action'), value: String(action), sub: esc(t('ifdrs.k.action_sub')), color: action ? 'danger' : 'slate', iconName: 'bell' }));
}

function renderTabs() {
  const counts = { all: all.length };
  for (const c of CATS) counts[c] = all.filter((f) => f.category === c).length;
  const defs = [{ key: 'all', label: t('ifdrs.all'), count: counts.all }]
    .concat(CATS.map((c) => ({ key: c, label: t(`cat.${c}`), count: counts[c] })));
  tabs($('#tabs'), defs, {
    active: cat,
    onChange: (k) => { if (k !== cat) { cat = k; setParams({ cat: k === 'all' ? null : k }); renderTable_(); } },
  });
}

function renderTable_() {
  const rows = filtered();
  const empty = query.trim()
    ? { icon: 'search', title: t('ifdrs.nomatch', { q: query.trim() }), text: t('common.no_records_hint') }
    : { icon: 'file', title: t('ifdrs.empty'), text: t('ifdrs.empty_text') };
  renderTable(tableEl, {
    columns: [
      {
        key: 'ref_no', label: t('ifdrs.col.ref'), sortable: true,
        render: (f) => `<div class="cell-main mono">${esc(f.ref_no)}</div><div class="cell-sub mono">${esc(f.fdr_number)}</div>`,
      },
      {
        key: 'bank', label: t('ifdrs.col.bank'),
        render: (f) => `<div class="cell-main">${esc(f.bank ? f.bank.name : '—')}</div><div class="cell-sub">${f.lien_claimed ? esc(t('ifdrs.lien')) : ''}</div>`,
      },
      { key: 'amount', label: t('f.amount'), align: 'right', sortable: true, render: (f) => `<span class="num">${fmtINR(f.amount)}</span>` },
      {
        key: 'maturity_date', label: t('ifdrs.col.maturity'), sortable: true,
        render: (f) => `${fmtDate(f.maturity_date)}<div>${LIVE.includes(f.status) ? maturityChip(f.days_to_maturity) : ''}</div>`,
      },
      {
        key: 'status', label: t('f.status'),
        render: (f) => `${statusBadge(f.display_status)}${f.open_discrepancies ? `<div class="cell-sub" style="color:var(--nk-danger)">${icon('flag', 12)} ${esc(t('ifdrs.open_disc', { n: f.open_discrepancies }))}</div>` : ''}`,
      },
      { key: 'trust', label: t('f.trust'), render: (f) => trustBadge(f.trust_level, f.flagged) },
    ],
    rows,
    sort,
    onSort: (key, dir) => { sort = { key, dir }; renderTable_(); },
    onRowClick: (f) => { location.href = site(`institution/fdr.html?id=${f.id}`); },
    rowClass: (f) => (f.flagged || f.status === 'DISCREPANCY' ? 'row-danger' : f.category === 'matured' ? 'row-warning' : ''),
    empty,
  });
  const amt = rows.reduce((s, f) => s + (f.amount || 0), 0);
  mount($('#foot'), el('span', {}, t('ifdrs.foot.count', { n: rows.length })), el('strong', {}, t('ifdrs.foot.amount', { amount: fmtINR(amt) })));
}

function render() {
  if (!all) return;
  renderSummary();
  renderTabs();
  renderTable_();
}

async function load() {
  loading(tableEl);
  try {
    const res = await api.get('/fdrs', { page_size: 200, sort: 'maturity_date', order: 'asc' });
    all = res.items || [];
    render();
  } catch (err) {
    mount($('#foot'));
    errorState(tableEl, err, load);
  }
}

qInput.addEventListener('input', debounce(() => { query = qInput.value; setParams({ q: query || null }); if (all) renderTable_(); }, 200));
onLang(render);
load();
