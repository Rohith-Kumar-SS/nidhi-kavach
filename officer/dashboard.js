// Officer dashboard: protection gap, key indicators, PS buckets, trust/risk, action items, maturity calendar,
// by-state / by-bank, impact teaser. Every card loads and fails independently (skeleton -> data | error + retry).
import { initPage, setPageHead } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang, getLang } from '../assets/js/i18n.js';
import {
  $, $$, el, esc, icon, mount, fmtINR, fmtINRShort, fmtNum, fmtDate, monthName, parseISO, daysBetween, relDays,
  severityBadge, errorState, emptyState, toast, withBusy, confirmDialog, renderTable,
  trustBadge, riskBadge, maturityChip, statusBadge,
} from '../assets/js/ui.js';
import { barChart, doughnutChart, heatmap, TRUST_COLORS, RISK_COLORS, COLORS } from '../assets/js/charts.js';

// Charts re-draw instantly on resize (no grow-in animation when the window or print layout changes size).
if (window.Chart) window.Chart.defaults.transitions.resize = { animation: { duration: 0 } };

extend({
  en: {
    'db.title': 'Dashboard',
    'db.subtitle_loading': 'Security deposits held by AICTE',
    'db.sec_overview': 'Overview',
    'db.sec_buckets': 'Deposits by category',
    'db.sec_buckets_hint': 'Select a category to open the matching instruments in the FDR registry',
    'db.run': 'Run daily checks',
    'db.run_hint': 'Send due reminders and escalations and re-check deposits with the banks',
    'db.run_confirm': 'Run today’s checks now? Due maturity reminders and escalations are sent, stale verifications and release time limits are flagged, and deposits are re-checked with the banks. Running it again on the same day does not send duplicates.',
    'db.run_go': 'Run checks',
    'db.run_done': 'Daily checks completed for {date}: {reminders}, {escalations}, {stale}, {sla} and {checks} ({issues}). {notes} queued.',
    'db.n.reminder_1': '{n} maturity reminder', 'db.n.reminder': '{n} maturity reminders',
    'db.n.escalation_1': '{n} escalation', 'db.n.escalation': '{n} escalations',
    'db.n.stale_1': '{n} stale-verification alert', 'db.n.stale': '{n} stale-verification alerts',
    'db.n.sla_1': '{n} release time-limit alert', 'db.n.sla': '{n} release time-limit alerts',
    'db.n.check_1': '{n} bank re-check', 'db.n.check': '{n} bank re-checks',
    'db.n.issue_1': '{n} issue found', 'db.n.issue': '{n} issues found',
    'db.n.note_1': '{n} notification', 'db.n.note': '{n} notifications',
    'db.run_failed': 'The daily checks could not be run: {msg}',
    'db.open_queue': 'Open verification queue',

    'db.gap_label': 'Protection gap right now',
    'db.gap_sub': '{n} instruments and {m} under-covered institutions do not fully protect AICTE today.',
    'db.gap_none': 'Every held deposit is bank-verified, lien-marked and in force.',
    'db.held': 'Held {amt}',
    'db.protected': 'Fully protected {amt} ({pct}%)',
    'db.protected_aria': '{pct}% of the held amount is fully protected',
    'db.gap.matured_unrenewed': 'Matured, not renewed',
    'db.gap.bank_issue': 'Bank or signature issue',
    'db.gap.unverified': 'Not yet bank-verified',
    'db.gap.shortfall': 'Required deposit shortfall',
    'db.gap.matured_unrenewed.hint': 'Active deposits past maturity with no accepted renewal',
    'db.gap.bank_issue.hint': 'Closed, not found, lien removed, invalid QR or amount mismatch',
    'db.gap.unverified.hint': 'Accepted deposits not yet confirmed by the bank',
    'db.gap.shortfall.hint': 'Institutions holding less than their required deposit',
    'db.n_fdr_1': '{n} instrument', 'db.n_fdr': '{n} instruments',
    'db.n_inst_1': '{n} institution', 'db.n_inst': '{n} institutions',

    'db.k.verify': 'Avg verification time',
    'db.k.faster': '{pct}% faster',
    'db.k.verify_vs': 'than {base} days before',
    'db.k.records': 'Records complete',
    'db.k.records_vs': 'vs {base}% in manual files',
    'db.k.renewals': 'On-time renewals',
    'db.k.renewals_sub': 'Renewals accepted before maturity',
    'db.k.disc': 'Open discrepancies',
    'db.k.disc_sub': 'On live instruments',
    'db.k.sla': 'Release SLA breaches',
    'db.k.sla_sub': 'Of {n} open release requests',
    'db.k.pending': 'Awaiting verification',
    'db.k.pending_sub': '{amt} under scrutiny',
    'db.u.days': 'days',
    'db.review': 'Review',
    'db.view_list': 'View list',

    'db.b.active': 'In force, more than 90 days left',
    'db.b.expiring': 'Renewal due soon',
    'db.b.matured': 'Overdue for renewal',
    'db.b.renewed': 'Replaced by a successor FDR',
    'db.b.released': 'Returned with NOC',
    'db.b.pending': 'Awaiting AICTE action',

    'db.trust_title': 'Trust ladder',
    'db.trust_sub': 'Live instruments by verification level',
    'db.instruments': 'instruments',
    'db.flagged_note': '{n} flagged with an open high or critical discrepancy',
    'db.bank_verified_pct': '{pct}% of live instruments are bank verified',

    'db.risk_title': 'Risk distribution',
    'db.risk_sub': 'Explainable score, 0–100',
    'db.risk_note': '{n} need intervention (high or critical risk)',
    'db.risk_bands': 'Low < 30 · Medium 30–59 · High 60–79 · Critical ≥ 80',

    'db.top_title': 'Highest-risk live instruments',
    'db.top_all': 'All high-risk instruments',
    'db.top_empty': 'No live instrument carries a risk score yet',
    'db.top_disc_1': '{n} open discrepancy', 'db.top_disc': '{n} open discrepancies',

    'db.actions_title': 'Needs attention',
    'db.actions_all': 'Open queue',
    'db.actions_empty': 'Nothing needs attention right now',
    'db.actions_empty_text': 'Overdue renewals, bank alerts and time-limit breaches will appear here.',
    'db.kind.verification': 'Verification',
    'db.kind.discrepancy': 'Discrepancy',
    'db.kind.maturity': 'Maturing soon',
    'db.kind.overdue': 'Overdue renewal',
    'db.kind.release_sla': 'Release time limit',
    'db.kind.bank_alert': 'Bank alert',

    'db.cal_title': 'Maturity calendar · next 12 months',
    'db.cal_sub': 'Held deposits by maturity date. Select a day to list its deposits.',
    'db.cal_overdue_t_1': '{n} deposit has matured and is not renewed',
    'db.cal_overdue_t': '{n} deposits have matured and are not renewed',
    'db.cal_overdue_b': '{amt} no longer protects AICTE. Reminders and the escalation ladder are running.',
    'db.cal_overdue_none': 'No matured deposit is waiting for renewal.',
    'db.cal_review': 'Review overdue deposits',
    'db.cal_next30': 'Maturing in 30 days',
    'db.cal_next90': 'Maturing in 90 days',
    'db.cal_monthly': 'Amount maturing each month',
    'db.cal_empty': 'No held deposit matures in the next 12 months.',
    'db.cal_day_aria': '{date}: {n} instruments, {amt}',

    'db.state_title': 'Deposits by state',
    'db.state_sub': 'Top 10 states by amount held, with the protection gap',
    'db.state_held': 'Amount held',
    'db.state_gap': 'Protection gap',
    'db.state_foot': '{n} states · {amt} held',
    'db.state_more': 'All states in Analytics',

    'db.bank_title': 'Deposits by bank',
    'db.bank_sub': 'Held instruments and share confirmed by the bank',
    'db.col.instruments': 'FDRs held',
    'db.col.verified': 'Bank verified',
    'db.col.issues': 'Open issues',
    'db.none': 'None',
    'db.bank_total': 'Total {n} instruments · {amt}',

    'db.impact_title': 'Measured improvement over the manual process',
    'db.impact_more': 'Full analytics',
    'db.impact_better': 'better',
    'db.impact_empty': 'Improvement figures appear once instruments have been verified on the portal.',
    'db.m.verification_turnaround_days': 'Verification turnaround',
    'db.m.missed_renewals_per_year': 'Missed renewals per year',
    'db.m.records_complete_pct': 'Complete instrument records',
    'db.m.manual_hours_per_month': 'Manual effort',
    'db.m.release_turnaround_days': 'Release / refund turnaround',
    'db.m.discrepancy_detection': 'Discrepancies detected automatically',
    'db.u.days_n': '{n} days',
    'db.u.per_year_n': '{n} a year',
    'db.u.hours_month_n': '{n} h/month',
  },
  hi: {
    'db.title': 'डैशबोर्ड',
    'db.subtitle_loading': 'एआईसीटीई के पास रखी प्रतिभूति जमा',
    'db.sec_overview': 'सारांश',
    'db.sec_buckets': 'श्रेणीवार जमा',
    'db.sec_buckets_hint': 'एफडीआर रजिस्टर में संबंधित जमा देखने के लिए श्रेणी चुनें',
    'db.run': 'दैनिक जाँच चलाएँ',
    'db.run_hint': 'देय अनुस्मारक व एस्केलेशन भेजें और बैंकों से जमा की पुनः जाँच करें',
    'db.run_confirm': 'क्या आज की जाँच अभी चलानी है? देय परिपक्वता अनुस्मारक और एस्केलेशन भेजे जाएँगे, लंबित सत्यापन व रिलीज़ समय-सीमाएँ चिह्नित होंगी और बैंकों से जमा की पुनः जाँच होगी। उसी दिन दोबारा चलाने पर दोहरी सूचनाएँ नहीं भेजी जातीं।',
    'db.run_go': 'जाँच चलाएँ',
    'db.run_done': '{date} की दैनिक जाँच पूर्ण: {reminders}, {escalations}, {stale}, {sla} तथा {checks} ({issues})। {notes} कतारबद्ध की गईं।',
    'db.n.reminder_1': '{n} परिपक्वता अनुस्मारक', 'db.n.reminder': '{n} परिपक्वता अनुस्मारक',
    'db.n.escalation_1': '{n} एस्केलेशन', 'db.n.escalation': '{n} एस्केलेशन',
    'db.n.stale_1': '{n} लंबित-सत्यापन अलर्ट', 'db.n.stale': '{n} लंबित-सत्यापन अलर्ट',
    'db.n.sla_1': '{n} रिलीज़ समय-सीमा अलर्ट', 'db.n.sla': '{n} रिलीज़ समय-सीमा अलर्ट',
    'db.n.check_1': '{n} बैंक पुनः-जाँच', 'db.n.check': '{n} बैंक पुनः-जाँच',
    'db.n.issue_1': '{n} समस्या मिली', 'db.n.issue': '{n} समस्याएँ मिलीं',
    'db.n.note_1': '{n} सूचना', 'db.n.note': '{n} सूचनाएँ',
    'db.run_failed': 'दैनिक जाँच नहीं चल सकी: {msg}',
    'db.open_queue': 'सत्यापन कतार खोलें',

    'db.gap_label': 'वर्तमान सुरक्षा अंतर',
    'db.gap_sub': 'आज {n} एफडीआर और कम जमा वाले {m} संस्थान एआईसीटीई को पूर्ण सुरक्षा नहीं दे रहे हैं।',
    'db.gap_none': 'रखी गई प्रत्येक जमा बैंक-सत्यापित, ग्रहणाधिकार-अंकित और प्रभावी है।',
    'db.held': 'कुल जमा {amt}',
    'db.protected': 'पूर्ण सुरक्षित {amt} ({pct}%)',
    'db.protected_aria': 'रखी गई राशि का {pct}% पूर्ण सुरक्षित है',
    'db.gap.matured_unrenewed': 'परिपक्व, नवीनीकरण नहीं',
    'db.gap.bank_issue': 'बैंक या हस्ताक्षर समस्या',
    'db.gap.unverified': 'बैंक सत्यापन शेष',
    'db.gap.shortfall': 'अपेक्षित जमा में कमी',
    'db.gap.matured_unrenewed.hint': 'परिपक्वता तिथि बीत चुकी सक्रिय जमा, जिनका नवीनीकरण स्वीकृत नहीं हुआ',
    'db.gap.bank_issue.hint': 'खाता बंद, अप्राप्त, ग्रहणाधिकार हटाया गया, अमान्य क्यूआर या राशि में अंतर',
    'db.gap.unverified.hint': 'स्वीकृत जमा, जिनकी बैंक से पुष्टि अभी शेष है',
    'db.gap.shortfall.hint': 'अपेक्षित राशि से कम जमा रखने वाले संस्थान',
    'db.n_fdr_1': '{n} एफडीआर', 'db.n_fdr': '{n} एफडीआर',
    'db.n_inst_1': '{n} संस्थान', 'db.n_inst': '{n} संस्थान',

    'db.k.verify': 'औसत सत्यापन समय',
    'db.k.faster': '{pct}% तेज़',
    'db.k.verify_vs': 'पहले {base} दिन लगते थे',
    'db.k.records': 'पूर्ण अभिलेख',
    'db.k.records_vs': 'मैनुअल फ़ाइलों में {base}%',
    'db.k.renewals': 'समय पर नवीनीकरण',
    'db.k.renewals_sub': 'परिपक्वता से पहले स्वीकृत नवीनीकरण',
    'db.k.disc': 'खुली विसंगतियाँ',
    'db.k.disc_sub': 'सक्रिय एफडीआर पर',
    'db.k.sla': 'रिलीज़ समय-सीमा उल्लंघन',
    'db.k.sla_sub': '{n} खुले रिलीज़ अनुरोधों में से',
    'db.k.pending': 'सत्यापन हेतु लंबित',
    'db.k.pending_sub': '{amt} जाँचाधीन',
    'db.u.days': 'दिन',
    'db.review': 'समीक्षा करें',
    'db.view_list': 'सूची देखें',

    'db.b.active': 'प्रभावी, 90 दिन से अधिक शेष',
    'db.b.expiring': 'नवीनीकरण शीघ्र देय',
    'db.b.matured': 'नवीनीकरण अतिदेय',
    'db.b.renewed': 'नई एफडीआर से प्रतिस्थापित',
    'db.b.released': 'एनओसी सहित लौटाई गई',
    'db.b.pending': 'एआईसीटीई की कार्रवाई लंबित',

    'db.trust_title': 'विश्वास सोपान',
    'db.trust_sub': 'सत्यापन स्तर के अनुसार सक्रिय एफडीआर',
    'db.instruments': 'एफडीआर',
    'db.flagged_note': '{n} एफडीआर पर उच्च या गंभीर विसंगति खुली है',
    'db.bank_verified_pct': '{pct}% सक्रिय एफडीआर बैंक-सत्यापित हैं',

    'db.risk_title': 'जोखिम वितरण',
    'db.risk_sub': 'व्याख्येय अंक, 0–100',
    'db.risk_note': '{n} पर हस्तक्षेप आवश्यक (उच्च या गंभीर जोखिम)',
    'db.risk_bands': 'कम < 30 · मध्यम 30–59 · उच्च 60–79 · गंभीर ≥ 80',

    'db.top_title': 'सर्वाधिक जोखिम वाली सक्रिय एफडीआर',
    'db.top_all': 'सभी उच्च-जोखिम एफडीआर',
    'db.top_empty': 'अभी किसी सक्रिय एफडीआर का जोखिम अंक उपलब्ध नहीं है',
    'db.top_disc_1': '{n} खुली विसंगति', 'db.top_disc': '{n} खुली विसंगतियाँ',

    'db.actions_title': 'ध्यान देने योग्य',
    'db.actions_all': 'कतार खोलें',
    'db.actions_empty': 'अभी कोई कार्य लंबित नहीं',
    'db.actions_empty_text': 'अतिदेय नवीनीकरण, बैंक अलर्ट और समय-सीमा उल्लंघन यहाँ दिखाई देंगे।',
    'db.kind.verification': 'सत्यापन',
    'db.kind.discrepancy': 'विसंगति',
    'db.kind.maturity': 'शीघ्र परिपक्व',
    'db.kind.overdue': 'नवीनीकरण अतिदेय',
    'db.kind.release_sla': 'रिलीज़ समय-सीमा',
    'db.kind.bank_alert': 'बैंक अलर्ट',

    'db.cal_title': 'परिपक्वता कैलेंडर · अगले 12 माह',
    'db.cal_sub': 'परिपक्वता तिथि के अनुसार रखी गई जमा। किसी दिन की जमा देखने के लिए उसे चुनें।',
    'db.cal_overdue_t_1': '{n} जमा परिपक्व हो चुकी है और नवीनीकृत नहीं हुई',
    'db.cal_overdue_t': '{n} जमा परिपक्व हो चुकी हैं और नवीनीकृत नहीं हुईं',
    'db.cal_overdue_b': '{amt} अब एआईसीटीई को सुरक्षा नहीं दे रही। अनुस्मारक और एस्केलेशन प्रक्रिया जारी है।',
    'db.cal_overdue_none': 'नवीनीकरण की प्रतीक्षा में कोई परिपक्व जमा नहीं है।',
    'db.cal_review': 'अतिदेय जमा देखें',
    'db.cal_next30': '30 दिन में परिपक्व',
    'db.cal_next90': '90 दिन में परिपक्व',
    'db.cal_monthly': 'माहवार परिपक्व होने वाली राशि',
    'db.cal_empty': 'अगले 12 माह में कोई जमा परिपक्व नहीं हो रही।',
    'db.cal_day_aria': '{date}: {n} एफडीआर, {amt}',

    'db.state_title': 'राज्यवार जमा',
    'db.state_sub': 'रखी गई राशि के अनुसार शीर्ष 10 राज्य, सुरक्षा अंतर सहित',
    'db.state_held': 'रखी गई राशि',
    'db.state_gap': 'सुरक्षा अंतर',
    'db.state_foot': '{n} राज्य · कुल {amt}',
    'db.state_more': 'सभी राज्य विश्लेषण में',

    'db.bank_title': 'बैंकवार जमा',
    'db.bank_sub': 'रखी गई एफडीआर और बैंक द्वारा पुष्टि का अनुपात',
    'db.col.instruments': 'रखी गई एफडीआर',
    'db.col.verified': 'बैंक सत्यापित',
    'db.col.issues': 'खुली समस्याएँ',
    'db.none': 'कोई नहीं',
    'db.bank_total': 'कुल {n} एफडीआर · {amt}',

    'db.impact_title': 'मैनुअल प्रक्रिया की तुलना में मापा गया सुधार',
    'db.impact_more': 'पूर्ण विश्लेषण',
    'db.impact_better': 'बेहतर',
    'db.impact_empty': 'पोर्टल पर एफडीआर सत्यापित होने के बाद सुधार के आँकड़े दिखाई देंगे।',
    'db.m.verification_turnaround_days': 'सत्यापन में लगने वाला समय',
    'db.m.missed_renewals_per_year': 'प्रति वर्ष छूटे नवीनीकरण',
    'db.m.records_complete_pct': 'पूर्ण एफडीआर अभिलेख',
    'db.m.manual_hours_per_month': 'मैनुअल श्रम',
    'db.m.release_turnaround_days': 'रिलीज़ / वापसी में लगने वाला समय',
    'db.m.discrepancy_detection': 'स्वतः पकड़ी गई विसंगतियाँ',
    'db.u.days_n': '{n} दिन',
    'db.u.per_year_n': '{n} प्रति वर्ष',
    'db.u.hours_month_n': '{n} घंटे/माह',
  },
});

/* ------------------------------------------------------------------ helpers */
const LIVE = 'SUBMITTED,UNDER_VERIFICATION,DISCREPANCY,ACTIVE,RELEASE_REQUESTED';
const HELD = 'ACTIVE,RELEASE_REQUESTED';

function qs(params) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) if (v !== undefined && v !== null && v !== '') u.set(k, v);
  const s = u.toString();
  return s ? `?${s}` : '';
}
const fdrsLink = (params) => site(`officer/fdrs.html${qs(params)}`);

/** Plural-aware count phrase: pl('db.n_fdr', 3) -> '3 instruments' (uses '<key>_1' for one). */
function pl(key, n) { return t(n === 1 ? `${key}_1` : key, { n: fmtNum(n) }); }

function fmtDateIn(iso, lang) {
  const p = parseISO(iso);
  return p ? `${String(p.d).padStart(2, '0')} ${monthName(p.mo, lang)} ${p.y}` : '';
}

function addDays(iso, n) {
  const p = parseISO(iso);
  return new Date(Date.UTC(p.y, p.mo, p.d + n)).toISOString().slice(0, 10);
}

function lastOfMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

function num1(n) { return n === null || n === undefined ? '—' : fmtNum(n, 1); }

function unitText(unit, v) {
  const n = num1(v);
  if (unit === '%') return `${n}%`;
  if (unit === 'days') return t('db.u.days_n', { n });
  if (unit === 'per year') return t('db.u.per_year_n', { n });
  if (unit === 'hours/month') return t('db.u.hours_month_n', { n });
  return `${n} ${unit || ''}`.trim();
}

const charts = {};
function chart(name, make) {
  if (charts[name]) { try { charts[name].destroy(); } catch (e) { /* already gone */ } }
  charts[name] = make();
  return charts[name];
}

function sk(h, extra = '') { return el('div', { class: `skeleton ${extra}`, style: { height: `${h}px` }, 'aria-hidden': 'true' }); }

function busy(node, on) { if (on) node.setAttribute('aria-busy', 'true'); else node.removeAttribute('aria-busy'); }

/** Error state inside a card-like box (for grid slots that are not cards themselves). */
function failBox(container, err, retry) {
  const box = el('div', { class: 'card span-all' });
  errorState(box, err, retry);
  mount(container, box);
}

/** KPI tile; an <a> when it links somewhere (keyboard/middle-click friendly). */
function tile({ label, iconName, value, unit, sub, color, href, go, title }) {
  return el(href ? 'a' : 'div', { class: `kpi ${color ? `c-${color}` : ''} ${href ? 'clickable' : ''}`, href, title },
    el('div', { class: 'k-label', html: `${iconName ? icon(iconName, 14) : ''}<span>${esc(label)}</span>` }),
    el('div', { class: 'k-value', html: `${esc(value)}${unit ? `<span class="k-unit">${esc(unit)}</span>` : ''}` }),
    sub ? el('div', { class: 'k-sub', html: sub }) : null,
    href && go ? el('span', { class: 'k-go', html: `${esc(go)}${icon('arrow-right', 13)}` }) : null);
}

/* ------------------------------------------------------------------ page */
const S = { summary: null, cats: {}, actions: null, cal: null, states: null, banks: null, impact: null };
let pendingCount = null;

function headActions() {
  const run = el('button', { class: 'btn secondary', type: 'button', title: t('db.run_hint'), html: `${icon('refresh', 16)}<span>${esc(t('db.run'))}</span>` });
  run.addEventListener('click', () => runDaily(run));
  const queue = el('a', {
    class: 'btn', href: site('officer/queue.html'),
    html: `${icon('queue', 16)}<span>${esc(t('db.open_queue'))}</span>${pendingCount ? ` <span class="badge b-saffron">${esc(pendingCount)}</span>` : ''}`,
  });
  return [run, queue];
}

const { meta } = await initPage({
  roles: ['officer', 'authority', 'admin'],
  active: 'dashboard',
  title: 'db.title',
  subtitle: 'db.subtitle_loading',
  actions: headActions,
});

function setSubtitle(today) {
  if (!today) return;
  setPageHead({
    subtitle: {
      en: `Security deposits held by AICTE · as on ${fmtDateIn(today, 'en')}`,
      hi: `एआईसीटीई के पास रखी प्रतिभूति जमा · ${fmtDateIn(today, 'hi')} की स्थिति`,
    },
  });
}
setSubtitle(meta && meta.today);

$$('[data-icon]').forEach((n) => { n.innerHTML = icon(n.dataset.icon, 18); });
$('#actions-all').href = site('officer/queue.html');
$('#impact-link').href = site('officer/analytics.html');

const gapEl = $('#gap');
const kpisEl = $('#kpis');
const tilesEl = $('#tiles');
const trustEl = $('#trust');
const riskEl = $('#risk');
const actionsEl = $('#actions');
const calEl = $('#calendar');
const statesEl = $('#states');
const banksEl = $('#banks');
const impactEl = $('#impact');

const todayISO = () => (S.summary && S.summary.today) || (S.cal && S.cal.today) || (meta && meta.today) || new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ (1) gap + KPIs, (2) buckets, (3) trust/risk */
const GAP_LINKS = {
  matured_unrenewed: () => fdrsLink({ category: 'matured' }),
  bank_issue: () => fdrsLink({ status: HELD, flagged: 1, category: 'active,expiring,pending' }),
  unverified: () => fdrsLink({ category: 'active,expiring', trust: '0,1' }),
  shortfall: () => site('officer/institutions.html?has_shortfall=1'),
};

function renderGap() {
  const s = S.summary;
  const g = s.protection_gap;
  const held = s.amounts.held || 0;
  const prot = s.amounts.protected || 0;
  const pct = held ? Math.round((100 * prot) / held) : 0;
  mount(gapEl, el('div', { class: 'hero-figure danger db-gap' },
    el('div', { class: 'hf-label', html: `${icon('shield-alert', 16)}<span>${esc(t('db.gap_label'))}</span>` }),
    el('div', { class: 'hf-value' }, fmtINRShort(g.amount)),
    el('div', { class: 'hf-sub' }, g.amount ? t('db.gap_sub', { n: fmtNum(g.instruments), m: fmtNum(g.institutions_short) }) : t('db.gap_none')),
    el('div', { class: 'db-held' },
      el('div', { class: 'row' },
        el('span', {}, t('db.held', { amt: fmtINRShort(held) })),
        el('span', {}, t('db.protected', { amt: fmtINRShort(prot), pct }))),
      el('div', { class: 'bar', role: 'img', 'aria-label': t('db.protected_aria', { pct }) }, el('span', { style: { width: `${pct}%` } }))),
    el('div', { class: 'db-chips' }, g.breakdown.map((b) => el('a', {
      class: `db-chip ${b.amount ? '' : 'zero'}`,
      href: (GAP_LINKS[b.reason] || GAP_LINKS.matured_unrenewed)(),
      title: t(`db.gap.${b.reason}.hint`, { _default: b.label }),
    },
    el('span', { class: 'c-label', html: `<span>${esc(t(`db.gap.${b.reason}`, { _default: b.label }))}</span>${icon('arrow-right', 14)}` }),
    el('span', { class: 'c-amt' }, fmtINRShort(b.amount)),
    el('span', { class: 'c-count' }, b.reason === 'shortfall' ? pl('db.n_inst', b.count) : pl('db.n_fdr', b.count)))))));
}

function renderKpis() {
  const s = S.summary;
  const k = s.kpis;
  const meter = (v, cls = '') => (v === null || v === undefined ? '' : `<div class="meter ${cls}"><span style="width:${Math.max(0, Math.min(100, v))}%"></span></div>`);
  const faster = k.avg_verification_days !== null && k.baseline_verification_days
    ? Math.round(100 * (1 - k.avg_verification_days / k.baseline_verification_days)) : null;
  mount(kpisEl,
    tile({
      label: t('db.k.verify'), iconName: 'clock', color: 'success',
      value: num1(k.avg_verification_days), unit: k.avg_verification_days !== null ? t('db.u.days') : '',
      sub: `${faster !== null ? `<span class="k-delta up">${esc(t('db.k.faster', { pct: faster }))}</span> ` : ''}${k.baseline_verification_days ? esc(t('db.k.verify_vs', { base: k.baseline_verification_days })) : ''}`,
    }),
    tile({
      label: t('db.k.records'), iconName: 'file-check', color: 'info',
      value: k.records_complete_pct !== null ? `${num1(k.records_complete_pct)}%` : '—',
      sub: `${k.baseline_records_complete_pct !== null && k.baseline_records_complete_pct !== undefined ? esc(t('db.k.records_vs', { base: k.baseline_records_complete_pct })) : ''}${meter(k.records_complete_pct, 'primary')}`,
    }),
    tile({
      label: t('db.k.renewals'), iconName: 'refresh', color: 'teal',
      value: k.on_time_renewal_pct !== null ? `${num1(k.on_time_renewal_pct)}%` : '—',
      sub: `${esc(t('db.k.renewals_sub'))}${meter(k.on_time_renewal_pct, k.on_time_renewal_pct !== null && k.on_time_renewal_pct < 70 ? 'warning' : '')}`,
    }),
    tile({
      label: t('db.k.disc'), iconName: 'flag', color: k.open_discrepancies ? 'orange' : 'success',
      value: fmtNum(k.open_discrepancies), sub: esc(t('db.k.disc_sub')),
      href: fdrsLink({ status: LIVE, has_open_discrepancy: 1 }), go: t('db.review'),
    }),
    tile({
      label: t('db.k.sla'), iconName: 'hourglass', color: k.release_sla_breaches ? 'danger' : 'success',
      value: fmtNum(k.release_sla_breaches), sub: esc(t('db.k.sla_sub', { n: fmtNum(k.pending_releases) })),
      href: site('officer/releases.html'), go: t('db.review'),
    }),
    tile({
      label: t('db.k.pending'), iconName: 'queue', color: 'violet',
      value: fmtNum(k.pending_verifications), sub: esc(t('db.k.pending_sub', { amt: fmtINRShort(s.amounts.pending_verification) })),
      href: site('officer/queue.html'), go: t('db.open_queue'),
    }));
}

const BUCKETS = [
  ['active', 'success', 'shield-check'],
  ['expiring', 'warning', 'clock'],
  ['matured', 'danger', 'hourglass'],
  ['renewed', 'teal', 'refresh'],
  ['released', 'slate', 'unlock'],
  ['pending', 'info', 'file-check'],
];

function renderTiles() {
  const c = S.summary.counts;
  mount(tilesEl, BUCKETS.map(([key, color, ic]) => {
    const amt = S.cats[key];
    return tile({
      label: t(`cat.${key}`), iconName: ic, color, value: fmtNum(c[key] || 0),
      sub: `${amt !== undefined ? `<div>${esc(fmtINRShort(amt))}</div>` : ''}<div class="muted small" style="font-weight:400">${esc(t(`db.b.${key}`))}</div>`,
      href: fdrsLink({ category: key }), go: t('db.view_list'),
      title: amt !== undefined ? fmtINR(amt) : null,
    });
  }));
}

function renderTrust() {
  const d = S.summary.trust_distribution;
  const vals = [d['0'] || 0, d['1'] || 0, d['2'] || 0];
  const total = vals.reduce((a, b) => a + b, 0);
  const pct = (v) => (total ? Math.round((100 * v) / total) : 0);
  const canvas = el('canvas', { role: 'img', 'aria-label': `${t('db.trust_title')}: ${[0, 1, 2].map((i) => `${t(`trust.${i}`)} ${vals[i]}`).join(', ')}` });
  mount(trustEl,
    el('div', { class: 'chart-box sm' }, canvas),
    el('div', { class: 'db-legend' }, [0, 1, 2].map((i) => el('a', { class: 'lg-item', href: fdrsLink({ status: LIVE, trust: i }), title: t(`trust.${i}.long`) },
      el('span', { class: 'sw', style: { background: TRUST_COLORS[i] } }), t(`trust.${i}`),
      el('b', {}, `${fmtNum(vals[i])} · ${pct(vals[i])}%`)))),
    el('div', { class: 'db-note mt-2' },
      el('span', { class: 'badge trust-flag', html: `${icon('flag', 12)}${esc(fmtNum(d.flagged || 0))}` }),
      el('a', { href: fdrsLink({ status: LIVE, flagged: 1 }) }, t('db.flagged_note', { n: fmtNum(d.flagged || 0) }))));
  chart('trust', () => doughnutChart(canvas, {
    labels: [0, 1, 2].map((i) => t(`trust.${i}`)), data: vals,
    colors: [TRUST_COLORS[0], TRUST_COLORS[1], TRUST_COLORS[2]],
    center: { value: fmtNum(total), label: t('db.instruments') }, legend: false, cutout: '70%',
    onClick: (i) => { location.href = fdrsLink({ status: LIVE, trust: i }); },
  }));
}

const BANDS = ['low', 'medium', 'high', 'critical'];
function renderRisk() {
  const d = S.summary.risk_distribution;
  const vals = BANDS.map((b) => d[b] || 0);
  const urgent = (d.high || 0) + (d.critical || 0);
  const canvas = el('canvas', { role: 'img', 'aria-label': `${t('db.risk_title')}: ${BANDS.map((b, i) => `${t(`risk.${b}`)} ${vals[i]}`).join(', ')}` });
  mount(riskEl,
    el('div', { class: 'chart-box sm' }, canvas),
    el('div', { class: 'db-note mt-2' },
      el('span', { class: `badge ${urgent ? 'risk-critical' : 'b-success'}`, html: `${icon(urgent ? 'alert' : 'check', 12)}${esc(fmtNum(urgent))}` }),
      el('a', { href: fdrsLink({ status: LIVE, risk_band: 'high,critical' }) }, t('db.risk_note', { n: fmtNum(urgent) }))),
    el('div', { class: 'muted small mt-1' }, t('db.risk_bands')));
  chart('risk', () => barChart(canvas, {
    labels: BANDS.map((b) => t(`risk.${b}`)),
    datasets: [{ label: t('db.instruments'), data: vals, colors: BANDS.map((b) => RISK_COLORS[b]) }],
    legend: false, maxBarThickness: 46,
    onClick: (i) => { location.href = fdrsLink({ status: LIVE, risk_band: BANDS[i] }); },
  }));
}

function summarySkeletons() {
  mount(gapEl, sk(340, 'sk-block'));
  mount(kpisEl, Array.from({ length: 6 }, () => sk(150, 'sk-block')));
  mount(tilesEl, Array.from({ length: 6 }, () => sk(132, 'sk-block')));
  mount(trustEl, sk(190), el('div', { class: 'mt-2' }, sk(46)));
  mount(riskEl, sk(190), el('div', { class: 'mt-2' }, sk(46)));
}

async function loadSummary() {
  [gapEl, kpisEl, tilesEl, trustEl, riskEl].forEach((n) => busy(n, true));
  summarySkeletons();
  try {
    const catReq = Promise.allSettled(BUCKETS.map(([key]) => api.get('/fdrs', { category: key, page_size: 1 })));
    S.summary = await api.get('/dashboard/summary');
    pendingCount = S.summary.kpis.pending_verifications || null;
    setPageHead({});   // refresh the queue badge in the page actions
    setSubtitle(S.summary.today);
    const cats = await catReq;
    S.cats = {};
    cats.forEach((r, i) => { if (r.status === 'fulfilled' && r.value && r.value.totals) S.cats[BUCKETS[i][0]] = r.value.totals.amount; });
    renderSummary();
  } catch (err) {
    S.summary = null;
    failBox(gapEl, err, loadSummary);
    mount(kpisEl);
    failBox(tilesEl, err, loadSummary);
    errorState(trustEl, err, loadSummary);
    errorState(riskEl, err, loadSummary);
  } finally {
    [gapEl, kpisEl, tilesEl, trustEl, riskEl].forEach((n) => busy(n, false));
  }
}

function renderSummary() {
  if (!S.summary) return;
  renderGap();
  renderKpis();
  renderTiles();
  renderTrust();
  renderRisk();
}

/* ------------------------------------------------------------------ highest-risk instruments */
const topEl = $('#toprisk');
$('#top-all').href = fdrsLink({ status: LIVE, risk_band: 'high,critical', sort: 'risk_score', order: 'desc' });

function renderTop() {
  const rows = S.top || [];
  const host = el('div');
  renderTable(host, {
    compact: true,
    columns: [
      {
        key: 'ref', label: t('f.ref_no'), render: (r) => `<div class="db-top-ref">${esc(r.ref_no)}</div><div class="cell-sub db-top-inst" title="${esc(r.institution.name)}">${esc(r.institution.name)}</div>${
          r.open_discrepancies ? `<div class="cell-sub db-top-disc">${icon('flag', 12)} ${esc(pl('db.top_disc', r.open_discrepancies))}</div>` : ''}`,
      },
      { key: 'amount', label: t('f.amount'), align: 'right', render: (r) => `<span class="num">${esc(fmtINR(r.amount))}</span>` },
      { key: 'status', label: `${t('f.status')} · ${t('f.trust')}`, render: (r) => `<div class="db-top-badges">${statusBadge(r.display_status)}${trustBadge(r.trust_level, r.flagged)}</div>` },
      { key: 'risk', label: t('f.risk'), align: 'center', render: (r) => riskBadge(r.risk_score, r.risk_band) },
      { key: 'maturity', label: t('f.maturity_date'), render: (r) => `<div class="nowrap">${esc(fmtDate(r.maturity_date))}</div>${maturityChip(r.days_to_maturity)}` },
    ],
    rows,
    onRowClick: (r) => { location.href = site(`officer/fdr.html?id=${r.id}`); },
    empty: { icon: 'shield-check', title: t('db.top_empty') },
  });
  mount(topEl, host);
}

async function loadTop() {
  busy(topEl, true);
  mount(topEl, el('div', { class: 'card-body' }, Array.from({ length: 5 }, () => sk(30, 'sk-line'))));
  try {
    const r = await api.get('/fdrs', { status: LIVE, sort: 'risk_score', order: 'desc', page_size: 6 });
    S.top = r.items || [];
    renderTop();
  } catch (err) {
    S.top = null;
    errorState(topEl, err, loadTop);
  } finally { busy(topEl, false); }
}

/* ------------------------------------------------------------------ action items */
const KIND_ICON = { verification: 'file-check', discrepancy: 'flag', maturity: 'calendar', overdue: 'hourglass', release_sla: 'clock', bank_alert: 'bank' };
const SEV_TONE = { critical: 'danger', high: 'warning', medium: 'warning', low: '' };

function renderActions() {
  const items = S.actions || [];
  if (!items.length) {
    emptyState(actionsEl, { icon: 'check-circle', title: t('db.actions_empty'), text: t('db.actions_empty_text') });
    return;
  }
  const today = todayISO();
  mount(actionsEl, items.map((it) => {
    const when = it.at ? relDays(daysBetween(today, it.at.slice(0, 10)), { past: 'ago' }) : '';
    return el('a', { class: 'list-item', href: site(it.link || 'officer/queue.html') },
      el('div', { class: `li-icon ${SEV_TONE[it.severity] ?? ''}`, html: icon(KIND_ICON[it.kind] || 'alert', 18) }),
      el('div', { class: 'li-main' },
        el('div', { class: 'li-title' }, it.title),
        it.subtitle ? el('div', { class: 'li-sub' }, it.subtitle) : null,
        el('div', { class: 'li-meta', html: `${severityBadge(it.severity)}<span>${esc(t(`db.kind.${it.kind}`, { _default: it.kind }))}</span>${when ? `<span aria-hidden="true">·</span><span>${esc(when)}</span>` : ''}` })),
      el('span', { class: 'li-go', html: icon('chevron-right', 16) }));
  }));
}

async function loadActions() {
  busy(actionsEl, true);
  mount(actionsEl, Array.from({ length: 5 }, () => el('div', { class: 'list-item' }, sk(34, 'sk-block'), el('div', { class: 'li-main' }, sk(14, 'sk-line'), sk(12)))));
  try {
    S.actions = await api.get('/dashboard/action-items', { limit: 8 });
    renderActions();
  } catch (err) {
    S.actions = null;
    errorState(actionsEl, err, loadActions);
  } finally { busy(actionsEl, false); }
}

/* ------------------------------------------------------------------ maturity calendar */
function renderCalendar() {
  const cal = S.cal;
  const today = cal.today || todayISO();
  const hm = el('div');
  const in30 = addDays(today, 30);
  const in90 = addDays(today, 90);
  const sumUntil = (lim) => cal.days.filter((d) => d.date >= today && d.date <= lim)
    .reduce((a, d) => ({ count: a.count + d.count, amount: a.amount + d.amount }), { count: 0, amount: 0 });
  const n30 = sumUntil(in30);
  const n90 = sumUntil(in90);
  const od = cal.overdue || { count: 0, amount: 0 };
  const canvas = el('canvas', { role: 'img', 'aria-label': t('db.cal_monthly') });

  mount(calEl,
    cal.days.length ? hm : el('div', { class: 'alert info' }, el('span', { html: icon('info', 18) }), el('div', {}, t('db.cal_empty'))),
    el('div', { class: 'db-cal-foot' },
      el('div', {},
        od.count
          ? el('div', { class: 'alert danger' }, el('span', { html: icon('alert-circle', 18) }), el('div', {},
            el('div', { class: 'a-title' }, pl('db.cal_overdue_t', od.count)),
            el('div', {}, t('db.cal_overdue_b', { amt: fmtINRShort(od.amount) })),
            el('a', { class: 'btn sm outline-danger mt-2', href: fdrsLink({ category: 'matured' }), html: `${esc(t('db.cal_review'))}${icon('arrow-right', 14)}` })))
          : el('div', { class: 'alert success' }, el('span', { html: icon('check-circle', 18) }), el('div', {}, t('db.cal_overdue_none'))),
        el('div', { class: 'db-cal-stats' },
          el('a', { class: 'cs', href: fdrsLink({ status: HELD, maturity_from: today, maturity_to: in30 }) },
            el('div', { class: 'l' }, t('db.cal_next30')), el('div', { class: 'v' }, fmtNum(n30.count)), el('div', { class: 'small text-2' }, fmtINRShort(n30.amount))),
          el('a', { class: 'cs', href: fdrsLink({ status: HELD, maturity_from: today, maturity_to: in90 }) },
            el('div', { class: 'l' }, t('db.cal_next90')), el('div', { class: 'v' }, fmtNum(n90.count)), el('div', { class: 'small text-2' }, fmtINRShort(n90.amount))))),
      el('div', {},
        el('div', { class: 'label mb-1' }, t('db.cal_monthly')),
        el('div', { class: 'chart-box sm' }, canvas))));

  if (cal.days.length) {
    heatmap(hm, {
      days: cal.days, start: cal.start, months: (cal.months && cal.months.length) || 12, today,
      onClick: (d) => { location.href = fdrsLink({ status: HELD, maturity_from: d.date, maturity_to: d.date }); },
    });
    const byDate = new Map(cal.days.map((d) => [d.date, d]));
    // keyboard + screen-reader access to the clickable day cells
    $$('.hm-cell[data-count]', hm).forEach((cell, i) => {
      const day = cal.days.filter((d) => d.count)[i];
      const info = day && byDate.get(day.date);
      cell.tabIndex = 0;
      cell.setAttribute('role', 'button');
      if (info) cell.setAttribute('aria-label', t('db.cal_day_aria', { date: fmtDate(info.date), n: info.count, amt: fmtINRShort(info.amount) }));
      cell.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cell.click(); } });
    });
  }
  const months = cal.months || [];
  chart('monthly', () => barChart(canvas, {
    labels: months.map((m) => { const [y, mo] = m.month.split('-').map(Number); return `${monthName(mo - 1)} ${String(y).slice(2)}`; }),
    datasets: [{ label: t('f.amount'), data: months.map((m) => m.amount), color: COLORS.saffron }],
    money: true, legend: false, maxBarThickness: 26,
    onClick: (i) => { const m = months[i]; if (m) location.href = fdrsLink({ status: HELD, maturity_from: `${m.month}-01`, maturity_to: lastOfMonth(m.month) }); },
  }));
}

async function loadCalendar() {
  busy(calEl, true);
  mount(calEl, sk(130), el('div', { class: 'db-cal-foot' }, sk(170), sk(170)));
  try {
    S.cal = await api.get('/dashboard/maturity-calendar', { months: 12 });
    renderCalendar();
  } catch (err) {
    S.cal = null;
    errorState(calEl, err, loadCalendar);
  } finally { busy(calEl, false); }
}

/* ------------------------------------------------------------------ by state / by bank */
function renderStates() {
  const rows = S.states || [];
  if (!rows.length) { emptyState(statesEl, { icon: 'map' }); return; }
  const top = rows.slice(0, 10);
  const canvas = el('canvas', { role: 'img', 'aria-label': `${t('db.state_title')}: ${top.map((r) => `${r.state} ${fmtINRShort(r.amount)}`).join(', ')}` });
  const total = rows.reduce((a, r) => a + (r.amount || 0), 0);
  mount(statesEl,
    el('div', { class: 'chart-box lg' }, canvas),
    el('div', { class: 'row between mt-2 small' },
      el('span', { class: 'muted' }, t('db.state_foot', { n: fmtNum(rows.length), amt: fmtINRShort(total) })),
      el('a', { href: site('officer/analytics.html#by-state'), html: `${esc(t('db.state_more'))} ${icon('arrow-right', 13)}` })));
  chart('states', () => barChart(canvas, {
    labels: top.map((r) => r.state),
    datasets: [
      { label: t('db.state_held'), data: top.map((r) => r.amount), color: COLORS.primary },
      { label: t('db.state_gap'), data: top.map((r) => r.gap_amount), color: COLORS.red },
    ],
    horizontal: true, money: true, legend: true, maxBarThickness: 14,
    onClick: (i) => { const r = top[i]; if (r) location.href = fdrsLink({ state: r.state, status: HELD }); },
  }));
}

async function loadStates() {
  busy(statesEl, true);
  mount(statesEl, sk(330));
  try {
    S.states = await api.get('/dashboard/by-state');
    renderStates();
  } catch (err) {
    S.states = null;
    errorState(statesEl, err, loadStates);
  } finally { busy(statesEl, false); }
}

function renderBanks() {
  const rows = S.banks || [];
  const host = el('div');
  renderTable(host, {
    columns: [
      { key: 'bank', label: t('f.bank'), render: (r) => `<div class="db-bank-name">${esc(r.bank.name)}</div><div class="cell-sub mono">${esc(r.bank.code)}</div>` },
      { key: 'count', label: t('db.col.instruments'), align: 'right', render: (r) => esc(fmtNum(r.count)) },
      { key: 'amount', label: t('f.amount'), align: 'right', render: (r) => `<span title="${esc(fmtINR(r.amount))}">${esc(fmtINRShort(r.amount))}</span>` },
      {
        key: 'verified', label: t('db.col.verified'), render: (r) => {
          const v = r.bank_verified_pct;
          if (v === null || v === undefined) return '<span class="muted">—</span>';
          const cls = v >= 95 ? '' : v >= 80 ? 'warning' : 'danger';
          return `<div class="db-meter-cell"><div class="meter ${cls}" role="img" aria-label="${esc(fmtNum(v, 1))}%"><span style="width:${Math.min(100, v)}%"></span></div><span class="num">${esc(fmtNum(v, 1))}%</span></div>`;
        },
      },
      { key: 'issues', label: t('db.col.issues'), align: 'center', render: (r) => (r.issues ? `<span class="badge b-danger">${icon('alert', 12)}${esc(fmtNum(r.issues))}</span>` : `<span class="badge b-success">${esc(t('db.none'))}</span>`) },
    ],
    rows,
    onRowClick: (r) => { location.href = fdrsLink({ bank_id: r.bank.id, status: HELD }); },
    empty: { icon: 'bank' },
  });
  const totN = rows.reduce((a, r) => a + (r.count || 0), 0);
  const totA = rows.reduce((a, r) => a + (r.amount || 0), 0);
  mount(banksEl, host, rows.length ? el('div', { class: 'table-footer' }, el('span', {}, t('db.bank_total', { n: fmtNum(totN), amt: fmtINRShort(totA) })), el('span', { class: 'muted' }, t('db.bank_sub'))) : null);
}

async function loadBanks() {
  busy(banksEl, true);
  mount(banksEl, el('div', { class: 'card-body' }, Array.from({ length: 6 }, () => sk(30, 'sk-line'))));
  try {
    S.banks = await api.get('/dashboard/by-bank');
    renderBanks();
  } catch (err) {
    S.banks = null;
    errorState(banksEl, err, loadBanks);
  } finally { busy(banksEl, false); }
}

/* ------------------------------------------------------------------ impact teaser */
function renderImpact() {
  const metrics = ((S.impact && S.impact.metrics) || []).filter((m) => m.improvement_pct !== null && m.improvement_pct !== undefined && m.improvement_pct > 0)
    .sort((a, b) => b.improvement_pct - a.improvement_pct).slice(0, 3);
  if (!metrics.length) { emptyState(impactEl, { icon: 'trend', title: t('db.impact_empty') }); return; }
  mount(impactEl, el('div', { class: 'db-impact' }, metrics.map((m) => el('a', { class: 'db-imp card hoverable', href: site('officer/analytics.html#impact') },
    el('div', { class: 'i-pct' }, `${fmtNum(Math.round(m.improvement_pct))}%`, el('span', { class: 'small muted', style: { fontWeight: 600, marginLeft: '6px' } }, t('db.impact_better'))),
    el('div', { class: 'i-label' }, t(`db.m.${m.key}`, { _default: m.label })),
    el('div', { class: 'i-ba', html: `<s>${esc(unitText(m.unit, m.before))}</s>${icon('arrow-right', 14)}<b>${esc(unitText(m.unit, m.after))}</b>` })))));
}

async function loadImpact() {
  busy(impactEl, true);
  mount(impactEl, el('div', { class: 'db-impact' }, sk(112, 'sk-block'), sk(112, 'sk-block'), sk(112, 'sk-block')));
  try {
    S.impact = await api.get('/dashboard/impact');
    renderImpact();
  } catch (err) {
    S.impact = null;
    errorState(impactEl, err, loadImpact);
  } finally { busy(impactEl, false); }
}

/* ------------------------------------------------------------------ daily job */
async function runDaily(btn) {
  const ok = await confirmDialog(t('db.run_confirm'), { title: t('db.run'), confirmLabel: t('db.run_go') });
  if (!ok) return;
  await withBusy(btn, async () => {
    try {
      const r = await api.post('/admin/run-daily-job');
      toast(t('db.run_done', {
        date: fmtDate(r.date),
        reminders: pl('db.n.reminder', r.reminders || 0),
        escalations: pl('db.n.escalation', r.escalations || 0),
        stale: pl('db.n.stale', r.stale_verifications || 0),
        sla: pl('db.n.sla', r.sla_breaches || 0),
        checks: pl('db.n.check', r.bank_checks || 0),
        issues: pl('db.n.issue', r.bank_issues || 0),
        notes: pl('db.n.note', r.notifications_created || 0),
      }), 'success', 10000);
      window.dispatchEvent(new Event('nk:notifications-changed'));
      loadAll();
    } catch (err) {
      toast(t('db.run_failed', { msg: err.message }), 'error', 8000);
    }
  });
}

/* ------------------------------------------------------------------ boot */
function loadAll() {
  loadSummary();
  loadActions();
  loadTop();
  loadCalendar();
  loadStates();
  loadBanks();
  loadImpact();
}

onLang(() => {
  renderSummary();
  if (S.actions) renderActions();
  if (S.top) renderTop();
  if (S.cal) renderCalendar();
  if (S.states) renderStates();
  if (S.banks) renderBanks();
  if (S.impact) renderImpact();
});

loadAll();
