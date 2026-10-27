// Officer - risk-ranked verification queue (GET /api/queue, POST /api/fdrs/{id}/pickup).
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang, getLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, mount, kpi, tabs, toast, withBusy, confirmDialog, loading, emptyState, errorState,
  statusBadge, trustBadge, fmtINR, fmtINRShort, fmtDate, fmtNum, getParam, setParams, debounce,
} from '../assets/js/ui.js';

extend({
  en: {
    'queue.title': 'Verification queue',
    'queue.subtitle': 'Ranked by risk - the riskiest instruments first',
    'queue.list_title': 'Instruments needing action',
    'queue.summary': '{n} shown',
    'queue.search_label': 'Search the queue',
    'queue.search_ph': 'Search by reference, FDR number, institution or AICTE ID',
    'queue.sort_label': 'Sort',
    'queue.sort.risk': 'Highest risk first',
    'queue.sort.waiting': 'Longest waiting first',
    'queue.sort.maturity': 'Earliest maturity first',
    'queue.only_mine': 'Only mine',
    'queue.refresh': 'Refresh',
    'queue.registry': 'FDR registry',
    'queue.tab.all': 'All',
    'queue.tab.new': 'New',
    'queue.tab.in_progress': 'In progress',
    'queue.tab.discrepancy': 'Discrepancy',
    'queue.tab.flagged': 'Flagged',
    'queue.tab.matured': 'Matured',
    'queue.kind.new': 'New submission',
    'queue.kind.in_progress': 'Verification in progress',
    'queue.kind.discrepancy': 'Returned - discrepancy',
    'queue.kind.flagged': 'Live instrument flagged',
    'queue.kind.matured': 'Matured - renewal overdue',
    'queue.kpi.total': 'Needs action',
    'queue.kpi.total_sub': 'instruments · {amt}',
    'queue.kpi.risky': 'High / critical risk',
    'queue.kpi.risky_sub': 'score 60 or more',
    'queue.kpi.new': 'New submissions',
    'queue.kpi.new_sub': 'not yet picked up',
    'queue.kpi.wait': 'Longest wait',
    'queue.kpi.wait_sub': 'oldest pending case',
    'queue.kpi.mine': 'Picked up by me',
    'queue.kpi.mine_sub': 'click to show only mine',
    'queue.days': '{n} days',
    'queue.day': '1 day',
    'queue.of100': 'of 100',
    'queue.waiting': 'Waiting {d}',
    'queue.overdue': 'Overdue by {d}',
    'queue.open_for': 'Open for {d}',
    'queue.picked_by': 'Picked up by {name}',
    'queue.picked_you': 'Picked up by you',
    'queue.not_picked': 'Not picked up yet',
    'queue.matures': 'Matures {date}',
    'queue.matured_on': 'Matured {date}',
    'queue.fdr_no': 'FDR {no}',
    'queue.amount': 'Deposit amount',
    'queue.no_reasons': 'No risk points - routine check.',
    'queue.pickup': 'Pick up',
    'queue.takeover': 'Take over',
    'queue.review': 'Review',
    'queue.picked_ok': '{ref} is now assigned to you and marked "Under verification".',
    'queue.takeover_title': 'Take over this case?',
    'queue.takeover_msg': '{ref} is being verified by {name}. Taking it over moves the case to you; the hand-over is recorded in the audit trail.',
    'queue.takeover_ok': 'You have taken over {ref}.',
    'queue.empty_title': 'The queue is clear',
    'queue.empty_text': 'Nothing is waiting for verification right now. New submissions, flagged instruments and overdue renewals will appear here automatically.',
    'queue.empty_tab_title': 'Nothing in this tab',
    'queue.empty_tab_text': 'No instruments of this kind need action. Try another tab.',
    'queue.empty_filter_title': 'No matching instruments',
    'queue.empty_filter_text': 'Nothing in the queue matches your search or the "Only mine" filter.',
    'queue.clear_filters': 'Clear search and filters',
    'queue.why_title': 'Why this order?',
    'queue.why_intro': 'Every instrument gets a risk score from 0 to 100. The score is simply the sum of points for reasons an officer can read on the card - nothing is hidden. The queue shows the highest score first; ties go to the instrument that has waited longest.',
    'queue.bands_title': 'Risk bands',
    'queue.points_title': 'Where the points come from',
    'queue.band.critical': '80 - 100',
    'queue.band.high': '60 - 79',
    'queue.band.medium': '30 - 59',
    'queue.band.low': '0 - 29',
    'queue.pt.disc': 'Open discrepancy (critical / high / medium / low)',
    'queue.pt.disc_v': '+40 / 25 / 10 / 4',
    'queue.pt.matured': 'Matured and not renewed',
    'queue.pt.claimed': 'Only claimed - not matched or bank-confirmed',
    'queue.pt.tamper': 'Receipt shows signs of editing',
    'queue.pt.lien': 'Bank reports no lien for AICTE',
    'queue.pt.nodoc': 'No receipt uploaded',
    'queue.pt.maturing': 'Matures within 30 / 90 days',
    'queue.pt.maturing_v': '+15 / 8',
    'queue.pt.late': 'Late renewals in the past (5 each)',
    'queue.pt.late_v': 'up to +15',
    'queue.pt.docmatch': 'Receipt matched, bank not yet confirmed',
    'queue.pt.delay': 'Waiting more than 7 days for verification',
    'queue.pt.value': 'High value (Rs. 1 crore or more)',
    'queue.pt.closure': 'Institution has requested closure',
    'queue.pt.new': 'Institution less than 3 years old',
    'queue.mix_title': 'Queue by risk band',
    'queue.mix_empty': 'No instruments in the queue.',
    'queue.ladder_title': 'Trust ladder',
    'queue.ladder.0': 'Only what the institution typed and uploaded.',
    'queue.ladder.1': 'Fields read from the receipt (text or signed QR) match the form.',
    'queue.ladder.2': 'A valid bank-signed QR or the bank verification API confirmed the deposit.',
    'queue.ladder_flag': 'A red "Flagged" badge sits on top of any level while a high or critical discrepancy is open.',
  },
  hi: {
    'queue.title': 'सत्यापन कतार',
    'queue.subtitle': 'जोखिम के क्रम में - सबसे जोखिम वाले दस्तावेज़ सबसे पहले',
    'queue.list_title': 'कार्रवाई की प्रतीक्षा में दस्तावेज़',
    'queue.summary': '{n} दिखाए गए',
    'queue.search_label': 'कतार में खोजें',
    'queue.search_ph': 'संदर्भ संख्या, एफडीआर संख्या, संस्थान या एआईसीटीई आईडी से खोजें',
    'queue.sort_label': 'क्रम',
    'queue.sort.risk': 'सबसे अधिक जोखिम पहले',
    'queue.sort.waiting': 'सबसे लंबी प्रतीक्षा पहले',
    'queue.sort.maturity': 'सबसे पहले परिपक्व होने वाले',
    'queue.only_mine': 'केवल मेरे',
    'queue.refresh': 'रीफ़्रेश',
    'queue.registry': 'एफडीआर रजिस्टर',
    'queue.tab.all': 'सभी',
    'queue.tab.new': 'नई',
    'queue.tab.in_progress': 'जाँच जारी',
    'queue.tab.discrepancy': 'विसंगति',
    'queue.tab.flagged': 'चिह्नित',
    'queue.tab.matured': 'परिपक्व',
    'queue.kind.new': 'नई प्रस्तुति',
    'queue.kind.in_progress': 'सत्यापन जारी',
    'queue.kind.discrepancy': 'विसंगति हेतु लौटाई गई',
    'queue.kind.flagged': 'सक्रिय दस्तावेज़ चिह्नित',
    'queue.kind.matured': 'परिपक्व - नवीनीकरण अतिदेय',
    'queue.kpi.total': 'कार्रवाई आवश्यक',
    'queue.kpi.total_sub': 'दस्तावेज़ · {amt}',
    'queue.kpi.risky': 'उच्च / गंभीर जोखिम',
    'queue.kpi.risky_sub': 'स्कोर 60 या अधिक',
    'queue.kpi.new': 'नई प्रस्तुतियाँ',
    'queue.kpi.new_sub': 'अभी तक किसी ने नहीं ली',
    'queue.kpi.wait': 'सबसे लंबी प्रतीक्षा',
    'queue.kpi.wait_sub': 'सबसे पुराना लंबित मामला',
    'queue.kpi.mine': 'मेरे द्वारा लिए गए',
    'queue.kpi.mine_sub': 'केवल मेरे देखने हेतु क्लिक करें',
    'queue.days': '{n} दिन',
    'queue.day': '1 दिन',
    'queue.of100': '100 में से',
    'queue.waiting': 'प्रतीक्षा: {d}',
    'queue.overdue': 'अतिदेय: {d}',
    'queue.open_for': 'लंबित: {d}',
    'queue.picked_by': '{name} द्वारा लिया गया',
    'queue.picked_you': 'आपके द्वारा लिया गया',
    'queue.not_picked': 'अभी किसी ने नहीं लिया',
    'queue.matures': 'परिपक्वता {date}',
    'queue.matured_on': 'परिपक्व हुई {date}',
    'queue.fdr_no': 'एफडीआर {no}',
    'queue.amount': 'जमा राशि',
    'queue.no_reasons': 'कोई जोखिम अंक नहीं - सामान्य जाँच।',
    'queue.pickup': 'जाँच हेतु लें',
    'queue.takeover': 'मामला अपने पास लें',
    'queue.review': 'समीक्षा करें',
    'queue.picked_ok': '{ref} अब आपको सौंपा गया है और "सत्यापनाधीन" चिह्नित है।',
    'queue.takeover_title': 'क्या यह मामला अपने पास लेना है?',
    'queue.takeover_msg': '{ref} का सत्यापन {name} कर रहे हैं। मामला अपने पास लेने पर यह आपको सौंप दिया जाएगा; यह हस्तांतरण ऑडिट ट्रेल में दर्ज होगा।',
    'queue.takeover_ok': '{ref} अब आपके पास है।',
    'queue.empty_title': 'कतार खाली है',
    'queue.empty_text': 'अभी कोई दस्तावेज़ सत्यापन की प्रतीक्षा में नहीं है। नई प्रस्तुतियाँ, चिह्नित दस्तावेज़ और अतिदेय नवीनीकरण यहाँ स्वतः दिखाई देंगे।',
    'queue.empty_tab_title': 'इस टैब में कुछ नहीं',
    'queue.empty_tab_text': 'इस प्रकार के किसी दस्तावेज़ पर कार्रवाई आवश्यक नहीं है। दूसरा टैब देखें।',
    'queue.empty_filter_title': 'कोई मेल खाता दस्तावेज़ नहीं',
    'queue.empty_filter_text': 'आपकी खोज या "केवल मेरे" फ़िल्टर से कतार में कुछ मेल नहीं खाता।',
    'queue.clear_filters': 'खोज और फ़िल्टर हटाएँ',
    'queue.why_title': 'यह क्रम क्यों?',
    'queue.why_intro': 'प्रत्येक दस्तावेज़ को 0 से 100 तक जोखिम स्कोर मिलता है। यह स्कोर कार्ड पर लिखे कारणों के अंकों का योग है - कुछ भी छिपा नहीं। कतार में सबसे ऊँचा स्कोर सबसे पहले आता है; बराबर स्कोर पर अधिक समय से प्रतीक्षारत दस्तावेज़ पहले।',
    'queue.bands_title': 'जोखिम श्रेणियाँ',
    'queue.points_title': 'अंक कहाँ से आते हैं',
    'queue.pt.disc': 'खुली विसंगति (गंभीर / उच्च / मध्यम / कम)',
    'queue.pt.matured': 'परिपक्व, पर नवीनीकरण नहीं',
    'queue.pt.claimed': 'केवल दावा - न मिलान, न बैंक पुष्टि',
    'queue.pt.tamper': 'रसीद में संपादन के संकेत',
    'queue.pt.lien': 'बैंक के अनुसार एआईसीटीई हेतु लियन नहीं',
    'queue.pt.nodoc': 'कोई रसीद अपलोड नहीं',
    'queue.pt.maturing': '30 / 90 दिन में परिपक्वता',
    'queue.pt.late': 'पहले देर से नवीनीकरण (प्रत्येक 5)',
    'queue.pt.late_v': 'अधिकतम +15',
    'queue.pt.docmatch': 'रसीद का मिलान हुआ, बैंक पुष्टि शेष',
    'queue.pt.delay': '7 दिन से अधिक समय से सत्यापन लंबित',
    'queue.pt.value': 'उच्च मूल्य (₹1 करोड़ या अधिक)',
    'queue.pt.closure': 'संस्थान ने बंद करने का अनुरोध किया है',
    'queue.pt.new': 'संस्थान 3 वर्ष से कम पुराना',
    'queue.mix_title': 'जोखिम श्रेणी अनुसार कतार',
    'queue.mix_empty': 'कतार में कोई दस्तावेज़ नहीं।',
    'queue.ladder_title': 'विश्वास सीढ़ी',
    'queue.ladder.0': 'केवल वही जो संस्थान ने भरा और अपलोड किया।',
    'queue.ladder.1': 'रसीद (पाठ या हस्ताक्षरित क्यूआर) से पढ़े गए विवरण फ़ॉर्म से मेल खाते हैं।',
    'queue.ladder.2': 'वैध बैंक-हस्ताक्षरित क्यूआर या बैंक सत्यापन एपीआई ने जमा की पुष्टि की।',
    'queue.ladder_flag': 'जब तक कोई उच्च या गंभीर विसंगति खुली है, किसी भी स्तर पर लाल "चिह्नित" बैज दिखता है।',
  },
});

// Hindi wording for the risk reasons the server sends in English (codes from app/risk.py and app/codes.py).
const DISC_HI = {
  AMOUNT_MISMATCH: 'घोषित राशि रसीद / बैंक रिकॉर्ड से भिन्न है',
  DATE_MISMATCH: 'जारी या परिपक्वता तिथि रसीद / बैंक रिकॉर्ड से भिन्न है',
  FDR_NUMBER_MISMATCH: 'एफडीआर संख्या रसीद / बैंक रिकॉर्ड से भिन्न है',
  DEPOSITOR_MISMATCH: 'जमाकर्ता का नाम रसीद / बैंक रिकॉर्ड से भिन्न है',
  AICTE_ID_MISMATCH: 'रसीद पर एआईसीटीई आईडी संस्थान से मेल नहीं खाती',
  QR_INVALID: 'क्यूआर हस्ताक्षर अमान्य - रसीद जाली या परिवर्तित हो सकती है',
  QR_MISSING: 'रसीद पर डिजिटल हस्ताक्षरित क्यूआर कोड नहीं है',
  PDF_EDITED: 'जारी होने के बाद रसीद पीडीएफ़ में संपादन के संकेत',
  DUPLICATE_FDR: 'यही एफडीआर किसी अन्य रिकॉर्ड पर पहले से गिरवी है',
  DUPLICATE_FILE: 'यही फ़ाइल किसी अन्य रिकॉर्ड के लिए पहले अपलोड हो चुकी है',
  LIEN_NOT_MARKED: 'बैंक के अनुसार एआईसीटीई के पक्ष में लियन अंकित नहीं है',
  BANK_NOT_FOUND: 'बैंक में इस एफडीआर संख्या की कोई जमा नहीं है',
  BANK_CLOSED: 'बैंक के अनुसार जमा बंद / समय-पूर्व बंद कर दी गई',
  MATURED_NOT_RENEWED: 'दस्तावेज़ परिपक्व हो गया और नवीनीकरण प्रस्तुत नहीं हुआ',
  MISSING_DOCUMENT: 'आवश्यक रसीद / सहायक दस्तावेज़ उपलब्ध नहीं है',
  INSUFFICIENT_AMOUNT: 'जमा राशि संस्थान हेतु अपेक्षित राशि से कम है',
  OTHER: 'अन्य टिप्पणी',
};
const REASON_HI = {
  TRUST_CLAIMED: () => 'विवरण केवल संस्थान द्वारा दावा किए गए हैं (न मिलान, न बैंक पुष्टि)',
  TRUST_DOC_ONLY: () => 'रसीद फ़ॉर्म से मेल खाती है, पर बैंक ने अभी पुष्टि नहीं की',
  MATURED_UNRENEWED: (n) => `${n} दिन पहले परिपक्व, कोई स्वीकृत नवीनीकरण नहीं - एआईसीटीई असुरक्षित`,
  MATURING_30: (n) => `${n} दिन में परिपक्व`,
  MATURING_90: (n) => `${n} दिन में परिपक्व`,
  HIGH_VALUE: () => 'उच्च मूल्य की जमा (₹1 करोड़ या अधिक)',
  TAMPER_SIGNS: () => 'अपलोड की गई रसीद में संपादन के संकेत',
  TAMPER_MINOR: () => 'अपलोड की गई रसीद में मामूली विसंगतियाँ',
  NO_DOCUMENT: () => 'कोई रसीद अपलोड नहीं की गई',
  LIEN_NOT_CONFIRMED: () => 'बैंक के अनुसार एआईसीटीई के पक्ष में लियन अंकित नहीं',
  VERIFICATION_DELAY: (n) => `${n} दिन से सत्यापन की प्रतीक्षा`,
  LATE_RENEWAL_HISTORY: (n) => `संस्थान ने पहले ${n} बार देर से नवीनीकरण किया`,
  NEW_INSTITUTION: () => 'संस्थान 3 वर्ष से कम पुराना है',
  CLOSURE: () => 'संस्थान ने बंद करने का अनुरोध किया है',
};

function reasonText(r) {
  if (getLang() !== 'hi') return r.label || r.code;
  const code = String(r.code || '');
  if (code.startsWith('DISC_')) {
    const hi = DISC_HI[code.slice(5)];
    return `खुली विसंगति: ${hi || String(r.label || '').replace(/^Open discrepancy:\s*/, '')}`;
  }
  const n = (String(r.label || '').match(/\d+/) || [''])[0];
  return REASON_HI[code] ? REASON_HI[code](n) : (r.label || code);
}

const KINDS = ['new', 'in_progress', 'discrepancy', 'flagged', 'matured'];
const BANDS = ['critical', 'high', 'medium', 'low'];
const BAND_FILL = { critical: 'var(--nk-danger)', high: 'var(--nk-orange)', medium: 'var(--nk-warning-bd)', low: 'var(--nk-success)' };

const refreshBtn = () => el('button', {
  class: 'btn secondary', type: 'button', onclick: (e) => withBusy(e.currentTarget, () => load(true)),
  html: `${icon('refresh', 16)}<span>${esc(t('queue.refresh'))}</span>`,
});
const { user } = await initPage({
  roles: ['officer', 'authority', 'admin'],
  active: 'queue',
  title: 'queue.title',
  subtitle: 'queue.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'officer/dashboard.html' }, { label: 'queue.title' }],
  actions: () => el('div', { class: 'row' },
    el('a', { class: 'btn ghost', href: site('officer/fdrs.html'), html: `${icon('list', 16)}<span>${esc(t('queue.registry'))}</span>` }),
    refreshBtn()),
});

const listEl = $('#q-list');
const tabsEl = $('#q-tabs');
const kpisEl = $('#kpis');
const searchEl = $('#q-search');
const sortEl = $('#q-sort');
const mineEl = $('#q-mine');
const busyEl = $('#q-busy');

const state = {
  tab: KINDS.includes(getParam('tab')) ? getParam('tab') : 'all',
  sort: ['risk', 'waiting', 'maturity'].includes(getParam('sort')) ? getParam('sort') : 'risk',
  mine: getParam('mine') === '1',
  q: getParam('q') || '',
};
let data = null;      // last /api/queue response (all kinds)
let loadSeq = 0;

searchEl.value = state.q;
sortEl.value = state.sort;
mineEl.checked = state.mine;

function staticIcons() {
  $('#q-title-icon').innerHTML = icon('queue', 18);
  $('#q-search-icon').innerHTML = icon('search', 16);
  $('#why-icon').innerHTML = icon('help', 18);
  $('#mix-icon').innerHTML = icon('chart', 18);
  $('#ladder-icon').innerHTML = icon('shield-check', 18);
  $('#flag-icon').innerHTML = icon('flag', 16);
}

const daysText = (n) => (n === 1 ? t('queue.day') : t('queue.days', { n: fmtNum(n) }));
const isMine = (it) => it.picked_by && user && it.picked_by.id === user.id;

/* ------------------------------------------------------------------ help column (static, bilingual) */
function renderHelp() {
  mount($('#bands-legend'), BANDS.map((b) => el('div', {},
    el('span', { class: `risk-score risk-${b}` }, t(`queue.band.${b}`)),
    el('span', {}, t(`risk.${b}`)))));
  const pts = [
    ['queue.pt.disc', t('queue.pt.disc_v'), 'p-hi'],
    ['queue.pt.matured', '+30', 'p-hi'],
    ['queue.pt.claimed', '+20', 'p-mid'],
    ['queue.pt.tamper', '+20', 'p-mid'],
    ['queue.pt.lien', '+15', 'p-mid'],
    ['queue.pt.nodoc', '+15', 'p-mid'],
    ['queue.pt.maturing', t('queue.pt.maturing_v'), 'p-mid'],
    ['queue.pt.late', t('queue.pt.late_v'), 'p-mid'],
    ['queue.pt.docmatch', '+10', ''],
    ['queue.pt.delay', '+10', ''],
    ['queue.pt.value', '+10', ''],
    ['queue.pt.closure', '+10', ''],
    ['queue.pt.new', '+5', ''],
  ];
  mount($('#why-list'), pts.map(([k, v, cls]) => el('li', {}, el('span', {}, t(k)), el('span', { class: `q-pts ${cls}` }, v))));
  mount($('#ladder'), [0, 1, 2].map((lv) => el('div', { class: 'rung' },
    el('span', { html: trustBadge(lv, false) }),
    el('span', { class: 'r-desc' }, t(`queue.ladder.${lv}`)))));
}

/* ------------------------------------------------------------------ KPIs + mix */
function renderKpis() {
  if (!data) { mount(kpisEl, [1, 2, 3, 4, 5].map(() => el('div', { class: 'kpi' }, el('div', { class: 'skeleton', style: { height: '62px' } })))); return; }
  const items = data.items;
  const amount = items.reduce((s, it) => s + (it.amount || 0), 0);
  const risky = items.filter((it) => (it.risk_score || 0) >= 60).length;
  const pending = items.filter((it) => ['new', 'in_progress', 'discrepancy'].includes(it.queue_kind));
  const maxWait = pending.reduce((m, it) => Math.max(m, it.waiting_days || 0), 0);
  const mine = items.filter(isMine).length;
  mount(kpisEl,
    kpi({ label: t('queue.kpi.total'), value: fmtNum(data.total), sub: esc(t('queue.kpi.total_sub', { amt: fmtINRShort(amount) })), color: 'info', iconName: 'queue', onClick: () => selectTab('all') }),
    kpi({ label: t('queue.kpi.risky'), value: fmtNum(risky), sub: esc(t('queue.kpi.risky_sub')), color: risky ? 'danger' : 'success', iconName: 'shield-alert', onClick: () => { sortEl.value = 'risk'; state.sort = 'risk'; selectTab('all'); load(); } }),
    kpi({ label: t('queue.kpi.new'), value: fmtNum(data.counts.new || 0), sub: esc(t('queue.kpi.new_sub')), color: 'saffron', iconName: 'inbox', onClick: () => selectTab('new') }),
    kpi({ label: t('queue.kpi.wait'), value: maxWait ? daysText(maxWait) : '—', sub: esc(t('queue.kpi.wait_sub')), color: maxWait > 7 ? 'warning' : 'teal', iconName: 'hourglass', onClick: () => { sortEl.value = 'waiting'; state.sort = 'waiting'; load(); } }),
    kpi({ label: t('queue.kpi.mine'), value: fmtNum(mine), sub: esc(t('queue.kpi.mine_sub')), color: 'violet', iconName: 'user', onClick: () => { mineEl.checked = !mineEl.checked; state.mine = mineEl.checked; load(); } }));
}

function renderMix() {
  const box = $('#mix');
  if (!data) { mount(box, el('div', { class: 'skeleton', style: { height: '90px' } })); return; }
  const items = data.items;
  if (!items.length) { mount(box, el('p', { class: 'muted small mb-0' }, t('queue.mix_empty'))); return; }
  const max = Math.max(1, ...BANDS.map((b) => items.filter((it) => it.risk_band === b).length));
  mount(box, BANDS.map((b) => {
    const n = items.filter((it) => it.risk_band === b).length;
    return el('div', { class: 'band-row' },
      el('span', { class: 'text-2' }, t(`risk.${b}`)),
      el('div', { class: 'meter', role: 'img', 'aria-label': `${t(`risk.${b}`)}: ${n}` },
        el('span', { style: { width: `${n ? Math.max(4, (n / max) * 100) : 0}%`, background: BAND_FILL[b] } })),
      el('strong', { class: 'num right' }, String(n)));
  }));
}

/* ------------------------------------------------------------------ queue cards */
function waitingText(it) {
  const d = daysText(it.waiting_days || 0);
  if (it.queue_kind === 'matured') return t('queue.overdue', { d });
  if (it.queue_kind === 'flagged') return t('queue.open_for', { d });
  return t('queue.waiting', { d });
}

function kindBadge(kind) {
  const cls = { new: 'b-info', in_progress: 'b-violet', discrepancy: 'b-orange', flagged: 'b-danger', matured: 'b-danger' }[kind] || 'b-slate';
  return `<span class="badge ${cls}">${esc(t(`queue.kind.${kind}`, { _default: kind }))}</span>`;
}

function pointsClass(p) { return p >= 25 ? 'p-hi' : p >= 10 ? 'p-mid' : ''; }

function card(it) {
  const band = it.risk_band || 'low';
  const inst = it.institution || {};
  const place = [inst.city, inst.state].filter(Boolean).join(', ');
  const href = site(`officer/fdr.html?id=${encodeURIComponent(it.id)}`);
  const reasons = (it.top_reasons || []);
  const canPick = it.status === 'SUBMITTED';
  const canTakeOver = ['UNDER_VERIFICATION', 'DISCREPANCY'].includes(it.status) && it.picked_by && !isMine(it);

  const pickBtn = canPick ? el('button', {
    class: 'btn sm', type: 'button', html: `${icon('hourglass', 15)}<span>${esc(t('queue.pickup'))}</span>`,
    onclick: (e) => pickup(it, e.currentTarget, false),
  }) : null;
  const takeBtn = canTakeOver ? el('button', {
    class: 'btn sm secondary', type: 'button', html: `${icon('user', 15)}<span>${esc(t('queue.takeover'))}</span>`,
    onclick: (e) => pickup(it, e.currentTarget, true),
  }) : null;

  const matured = (it.days_to_maturity ?? 0) < 0;
  return el('article', { class: `card q-item band-${band}`, 'aria-label': `${it.ref_no} · ${inst.name || ''}` },
    el('div', { class: `q-score risk-${band}`, title: `${t('risk.label')}: ${it.risk_score} / 100` },
      el('span', { class: 'q-num' }, String(it.risk_score ?? 0)),
      el('span', { class: 'q-band' }, t(`risk.${band}`)),
      el('span', { class: 'q-of' }, t('queue.of100'))),
    el('div', { class: 'q-main' },
      el('div', { class: 'q-top', html: `<a class="q-ref mono" href="${esc(href)}">${esc(it.ref_no)}</a>${kindBadge(it.queue_kind)}${statusBadge(it.display_status)}${trustBadge(it.trust_level, it.flagged)}` }),
      el('div', { class: 'q-inst', html: `<strong>${esc(inst.name || '—')}</strong>${place ? ` · ${esc(place)}` : ''}${it.bank ? ` · ${esc(it.bank.name)}` : ''}` }),
      reasons.length
        ? el('ul', { class: 'q-reasons', 'aria-label': t('queue.points_title') }, reasons.map((r) => el('li', {},
          el('span', { class: `q-pts ${pointsClass(r.points)}` }, `+${r.points}`),
          el('span', {}, reasonText(r)))))
        : el('div', { class: 'q-reasons' }, el('span', { class: 'small muted' }, t('queue.no_reasons'))),
      el('div', { class: 'q-meta' },
        el('span', { html: `${icon('clock', 14)}${esc(waitingText(it))}` }),
        it.picked_by
          ? el('span', { class: isMine(it) ? 'me' : '', html: `${icon('user', 14)}${esc(isMine(it) ? t('queue.picked_you') : t('queue.picked_by', { name: it.picked_by.name }))}` })
          : el('span', { html: `${icon('user', 14)}${esc(t('queue.not_picked'))}` }),
        el('span', { html: `${icon('calendar', 14)}${esc(t(matured ? 'queue.matured_on' : 'queue.matures', { date: fmtDate(it.maturity_date) }))}` }),
        it.fdr_number ? el('span', { class: 'mono', html: `${icon('file-text', 14)}${esc(t('queue.fdr_no', { no: it.fdr_number }))}` }) : null)),
    el('div', { class: 'q-side' },
      el('div', { class: 'right' },
        el('div', { class: 'q-amount' }, fmtINR(it.amount)),
        el('div', { class: 'muted small' }, t('queue.amount'))),
      el('div', { class: 'q-actions' },
        pickBtn, takeBtn,
        el('a', { class: `btn sm ${canPick ? 'secondary' : ''}`, href, html: `<span>${esc(t('queue.review'))}</span>${icon('arrow-right', 15)}` }))));
}

function renderList(panel, kind) {
  const target = panel || listEl;
  if (!data) return;
  const items = kind === 'all' ? data.items : data.items.filter((it) => it.queue_kind === kind);
  $('#q-summary').textContent = t('queue.summary', { n: fmtNum(items.length) });
  if (!items.length) {
    const filtered = state.mine || state.q;
    if (filtered) {
      emptyState(target, {
        icon: 'search', title: t('queue.empty_filter_title'), text: t('queue.empty_filter_text'),
        action: el('button', { class: 'btn secondary sm', type: 'button', onclick: clearFilters, html: `${icon('x', 15)}<span>${esc(t('queue.clear_filters'))}</span>` }),
      });
    } else if (kind !== 'all' && data.total) {
      emptyState(target, { icon: 'check-circle', title: t('queue.empty_tab_title'), text: t('queue.empty_tab_text') });
    } else {
      emptyState(target, { icon: 'check-circle', title: t('queue.empty_title'), text: t('queue.empty_text') });
      target.firstElementChild?.classList.add('q-empty-celebrate');
    }
    return;
  }
  mount(target, items.map(card));
}

let tabCtl = null;
function renderTabs() {
  const c = data ? data.counts : {};
  const all = data ? KINDS.reduce((s, k) => s + (c[k] || 0), 0) : null;
  const defs = [{ key: 'all', label: t('queue.tab.all'), count: all }]
    .concat(KINDS.map((k) => ({ key: k, label: t(`queue.tab.${k}`), count: data ? (c[k] || 0) : null })));
  // the tab panel is the list itself: render() writes the cards into #q-list
  tabCtl = tabs(tabsEl, defs.map((d) => ({ ...d, render: () => renderList(listEl, d.key) })), {
    active: state.tab,
    onChange: (key) => { state.tab = key; setParams({ tab: key === 'all' ? '' : key }); },
  });
}

function selectTab(key) {
  state.tab = key;
  if (tabCtl) tabCtl.select(key); else renderTabs();
}

function renderAll() {
  renderKpis();
  renderMix();
  renderTabs();
}

/* ------------------------------------------------------------------ actions */
async function pickup(it, btn, takeOver) {
  if (takeOver) {
    const ok = await confirmDialog(t('queue.takeover_msg', { ref: it.ref_no, name: it.picked_by?.name || '' }), {
      title: t('queue.takeover_title'), confirmLabel: t('queue.takeover'),
    });
    if (!ok) return;
  }
  try {
    await withBusy(btn, () => api.post(`/fdrs/${it.id}/pickup`));
    toast(t(takeOver ? 'queue.takeover_ok' : 'queue.picked_ok', { ref: it.ref_no }), 'success');
    await load(true);
  } catch (err) {
    toast(err.message || String(err), 'error');
  }
}

function clearFilters() {
  state.q = '';
  state.mine = false;
  searchEl.value = '';
  mineEl.checked = false;
  load();
}

/* ------------------------------------------------------------------ data */
async function load(quiet = false) {
  const seq = ++loadSeq;
  setParams({ q: state.q, mine: state.mine ? '1' : '', sort: state.sort === 'risk' ? '' : state.sort, tab: state.tab === 'all' ? '' : state.tab });
  if (!data) { loading(listEl); renderKpis(); renderMix(); } else if (!quiet) busyEl.hidden = false;
  try {
    const res = await api.get('/queue', { sort: state.sort, mine: state.mine ? 1 : undefined, q: state.q || undefined });
    if (seq !== loadSeq) return;
    data = res;
    renderAll();
  } catch (err) {
    if (seq !== loadSeq) return;
    if (!data) {
      mount(kpisEl);
      mount(tabsEl);
      errorState(listEl, err, () => load());
    } else {
      toast(err.message || String(err), 'error');
    }
  } finally {
    if (seq === loadSeq) busyEl.hidden = true;
  }
}

searchEl.addEventListener('input', debounce(() => {
  const v = searchEl.value.trim();
  if (v === state.q) return;
  state.q = v;
  load();
}, 350));
sortEl.addEventListener('change', () => { state.sort = sortEl.value; load(); });
mineEl.addEventListener('change', () => { state.mine = mineEl.checked; load(); });

onLang(() => { staticIcons(); renderHelp(); if (data) renderAll(); });
staticIcons();
renderHelp();
load();
