// Bank dashboard (role bank): identity + signing key, ledger KPIs, AICTE verification requests, quick actions.
// This is the mock bank's side of the prototype - clearly labelled as a simulation of the bank's systems.
import { initPage, setPageHead } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang } from '../assets/js/i18n.js';
import {
  $, $$, el, esc, icon, kpi, fmtINR, fmtINRShort, fmtDate, fmtDateTime, fmtNum, loading, emptyState, errorState,
  renderTable, pagination, mount, modal, copyText, maturityChip,
} from '../assets/js/ui.js';
import { doughnutChart, COLORS } from '../assets/js/charts.js';

extend({
  en: {
    'bdash.title': 'Bank dashboard',
    'bdash.subtitle': 'Simulated bank system: issue lien-marked fixed deposits for AICTE and answer the portal’s verification requests',
    'bdash.issue_btn': 'Issue FDR',
    'bdash.ledger_btn': 'Deposit ledger',
    'bdash.sim_title': 'Simulation of a bank’s systems',
    'bdash.sim_text': 'This page stands in for {bank}’s core-banking system so the complete flow can be demonstrated end to end. The bank and every deposit shown are fictitious.',
    'bdash.k_deposits': 'Deposits in ledger',
    'bdash.k_deposits_sub': '{active} active · {matured} matured · {renewed} renewed · {closed} pre-closed',
    'bdash.k_active': 'Active deposits',
    'bdash.k_active_sub': '{n} carry a lien in favour of AICTE',
    'bdash.k_lien': 'Under lien to AICTE',
    'bdash.k_lien_sub': '{amount} across {n} active deposits',
    'bdash.k_requests': 'Verification requests',
    'bdash.k_requests_sub': 'received from AICTE in the last 30 days',
    'bdash.identity': 'Bank identity & signing key',
    'bdash.code': 'Bank code',
    'bdash.ifsc_prefix': 'IFSC prefix',
    'bdash.hq': 'Head office',
    'bdash.key_id': 'Signing key ID',
    'bdash.fingerprint': 'Key fingerprint',
    'bdash.registered': 'Key registered on',
    'bdash.public_key': 'Public key (Ed25519)',
    'bdash.copy': 'Copy',
    'bdash.copy_key': 'Copy public key',
    'bdash.api_on': 'Verification API connected',
    'bdash.api_off': 'Verification API offline',
    'bdash.key_explain': 'Receipts you issue carry a QR signed with this key; AICTE’s portal verifies it with the public key registered here.',
    'bdash.key_private': 'The private half of the key never leaves the bank. Anyone can check a receipt on the public Verify page.',
    'bdash.portal_total': 'Pledged on AICTE portal',
    'bdash.portal_active': 'Accepted & active',
    'bdash.portal_requests': 'Checks in 30 days',
    'bdash.quick': 'Quick actions',
    'bdash.qa_issue': 'Issue a fixed deposit',
    'bdash.qa_issue_text': 'Open a deposit with lien to AICTE and print a receipt with a signed QR',
    'bdash.qa_ledger': 'Deposit ledger',
    'bdash.qa_ledger_text': 'Mark or remove liens, pre-close, mature or renew deposits',
    'bdash.qa_verify': 'Verify a receipt',
    'bdash.qa_verify_text': 'Check any receipt’s signature exactly the way AICTE does',
    'bdash.how': 'How a signed receipt protects AICTE',
    'bdash.how1': 'The bank opens the deposit with a lien in favour of AICTE and signs the receipt’s QR code with its private key.',
    'bdash.how2': 'The institution uploads the receipt on AICTE’s portal, which reads the QR automatically.',
    'bdash.how3': 'The portal checks the signature with this bank’s registered public key and asks the bank to confirm the live status.',
    'bdash.how4': 'Nightly re-checks catch liens removed or deposits pre-closed after acceptance.',
    'bdash.requests': 'Recent verification requests from AICTE',
    'bdash.requests_sub': 'Each time an officer or the nightly re-check asks your bank to confirm a deposit',
    'bdash.view_all': 'View all ({n})',
    'bdash.all_title': 'All verification requests from AICTE',
    'bdash.c_time': 'Received',
    'bdash.c_fdr': 'FDR number',
    'bdash.c_ref': 'Portal reference',
    'bdash.c_inst': 'Institution',
    'bdash.c_result': 'Result',
    'bdash.system': 'Nightly re-check',
    'bdash.by': 'by {name}',
    'bdash.r.confirmed': 'Confirmed',
    'bdash.r.mismatch': 'Mismatch',
    'bdash.r.not_found': 'Not found',
    'bdash.r.closed': 'Closed',
    'bdash.no_requests': 'No verification requests yet',
    'bdash.no_requests_text': 'Requests appear here when AICTE checks a deposit with your bank.',
    'bdash.ledger': 'Ledger at a glance',
    'bdash.s.active': 'Active',
    'bdash.s.matured': 'Matured',
    'bdash.s.renewed': 'Renewed',
    'bdash.s.closed': 'Pre-closed',
    'bdash.deposits_word': 'deposits',
    'bdash.maturing': 'Maturing in the next 90 days',
    'bdash.maturing_none': 'Nothing due',
    'bdash.maturing_none_text': 'No active deposit matures in the next 90 days.',
    'bdash.due': 'Due - mark matured',
    'bdash.open_ledger': 'Open deposit ledger',
  },
  hi: {
    'bdash.title': 'बैंक डैशबोर्ड',
    'bdash.subtitle': 'बैंक प्रणाली का अनुकरण: एआईसीटीई के पक्ष में ग्रहणाधिकार सहित सावधि जमा जारी करें और पोर्टल के सत्यापन अनुरोधों का उत्तर दें',
    'bdash.issue_btn': 'एफडीआर जारी करें',
    'bdash.ledger_btn': 'जमा खाता-बही',
    'bdash.sim_title': 'बैंक प्रणाली का अनुकरण',
    'bdash.sim_text': 'यह पृष्ठ {bank} की कोर-बैंकिंग प्रणाली के स्थान पर है, ताकि पूरी प्रक्रिया का आरंभ से अंत तक प्रदर्शन किया जा सके। दिखाया गया बैंक और सभी जमा काल्पनिक हैं।',
    'bdash.k_deposits': 'खाता-बही में जमा',
    'bdash.k_deposits_sub': '{active} सक्रिय · {matured} परिपक्व · {renewed} नवीनीकृत · {closed} समय-पूर्व बंद',
    'bdash.k_active': 'सक्रिय जमा',
    'bdash.k_active_sub': '{n} पर एआईसीटीई के पक्ष में ग्रहणाधिकार',
    'bdash.k_lien': 'एआईसीटीई के ग्रहणाधिकार में',
    'bdash.k_lien_sub': '{n} सक्रिय जमाओं में {amount}',
    'bdash.k_requests': 'सत्यापन अनुरोध',
    'bdash.k_requests_sub': 'पिछले 30 दिनों में एआईसीटीई से प्राप्त',
    'bdash.identity': 'बैंक पहचान एवं हस्ताक्षर कुंजी',
    'bdash.code': 'बैंक कोड',
    'bdash.ifsc_prefix': 'आईएफएससी उपसर्ग',
    'bdash.hq': 'प्रधान कार्यालय',
    'bdash.key_id': 'हस्ताक्षर कुंजी आईडी',
    'bdash.fingerprint': 'कुंजी फ़िंगरप्रिंट',
    'bdash.registered': 'कुंजी पंजीकरण तिथि',
    'bdash.public_key': 'सार्वजनिक कुंजी (Ed25519)',
    'bdash.copy': 'कॉपी करें',
    'bdash.copy_key': 'सार्वजनिक कुंजी कॉपी करें',
    'bdash.api_on': 'सत्यापन एपीआई जुड़ा है',
    'bdash.api_off': 'सत्यापन एपीआई बंद है',
    'bdash.key_explain': 'आपके द्वारा जारी रसीदों पर इस कुंजी से हस्ताक्षरित क्यूआर होता है; एआईसीटीई का पोर्टल यहाँ पंजीकृत सार्वजनिक कुंजी से उसका सत्यापन करता है।',
    'bdash.key_private': 'कुंजी का निजी भाग कभी बैंक से बाहर नहीं जाता। कोई भी व्यक्ति सार्वजनिक सत्यापन पृष्ठ पर रसीद की जाँच कर सकता है।',
    'bdash.portal_total': 'एआईसीटीई पोर्टल पर गिरवी',
    'bdash.portal_active': 'स्वीकृत एवं सक्रिय',
    'bdash.portal_requests': '30 दिनों में जाँच',
    'bdash.quick': 'त्वरित कार्य',
    'bdash.qa_issue': 'सावधि जमा जारी करें',
    'bdash.qa_issue_text': 'एआईसीटीई के पक्ष में ग्रहणाधिकार सहित जमा खोलें और हस्ताक्षरित क्यूआर वाली रसीद प्रिंट करें',
    'bdash.qa_ledger': 'जमा खाता-बही',
    'bdash.qa_ledger_text': 'ग्रहणाधिकार अंकित करें या हटाएँ, जमा समय-पूर्व बंद करें, परिपक्व या नवीनीकृत करें',
    'bdash.qa_verify': 'रसीद सत्यापित करें',
    'bdash.qa_verify_text': 'किसी भी रसीद का हस्ताक्षर ठीक उसी तरह जाँचें जैसे एआईसीटीई करता है',
    'bdash.how': 'हस्ताक्षरित रसीद एआईसीटीई की सुरक्षा कैसे करती है',
    'bdash.how1': 'बैंक एआईसीटीई के पक्ष में ग्रहणाधिकार सहित जमा खोलता है और रसीद के क्यूआर कोड पर अपनी निजी कुंजी से हस्ताक्षर करता है।',
    'bdash.how2': 'संस्थान रसीद एआईसीटीई के पोर्टल पर अपलोड करता है, जो क्यूआर को स्वतः पढ़ लेता है।',
    'bdash.how3': 'पोर्टल बैंक की पंजीकृत सार्वजनिक कुंजी से हस्ताक्षर जाँचता है और बैंक से वर्तमान स्थिति की पुष्टि माँगता है।',
    'bdash.how4': 'रात्रिकालीन पुनः-जाँच स्वीकृति के बाद हटाए गए ग्रहणाधिकार या समय-पूर्व बंद जमा को पकड़ लेती है।',
    'bdash.requests': 'एआईसीटीई से हाल के सत्यापन अनुरोध',
    'bdash.requests_sub': 'जब भी कोई अधिकारी या रात्रिकालीन पुनः-जाँच आपके बैंक से किसी जमा की पुष्टि माँगती है',
    'bdash.view_all': 'सभी देखें ({n})',
    'bdash.all_title': 'एआईसीटीई से प्राप्त सभी सत्यापन अनुरोध',
    'bdash.c_time': 'प्राप्ति समय',
    'bdash.c_fdr': 'एफडीआर संख्या',
    'bdash.c_ref': 'पोर्टल संदर्भ',
    'bdash.c_inst': 'संस्थान',
    'bdash.c_result': 'परिणाम',
    'bdash.system': 'रात्रिकालीन पुनः-जाँच',
    'bdash.by': '{name} द्वारा',
    'bdash.r.confirmed': 'पुष्टि',
    'bdash.r.mismatch': 'असंगति',
    'bdash.r.not_found': 'नहीं मिला',
    'bdash.r.closed': 'बंद',
    'bdash.no_requests': 'अभी तक कोई सत्यापन अनुरोध नहीं',
    'bdash.no_requests_text': 'जब एआईसीटीई आपके बैंक से किसी जमा की जाँच करेगा, अनुरोध यहाँ दिखाई देंगे।',
    'bdash.ledger': 'खाता-बही एक नज़र में',
    'bdash.s.active': 'सक्रिय',
    'bdash.s.matured': 'परिपक्व',
    'bdash.s.renewed': 'नवीनीकृत',
    'bdash.s.closed': 'समय-पूर्व बंद',
    'bdash.deposits_word': 'जमा',
    'bdash.maturing': 'अगले 90 दिनों में परिपक्व होने वाले',
    'bdash.maturing_none': 'कोई जमा देय नहीं',
    'bdash.maturing_none_text': 'अगले 90 दिनों में कोई सक्रिय जमा परिपक्व नहीं हो रहा है।',
    'bdash.due': 'देय - परिपक्व अंकित करें',
    'bdash.open_ledger': 'जमा खाता-बही खोलें',
  },
});

const headActions = () => el('div', { class: 'row' },
  el('a', { class: 'btn', href: site('bank/issue.html'), html: `${icon('plus', 16)}<span>${esc(t('bdash.issue_btn'))}</span>` }),
  el('a', { class: 'btn secondary', href: site('bank/deposits.html'), html: `${icon('list', 16)}<span>${esc(t('bdash.ledger_btn'))}</span>` }));

const { user } = await initPage({
  roles: ['bank'],
  active: 'dashboard',
  title: 'bdash.title',
  subtitle: 'bdash.subtitle',
  breadcrumbs: [{ label: { en: 'Bank portal (simulated)', hi: 'बैंक पोर्टल (अनुकरण)' } }, { label: 'nav.dashboard' }],
  actions: headActions,
});

const STATUS_COLORS = { active: COLORS.green, matured: COLORS.slate, renewed: COLORS.teal, closed: COLORS.red };
const RESULT_CLASS = { confirmed: 'b-success', mismatch: 'b-orange', not_found: 'b-danger', closed: 'b-danger' };
const RESULT_ICON = { confirmed: 'check-circle', mismatch: 'alert', not_found: 'x-circle', closed: 'ban' };

let summary = null;
let maturing = null;
let maturingErr = null;

function fillIcons(root = document) {
  $$('[data-icon]', root).forEach((n) => { if (!n.firstChild || n.dataset.filled !== '1') { n.innerHTML = icon(n.dataset.icon, 18); n.dataset.filled = '1'; } });
}

function resultBadge(result) {
  const cls = RESULT_CLASS[result] || 'b-slate';
  return `<span class="badge ${cls}">${icon(RESULT_ICON[result] || 'info', 12)}${esc(t(`bdash.r.${result}`, { _default: result }))}</span>`;
}

function requesterName(r) {
  return r.performed_by ? r.performed_by_name : t('bdash.system');
}

function requestColumns() {
  return [
    { key: 'at', label: t('bdash.c_time'), render: (r) => `<div class="nowrap">${esc(fmtDateTime(r.at))}</div><div class="cell-sub">${esc(t('bdash.by', { name: requesterName(r) }))}</div>` },
    { key: 'fdr_number', label: t('bdash.c_fdr'), render: (r) => `<span class="cell-main mono">${esc(r.fdr_number)}</span>` },
    { key: 'ref_no', label: t('bdash.c_ref'), render: (r) => `<span class="mono nowrap">${esc(r.ref_no || '—')}</span>` },
    {
      key: 'institution', label: t('bdash.c_inst'),
      render: (r) => (r.institution
        ? `<div class="cell-main">${esc(r.institution.name)}</div><div class="cell-sub">${esc([r.institution.city, r.institution.state].filter(Boolean).join(', '))} · <span class="mono">${esc(r.institution.aicte_id)}</span></div>`
        : '<span class="muted">—</span>'),
    },
    { key: 'result', label: t('bdash.c_result'), render: (r) => `<span title="${esc(r.summary || '')}">${resultBadge(r.result)}</span>` },
  ];
}

function renderKpis(s) {
  const c = s.counts;
  mount($('#kpis'),
    kpi({ label: t('bdash.k_deposits'), value: fmtNum(c.deposits), iconName: 'layers', color: 'info',
      sub: esc(t('bdash.k_deposits_sub', { active: fmtNum(c.active), matured: fmtNum(c.matured), renewed: fmtNum(c.renewed || 0), closed: fmtNum(c.closed) })) }),
    kpi({ label: t('bdash.k_active'), value: fmtNum(c.active), iconName: 'shield-check', color: 'success',
      sub: esc(t('bdash.k_active_sub', { n: fmtNum(c.lien_marked) })) }),
    kpi({ label: t('bdash.k_lien'), value: fmtINRShort(s.amount_under_lien), iconName: 'lock', color: 'saffron',
      title: fmtINR(s.amount_under_lien),
      sub: esc(t('bdash.k_lien_sub', { amount: fmtINR(s.amount_under_lien), n: fmtNum(c.lien_marked) })) }),
    kpi({ label: t('bdash.k_requests'), value: fmtNum(s.verification_requests_30d), iconName: 'shield', color: 'violet',
      sub: esc(t('bdash.k_requests_sub')) }));
}

function renderIdentity(s) {
  const b = s.bank;
  const copyBtn = el('button', {
    class: 'btn sm secondary', type: 'button', 'aria-label': t('bdash.copy_key'), title: t('bdash.copy_key'),
    html: `${icon('copy', 15)}<span>${esc(t('bdash.copy'))}</span>`, onclick: () => copyText(b.public_key),
  });
  const apiBadge = b.api_enabled
    ? `<span class="badge b-success">${icon('check-circle', 12)}${esc(t('bdash.api_on'))}</span>`
    : `<span class="badge b-danger">${icon('x-circle', 12)}${esc(t('bdash.api_off'))}</span>`;
  mount($('#identity'),
    el('div', { class: 'card-head' }, el('h3', { html: `${icon('key', 18)}<span>${esc(t('bdash.identity'))}</span>` }),
      el('span', { html: apiBadge })),
    el('div', { class: 'card-body stack lg' },
      el('div', { class: 'bk-id-head' },
        el('div', { class: 'feature-icon', html: icon('bank', 28) }),
        el('div', { class: 'grow' },
          el('h2', {}, b.name),
          el('div', { class: 'bk-id-sub', html: `<span class="badge b-primary mono">${esc(b.code)}</span> · ${esc(user.name)} · ${esc(user.email)}` }))),
      el('dl', { class: 'dl cols-3' },
        ...[
          [t('bdash.code'), `<span class="mono">${esc(b.code)}</span>`],
          [t('bdash.ifsc_prefix'), `<span class="mono">${esc(b.ifsc_prefix || '—')}</span>`],
          [t('bdash.hq'), esc(b.hq_city || '—')],
          [t('bdash.key_id'), `<span class="mono">${esc(b.key_id)}</span>`],
          [t('bdash.fingerprint'), `<span class="bk-fp">${esc(b.fingerprint)}</span>`],
          [t('bdash.registered'), esc(fmtDate(b.key_registered_at))],
        ].map(([k, v]) => el('div', {}, el('dt', {}, k), el('dd', { html: v })))),
      el('div', { class: 'stack sm' },
        el('div', { class: 'label', id: 'pk-label' }, t('bdash.public_key')),
        el('div', { class: 'bk-keybox' }, el('span', { class: 'mono', 'aria-labelledby': 'pk-label' }, b.public_key), copyBtn)),
      el('div', { class: 'alert info mb-0' }, el('span', { html: icon('qr', 18) }),
        el('div', {}, el('div', { class: 'a-title' }, t('bdash.key_explain')), el('div', {}, t('bdash.key_private')))),
      el('div', { class: 'bk-portal-strip' },
        stat(fmtNum(s.portal_fdrs.count), t('bdash.portal_total')),
        stat(fmtNum(s.portal_fdrs.active), t('bdash.portal_active')),
        stat(fmtNum(s.verification_requests_30d), t('bdash.portal_requests')))));
}

function stat(v, l) {
  return el('div', { class: 'stat-inline' }, el('span', { class: 'v' }, v), el('span', { class: 'l' }, l));
}

function renderActions() {
  const item = (href, ic, tone, title, text) => el('a', { class: 'bk-action', href, style: { color: 'inherit', textDecoration: 'none' } },
    el('div', { class: `feature-icon ${tone}`, html: icon(ic, 22) }),
    el('div', { class: 'grow' }, el('strong', {}, title), el('span', {}, text)),
    el('span', { class: 'bk-arrow', html: icon('chevron-right', 20) }));
  mount($('#actions'),
    item(site('bank/issue.html'), 'plus', '', t('bdash.qa_issue'), t('bdash.qa_issue_text')),
    item(site('bank/deposits.html'), 'list', 'teal', t('bdash.qa_ledger'), t('bdash.qa_ledger_text')),
    item(site('verify.html'), 'qr', 'saffron', t('bdash.qa_verify'), t('bdash.qa_verify_text')));
  mount($('#how'), ['bdash.how1', 'bdash.how2', 'bdash.how3', 'bdash.how4'].map((k) => el('li', {}, el('span', {}, t(k)))));
}

function renderRequests(s) {
  const btn = $('#all-requests');
  btn.hidden = !s.recent_requests.length;
  btn.innerHTML = `${icon('list', 15)}<span>${esc(t('bdash.view_all', { n: fmtNum(s.recent_total ?? s.recent_requests.length) }))}</span>`;
  renderTable($('#requests'), {
    columns: requestColumns(),
    rows: s.recent_requests,
    rowClass: (r) => (r.result === 'confirmed' ? '' : 'row-danger'),
    empty: { icon: 'inbox', title: t('bdash.no_requests'), text: t('bdash.no_requests_text') },
  });
}

function renderStatus(s) {
  const c = s.counts;
  const keys = ['active', 'matured', 'renewed', 'closed'];
  const data = keys.map((k) => c[k] || 0);
  try {
    const ch = doughnutChart($('#status-chart'), {
      labels: keys.map((k) => t(`bdash.s.${k}`)), data, colors: keys.map((k) => STATUS_COLORS[k]),
      center: { value: fmtNum(c.deposits), label: t('bdash.deposits_word') }, legend: false,
    });
    // after the entrance animation, later resizes (window, print, screenshots) redraw instantly
    setTimeout(() => { ch.options.animation = false; }, 900);
  } catch (e) { /* chart library unavailable - the legend below still shows the numbers */ }
  mount($('#status-legend'), keys.map((k, i) => el('div', { class: 'row between' },
    el('span', { class: 'row', style: { gap: '8px' } }, el('span', { class: 'bk-swatch', style: { background: STATUS_COLORS[k] } }), t(`bdash.s.${k}`)),
    el('strong', { class: 'num' }, fmtNum(data[i])))));
}

function renderMaturing() {
  const box = $('#maturing');
  if (maturingErr) return errorState(box, maturingErr, loadMaturing);
  if (!maturing) return loading(box);
  if (!maturing.length) return emptyState(box, { icon: 'calendar', title: t('bdash.maturing_none'), text: t('bdash.maturing_none_text') });
  return mount(box, maturing.map((d) => el('div', { class: 'bk-mat-item' },
    el('div', { class: 'li-main' },
      el('div', { class: 'li-title mono' }, d.fdr_number),
      el('div', { class: 'li-sub', title: d.institution ? d.institution.name : d.holder_name }, `${fmtINRShort(d.amount)} · ${d.institution ? d.institution.name : d.holder_name}`)),
    el('div', { class: 'right' },
      el('div', { html: d.due ? `<span class="badge b-warning">${esc(t('bdash.due'))}</span>` : maturityChip(d.days_to_maturity) }),
      el('div', { class: 'small muted nowrap' }, fmtDate(d.maturity_date))))));
}

function render() {
  if (!summary) return;
  mount($('#sim-note'), el('span', { html: icon('info', 18) }),
    el('div', {}, el('div', { class: 'a-title' }, t('bdash.sim_title')), el('div', {}, t('bdash.sim_text', { bank: summary.bank.name }))));
  renderKpis(summary);
  renderIdentity(summary);
  renderActions();
  renderRequests(summary);
  renderStatus(summary);
  renderMaturing();
  fillIcons();
}

async function load() {
  $('#dash').hidden = true;
  loading($('#state'));
  try {
    const [s, req] = await Promise.all([
      api.get('/bank/summary'),
      api.get('/bank/requests', { page: 1, page_size: 1 }).catch(() => null),
    ]);
    summary = s;
    summary.recent_total = req ? req.total : s.recent_requests.length;
    mount($('#state'));
    $('#dash').hidden = false;
    render();
  } catch (err) {
    errorState($('#state'), err, load);
  }
}

async function loadMaturing() {
  maturing = null; maturingErr = null;
  renderMaturing();
  try {
    const r = await api.get('/bank/deposits', { status: 'active', page_size: 200 });
    maturing = r.items.filter((d) => d.days_to_maturity <= 90)
      .sort((a, b) => a.days_to_maturity - b.days_to_maturity).slice(0, 6);
  } catch (err) {
    maturingErr = err;
  }
  renderMaturing();
}

/* ---------------------------------------------------------------- all requests (modal, paginated) */
function openAllRequests() {
  const body = el('div', {});
  const tableBox = el('div', { style: { border: '1px solid var(--nk-border)', borderRadius: 'var(--nk-radius)' } });
  const pagerBox = el('div');
  body.append(tableBox, pagerBox);
  const PAGE = 15;
  let page = 1;
  async function go() {
    loading(tableBox);
    try {
      const r = await api.get('/bank/requests', { page, page_size: PAGE });
      renderTable(tableBox, {
        columns: requestColumns(), rows: r.items, compact: true,
        rowClass: (x) => (x.result === 'confirmed' ? '' : 'row-danger'),
        empty: { icon: 'inbox', title: t('bdash.no_requests'), text: t('bdash.no_requests_text') },
      });
      pagination(pagerBox, { page, pageSize: PAGE, total: r.total, onChange: (p) => { page = p; go(); } });
    } catch (err) {
      errorState(tableBox, err, go);
      mount(pagerBox);
    }
  }
  modal({ title: t('bdash.all_title'), body, size: 'xwide', actions: [{ label: t('common.close'), variant: 'secondary' }] });
  go();
}

$('#all-requests').addEventListener('click', openAllRequests);
$('#ledger-link').href = site('bank/deposits.html');
fillIcons();
onLang(() => { fillIcons(); render(); });
load();
loadMaturing();
