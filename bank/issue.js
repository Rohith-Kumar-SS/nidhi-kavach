// Bank: issue a fixed deposit with lien to AICTE (mock bank's side - a simulation of the bank's core-banking system).
// Form -> POST /api/bank/deposits -> success panel with signed QR, inline specimen receipt and a forged copy for the fraud demo.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang } from '../assets/js/i18n.js';
import {
  $, $$, el, esc, icon, fmtINR, fmtINRShort, fmtDate, fmtNum, loading, errorState, mount, toast, withBusy,
  dl, timeline, debounce, getParam, setParams,
} from '../assets/js/ui.js';

extend({
  en: {
    'issue.title': 'Issue a fixed deposit with lien to AICTE',
    'issue.subtitle': 'Open a deposit for an AICTE-approved institution and print a receipt whose QR code is signed with your bank’s key',
    'issue.crumb_bank': 'Bank portal (simulated)',
    'issue.sim_title': 'Simulation of a bank’s systems',
    'issue.sim_text': 'In real life this step happens inside {bank}’s core-banking system. It is simulated here so that a genuine, signed receipt can be produced for the demonstration. No money moves.',
    'issue.form_title': 'Deposit details',
    'issue.form_sub': 'Fields marked * are required. The receipt is signed the moment you issue it.',
    'issue.inst': 'Depositor institution',
    'issue.inst_ph': 'Type an AICTE ID or institution name',
    'issue.inst_hint': 'Search by AICTE ID (e.g. 1-44120987) or part of the name, then pick from the list.',
    'issue.inst_searching': 'Searching…',
    'issue.inst_none': 'No AICTE-approved institution matches “{q}”.',
    'issue.inst_more': 'Type at least 2 characters.',
    'issue.inst_failed': 'Search failed. Please try again.',
    'issue.inst_required': 'Choose the depositor institution from the list.',
    'issue.change': 'Change',
    'issue.holder': 'Name of the deposit holder',
    'issue.holder_hint': 'Optional. Defaults to the trust or society that runs the institution.',
    'issue.amount': 'Deposit amount (₹)',
    'issue.amount_hint': 'Enter the amount in rupees, e.g. 5000000 for ₹50 lakh.',
    'issue.amount_words': '{inr} · {short}',
    'issue.amount_required': 'Enter an amount between ₹1,000 and ₹100 crore.',
    'issue.tenure': 'Tenure',
    'issue.tenure_hint': 'AICTE expects the deposit to cover the approval period.',
    'issue.months': '{n} months',
    'issue.years': '{n} years',
    'issue.year1': '1 year',
    'issue.rate': 'Interest rate (% per annum)',
    'issue.rate_invalid': 'Interest rate must be more than 0% and at most 15%.',
    'issue.date': 'Issue date',
    'issue.date_hint': 'Demo date today: {d}. Back-dating is allowed; future dates are not.',
    'issue.date_future': 'A receipt cannot be dated in the future.',
    'issue.branch': 'Issuing branch',
    'issue.branch_ph': 'e.g. Fort, Mumbai',
    'issue.branch_hint': 'Optional. An IFSC is generated for the branch.',
    'issue.lien': 'Mark a lien in favour of the Member Secretary, AICTE',
    'issue.lien_text': 'With a lien the deposit cannot be withdrawn, pledged elsewhere or closed early without AICTE’s consent. Untick only to show how the portal flags a deposit without lien.',
    'issue.submit': 'Issue deposit & sign receipt',
    'issue.preview': 'Deposit preview',
    'issue.p_inst': 'Depositor',
    'issue.p_principal': 'Principal',
    'issue.p_tenure': 'Tenure',
    'issue.p_rate': 'Interest',
    'issue.p_maturity': 'Matures on',
    'issue.p_value': 'Maturity value (approx.)',
    'issue.p_value_note': 'Indicative, compounded quarterly. AICTE’s lien covers the whole deposit.',
    'issue.p_lien': 'Lien',
    'issue.pa': '{r}% per annum',
    'issue.p_none': 'Not chosen yet',
    'issue.signing': 'Signed with your bank key',
    'issue.key_text': 'Receipts you issue carry a QR signed with key {key}. AICTE’s portal verifies it with the public key registered for {bank}.',
    'issue.key_id': 'Key ID',
    'issue.key_fp': 'Fingerprint',
    'issue.next': 'What happens next',
    'issue.n1': 'Receipt printed with a signed QR',
    'issue.n1b': 'Hand the receipt to the institution.',
    'issue.n2': 'Institution submits it on AICTE’s portal',
    'issue.n2b': 'The QR is read automatically and the signature checked.',
    'issue.n3': 'AICTE confirms with your bank',
    'issue.n3b': 'Each check appears on your dashboard as a verification request.',
    'issue.n4': 'Nightly re-checks',
    'issue.n4b': 'If the lien is removed or the deposit pre-closed, AICTE is alerted.',
    'issue.issued': 'Deposit {n} issued',
    'issue.issued_toast': 'Deposit {n} issued and its receipt signed.',
    'issue.issued_sub': 'The receipt below carries a QR signed with key {key}. Give it to {inst} to submit on AICTE’s portal.',
    'issue.loaded': 'Receipt for deposit {n}',
    'issue.d_fdr': 'FDR number',
    'issue.d_holder': 'Deposit holder',
    'issue.d_inst': 'Institution',
    'issue.d_branch': 'Branch / IFSC',
    'issue.d_amount': 'Amount',
    'issue.d_rate': 'Interest rate',
    'issue.d_tenure': 'Tenure',
    'issue.d_issue': 'Issue date',
    'issue.d_maturity': 'Maturity date',
    'issue.d_value': 'Maturity value (approx.)',
    'issue.d_lien': 'Lien',
    'issue.d_lien_to': 'In favour of {who}',
    'issue.d_status': 'Ledger status',
    'issue.d_portal': 'On AICTE portal',
    'issue.d_not_submitted': 'Not submitted yet',
    'issue.qr_title': 'Signed QR code',
    'issue.qr_alt': 'QR code signed by the bank for deposit {n}',
    'issue.qr_text': 'Scan it on the public Verify page: the signature, amount and dates are checked against the bank’s public key.',
    'issue.qr_failed': 'The QR preview could not be loaded.',
    'issue.cert_title': 'Specimen receipt (PDF)',
    'issue.cert_frame': 'Specimen receipt for deposit {n}',
    'issue.download': 'Download receipt',
    'issue.open_verify': 'Verify this receipt',
    'issue.another': 'Issue another deposit',
    'issue.to_ledger': 'Open deposit ledger',
    'issue.fraud_title': 'Fraud-testing (demo only)',
    'issue.fraud_text': 'Download a copy of this receipt whose printed amount has been changed to {amt} after signing, the way a forger would edit a PDF. Upload it on AICTE’s portal to see the forgery caught: the signed QR still says {real}.',
    'issue.fraud_btn': 'Download a forged copy',
    'issue.fraud_warn': 'For demonstrating forgery detection only. The file is watermarked as a forged demo copy.',
    'issue.forged_toast': 'Forged demo copy downloading - use it only to demonstrate forgery detection.',
    'issue.lien_on': 'Lien marked',
    'issue.lien_off': 'No lien',
    'issue.st.active': 'Active',
    'issue.st.matured': 'Matured',
    'issue.st.renewed': 'Renewed',
    'issue.st.closed': 'Pre-closed',
    'issue.not_found': 'This deposit was not found in your ledger.',
  },
  hi: {
    'issue.title': 'एआईसीटीई के पक्ष में ग्रहणाधिकार सहित सावधि जमा जारी करें',
    'issue.subtitle': 'एआईसीटीई-अनुमोदित संस्थान के लिए जमा खोलें और ऐसी रसीद प्रिंट करें जिसका क्यूआर कोड आपके बैंक की कुंजी से हस्ताक्षरित हो',
    'issue.crumb_bank': 'बैंक पोर्टल (अनुकरण)',
    'issue.sim_title': 'बैंक प्रणाली का अनुकरण',
    'issue.sim_text': 'वास्तविक रूप में यह चरण {bank} की कोर-बैंकिंग प्रणाली में होता है। प्रदर्शन हेतु वास्तविक, हस्ताक्षरित रसीद तैयार करने के लिए इसका यहाँ अनुकरण किया गया है। कोई धनराशि स्थानांतरित नहीं होती।',
    'issue.form_title': 'जमा का विवरण',
    'issue.form_sub': '* चिह्नित फ़ील्ड अनिवार्य हैं। जारी करते ही रसीद पर हस्ताक्षर हो जाते हैं।',
    'issue.inst': 'जमाकर्ता संस्थान',
    'issue.inst_ph': 'एआईसीटीई आईडी या संस्थान का नाम लिखें',
    'issue.inst_hint': 'एआईसीटीई आईडी (जैसे 1-44120987) या नाम के किसी भाग से खोजें, फिर सूची से चुनें।',
    'issue.inst_searching': 'खोज जारी है…',
    'issue.inst_none': '“{q}” से मेल खाता कोई एआईसीटीई-अनुमोदित संस्थान नहीं मिला।',
    'issue.inst_more': 'कम से कम 2 अक्षर लिखें।',
    'issue.inst_failed': 'खोज विफल रही। कृपया पुनः प्रयास करें।',
    'issue.inst_required': 'सूची से जमाकर्ता संस्थान चुनें।',
    'issue.change': 'बदलें',
    'issue.holder': 'जमाधारक का नाम',
    'issue.holder_hint': 'वैकल्पिक। डिफ़ॉल्ट रूप से संस्थान का संचालन करने वाला न्यास या सोसाइटी।',
    'issue.amount': 'जमा राशि (₹)',
    'issue.amount_hint': 'राशि रुपये में लिखें, जैसे ₹50 लाख के लिए 5000000।',
    'issue.amount_words': '{inr} · {short}',
    'issue.amount_required': '₹1,000 से ₹100 करोड़ के बीच की राशि दर्ज करें।',
    'issue.tenure': 'अवधि',
    'issue.tenure_hint': 'एआईसीटीई अपेक्षा करता है कि जमा अनुमोदन अवधि को कवर करे।',
    'issue.months': '{n} माह',
    'issue.years': '{n} वर्ष',
    'issue.year1': '1 वर्ष',
    'issue.rate': 'ब्याज दर (% प्रति वर्ष)',
    'issue.rate_invalid': 'ब्याज दर 0% से अधिक और अधिकतम 15% होनी चाहिए।',
    'issue.date': 'जारी करने की तिथि',
    'issue.date_hint': 'आज की डेमो तिथि: {d}। पिछली तिथि स्वीकार्य है; भविष्य की तिथि नहीं।',
    'issue.date_future': 'रसीद पर भविष्य की तिथि नहीं हो सकती।',
    'issue.branch': 'जारीकर्ता शाखा',
    'issue.branch_ph': 'जैसे फोर्ट, मुंबई',
    'issue.branch_hint': 'वैकल्पिक। शाखा के लिए आईएफएससी स्वतः बनता है।',
    'issue.lien': 'सदस्य सचिव, एआईसीटीई के पक्ष में ग्रहणाधिकार अंकित करें',
    'issue.lien_text': 'ग्रहणाधिकार होने पर एआईसीटीई की सहमति के बिना जमा न निकाला जा सकता है, न अन्यत्र गिरवी रखा जा सकता है और न समय से पहले बंद किया जा सकता है। केवल यह दिखाने के लिए अनचेक करें कि पोर्टल बिना ग्रहणाधिकार वाले जमा को कैसे चिह्नित करता है।',
    'issue.submit': 'जमा जारी करें और रसीद पर हस्ताक्षर करें',
    'issue.preview': 'जमा का पूर्वावलोकन',
    'issue.p_inst': 'जमाकर्ता',
    'issue.p_principal': 'मूलधन',
    'issue.p_tenure': 'अवधि',
    'issue.p_rate': 'ब्याज',
    'issue.p_maturity': 'परिपक्वता तिथि',
    'issue.p_value': 'परिपक्वता मूल्य (अनुमानित)',
    'issue.p_value_note': 'सांकेतिक, त्रैमासिक चक्रवृद्धि। एआईसीटीई का ग्रहणाधिकार पूरे जमा पर है।',
    'issue.p_lien': 'ग्रहणाधिकार',
    'issue.pa': '{r}% प्रति वर्ष',
    'issue.p_none': 'अभी चुना नहीं गया',
    'issue.signing': 'आपके बैंक की कुंजी से हस्ताक्षरित',
    'issue.key_text': 'आपके द्वारा जारी रसीदों पर कुंजी {key} से हस्ताक्षरित क्यूआर होता है। एआईसीटीई का पोर्टल {bank} के लिए पंजीकृत सार्वजनिक कुंजी से उसका सत्यापन करता है।',
    'issue.key_id': 'कुंजी आईडी',
    'issue.key_fp': 'फ़िंगरप्रिंट',
    'issue.next': 'आगे क्या होगा',
    'issue.n1': 'हस्ताक्षरित क्यूआर सहित रसीद प्रिंट होती है',
    'issue.n1b': 'रसीद संस्थान को सौंपें।',
    'issue.n2': 'संस्थान इसे एआईसीटीई पोर्टल पर जमा करता है',
    'issue.n2b': 'क्यूआर स्वतः पढ़ा जाता है और हस्ताक्षर की जाँच होती है।',
    'issue.n3': 'एआईसीटीई आपके बैंक से पुष्टि करता है',
    'issue.n3b': 'प्रत्येक जाँच आपके डैशबोर्ड पर सत्यापन अनुरोध के रूप में दिखती है।',
    'issue.n4': 'रात्रिकालीन पुनः-जाँच',
    'issue.n4b': 'ग्रहणाधिकार हटाने या जमा समय-पूर्व बंद करने पर एआईसीटीई को सूचना जाती है।',
    'issue.issued': 'जमा {n} जारी किया गया',
    'issue.issued_toast': 'जमा {n} जारी किया गया और उसकी रसीद पर हस्ताक्षर हो गए।',
    'issue.issued_sub': 'नीचे दी गई रसीद पर कुंजी {key} से हस्ताक्षरित क्यूआर है। इसे एआईसीटीई पोर्टल पर जमा करने के लिए {inst} को दें।',
    'issue.loaded': 'जमा {n} की रसीद',
    'issue.d_fdr': 'एफडीआर संख्या',
    'issue.d_holder': 'जमाधारक',
    'issue.d_inst': 'संस्थान',
    'issue.d_branch': 'शाखा / आईएफएससी',
    'issue.d_amount': 'राशि',
    'issue.d_rate': 'ब्याज दर',
    'issue.d_tenure': 'अवधि',
    'issue.d_issue': 'जारी करने की तिथि',
    'issue.d_maturity': 'परिपक्वता तिथि',
    'issue.d_value': 'परिपक्वता मूल्य (अनुमानित)',
    'issue.d_lien': 'ग्रहणाधिकार',
    'issue.d_lien_to': '{who} के पक्ष में',
    'issue.d_status': 'खाता-बही स्थिति',
    'issue.d_portal': 'एआईसीटीई पोर्टल पर',
    'issue.d_not_submitted': 'अभी जमा नहीं किया गया',
    'issue.qr_title': 'हस्ताक्षरित क्यूआर कोड',
    'issue.qr_alt': 'जमा {n} के लिए बैंक द्वारा हस्ताक्षरित क्यूआर कोड',
    'issue.qr_text': 'इसे सार्वजनिक सत्यापन पृष्ठ पर स्कैन करें: हस्ताक्षर, राशि और तिथियाँ बैंक की सार्वजनिक कुंजी से जाँची जाती हैं।',
    'issue.qr_failed': 'क्यूआर पूर्वावलोकन लोड नहीं हो सका।',
    'issue.cert_title': 'नमूना रसीद (पीडीएफ़)',
    'issue.cert_frame': 'जमा {n} की नमूना रसीद',
    'issue.download': 'रसीद डाउनलोड करें',
    'issue.open_verify': 'यह रसीद सत्यापित करें',
    'issue.another': 'एक और जमा जारी करें',
    'issue.to_ledger': 'जमा खाता-बही खोलें',
    'issue.fraud_title': 'जालसाज़ी परीक्षण (केवल डेमो)',
    'issue.fraud_text': 'इस रसीद की ऐसी प्रति डाउनलोड करें जिसमें हस्ताक्षर के बाद छपी राशि बदलकर {amt} कर दी गई है, जैसे कोई जालसाज़ पीडीएफ़ संपादित करता है। इसे एआईसीटीई पोर्टल पर अपलोड करें और देखें कि जालसाज़ी कैसे पकड़ी जाती है: हस्ताक्षरित क्यूआर में अब भी {real} है।',
    'issue.fraud_btn': 'जाली प्रति डाउनलोड करें',
    'issue.fraud_warn': 'केवल जालसाज़ी पहचान के प्रदर्शन हेतु। फ़ाइल पर जाली डेमो प्रति का वॉटरमार्क है।',
    'issue.forged_toast': 'जाली डेमो प्रति डाउनलोड हो रही है - इसका उपयोग केवल जालसाज़ी पहचान के प्रदर्शन हेतु करें।',
    'issue.lien_on': 'ग्रहणाधिकार अंकित',
    'issue.lien_off': 'ग्रहणाधिकार नहीं',
    'issue.st.active': 'सक्रिय',
    'issue.st.matured': 'परिपक्व',
    'issue.st.renewed': 'नवीनीकृत',
    'issue.st.closed': 'समय-पूर्व बंद',
    'issue.not_found': 'यह जमा आपकी खाता-बही में नहीं मिला।',
  },
});

const { meta } = await initPage({
  roles: ['bank'],
  active: 'issue',
  title: 'issue.title',
  subtitle: 'issue.subtitle',
  breadcrumbs: [{ label: 'issue.crumb_bank' }, { label: 'nav.dashboard', href: 'bank/dashboard.html' }, { label: 'nav.issue' }],
  actions: () => el('a', { class: 'btn secondary', href: site('bank/deposits.html'), html: `${icon('list', 16)}<span>${esc(t('nav.ledger'))}</span>` }),
});

const TENURES = [12, 24, 36, 60, 84, 120];
const QUICK = [500000, 1000000, 2500000, 5000000, 10000000];
const MIN_AMT = 1000;
const MAX_AMT = 1000000000;
const today = (meta && meta.today) || new Date().toISOString().slice(0, 10);

let bank = null;        // summary.bank
let picked = null;      // chosen institution
let deposit = null;     // issued / loaded deposit
let suggestions = [];
let activeIdx = -1;
let searchSeq = 0;

/* ---------------------------------------------------------------- helpers */
function fillIcons(root = document) {
  $$('[data-icon]', root).forEach((n) => {
    if (n.classList.contains('icon')) { n.outerHTML = icon(n.dataset.icon, 16); return; } // input-icon slot: the svg itself is the positioned .icon
    if (n.dataset.filled !== '1') { n.innerHTML = icon(n.dataset.icon, 18); n.dataset.filled = '1'; }
  });
}
function parseAmount(v) {
  const n = Number(String(v || '').replace(/[₹,\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}
function groupIN(n) { return n ? new Intl.NumberFormat('en-IN').format(n) : ''; }
function tenureLabel(m) {
  const y = m / 12;
  const yrs = y === 1 ? t('issue.year1') : t('issue.years', { n: y });
  return `${t('issue.months', { n: m })} (${yrs})`;
}
function addMonths(iso, months) {
  const [y, m, d] = iso.split('-').map(Number);
  const total = (m - 1) + months;
  const ty = y + Math.floor(total / 12);
  const tm = total % 12;
  const last = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
  const dd = Math.min(d, last);
  return `${ty}-${String(tm + 1).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}
function maturityValue(amount, rate, months) {
  if (!amount || !rate || !months) return 0;
  return Math.round(amount * (1 + rate / 400) ** (months / 3));
}
function stLabel(s) { return t(`issue.st.${s}`, { _default: s }); }
function stBadge(s) {
  const cls = { active: 'b-success', matured: 'b-slate', renewed: 'b-teal', closed: 'b-danger' }[s] || 'b-slate';
  return `<span class="badge ${cls}">${esc(stLabel(s))}</span>`;
}
function lienTag(on) {
  return on ? `<span class="badge b-success">${icon('lock', 12)}${esc(t('issue.lien_on'))}</span>`
    : `<span class="badge b-danger">${icon('unlock', 12)}${esc(t('issue.lien_off'))}</span>`;
}
function showError(id, msg) {
  const n = $(id);
  n.hidden = !msg;
  n.textContent = msg || '';
}

/* ---------------------------------------------------------------- static parts */
function renderStatic() {
  if (bank) {
    mount($('#sim-note'), el('span', { html: icon('info', 18) }),
      el('div', {}, el('div', { class: 'a-title' }, t('issue.sim_title')), el('div', {}, t('issue.sim_text', { bank: bank.name }))));
    mount($('#key-box'),
      el('p', { class: 'small text-2 mb-0' }, t('issue.key_text', { key: bank.key_id, bank: bank.name })),
      dl([[t('issue.key_id'), `<span class="mono">${esc(bank.key_id)}</span>`],
        [t('issue.key_fp'), `<span class="mono" style="font-weight:700;color:var(--nk-primary-700)">${esc(bank.fingerprint)}</span>`]], { cols: 1 }));
  }
  timeline($('#next-steps'), [
    { title: t('issue.n1'), body: t('issue.n1b'), tone: 'success' },
    { title: t('issue.n2'), body: t('issue.n2b') },
    { title: t('issue.n3'), body: t('issue.n3b') },
    { title: t('issue.n4'), body: t('issue.n4b'), tone: 'warning' },
  ]);
  const sel = $('#tenure');
  const cur = Number(sel.value) || 36;
  mount(sel, TENURES.map((m) => el('option', { value: m, selected: m === cur }, tenureLabel(m))));
  mount($('#amount-chips'), QUICK.map((v) => el('button', {
    class: 'btn sm secondary', type: 'button', onclick: () => { $('#amount').value = groupIN(v); onAmount(); },
  }, fmtINRShort(v))));
  $('#submit-btn').innerHTML = `${icon('stamp', 18)}<span>${esc(t('issue.submit'))}</span>`;
  $('#date-hint').textContent = t('issue.date_hint', { d: fmtDate(today) });
  renderPicked();
  onAmount();
}

/* ---------------------------------------------------------------- institution typeahead */
const qInput = $('#inst-q');
const listEl = $('#inst-list');

function closeList() {
  listEl.hidden = true;
  qInput.setAttribute('aria-expanded', 'false');
  qInput.removeAttribute('aria-activedescendant');
  activeIdx = -1;
}
function noteList(text) {
  mount(listEl, el('li', { class: 'is-s-note', role: 'option', 'aria-disabled': 'true' }, text));
  listEl.hidden = false;
  qInput.setAttribute('aria-expanded', 'true');
}
function renderList() {
  if (!suggestions.length) return noteList(t('issue.inst_none', { q: qInput.value.trim() }));
  mount(listEl, suggestions.map((s, i) => el('li', {
    id: `inst-opt-${i}`, role: 'option', 'aria-selected': i === activeIdx ? 'true' : 'false',
    onmousedown: (e) => { e.preventDefault(); pick(s); },
  },
  el('span', { html: icon('building', 18), style: { color: 'var(--nk-primary)', marginTop: '2px' } }),
  el('div', {},
    el('div', { class: 'is-s-name' }, s.name),
    el('div', { class: 'is-s-sub', html: `<span class="mono">${esc(s.aicte_id)}</span> · ${esc([s.city, s.state].filter(Boolean).join(', '))}${s.type ? ` · ${esc(s.type)}` : ''}` })))));
  listEl.hidden = false;
  qInput.setAttribute('aria-expanded', 'true');
  if (activeIdx >= 0) {
    qInput.setAttribute('aria-activedescendant', `inst-opt-${activeIdx}`);
    $(`#inst-opt-${activeIdx}`)?.scrollIntoView({ block: 'nearest' });
  } else qInput.removeAttribute('aria-activedescendant');
}
const search = debounce(async () => {
  const q = qInput.value.trim();
  if (q.length < 2) { suggestions = []; return q ? noteList(t('issue.inst_more')) : closeList(); }
  const seq = ++searchSeq;
  noteList(t('issue.inst_searching'));
  try {
    const r = await api.get('/bank/institutions', { q });
    if (seq !== searchSeq) return;
    suggestions = r.items || [];
    activeIdx = suggestions.length ? 0 : -1;
    renderList();
  } catch (err) {
    if (seq === searchSeq) noteList(t('issue.inst_failed'));
  }
}, 250);

function pick(s) {
  picked = s;
  closeList();
  qInput.value = '';
  const holder = $('#holder');
  if (!holder.value.trim() || holder.dataset.auto === '1') { holder.value = s.society_name || s.name; holder.dataset.auto = '1'; }
  showError('#inst-error', '');
  renderPicked();
  renderSummary();
  $('#amount').focus();
}
function renderPicked() {
  const box = $('#inst-picked');
  $('#inst-search').hidden = !!picked;
  $('#inst-hint').hidden = !!picked;
  box.hidden = !picked;
  if (!picked) return mount(box);
  return mount(box, el('div', { class: 'is-picked' },
    el('div', { class: 'feature-icon', html: icon('building', 22) }),
    el('div', { class: 'grow' },
      el('strong', {}, picked.name),
      el('div', { class: 'is-p-sub', html: `<span class="mono">${esc(picked.aicte_id)}</span> · ${esc([picked.city, picked.state].filter(Boolean).join(', '))}` }),
      picked.society_name ? el('div', { class: 'is-p-sub' }, picked.society_name) : null),
    el('button', {
      class: 'btn sm secondary', type: 'button', html: `${icon('edit', 14)}<span>${esc(t('issue.change'))}</span>`,
      onclick: () => {
        picked = null;
        const holder = $('#holder');
        if (holder.dataset.auto === '1') { holder.value = ''; holder.dataset.auto = ''; }
        renderPicked(); renderSummary(); qInput.focus();
      },
    })));
}

qInput.addEventListener('input', search);
qInput.addEventListener('keydown', (e) => {
  if (listEl.hidden || !suggestions.length) {
    if (e.key === 'Enter') e.preventDefault();
    return;
  }
  if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = (activeIdx + 1) % suggestions.length; renderList(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = (activeIdx - 1 + suggestions.length) % suggestions.length; renderList(); }
  else if (e.key === 'Enter') { e.preventDefault(); if (activeIdx >= 0) pick(suggestions[activeIdx]); }
  else if (e.key === 'Escape') { closeList(); }
});
qInput.addEventListener('blur', () => setTimeout(closeList, 150));
$('#holder').addEventListener('input', (e) => { e.target.dataset.auto = ''; });

/* ---------------------------------------------------------------- amount + live preview */
function onAmount() {
  const amt = parseAmount($('#amount').value);
  const hint = $('#amount-hint');
  if (amt) hint.innerHTML = `<strong>${esc(fmtINR(amt))}</strong> · ${esc(fmtINRShort(amt))}`;
  else hint.textContent = t('issue.amount_hint');
  if (amt) showError('#amount-error', '');
  renderSummary();
}
$('#amount').addEventListener('input', onAmount);
$('#amount').addEventListener('blur', () => { const a = parseAmount($('#amount').value); if (a) $('#amount').value = groupIN(a); });
['#tenure', '#rate', '#issue-date', '#lien'].forEach((s) => $(s).addEventListener('input', renderSummary));
$('#lien').addEventListener('change', renderSummary);

function renderSummary() {
  const amt = parseAmount($('#amount').value);
  const months = Number($('#tenure').value) || 36;
  const rate = Number($('#rate').value) || 0;
  const iss = $('#issue-date').value || today;
  const mat = addMonths(iss, months);
  const val = maturityValue(amt, rate, months);
  const lien = $('#lien').checked;
  const row = (k, v) => el('div', { class: 'row between nowrap' }, el('span', {}, k), el('strong', { class: 'right', html: v }));
  mount($('#summary'),
    row(t('issue.p_inst'), picked ? esc(picked.name) : `<span class="muted">${esc(t('issue.p_none'))}</span>`),
    row(t('issue.p_principal'), amt ? esc(fmtINR(amt)) : '—'),
    row(t('issue.p_tenure'), esc(tenureLabel(months))),
    row(t('issue.p_rate'), rate ? `${esc(fmtNum(rate, 2))}%` : '—'),
    row(t('issue.p_maturity'), esc(fmtDate(mat))),
    row(t('issue.p_lien'), lienTag(lien)),
    el('div', { class: 'row between nowrap is-total' }, el('span', {}, t('issue.p_value')), el('strong', {}, val ? fmtINR(val) : '—')),
    el('div', { class: 'small muted' }, t('issue.p_value_note')));
}

/* ---------------------------------------------------------------- submit */
function validate() {
  let ok = true;
  const amt = parseAmount($('#amount').value);
  const rate = Number($('#rate').value);
  const iss = $('#issue-date').value;
  if (!picked) { showError('#inst-error', t('issue.inst_required')); ok = false; }
  if (!amt || amt < MIN_AMT || amt > MAX_AMT) { showError('#amount-error', t('issue.amount_required')); ok = false; } else showError('#amount-error', '');
  if (!(rate > 0 && rate <= 15)) { showError('#rate-error', t('issue.rate_invalid')); ok = false; } else showError('#rate-error', '');
  if (iss && iss > today) { showError('#date-error', t('issue.date_future')); ok = false; } else showError('#date-error', '');
  $('#amount').classList.toggle('invalid', !$('#amount-error').hidden);
  $('#rate').classList.toggle('invalid', !$('#rate-error').hidden);
  $('#issue-date').classList.toggle('invalid', !$('#date-error').hidden);
  qInput.classList.toggle('invalid', !picked);
  return ok;
}

$('#issue-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  mount($('#form-error')); $('#form-error').hidden = true;
  if (!validate()) {
    (picked ? $('.input.invalid') : qInput)?.focus();
    return;
  }
  const body = {
    aicte_id: picked.aicte_id,
    amount: parseAmount($('#amount').value),
    tenure_months: Number($('#tenure').value),
    interest_rate: Number($('#rate').value),
    issue_date: $('#issue-date').value || today,
    branch: $('#branch').value.trim() || undefined,
    lien_marked: $('#lien').checked,
    holder_name: $('#holder').value.trim() || undefined,
  };
  await withBusy($('#submit-btn'), async () => {
    try {
      deposit = await api.post('/bank/deposits', body);
      toast(t('issue.issued_toast', { n: deposit.fdr_number }), 'success');
      setParams({ id: deposit.id }, false);
      showDone(true);
    } catch (err) {
      const box = $('#form-error');
      box.hidden = false;
      mount(box, el('div', { class: 'alert danger mb-0', role: 'alert' }, el('span', { html: icon('alert-circle', 18) }),
        el('div', {}, el('div', { class: 'a-title' }, t('common.error')), el('div', {}, err.message || t('common.error')))));
      toast(err.message || t('common.error'), 'error');
      box.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  });
});

/* ---------------------------------------------------------------- success panel */
let justIssued = false;
function showDone(fresh) {
  justIssued = !!fresh;
  $('#form-view').hidden = true;
  $('#done-view').hidden = false;
  renderDone();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderDone() {
  const d = deposit;
  if (!d) return;
  const instName = d.institution ? d.institution.name : d.holder_name;
  const val = maturityValue(d.amount, d.interest_rate, d.tenure_months);
  const certUrl = api.fileUrl(`/bank/deposits/${d.id}/certificate`);
  const forgedAmt = Math.min(d.amount * 10, MAX_AMT) === d.amount ? Math.min(d.amount * 2, MAX_AMT) : Math.min(d.amount * 10, MAX_AMT);
  const forgedUrl = api.fileUrl(`/bank/deposits/${d.id}/certificate`, { forged_amount: forgedAmt });
  const portal = d.on_portal
    ? `<span class="mono">${esc(d.on_portal.ref_no)}</span> ${d.on_portal.display_status ? `<span class="badge st-${esc(d.on_portal.display_status)}">${esc(t(`status.${d.on_portal.display_status}`, { _default: d.on_portal.display_status }))}</span>` : ''}`
    : `<span class="muted">${esc(t('issue.d_not_submitted'))}</span>`;

  const img = el('img', { src: api.fileUrl(`/bank/deposits/${d.id}/qr.png`), alt: t('issue.qr_alt', { n: d.fdr_number }), width: 230, height: 230 });
  img.addEventListener('error', () => { img.replaceWith(el('div', { class: 'small muted' }, t('issue.qr_failed'))); });

  mount($('#done-view'),
    el('div', { class: 'card accent-top accent-green' },
      el('div', { class: 'card-body stack lg' },
        el('div', { class: 'is-success-head' },
          el('div', { class: 'feature-icon', style: { background: 'var(--nk-success-50)', color: 'var(--nk-success)' }, html: icon('check-circle', 28) }),
          el('div', { class: 'grow' },
            el('h2', {}, justIssued ? t('issue.issued', { n: d.fdr_number }) : t('issue.loaded', { n: d.fdr_number })),
            el('div', { class: 'text-2' }, t('issue.issued_sub', { key: bank ? bank.key_id : '', inst: instName })))),
        dl([
          [t('issue.d_fdr'), `<span class="is-fdrno">${esc(d.fdr_number)}</span>`],
          [t('issue.d_amount'), `<strong>${esc(fmtINR(d.amount))}</strong> <span class="muted small">(${esc(fmtINRShort(d.amount))})</span>`],
          [t('issue.d_status'), stBadge(d.status)],
          [t('issue.d_holder'), esc(d.holder_name)],
          [t('issue.d_inst'), d.institution ? `${esc(d.institution.name)}<div class="small muted"><span class="mono">${esc(d.aicte_id)}</span> · ${esc([d.institution.city, d.institution.state].filter(Boolean).join(', '))}</div>` : `<span class="mono">${esc(d.aicte_id)}</span>`],
          [t('issue.d_branch'), `${esc(d.branch || '—')}<div class="small muted mono">${esc(d.ifsc || '')}</div>`],
          [t('issue.d_rate'), esc(t('issue.pa', { r: fmtNum(d.interest_rate, 2) }))],
          [t('issue.d_tenure'), esc(tenureLabel(d.tenure_months))],
          [t('issue.d_issue'), esc(fmtDate(d.issue_date))],
          [t('issue.d_maturity'), esc(fmtDate(d.maturity_date))],
          [t('issue.d_value'), `<strong style="color:var(--nk-green)">${esc(fmtINR(val))}</strong><div class="small muted">${esc(t('issue.p_value_note'))}</div>`],
          [t('issue.d_lien'), `${lienTag(d.lien_marked)}${d.lien_marked ? `<div class="small muted">${esc(t('issue.d_lien_to', { who: d.lien_in_favour_of || 'AICTE' }))}</div>` : ''}`],
          [t('issue.d_portal'), portal],
        ], { cols: 3 }),
        el('div', { class: 'is-actions' },
          el('a', { class: 'btn', href: certUrl, download: `FDR_${d.fdr_number}.pdf`, html: `${icon('download', 16)}<span>${esc(t('issue.download'))}</span>` }),
          el('a', { class: 'btn secondary', href: site('verify.html'), html: `${icon('qr', 16)}<span>${esc(t('issue.open_verify'))}</span>` }),
          el('a', { class: 'btn secondary', href: site('bank/deposits.html'), html: `${icon('list', 16)}<span>${esc(t('issue.to_ledger'))}</span>` }),
          el('button', { class: 'btn ghost', type: 'button', html: `${icon('plus', 16)}<span>${esc(t('issue.another'))}</span>`, onclick: resetForm })))),

    el('section', { class: 'grid g-1-2' },
      el('div', { class: 'stack' },
        el('div', { class: 'card' },
          el('div', { class: 'card-head' }, el('h3', { html: `${icon('qr', 18)}<span>${esc(t('issue.qr_title'))}</span>` })),
          el('div', { class: 'card-body stack' },
            el('div', { class: 'is-qr' }, img),
            el('p', { class: 'small text-2 mb-0' }, t('issue.qr_text')))),
        el('div', { class: 'is-fraud', role: 'region', 'aria-label': t('issue.fraud_title') },
          el('h3', { html: `${icon('shield-alert', 18)}<span>${esc(t('issue.fraud_title'))}</span>` }),
          el('p', {}, t('issue.fraud_text', { amt: fmtINR(forgedAmt), real: fmtINR(d.amount) })),
          el('a', {
            class: 'btn outline-danger', href: forgedUrl, download: `FDR_${d.fdr_number}_FORGED-DEMO.pdf`,
            html: `${icon('alert', 16)}<span>${esc(t('issue.fraud_btn'))}</span>`, onclick: () => toast(t('issue.forged_toast'), 'warning'),
          }),
          el('div', { class: 'small mt-2', style: { color: 'var(--nk-danger)' }, html: `${icon('alert-circle', 14)} ${esc(t('issue.fraud_warn'))}` }))),
      el('div', { class: 'card' },
        el('div', { class: 'card-head' },
          el('h3', { html: `${icon('file-text', 18)}<span>${esc(t('issue.cert_title'))}</span>` }),
          el('a', { class: 'btn sm secondary', href: certUrl, download: `FDR_${d.fdr_number}.pdf`, html: `${icon('download', 15)}<span>${esc(t('common.download'))}</span>` })),
        el('div', { class: 'card-body' },
          el('iframe', { class: 'doc-frame', src: api.fileUrl(`/bank/deposits/${d.id}/certificate`, { inline: 1 }), title: t('issue.cert_frame', { n: d.fdr_number }) })))));
}

function resetForm() {
  deposit = null;
  picked = null;
  setParams({ id: null }, false);
  $('#issue-form').reset();
  $('#holder').dataset.auto = '';
  $('#issue-date').value = today;
  $$('.invalid', $('#issue-form')).forEach((n) => n.classList.remove('invalid'));
  ['#inst-error', '#amount-error', '#rate-error', '#date-error'].forEach((s) => showError(s, ''));
  $('#form-error').hidden = true;
  $('#done-view').hidden = true;
  $('#form-view').hidden = false;
  renderStatic();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  qInput.focus();
}

/* ---------------------------------------------------------------- load */
async function load() {
  loading($('#state'));
  $('#form-view').hidden = true;
  $('#done-view').hidden = true;
  try {
    const id = getParam('id');
    const [s, d] = await Promise.all([
      api.get('/bank/summary'),
      id ? api.get(`/bank/deposits/${encodeURIComponent(id)}`).catch((err) => (err.status === 404 ? null : Promise.reject(err))) : null,
    ]);
    bank = s.bank;
    mount($('#state'));
    $('#issue-date').value = today;
    $('#issue-date').max = today;
    renderStatic();
    if (d) { deposit = d; showDone(false); }
    else {
      if (id) { toast(t('issue.not_found'), 'warning'); setParams({ id: null }, true); }
      $('#form-view').hidden = false;
    }
  } catch (err) {
    errorState($('#state'), err, load);
  }
}

fillIcons();
onLang(() => { fillIcons(); renderStatic(); renderSummary(); if (deposit && !$('#done-view').hidden) renderDone(); });
load();
