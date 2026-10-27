// Bank: deposit ledger (mock bank's side). Filter / search the bank's deposits and simulate bank-side events
// (mark / remove lien, pre-close, mature, renew) that AICTE's bank re-check later picks up.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang } from '../assets/js/i18n.js';
import {
  $, $$, el, esc, icon, fmtINR, fmtINRShort, fmtDate, fmtNum, loading, errorState, mount, toast, modal,
  confirmDialog, promptDialog, renderTable, pagination, getParam, setParams, maturityChip, withBusy,
} from '../assets/js/ui.js';

extend({
  en: {
    'dep.title': 'Deposit ledger',
    'dep.subtitle': 'Every fixed deposit your bank has issued with a lien to AICTE, and the bank-side events you can simulate on it',
    'dep.crumb_bank': 'Bank portal (simulated)',
    'dep.sim_title': 'Simulation of a bank’s systems',
    'dep.sim_text': 'These actions stand in for events in {bank}’s core-banking system - for example an institution breaking its FD at a branch. They let you demonstrate how AICTE’s portal reacts. No real deposit is affected.',
    'dep.filters_sub': 'Filter the ledger by status or search by FDR number, holder, institution or AICTE ID',
    'dep.search_ph': 'FDR number, holder, institution or AICTE ID',
    'dep.f.all': 'All',
    'dep.f.active': 'Active',
    'dep.f.matured': 'Matured',
    'dep.f.renewed': 'Renewed',
    'dep.f.closed': 'Pre-closed',
    'dep.note_title': 'What AICTE’s portal will notice',
    'dep.note1': 'Removing a lien or pre-closing a deposit that backs an AICTE record alerts AICTE officers at once.',
    'dep.note2': 'AICTE’s nightly bank re-check then flags the record as a discrepancy, so a broken FD cannot stay hidden.',
    'dep.note3': 'A deposit can be marked matured only on or after its maturity date. Renewing issues a new FDR number that the institution submits as a renewal.',
    'dep.note4': 'Rows tinted red are on AICTE’s portal without a valid lien or are already closed.',
    'dep.table_title': 'Fixed deposits issued by your bank',
    'dep.total': '{n} deposits · {amt} in this view',
    'dep.total_one': '1 deposit · {amt} in this view',
    'dep.c_fdr': 'FDR number',
    'dep.c_holder': 'Holder',
    'dep.c_amount': 'Amount',
    'dep.c_dates': 'Issue / maturity',
    'dep.c_status': 'Status',
    'dep.c_lien': 'Lien',
    'dep.c_portal': 'On AICTE portal',
    'dep.c_actions': 'Actions',
    'dep.matures': 'Matures {d}',
    'dep.closed_on': 'Closed {d}',
    'dep.due': 'Due',
    'dep.not_submitted': 'Not submitted',
    'dep.lien_on': 'Lien marked',
    'dep.lien_off': 'No lien',
    'dep.st.active': 'Active',
    'dep.st.matured': 'Matured',
    'dep.st.renewed': 'Renewed',
    'dep.st.closed': 'Pre-closed',
    'dep.actions': 'Actions',
    'dep.actions_for': 'Actions for {n}',
    'dep.a.mark_lien': 'Mark lien',
    'dep.a.mark_lien_sub': 'Pledge the deposit to AICTE',
    'dep.a.remove_lien': 'Remove lien',
    'dep.a.remove_lien_sub': 'AICTE is alerted if it is on the portal',
    'dep.a.preclose': 'Pre-close deposit',
    'dep.a.preclose_sub': 'Simulates the institution breaking the FD',
    'dep.a.mature': 'Mark matured',
    'dep.a.mature_sub': 'Available from {d}',
    'dep.a.mature_due': 'Maturity date reached',
    'dep.a.renew': 'Renew',
    'dep.a.renew_sub': 'Issue a new FDR for the same amount',
    'dep.a.receipt': 'Receipt & signed QR',
    'dep.a.download': 'Download receipt',
    'dep.a.portal': 'Portal reference {ref}',
    'dep.cf.mark_lien': 'Mark a lien on deposit {n} in favour of the Member Secretary, AICTE?',
    'dep.cf.remove_title': 'Remove the AICTE lien',
    'dep.cf.remove_label': 'Remove the lien on {n}? Officers are alerted if the deposit backs an AICTE record. Reason (optional)',
    'dep.cf.preclose_title': 'Pre-close deposit {n}?',
    'dep.cf.preclose': 'This simulates the institution quietly breaking its fixed deposit at the branch. The deposit is closed today; if it backs an AICTE record, officers are alerted and the nightly re-check flags it.',
    'dep.cf.preclose_reason': 'Reason for the premature closure',
    'dep.cf.preclose_default': 'Premature closure at the depositor’s request',
    'dep.cf.mature': 'Mark deposit {n} as matured? Its maturity date was {d}.',
    'dep.cf.renew': 'Renew deposit {n}? A new deposit with the same holder, amount and tenure is issued and this one is marked renewed.',
    'dep.ok.mark_lien': 'Lien marked on {n}.',
    'dep.ok.remove_lien': 'Lien removed from {n}. AICTE’s next bank check will flag it.',
    'dep.ok.preclose': 'Deposit {n} pre-closed. AICTE’s next bank check will flag it.',
    'dep.ok.mature': 'Deposit {n} marked as matured.',
    'dep.ok.renew': 'Deposit {old} renewed as {n}.',
    'dep.renewed_title': 'Deposit renewed',
    'dep.renewed_text': '{old} has been renewed. The new fixed deposit number is',
    'dep.renewed_sub': '{amt} · {tenure} months · matures {d}',
    'dep.renewed_hint': 'Give the new receipt to the institution so it can submit the renewal on AICTE’s portal.',
    'dep.view_receipt': 'View receipt & QR',
    'dep.empty': 'No deposits found',
    'dep.empty_text': 'Try another status or search term, or issue a new deposit.',
    'dep.issue_btn': 'Issue FDR',
    'dep.months': '{n} months',
  },
  hi: {
    'dep.title': 'जमा खाता-बही',
    'dep.subtitle': 'आपके बैंक द्वारा एआईसीटीई के पक्ष में ग्रहणाधिकार सहित जारी प्रत्येक सावधि जमा, और उन पर अनुकरण की जा सकने वाली बैंक-स्तरीय घटनाएँ',
    'dep.crumb_bank': 'बैंक पोर्टल (अनुकरण)',
    'dep.sim_title': 'बैंक प्रणाली का अनुकरण',
    'dep.sim_text': 'ये कार्य {bank} की कोर-बैंकिंग प्रणाली की घटनाओं के स्थान पर हैं - उदाहरण के लिए किसी संस्थान द्वारा शाखा में अपनी एफडी तोड़ना। इनसे दिखाया जा सकता है कि एआईसीटीई का पोर्टल कैसे प्रतिक्रिया देता है। कोई वास्तविक जमा प्रभावित नहीं होता।',
    'dep.filters_sub': 'स्थिति के अनुसार खाता-बही छाँटें या एफडीआर संख्या, जमाधारक, संस्थान अथवा एआईसीटीई आईडी से खोजें',
    'dep.search_ph': 'एफडीआर संख्या, जमाधारक, संस्थान या एआईसीटीई आईडी',
    'dep.f.all': 'सभी',
    'dep.f.active': 'सक्रिय',
    'dep.f.matured': 'परिपक्व',
    'dep.f.renewed': 'नवीनीकृत',
    'dep.f.closed': 'समय-पूर्व बंद',
    'dep.note_title': 'एआईसीटीई का पोर्टल क्या पकड़ेगा',
    'dep.note1': 'एआईसीटीई रिकॉर्ड से जुड़े जमा का ग्रहणाधिकार हटाने या उसे समय-पूर्व बंद करने पर एआईसीटीई अधिकारियों को तुरंत सूचना जाती है।',
    'dep.note2': 'इसके बाद एआईसीटीई की रात्रिकालीन बैंक पुनः-जाँच उस रिकॉर्ड को विसंगति के रूप में चिह्नित करती है, ताकि तोड़ी गई एफडी छिपी न रह सके।',
    'dep.note3': 'जमा को परिपक्वता तिथि पर या उसके बाद ही परिपक्व अंकित किया जा सकता है। नवीनीकरण पर नई एफडीआर संख्या जारी होती है, जिसे संस्थान नवीनीकरण के रूप में जमा करता है।',
    'dep.note4': 'लाल रंग की पंक्तियाँ वे हैं जो एआईसीटीई पोर्टल पर हैं परंतु जिन पर वैध ग्रहणाधिकार नहीं है या जो बंद हो चुकी हैं।',
    'dep.table_title': 'आपके बैंक द्वारा जारी सावधि जमा',
    'dep.total': '{n} जमा · इस दृश्य में {amt}',
    'dep.total_one': '1 जमा · इस दृश्य में {amt}',
    'dep.c_fdr': 'एफडीआर संख्या',
    'dep.c_holder': 'जमाधारक',
    'dep.c_amount': 'राशि',
    'dep.c_dates': 'जारी / परिपक्वता',
    'dep.c_status': 'स्थिति',
    'dep.c_lien': 'ग्रहणाधिकार',
    'dep.c_portal': 'एआईसीटीई पोर्टल पर',
    'dep.c_actions': 'कार्रवाई',
    'dep.matures': 'परिपक्वता {d}',
    'dep.closed_on': 'बंद {d}',
    'dep.due': 'देय',
    'dep.not_submitted': 'जमा नहीं किया गया',
    'dep.lien_on': 'ग्रहणाधिकार अंकित',
    'dep.lien_off': 'ग्रहणाधिकार नहीं',
    'dep.st.active': 'सक्रिय',
    'dep.st.matured': 'परिपक्व',
    'dep.st.renewed': 'नवीनीकृत',
    'dep.st.closed': 'समय-पूर्व बंद',
    'dep.actions': 'कार्रवाई',
    'dep.actions_for': '{n} के लिए कार्रवाई',
    'dep.a.mark_lien': 'ग्रहणाधिकार अंकित करें',
    'dep.a.mark_lien_sub': 'जमा एआईसीटीई के पक्ष में गिरवी रखें',
    'dep.a.remove_lien': 'ग्रहणाधिकार हटाएँ',
    'dep.a.remove_lien_sub': 'पोर्टल पर होने पर एआईसीटीई को सूचना जाती है',
    'dep.a.preclose': 'जमा समय-पूर्व बंद करें',
    'dep.a.preclose_sub': 'संस्थान द्वारा एफडी तोड़ने का अनुकरण',
    'dep.a.mature': 'परिपक्व अंकित करें',
    'dep.a.mature_sub': '{d} से उपलब्ध',
    'dep.a.mature_due': 'परिपक्वता तिथि आ चुकी है',
    'dep.a.renew': 'नवीनीकरण करें',
    'dep.a.renew_sub': 'समान राशि के लिए नई एफडीआर जारी करें',
    'dep.a.receipt': 'रसीद एवं हस्ताक्षरित क्यूआर',
    'dep.a.download': 'रसीद डाउनलोड करें',
    'dep.a.portal': 'पोर्टल संदर्भ {ref}',
    'dep.cf.mark_lien': 'क्या जमा {n} पर सदस्य सचिव, एआईसीटीई के पक्ष में ग्रहणाधिकार अंकित करें?',
    'dep.cf.remove_title': 'एआईसीटीई ग्रहणाधिकार हटाएँ',
    'dep.cf.remove_label': 'क्या {n} से ग्रहणाधिकार हटाएँ? यदि जमा किसी एआईसीटीई रिकॉर्ड से जुड़ा है तो अधिकारियों को सूचना जाएगी। कारण (वैकल्पिक)',
    'dep.cf.preclose_title': 'क्या जमा {n} समय-पूर्व बंद करें?',
    'dep.cf.preclose': 'यह संस्थान द्वारा शाखा में चुपचाप अपनी सावधि जमा तोड़ने का अनुकरण है। जमा आज बंद हो जाएगा; यदि यह किसी एआईसीटीई रिकॉर्ड से जुड़ा है, तो अधिकारियों को सूचना जाएगी और रात्रिकालीन पुनः-जाँच इसे चिह्नित करेगी।',
    'dep.cf.preclose_reason': 'समय-पूर्व बंद करने का कारण',
    'dep.cf.preclose_default': 'जमाकर्ता के अनुरोध पर समय-पूर्व बंद',
    'dep.cf.mature': 'क्या जमा {n} को परिपक्व अंकित करें? इसकी परिपक्वता तिथि {d} थी।',
    'dep.cf.renew': 'क्या जमा {n} का नवीनीकरण करें? समान जमाधारक, राशि और अवधि के साथ नया जमा जारी होगा और यह जमा नवीनीकृत अंकित होगा।',
    'dep.ok.mark_lien': '{n} पर ग्रहणाधिकार अंकित किया गया।',
    'dep.ok.remove_lien': '{n} से ग्रहणाधिकार हटाया गया। एआईसीटीई की अगली बैंक जाँच इसे चिह्नित करेगी।',
    'dep.ok.preclose': 'जमा {n} समय-पूर्व बंद किया गया। एआईसीटीई की अगली बैंक जाँच इसे चिह्नित करेगी।',
    'dep.ok.mature': 'जमा {n} को परिपक्व अंकित किया गया।',
    'dep.ok.renew': 'जमा {old} का नवीनीकरण {n} के रूप में किया गया।',
    'dep.renewed_title': 'जमा का नवीनीकरण हुआ',
    'dep.renewed_text': '{old} का नवीनीकरण हो गया है। नई सावधि जमा संख्या है',
    'dep.renewed_sub': '{amt} · {tenure} माह · परिपक्वता {d}',
    'dep.renewed_hint': 'नई रसीद संस्थान को दें ताकि वह एआईसीटीई पोर्टल पर नवीनीकरण जमा कर सके।',
    'dep.view_receipt': 'रसीद एवं क्यूआर देखें',
    'dep.empty': 'कोई जमा नहीं मिला',
    'dep.empty_text': 'कोई अन्य स्थिति या खोज शब्द आज़माएँ, या नया जमा जारी करें।',
    'dep.issue_btn': 'एफडीआर जारी करें',
    'dep.months': '{n} माह',
  },
});

await initPage({
  roles: ['bank'],
  active: 'ledger',
  title: 'dep.title',
  subtitle: 'dep.subtitle',
  breadcrumbs: [{ label: 'dep.crumb_bank' }, { label: 'nav.dashboard', href: 'bank/dashboard.html' }, { label: 'nav.ledger' }],
  actions: () => el('a', { class: 'btn', href: site('bank/issue.html'), html: `${icon('plus', 16)}<span>${esc(t('dep.issue_btn'))}</span>` }),
});

const PAGE_SIZE = 15;
const FILTERS = ['', 'active', 'matured', 'renewed', 'closed'];
const ST_CLASS = { active: 'b-success', matured: 'b-slate', renewed: 'b-teal', closed: 'b-danger' };
let status = FILTERS.includes(getParam('status') || '') ? (getParam('status') || '') : '';
let q = getParam('q') || '';
let page = Math.max(1, Number(getParam('page')) || 1);
let last = null;
let bankName = '';
let flashId = null;
let menuEl = null;

/* ---------------------------------------------------------------- helpers */
function fillIcons(root = document) {
  $$('[data-icon]', root).forEach((n) => {
    if (n.classList.contains('icon')) { n.outerHTML = icon(n.dataset.icon, 16); return; } // input-icon slot: the svg itself is the positioned .icon
    if (n.dataset.filled !== '1') { n.innerHTML = icon(n.dataset.icon, 18); n.dataset.filled = '1'; }
  });
}
const stBadge = (s) => `<span class="badge ${ST_CLASS[s] || 'b-slate'}">${esc(t(`dep.st.${s}`, { _default: s }))}</span>`;
const lienTag = (on) => (on ? `<span class="badge b-success">${icon('lock', 12)}${esc(t('dep.lien_on'))}</span>`
  : `<span class="badge b-danger">${icon('unlock', 12)}${esc(t('dep.lien_off'))}</span>`);
const flagged = (d) => !!d.on_portal && (d.status === 'closed' || !d.lien_marked);
const certUrl = (d) => api.fileUrl(`/bank/deposits/${d.id}/certificate`);

function portalCell(d) {
  if (!d.on_portal) return `<span class="muted small">${esc(t('dep.not_submitted'))}</span>`;
  const ds = d.on_portal.display_status;
  return `<div class="mono nowrap small">${esc(d.on_portal.ref_no)}</div>${ds ? `<span class="badge st-${esc(ds)}">${esc(t(`status.${ds}`, { _default: ds }))}</span>` : ''}`;
}

function datesCell(d) {
  let sub;
  if (d.status === 'active') sub = d.due ? `<span class="badge b-warning">${esc(t('dep.due'))}</span>` : (d.days_to_maturity <= 180 ? maturityChip(d.days_to_maturity) : '');
  else if (d.closed_at) sub = `<span class="small muted">${esc(t('dep.closed_on', { d: fmtDate(d.closed_at) }))}</span>`;
  else sub = '';
  return `<div class="nowrap">${esc(fmtDate(d.issue_date))}</div><div class="cell-sub nowrap">${esc(t('dep.matures', { d: fmtDate(d.maturity_date) }))}</div>${sub ? `<div class="mt-1">${sub}</div>` : ''}`;
}

/* ---------------------------------------------------------------- actions menu (fixed, so the table scroller does not clip it) */
function closeMenu(focusBack = false) {
  if (!menuEl) return;
  const opener = menuEl._opener;
  menuEl.remove();
  menuEl = null;
  if (opener) opener.setAttribute('aria-expanded', 'false');
  if (focusBack && opener) opener.focus();
}

function openMenu(btn, d) {
  if (menuEl && menuEl._opener === btn) return closeMenu();
  closeMenu();
  const isActive = d.status === 'active';
  const items = [];
  const item = (key, ic, sub, enabled, run, cls = '') => el('button', {
    type: 'button', role: 'menuitem', class: cls, disabled: !enabled,
    onclick: () => { closeMenu(); run(); },
    html: `${icon(ic, 16)}<span>${esc(t(`dep.a.${key}`))}<span class="dp-mi-sub">${esc(sub)}</span></span>`,
  });
  items.push(el('div', { class: 'menu-head' }, d.fdr_number));
  if (!d.lien_marked) items.push(item('mark_lien', 'lock', t('dep.a.mark_lien_sub'), isActive, () => act(d, 'mark_lien')));
  else items.push(item('remove_lien', 'unlock', t('dep.a.remove_lien_sub'), !['closed', 'renewed'].includes(d.status), () => act(d, 'remove_lien'), 'danger'));
  items.push(item('preclose', 'ban', t('dep.a.preclose_sub'), isActive, () => act(d, 'preclose'), 'danger'));
  items.push(item('mature', 'hourglass', d.due ? t('dep.a.mature_due') : t('dep.a.mature_sub', { d: fmtDate(d.maturity_date) }), isActive && d.due, () => act(d, 'mature')));
  items.push(item('renew', 'refresh', t('dep.a.renew_sub'), ['active', 'matured'].includes(d.status), () => act(d, 'renew')));
  items.push(el('div', { class: 'menu-sep' }));
  items.push(el('a', { role: 'menuitem', href: site(`bank/issue.html?id=${d.id}`), html: `${icon('qr', 16)}<span>${esc(t('dep.a.receipt'))}</span>` }));
  items.push(el('a', { role: 'menuitem', href: certUrl(d), download: `FDR_${d.fdr_number}.pdf`, html: `${icon('download', 16)}<span>${esc(t('dep.a.download'))}</span>`, onclick: () => closeMenu() }));

  menuEl = el('div', { class: 'menu dp-menu', role: 'menu', 'aria-label': t('dep.actions_for', { n: d.fdr_number }) }, items);
  menuEl._opener = btn;
  document.body.appendChild(menuEl);
  btn.setAttribute('aria-expanded', 'true');
  const r = btn.getBoundingClientRect();
  const mw = menuEl.offsetWidth;
  const mh = menuEl.offsetHeight;
  const left = Math.max(8, Math.min(r.right - mw, window.innerWidth - mw - 8));
  const top = (r.bottom + mh + 8 > window.innerHeight && r.top - mh - 6 > 0) ? r.top - mh - 6 : r.bottom + 6;
  menuEl.style.left = `${left}px`;
  menuEl.style.top = `${top}px`;
  menuEl.querySelector('button:not([disabled]), a')?.focus();
  menuEl.addEventListener('keydown', (e) => {
    const list = [...menuEl.querySelectorAll('button:not([disabled]), a')];
    const i = list.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length]?.focus(); }
    else if (e.key === 'Tab') closeMenu();
  });
}
document.addEventListener('mousedown', (e) => { if (menuEl && !menuEl.contains(e.target) && e.target !== menuEl._opener && !menuEl._opener.contains(e.target)) closeMenu(); });
window.addEventListener('resize', () => closeMenu());
window.addEventListener('scroll', () => closeMenu(), { passive: true });

/* ---------------------------------------------------------------- bank-side events */
async function act(d, action) {
  const n = d.fdr_number;
  let note = '';
  if (action === 'mark_lien') {
    if (!await confirmDialog(t('dep.cf.mark_lien', { n }), { confirmLabel: t('dep.a.mark_lien') })) return;
  } else if (action === 'remove_lien') {
    const r = await promptDialog({ title: t('dep.cf.remove_title'), label: t('dep.cf.remove_label', { n }), required: false, confirmLabel: t('dep.a.remove_lien'), variant: 'danger' });
    if (r === null) return;
    note = r;
  } else if (action === 'preclose') {
    if (!await confirmDialog(t('dep.cf.preclose'), { title: t('dep.cf.preclose_title', { n }), confirmLabel: t('dep.a.preclose'), variant: 'danger' })) return;
    const r = await promptDialog({ title: t('dep.cf.preclose_title', { n }), label: t('dep.cf.preclose_reason'), value: t('dep.cf.preclose_default'), confirmLabel: t('dep.a.preclose'), variant: 'danger' });
    if (r === null) return;
    note = r;
  } else if (action === 'mature') {
    if (!await confirmDialog(t('dep.cf.mature', { n, d: fmtDate(d.maturity_date) }), { confirmLabel: t('dep.a.mature') })) return;
  } else if (action === 'renew') {
    if (!await confirmDialog(t('dep.cf.renew', { n }), { confirmLabel: t('dep.a.renew') })) return;
  }
  try {
    const res = await api.post(`/bank/deposits/${d.id}/action`, { action, note });
    if (action === 'renew') {
      toast(t('dep.ok.renew', { old: n, n: res.fdr_number }), 'success');
      flashId = res.id;
      showRenewed(d, res);
    } else {
      toast(t(`dep.ok.${action}`, { n }), action === 'remove_lien' || action === 'preclose' ? 'warning' : 'success');
      flashId = d.id;
    }
  } catch (err) {
    toast(err.message || t('common.error'), 'error');
  }
  load();
}

function showRenewed(old, nd) {
  modal({
    title: t('dep.renewed_title'),
    body: el('div', { class: 'dp-renew-box' },
      el('div', { class: 'feature-icon', style: { margin: '0 auto 10px', background: 'var(--nk-success-50)', color: 'var(--nk-success)' }, html: icon('check-circle', 26) }),
      el('div', { class: 'text-2' }, t('dep.renewed_text', { old: old.fdr_number })),
      el('div', { class: 'dp-newno' }, nd.fdr_number),
      el('div', { class: 'small muted' }, t('dep.renewed_sub', { amt: fmtINR(nd.amount), tenure: nd.tenure_months, d: fmtDate(nd.maturity_date) })),
      el('p', { class: 'small text-2 mt-2 mb-0' }, t('dep.renewed_hint'))),
    actions: [
      { label: t('common.close'), variant: 'secondary' },
      { label: t('dep.view_receipt'), variant: 'primary', onClick: () => { location.href = site(`bank/issue.html?id=${nd.id}`); return false; } },
    ],
  });
}

/* ---------------------------------------------------------------- render */
function columns() {
  return [
    { key: 'fdr_number', label: t('dep.c_fdr'), render: (d) => `<div class="cell-main mono nowrap">${esc(d.fdr_number)}</div><div class="cell-sub">${esc(d.branch || '—')}</div><div class="cell-sub mono">${esc(d.ifsc || '')}</div>` },
    {
      key: 'holder', label: t('dep.c_holder'),
      render: (d) => `<div class="cell-main">${esc(d.holder_name)}</div><div class="cell-sub">${d.institution ? `${esc(d.institution.name)} · ` : ''}<span class="mono">${esc(d.aicte_id)}</span></div>`,
    },
    { key: 'amount', label: t('dep.c_amount'), align: 'right', render: (d) => `<div class="num nowrap"><strong>${esc(fmtINR(d.amount))}</strong></div><div class="cell-sub nowrap">${esc(fmtNum(d.interest_rate, 2))}% · ${esc(t('dep.months', { n: d.tenure_months }))}</div>` },
    { key: 'dates', label: t('dep.c_dates'), render: datesCell },
    { key: 'status', label: t('dep.c_status'), render: (d) => stBadge(d.status) },
    { key: 'lien', label: t('dep.c_lien'), render: (d) => lienTag(d.lien_marked) },
    { key: 'portal', label: t('dep.c_portal'), render: portalCell },
    {
      key: 'actions', label: t('dep.c_actions'), align: 'right',
      render: (d) => el('button', {
        class: 'btn sm secondary', type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false',
        'aria-label': t('dep.actions_for', { n: d.fdr_number }),
        html: `<span>${esc(t('dep.actions'))}</span>${icon('chevron-down', 14)}`,
        onclick: (e) => openMenu(e.currentTarget, d),
      }),
    },
  ];
}

function renderFilters() {
  const c = (last && last.counts) || {};
  mount($('#status-filter'), FILTERS.map((f) => el('button', {
    class: `btn sm secondary ${status === f ? 'active' : ''}`, type: 'button', 'aria-pressed': status === f ? 'true' : 'false',
    onclick: () => { status = f; page = 1; load(); },
    html: `${esc(t(`dep.f.${f || 'all'}`))}<span class="count">${esc(fmtNum(c[f || 'all'] ?? 0))}</span>`,
  })));
}

function renderStatic() {
  mount($('#sim-note'), el('span', { html: icon('info', 18) }),
    el('div', {}, el('div', { class: 'a-title' }, t('dep.sim_title')), el('div', {}, t('dep.sim_text', { bank: bankName || t('dep.crumb_bank') }))));
  mount($('#note-list'), ['dep.note1', 'dep.note2', 'dep.note3'].map((k) => el('li', {}, t(k))),
    el('li', { html: `<span class="dp-legend" aria-hidden="true"></span>${esc(t('dep.note4'))}` }));
  $('#refresh-btn').innerHTML = `${icon('refresh', 15)}<span>${esc(t('common.refresh'))}</span>`;
  renderFilters();
}

function render() {
  renderStatic();
  if (!last) return;
  const sum = last.items.reduce((s, d) => s + (d.amount || 0), 0);
  $('#total-line').textContent = last.total === 1 ? t('dep.total_one', { amt: fmtINRShort(sum) })
    : t('dep.total', { n: fmtNum(last.total), amt: fmtINRShort(sum) });
  renderTable($('#table'), {
    columns: columns(),
    rows: last.items,
    rowClass: (d) => [flagged(d) ? 'row-danger' : '', d.id === flashId ? 'row-warning' : ''].filter(Boolean).join(' '),
    empty: {
      icon: 'inbox', title: t('dep.empty'), text: t('dep.empty_text'),
    },
  });
  pagination($('#pager'), { page, pageSize: PAGE_SIZE, total: last.total, onChange: (p) => { page = p; load(); } });
}

async function load() {
  closeMenu();
  setParams({ status, q, page: page > 1 ? page : null });
  if (!last) loading($('#table'));
  else $('#table').style.opacity = '.6';
  try {
    const r = await api.get('/bank/deposits', { status: status || undefined, q: q || undefined, page, page_size: PAGE_SIZE });
    if (!r.items.length && page > 1 && r.total) { page = 1; return load(); }
    last = r;
    render();
  } catch (err) {
    errorState($('#table'), err, load);
    mount($('#pager'));
  } finally {
    $('#table').style.opacity = '';
  }
  return null;
}

$('#q').value = q;
$('#search-form').addEventListener('submit', (e) => { e.preventDefault(); q = $('#q').value.trim(); page = 1; load(); });
$('#clear-btn').addEventListener('click', () => { $('#q').value = ''; q = ''; status = ''; page = 1; load(); });
$('#refresh-btn').addEventListener('click', (e) => withBusy(e.currentTarget, load));
fillIcons();
onLang(() => { fillIcons(); render(); });
renderStatic();
api.get('/bank/summary').then((s) => { bankName = s.bank.name; renderStatic(); }).catch(() => {});
load();
