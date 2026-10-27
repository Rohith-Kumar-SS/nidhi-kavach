// Officer: release / refund / discharge requests - KPI row, pipeline board by stage, full table, stage turnaround.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang } from '../assets/js/i18n.js';
import {
  $, $$, el, esc, icon, kpi, mount, loading, emptyState, errorState, renderTable, pagination, releaseBadge,
  fmtINR, fmtINRShort, fmtDate, fmtNum, parseISO, getParam, setParams, debounce,
} from '../assets/js/ui.js';

extend({
  en: {
    'rlist.title': 'Release & refund requests',
    'rlist.subtitle': 'Scrutiny, approval and release of security deposits, with service-level (SLA) tracking at every stage',
    'rlist.kpi_heading': 'Summary',
    'rlist.view': 'View',
    'rlist.board': 'Board',
    'rlist.table': 'Table',
    'rlist.search_ph': 'Search by reference, institution, FDR number or AICTE ID',
    'rlist.breached_only': 'SLA breached only',
    'rlist.all_statuses': 'All statuses ({n})',
    'rlist.status_opt': '{label} ({n})',
    'rlist.all_requests': 'All requests',
    'rlist.table_sub': '{n} requests',
    'rlist.stage_title': 'Time spent per stage',
    'rlist.stage_sub': 'Average of completed stays vs the service-level limit',
    'rlist.refresh': 'Refresh',
    'rlist.k_open': 'Open requests',
    'rlist.k_open_sub': '{rec} awaiting approval · {ret} with institution',
    'rlist.k_breach': 'SLA breaches',
    'rlist.k_breach_sub_worst': 'Worst: {ref}, overdue {d}',
    'rlist.k_breach_sub_none': 'Every open request is within its time limit',
    'rlist.k_tat': 'Average turnaround',
    'rlist.k_tat_val': '{n} days',
    'rlist.k_tat_sub': 'Request to NOC · {n} completed',
    'rlist.k_bottleneck': 'Bottleneck stage',
    'rlist.k_bottleneck_sub': 'Average {avg} against an SLA of {sla}',
    'rlist.k_released': 'Released in last 30 days',
    'rlist.k_released_sub': '{amt} returned to institutions',
    'rlist.no_data': 'Not enough data yet',
    'rlist.col_sla': 'SLA {d}',
    'rlist.waits_aicte': 'with AICTE',
    'rlist.waits_inst': 'with institution',
    'rlist.col_empty': 'No requests at this stage',
    'rlist.in_stage': 'In stage {d}',
    'rlist.left': '{d} left',
    'rlist.overdue': 'Overdue {d}',
    'rlist.inst_left': 'Reply due in {d}',
    'rlist.inst_overdue': 'Reply overdue {d}',
    'rlist.open_detail': 'Open request {ref}',
    'rlist.board_closed': '{rel} released and {rej} rejected requests are listed in the table view.',
    'rlist.see_table': 'Show all in table',
    'rlist.board_empty': 'No open requests match your search',
    'rlist.board_empty_text': 'Clear the search to see the whole pipeline.',
    'rlist.c_ref': 'Reference',
    'rlist.c_inst': 'Institution',
    'rlist.c_fdr': 'FDR · bank',
    'rlist.c_amount': 'Amount',
    'rlist.c_stage': 'Stage',
    'rlist.c_requested': 'Requested',
    'rlist.c_sla': 'SLA / outcome',
    'rlist.released_on': 'Released {d}',
    'rlist.closed': 'Closed',
    'rlist.empty_table': 'No requests match these filters',
    'rlist.avg': 'avg',
    'rlist.median': 'Median {d}',
    'rlist.sla_limit': 'SLA {d}',
    'rlist.breaches': '{n} SLA breaches',
    'rlist.breaches_1': '1 SLA breach',
    'rlist.breaches_0': 'No SLA breaches',
    'rlist.open_now': '{n} open now',
    'rlist.bottleneck_tag': 'Bottleneck',
    'rlist.no_visits': 'No completed stays yet',
    'rlist.dur_dh': '{d} d {h} h',
    'rlist.dur_d': '{d} d',
    'rlist.dur_h': '{h} h',
    'rlist.dur_m': '{m} min',
    'rlist.days_short': '{n} d',
  },
  hi: {
    'rlist.title': 'रिलीज़ एवं वापसी अनुरोध',
    'rlist.subtitle': 'प्रतिभूति जमा की जाँच, स्वीकृति और रिलीज़ - हर चरण पर समय-सीमा (SLA) की निगरानी के साथ',
    'rlist.kpi_heading': 'सारांश',
    'rlist.view': 'दृश्य',
    'rlist.board': 'बोर्ड',
    'rlist.table': 'तालिका',
    'rlist.search_ph': 'संदर्भ संख्या, संस्थान, एफडीआर संख्या या एआईसीटीई आईडी से खोजें',
    'rlist.breached_only': 'केवल समय-सीमा पार',
    'rlist.all_statuses': 'सभी स्थितियाँ ({n})',
    'rlist.status_opt': '{label} ({n})',
    'rlist.all_requests': 'सभी अनुरोध',
    'rlist.table_sub': '{n} अनुरोध',
    'rlist.stage_title': 'प्रत्येक चरण में लगा समय',
    'rlist.stage_sub': 'पूर्ण हुए चरणों का औसत समय, निर्धारित समय-सीमा की तुलना में',
    'rlist.refresh': 'रीफ़्रेश',
    'rlist.k_open': 'खुले अनुरोध',
    'rlist.k_open_sub': '{rec} स्वीकृति हेतु लंबित · {ret} संस्थान के पास',
    'rlist.k_breach': 'समय-सीमा उल्लंघन',
    'rlist.k_breach_sub_worst': 'सर्वाधिक विलंब: {ref}, {d} से अधिक',
    'rlist.k_breach_sub_none': 'सभी खुले अनुरोध समय-सीमा के भीतर हैं',
    'rlist.k_tat': 'औसत निपटान समय',
    'rlist.k_tat_val': '{n} दिन',
    'rlist.k_tat_sub': 'अनुरोध से एनओसी तक · {n} पूर्ण',
    'rlist.k_bottleneck': 'सबसे धीमा चरण',
    'rlist.k_bottleneck_sub': 'औसत {avg}, जबकि समय-सीमा {sla}',
    'rlist.k_released': 'पिछले 30 दिनों में रिलीज़',
    'rlist.k_released_sub': '{amt} संस्थानों को लौटाए गए',
    'rlist.no_data': 'अभी पर्याप्त आँकड़े नहीं',
    'rlist.col_sla': 'समय-सीमा {d}',
    'rlist.waits_aicte': 'एआईसीटीई के पास',
    'rlist.waits_inst': 'संस्थान के पास',
    'rlist.col_empty': 'इस चरण में कोई अनुरोध नहीं',
    'rlist.in_stage': 'इस चरण में {d}',
    'rlist.left': '{d} शेष',
    'rlist.overdue': '{d} विलंब',
    'rlist.inst_left': 'उत्तर {d} में अपेक्षित',
    'rlist.inst_overdue': 'उत्तर में {d} विलंब',
    'rlist.open_detail': 'अनुरोध {ref} खोलें',
    'rlist.board_closed': '{rel} रिलीज़ और {rej} अस्वीकृत अनुरोध तालिका दृश्य में उपलब्ध हैं।',
    'rlist.see_table': 'तालिका में सभी देखें',
    'rlist.board_empty': 'खोज से मेल खाता कोई खुला अनुरोध नहीं',
    'rlist.board_empty_text': 'पूरी प्रक्रिया देखने के लिए खोज साफ़ करें।',
    'rlist.c_ref': 'संदर्भ संख्या',
    'rlist.c_inst': 'संस्थान',
    'rlist.c_fdr': 'एफडीआर · बैंक',
    'rlist.c_amount': 'राशि',
    'rlist.c_stage': 'चरण',
    'rlist.c_requested': 'अनुरोध तिथि',
    'rlist.c_sla': 'समय-सीमा / परिणाम',
    'rlist.released_on': '{d} को रिलीज़',
    'rlist.closed': 'बंद',
    'rlist.empty_table': 'इन फ़िल्टरों से मेल खाता कोई अनुरोध नहीं',
    'rlist.avg': 'औसत',
    'rlist.median': 'माध्यिका {d}',
    'rlist.sla_limit': 'समय-सीमा {d}',
    'rlist.breaches': '{n} बार समय-सीमा पार',
    'rlist.breaches_1': '1 बार समय-सीमा पार',
    'rlist.breaches_0': 'समय-सीमा का कोई उल्लंघन नहीं',
    'rlist.open_now': 'अभी {n} खुले',
    'rlist.bottleneck_tag': 'सबसे धीमा',
    'rlist.no_visits': 'अभी कोई पूर्ण चरण नहीं',
    'rlist.dur_dh': '{d} दिन {h} घंटे',
    'rlist.dur_d': '{d} दिन',
    'rlist.dur_h': '{h} घंटे',
    'rlist.dur_m': '{m} मिनट',
    'rlist.days_short': '{n} दिन',
  },
});

const BOARD_STAGES = ['SUBMITTED', 'SCRUTINY', 'RECOMMENDED', 'APPROVED', 'RETURNED'];
const ALL_STATUSES = ['SUBMITTED', 'SCRUTINY', 'RECOMMENDED', 'APPROVED', 'RELEASED', 'RETURNED', 'REJECTED'];
const VIEW_KEY = 'nk_releases_view';
const PAGE_SIZE = 15;

const refreshBtn = el('button', { class: 'btn secondary', type: 'button' });
const { meta } = await initPage({
  roles: ['officer', 'authority', 'admin'],
  active: 'releases',
  title: 'rlist.title',
  subtitle: 'rlist.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'officer/dashboard.html' }, { label: 'nav.releases' }],
  actions: refreshBtn,
});

/* ------------------------------------------------------------------ helpers */
function toMs(s) {
  const p = parseISO(s);
  if (!p) return null;
  return Date.UTC(p.y, p.mo, p.d, p.hh || 0, p.mi || 0);
}
const loadedAt = Date.now();
/** Server "now" (demo-clock aware) moved forward by the time the page has been open. */
function serverNowMs() {
  const base = toMs(meta && meta.now);
  return (base === null ? Date.now() : base) + (Date.now() - loadedAt);
}
function hoursSince(iso) {
  const ms = toMs(iso);
  return ms === null ? null : (serverNowMs() - ms) / 3600000;
}

/** 52.4 -> "2 d 4 h"; 3.2 -> "3 h"; 0.4 -> "24 min". */
function fmtDur(hours) {
  if (hours === null || hours === undefined || Number.isNaN(hours)) return '—';
  const abs = Math.abs(hours);
  if (abs < 1) return t('rlist.dur_m', { m: Math.max(1, Math.round(abs * 60)) });
  const total = Math.round(abs);
  const d = Math.floor(total / 24);
  const h = total % 24;
  if (!d) return t('rlist.dur_h', { h });
  return h ? t('rlist.dur_dh', { d, h }) : t('rlist.dur_d', { d });
}
function fmtDays(hours) {
  if (hours === null || hours === undefined) return '—';
  return t('rlist.days_short', { n: fmtNum(hours / 24, 1) });
}

function slaChip(status, hoursLeft) {
  if (hoursLeft === null || hoursLeft === undefined) return '';
  const inst = status === 'RETURNED';
  if (hoursLeft < 0) {
    const cls = inst ? 'b-orange' : 'b-danger';
    return `<span class="badge ${cls}">${icon('alert-circle', 12)}${esc(t(inst ? 'rlist.inst_overdue' : 'rlist.overdue', { d: fmtDur(hoursLeft) }))}</span>`;
  }
  const cls = inst ? 'b-slate' : hoursLeft <= 24 ? 'b-orange' : 'b-success';
  return `<span class="badge ${cls}">${icon('clock', 12)}${esc(t(inst ? 'rlist.inst_left' : 'rlist.left', { d: fmtDur(hoursLeft) }))}</span>`;
}

function typeBadge(type) {
  return `<span class="badge b-saffron">${esc(t(`rtype.${type}`, { _default: type }))}</span>`;
}

function readStore(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function writeStore(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }

/* ------------------------------------------------------------------ state */
const kpiEl = $('#rl-kpis');
const boardEl = $('#rl-board');
const boardNoteEl = $('#rl-board-note');
const tableEl = $('#rl-table');
const pagerEl = $('#rl-pager');
const stagesEl = $('#rl-stages');
const qInput = $('#rl-q');
const statusSel = $('#rl-status');
const breachedCb = $('#rl-breached');

const st = {
  view: 'board',
  q: getParam('q') || '',
  status: (getParam('status') || '').toUpperCase(),
  breached: getParam('breached') === '1',
  page: 1,
  sort: { key: 'requested_at', dir: 'desc' },
  summary: null,    // unfiltered list call (counts, open, sla_breached, released items)
  analytics: null,
  board: null,
  table: null,
};
if (!ALL_STATUSES.includes(st.status)) st.status = '';
const urlView = getParam('view');
st.view = urlView === 'table' || urlView === 'board' ? urlView : (st.status || st.breached ? 'table' : (readStore(VIEW_KEY) === 'table' ? 'table' : 'board'));
qInput.value = st.q;
breachedCb.checked = st.breached;

$$('[data-icon]').forEach((n) => { n.innerHTML = icon(n.dataset.icon, 16); });
$('#rl-analytics-link').href = site('officer/analytics.html');

/* ------------------------------------------------------------------ KPIs */
function renderKpis() {
  const s = st.summary;
  const a = st.analytics;
  if (!s && !a) return;
  const counts = (s && s.counts) || {};
  const tiles = [];
  tiles.push(kpi({
    label: t('rlist.k_open'), value: s ? fmtNum(s.open) : '—', color: 'info', iconName: 'inbox',
    sub: s ? esc(t('rlist.k_open_sub', { rec: counts.RECOMMENDED || 0, ret: counts.RETURNED || 0 })) : '',
    onClick: () => { st.status = ''; st.breached = false; setView('board'); },
  }));
  const worst = a && a.stuck && a.stuck.length ? a.stuck[0] : null;
  const breaches = s ? s.sla_breached : (a ? a.stuck.length : 0);
  tiles.push(kpi({
    label: t('rlist.k_breach'), value: fmtNum(breaches), color: breaches ? 'danger' : 'success', iconName: 'alert',
    sub: worst ? esc(t('rlist.k_breach_sub_worst', { ref: worst.ref_no, d: fmtDur(worst.sla_hours_left) })) : esc(t('rlist.k_breach_sub_none')),
    onClick: breaches ? () => { st.status = ''; st.breached = true; st.page = 1; setView('table'); } : null,
  }));
  tiles.push(kpi({
    label: t('rlist.k_tat'),
    value: a && a.avg_total_days !== null && a.avg_total_days !== undefined ? t('rlist.k_tat_val', { n: fmtNum(a.avg_total_days, 1) }) : '—',
    color: 'teal', iconName: 'clock',
    sub: a ? esc(t('rlist.k_tat_sub', { n: a.completed })) : '',
  }));
  const bn = a && a.bottleneck ? a.stages.find((x) => x.stage === a.bottleneck) : null;
  tiles.push(kpi({
    label: t('rlist.k_bottleneck'), value: bn ? t(`rstage.${bn.stage}`) : '—', color: 'saffron', iconName: 'hourglass',
    sub: bn ? esc(t('rlist.k_bottleneck_sub', { avg: fmtDays(bn.avg_hours), sla: fmtDays(bn.sla_hours) })) : esc(t('rlist.no_data')),
  }));
  let rel30 = 0;
  let rel30amt = 0;
  if (s) {
    const cutoff = toMs(meta && meta.today) - 30 * 86400000;
    for (const r of s.items) {
      const ms = toMs(r.released_at);
      if (ms !== null && ms >= cutoff) { rel30 += 1; rel30amt += r.amount || 0; }
    }
  }
  tiles.push(kpi({
    label: t('rlist.k_released'), value: s ? fmtNum(rel30) : '—', color: 'success', iconName: 'unlock',
    sub: s ? esc(t('rlist.k_released_sub', { amt: fmtINRShort(rel30amt) })) : '',
    onClick: () => { st.status = 'RELEASED'; st.breached = false; st.page = 1; setView('table'); },
  }));
  mount(kpiEl, tiles);
}

function kpiSkeleton() {
  mount(kpiEl, Array.from({ length: 5 }, () => el('div', { class: 'kpi' },
    el('div', { class: 'skeleton', style: { width: '60%' } }),
    el('div', { class: 'skeleton', style: { width: '40%', height: '26px', marginTop: '6px' } }),
    el('div', { class: 'skeleton', style: { width: '80%', marginTop: '6px' } }))));
}

/* ------------------------------------------------------------------ board */
function boardCard(r) {
  const inStage = hoursSince(r.stage_entered_at);
  const loc = [r.institution && r.institution.city, r.institution && r.institution.state].filter(Boolean).join(', ');
  return el('a', {
    class: `rl-card ${r.sla_breached && r.status !== 'RETURNED' ? 'breached' : ''}`,
    href: site(`officer/release.html?id=${r.id}`),
    'aria-label': t('rlist.open_detail', { ref: r.ref_no }),
  },
  el('div', { class: 'row between nowrap' }, el('span', { class: 'ref' }, r.ref_no), el('span', { html: typeBadge(r.request_type) })),
  el('div', { class: 'inst' }, (r.institution && r.institution.name) || '—'),
  loc ? el('div', { class: 'loc' }, loc) : null,
  el('div', { class: 'mid' },
    el('span', { class: 'amt' }, fmtINR(r.amount)),
    el('span', { class: 'small muted', title: r.bank ? r.bank.name : '' }, r.bank ? r.bank.code : '')),
  el('div', { class: 'foot' },
    el('span', { html: `${icon('hourglass', 13)} ${esc(t('rlist.in_stage', { d: fmtDur(inStage) }))}` }),
    el('span', { html: slaChip(r.status, r.sla_hours_left) })));
}

function renderBoard() {
  const data = st.board;
  if (!data) return;
  const counts = data.counts || {};
  const slaDays = {};
  if (st.analytics) st.analytics.stages.forEach((s) => { slaDays[s.stage] = s.sla_hours; });
  if (!data.items.length && st.q) {
    emptyState(boardEl, { icon: 'search', title: t('rlist.board_empty'), text: t('rlist.board_empty_text') });
  } else {
    const byStage = {};
    BOARD_STAGES.forEach((s) => { byStage[s] = []; });
    data.items.forEach((r) => { if (byStage[r.status]) byStage[r.status].push(r); });
    Object.values(byStage).forEach((list) => list.sort((a, b) => (a.sla_hours_left ?? 1e9) - (b.sla_hours_left ?? 1e9)));
    mount(boardEl, el('div', { class: 'rl-board' }, BOARD_STAGES.map((stage) => {
      const list = byStage[stage];
      const sub = [slaDays[stage] ? t('rlist.col_sla', { d: fmtDays(slaDays[stage]) }) : null,
        t(stage === 'RETURNED' ? 'rlist.waits_inst' : 'rlist.waits_aicte')].filter(Boolean).join(' · ');
      return el('div', { class: `rl-col c-${stage}`, role: 'region', 'aria-label': t(`rstage.${stage}`) },
        el('div', { class: 'rl-col-head' },
          el('div', {}, el('div', { class: 't' }, t(`rstage.${stage}`)), el('div', { class: 's' }, sub)),
          el('span', { class: 'n', 'aria-label': String(list.length) }, String(list.length))),
        el('div', { class: 'rl-col-body' }, list.length ? list.map(boardCard) : el('div', { class: 'rl-col-empty' }, t('rlist.col_empty'))));
    })));
  }
  const rel = counts.RELEASED || 0;
  const rej = counts.REJECTED || 0;
  mount(boardNoteEl, (rel || rej) ? el('div', { class: 'alert info' },
    el('span', { html: icon('info', 18) }),
    el('div', { class: 'grow row between' },
      el('span', {}, t('rlist.board_closed', { rel, rej })),
      el('button', { class: 'btn sm secondary', type: 'button', onclick: () => { st.status = ''; st.breached = false; st.page = 1; setView('table'); }, html: `${icon('list', 15)} ${esc(t('rlist.see_table'))}` }))) : null);
}

async function loadBoard() {
  loading(boardEl);
  mount(boardNoteEl);
  try {
    st.board = await api.get('/releases', { status: BOARD_STAGES.join(','), q: st.q || undefined, page_size: 200, sort: 'sla_due_at', order: 'asc' });
    renderBoard();
  } catch (err) {
    errorState(boardEl, err, loadBoard);
  }
}

/* ------------------------------------------------------------------ table */
function renderStatusOptions(counts) {
  const c = counts || {};
  const total = ALL_STATUSES.reduce((n, s) => n + (c[s] || 0), 0);
  const opts = [el('option', { value: '' }, t('rlist.all_statuses', { n: total }))];
  ALL_STATUSES.forEach((s) => opts.push(el('option', { value: s }, t('rlist.status_opt', { label: t(`rstage.${s}`), n: c[s] || 0 }))));
  mount(statusSel, opts);
  statusSel.value = st.status;
}

function renderTableView() {
  const data = st.table;
  if (!data) return;
  renderStatusOptions(data.counts);
  $('#rl-table-sub').textContent = t('rlist.table_sub', { n: fmtNum(data.total) });
  renderTable(tableEl, {
    columns: [
      { key: 'ref_no', label: t('rlist.c_ref'), sortable: true, render: (r) => `<div class="cell-main mono">${esc(r.ref_no)}</div><div class="cell-sub">${typeBadge(r.request_type)}</div>` },
      { key: 'institution', label: t('rlist.c_inst'), render: (r) => `<div class="cell-main">${esc(r.institution ? r.institution.name : '—')}</div><div class="cell-sub">${esc([r.institution && r.institution.city, r.institution && r.institution.state].filter(Boolean).join(', '))}</div>` },
      { key: 'fdr', label: t('rlist.c_fdr'), render: (r) => `<a class="mono" href="${esc(site(`officer/fdr.html?id=${r.fdr_id}`))}">${esc(r.fdr_ref_no || '—')}</a><div class="cell-sub">${esc(r.bank ? r.bank.name : '')}</div>` },
      { key: 'amount', label: t('rlist.c_amount'), sortable: true, align: 'right', render: (r) => `<span class="cell-main">${esc(fmtINR(r.amount))}</span>` },
      { key: 'status', label: t('rlist.c_stage'), render: (r) => releaseBadge(r.status) },
      { key: 'requested_at', label: t('rlist.c_requested'), sortable: true, render: (r) => `<span class="nowrap">${esc(fmtDate(r.requested_at))}</span>` },
      {
        key: 'sla_due_at', label: t('rlist.c_sla'), sortable: true, render: (r) => {
          if (r.status === 'RELEASED') return `<span class="badge b-success">${icon('check', 12)}${esc(t('rlist.released_on', { d: fmtDate(r.released_at) }))}</span>`;
          if (r.status === 'REJECTED') return `<span class="badge b-slate">${esc(t('rlist.closed'))}</span>`;
          return `<div class="rl-inline-sla">${slaChip(r.status, r.sla_hours_left)}<span class="cell-sub">${esc(t('rlist.in_stage', { d: fmtDur(hoursSince(r.stage_entered_at)) }))}</span></div>`;
        },
      },
      { key: 'open', label: '', align: 'right', render: (r) => `<a class="btn sm secondary" href="${esc(site(`officer/release.html?id=${r.id}`))}" aria-label="${esc(t('rlist.open_detail', { ref: r.ref_no }))}">${esc(t('common.open'))}${icon('chevron-right', 14)}</a>` },
    ],
    rows: data.items,
    sort: st.sort,
    onSort: (key, dir) => { st.sort = { key, dir }; st.page = 1; loadTable(); },
    onRowClick: (r) => { location.href = site(`officer/release.html?id=${r.id}`); },
    rowClass: (r) => (r.sla_breached && r.status !== 'RETURNED' ? 'row-danger' : r.status === 'RETURNED' ? 'row-warning' : ''),
    empty: { icon: 'inbox', title: t('rlist.empty_table'), text: t('common.no_records_hint') },
  });
  if (data.total) pagination(pagerEl, { page: st.page, pageSize: PAGE_SIZE, total: data.total, onChange: (p) => { st.page = p; loadTable(); } });
  else mount(pagerEl);
}

async function loadTable() {
  loading(tableEl);
  mount(pagerEl);
  try {
    st.table = await api.get('/releases', {
      status: st.status || undefined, q: st.q || undefined, breached: st.breached ? 1 : undefined,
      page: st.page, page_size: PAGE_SIZE, sort: st.sort.key, order: st.sort.dir,
    });
    renderTableView();
  } catch (err) {
    errorState(tableEl, err, loadTable);
  }
}

/* ------------------------------------------------------------------ stage turnaround */
function renderStages() {
  const a = st.analytics;
  if (!a) return;
  mount(stagesEl, el('div', { class: 'rl-stages' }, a.stages.map((s) => {
    const isB = s.stage === a.bottleneck;
    const pct = s.avg_hours !== null && s.sla_hours ? Math.min(100, (s.avg_hours / s.sla_hours) * 100) : 0;
    const tone = pct >= 100 ? 'danger' : pct >= 75 ? 'warning' : '';
    const breachTxt = s.breaches === 0 ? t('rlist.breaches_0') : s.breaches === 1 ? t('rlist.breaches_1') : t('rlist.breaches', { n: s.breaches });
    return el('div', { class: `rl-stage ${isB ? 'bottleneck' : ''}` },
      el('div', { class: 'row between nowrap' },
        el('span', { html: releaseBadge(s.stage) }),
        isB ? el('span', { class: 'tag-new' }, t('rlist.bottleneck_tag')) : null),
      s.avg_hours !== null && s.avg_hours !== undefined
        ? el('div', { class: 'v', html: `${esc(fmtNum(s.avg_hours / 24, 1))}<small>${esc(t('rlist.dur_d', { d: '' }).trim())} ${esc(t('rlist.avg'))}</small>` })
        : el('div', { class: 'l' }, t('rlist.no_visits')),
      el('div', { class: `meter ${tone}`, role: 'img', 'aria-label': `${Math.round(pct)}%` }, el('span', { style: { width: `${pct}%` } })),
      el('div', { class: 'l' }, [t('rlist.sla_limit', { d: fmtDays(s.sla_hours) }), s.median_hours !== null ? t('rlist.median', { d: fmtDays(s.median_hours) }) : null].filter(Boolean).join(' · ')),
      el('div', { class: 'small', style: { color: s.breaches ? 'var(--nk-danger)' : 'var(--nk-success)', fontWeight: 600 } }, breachTxt),
      el('div', { class: 'l' }, `${t('rlist.open_now', { n: s.open_now })} · ${t(s.waits_on === 'institution' ? 'rlist.waits_inst' : 'rlist.waits_aicte')}`));
  })));
}

/* ------------------------------------------------------------------ view switching */
function syncUrl() {
  setParams({ view: st.view === 'table' ? 'table' : null, status: st.view === 'table' ? st.status : null, q: st.q, breached: st.view === 'table' && st.breached ? '1' : null });
}

function setView(view, { load = true } = {}) {
  st.view = view;
  writeStore(VIEW_KEY, view);
  $$('[data-view]').forEach((b) => {
    const on = b.dataset.view === view;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
  });
  $('#rl-view-board').hidden = view !== 'board';
  $('#rl-view-table').hidden = view !== 'table';
  statusSel.hidden = view !== 'table';
  $('#rl-breached-wrap').hidden = view !== 'table';
  breachedCb.checked = st.breached;
  statusSel.value = st.status;
  syncUrl();
  if (!load) return;
  if (view === 'board') loadBoard(); else loadTable();
}

/* ------------------------------------------------------------------ summary data */
async function loadSummary() {
  kpiSkeleton();
  loading(stagesEl);
  const [sRes, aRes] = await Promise.allSettled([
    api.get('/releases', { status: 'RELEASED', page_size: 200, sort: 'requested_at', order: 'desc' }),
    api.get('/dashboard/release-analytics'),
  ]);
  st.summary = sRes.status === 'fulfilled' ? sRes.value : null;
  st.analytics = aRes.status === 'fulfilled' ? aRes.value : null;
  if (!st.summary && !st.analytics) {
    errorState(kpiEl, sRes.reason || aRes.reason, loadSummary);
  } else {
    renderKpis();
  }
  if (st.analytics) renderStages();
  else errorState(stagesEl, aRes.reason, loadSummary);
  if (st.view === 'board' && st.board) renderBoard();   // SLA limits in the column heads come from analytics
}

function renderAll() {
  refreshBtn.innerHTML = `${icon('refresh', 16)}<span>${esc(t('rlist.refresh'))}</span>`;
  renderKpis();
  renderStages();
  if (st.view === 'board') renderBoard(); else renderTableView();
  if (!st.table) renderStatusOptions(st.summary && st.summary.counts);
}

/* ------------------------------------------------------------------ events */
$$('[data-view]').forEach((b) => b.addEventListener('click', () => { if (b.dataset.view !== st.view) { st.page = 1; setView(b.dataset.view); } }));
qInput.addEventListener('input', debounce(() => {
  st.q = qInput.value.trim();
  st.page = 1;
  syncUrl();
  if (st.view === 'board') loadBoard(); else loadTable();
}, 350));
statusSel.addEventListener('change', () => { st.status = statusSel.value; st.page = 1; syncUrl(); loadTable(); });
breachedCb.addEventListener('change', () => { st.breached = breachedCb.checked; st.page = 1; syncUrl(); loadTable(); });
refreshBtn.addEventListener('click', async () => {
  refreshBtn.disabled = true;
  try {
    await Promise.all([loadSummary(), st.view === 'board' ? loadBoard() : loadTable()]);
  } finally { refreshBtn.disabled = false; }
});
onLang(renderAll);

refreshBtn.innerHTML = `${icon('refresh', 16)}<span>${esc(t('rlist.refresh'))}</span>`;
renderStatusOptions(null);
setView(st.view, { load: false });
loadSummary();
if (st.view === 'board') loadBoard(); else loadTable();
