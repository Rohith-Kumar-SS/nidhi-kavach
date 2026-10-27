// Public verification: scan QR (camera + jsQR), upload receipt / NOC, paste signed code, check reference number.
// Result card shows signature, decoded details, live bank status and portal record; plus how it works and key registry.
import { initPage } from './assets/js/layout.js';
import { api } from './assets/js/api.js';
import { t, extend, onLang, getLang } from './assets/js/i18n.js';
import {
  $, $$, el, esc, icon, mount, loading, errorState, emptyState, withBusy, toast, getParam, renderTable, tabs, dl,
  fmtINR, fmtDate, fmtDateTime, fmtBytes, statusBadge, releaseBadge, trustBadge, lienBadge, maturityChip, copyText,
} from './assets/js/ui.js';

extend({
  en: {
    'vfy.title': 'Verify an FDR receipt or release order',
    'vfy.subtitle': 'Check that a bank-signed FDR receipt or a portal-signed release order (NOC) is genuine — no sign-in needed',
    'vfy.tool_title': 'Check a document',
    'vfy.tool_sub': 'No sign-in needed',
    'vfy.result_aria': 'Verification result',
    'vfy.tab_scan': 'Scan QR with camera',
    'vfy.tab_upload': 'Upload receipt / NOC',
    'vfy.tab_paste': 'Paste code',
    'vfy.tab_ref': 'Check reference number',

    'vfy.scan_lead': 'Hold the QR code on the receipt or release order inside the frame. The camera stops as soon as a code is read.',
    'vfy.cam_idle_t': 'Camera is off',
    'vfy.cam_idle_d': 'Start the camera to scan. Nothing is recorded or uploaded — only the decoded text is checked.',
    'vfy.cam_start': 'Start camera',
    'vfy.cam_stop': 'Stop camera',
    'vfy.cam_starting': 'Starting the camera…',
    'vfy.cam_scanning': 'Looking for a QR code… keep the receipt steady and well lit.',
    'vfy.cam_found': 'QR code read — checking the signature.',
    'vfy.cam_unavailable': 'This browser cannot use a camera here (a secure https connection is needed). Upload the receipt or paste the code instead.',
    'vfy.cam_denied': 'Camera permission was denied. Allow camera access in your browser settings, or upload the receipt instead.',
    'vfy.cam_notfound': 'No camera was found on this device. Upload the receipt or paste the code instead.',
    'vfy.cam_busy': 'The camera is being used by another app. Close it and try again.',
    'vfy.cam_failed': 'The camera could not be started. Upload the receipt or paste the code instead.',
    'vfy.cam_noqr_lib': 'The QR reader did not load. Refresh the page or upload the receipt instead.',
    'vfy.use_upload': 'Upload instead',

    'vfy.upload_lead': 'Upload the original PDF issued by the bank or the portal, or a clear photo of the printed copy.',
    'vfy.drop_t': 'Drop the receipt or NOC here',
    'vfy.drop_or': 'or click to choose a file',
    'vfy.drop_types': 'PDF, PNG or JPG · up to 10 MB',
    'vfy.drop_aria': 'Choose a receipt or NOC file to verify',
    'vfy.reading': 'Reading the QR code and checking the signature…',
    'vfy.choose_other': 'Choose another file',
    'vfy.check_again': 'Check again',
    'vfy.bad_type': 'Please choose a PDF, PNG or JPG file.',
    'vfy.too_big': 'This file is larger than 10 MB. Upload a smaller copy.',
    'vfy.tip1': 'PDFs are also checked for edits made after issue.',
    'vfy.tip2': 'For photos, keep the whole QR code in view and avoid glare.',
    'vfy.tip3': 'Files are only used for this check.',

    'vfy.paste_lead': 'Paste the text inside the QR code. It starts with NK1. — any QR scanner app can show it.',
    'vfy.code_label': 'Signed code',
    'vfy.code_ph': 'NK1.FDR.…',
    'vfy.code_hint': 'Nothing else is needed — the code carries the signed details.',
    'vfy.code_empty': 'Paste the signed code first.',
    'vfy.verify': 'Verify',
    'vfy.clear': 'Clear',

    'vfy.ref_lead': 'Check the public status of a deposit or release order by its portal reference number.',
    'vfy.ref_label': 'Reference number',
    'vfy.ref_ph': 'NK-FDR-2026-00012 or NK-REL-2026-00003',
    'vfy.ref_hint': 'Shows only the status and an amount range — no personal details.',
    'vfy.ref_empty': 'Enter a reference number.',
    'vfy.ref_format': 'Enter a reference like NK-FDR-2026-00012 (deposit) or NK-REL-2026-00003 (release order).',
    'vfy.ref_check': 'Check status',

    'vfy.ph_title': 'Your result will appear here',
    'vfy.ph_sub': 'Every check answers four questions:',
    'vfy.ph1_t': 'Is it really signed?', 'vfy.ph1_d': 'The QR must carry a valid signature from a registered bank or the portal.',
    'vfy.ph2_t': 'Was the printed copy changed?', 'vfy.ph2_d': 'For uploaded PDFs, the printed figures are compared with the signed QR.',
    'vfy.ph3_t': 'Is the deposit still live?', 'vfy.ph3_d': 'The bank\'s ledger is asked whether it is active and under lien to AICTE.',
    'vfy.ph4_t': 'Is it on the portal?', 'vfy.ph4_d': 'The portal record, its status and its trust level are shown.',

    'vfy.checking': 'Checking the signature…',
    'vfy.genuine': 'Genuine — digitally signed by {name} (key {key})',
    'vfy.genuine_short': 'Genuine document',
    'vfy.altered_t': 'Altered copy — do not accept',
    'vfy.altered_s': 'The QR code is genuinely signed by {name}, but the printed details were changed after issue. Only the signed details below are authentic.',
    'vfy.invalid_t': 'Not genuine',
    'vfy.noqr_t': 'No QR code could be read',
    'vfy.kind.FDR': 'Fixed deposit receipt',
    'vfy.kind.NOC': 'Release order / NOC',
    'vfy.kind.BVR': 'Bank verification response',
    'vfy.checked_at': 'Checked {d}',
    'vfy.source.camera': 'scanned with camera',
    'vfy.source.file': 'from uploaded file',
    'vfy.source.paste': 'from pasted code',
    'vfy.source.link': 'from link',
    'vfy.live': 'Live status',
    'vfy.bank_status': 'Bank ledger',
    'vfy.portal_record': 'Portal record',
    'vfy.bs.active': 'Active', 'vfy.bs.matured': 'Matured', 'vfy.bs.closed': 'Closed', 'vfy.bs.pre_closed': 'Closed before maturity', 'vfy.bs.preclosed': 'Closed before maturity', 'vfy.bs.renewed': 'Renewed',
    'vfy.bs_lien': 'Lien',
    'vfy.bs_in_favour': 'In favour of {who}',
    'vfy.bs_mismatch': 'The bank ledger differs from the signed details.',
    'vfy.bs_notfound': 'Not found in the bank ledger',
    'vfy.bs_closed_on': 'Closed on {d}',
    'vfy.pr_notfound': 'Not recorded on the portal',
    'vfy.pr_notfound_d': 'The document is genuine but has not been submitted to Nidhi Kavach.',
    'vfy.details_signed': 'Signed details',
    'vfy.details_claimed': 'What the code claims (not verified)',
    'vfy.f_holder': 'Deposit holder',
    'vfy.f_place': 'Location',
    'vfy.f_signed_at': 'Signed on',
    'vfy.f_release_ref': 'Release order',
    'vfy.f_fdr_ref': 'Deposit reference',
    'vfy.f_noc_date': 'Order date',
    'vfy.f_request_type': 'Request type',
    'vfy.f_kind': 'Record type',
    'vfy.f_amount_band': 'Amount range',
    'vfy.f_released_on': 'Released on',
    'vfy.lien_yes': 'Marked in favour of AICTE',
    'vfy.lien_no': 'Not marked',
    'vfy.compare': 'Printed copy vs signed QR',
    'vfy.c_field': 'Field',
    'vfy.c_printed': 'Printed on this copy',
    'vfy.c_signed': 'Signed by the issuer',
    'vfy.c.amount': 'Amount', 'vfy.c.fdr_number': 'FDR number', 'vfy.c.issue_date': 'Issue date', 'vfy.c.maturity_date': 'Maturity date', 'vfy.c.aicte_id': 'AICTE ID', 'vfy.c.release_ref': 'Release order',
    'vfy.flags': 'Warning signs found',
    'vfy.flag.TEXT_QR_CONFLICT': 'Printed details differ from the signed QR',
    'vfy.flag.PDF_INCREMENTAL_UPDATE': 'The PDF was modified after it was first created',
    'vfy.flag.EDITOR_PRODUCER': 'Saved with a PDF editing program',
    'vfy.doc_ok': 'The printed copy matches the signed QR.',
    'vfy.advice_ok': 'You may rely on the signed details. For a deposit, the live bank status above shows whether it still protects AICTE today.',
    'vfy.advice_bad': 'Do not accept this receipt; contact the issuing bank.',
    'vfy.advice_bad_t': 'What to do',
    'vfy.advice_altered': 'Do not accept this copy. Ask for the original from the issuing bank and report the altered copy to the AICTE Regulation Bureau.',
    'vfy.advice_noqr': 'Upload the original PDF or a sharper, well-lit photo, or paste the code from a QR scanner app.',
    'vfy.err_sig': 'The signature does not match. The code was altered, or it was not issued by the signer it names.',
    'vfy.err_notnk': 'This QR code is not a Nidhi Kavach signed code. It may be a plain QR printed to look official.',
    'vfy.err_unreadable': 'The code is damaged or incomplete, so its contents cannot be read.',
    'vfy.err_key': 'The code names signing key {key}, which is not registered with the portal.',
    'vfy.err_noqr': 'No QR code could be read from this file.',
    'vfy.verify_another': 'Verify another',
    'vfy.print': 'Print result',
    'vfy.ref_found_t': 'Reference found on the portal',
    'vfy.ref_found_s': '{ref} is recorded on Nidhi Kavach.',
    'vfy.ref_none_t': 'No record with this reference',
    'vfy.ref_none_s': 'No deposit or release order with reference {ref} is recorded on the portal.',
    'vfy.ref_none_adv': 'Check the number for typing mistakes. If a document quotes this reference, do not rely on it until the issuer confirms it.',
    'vfy.ref_note': 'A reference check confirms that the record exists. To confirm a paper document is genuine, scan or upload its QR code.',
    'vfy.kind_fdr': 'Security deposit (FDR)',
    'vfy.kind_release': 'Release order',

    'vfy.how_eyebrow': 'Behind the tick',
    'vfy.how_title': 'How verification works',
    'vfy.h1_t': 'The bank signs', 'vfy.h1_d': 'When an FDR is issued, the bank signs its key details — number, amount, dates, holder, lien — with its private key (Ed25519). Only the bank holds that key.',
    'vfy.h2_t': 'A QR code goes on the receipt', 'vfy.h2_d': 'The signed details are printed on the receipt as a QR code, next to the human-readable text.',
    'vfy.h3_t': 'The portal checks it', 'vfy.h3_d': 'The portal checks the signature with the bank\'s registered public key and asks the bank for the live status. Changing even one digit breaks the signature.',
    'vfy.noc_note': 'Release orders (NOCs) issued by the portal are signed the same way with the portal\'s own key, so anyone can confirm a release before acting on it.',

    'vfy.keys_title': 'Registered signing keys',
    'vfy.keys_sub': 'Public keys the portal trusts. A code signed by any other key is rejected.',
    'vfy.keys_count': '{n} keys',
    'vfy.k_id': 'Key ID',
    'vfy.k_owner': 'Owner',
    'vfy.k_type': 'Type',
    'vfy.k_signs': 'Signs',
    'vfy.k_fp': 'Fingerprint',
    'vfy.k_reg': 'Registered',
    'vfy.k_bank': 'Bank',
    'vfy.k_portal': 'Portal',
    'vfy.k_copy': 'Copy public key of {key}',
    'vfy.k_copied': 'Public key of {key} copied.',
    'vfy.k_empty': 'No signing keys are registered yet',
    'vfy.sign.FDR': 'FDR receipts', 'vfy.sign.BVR': 'Bank responses', 'vfy.sign.NOC': 'Release orders',
  },
  hi: {
    'vfy.title': 'एफडीआर रसीद या रिलीज़ आदेश सत्यापित करें',
    'vfy.subtitle': 'जाँचें कि बैंक-हस्ताक्षरित एफडीआर रसीद या पोर्टल-हस्ताक्षरित रिलीज़ आदेश (एनओसी) असली है — साइन इन की आवश्यकता नहीं',
    'vfy.tool_title': 'दस्तावेज़ जाँचें',
    'vfy.tool_sub': 'साइन इन आवश्यक नहीं',
    'vfy.result_aria': 'सत्यापन परिणाम',
    'vfy.tab_scan': 'कैमरे से क्यूआर स्कैन करें',
    'vfy.tab_upload': 'रसीद / एनओसी अपलोड करें',
    'vfy.tab_paste': 'कोड चिपकाएँ',
    'vfy.tab_ref': 'संदर्भ संख्या जाँचें',

    'vfy.scan_lead': 'रसीद या रिलीज़ आदेश पर छपे क्यूआर कोड को फ़्रेम के भीतर रखें। कोड पढ़ते ही कैमरा बंद हो जाएगा।',
    'vfy.cam_idle_t': 'कैमरा बंद है',
    'vfy.cam_idle_d': 'स्कैन करने के लिए कैमरा चालू करें। कुछ भी रिकॉर्ड या अपलोड नहीं होता — केवल पढ़े गए पाठ की जाँच होती है।',
    'vfy.cam_start': 'कैमरा चालू करें',
    'vfy.cam_stop': 'कैमरा बंद करें',
    'vfy.cam_starting': 'कैमरा चालू हो रहा है…',
    'vfy.cam_scanning': 'क्यूआर कोड खोजा जा रहा है… रसीद को स्थिर और अच्छी रोशनी में रखें।',
    'vfy.cam_found': 'क्यूआर कोड पढ़ लिया गया — हस्ताक्षर की जाँच हो रही है।',
    'vfy.cam_unavailable': 'यह ब्राउज़र यहाँ कैमरे का उपयोग नहीं कर सकता (सुरक्षित https कनेक्शन आवश्यक है)। इसके स्थान पर रसीद अपलोड करें या कोड चिपकाएँ।',
    'vfy.cam_denied': 'कैमरे की अनुमति नहीं दी गई। ब्राउज़र सेटिंग्स में कैमरे की अनुमति दें, या रसीद अपलोड करें।',
    'vfy.cam_notfound': 'इस डिवाइस पर कोई कैमरा नहीं मिला। रसीद अपलोड करें या कोड चिपकाएँ।',
    'vfy.cam_busy': 'कैमरा किसी अन्य ऐप द्वारा उपयोग में है। उसे बंद करके पुनः प्रयास करें।',
    'vfy.cam_failed': 'कैमरा चालू नहीं हो सका। रसीद अपलोड करें या कोड चिपकाएँ।',
    'vfy.cam_noqr_lib': 'क्यूआर रीडर लोड नहीं हुआ। पृष्ठ रीफ़्रेश करें या रसीद अपलोड करें।',
    'vfy.use_upload': 'अपलोड करें',

    'vfy.upload_lead': 'बैंक या पोर्टल द्वारा जारी मूल पीडीएफ़, या छपी प्रति की स्पष्ट फ़ोटो अपलोड करें।',
    'vfy.drop_t': 'रसीद या एनओसी यहाँ छोड़ें',
    'vfy.drop_or': 'या फ़ाइल चुनने के लिए क्लिक करें',
    'vfy.drop_types': 'पीडीएफ़, पीएनजी या जेपीजी · अधिकतम 10 एमबी',
    'vfy.drop_aria': 'सत्यापन हेतु रसीद या एनओसी फ़ाइल चुनें',
    'vfy.reading': 'क्यूआर कोड पढ़ा जा रहा है और हस्ताक्षर की जाँच हो रही है…',
    'vfy.choose_other': 'दूसरी फ़ाइल चुनें',
    'vfy.check_again': 'पुनः जाँचें',
    'vfy.bad_type': 'कृपया पीडीएफ़, पीएनजी या जेपीजी फ़ाइल चुनें।',
    'vfy.too_big': 'यह फ़ाइल 10 एमबी से बड़ी है। छोटी प्रति अपलोड करें।',
    'vfy.tip1': 'पीडीएफ़ में जारी होने के बाद किए गए बदलावों की भी जाँच होती है।',
    'vfy.tip2': 'फ़ोटो में पूरा क्यूआर कोड दिखना चाहिए और चमक नहीं होनी चाहिए।',
    'vfy.tip3': 'फ़ाइल का उपयोग केवल इसी जाँच के लिए होता है।',

    'vfy.paste_lead': 'क्यूआर कोड के भीतर का पाठ चिपकाएँ। यह NK1. से शुरू होता है — कोई भी क्यूआर स्कैनर ऐप इसे दिखा सकता है।',
    'vfy.code_label': 'हस्ताक्षरित कोड',
    'vfy.code_ph': 'NK1.FDR.…',
    'vfy.code_hint': 'और कुछ आवश्यक नहीं — कोड में हस्ताक्षरित विवरण स्वयं होते हैं।',
    'vfy.code_empty': 'पहले हस्ताक्षरित कोड चिपकाएँ।',
    'vfy.verify': 'सत्यापित करें',
    'vfy.clear': 'साफ़ करें',

    'vfy.ref_lead': 'पोर्टल संदर्भ संख्या से किसी जमा या रिलीज़ आदेश की सार्वजनिक स्थिति जाँचें।',
    'vfy.ref_label': 'संदर्भ संख्या',
    'vfy.ref_ph': 'NK-FDR-2026-00012 या NK-REL-2026-00003',
    'vfy.ref_hint': 'केवल स्थिति और राशि की सीमा दिखाई जाती है — कोई व्यक्तिगत विवरण नहीं।',
    'vfy.ref_empty': 'संदर्भ संख्या दर्ज करें।',
    'vfy.ref_format': 'NK-FDR-2026-00012 (जमा) या NK-REL-2026-00003 (रिलीज़ आदेश) जैसी संदर्भ संख्या दर्ज करें।',
    'vfy.ref_check': 'स्थिति जाँचें',

    'vfy.ph_title': 'परिणाम यहाँ दिखाई देगा',
    'vfy.ph_sub': 'हर जाँच चार प्रश्नों का उत्तर देती है:',
    'vfy.ph1_t': 'क्या यह सचमुच हस्ताक्षरित है?', 'vfy.ph1_d': 'क्यूआर पर किसी पंजीकृत बैंक या पोर्टल का वैध हस्ताक्षर होना चाहिए।',
    'vfy.ph2_t': 'क्या छपी प्रति बदली गई?', 'vfy.ph2_d': 'अपलोड की गई पीडीएफ़ में छपे आँकड़ों का हस्ताक्षरित क्यूआर से मिलान किया जाता है।',
    'vfy.ph3_t': 'क्या जमा अभी भी सक्रिय है?', 'vfy.ph3_d': 'बैंक के खाता-बही से पूछा जाता है कि जमा सक्रिय है और एआईसीटीई के ग्रहणाधिकार में है या नहीं।',
    'vfy.ph4_t': 'क्या यह पोर्टल पर दर्ज है?', 'vfy.ph4_d': 'पोर्टल अभिलेख, उसकी स्थिति और विश्वास स्तर दिखाए जाते हैं।',

    'vfy.checking': 'हस्ताक्षर की जाँच हो रही है…',
    'vfy.genuine': 'असली — {name} द्वारा डिजिटल रूप से हस्ताक्षरित (कुंजी {key})',
    'vfy.genuine_short': 'असली दस्तावेज़',
    'vfy.altered_t': 'परिवर्तित प्रति — स्वीकार न करें',
    'vfy.altered_s': 'क्यूआर कोड पर {name} के वास्तविक हस्ताक्षर हैं, परंतु छपे विवरण जारी होने के बाद बदले गए हैं। केवल नीचे दिए हस्ताक्षरित विवरण प्रामाणिक हैं।',
    'vfy.invalid_t': 'असली नहीं',
    'vfy.noqr_t': 'कोई क्यूआर कोड नहीं पढ़ा जा सका',
    'vfy.kind.FDR': 'सावधि जमा रसीद',
    'vfy.kind.NOC': 'रिलीज़ आदेश / एनओसी',
    'vfy.kind.BVR': 'बैंक सत्यापन उत्तर',
    'vfy.checked_at': 'जाँच: {d}',
    'vfy.source.camera': 'कैमरे से स्कैन',
    'vfy.source.file': 'अपलोड की गई फ़ाइल से',
    'vfy.source.paste': 'चिपकाए गए कोड से',
    'vfy.source.link': 'लिंक से',
    'vfy.live': 'लाइव स्थिति',
    'vfy.bank_status': 'बैंक खाता-बही',
    'vfy.portal_record': 'पोर्टल अभिलेख',
    'vfy.bs.active': 'सक्रिय', 'vfy.bs.matured': 'परिपक्व', 'vfy.bs.closed': 'बंद', 'vfy.bs.pre_closed': 'परिपक्वता से पहले बंद', 'vfy.bs.preclosed': 'परिपक्वता से पहले बंद', 'vfy.bs.renewed': 'नवीनीकृत',
    'vfy.bs_lien': 'ग्रहणाधिकार',
    'vfy.bs_in_favour': '{who} के पक्ष में',
    'vfy.bs_mismatch': 'बैंक खाता-बही के विवरण हस्ताक्षरित विवरण से भिन्न हैं।',
    'vfy.bs_notfound': 'बैंक खाता-बही में नहीं मिला',
    'vfy.bs_closed_on': '{d} को बंद',
    'vfy.pr_notfound': 'पोर्टल पर दर्ज नहीं',
    'vfy.pr_notfound_d': 'दस्तावेज़ असली है, परंतु निधि कवच पर प्रस्तुत नहीं किया गया है।',
    'vfy.details_signed': 'हस्ताक्षरित विवरण',
    'vfy.details_claimed': 'कोड में किए गए दावे (असत्यापित)',
    'vfy.f_holder': 'जमाधारक',
    'vfy.f_place': 'स्थान',
    'vfy.f_signed_at': 'हस्ताक्षर तिथि',
    'vfy.f_release_ref': 'रिलीज़ आदेश',
    'vfy.f_fdr_ref': 'जमा संदर्भ',
    'vfy.f_noc_date': 'आदेश तिथि',
    'vfy.f_request_type': 'अनुरोध का प्रकार',
    'vfy.f_kind': 'अभिलेख का प्रकार',
    'vfy.f_amount_band': 'राशि की सीमा',
    'vfy.f_released_on': 'रिलीज़ तिथि',
    'vfy.lien_yes': 'एआईसीटीई के पक्ष में अंकित',
    'vfy.lien_no': 'अंकित नहीं',
    'vfy.compare': 'छपी प्रति बनाम हस्ताक्षरित क्यूआर',
    'vfy.c_field': 'विवरण',
    'vfy.c_printed': 'इस प्रति पर छपा',
    'vfy.c_signed': 'जारीकर्ता द्वारा हस्ताक्षरित',
    'vfy.c.amount': 'राशि', 'vfy.c.fdr_number': 'एफडीआर संख्या', 'vfy.c.issue_date': 'जारी करने की तिथि', 'vfy.c.maturity_date': 'परिपक्वता तिथि', 'vfy.c.aicte_id': 'एआईसीटीई आईडी', 'vfy.c.release_ref': 'रिलीज़ आदेश',
    'vfy.flags': 'मिले चेतावनी संकेत',
    'vfy.flag.TEXT_QR_CONFLICT': 'छपे विवरण हस्ताक्षरित क्यूआर से भिन्न हैं',
    'vfy.flag.PDF_INCREMENTAL_UPDATE': 'पीडीएफ़ बनने के बाद उसमें बदलाव किया गया',
    'vfy.flag.EDITOR_PRODUCER': 'पीडीएफ़ संपादन प्रोग्राम से सहेजी गई',
    'vfy.doc_ok': 'छपी प्रति हस्ताक्षरित क्यूआर से मेल खाती है।',
    'vfy.advice_ok': 'आप हस्ताक्षरित विवरण पर भरोसा कर सकते हैं। जमा के मामले में ऊपर दी गई लाइव बैंक स्थिति बताती है कि वह आज भी एआईसीटीई की सुरक्षा करती है या नहीं।',
    'vfy.advice_bad': 'इस रसीद को स्वीकार न करें; जारीकर्ता बैंक से संपर्क करें।',
    'vfy.advice_bad_t': 'क्या करें',
    'vfy.advice_altered': 'इस प्रति को स्वीकार न करें। जारीकर्ता बैंक से मूल प्रति माँगें और परिवर्तित प्रति की सूचना एआईसीटीई विनियमन ब्यूरो को दें।',
    'vfy.advice_noqr': 'मूल पीडीएफ़ या अधिक स्पष्ट, अच्छी रोशनी वाली फ़ोटो अपलोड करें, या क्यूआर स्कैनर ऐप से कोड चिपकाएँ।',
    'vfy.err_sig': 'हस्ताक्षर मेल नहीं खाते। कोड में बदलाव किया गया है, या इसे उस हस्ताक्षरकर्ता ने जारी नहीं किया जिसका नाम इसमें है।',
    'vfy.err_notnk': 'यह क्यूआर कोड निधि कवच का हस्ताक्षरित कोड नहीं है। संभव है कि इसे आधिकारिक दिखाने के लिए साधारण क्यूआर छापा गया हो।',
    'vfy.err_unreadable': 'कोड क्षतिग्रस्त या अधूरा है, इसलिए इसकी सामग्री पढ़ी नहीं जा सकती।',
    'vfy.err_key': 'कोड में हस्ताक्षर कुंजी {key} का उल्लेख है, जो पोर्टल पर पंजीकृत नहीं है।',
    'vfy.err_noqr': 'इस फ़ाइल से कोई क्यूआर कोड नहीं पढ़ा जा सका।',
    'vfy.verify_another': 'दूसरा दस्तावेज़ जाँचें',
    'vfy.print': 'परिणाम प्रिंट करें',
    'vfy.ref_found_t': 'संदर्भ पोर्टल पर मिला',
    'vfy.ref_found_s': '{ref} निधि कवच पर दर्ज है।',
    'vfy.ref_none_t': 'इस संदर्भ का कोई अभिलेख नहीं',
    'vfy.ref_none_s': 'संदर्भ {ref} वाला कोई जमा या रिलीज़ आदेश पोर्टल पर दर्ज नहीं है।',
    'vfy.ref_none_adv': 'संख्या में टंकण त्रुटि जाँचें। यदि कोई दस्तावेज़ इस संदर्भ का उल्लेख करता है, तो जारीकर्ता की पुष्टि तक उस पर भरोसा न करें।',
    'vfy.ref_note': 'संदर्भ जाँच से केवल यह पुष्टि होती है कि अभिलेख मौजूद है। काग़ज़ी दस्तावेज़ की प्रामाणिकता के लिए उसका क्यूआर कोड स्कैन या अपलोड करें।',
    'vfy.kind_fdr': 'सुरक्षा जमा (एफडीआर)',
    'vfy.kind_release': 'रिलीज़ आदेश',

    'vfy.how_eyebrow': 'सत्यापन के पीछे',
    'vfy.how_title': 'सत्यापन कैसे होता है',
    'vfy.h1_t': 'बैंक हस्ताक्षर करता है', 'vfy.h1_d': 'एफडीआर जारी करते समय बैंक उसके मुख्य विवरण — संख्या, राशि, तिथियाँ, धारक, ग्रहणाधिकार — पर अपनी निजी कुंजी (Ed25519) से हस्ताक्षर करता है। यह कुंजी केवल बैंक के पास होती है।',
    'vfy.h2_t': 'रसीद पर क्यूआर कोड छपता है', 'vfy.h2_d': 'हस्ताक्षरित विवरण रसीद पर पढ़ने योग्य पाठ के साथ क्यूआर कोड के रूप में छापे जाते हैं।',
    'vfy.h3_t': 'पोर्टल जाँच करता है', 'vfy.h3_d': 'पोर्टल बैंक की पंजीकृत सार्वजनिक कुंजी से हस्ताक्षर जाँचता है और बैंक से लाइव स्थिति पूछता है। एक अंक बदलने पर भी हस्ताक्षर अमान्य हो जाता है।',
    'vfy.noc_note': 'पोर्टल द्वारा जारी रिलीज़ आदेश (एनओसी) भी इसी प्रकार पोर्टल की अपनी कुंजी से हस्ताक्षरित होते हैं, ताकि कोई भी कार्रवाई से पहले रिलीज़ की पुष्टि कर सके।',

    'vfy.keys_title': 'पंजीकृत हस्ताक्षर कुंजियाँ',
    'vfy.keys_sub': 'वे सार्वजनिक कुंजियाँ जिन पर पोर्टल भरोसा करता है। किसी अन्य कुंजी से हस्ताक्षरित कोड अस्वीकार कर दिया जाता है।',
    'vfy.keys_count': '{n} कुंजियाँ',
    'vfy.k_id': 'कुंजी आईडी',
    'vfy.k_owner': 'स्वामी',
    'vfy.k_type': 'प्रकार',
    'vfy.k_signs': 'हस्ताक्षर करती है',
    'vfy.k_fp': 'फ़िंगरप्रिंट',
    'vfy.k_reg': 'पंजीकरण',
    'vfy.k_bank': 'बैंक',
    'vfy.k_portal': 'पोर्टल',
    'vfy.k_copy': '{key} की सार्वजनिक कुंजी कॉपी करें',
    'vfy.k_copied': '{key} की सार्वजनिक कुंजी कॉपी हो गई।',
    'vfy.k_empty': 'अभी कोई हस्ताक्षर कुंजी पंजीकृत नहीं है',
    'vfy.sign.FDR': 'एफडीआर रसीदें', 'vfy.sign.BVR': 'बैंक उत्तर', 'vfy.sign.NOC': 'रिलीज़ आदेश',
  },
});

await initPage({
  roles: null,
  active: 'verify',
  title: 'vfy.title',
  subtitle: 'vfy.subtitle',
  breadcrumbs: [{ label: 'nav.home', href: 'index.html' }, { label: 'nav.verify' }],
});

$$('[data-ic]').forEach((n) => { n.innerHTML = icon(n.dataset.ic, 18); });

const MAX_BYTES = 10 * 1024 * 1024;
const OK_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const resultEl = $('#result');

const state = {
  tab: getParam('code') ? 'paste' : 'upload',
  code: getParam('code') || '',
  ref: getParam('ref') || '',
  file: null,
  last: null,          // {type:'code'|'ref', data, source}
  camMsg: null,        // {key, tone}
};
let tabCtl = null;

/* ================================================================= camera */
const cam = { stream: null, raf: 0, video: null, canvas: null, lastScan: 0, running: false };

function stopCamera() {
  cam.running = false;
  if (cam.raf) cancelAnimationFrame(cam.raf);
  cam.raf = 0;
  if (cam.stream) cam.stream.getTracks().forEach((tr) => tr.stop());
  cam.stream = null;
  if (cam.video) { cam.video.srcObject = null; }
}

function camErrorKey(e) {
  const n = e && e.name;
  if (n === 'NotAllowedError' || n === 'SecurityError') return 'vfy.cam_denied';
  if (n === 'NotFoundError' || n === 'OverconstrainedError' || n === 'DevicesNotFoundError') return 'vfy.cam_notfound';
  if (n === 'NotReadableError' || n === 'TrackStartError' || n === 'AbortError') return 'vfy.cam_busy';
  return 'vfy.cam_failed';
}

function scanLoop(ts) {
  if (!cam.running) return;
  cam.raf = requestAnimationFrame(scanLoop);
  if (ts - cam.lastScan < 160) return;
  cam.lastScan = ts;
  const v = cam.video;
  if (!v || v.readyState < 2 || !v.videoWidth) return;
  const scale = Math.min(1, 720 / v.videoWidth);
  const w = Math.round(v.videoWidth * scale); const h = Math.round(v.videoHeight * scale);
  const c = cam.canvas;
  if (c.width !== w) c.width = w;
  if (c.height !== h) c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(v, 0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  const found = window.jsQR(img.data, w, h, { inversionAttempts: 'attemptBoth' });
  if (found && found.data) {
    stopCamera();
    state.camMsg = { key: 'vfy.cam_found', tone: 'success' };
    renderScan($('#scan-panel'));
    verifyCode(found.data.trim(), 'camera');
  }
}

async function startCamera(panel) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { state.camMsg = { key: 'vfy.cam_unavailable', tone: 'danger' }; renderScan(panel); return; }
  if (typeof window.jsQR !== 'function') { state.camMsg = { key: 'vfy.cam_noqr_lib', tone: 'danger' }; renderScan(panel); return; }
  state.camMsg = { key: 'vfy.cam_starting', tone: '' };
  renderScan(panel, true);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    if (state.tab !== 'scan' || document.hidden) { stream.getTracks().forEach((tr) => tr.stop()); return; }
    cam.stream = stream;
    cam.running = true;
    state.camMsg = { key: 'vfy.cam_scanning', tone: '' };
    renderScan(panel, true);
    cam.video.srcObject = stream;
    await cam.video.play().catch(() => {});
    cam.raf = requestAnimationFrame(scanLoop);
  } catch (e) {
    stopCamera();
    state.camMsg = { key: camErrorKey(e), tone: 'danger' };
    renderScan(panel);
  }
}

function renderScan(panel, live = cam.running) {
  if (!panel) return;
  const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const video = cam.video || el('video', { playsinline: true, muted: true, autoplay: true, 'aria-label': t('vfy.tab_scan') });
  video.muted = true;
  cam.video = video;
  cam.canvas = cam.canvas || el('canvas', { hidden: true });
  const box = el('div', { class: 'vf-cam' });
  if (live) {
    box.append(video, el('div', { class: 'frame', 'aria-hidden': 'true' }));
  } else {
    box.append(el('div', { class: 'idle' },
      el('div', { class: 'ring', html: icon('camera', 30) }),
      el('div', { style: 'font-weight:700' }, t('vfy.cam_idle_t')),
      el('p', {}, t('vfy.cam_idle_d'))));
  }
  const msg = state.camMsg;
  const status = el('div', { class: 'vf-status', role: 'status' },
    msg ? el('span', { html: icon(msg.tone === 'danger' ? 'alert-circle' : msg.tone === 'success' ? 'check-circle' : 'scan', 16), style: msg.tone === 'danger' ? 'color:var(--nk-danger)' : msg.tone === 'success' ? 'color:var(--nk-success)' : '' }) : null,
    msg ? el('span', {}, t(msg.key)) : null);
  const actions = el('div', { class: 'vf-actions' },
    live
      ? el('button', { class: 'btn secondary', type: 'button', html: `${icon('x-circle', 16)} ${esc(t('vfy.cam_stop'))}`, onclick: () => { stopCamera(); state.camMsg = null; renderScan(panel); } })
      : el('button', { class: 'btn', type: 'button', disabled: !supported, html: `${icon('camera', 16)} ${esc(t('vfy.cam_start'))}`, onclick: () => startCamera(panel) }),
    msg && msg.tone === 'danger' ? el('button', { class: 'btn ghost', type: 'button', html: `${icon('upload', 16)} ${esc(t('vfy.use_upload'))}`, onclick: () => tabCtl.select('upload') }) : null);
  if (!supported && !msg) state.camMsg = { key: 'vfy.cam_unavailable', tone: 'danger' };
  mount(panel,
    el('p', { class: 'vf-lead' }, t('vfy.scan_lead')),
    box, cam.canvas, status, actions);
  if (!supported && !msg) renderScan(panel);
}

document.addEventListener('visibilitychange', () => { if (document.hidden && cam.running) { stopCamera(); state.camMsg = null; renderScan($('#scan-panel')); } });
window.addEventListener('pagehide', stopCamera);

/* ================================================================= upload */
function renderUpload(panel) {
  const input = el('input', { type: 'file', id: 'vf-file', accept: '.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg', hidden: true });
  const dz = el('div', { class: 'dropzone', role: 'button', tabindex: '0', 'aria-label': t('vfy.drop_aria') },
    el('div', { class: 'dz-icon', html: icon('upload', 24) }),
    el('div', {}, el('strong', {}, t('vfy.drop_t'))),
    el('div', { class: 'muted' }, t('vfy.drop_or')),
    el('div', { class: 'muted small mt-1' }, t('vfy.drop_types')));
  const open = () => input.click();
  dz.addEventListener('click', open);
  dz.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('over'));
  dz.addEventListener('drop', (e) => { e.preventDefault(); dz.classList.remove('over'); const f = e.dataTransfer?.files?.[0]; if (f) pickFile(f); });
  input.addEventListener('change', () => { const f = input.files?.[0]; input.value = ''; if (f) pickFile(f); });

  const f = state.file;
  const fileRow = f ? el('div', { class: 'vf-file' },
    el('span', { class: 'li-icon', html: icon(f.type === 'application/pdf' ? 'file-text' : 'file', 18) }),
    el('div', { class: 'grow' }, el('div', { class: 'nm' }, f.name), el('div', { class: 'muted small' }, fmtBytes(f.size))),
    el('button', { class: 'btn sm secondary', type: 'button', id: 'vf-recheck', html: `${icon('refresh', 14)} ${esc(t('vfy.check_again'))}`, onclick: (ev) => verifyFile(f, ev.currentTarget) }),
    el('button', { class: 'btn sm ghost', type: 'button', html: `${icon('upload', 14)} ${esc(t('vfy.choose_other'))}`, onclick: open })) : null;

  mount(panel,
    el('p', { class: 'vf-lead' }, t('vfy.upload_lead')),
    f ? null : dz, input, fileRow,
    el('ul', { class: 'vf-tips' }, ['tip1', 'tip2', 'tip3'].map((k) => el('li', { html: `${icon('check-circle', 15)}<span>${esc(t(`vfy.${k}`))}</span>` }))));
}

function pickFile(f) {
  const typeOk = OK_TYPES.includes(f.type) || /\.(pdf|png|jpe?g)$/i.test(f.name);
  if (!typeOk) { toast(t('vfy.bad_type'), 'error'); return; }
  if (f.size > MAX_BYTES) { toast(t('vfy.too_big'), 'error'); return; }
  state.file = f;
  renderUpload($('#upload-panel'));
  verifyFile(f, $('#vf-recheck'));
}

/* ================================================================= paste / ref */
function renderPaste(panel) {
  const ta = el('textarea', { class: 'textarea', id: 'vf-code', rows: '5', spellcheck: 'false', autocomplete: 'off', placeholder: t('vfy.code_ph'), 'aria-describedby': 'vf-code-hint' });
  ta.value = state.code;
  ta.addEventListener('input', () => { state.code = ta.value; setErr(ta, ''); });
  const btn = el('button', { class: 'btn', type: 'submit', id: 'vf-code-btn', html: `${icon('shield-check', 16)} ${esc(t('vfy.verify'))}` });
  const form = el('form', { novalidate: true },
    el('div', { class: 'field' },
      el('label', { for: 'vf-code' }, t('vfy.code_label')),
      ta,
      el('span', { class: 'hint', id: 'vf-code-hint' }, t('vfy.code_hint'))),
    el('div', { class: 'vf-actions' }, btn,
      el('button', { class: 'btn ghost', type: 'button', html: `${icon('x', 16)} ${esc(t('vfy.clear'))}`, onclick: () => { state.code = ''; ta.value = ''; setErr(ta, ''); ta.focus(); } })));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = ta.value.trim();
    if (!code) { setErr(ta, t('vfy.code_empty')); ta.focus(); return; }
    verifyCode(code, 'paste', btn);
  });
  mount(panel, el('p', { class: 'vf-lead' }, t('vfy.paste_lead')), form);
}

function renderRef(panel) {
  const input = el('input', { class: 'input ref-input', id: 'vf-ref', type: 'text', autocomplete: 'off', spellcheck: 'false', placeholder: t('vfy.ref_ph'), 'aria-describedby': 'vf-ref-hint', value: state.ref });
  input.addEventListener('input', () => { state.ref = input.value; setErr(input, ''); });
  const btn = el('button', { class: 'btn', type: 'submit', html: `${icon('search', 16)} ${esc(t('vfy.ref_check'))}` });
  const form = el('form', { novalidate: true },
    el('div', { class: 'field' },
      el('label', { for: 'vf-ref' }, t('vfy.ref_label')),
      input,
      el('span', { class: 'hint', id: 'vf-ref-hint' }, t('vfy.ref_hint'))),
    el('div', { class: 'vf-actions' }, btn));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ref = input.value.trim().toUpperCase();
    if (!ref) { setErr(input, t('vfy.ref_empty')); input.focus(); return; }
    checkRef(ref, btn, input);
  });
  mount(panel, el('p', { class: 'vf-lead' }, t('vfy.ref_lead')), form);
}

function setErr(input, msg) {
  const id = `${input.id}-err`;
  let node = document.getElementById(id);
  input.classList.toggle('invalid', !!msg);
  if (msg) {
    if (!node) { node = el('span', { class: 'error', id, role: 'alert' }); input.closest('.field').appendChild(node); }
    node.textContent = msg;
    input.setAttribute('aria-invalid', 'true');
  } else {
    if (node) node.remove();
    input.removeAttribute('aria-invalid');
  }
}

/* ================================================================= API calls */
function scrollToResult() {
  if (window.matchMedia('(max-width: 900px)').matches) resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function run(btn, fn, retry) {
  const go = async () => {
    loading(resultEl, t('vfy.checking'));
    try { await fn(); } catch (e) {
      state.last = null;
      errorState(resultEl, { message: !e.status ? t('common.error') : e.message }, retry);
    }
  };
  if (btn) await withBusy(btn, go); else await go();
}

function verifyCode(code, source, btn) {
  const call = () => run(btn, async () => {
    const data = await api.post('/public/verify', { code }, { noRedirect: true });
    state.last = { type: 'code', data, source };
    renderResult();
    scrollToResult();
  }, call);
  return call();
}

function verifyFile(file, btn) {
  const call = () => run(btn, async () => {
    const fd = new FormData();
    fd.append('file', file, file.name);
    loading(resultEl, t('vfy.reading'));
    const data = await api.upload('/public/verify-file', fd, { noRedirect: true });
    state.last = { type: 'code', data, source: 'file' };
    renderResult();
    scrollToResult();
  }, call);
  return call();
}

async function checkRef(ref, btn, input) {
  await withBusy(btn, async () => {
    loading(resultEl, t('common.loading'));
    try {
      const data = await api.get('/public/verify-ref', { ref }, { noRedirect: true });
      state.last = { type: 'ref', data };
      renderResult();
      scrollToResult();
    } catch (e) {
      if (e.status === 400 || e.status === 422) { setErr(input, t('vfy.ref_format')); input.focus(); renderResult(); return; }
      state.last = null;
      errorState(resultEl, { message: !e.status ? t('common.error') : e.message }, () => checkRef(ref, btn, input));
    }
  });
}

/* ================================================================= result rendering */
function renderPlaceholder() {
  const items = [['key', '', 'ph1'], ['file-check', 'saffron', 'ph2'], ['bank', 'teal', 'ph3'], ['layers', 'green', 'ph4']];
  mount(resultEl, el('div', { class: 'card vf-placeholder' },
    el('div', { class: 'ph-head' },
      el('div', { class: 'ph-ic', html: icon('shield', 26) }),
      el('div', {}, el('h3', {}, t('vfy.ph_title')), el('div', { class: 'muted' }, t('vfy.ph_sub')))),
    el('ul', { class: 'vf-checks' }, items.map(([ic, tone, k]) => el('li', {},
      el('div', { class: `feature-icon ${tone}`, html: icon(ic, 18) }),
      el('div', {}, el('div', { class: 't' }, t(`vfy.${k}_t`)), el('div', { class: 'd' }, t(`vfy.${k}_d`))))))));
}

function errText(err) {
  if (!err) return '';
  if (/signature does not match/i.test(err)) return t('vfy.err_sig');
  if (/not a nidhi kavach signed code/i.test(err)) return t('vfy.err_notnk');
  if (/unreadable/i.test(err)) return t('vfy.err_unreadable');
  const k = err.match(/signing key (\S+) is not registered/i);
  if (k) return t('vfy.err_key', { key: k[1] });
  if (/no qr code could be read/i.test(err)) return t('vfy.err_noqr');
  return getLang() === 'en' ? err : err;   // server sentence (English) as last resort
}

const kindLabel = (k) => (k ? t(`vfy.kind.${k}`, { _default: k }) : '');
const amountHtml = (n, words) => `<div class="vr-amount">${esc(fmtINR(n))}</div>${words && getLang() === 'en' ? `<div class="muted small">${esc(words)}</div>` : ''}`;

function bankStatusBox(bs) {
  if (!bs) return null;
  if (bs.found === false) {
    return el('div', { class: 'vr-box' },
      el('div', { class: 'bx-l', html: `${icon('bank', 14)} ${esc(t('vfy.bank_status'))}` }),
      el('div', { class: 'bx-badges', html: `<span class="badge b-danger">${icon('alert-circle', 12)}${esc(t('vfy.bs_notfound'))}</span>` }));
  }
  const st = String(bs.status || '').toLowerCase();
  const tone = st === 'active' ? 'b-success' : st === 'matured' ? 'b-warning' : st === 'renewed' ? 'b-teal' : 'b-danger';
  const sub = [];
  if (bs.lien_marked && bs.lien_in_favour_of) sub.push(t('vfy.bs_in_favour', { who: bs.lien_in_favour_of }));
  if (bs.closed_at) sub.push(t('vfy.bs_closed_on', { d: fmtDate(bs.closed_at) }));
  if (bs.matches_signed === false) sub.push(t('vfy.bs_mismatch'));
  return el('div', { class: 'vr-box' },
    el('div', { class: 'bx-l', html: `${icon('bank', 14)} ${esc(t('vfy.bank_status'))}` }),
    el('div', { class: 'bx-badges', html: `<span class="badge dot ${tone}">${esc(t(`vfy.bs.${st}`, { _default: bs.status || t('common.unknown') }))}</span> <span class="small muted">${esc(t('vfy.bs_lien'))}:</span> ${lienBadge(bs.lien_marked === true ? true : bs.lien_marked === false ? false : null)}` }),
    sub.length ? el('div', { class: 'bx-s' }, sub.join(' · ')) : null);
}

function portalBox(pr) {
  if (!pr) return null;
  if (!pr.found) {
    return el('div', { class: 'vr-box' },
      el('div', { class: 'bx-l', html: `${icon('layers', 14)} ${esc(t('vfy.portal_record'))}` }),
      el('div', { class: 'bx-badges', html: `<span class="badge b-slate">${esc(t('vfy.pr_notfound'))}</span>` }),
      el('div', { class: 'bx-s' }, t('vfy.pr_notfound_d')));
  }
  const badge = pr.kind === 'release' ? releaseBadge(pr.status) : statusBadge(pr.display_status || String(pr.status || '').toLowerCase());
  const trust = pr.trust_level !== null && pr.trust_level !== undefined ? trustBadge(pr.trust_level) : '';
  return el('div', { class: 'vr-box' },
    el('div', { class: 'bx-l', html: `${icon('layers', 14)} ${esc(t('vfy.portal_record'))}` }),
    el('div', { class: 'mono', style: 'font-weight:600;margin-bottom:6px' }, pr.ref_no || ''),
    el('div', { class: 'bx-badges', html: `${badge} ${trust}` }),
    pr.institution ? el('div', { class: 'bx-s' }, pr.institution) : null);
}

function detailPairs(kind, d) {
  if (!d) return [];
  const mono = (v) => (v ? `<span class="mono">${esc(v)}</span>` : '—');
  if (kind === 'NOC') {
    return [
      [t('vfy.f_release_ref'), mono(d.release_ref)],
      [t('vfy.f_noc_date'), esc(fmtDate(d.date))],
      [t('vfy.f_request_type'), esc(d.request_type ? t(`rtype.${d.request_type}`, { _default: d.request_type_label || d.request_type }) : '—')],
      [t('f.amount'), d.amount !== undefined && d.amount !== null ? amountHtml(d.amount, d.amount_words) : '—'],
      [t('f.institution'), `${esc(d.institution_name || '—')}${d.aicte_id ? `<div class="muted small">${esc(t('f.aicte_id'))}: <span class="mono">${esc(d.aicte_id)}</span></div>` : ''}`],
      [t('f.fdr_number'), `${mono(d.fdr_number)}${d.fdr_ref ? `<div class="muted small mono">${esc(d.fdr_ref)}</div>` : ''}`],
      [t('f.bank'), esc(d.bank_name || '—')],
    ];
  }
  return [
    [t('f.fdr_number'), mono(d.fdr_number)],
    [t('f.amount'), d.amount !== undefined && d.amount !== null ? amountHtml(d.amount, d.amount_words) : '—'],
    [t('f.issue_date'), esc(fmtDate(d.issue_date))],
    [t('f.maturity_date'), `${esc(fmtDate(d.maturity_date))}${d.days_to_maturity !== undefined && d.days_to_maturity !== null ? ` <div class="mt-1">${maturityChip(d.days_to_maturity)}</div>` : ''}`],
    [t('vfy.f_holder'), esc(d.holder_name || '—')],
    [t('f.institution'), `${esc(d.institution_name || '—')}${d.aicte_id ? `<div class="muted small">${esc(t('f.aicte_id'))}: <span class="mono">${esc(d.aicte_id)}</span></div>` : ''}${d.institution_place ? `<div class="muted small">${esc(d.institution_place)}</div>` : ''}`],
    [t('f.bank'), `${esc(d.bank_name || '—')}${d.branch ? `<div class="muted small">${esc(t('f.branch'))}: ${esc(d.branch)}</div>` : ''}`],
    [t('f.lien'), d.lien_marked === true ? `${lienBadge(true)} <div class="small mt-1">${esc(t('vfy.lien_yes'))}</div>` : d.lien_marked === false ? lienBadge(false) : '—'],
    d.signed_at ? [t('vfy.f_signed_at'), esc(fmtDateTime(d.signed_at))] : null,
  ];
}

function fmtCompare(field, v) {
  if (v === null || v === undefined || v === '') return '—';
  if (field === 'amount') return fmtINR(v);
  if (/date/.test(field)) return fmtDate(v);
  return String(v);
}

function resultFoot() {
  return el('div', { class: 'vr-foot' },
    el('button', { class: 'btn secondary', type: 'button', html: `${icon('refresh', 16)} ${esc(t('vfy.verify_another'))}`, onclick: resetTool }),
    el('button', { class: 'btn ghost', type: 'button', html: `${icon('print', 16)} ${esc(t('vfy.print'))}`, onclick: () => window.print() }));
}

function renderCodeResult(r, source) {
  const doc = r.document_check;
  const altered = r.valid && doc && doc.available && doc.ok === false;
  const noQr = !r.valid && !r.kind && /no qr code could be read/i.test(r.error || '');
  const signerName = r.signer?.name || t('common.unknown');
  const cls = r.valid && !altered ? 'valid' : 'invalid';
  const head = el('div', { class: 'vr-head' },
    el('div', { class: 'vr-icon', html: icon(r.valid && !altered ? 'shield-check' : noQr ? 'scan' : 'x-circle', 28) }),
    el('div', { style: 'min-width:0' },
      el('h3', { class: 'vr-title' }, r.valid && !altered ? t('vfy.genuine', { name: signerName, key: r.signer?.key_id || '—' }) : altered ? t('vfy.altered_t') : noQr ? t('vfy.noqr_t') : t('vfy.invalid_t')),
      el('div', { class: 'vr-sub' }, [kindLabel(r.kind), t('vfy.checked_at', { d: fmtDateTime(r.checked_at) }), source ? t(`vfy.source.${source}`, { _default: '' }) : ''].filter(Boolean).join(' · '))));

  const parts = [head];
  if (altered) {
    parts.push(el('p', { class: 'mt-3 mb-0' }, t('vfy.altered_s', { name: signerName })));
  } else if (!r.valid) {
    parts.push(el('p', { class: 'mt-3 mb-0', style: 'font-weight:600' }, errText(r.error)));
  }

  // printed copy vs signed QR
  if (altered && doc.mismatches?.length) {
    parts.push(el('div', { class: 'vr-sec' },
      el('h4', { html: `${icon('file-text', 14)} ${esc(t('vfy.compare'))}` }),
      el('div', { class: 'table-wrap' }, el('table', { class: 'table compare-table compact' },
        el('thead', {}, el('tr', {}, el('th', {}, t('vfy.c_field')), el('th', {}, t('vfy.c_printed')), el('th', {}, t('vfy.c_signed')))),
        el('tbody', {}, doc.mismatches.map((m) => el('tr', {},
          el('td', {}, t(`vfy.c.${m.field}`, { _default: m.label || m.field })),
          el('td', { class: 'bad' }, fmtCompare(m.field, m.printed)),
          el('td', { class: 'ok' }, fmtCompare(m.field, m.signed)))))))));
  }
  if (doc && doc.flags?.length && (altered || doc.ok === false)) {
    parts.push(el('div', { class: 'vr-sec' },
      el('h4', { html: `${icon('flag', 14)} ${esc(t('vfy.flags'))}` }),
      el('ul', { class: 'vr-flags' }, doc.flags.map((f) => el('li', { html: `<span class="badge sev-${esc(f.severity || 'medium')}">${esc(t(`sev.${f.severity}`, { _default: f.severity || '' }))}</span><span>${esc(t(`vfy.flag.${f.code}`, { _default: f.label || f.code }))}</span>` })))));
  }

  // live status
  if (r.valid && (r.bank_status || r.portal_record)) {
    parts.push(el('div', { class: 'vr-sec' },
      el('h4', { html: `${icon('zap', 14)} ${esc(t('vfy.live'))}` }),
      el('div', { class: 'vr-live' }, bankStatusBox(r.bank_status), portalBox(r.portal_record))));
  }

  // decoded details
  const pairs = detailPairs(r.kind, r.decoded);
  if (pairs.filter(Boolean).length && r.decoded && Object.keys(r.decoded).length) {
    parts.push(el('div', { class: 'vr-sec' },
      el('h4', { html: `${icon(r.valid ? 'lock' : 'alert', 14)} ${esc(r.valid ? t('vfy.details_signed') : t('vfy.details_claimed'))}` }),
      el('div', { class: 'vr-card', style: r.valid ? '' : 'opacity:.8' }, dl(pairs))));
  }

  if (r.valid && !altered && doc && doc.available && doc.ok) {
    parts.push(el('div', { class: 'alert success', html: `${icon('file-check', 18)}<div>${esc(t('vfy.doc_ok'))}</div>` }));
  }
  if (r.valid && !altered) {
    parts.push(el('div', { class: 'alert info', html: `${icon('info', 18)}<div>${esc(t('vfy.advice_ok'))}</div>` }));
  } else {
    const adv = altered ? t('vfy.advice_altered') : noQr ? t('vfy.advice_noqr') : t('vfy.advice_bad');
    parts.push(el('div', { class: `alert ${noQr ? 'warning' : 'danger'}`, role: 'alert', html: `${icon('alert-circle', 18)}<div><div class="a-title">${esc(t('vfy.advice_bad_t'))}</div>${esc(adv)}</div>` }));
  }
  parts.push(resultFoot());
  mount(resultEl, el('div', { class: `verify-result ${cls}` }, parts));
}

function renderRefResult(r) {
  const ref = r.ref_no || '';
  if (!r.found) {
    mount(resultEl, el('div', { class: 'verify-result invalid' },
      el('div', { class: 'vr-head' },
        el('div', { class: 'vr-icon', html: icon('search', 26) }),
        el('div', { style: 'min-width:0' },
          el('h3', { class: 'vr-title' }, t('vfy.ref_none_t')),
          el('div', { class: 'vr-sub' }, t('vfy.ref_none_s', { ref })))),
      el('div', { class: 'alert warning', html: `${icon('alert', 18)}<div>${esc(t('vfy.ref_none_adv'))}</div>` }),
      resultFoot()));
    return;
  }
  const isRel = r.kind === 'release';
  const badge = isRel ? releaseBadge(r.status) : statusBadge(r.display_status || String(r.status || '').toLowerCase());
  const pairs = [
    [t('f.ref_no'), `<span class="mono">${esc(ref)}</span>`],
    [t('vfy.f_kind'), esc(isRel ? t('vfy.kind_release') : t('vfy.kind_fdr'))],
    [t('f.status'), badge],
    [t('f.institution'), esc(r.institution_name || '—')],
    r.bank_name ? [t('f.bank'), esc(r.bank_name)] : null,
    r.request_type ? [t('vfy.f_request_type'), esc(t(`rtype.${r.request_type}`, { _default: r.request_type }))] : null,
    r.amount_band ? [t('vfy.f_amount_band'), esc(r.amount_band)] : null,
    r.released_on ? [t('vfy.f_released_on'), esc(fmtDate(r.released_on))] : null,
  ];
  mount(resultEl, el('div', { class: 'verify-result valid' },
    el('div', { class: 'vr-head' },
      el('div', { class: 'vr-icon', html: icon('check-circle', 28) }),
      el('div', { style: 'min-width:0' },
        el('h3', { class: 'vr-title' }, t('vfy.ref_found_t')),
        el('div', { class: 'vr-sub' }, t('vfy.ref_found_s', { ref })))),
    el('div', { class: 'vr-sec' }, el('div', { class: 'vr-card' }, dl(pairs))),
    el('div', { class: 'alert info', html: `${icon('info', 18)}<div>${esc(t('vfy.ref_note'))}</div>` }),
    resultFoot()));
}

function renderResult() {
  const l = state.last;
  if (!l) { renderPlaceholder(); return; }
  if (l.type === 'ref') renderRefResult(l.data); else renderCodeResult(l.data, l.source);
}

function resetTool() {
  state.last = null;
  state.file = null;
  state.camMsg = null;
  renderResult();
  renderTool();
  $('#tool').scrollIntoView({ behavior: 'smooth', block: 'start' });
  const focusEl = { paste: '#vf-code', ref: '#vf-ref', upload: '.vf-tool .dropzone' }[state.tab];
  if (focusEl) $(focusEl)?.focus({ preventScroll: true });
}

/* ================================================================= tool tabs */
function renderTool() {
  stopCamera();
  tabCtl = tabs($('#tool'), [
    { key: 'scan', icon: 'camera', label: t('vfy.tab_scan'), render: (p) => { p.id = 'scan-panel'; renderScan(p); } },
    { key: 'upload', icon: 'upload', label: t('vfy.tab_upload'), render: (p) => { p.id = 'upload-panel'; renderUpload(p); } },
    { key: 'paste', icon: 'file-text', label: t('vfy.tab_paste'), render: (p) => { p.id = 'paste-panel'; renderPaste(p); } },
    { key: 'ref', icon: 'search', label: t('vfy.tab_ref'), render: (p) => { p.id = 'ref-panel'; renderRef(p); } },
  ], {
    active: state.tab,
    onChange: (key) => { if (key !== 'scan') { stopCamera(); } state.tab = key; },
  });
}

/* ================================================================= how it works + keys */
function renderHow() {
  const steps = [['h1', 'key', ''], ['h2', 'qr', 'saffron'], ['h3', 'shield-check', 'green']];
  mount($('#how-steps'), steps.map(([k, ic, tone], i) => el('li', { class: 'card vf-step' },
    el('span', { class: 'num', 'aria-hidden': 'true' }, String(i + 1)),
    el('div', { class: `feature-icon ${tone}`, html: icon(ic, 22) }),
    el('h3', {}, t(`vfy.${k}_t`)),
    el('p', {}, t(`vfy.${k}_d`)))));
  $('#noc-note').innerHTML = `${icon('stamp', 18)}<div>${esc(t('vfy.noc_note'))}</div>`;
}

let keys;   // undefined loading, null failed, [] loaded
function renderKeys() {
  const box = $('#keys');
  const count = $('#keys-count');
  if (keys === undefined) { loading(box); count.hidden = true; return; }
  if (keys === null) { errorState(box, { message: t('common.error') }, loadKeys); count.hidden = true; return; }
  count.hidden = !keys.length;
  count.textContent = t('vfy.keys_count', { n: keys.length });
  renderTable(box, {
    columns: [
      { key: 'key_id', label: t('vfy.k_id'), render: (k) => `<span class="cell-main mono">${esc(k.key_id)}</span>` },
      { key: 'owner', label: t('vfy.k_owner'), render: (k) => `<div class="cell-main">${esc(k.owner)}</div>${k.bank_code ? `<div class="cell-sub mono">${esc(k.bank_code)}</div>` : ''}` },
      { key: 'owner_type', label: t('vfy.k_type'), render: (k) => (k.owner_type === 'portal'
        ? `<span class="badge b-violet">${icon('stamp', 12)}${esc(t('vfy.k_portal'))}</span>`
        : `<span class="badge b-info">${icon('bank', 12)}${esc(t('vfy.k_bank'))}</span>`) },
      { key: 'signs', label: t('vfy.k_signs'), render: (k) => `<div class="chips">${(k.signs || []).map((s) => `<span class="chip">${esc(t(`vfy.sign.${s}`, { _default: s }))}</span>`).join('')}</div>` },
      { key: 'fingerprint', label: t('vfy.k_fp'), render: (k) => `<span class="mono nowrap">${esc(k.fingerprint || '—')}</span>` },
      { key: 'registered_at', label: t('vfy.k_reg'), render: (k) => `<span class="nowrap">${esc(fmtDate(k.registered_at))}</span>` },
      { key: 'copy', label: '', align: 'right', render: (k) => (k.public_key ? el('button', {
        class: 'btn sm ghost icon-only', type: 'button', title: t('vfy.k_copy', { key: k.key_id }), 'aria-label': t('vfy.k_copy', { key: k.key_id }), html: icon('copy', 15),
        onclick: async (ev) => { ev.stopPropagation(); try { await copyText(k.public_key); toast(t('vfy.k_copied', { key: k.key_id }), 'success'); } catch (e) { toast(t('common.error'), 'error'); } },
      }) : '') },
    ],
    rows: keys,
    empty: { title: t('vfy.k_empty'), icon: 'key' },
  });
}
async function loadKeys() {
  keys = undefined;
  renderKeys();
  try { keys = await api.get('/public/keys', null, { noRedirect: true }); if (!Array.isArray(keys)) keys = keys?.keys || keys?.items || []; } catch (e) { keys = null; }
  renderKeys();
}

/* ================================================================= boot */
function renderAll() { renderTool(); renderResult(); renderHow(); renderKeys(); }
renderAll();
loadKeys();
onLang(() => { state.camMsg = cam.running ? null : state.camMsg; renderAll(); });

if (state.code) verifyCode(state.code.trim(), 'link');
