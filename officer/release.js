// Officer: one release / refund / discharge request - stage stepper, SLA timer, checklist, actions, history, NOC.
import { initPage, setPageHead } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang } from '../assets/js/i18n.js';
import {
  $, $$, el, esc, icon, mount, loading, emptyState, errorState, toast, promptDialog, withBusy, dl, stepper, timeline,
  releaseBadge, statusBadge, trustBadge, lienBadge, maturityChip, fmtINR, fmtDate, fmtDateTime, fmtNum, getParam, downloadBlob,
} from '../assets/js/ui.js';

extend({
  en: {
    'rd.page': 'Release request',
    'rd.back': 'All requests',
    'rd.refresh': 'Refresh',
    'rd.breached': 'SLA breached',
    'rd.not_found': 'This release request could not be found',
    'rd.not_found_text': 'It may have been removed, or the link is incomplete.',
    'rd.no_id': 'No release request was selected',
    'rd.no_id_text': 'Open a request from the release & refund list.',
    'rd.amount': 'Deposit amount',
    'rd.amount_sub': 'FDR {fdr} · {bank}',
    'rd.fdr': 'FDR',
    'rd.bank': 'Bank',
    'rd.requested_at': 'Requested on',
    'rd.requested_by': 'Requested by',
    'rd.decided_by': 'Decided by',
    'rd.released_at': 'Released on',
    'rd.reason': 'Reason given by the institution',
    'rd.decision_note': 'Decision note',
    'rd.aicte_id': 'AICTE ID {id}',
    'rd.progress': 'Progress',
    'rd.progress_sub': 'Time spent at each stage of the release workflow',
    'rd.so_far': '{d} so far',
    'rd.not_reached': 'Not reached',
    'rd.total': 'Total time',
    'rd.with': 'Currently with',
    'rd.turnaround': 'Turnaround',
    'rd.with_officer': 'AICTE officer (scrutiny)',
    'rd.with_authority': 'Competent authority',
    'rd.with_release': 'AICTE officer (release)',
    'rd.with_inst': 'Institution',
    'rd.with_none': 'Closed',
    'rd.times_returned': 'Returned to institution',
    'rd.times_n': '{n} times',
    'rd.times_1': 'Once',
    'rd.times_0': 'Never',
    'rd.dur_dh': '{d} d {h} h',
    'rd.dur_d': '{d} d',
    'rd.dur_h': '{h} h',
    'rd.dur_m': '{m} min',
    'rd.sla_title': 'Service-level timer',
    'rd.sla_stage': 'Current stage',
    'rd.sla_due': 'Due by',
    'rd.sla_limit': 'Time allowed',
    'rd.sla_days': '{n} days',
    'rd.sla_left': 'left to act',
    'rd.sla_overdue': 'overdue',
    'rd.sla_breached': 'The time limit for this stage has passed. The request is shown as breached to officers and on the dashboard.',
    'rd.sla_inst': 'The clock is running on the institution: it has to reply within the allowed time.',
    'rd.sla_closed_released': 'Closed - deposit released',
    'rd.sla_closed_rejected': 'Closed - request rejected',
    'rd.sla_closed_sub': 'Completed in {d} from the request',
    'rd.sla_elapsed': '{p}% of the allowed time used',
    'rd.act_title': 'Next step',
    'rd.next.SUBMITTED': 'A new request is waiting. Start scrutiny to check the instrument and the release conditions.',
    'rd.next.SCRUTINY': 'Confirm the manual checks below, then recommend the release to the competent authority - or return it to the institution for more information.',
    'rd.next.RECOMMENDED': 'Recommended by the officer. The competent authority approves the release or returns it.',
    'rd.next.RECOMMENDED_wait': 'Recommended. Waiting for approval by the competent authority.',
    'rd.next.APPROVED': 'Approved. Releasing lifts the lien, closes the instrument and issues a portal-signed NOC to the institution and its bank.',
    'rd.next.RETURNED': 'Returned to the institution for information. It will come back to the queue when the institution resubmits.',
    'rd.next.RELEASED': 'The deposit has been released and the NOC has been issued. No further action is needed.',
    'rd.next.REJECTED': 'The request was rejected. The deposit remains held in favour of AICTE.',
    'rd.no_actions': 'There is nothing for you to do at this stage.',
    'rd.a.start_scrutiny': 'Start scrutiny',
    'rd.a.recommend': 'Recommend for approval',
    'rd.a.approve': 'Approve release',
    'rd.a.release': 'Release deposit & issue NOC',
    'rd.a.resubmit': 'Resubmit',
    'rd.a.return': 'Return for information',
    'rd.a.reject': 'Reject request',
    'rd.p.start_scrutiny': 'Start scrutiny of {ref}? Any checklist ticks you made are saved with it.',
    'rd.p.recommend': 'Recommend {ref} to the competent authority for approval. Every checklist item must be satisfied.',
    'rd.p.approve': 'Approve the release of {ref}. The officer can then release the deposit and issue the NOC.',
    'rd.p.release': 'Release {amt} for {ref}? The lien is lifted, the instrument is closed and a signed NOC is issued. This cannot be undone.',
    'rd.p.resubmit': 'Resubmit {ref} for scrutiny.',
    'rd.p.return': 'Return {ref} to the institution. Say what information or correction is needed.',
    'rd.p.reject': 'Reject {ref}. The deposit stays with AICTE. Give the reason that will be shared with the institution.',
    'rd.note_opt': 'Note (optional)',
    'rd.note_req': 'Note (required)',
    'rd.note_ph': 'Add a note for the record',
    'rd.ok.start_scrutiny': 'Scrutiny started for {ref}.',
    'rd.ok.recommend': '{ref} has been recommended to the competent authority.',
    'rd.ok.approve': '{ref} is approved. It can now be released.',
    'rd.ok.release': 'Deposit released for {ref}. The NOC has been issued.',
    'rd.ok.resubmit': '{ref} has been resubmitted.',
    'rd.ok.return': '{ref} has been returned to the institution.',
    'rd.ok.reject': '{ref} has been rejected.',
    'rd.ok.checklist': 'Checklist saved.',
    'rd.fail': 'The action could not be completed: {msg}',
    'rd.blocked': 'Recommendation blocked',
    'rd.ck_title': 'Release checklist',
    'rd.ck_sub': '{ok} of {n} conditions met',
    'rd.ck_auto': 'Auto',
    'rd.ck_manual': 'Manual',
    'rd.ck_auto_title': 'Checked automatically by the portal',
    'rd.ck_manual_title': 'Confirmed by the officer',
    'rd.ck_ok': 'Met',
    'rd.ck_bad': 'Not met',
    'rd.ck_pending': 'Pending',
    'rd.ck_confirm': 'Confirmed',
    'rd.ck_save': 'Save checklist',
    'rd.ck_note_ph': 'Note for the checklist (optional)',
    'rd.ck_unsaved': '{n} unsaved change(s)',
    'rd.ck_failures': 'Before recommending, these conditions must be met:',
    'rd.ck_all_ok': 'All conditions are met. The request can be recommended.',
    'rd.ck_readonly': 'The checklist is locked because the request is closed or with another stage owner.',
    'rd.ck_empty': 'No checklist items for this request.',
    'rd.ck.tenure_complete': 'Deposit tenure complete (matured), or discharge on closure',
    'rd.ck.no_open_discrepancy': 'No open discrepancy on the instrument',
    'rd.ck.lien_confirmed': 'Bank confirms the lien in favour of AICTE',
    'rd.ck.bank_verified': 'Deposit verified with the issuing bank',
    'rd.ck.no_pending_dues': 'No pending dues payable to AICTE',
    'rd.ck.no_complaints': 'No pending complaints or proceedings against the institution',
    'rd.ck.original_receipt_on_record': 'Original deposit receipt on record',
    'rd.ck.closure_formalities': 'Closure formalities completed',
    'rd.tl_title': 'Event history',
    'rd.tl_sub': 'Newest first · time spent in the previous stage',
    'rd.tl_created': 'Request submitted',
    'rd.tl_checklist': 'Checklist updated',
    'rd.tl_spent': '{d} in {stage}',
    'rd.fdr_title': 'Security deposit (FDR)',
    'rd.fdr_open': 'Open instrument',
    'rd.fdr_ref': 'Portal reference',
    'rd.fdr_no': 'FDR number',
    'rd.fdr_maturity': 'Maturity',
    'rd.fdr_status': 'Status',
    'rd.fdr_trust': 'Trust level',
    'rd.fdr_lien': 'Lien (bank)',
    'rd.fdr_inst': 'View institution',
    'rd.noc_title': 'No-objection certificate (NOC)',
    'rd.noc_sub': 'Portal-signed letter with a verifiable QR code',
    'rd.noc_issued': 'Issued on {d}',
    'rd.noc_by': 'Approved by {name}',
    'rd.noc_download': 'Download NOC',
    'rd.noc_open': 'Open in new tab',
    'rd.noc_verify': 'Verify publicly',
    'rd.noc_frame': 'NOC letter for {ref}',
    'rd.noc_missing': 'The NOC file is not available.',
    'rd.noc_dl_ok': 'NOC downloaded.',
  },
  hi: {
    'rd.page': 'रिलीज़ अनुरोध',
    'rd.back': 'सभी अनुरोध',
    'rd.refresh': 'रीफ़्रेश',
    'rd.breached': 'समय-सीमा पार',
    'rd.not_found': 'यह रिलीज़ अनुरोध नहीं मिला',
    'rd.not_found_text': 'हो सकता है इसे हटा दिया गया हो, या लिंक अधूरा है।',
    'rd.no_id': 'कोई रिलीज़ अनुरोध चयनित नहीं है',
    'rd.no_id_text': 'रिलीज़ एवं वापसी सूची से कोई अनुरोध खोलें।',
    'rd.amount': 'जमा राशि',
    'rd.amount_sub': 'एफडीआर {fdr} · {bank}',
    'rd.fdr': 'एफडीआर',
    'rd.bank': 'बैंक',
    'rd.requested_at': 'अनुरोध तिथि',
    'rd.requested_by': 'अनुरोधकर्ता',
    'rd.decided_by': 'निर्णयकर्ता',
    'rd.released_at': 'रिलीज़ तिथि',
    'rd.reason': 'संस्थान द्वारा बताया गया कारण',
    'rd.decision_note': 'निर्णय टिप्पणी',
    'rd.aicte_id': 'एआईसीटीई आईडी {id}',
    'rd.progress': 'प्रगति',
    'rd.progress_sub': 'रिलीज़ प्रक्रिया के प्रत्येक चरण में लगा समय',
    'rd.so_far': 'अब तक {d}',
    'rd.not_reached': 'अभी नहीं पहुँचा',
    'rd.total': 'कुल समय',
    'rd.with': 'वर्तमान में किसके पास',
    'rd.turnaround': 'निपटान समय',
    'rd.with_officer': 'एआईसीटीई अधिकारी (जाँच)',
    'rd.with_authority': 'सक्षम प्राधिकारी',
    'rd.with_release': 'एआईसीटीई अधिकारी (रिलीज़)',
    'rd.with_inst': 'संस्थान',
    'rd.with_none': 'बंद',
    'rd.times_returned': 'संस्थान को लौटाया गया',
    'rd.times_n': '{n} बार',
    'rd.times_1': 'एक बार',
    'rd.times_0': 'कभी नहीं',
    'rd.dur_dh': '{d} दिन {h} घंटे',
    'rd.dur_d': '{d} दिन',
    'rd.dur_h': '{h} घंटे',
    'rd.dur_m': '{m} मिनट',
    'rd.sla_title': 'सेवा-स्तर समय-सीमा',
    'rd.sla_stage': 'वर्तमान चरण',
    'rd.sla_due': 'नियत समय',
    'rd.sla_limit': 'अनुमत समय',
    'rd.sla_days': '{n} दिन',
    'rd.sla_left': 'कार्रवाई हेतु शेष',
    'rd.sla_overdue': 'विलंब',
    'rd.sla_breached': 'इस चरण की समय-सीमा समाप्त हो चुकी है। अधिकारियों और डैशबोर्ड पर यह अनुरोध समय-सीमा उल्लंघन के रूप में दिखाया जा रहा है।',
    'rd.sla_inst': 'समय-सीमा संस्थान पर लागू है: उसे अनुमत समय के भीतर उत्तर देना होगा।',
    'rd.sla_closed_released': 'बंद - जमा राशि रिलीज़ की गई',
    'rd.sla_closed_rejected': 'बंद - अनुरोध अस्वीकृत',
    'rd.sla_closed_sub': 'अनुरोध से {d} में पूर्ण',
    'rd.sla_elapsed': 'अनुमत समय का {p}% उपयोग हुआ',
    'rd.act_title': 'अगला चरण',
    'rd.next.SUBMITTED': 'नया अनुरोध प्रतीक्षा में है। लिखत और रिलीज़ की शर्तों की जाँच के लिए जाँच प्रारंभ करें।',
    'rd.next.SCRUTINY': 'नीचे दी गई मैन्युअल जाँचों की पुष्टि करें, फिर सक्षम प्राधिकारी को रिलीज़ की अनुशंसा करें - या अधिक जानकारी हेतु संस्थान को लौटाएँ।',
    'rd.next.RECOMMENDED': 'अधिकारी द्वारा अनुशंसित। सक्षम प्राधिकारी रिलीज़ को स्वीकृत करें या लौटाएँ।',
    'rd.next.RECOMMENDED_wait': 'अनुशंसित। सक्षम प्राधिकारी की स्वीकृति की प्रतीक्षा है।',
    'rd.next.APPROVED': 'स्वीकृत। रिलीज़ करने पर लियन हटेगा, लिखत बंद होगा और संस्थान तथा उसके बैंक को पोर्टल-हस्ताक्षरित एनओसी जारी होगा।',
    'rd.next.RETURNED': 'जानकारी हेतु संस्थान को लौटाया गया। संस्थान द्वारा पुनः प्रस्तुत करने पर यह कतार में वापस आएगा।',
    'rd.next.RELEASED': 'जमा राशि रिलीज़ कर दी गई है और एनओसी जारी हो चुका है। आगे कोई कार्रवाई आवश्यक नहीं।',
    'rd.next.REJECTED': 'अनुरोध अस्वीकृत किया गया। जमा राशि एआईसीटीई के पक्ष में ही रहेगी।',
    'rd.no_actions': 'इस चरण में आपके लिए कोई कार्रवाई नहीं है।',
    'rd.a.start_scrutiny': 'जाँच प्रारंभ करें',
    'rd.a.recommend': 'स्वीकृति हेतु अनुशंसा करें',
    'rd.a.approve': 'रिलीज़ स्वीकृत करें',
    'rd.a.release': 'जमा रिलीज़ करें एवं एनओसी जारी करें',
    'rd.a.resubmit': 'पुनः प्रस्तुत करें',
    'rd.a.return': 'जानकारी हेतु लौटाएँ',
    'rd.a.reject': 'अनुरोध अस्वीकृत करें',
    'rd.p.start_scrutiny': '{ref} की जाँच प्रारंभ करें? आपके द्वारा चिह्नित चेकलिस्ट भी साथ में सहेजी जाएगी।',
    'rd.p.recommend': '{ref} को स्वीकृति हेतु सक्षम प्राधिकारी को अनुशंसित करें। चेकलिस्ट की सभी शर्तें पूरी होनी चाहिए।',
    'rd.p.approve': '{ref} की रिलीज़ स्वीकृत करें। इसके बाद अधिकारी जमा राशि रिलीज़ कर एनओसी जारी कर सकेंगे।',
    'rd.p.release': '{ref} के लिए {amt} रिलीज़ करें? लियन हटेगा, लिखत बंद होगा और हस्ताक्षरित एनओसी जारी होगा। यह कार्रवाई वापस नहीं ली जा सकती।',
    'rd.p.resubmit': '{ref} को जाँच हेतु पुनः प्रस्तुत करें।',
    'rd.p.return': '{ref} को संस्थान को लौटाएँ। बताएँ कि कौन-सी जानकारी या सुधार आवश्यक है।',
    'rd.p.reject': '{ref} को अस्वीकृत करें। जमा राशि एआईसीटीई के पास रहेगी। संस्थान को बताया जाने वाला कारण लिखें।',
    'rd.note_opt': 'टिप्पणी (वैकल्पिक)',
    'rd.note_req': 'टिप्पणी (अनिवार्य)',
    'rd.note_ph': 'अभिलेख हेतु टिप्पणी जोड़ें',
    'rd.ok.start_scrutiny': '{ref} की जाँच प्रारंभ हो गई।',
    'rd.ok.recommend': '{ref} सक्षम प्राधिकारी को अनुशंसित कर दिया गया।',
    'rd.ok.approve': '{ref} स्वीकृत हो गया। अब इसे रिलीज़ किया जा सकता है।',
    'rd.ok.release': '{ref} की जमा राशि रिलीज़ कर दी गई। एनओसी जारी हो गया।',
    'rd.ok.resubmit': '{ref} पुनः प्रस्तुत कर दिया गया।',
    'rd.ok.return': '{ref} संस्थान को लौटा दिया गया।',
    'rd.ok.reject': '{ref} अस्वीकृत कर दिया गया।',
    'rd.ok.checklist': 'चेकलिस्ट सहेज ली गई।',
    'rd.fail': 'कार्रवाई पूरी नहीं हो सकी: {msg}',
    'rd.blocked': 'अनुशंसा रोकी गई',
    'rd.ck_title': 'रिलीज़ चेकलिस्ट',
    'rd.ck_sub': '{n} में से {ok} शर्तें पूरी',
    'rd.ck_auto': 'स्वचालित',
    'rd.ck_manual': 'मैन्युअल',
    'rd.ck_auto_title': 'पोर्टल द्वारा स्वतः जाँचा गया',
    'rd.ck_manual_title': 'अधिकारी द्वारा पुष्टि',
    'rd.ck_ok': 'पूरी',
    'rd.ck_bad': 'पूरी नहीं',
    'rd.ck_pending': 'लंबित',
    'rd.ck_confirm': 'पुष्टि की',
    'rd.ck_save': 'चेकलिस्ट सहेजें',
    'rd.ck_note_ph': 'चेकलिस्ट हेतु टिप्पणी (वैकल्पिक)',
    'rd.ck_unsaved': '{n} परिवर्तन सहेजे नहीं गए',
    'rd.ck_failures': 'अनुशंसा से पहले ये शर्तें पूरी होनी चाहिए:',
    'rd.ck_all_ok': 'सभी शर्तें पूरी हैं। अनुरोध की अनुशंसा की जा सकती है।',
    'rd.ck_readonly': 'अनुरोध बंद होने या अन्य चरण में होने के कारण चेकलिस्ट संपादित नहीं की जा सकती।',
    'rd.ck_empty': 'इस अनुरोध के लिए कोई चेकलिस्ट नहीं है।',
    'rd.ck.tenure_complete': 'जमा अवधि पूर्ण (परिपक्व), अथवा बंद होने पर निर्वहन',
    'rd.ck.no_open_discrepancy': 'लिखत पर कोई खुली विसंगति नहीं',
    'rd.ck.lien_confirmed': 'बैंक द्वारा एआईसीटीई के पक्ष में लियन की पुष्टि',
    'rd.ck.bank_verified': 'जारीकर्ता बैंक से जमा का सत्यापन',
    'rd.ck.no_pending_dues': 'एआईसीटीई को देय कोई बकाया नहीं',
    'rd.ck.no_complaints': 'संस्थान के विरुद्ध कोई लंबित शिकायत या कार्यवाही नहीं',
    'rd.ck.original_receipt_on_record': 'मूल जमा रसीद अभिलेख में उपलब्ध',
    'rd.ck.closure_formalities': 'बंद करने की औपचारिकताएँ पूर्ण',
    'rd.tl_title': 'घटनाक्रम',
    'rd.tl_sub': 'नवीनतम पहले · पिछले चरण में लगा समय',
    'rd.tl_created': 'अनुरोध प्रस्तुत किया गया',
    'rd.tl_checklist': 'चेकलिस्ट अद्यतन की गई',
    'rd.tl_spent': '{stage} में {d}',
    'rd.fdr_title': 'प्रतिभूति जमा (एफडीआर)',
    'rd.fdr_open': 'लिखत खोलें',
    'rd.fdr_ref': 'पोर्टल संदर्भ',
    'rd.fdr_no': 'एफडीआर संख्या',
    'rd.fdr_maturity': 'परिपक्वता',
    'rd.fdr_status': 'स्थिति',
    'rd.fdr_trust': 'विश्वसनीयता स्तर',
    'rd.fdr_lien': 'लियन (बैंक)',
    'rd.fdr_inst': 'संस्थान देखें',
    'rd.noc_title': 'अनापत्ति प्रमाणपत्र (एनओसी)',
    'rd.noc_sub': 'सत्यापन योग्य क्यूआर कोड सहित पोर्टल-हस्ताक्षरित पत्र',
    'rd.noc_issued': '{d} को जारी',
    'rd.noc_by': '{name} द्वारा स्वीकृत',
    'rd.noc_download': 'एनओसी डाउनलोड करें',
    'rd.noc_open': 'नए टैब में खोलें',
    'rd.noc_verify': 'सार्वजनिक सत्यापन',
    'rd.noc_frame': '{ref} का एनओसी पत्र',
    'rd.noc_missing': 'एनओसी फ़ाइल उपलब्ध नहीं है।',
    'rd.noc_dl_ok': 'एनओसी डाउनलोड हो गया।',
    'rd.rtl.release': 'लियन मुक्ति (जमा राशि संस्थान को वापस)',
    'rd.rtl.refund': 'प्रतिभूति जमा की वापसी',
    'rd.rtl.discharge': 'संस्थान बंद होने पर जमा का निर्वहन',
  },
});

const FLOW = ['SUBMITTED', 'SCRUTINY', 'RECOMMENDED', 'APPROVED', 'RELEASED'];
const OPEN = ['SUBMITTED', 'SCRUTINY', 'RECOMMENDED', 'APPROVED', 'RETURNED'];
const NOTE_REQUIRED = ['return', 'reject'];
const ACTION_STYLE = {
  start_scrutiny: { cls: 'btn', ic: 'play' },
  recommend: { cls: 'btn', ic: 'send' },
  approve: { cls: 'btn success', ic: 'check-circle' },
  release: { cls: 'btn success', ic: 'unlock' },
  resubmit: { cls: 'btn', ic: 'refresh' },
  return: { cls: 'btn secondary', ic: 'arrow-left' },
  reject: { cls: 'btn outline-danger', ic: 'ban' },
};

const id = getParam('id');
const backBtn = el('a', { class: 'btn secondary', href: site('officer/releases.html') });
const refreshBtn = el('button', { class: 'btn ghost', type: 'button' });
const { user } = await initPage({
  roles: ['officer', 'authority', 'admin'],
  active: 'releases',
  title: 'rd.page',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'officer/dashboard.html' }, { label: 'nav.releases', href: 'officer/releases.html' }, { label: 'rd.page' }],
  actions: el('div', { class: 'row' }, refreshBtn, backBtn),
});

$$('[data-icon]').forEach((n) => { n.innerHTML = icon(n.dataset.icon, 18); });

const stateEl = $('#rd-state');
const contentEl = $('#rd-content');
let d = null;            // current detail
let dirty = {};          // manual checklist ticks changed locally: key -> bool
let loadedAt = Date.now();
let blockedMsg = '';     // last 409 from recommend
let tick = null;

/* ------------------------------------------------------------------ helpers */
function fmtDur(hours) {
  if (hours === null || hours === undefined || Number.isNaN(hours)) return '—';
  const abs = Math.abs(hours);
  if (abs < 1) return t('rd.dur_m', { m: Math.max(1, Math.round(abs * 60)) });
  const total = Math.round(abs);
  const days = Math.floor(total / 24);
  const h = total % 24;
  if (!days) return t('rd.dur_h', { h });
  return h ? t('rd.dur_dh', { d: days, h }) : t('rd.dur_d', { d: days });
}
const stageLabel = (s) => t(`rstage.${s}`, { _default: s });
const rtypeLabel = (r) => t(`rd.rtl.${r.request_type}`, { _default: r.request_type_label || t(`rtype.${r.request_type}`, { _default: r.request_type }) });
const personTxt = (p) => (p ? [p.name, p.designation].filter(Boolean).join(', ') : '—');
const hoursLeftNow = () => (d && d.sla && d.sla.hours_left !== null && d.sla.hours_left !== undefined
  ? d.sla.hours_left - (Date.now() - loadedAt) / 3600000 : null);
const apiPath = (p) => String(p || '').replace(/^\/api(?=\/)/, '');

function stageOwner(status) {
  return ({ SUBMITTED: 'rd.with_officer', SCRUTINY: 'rd.with_officer', RECOMMENDED: 'rd.with_authority', APPROVED: 'rd.with_release', RETURNED: 'rd.with_inst' })[status] || 'rd.with_none';
}

/* ------------------------------------------------------------------ summary */
function renderSummary() {
  const inst = d.institution || {};
  const bank = d.bank || {};
  const loc = [inst.city, inst.state].filter(Boolean).join(', ');
  const fdrLink = el('a', { class: 'mono', href: site(`officer/fdr.html?id=${d.fdr_id}`) }, d.fdr_number || d.fdr_ref_no || '—');
  const pairs = [
    [t('rd.fdr'), el('span', {}, fdrLink, d.fdr_ref_no && d.fdr_number ? el('span', { class: 'muted small' }, ` · ${d.fdr_ref_no}`) : null)],
    [t('rd.bank'), esc(bank.name || '—')],
    [t('rd.requested_at'), esc(fmtDateTime(d.requested_at))],
    [t('rd.requested_by'), esc(personTxt(d.requested_by))],
  ];
  if (d.decided_by) pairs.push([t('rd.decided_by'), esc(personTxt(d.decided_by))]);
  if (d.released_at) pairs.push([t('rd.released_at'), esc(fmtDateTime(d.released_at))]);
  if (d.decision_note && (d.status === 'REJECTED' || d.status === 'RELEASED' || d.status === 'APPROVED')) pairs.push([t('rd.decision_note'), esc(d.decision_note)]);

  mount($('#rd-summary'),
    el('div', {},
      el('div', { class: 'rd-badges', html: `<span class="badge b-saffron lg">${esc(t(`rtype.${d.request_type}`, { _default: d.request_type }))}</span>${releaseBadge(d.status)}${d.sla_breached && OPEN.includes(d.status) && d.status !== 'RETURNED' ? `<span class="badge b-danger">${icon('alert-circle', 12)}${esc(t('rd.breached'))}</span>` : ''}<span class="mono small muted">${esc(d.ref_no)}</span>` }),
      el('div', { class: 'rd-inst', id: 'rd-inst-name' }, inst.id ? el('a', { href: site(`officer/institution.html?id=${inst.id}`) }, inst.name) : (inst.name || '—')),
      el('div', { class: 'rd-inst-sub' }, [inst.aicte_id ? t('rd.aicte_id', { id: inst.aicte_id }) : null, inst.type, loc].filter(Boolean).join(' · ')),
      el('div', { class: 'small text-2', style: { marginTop: '8px' } }, rtypeLabel(d))),
    el('div', { class: 'rd-amount' },
      el('div', { class: 'l' }, t('rd.amount')),
      el('div', { class: 'v' }, fmtINR(d.amount)),
      el('div', { class: 's' }, t('rd.amount_sub', { fdr: d.fdr_number || d.fdr_ref_no || '—', bank: bank.code || bank.name || '—' }))),
    d.reason ? el('div', { class: 'rd-reason' }, el('div', { class: 'l' }, t('rd.reason')), el('p', {}, d.reason)) : null,
    el('div', { class: 'rd-sum-dl' }, dl(pairs, { cols: 3 })));
}

/* ------------------------------------------------------------------ stepper */
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
    if (state === 'current') meta = t('rd.so_far', { d: fmtDur(durs[s]) });
    else if (state === 'done' && s !== 'RELEASED') meta = durs[s] !== undefined ? fmtDur(durs[s]) : '—';
    else if (state === 'done') meta = fmtDate(d.released_at);
    else meta = t('rd.not_reached');
    steps.push({ label: stageLabel(s), meta, state });
    if (i === badAt) {
      const extra = status === 'RETURNED' ? t('rd.so_far', { d: fmtDur(durs.RETURNED) }) : fmtDate(d.decided_at || (d.events || []).slice(-1)[0]?.at);
      steps.push({ label: stageLabel(status), meta: extra, state: 'bad' });
    }
  });
  stepper($('#rd-stepper'), steps);

  const returns = (d.events || []).filter((e) => e.to_status === 'RETURNED').length;
  const open = OPEN.includes(status);
  const stat = (label, value, color) => el('div', { class: 'stat-inline' },
    el('span', { class: 'v', style: color ? { color } : null }, value), el('span', { class: 'l' }, label));
  mount($('#rd-progress-foot'),
    stat(open ? t('rd.total') : t('rd.turnaround'), fmtDur(d.total_hours)),
    stat(t('rd.with'), t(stageOwner(status)), open ? 'var(--nk-primary-700)' : 'var(--nk-muted)'),
    stat(t('rd.times_returned'), returns === 0 ? t('rd.times_0') : returns === 1 ? t('rd.times_1') : t('rd.times_n', { n: returns }), returns ? 'var(--nk-warning)' : null),
    d.sla && d.sla.sla_days ? stat(t('rd.sla_limit'), t('rd.sla_days', { n: fmtNum(d.sla.sla_days) })) : null);
}

/* ------------------------------------------------------------------ SLA */
function renderSla() {
  const box = $('#rd-sla');
  const sla = d.sla || {};
  if (!OPEN.includes(d.status) || sla.hours_left === null || sla.hours_left === undefined) {
    const released = d.status === 'RELEASED';
    mount(box,
      el('div', { class: `rd-sla-big ${released ? 'ok' : ''}`, style: released ? null : { color: 'var(--nk-muted)' } }, fmtDur(d.total_hours)),
      el('div', { class: 'rd-sla-cap', html: `${icon(released ? 'check-circle' : 'ban', 14)} ${esc(t(released ? 'rd.sla_closed_released' : 'rd.sla_closed_rejected'))}` }),
      el('div', { class: 'small muted', style: { marginTop: '8px' } }, t('rd.sla_closed_sub', { d: fmtDur(d.total_hours) })));
    return;
  }
  const left = hoursLeftNow();
  const inst = d.status === 'RETURNED';
  const breached = left < 0;
  const allowed = (sla.sla_days || 0) * 24;
  const pct = allowed ? Math.max(0, Math.min(100, ((allowed - left) / allowed) * 100)) : 0;
  const tone = breached ? 'bad' : left <= 24 ? 'warn' : 'ok';
  mount(box,
    el('div', { class: 'row between', style: { alignItems: 'flex-start' } },
      el('div', {},
        el('div', { class: `rd-sla-big ${inst ? '' : tone}` }, fmtDur(left)),
        el('div', { class: 'rd-sla-cap' }, t(breached ? 'rd.sla_overdue' : 'rd.sla_left'))),
      el('span', { html: releaseBadge(d.status) })),
    el('div', { class: `meter ${breached ? 'danger' : pct >= 75 ? 'warning' : ''}`, role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(pct), 'aria-label': t('rd.sla_elapsed', { p: Math.round(pct) }) },
      el('span', { style: { width: `${pct}%` } })),
    el('div', { class: 'small muted', style: { marginTop: '6px' } }, t('rd.sla_elapsed', { p: Math.round(pct) })),
    el('div', { class: 'rd-sla-rows' }, dl([
      [t('rd.sla_stage'), esc(stageLabel(sla.stage || d.status))],
      [t('rd.sla_limit'), esc(t('rd.sla_days', { n: fmtNum(sla.sla_days) }))],
      [t('rd.sla_due'), `<span class="nowrap">${esc(fmtDateTime(sla.due_at))}</span>`],
      [t('rd.with'), esc(t(stageOwner(d.status)))],
    ], { cols: 2 })),
    breached && !inst ? el('div', { class: 'alert danger', style: { marginTop: '14px' } }, el('span', { html: icon('alert-circle', 18) }), el('div', {}, t('rd.sla_breached'))) : null,
    inst ? el('div', { class: 'alert info', style: { marginTop: '14px' } }, el('span', { html: icon('info', 18) }), el('div', {}, t('rd.sla_inst'))) : null);
}

/* ------------------------------------------------------------------ actions */
function renderActions() {
  const box = $('#rd-actions');
  const acts = (d.allowed_actions || []).filter((a) => ACTION_STYLE[a]);
  let nextKey = `rd.next.${d.status}`;
  if (d.status === 'RECOMMENDED' && !acts.includes('approve')) nextKey = 'rd.next.RECOMMENDED_wait';
  const primary = acts.filter((a) => !['return', 'reject'].includes(a));
  const secondary = acts.filter((a) => ['return', 'reject'].includes(a));
  const btn = (a) => {
    const st = ACTION_STYLE[a];
    const b = el('button', { class: `${st.cls} block`, type: 'button', 'data-action': a, html: `${icon(st.ic, 16)}<span>${esc(t(`rd.a.${a}`))}</span>` });
    b.addEventListener('click', () => doAction(a, b));
    return b;
  };
  mount(box,
    el('p', { class: 'rd-next' }, t(nextKey)),
    acts.length ? el('div', { class: 'rd-actions' }, primary.map(btn), secondary.map(btn))
      : el('div', { class: 'alert info' }, el('span', { html: icon(d.status === 'RELEASED' ? 'check-circle' : 'info', 18) }), el('div', {}, t('rd.no_actions'))));
}

async function doAction(action, btn) {
  const required = NOTE_REQUIRED.includes(action);
  const note = await promptDialog({
    title: t(`rd.a.${action}`),
    label: el('span', {},
      el('span', { style: { display: 'block', fontWeight: 400, lineHeight: 1.55, color: 'var(--nk-text-2)', marginBottom: '12px' } }, t(`rd.p.${action}`, { ref: d.ref_no, amt: fmtINR(d.amount) })),
      el('span', { style: { display: 'block' } }, t(required ? 'rd.note_req' : 'rd.note_opt'))),
    placeholder: t('rd.note_ph'),
    required,
    confirmLabel: t(`rd.a.${action}`),
    variant: action === 'reject' ? 'danger' : (action === 'approve' || action === 'release') ? 'success' : 'primary',
  });
  if (note === null) return;
  const body = { action, note: note || '' };
  const ticks = Object.keys(dirty).length ? { ...dirty } : null;
  if (ticks && ['start_scrutiny', 'recommend'].includes(action)) body.checklist = ticks;
  await withBusy(btn, async () => {
    try {
      const res = await api.post(`/releases/${d.id}/action`, body);
      if (body.checklist) dirty = {};
      blockedMsg = '';
      setDetail(res);
      toast(t(`rd.ok.${action}`, { ref: d.ref_no }), 'success');
      if (action === 'release') $('#rd-noc-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      if (err.status === 409 && action === 'recommend') {
        blockedMsg = err.message;
        if (body.checklist) { dirty = {}; await reload(true); } else renderChecklist();
        toast(err.message, 'danger', 7000);
        $('#rd-checklist').closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        toast(t('rd.fail', { msg: err.message || t('common.error') }), 'danger', 7000);
      }
    }
  });
}

/* ------------------------------------------------------------------ checklist */
function itemOk(key, item) {
  if (!item.auto && Object.prototype.hasOwnProperty.call(dirty, key)) return dirty[key];
  return item.ok;
}

function renderChecklist() {
  const box = $('#rd-checklist');
  const foot = $('#rd-ck-foot');
  const entries = Object.entries(d.checklist || {});
  if (!entries.length) {
    emptyState(box, { icon: 'file-check', title: t('rd.ck_empty') });
    foot.hidden = true;
    $('#rd-ck-sub').textContent = '';
    return;
  }
  const editable = !!d.can_edit_checklist;
  const okCount = entries.filter(([k, it]) => itemOk(k, it) === true).length;
  $('#rd-ck-sub').textContent = t('rd.ck_sub', { ok: okCount, n: entries.length });

  const list = el('ul', { class: 'rd-ck' }, entries.map(([key, it]) => {
    const ok = itemOk(key, it);
    const cls = ok === true ? 'ok' : ok === false ? 'bad' : 'pending';
    const isDirty = Object.prototype.hasOwnProperty.call(dirty, key);
    let ctl;
    if (!it.auto && editable) {
      const cb = el('input', { type: 'checkbox', id: `rd-ck-${key}` });
      cb.checked = ok === true;
      cb.addEventListener('change', () => {
        if ((it.ok === true) === cb.checked) delete dirty[key]; else dirty[key] = cb.checked;
        renderChecklist();
        const again = document.getElementById(`rd-ck-${key}`);
        if (again) again.focus();
      });
      ctl = el('div', { class: 'ctl' }, el('label', { class: 'check', for: `rd-ck-${key}` }, cb, el('span', {}, t('rd.ck_confirm'))));
    } else {
      ctl = el('div', { class: 'st' }, t(ok === true ? 'rd.ck_ok' : ok === false ? 'rd.ck_bad' : 'rd.ck_pending'));
    }
    return el('li', { class: `${cls} ${isDirty ? 'dirty' : ''}` },
      el('div', { class: 'ic', 'aria-hidden': 'true', html: icon(ok === true ? 'check' : ok === false ? 'x' : 'clock', 16) }),
      el('div', { class: 'm' },
        el('div', { class: 'lbl', html: `${esc(t(`rd.ck.${key}`, { _default: it.label }))}<span class="badge ${it.auto ? 'b-info' : 'b-slate'}" title="${esc(t(it.auto ? 'rd.ck_auto_title' : 'rd.ck_manual_title'))}">${esc(t(it.auto ? 'rd.ck_auto' : 'rd.ck_manual'))}</span>` }),
        it.note ? el('div', { class: 'note' }, it.note) : null),
      ctl);
  }));

  const failures = d.checklist_failures || [];
  const pendingLocal = entries.filter(([k, it]) => itemOk(k, it) !== true);
  let banner = null;
  if (blockedMsg) {
    banner = el('div', { class: 'alert danger rd-ck-alert' }, el('span', { html: icon('alert-circle', 18) }),
      el('div', {}, el('div', { class: 'a-title' }, t('rd.blocked')), el('div', {}, blockedMsg)));
  } else if (editable && d.status !== 'RETURNED' && pendingLocal.length) {
    banner = el('div', { class: 'alert warning rd-ck-alert' }, el('span', { html: icon('alert', 18) }),
      el('div', {}, el('div', { class: 'a-title' }, t('rd.ck_failures')),
        el('ul', { style: { margin: '4px 0 0', paddingLeft: '18px' } }, pendingLocal.map(([k, it]) => el('li', {}, t(`rd.ck.${k}`, { _default: it.label }))))));
  } else if (editable && !failures.length && !pendingLocal.length && ['SUBMITTED', 'SCRUTINY'].includes(d.status)) {
    banner = el('div', { class: 'alert success rd-ck-alert' }, el('span', { html: icon('check-circle', 18) }), el('div', {}, t('rd.ck_all_ok')));
  } else if (!editable && OPEN.includes(d.status)) {
    banner = el('div', { class: 'alert info rd-ck-alert' }, el('span', { html: icon('lock', 18) }), el('div', {}, t('rd.ck_readonly')));
  }
  mount(box, banner, list);

  const hasManual = entries.some(([, it]) => !it.auto);
  foot.hidden = !(editable && hasManual);
  if (!foot.hidden) {
    const n = Object.keys(dirty).length;
    const prevNote = $('#rd-ck-note') ? $('#rd-ck-note').value : '';
    const noteIn = el('input', { class: 'input sm', id: 'rd-ck-note', type: 'text', maxlength: 300, placeholder: t('rd.ck_note_ph'), 'aria-label': t('rd.ck_note_ph') });
    noteIn.value = prevNote;
    const save = el('button', { class: 'btn sm', type: 'button', html: `${icon('check', 15)}<span>${esc(t('rd.ck_save'))}</span>` });
    save.disabled = !n;
    save.addEventListener('click', () => saveChecklist(save, noteIn));
    mount(foot, el('div', { class: 'rd-ck-foot' },
      noteIn, save, n ? el('span', { class: 'small', style: { color: 'var(--nk-primary-700)', fontWeight: 600 } }, t('rd.ck_unsaved', { n })) : null));
  }
}

async function saveChecklist(btn, noteIn) {
  if (!Object.keys(dirty).length) return;
  await withBusy(btn, async () => {
    try {
      const res = await api.post(`/releases/${d.id}/action`, { action: 'checklist', checklist: { ...dirty }, note: noteIn.value.trim() });
      dirty = {};
      blockedMsg = '';
      noteIn.value = '';
      setDetail(res);
      toast(t('rd.ok.checklist'), 'success');
    } catch (err) {
      toast(t('rd.fail', { msg: err.message || t('common.error') }), 'danger', 7000);
    }
  });
}

/* ------------------------------------------------------------------ timeline */
function renderTimeline() {
  const events = [...(d.events || [])].reverse();
  const items = events.map((e) => {
    const created = !e.from_status;
    const same = e.from_status && e.from_status === e.to_status;
    const title = el('div', { class: 'rd-tl-title' });
    if (created) title.append(el('span', {}, t('rd.tl_created')));
    else if (same) title.append(el('span', {}, t('rd.tl_checklist')));
    else {
      title.innerHTML = `${releaseBadge(e.from_status)}<span class="arrow">${icon('arrow-right', 14)}</span>${releaseBadge(e.to_status)}`;
    }
    const actor = e.actor ? [e.actor.name, e.actor.designation].filter(Boolean).join(', ') : '';
    const role = e.actor && e.actor.role ? t(`role.${e.actor.role}`, { _default: e.actor.role }) : '';
    const body = el('div', { class: 'rd-tl-body' },
      e.note ? el('div', { class: 'rd-tl-note' }, e.note) : null,
      !created && !same && e.hours_in_prev ? el('span', { class: 'badge b-slate', html: `${icon('hourglass', 12)}${esc(t('rd.tl_spent', { d: fmtDur(e.hours_in_prev), stage: stageLabel(e.from_status) }))}` }) : null);
    const tone = e.to_status === 'RELEASED' || e.to_status === 'APPROVED' ? 'success'
      : e.to_status === 'REJECTED' ? 'danger' : e.to_status === 'RETURNED' ? 'warning' : same ? 'muted' : '';
    return {
      title,
      meta: [actor, role, fmtDateTime(e.at)].filter(Boolean).join(' · '),
      body: body.childNodes.length ? body : null,
      tone,
    };
  });
  timeline($('#rd-timeline'), items);
}

/* ------------------------------------------------------------------ FDR card */
function renderFdr() {
  const f = d.fdr || {};
  mount($('#rd-fdr'),
    dl([
      [t('rd.fdr_no'), `<span class="mono">${esc(f.fdr_number || d.fdr_number || '—')}</span>`],
      [t('rd.fdr_ref'), `<span class="mono">${esc(f.ref_no || d.fdr_ref_no || '—')}</span>`],
      [t('rd.bank'), esc((f.bank && f.bank.name) || (d.bank && d.bank.name) || '—')],
      [t('rd.amount'), esc(fmtINR(f.amount ?? d.amount))],
      [t('rd.fdr_maturity'), `${esc(fmtDate(f.maturity_date))}${f.days_to_maturity !== null && f.days_to_maturity !== undefined && f.days_to_maturity >= 0 && !['released', 'rejected', 'invoked'].includes(f.display_status) ? ` ${maturityChip(f.days_to_maturity)}` : ''}`],
      [t('rd.fdr_status'), statusBadge(f.display_status || f.status)],
      [t('rd.fdr_trust'), trustBadge(f.trust_level, f.flagged)],
      [t('rd.fdr_lien'), lienBadge(f.lien_confirmed, f.lien_claimed)],
    ], { cols: 2 }),
    el('div', { class: 'row', style: { marginTop: '16px', flexWrap: 'wrap', gap: '8px' } },
      el('a', { class: 'btn sm secondary', href: site(`officer/fdr.html?id=${d.fdr_id}`), html: `${icon('file-text', 15)}<span>${esc(t('rd.fdr_open'))}</span>` }),
      d.institution && d.institution.id ? el('a', { class: 'btn sm ghost', href: site(`officer/institution.html?id=${d.institution.id}`), html: `${icon('building', 15)}<span>${esc(t('rd.fdr_inst'))}</span>` }) : null));
}

/* ------------------------------------------------------------------ NOC */
let nocSrc = '';
function renderNoc() {
  const card = $('#rd-noc-card');
  const box = $('#rd-noc');
  if (d.status !== 'RELEASED') { card.hidden = true; nocSrc = ''; mount(box); return; }
  card.hidden = false;
  if (!d.noc_url) {
    mount(box, el('div', { class: 'alert warning' }, el('span', { html: icon('alert', 18) }), el('div', {}, t('rd.noc_missing'))));
    return;
  }
  const src = api.fileUrl(apiPath(d.noc_url));
  const dlBtn = el('button', { class: 'btn sm success', type: 'button', html: `${icon('download', 15)}<span>${esc(t('rd.noc_download'))}</span>` });
  dlBtn.addEventListener('click', () => withBusy(dlBtn, async () => {
    try {
      const blob = await api.blob(apiPath(d.noc_download_url || d.noc_url));
      downloadBlob(blob, `NOC-${d.ref_no}.pdf`);
      toast(t('rd.noc_dl_ok'), 'success');
    } catch (err) {
      toast(t('rd.fail', { msg: err.message || t('common.error') }), 'danger');
    }
  }));
  const existing = box.querySelector('iframe');
  const frame = existing && nocSrc === src ? existing : el('iframe', { class: 'doc-frame', src, loading: 'lazy' });
  frame.title = t('rd.noc_frame', { ref: d.ref_no });
  nocSrc = src;
  mount(box,
    el('div', { class: 'rd-noc-meta' },
      el('div', {},
        el('div', { class: 'cell-main', html: `${icon('check-circle', 16)} ${esc(t('rd.noc_issued', { d: fmtDateTime(d.released_at) }))}` }),
        d.decided_by ? el('div', { class: 'small muted' }, t('rd.noc_by', { name: personTxt(d.decided_by) })) : null),
      el('div', { class: 'rd-noc-btns' },
        dlBtn,
        el('a', { class: 'btn sm secondary', href: src, target: '_blank', rel: 'noopener', html: `${icon('arrow-up-right', 15)}<span>${esc(t('rd.noc_open'))}</span>` }),
        el('a', { class: 'btn sm ghost', href: site(`verify.html?ref=${encodeURIComponent(d.ref_no)}`), html: `${icon('qr', 15)}<span>${esc(t('rd.noc_verify'))}</span>` }))),
    frame);
}

/* ------------------------------------------------------------------ page */
function renderChrome() {
  refreshBtn.innerHTML = `${icon('refresh', 16)}<span>${esc(t('rd.refresh'))}</span>`;
  backBtn.innerHTML = `${icon('arrow-left', 16)}<span>${esc(t('rd.back'))}</span>`;
}

function renderAll() {
  if (!d) return;
  setPageHead({
    title: d.ref_no,
    subtitle: `${t(`rtype.${d.request_type}`, { _default: d.request_type })} · ${(d.institution && d.institution.name) || ''}`,
    breadcrumbs: [{ label: 'nav.dashboard', href: 'officer/dashboard.html' }, { label: 'nav.releases', href: 'officer/releases.html' }, { label: d.ref_no }],
    actions: el('div', { class: 'row' }, refreshBtn, backBtn),
  });
  document.title = `${d.ref_no} · ${t('rd.page')} · Nidhi Kavach`;
  renderSummary();
  renderProgress();
  renderSla();
  renderActions();
  renderChecklist();
  renderTimeline();
  renderFdr();
  renderNoc();
}

function setDetail(res) {
  d = res;
  loadedAt = Date.now();
  // drop local ticks that now match the server
  Object.keys(dirty).forEach((k) => { const it = d.checklist && d.checklist[k]; if (!it || it.auto || it.ok === dirty[k]) delete dirty[k]; });
  if (!d.can_edit_checklist) dirty = {};
  renderAll();
}

async function reload(quiet = false) {
  if (!quiet || !d) { contentEl.hidden = true; loading(stateEl); }
  try {
    const res = await api.get(`/releases/${encodeURIComponent(id)}`);
    mount(stateEl);
    contentEl.hidden = false;
    setDetail(res);
  } catch (err) {
    if (quiet && d) { toast(t('rd.fail', { msg: err.message || t('common.error') }), 'danger'); return; }
    contentEl.hidden = true;
    if (err.status === 404) {
      emptyState(stateEl, { icon: 'search', title: t('rd.not_found'), text: t('rd.not_found_text'),
        action: el('a', { class: 'btn', href: site('officer/releases.html') }, t('rd.back')) });
    } else {
      errorState(stateEl, err, () => reload());
    }
  }
}

renderChrome();
onLang(() => { renderChrome(); renderAll(); });
refreshBtn.addEventListener('click', () => withBusy(refreshBtn, () => reload(true)));

if (!id) {
  emptyState(stateEl, { icon: 'inbox', title: t('rd.no_id'), text: t('rd.no_id_text'),
    action: el('a', { class: 'btn', href: site('officer/releases.html') }, t('rd.back')) });
} else {
  await reload();
  // keep the SLA countdown live
  tick = setInterval(() => { if (d && OPEN.includes(d.status) && !document.hidden) renderSla(); }, 60000);
}
void user;
