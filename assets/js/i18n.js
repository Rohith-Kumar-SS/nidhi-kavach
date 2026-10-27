// English / Hindi strings. Pages add their own keys with extend({en:{...}, hi:{...}}).
// Markup: <span data-i18n="nav.dashboard">Dashboard</span>  (only on elements that contain plain text)
//         <input data-i18n-placeholder="common.search">  data-i18n-title / data-i18n-aria likewise.
const DICT = {
  en: {
    'app.name': 'Nidhi Kavach',
    'app.name_hi': 'निधि कवच',
    'app.tagline': 'Security Deposit & FDR Management Portal',
    'org.l1': 'Prototype for',
    'org.l2': 'AICTE Regulation Bureau',
    'org.l3': 'All India Council for Technical Education',
    'top.sih': 'SIH 2026',
    'top.text': 'Smart India Hackathon 2026 prototype · Problem Statement SIH26265',
    'top.skip': 'Skip to main content',
    'top.font_dec': 'Decrease text size',
    'top.font_reset': 'Reset text size',
    'top.font_inc': 'Increase text size',
    'top.contrast': 'High contrast',
    'ribbon.text': 'Prototype built for Smart India Hackathon 2026. Not an official AICTE or Government of India website. All institutions, banks and deposits shown are fictitious demo data.',
    'wake.text': 'Connecting to the server… the free hosting tier can take up to a minute to wake up.',

    'nav.home': 'Home',
    'nav.verify': 'Verify FDR / NOC',
    'nav.how': 'How it works',
    'nav.demo': 'Demo guide',
    'nav.login': 'Sign in',
    'nav.dashboard': 'Dashboard',
    'nav.queue': 'Verification Queue',
    'nav.registry': 'FDR Registry',
    'nav.institutions': 'Institutions',
    'nav.releases': 'Release & Refund',
    'nav.alerts': 'Alerts',
    'nav.reports': 'Reports',
    'nav.analytics': 'Analytics',
    'nav.audit': 'Audit Trail',
    'nav.submit': 'Submit FDR',
    'nav.my_fdrs': 'My FDRs',
    'nav.notifications': 'Notifications',
    'nav.issue': 'Issue FDR',
    'nav.ledger': 'Deposit Ledger',
    'nav.users': 'Users',
    'nav.settings': 'Settings',
    'nav.menu': 'Menu',

    'user.signout': 'Sign out',
    'user.notifications': 'Notifications',
    'user.demo': 'Demo guide',
    'user.signed_in_as': 'Signed in as',

    'role.admin': 'Administrator',
    'role.officer': 'AICTE Officer',
    'role.authority': 'Competent Authority',
    'role.institution': 'Institution',
    'role.bank': 'Bank Officer',

    'clock.demo_date': 'Demo date',
    'clock.simulated': 'Simulated date',
    'clock.real': 'Today',

    'status.submitted': 'Submitted',
    'status.under_verification': 'Under verification',
    'status.discrepancy': 'Discrepancy',
    'status.active': 'Active',
    'status.expiring': 'Expiring',
    'status.matured': 'Matured',
    'status.renewed': 'Renewed',
    'status.release_requested': 'Release requested',
    'status.released': 'Released',
    'status.rejected': 'Rejected',
    'status.invoked': 'Invoked',
    'cat.active': 'Active',
    'cat.expiring': 'Expiring (≤ 90 days)',
    'cat.matured': 'Matured',
    'cat.renewed': 'Renewed',
    'cat.released': 'Released',
    'cat.pending': 'Pending action',
    'cat.rejected': 'Rejected / invoked',

    'rstage.SUBMITTED': 'Submitted',
    'rstage.SCRUTINY': 'Scrutiny',
    'rstage.RECOMMENDED': 'Recommended',
    'rstage.APPROVED': 'Approved',
    'rstage.RELEASED': 'Released',
    'rstage.RETURNED': 'Returned for info',
    'rstage.REJECTED': 'Rejected',
    'rtype.release': 'Release',
    'rtype.refund': 'Refund',
    'rtype.discharge': 'Discharge',

    'trust.0': 'Claimed',
    'trust.1': 'Document matched',
    'trust.2': 'Bank verified',
    'trust.0.long': 'Claimed by institution',
    'trust.1.long': 'Receipt matches the form',
    'trust.2.long': 'Confirmed by the bank',
    'trust.flagged': 'Flagged',

    'risk.low': 'Low',
    'risk.medium': 'Medium',
    'risk.high': 'High',
    'risk.critical': 'Critical',
    'risk.label': 'Risk',
    'sev.low': 'Low',
    'sev.medium': 'Medium',
    'sev.high': 'High',
    'sev.critical': 'Critical',

    'f.ref_no': 'Reference',
    'f.fdr_number': 'FDR number',
    'f.institution': 'Institution',
    'f.aicte_id': 'AICTE ID',
    'f.bank': 'Bank',
    'f.branch': 'Branch',
    'f.ifsc': 'IFSC',
    'f.amount': 'Amount',
    'f.issue_date': 'Issue date',
    'f.maturity_date': 'Maturity date',
    'f.days_left': 'Days left',
    'f.status': 'Status',
    'f.trust': 'Trust level',
    'f.risk': 'Risk',
    'f.state': 'State',
    'f.city': 'City',
    'f.type': 'Type',
    'f.depositor': 'Depositor',
    'f.interest_rate': 'Interest rate',
    'f.tenure': 'Tenure',
    'f.purpose': 'Purpose',
    'f.lien': 'Lien',
    'f.submitted_at': 'Submitted',
    'f.date': 'Date',
    'f.actions': 'Actions',
    'f.channel': 'Channel',
    'f.recipient': 'Recipient',
    'f.subject': 'Subject',
    'f.severity': 'Severity',
    'f.message': 'Message',
    'f.note': 'Note',
    'f.reason': 'Reason',
    'f.stage': 'Stage',
    'f.sla': 'SLA',
    'f.required': 'Required',
    'f.covered': 'Covered',
    'f.shortfall': 'Shortfall',

    'common.search': 'Search',
    'common.filters': 'Filters',
    'common.clear': 'Clear',
    'common.apply': 'Apply',
    'common.all': 'All',
    'common.view': 'View',
    'common.open': 'Open',
    'common.edit': 'Edit',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.submit': 'Submit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.print': 'Print',
    'common.export_csv': 'Export CSV',
    'common.refresh': 'Refresh',
    'common.loading': 'Loading…',
    'common.retry': 'Try again',
    'common.no_records': 'No records found',
    'common.no_records_hint': 'Try changing the filters.',
    'common.error': 'Something went wrong',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.unknown': 'Unknown',
    'common.showing': 'Showing {from}–{to} of {total}',
    'common.saved': 'Saved',
    'common.copied': 'Copied',
    'common.today': 'Today',
    'common.details': 'Details',
    'common.more': 'More',
    'common.approve': 'Approve',
    'common.reject': 'Reject',
    'common.return': 'Return',
    'common.marked': 'Marked',
    'common.not_marked': 'Not marked',
    'common.confirmed': 'Confirmed',
    'common.not_checked': 'Not checked',

    'rel.today': 'today',
    'rel.tomorrow': 'tomorrow',
    'rel.yesterday': 'yesterday',
    'rel.in_days': 'in {n} days',
    'rel.days_ago': '{n} days ago',
    'rel.overdue': '{n} days overdue',
    'unit.lakh': 'L',
    'unit.crore': 'Cr',

    'footer.about': 'About the portal',
    'footer.about_text': 'Nidhi Kavach manages the complete lifecycle of security deposits and Fixed Deposit Receipts (FDRs) that technical institutions keep with AICTE - submission, verification, maturity tracking, renewal and release.',
    'footer.links': 'Quick links',
    'footer.help': 'Help',
    'footer.innovations': 'What is new',
    'footer.disclaimer': 'Prototype developed for Smart India Hackathon 2026 (Problem Statement SIH26265, AICTE Regulation Bureau). This is not an official website of AICTE or the Government of India. All institutions, banks, people and deposits are fictitious demo data.',
    'footer.updated': 'Last updated',
    'footer.helpdesk': 'Helpdesk (demo)',
    'footer.accessibility': 'Accessibility: text size, high contrast and Hindi are available in the top bar.',
  },
  hi: {
    'app.name': 'निधि कवच',
    'app.tagline': 'प्रतिभूति जमा एवं एफडीआर प्रबंधन पोर्टल',
    'org.l1': 'प्रोटोटाइप',
    'org.l2': 'एआईसीटीई विनियमन ब्यूरो',
    'org.l3': 'अखिल भारतीय तकनीकी शिक्षा परिषद',
    'top.text': 'स्मार्ट इंडिया हैकथॉन 2026 प्रोटोटाइप · समस्या कथन SIH26265',
    'top.skip': 'मुख्य सामग्री पर जाएँ',
    'top.font_dec': 'अक्षर छोटे करें',
    'top.font_reset': 'सामान्य आकार',
    'top.font_inc': 'अक्षर बड़े करें',
    'top.contrast': 'उच्च कंट्रास्ट',
    'ribbon.text': 'स्मार्ट इंडिया हैकथॉन 2026 के लिए बनाया गया प्रोटोटाइप। यह एआईसीटीई या भारत सरकार की आधिकारिक वेबसाइट नहीं है। दिखाए गए सभी संस्थान, बैंक और जमा काल्पनिक डेमो डेटा हैं।',
    'wake.text': 'सर्वर से जुड़ रहे हैं… निःशुल्क होस्टिंग को चालू होने में एक मिनट तक लग सकता है।',

    'nav.home': 'मुख पृष्ठ',
    'nav.verify': 'एफडीआर / एनओसी सत्यापन',
    'nav.how': 'यह कैसे काम करता है',
    'nav.demo': 'डेमो मार्गदर्शिका',
    'nav.login': 'साइन इन',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.queue': 'सत्यापन कतार',
    'nav.registry': 'एफडीआर रजिस्टर',
    'nav.institutions': 'संस्थान',
    'nav.releases': 'रिलीज़ एवं वापसी',
    'nav.alerts': 'अलर्ट',
    'nav.reports': 'रिपोर्ट',
    'nav.analytics': 'विश्लेषण',
    'nav.audit': 'ऑडिट ट्रेल',
    'nav.submit': 'एफडीआर जमा करें',
    'nav.my_fdrs': 'मेरी एफडीआर',
    'nav.notifications': 'सूचनाएँ',
    'nav.issue': 'एफडीआर जारी करें',
    'nav.ledger': 'जमा खाता-बही',
    'nav.users': 'उपयोगकर्ता',
    'nav.settings': 'सेटिंग्स',
    'nav.menu': 'मेनू',

    'user.signout': 'साइन आउट',
    'user.notifications': 'सूचनाएँ',
    'user.demo': 'डेमो मार्गदर्शिका',
    'user.signed_in_as': 'साइन इन',

    'role.admin': 'प्रशासक',
    'role.officer': 'एआईसीटीई अधिकारी',
    'role.authority': 'सक्षम प्राधिकारी',
    'role.institution': 'संस्थान',
    'role.bank': 'बैंक अधिकारी',

    'clock.demo_date': 'डेमो तिथि',
    'clock.simulated': 'सिम्युलेटेड तिथि',
    'clock.real': 'आज',

    'status.submitted': 'प्रस्तुत',
    'status.under_verification': 'सत्यापनाधीन',
    'status.discrepancy': 'विसंगति',
    'status.active': 'सक्रिय',
    'status.expiring': 'समाप्ति निकट',
    'status.matured': 'परिपक्व',
    'status.renewed': 'नवीनीकृत',
    'status.release_requested': 'रिलीज़ अनुरोधित',
    'status.released': 'रिलीज़ की गई',
    'status.rejected': 'अस्वीकृत',
    'status.invoked': 'भुनाई गई',
    'cat.active': 'सक्रिय',
    'cat.expiring': 'समाप्ति निकट (≤ 90 दिन)',
    'cat.matured': 'परिपक्व',
    'cat.renewed': 'नवीनीकृत',
    'cat.released': 'रिलीज़',
    'cat.pending': 'कार्रवाई लंबित',
    'cat.rejected': 'अस्वीकृत / भुनाई गई',

    'rstage.SUBMITTED': 'प्रस्तुत',
    'rstage.SCRUTINY': 'जाँच',
    'rstage.RECOMMENDED': 'अनुशंसित',
    'rstage.APPROVED': 'स्वीकृत',
    'rstage.RELEASED': 'रिलीज़',
    'rstage.RETURNED': 'जानकारी हेतु वापस',
    'rstage.REJECTED': 'अस्वीकृत',
    'rtype.release': 'रिलीज़',
    'rtype.refund': 'वापसी',
    'rtype.discharge': 'उन्मोचन',

    'trust.0': 'दावा',
    'trust.1': 'दस्तावेज़ मिलान',
    'trust.2': 'बैंक सत्यापित',
    'trust.0.long': 'संस्थान द्वारा दावा',
    'trust.1.long': 'रसीद फ़ॉर्म से मेल खाती है',
    'trust.2.long': 'बैंक द्वारा पुष्टि',
    'trust.flagged': 'चिह्नित',

    'risk.low': 'कम',
    'risk.medium': 'मध्यम',
    'risk.high': 'उच्च',
    'risk.critical': 'गंभीर',
    'risk.label': 'जोखिम',
    'sev.low': 'कम',
    'sev.medium': 'मध्यम',
    'sev.high': 'उच्च',
    'sev.critical': 'गंभीर',

    'f.ref_no': 'संदर्भ संख्या',
    'f.fdr_number': 'एफडीआर संख्या',
    'f.institution': 'संस्थान',
    'f.aicte_id': 'एआईसीटीई आईडी',
    'f.bank': 'बैंक',
    'f.branch': 'शाखा',
    'f.ifsc': 'आईएफएससी',
    'f.amount': 'राशि',
    'f.issue_date': 'जारी करने की तिथि',
    'f.maturity_date': 'परिपक्वता तिथि',
    'f.days_left': 'शेष दिन',
    'f.status': 'स्थिति',
    'f.trust': 'विश्वास स्तर',
    'f.risk': 'जोखिम',
    'f.state': 'राज्य',
    'f.city': 'शहर',
    'f.type': 'प्रकार',
    'f.depositor': 'जमाकर्ता',
    'f.interest_rate': 'ब्याज दर',
    'f.tenure': 'अवधि',
    'f.purpose': 'उद्देश्य',
    'f.lien': 'ग्रहणाधिकार (लियन)',
    'f.submitted_at': 'प्रस्तुत',
    'f.date': 'तिथि',
    'f.actions': 'कार्रवाई',
    'f.channel': 'माध्यम',
    'f.recipient': 'प्राप्तकर्ता',
    'f.subject': 'विषय',
    'f.severity': 'गंभीरता',
    'f.message': 'संदेश',
    'f.note': 'टिप्पणी',
    'f.reason': 'कारण',
    'f.stage': 'चरण',
    'f.sla': 'समय-सीमा',
    'f.required': 'अपेक्षित',
    'f.covered': 'जमा',
    'f.shortfall': 'कमी',

    'common.search': 'खोजें',
    'common.filters': 'फ़िल्टर',
    'common.clear': 'साफ़ करें',
    'common.apply': 'लागू करें',
    'common.all': 'सभी',
    'common.view': 'देखें',
    'common.open': 'खोलें',
    'common.edit': 'संपादित करें',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.close': 'बंद करें',
    'common.confirm': 'पुष्टि करें',
    'common.submit': 'जमा करें',
    'common.back': 'वापस',
    'common.next': 'आगे',
    'common.previous': 'पिछला',
    'common.download': 'डाउनलोड',
    'common.upload': 'अपलोड',
    'common.print': 'प्रिंट',
    'common.export_csv': 'CSV निर्यात',
    'common.refresh': 'रीफ़्रेश',
    'common.loading': 'लोड हो रहा है…',
    'common.retry': 'पुनः प्रयास करें',
    'common.no_records': 'कोई रिकॉर्ड नहीं मिला',
    'common.no_records_hint': 'फ़िल्टर बदलकर देखें।',
    'common.error': 'कुछ गलत हो गया',
    'common.yes': 'हाँ',
    'common.no': 'नहीं',
    'common.unknown': 'अज्ञात',
    'common.showing': '{total} में से {from}–{to}',
    'common.saved': 'सहेजा गया',
    'common.copied': 'कॉपी किया गया',
    'common.today': 'आज',
    'common.details': 'विवरण',
    'common.more': 'और',
    'common.approve': 'स्वीकृत करें',
    'common.reject': 'अस्वीकार करें',
    'common.return': 'वापस भेजें',
    'common.marked': 'अंकित',
    'common.not_marked': 'अंकित नहीं',
    'common.confirmed': 'पुष्टि',
    'common.not_checked': 'जाँच नहीं हुई',

    'rel.today': 'आज',
    'rel.tomorrow': 'कल',
    'rel.yesterday': 'कल (बीता)',
    'rel.in_days': '{n} दिन में',
    'rel.days_ago': '{n} दिन पहले',
    'rel.overdue': '{n} दिन से अतिदेय',
    'unit.lakh': 'लाख',
    'unit.crore': 'करोड़',

    'footer.about': 'पोर्टल के बारे में',
    'footer.about_text': 'निधि कवच तकनीकी संस्थानों द्वारा एआईसीटीई के पास रखी गई प्रतिभूति जमा और सावधि जमा रसीदों (एफडीआर) के पूरे जीवन-चक्र का प्रबंधन करता है - प्रस्तुति, सत्यापन, परिपक्वता निगरानी, नवीनीकरण और रिलीज़।',
    'footer.links': 'त्वरित लिंक',
    'footer.help': 'सहायता',
    'footer.innovations': 'नया क्या है',
    'footer.disclaimer': 'स्मार्ट इंडिया हैकथॉन 2026 (समस्या कथन SIH26265, एआईसीटीई विनियमन ब्यूरो) के लिए विकसित प्रोटोटाइप। यह एआईसीटीई या भारत सरकार की आधिकारिक वेबसाइट नहीं है। सभी संस्थान, बैंक, व्यक्ति और जमा काल्पनिक डेमो डेटा हैं।',
    'footer.updated': 'अंतिम अद्यतन',
    'footer.helpdesk': 'हेल्पडेस्क (डेमो)',
    'footer.accessibility': 'सुगम्यता: अक्षर आकार, उच्च कंट्रास्ट और हिंदी ऊपर की पट्टी में उपलब्ध हैं।',
  },
};

let lang = 'en';
try { lang = localStorage.getItem('nk_lang') || 'en'; } catch (e) { /* ignore */ }
if (!DICT[lang]) lang = 'en';

export function getLang() { return lang; }

function lookup(key) {
  if (DICT[lang] && DICT[lang][key] !== undefined) return DICT[lang][key];
  if (DICT.en[key] !== undefined) return DICT.en[key];
  return undefined;
}

export function has(key) { return lookup(key) !== undefined; }

/** t('rel.in_days', {n: 5}) ; unknown key -> vars._default if given, else the key itself. */
export function t(key, vars) {
  let s = lookup(key);
  if (s === undefined) return vars && vars._default !== undefined ? vars._default : key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  return s;
}

/** Pick from a {en, hi} object (or return a plain string unchanged). */
export function tl(v) {
  if (v && typeof v === 'object') return v[lang] || v.en || '';
  if (typeof v === 'string' && has(v)) return t(v);
  return v == null ? '' : String(v);
}

export function extend(dicts) {
  for (const l of Object.keys(dicts)) {
    DICT[l] = Object.assign(DICT[l] || {}, dicts[l]);
  }
}

export function apply(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    if (el.dataset.i18nEn === undefined) el.dataset.i18nEn = el.textContent;
    const v = lookup(el.dataset.i18n);
    el.textContent = v !== undefined ? v : el.dataset.i18nEn;
  });
  for (const [attr, data] of [['placeholder', 'i18nPlaceholder'], ['title', 'i18nTitle'], ['aria-label', 'i18nAria']]) {
    root.querySelectorAll(`[data-${data.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}]`).forEach((el) => {
      const v = lookup(el.dataset[data]);
      if (v !== undefined) el.setAttribute(attr, v);
    });
  }
}

export function setLang(l) {
  if (!DICT[l]) return;
  lang = l;
  try { localStorage.setItem('nk_lang', l); } catch (e) { /* ignore */ }
  document.documentElement.lang = l;
  apply(document);
  window.dispatchEvent(new CustomEvent('nk:lang', { detail: { lang: l } }));
}

/** Call `fn(lang)` whenever the language changes (re-render JS-built content there). */
export function onLang(fn) {
  window.addEventListener('nk:lang', () => fn(lang));
}
