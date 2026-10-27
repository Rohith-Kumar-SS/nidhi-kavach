// Alerts centre: outbox KPIs, escalation ladder (reminder rules + escalation days), outbox of every simulated
// email / SMS / in-app message, reminder-rule editor and the daily job.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, kpi, fmtNum, fmtDate, fmtDateTime, loading, emptyState, errorState, renderTable, pagination,
  tabs, modal, toast, withBusy, mount, debounce, getParam, setParams, dl,
} from '../assets/js/ui.js';

extend({
  en: {
    'al.title': 'Alerts & reminders',
    'al.subtitle': 'Every reminder, escalation and decision message the portal sends — by email, SMS and in-app',
    'al.kpi_h': 'Message counts',
    'al.k_total': 'All messages',
    'al.k_total_sub': 'simulated outbox since launch',
    'al.k_email': 'Email',
    'al.k_sms': 'SMS',
    'al.k_app': 'In-app',
    'al.k_esc': 'Escalations',
    'al.k_esc_sub': '{n} overdue alerts to institutions',
    'al.k_share': '{p} of all messages',
    'al.demo_clock': 'Demo clock',
    'al.ladder_title': 'Escalation ladder',
    'al.ladder_sub': 'How the portal chases a deposit before and after it matures',
    'al.ph_pre': 'Before maturity · reminders',
    'al.ph_mat': 'Maturity',
    'al.ph_post': 'After maturity · escalation',
    'al.days_before': '{n} days before',
    'al.maturity_day': 'Maturity date',
    'al.maturity_sub': 'Renewal or release due',
    'al.on_maturity': 'Day 0 (on maturity)',
    'al.day_after': 'Day {n} after',
    'al.who_inst': 'Institution',
    'al.who_inst_cc': 'Institution + officers',
    'al.who_officer': 'Officers · level 1',
    'al.who_authority': 'Competent authority · level 2',
    'al.rule_off': 'switched off',
    'al.legend_email': 'Email',
    'al.legend_sms': 'SMS',
    'al.legend_app': 'In-app (bell)',
    'al.legend_note': 'Times come from the reminder rules and the escalation days in Settings. A matured deposit with no accepted renewal also gets a MATURED_NOT_RENEWED discrepancy.',
    'al.tab_outbox': 'Outbox',
    'al.tab_rules': 'Reminder rules',
    'al.tab_job': 'Daily job',
    'al.f_channel': 'Channel',
    'al.f_template': 'Message type',
    'al.f_level': 'Escalation level',
    'al.f_search': 'Search subject, recipient or text',
    'al.all_channels': 'All channels',
    'al.all_templates': 'All message types',
    'al.all_levels': 'All levels',
    'al.lvl0': 'Level 0 · institution / routine',
    'al.lvl1': 'Level 1 · officers',
    'al.lvl2': 'Level 2 · competent authority',
    'al.c_time': 'Sent',
    'al.c_channel': 'Channel',
    'al.c_type': 'Type',
    'al.c_recipient': 'Recipient',
    'al.c_subject': 'Subject',
    'al.c_level': 'Level',
    'al.c_esc': 'Escalation',
    'al.ch.email': 'Email',
    'al.ch.sms': 'SMS',
    'al.ch.in_app': 'In-app',
    'al.level.info': 'Info',
    'al.level.warning': 'Warning',
    'al.level.critical': 'Critical',
    'al.esc1': 'L1 · Officer',
    'al.esc2': 'L2 · Authority',
    'al.ob_empty': 'No messages match these filters',
    'al.ob_empty_text': 'Clear the filters or run the daily job to generate reminders.',
    'al.clear_filters': 'Clear filters',
    'al.msg_title': 'Message details',
    'al.m_sent': 'Sent on',
    'al.m_recipient': 'Recipient',
    'al.m_role': 'Recipient role',
    'al.m_inst': 'Institution',
    'al.m_fdr': 'Instrument',
    'al.m_rel': 'Release request',
    'al.m_status': 'Read status',
    'al.m_read': 'Read on {d}',
    'al.m_unread': 'Not read yet',
    'al.m_delivered': 'Delivered (simulated)',
    'al.m_to': 'To',
    'al.m_subject': 'Subject',
    'al.m_from': 'From',
    'al.m_sim_email': 'Simulated email — the prototype records it here instead of sending it.',
    'al.m_sim_sms': 'Simulated SMS — no message was actually sent.',
    'al.m_open': 'Open linked record',
    'al.r_rule': 'Rule',
    'al.r_when': 'When',
    'al.r_audience': 'Who is alerted',
    'al.r_channels': 'Channels',
    'al.r_level': 'Level',
    'al.r_active': 'Active',
    'al.r_on': 'On',
    'al.r_off': 'Off',
    'al.r_save': 'Save',
    'al.r_saved': 'Rule {code} saved. The next daily job will use it.',
    'al.r_readonly': 'Only Regulation Bureau officers and administrators can change reminder rules. You can view them here.',
    'al.r_intro': 'Change the days, channels or level of a rule and press Save on that row. The after-maturity days are the escalation ladder above.',
    'al.r_need_channel': 'Choose at least one channel for {code}.',
    'al.r_days_range': 'Days for {code} must be between {lo} and 365.',
    'al.r_unit_before': 'days before maturity',
    'al.r_unit_after': 'days after maturity',
    'al.r_unit_wait': 'days waiting',
    'al.r_unit_grace': 'days past the stage limit',
    'al.r_cc': 'officers copied',
    'al.kind.pre_maturity': 'Before maturity',
    'al.kind.post_maturity': 'After maturity',
    'al.kind.verification_pending': 'Verification delay',
    'al.kind.release_sla': 'Release time limit',
    'al.rn.pre': 'Maturity reminder',
    'al.rn.post_institution': 'Renewal overdue — institution',
    'al.rn.post_officer': 'Escalation level 1 — officers',
    'al.rn.post_authority': 'Escalation level 2 — competent authority',
    'al.rn.verify': 'Verification pending too long',
    'al.rn.release': 'Release request past its time limit',
    'al.j_title': 'Daily job',
    'al.j_intro': 'Every night the portal runs one job that sends reminders, escalates overdue renewals, re-checks deposits with the banks and recalculates risk. Running it again on the same demo day never duplicates a message.',
    'al.j_last': 'Last run',
    'al.j_never': 'The daily job has not run yet on this server.',
    'al.j_ran_on': 'Demo day {d} · finished {at}',
    'al.j_run': 'Run daily job now',
    'al.j_done': 'Daily job finished: {n} new notifications created.',
    'al.j_done_none': 'Daily job finished. Nothing new was due today, so no duplicate messages were created.',
    'al.j_latest': 'Result of the run you just started',
    'al.j_what': 'What the job does',
    'al.j_s1': 'Pre-maturity reminders at 90, 60, 30 and 7 days (officers copied from 30 days).',
    'al.j_s2': 'Escalation ladder for matured deposits with no accepted renewal: institution → officers → competent authority.',
    'al.j_s3': 'Alerts officers about submissions waiting longer than the verification time limit.',
    'al.j_s4': 'Alerts on release requests that crossed their stage time limit (SLA).',
    'al.j_s5': 'Re-checks active deposits with the bank verification API (catches pre-closure and removed liens).',
    'al.j_s6': 'Recalculates the risk score of every instrument.',
    'al.j_clock': 'Want to see reminders fire? Move the demo clock forward and the job runs automatically.',
    'al.j.reminders': 'Pre-maturity reminders',
    'al.j.escalations': 'Overdue escalations',
    'al.j.stale_verifications': 'Stale verifications',
    'al.j.sla_breaches': 'Release SLA breaches',
    'al.j.bank_checks': 'Bank re-checks',
    'al.j.bank_issues': 'Bank issues found',
    'al.j.notifications_created': 'Notifications created',
    'al.tpl.FDR_SUBMITTED': 'New submission',
    'al.tpl.FDR_ACCEPTED': 'FDR accepted',
    'al.tpl.FDR_RETURNED': 'Returned for correction',
    'al.tpl.FDR_REJECTED': 'FDR rejected',
    'al.tpl.FDR_INVOKED': 'Deposit invoked',
    'al.tpl.DISCREPANCY_RAISED': 'Discrepancy raised',
    'al.tpl.DISCREPANCY_RESPONDED': 'Institution responded',
    'al.tpl.MATURITY_REMINDER': 'Maturity reminder',
    'al.tpl.MATURED_OVERDUE': 'Renewal overdue',
    'al.tpl.ESCALATION': 'Escalation',
    'al.tpl.VERIFICATION_PENDING': 'Verification pending',
    'al.tpl.BANK_ALERT': 'Bank alert',
    'al.tpl.RELEASE_SUBMITTED': 'Release requested',
    'al.tpl.RELEASE_STAGE': 'Release stage update',
    'al.tpl.RELEASE_SLA': 'Release SLA breached',
    'al.tpl.RELEASE_DONE': 'Released · NOC issued',
    'al.tpl.RENEWAL_SUBMITTED': 'Renewal submitted',
    'al.tpl.WELCOME': 'Welcome',
  },
  hi: {
    'al.title': 'अलर्ट एवं अनुस्मारक',
    'al.subtitle': 'पोर्टल द्वारा ईमेल, एसएमएस और पोर्टल पर भेजे गए सभी अनुस्मारक, एस्केलेशन और निर्णय संदेश',
    'al.kpi_h': 'संदेशों की संख्या',
    'al.k_total': 'कुल संदेश',
    'al.k_total_sub': 'आरंभ से सिम्युलेटेड आउटबॉक्स',
    'al.k_email': 'ईमेल',
    'al.k_sms': 'एसएमएस',
    'al.k_app': 'पोर्टल सूचना',
    'al.k_esc': 'एस्केलेशन',
    'al.k_esc_sub': 'संस्थानों को {n} अतिदेय अलर्ट',
    'al.k_share': 'कुल संदेशों का {p}',
    'al.demo_clock': 'डेमो घड़ी',
    'al.ladder_title': 'एस्केलेशन सीढ़ी',
    'al.ladder_sub': 'परिपक्वता से पहले और बाद में पोर्टल किसी जमा की अनुवर्ती कार्रवाई कैसे करता है',
    'al.ph_pre': 'परिपक्वता से पहले · अनुस्मारक',
    'al.ph_mat': 'परिपक्वता',
    'al.ph_post': 'परिपक्वता के बाद · एस्केलेशन',
    'al.days_before': '{n} दिन पहले',
    'al.maturity_day': 'परिपक्वता तिथि',
    'al.maturity_sub': 'नवीनीकरण या रिलीज़ देय',
    'al.on_maturity': 'दिन 0 (परिपक्वता पर)',
    'al.day_after': '{n} दिन बाद',
    'al.who_inst': 'संस्थान',
    'al.who_inst_cc': 'संस्थान + अधिकारी',
    'al.who_officer': 'अधिकारी · स्तर 1',
    'al.who_authority': 'सक्षम प्राधिकारी · स्तर 2',
    'al.rule_off': 'बंद',
    'al.legend_email': 'ईमेल',
    'al.legend_sms': 'एसएमएस',
    'al.legend_app': 'पोर्टल सूचना (घंटी)',
    'al.legend_note': 'समय अनुस्मारक नियमों और सेटिंग्स में दिए गए एस्केलेशन दिनों से लिया जाता है। स्वीकृत नवीनीकरण के बिना परिपक्व जमा पर MATURED_NOT_RENEWED विसंगति भी दर्ज होती है।',
    'al.tab_outbox': 'आउटबॉक्स',
    'al.tab_rules': 'अनुस्मारक नियम',
    'al.tab_job': 'दैनिक कार्य',
    'al.f_channel': 'माध्यम',
    'al.f_template': 'संदेश का प्रकार',
    'al.f_level': 'एस्केलेशन स्तर',
    'al.f_search': 'विषय, प्राप्तकर्ता या पाठ खोजें',
    'al.all_channels': 'सभी माध्यम',
    'al.all_templates': 'सभी प्रकार',
    'al.all_levels': 'सभी स्तर',
    'al.lvl0': 'स्तर 0 · संस्थान / नियमित',
    'al.lvl1': 'स्तर 1 · अधिकारी',
    'al.lvl2': 'स्तर 2 · सक्षम प्राधिकारी',
    'al.c_time': 'भेजा गया',
    'al.c_channel': 'माध्यम',
    'al.c_type': 'प्रकार',
    'al.c_recipient': 'प्राप्तकर्ता',
    'al.c_subject': 'विषय',
    'al.c_level': 'स्तर',
    'al.c_esc': 'एस्केलेशन',
    'al.ch.email': 'ईमेल',
    'al.ch.sms': 'एसएमएस',
    'al.ch.in_app': 'पोर्टल',
    'al.level.info': 'सूचना',
    'al.level.warning': 'चेतावनी',
    'al.level.critical': 'गंभीर',
    'al.esc1': 'स्तर 1 · अधिकारी',
    'al.esc2': 'स्तर 2 · प्राधिकारी',
    'al.ob_empty': 'इन फ़िल्टरों से कोई संदेश नहीं मिला',
    'al.ob_empty_text': 'फ़िल्टर हटाएँ या अनुस्मारक बनाने के लिए दैनिक कार्य चलाएँ।',
    'al.clear_filters': 'फ़िल्टर हटाएँ',
    'al.msg_title': 'संदेश का विवरण',
    'al.m_sent': 'भेजने की तिथि',
    'al.m_recipient': 'प्राप्तकर्ता',
    'al.m_role': 'प्राप्तकर्ता की भूमिका',
    'al.m_inst': 'संस्थान',
    'al.m_fdr': 'लिखत',
    'al.m_rel': 'रिलीज़ अनुरोध',
    'al.m_status': 'पठन स्थिति',
    'al.m_read': '{d} को पढ़ा गया',
    'al.m_unread': 'अभी पढ़ा नहीं गया',
    'al.m_delivered': 'भेजा गया (सिम्युलेटेड)',
    'al.m_to': 'प्रति',
    'al.m_subject': 'विषय',
    'al.m_from': 'प्रेषक',
    'al.m_sim_email': 'सिम्युलेटेड ईमेल — प्रोटोटाइप इसे भेजने के बजाय यहाँ दर्ज करता है।',
    'al.m_sim_sms': 'सिम्युलेटेड एसएमएस — वास्तव में कोई संदेश नहीं भेजा गया।',
    'al.m_open': 'संबंधित रिकॉर्ड खोलें',
    'al.r_rule': 'नियम',
    'al.r_when': 'कब',
    'al.r_audience': 'किसे सूचित किया जाता है',
    'al.r_channels': 'माध्यम',
    'al.r_level': 'स्तर',
    'al.r_active': 'सक्रिय',
    'al.r_on': 'चालू',
    'al.r_off': 'बंद',
    'al.r_save': 'सहेजें',
    'al.r_saved': 'नियम {code} सहेजा गया। अगला दैनिक कार्य इसी का उपयोग करेगा।',
    'al.r_readonly': 'केवल विनियमन ब्यूरो के अधिकारी और प्रशासक अनुस्मारक नियम बदल सकते हैं। आप इन्हें यहाँ देख सकते हैं।',
    'al.r_intro': 'किसी नियम के दिन, माध्यम या स्तर बदलें और उसी पंक्ति में सहेजें दबाएँ। परिपक्वता के बाद के दिन ऊपर दी गई एस्केलेशन सीढ़ी हैं।',
    'al.r_need_channel': '{code} के लिए कम से कम एक माध्यम चुनें।',
    'al.r_days_range': '{code} के लिए दिन {lo} से 365 के बीच होने चाहिए।',
    'al.r_unit_before': 'दिन परिपक्वता से पहले',
    'al.r_unit_after': 'दिन परिपक्वता के बाद',
    'al.r_unit_wait': 'दिन की प्रतीक्षा',
    'al.r_unit_grace': 'दिन चरण-सीमा के बाद',
    'al.r_cc': 'अधिकारियों को प्रतिलिपि',
    'al.kind.pre_maturity': 'परिपक्वता से पहले',
    'al.kind.post_maturity': 'परिपक्वता के बाद',
    'al.kind.verification_pending': 'सत्यापन में विलंब',
    'al.kind.release_sla': 'रिलीज़ समय-सीमा',
    'al.rn.pre': 'परिपक्वता अनुस्मारक',
    'al.rn.post_institution': 'नवीनीकरण अतिदेय — संस्थान',
    'al.rn.post_officer': 'एस्केलेशन स्तर 1 — अधिकारी',
    'al.rn.post_authority': 'एस्केलेशन स्तर 2 — सक्षम प्राधिकारी',
    'al.rn.verify': 'सत्यापन में अधिक विलंब',
    'al.rn.release': 'रिलीज़ अनुरोध समय-सीमा से अधिक',
    'al.j_title': 'दैनिक कार्य',
    'al.j_intro': 'पोर्टल हर रात एक कार्य चलाता है जो अनुस्मारक भेजता है, अतिदेय नवीनीकरण को आगे बढ़ाता है, बैंकों से जमा की पुनः जाँच करता है और जोखिम की पुनर्गणना करता है। उसी डेमो दिन दोबारा चलाने पर कोई संदेश दोहराया नहीं जाता।',
    'al.j_last': 'पिछला रन',
    'al.j_never': 'इस सर्वर पर दैनिक कार्य अभी तक नहीं चला है।',
    'al.j_ran_on': 'डेमो दिन {d} · {at} को पूरा',
    'al.j_run': 'दैनिक कार्य अभी चलाएँ',
    'al.j_done': 'दैनिक कार्य पूरा: {n} नई सूचनाएँ बनाई गईं।',
    'al.j_done_none': 'दैनिक कार्य पूरा। आज कुछ नया देय नहीं था, इसलिए कोई दोहरा संदेश नहीं बना।',
    'al.j_latest': 'अभी चलाए गए कार्य का परिणाम',
    'al.j_what': 'यह कार्य क्या करता है',
    'al.j_s1': '90, 60, 30 और 7 दिन पहले परिपक्वता अनुस्मारक (30 दिन से अधिकारियों को प्रतिलिपि)।',
    'al.j_s2': 'स्वीकृत नवीनीकरण के बिना परिपक्व जमा के लिए एस्केलेशन: संस्थान → अधिकारी → सक्षम प्राधिकारी।',
    'al.j_s3': 'सत्यापन समय-सीमा से अधिक प्रतीक्षारत प्रस्तुतियों पर अधिकारियों को अलर्ट।',
    'al.j_s4': 'चरण समय-सीमा (SLA) पार कर चुके रिलीज़ अनुरोधों पर अलर्ट।',
    'al.j_s5': 'बैंक सत्यापन API से सक्रिय जमा की पुनः जाँच (समय-पूर्व बंद और हटाया गया लियन पकड़ता है)।',
    'al.j_s6': 'हर लिखत के जोखिम अंक की पुनर्गणना।',
    'al.j_clock': 'अनुस्मारक चलते देखना चाहते हैं? डेमो घड़ी आगे बढ़ाएँ, कार्य अपने-आप चलेगा।',
    'al.j.reminders': 'परिपक्वता-पूर्व अनुस्मारक',
    'al.j.escalations': 'अतिदेय एस्केलेशन',
    'al.j.stale_verifications': 'विलंबित सत्यापन',
    'al.j.sla_breaches': 'रिलीज़ समय-सीमा उल्लंघन',
    'al.j.bank_checks': 'बैंक पुनः जाँच',
    'al.j.bank_issues': 'बैंक में मिली समस्याएँ',
    'al.j.notifications_created': 'बनाई गई सूचनाएँ',
    'al.tpl.FDR_SUBMITTED': 'नई प्रस्तुति',
    'al.tpl.FDR_ACCEPTED': 'एफडीआर स्वीकृत',
    'al.tpl.FDR_RETURNED': 'सुधार हेतु लौटाई गई',
    'al.tpl.FDR_REJECTED': 'एफडीआर अस्वीकृत',
    'al.tpl.FDR_INVOKED': 'जमा भुनाई गई',
    'al.tpl.DISCREPANCY_RAISED': 'विसंगति दर्ज',
    'al.tpl.DISCREPANCY_RESPONDED': 'संस्थान का उत्तर',
    'al.tpl.MATURITY_REMINDER': 'परिपक्वता अनुस्मारक',
    'al.tpl.MATURED_OVERDUE': 'नवीनीकरण अतिदेय',
    'al.tpl.ESCALATION': 'एस्केलेशन',
    'al.tpl.VERIFICATION_PENDING': 'सत्यापन लंबित',
    'al.tpl.BANK_ALERT': 'बैंक अलर्ट',
    'al.tpl.RELEASE_SUBMITTED': 'रिलीज़ अनुरोध',
    'al.tpl.RELEASE_STAGE': 'रिलीज़ चरण अद्यतन',
    'al.tpl.RELEASE_SLA': 'रिलीज़ समय-सीमा पार',
    'al.tpl.RELEASE_DONE': 'रिलीज़ · एनओसी जारी',
    'al.tpl.RENEWAL_SUBMITTED': 'नवीनीकरण प्रस्तुत',
    'al.tpl.WELCOME': 'स्वागत',
  },
});

const { user } = await initPage({
  roles: ['officer', 'authority', 'admin'],
  active: 'alerts',
  title: 'al.title',
  subtitle: 'al.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'officer/dashboard.html' }, { label: 'al.title' }],
  actions: () => el('a', { class: 'btn secondary', href: site('demo.html#clock'), html: `${icon('calendar', 16)}<span>${esc(t('al.demo_clock'))}</span>` }),
});

const CAN_EDIT_RULES = user.role === 'officer' || user.role === 'admin';
const CHANNELS = ['in_app', 'email', 'sms'];
const CH_ICON = { email: 'mail', sms: 'sms', in_app: 'bell' };
const CH_BADGE = { email: 'b-info', sms: 'b-teal', in_app: 'b-violet' };
const LEVEL_BADGE = { info: 'b-slate', warning: 'b-warning', critical: 'b-danger' };
const JOB_KEYS = [
  ['notifications_created', 'send'], ['reminders', 'bell'], ['escalations', 'alert'], ['stale_verifications', 'hourglass'],
  ['sla_breaches', 'clock'], ['bank_checks', 'bank'], ['bank_issues', 'shield-alert'],
];
const PAGE_SIZE = 20;

const state = {
  totals: null, settings: null, rules: null,
  outbox: null, obError: null, filters: { channel: getParam('channel') || '', template: getParam('template') || '', escalation_level: getParam('level') || '', q: getParam('q') || '' },
  page: 1, drafts: {}, lastRun: null, tab: ['outbox', 'rules', 'job'].includes(getParam('tab')) ? getParam('tab') : 'outbox',
};
let tabsCtl = null;

$('#ladder-ic').innerHTML = icon('layers', 18);

const tplLabel = (code) => t(`al.tpl.${code}`, { _default: String(code || '').replace(/_/g, ' ').toLowerCase() });
const chBadge = (ch) => `<span class="badge ${CH_BADGE[ch] || 'b-slate'}">${icon(CH_ICON[ch] || 'bell', 12)}${esc(t(`al.ch.${ch}`, { _default: ch }))}</span>`;
const levelBadge = (lv) => `<span class="badge ${LEVEL_BADGE[lv] || 'b-slate'}">${esc(t(`al.level.${lv}`, { _default: lv }))}</span>`;
const escBadge = (n) => (n >= 2 ? `<span class="badge b-danger">${icon('flag', 12)}${esc(t('al.esc2'))}</span>`
  : n === 1 ? `<span class="badge b-orange">${icon('arrow-up-right', 12)}${esc(t('al.esc1'))}</span>` : '<span class="muted">—</span>');
const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : '0%');

/* ------------------------------------------------------------------ KPIs */
function renderKpis() {
  const box = $('#kpis');
  const c = state.totals;
  if (!c) return;
  const ch = c.counts_by_channel || {};
  const tpl = c.counts_by_template || {};
  const total = c.total || 0;
  mount(box,
    kpi({ label: t('al.k_total'), value: fmtNum(total), sub: esc(t('al.k_total_sub')), iconName: 'inbox', color: '' }),
    kpi({ label: t('al.k_email'), value: fmtNum(ch.email || 0), sub: esc(t('al.k_share', { p: pct(ch.email || 0, total) })), iconName: 'mail', color: 'info', onClick: () => quickChannel('email') }),
    kpi({ label: t('al.k_sms'), value: fmtNum(ch.sms || 0), sub: esc(t('al.k_share', { p: pct(ch.sms || 0, total) })), iconName: 'sms', color: 'teal', onClick: () => quickChannel('sms') }),
    kpi({ label: t('al.k_app'), value: fmtNum(ch.in_app || 0), sub: esc(t('al.k_share', { p: pct(ch.in_app || 0, total) })), iconName: 'bell', color: 'violet', onClick: () => quickChannel('in_app') }),
    kpi({ label: t('al.k_esc'), value: fmtNum(tpl.ESCALATION || 0), sub: esc(t('al.k_esc_sub', { n: fmtNum(tpl.MATURED_OVERDUE || 0) })), iconName: 'alert', color: 'danger', onClick: () => quickTemplate('ESCALATION') }));
}

function quickChannel(ch) {
  state.filters = { channel: ch, template: '', escalation_level: '', q: '' };
  state.page = 1;
  showTab('outbox');
  loadOutbox();
  $('#tabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function quickTemplate(tpl) {
  state.filters = { channel: '', template: tpl, escalation_level: '', q: '' };
  state.page = 1;
  showTab('outbox');
  loadOutbox();
  $('#tabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ------------------------------------------------------------------ escalation ladder */
function chanIcons(chs) {
  return el('div', { class: 'lch' }, (chs || []).map((c) => el('span', { class: 'chi', title: t(`al.ch.${c}`), 'aria-label': t(`al.ch.${c}`), html: icon(CH_ICON[c] || 'bell', 13) })));
}

function ladderNode({ cls, ic, day, who, chans, off }) {
  return el('div', { class: `lnode ${cls}${off ? ' off' : ''}` },
    el('div', { class: 'lcircle', html: icon(ic, 20) }),
    el('div', { class: 'ltext' },
      el('div', { class: 'lday' }, day),
      who ? el('div', { class: 'lwho' }, who) : null,
      off ? el('div', { class: 'lwho' }, el('span', { class: 'badge b-slate' }, t('al.rule_off'))) : null,
      chans ? chanIcons(chans) : null));
}

function renderLadder() {
  const box = $('#ladder');
  if (!state.rules || !state.settings) return;
  const pre = state.rules.filter((r) => r.kind === 'pre_maturity').sort((a, b) => b.offset_days - a.offset_days);
  const postRule = (aud) => state.rules.find((r) => r.kind === 'post_maturity' && r.audience === aud);
  const escd = state.settings.escalation_days || { institution: 0, officer: 7, authority: 15 };
  const nodes = [];
  pre.forEach((r) => {
    const cls = `pre ${r.level === 'critical' ? 'crit' : r.level === 'warning' ? 'warn' : ''}`;
    nodes.push(ladderNode({ cls, ic: 'bell', day: t('al.days_before', { n: r.offset_days }), who: r.offset_days <= 30 ? t('al.who_inst_cc') : t('al.who_inst'), chans: r.channels, off: !r.active }));
  });
  nodes.push(ladderNode({ cls: 'mat', ic: 'calendar', day: t('al.maturity_day'), who: t('al.maturity_sub') }));
  const post = [
    ['institution', 'building', t('al.who_inst'), 'l0'],
    ['officer', 'user', t('al.who_officer'), 'l1'],
    ['authority', 'stamp', t('al.who_authority'), 'l2'],
  ];
  post.forEach(([aud, ic, who, lv]) => {
    const r = postRule(aud);
    const d = escd[aud] ?? 0;
    nodes.push(ladderNode({ cls: `post ${lv}`, ic, day: d === 0 ? t('al.on_maturity') : t('al.day_after', { n: d }), who, chans: r ? r.channels : null, off: r && !r.active }));
  });
  const phases = el('div', { class: 'ladder-phases', 'aria-hidden': 'true' },
    el('div', { class: 'ph pre', style: { '--n': pre.length } }, el('span', { html: icon('bell', 14) }), t('al.ph_pre')),
    el('div', { class: 'ph mat', style: { '--n': 1 } }, t('al.ph_mat')),
    el('div', { class: 'ph post', style: { '--n': 3 } }, el('span', { html: icon('alert', 14) }), t('al.ph_post')));
  phases.querySelectorAll('.ph').forEach((p) => { p.style.flex = p.style.getPropertyValue('--n'); });
  const legend = el('div', { class: 'ladder-legend' },
    el('span', { html: `${icon('mail', 14)} ${esc(t('al.legend_email'))}` }),
    el('span', { html: `${icon('sms', 14)} ${esc(t('al.legend_sms'))}` }),
    el('span', { html: `${icon('bell', 14)} ${esc(t('al.legend_app'))}` }),
    el('span', { class: 'grow', html: `${icon('info', 14)} ${esc(t('al.legend_note'))}` }));
  mount(box, phases, el('div', { class: 'ladder', role: 'list' }, nodes.map((n) => { n.setAttribute('role', 'listitem'); return n; })), legend);
}

/* ------------------------------------------------------------------ tabs */
function buildTabs() {
  const defs = [
    { key: 'outbox', label: t('al.tab_outbox'), icon: 'inbox', count: state.totals ? fmtNum(state.totals.total) : undefined, render: renderOutboxPanel },
    { key: 'rules', label: t('al.tab_rules'), icon: 'settings', count: state.rules ? state.rules.length : undefined, render: renderRulesPanel },
    { key: 'job', label: t('al.tab_job'), icon: 'refresh', render: renderJobPanel },
  ];
  tabsCtl = tabs($('#tabs'), defs, { active: state.tab, onChange: (k) => { state.tab = k; setParams({ tab: k === 'outbox' ? null : k }); } });
}
function showTab(key) { if (tabsCtl && tabsCtl.active !== key) tabsCtl.select(key); }

/* ------------------------------------------------------------------ outbox */
let obTable = null;
let obPager = null;

function renderOutboxPanel(panel) {
  const f = state.filters;
  const counts = state.outbox || state.totals || {};
  const chCounts = counts.counts_by_channel || {};
  const tplCounts = counts.counts_by_template || {};
  const lvCounts = counts.counts_by_escalation_level || {};
  const chSel = el('select', { class: 'select', id: 'ob-ch' },
    el('option', { value: '' }, t('al.all_channels')),
    CHANNELS.map((c) => el('option', { value: c, selected: f.channel === c }, `${t(`al.ch.${c}`)} (${fmtNum(chCounts[c] || 0)})`)));
  const tplKeys = Object.keys(tplCounts);
  if (f.template && !tplKeys.includes(f.template)) tplKeys.push(f.template);
  const tplSel = el('select', { class: 'select', id: 'ob-tpl' },
    el('option', { value: '' }, t('al.all_templates')),
    tplKeys.sort((a, b) => tplLabel(a).localeCompare(tplLabel(b))).map((k) => el('option', { value: k, selected: f.template === k }, `${tplLabel(k)} (${fmtNum(tplCounts[k] || 0)})`)));
  const lvSel = el('select', { class: 'select', id: 'ob-lv' },
    el('option', { value: '' }, t('al.all_levels')),
    ['0', '1', '2'].map((k) => el('option', { value: k, selected: String(f.escalation_level) === k }, `${t(`al.lvl${k}`)} (${fmtNum(lvCounts[k] || 0)})`)));
  const search = el('input', { class: 'input', id: 'ob-q', type: 'search', value: f.q, placeholder: t('al.f_search') });
  const onChange = () => {
    state.filters = { channel: chSel.value, template: tplSel.value, escalation_level: lvSel.value, q: search.value.trim() };
    state.page = 1;
    loadOutbox();
  };
  chSel.addEventListener('change', onChange);
  tplSel.addEventListener('change', onChange);
  lvSel.addEventListener('change', onChange);
  search.addEventListener('input', debounce(onChange, 350));
  const anyFilter = f.channel || f.template || f.escalation_level !== '' || f.q;
  const clearBtn = el('button', { type: 'button', class: 'btn ghost', disabled: !anyFilter, html: `${icon('x', 15)}<span>${esc(t('al.clear_filters'))}</span>`, onclick: () => { state.filters = { channel: '', template: '', escalation_level: '', q: '' }; state.page = 1; loadOutbox(); } });
  obTable = el('div', { id: 'ob-table' });
  obPager = el('div', { id: 'ob-pager' });
  mount(panel,
    el('div', { class: 'ob-filters', role: 'search' },
      el('div', { class: 'field' }, el('label', { for: 'ob-ch' }, t('al.f_channel')), chSel),
      el('div', { class: 'field' }, el('label', { for: 'ob-tpl' }, t('al.f_template')), tplSel),
      el('div', { class: 'field' }, el('label', { for: 'ob-lv' }, t('al.f_level')), lvSel),
      el('div', { class: 'field grow' }, el('label', { for: 'ob-q' }, t('common.search')),
        el('div', { class: 'input-icon' }, el('span', { html: icon('search', 16) }), search)),
      clearBtn),
    obTable, obPager);
  renderOutboxTable();
}

function renderOutboxTable() {
  if (!obTable || !obTable.isConnected) return;
  if (state.obError) { errorState(obTable, state.obError, loadOutbox); mount(obPager); return; }
  if (!state.outbox) { loading(obTable); mount(obPager); return; }
  const rows = state.outbox.items;
  renderTable(obTable, {
    columns: [
      { key: 'created_at', label: t('al.c_time'), render: (r) => `<div class="nowrap">${esc(fmtDate(r.created_at))}</div><div class="cell-sub nowrap">${esc(fmtDateTime(r.created_at).split(', ')[1] || '')}</div>` },
      { key: 'channel', label: t('al.c_channel'), render: (r) => chBadge(r.channel) },
      { key: 'template', label: t('al.c_type'), render: (r) => `<div class="cell-main" style="font-weight:600">${esc(tplLabel(r.template))}</div><div class="cell-sub mono">${esc(r.template)}</div>` },
      { key: 'recipient', label: t('al.c_recipient'), render: (r) => `<div class="cell-main">${esc(r.recipient || '—')}</div><div class="cell-sub">${esc(t(`role.${r.recipient_role}`, { _default: r.recipient_role || '' }))}</div>` },
      { key: 'subject', label: t('al.c_subject'), render: (r) => `<div class="ob-subject">${esc(r.subject)}</div><div class="cell-sub">${esc([r.institution_name, r.fdr_ref_no || r.release_ref_no].filter(Boolean).join(' · '))}</div>` },
      { key: 'level', label: t('al.c_level'), render: (r) => levelBadge(r.level) },
      { key: 'escalation_level', label: t('al.c_esc'), render: (r) => escBadge(r.escalation_level) },
    ],
    rows,
    onRowClick: (r) => openMessage(r),
    rowClass: (r) => (r.level === 'critical' ? 'row-danger' : r.level === 'warning' ? 'row-warning' : ''),
    empty: { icon: 'inbox', title: t('al.ob_empty'), text: t('al.ob_empty_text') },
  });
  if (rows.length) pagination(obPager, { page: state.page, pageSize: PAGE_SIZE, total: state.outbox.total, onChange: (p) => { state.page = p; loadOutbox(); obTable.scrollIntoView({ block: 'start', behavior: 'smooth' }); } });
  else mount(obPager);
}

async function loadOutbox() {
  const f = state.filters;
  setParams({ channel: f.channel, template: f.template, level: f.escalation_level, q: f.q });
  state.obError = null;
  const before = state.outbox;
  state.outbox = null;
  if (state.tab === 'outbox' && tabsCtl) {
    // rebuild the filter strip so its counts follow the new filters once data arrives
    renderOutboxTable();
  }
  try {
    const params = { channel: f.channel, template: f.template, escalation_level: f.escalation_level, q: f.q, page: state.page, page_size: PAGE_SIZE };
    state.outbox = await api.get('/outbox', params);
    if (state.tab === 'outbox' && tabsCtl) renderOutboxPanel(document.querySelector('#tabs .tab-panel'));
  } catch (err) {
    state.outbox = before && false;
    state.obError = err;
    renderOutboxTable();
  }
}

function openMessage(m) {
  const who = esc(m.recipient || '—');
  let preview;
  if (m.channel === 'email') {
    preview = el('div', { class: 'msg-email' },
      el('div', { class: 'me-head', html: `<div><b>${esc(t('al.m_from'))}</b> Nidhi Kavach &lt;no-reply@nidhikavach.example&gt;</div><div><b>${esc(t('al.m_to'))}</b> ${who}</div><div><b>${esc(t('al.m_subject'))}</b> ${esc(m.subject)}</div>` }),
      el('div', { class: 'me-body' }, m.body || m.subject),
      el('div', { class: 'me-foot' }, t('al.m_sim_email')));
  } else if (m.channel === 'sms') {
    preview = el('div', { class: 'msg-sms' },
      el('div', { class: 'sender' }, 'NK-NIDHIK'),
      el('div', { class: 'bubble' }, `${m.subject}${m.body ? ' — ' + m.body : ''}`),
      el('div', { class: 'muted small mt-2' }, `${t('al.m_to')}: ${m.recipient || '—'} · ${t('al.m_sim_sms')}`));
  } else {
    const tone = m.level === 'critical' ? 'danger' : m.level === 'warning' ? 'warning' : '';
    preview = el('div', { class: 'msg-app' }, el('div', { class: 'list-item' },
      el('div', { class: `li-icon ${tone}`, html: icon(m.level === 'critical' ? 'alert-circle' : m.level === 'warning' ? 'alert' : 'bell', 18) }),
      el('div', { class: 'li-main' }, el('div', { class: 'li-title' }, m.subject), m.body ? el('div', { class: 'text-2 small' }, m.body) : null,
        el('div', { class: 'li-sub' }, fmtDateTime(m.created_at)))));
  }
  const readTxt = m.channel === 'in_app' ? (m.read_at ? t('al.m_read', { d: fmtDateTime(m.read_at) }) : t('al.m_unread')) : t('al.m_delivered');
  const fdrLink = m.fdr_id && m.fdr_ref_no ? el('a', { href: site(`officer/fdr.html?id=${m.fdr_id}`), class: 'mono' }, m.fdr_ref_no) : null;
  const relLink = m.release_id && m.release_ref_no ? el('a', { href: site(`officer/release.html?id=${m.release_id}`), class: 'mono' }, m.release_ref_no) : null;
  const body = el('div', { class: 'stack' },
    el('div', { class: 'row', html: `${chBadge(m.channel)} ${levelBadge(m.level)} <span class="badge b-primary">${esc(tplLabel(m.template))}</span> ${m.escalation_level ? escBadge(m.escalation_level) : ''}` }),
    preview,
    dl([
      [t('al.m_sent'), esc(fmtDateTime(m.created_at))],
      [t('al.m_recipient'), who],
      [t('al.m_role'), esc(t(`role.${m.recipient_role}`, { _default: m.recipient_role || '—' }))],
      [t('al.m_status'), esc(readTxt)],
      m.institution_name ? [t('al.m_inst'), esc(m.institution_name)] : null,
      fdrLink ? [t('al.m_fdr'), fdrLink] : null,
      relLink ? [t('al.m_rel'), relLink] : null,
    ]));
  const actions = [{ label: t('common.close'), variant: 'secondary' }];
  if (m.link) actions.push({ label: t('al.m_open'), variant: 'primary', onClick: () => { location.href = site(m.link); return false; } });
  modal({ title: t('al.msg_title'), body, size: 'wide', actions });
}

/* ------------------------------------------------------------------ reminder rules */
function ruleName(r) {
  if (r.kind === 'pre_maturity') return `${t('al.rn.pre')} · ${t('al.days_before', { n: r.offset_days })}`;
  if (r.kind === 'post_maturity') return t(`al.rn.post_${r.audience}`, { _default: r.name });
  if (r.kind === 'verification_pending') return t('al.rn.verify');
  if (r.kind === 'release_sla') return t('al.rn.release');
  return r.name;
}
const UNIT = { pre_maturity: 'al.r_unit_before', post_maturity: 'al.r_unit_after', verification_pending: 'al.r_unit_wait', release_sla: 'al.r_unit_grace' };
const KIND_BADGE = { pre_maturity: 'b-primary', post_maturity: 'b-danger', verification_pending: 'b-violet', release_sla: 'b-orange' };
const ROLE_BADGE = { institution: 'b-teal', officer: 'b-primary', authority: 'b-saffron' };

function draftOf(r) {
  if (!state.drafts[r.id]) state.drafts[r.id] = { offset_days: r.offset_days, channels: [...r.channels], level: r.level, active: r.active };
  return state.drafts[r.id];
}
function isDirty(r) {
  const d = state.drafts[r.id];
  if (!d) return false;
  return d.offset_days !== r.offset_days || d.level !== r.level || d.active !== r.active
    || CHANNELS.filter((c) => d.channels.includes(c)).join() !== CHANNELS.filter((c) => r.channels.includes(c)).join();
}

function renderRulesPanel(panel) {
  if (!state.rules) { loading(panel); return; }
  const wrap = el('div', {});
  mount(panel,
    el('div', { class: 'panel-pad' }, el('div', { class: `alert ${CAN_EDIT_RULES ? 'info' : 'warning'}`, html: `${icon(CAN_EDIT_RULES ? 'info' : 'lock', 18)}<div>${esc(t(CAN_EDIT_RULES ? 'al.r_intro' : 'al.r_readonly'))}</div>` })),
    wrap);
  const ro = !CAN_EDIT_RULES;
  renderTable(wrap, {
    columns: [
      {
        key: 'name', label: t('al.r_rule'), render: (r) => el('div', {},
          el('div', { class: 'cell-main' }, ruleName(r)),
          el('div', { class: 'row', style: { gap: '6px', marginTop: '3px' }, html: `<span class="mono cell-sub">${esc(r.code)}</span><span class="badge ${KIND_BADGE[r.kind] || 'b-slate'}">${esc(t(`al.kind.${r.kind}`, { _default: r.kind }))}</span>` })),
      },
      {
        key: 'offset_days', label: t('al.r_when'), render: (r) => {
          const d = draftOf(r);
          const lo = r.kind === 'verification_pending' ? 1 : 0;
          const inp = el('input', { class: 'input sm', type: 'number', min: lo, max: 365, step: 1, value: d.offset_days, disabled: ro, 'aria-label': `${r.code} ${t(UNIT[r.kind] || 'al.r_unit_before')}` });
          inp.addEventListener('input', () => { d.offset_days = inp.value === '' ? null : Number(inp.value); inp.classList.remove('invalid'); markRow(inp, r); });
          return el('div', { class: 'rule-days' }, inp, el('span', { class: 'small text-2' }, t(UNIT[r.kind] || 'al.r_unit_before')));
        },
      },
      {
        key: 'audience', label: t('al.r_audience'), render: (r) => el('div', {},
          el('span', { class: `badge ${ROLE_BADGE[r.audience] || 'b-slate'}`, html: esc(t(`role.${r.audience}`, { _default: r.audience })) }),
          r.kind === 'pre_maturity' && draftOf(r).offset_days !== null && draftOf(r).offset_days <= 30 ? el('div', { class: 'cell-sub mt-1' }, `+ ${t('al.r_cc')}`) : null),
      },
      {
        key: 'channels', label: t('al.r_channels'), render: (r) => {
          const d = draftOf(r);
          return el('div', { class: 'chan-picks', role: 'group', 'aria-label': `${r.code} ${t('al.r_channels')}` }, CHANNELS.map((c) => {
            const cb = el('input', { type: 'checkbox', checked: d.channels.includes(c), disabled: ro });
            const lab = el('label', { class: `chan-pick ${d.channels.includes(c) ? 'on' : ''} ${ro ? 'disabled' : ''}`, title: t(`al.ch.${c}`) }, cb, el('span', { html: icon(CH_ICON[c], 13) }), el('span', {}, t(`al.ch.${c}`)));
            cb.addEventListener('change', () => {
              d.channels = cb.checked ? [...new Set([...d.channels, c])] : d.channels.filter((x) => x !== c);
              lab.classList.toggle('on', cb.checked);
              markRow(cb, r);
            });
            return lab;
          }));
        },
      },
      {
        key: 'level', label: t('al.r_level'), render: (r) => {
          const d = draftOf(r);
          const sel = el('select', { class: 'select sm', disabled: ro, 'aria-label': `${r.code} ${t('al.r_level')}` },
            ['info', 'warning', 'critical'].map((lv) => el('option', { value: lv, selected: d.level === lv }, t(`al.level.${lv}`))));
          sel.addEventListener('change', () => { d.level = sel.value; markRow(sel, r); });
          return sel;
        },
      },
      {
        key: 'active', label: t('al.r_active'), render: (r) => {
          const d = draftOf(r);
          const cb = el('input', { type: 'checkbox', checked: d.active, disabled: ro, role: 'switch', 'aria-label': `${r.code} ${t('al.r_active')}` });
          const txt = el('span', {}, d.active ? t('al.r_on') : t('al.r_off'));
          cb.addEventListener('change', () => { d.active = cb.checked; txt.textContent = cb.checked ? t('al.r_on') : t('al.r_off'); markRow(cb, r); });
          return el('label', { class: 'ops-switch' }, cb, el('span', { class: 'track' }), txt);
        },
      },
      ro ? null : {
        key: 'save', label: '', align: 'right', render: (r) => {
          const b = el('button', { type: 'button', class: 'btn sm', disabled: !isDirty(r), dataset: { save: r.id }, html: `${icon('check', 14)}<span>${esc(t('al.r_save'))}</span>` });
          b.addEventListener('click', () => saveRule(r, b));
          return b;
        },
      },
    ].filter(Boolean),
    rows: state.rules,
    rowClass: (r) => (isDirty(r) ? 'dirty' : ''),
  });
}

function markRow(node, r) {
  const tr = node.closest('tr');
  if (!tr) return;
  const dirty = isDirty(r);
  tr.classList.toggle('dirty', dirty);
  const b = tr.querySelector('[data-save]');
  if (b) b.disabled = !dirty;
}

async function saveRule(r, btn) {
  const d = draftOf(r);
  const lo = r.kind === 'verification_pending' ? 1 : 0;
  const tr = btn.closest('tr');
  if (d.offset_days === null || !Number.isInteger(d.offset_days) || d.offset_days < lo || d.offset_days > 365) {
    tr?.querySelector('input[type=number]')?.classList.add('invalid');
    toast(t('al.r_days_range', { code: r.code, lo }), 'error');
    return;
  }
  if (!d.channels.length) { toast(t('al.r_need_channel', { code: r.code }), 'error'); return; }
  await withBusy(btn, async () => {
    try {
      const body = { offset_days: d.offset_days, channels: CHANNELS.filter((c) => d.channels.includes(c)), level: d.level, active: d.active };
      const saved = await api.put(`/reminder-rules/${r.id}`, body);
      const i = state.rules.findIndex((x) => x.id === r.id);
      if (i >= 0) state.rules[i] = saved;
      delete state.drafts[r.id];
      toast(t('al.r_saved', { code: r.code }), 'success');
      if (r.kind === 'post_maturity' || r.kind === 'verification_pending') {
        try { state.settings = await api.get('/admin/settings'); } catch (e) { /* ladder keeps old days */ }
      }
    } catch (err) {
      toast(err.message, 'error');
      return;
    }
  });
  renderLadder();
  if (state.tab === 'rules') renderRulesPanel(document.querySelector('#tabs .tab-panel'));
}

/* ------------------------------------------------------------------ daily job */
function jobStats(result, highlight) {
  return el('div', { class: 'job-stats' }, JOB_KEYS.map(([k, ic]) => el('div', { class: `job-stat ${highlight && result[k] ? 'hl' : ''}` },
    el('div', { class: 'l', html: `${icon(ic, 14)}<span>${esc(t(`al.j.${k}`))}</span>` }),
    el('div', { class: 'v' }, fmtNum(result[k] ?? 0)))));
}

function renderJobPanel(panel) {
  const last = state.settings && state.settings.last_daily_job;
  const runBtn = el('button', { type: 'button', class: 'btn', id: 'run-job', html: `${icon('play', 16)}<span>${esc(t('al.j_run'))}</span>` });
  runBtn.addEventListener('click', () => runJob(runBtn));
  const lastBox = last && last.result
    ? el('div', { class: 'stack' },
      el('div', { class: 'row between' },
        el('div', {}, el('h3', { class: 'mb-0' }, t('al.j_last')), el('div', { class: 'muted small' }, t('al.j_ran_on', { d: fmtDate(last.date), at: fmtDateTime(last.at) }))),
        runBtn),
      jobStats(last.result, false))
    : el('div', { class: 'stack' }, el('div', { class: 'row between' }, el('div', { class: 'muted' }, t('al.j_never')), runBtn));
  const latest = state.lastRun
    ? el('div', { class: 'stack' },
      el('div', { class: 'alert success', html: `${icon('check-circle', 18)}<div><div class="a-title">${esc(t('al.j_latest'))}</div>${esc(state.lastRun.notifications_created ? t('al.j_done', { n: fmtNum(state.lastRun.notifications_created) }) : t('al.j_done_none'))}</div>` }),
      jobStats(state.lastRun, true))
    : null;
  mount(panel, el('div', { class: 'panel-pad' }, el('div', { class: 'grid g-3-2' },
    el('div', { class: 'stack lg' }, el('p', { class: 'text-2 mb-0' }, t('al.j_intro')), latest, lastBox),
    el('div', { class: 'card', style: { boxShadow: 'none', background: 'var(--nk-surface-2)' } },
      el('div', { class: 'card-head' }, el('h3', { html: `${icon('list', 16)}<span>${esc(t('al.j_what'))}</span>` })),
      el('div', { class: 'card-body' },
        el('ol', { class: 'job-steps' }, ['s1', 's2', 's3', 's4', 's5', 's6'].map((s) => el('li', {}, el('span', {}, t(`al.j_${s}`))))),
        el('div', { class: 'alert saffron mt-3', html: `${icon('calendar', 18)}<div>${esc(t('al.j_clock'))} <a href="${esc(site('demo.html#clock'))}">${esc(t('al.demo_clock'))} →</a></div>` }))))));
}

async function runJob(btn) {
  await withBusy(btn, async () => {
    try {
      state.lastRun = await api.post('/admin/run-daily-job', {});
      toast(state.lastRun.notifications_created ? t('al.j_done', { n: fmtNum(state.lastRun.notifications_created) }) : t('al.j_done_none'), 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  });
  try {
    const [s, tot] = await Promise.all([api.get('/admin/settings'), api.get('/outbox', { page_size: 1 })]);
    state.settings = s;
    state.totals = tot;
  } catch (e) { /* keep the previous figures */ }
  renderKpis();
  if (state.tab === 'job') renderJobPanel(document.querySelector('#tabs .tab-panel'));
}

/* ------------------------------------------------------------------ load */
async function loadAll() {
  loading($('#ladder'));
  try {
    const [totals, settings, rules] = await Promise.all([
      api.get('/outbox', { page_size: 1 }), api.get('/admin/settings'), api.get('/reminder-rules'),
    ]);
    state.totals = totals;
    state.settings = settings;
    state.rules = rules;
  } catch (err) {
    errorState($('#ladder'), err, loadAll);
    emptyState($('#kpis'), { icon: 'alert-circle', title: t('common.error') });
    return;
  }
  renderKpis();
  renderLadder();
  buildTabs();
  loadOutbox();
}

onLang(() => {
  renderKpis();
  renderLadder();
  if (state.totals) buildTabs();
});

loadAll();
