// Officer analytics: release workflow bottleneck (stage times vs SLA, stuck requests, monthly flow),
// measured improvement over the manual process, deposits by state and by bank. Print-friendly.
// Every section loads and fails independently (skeleton -> data | error + retry).
import { initPage, setPageHead } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang, getLang } from '../assets/js/i18n.js';
import {
  $, $$, el, esc, icon, mount, fmtINR, fmtINRShort, fmtNum, fmtDate, fmtDateTime, monthName, parseISO,
  errorState, emptyState, renderTable, releaseBadge,
} from '../assets/js/ui.js';
import { barChart, lineChart, doughnutChart, COLORS, SERIES } from '../assets/js/charts.js';

// Charts re-draw instantly on resize (window, print layout) instead of growing in again.
if (window.Chart) window.Chart.defaults.transitions.resize = { animation: { duration: 0 } };

extend({
  en: {
    'an.title': 'Analytics',
    'an.subtitle': 'Release workflow, measured improvement and coverage',
    'an.print': 'Print',
    'an.print_meta': 'Nidhi Kavach analytics · printed {date} by {name} ({role})',
    'an.sec_release': 'Release workflow bottleneck',
    'an.sec_release_hint': 'Time each release or refund request spends at every stage, against the stage time limit',
    'an.k.total': 'Average end-to-end time',
    'an.k.total_sub': 'From request to signed NOC',
    'an.k.bottleneck': 'Bottleneck stage',
    'an.k.bottleneck_sub': 'Average {avg} · limit {sla}',
    'an.k.completed': 'Completed releases',
    'an.k.completed_sub': 'Closed with a signed NOC',
    'an.k.open': 'Open requests',
    'an.k.open_sub': 'Currently moving through the stages',
    'an.k.stuck': 'Past the time limit',
    'an.k.stuck_sub': 'Open requests breaching their stage limit',
    'an.k.go_desk': 'Release desk',
    'an.u.days': 'days',
    'an.stage_chart': 'Average time per stage vs time limit',
    'an.hours': 'Hours',
    'an.ds.avg': 'Average time (hours)',
    'an.ds.sla': 'Time limit (hours)',
    'an.callout': '{stage} is the bottleneck.',
    'an.callout_b': 'Requests spend {avg} there on average against a limit of {sla}, with {breaches}. A request takes {days} days from submission to signed NOC on average.',
    'an.callout_none': 'No release request has completed a stage yet, so stage times cannot be measured.',
    'an.n_breach_1': '{n} breach', 'an.n_breach': '{n} breaches',
    'an.stage_table': 'Stage by stage',
    'an.stage_table_sub': 'Load = average time as a share of the time limit',
    'an.col.stage': 'Stage',
    'an.col.avg': 'Average',
    'an.col.median': 'Median',
    'an.col.sla': 'Limit',
    'an.col.load': 'Load',
    'an.col.breaches': 'Breaches',
    'an.col.open': 'Open now',
    'an.waits.aicte': 'With AICTE',
    'an.waits.institution': 'With the institution',
    'an.waits.bank': 'With the bank',
    'an.u.h': '{n} h',
    'an.u.d': '{n} days',
    'an.stuck_title': 'Requests past their time limit',
    'an.rel_desk': 'Open release desk',
    'an.stuck_empty': 'Every open request is within its time limit',
    'an.stuck_empty_text': 'Requests that stay at a stage longer than its limit are listed here and escalated.',
    'an.stuck_since': 'At this stage since {date}',
    'an.overdue_by': 'Overdue by {t}',
    'an.monthly_title': 'Requested vs released each month',
    'an.monthly_sub': 'Last 12 months',
    'an.ds.requested': 'Requested',
    'an.ds.released': 'Released',
    'an.monthly_foot': '{req} requested and {rel} released in the last 12 months',

    'an.sec_impact': 'Measured improvement vs manual process',
    'an.generated': 'Computed from live portal data · {date}',
    'an.before': 'Manual',
    'an.after': 'Now',
    'an.better': '{pct}% better',
    'an.lower_better': 'Lower is better',
    'an.higher_better': 'Higher is better',
    'an.new': 'New capability',
    'an.new_sub': 'Not possible in the manual process',
    'an.impact_empty': 'Improvement figures appear once instruments have been verified on the portal.',
    'an.m.verification_turnaround_days': 'Verification turnaround',
    'an.m.missed_renewals_per_year': 'Missed renewals per year',
    'an.m.records_complete_pct': 'Complete instrument records',
    'an.m.manual_hours_per_month': 'Manual effort',
    'an.m.release_turnaround_days': 'Release / refund turnaround',
    'an.m.discrepancy_detection': 'Discrepancies detected automatically',
    'an.un.days': '{n} days',
    'an.un.per_year': '{n} a year',
    'an.un.hours_month': '{n} h/month',

    'an.sec_geo': 'Deposits by state and bank',
    'an.sec_geo_hint': 'Held deposits (active and release requested). Select a row to open the instruments.',
    'an.state_title': 'By state',
    'an.state_sub': '{n} states · {amt} held · {gap} protection gap',
    'an.col.state': 'State',
    'an.col.institutions': 'Institutions',
    'an.col.fdrs': 'FDRs held',
    'an.col.amount': 'Amount held',
    'an.col.gap': 'Protection gap',
    'an.col.flagged': 'Flagged',
    'an.gap_pct': '{pct}% of held',
    'an.total': 'Total',
    'an.bank_title': 'By bank',
    'an.bank_sub': 'Share of amount held',
    'an.col.bank': 'Bank',
    'an.col.share': 'Share',
    'an.col.verified': 'Bank verified',
    'an.col.issues': 'Open issues',
    'an.none': 'None',
    'an.total_center': 'held',
    'an.median_of': 'median {t}',
    'an.n_fdr_1': '{n} FDR', 'an.n_fdr': '{n} FDRs',
    'an.gapchart_title': 'Where the protection gap is',
    'an.gapchart_sub': 'Top states by unprotected amount',
    'an.gap_none': 'No state has a protection gap',
  },
  hi: {
    'an.title': 'विश्लेषण',
    'an.subtitle': 'रिलीज़ प्रक्रिया, मापा गया सुधार और जमा कवरेज',
    'an.print': 'प्रिंट करें',
    'an.print_meta': 'निधि कवच विश्लेषण · {date} को {name} ({role}) द्वारा मुद्रित',
    'an.sec_release': 'रिलीज़ प्रक्रिया में अवरोध',
    'an.sec_release_hint': 'प्रत्येक रिलीज़ या वापसी अनुरोध द्वारा हर चरण में लिया गया समय, चरण की समय-सीमा की तुलना में',
    'an.k.total': 'औसत कुल समय',
    'an.k.total_sub': 'अनुरोध से हस्ताक्षरित एनओसी तक',
    'an.k.bottleneck': 'अवरोध वाला चरण',
    'an.k.bottleneck_sub': 'औसत {avg} · सीमा {sla}',
    'an.k.completed': 'पूर्ण रिलीज़',
    'an.k.completed_sub': 'हस्ताक्षरित एनओसी के साथ बंद',
    'an.k.open': 'खुले अनुरोध',
    'an.k.open_sub': 'विभिन्न चरणों में प्रक्रियाधीन',
    'an.k.stuck': 'समय-सीमा पार',
    'an.k.stuck_sub': 'चरण की समय-सीमा पार कर चुके खुले अनुरोध',
    'an.k.go_desk': 'रिलीज़ डेस्क',
    'an.u.days': 'दिन',
    'an.stage_chart': 'प्रति चरण औसत समय बनाम समय-सीमा',
    'an.hours': 'घंटे',
    'an.ds.avg': 'औसत समय (घंटे)',
    'an.ds.sla': 'समय-सीमा (घंटे)',
    'an.callout': '{stage} चरण में सबसे अधिक अवरोध है।',
    'an.callout_b': 'अनुरोध यहाँ औसतन {avg} रुकते हैं जबकि सीमा {sla} है; अब तक {breaches}। प्रस्तुति से हस्ताक्षरित एनओसी तक औसतन {days} दिन लगते हैं।',
    'an.callout_none': 'अभी तक किसी रिलीज़ अनुरोध ने कोई चरण पूरा नहीं किया है, इसलिए चरण-समय मापा नहीं जा सकता।',
    'an.n_breach_1': '{n} उल्लंघन', 'an.n_breach': '{n} उल्लंघन',
    'an.stage_table': 'चरणवार विवरण',
    'an.stage_table_sub': 'भार = समय-सीमा के अनुपात में औसत समय',
    'an.col.stage': 'चरण',
    'an.col.avg': 'औसत',
    'an.col.median': 'माध्यिका',
    'an.col.sla': 'सीमा',
    'an.col.load': 'भार',
    'an.col.breaches': 'उल्लंघन',
    'an.col.open': 'अभी खुले',
    'an.waits.aicte': 'एआईसीटीई के पास',
    'an.waits.institution': 'संस्थान के पास',
    'an.waits.bank': 'बैंक के पास',
    'an.u.h': '{n} घंटे',
    'an.u.d': '{n} दिन',
    'an.stuck_title': 'समय-सीमा पार कर चुके अनुरोध',
    'an.rel_desk': 'रिलीज़ डेस्क खोलें',
    'an.stuck_empty': 'सभी खुले अनुरोध अपनी समय-सीमा के भीतर हैं',
    'an.stuck_empty_text': 'जो अनुरोध किसी चरण में सीमा से अधिक समय तक रुकते हैं, वे यहाँ दिखते हैं और एस्केलेट किए जाते हैं।',
    'an.stuck_since': '{date} से इस चरण में',
    'an.overdue_by': '{t} विलंब',
    'an.monthly_title': 'माहवार अनुरोधित बनाम रिलीज़',
    'an.monthly_sub': 'पिछले 12 माह',
    'an.ds.requested': 'अनुरोधित',
    'an.ds.released': 'रिलीज़',
    'an.monthly_foot': 'पिछले 12 माह में {req} अनुरोध प्राप्त हुए और {rel} रिलीज़ किए गए',

    'an.sec_impact': 'मैनुअल प्रक्रिया की तुलना में मापा गया सुधार',
    'an.generated': 'पोर्टल के वास्तविक आँकड़ों से गणना · {date}',
    'an.before': 'मैनुअल',
    'an.after': 'अब',
    'an.better': '{pct}% बेहतर',
    'an.lower_better': 'कम होना बेहतर',
    'an.higher_better': 'अधिक होना बेहतर',
    'an.new': 'नई क्षमता',
    'an.new_sub': 'मैनुअल प्रक्रिया में संभव नहीं था',
    'an.impact_empty': 'पोर्टल पर एफडीआर सत्यापित होने के बाद सुधार के आँकड़े दिखाई देंगे।',
    'an.m.verification_turnaround_days': 'सत्यापन में लगने वाला समय',
    'an.m.missed_renewals_per_year': 'प्रति वर्ष छूटे नवीनीकरण',
    'an.m.records_complete_pct': 'पूर्ण एफडीआर अभिलेख',
    'an.m.manual_hours_per_month': 'मैनुअल श्रम',
    'an.m.release_turnaround_days': 'रिलीज़ / वापसी में लगने वाला समय',
    'an.m.discrepancy_detection': 'स्वतः पकड़ी गई विसंगतियाँ',
    'an.x.verification_turnaround_days': 'पिछले 180 दिनों में सत्यापित एफडीआर के लिए प्रस्तुति से अधिकारी की स्वीकृति तक का औसत समय। बैंक-हस्ताक्षरित क्यूआर और बैंक एपीआई जाँच ने बैंक को पत्र भेजने की प्रक्रिया का स्थान लिया है।',
    'an.x.missed_renewals_per_year': 'पिछले 365 दिनों में बिना स्वीकृत नवीनीकरण के परिपक्व हुई या परिपक्वता के बाद नवीनीकृत एफडीआर। 90/60/30/7 दिन पर स्वचालित अनुस्मारक और संस्थान → अधिकारी → सक्षम प्राधिकारी एस्केलेशन ने मैनुअल अनुवर्तन का स्थान लिया है।',
    'an.x.records_complete_pct': 'ऐसी सक्रिय एफडीआर का प्रतिशत जिनकी रसीद अभिलेख में है, शाखा, आईएफएससी व जमाकर्ता विवरण भरे हैं और कम से कम एक सत्यापन जाँच हुई है।',
    'an.x.manual_hours_per_month': 'मान्यता: प्रत्येक एफडीआर के लिए दस्तावेज़ जाँच, बैंक पुष्टि और अधिकारी का निर्णय आवश्यक है। बैंक-हस्ताक्षरित क्यूआर या बैंक एपीआई से पुष्टि होने पर पहले दो चरण स्वचालित हो जाते हैं; निर्णय मैनुअल ही रहता है।',
    'an.x.release_turnaround_days': 'पूर्ण हुई रिलीज़ में अनुरोध से हस्ताक्षरित एनओसी तक का औसत समय। प्रत्येक चरण समय-सीमा टाइमर पर है और उल्लंघन होने पर एस्केलेट किया जाता है।',
    'an.x.discrepancy_detection': 'पिछले 365 दिनों में उठाई गई विसंगतियों में से वे, जो अधिकारी के बजाय रसीद पठन, हस्ताक्षरित क्यूआर जाँच या बैंक एपीआई द्वारा स्वतः पकड़ी गईं। मैनुअल प्रक्रिया में हर समस्या हाथ से पकड़नी पड़ती थी।',
    'an.un.days': '{n} दिन',
    'an.un.per_year': '{n} प्रति वर्ष',
    'an.un.hours_month': '{n} घंटे/माह',

    'an.sec_geo': 'राज्यवार और बैंकवार जमा',
    'an.sec_geo_hint': 'रखी गई जमा (सक्रिय और रिलीज़ हेतु अनुरोधित)। एफडीआर देखने के लिए कोई पंक्ति चुनें।',
    'an.state_title': 'राज्यवार',
    'an.state_sub': '{n} राज्य · कुल {amt} · सुरक्षा अंतर {gap}',
    'an.col.state': 'राज्य',
    'an.col.institutions': 'संस्थान',
    'an.col.fdrs': 'रखी गई एफडीआर',
    'an.col.amount': 'रखी गई राशि',
    'an.col.gap': 'सुरक्षा अंतर',
    'an.col.flagged': 'चिह्नित',
    'an.gap_pct': 'कुल का {pct}%',
    'an.total': 'कुल',
    'an.bank_title': 'बैंकवार',
    'an.bank_sub': 'रखी गई राशि में हिस्सा',
    'an.col.bank': 'बैंक',
    'an.col.share': 'हिस्सा',
    'an.col.verified': 'बैंक सत्यापित',
    'an.col.issues': 'खुली समस्याएँ',
    'an.none': 'कोई नहीं',
    'an.total_center': 'कुल',
    'an.median_of': 'माध्यिका {t}',
    'an.n_fdr_1': '{n} एफडीआर', 'an.n_fdr': '{n} एफडीआर',
    'an.gapchart_title': 'सुरक्षा अंतर कहाँ है',
    'an.gapchart_sub': 'असुरक्षित राशि के अनुसार शीर्ष राज्य',
    'an.gap_none': 'किसी राज्य में सुरक्षा अंतर नहीं है',
  },
});

/* ------------------------------------------------------------------ helpers */
const HELD = 'ACTIVE,RELEASE_REQUESTED';
const fdrsLink = (params) => site(`officer/fdrs.html?${new URLSearchParams(params).toString()}`);
const pl = (key, n) => t(n === 1 ? `${key}_1` : key, { n: fmtNum(n) });
const num1 = (n) => (n === null || n === undefined ? '—' : fmtNum(n, 1));
/** Hours as '42.9 h' below two days, otherwise '6.2 days'. */
const hrs = (h) => (h === null || h === undefined ? '—' : (Math.abs(h) >= 48 ? t('an.u.d', { n: fmtNum(Math.abs(h) / 24, 1) }) : t('an.u.h', { n: fmtNum(Math.abs(h), 1) })));
const stageName = (s) => t(`rstage.${s}`, { _default: s });

function unitText(unit, v) {
  const n = num1(v);
  if (unit === '%') return `${n}%`;
  if (unit === 'days') return t('an.un.days', { n });
  if (unit === 'per year') return t('an.un.per_year', { n });
  if (unit === 'hours/month') return t('an.un.hours_month', { n });
  return `${n} ${unit || ''}`.trim();
}
function monthLabel(ym) { const [y, m] = ym.split('-').map(Number); return `${monthName(m - 1)} ${String(y).slice(2)}`; }
function fmtDateIn(iso, lang) { const p = parseISO(iso); return p ? `${String(p.d).padStart(2, '0')} ${monthName(p.mo, lang)} ${p.y}` : ''; }

const charts = {};
function chart(name, make) {
  if (charts[name]) { try { charts[name].destroy(); } catch (e) { /* gone */ } }
  charts[name] = make();
  return charts[name];
}
const sk = (h, extra = '') => el('div', { class: `skeleton ${extra}`, style: { height: `${h}px` }, 'aria-hidden': 'true' });
const busy = (node, on) => (on ? node.setAttribute('aria-busy', 'true') : node.removeAttribute('aria-busy'));

function tile({ label, iconName, value, unit, sub, color, href, go }) {
  return el(href ? 'a' : 'div', { class: `kpi ${color ? `c-${color}` : ''} ${href ? 'clickable' : ''}`, href },
    el('div', { class: 'k-label', html: `${iconName ? icon(iconName, 14) : ''}<span>${esc(label)}</span>` }),
    el('div', { class: 'k-value', html: `${esc(value)}${unit ? `<span class="k-unit">${esc(unit)}</span>` : ''}` }),
    sub ? el('div', { class: 'k-sub' }, sub) : null,
    href && go ? el('span', { class: 'k-go', html: `${esc(go)}${icon('arrow-right', 13)}` }) : null);
}
function meterCell(v, cls) {
  return `<div class="an-meter-cell"><div class="meter ${cls}" role="img" aria-label="${esc(fmtNum(v, 1))}%"><span style="width:${Math.max(0, Math.min(100, v))}%"></span></div><span class="num">${esc(fmtNum(v, 1))}%</span></div>`;
}

/* ------------------------------------------------------------------ page */
const S = { rel: null, impact: null, states: null, banks: null, stateSort: { key: 'amount', dir: 'desc' } };

function headActions() {
  const pr = el('button', { class: 'btn secondary', type: 'button', html: `${icon('print', 16)}<span>${esc(t('an.print'))}</span>` });
  pr.addEventListener('click', () => window.print());
  const desk = el('a', { class: 'btn', href: site('officer/releases.html'), html: `${icon('stamp', 16)}<span>${esc(t('an.rel_desk'))}</span>` });
  return [pr, desk];
}

const { user, meta } = await initPage({
  roles: ['officer', 'authority', 'admin'],
  active: 'analytics',
  title: 'an.title',
  subtitle: 'an.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'officer/dashboard.html' }, { label: 'nav.analytics' }],
  actions: headActions,
});

const today = (meta && meta.today) || new Date().toISOString().slice(0, 10);
setPageHead({
  subtitle: {
    en: `Release workflow, measured improvement and coverage · as on ${fmtDateIn(today, 'en')}`,
    hi: `रिलीज़ प्रक्रिया, मापा गया सुधार और जमा कवरेज · ${fmtDateIn(today, 'hi')} की स्थिति`,
  },
});

$$('[data-icon]').forEach((n) => { n.innerHTML = icon(n.dataset.icon, n.classList.contains('feature-icon') ? 20 : 18); });
$('#rel-desk').href = site('officer/releases.html');

const relKpis = $('#rel-kpis');
const relChart = $('#rel-chart');
const relTable = $('#rel-table');
const relStuck = $('#rel-stuck');
const relMonthly = $('#rel-monthly');
const impList = $('#imp-list');
const impGen = $('#imp-generated');
const stateTable = $('#state-table');
const stateSub = $('#state-sub');
const bankChart = $('#bank-chart');
const bankTable = $('#bank-table');
const gapEl = $('#gap-chart');

function renderPrintMeta() {
  $('#print-meta').textContent = t('an.print_meta', {
    date: fmtDate(today), name: (user && user.name) || '', role: user ? t(`role.${user.role}`, { _default: user.role }) : '',
  });
}

/* ------------------------------------------------------------------ release workflow */
function renderRelease() {
  const r = S.rel;
  const stages = r.stages || [];
  const bn = stages.find((s) => s.stage === r.bottleneck);
  const stuck = r.stuck || [];

  mount(relKpis,
    tile({ label: t('an.k.total'), iconName: 'clock', color: 'success', value: num1(r.avg_total_days), unit: r.avg_total_days !== null ? t('an.u.days') : '', sub: t('an.k.total_sub') }),
    tile({
      label: t('an.k.bottleneck'), iconName: 'hourglass', color: 'saffron', value: bn ? stageName(bn.stage) : '—',
      sub: bn ? t('an.k.bottleneck_sub', { avg: hrs(bn.avg_hours), sla: hrs(bn.sla_hours) }) : '',
    }),
    tile({ label: t('an.k.completed'), iconName: 'check-circle', color: 'teal', value: fmtNum(r.completed || 0), sub: t('an.k.completed_sub') }),
    tile({ label: t('an.k.open'), iconName: 'queue', color: 'info', value: fmtNum(r.open || 0), sub: t('an.k.open_sub'), href: site('officer/releases.html'), go: t('an.k.go_desk') }),
    tile({ label: t('an.k.stuck'), iconName: 'alert', color: stuck.length ? 'danger' : 'success', value: fmtNum(stuck.length), sub: t('an.k.stuck_sub'), href: '#rel-stuck', go: t('common.view') }));

  // chart + callout
  const canvas = el('canvas', { role: 'img', 'aria-label': `${t('an.stage_chart')}: ${stages.map((s) => `${stageName(s.stage)} ${hrs(s.avg_hours)} / ${hrs(s.sla_hours)}`).join(', ')}` });
  mount(relChart,
    bn
      ? el('div', { class: 'alert warning mb-2' }, el('span', { html: icon('hourglass', 18) }), el('div', {},
        el('div', { class: 'a-title' }, t('an.callout', { stage: stageName(bn.stage) })),
        el('div', {}, t('an.callout_b', { avg: hrs(bn.avg_hours), sla: hrs(bn.sla_hours), breaches: pl('an.n_breach', bn.breaches || 0), days: num1(r.avg_total_days) }))))
      : el('div', { class: 'alert info mb-2' }, el('span', { html: icon('info', 18) }), el('div', {}, t('an.callout_none'))),
    el('div', { class: 'chart-box' }, canvas));
  chart('stages', () => barChart(canvas, {
    labels: stages.map((s) => stageName(s.stage)),
    datasets: [
      { label: t('an.ds.avg'), data: stages.map((s) => s.avg_hours), colors: stages.map((s) => (s.stage === r.bottleneck ? COLORS.saffron : COLORS.primary)) },
      { label: t('an.ds.sla'), data: stages.map((s) => s.sla_hours), color: '#cbd5e1' },
    ],
    legend: true, maxBarThickness: 30,
  }));

  // stage table
  const host = el('div');
  renderTable(host, {
    columns: [
      { key: 'stage', label: t('an.col.stage'), render: (s) => `<div class="an-stage">${releaseBadge(s.stage)}<span class="cell-sub">${esc(t(`an.waits.${s.waits_on}`, { _default: '' }))}</span></div>` },
      {
        key: 'avg', label: t('an.col.avg'), align: 'right',
        render: (s) => `<div class="num an-nowrap" title="${esc(t('an.u.h', { n: num1(s.avg_hours) }))}">${esc(hrs(s.avg_hours))}</div><div class="cell-sub an-nowrap">${esc(t('an.median_of', { t: hrs(s.median_hours) }))}</div>`,
      },
      { key: 'sla', label: t('an.col.sla'), align: 'right', render: (s) => `<span class="num muted an-nowrap">${esc(hrs(s.sla_hours))}</span>` },
      {
        key: 'load', label: t('an.col.load'), render: (s) => {
          if (!s.sla_hours || s.avg_hours === null || s.avg_hours === undefined) return '<span class="muted">—</span>';
          const v = (100 * s.avg_hours) / s.sla_hours;
          return `<div class="an-load"><div class="meter ${v >= 100 ? 'danger' : v >= 80 ? 'warning' : ''}" role="img" aria-label="${esc(fmtNum(v))}%"><span style="width:${Math.min(100, v)}%"></span></div><span class="num">${esc(fmtNum(v))}%</span></div>`;
        },
      },
      { key: 'breaches', label: t('an.col.breaches'), align: 'center', render: (s) => (s.breaches ? `<span class="badge b-danger">${esc(fmtNum(s.breaches))}</span>` : '<span class="badge b-success">0</span>') },
      { key: 'open', label: t('an.col.open'), align: 'center', render: (s) => `<span class="num">${esc(fmtNum(s.open_now || 0))}</span>` },
    ],
    rows: stages,
    rowClass: (s) => (s.stage === r.bottleneck ? 'an-bottleneck' : ''),
    compact: true,
    empty: { icon: 'hourglass', title: t('an.callout_none') },
  });
  mount(relTable, host);

  // stuck requests
  if (!stuck.length) {
    emptyState(relStuck, { icon: 'check-circle', title: t('an.stuck_empty'), text: t('an.stuck_empty_text') });
  } else {
    mount(relStuck, stuck.map((q) => el('a', { class: 'list-item', href: site(`officer/release.html?id=${q.id}`) },
      el('div', { class: 'li-icon danger', html: icon('clock', 18) }),
      el('div', { class: 'li-main' },
        el('div', { class: 'li-title' }, `${q.ref_no} · ${t(`rtype.${q.request_type}`, { _default: q.request_type })}`),
        el('div', { class: 'li-sub' }, `${q.institution ? q.institution.name : ''}${q.fdr_ref_no ? ` · ${q.fdr_ref_no}` : ''}`),
        el('div', { class: 'li-meta', html: `${releaseBadge(q.status)}<span>${esc(t('an.stuck_since', { date: fmtDateTime(q.stage_entered_at) }))}</span>` })),
      el('div', { class: 'li-amt' },
        el('div', { title: fmtINR(q.amount) }, fmtINRShort(q.amount)),
        q.sla_hours_left !== null && q.sla_hours_left < 0 ? el('div', { class: 'cell-sub' }, t('an.overdue_by', { t: hrs(-q.sla_hours_left) })) : null),
      el('span', { class: 'li-go', html: icon('chevron-right', 16) }))));
  }

  // monthly flow
  const months = r.monthly || [];
  const req = months.reduce((a, m) => a + (m.requested || 0), 0);
  const rel = months.reduce((a, m) => a + (m.released || 0), 0);
  const mc = el('canvas', { role: 'img', 'aria-label': t('an.monthly_foot', { req, rel }) });
  mount(relMonthly, el('div', { class: 'chart-box' }, mc), el('div', { class: 'muted small mt-2' }, t('an.monthly_foot', { req: fmtNum(req), rel: fmtNum(rel) })));
  chart('monthly', () => lineChart(mc, {
    labels: months.map((m) => monthLabel(m.month)),
    datasets: [
      { label: t('an.ds.requested'), data: months.map((m) => m.requested), color: COLORS.primary, fill: true },
      { label: t('an.ds.released'), data: months.map((m) => m.released), color: COLORS.green },
    ],
    legend: true,
  }));
  // counts are whole numbers: keep the curve from dipping below zero between points
  charts.monthly.data.datasets.forEach((d) => { d.cubicInterpolationMode = 'monotone'; });
  charts.monthly.update('none');
}

async function loadRelease() {
  [relKpis, relChart, relTable, relStuck, relMonthly].forEach((n) => busy(n, true));
  mount(relKpis, Array.from({ length: 5 }, () => sk(118, 'sk-block')));
  mount(relChart, sk(56, 'sk-block'), el('div', { class: 'mt-2' }, sk(250)));
  mount(relTable, el('div', { class: 'card-body' }, Array.from({ length: 6 }, () => sk(30, 'sk-line'))));
  mount(relStuck, el('div', { class: 'card-body' }, Array.from({ length: 3 }, () => sk(46, 'sk-line'))));
  mount(relMonthly, sk(260));
  try {
    S.rel = await api.get('/dashboard/release-analytics');
    renderRelease();
  } catch (err) {
    S.rel = null;
    const box = el('div', { class: 'card', style: { gridColumn: '1 / -1' } });
    errorState(box, err, loadRelease);
    mount(relKpis, box);
    [relChart, relTable, relStuck, relMonthly].forEach((n) => mount(n));
  } finally {
    [relKpis, relChart, relTable, relStuck, relMonthly].forEach((n) => busy(n, false));
  }
}

/* ------------------------------------------------------------------ impact */
const M_ICON = {
  verification_turnaround_days: 'clock', missed_renewals_per_year: 'calendar', records_complete_pct: 'file-check',
  manual_hours_per_month: 'users', release_turnaround_days: 'stamp', discrepancy_detection: 'scan',
};

function renderImpact() {
  const metrics = (S.impact && S.impact.metrics) || [];
  impGen.textContent = S.impact && S.impact.generated_at ? t('an.generated', { date: fmtDateTime(S.impact.generated_at) }) : '';
  if (!metrics.length) { emptyState(impList, { icon: 'trend', title: t('an.impact_empty') }); return; }
  const hi = getLang() === 'hi';
  mount(impList, metrics.map((m) => {
    const max = Math.max(Number(m.before) || 0, Number(m.after) || 0) || 1;
    const w = (v) => `${Math.max(0, Math.min(100, (100 * (Number(v) || 0)) / max))}%`;
    const isNew = m.improvement_pct === null || m.improvement_pct === undefined;
    const explain = hi ? t(`an.x.${m.key}`, { _default: m.explain || '' }) : (m.explain || '');
    return el('div', { class: 'an-imp' },
      el('div', {},
        el('div', { class: 'i-label', html: `${icon(M_ICON[m.key] || 'trend', 18)}<span>${esc(t(`an.m.${m.key}`, { _default: m.label }))}</span>` }),
        explain ? el('div', { class: 'i-explain' }, explain) : null),
      el('div', { class: 'an-pair', role: 'img', 'aria-label': `${t('an.before')} ${unitText(m.unit, m.before)}, ${t('an.after')} ${unitText(m.unit, m.after)}` },
        el('span', { class: 'p-lbl' }, t('an.before')),
        el('span', { class: 'p-track' }, el('span', { class: 'p-bar p-before', style: { width: w(m.before) } })),
        el('span', { class: 'p-val before' }, unitText(m.unit, m.before)),
        el('span', { class: 'p-lbl' }, t('an.after')),
        el('span', { class: 'p-track' }, el('span', { class: 'p-bar p-after', style: { width: w(m.after) } })),
        el('span', { class: 'p-val' }, unitText(m.unit, m.after))),
      el('div', { class: 'i-chip' },
        isNew
          ? el('span', { class: 'badge b-info', html: `${icon('sparkles', 13)}${esc(t('an.new'))}` })
          : el('span', { class: 'badge b-success', html: `${icon('trend', 13)}${esc(t('an.better', { pct: fmtNum(Math.round(m.improvement_pct)) }))}` }),
        el('span', { class: 'small muted' }, isNew ? t('an.new_sub') : t(m.better === 'higher' ? 'an.higher_better' : 'an.lower_better'))));
  }));
}

async function loadImpact() {
  busy(impList, true);
  mount(impList, el('div', { class: 'card-body' }, Array.from({ length: 6 }, () => sk(64, 'sk-line'))));
  try {
    S.impact = await api.get('/dashboard/impact');
    renderImpact();
  } catch (err) {
    S.impact = null;
    errorState(impList, err, loadImpact);
  } finally { busy(impList, false); }
}

/* ------------------------------------------------------------------ by state */
function renderStates() {
  const rows = [...(S.states || [])];
  const tot = rows.reduce((a, r) => ({
    institutions: a.institutions + (r.institutions || 0), count: a.count + (r.count || 0), amount: a.amount + (r.amount || 0),
    gap_amount: a.gap_amount + (r.gap_amount || 0), flagged: a.flagged + (r.flagged || 0),
  }), { institutions: 0, count: 0, amount: 0, gap_amount: 0, flagged: 0 });
  stateSub.textContent = rows.length ? t('an.state_sub', { n: fmtNum(rows.length), amt: fmtINRShort(tot.amount), gap: fmtINRShort(tot.gap_amount) }) : '';
  const { key, dir } = S.stateSort;
  rows.sort((a, b) => {
    const va = key === 'state' ? a.state : (a[key] || 0);
    const vb = key === 'state' ? b.state : (b[key] || 0);
    const c = key === 'state' ? String(va).localeCompare(String(vb)) : va - vb;
    return dir === 'asc' ? c : -c;
  });
  const gapCell = (amt, held) => (amt
    ? `<div class="an-gap-cell"><span class="num" style="color:var(--nk-danger);font-weight:700">${esc(fmtINRShort(amt))}</span><span class="cell-sub">${esc(t('an.gap_pct', { pct: fmtNum(held ? (100 * amt) / held : 0) }))}</span></div>`
    : `<span class="badge b-success">${esc(t('an.none'))}</span>`);
  const host = el('div');
  renderTable(host, {
    columns: [
      { key: 'state', label: t('an.col.state'), sortable: true, render: (r) => (r._total ? `<b>${esc(t('an.total'))}</b>` : `<span class="cell-main">${esc(r.state)}</span>`) },
      { key: 'institutions', label: t('an.col.institutions'), sortable: true, align: 'right', render: (r) => esc(fmtNum(r.institutions)) },
      { key: 'count', label: t('an.col.fdrs'), sortable: true, align: 'right', render: (r) => esc(fmtNum(r.count)) },
      { key: 'amount', label: t('an.col.amount'), sortable: true, align: 'right', render: (r) => `<span class="num" title="${esc(fmtINR(r.amount))}">${esc(fmtINRShort(r.amount))}</span>` },
      { key: 'gap_amount', label: t('an.col.gap'), sortable: true, align: 'right', render: (r) => gapCell(r.gap_amount, r.amount) },
      { key: 'flagged', label: t('an.col.flagged'), sortable: true, align: 'center', render: (r) => (r.flagged ? `<span class="badge trust-flag">${icon('flag', 12)}${esc(fmtNum(r.flagged))}</span>` : '<span class="muted">0</span>') },
    ],
    rows: rows.length ? [...rows, { ...tot, _total: true, state: '' }] : [],
    sort: S.stateSort,
    onSort: (k, d) => { S.stateSort = { key: k, dir: d }; renderStates(); },
    onRowClick: (r) => { if (!r._total) location.href = fdrsLink({ state: r.state, status: HELD }); },
    rowClass: (r) => (r._total ? 'an-total' : ''),
    compact: true,
    empty: { icon: 'map' },
  });
  mount(stateTable, host);

  // protection gap by state (top 8)
  const gapRows = [...(S.states || [])].filter((r) => r.gap_amount > 0).sort((a, b) => b.gap_amount - a.gap_amount).slice(0, 8);
  if (!gapRows.length) {
    emptyState(gapEl, { icon: 'shield-check', title: t('an.gap_none') });
  } else {
    const canvas = el('canvas', { role: 'img', 'aria-label': `${t('an.gapchart_title')}: ${gapRows.map((r) => `${r.state} ${fmtINRShort(r.gap_amount)}`).join(', ')}` });
    mount(gapEl, el('div', { class: 'chart-box' }, canvas));
    chart('gap', () => barChart(canvas, {
      labels: gapRows.map((r) => r.state),
      datasets: [{ label: t('an.col.gap'), data: gapRows.map((r) => r.gap_amount), color: COLORS.red }],
      horizontal: true, money: true, legend: false, maxBarThickness: 16,
      onClick: (i) => { const r = gapRows[i]; if (r) location.href = fdrsLink({ state: r.state, status: HELD }); },
    }));
  }
}

async function loadStates() {
  [stateTable, gapEl].forEach((n) => busy(n, true));
  mount(stateTable, el('div', { class: 'card-body' }, Array.from({ length: 10 }, () => sk(28, 'sk-line'))));
  mount(gapEl, sk(250));
  try {
    S.states = await api.get('/dashboard/by-state');
    renderStates();
  } catch (err) {
    S.states = null;
    stateSub.textContent = '';
    errorState(stateTable, err, loadStates);
    errorState(gapEl, err, loadStates);
  } finally { [stateTable, gapEl].forEach((n) => busy(n, false)); }
}

/* ------------------------------------------------------------------ by bank */
function renderBanks() {
  const rows = S.banks || [];
  const total = rows.reduce((a, r) => a + (r.amount || 0), 0);
  if (rows.length) {
    const canvas = el('canvas', { role: 'img', 'aria-label': `${t('an.bank_sub')}: ${rows.map((r) => `${r.bank.name} ${fmtINRShort(r.amount)}`).join(', ')}` });
    mount(bankChart, el('div', { class: 'chart-box sm' }, canvas));
    chart('banks', () => doughnutChart(canvas, {
      labels: rows.map((r) => r.bank.name), data: rows.map((r) => r.amount), colors: rows.map((_, i) => SERIES[i % SERIES.length]),
      money: true, center: { value: fmtINRShort(total), label: t('an.total_center'), size: 17 }, legend: 'right',
      onClick: (i) => { const r = rows[i]; if (r) location.href = fdrsLink({ bank_id: r.bank.id, status: HELD }); },
    }));
  } else {
    mount(bankChart);
  }
  const host = el('div');
  renderTable(host, {
    columns: [
      { key: 'bank', label: t('an.col.bank'), render: (r) => `<div class="an-bank-name">${esc(r.bank.name)}</div><div class="cell-sub">${esc(pl('an.n_fdr', r.count))}</div>` },
      {
        key: 'amount', label: t('an.col.amount'), align: 'right',
        render: (r) => `<span class="num an-nowrap" title="${esc(fmtINR(r.amount))}">${esc(fmtINRShort(r.amount))}</span><div class="cell-sub">${esc(fmtNum(total ? (100 * r.amount) / total : 0, 1))}%</div>`,
      },
      {
        key: 'verified', label: t('an.col.verified'), render: (r) => (r.bank_verified_pct === null || r.bank_verified_pct === undefined
          ? '<span class="muted">—</span>' : meterCell(r.bank_verified_pct, r.bank_verified_pct >= 95 ? '' : r.bank_verified_pct >= 80 ? 'warning' : 'danger')),
      },
      { key: 'issues', label: t('an.col.issues'), align: 'center', render: (r) => (r.issues ? `<span class="badge b-danger">${icon('alert', 12)}${esc(fmtNum(r.issues))}</span>` : `<span class="badge b-success">${esc(t('an.none'))}</span>`) },
    ],
    rows,
    onRowClick: (r) => { location.href = fdrsLink({ bank_id: r.bank.id, status: HELD }); },
    compact: true,
    empty: { icon: 'bank' },
  });
  mount(bankTable, host);
}

async function loadBanks() {
  [bankChart, bankTable].forEach((n) => busy(n, true));
  mount(bankChart, sk(190));
  mount(bankTable, el('div', { class: 'card-body' }, Array.from({ length: 5 }, () => sk(28, 'sk-line'))));
  try {
    S.banks = await api.get('/dashboard/by-bank');
    renderBanks();
  } catch (err) {
    S.banks = null;
    mount(bankChart);
    errorState(bankTable, err, loadBanks);
  } finally { [bankChart, bankTable].forEach((n) => busy(n, false)); }
}

/* ------------------------------------------------------------------ boot */
onLang(() => {
  renderPrintMeta();
  if (S.rel) renderRelease();
  if (S.impact) renderImpact();
  if (S.states) renderStates();
  if (S.banks) renderBanks();
});

window.addEventListener('beforeprint', () => Object.values(charts).forEach((c) => { try { c.resize(); } catch (e) { /* gone */ } }));

renderPrintMeta();
Promise.allSettled([loadRelease(), loadImpact(), loadStates(), loadBanks()]).then(() => {
  // deep links from the dashboard (#impact, #by-state) land after the sections have their final height
  if (location.hash.length > 1) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView({ block: 'start' });
  }
});
