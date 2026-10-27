// Admin · Settings: SLA / escalation / baseline, demo clock, demo reset, signing-key registry.
import { initPage } from '../assets/js/layout.js';
import { api, site, clearSession } from '../assets/js/api.js';
import { t, extend, onLang, apply } from '../assets/js/i18n.js';
import {
  $, $$, el, esc, icon, fmtDate, fmtDateTime, fmtNum, releaseBadge, loading, errorState, emptyState,
  renderTable, confirmDialog, toast, withBusy, mount, copyText,
} from '../assets/js/ui.js';

extend({
  en: {
    'st.title': 'Portal settings',
    'st.subtitle': 'Service levels, escalation timing, impact baseline and the controls used during a demonstration',
    'st.sla_h': 'Release & refund SLA',
    'st.sla_sub': 'Working days allowed in each stage',
    'st.sla_total': 'End-to-end target (submitted → approved)',
    'st.sla.SUBMITTED': 'A new request waits for an officer to pick it up',
    'st.sla.SCRUTINY': 'Officer checks documents, lien and the checklist',
    'st.sla.RECOMMENDED': 'Waits for the competent authority to approve',
    'st.sla.APPROVED': 'Bank releases the deposit and the NOC is issued',
    'st.sla.RETURNED': 'Institution corrects and resubmits a returned request',
    'st.esc_h': 'Escalation & verification',
    'st.esc_sub': 'Days after maturity before each level is alerted',
    'st.esc.institution': 'Institution',
    'st.esc.officer': 'AICTE officers (level 1)',
    'st.esc.authority': 'Competent authority (level 2)',
    'st.esc.institution_d': 'Overdue alert by in-app, email and SMS',
    'st.esc.officer_d': 'Officers are asked to follow up',
    'st.esc.authority_d': 'The Director is alerted for a decision',
    'st.ver_l': 'Verification SLA',
    'st.ver_d': 'Officers are reminded when a submission waits longer than this',
    'st.lad.institution': 'Institution',
    'st.lad.officer': 'Officers',
    'st.lad.authority': 'Authority',
    'st.day_n': 'Day {n}',
    'st.days': 'days',
    'st.days_n': '{n} days',
    'st.base_h': 'Impact baseline: the manual process',
    'st.base_link': 'See the impact comparison',
    'st.base_info_t': 'Where these numbers come from',
    'st.base_info': 'These are the "before" figures for the paper-based process that Nidhi Kavach replaces: registers, physical FDR receipts, letters to banks and manual follow-up. The Analytics page compares them with what the portal measures live. Change them if your office has better estimates.',
    'st.b.manual_verification_days': 'Time to verify one FDR',
    'st.b.manual_verification_days_d': 'Letters to the bank and back, by post',
    'st.b.release_turnaround_days': 'Time to release a deposit',
    'st.b.release_turnaround_days_d': 'From the institution’s request to the NOC',
    'st.b.missed_renewals_per_year': 'Renewals missed each year',
    'st.b.missed_renewals_per_year_d': 'FDRs that matured without anyone noticing',
    'st.b.records_complete_pct': 'Records complete and current',
    'st.b.records_complete_pct_d': 'Share of files with every document in place',
    'st.b.manual_hours_per_month': 'Staff time on follow-up',
    'st.b.manual_hours_per_month_d': 'Calls, letters and register updates per month',
    'st.b.discrepancy_auto_detect_pct': 'Discrepancies caught automatically',
    'st.b.discrepancy_auto_detect_pct_d': 'Mismatches found without a manual check',
    'st.u.days': 'days',
    'st.u.per_year': 'per year',
    'st.u.pct': '%',
    'st.u.hours': 'hours',
    'st.undo': 'Undo changes',
    'st.save': 'Save settings',
    'st.clean': 'All settings are saved.',
    'st.dirty': 'You have unsaved changes.',
    'st.invalid': 'Some values need attention before saving.',
    'st.saved': 'Settings saved. New deadlines apply from the next daily job.',
    'st.e_int': 'Enter a whole number from {min} to {max}.',
    'st.e_order': 'Each level must come on or after the previous one (institution ≤ officers ≤ authority).',
    'st.load_err': 'The settings could not be loaded.',
    'st.clock_h': 'Demo clock',
    'st.clock_intro': 'Move the portal’s date forward to show reminders, maturity and escalation without waiting. Only the demo date changes; real records keep their real timestamps.',
    'st.real': 'Real date',
    'st.demo': 'Portal date',
    'st.sim': 'Simulated',
    'st.live': 'Live',
    'st.offset_0': 'Same as the real date',
    'st.offset_pos': '{n} days ahead of the real date',
    'st.offset_neg': '{n} days behind the real date',
    'st.jump': 'Move the clock',
    'st.m7': '−7 days',
    'st.p7': '+7 days',
    'st.p30': '+30 days',
    'st.reset_clock': 'Back to today',
    'st.goto_l': 'Or jump to a date',
    'st.goto': 'Go to date',
    'st.goto_err': 'Choose a date first.',
    'st.run_job': 'Run the daily job after the change (reminders, escalations, bank re-checks)',
    'st.clock_done': 'The portal date is now {date}.',
    'st.clock_reset_done': 'The demo clock is back on the real date ({date}).',
    'st.job_t': 'Daily job result for {date}',
    'st.job_none': 'The daily job was not run for this change.',
    'st.job_nothing': 'Nothing new was due on this day.',
    'st.last_job': 'Last daily job: demo day {date} · finished {at}',
    'st.never_job': 'The daily job has not run yet.',
    'st.j.notifications_created': 'Messages sent',
    'st.j.reminders': 'Pre-maturity reminders',
    'st.j.escalations': 'Overdue escalations',
    'st.j.stale_verifications': 'Stale verifications',
    'st.j.sla_breaches': 'Release SLA breaches',
    'st.j.bank_checks': 'Bank re-checks',
    'st.j.bank_issues': 'Bank issues found',
    'st.reset_h': 'Danger zone: reset demo data',
    'st.reset_intro': 'Puts the portal back to the original demo story. Use it before a fresh presentation.',
    'st.reset_1': 'Every FDR, release, discrepancy, notification and audit entry is deleted and generated again.',
    'st.reset_2': 'All users are recreated with the demo password, so you will be signed out.',
    'st.reset_3': 'Bank and portal signing keys are re-issued and the demo clock returns to today.',
    'st.reset_4': 'It takes up to a minute. It cannot be undone.',
    'st.reset_type': 'Type RESET to confirm',
    'st.reset_hint': 'This guard stops an accidental click.',
    'st.reset_btn': 'Reset demo data',
    'st.reset_q': 'Delete all demo data and generate it again? Everyone will be signed out. This cannot be undone.',
    'st.reset_title': 'Reset demo data',
    'st.resetting': 'Resetting… generating institutions, deposits, releases and history. Please keep this page open.',
    'st.reset_ok': 'Demo data has been reset. Signing you out so you can sign in again…',
    'st.reset_counts': 'Freshly generated',
    'st.keys_h': 'Signing key registry',
    'st.keys_verify': 'Open the public verify page',
    'st.keys_intro': 'Public Ed25519 keys used to check bank-signed FDR receipts, bank verification replies and portal-issued NOC letters. Anyone can verify a document against this list; only the owner holds the private key.',
    'st.k_id': 'Key ID',
    'st.k_owner': 'Owner',
    'st.k_signs': 'Signs',
    'st.k_fp': 'Fingerprint',
    'st.k_reg': 'Registered',
    'st.k_pub': 'Public key',
    'st.k_copy': 'Copy public key',
    'st.k_type.bank': 'Bank',
    'st.k_type.portal': 'Portal',
    'st.sign.FDR': 'FDR receipts',
    'st.sign.BVR': 'Bank verification replies',
    'st.sign.NOC': 'NOC letters',
    'st.keys_empty': 'No keys registered yet',
  },
  hi: {
    'st.title': 'पोर्टल सेटिंग्स',
    'st.subtitle': 'सेवा स्तर, एस्केलेशन का समय, प्रभाव आधार-रेखा और प्रदर्शन के दौरान उपयोग होने वाले नियंत्रण',
    'st.sla_h': 'रिलीज़ एवं वापसी एसएलए',
    'st.sla_sub': 'प्रत्येक चरण के लिए अनुमत कार्य-दिवस',
    'st.sla_total': 'कुल लक्ष्य (जमा → अनुमोदित)',
    'st.sla.SUBMITTED': 'नया अनुरोध किसी अधिकारी द्वारा उठाए जाने की प्रतीक्षा में',
    'st.sla.SCRUTINY': 'अधिकारी दस्तावेज़, ग्रहणाधिकार और जाँच-सूची देखते हैं',
    'st.sla.RECOMMENDED': 'सक्षम प्राधिकारी के अनुमोदन की प्रतीक्षा',
    'st.sla.APPROVED': 'बैंक जमा राशि जारी करता है और एनओसी जारी होती है',
    'st.sla.RETURNED': 'संस्थान लौटाए गए अनुरोध को सुधार कर पुनः जमा करता है',
    'st.esc_h': 'एस्केलेशन एवं सत्यापन',
    'st.esc_sub': 'परिपक्वता के बाद प्रत्येक स्तर को सूचित करने से पहले के दिन',
    'st.esc.institution': 'संस्थान',
    'st.esc.officer': 'एआईसीटीई अधिकारी (स्तर 1)',
    'st.esc.authority': 'सक्षम प्राधिकारी (स्तर 2)',
    'st.esc.institution_d': 'पोर्टल सूचना, ईमेल और एसएमएस द्वारा अतिदेय अलर्ट',
    'st.esc.officer_d': 'अधिकारियों से अनुवर्ती कार्रवाई का अनुरोध',
    'st.esc.authority_d': 'निर्णय हेतु निदेशक को सूचित किया जाता है',
    'st.ver_l': 'सत्यापन एसएलए',
    'st.ver_d': 'कोई प्रस्तुति इससे अधिक समय प्रतीक्षा करे तो अधिकारियों को अनुस्मारक',
    'st.lad.institution': 'संस्थान',
    'st.lad.officer': 'अधिकारी',
    'st.lad.authority': 'प्राधिकारी',
    'st.day_n': 'दिन {n}',
    'st.days': 'दिन',
    'st.days_n': '{n} दिन',
    'st.base_h': 'प्रभाव आधार-रेखा: मैनुअल प्रक्रिया',
    'st.base_link': 'प्रभाव तुलना देखें',
    'st.base_info_t': 'ये आँकड़े कहाँ से आते हैं',
    'st.base_info': 'ये उस काग़ज़ी प्रक्रिया के "पहले" के आँकड़े हैं जिसका स्थान निधि कवच लेता है: रजिस्टर, भौतिक एफडीआर रसीदें, बैंकों को पत्र और मैनुअल अनुवर्ती कार्रवाई। विश्लेषण पृष्ठ इनकी तुलना पोर्टल द्वारा लाइव मापे गए आँकड़ों से करता है। यदि आपके कार्यालय के पास बेहतर अनुमान हैं तो इन्हें बदलें।',
    'st.b.manual_verification_days': 'एक एफडीआर के सत्यापन का समय',
    'st.b.manual_verification_days_d': 'डाक से बैंक को पत्र और उत्तर',
    'st.b.release_turnaround_days': 'जमा राशि जारी करने का समय',
    'st.b.release_turnaround_days_d': 'संस्थान के अनुरोध से एनओसी तक',
    'st.b.missed_renewals_per_year': 'प्रति वर्ष छूटे नवीनीकरण',
    'st.b.missed_renewals_per_year_d': 'बिना किसी की जानकारी के परिपक्व हुई एफडीआर',
    'st.b.records_complete_pct': 'पूर्ण एवं अद्यतन अभिलेख',
    'st.b.records_complete_pct_d': 'सभी दस्तावेज़ों सहित फ़ाइलों का अनुपात',
    'st.b.manual_hours_per_month': 'अनुवर्ती कार्य पर कर्मचारियों का समय',
    'st.b.manual_hours_per_month_d': 'प्रति माह कॉल, पत्र और रजिस्टर अद्यतन',
    'st.b.discrepancy_auto_detect_pct': 'स्वतः पकड़ी गई विसंगतियाँ',
    'st.b.discrepancy_auto_detect_pct_d': 'मैनुअल जाँच के बिना पाई गई असंगतियाँ',
    'st.u.days': 'दिन',
    'st.u.per_year': 'प्रति वर्ष',
    'st.u.pct': '%',
    'st.u.hours': 'घंटे',
    'st.undo': 'परिवर्तन वापस लें',
    'st.save': 'सेटिंग्स सहेजें',
    'st.clean': 'सभी सेटिंग्स सहेजी हुई हैं।',
    'st.dirty': 'आपके कुछ परिवर्तन अभी सहेजे नहीं गए हैं।',
    'st.invalid': 'सहेजने से पहले कुछ मानों को ठीक करना आवश्यक है।',
    'st.saved': 'सेटिंग्स सहेज ली गईं। नई समय-सीमाएँ अगले दैनिक कार्य से लागू होंगी।',
    'st.e_int': '{min} से {max} के बीच पूर्ण संख्या दर्ज करें।',
    'st.e_order': 'प्रत्येक स्तर पिछले स्तर के बराबर या उसके बाद होना चाहिए (संस्थान ≤ अधिकारी ≤ प्राधिकारी)।',
    'st.load_err': 'सेटिंग्स लोड नहीं हो सकीं।',
    'st.clock_h': 'डेमो घड़ी',
    'st.clock_intro': 'प्रतीक्षा किए बिना अनुस्मारक, परिपक्वता और एस्केलेशन दिखाने के लिए पोर्टल की तिथि आगे बढ़ाएँ। केवल डेमो तिथि बदलती है; वास्तविक अभिलेखों का समय वास्तविक ही रहता है।',
    'st.real': 'वास्तविक तिथि',
    'st.demo': 'पोर्टल तिथि',
    'st.sim': 'सिम्युलेटेड',
    'st.live': 'वास्तविक',
    'st.offset_0': 'वास्तविक तिथि के समान',
    'st.offset_pos': 'वास्तविक तिथि से {n} दिन आगे',
    'st.offset_neg': 'वास्तविक तिथि से {n} दिन पीछे',
    'st.jump': 'घड़ी बदलें',
    'st.m7': '−7 दिन',
    'st.p7': '+7 दिन',
    'st.p30': '+30 दिन',
    'st.reset_clock': 'आज पर लौटें',
    'st.goto_l': 'या किसी तिथि पर जाएँ',
    'st.goto': 'तिथि पर जाएँ',
    'st.goto_err': 'पहले कोई तिथि चुनें।',
    'st.run_job': 'परिवर्तन के बाद दैनिक कार्य चलाएँ (अनुस्मारक, एस्केलेशन, बैंक पुनर्जाँच)',
    'st.clock_done': 'पोर्टल तिथि अब {date} है।',
    'st.clock_reset_done': 'डेमो घड़ी वास्तविक तिथि ({date}) पर लौट आई है।',
    'st.job_t': '{date} के दैनिक कार्य का परिणाम',
    'st.job_none': 'इस परिवर्तन के लिए दैनिक कार्य नहीं चलाया गया।',
    'st.job_nothing': 'इस दिन कोई नई कार्रवाई देय नहीं थी।',
    'st.last_job': 'अंतिम दैनिक कार्य: डेमो दिवस {date} · पूर्ण {at}',
    'st.never_job': 'दैनिक कार्य अभी तक नहीं चला है।',
    'st.j.notifications_created': 'भेजे गए संदेश',
    'st.j.reminders': 'परिपक्वता-पूर्व अनुस्मारक',
    'st.j.escalations': 'अतिदेय एस्केलेशन',
    'st.j.stale_verifications': 'लंबित सत्यापन',
    'st.j.sla_breaches': 'रिलीज़ एसएलए उल्लंघन',
    'st.j.bank_checks': 'बैंक पुनर्जाँच',
    'st.j.bank_issues': 'बैंक समस्याएँ मिलीं',
    'st.reset_h': 'जोखिम क्षेत्र: डेमो डेटा रीसेट करें',
    'st.reset_intro': 'पोर्टल को मूल डेमो कथा पर वापस ले आता है। नई प्रस्तुति से पहले इसका उपयोग करें।',
    'st.reset_1': 'प्रत्येक एफडीआर, रिलीज़, विसंगति, सूचना और ऑडिट प्रविष्टि हटाकर फिर से बनाई जाती है।',
    'st.reset_2': 'सभी उपयोगकर्ता डेमो पासवर्ड के साथ फिर से बनाए जाते हैं, इसलिए आप साइन आउट हो जाएँगे।',
    'st.reset_3': 'बैंक और पोर्टल की हस्ताक्षर कुंजियाँ पुनः जारी होती हैं और डेमो घड़ी आज पर लौट आती है।',
    'st.reset_4': 'इसमें लगभग एक मिनट लगता है। इसे पूर्ववत नहीं किया जा सकता।',
    'st.reset_type': 'पुष्टि के लिए RESET टाइप करें',
    'st.reset_hint': 'यह सुरक्षा ग़लती से हुए क्लिक को रोकती है।',
    'st.reset_btn': 'डेमो डेटा रीसेट करें',
    'st.reset_q': 'सारा डेमो डेटा हटाकर फिर से बनाएँ? सभी उपयोगकर्ता साइन आउट हो जाएँगे। इसे पूर्ववत नहीं किया जा सकता।',
    'st.reset_title': 'डेमो डेटा रीसेट करें',
    'st.resetting': 'रीसेट हो रहा है… संस्थान, जमा, रिलीज़ और इतिहास बनाए जा रहे हैं। कृपया यह पृष्ठ खुला रखें।',
    'st.reset_ok': 'डेमो डेटा रीसेट हो गया। आपको साइन आउट किया जा रहा है ताकि आप फिर से साइन इन कर सकें…',
    'st.reset_counts': 'नए सिरे से बनाए गए',
    'st.keys_h': 'हस्ताक्षर कुंजी रजिस्टर',
    'st.keys_verify': 'सार्वजनिक सत्यापन पृष्ठ खोलें',
    'st.keys_intro': 'बैंक-हस्ताक्षरित एफडीआर रसीदों, बैंक सत्यापन उत्तरों और पोर्टल द्वारा जारी एनओसी पत्रों की जाँच में प्रयुक्त सार्वजनिक Ed25519 कुंजियाँ। कोई भी इस सूची से दस्तावेज़ का सत्यापन कर सकता है; निजी कुंजी केवल स्वामी के पास रहती है।',
    'st.k_id': 'कुंजी आईडी',
    'st.k_owner': 'स्वामी',
    'st.k_signs': 'हस्ताक्षर करता है',
    'st.k_fp': 'फ़िंगरप्रिंट',
    'st.k_reg': 'पंजीकृत',
    'st.k_pub': 'सार्वजनिक कुंजी',
    'st.k_copy': 'सार्वजनिक कुंजी कॉपी करें',
    'st.k_type.bank': 'बैंक',
    'st.k_type.portal': 'पोर्टल',
    'st.sign.FDR': 'एफडीआर रसीदें',
    'st.sign.BVR': 'बैंक सत्यापन उत्तर',
    'st.sign.NOC': 'एनओसी पत्र',
    'st.keys_empty': 'अभी कोई कुंजी पंजीकृत नहीं है',
  },
});

await initPage({
  roles: ['admin'],
  active: 'settings',
  title: 'st.title',
  subtitle: 'st.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'officer/dashboard.html' }, { label: 'nav.settings' }],
});

const SLA_STAGES = ['SUBMITTED', 'SCRUTINY', 'RECOMMENDED', 'APPROVED', 'RETURNED'];
const ESC_LEVELS = ['institution', 'officer', 'authority'];
const BASELINE = [
  ['manual_verification_days', 'st.u.days', 0, 365],
  ['release_turnaround_days', 'st.u.days', 0, 365],
  ['missed_renewals_per_year', 'st.u.per_year', 0, 10000],
  ['records_complete_pct', 'st.u.pct', 0, 100],
  ['manual_hours_per_month', 'st.u.hours', 0, 10000],
  ['discrepancy_auto_detect_pct', 'st.u.pct', 0, 100],
];
const JOB_KEYS = ['notifications_created', 'reminders', 'escalations', 'stale_verifications', 'sla_breaches', 'bank_checks', 'bank_issues'];

let saved = null;      // last settings from the server
let lastClock = null;  // last clock change result (with job)

$$('[data-icon]').forEach((n) => { n.innerHTML = icon(n.dataset.icon, 16); });
$('#base-link').href = site('officer/analytics.html');
$('#keys-verify').href = site('verify.html');

/* ------------------------------------------------------------------ number rows */
function numRow({ id, label, desc, value, unit, min = 0, max = 365, badge = '' }) {
  const input = el('input', { class: 'input', type: 'number', id, name: id, min, max, step: 1, value: value ?? '', inputmode: 'numeric', 'aria-describedby': `${id}-d ${id}-e` });
  input.dataset.min = min;
  input.dataset.max = max;
  return el('div', { class: 'st-row' },
    el('div', {},
      el('label', { class: 'r-label', for: id, html: `${badge}<span>${esc(label)}</span>` }),
      desc ? el('div', { class: 'r-desc', id: `${id}-d` }, desc) : null),
    el('div', { class: 'st-num' }, input, el('span', { class: 'unit' }, unit)),
    el('div', { class: 'error', id: `${id}-e`, role: 'alert' }));
}

function renderForm(s) {
  mount($('#sla'), SLA_STAGES.map((k) => numRow({
    id: `sla-${k}`, label: '', badge: releaseBadge(k), desc: t(`st.sla.${k}`), value: s.sla_days?.[k], unit: t('st.u.days'), min: 0, max: 120,
  })));
  mount($('#esc'),
    ESC_LEVELS.map((k) => numRow({ id: `esc-${k}`, label: t(`st.esc.${k}`), desc: t(`st.esc.${k}_d`), value: s.escalation_days?.[k], unit: t('st.u.days'), min: 0, max: 365 })),
    numRow({ id: 'ver-sla', label: t('st.ver_l'), desc: t('st.ver_d'), value: s.verification_sla_days, unit: t('st.u.days'), min: 1, max: 90 }));
  const rows = BASELINE.map(([k, u, min, max]) => numRow({ id: `base-${k}`, label: t(`st.b.${k}`), desc: t(`st.b.${k}_d`), value: s.baseline?.[k], unit: t(u), min, max }));
  mount($('#base-a'), rows.slice(0, 3));
  mount($('#base-b'), rows.slice(3));
  $$('#cfg input[type=number]').forEach((i) => i.addEventListener('input', onEdit));
  onEdit();
}

const intVal = (id) => { const v = $(`#${id}`)?.value; return v === '' || v == null ? NaN : Number(v); };

function readForm() {
  const sla_days = Object.fromEntries(SLA_STAGES.map((k) => [k, intVal(`sla-${k}`)]));
  const escalation_days = Object.fromEntries(ESC_LEVELS.map((k) => [k, intVal(`esc-${k}`)]));
  const baseline = { ...(saved?.baseline || {}), ...Object.fromEntries(BASELINE.map(([k]) => [k, intVal(`base-${k}`)])) };
  return { sla_days, escalation_days, verification_sla_days: intVal('ver-sla'), baseline };
}

function validate() {
  let ok = true;
  $$('#cfg input[type=number]').forEach((i) => {
    const v = i.value === '' ? NaN : Number(i.value);
    const bad = !Number.isInteger(v) || v < Number(i.dataset.min) || v > Number(i.dataset.max);
    const msg = bad ? t('st.e_int', { min: i.dataset.min, max: fmtNum(Number(i.dataset.max)) }) : '';
    i.classList.toggle('invalid', bad);
    i.setAttribute('aria-invalid', bad ? 'true' : 'false');
    $(`#${i.id}-e`).textContent = msg;
    if (bad) ok = false;
  });
  const [a, b, c] = ESC_LEVELS.map((k) => intVal(`esc-${k}`));
  if (ok && !(a <= b && b <= c)) {
    ok = false;
    ['officer', 'authority'].forEach((k) => $(`#esc-${k}`).classList.add('invalid'));
    $('#esc-authority-e').textContent = t('st.e_order');
  }
  return ok;
}

function renderLadder() {
  const days = ESC_LEVELS.map((k) => intVal(`esc-${k}`));
  const ic = { institution: 'building', officer: 'user', authority: 'stamp' };
  mount($('#esc-ladder'), ESC_LEVELS.map((k, i) => el('div', { class: `n ${k === 'authority' ? 'l2' : ''}` },
    el('span', { class: 'dot', html: icon(ic[k], 15) }),
    el('span', { class: 'd' }, Number.isFinite(days[i]) ? t('st.day_n', { n: days[i] }) : '—'),
    el('span', {}, t(`st.lad.${k}`)))));
}

function isDirty() {
  if (!saved) return false;
  const f = readForm();
  const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  return !(same(f.sla_days, Object.fromEntries(SLA_STAGES.map((k) => [k, saved.sla_days?.[k]])))
    && same(f.escalation_days, Object.fromEntries(ESC_LEVELS.map((k) => [k, saved.escalation_days?.[k]])))
    && f.verification_sla_days === saved.verification_sla_days
    && BASELINE.every(([k]) => f.baseline[k] === saved.baseline?.[k]));
}

function onEdit() {
  const valid = validate();
  const dirty = isDirty();
  const f = readForm();
  const total = ['SUBMITTED', 'SCRUTINY', 'RECOMMENDED', 'APPROVED'].reduce((s, k) => s + (Number.isFinite(f.sla_days[k]) ? f.sla_days[k] : 0), 0);
  $('#sla-total').textContent = t('st.days_n', { n: fmtNum(total) });
  renderLadder();
  const bar = $('#savebar');
  bar.classList.toggle('dirty', dirty);
  $('#save-msg').innerHTML = !valid
    ? `${icon('alert-circle', 16)}<span>${esc(t('st.invalid'))}</span>`
    : dirty ? `${icon('edit', 16)}<span>${esc(t('st.dirty'))}</span>` : `${icon('check-circle', 16)}<span>${esc(t('st.clean'))}</span>`;
  $('#save').disabled = !dirty || !valid;
  $('#undo').disabled = !dirty;
}

$('#undo').addEventListener('click', () => { if (saved) renderForm(saved); });
$('#cfg').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate()) { $('#cfg .input.invalid')?.focus(); return; }
  withBusy($('#save'), async () => {
    try {
      const res = await api.put('/admin/settings', readForm());
      saved = { ...saved, ...(res || readForm()) };
      renderForm(saved);
      toast(t('st.saved'), 'success');
    } catch (err) {
      toast(err.message || t('common.error'), 'danger');
    }
  });
});
window.addEventListener('beforeunload', (e) => { if (isDirty()) { e.preventDefault(); e.returnValue = ''; } });

/* ------------------------------------------------------------------ demo clock */
function updateHeaderClock(c) {
  const chip = document.querySelector('.nk-simclock');
  if (!chip) return;
  chip.classList.toggle('real', !c.simulated);
  chip.title = c.simulated ? `${t('clock.simulated')} (real: ${fmtDate(c.real_today)})` : t('clock.demo_date');
  chip.innerHTML = `${icon('calendar', 14)}<span class="lbl">${esc(c.simulated ? t('clock.simulated') : t('clock.real'))}:</span> ${esc(fmtDate(c.today))}`;
}

function jobStats(result) {
  return el('div', { class: 'st-stats' }, JOB_KEYS.map((k) => el('div', { class: 'st-stat' },
    el('div', { class: `v ${k === 'notifications_created' && result?.[k] ? 'hl' : ''}` }, fmtNum(result?.[k] || 0)),
    el('div', { class: 'l' }, t(`st.j.${k}`)))));
}

function jobPanel() {
  if (lastClock) {
    const job = lastClock.job;
    if (!job) return el('div', { class: 'st-result' }, el('div', { class: 'muted' }, t('st.job_none')));
    const nothing = !JOB_KEYS.some((k) => job[k]);
    return el('div', { class: 'st-result', 'aria-live': 'polite' },
      el('div', { class: 'r-title', html: `${icon('zap', 16)}<span>${esc(t('st.job_t', { date: fmtDate(job.date || lastClock.today) }))}</span>` }),
      nothing ? el('div', { class: 'text-2 small', style: { marginBottom: '8px' } }, t('st.job_nothing')) : null,
      jobStats(job));
  }
  const lj = saved?.last_daily_job;
  return el('div', { class: 'muted small' }, lj ? t('st.last_job', { date: fmtDate(lj.date), at: fmtDateTime(lj.at) }) : t('st.never_job'));
}

function renderClock() {
  if (!saved) return;
  const off = saved.sim_offset_days || 0;
  const sim = !!saved.simulated || off !== 0;
  mount($('#clock-badge'), el('span', { class: `badge ${sim ? 'b-warning' : 'b-success'}`, html: `${icon(sim ? 'clock' : 'check', 12)}${esc(sim ? t('st.sim') : t('st.live'))}` }));
  const offTxt = off === 0 ? t('st.offset_0') : off > 0 ? t('st.offset_pos', { n: fmtNum(off) }) : t('st.offset_neg', { n: fmtNum(-off) });
  const runJob = el('input', { type: 'checkbox', id: 'clk-job', checked: true });
  const dateIn = el('input', { class: 'input', type: 'date', id: 'clk-date', value: saved.today });
  const btn = (label, cls, body, ic) => el('button', { class: `btn ${cls}`, type: 'button', html: `${ic ? icon(ic, 15) : ''}<span>${esc(label)}</span>`, onclick: (e) => moveClock(e.currentTarget, body, runJob.checked) });
  const gotoBtn = el('button', { class: 'btn secondary', type: 'button', html: `${icon('arrow-right', 15)}<span>${esc(t('st.goto'))}</span>`,
    onclick: (e) => { if (!dateIn.value) { toast(t('st.goto_err'), 'warning'); dateIn.focus(); return; } moveClock(e.currentTarget, { date: dateIn.value }, runJob.checked); } });
  mount($('#clock-body'),
    el('p', { class: 'text-2 mt-0 mb-0' }, t('st.clock_intro')),
    el('div', { class: 'st-clock-dates' },
      el('div', { class: 'st-date' }, el('div', { class: 'lbl' }, t('st.real')), el('div', { class: 'val' }, fmtDate(saved.real_today)), el('div', { class: 'small muted' }, t('clock.real'))),
      el('div', { class: `st-date ${sim ? 'sim' : ''}` }, el('div', { class: 'lbl' }, t('st.demo')), el('div', { class: 'val' }, fmtDate(saved.today)), el('div', { class: 'small text-2' }, offTxt))),
    el('div', {},
      el('div', { class: 'label', style: { marginBottom: '6px' } }, t('st.jump')),
      el('div', { class: 'st-jump' },
        btn(t('st.m7'), 'secondary', { days: -7 }),
        btn(t('st.p7'), 'secondary', { days: 7 }),
        btn(t('st.p30'), 'saffron', { days: 30 }),
        btn(t('st.reset_clock'), 'ghost', { date: null }, 'refresh'))),
    el('div', { class: 'st-goto' },
      el('div', { class: 'field' }, el('label', { for: 'clk-date' }, t('st.goto_l')), dateIn),
      gotoBtn),
    el('label', { class: 'check' }, runJob, t('st.run_job')),
    el('div', { id: 'clk-result' }, jobPanel()));
}

async function moveClock(button, body, runJob) {
  await withBusy(button, async () => {
    try {
      const res = await api.post('/admin/clock', { ...body, run_job: runJob });
      lastClock = res;
      saved = { ...saved, today: res.today, sim_offset_days: res.offset_days, simulated: res.simulated };
      if (res.job) saved.last_daily_job = { date: res.job.date || res.today, at: null, result: res.job };
      updateHeaderClock({ today: res.today, simulated: res.simulated, real_today: saved.real_today });
      renderClock();
      toast(res.offset_days === 0 ? t('st.clock_reset_done', { date: fmtDate(res.today) }) : t('st.clock_done', { date: fmtDate(res.today) }), 'success');
    } catch (err) {
      toast(err.message || t('common.error'), 'danger');
    }
  });
}

/* ------------------------------------------------------------------ reset demo */
const resetWord = $('#reset-word');
const resetBtn = $('#reset-btn');
resetWord.addEventListener('input', () => { resetBtn.disabled = resetWord.value.trim().toUpperCase() !== 'RESET'; });
resetBtn.addEventListener('click', async () => {
  if (resetWord.value.trim().toUpperCase() !== 'RESET') return;
  const ok = await confirmDialog(t('st.reset_q'), { title: t('st.reset_title'), confirmLabel: t('st.reset_btn'), variant: 'danger' });
  if (!ok) return;
  const out = $('#reset-result');
  mount(out, el('div', { class: 'alert warning', html: `${icon('hourglass', 18)}<div>${esc(t('st.resetting'))}</div>` }));
  await withBusy(resetBtn, async () => {
    try {
      const res = await api.post('/admin/reset-demo', {});
      const counts = res?.counts || {};
      const chips = Object.entries(counts).filter(([, v]) => typeof v === 'number')
        .map(([k, v]) => `<span class="badge b-slate">${esc(k.replace(/_/g, ' '))}: ${esc(fmtNum(v))}</span>`).join(' ');
      mount(out, el('div', { class: 'alert success', html: `${icon('check-circle', 18)}<div><div class="a-title">${esc(t('st.reset_ok'))}</div>${chips ? `<div class="row" style="margin-top:6px">${chips}</div>` : ''}</div>` }));
      toast(t('st.reset_ok'), 'success', 6000);
      saved = null;
      setTimeout(() => {
        clearSession();
        location.href = site(`login.html?as=${encodeURIComponent('admin@nidhikavach.demo')}&next=${encodeURIComponent('admin/settings.html')}`);
      }, 3000);
    } catch (err) {
      errorState(out, err);
    }
  });
});

/* ------------------------------------------------------------------ key registry */
async function loadKeys() {
  const box = $('#keys');
  loading(box);
  try {
    const keys = await api.get('/public/keys');
    renderTable(box, {
      columns: [
        { key: 'key_id', label: t('st.k_id'), render: (k) => `<div class="cell-main mono nowrap">${esc(k.key_id)}</div>` },
        { key: 'owner', label: t('st.k_owner'), render: (k) => `<div class="cell-main">${esc(k.owner)}</div><div class="cell-sub"><span class="badge ${k.owner_type === 'portal' ? 'b-primary' : 'b-teal'}">${icon(k.owner_type === 'portal' ? 'shield' : 'bank', 12)}${esc(t(`st.k_type.${k.owner_type}`, { _default: k.owner_type }))}</span></div>` },
        { key: 'signs', label: t('st.k_signs'), render: (k) => (k.signs || []).map((s) => `<span class="badge b-slate">${esc(t(`st.sign.${s}`, { _default: s }))}</span>`).join(' ') },
        { key: 'fingerprint', label: t('st.k_fp'), render: (k) => `<span class="mono nowrap">${esc(k.fingerprint)}</span>` },
        { key: 'registered_at', label: t('st.k_reg'), render: (k) => `<span class="nowrap">${esc(fmtDate(k.registered_at))}</span>` },
        { key: 'public_key', label: t('st.k_pub'), render: (k) => el('div', { class: 'row nowrap' },
          el('span', { class: 'st-key', title: k.public_key }, k.public_key),
          el('button', { class: 'btn sm ghost icon-only', type: 'button', title: t('st.k_copy'), 'aria-label': `${t('st.k_copy')}: ${k.key_id}`, html: icon('copy', 14),
            onclick: async () => { await copyText(k.public_key); toast(t('common.copied'), 'success'); } })) },
      ],
      rows: keys || [],
      empty: { icon: 'key', title: t('st.keys_empty') },
    });
  } catch (err) {
    errorState(box, err, loadKeys);
  }
}

/* ------------------------------------------------------------------ load */
async function load() {
  const status = $('#cfg-status');
  mount(status);
  $('#cfg').hidden = true;
  loading($('#clock-body'));
  const ph = el('div', { class: 'card' }); mount(status, ph); loading(ph);
  try {
    saved = await api.get('/admin/settings');
    mount(status);
    $('#cfg').hidden = false;
    renderForm(saved);
    renderClock();
  } catch (err) {
    errorState(ph, err, load);
    mount($('#clock-body'));
  }
}

onLang(() => {
  apply();
  if (saved) {
    const draft = readForm();
    renderForm(saved);
    // keep unsaved edits when switching language
    SLA_STAGES.forEach((k) => { if (Number.isFinite(draft.sla_days[k])) $(`#sla-${k}`).value = draft.sla_days[k]; });
    ESC_LEVELS.forEach((k) => { if (Number.isFinite(draft.escalation_days[k])) $(`#esc-${k}`).value = draft.escalation_days[k]; });
    if (Number.isFinite(draft.verification_sla_days)) $('#ver-sla').value = draft.verification_sla_days;
    BASELINE.forEach(([k]) => { if (Number.isFinite(draft.baseline[k])) $(`#base-${k}`).value = draft.baseline[k]; });
    onEdit();
    renderClock();
  }
  loadKeys();
});
load();
loadKeys();
