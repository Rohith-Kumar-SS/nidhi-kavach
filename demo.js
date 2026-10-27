// Judge's demo guide: role quick sign-in, problem-statement scenarios, demo clock, coverage map, innovations.
import { initPage } from './assets/js/layout.js';
import { api, site } from './assets/js/api.js';
import { t, extend, onLang, apply, getLang, has } from './assets/js/i18n.js';
import {
  $, $$, el, esc, icon, fmtDate, fmtNum, initials, loading, errorState, renderTable, toast, withBusy, mount,
} from './assets/js/ui.js';

extend({
  en: {
    'demo.title': 'Judge’s demo guide',
    'demo.subtitle': 'Run every problem-statement test case in one click',
    'demo.run_cta': 'Run a scenario',
    'demo.hero_label': 'Problem statement SIH26265 · AICTE',
    'demo.hero_sub': 'expected capabilities are working in this prototype. Every test case below runs on real demo data in one click, and every result links to the screen that proves it.',
    'demo.toc_roles': 'Sign in as',
    'demo.toc_sc': 'Scenarios',
    'demo.toc_clock': 'Demo clock',
    'demo.toc_cov': 'Coverage',
    'demo.toc_inn': 'Innovations',
    'demo.how_h': 'How to use this guide',
    'demo.how1_t': 'Sign in as any role',
    'demo.how1': 'One click: no typing. Each account tells a different story.',
    'demo.how2_t': 'Run a test scenario',
    'demo.how2': 'The portal sets up the case live: bank, institution and daily job.',
    'demo.how3_t': 'Follow the result links',
    'demo.how3': 'Open the exact screen that shows the outcome, in the right role.',
    'demo.pw': 'Password for every demo account:',
    'demo.roles_h': 'Sign in as',
    'demo.roles_sub': 'All people, institutions and banks are fictitious demo data.',
    'demo.signin_as': 'Sign in',
    'demo.current': 'Signed in now',
    'demo.featured': 'Featured story',
    'demo.story.officer': 'Verifies submissions from the risk-ranked queue, raises discrepancies and scrutinises release requests.',
    'demo.story.authority': 'Approves releases and refunds, can invoke a deposit and receives level 2 escalations.',
    'demo.story.admin': 'Manages users, SLA and escalation days, the demo clock and the demo reset.',
    'demo.story.bank': 'Issues bank-signed FDR receipts, confirms liens and can pre-close or renew deposits.',
    'demo.story.kaveri': 'Healthy and bank-verified. One FDR matures in about 40 days; an older renewal was late.',
    'demo.story.narmada': 'Deposit matured 20 days ago and was not renewed, so it has been escalated.',
    'demo.story.sahyadri': 'Forged receipt: printed ₹50 L but the bank-signed QR says ₹5 L. Also a deposit pre-closed at the bank.',
    'demo.story.brahmaputra': 'A new submission waits in the queue and a release request is in progress.',
    'demo.sc_h': 'Test scenarios',
    'demo.sc_sub': 'Each card is one test case from the problem statement.',
    'demo.gate_t': 'Sign in as AICTE staff to run the scenarios',
    'demo.gate': 'Scenarios change demo data (they issue deposits, submit receipts and move the clock), so they need an officer, competent authority or administrator session.',
    'demo.gate_btn': 'Sign in as the officer and come back',
    'demo.tc': 'Test case',
    'demo.who': 'Roles involved',
    'demo.inst': 'Institution',
    'demo.run': 'Run scenario',
    'demo.run_again': 'Run again',
    'demo.ran': 'Scenario ready: {title}',
    'demo.done_steps': 'What the portal did ({n} steps)',
    'demo.next': 'What to check next',
    'demo.open': 'Open',
    'demo.as_role': 'as {role}',
    'demo.elapsed': 'Set up in {s} s',
    'demo.sc_empty': 'No scenarios are available',
    'demo.sc_empty_text': 'Scenarios work only when the portal runs in demo mode.',
    'demo.opt_days': 'Days',
    'demo.clock_h': 'Demo clock',
    'demo.clock_sub': 'Move time forward to watch reminders and escalations happen.',
    'demo.clock_card': 'Portal date',
    'demo.real': 'Real date',
    'demo.demo': 'Portal date',
    'demo.sim': 'Simulated',
    'demo.live': 'Live',
    'demo.off0': 'Same as the real date',
    'demo.offp': '{n} days ahead of the real date',
    'demo.offn': '{n} days behind the real date',
    'demo.m7': '−7 days',
    'demo.p7': '+7 days',
    'demo.p30': '+30 days',
    'demo.reset': 'Back to today',
    'demo.goto_l': 'Jump to a date',
    'demo.goto': 'Go',
    'demo.goto_err': 'Choose a date first.',
    'demo.autojob': 'Run the daily job automatically after each change',
    'demo.clock_done': 'The portal date is now {date}.',
    'demo.clock_reset': 'The demo clock is back on the real date ({date}).',
    'demo.clock_gate': 'Sign in as AICTE staff to move the clock.',
    'demo.job_t': 'Daily job result for {date}',
    'demo.job_none': 'The daily job was not run for this change.',
    'demo.job_nothing': 'Nothing new was due on this day.',
    'demo.j.notifications_created': 'Messages sent',
    'demo.j.reminders': 'Reminders',
    'demo.j.escalations': 'Escalations',
    'demo.j.stale_verifications': 'Stale verifications',
    'demo.j.sla_breaches': 'SLA breaches',
    'demo.j.bank_checks': 'Bank re-checks',
    'demo.j.bank_issues': 'Bank issues',
    'demo.see_outbox': 'See the messages in the Alerts centre',
    'demo.job_h': 'What the daily job does',
    'demo.job1_t': 'Reminders before maturity',
    'demo.job1': '90, 60, 30 and 7 days before: institution first, officers copied from 30 days.',
    'demo.job2_t': 'Escalation after maturity',
    'demo.job2': 'Institution on day 0, officers on day 7, competent authority on day 15.',
    'demo.job3_t': 'SLA watch',
    'demo.job3': 'Stale verifications and release requests past their stage SLA.',
    'demo.job4_t': 'Bank re-checks',
    'demo.job4': 'Asks the bank again about older deposits: catches pre-closure and removed liens.',
    'demo.cov_h': 'Problem statement coverage',
    'demo.cov_sub': 'The 10 expected capabilities of SIH26265 and where to see each one.',
    'demo.c_cap': 'Expected capability',
    'demo.c_how': 'How Nidhi Kavach delivers it',
    'demo.c_where': 'Where to see it',
    'demo.inn_h': 'What is new in Nidhi Kavach',
    'demo.inn_sub': 'Beyond the checklist: ideas that make deposits harder to fake and easier to track.',
  },
  hi: {
    'demo.title': 'निर्णायक डेमो मार्गदर्शिका',
    'demo.subtitle': 'समस्या कथन के प्रत्येक परीक्षण मामले को एक क्लिक में चलाएँ',
    'demo.run_cta': 'परिदृश्य चलाएँ',
    'demo.hero_label': 'समस्या कथन SIH26265 · एआईसीटीई',
    'demo.hero_sub': 'अपेक्षित क्षमताएँ इस प्रोटोटाइप में कार्यरत हैं। नीचे दिया गया प्रत्येक परीक्षण मामला वास्तविक डेमो डेटा पर एक क्लिक में चलता है और हर परिणाम उसे प्रमाणित करने वाली स्क्रीन से जुड़ा है।',
    'demo.toc_roles': 'इस रूप में साइन इन',
    'demo.toc_sc': 'परिदृश्य',
    'demo.toc_clock': 'डेमो घड़ी',
    'demo.toc_cov': 'कवरेज',
    'demo.toc_inn': 'नवाचार',
    'demo.how_h': 'इस मार्गदर्शिका का उपयोग कैसे करें',
    'demo.how1_t': 'किसी भी भूमिका में साइन इन करें',
    'demo.how1': 'एक क्लिक, कुछ टाइप नहीं करना। प्रत्येक खाता एक अलग कहानी बताता है।',
    'demo.how2_t': 'परीक्षण परिदृश्य चलाएँ',
    'demo.how2': 'पोर्टल मामला लाइव तैयार करता है: बैंक, संस्थान और दैनिक कार्य।',
    'demo.how3_t': 'परिणाम के लिंक खोलें',
    'demo.how3': 'सही भूमिका में वही स्क्रीन खोलें जो परिणाम दिखाती है।',
    'demo.pw': 'सभी डेमो खातों का पासवर्ड:',
    'demo.roles_h': 'इस रूप में साइन इन करें',
    'demo.roles_sub': 'सभी व्यक्ति, संस्थान और बैंक काल्पनिक डेमो डेटा हैं।',
    'demo.signin_as': 'साइन इन करें',
    'demo.current': 'अभी साइन इन',
    'demo.featured': 'विशेष कथा',
    'demo.story.officer': 'जोखिम-क्रमित कतार से प्रस्तुतियों का सत्यापन, विसंगतियाँ दर्ज करना और रिलीज़ अनुरोधों की जाँच।',
    'demo.story.authority': 'रिलीज़ और वापसी का अनुमोदन, जमा का अधिग्रहण और स्तर 2 एस्केलेशन प्राप्त करना।',
    'demo.story.admin': 'उपयोगकर्ता, एसएलए व एस्केलेशन दिवस, डेमो घड़ी और डेमो रीसेट का प्रबंधन।',
    'demo.story.bank': 'बैंक-हस्ताक्षरित एफडीआर रसीद जारी करना, ग्रहणाधिकार की पुष्टि और जमा का समयपूर्व समापन या नवीनीकरण।',
    'demo.story.kaveri': 'स्वस्थ और बैंक-सत्यापित। एक एफडीआर लगभग 40 दिनों में परिपक्व होगी; एक पुराना नवीनीकरण विलंबित था।',
    'demo.story.narmada': 'जमा 20 दिन पहले परिपक्व हुई और नवीनीकृत नहीं हुई, इसलिए एस्केलेट की गई है।',
    'demo.story.sahyadri': 'जाली रसीद: मुद्रित ₹50 लाख, परंतु बैंक-हस्ताक्षरित क्यूआर में ₹5 लाख। साथ ही बैंक में समयपूर्व बंद जमा।',
    'demo.story.brahmaputra': 'एक नई प्रस्तुति कतार में प्रतीक्षारत है और एक रिलीज़ अनुरोध प्रगति पर है।',
    'demo.sc_h': 'परीक्षण परिदृश्य',
    'demo.sc_sub': 'प्रत्येक कार्ड समस्या कथन का एक परीक्षण मामला है।',
    'demo.gate_t': 'परिदृश्य चलाने के लिए एआईसीटीई कर्मचारी के रूप में साइन इन करें',
    'demo.gate': 'परिदृश्य डेमो डेटा बदलते हैं (जमा जारी करना, रसीद प्रस्तुत करना और घड़ी आगे बढ़ाना), इसलिए इनके लिए अधिकारी, सक्षम प्राधिकारी या प्रशासक का सत्र आवश्यक है।',
    'demo.gate_btn': 'अधिकारी के रूप में साइन इन करके वापस आएँ',
    'demo.tc': 'परीक्षण मामला',
    'demo.who': 'संबंधित भूमिकाएँ',
    'demo.inst': 'संस्थान',
    'demo.run': 'परिदृश्य चलाएँ',
    'demo.run_again': 'फिर से चलाएँ',
    'demo.ran': 'परिदृश्य तैयार: {title}',
    'demo.done_steps': 'पोर्टल ने क्या किया ({n} चरण)',
    'demo.next': 'आगे क्या देखें',
    'demo.open': 'खोलें',
    'demo.as_role': '{role} के रूप में',
    'demo.elapsed': '{s} सेकंड में तैयार',
    'demo.sc_empty': 'कोई परिदृश्य उपलब्ध नहीं',
    'demo.sc_empty_text': 'परिदृश्य केवल डेमो मोड में चलते हैं।',
    'demo.opt_days': 'दिन',
    'demo.clock_h': 'डेमो घड़ी',
    'demo.clock_sub': 'अनुस्मारक और एस्केलेशन होते देखने के लिए समय आगे बढ़ाएँ।',
    'demo.clock_card': 'पोर्टल तिथि',
    'demo.real': 'वास्तविक तिथि',
    'demo.demo': 'पोर्टल तिथि',
    'demo.sim': 'सिम्युलेटेड',
    'demo.live': 'वास्तविक',
    'demo.off0': 'वास्तविक तिथि के समान',
    'demo.offp': 'वास्तविक तिथि से {n} दिन आगे',
    'demo.offn': 'वास्तविक तिथि से {n} दिन पीछे',
    'demo.m7': '−7 दिन',
    'demo.p7': '+7 दिन',
    'demo.p30': '+30 दिन',
    'demo.reset': 'आज पर लौटें',
    'demo.goto_l': 'किसी तिथि पर जाएँ',
    'demo.goto': 'जाएँ',
    'demo.goto_err': 'पहले कोई तिथि चुनें।',
    'demo.autojob': 'प्रत्येक परिवर्तन के बाद दैनिक कार्य स्वतः चलाएँ',
    'demo.clock_done': 'पोर्टल तिथि अब {date} है।',
    'demo.clock_reset': 'डेमो घड़ी वास्तविक तिथि ({date}) पर लौट आई है।',
    'demo.clock_gate': 'घड़ी बदलने के लिए एआईसीटीई कर्मचारी के रूप में साइन इन करें।',
    'demo.job_t': '{date} के दैनिक कार्य का परिणाम',
    'demo.job_none': 'इस परिवर्तन के लिए दैनिक कार्य नहीं चलाया गया।',
    'demo.job_nothing': 'इस दिन कोई नई कार्रवाई देय नहीं थी।',
    'demo.j.notifications_created': 'भेजे गए संदेश',
    'demo.j.reminders': 'अनुस्मारक',
    'demo.j.escalations': 'एस्केलेशन',
    'demo.j.stale_verifications': 'लंबित सत्यापन',
    'demo.j.sla_breaches': 'एसएलए उल्लंघन',
    'demo.j.bank_checks': 'बैंक पुनर्जाँच',
    'demo.j.bank_issues': 'बैंक समस्याएँ',
    'demo.see_outbox': 'अलर्ट केंद्र में संदेश देखें',
    'demo.job_h': 'दैनिक कार्य क्या करता है',
    'demo.job1_t': 'परिपक्वता से पहले अनुस्मारक',
    'demo.job1': '90, 60, 30 और 7 दिन पहले: पहले संस्थान, 30 दिन से अधिकारियों को भी प्रति।',
    'demo.job2_t': 'परिपक्वता के बाद एस्केलेशन',
    'demo.job2': 'दिन 0 पर संस्थान, दिन 7 पर अधिकारी, दिन 15 पर सक्षम प्राधिकारी।',
    'demo.job3_t': 'एसएलए निगरानी',
    'demo.job3': 'लंबित सत्यापन और अपने चरण का एसएलए पार कर चुके रिलीज़ अनुरोध।',
    'demo.job4_t': 'बैंक पुनर्जाँच',
    'demo.job4': 'पुरानी जमाओं के बारे में बैंक से पुनः पूछता है: समयपूर्व समापन और हटाया गया ग्रहणाधिकार पकड़ता है।',
    'demo.cov_h': 'समस्या कथन कवरेज',
    'demo.cov_sub': 'SIH26265 की 10 अपेक्षित क्षमताएँ और प्रत्येक को कहाँ देखें।',
    'demo.c_cap': 'अपेक्षित क्षमता',
    'demo.c_how': 'निधि कवच इसे कैसे पूरा करता है',
    'demo.c_where': 'कहाँ देखें',
    'demo.inn_h': 'निधि कवच में नया क्या है',
    'demo.inn_sub': 'सूची से आगे: ऐसे विचार जो जमा को नकली बनाना कठिन और ट्रैक करना आसान बनाते हैं।',
    // scenario titles / summaries / test-case tags (server text is English)
    'demo.sc.new_submission.title': 'नई एफडीआर प्रस्तुति',
    'demo.sc.new_submission.tc': 'नई एफडीआर प्रस्तुति',
    'demo.sc.new_submission.summary': 'बैंक बैंक-हस्ताक्षरित क्यूआर के साथ नई सावधि जमा खोलता है और संस्थान रसीद अपलोड करता है; पोर्टल उसे पढ़ता है, जाँचता है और सत्यापन कतार में रखता है।',
    'demo.sc.approaching_maturity.title': 'वैधता ट्रैकिंग: निकट परिपक्वता',
    'demo.sc.approaching_maturity.tc': 'वैधता ट्रैकिंग / निकट परिपक्वता',
    'demo.sc.approaching_maturity.summary': 'एक सक्रिय एफडीआर की परिपक्वता 25 दिन बाद रखी जाती है और दैनिक कार्य 30-दिवसीय अनुस्मारक भेजता है।',
    'demo.sc.renewal.title': 'नवीनीकरण',
    'demo.sc.renewal.tc': 'नवीनीकरण',
    'demo.sc.renewal.summary': 'बैंक परिपक्व हो रही जमा का नवीनीकरण करता है, संस्थान नवीनीकरण प्रस्तुत करता है और अधिकारी स्वीकार करते हैं: नवीनीकरण शृंखला बनती है।',
    'demo.sc.discrepancy.title': 'विसंगति की पहचान: जाली रसीद',
    'demo.sc.discrepancy.tc': 'विसंगति की पहचान',
    'demo.sc.discrepancy.summary': 'जाली रसीद प्रस्तुत की जाती है: मुद्रित राशि बैंक-हस्ताक्षरित क्यूआर से मेल नहीं खाती और पोर्टल उसे चिह्नित करता है।',
    'demo.sc.bank_preclosure.title': 'बैंक में समयपूर्व समापन',
    'demo.sc.bank_preclosure.tc': 'विसंगति की पहचान (बैंक पुनर्जाँच)',
    'demo.sc.bank_preclosure.summary': 'बैंक एक सक्रिय जमा समयपूर्व बंद करता है; बैंक पुनर्जाँच गंभीर विसंगति दर्ज करती है।',
    'demo.sc.release.title': 'अधिकृत रिलीज़ प्रक्रिया',
    'demo.sc.release.tc': 'अधिकृत रिलीज़ प्रक्रिया',
    'demo.sc.release.summary': 'अनुशंसित चरण पर रिलीज़ अनुरोध तैयार होता है ताकि प्राधिकारी अनुमोदन कर जमा जारी कर सकें और एनओसी बने।',
    'demo.sc.time_travel.title': 'समय-यात्रा: परिपक्वता के बाद एस्केलेशन',
    'demo.sc.time_travel.tc': 'वैधता ट्रैकिंग (परिपक्वता के बाद एस्केलेशन)',
    'demo.sc.time_travel.summary': 'डेमो घड़ी आगे बढ़ती है और दैनिक कार्य चलता है: अनुस्मारक और एस्केलेशन सीढ़ी सक्रिय होती है।',
    'demo.opt.complete': 'अनुमोदन और रिलीज़ भी करें (एनओसी जारी)',
    'demo.opt.days': 'डेमो घड़ी को आगे बढ़ाने के दिन',
  },
});

const STAFF = ['officer', 'authority', 'admin'];
const { user, meta: meta0 } = await initPage({
  roles: null,
  active: 'demo',
  title: 'demo.title',
  subtitle: 'demo.subtitle',
  breadcrumbs: [{ label: 'nav.home', href: 'index.html' }, { label: 'nav.demo' }],
  actions: el('a', { class: 'btn saffron', href: '#scenarios', id: 'cta', html: `${icon('play', 16)}<span>${esc(t('demo.run_cta'))}</span>` }),
});
const isStaff = !!user && STAFF.includes(user.role);
let meta = meta0 || null;
let scenarios = null;
let accounts = null;
const results = {}; // scenario key -> last run result
let clockResult = null;

const SC_ICON = { new_submission: 'upload', approaching_maturity: 'clock', renewal: 'refresh', discrepancy: 'shield-alert', bank_preclosure: 'bank', release: 'unlock', time_travel: 'calendar' };
const ROLE_BADGE = { officer: 'b-primary', authority: 'b-saffron', admin: 'b-violet', institution: 'b-teal', bank: 'b-info' };
const ROLE_ICON = { officer: 'shield-check', authority: 'stamp', admin: 'settings', institution: 'building', bank: 'bank' };
const JOB_KEYS = ['notifications_created', 'reminders', 'escalations', 'stale_verifications', 'sla_breaches', 'bank_checks', 'bank_issues'];
const hiOr = (key, fallback) => (getLang() === 'hi' && has(key) ? t(key) : fallback);
const roleBadge = (r) => `<span class="badge ${ROLE_BADGE[r] || 'b-slate'}">${icon(ROLE_ICON[r] || 'user', 12)}${esc(t(`role.${r}`, { _default: r }))}</span>`;
const loginAs = (email, next) => site(`login.html?as=${encodeURIComponent(email)}${next ? `&next=${encodeURIComponent(next)}` : ''}`);

$$('[data-icon]').forEach((n) => { n.innerHTML = icon(n.dataset.icon, n.classList.contains('ic') ? 15 : 16); });

/* ------------------------------------------------------------------ intro */
function renderIntro() {
  const cta = $('#cta');
  if (cta) cta.innerHTML = `${icon('play', 16)}<span>${esc(t('demo.run_cta'))}</span>`;
  mount($('#toc'), [['roles', 'demo.toc_roles', 'login'], ['scenarios', 'demo.toc_sc', 'play'], ['clock', 'demo.toc_clock', 'calendar'], ['coverage', 'demo.toc_cov', 'check-circle'], ['innovations', 'demo.toc_inn', 'sparkles']]
    .map(([id, key, ic]) => el('a', { href: `#${id}`, html: `${icon(ic, 14)}<span>${esc(t(key))}</span>` })));
}

/* ------------------------------------------------------------------ sign in as */
const ROLE_ORDER = [
  { email: 'officer@nidhikavach.demo', role: 'officer', story: 'officer', name: 'Ananya Rao', designation: 'Deputy Director (Regulation)' },
  { email: 'director@nidhikavach.demo', role: 'authority', story: 'authority', name: 'Dr. Vikram Menon', designation: 'Director, Regulation Bureau' },
  { email: 'admin@nidhikavach.demo', role: 'admin', story: 'admin', name: 'Meera Iyer', designation: 'Portal Administrator' },
  { email: 'bank.bsb@nidhikavach.demo', role: 'bank', story: 'bank', name: 'Bharat Sahakari Bank', designation: '' },
  { email: 'kaveri@nidhikavach.demo', role: 'institution', story: 'kaveri', featured: true, name: 'Kaveri Institute of Engineering & Technology', designation: 'Tiruchirappalli, Tamil Nadu' },
  { email: 'narmada@nidhikavach.demo', role: 'institution', story: 'narmada', featured: true, name: 'Narmada College of Pharmacy', designation: 'Jabalpur, Madhya Pradesh' },
  { email: 'sahyadri@nidhikavach.demo', role: 'institution', story: 'sahyadri', featured: true, name: 'Sahyadri School of Management', designation: 'Pune, Maharashtra' },
  { email: 'brahmaputra@nidhikavach.demo', role: 'institution', story: 'brahmaputra', featured: true, name: 'Brahmaputra Polytechnic', designation: 'Guwahati, Assam' },
];

function renderRoles() {
  const byEmail = Object.fromEntries((accounts || []).map((a) => [a.email, a]));
  mount($('#role-cards'), ROLE_ORDER.map((r) => {
    const a = byEmail[r.email] || {};
    const inst = r.role === 'institution';
    const title = inst ? (a.organisation || r.name) : (a.name || r.name);
    const sub = inst ? [a.name, a.designation].filter(Boolean).join(' · ') || r.designation : (a.designation || r.designation || a.organisation || '');
    const current = user && user.email === r.email;
    return el('div', { class: `card hoverable ${r.featured ? 'dg-role-wrap' : ''}` },
      el('div', { class: `card-body dg-role ${r.featured ? 'featured' : ''}`, style: r.featured ? { borderRadius: 'var(--nk-radius)' } : null },
        el('div', { class: 'r-top' },
          el('span', { class: 'avatar lg', 'aria-hidden': 'true', html: inst || r.role === 'bank' ? icon(ROLE_ICON[r.role], 20) : esc(initials(title)) }),
          el('div', { style: { minWidth: 0 } },
            el('div', { class: 'row', style: { gap: '6px' }, html: `${roleBadge(r.role)}${r.featured ? `<span class="badge b-saffron">${icon('sparkles', 12)}${esc(t('demo.featured'))}</span>` : ''}` }),
            el('div', { class: 'r-name', style: { marginTop: '4px' } }, title),
            sub ? el('div', { class: 'r-org' }, sub) : null)),
        el('div', { class: 'r-story' }, t(`demo.story.${r.story}`)),
        current
          ? el('span', { class: 'badge b-success lg', html: `${icon('check', 13)}${esc(t('demo.current'))}` })
          : el('a', { class: `btn sm ${r.featured ? 'secondary' : ''}`, href: loginAs(r.email), html: `${icon('login', 15)}<span>${esc(t('demo.signin_as'))}</span>`, 'aria-label': `${t('demo.signin_as')}: ${title}` })));
  }));
}

/* ------------------------------------------------------------------ scenarios */
function linkHref(l) {
  const direct = user && (l.role === user.role || (l.role === 'officer' && isStaff) || !l.role);
  return direct || !l.account ? site(l.href) : loginAs(l.account, l.href);
}

function resultPanel(sc, res) {
  if (!res) return null;
  const steps = res.steps_done || [];
  const next = res.next_steps || [];
  return [
    el('div', { class: 'alert success', role: 'status', html: `${icon('check-circle', 18)}<div><div class="a-title">${esc(t('demo.ran', { title: hiOr(`demo.sc.${sc.key}.title`, sc.title) }))}</div>${esc(res.message || '')}</div>` }),
    steps.length ? el('details', {}, el('summary', {}, t('demo.done_steps', { n: steps.length })), el('ul', {}, steps.map((s) => el('li', {}, s)))) : null,
    next.length ? el('div', {}, el('div', { class: 'label' }, t('demo.next')), el('ul', { class: 'nx' }, next.map((s) => el('li', {}, s)))) : null,
    (res.links || []).length ? el('div', { class: 'dg-links' }, res.links.map((l) => {
      const direct = linkHref(l) === site(l.href);
      return el('a', { class: `btn sm ${direct ? 'secondary' : 'ghost'}`, href: linkHref(l),
        title: direct ? '' : `${t('demo.signin_as')} · ${l.account}`,
        html: `${icon(direct ? 'arrow-up-right' : 'login', 14)}<span>${esc(l.label)}</span>${!direct && l.role ? `<span class="muted small">(${esc(t('demo.as_role', { role: t(`role.${l.role}`, { _default: l.role }) }))})</span>` : ''}` });
    })) : null,
    res.elapsed_ms != null ? el('div', { class: 'muted small' }, t('demo.elapsed', { s: (res.elapsed_ms / 1000).toFixed(1) })) : null,
  ];
}

function scenarioCard(sc) {
  const optInputs = {};
  const opts = (sc.options || []).map((o) => {
    const id = `opt-${sc.key}-${o.name}`;
    const label = hiOr(`demo.opt.${o.name}`, o.label);
    if (o.type === 'boolean') {
      optInputs[o.name] = el('input', { type: 'checkbox', id, checked: !!o.default });
      return el('label', { class: 'check', for: id }, optInputs[o.name], label);
    }
    optInputs[o.name] = el('input', { class: 'input sm', type: 'number', id, value: o.default ?? '', min: o.min, max: o.max, step: 1 });
    return el('div', { class: 'row', style: { gap: '8px' } }, el('label', { for: id, class: 'small text-2' }, label), optInputs[o.name]);
  });
  const resultEl = el('div', { class: 'dg-result', 'aria-live': 'polite' });
  if (results[sc.key]) mount(resultEl, resultPanel(sc, results[sc.key]));
  const runBtn = el('button', { class: 'btn', type: 'button', html: `${icon('play', 15)}<span>${esc(t(results[sc.key] ? 'demo.run_again' : 'demo.run'))}</span>` });
  runBtn.addEventListener('click', () => runScenario(sc, runBtn, resultEl, optInputs));
  const inst = sc.institution;
  return el('div', { class: 'card dg-sc', id: `sc-${sc.key}` },
    el('div', { class: 'card-body' },
      el('div', { class: 'sc-head' },
        el('div', { class: `feature-icon ${sc.key === 'discrepancy' || sc.key === 'bank_preclosure' ? 'saffron' : ''}`, html: icon(SC_ICON[sc.key] || 'play', 20) }),
        el('div', { style: { minWidth: 0 } },
          el('span', { class: 'badge b-saffron', html: `${icon('target', 12)}${esc(t('demo.tc'))}: ${esc(hiOr(`demo.sc.${sc.key}.tc`, sc.test_case))}` }),
          el('h3', {}, hiOr(`demo.sc.${sc.key}.title`, sc.title)),
          el('div', { class: 'text-2 small' }, hiOr(`demo.sc.${sc.key}.summary`, sc.summary || '')))),
      el('div', { class: 'sc-meta', html: `<span class="muted small">${esc(t('demo.who'))}:</span> ${(sc.roles || []).map(roleBadge).join(' ')}${inst ? ` <span class="muted small" style="margin-left:6px">${esc(t('demo.inst'))}:</span> <span class="badge b-slate">${icon('building', 12)}${esc(inst.name)}</span>` : ''}` }),
      el('ol', {}, (sc.steps || []).map((s) => el('li', {}, s))),
      opts.length ? el('div', { class: 'sc-opts' }, opts) : null),
    el('div', { class: 'card-foot' }, el('span', { class: 'muted small mono' }, sc.key), runBtn),
    resultEl);
}

async function runScenario(sc, btn, resultEl, optInputs) {
  const body = {};
  Object.entries(optInputs).forEach(([k, inp]) => { body[k] = inp.type === 'checkbox' ? inp.checked : (inp.value === '' ? undefined : Number(inp.value)); });
  await withBusy(btn, async () => {
    loading(resultEl);
    try {
      const res = await api.post(`/demo/scenarios/${encodeURIComponent(sc.key)}/run`, body);
      results[sc.key] = res;
      mount(resultEl, resultPanel(sc, res));
      btn.querySelector('span:last-child').textContent = t('demo.run_again');
      toast(t('demo.ran', { title: hiOr(`demo.sc.${sc.key}.title`, sc.title) }), 'success');
      if (res.today && meta && (res.today !== meta.today || !!res.simulated !== !!meta.simulated)) await refreshMeta();
      window.dispatchEvent(new Event('nk:notifications-changed'));
    } catch (err) {
      errorState(resultEl, err, () => runScenario(sc, btn, resultEl, optInputs));
      toast(err.message || t('common.error'), 'danger');
    }
  });
}

function renderScenarios() {
  const area = $('#sc-area');
  if (!isStaff) {
    mount(area, el('div', { class: 'card accent-top' }, el('div', { class: 'card-body dg-gate' },
      el('div', { class: 'feature-icon', html: icon('lock', 22) }),
      el('div', {}, el('h3', { class: 'mt-0', style: { marginBottom: '4px' } }, t('demo.gate_t')), el('p', { class: 'text-2 mb-0' }, t('demo.gate'))),
      el('a', { class: 'btn', href: loginAs('officer@nidhikavach.demo', 'demo.html#scenarios'), html: `${icon('login', 16)}<span>${esc(t('demo.gate_btn'))}</span>` }))));
    return;
  }
  if (!scenarios) return;
  if (!scenarios.length) {
    mount(area, el('div', { class: 'card' }, el('div', { class: 'card-body' }, el('div', { class: 'empty' },
      el('div', { class: 'e-icon', html: icon('play', 28) }), el('div', { class: 'e-title' }, t('demo.sc_empty')), el('div', {}, t('demo.sc_empty_text'))))));
    return;
  }
  mount(area, el('div', { class: 'grid g-2' }, scenarios.map(scenarioCard)));
}

async function loadScenarios() {
  if (!isStaff) { renderScenarios(); return; }
  loading($('#sc-area'));
  try {
    scenarios = await api.get('/demo/scenarios');
    renderScenarios();
  } catch (err) {
    errorState($('#sc-area'), err, loadScenarios);
  }
}

/* ------------------------------------------------------------------ demo clock */
function updateHeaderClock() {
  const chip = document.querySelector('.nk-simclock');
  if (!chip || !meta) return;
  chip.classList.toggle('real', !meta.simulated);
  chip.title = meta.simulated ? `${t('clock.simulated')} (real: ${fmtDate(meta.real_today)})` : t('clock.demo_date');
  chip.innerHTML = `${icon('calendar', 14)}<span class="lbl">${esc(meta.simulated ? t('clock.simulated') : t('clock.real'))}:</span> ${esc(fmtDate(meta.today))}`;
}

async function refreshMeta() {
  try { meta = await api.get('/meta', null, { noRedirect: true }); } catch { /* keep the old value */ }
  updateHeaderClock();
  renderClock();
}

function jobBlock() {
  if (!clockResult) return null;
  const job = clockResult.job;
  if (!job) return el('div', { class: 'muted small' }, t('demo.job_none'));
  const nothing = !JOB_KEYS.some((k) => job[k]);
  return el('div', { class: 'stack', style: { gap: '8px' } },
    el('div', { class: 'label', html: `${icon('zap', 14)} ${esc(t('demo.job_t', { date: fmtDate(job.date || clockResult.today) }))}` }),
    nothing ? el('div', { class: 'text-2 small' }, t('demo.job_nothing')) : null,
    el('div', { class: 'dg-stats' }, JOB_KEYS.map((k) => el('div', { class: 'dg-stat' },
      el('div', { class: `v ${k === 'notifications_created' && job[k] ? 'hl' : ''}` }, fmtNum(job[k] || 0)),
      el('div', { class: 'l' }, t(`demo.j.${k}`))))),
    job.notifications_created ? el('a', { class: 'btn sm ghost', href: site('officer/alerts.html'), style: { alignSelf: 'flex-start' }, html: `${icon('arrow-up-right', 14)}<span>${esc(t('demo.see_outbox'))}</span>` }) : null);
}

function renderClock() {
  const body = $('#clock-body');
  if (!meta) { mount(body); return; }
  const off = meta.offset_days || 0;
  const sim = !!meta.simulated || off !== 0;
  mount($('#clock-badge'), el('span', { class: `badge ${sim ? 'b-warning' : 'b-success'}`, html: `${icon(sim ? 'clock' : 'check', 12)}${esc(t(sim ? 'demo.sim' : 'demo.live'))}` }));
  const offTxt = off === 0 ? t('demo.off0') : off > 0 ? t('demo.offp', { n: fmtNum(off) }) : t('demo.offn', { n: fmtNum(-off) });
  const dates = el('div', { class: 'dg-clock-dates' },
    el('div', { class: 'dg-date' }, el('div', { class: 'lbl' }, t('demo.real')), el('div', { class: 'val' }, fmtDate(meta.real_today)), el('div', { class: 'small muted' }, t('clock.real'))),
    el('div', { class: `dg-date ${sim ? 'sim' : ''}` }, el('div', { class: 'lbl' }, t('demo.demo')), el('div', { class: 'val' }, fmtDate(meta.today)), el('div', { class: 'small text-2' }, offTxt)));
  if (!isStaff) {
    mount(body, dates, el('div', { class: 'alert info mb-0', html: `${icon('lock', 18)}<div>${esc(t('demo.clock_gate'))} <a href="${esc(loginAs('officer@nidhikavach.demo', 'demo.html#clock'))}">${esc(t('demo.gate_btn'))}</a></div>` }));
    return;
  }
  const auto = el('input', { type: 'checkbox', id: 'clk-auto', checked: true });
  const dateIn = el('input', { class: 'input', type: 'date', id: 'clk-date', value: meta.today });
  const b = (label, cls, payload, ic) => el('button', { class: `btn ${cls}`, type: 'button', html: `${ic ? icon(ic, 15) : ''}<span>${esc(label)}</span>`, onclick: (e) => moveClock(e.currentTarget, payload, auto.checked) });
  mount(body, dates,
    el('div', { class: 'dg-jump' },
      b(t('demo.m7'), 'secondary', { days: -7 }),
      b(t('demo.p7'), 'secondary', { days: 7 }),
      b(t('demo.p30'), 'saffron', { days: 30 }),
      b(t('demo.reset'), 'ghost', { date: null }, 'refresh')),
    el('div', { class: 'dg-jump' },
      el('div', { class: 'field' }, el('label', { for: 'clk-date' }, t('demo.goto_l')), dateIn),
      el('button', { class: 'btn secondary', type: 'button', html: `${icon('arrow-right', 15)}<span>${esc(t('demo.goto'))}</span>`,
        onclick: (e) => { if (!dateIn.value) { toast(t('demo.goto_err'), 'warning'); dateIn.focus(); return; } moveClock(e.currentTarget, { date: dateIn.value }, auto.checked); } })),
    el('label', { class: 'check' }, auto, t('demo.autojob')),
    el('div', { 'aria-live': 'polite' }, jobBlock()));
}

async function moveClock(btn, payload, runJob) {
  await withBusy(btn, async () => {
    try {
      clockResult = await api.post('/admin/clock', { ...payload, run_job: runJob });
      meta = { ...meta, today: clockResult.today, offset_days: clockResult.offset_days, simulated: clockResult.simulated, real_today: clockResult.real_today || meta.real_today };
      updateHeaderClock();
      renderClock();
      toast(clockResult.offset_days === 0 ? t('demo.clock_reset', { date: fmtDate(clockResult.today) }) : t('demo.clock_done', { date: fmtDate(clockResult.today) }), 'success');
      window.dispatchEvent(new Event('nk:notifications-changed'));
    } catch (err) {
      toast(err.message || t('common.error'), 'danger');
    }
  });
}

/* ------------------------------------------------------------------ coverage + innovations */
const COVERAGE = {
  en: [
    ['Centralized repository', 'One registry of every FDR from every institution, with natural-language search, filters, totals and CSV export.', [['FDR Registry', 'officer/fdrs.html'], ['Institutions', 'officer/institutions.html']]],
    ['Digital document management', 'Receipts uploaded as PDF or photo; the portal reads the text, the signed QR and (for photos) OCR, and keeps the document with the instrument.', [['Submit FDR', 'institution/submit.html'], ['Verify a receipt', 'verify.html']]],
    ['Verification & discrepancy detection', 'Trust ladder, signature and bank checks, tamper and duplicate detection, and a risk-ranked queue that explains why.', [['Verification queue', 'officer/queue.html'], ['Discrepancy scenario', 'demo.html#sc-discrepancy']]],
    ['Automated validity & maturity tracking', 'Days to maturity worked out every day, expiring buckets and a 12-month maturity heatmap.', [['Dashboard', 'officer/dashboard.html'], ['Expiring FDRs', 'officer/fdrs.html?display_status=expiring']]],
    ['Renewal & replacement monitoring', 'Renewal chains link old and new FDRs, late renewals are flagged and an unrenewed matured FDR raises a discrepancy.', [['Renewed FDRs', 'officer/fdrs.html?display_status=renewed'], ['Renewal scenario', 'demo.html#sc-renewal']]],
    ['Release & refund workflow', 'Stage-wise workflow with checklist, SLA timers, approvals and a portal-signed NOC that anyone can verify.', [['Release & Refund', 'officer/releases.html'], ['Bottleneck analytics', 'officer/analytics.html']]],
    ['Automated alerts & escalation', 'Reminders 90/60/30/7 days before maturity, then institution → officer → authority, by email, SMS and in-app.', [['Alerts centre', 'officer/alerts.html'], ['Notifications', 'notifications.html']]],
    ['Dashboard & management reports', 'Protection-gap dashboard, analytics and ready reports with preview, CSV download and print view.', [['Dashboard', 'officer/dashboard.html'], ['Reports', 'officer/reports.html']]],
    ['Audit trail & access control', 'Five roles with separate menus and permissions; a hash-chained audit trail with a one-click integrity check.', [['Audit trail', 'officer/audit.html'], ['Users & roles', 'admin/users.html']]],
    ['System integration & data security', 'Bank verification API with nightly re-checks, Ed25519 signatures with a public key registry, signed sessions.', [['Public verify page', 'verify.html'], ['Key registry', 'admin/settings.html'], ['Bank portal', 'bank/dashboard.html']]],
  ],
  hi: [
    ['केंद्रीकृत भंडार', 'सभी संस्थानों की प्रत्येक एफडीआर का एक रजिस्टर: प्राकृतिक भाषा खोज, फ़िल्टर, योग और सीएसवी निर्यात।', [['एफडीआर रजिस्टर', 'officer/fdrs.html'], ['संस्थान', 'officer/institutions.html']]],
    ['डिजिटल दस्तावेज़ प्रबंधन', 'रसीद पीडीएफ या फ़ोटो के रूप में अपलोड; पोर्टल पाठ, हस्ताक्षरित क्यूआर और (फ़ोटो हेतु) ओसीआर पढ़कर दस्तावेज़ को लिखत के साथ रखता है।', [['एफडीआर जमा करें', 'institution/submit.html'], ['रसीद सत्यापित करें', 'verify.html']]],
    ['सत्यापन एवं विसंगति पहचान', 'विश्वास सीढ़ी, हस्ताक्षर व बैंक जाँच, छेड़छाड़ व दोहराव पहचान, और कारण बताने वाली जोखिम-क्रमित कतार।', [['सत्यापन कतार', 'officer/queue.html'], ['विसंगति परिदृश्य', 'demo.html#sc-discrepancy']]],
    ['स्वचालित वैधता एवं परिपक्वता ट्रैकिंग', 'प्रतिदिन परिपक्वता तक के दिनों की गणना, समाप्ति-निकट श्रेणियाँ और 12 माह का परिपक्वता हीटमैप।', [['डैशबोर्ड', 'officer/dashboard.html'], ['समाप्ति-निकट एफडीआर', 'officer/fdrs.html?display_status=expiring']]],
    ['नवीनीकरण एवं प्रतिस्थापन निगरानी', 'नवीनीकरण शृंखला पुरानी और नई एफडीआर को जोड़ती है, विलंबित नवीनीकरण चिह्नित होते हैं और बिना नवीनीकरण परिपक्व एफडीआर पर विसंगति दर्ज होती है।', [['नवीनीकृत एफडीआर', 'officer/fdrs.html?display_status=renewed'], ['नवीनीकरण परिदृश्य', 'demo.html#sc-renewal']]],
    ['रिलीज़ एवं वापसी कार्यप्रवाह', 'जाँच-सूची, एसएलए टाइमर, अनुमोदन और पोर्टल-हस्ताक्षरित एनओसी सहित चरणबद्ध कार्यप्रवाह, जिसे कोई भी सत्यापित कर सकता है।', [['रिलीज़ एवं वापसी', 'officer/releases.html'], ['अवरोध विश्लेषण', 'officer/analytics.html']]],
    ['स्वचालित अलर्ट एवं एस्केलेशन', 'परिपक्वता से 90/60/30/7 दिन पहले अनुस्मारक, फिर संस्थान → अधिकारी → प्राधिकारी, ईमेल, एसएमएस और पोर्टल सूचना द्वारा।', [['अलर्ट केंद्र', 'officer/alerts.html'], ['सूचनाएँ', 'notifications.html']]],
    ['डैशबोर्ड एवं प्रबंधन रिपोर्ट', 'सुरक्षा-अंतर डैशबोर्ड, विश्लेषण और पूर्वावलोकन, सीएसवी डाउनलोड व प्रिंट सहित तैयार रिपोर्ट।', [['डैशबोर्ड', 'officer/dashboard.html'], ['रिपोर्ट', 'officer/reports.html']]],
    ['ऑडिट ट्रेल एवं अभिगम नियंत्रण', 'अलग मेनू और अनुमतियों वाली पाँच भूमिकाएँ; एक क्लिक में अखंडता जाँच वाला हैश-शृंखलित ऑडिट ट्रेल।', [['ऑडिट ट्रेल', 'officer/audit.html'], ['उपयोगकर्ता एवं भूमिकाएँ', 'admin/users.html']]],
    ['सिस्टम एकीकरण एवं डेटा सुरक्षा', 'रात्रिकालीन पुनर्जाँच सहित बैंक सत्यापन एपीआई, सार्वजनिक कुंजी रजिस्टर सहित Ed25519 हस्ताक्षर, हस्ताक्षरित सत्र।', [['सार्वजनिक सत्यापन पृष्ठ', 'verify.html'], ['कुंजी रजिस्टर', 'admin/settings.html'], ['बैंक पोर्टल', 'bank/dashboard.html']]],
  ],
};

const INNOVATIONS = {
  en: [
    ['qr', 'Bank-signed QR receipts', 'Each receipt carries an Ed25519 signature from the bank. Change one digit and verification fails, on the portal or on the public verify page.'],
    ['sparkles', 'Smart receipt reading', 'PDF text, the signed QR and in-browser OCR fill the form automatically and flag anything that does not match.'],
    ['layers', 'Trust ladder', 'Claimed → Document matched → Bank verified, shown on every instrument so nobody mistakes a claim for a fact.'],
    ['target', 'Risk-ranked verification queue', 'Officers start with the riskiest submissions, and each score lists the reasons behind it.'],
    ['shield-alert', 'Protection-gap dashboard', 'The rupee amount that does not protect AICTE today, with a maturity heatmap for the year ahead.'],
    ['copy', 'Duplicate and reuse detection', 'The same FDR pledged by two institutions, or submitted twice, is caught at upload.'],
    ['bank', 'Bank API and nightly re-checks', 'Deposits are re-confirmed with the bank, so a pre-closed deposit or a removed lien surfaces within a day.'],
    ['hourglass', 'Release SLA and signed NOCs', 'Time in each stage against its SLA shows the bottleneck; NOC letters are portal-signed and publicly verifiable.'],
    ['link', 'Tamper-evident audit trail', 'Every action is hash-chained to the previous one; a single click proves nothing was edited.'],
    ['globe', 'Built for everyone', 'Natural-language search, the escalation ladder, a demo clock, English and Hindi, text size and high contrast.'],
  ],
  hi: [
    ['qr', 'बैंक-हस्ताक्षरित क्यूआर रसीदें', 'प्रत्येक रसीद पर बैंक का Ed25519 हस्ताक्षर होता है। एक अंक बदलते ही पोर्टल या सार्वजनिक सत्यापन पृष्ठ पर सत्यापन विफल हो जाता है।'],
    ['sparkles', 'स्मार्ट रसीद पठन', 'पीडीएफ पाठ, हस्ताक्षरित क्यूआर और ब्राउज़र में ओसीआर फ़ॉर्म स्वतः भरते हैं और असंगतियों को चिह्नित करते हैं।'],
    ['layers', 'विश्वास सीढ़ी', 'दावा → दस्तावेज़ मिलान → बैंक सत्यापित, हर लिखत पर दिखाई जाती है ताकि दावे को तथ्य न समझा जाए।'],
    ['target', 'जोखिम-क्रमित सत्यापन कतार', 'अधिकारी सबसे जोखिमपूर्ण प्रस्तुतियों से शुरुआत करते हैं और प्रत्येक अंक के कारण दिखाए जाते हैं।'],
    ['shield-alert', 'सुरक्षा-अंतर डैशबोर्ड', 'वह राशि जो आज एआईसीटीई को सुरक्षा नहीं देती, साथ में आगामी वर्ष का परिपक्वता हीटमैप।'],
    ['copy', 'दोहराव एवं पुनः उपयोग पहचान', 'दो संस्थानों द्वारा गिरवी रखी गई या दो बार प्रस्तुत एक ही एफडीआर अपलोड के समय पकड़ी जाती है।'],
    ['bank', 'बैंक एपीआई और रात्रिकालीन पुनर्जाँच', 'जमाओं की बैंक से पुनः पुष्टि होती है, इसलिए समयपूर्व बंद जमा या हटाया गया ग्रहणाधिकार एक दिन में सामने आता है।'],
    ['hourglass', 'रिलीज़ एसएलए और हस्ताक्षरित एनओसी', 'प्रत्येक चरण में लगा समय बनाम एसएलए अवरोध दिखाता है; एनओसी पत्र पोर्टल-हस्ताक्षरित और सार्वजनिक रूप से सत्यापन योग्य हैं।'],
    ['link', 'छेड़छाड़-प्रकट ऑडिट ट्रेल', 'प्रत्येक कार्रवाई पिछली कार्रवाई से हैश-शृंखलित है; एक क्लिक सिद्ध करता है कि कुछ भी संपादित नहीं हुआ।'],
    ['globe', 'सभी के लिए निर्मित', 'प्राकृतिक भाषा खोज, एस्केलेशन सीढ़ी, डेमो घड़ी, अंग्रेज़ी और हिंदी, अक्षर आकार और उच्च कंट्रास्ट।'],
  ],
};

function renderCoverage() {
  const rows = (COVERAGE[getLang()] || COVERAGE.en).map((r, i) => ({ n: i + 1, cap: r[0], how: r[1], where: r[2] }));
  renderTable($('#cov'), {
    columns: [
      { key: 'n', label: '#', render: (r) => `<span class="dg-num" aria-hidden="true">${icon('check', 15)}</span><span class="sr-only">${r.n}</span>` },
      { key: 'cap', label: t('demo.c_cap'), render: (r) => `<div class="cap">${r.n}. ${esc(r.cap)}</div>` },
      { key: 'how', label: t('demo.c_how'), render: (r) => `<div class="text-2 small">${esc(r.how)}</div>` },
      { key: 'where', label: t('demo.c_where'), render: (r) => `<div class="where">${r.where.map(([label, href]) => `<a class="btn sm secondary" href="${esc(site(href))}">${icon('arrow-up-right', 13)}<span>${esc(label)}</span></a>`).join('')}</div>` },
    ],
    rows,
  });
  $('#cov').querySelector('table')?.classList.add('dg-cov');
}

function renderInnovations() {
  mount($('#inn'), (INNOVATIONS[getLang()] || INNOVATIONS.en).map(([ic, title, text], i) => el('div', { class: 'card' },
    el('div', { class: 'card-body dg-innov' },
      el('div', { class: `feature-icon ${i % 3 === 1 ? 'saffron' : ''}`, html: icon(ic, 20) }),
      el('div', {}, el('h4', {}, `${i + 1}. ${title}`), el('p', {}, text))))));
}

/* ------------------------------------------------------------------ load */
async function loadAccounts() {
  try {
    const res = await api.get('/auth/demo-accounts', null, { noRedirect: true });
    accounts = res?.accounts || [];
  } catch { accounts = []; }
  renderRoles();
}

function renderAll() {
  apply();
  renderIntro();
  renderRoles();
  renderScenarios();
  renderClock();
  renderCoverage();
  renderInnovations();
}

renderIntro();
renderRoles();
renderClock();
renderCoverage();
renderInnovations();
loadAccounts();
loadScenarios();
if (!meta) refreshMeta();
onLang(renderAll);
if (location.hash) setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' }), 400);
