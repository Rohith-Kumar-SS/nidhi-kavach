// Public landing page: hero + receipt illustration, live counters, problem, lifecycle, innovations,
// trust ladder, roles, judges callout, FAQ and prototype notice. Fully bilingual.
import { initPage } from './assets/js/layout.js';
import { api, site } from './assets/js/api.js';
import { t, extend, onLang } from './assets/js/i18n.js';
import { $, $$, el, esc, icon, mount, fmtINR, fmtINRShort, fmtNum, fmtDate, trustBadge, riskBadge } from './assets/js/ui.js';

extend({
  en: {
    'home.eyebrow': 'SIH 2026 · SIH26265 · Prototype for AICTE Regulation Bureau',
    'home.title_a': 'Every security deposit —',
    'home.title_b': 'verified, tracked and protected',
    'home.lead': 'Nidhi Kavach is one secure, central portal for the Fixed Deposit Receipts that technical institutions pledge to AICTE — from submission and bank verification to maturity alerts, renewal and a time-bound release.',
    'home.cta_verify': 'Verify an FDR / NOC',
    'home.cta_login': 'Sign in',
    'home.cta_demo': "Judge's demo guide",
    'home.point1': 'Bank-signed QR receipts',
    'home.point2': 'Alerts before every maturity',
    'home.point3': 'Tamper-evident audit trail',

    'home.rc_bank': 'Deccan National Bank',
    'home.rc_kind': 'Fixed Deposit Receipt',
    'home.rc_specimen': 'Specimen',
    'home.rc_holder_l': 'Depositor',
    'home.rc_holder': 'Kaveri Institute of Engineering & Technology',
    'home.rc_amount_l': 'Deposit amount',
    'home.rc_fdr_l': 'FDR number',
    'home.rc_issue_l': 'Issued on',
    'home.rc_mat_l': 'Matures on',
    'home.rc_qr_cap': 'Bank-signed QR\nEd25519',
    'home.rc_lien': 'Lien in favour of AICTE',
    'home.rc_key': 'Signing key DNB-K1',
    'home.art_label': 'Illustration: a fixed deposit receipt with a bank-signed QR code, marked bank verified',
    'home.chip_risk': 'Risk',
    'home.chip_mature': 'Matures in {n} days',

    'home.stats_live': 'Live from the portal',
    'home.st_asof': 'as on {d}',
    'home.st_inst': 'Institutions',
    'home.st_inst_s': 'on the portal',
    'home.st_fdrs': 'Active FDRs',
    'home.st_fdrs_s': 'tracked every day',
    'home.st_amount': 'Deposits protected',
    'home.st_amount_s': 'with {n} partner banks',
    'home.st_amount_s0': 'under lien to AICTE',
    'home.st_ver': 'Bank-verified',
    'home.st_ver_s': 'of active deposits',
    'home.st_days': 'Avg. verification',
    'home.st_days_s': 'submission to bank check',
    'home.st_days_v': '{n} days',

    'home.problem_eyebrow': 'The problem today',
    'home.problem_title': 'Crores in deposits, managed on paper',
    'home.problem_lead': 'Security deposits are meant to protect students and AICTE if an institution fails its obligations. Managed by hand, they quietly stop protecting anyone.',
    'home.p1_t': 'Records scattered across files',
    'home.p1_d': 'Receipts sit in physical files, emails and spreadsheets across sections. Nobody can say in one place how much is deposited, by whom, or with which bank.',
    'home.p1_f': 'One central register with live status',
    'home.p2_t': 'Maturities slip by unnoticed',
    'home.p2_d': 'An FDR that matures without renewal stops protecting anyone — and it is usually discovered months later, during an inspection.',
    'home.p2_f': 'Reminders before maturity, escalation if ignored',
    'home.p3_t': 'Receipts that cannot be verified',
    'home.p3_d': 'A printed receipt can be edited or reused. Confirming it takes letters and calls to the bank, and a pre-closed deposit or removed lien goes unseen.',
    'home.p3_f': 'Bank-signed QR checked in seconds',
    'home.p4_t': 'Slow, opaque refunds',
    'home.p4_d': 'Institutions wait months for a release with no view of where the file is, and no record of how long each desk took.',
    'home.p4_f': 'Time-bound release with tracked deadlines',

    'home.how_eyebrow': 'How it works',
    'home.how_title': 'One lifecycle, from receipt to release',
    'home.how_lead': 'Every deposit follows the same five steps, and every step is recorded.',
    'home.s1_t': 'Submit', 'home.s1_w': 'Institution',
    'home.s1_d': 'The institution uploads the receipt; the form fills itself from the PDF and its QR code.',
    'home.s2_t': 'Verify', 'home.s2_w': 'AICTE officer + bank',
    'home.s2_d': 'The bank signature is checked, the bank confirms status and lien, and the officer accepts it.',
    'home.s3_t': 'Track', 'home.s3_w': 'Portal, every night',
    'home.s3_d': 'Each deposit is re-checked with the bank nightly and reminders go out well before maturity.',
    'home.s4_t': 'Renew', 'home.s4_w': 'Institution + bank',
    'home.s4_d': 'A renewed receipt replaces the old one, so the protection continues without a gap.',
    'home.s5_t': 'Release', 'home.s5_w': 'Competent authority',
    'home.s5_d': 'A time-bound approval chain ends in a signed release order (NOC) that anyone can verify.',

    'home.feat_eyebrow': 'What makes it different',
    'home.feat_title': 'Built to catch what paper misses',
    'home.feat_lead': 'Not a digital filing cabinet: the portal proves each deposit is real, watches it every day and shows where the risk is.',
    'home.new': 'New',
    'home.f1_t': 'Bank-signed QR receipts',
    'home.f1_d': 'Each receipt carries a QR code digitally signed by the bank (Ed25519). Change a single digit and verification fails.',
    'home.f2_t': 'Smart receipt reading',
    'home.f2_d': 'Reads the PDF text and QR, fills the form, cross-checks it and flags tampering or a receipt already used elsewhere.',
    'home.f3_t': 'Trust ladder',
    'home.f3_d': 'Claimed → Document matched → Bank verified: every deposit shows exactly how far it has been proven.',
    'home.f4_t': 'Risk-ranked verification queue',
    'home.f4_d': 'Officers start with the riskiest submissions, and every score comes with reasons in plain language.',
    'home.f5_t': 'Protection-gap dashboard',
    'home.f5_d': 'Shows the rupees not protecting AICTE right now, with a calendar heatmap of upcoming maturities.',
    'home.f6_t': 'Duplicate and reuse detection',
    'home.f6_d': 'The same FDR submitted by two institutions, or twice by one, is caught the moment it is uploaded.',
    'home.f7_t': 'Bank API with nightly re-checks',
    'home.f7_d': 'Banks confirm status and lien through an API; nightly re-checks catch pre-closed deposits and removed liens.',
    'home.f8_t': 'Release deadlines and signed NOCs',
    'home.f8_d': 'Every release stage has a deadline, bottlenecks are measured, and the final NOC is signed and publicly verifiable.',
    'home.f9_t': 'Tamper-evident audit trail',
    'home.f9_d': 'Every action is hash-chained to the one before it; a single click proves that nothing was altered.',
    'home.also': 'Also built in',
    'home.a1': 'Natural-language search',
    'home.a2': 'Escalation ladder — in-app, email, SMS',
    'home.a3': 'Demo clock',
    'home.a4': 'English / हिंदी',
    'home.a5': 'Text size, high contrast, keyboard access',

    'home.trust_eyebrow': 'Trust ladder',
    'home.trust_title': 'How far has this deposit been proven?',
    'home.trust_lead': 'Instead of a yes/no "verified" stamp, every deposit climbs three rungs. The rung is shown everywhere — in the officer\'s queue, the registry and the institution\'s own dashboard.',
    'home.l0_d': 'The institution has entered the details. Nothing has been checked yet.',
    'home.l1_d': 'The uploaded receipt matches the form — numbers, amounts and dates read from the PDF and its QR.',
    'home.l2_d': 'The bank signature is valid and the bank confirms the deposit is live, with lien marked to AICTE.',
    'home.flag_note': 'A red “Flagged” mark can sit on any rung — for example a duplicate receipt, a mismatch, or a lien removed at the bank.',

    'home.roles_eyebrow': 'Who uses it',
    'home.roles_title': 'Four roles, one shared record',
    'home.roles_lead': 'Each user sees exactly what their role needs — and every action is signed, role-checked and recorded.',
    'home.try_role': 'Try this role',
    'home.r_inst_d': 'Registrar or Principal of an AICTE-approved institution',
    'home.r_inst_1': 'Submit FDRs with forms that fill themselves',
    'home.r_inst_2': 'See the status and trust level of every deposit',
    'home.r_inst_3': 'Get reminders well before maturity',
    'home.r_inst_4': 'Request a release and follow it stage by stage',
    'home.r_off_d': 'Verifying officer, AICTE Regulation Bureau',
    'home.r_off_1': 'Work through a risk-ranked verification queue',
    'home.r_off_2': 'Compare claimed, receipt, QR and bank values',
    'home.r_off_3': 'Raise discrepancies or accept deposits',
    'home.r_off_4': 'Search the registry in plain language',
    'home.r_auth_d': 'Director who approves releases and receives escalations',
    'home.r_auth_1': 'See the protection gap and risk across India',
    'home.r_auth_2': 'Approve or return release requests',
    'home.r_auth_3': 'Receive escalations when deadlines slip',
    'home.r_auth_4': 'Check the integrity of the audit trail',
    'home.r_bank_d': 'Branch officer of a participating bank',
    'home.r_bank_1': 'Issue FDRs with a signed QR and lien to AICTE',
    'home.r_bank_2': 'Answer verification requests through the API',
    'home.r_bank_3': 'Mark or remove liens, renew or close deposits',
    'home.r_bank_4': 'Publish the bank\'s public signing key',

    'home.j_eyebrow': 'For judges',
    'home.j_title': 'See the whole journey in ten minutes',
    'home.j_text': 'The demo guide walks through scripted scenarios — a forged receipt caught, a maturity escalated, a release approved — with one-click sign-in for every role.',
    'home.j_demo': 'Open the demo guide',
    'home.j_login': 'Sign in with a demo account',
    'home.j_accounts': 'Demo accounts',
    'home.j_pw': 'Password for every account:',

    'home.faq_eyebrow': 'Questions',
    'home.faq_title': 'Frequently asked questions',
    'home.q1': 'What is a security deposit and why does AICTE hold it?',
    'home.a1x': 'Institutions approved by AICTE keep a security deposit, usually as a Fixed Deposit Receipt (FDR) pledged to AICTE. It protects students and the Council if an institution closes or fails its obligations, and it is released once the conditions are met.',
    'home.q2': 'Why an FDR and not a cash deposit?',
    'home.a2x': 'An FDR keeps earning interest for the institution while it is pledged. AICTE does not hold the money itself — it holds a lien on the deposit, so the bank cannot pay it out without AICTE\'s consent.',
    'home.q3': 'What does “lien marked in favour of AICTE” mean?',
    'home.a3x': 'A lien is the bank\'s record that AICTE has a claim on the deposit. While it is active, the deposit cannot be closed early or withdrawn. If a bank removes the lien, the nightly re-check flags it the next morning.',
    'home.q4': 'How does verification work?',
    'home.a4x': 'The bank signs the receipt details with its private key and prints them as a QR code. Anyone can scan or upload the receipt on the Verify page: the portal checks the signature against the bank\'s registered public key and shows the live bank status. Editing even one printed digit makes the check fail.',
    'home.q5': 'Who can see my institution\'s data?',
    'home.a5x': 'Deposit details are visible only to the institution, AICTE officers, the competent authority and the issuing bank — each limited to what their role needs. The public Verify page shows only what is printed on the receipt and whether it is genuine. Every view and change is recorded in the audit trail.',
    'home.q6': 'Is this the official AICTE portal?',
    'home.a6x': 'No. Nidhi Kavach is a working prototype built for Smart India Hackathon 2026 (problem statement SIH26265). All institutions, banks, people and amounts shown are fictitious demo data.',
    'home.notice_t': 'Prototype notice',
    'home.notice': 'This is a Smart India Hackathon 2026 prototype. It is not an official website of the Government of India or AICTE, and all data on it is fictitious.',
  },
  hi: {
    'home.eyebrow': 'SIH 2026 · SIH26265 · एआईसीटीई विनियमन ब्यूरो हेतु प्रोटोटाइप',
    'home.title_a': 'हर सुरक्षा जमा —',
    'home.title_b': 'सत्यापित, निगरानी में और सुरक्षित',
    'home.lead': 'निधि कवच तकनीकी संस्थानों द्वारा एआईसीटीई के पक्ष में रखी गई सावधि जमा रसीदों (एफडीआर) के लिए एक सुरक्षित, केंद्रीकृत पोर्टल है — प्रस्तुति और बैंक सत्यापन से लेकर परिपक्वता अलर्ट, नवीनीकरण और समयबद्ध रिलीज़ तक।',
    'home.cta_verify': 'एफडीआर / एनओसी सत्यापित करें',
    'home.cta_login': 'साइन इन करें',
    'home.cta_demo': 'निर्णायकों हेतु डेमो गाइड',
    'home.point1': 'बैंक द्वारा हस्ताक्षरित क्यूआर रसीदें',
    'home.point2': 'हर परिपक्वता से पहले अलर्ट',
    'home.point3': 'छेड़छाड़-रोधी ऑडिट ट्रेल',

    'home.rc_bank': 'दक्कन नेशनल बैंक',
    'home.rc_kind': 'सावधि जमा रसीद',
    'home.rc_specimen': 'नमूना',
    'home.rc_holder_l': 'जमाकर्ता',
    'home.rc_holder': 'कावेरी इंस्टीट्यूट ऑफ इंजीनियरिंग एंड टेक्नोलॉजी',
    'home.rc_amount_l': 'जमा राशि',
    'home.rc_fdr_l': 'एफडीआर संख्या',
    'home.rc_issue_l': 'जारी करने की तिथि',
    'home.rc_mat_l': 'परिपक्वता तिथि',
    'home.rc_qr_cap': 'बैंक-हस्ताक्षरित क्यूआर\nEd25519',
    'home.rc_lien': 'एआईसीटीई के पक्ष में ग्रहणाधिकार',
    'home.rc_key': 'हस्ताक्षर कुंजी DNB-K1',
    'home.art_label': 'चित्र: बैंक-हस्ताक्षरित क्यूआर कोड वाली सावधि जमा रसीद, बैंक द्वारा सत्यापित',
    'home.chip_risk': 'जोखिम',
    'home.chip_mature': '{n} दिनों में परिपक्व',

    'home.stats_live': 'पोर्टल से लाइव आँकड़े',
    'home.st_asof': '{d} की स्थिति',
    'home.st_inst': 'संस्थान',
    'home.st_inst_s': 'पोर्टल पर पंजीकृत',
    'home.st_fdrs': 'सक्रिय एफडीआर',
    'home.st_fdrs_s': 'प्रतिदिन निगरानी',
    'home.st_amount': 'सुरक्षित जमा राशि',
    'home.st_amount_s': '{n} सहभागी बैंकों में',
    'home.st_amount_s0': 'एआईसीटीई के ग्रहणाधिकार में',
    'home.st_ver': 'बैंक-सत्यापित',
    'home.st_ver_s': 'सक्रिय जमाओं में से',
    'home.st_days': 'औसत सत्यापन समय',
    'home.st_days_s': 'प्रस्तुति से बैंक जाँच तक',
    'home.st_days_v': '{n} दिन',

    'home.problem_eyebrow': 'आज की समस्या',
    'home.problem_title': 'करोड़ों की जमा राशि, काग़ज़ों के भरोसे',
    'home.problem_lead': 'सुरक्षा जमा का उद्देश्य यह है कि यदि कोई संस्थान अपने दायित्व पूरे न करे तो छात्रों और एआईसीटीई के हित सुरक्षित रहें। हाथ से प्रबंधित होने पर ये चुपचाप यह सुरक्षा खो देती हैं।',
    'home.p1_t': 'फ़ाइलों में बिखरे अभिलेख',
    'home.p1_d': 'रसीदें अलग-अलग अनुभागों की भौतिक फ़ाइलों, ईमेल और स्प्रेडशीट में रहती हैं। कोई भी एक स्थान पर नहीं बता सकता कि कितनी राशि, किसके द्वारा और किस बैंक में जमा है।',
    'home.p1_f': 'लाइव स्थिति वाला एक केंद्रीय रजिस्टर',
    'home.p2_t': 'परिपक्वता की तिथियाँ अनदेखी रह जाती हैं',
    'home.p2_d': 'बिना नवीनीकरण के परिपक्व हुई एफडीआर किसी की सुरक्षा नहीं करती — और प्रायः महीनों बाद निरीक्षण के समय इसका पता चलता है।',
    'home.p2_f': 'परिपक्वता से पहले अनुस्मारक, अनदेखी पर एस्केलेशन',
    'home.p3_t': 'जिन रसीदों का सत्यापन संभव नहीं',
    'home.p3_d': 'छपी हुई रसीद में बदलाव या उसका दोबारा उपयोग किया जा सकता है। पुष्टि के लिए बैंक को पत्र और फ़ोन करने पड़ते हैं, और समय-पूर्व बंद जमा या हटाया गया ग्रहणाधिकार पकड़ में नहीं आता।',
    'home.p3_f': 'बैंक-हस्ताक्षरित क्यूआर की जाँच सेकंडों में',
    'home.p4_t': 'धीमी और अपारदर्शी वापसी',
    'home.p4_d': 'संस्थान महीनों तक रिलीज़ की प्रतीक्षा करते हैं, न यह पता होता है कि फ़ाइल कहाँ है, न यह कि किस स्तर पर कितना समय लगा।',
    'home.p4_f': 'निर्धारित समय-सीमा के साथ समयबद्ध रिलीज़',

    'home.how_eyebrow': 'यह कैसे काम करता है',
    'home.how_title': 'रसीद से रिलीज़ तक, एक ही जीवनचक्र',
    'home.how_lead': 'हर जमा इन्हीं पाँच चरणों से गुज़रती है, और हर चरण दर्ज होता है।',
    'home.s1_t': 'प्रस्तुत करें', 'home.s1_w': 'संस्थान',
    'home.s1_d': 'संस्थान रसीद अपलोड करता है; पीडीएफ़ और उसके क्यूआर कोड से फ़ॉर्म स्वतः भर जाता है।',
    'home.s2_t': 'सत्यापन', 'home.s2_w': 'एआईसीटीई अधिकारी + बैंक',
    'home.s2_d': 'बैंक के हस्ताक्षर की जाँच होती है, बैंक स्थिति और ग्रहणाधिकार की पुष्टि करता है और अधिकारी उसे स्वीकार करते हैं।',
    'home.s3_t': 'निगरानी', 'home.s3_w': 'पोर्टल, हर रात',
    'home.s3_d': 'हर जमा की बैंक से रात्रिकालीन पुनः जाँच होती है और परिपक्वता से काफ़ी पहले अनुस्मारक भेजे जाते हैं।',
    'home.s4_t': 'नवीनीकरण', 'home.s4_w': 'संस्थान + बैंक',
    'home.s4_d': 'नवीनीकृत रसीद पुरानी रसीद का स्थान लेती है, जिससे सुरक्षा बिना किसी अंतराल के जारी रहती है।',
    'home.s5_t': 'रिलीज़', 'home.s5_w': 'सक्षम प्राधिकारी',
    'home.s5_d': 'समयबद्ध अनुमोदन शृंखला एक हस्ताक्षरित रिलीज़ आदेश (एनओसी) पर पूरी होती है, जिसे कोई भी सत्यापित कर सकता है।',

    'home.feat_eyebrow': 'इसे क्या अलग बनाता है',
    'home.feat_title': 'वह पकड़ने के लिए बना जो काग़ज़ से छूट जाता है',
    'home.feat_lead': 'यह केवल डिजिटल फ़ाइल-अलमारी नहीं है: पोर्टल हर जमा की वास्तविकता प्रमाणित करता है, प्रतिदिन उस पर नज़र रखता है और बताता है कि जोखिम कहाँ है।',
    'home.new': 'नया',
    'home.f1_t': 'बैंक-हस्ताक्षरित क्यूआर रसीदें',
    'home.f1_d': 'हर रसीद पर बैंक द्वारा डिजिटल रूप से हस्ताक्षरित (Ed25519) क्यूआर कोड होता है। एक अंक भी बदलें तो सत्यापन विफल हो जाता है।',
    'home.f2_t': 'स्मार्ट रसीद पठन',
    'home.f2_d': 'पीडीएफ़ का पाठ और क्यूआर पढ़कर फ़ॉर्म भरता है, उसका मिलान करता है और छेड़छाड़ या कहीं और उपयोग हो चुकी रसीद को चिह्नित करता है।',
    'home.f3_t': 'विश्वास सीढ़ी',
    'home.f3_d': 'दावा → दस्तावेज़ मिलान → बैंक सत्यापित: हर जमा दिखाती है कि वह कितनी प्रमाणित हो चुकी है।',
    'home.f4_t': 'जोखिम-क्रमित सत्यापन कतार',
    'home.f4_d': 'अधिकारी सबसे जोखिमपूर्ण प्रस्तुतियों से शुरुआत करते हैं, और हर अंक के साथ सरल भाषा में कारण दिए जाते हैं।',
    'home.f5_t': 'सुरक्षा-अंतर डैशबोर्ड',
    'home.f5_d': 'वह राशि दिखाता है जो इस समय एआईसीटीई की सुरक्षा नहीं कर रही, साथ में आगामी परिपक्वताओं का कैलेंडर हीटमैप।',
    'home.f6_t': 'दोहराव एवं पुनः उपयोग की पहचान',
    'home.f6_d': 'दो संस्थानों द्वारा, या एक ही संस्थान द्वारा दो बार प्रस्तुत की गई एक ही एफडीआर अपलोड होते ही पकड़ी जाती है।',
    'home.f7_t': 'बैंक एपीआई और रात्रिकालीन पुनः जाँच',
    'home.f7_d': 'बैंक एपीआई के माध्यम से स्थिति और ग्रहणाधिकार की पुष्टि करते हैं; रात्रिकालीन जाँच समय-पूर्व बंद जमा और हटाए गए ग्रहणाधिकार पकड़ती है।',
    'home.f8_t': 'रिलीज़ समय-सीमा और हस्ताक्षरित एनओसी',
    'home.f8_d': 'रिलीज़ के हर चरण की समय-सीमा है, अड़चनें मापी जाती हैं, और अंतिम एनओसी हस्ताक्षरित तथा सार्वजनिक रूप से सत्यापन योग्य है।',
    'home.f9_t': 'छेड़छाड़-रोधी ऑडिट ट्रेल',
    'home.f9_d': 'हर कार्रवाई पिछली कार्रवाई से हैश-शृंखला द्वारा जुड़ी है; एक क्लिक से सिद्ध होता है कि कुछ भी बदला नहीं गया।',
    'home.also': 'साथ ही उपलब्ध',
    'home.a1': 'सामान्य भाषा में खोज',
    'home.a2': 'एस्केलेशन सीढ़ी — इन-ऐप, ईमेल, एसएमएस',
    'home.a3': 'डेमो घड़ी',
    'home.a4': 'English / हिंदी',
    'home.a5': 'पाठ आकार, उच्च कंट्रास्ट, कीबोर्ड सुलभता',

    'home.trust_eyebrow': 'विश्वास सीढ़ी',
    'home.trust_title': 'यह जमा कितनी प्रमाणित हो चुकी है?',
    'home.trust_lead': 'केवल "सत्यापित / असत्यापित" मुहर के स्थान पर हर जमा तीन पायदान चढ़ती है। यह पायदान हर जगह दिखता है — अधिकारी की कतार, रजिस्टर और संस्थान के अपने डैशबोर्ड पर।',
    'home.l0_d': 'संस्थान ने विवरण दर्ज किया है। अभी कोई जाँच नहीं हुई है।',
    'home.l1_d': 'अपलोड की गई रसीद फ़ॉर्म से मेल खाती है — संख्याएँ, राशि और तिथियाँ पीडीएफ़ और क्यूआर से पढ़ी गई हैं।',
    'home.l2_d': 'बैंक के हस्ताक्षर वैध हैं और बैंक पुष्टि करता है कि जमा सक्रिय है तथा एआईसीटीई के पक्ष में ग्रहणाधिकार अंकित है।',
    'home.flag_note': 'लाल “चिह्नित” संकेत किसी भी पायदान पर लग सकता है — जैसे दोहराई गई रसीद, असंगति, या बैंक में हटाया गया ग्रहणाधिकार।',

    'home.roles_eyebrow': 'कौन उपयोग करता है',
    'home.roles_title': 'चार भूमिकाएँ, एक साझा अभिलेख',
    'home.roles_lead': 'हर उपयोगकर्ता को वही दिखता है जो उसकी भूमिका के लिए आवश्यक है — और हर कार्रवाई हस्ताक्षरित, भूमिका-जाँची और दर्ज होती है।',
    'home.try_role': 'यह भूमिका आज़माएँ',
    'home.r_inst_d': 'एआईसीटीई-अनुमोदित संस्थान के कुलसचिव या प्राचार्य',
    'home.r_inst_1': 'स्वतः भरने वाले फ़ॉर्म से एफडीआर प्रस्तुत करें',
    'home.r_inst_2': 'हर जमा की स्थिति और विश्वास स्तर देखें',
    'home.r_inst_3': 'परिपक्वता से काफ़ी पहले अनुस्मारक पाएँ',
    'home.r_inst_4': 'रिलीज़ का अनुरोध करें और हर चरण पर नज़र रखें',
    'home.r_off_d': 'सत्यापन अधिकारी, एआईसीटीई विनियमन ब्यूरो',
    'home.r_off_1': 'जोखिम-क्रमित सत्यापन कतार पर कार्य करें',
    'home.r_off_2': 'दावा, रसीद, क्यूआर और बैंक मानों की तुलना करें',
    'home.r_off_3': 'असंगति दर्ज करें या जमा स्वीकार करें',
    'home.r_off_4': 'सामान्य भाषा में रजिस्टर खोजें',
    'home.r_auth_d': 'निदेशक, जो रिलीज़ अनुमोदित करते हैं और एस्केलेशन प्राप्त करते हैं',
    'home.r_auth_1': 'पूरे देश का सुरक्षा-अंतर और जोखिम देखें',
    'home.r_auth_2': 'रिलीज़ अनुरोध अनुमोदित करें या लौटाएँ',
    'home.r_auth_3': 'समय-सीमा चूकने पर एस्केलेशन प्राप्त करें',
    'home.r_auth_4': 'ऑडिट ट्रेल की अखंडता जाँचें',
    'home.r_bank_d': 'सहभागी बैंक की शाखा के अधिकारी',
    'home.r_bank_1': 'हस्ताक्षरित क्यूआर और एआईसीटीई ग्रहणाधिकार के साथ एफडीआर जारी करें',
    'home.r_bank_2': 'एपीआई के माध्यम से सत्यापन अनुरोधों का उत्तर दें',
    'home.r_bank_3': 'ग्रहणाधिकार अंकित करें या हटाएँ, जमा नवीनीकृत या बंद करें',
    'home.r_bank_4': 'बैंक की सार्वजनिक हस्ताक्षर कुंजी प्रकाशित करें',

    'home.j_eyebrow': 'निर्णायकों के लिए',
    'home.j_title': 'दस मिनट में पूरी यात्रा देखें',
    'home.j_text': 'डेमो गाइड तैयार परिदृश्यों से होकर ले जाती है — पकड़ी गई जाली रसीद, एस्केलेट हुई परिपक्वता, अनुमोदित रिलीज़ — और हर भूमिका के लिए एक क्लिक में साइन इन।',
    'home.j_demo': 'डेमो गाइड खोलें',
    'home.j_login': 'डेमो खाते से साइन इन करें',
    'home.j_accounts': 'डेमो खाते',
    'home.j_pw': 'सभी खातों का पासवर्ड:',

    'home.faq_eyebrow': 'प्रश्न',
    'home.faq_title': 'अक्सर पूछे जाने वाले प्रश्न',
    'home.q1': 'सुरक्षा जमा क्या है और एआईसीटीई इसे क्यों रखती है?',
    'home.a1x': 'एआईसीटीई द्वारा अनुमोदित संस्थान एक सुरक्षा जमा रखते हैं, सामान्यतः एआईसीटीई के पक्ष में गिरवी रखी सावधि जमा रसीद (एफडीआर) के रूप में। यदि संस्थान बंद हो जाए या अपने दायित्व पूरे न करे तो यह छात्रों और परिषद के हितों की रक्षा करती है, और शर्तें पूरी होने पर रिलीज़ की जाती है।',
    'home.q2': 'नकद जमा के स्थान पर एफडीआर क्यों?',
    'home.a2x': 'गिरवी रहते हुए भी एफडीआर पर संस्थान को ब्याज मिलता रहता है। एआईसीटीई स्वयं राशि नहीं रखती — उसका जमा पर ग्रहणाधिकार होता है, जिससे बैंक एआईसीटीई की सहमति के बिना भुगतान नहीं कर सकता।',
    'home.q3': '“एआईसीटीई के पक्ष में ग्रहणाधिकार अंकित” का क्या अर्थ है?',
    'home.a3x': 'ग्रहणाधिकार बैंक का वह अभिलेख है जो बताता है कि जमा पर एआईसीटीई का दावा है। इसके सक्रिय रहते जमा समय से पहले बंद नहीं की जा सकती और न ही निकाली जा सकती है। यदि कोई बैंक ग्रहणाधिकार हटाता है, तो रात्रिकालीन जाँच अगली सुबह इसे चिह्नित कर देती है।',
    'home.q4': 'सत्यापन कैसे होता है?',
    'home.a4x': 'बैंक रसीद के विवरण पर अपनी निजी कुंजी से हस्ताक्षर करता है और उन्हें क्यूआर कोड के रूप में छापता है। कोई भी सत्यापन पृष्ठ पर रसीद स्कैन या अपलोड कर सकता है: पोर्टल बैंक की पंजीकृत सार्वजनिक कुंजी से हस्ताक्षर जाँचता है और बैंक की लाइव स्थिति दिखाता है। छपे हुए एक अंक में भी बदलाव होने पर जाँच विफल हो जाती है।',
    'home.q5': 'मेरे संस्थान का डेटा कौन देख सकता है?',
    'home.a5x': 'जमा का विवरण केवल संस्थान, एआईसीटीई अधिकारियों, सक्षम प्राधिकारी और जारीकर्ता बैंक को दिखता है — प्रत्येक को उतना ही जितना उसकी भूमिका के लिए आवश्यक है। सार्वजनिक सत्यापन पृष्ठ केवल वही दिखाता है जो रसीद पर छपा है और यह कि वह असली है या नहीं। हर देखने और बदलने की कार्रवाई ऑडिट ट्रेल में दर्ज होती है।',
    'home.q6': 'क्या यह एआईसीटीई का आधिकारिक पोर्टल है?',
    'home.a6x': 'नहीं। निधि कवच स्मार्ट इंडिया हैकाथॉन 2026 (समस्या विवरण SIH26265) के लिए बनाया गया एक कार्यशील प्रोटोटाइप है। दिखाए गए सभी संस्थान, बैंक, व्यक्ति और राशियाँ काल्पनिक डेमो डेटा हैं।',
    'home.notice_t': 'प्रोटोटाइप सूचना',
    'home.notice': 'यह स्मार्ट इंडिया हैकाथॉन 2026 का प्रोटोटाइप है। यह भारत सरकार या एआईसीटीई की आधिकारिक वेबसाइट नहीं है, और इस पर दिखाया गया सारा डेटा काल्पनिक है।',
  },
});

await initPage({ roles: null, active: 'home' });

// icons on static markup (CTAs, hero points)
$$('[data-ic]').forEach((n) => n.insertAdjacentHTML('afterbegin', icon(n.dataset.ic, 18)));

const MATURES_IN = 40;
const today = new Date();
const isoOffset = (days) => { const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + days); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

/* ---------------------------------------------------------------- hero illustration */
function renderArt() {
  const box = $('#receipt-art');
  box.setAttribute('role', 'img');
  box.setAttribute('aria-label', t('home.art_label'));
  const field = (label, value, cls = 'rc-value') => `<div class="rc-field"><div class="rc-label">${esc(label)}</div><div class="${cls}">${value}</div></div>`;
  box.innerHTML = `
    <div class="paper-back" aria-hidden="true"></div>
    <div class="paper-back b2" aria-hidden="true"></div>
    <div class="lp-receipt" aria-hidden="true">
      <div class="rc-band">
        <div>
          <div class="rc-bank">${icon('bank', 18)} ${esc(t('home.rc_bank'))}</div>
          <div class="rc-kind">${esc(t('home.rc_kind'))}</div>
        </div>
        <span class="rc-specimen">${esc(t('home.rc_specimen'))}</span>
      </div>
      <div class="rc-body">
        <div>
          ${field(t('home.rc_holder_l'), esc(t('home.rc_holder')))}
          ${field(t('home.rc_amount_l'), esc(fmtINR(5000000)), 'rc-amount')}
          ${field(t('home.rc_fdr_l'), '<span class="mono">DNB25FD004512</span>')}
          <div class="rc-dates">
            ${field(t('home.rc_issue_l'), esc(fmtDate(isoOffset(MATURES_IN - 365))))}
            ${field(t('home.rc_mat_l'), esc(fmtDate(isoOffset(MATURES_IN))))}
          </div>
        </div>
        <div class="rc-qr">
          <div class="qr-box">${icon('qr', 84)}</div>
          <div class="qr-cap">${esc(t('home.rc_qr_cap')).replace('\n', '<br>')}</div>
        </div>
      </div>
      <div class="rc-foot">
        <span class="lien">${icon('lock', 15)} ${esc(t('home.rc_lien'))}</span>
        <span class="mono">${icon('key', 14)} ${esc(t('home.rc_key'))}</span>
      </div>
    </div>
    <div class="lp-float f-verified" aria-hidden="true">${trustBadge(2)}</div>
    <div class="lp-float f-risk" aria-hidden="true"><span class="lp-chip">${icon('target', 16)} ${esc(t('home.chip_risk'))} ${riskBadge(18)} <span class="muted">${esc(t('risk.low'))}</span></span></div>
    <div class="lp-float f-mature" aria-hidden="true"><span class="lp-chip warn">${icon('clock', 16)} ${esc(t('home.chip_mature', { n: MATURES_IN }))}</span></div>`;
}

/* ---------------------------------------------------------------- live counters */
let stats;          // undefined = loading, null = failed, object = loaded
function renderStats() {
  const grid = $('#stats');
  const s = stats;
  const v = (fn) => (s === undefined ? null : (s ? fn(s) : '—'));
  const items = [
    ['building', '', 'home.st_inst', v((x) => fmtNum(x.institutions)), t('home.st_inst_s')],
    ['shield-check', 'green', 'home.st_fdrs', v((x) => fmtNum(x.fdrs_active)), t('home.st_fdrs_s')],
    ['rupee', 'saffron', 'home.st_amount', v((x) => fmtINRShort(x.amount_protected)), s && s.banks ? t('home.st_amount_s', { n: s.banks }) : t('home.st_amount_s0')],
    ['bank', 'teal', 'home.st_ver', v((x) => `${fmtNum(x.bank_verified_pct, 1)}%`), t('home.st_ver_s')],
    ['clock', 'violet', 'home.st_days', v((x) => t('home.st_days_v', { n: fmtNum(x.avg_verification_days, 1) })), t('home.st_days_s')],
  ];
  mount(grid, items.map(([ic, tone, label, value, sub]) => el('div', { class: 'lp-stat' },
    el('div', { class: `feature-icon ${tone}`, html: icon(ic, 20) }),
    el('div', { style: 'min-width:0' },
      value === null ? el('div', { class: 'skeleton', 'aria-hidden': 'true' }) : el('div', { class: 'v' }, value),
      el('div', { class: 'l' }, t(label)),
      el('div', { class: 's' }, sub)))));
  grid.setAttribute('aria-busy', s === undefined ? 'true' : 'false');
  $('#stats-asof').textContent = s && s.today ? `· ${t('home.st_asof', { d: fmtDate(s.today) })}` : '';
}
async function loadStats() {
  stats = undefined;
  renderStats();
  try { stats = await api.get('/public/stats'); } catch (e) { stats = null; }
  renderStats();
}

/* ---------------------------------------------------------------- static sections */
const PROBLEMS = [['p1', 'layers', 'danger'], ['p2', 'clock', 'saffron'], ['p3', 'shield-alert', 'danger'], ['p4', 'hourglass', 'saffron']];
const STEPS = [['s1', 'upload'], ['s2', 'shield-check'], ['s3', 'calendar'], ['s4', 'refresh'], ['s5', 'unlock']];
const FEATURES = [
  ['f1', 'qr', '', true], ['f2', 'sparkles', 'saffron', true], ['f3', 'shield-check', 'green', true],
  ['f4', 'target', 'danger'], ['f5', 'wallet', 'teal'], ['f6', 'copy', 'violet'],
  ['f7', 'bank', ''], ['f8', 'stamp', 'saffron'], ['f9', 'link', 'green'],
];
const ALSO = [['a1', 'search'], ['a2', 'bell'], ['a3', 'clock'], ['a4', 'globe'], ['a5', 'contrast']];
const RUNGS = [['l0', 0, 'user'], ['l1', 1, 'file-check'], ['l2', 2, 'shield-check']];
const ROLES = [
  ['institution', 'r_inst', 'building', 'saffron', 'kaveri@nidhikavach.demo'],
  ['officer', 'r_off', 'shield-check', '', 'officer@nidhikavach.demo'],
  ['authority', 'r_auth', 'stamp', 'green', 'director@nidhikavach.demo'],
  ['bank', 'r_bank', 'bank', 'teal', 'bank.bsb@nidhikavach.demo'],
];
const FAQ = [['1', 'wallet'], ['2', 'file-text'], ['3', 'lock'], ['4', 'qr'], ['5', 'eye'], ['6', 'help']];

function renderSections() {
  mount($('#problems'), PROBLEMS.map(([k, ic, tone]) => el('article', { class: 'card lp-problem' },
    el('div', { class: `feature-icon ${tone}`, html: icon(ic, 22) }),
    el('h3', {}, t(`home.${k}_t`)),
    el('p', {}, t(`home.${k}_d`)),
    el('div', { class: 'fix', html: `${icon('check-circle', 16)}<span>${esc(t(`home.${k}_f`))}</span>` }))));

  mount($('#steps'), STEPS.map(([k, ic], i) => el('li', { class: 'lp-step' },
    el('div', { class: 'circle', html: `${icon(ic, 28)}<span class="num">${i + 1}</span>` }),
    el('div', {},
      el('h3', {}, t(`home.${k}_t`)),
      el('div', { class: 'who' }, el('span', { class: 'badge b-primary' }, t(`home.${k}_w`))),
      el('p', {}, t(`home.${k}_d`))))));

  mount($('#features-grid'), FEATURES.map(([k, ic, tone, isNew]) => el('article', { class: `card lp-feature${isNew ? ' featured accent-top' : ''}` },
    el('div', { class: 'top' },
      el('div', { class: `feature-icon ${tone}`, html: icon(ic, 22) }),
      isNew ? el('span', { class: 'tag-new' }, t('home.new')) : null),
    el('h3', {}, t(`home.${k}_t`)),
    el('p', {}, t(`home.${k}_d`)))));

  mount($('#also'),
    el('span', { class: 'lbl', html: `${icon('plus', 16)} ${esc(t('home.also'))}` }),
    el('div', { class: 'chips' }, ALSO.map(([k, ic]) => el('span', { class: 'chip', html: `${icon(ic, 14)} ${esc(t(`home.${k}`))}` }))));

  $('#trust-badges').innerHTML = [trustBadge(0), trustBadge(1), trustBadge(2)].join(`<span class="muted" aria-hidden="true">${icon('arrow-right', 14)}</span>`);
  $('#flag-note').innerHTML = `<span class="badge trust-flag">${icon('flag', 12)}${esc(t('trust.flagged'))}</span><span>${esc(t('home.flag_note'))}</span>`;
  mount($('#ladder'), RUNGS.map(([cls, lv, ic]) => el('div', { class: `lp-rung ${cls}` },
    el('span', { class: 'lvl', 'aria-hidden': 'true' }, String(lv)),
    el('div', { class: 'ric', html: icon(ic, 22) }),
    el('h3', {}, `${lv} · ${t(`trust.${lv}`)}`),
    el('p', {}, t(`home.${cls}_d`)))));

  mount($('#roles-grid'), ROLES.map(([role, k, ic, tone, email]) => el('article', { class: 'card lp-role' },
    el('div', { class: 'card-body' },
      el('div', { class: `feature-icon ${tone}`, html: icon(ic, 22) }),
      el('h3', {}, t(`role.${role}`)),
      el('p', { class: 'desc' }, t(`home.${k}_d`)),
      el('ul', {}, [1, 2, 3, 4].map((n) => el('li', { html: `${icon('check', 15)}<span>${esc(t(`home.${k}_${n}`))}</span>` })))),
    el('div', { class: 'card-foot' },
      el('span', { class: 'mono' }, email),
      el('a', { class: 'btn sm secondary', href: site(`login.html?as=${encodeURIComponent(email)}`), html: `${esc(t('home.try_role'))} ${icon('arrow-right', 14)}` })))));

  const accounts = [['officer', 'officer@nidhikavach.demo'], ['authority', 'director@nidhikavach.demo'], ['institution', 'kaveri@nidhikavach.demo'], ['bank', 'bank.bsb@nidhikavach.demo']];
  mount($('#judges-box'),
    el('div', { style: 'position:relative;z-index:1' },
      el('div', { class: 'eyebrow' }, t('home.j_eyebrow')),
      el('h2', { id: 'judges-title' }, t('home.j_title')),
      el('p', {}, t('home.j_text')),
      el('div', { class: 'lp-cta' },
        el('a', { class: 'btn saffron lg', href: site('demo.html'), html: `${icon('play', 18)} ${esc(t('home.j_demo'))}` }),
        el('a', { class: 'btn secondary lg', href: site('login.html'), html: `${icon('login', 18)} ${esc(t('home.j_login'))}` }))),
    el('div', { class: 'lp-accounts' },
      el('div', { class: 'h' }, t('home.j_accounts')),
      el('ul', {}, accounts.map(([r, e]) => el('li', {}, el('span', {}, t(`role.${r}`)), el('span', { class: 'mono' }, e)))),
      el('div', { class: 'pw', html: `${esc(t('home.j_pw'))} <span class="kbd">Demo@2026</span>` })));

  mount($('#faq-list'), FAQ.map(([n, ic], i) => el('details', { class: 'lp-faq', open: i === 0 ? '' : undefined },
    el('summary', { html: `<span class="q-ic">${icon(ic, 17)}</span><span class="q-text">${esc(t(`home.q${n}`))}</span><span class="chev">${icon('chevron-down', 18)}</span>` }),
    el('div', { class: 'a' }, el('p', {}, t(`home.a${n}x`))))));

  $('#notice').innerHTML = `${icon('info', 18)}<div><div class="a-title">${esc(t('home.notice_t'))}</div>${esc(t('home.notice'))}</div>`;
}

function renderAll() { renderArt(); renderSections(); renderStats(); }
renderAll();
loadStats();
onLang(renderAll);
