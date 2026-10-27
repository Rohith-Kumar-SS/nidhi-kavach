// Officer · Audit trail: hash-chained log of every action, one-click integrity check and (admin) tamper demonstration.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang, getLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, mount, loading, errorState, renderTable, pagination, toast, withBusy, confirmDialog,
  fmtDateTime, fmtNum, getParam, setParams, debounce, copyText,
} from '../assets/js/ui.js';

extend({
  en: {
    'aud.title': 'Audit trail',
    'aud.subtitle': 'Every action, hash-chained - editing history breaks the chain',
    'aud.verify': 'Verify integrity',
    'aud.int_h': 'Chain integrity',
    'aud.int_sub': 'Each entry is sealed with SHA-256 over its content and the previous entry\'s hash',
    'aud.checking': 'Re-computing every hash in the chain…',
    'aud.ok_title': 'Audit chain intact',
    'aud.ok_text': 'All {n} entries were re-hashed and every link matches. No record has been edited, removed or reordered.',
    'aud.bad_title': 'Chain broken at entry #{id}',
    'aud.bad_text': '{n} entries were checked before the break. Entries after this point can no longer be trusted until the cause is investigated.',
    'aud.reason.edited': 'The entry\'s content no longer matches its hash - it was edited after it was recorded.',
    'aud.reason.link': 'The previous-hash link does not match - an entry was removed or reordered.',
    'aud.head': 'Chain head',
    'aud.copy': 'Copy full hash',
    'aud.copied': 'Chain head hash copied.',
    'aud.s_checked': 'Entries checked',
    'aud.s_at': 'Verified at',
    'aud.s_algo': 'Algorithm',
    'aud.verify_fail': 'The integrity check could not be completed. Please try again.',
    'aud.verified_toast_ok': 'Integrity verified: {n} entries, chain intact.',
    'aud.verified_toast_bad': 'Integrity check failed: the chain is broken at entry #{id}.',
    'aud.how_h': 'How the chain protects the record',
    'aud.how1_t': 'Every action is recorded',
    'aud.how1_d': 'Who did what, when, from where - submissions, verifications, decisions, logins.',
    'aud.how2_t': 'Each entry seals the previous one',
    'aud.how2_d': 'An entry\'s hash covers its own content plus the hash before it, forming a chain.',
    'aud.how3_t': 'Any edit is detectable',
    'aud.how3_d': 'Changing even one old word changes its hash, so the check pinpoints the broken entry.',
    'aud.tmp_h': 'Tamper demonstration (administrator)',
    'aud.tmp_text': 'Shows what happens if someone edits the database directly. "Tamper one record" rewrites the summary of one old entry without updating its hash; the integrity check then reports the exact entry. "Restore" puts the original text back and the chain verifies again. Demo mode only.',
    'aud.tmp_do': 'Tamper one record',
    'aud.tmp_restore': 'Restore',
    'aud.tmp_active': 'Tampered',
    'aud.tmp_idle': 'Not active',
    'aud.tmp_confirm': 'This will rewrite one old audit entry directly in the database without updating its hash, so the integrity check fails until you restore it. Continue?',
    'aud.tmp_confirm_title': 'Run the tamper demonstration?',
    'aud.tmp_done': 'Entry #{id} was edited without fixing its hash - the integrity check now shows the break.',
    'aud.tmp_restored': 'Entry #{id} restored - the chain verifies again.',
    'aud.tmp_state': 'Entry #{id} ({a}) is currently tampered.',
    'aud.tmp_state_short': 'Entry #{id} is currently tampered - run the check, then restore it.',
    'aud.tmp_was': 'Original',
    'aud.tmp_now': 'Now reads',
    'aud.f_search': 'Search',
    'aud.f_search_ph': 'Summary, reference or person',
    'aud.f_action': 'Action',
    'aud.f_entity': 'Record type',
    'aud.f_actor': 'Actor',
    'aud.f_from': 'From',
    'aud.f_to': 'To',
    'aud.f_nologin': 'Hide sign-ins',
    'aud.all_actions': 'All actions',
    'aud.all_entities': 'All record types',
    'aud.anyone': 'Anyone',
    'aud.me': 'Only my actions ({n})',
    'aud.clear': 'Clear filters',
    'aud.count': '{n} entries',
    'aud.count_sub': 'Newest first · click a person to see all their actions',
    'aud.c_time': 'Time',
    'aud.c_actor': 'Actor',
    'aud.c_action': 'Action',
    'aud.c_entity': 'Record',
    'aud.c_summary': 'Summary',
    'aud.c_hash': 'Hash',
    'aud.hash_title': 'Entry hash: {h}\nPrevious: {p}',
    'aud.empty': 'No audit entries match',
    'aud.empty_text': 'Try a wider date range or clear the filters.',
    'aud.role.system': 'System',
    'aud.et.fdr': 'FDR', 'aud.et.release': 'Release request', 'aud.et.bank_deposit': 'Bank deposit', 'aud.et.bank': 'Bank',
    'aud.et.institution': 'Institution', 'aud.et.user': 'User account', 'aud.et.system': 'System', 'aud.et.settings': 'Settings',
  },
  hi: {
    'aud.title': 'ऑडिट ट्रेल',
    'aud.subtitle': 'प्रत्येक कार्रवाई हैश-श्रृंखला में दर्ज - इतिहास में कोई भी बदलाव श्रृंखला तोड़ देता है',
    'aud.verify': 'अखंडता सत्यापित करें',
    'aud.int_h': 'श्रृंखला की अखंडता',
    'aud.int_sub': 'प्रत्येक प्रविष्टि उसकी सामग्री और पिछली प्रविष्टि के हैश पर SHA-256 से मुहरबंद है',
    'aud.checking': 'श्रृंखला के सभी हैश दोबारा गणना किए जा रहे हैं…',
    'aud.ok_title': 'ऑडिट श्रृंखला अखंड है',
    'aud.ok_text': 'सभी {n} प्रविष्टियों का पुनः हैश किया गया और हर कड़ी मेल खाती है। कोई भी अभिलेख संपादित, हटाया या पुनर्व्यवस्थित नहीं किया गया है।',
    'aud.bad_title': 'प्रविष्टि #{id} पर श्रृंखला टूटी है',
    'aud.bad_text': 'टूटने से पहले {n} प्रविष्टियाँ जाँची गईं। कारण की जाँच होने तक इसके बाद की प्रविष्टियों पर भरोसा नहीं किया जा सकता।',
    'aud.reason.edited': 'प्रविष्टि की सामग्री उसके हैश से मेल नहीं खाती - दर्ज होने के बाद इसे संपादित किया गया।',
    'aud.reason.link': 'पिछले हैश की कड़ी मेल नहीं खाती - कोई प्रविष्टि हटाई या पुनर्व्यवस्थित की गई।',
    'aud.head': 'श्रृंखला शीर्ष',
    'aud.copy': 'पूरा हैश कॉपी करें',
    'aud.copied': 'श्रृंखला शीर्ष हैश कॉपी किया गया।',
    'aud.s_checked': 'जाँची गई प्रविष्टियाँ',
    'aud.s_at': 'सत्यापन समय',
    'aud.s_algo': 'एल्गोरिद्म',
    'aud.verify_fail': 'अखंडता जाँच पूरी नहीं हो सकी। कृपया पुनः प्रयास करें।',
    'aud.verified_toast_ok': 'अखंडता सत्यापित: {n} प्रविष्टियाँ, श्रृंखला अखंड।',
    'aud.verified_toast_bad': 'अखंडता जाँच विफल: प्रविष्टि #{id} पर श्रृंखला टूटी है।',
    'aud.how_h': 'श्रृंखला अभिलेख की रक्षा कैसे करती है',
    'aud.how1_t': 'हर कार्रवाई दर्ज होती है',
    'aud.how1_d': 'किसने, क्या, कब और कहाँ से किया - प्रस्तुति, सत्यापन, निर्णय, लॉगिन।',
    'aud.how2_t': 'हर प्रविष्टि पिछली को मुहरबंद करती है',
    'aud.how2_d': 'प्रविष्टि का हैश उसकी अपनी सामग्री और पिछले हैश दोनों को समाहित करता है, जिससे श्रृंखला बनती है।',
    'aud.how3_t': 'कोई भी बदलाव पकड़ में आता है',
    'aud.how3_d': 'किसी पुरानी प्रविष्टि का एक शब्द बदलने से भी उसका हैश बदल जाता है, और जाँच ठीक उसी प्रविष्टि को इंगित करती है।',
    'aud.tmp_h': 'छेड़छाड़ प्रदर्शन (प्रशासक)',
    'aud.tmp_text': 'दिखाता है कि डेटाबेस में सीधे बदलाव करने पर क्या होता है। "एक अभिलेख से छेड़छाड़ करें" किसी पुरानी प्रविष्टि का सारांश उसका हैश बदले बिना बदल देता है; तब अखंडता जाँच ठीक उसी प्रविष्टि को बताती है। "पुनर्स्थापित करें" मूल पाठ वापस लाता है और श्रृंखला फिर से सत्यापित होती है। केवल डेमो मोड में।',
    'aud.tmp_do': 'एक अभिलेख से छेड़छाड़ करें',
    'aud.tmp_restore': 'पुनर्स्थापित करें',
    'aud.tmp_active': 'छेड़छाड़ सक्रिय',
    'aud.tmp_idle': 'निष्क्रिय',
    'aud.tmp_confirm': 'यह एक पुरानी ऑडिट प्रविष्टि को उसका हैश बदले बिना सीधे डेटाबेस में बदल देगा, इसलिए पुनर्स्थापित करने तक अखंडता जाँच विफल रहेगी। जारी रखें?',
    'aud.tmp_confirm_title': 'छेड़छाड़ प्रदर्शन चलाएँ?',
    'aud.tmp_done': 'प्रविष्टि #{id} को हैश ठीक किए बिना बदला गया - अखंडता जाँच अब टूट दिखा रही है।',
    'aud.tmp_restored': 'प्रविष्टि #{id} पुनर्स्थापित - श्रृंखला फिर से सत्यापित होती है।',
    'aud.tmp_state': 'प्रविष्टि #{id} ({a}) में अभी छेड़छाड़ की गई है।',
    'aud.tmp_state_short': 'प्रविष्टि #{id} में अभी छेड़छाड़ की गई है - जाँच चलाएँ, फिर उसे पुनर्स्थापित करें।',
    'aud.tmp_was': 'मूल',
    'aud.tmp_now': 'अब',
    'aud.f_search': 'खोजें',
    'aud.f_search_ph': 'सारांश, संदर्भ या व्यक्ति',
    'aud.f_action': 'कार्रवाई',
    'aud.f_entity': 'अभिलेख प्रकार',
    'aud.f_actor': 'कर्ता',
    'aud.f_from': 'से',
    'aud.f_to': 'तक',
    'aud.f_nologin': 'साइन-इन छिपाएँ',
    'aud.all_actions': 'सभी कार्रवाइयाँ',
    'aud.all_entities': 'सभी अभिलेख प्रकार',
    'aud.anyone': 'कोई भी',
    'aud.me': 'केवल मेरी कार्रवाइयाँ ({n})',
    'aud.clear': 'फ़िल्टर हटाएँ',
    'aud.count': '{n} प्रविष्टियाँ',
    'aud.count_sub': 'नवीनतम पहले · किसी व्यक्ति की सभी कार्रवाइयाँ देखने के लिए उसके नाम पर क्लिक करें',
    'aud.c_time': 'समय',
    'aud.c_actor': 'कर्ता',
    'aud.c_action': 'कार्रवाई',
    'aud.c_entity': 'अभिलेख',
    'aud.c_summary': 'सारांश',
    'aud.c_hash': 'हैश',
    'aud.hash_title': 'प्रविष्टि हैश: {h}\nपिछला: {p}',
    'aud.empty': 'कोई ऑडिट प्रविष्टि नहीं मिली',
    'aud.empty_text': 'व्यापक तिथि सीमा आज़माएँ या फ़िल्टर हटाएँ।',
    'aud.role.system': 'सिस्टम',
    'aud.et.fdr': 'एफडीआर', 'aud.et.release': 'रिलीज़ अनुरोध', 'aud.et.bank_deposit': 'बैंक जमा', 'aud.et.bank': 'बैंक',
    'aud.et.institution': 'संस्थान', 'aud.et.user': 'उपयोगकर्ता खाता', 'aud.et.system': 'सिस्टम', 'aud.et.settings': 'सेटिंग्स',
  },
});

// Hindi labels for action codes; English labels are derived from the code itself.
const ACTION_HI = {
  BANK_CHECK_FAILED: 'बैंक जाँच विफल', BANK_DEPOSIT_ISSUED: 'बैंक जमा जारी', BANK_EVENT: 'बैंक घटना', BANK_KEY_REGISTERED: 'बैंक कुंजी पंजीकृत',
  BANK_VERIFIED: 'बैंक द्वारा सत्यापित', DAILY_JOB: 'दैनिक कार्य', DEMO_SEEDED: 'डेमो डेटा तैयार', DISCREPANCY_RAISED: 'विसंगति दर्ज',
  DISCREPANCY_RESOLVED: 'विसंगति हल', DISCREPANCY_RESPONDED: 'विसंगति का उत्तर', DISCREPANCY_WAIVED: 'विसंगति माफ़', DOCUMENT_UPLOADED: 'दस्तावेज़ अपलोड',
  FDR_ACCEPTED: 'एफडीआर स्वीकृत', FDR_INVOKED: 'एफडीआर भुनाई गई', FDR_PICKED: 'एफडीआर जाँच हेतु ली गई', FDR_REJECTED: 'एफडीआर अस्वीकृत',
  FDR_RENEWED: 'एफडीआर नवीनीकृत', FDR_RETURNED: 'एफडीआर लौटाई गई', FDR_STATUS_CHANGED: 'एफडीआर स्थिति बदली', FDR_SUBMITTED: 'एफडीआर प्रस्तुत',
  FDR_UPDATED: 'एफडीआर अद्यतन', LOGIN: 'साइन इन', NOC_ISSUED: 'एनओसी जारी', OBSERVATION_ADDED: 'टिप्पणी जोड़ी', QR_CHECK_FAILED: 'क्यूआर जाँच विफल',
  QR_VERIFIED: 'क्यूआर सत्यापित', RELEASE_APPROVE: 'रिलीज़ अनुमोदित', RELEASE_RECOMMEND: 'रिलीज़ की संस्तुति', RELEASE_RELEASE: 'राशि रिलीज़',
  RELEASE_REQUESTED: 'रिलीज़ का अनुरोध', RELEASE_RESUBMIT: 'रिलीज़ पुनः प्रस्तुत', RELEASE_RETURN: 'रिलीज़ लौटाया', RELEASE_REJECT: 'रिलीज़ अस्वीकृत',
  RELEASE_START_SCRUTINY: 'रिलीज़ जाँच आरंभ', RENEWAL_SUBMITTED: 'नवीनीकरण प्रस्तुत', AUDIT_TAMPER_DEMO: 'छेड़छाड़ प्रदर्शन',
  AUDIT_TAMPER_RESTORED: 'छेड़छाड़ प्रदर्शन पुनर्स्थापित', USER_CREATED: 'उपयोगकर्ता बनाया', USER_UPDATED: 'उपयोगकर्ता अद्यतन', SETTINGS_UPDATED: 'सेटिंग्स अद्यतन',
  CLOCK_CHANGED: 'डेमो घड़ी बदली', DEMO_RESET: 'डेमो रीसेट',
};
const ACTION_EN = {
  RELEASE_APPROVE: 'Release approved', RELEASE_RECOMMEND: 'Release recommended', RELEASE_RELEASE: 'Deposit released',
  RELEASE_RETURN: 'Release returned', RELEASE_RESUBMIT: 'Release resubmitted', RELEASE_START_SCRUTINY: 'Release scrutiny started',
  RELEASE_REJECT: 'Release rejected', FDR_PICKED: 'FDR picked up', LOGIN: 'Signed in', DEMO_SEEDED: 'Demo data seeded',
  AUDIT_TAMPER_DEMO: 'Tamper demonstration', AUDIT_TAMPER_RESTORED: 'Tamper demonstration restored',
};
const ACRONYMS = { FDR: 'FDR', QR: 'QR', NOC: 'NOC' };
function actionLabel(code) {
  if (getLang() === 'hi' && ACTION_HI[code]) return ACTION_HI[code];
  if (getLang() !== 'hi' && ACTION_EN[code]) return ACTION_EN[code];
  const words = String(code || '').split('_').map((w) => ACRONYMS[w] || w.toLowerCase());
  const s = words.join(' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function actionTone(code) {
  if (/FAILED|REJECT|INVOKED|TAMPER/.test(code)) return 'b-danger';
  if (/^DISCREPANCY/.test(code)) return 'b-orange';
  if (/VERIFIED|ACCEPTED|APPROVE|RELEASE_RELEASE|NOC_ISSUED|RESOLVED|RENEWED/.test(code)) return 'b-success';
  if (/^RELEASE/.test(code)) return 'b-primary';
  if (/^BANK/.test(code)) return 'b-teal';
  if (/^(LOGIN|DAILY_JOB|DEMO|CLOCK|SETTINGS|USER)/.test(code)) return 'b-slate';
  return 'b-info';
}
const ROLE_TONE = { officer: 'b-primary', authority: 'b-violet', admin: 'b-saffron', institution: 'b-teal', bank: 'b-info', system: 'b-slate' };
const roleBadge = (r) => `<span class="badge ${ROLE_TONE[r] || 'b-slate'}">${esc(r === 'system' ? t('aud.role.system') : t(`role.${r}`, { _default: r || '—' }))}</span>`;
const ENTITY_TYPES = ['fdr', 'release', 'bank_deposit', 'bank', 'institution', 'user', 'system'];
const shortHash = (h) => (h ? `${h.slice(0, 12)}…${h.slice(-8)}` : '—');
const PAGE_SIZE = 50;

const verifyBtn = () => el('button', {
  class: 'btn', type: 'button', id: 'verify-btn',
  html: `${icon('shield-check', 16)}<span>${esc(t('aud.verify'))}</span>`,
  onclick: (e) => verify(e.currentTarget, true),
});

const { user } = await initPage({
  roles: ['officer', 'authority', 'admin'],
  active: 'audit',
  title: 'aud.title',
  subtitle: 'aud.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'officer/dashboard.html' }, { label: 'aud.title' }],
  actions: verifyBtn,
});
const isAdmin = user && user.role === 'admin';

const listEl = $('#list');
const pagerEl = $('#pager');
const fq = $('#f-q');
const fAction = $('#f-action');
const fEntity = $('#f-entity');
const fActor = $('#f-actor');
const fFrom = $('#f-from');
const fTo = $('#f-to');
const fNoLogin = $('#f-nologin');
const f = {
  q: getParam('q') || '',
  action: getParam('action') || '',
  entity_type: getParam('entity_type') || '',
  actor_id: getParam('actor_id') || '',
  date_from: getParam('date_from') || '',
  date_to: getParam('date_to') || '',
  nologin: getParam('logins') !== '1',
  page: Math.max(1, parseInt(getParam('page') || '1', 10) || 1),
};
let actions = [];
let actors = [];            // admin only: [{id, name, role}]
let last = null;            // last list response
let verifyRes = null;       // last verify response
let verifyErr = null;
let tamperInfo = null;      // details of the last tamper run in this session
let seq = 0;

$('#f-q-icon').outerHTML = icon('search', 17);

/* ---------------------------------------------------------------- integrity */
function reasonText(r) {
  if (!r) return '';
  if (/edited|content does not match/i.test(r)) return t('aud.reason.edited');
  if (/link|removed|reordered/i.test(r)) return t('aud.reason.link');
  return r;
}

function renderIntegrity() {
  $('#int-h').innerHTML = `${icon('link', 18)} ${esc(t('aud.int_h'))}`;
  $('#int-sub').textContent = t('aud.int_sub');
  const box = $('#integrity');
  if (verifyErr) { errorState(box, verifyErr, () => verify(null, false)); return; }
  const v = verifyRes;
  if (!v) { loading(box, t('aud.checking')); return; }
  const banner = v.ok
    ? el('div', { class: 'alert success', html: `${icon('shield-check', 20)}<div><div class="a-title">${esc(t('aud.ok_title'))}</div>${esc(t('aud.ok_text', { n: fmtNum(v.checked) }))}</div>` })
    : el('div', { class: 'alert danger', html: `${icon('shield-alert', 20)}<div><div class="a-title">${esc(t('aud.bad_title', { id: v.broken_at }))}</div><div>${esc(reasonText(v.reason))}</div><div class="small" style="margin-top:4px">${esc(t('aud.bad_text', { n: fmtNum(v.checked) }))}</div></div>` });
  const copyBtn = el('button', {
    class: 'btn sm ghost', type: 'button', title: t('aud.copy'), 'aria-label': t('aud.copy'), html: `${icon('copy', 15)}<span>${esc(t('aud.copy'))}</span>`,
    onclick: async () => { await copyText(v.head_hash); toast(t('aud.copied'), 'success'); },
  });
  mount(box,
    banner,
    el('div', { class: 'aud-head-hash' },
      el('span', { class: 'muted', style: { fontWeight: 600 } }, `${t('aud.head')}:`),
      el('code', { title: v.head_hash }, shortHash(v.head_hash)),
      v.head_hash ? copyBtn : null),
    el('div', { class: 'aud-stats' },
      el('div', { class: 'aud-stat' }, el('div', { class: 'l' }, t('aud.s_checked')), el('div', { class: 'v' }, fmtNum(v.checked))),
      el('div', { class: 'aud-stat' }, el('div', { class: 'l' }, t('aud.s_at')), el('div', { class: 'v' }, fmtDateTime(v.verified_at))),
      el('div', { class: 'aud-stat' }, el('div', { class: 'l' }, t('aud.s_algo')), el('div', { class: 'v' }, 'SHA-256'))));
}

function applyVerify(v) {
  verifyRes = v;
  verifyErr = null;
  renderIntegrity();
  renderTamper();
  if (last) renderList();
}

async function verify(btn, announce) {
  const run = async () => {
    try {
      applyVerify(await api.get('/audit/verify'));
      if (announce) toast(verifyRes.ok ? t('aud.verified_toast_ok', { n: fmtNum(verifyRes.checked) }) : t('aud.verified_toast_bad', { id: verifyRes.broken_at }), verifyRes.ok ? 'success' : 'error');
    } catch (err) {
      verifyErr = err;
      renderIntegrity();
      if (announce) toast(t('aud.verify_fail'), 'error');
    }
  };
  if (!verifyRes) renderIntegrity();
  return btn ? withBusy(btn, run) : run();
}

function renderHow() {
  $('#how-h').innerHTML = `${icon('help', 18)} ${esc(t('aud.how_h'))}`;
  mount($('#how'), [1, 2, 3].map((n) => el('div', { class: 'aud-step' },
    el('span', { class: 'n', 'aria-hidden': 'true' }, String(n)),
    el('div', {}, el('div', { class: 't' }, t(`aud.how${n}_t`)), el('div', { class: 'd' }, t(`aud.how${n}_d`))))));
}

/* ---------------------------------------------------------------- tamper demo (admin) */
function renderTamper() {
  const card = $('#tamper');
  if (!isAdmin) { card.hidden = true; return; }
  card.hidden = false;
  const active = !!(verifyRes && verifyRes.tamper_demo && verifyRes.tamper_demo.active);
  $('#tmp-h').innerHTML = `${icon('flag', 18)} ${esc(t('aud.tmp_h'))}`;
  $('#tmp-badge').innerHTML = active ? `<span class="badge b-danger"><span class="dot"></span>${esc(t('aud.tmp_active'))}</span>` : `<span class="badge b-slate">${esc(t('aud.tmp_idle'))}</span>`;
  const doBtn = el('button', { class: 'btn outline-danger', type: 'button', disabled: active || !verifyRes, html: `${icon('edit', 16)}<span>${esc(t('aud.tmp_do'))}</span>` });
  const resBtn = el('button', { class: 'btn success', type: 'button', disabled: !active, html: `${icon('refresh', 16)}<span>${esc(t('aud.tmp_restore'))}</span>` });
  doBtn.addEventListener('click', async () => {
    const ok = await confirmDialog(t('aud.tmp_confirm'), { title: t('aud.tmp_confirm_title'), confirmLabel: t('aud.tmp_do'), variant: 'danger' });
    if (!ok) return;
    await withBusy(doBtn, async () => {
      try {
        const r = await api.post('/audit/tamper-demo');
        tamperInfo = r;
        toast(t('aud.tmp_done', { id: r.entry_id }), 'warning');
        applyVerify(r.verify);
        loadList();
      } catch (err) { toast(err.message || t('common.error'), 'error'); verify(null, false); }
    });
  });
  resBtn.addEventListener('click', () => withBusy(resBtn, async () => {
    try {
      const r = await api.post('/audit/tamper-demo/restore');
      tamperInfo = null;
      toast(t('aud.tmp_restored', { id: r.entry_id }), 'success');
      applyVerify(r.verify);
      loadList();
    } catch (err) { toast(err.message || t('common.error'), 'error'); verify(null, false); }
  }));
  const stateLine = active ? el('div', { class: 'aud-tamper-state' },
    el('div', { style: { fontWeight: 600 } }, tamperInfo ? t('aud.tmp_state', { id: verifyRes.tamper_demo.entry_id, a: actionLabel(tamperInfo.action) }) : t('aud.tmp_state_short', { id: verifyRes.tamper_demo.entry_id })),
    tamperInfo ? el('div', { class: 'small', style: { marginTop: '4px' } }, `${t('aud.tmp_was')}: `, el('span', { class: 'was' }, tamperInfo.original_summary)) : null,
    tamperInfo ? el('div', { class: 'small' }, `${t('aud.tmp_now')}: `, el('strong', {}, tamperInfo.tampered_summary)) : null) : null;
  mount($('#tamper-body'),
    el('p', { class: 'text-2', style: { marginTop: 0, maxWidth: '900px' } }, t('aud.tmp_text')),
    el('div', { class: 'row' }, doBtn, resBtn),
    stateLine);
}

/* ---------------------------------------------------------------- filters */
function fillFilters() {
  const acts = [...new Set([...actions, f.action].filter(Boolean))];
  mount(fAction, el('option', { value: '' }, t('aud.all_actions')),
    acts.map((a) => ({ a, l: actionLabel(a) })).sort((x, y) => x.l.localeCompare(y.l, getLang())).map(({ a, l }) => el('option', { value: a }, l)));
  mount(fEntity, el('option', { value: '' }, t('aud.all_entities')), ENTITY_TYPES.map((e) => el('option', { value: e }, t(`aud.et.${e}`))));
  const actorOpts = [el('option', { value: '' }, t('aud.anyone'))];
  if (user) actorOpts.push(el('option', { value: String(user.id) }, t('aud.me', { n: user.name })));
  actors.filter((a) => !user || a.id !== user.id).forEach((a) => actorOpts.push(el('option', { value: String(a.id) }, `${a.name} · ${a.role === 'system' ? t('aud.role.system') : t(`role.${a.role}`, { _default: a.role })}`)));
  if (f.actor_id && !actorOpts.some((o) => o.value === f.actor_id)) actorOpts.push(el('option', { value: f.actor_id }, `#${f.actor_id}`));
  mount(fActor, actorOpts);
  fAction.value = f.action;
  fEntity.value = f.entity_type;
  fActor.value = f.actor_id;
  fFrom.value = f.date_from;
  fTo.value = f.date_to;
  fq.value = f.q;
  fNoLogin.checked = f.nologin;
  fNoLogin.disabled = !!f.action;
  $('#f-clear').innerHTML = `${icon('x', 15)} ${esc(t('aud.clear'))}`;
}

function syncUrl() {
  setParams({ q: f.q, action: f.action, entity_type: f.entity_type, actor_id: f.actor_id, date_from: f.date_from, date_to: f.date_to, logins: f.nologin ? '' : '1', page: f.page > 1 ? f.page : '' });
}

/* ---------------------------------------------------------------- table */
function entityCell(r) {
  const label = esc(t(`aud.et.${r.entity_type}`, { _default: r.entity_type || '' }));
  const ref = r.entity_ref || (r.entity_id ? `#${r.entity_id}` : '');
  let main = `<span class="mono small">${esc(ref)}</span>`;
  if (r.entity_type === 'fdr' && r.entity_id) main = `<a class="mono small" href="${esc(site(`officer/fdr.html?id=${r.entity_id}`))}">${esc(ref)}</a>`;
  if (r.entity_type === 'release' && r.entity_id) main = `<a class="mono small" href="${esc(site(`officer/release.html?id=${r.entity_id}`))}">${esc(ref)}</a>`;
  return `<div class="nowrap">${main}</div><div class="cell-sub">${label}</div>`;
}

const columns = () => [
  { key: 'at', label: t('aud.c_time'), render: (r) => `<span class="nowrap small">${esc(fmtDateTime(r.at))}</span>` },
  {
    key: 'actor_name', label: t('aud.c_actor'),
    render: (r) => {
      const name = r.actor_name || t('aud.role.system');
      const btn = el('button', { class: 'aud-actor-btn', type: 'button', title: t('aud.f_search'), dataset: { actor: name } }, name);
      return el('div', { class: 'aud-actor' }, btn, el('div', { html: roleBadge(r.actor_role) }));
    },
  },
  { key: 'action', label: t('aud.c_action'), render: (r) => `<span class="badge ${actionTone(r.action)}" title="${esc(r.action)}">${esc(actionLabel(r.action))}</span>` },
  { key: 'entity_ref', label: t('aud.c_entity'), render: entityCell },
  { key: 'summary', label: t('aud.c_summary'), render: (r) => `<div class="aud-sum">${esc(r.summary || '')}</div>` },
  {
    key: 'hash', label: t('aud.c_hash'),
    render: (r) => `<span class="aud-hash" tabindex="0" title="${esc(t('aud.hash_title', { h: r.hash || '—', p: r.prev_hash || '—' }))}">${esc((r.hash || '').slice(0, 10) || '—')}</span>`,
  },
];

function renderList() {
  const d = last;
  if (!d) return;
  $('#list-title').innerHTML = `${icon('history', 18)} ${esc(t('aud.count', { n: fmtNum(d.total) }))}`;
  $('#list-sub').textContent = t('aud.count_sub');
  const broken = verifyRes && !verifyRes.ok ? verifyRes.broken_at : null;
  renderTable(listEl, {
    columns: columns(),
    rows: d.items,
    rowClass: (r) => (broken && r.id === broken ? 'row-danger' : ''),
    empty: { icon: 'history', title: t('aud.empty'), text: t('aud.empty_text') },
  });
  if (d.items.length) {
    pagination(pagerEl, { page: f.page, pageSize: PAGE_SIZE, total: d.total, onChange: (p) => { f.page = p; syncUrl(); loadList(); listEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
  } else mount(pagerEl);
}

async function loadList() {
  const my = ++seq;
  loading(listEl);
  mount(pagerEl);
  try {
    // "Hide sign-ins" = ask for every other action (the API filters by an action list)
    if (!f.action && f.nologin && !actions.length) { actions = (await api.get('/audit', { page_size: 1 })).actions || []; fillFilters(); }
    const actionParam = f.action || (f.nologin && actions.length ? actions.filter((a) => a !== 'LOGIN').join(',') : undefined);
    const d = await api.get('/audit', {
      q: f.q || undefined, action: actionParam, entity_type: f.entity_type || undefined, actor_id: f.actor_id || undefined,
      date_from: f.date_from || undefined, date_to: f.date_to || undefined, page: f.page, page_size: PAGE_SIZE,
    });
    if (my !== seq) return;
    if (!d.items.length && d.total && f.page > 1) { f.page = 1; syncUrl(); loadList(); return; }
    last = d;
    if (d.actions && d.actions.join() !== actions.join()) { actions = d.actions; fillFilters(); }
    renderList();
  } catch (err) {
    if (my !== seq) return;
    errorState(listEl, err, loadList);
  }
}

async function loadActors() {
  if (!isAdmin) return;
  try {
    const r = await api.get('/admin/users', { page_size: 200 });
    const items = Array.isArray(r) ? r : (r.items || []);
    actors = items.map((u) => ({ id: u.id, name: u.name, role: u.role })).sort((a, b) => a.name.localeCompare(b.name));
    fillFilters();
  } catch { /* the actor list is optional; "Anyone" / "Only me" still work */ }
}

/* ---------------------------------------------------------------- events */
const changed = () => { f.page = 1; syncUrl(); loadList(); };
fq.addEventListener('input', debounce(() => { f.q = fq.value.trim(); changed(); }, 350));
fAction.addEventListener('change', () => { f.action = fAction.value; fNoLogin.disabled = !!f.action; changed(); });
fNoLogin.addEventListener('change', () => { f.nologin = fNoLogin.checked; changed(); });
fEntity.addEventListener('change', () => { f.entity_type = fEntity.value; changed(); });
fActor.addEventListener('change', () => { f.actor_id = fActor.value; changed(); });
fFrom.addEventListener('change', () => { f.date_from = fFrom.value; changed(); });
fTo.addEventListener('change', () => { f.date_to = fTo.value; changed(); });
$('#f-clear').addEventListener('click', () => {
  Object.assign(f, { q: '', action: '', entity_type: '', actor_id: '', date_from: '', date_to: '', nologin: true, page: 1 });
  fillFilters();
  changed();
});
listEl.addEventListener('click', (e) => {
  const b = e.target.closest('[data-actor]');
  if (!b) return;
  f.q = b.dataset.actor; fq.value = f.q; changed();
});

onLang(() => { fillFilters(); renderHow(); renderIntegrity(); renderTamper(); renderList(); });
fillFilters();
renderHow();
renderTamper();
verify(null, false);
loadList();
loadActors();
