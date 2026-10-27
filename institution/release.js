// Institution: one release / refund / discharge request - stage stepper, checklist, SLA, history, resubmit, NOC.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, mount, loading, emptyState, errorState, toast, withBusy, dl, stepper, timeline,
  releaseBadge, statusBadge, maturityChip, fmtINR, fmtDate, fmtDateTime, fmtNum, getParam, downloadBlob,
} from '../assets/js/ui.js';

extend({
  en: {
    'irel.d.page': 'Release request',
    'irel.d.back': 'All requests',
    'irel.d.summary': 'Request details',
    'irel.d.progress': 'Progress',
    'irel.d.checklist': 'Eligibility checklist',
    'irel.d.ck_sub': '{ok} of {n} conditions met',
    'irel.d.ck_empty': 'No checklist yet',
    'irel.d.ck_ok': 'Met',
    'irel.d.ck_bad': 'Not met',
    'irel.d.ck_pending': 'Pending',
    'irel.d.ck_auto': 'Automatic',
    'irel.d.ck_manual': 'By officer',
    'irel.d.ck_readonly': 'This checklist is maintained by the scrutiny officer; you can only view it.',
    'irel.d.ck.tenure_complete': 'Deposit tenure complete (matured), or discharge on closure',
    'irel.d.ck.no_open_discrepancy': 'No open discrepancy on the instrument',
    'irel.d.ck.lien_confirmed': 'Bank confirms the lien in favour of AICTE',
    'irel.d.ck.bank_verified': 'Deposit verified with the issuing bank',
    'irel.d.ck.no_pending_dues': 'No pending dues payable to AICTE',
    'irel.d.ck.no_complaints': 'No pending complaints or proceedings against the institution',
    'irel.d.history': 'History',
    'irel.d.tl_created': 'Request submitted',
    'irel.d.tl_checklist': 'Checklist updated',
    'irel.d.tl_spent': '{d} at {stage}',
    'irel.d.sla': 'Time limit',
    'irel.d.sla_left': 'left at this stage',
    'irel.d.sla_over': 'overdue at this stage',
    'irel.d.sla_stage': 'Current stage',
    'irel.d.sla_limit': 'Allowed time',
    'irel.d.sla_days': '{n} days',
    'irel.d.sla_due': 'Due by',
    'irel.d.sla_breached': 'The time limit for this stage has been crossed. AICTE has been flagged to act on it.',
    'irel.d.sla_inst': 'The request is waiting for your response. Resubmit it with a note so that scrutiny can resume.',
    'irel.d.sla_closed_released': 'Request completed',
    'irel.d.sla_closed_rejected': 'Request closed',
    'irel.d.sla_closed_sub': 'Total time taken: {d}',
    'irel.d.fdr': 'Linked deposit',
    'irel.d.fdr_no': 'FDR number',
    'irel.d.fdr_ref': 'Reference',
    'irel.d.fdr_bank': 'Bank',
    'irel.d.fdr_amount': 'Deposit amount',
    'irel.d.fdr_maturity': 'Maturity',
    'irel.d.fdr_status': 'Deposit status',
    'irel.d.fdr_open': 'Open deposit',
    'irel.d.type': 'Request type',
    'irel.d.requested_by': 'Requested by',
    'irel.d.requested_at': 'Requested on',
    'irel.d.decided_by': 'Decided by',
    'irel.d.released_at': 'Released on',
    'irel.d.reason': 'Reason given',
    'irel.d.decision_note': 'Note from AICTE',
    'irel.d.so_far': '{d} so far',
    'irel.d.not_reached': 'Not reached',
    'irel.d.total': 'Total time',
    'irel.d.turnaround': 'Turnaround',
    'irel.d.with': 'Currently with',
    'irel.d.with_officer': 'AICTE officer (scrutiny)',
    'irel.d.with_authority': 'Competent authority',
    'irel.d.with_release': 'AICTE officer (release)',
    'irel.d.with_inst': 'Your institution',
    'irel.d.with_none': 'Closed',
    'irel.d.returned_n': 'Returned to you',
    'irel.d.times_0': 'Never',
    'irel.d.times_1': 'Once',
    'irel.d.times_n': '{n} times',
    'irel.d.dur_m': '{m} min',
    'irel.d.dur_h': '{h} h',
    'irel.d.dur_d': '{d} d',
    'irel.d.dur_dh': '{d} d {h} h',
    'irel.d.resub_title': 'Resubmit request',
    'irel.d.resub_alert': 'AICTE returned this request for changes',
    'irel.d.resub_label': 'Note on what you have corrected',
    'irel.d.resub_ph': 'Describe the correction or clarification you are providing',
    'irel.d.resub_err': 'A note is required to resubmit.',
    'irel.d.resub_btn': 'Resubmit',
    'irel.d.resub_ok': 'Request resubmitted',
    'irel.d.noc_title': 'No-objection certificate',
    'irel.d.noc_issued': 'Issued on {d}',
    'irel.d.noc_by': 'Released by {name}',
    'irel.d.noc_download': 'Download NOC',
    'irel.d.noc_verify': 'Verify publicly',
    'irel.d.noc_dl_ok': 'NOC downloaded',
    'irel.d.noc_missing': 'The certificate is not available yet. Please check again shortly.',
    'irel.d.not_found': 'This release request could not be found',
    'irel.d.not_found_text': 'It may belong to another institution, or the link is incomplete.',
    'irel.d.no_id': 'No release request was selected',
    'irel.d.no_id_text': 'Open a request from the release and refund list.',
    'irel.d.fail': 'Could not complete the action: {msg}',
  },
  hi: {
    'irel.d.page': 'मुक्ति अनुरोध',
    'irel.d.back': 'सभी अनुरोध',
    'irel.d.summary': 'अनुरोध का विवरण',
    'irel.d.progress': 'प्रगति',
    'irel.d.checklist': 'पात्रता जाँच-सूची',
    'irel.d.ck_sub': '{n} में से {ok} शर्तें पूरी',
    'irel.d.ck_empty': 'अभी कोई जाँच-सूची नहीं',
    'irel.d.ck_ok': 'पूरी',
    'irel.d.ck_bad': 'पूरी नहीं',
    'irel.d.ck_pending': 'लंबित',
    'irel.d.ck_auto': 'स्वचालित',
    'irel.d.ck_manual': 'अधिकारी द्वारा',
    'irel.d.ck_readonly': 'यह जाँच-सूची संवीक्षा अधिकारी द्वारा रखी जाती है; आप इसे केवल देख सकते हैं।',
    'irel.d.ck.tenure_complete': 'जमा की अवधि पूरी (परिपक्व), या बंद होने पर उन्मोचन',
    'irel.d.ck.no_open_discrepancy': 'लिखत पर कोई खुली विसंगति नहीं',
    'irel.d.ck.lien_confirmed': 'बैंक द्वारा एआईसीटीई के पक्ष में ग्रहणाधिकार की पुष्टि',
    'irel.d.ck.bank_verified': 'जारीकर्ता बैंक से जमा का सत्यापन',
    'irel.d.ck.no_pending_dues': 'एआईसीटीई को देय कोई बकाया नहीं',
    'irel.d.ck.no_complaints': 'संस्थान के विरुद्ध कोई लंबित शिकायत या कार्यवाही नहीं',
    'irel.d.history': 'इतिहास',
    'irel.d.tl_created': 'अनुरोध जमा किया गया',
    'irel.d.tl_checklist': 'जाँच-सूची अद्यतन हुई',
    'irel.d.tl_spent': '{stage} पर {d}',
    'irel.d.sla': 'समय-सीमा',
    'irel.d.sla_left': 'इस चरण में शेष',
    'irel.d.sla_over': 'इस चरण में विलंब',
    'irel.d.sla_stage': 'वर्तमान चरण',
    'irel.d.sla_limit': 'अनुमत समय',
    'irel.d.sla_days': '{n} दिन',
    'irel.d.sla_due': 'देय तिथि',
    'irel.d.sla_breached': 'इस चरण की समय-सीमा पार हो चुकी है। एआईसीटीई को कार्रवाई के लिए चिह्नित किया गया है।',
    'irel.d.sla_inst': 'अनुरोध आपके उत्तर की प्रतीक्षा में है। संवीक्षा फिर शुरू हो सके, इसके लिए टिप्पणी के साथ इसे दोबारा जमा करें।',
    'irel.d.sla_closed_released': 'अनुरोध पूरा हुआ',
    'irel.d.sla_closed_rejected': 'अनुरोध बंद',
    'irel.d.sla_closed_sub': 'कुल लगा समय: {d}',
    'irel.d.fdr': 'संबद्ध जमा',
    'irel.d.fdr_no': 'एफडीआर संख्या',
    'irel.d.fdr_ref': 'संदर्भ',
    'irel.d.fdr_bank': 'बैंक',
    'irel.d.fdr_amount': 'जमा राशि',
    'irel.d.fdr_maturity': 'परिपक्वता',
    'irel.d.fdr_status': 'जमा की स्थिति',
    'irel.d.fdr_open': 'जमा खोलें',
    'irel.d.type': 'अनुरोध का प्रकार',
    'irel.d.requested_by': 'अनुरोधकर्ता',
    'irel.d.requested_at': 'अनुरोध की तिथि',
    'irel.d.decided_by': 'निर्णय लेने वाले',
    'irel.d.released_at': 'मुक्ति की तिथि',
    'irel.d.reason': 'दिया गया कारण',
    'irel.d.decision_note': 'एआईसीटीई की टिप्पणी',
    'irel.d.so_far': 'अब तक {d}',
    'irel.d.not_reached': 'अभी नहीं पहुँचा',
    'irel.d.total': 'कुल समय',
    'irel.d.turnaround': 'निपटान समय',
    'irel.d.with': 'वर्तमान में किसके पास',
    'irel.d.with_officer': 'एआईसीटीई अधिकारी (संवीक्षा)',
    'irel.d.with_authority': 'सक्षम प्राधिकारी',
    'irel.d.with_release': 'एआईसीटीई अधिकारी (मुक्ति)',
    'irel.d.with_inst': 'आपका संस्थान',
    'irel.d.with_none': 'बंद',
    'irel.d.returned_n': 'आपको लौटाया गया',
    'irel.d.times_0': 'कभी नहीं',
    'irel.d.times_1': 'एक बार',
    'irel.d.times_n': '{n} बार',
    'irel.d.dur_m': '{m} मिनट',
    'irel.d.dur_h': '{h} घंटे',
    'irel.d.dur_d': '{d} दिन',
    'irel.d.dur_dh': '{d} दिन {h} घंटे',
    'irel.d.resub_title': 'अनुरोध दोबारा जमा करें',
    'irel.d.resub_alert': 'एआईसीटीई ने यह अनुरोध सुधार के लिए लौटाया है',
    'irel.d.resub_label': 'आपने जो सुधार किया उसकी टिप्पणी',
    'irel.d.resub_ph': 'जो सुधार या स्पष्टीकरण दे रहे हैं उसे लिखें',
    'irel.d.resub_err': 'दोबारा जमा करने के लिए टिप्पणी आवश्यक है।',
    'irel.d.resub_btn': 'दोबारा जमा करें',
    'irel.d.resub_ok': 'अनुरोध दोबारा जमा हो गया',
    'irel.d.noc_title': 'अनापत्ति प्रमाणपत्र',
    'irel.d.noc_issued': '{d} को जारी',
    'irel.d.noc_by': '{name} द्वारा मुक्त',
    'irel.d.noc_download': 'एनओसी डाउनलोड करें',
    'irel.d.noc_verify': 'सार्वजनिक रूप से सत्यापित करें',
    'irel.d.noc_dl_ok': 'एनओसी डाउनलोड हो गया',
    'irel.d.noc_missing': 'प्रमाणपत्र अभी उपलब्ध नहीं है। कृपया थोड़ी देर बाद दोबारा देखें।',
    'irel.d.not_found': 'यह मुक्ति अनुरोध नहीं मिला',
    'irel.d.not_found_text': 'हो सकता है यह किसी अन्य संस्थान का हो, या लिंक अधूरा हो।',
    'irel.d.no_id': 'कोई मुक्ति अनुरोध नहीं चुना गया',
    'irel.d.no_id_text': 'मुक्ति एवं वापसी सूची से कोई अनुरोध खोलें।',
    'irel.d.fail': 'कार्रवाई पूरी नहीं हो सकी: {msg}',
  },
});

const FLOW = ['SUBMITTED', 'SCRUTINY', 'RECOMMENDED', 'APPROVED', 'RELEASED'];
const OPEN = ['SUBMITTED', 'SCRUTINY', 'RECOMMENDED', 'APPROVED', 'RETURNED'];

const id = getParam('id');
const backBtn = el('a', { class: 'btn secondary', href: site('institution/releases.html') });
const setBack = () => { backBtn.innerHTML = `${icon('arrow-left', 16)}<span>${esc(t('irel.d.back'))}</span>`; };
setBack();
await initPage({
  roles: ['institution'],
  active: 'releases',
  title: 'irel.d.page',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'institution/dashboard.html' }, { label: 'nav.releases', href: 'institution/releases.html' }, { label: 'irel.d.page' }],
  actions: backBtn,
});

const stateEl = $('#state');
const contentEl = $('#content');
let d = null;

/* ------------------------------------------------------------------ helpers */
function fmtDur(hours) {
  if (hours === null || hours === undefined || Number.isNaN(hours)) return '—';
  const abs = Math.abs(hours);
  if (abs < 1) return t('irel.d.dur_m', { m: Math.max(1, Math.round(abs * 60)) });
  const total = Math.round(abs);
  const days = Math.floor(total / 24);
  const h = total % 24;
  if (!days) return t('irel.d.dur_h', { h });
  return h ? t('irel.d.dur_dh', { d: days, h }) : t('irel.d.dur_d', { d: days });
}
const stageLabel = (s) => t(`rstage.${s}`, { _default: s });
const typeLabel = (r) => t(`rtype.${r.request_type}`, { _default: r.request_type_label || r.request_type });
const personTxt = (p) => (p ? [p.name, p.designation].filter(Boolean).join(', ') : '—');
const apiPath = (p) => String(p || '').replace(/^\/api(?=\/)/, '');
function ownerKey(status) {
  if (status === 'RETURNED') return 'irel.d.with_inst';
  if (status === 'SUBMITTED' || status === 'SCRUTINY') return 'irel.d.with_officer';
  if (status === 'RECOMMENDED') return 'irel.d.with_authority';
  if (status === 'APPROVED') return 'irel.d.with_release';
  return 'irel.d.with_none';
}

/* ------------------------------------------------------------------ summary */
function renderSummary() {
  $('#sum-badge').innerHTML = releaseBadge(d.status);
  const f = d.fdr || {};
  const pairs = [
    [t('irel.d.type'), esc(typeLabel(d))],
    [t('irel.d.fdr_amount'), `<strong>${esc(fmtINR(d.amount))}</strong>`],
    [t('irel.d.requested_by'), esc(personTxt(d.requested_by))],
    [t('irel.d.requested_at'), esc(fmtDateTime(d.requested_at))],
  ];
  if (d.decided_by) pairs.push([t('irel.d.decided_by'), esc(personTxt(d.decided_by))]);
  if (d.released_at) pairs.push([t('irel.d.released_at'), esc(fmtDateTime(d.released_at))]);
  mount($('#summary'),
    el('div', { class: 'row', style: { gap: '8px', alignItems: 'baseline' } },
      el('span', { class: 'mono', style: { fontWeight: 700, fontSize: '1.15rem' } }, d.ref_no),
      el('span', { class: 'muted small mono' }, f.ref_no || d.fdr_ref_no || '')),
    dl(pairs, { cols: 2 }),
    d.reason ? el('div', {}, el('div', { class: 'small muted' }, t('irel.d.reason')), el('div', { class: 'irel-note' }, d.reason)) : null,
    d.decision_note ? el('div', { class: `alert ${d.status === 'REJECTED' ? 'danger' : 'warning'}` },
      el('span', { html: icon('info', 18) }),
      el('div', {}, el('div', { class: 'a-title' }, t('irel.d.decision_note')), el('div', { class: 'irel-note' }, d.decision_note))) : null);
}

/* ------------------------------------------------------------------ progress */
function renderProgress() {
  const durs = d.stage_durations || {};
  const status = d.status;
  const steps = [];
  let badAt = -1;
  let reached = FLOW.indexOf(status);
  if (status === 'RETURNED' || status === 'REJECTED') {
    const ev = [...(d.events || [])].reverse().find((e) => e.to_status === status);
    const from = ev ? ev.from_status : 'SUBMITTED';
    badAt = Math.max(0, FLOW.indexOf(from));
    reached = badAt;
  }
  FLOW.forEach((s, i) => {
    let state = '';
    if (status === 'RELEASED') state = 'done';
    else if (badAt >= 0) state = i <= badAt ? 'done' : '';
    else if (i < reached) state = 'done';
    else if (i === reached) state = 'current';
    let meta;
    if (state === 'current') meta = t('irel.d.so_far', { d: fmtDur(durs[s]) });
    else if (state === 'done' && s !== 'RELEASED') meta = durs[s] !== undefined ? fmtDur(durs[s]) : '—';
    else if (state === 'done') meta = fmtDate(d.released_at);
    else meta = t('irel.d.not_reached');
    steps.push({ label: stageLabel(s), meta, state });
    if (i === badAt) {
      const extra = status === 'RETURNED' ? t('irel.d.so_far', { d: fmtDur(durs.RETURNED) }) : fmtDate(d.decided_at || ((d.events || []).slice(-1)[0] || {}).at);
      steps.push({ label: stageLabel(status), meta: extra, state: 'bad' });
    }
  });
  stepper($('#stepper'), steps);

  const returns = (d.events || []).filter((e) => e.to_status === 'RETURNED').length;
  const open = OPEN.includes(status);
  const stat = (label, value, color) => el('div', { class: 'stat-inline' },
    el('span', { class: 'v', style: color ? { color } : null }, value), el('span', { class: 'l' }, label));
  mount($('#progress-foot'),
    stat(open ? t('irel.d.total') : t('irel.d.turnaround'), fmtDur(d.total_hours)),
    stat(t('irel.d.with'), t(ownerKey(status)), open ? 'var(--nk-primary-700)' : 'var(--nk-muted)'),
    stat(t('irel.d.returned_n'), returns === 0 ? t('irel.d.times_0') : returns === 1 ? t('irel.d.times_1') : t('irel.d.times_n', { n: returns }), returns ? 'var(--nk-warning)' : null));
}

/* ------------------------------------------------------------------ checklist */
function renderChecklist() {
  const box = $('#checklist');
  const entries = Object.entries(d.checklist || {});
  if (!entries.length) {
    emptyState(box, { icon: 'file', title: t('irel.d.ck_empty') });
    $('#ck-sub').textContent = '';
    return;
  }
  const okCount = entries.filter(([, it]) => it.ok === true).length;
  $('#ck-sub').textContent = t('irel.d.ck_sub', { ok: okCount, n: entries.length });
  const list = el('ul', { class: 'irel-ck' }, entries.map(([key, it]) => {
    const ok = it.ok === true ? true : it.ok === false ? false : null;
    const cls = ok === true ? 'ok' : ok === false ? 'bad' : 'pending';
    return el('li', { class: cls },
      el('div', { class: 'ic', 'aria-hidden': 'true', html: icon(ok === true ? 'check' : ok === false ? 'x' : 'clock', 16) }),
      el('div', {},
        el('div', { class: 'lbl' },
          el('span', {}, t(`irel.d.ck.${key}`, { _default: it.label })),
          el('span', { class: `badge ${it.auto ? 'b-info' : 'b-slate'}` }, t(it.auto ? 'irel.d.ck_auto' : 'irel.d.ck_manual'))),
        it.note ? el('div', { class: 'note' }, it.note) : null),
      el('div', { class: 'st' }, t(ok === true ? 'irel.d.ck_ok' : ok === false ? 'irel.d.ck_bad' : 'irel.d.ck_pending')));
  }));
  mount(box,
    OPEN.includes(d.status) ? el('div', { class: 'alert info', style: { marginBottom: '12px' } }, el('span', { html: icon('lock', 18) }), el('div', {}, t('irel.d.ck_readonly'))) : null,
    list);
}

/* ------------------------------------------------------------------ SLA */
function renderSla() {
  const box = $('#sla');
  const sla = d.sla || {};
  if (!OPEN.includes(d.status) || sla.hours_left === null || sla.hours_left === undefined) {
    const released = d.status === 'RELEASED';
    mount(box,
      el('div', { class: `irel-sla-big ${released ? 'ok' : ''}`, style: released ? null : { color: 'var(--nk-muted)' } }, fmtDur(d.total_hours)),
      el('div', { class: 'irel-sla-cap', html: `${icon(released ? 'check-circle' : 'ban', 14)} ${esc(t(released ? 'irel.d.sla_closed_released' : 'irel.d.sla_closed_rejected'))}` }),
      el('div', { class: 'small muted' }, t('irel.d.sla_closed_sub', { d: fmtDur(d.total_hours) })));
    return;
  }
  const left = sla.hours_left;
  const breached = !!sla.breached || left < 0;
  const inst = d.status === 'RETURNED';
  const tone = breached ? 'bad' : left <= 24 ? 'warn' : 'ok';
  mount(box,
    el('div', {},
      el('div', { class: `irel-sla-big ${inst ? '' : tone}` }, fmtDur(left)),
      el('div', { class: 'irel-sla-cap' }, t(breached ? 'irel.d.sla_over' : 'irel.d.sla_left'))),
    dl([
      [t('irel.d.sla_stage'), esc(stageLabel(sla.stage || d.status))],
      [t('irel.d.sla_limit'), esc(t('irel.d.sla_days', { n: fmtNum(sla.sla_days || 0) }))],
      [t('irel.d.sla_due'), `<span class="nowrap">${esc(fmtDateTime(sla.due_at))}</span>`],
      [t('irel.d.with'), esc(t(ownerKey(d.status)))],
    ], { cols: 2 }),
    breached && !inst ? el('div', { class: 'alert danger' }, el('span', { html: icon('alert-circle', 18) }), el('div', {}, t('irel.d.sla_breached'))) : null,
    inst ? el('div', { class: 'alert info' }, el('span', { html: icon('info', 18) }), el('div', {}, t('irel.d.sla_inst'))) : null);
}

/* ------------------------------------------------------------------ timeline */
function renderTimeline() {
  const events = [...(d.events || [])].reverse();
  const items = events.map((e) => {
    const created = !e.from_status;
    const same = e.from_status && e.from_status === e.to_status;
    const title = el('div', { class: 'irel-tl-title' });
    if (created) title.append(el('span', {}, t('irel.d.tl_created')));
    else if (same) title.append(el('span', {}, t('irel.d.tl_checklist')));
    else title.innerHTML = `${releaseBadge(e.from_status)}<span aria-hidden="true">${icon('arrow-right', 14)}</span>${releaseBadge(e.to_status)}`;
    const actor = e.actor ? [e.actor.name, e.actor.designation].filter(Boolean).join(', ') : '';
    const role = e.actor && e.actor.role ? t(`role.${e.actor.role}`, { _default: e.actor.role }) : '';
    const body = el('div', { class: 'stack' },
      e.note ? el('div', { class: 'irel-note' }, e.note) : null,
      !created && !same && e.hours_in_prev ? el('div', {}, el('span', { class: 'badge b-slate', html: `${icon('hourglass', 12)}${esc(t('irel.d.tl_spent', { d: fmtDur(e.hours_in_prev), stage: stageLabel(e.from_status) }))}` })) : null);
    const tone = e.to_status === 'RELEASED' || e.to_status === 'APPROVED' ? 'success'
      : e.to_status === 'REJECTED' ? 'danger' : e.to_status === 'RETURNED' ? 'warning' : same ? 'muted' : '';
    return { title, meta: [actor, role, fmtDateTime(e.at)].filter(Boolean).join(' · '), body: body.childNodes.length ? body : null, tone };
  });
  timeline($('#timeline'), items);
}

/* ------------------------------------------------------------------ FDR */
function renderFdr() {
  const f = d.fdr || {};
  const live = !['released', 'rejected', 'invoked'].includes(f.display_status);
  mount($('#fdr'),
    dl([
      [t('irel.d.fdr_no'), `<span class="mono">${esc(f.fdr_number || d.fdr_number || '—')}</span>`],
      [t('irel.d.fdr_ref'), `<span class="mono">${esc(f.ref_no || d.fdr_ref_no || '—')}</span>`],
      [t('irel.d.fdr_bank'), esc((f.bank && f.bank.name) || (d.bank && d.bank.name) || '—')],
      [t('irel.d.fdr_amount'), esc(fmtINR(f.amount ?? d.amount))],
      [t('irel.d.fdr_maturity'), `${esc(fmtDate(f.maturity_date))}${live && f.days_to_maturity !== null && f.days_to_maturity !== undefined && f.days_to_maturity >= 0 ? ` ${maturityChip(f.days_to_maturity)}` : ''}`],
      [t('irel.d.fdr_status'), statusBadge(f.display_status || f.status)],
    ], { cols: 2 }),
    el('div', {}, el('a', { class: 'btn sm secondary', href: site(`institution/fdr.html?id=${d.fdr_id}`), html: `${icon('file-text', 15)}<span>${esc(t('irel.d.fdr_open'))}</span>` })));
}

/* ------------------------------------------------------------------ resubmit / NOC */
function renderAction() {
  const card = $('#action-card');
  const box = $('#action');
  if (d.status === 'RETURNED') {
    card.hidden = false;
    $('#act-h').textContent = t('irel.d.resub_title');
    const prev = $('#rs-note') ? $('#rs-note').value : '';
    const ta = el('textarea', { class: 'textarea', id: 'rs-note', rows: 4, maxlength: 1000, placeholder: t('irel.d.resub_ph') });
    ta.value = prev;
    const err = el('div', { class: 'error', hidden: true }, t('irel.d.resub_err'));
    ta.addEventListener('input', () => { err.hidden = true; ta.classList.remove('invalid'); });
    const btn = el('button', { class: 'btn', type: 'button', html: `${icon('refresh', 16)}<span>${esc(t('irel.d.resub_btn'))}</span>` });
    btn.addEventListener('click', () => {
      const note = ta.value.trim();
      if (!note) { err.hidden = false; ta.classList.add('invalid'); ta.focus(); return; }
      withBusy(btn, async () => {
        try {
          await api.post(`/releases/${d.id}/action`, { action: 'resubmit', note });
          toast(t('irel.d.resub_ok'), 'success');
          ta.value = '';
          await load(true);
        } catch (e) {
          toast(t('irel.d.fail', { msg: e.message || t('common.error') }), 'danger');
        }
      });
    });
    mount(box,
      d.decision_note ? el('div', { class: 'alert warning' }, el('span', { html: icon('alert', 18) }), el('div', {}, el('div', { class: 'a-title' }, t('irel.d.resub_alert')), el('div', { class: 'irel-note' }, d.decision_note))) : null,
      el('div', { class: 'field' }, el('label', { for: 'rs-note' }, t('irel.d.resub_label'), el('span', { class: 'req' }, ' *')), ta, err),
      el('div', {}, btn));
    return;
  }
  if (d.status === 'RELEASED') {
    card.hidden = false;
    $('#act-h').textContent = t('irel.d.noc_title');
    if (!d.noc_url) {
      mount(box, el('div', { class: 'alert warning' }, el('span', { html: icon('alert', 18) }), el('div', {}, t('irel.d.noc_missing'))));
      return;
    }
    const dlBtn = el('button', { class: 'btn success', type: 'button', html: `${icon('download', 16)}<span>${esc(t('irel.d.noc_download'))}</span>` });
    dlBtn.addEventListener('click', () => withBusy(dlBtn, async () => {
      try {
        downloadBlob(await api.blob(apiPath(d.noc_download_url || d.noc_url)), `NOC-${d.ref_no}.pdf`);
        toast(t('irel.d.noc_dl_ok'), 'success');
      } catch (e) {
        toast(t('irel.d.fail', { msg: e.message || t('common.error') }), 'danger');
      }
    }));
    mount(box,
      el('div', {},
        el('div', { class: 'cell-main', html: `${icon('check-circle', 16)} ${esc(t('irel.d.noc_issued', { d: fmtDateTime(d.released_at) }))}` }),
        d.decided_by ? el('div', { class: 'small muted' }, t('irel.d.noc_by', { name: personTxt(d.decided_by) })) : null),
      el('div', { class: 'irel-btns' },
        dlBtn,
        el('a', { class: 'btn secondary', href: site(`verify.html?ref=${encodeURIComponent(d.ref_no)}`), html: `${icon('qr', 16)}<span>${esc(t('irel.d.noc_verify'))}</span>` })));
    return;
  }
  card.hidden = true;
  mount(box);
}

/* ------------------------------------------------------------------ page */
function renderAll() {
  if (!d) return;
  setBack();
  document.title = `${d.ref_no} · ${t('irel.d.page')} · Nidhi Kavach`;
  renderSummary();
  renderProgress();
  renderChecklist();
  renderSla();
  renderTimeline();
  renderFdr();
  renderAction();
}

async function load(quiet = false) {
  if (!id) {
    contentEl.hidden = true;
    emptyState(stateEl, { icon: 'file', title: t('irel.d.no_id'), text: t('irel.d.no_id_text'), action: el('a', { class: 'btn', href: site('institution/releases.html') }, t('irel.d.back')) });
    return;
  }
  if (!quiet) { contentEl.hidden = true; loading(stateEl); }
  try {
    d = await api.get(`/releases/${encodeURIComponent(id)}`);
    mount(stateEl);
    contentEl.hidden = false;
    renderAll();
  } catch (err) {
    contentEl.hidden = true;
    if (err.status === 404 || err.status === 403) {
      emptyState(stateEl, { icon: 'file', title: t('irel.d.not_found'), text: t('irel.d.not_found_text'), action: el('a', { class: 'btn', href: site('institution/releases.html') }, t('irel.d.back')) });
    } else {
      errorState(stateEl, err, () => load());
    }
  }
}

onLang(() => { if (!id) load(); else renderAll(); });
load();
