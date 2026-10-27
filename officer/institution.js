// Officer · Institution detail: profile, security-deposit coverage, instruments, renewal history and banks.
import { initPage, setPageHead } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang, getLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, kpi, mount, loading, errorState, emptyState, renderTable, dl, timeline,
  statusBadge, trustBadge, riskBadge, riskBand, maturityChip, fmtINR, fmtINRShort, fmtDate, fmtNum,
  getParam, monthName, daysBetween, initials,
} from '../assets/js/ui.js';
import { lineChart, COLORS } from '../assets/js/charts.js';

extend({
  en: {
    'insd.title': 'Institution',
    'insd.subtitle': 'AICTE ID {id} · {place}',
    'insd.registry': 'View in FDR registry',
    'insd.not_found': 'Institution not found',
    'insd.not_found_text': 'The link may be wrong, or the institution is no longer on the portal.',
    'insd.back': 'Back to institutions',
    'insd.k_active': 'Active instruments',
    'insd.k_active_sub': 'of {n} instruments on record',
    'insd.k_late': 'Late renewals',
    'insd.k_late_sub': 'renewed after the old FDR matured',
    'insd.k_late_none': 'every renewal was on time',
    'insd.k_disc': 'Open discrepancies',
    'insd.k_disc_sub': 'awaiting correction',
    'insd.k_disc_none': 'nothing pending',
    'insd.k_risk': 'Highest risk score',
    'insd.k_risk_sub': 'Risk band: {b}',
    'insd.cov_h': 'Security-deposit coverage',
    'insd.cov_sub': 'Counted: active, document-matched FDRs that have not matured',
    'insd.required': 'Required',
    'insd.covered': 'Covered',
    'insd.shortfall': 'Shortfall',
    'insd.meter': 'Coverage {c} of {r}',
    'insd.short_title': 'Shortfall of {a}',
    'insd.short_text': 'The institution must lodge additional FDRs with lien in favour of AICTE, or get pending instruments verified, to meet the required security deposit.',
    'insd.full_title': 'Fully covered',
    'insd.full_text': 'Valid, verified instruments cover the entire required security deposit.',
    'insd.none_required': 'No security deposit is currently required from this institution.',
    'insd.chart': 'Coverage over the last 12 months',
    'insd.prof_h': 'Institution profile',
    'insd.p_aicte': 'AICTE ID',
    'insd.p_type': 'Type',
    'insd.p_society': 'Society / trust',
    'insd.p_est': 'Established',
    'insd.p_approval': 'Approval status',
    'insd.p_place': 'City, state',
    'insd.p_address': 'Address',
    'insd.p_email': 'Email',
    'insd.p_phone': 'Phone',
    'insd.users': 'Portal users',
    'insd.no_users': 'No portal users registered yet.',
    'insd.fdrs_h': 'Instruments (FDRs)',
    'insd.fdrs_sub': '{n} instruments · {a} held',
    'insd.c_ref': 'Reference',
    'insd.c_bank': 'Bank',
    'insd.c_amount': 'Amount',
    'insd.c_maturity': 'Maturity',
    'insd.c_status': 'Status',
    'insd.c_trust': 'Trust',
    'insd.c_risk': 'Risk',
    'insd.disc_n': '{n} open discrepancy',
    'insd.no_fdrs': 'No instruments yet',
    'insd.no_fdrs_text': 'The institution has not submitted any FDR on the portal.',
    'insd.ren_h': 'Renewal history',
    'insd.ren_late': '{n} late',
    'insd.ren_ok': 'On time',
    'insd.ren_title': '{a} renewed as {b}',
    'insd.ren_meta_ok': 'Renewal lodged {d} · {n} days before maturity',
    'insd.ren_meta_same': 'Renewal lodged {d} · on the maturity date',
    'insd.ren_meta_late': 'Renewal lodged {d} · {n} days after maturity',
    'insd.ren_body': 'Old FDR matured {m} · new FDR {amt}, matures {nm}',
    'insd.over_title': '{r} matured - not renewed',
    'insd.over_meta': 'Matured {d} ({n} days ago) · {amt} with {bank}',
    'insd.due_title': '{r} due for renewal',
    'insd.due_meta': 'Matures {d} · {amt} with {bank}',
    'insd.ren_empty': 'No renewals so far',
    'insd.ren_empty_text': 'All instruments are within their term; renewals will be listed here.',
    'insd.bank_h': 'Deposits by bank',
    'insd.bank_sub': '{n} live · {a}',
    'insd.bank_empty': 'No live deposits with any bank.',
    'insd.approval.approved': 'Approved',
    'insd.approval.new': 'New',
    'insd.approval.closure_requested': 'Closure requested',
    'insd.approval.closed': 'Closed',
  },
  hi: {
    'insd.title': 'संस्थान',
    'insd.subtitle': 'एआईसीटीई आईडी {id} · {place}',
    'insd.registry': 'एफडीआर रजिस्टर में देखें',
    'insd.not_found': 'संस्थान नहीं मिला',
    'insd.not_found_text': 'लिंक गलत हो सकता है, या संस्थान अब पोर्टल पर नहीं है।',
    'insd.back': 'संस्थानों की सूची पर लौटें',
    'insd.k_active': 'सक्रिय लिखत',
    'insd.k_active_sub': 'अभिलेख में कुल {n} लिखतों में से',
    'insd.k_late': 'विलंबित नवीनीकरण',
    'insd.k_late_sub': 'पुरानी एफडीआर की परिपक्वता के बाद नवीनीकृत',
    'insd.k_late_none': 'सभी नवीनीकरण समय पर हुए',
    'insd.k_disc': 'लंबित विसंगतियाँ',
    'insd.k_disc_sub': 'सुधार की प्रतीक्षा में',
    'insd.k_disc_none': 'कुछ भी लंबित नहीं',
    'insd.k_risk': 'उच्चतम जोखिम अंक',
    'insd.k_risk_sub': 'जोखिम श्रेणी: {b}',
    'insd.cov_h': 'प्रतिभूति जमा स्थिति',
    'insd.cov_sub': 'गणना: सक्रिय, दस्तावेज़-मिलान वाली और अपरिपक्व एफडीआर',
    'insd.required': 'अपेक्षित',
    'insd.covered': 'जमा',
    'insd.shortfall': 'कमी',
    'insd.meter': '{r} में से {c} जमा',
    'insd.short_title': '{a} की कमी',
    'insd.short_text': 'अपेक्षित प्रतिभूति जमा पूरी करने के लिए संस्थान को एआईसीटीई के पक्ष में ग्रहणाधिकार सहित अतिरिक्त एफडीआर जमा करनी होगी या लंबित लिखतों का सत्यापन कराना होगा।',
    'insd.full_title': 'पूर्ण जमा',
    'insd.full_text': 'वैध एवं सत्यापित लिखत संपूर्ण अपेक्षित प्रतिभूति जमा को पूरा करते हैं।',
    'insd.none_required': 'इस संस्थान से वर्तमान में कोई प्रतिभूति जमा अपेक्षित नहीं है।',
    'insd.chart': 'पिछले 12 महीनों में जमा स्थिति',
    'insd.prof_h': 'संस्थान विवरण',
    'insd.p_aicte': 'एआईसीटीई आईडी',
    'insd.p_type': 'प्रकार',
    'insd.p_society': 'सोसाइटी / ट्रस्ट',
    'insd.p_est': 'स्थापना वर्ष',
    'insd.p_approval': 'अनुमोदन स्थिति',
    'insd.p_place': 'शहर, राज्य',
    'insd.p_address': 'पता',
    'insd.p_email': 'ईमेल',
    'insd.p_phone': 'फ़ोन',
    'insd.users': 'पोर्टल उपयोगकर्ता',
    'insd.no_users': 'अभी कोई पोर्टल उपयोगकर्ता पंजीकृत नहीं है।',
    'insd.fdrs_h': 'लिखत (एफडीआर)',
    'insd.fdrs_sub': '{n} लिखत · {a} धारित',
    'insd.c_ref': 'संदर्भ',
    'insd.c_bank': 'बैंक',
    'insd.c_amount': 'राशि',
    'insd.c_maturity': 'परिपक्वता',
    'insd.c_status': 'स्थिति',
    'insd.c_trust': 'विश्वसनीयता',
    'insd.c_risk': 'जोखिम',
    'insd.disc_n': '{n} लंबित विसंगति',
    'insd.no_fdrs': 'अभी कोई लिखत नहीं',
    'insd.no_fdrs_text': 'संस्थान ने पोर्टल पर अभी तक कोई एफडीआर जमा नहीं की है।',
    'insd.ren_h': 'नवीनीकरण इतिहास',
    'insd.ren_late': '{n} विलंबित',
    'insd.ren_ok': 'समय पर',
    'insd.ren_title': '{a} का नवीनीकरण {b} के रूप में',
    'insd.ren_meta_ok': 'नवीनीकरण {d} को दर्ज · परिपक्वता से {n} दिन पहले',
    'insd.ren_meta_same': 'नवीनीकरण {d} को दर्ज · परिपक्वता के दिन',
    'insd.ren_meta_late': 'नवीनीकरण {d} को दर्ज · परिपक्वता के {n} दिन बाद',
    'insd.ren_body': 'पुरानी एफडीआर {m} को परिपक्व · नई एफडीआर {amt}, परिपक्वता {nm}',
    'insd.over_title': '{r} परिपक्व - नवीनीकरण नहीं हुआ',
    'insd.over_meta': '{d} को परिपक्व ({n} दिन पहले) · {bank} में {amt}',
    'insd.due_title': '{r} का नवीनीकरण देय',
    'insd.due_meta': 'परिपक्वता {d} · {bank} में {amt}',
    'insd.ren_empty': 'अभी तक कोई नवीनीकरण नहीं',
    'insd.ren_empty_text': 'सभी लिखत अपनी अवधि के भीतर हैं; नवीनीकरण यहाँ दिखाई देंगे।',
    'insd.bank_h': 'बैंकवार जमा',
    'insd.bank_sub': '{n} चालू · {a}',
    'insd.bank_empty': 'किसी भी बैंक में कोई चालू जमा नहीं।',
    'insd.approval.approved': 'अनुमोदित',
    'insd.approval.new': 'नया',
    'insd.approval.closure_requested': 'बंद करने का अनुरोध',
    'insd.approval.closed': 'बंद',
  },
});

// Hindi names for institution types and states (the server keeps them in English).
const TYPE_HI = {
  'Engineering & Technology': 'अभियांत्रिकी एवं प्रौद्योगिकी', Management: 'प्रबंधन', Pharmacy: 'फार्मेसी', Architecture: 'वास्तुकला',
  'Computer Applications': 'कंप्यूटर अनुप्रयोग', 'Hotel Management & Catering': 'होटल प्रबंधन एवं कैटरिंग',
  'Polytechnic (Diploma)': 'पॉलिटेक्निक (डिप्लोमा)', 'Applied Arts & Crafts': 'अनुप्रयुक्त कला एवं शिल्प',
};
const STATE_HI = {
  'Andhra Pradesh': 'आंध्र प्रदेश', Assam: 'असम', Bihar: 'बिहार', Chhattisgarh: 'छत्तीसगढ़', Delhi: 'दिल्ली', Goa: 'गोवा', Gujarat: 'गुजरात',
  Haryana: 'हरियाणा', 'Himachal Pradesh': 'हिमाचल प्रदेश', 'Jammu and Kashmir': 'जम्मू और कश्मीर', Jharkhand: 'झारखंड', Karnataka: 'कर्नाटक',
  Kerala: 'केरल', 'Madhya Pradesh': 'मध्य प्रदेश', Maharashtra: 'महाराष्ट्र', Odisha: 'ओडिशा', Punjab: 'पंजाब', Rajasthan: 'राजस्थान',
  'Tamil Nadu': 'तमिलनाडु', Telangana: 'तेलंगाना', 'Uttar Pradesh': 'उत्तर प्रदेश', Uttarakhand: 'उत्तराखंड', 'West Bengal': 'पश्चिम बंगाल',
};
const hiOr = (map, v) => (getLang() === 'hi' && map[v]) || v || '—';
const LIVE = ['SUBMITTED', 'UNDER_VERIFICATION', 'DISCREPANCY', 'ACTIVE', 'RELEASE_REQUESTED'];
const TERMINAL = ['RENEWED', 'RELEASED', 'REJECTED', 'INVOKED'];

const id = parseInt(getParam('id') || '', 10);
const crumbs = (name) => [
  { label: 'nav.dashboard', href: 'officer/dashboard.html' },
  { label: 'nav.institutions', href: 'officer/institutions.html' },
  { label: name || 'insd.title' },
];
const registryBtn = () => el('a', {
  class: 'btn secondary', href: site(`officer/fdrs.html?institution_id=${id}`),
  html: `${icon('list', 16)}<span>${esc(t('insd.registry'))}</span>`,
});

await initPage({
  roles: ['officer', 'authority', 'admin'],
  active: 'institutions',
  title: 'insd.title',
  breadcrumbs: crumbs(),
});

const pageEl = $('#page');
const stateEl = el('div', { class: 'card', hidden: true });
pageEl.prepend(stateEl);
const blocks = () => [...pageEl.children].filter((n) => n !== stateEl);
let data = null;
let chart = null;
let sort = null;

/* ---------------------------------------------------------------- helpers */
const place = (d) => [d.city, hiOr(STATE_HI, d.state)].filter(Boolean).join(', ');
const approvalBadge = (s) => {
  const cls = { approved: 'b-success', new: 'b-info', closure_requested: 'b-warning', closed: 'b-slate' }[s] || 'b-slate';
  return `<span class="badge ${cls}"><span class="dot"></span>${esc(t(`insd.approval.${s}`, { _default: s || '—' }))}</span>`;
};
const coveragePct = (d) => (d.required_deposit ? Math.min(100, Math.round((100 * (d.covered_amount || 0)) / d.required_deposit)) : 100);
const bandColor = { low: 'success', medium: 'warning', high: 'orange', critical: 'danger' };
const dateOnly = (s) => (s ? String(s).slice(0, 10) : s);

/* ---------------------------------------------------------------- sections */
function renderKpis(d) {
  const band = riskBand(d.max_risk) || 'low';
  mount($('#kpis'),
    kpi({ label: t('insd.k_active'), value: fmtNum(d.active_count), sub: esc(t('insd.k_active_sub', { n: d.fdr_count })), color: 'info', iconName: 'file-check' }),
    kpi({ label: t('insd.k_late'), value: fmtNum(d.late_renewals || 0), sub: esc(t(d.late_renewals ? 'insd.k_late_sub' : 'insd.k_late_none')), color: d.late_renewals ? 'warning' : 'success', iconName: 'clock' }),
    kpi({ label: t('insd.k_disc'), value: fmtNum(d.open_discrepancies || 0), sub: esc(t(d.open_discrepancies ? 'insd.k_disc_sub' : 'insd.k_disc_none')), color: d.open_discrepancies ? 'orange' : 'success', iconName: 'alert' }),
    kpi({ label: t('insd.k_risk'), value: d.max_risk == null ? '—' : String(d.max_risk), sub: esc(t('insd.k_risk_sub', { b: t(`risk.${band}`) })), color: bandColor[band], iconName: 'target' }));
}

function renderCoverage(d) {
  $('#cov-h').innerHTML = `${icon('shield-check', 18)} ${esc(t('insd.cov_h'))}`;
  $('#cov-sub').textContent = t('insd.cov_sub');
  const pct = coveragePct(d);
  const tone = pct >= 100 ? '' : pct >= 60 ? 'warning' : 'danger';
  const short = d.shortfall > 0;
  const fig = (label, value, cls = '') => el('div', { class: `ins-fig ${cls}` }, el('div', { class: 'l' }, label), el('div', { class: 'v', title: fmtINR(value) }, fmtINRShort(value)));
  let note;
  if (!d.required_deposit) {
    note = el('div', { class: 'alert info', html: `${icon('info', 18)}<div>${esc(t('insd.none_required'))}</div>` });
  } else if (short) {
    note = el('div', { class: 'alert danger', html: `${icon('alert-circle', 18)}<div><div class="a-title">${esc(t('insd.short_title', { a: fmtINR(d.shortfall) }))}</div>${esc(t('insd.short_text'))}</div>` });
  } else {
    note = el('div', { class: 'alert success', html: `${icon('check-circle', 18)}<div><div class="a-title">${esc(t('insd.full_title'))}</div>${esc(t('insd.full_text'))}</div>` });
  }
  const hist = Array.isArray(d.coverage_history) ? d.coverage_history : [];
  const canvas = el('canvas', { role: 'img', 'aria-label': t('insd.chart') });
  mount($('#coverage'),
    el('div', { class: 'ins-cov-figs' },
      fig(t('insd.required'), d.required_deposit || 0),
      fig(t('insd.covered'), d.covered_amount || 0, short ? '' : 'good'),
      fig(t('insd.shortfall'), d.shortfall || 0, short ? 'bad' : 'good')),
    el('div', { class: 'ins-meter-head' },
      el('span', { class: 'text-2' }, t('insd.meter', { c: fmtINR(d.covered_amount || 0), r: fmtINR(d.required_deposit || 0) })),
      el('strong', {}, `${pct}%`)),
    el('div', { class: `meter lg ${tone}`, role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct), 'aria-label': t('insd.cov_h') }, el('span', { style: { width: `${pct}%` } })),
    el('div', { class: 'mt-0', style: { marginTop: '16px' } }, note),
    hist.length ? el('div', { class: 'ins-chart-title', html: `${icon('trend', 15)} ${esc(t('insd.chart'))}` }) : null,
    hist.length ? el('div', { class: 'chart-box sm' }, canvas) : null);
  if (chart && chart.destroy) chart.destroy();
  chart = null;
  if (hist.length && window.Chart) {
    const labels = hist.map((h) => { const [y, m] = h.month.split('-'); return `${monthName(Number(m) - 1)} ${y.slice(2)}`; });
    chart = lineChart(canvas, {
      labels, money: true,
      datasets: [
        { label: t('insd.covered'), data: hist.map((h) => h.covered), color: COLORS.green, fill: true },
        { label: t('insd.required'), data: hist.map((h) => h.required), color: COLORS.navy },
      ],
    });
  }
}

function renderProfile(d) {
  $('#prof-h').innerHTML = `${icon('building', 18)} ${esc(t('insd.prof_h'))}`;
  $('#prof-status').innerHTML = approvalBadge(d.approval_status);
  const users = d.users || [];
  mount($('#profile'),
    el('div', { class: 'ins-ident' },
      el('div', { class: 'feature-icon', html: icon('building', 22) }),
      el('div', {}, el('div', { class: 'nm' }, d.name), el('div', { class: 'mono small muted' }, d.aicte_id))),
    dl([
      [t('insd.p_type'), esc(hiOr(TYPE_HI, d.type))],
      [t('insd.p_est'), esc(d.established_year || '—')],
      [t('insd.p_society'), esc(d.society_name || '—')],
      [t('insd.p_place'), esc(place(d) || '—')],
      [t('insd.p_address'), esc(d.address || '—')],
      [t('insd.p_approval'), approvalBadge(d.approval_status)],
      [t('insd.p_email'), d.email ? `<a href="mailto:${esc(d.email)}" style="word-break:break-all">${esc(d.email)}</a>` : '—'],
      [t('insd.p_phone'), d.phone ? `<a href="tel:${esc(d.phone.replace(/\s+/g, ''))}" class="nowrap">${esc(d.phone)}</a>` : '—'],
    ], { cols: 2 }),
    el('div', { class: 'ins-users' },
      el('h3', {}, t('insd.users')),
      users.length
        ? users.map((u) => el('div', { class: 'ins-user' },
          el('span', { class: 'avatar', 'aria-hidden': 'true' }, initials(u.name)),
          el('div', { class: 'who' },
            el('div', { class: 'small', style: { fontWeight: 600 } }, u.name, u.designation ? el('span', { class: 'muted', style: { fontWeight: 400 } }, ` · ${u.designation}`) : null),
            el('a', { class: 'small', href: `mailto:${u.email}` }, u.email))))
        : el('div', { class: 'muted small' }, t('insd.no_users'))));
}

function sortedFdrs(rows) {
  const r = [...rows];
  if (sort) {
    const k = sort.key; const dir = sort.dir === 'desc' ? -1 : 1;
    return r.sort((a, b) => ((a[k] ?? '') > (b[k] ?? '') ? 1 : (a[k] ?? '') < (b[k] ?? '') ? -1 : 0) * dir);
  }
  // live instruments first (soonest maturity first), then closed ones (latest first)
  return r.sort((a, b) => {
    const ta = TERMINAL.includes(a.status); const tb = TERMINAL.includes(b.status);
    if (ta !== tb) return ta ? 1 : -1;
    return ta ? String(b.maturity_date).localeCompare(a.maturity_date) : String(a.maturity_date).localeCompare(b.maturity_date);
  });
}

function renderFdrs(d) {
  const fdrs = d.fdrs || [];
  const held = fdrs.filter((f) => LIVE.includes(f.status)).reduce((a, f) => a + (f.amount || 0), 0);
  $('#fdrs-h').innerHTML = `${icon('file-text', 18)} ${esc(t('insd.fdrs_h'))}`;
  $('#fdrs-sub').textContent = t('insd.fdrs_sub', { n: fdrs.length, a: fmtINRShort(held) });
  renderTable($('#fdrs'), {
    columns: [
      {
        key: 'ref_no', label: t('insd.c_ref'), sortable: true,
        render: (f) => `<a class="cell-main mono" href="${esc(site(`officer/fdr.html?id=${f.id}`))}">${esc(f.ref_no)}</a><div class="cell-sub mono">${esc(f.fdr_number || '')}</div>`,
      },
      { key: 'bank', label: t('insd.c_bank'), render: (f) => `<div>${esc(f.bank ? f.bank.name : '—')}</div><div class="cell-sub">${esc(f.bank ? f.bank.code : '')}</div>` },
      { key: 'amount', label: t('insd.c_amount'), align: 'right', sortable: true, render: (f) => `<strong class="nowrap">${esc(fmtINR(f.amount))}</strong>` },
      {
        key: 'maturity_date', label: t('insd.c_maturity'), sortable: true,
        render: (f) => `<div class="nowrap">${esc(fmtDate(f.maturity_date))}</div>${TERMINAL.includes(f.status) ? '' : `<div style="margin-top:3px">${maturityChip(f.days_to_maturity)}</div>`}`,
      },
      {
        key: 'status', label: t('insd.c_status'),
        render: (f) => `${statusBadge(f.display_status)}${f.open_discrepancies ? `<div class="small" style="color:var(--nk-orange);margin-top:3px">${icon('alert', 12)} ${esc(t('insd.disc_n', { n: f.open_discrepancies }))}</div>` : ''}`,
      },
      { key: 'trust_level', label: t('insd.c_trust'), sortable: true, render: (f) => trustBadge(f.trust_level, f.flagged) },
      { key: 'risk_score', label: t('insd.c_risk'), align: 'center', sortable: true, render: (f) => riskBadge(f.risk_score, f.risk_band) },
    ],
    rows: sortedFdrs(fdrs),
    sort: sort || undefined,
    onSort: (key, dir) => { sort = { key, dir }; renderFdrs(data); },
    onRowClick: (f) => { location.href = site(`officer/fdr.html?id=${f.id}`); },
    rowClass: (f) => (f.status === 'ACTIVE' && f.days_to_maturity < 0 ? 'row-danger' : f.open_discrepancies ? 'row-warning' : ''),
    empty: { icon: 'file-text', title: t('insd.no_fdrs'), text: t('insd.no_fdrs_text') },
  });
}

function renderRenewals(d) {
  const fdrs = d.fdrs || [];
  const byId = new Map(fdrs.map((f) => [f.id, f]));
  const hasSuccessor = new Set(fdrs.map((f) => f.predecessor_id).filter(Boolean));
  const items = [];
  let late = 0;
  fdrs.filter((f) => f.predecessor_id && byId.has(f.predecessor_id)).forEach((f) => {
    const p = byId.get(f.predecessor_id);
    const lodged = dateOnly(f.submitted_at);
    const gap = daysBetween(p.maturity_date, lodged); // >0 = after maturity
    if (gap > 0) late += 1;
    const metaKey = gap > 0 ? 'insd.ren_meta_late' : gap === 0 ? 'insd.ren_meta_same' : 'insd.ren_meta_ok';
    items.push({
      sortAt: lodged,
      tone: gap > 0 ? 'warning' : 'success',
      title: t('insd.ren_title', { a: p.ref_no, b: f.ref_no }),
      meta: t(metaKey, { d: fmtDate(lodged), n: Math.abs(gap) }),
      body: t('insd.ren_body', { m: fmtDate(p.maturity_date), amt: fmtINR(f.amount), nm: fmtDate(f.maturity_date) }),
    });
  });
  fdrs.filter((f) => f.status === 'ACTIVE' && !hasSuccessor.has(f.id) && f.days_to_maturity != null && f.days_to_maturity <= 90).forEach((f) => {
    const vars = { r: f.ref_no, d: fmtDate(f.maturity_date), n: Math.abs(f.days_to_maturity), amt: fmtINR(f.amount), bank: f.bank ? f.bank.name : '—' };
    const over = f.days_to_maturity < 0;
    items.push({
      sortAt: '9999', // open items stay on top
      tone: over ? 'danger' : 'warning',
      title: t(over ? 'insd.over_title' : 'insd.due_title', vars),
      meta: t(over ? 'insd.over_meta' : 'insd.due_meta', vars),
    });
  });
  $('#ren-h').innerHTML = `${icon('history', 18)} ${esc(t('insd.ren_h'))}`;
  const lateN = Math.max(late, d.late_renewals || 0);
  $('#ren-badge').innerHTML = lateN ? `<span class="badge b-warning">${esc(t('insd.ren_late', { n: lateN }))}</span>` : (items.length ? `<span class="badge b-success">${esc(t('insd.ren_ok'))}</span>` : '');
  if (!items.length) {
    emptyState($('#renewals'), { icon: 'history', title: t('insd.ren_empty'), text: t('insd.ren_empty_text') });
    return;
  }
  items.sort((a, b) => String(b.sortAt).localeCompare(String(a.sortAt)));
  timeline($('#renewals'), items.map(({ sortAt, ...it }) => it));
}

function renderBanks(d) {
  $('#bank-h').innerHTML = `${icon('bank', 18)} ${esc(t('insd.bank_h'))}`;
  const live = (d.fdrs || []).filter((f) => LIVE.includes(f.status) && f.bank);
  if (!live.length) {
    mount($('#banks'), el('div', { class: 'muted small' }, t('insd.bank_empty')));
    return;
  }
  const groups = new Map();
  live.forEach((f) => {
    const g = groups.get(f.bank.id) || { bank: f.bank, count: 0, amount: 0 };
    g.count += 1; g.amount += f.amount || 0;
    groups.set(f.bank.id, g);
  });
  const total = live.reduce((a, f) => a + (f.amount || 0), 0) || 1;
  mount($('#banks'), [...groups.values()].sort((a, b) => b.amount - a.amount).map((g) => el('div', { class: 'ins-bank-row' },
    el('div', {}, el('div', { style: { fontWeight: 600 } }, g.bank.name), el('div', { class: 'small muted' }, t('insd.bank_sub', { n: g.count, a: fmtINR(g.amount) }))),
    el('strong', { class: 'num' }, `${Math.round((100 * g.amount) / total)}%`),
    el('div', { class: 'meter', 'aria-hidden': 'true' }, el('span', { style: { width: `${Math.round((100 * g.amount) / total)}%` } })))));
}

function render() {
  if (!data) return;
  setPageHead({
    title: data.name,
    subtitle: t('insd.subtitle', { id: data.aicte_id, place: place(data) }),
    breadcrumbs: crumbs(data.name),
    actions: registryBtn(),
  });
  document.title = `${data.name} · Nidhi Kavach`;
  renderKpis(data);
  renderCoverage(data);
  renderProfile(data);
  renderFdrs(data);
  renderRenewals(data);
  renderBanks(data);
}

function showState(fn) {
  blocks().forEach((n) => { n.hidden = true; });
  stateEl.hidden = false;
  fn(stateEl);
}

function notFound() {
  setPageHead({ title: t('insd.not_found'), breadcrumbs: crumbs() });
  showState((c) => emptyState(c, {
    icon: 'building', title: t('insd.not_found'), text: t('insd.not_found_text'),
    action: el('a', { class: 'btn primary', href: site('officer/institutions.html'), html: `${icon('arrow-left', 16)}<span>${esc(t('insd.back'))}</span>` }),
  }));
}

async function load() {
  if (!id) { notFound(); return; }
  stateEl.hidden = true;
  blocks().forEach((n) => { n.hidden = false; });
  ['#coverage', '#profile', '#fdrs', '#renewals', '#banks'].forEach((s) => loading($(s)));
  mount($('#kpis'), [1, 2, 3, 4].map(() => el('div', { class: 'kpi' }, el('div', { class: 'skeleton', style: { width: '50%' } }), el('div', { class: 'skeleton', style: { height: '28px', width: '40%', marginTop: '6px' } }))));
  try {
    data = await api.get(`/institutions/${id}`);
    render();
  } catch (err) {
    if (err && err.status === 404) { notFound(); return; }
    showState((c) => errorState(c, err, load));
  }
}

onLang(() => { if (data) render(); else if (!id) notFound(); });
load();
