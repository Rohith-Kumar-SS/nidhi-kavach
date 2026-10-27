// Institution home: coverage against the required deposit, what needs doing, buckets, maturities, releases, alerts.
import { initPage, setPageHead } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang, getLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, mount, kpi, statusBadge, trustBadge, releaseBadge, maturityChip, fmtINR, fmtINRShort, fmtDate,
  fmtDateTime, relDays, loading, emptyState, errorState, timeline,
} from '../assets/js/ui.js';

extend({
  en: {
    'idash.title': 'Institution dashboard',
    'idash.welcome': 'Welcome, {name}',
    'idash.aicte': 'AICTE ID {id}',
    'idash.submit': 'Submit FDR',
    'idash.my_fdrs': 'My FDRs',
    'idash.cov.title': 'Security deposit coverage',
    'idash.cov.sub': 'Required by AICTE for a {type} institution',
    'idash.cov.covered_word': 'covered',
    'idash.cov.required': 'Required deposit',
    'idash.cov.covered': 'Covered by valid FDRs',
    'idash.cov.shortfall': 'Shortfall',
    'idash.cov.ok_title': 'Fully covered',
    'idash.cov.ok_text': 'Your security deposit requirement is fully covered by active, verified instruments.',
    'idash.cov.short_title': 'Shortfall of {amount}',
    'idash.cov.short_text': 'Your active instruments cover {covered} of the {required} required. Submit an FDR for the balance to stay compliant.',
    'idash.cov.hint': 'Counts active instruments whose receipt has been matched or bank-verified and that have not matured.',
    'idash.fact.active': '{n} active instruments',
    'idash.fact.disc': '{n} open discrepancies',
    'idash.fact.est': 'Established {y}',
    'idash.fact.approval': 'Approval: {s}',
    'idash.approval.approved': 'approved',
    'idash.approval.pending': 'pending',
    'idash.approval.withdrawn': 'withdrawn',
    'idash.act.title': 'Action needed',
    'idash.act.sub': 'Most urgent first',
    'idash.act.none_title': 'Nothing needs your attention',
    'idash.act.none_text': 'All instruments are in order. We will remind you well before any deposit matures.',
    'idash.kind.returned': 'Returned for corrections',
    'idash.kind.discrepancy': 'Discrepancy to answer',
    'idash.kind.renewal_overdue': 'Renewal overdue',
    'idash.kind.renewal_due': 'Renewal due',
    'idash.kind.release_returned': 'Release request returned',
    'idash.kind.shortfall': 'Deposit shortfall',
    'idash.btn.returned': 'Respond',
    'idash.btn.discrepancy': 'Respond',
    'idash.btn.renewal_overdue': 'Renew now',
    'idash.btn.renewal_due': 'Renew',
    'idash.btn.release_returned': 'Update & resubmit',
    'idash.btn.shortfall': 'Submit FDR',
    'idash.buckets': 'Your instruments by category',
    'idash.buckets_sub': 'Select a tile to see the instruments',
    'idash.bsub.active': 'Valid for more than 90 days',
    'idash.bsub.expiring': 'Matures within 90 days',
    'idash.bsub.matured': 'Past maturity - renew now',
    'idash.bsub.pending': 'Awaiting AICTE action',
    'idash.bsub.renewed': 'Replaced by a newer FDR',
    'idash.bsub.released': 'Returned with NOC',
    'idash.bsub.rejected': 'Rejected or invoked',
    'idash.up.title': 'Upcoming maturities',
    'idash.up.sub': 'Renew before maturity so the deposit stays protected',
    'idash.up.empty': 'No instruments are maturing',
    'idash.up.empty_text': 'Active deposits will appear here as they approach maturity.',
    'idash.up.renew': 'Renew',
    'idash.up.renewal_in_hand': 'Renewal submitted',
    'idash.up.view': 'View',
    'idash.up.matured_on': 'Matured on {d}',
    'idash.up.matures_on': 'Matures on {d}',
    'idash.trust.title': 'How far your instruments are verified',
    'idash.trust.sub': 'Instruments currently held or under verification',
    'idash.trust.0': 'You declared the details; not yet checked.',
    'idash.trust.1': 'The uploaded receipt matches your declaration.',
    'idash.trust.2': 'Confirmed by the issuing bank - strongest proof.',
    'idash.trust.flagged': '{n} instrument(s) flagged with a serious discrepancy - please respond.',
    'idash.rel.title': 'Open release requests',
    'idash.rel.empty': 'No open requests',
    'idash.rel.empty_text': 'Request release of a matured, verified deposit from its page.',
    'idash.rel.all': 'All requests',
    'idash.ntf.title': 'Latest notifications',
    'idash.ntf.all': 'View all',
    'idash.ntf.empty': 'No notifications yet',
    'sla.left_d': '{n} days left',
    'sla.left_h': '{n} h left',
    'sla.over_d': 'Overdue by {n} days',
    'sla.over_h': 'Overdue by {n} h',
    'tpl.MATURITY_REMINDER': 'Maturity reminder',
    'tpl.MATURED_OVERDUE': 'Renewal overdue',
    'tpl.FDR_ACCEPTED': 'Accepted',
    'tpl.FDR_RETURNED': 'Returned',
    'tpl.FDR_REJECTED': 'Rejected',
    'tpl.DISCREPANCY_RAISED': 'Discrepancy',
    'tpl.RELEASE_STAGE': 'Release update',
    'tpl.RELEASE_DONE': 'NOC issued',
    'tpl.RELEASE_SUBMITTED': 'Release request',
    'tpl.ESCALATION': 'Escalation',
    'tpl.WELCOME': 'Welcome',
    'tpl.BANK_ALERT': 'Bank alert',
    'tpl.other': 'Notice',
  },
  hi: {
    'idash.title': 'संस्थान डैशबोर्ड',
    'idash.welcome': 'स्वागत है, {name}',
    'idash.aicte': 'एआईसीटीई आईडी {id}',
    'idash.submit': 'एफडीआर जमा करें',
    'idash.my_fdrs': 'मेरी एफडीआर',
    'idash.cov.title': 'प्रतिभूति जमा कवरेज',
    'idash.cov.sub': '{type} संस्थान के लिए एआईसीटीई द्वारा अपेक्षित',
    'idash.cov.covered_word': 'कवर',
    'idash.cov.required': 'अपेक्षित जमा',
    'idash.cov.covered': 'मान्य एफडीआर द्वारा कवर',
    'idash.cov.shortfall': 'कमी',
    'idash.cov.ok_title': 'पूर्ण रूप से कवर',
    'idash.cov.ok_text': 'आपकी प्रतिभूति जमा की आवश्यकता सक्रिय और सत्यापित लिखतों से पूरी तरह कवर है।',
    'idash.cov.short_title': '{amount} की कमी',
    'idash.cov.short_text': 'आपकी सक्रिय लिखतें अपेक्षित {required} में से {covered} कवर करती हैं। अनुपालन बनाए रखने के लिए शेष राशि की एफडीआर जमा करें।',
    'idash.cov.hint': 'केवल वे सक्रिय लिखतें गिनी जाती हैं जिनकी रसीद का मिलान या बैंक सत्यापन हो चुका है और जो परिपक्व नहीं हुई हैं।',
    'idash.fact.active': '{n} सक्रिय लिखतें',
    'idash.fact.disc': '{n} खुली विसंगतियाँ',
    'idash.fact.est': 'स्थापना {y}',
    'idash.fact.approval': 'अनुमोदन: {s}',
    'idash.approval.approved': 'स्वीकृत',
    'idash.approval.pending': 'लंबित',
    'idash.approval.withdrawn': 'वापस लिया गया',
    'idash.act.title': 'आवश्यक कार्रवाई',
    'idash.act.sub': 'सबसे ज़रूरी पहले',
    'idash.act.none_title': 'कोई कार्रवाई लंबित नहीं',
    'idash.act.none_text': 'सभी लिखतें ठीक हैं। किसी भी जमा के परिपक्व होने से काफ़ी पहले हम आपको याद दिलाएँगे।',
    'idash.kind.returned': 'सुधार हेतु लौटाई गई',
    'idash.kind.discrepancy': 'विसंगति का उत्तर दें',
    'idash.kind.renewal_overdue': 'नवीनीकरण अतिदेय',
    'idash.kind.renewal_due': 'नवीनीकरण देय',
    'idash.kind.release_returned': 'रिलीज़ अनुरोध लौटाया गया',
    'idash.kind.shortfall': 'जमा राशि में कमी',
    'idash.btn.returned': 'उत्तर दें',
    'idash.btn.discrepancy': 'उत्तर दें',
    'idash.btn.renewal_overdue': 'अभी नवीनीकरण करें',
    'idash.btn.renewal_due': 'नवीनीकरण करें',
    'idash.btn.release_returned': 'अद्यतन कर पुनः भेजें',
    'idash.btn.shortfall': 'एफडीआर जमा करें',
    'idash.hi.returned': '{ref} सुधार हेतु लौटाई गई है - टिप्पणियों का उत्तर दें',
    'idash.hi.discrepancy': '{ref} पर उठाई गई विसंगति का उत्तर दें',
    'idash.hi.renewal_overdue': '{ref} परिपक्व हो चुकी है - नवीनीकृत एफडीआर तुरंत जमा करें',
    'idash.hi.renewal_due': '{ref} की परिपक्वता निकट है - परिपक्वता से पहले नवीनीकरण करें',
    'idash.hi.release_returned': 'रिलीज़ अनुरोध {ref} के लिए और जानकारी चाहिए - अद्यतन कर पुनः भेजें',
    'idash.hi.shortfall': 'अपेक्षित {required} के मुकाबले {amount} की कमी - अतिरिक्त एफडीआर जमा करें',
    'idash.buckets': 'श्रेणी अनुसार आपकी लिखतें',
    'idash.buckets_sub': 'लिखतें देखने के लिए किसी टाइल को चुनें',
    'idash.bsub.active': '90 दिन से अधिक के लिए मान्य',
    'idash.bsub.expiring': '90 दिन के भीतर परिपक्व',
    'idash.bsub.matured': 'परिपक्व - अभी नवीनीकरण करें',
    'idash.bsub.pending': 'एआईसीटीई की कार्रवाई की प्रतीक्षा',
    'idash.bsub.renewed': 'नई एफडीआर से प्रतिस्थापित',
    'idash.bsub.released': 'एनओसी सहित लौटाई गई',
    'idash.bsub.rejected': 'अस्वीकृत या भुनाई गई',
    'idash.up.title': 'आगामी परिपक्वताएँ',
    'idash.up.sub': 'जमा सुरक्षित रखने के लिए परिपक्वता से पहले नवीनीकरण करें',
    'idash.up.empty': 'कोई लिखत परिपक्व नहीं हो रही',
    'idash.up.empty_text': 'सक्रिय जमा परिपक्वता के निकट आने पर यहाँ दिखेंगी।',
    'idash.up.renew': 'नवीनीकरण',
    'idash.up.renewal_in_hand': 'नवीनीकरण प्रस्तुत',
    'idash.up.view': 'देखें',
    'idash.up.matured_on': '{d} को परिपक्व',
    'idash.up.matures_on': '{d} को परिपक्व होगी',
    'idash.trust.title': 'आपकी लिखतों का सत्यापन कहाँ तक हुआ',
    'idash.trust.sub': 'वर्तमान में रखी गई या सत्यापनाधीन लिखतें',
    'idash.trust.0': 'आपने विवरण घोषित किए हैं; अभी जाँच नहीं हुई।',
    'idash.trust.1': 'अपलोड की गई रसीद आपकी घोषणा से मेल खाती है।',
    'idash.trust.2': 'जारी करने वाले बैंक द्वारा पुष्टि - सबसे मज़बूत प्रमाण।',
    'idash.trust.flagged': '{n} लिखत गंभीर विसंगति के कारण चिह्नित - कृपया उत्तर दें।',
    'idash.rel.title': 'खुले रिलीज़ अनुरोध',
    'idash.rel.empty': 'कोई खुला अनुरोध नहीं',
    'idash.rel.empty_text': 'परिपक्व और सत्यापित जमा की रिलीज़ का अनुरोध उसके पृष्ठ से करें।',
    'idash.rel.all': 'सभी अनुरोध',
    'idash.ntf.title': 'नवीनतम सूचनाएँ',
    'idash.ntf.all': 'सभी देखें',
    'idash.ntf.empty': 'अभी कोई सूचना नहीं',
    'sla.left_d': '{n} दिन शेष',
    'sla.left_h': '{n} घंटे शेष',
    'sla.over_d': '{n} दिन विलंब',
    'sla.over_h': '{n} घंटे विलंब',
    'tpl.MATURITY_REMINDER': 'परिपक्वता अनुस्मारक',
    'tpl.MATURED_OVERDUE': 'नवीनीकरण अतिदेय',
    'tpl.FDR_ACCEPTED': 'स्वीकृत',
    'tpl.FDR_RETURNED': 'लौटाई गई',
    'tpl.FDR_REJECTED': 'अस्वीकृत',
    'tpl.DISCREPANCY_RAISED': 'विसंगति',
    'tpl.RELEASE_STAGE': 'रिलीज़ अद्यतन',
    'tpl.RELEASE_DONE': 'एनओसी जारी',
    'tpl.RELEASE_SUBMITTED': 'रिलीज़ अनुरोध',
    'tpl.ESCALATION': 'एस्केलेशन',
    'tpl.WELCOME': 'स्वागत',
    'tpl.BANK_ALERT': 'बैंक अलर्ट',
    'tpl.other': 'सूचना',
  },
});

const { user } = await initPage({
  roles: ['institution'],
  active: 'dashboard',
  title: 'idash.title',
  breadcrumbs: [{ label: 'nav.dashboard' }],
  actions: headActions,
});

const root = $('#root');
let dash = null;
let fdrs = null;

function headActions() {
  return [
    el('a', { class: 'btn secondary', href: site('institution/fdrs.html'), html: `${icon('list', 16)}<span>${esc(t('idash.my_fdrs'))}</span>` }),
    el('a', { class: 'btn saffron', href: site('institution/submit.html'), html: `${icon('upload', 16)}<span>${esc(t('idash.submit'))}</span>` }),
  ];
}

const SEV_TONE = { critical: 'danger', high: 'danger', medium: 'warning', low: '' };
const KIND_ICON = { returned: 'flag', discrepancy: 'alert-circle', renewal_overdue: 'alert', renewal_due: 'refresh', release_returned: 'send', shortfall: 'wallet' };
const BUCKETS = [
  ['active', 'shield-check', 'success'], ['expiring', 'clock', 'warning'], ['matured', 'alert', 'danger'],
  ['pending', 'hourglass', 'info'], ['renewed', 'refresh', 'teal'], ['released', 'unlock', 'slate'], ['rejected', 'ban', 'orange'],
];

function slaText(hours) {
  if (hours === null || hours === undefined) return '';
  const a = Math.abs(hours);
  const big = a >= 48;
  const n = big ? Math.round(a / 24) : Math.max(1, Math.round(a));
  if (hours >= 0) return t(big ? 'sla.left_d' : 'sla.left_h', { n });
  return t(big ? 'sla.over_d' : 'sla.over_h', { n });
}

function refOf(text) {
  const m = String(text || '').match(/NK-(?:FDR|REL)-\d{4}-\d{5}/);
  return m ? m[0] : '';
}

function actionTitle(a) {
  if (getLang() !== 'hi') return a.title;
  const inst = dash.institution;
  return t(`idash.hi.${a.kind}`, { ref: refOf(a.title), amount: fmtINR(inst.shortfall), required: fmtINR(inst.required_deposit), _default: a.title });
}

/* ------------------------------------------------------------------ sections */
function coverageCard() {
  const inst = dash.institution;
  const pct = Math.max(0, Math.min(100, Number(inst.coverage_pct) || 0));
  const short = inst.shortfall > 0;
  const meterTone = pct >= 100 ? '' : pct >= 50 ? 'warning' : 'danger';
  const approval = t(`idash.approval.${inst.approval_status}`, { _default: inst.approval_status || '—' });
  return el('section', { class: `card ${short ? 'accent-danger' : 'accent-green'}`, 'aria-labelledby': 'cov-h' },
    el('div', { class: 'card-head' },
      el('h2', { id: 'cov-h', html: `${icon('shield', 18)}<span>${esc(t('idash.cov.title'))}</span>` }),
      el('span', { class: 'sub' }, t('idash.cov.sub', { type: inst.type || '' }))),
    el('div', { class: 'card-body stack' },
      el('div', { class: 'row nowrap', style: { gap: '18px', alignItems: 'center' } },
        el('div', {},
          el('div', { class: 'idash-pct', style: { color: short ? 'var(--nk-danger)' : 'var(--nk-success)' } }, `${Math.round(pct)}%`),
          el('div', { class: 'muted small' }, t('idash.cov.covered_word'))),
        el('div', { class: 'grow' },
          el('div', { class: `meter lg ${meterTone}`, role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(pct)), 'aria-label': t('idash.cov.title') },
            el('span', { style: { width: `${pct}%` } })),
          el('div', { class: 'row between small muted mt-1' }, el('span', {}, fmtINRShort(0)), el('span', {}, fmtINRShort(inst.required_deposit))))),
      el('div', { class: 'idash-cov-figs' },
        el('div', { class: 'fig' }, el('div', { class: 'l' }, t('idash.cov.required')), el('div', { class: 'v' }, fmtINR(inst.required_deposit))),
        el('div', { class: `fig ${short ? '' : 'good'}` }, el('div', { class: 'l' }, t('idash.cov.covered')), el('div', { class: 'v' }, fmtINR(inst.covered_amount))),
        el('div', { class: `fig ${short ? 'bad' : 'good'}` }, el('div', { class: 'l' }, t('idash.cov.shortfall')), el('div', { class: 'v' }, fmtINR(inst.shortfall)))),
      short
        ? el('div', { class: 'alert danger' }, el('span', { html: icon('alert-circle', 20) }),
          el('div', { class: 'grow' },
            el('div', { class: 'a-title' }, t('idash.cov.short_title', { amount: fmtINR(inst.shortfall) })),
            el('div', {}, t('idash.cov.short_text', { covered: fmtINR(inst.covered_amount), required: fmtINR(inst.required_deposit) })),
            el('div', { class: 'mt-2' }, el('a', { class: 'btn danger sm', href: site('institution/submit.html'), html: `${icon('upload', 15)}<span>${esc(t('idash.submit'))}</span>` }))))
        : el('div', { class: 'alert success' }, el('span', { html: icon('check-circle', 20) }),
          el('div', {}, el('div', { class: 'a-title' }, t('idash.cov.ok_title')), el('div', {}, t('idash.cov.ok_text')))),
      el('div', { class: 'hint small muted', html: `${icon('info', 14)} ${esc(t('idash.cov.hint'))}` }),
      el('div', { class: 'idash-facts' },
        el('span', { html: `${icon('shield-check', 15)}${esc(t('idash.fact.active', { n: inst.active_count }))}` }),
        el('span', { html: `${icon('flag', 15)}${esc(t('idash.fact.disc', { n: inst.open_discrepancies }))}` }),
        inst.established_year ? el('span', { html: `${icon('building', 15)}${esc(t('idash.fact.est', { y: inst.established_year }))}` }) : null,
        el('span', { html: `${icon('stamp', 15)}${esc(t('idash.fact.approval', { s: approval }))}` }))));
}

function actionsCard() {
  const items = dash.action_needed || [];
  const card = el('section', { class: 'card', 'aria-labelledby': 'act-h' },
    el('div', { class: 'card-head' },
      el('h2', { id: 'act-h', html: `${icon('bell', 18)}<span>${esc(t('idash.act.title'))}</span>${items.length ? ` <span class="badge b-danger">${items.length}</span>` : ''}` }),
      items.length ? el('span', { class: 'sub' }, t('idash.act.sub')) : null));
  if (!items.length) {
    card.appendChild(el('div', { class: 'idash-allclear' },
      el('div', { class: 'feature-icon green', html: icon('check-circle', 24) }),
      el('div', {}, el('div', { style: { fontWeight: 700 } }, t('idash.act.none_title')), el('div', { class: 'muted small' }, t('idash.act.none_text')))));
    return card;
  }
  card.appendChild(el('div', { class: 'list-divided' }, items.map((a) => el('div', { class: 'list-item idash-action' },
    el('div', { class: `li-icon ${SEV_TONE[a.severity] || ''}`, html: icon(KIND_ICON[a.kind] || 'info', 18) }),
    el('div', { class: 'li-main' },
      el('div', { class: `kind ${a.severity}` }, t(`idash.kind.${a.kind}`, { _default: a.kind })),
      el('div', { class: 'li-title' }, actionTitle(a))),
    a.link ? el('a', { class: `btn sm ${a.severity === 'critical' ? 'danger' : 'secondary'}`, href: site(a.link) }, t(`idash.btn.${a.kind}`, { _default: t('common.open') })) : null))));
  return card;
}

function bucketsSection() {
  const counts = dash.counts || {};
  return el('section', { class: 'section mb-0', 'aria-labelledby': 'bk-h' },
    el('div', { class: 'section-title' },
      el('h2', { id: 'bk-h', style: { fontSize: '1.1rem' } }, t('idash.buckets')),
      el('span', { class: 'muted small' }, t('idash.buckets_sub'))),
    el('div', { class: 'idash-buckets' }, BUCKETS.map(([key, ic, color]) => kpi({
      label: t(`cat.${key}`), value: String(counts[key] || 0), color, iconName: ic, sub: esc(t(`idash.bsub.${key}`)),
      onClick: () => { location.href = site(`institution/fdrs.html?cat=${key}`); },
    }))));
}

function renewIds() {
  const ids = new Set();
  for (const a of dash.action_needed || []) {
    const m = String(a.link || '').match(/renew=(\d+)/);
    if (m) ids.add(Number(m[1]));
  }
  return ids;
}

function upcomingCard() {
  const body = el('div', { class: 'card-body' });
  const card = el('section', { class: 'card', 'aria-labelledby': 'up-h' },
    el('div', { class: 'card-head' },
      el('h2', { id: 'up-h', html: `${icon('calendar', 18)}<span>${esc(t('idash.up.title'))}</span>` }),
      el('span', { class: 'sub' }, t('idash.up.sub'))),
    body);
  let list;
  if (fdrs) {
    list = fdrs.filter((f) => f.status === 'ACTIVE' || f.status === 'RELEASE_REQUESTED')
      .sort((a, b) => a.days_to_maturity - b.days_to_maturity).slice(0, 6);
  } else {
    list = dash.upcoming || [];
  }
  if (!list.length) {
    emptyState(body, { icon: 'calendar', title: t('idash.up.empty'), text: t('idash.up.empty_text') });
    return card;
  }
  const renewable = renewIds();
  const items = list.map((f) => {
    const d = f.days_to_maturity;
    const tone = d < 0 ? 'danger' : d <= 90 ? 'warning' : 'success';
    const title = el('div', { class: 't-title' },
      el('a', { href: site(`institution/fdr.html?id=${f.id}`), class: 'mono' }, f.ref_no),
      el('span', { html: statusBadge(f.display_status) }),
      el('span', { html: maturityChip(d) }));
    const actions = el('div', { class: 't-actions' });
    if (f.status === 'ACTIVE' && renewable.has(f.id)) {
      actions.appendChild(el('a', { class: `btn sm ${d < 0 ? 'danger' : 'saffron'}`, href: site(`institution/submit.html?renew=${f.id}`), html: `${icon('refresh', 14)}<span>${esc(t('idash.up.renew'))}</span>` }));
    } else if (f.status === 'ACTIVE' && d <= 90) {
      actions.appendChild(el('span', { class: 'badge b-teal', html: `${icon('check', 12)}${esc(t('idash.up.renewal_in_hand'))}` }));
    }
    actions.appendChild(el('a', { class: 'btn sm ghost', href: site(`institution/fdr.html?id=${f.id}`) }, t('idash.up.view')));
    const body2 = el('div', {},
      el('div', { class: 't-body' }, `${fmtINR(f.amount)} · ${f.bank ? f.bank.name : ''} · ${f.fdr_number}`),
      actions);
    return { title, meta: t(d < 0 ? 'idash.up.matured_on' : 'idash.up.matures_on', { d: fmtDate(f.maturity_date) }), body: body2, tone };
  });
  timeline(body, items);
  body.firstElementChild?.classList.add('idash-up');
  return card;
}

function trustCard() {
  if (!fdrs) return null;
  const live = fdrs.filter((f) => !['RENEWED', 'RELEASED', 'REJECTED', 'INVOKED'].includes(f.status));
  const c = { 0: 0, 1: 0, 2: 0 };
  let flagged = 0;
  for (const f of live) { c[f.trust_level] = (c[f.trust_level] || 0) + 1; if (f.flagged) flagged += 1; }
  const icons = { 0: 'user', 1: 'file-check', 2: 'shield-check' };
  return el('section', { class: 'card', 'aria-labelledby': 'tr-h' },
    el('div', { class: 'card-head' },
      el('h2', { id: 'tr-h', html: `${icon('layers', 18)}<span>${esc(t('idash.trust.title'))}</span>` }),
      el('span', { class: 'sub' }, t('idash.trust.sub'))),
    el('div', { class: 'card-body stack' },
      el('div', { class: 'trust-ladder idash-trust' }, [0, 1, 2].map((lv) => el('div', { class: `rung l${lv} ${c[lv] ? 'on' : ''}` },
        el('div', { class: 'r-title', html: `${icon(icons[lv], 15)}<span>${lv} · ${esc(t(`trust.${lv}`))}</span>` }),
        el('div', { class: 'r-count' }, String(c[lv])),
        el('div', {}, t(`idash.trust.${lv}`))))),
      flagged ? el('div', { class: 'alert danger' }, el('span', { html: icon('flag', 18) }), el('div', {}, t('idash.trust.flagged', { n: flagged }))) : null));
}

function releasesCard() {
  const rels = dash.releases || [];
  const body = el('div', { class: 'list-divided' });
  const card = el('section', { class: 'card', 'aria-labelledby': 'rel-h' },
    el('div', { class: 'card-head' },
      el('h2', { id: 'rel-h', html: `${icon('unlock', 18)}<span>${esc(t('idash.rel.title'))}</span>` }),
      el('a', { class: 'small', href: site('institution/releases.html') }, t('idash.rel.all'))),
    body);
  if (!rels.length) {
    emptyState(body, { icon: 'unlock', title: t('idash.rel.empty'), text: t('idash.rel.empty_text') });
    return card;
  }
  rels.forEach((r) => body.appendChild(el('a', { class: 'list-item', href: site(`institution/release.html?id=${r.id}`), style: { color: 'inherit', textDecoration: 'none' } },
    el('div', { class: 'li-icon', html: icon('stamp', 18) }),
    el('div', { class: 'li-main' },
      el('div', { class: 'li-title row', style: { gap: '8px' } }, el('span', { class: 'mono' }, r.ref_no), el('span', { html: releaseBadge(r.status) })),
      el('div', { class: 'li-sub' }, `${t(`rtype.${r.request_type}`, { _default: r.request_type })} · ${r.fdr_ref_no || ''} · ${fmtINR(r.amount)}`),
      r.sla_hours_left !== null && r.sla_hours_left !== undefined
        ? el('div', { class: 'mt-1', html: `<span class="badge ${r.sla_breached ? 'b-danger' : r.sla_hours_left < 48 ? 'b-warning' : 'b-slate'}">${icon('clock', 12)}${esc(slaText(r.sla_hours_left))}</span>` })
        : null),
    el('span', { class: 'muted', html: icon('chevron-right', 18) }))));
  return card;
}

function notificationsCard() {
  const items = dash.notifications || [];
  const body = el('div', { class: 'list-divided' });
  const card = el('section', { class: 'card', 'aria-labelledby': 'ntf-h' },
    el('div', { class: 'card-head' },
      el('h2', { id: 'ntf-h', html: `${icon('bell', 18)}<span>${esc(t('idash.ntf.title'))}</span>` }),
      el('a', { class: 'small', href: site('notifications.html') }, t('idash.ntf.all'))),
    body);
  if (!items.length) {
    emptyState(body, { icon: 'bell', title: t('idash.ntf.empty') });
    return card;
  }
  items.forEach((n) => {
    const tone = n.level === 'critical' ? 'danger' : n.level === 'warning' ? 'warning' : '';
    const tag = t(`tpl.${n.template}`, { _default: t('tpl.other') });
    const inner = [
      el('div', { class: `li-icon ${tone}`, html: icon(n.level === 'critical' ? 'alert-circle' : n.level === 'warning' ? 'alert' : 'bell', 17) }),
      el('div', { class: 'li-main' },
        el('div', { class: 'li-sub', style: { fontWeight: 600 } }, tag),
        el('div', { class: 'li-title', style: { fontWeight: n.status === 'sent' ? 700 : 500 } }, n.subject),
        el('div', { class: 'li-sub' }, fmtDateTime(n.created_at))),
    ];
    body.appendChild(n.link
      ? el('a', { class: `list-item ${n.status === 'sent' ? 'unread' : ''}`, href: site(n.link), style: { color: 'inherit', textDecoration: 'none' } }, ...inner)
      : el('div', { class: `list-item ${n.status === 'sent' ? 'unread' : ''}` }, ...inner));
  });
  return card;
}

/* ------------------------------------------------------------------ render */
function render() {
  if (!dash) return;
  const inst = dash.institution;
  setPageHead({
    title: inst.name,
    subtitle: [t('idash.welcome', { name: user.name }), t('idash.aicte', { id: inst.aicte_id }), [inst.city, inst.state].filter(Boolean).join(', ')].filter(Boolean).join(' · '),
    breadcrumbs: [{ label: 'nav.dashboard' }],
    actions: headActions,
  });
  mount(root,
    el('div', { class: 'grid g-3-2' }, coverageCard(), actionsCard()),
    bucketsSection(),
    el('div', { class: 'grid g-3-2' },
      el('div', { class: 'stack lg' }, upcomingCard(), trustCard()),
      el('div', { class: 'stack lg' }, releasesCard(), notificationsCard())));
}

async function load() {
  loading(root);
  try {
    const [d, list] = await Promise.all([
      api.get('/dashboard/institution'),
      api.get('/fdrs', { page_size: 200, sort: 'maturity_date', order: 'asc' }).catch(() => null),
    ]);
    dash = d;
    fdrs = list ? list.items : null;
    render();
  } catch (err) {
    errorState(root, err, load);
  }
}

onLang(render);
load();
