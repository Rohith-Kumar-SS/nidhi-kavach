// Institution: one instrument - status, trust ladder, discrepancies to answer, documents, renewal chain, release request.
import { initPage, setPageHead } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, mount, dl, modal, toast, timeline, statusBadge, trustBadge, lienBadge, severityBadge, releaseBadge,
  maturityChip, fmtINR, fmtDate, fmtDateTime, fmtBytes, relDays, daysBetween, loading, emptyState, errorState, getParam,
} from '../assets/js/ui.js';

extend({
  en: {
    'ifdr.title': 'Instrument',
    'ifdr.my_fdrs': 'My FDRs',
    'ifdr.no_id': 'No instrument was selected. Open one from My FDRs.',
    'ifdr.renew': 'Renew this FDR',
    'ifdr.request_release': 'Request release / refund',
    'ifdr.upload': 'Upload corrected document',
    'ifdr.respond': 'Respond',
    'ifdr.respond_again': 'Add to response',
    'ifdr.submitted_on': 'Submitted on {d}',
    'ifdr.held_with': 'Held with',
    'ifdr.f.beneficiary': 'Beneficiary',
    'ifdr.f.auto_renew': 'Auto-renewal',
    'ifdr.f.months': '{n} months',
    'ifdr.f.pa': '{n}% p.a.',
    'ifdr.ladder.title': 'How far this instrument is verified',
    'ifdr.ladder.here': 'This instrument',
    'ifdr.ladder.0': 'You declared the details. Nothing has been checked yet.',
    'ifdr.ladder.1': 'The uploaded receipt matches what you declared.',
    'ifdr.ladder.2': 'The issuing bank confirmed the deposit and the lien. Strongest proof.',
    'ifdr.ladder.next.0': 'Upload a clear copy of the receipt so the portal can match it with your form.',
    'ifdr.ladder.next.1': 'AICTE will confirm the deposit with the bank. No action is needed from you.',
    'ifdr.ladder.next.2': 'No further verification is needed.',
    'ifdr.ladder.flagged': 'A serious discrepancy is open. The instrument is not counted towards your coverage until it is resolved.',
    'ifdr.al.discrepancy_t': 'Returned to you for corrections',
    'ifdr.al.discrepancy': 'AICTE needs clarification before this instrument can be accepted. Respond to each point below or upload a corrected receipt.',
    'ifdr.al.open_t': '{n} point(s) need your response',
    'ifdr.al.open': 'Please respond to the discrepancies listed below.',
    'ifdr.al.verifying_t': 'Under verification',
    'ifdr.al.verifying': 'An AICTE officer is checking the receipt against the bank record. You will be notified of the outcome.',
    'ifdr.al.matured_t': 'This deposit matured {n} days ago',
    'ifdr.al.matured': 'A matured deposit no longer protects AICTE. Submit the renewed FDR receipt now to avoid escalation.',
    'ifdr.al.expiring_t': 'Matures {when}',
    'ifdr.al.expiring': 'Renew it with your bank and submit the new receipt before {d} so the security deposit stays continuous.',
    'ifdr.al.renewal_pending_t': 'Renewal submitted',
    'ifdr.al.renewal_pending': 'The renewed instrument {ref} is with AICTE for verification.',
    'ifdr.al.release_t': 'Release request in progress',
    'ifdr.al.release': 'Request {ref} is at the "{stage}" stage.',
    'ifdr.al.released_t': 'Released',
    'ifdr.al.released': 'AICTE released this deposit. The no-objection certificate (NOC) is available on the release request.',
    'ifdr.al.renewed_t': 'Replaced by a renewed instrument',
    'ifdr.al.renewed': 'This instrument was replaced by {ref}.',
    'ifdr.al.rejected_t': 'Rejected',
    'ifdr.al.rejected': 'AICTE could not accept this receipt. See the history below for the reason and submit a genuine, valid receipt.',
    'ifdr.al.invoked_t': 'Invoked by AICTE',
    'ifdr.al.invoked': 'AICTE has encashed this security deposit. Contact the Regulation Bureau for details.',
    'ifdr.open': 'Open',
    'ifdr.disc.title': 'Discrepancies',
    'ifdr.disc.sub': 'Points raised on this instrument',
    'ifdr.disc.raised': 'Raised {when} by {by}',
    'ifdr.disc.src.system': 'automatic checks',
    'ifdr.disc.src.officer': 'AICTE officer',
    'ifdr.disc.src.bank': 'bank verification',
    'ifdr.disc.src.scheduler': 'daily monitoring',
    'ifdr.disc.your_resp': 'Your response ({d})',
    'ifdr.disc.awaiting': 'Response sent - awaiting AICTE review',
    'ifdr.disc.resolved': 'Resolved {d}',
    'ifdr.disc.waived': 'Waived {d}',
    'ifdr.disc.fix': 'How to fix',
    'ifdr.cmp.title': 'Verification checks',
    'ifdr.cmp.sub': 'Your form compared with the receipt, the bank-signed QR and the bank record',
    'ifdr.cmp.field': 'Field',
    'ifdr.cmp.claimed': 'Your form',
    'ifdr.cmp.document': 'Receipt',
    'ifdr.cmp.qr': 'Signed QR',
    'ifdr.cmp.bank': 'Bank',
    'ifdr.cmp.empty': 'Checks will appear once the receipt has been analysed.',
    'ifdr.docs.title': 'Documents',
    'ifdr.docs.empty': 'No documents uploaded',
    'ifdr.docs.view': 'View',
    'ifdr.docs.new_tab': 'Open in new tab',
    'ifdr.docs.signed': 'Bank signature verified',
    'ifdr.docs.unsigned': 'No bank signature',
    'ifdr.docs.bad_sig': 'Signature invalid',
    'ifdr.docs.flags': 'Flagged for review',
    'ifdr.docs.select': 'Select a document to view it here.',
    'ifdr.kind.fdr_certificate': 'FDR receipt',
    'ifdr.kind.renewal_certificate': 'Renewed FDR receipt',
    'ifdr.kind.bank_letter': 'Bank letter',
    'ifdr.kind.supporting': 'Supporting document',
    'ifdr.kind.noc': 'No-objection certificate',
    'ifdr.hist.title': 'What happened so far',
    'ifdr.hist.empty': 'No history yet',
    'ifdr.do.title': 'What you can do',
    'ifdr.do.renew': 'Submit the renewed receipt when this deposit is close to maturity or has matured.',
    'ifdr.do.renew_no': 'Available within 90 days of maturity for an active instrument.',
    'ifdr.do.renew_done': 'A renewal has already been submitted.',
    'ifdr.do.release': 'Ask AICTE to release the lien or refund the deposit.',
    'ifdr.do.release_no': 'Available only for an accepted (active) instrument without an open request.',
    'ifdr.do.upload': 'Add a corrected receipt, a bank letter or a supporting document.',
    'ifdr.do.upload_no': 'Documents can be added only while the instrument is being verified.',
    'ifdr.do.verify': 'Verify publicly',
    'ifdr.do.verify_t': 'Anyone can check the bank-signed QR on the public verification page.',
    'ifdr.obs.title': 'Messages from AICTE',
    'ifdr.obs.empty': 'No messages from AICTE on this instrument.',
    'ifdr.chain.title': 'Renewal chain',
    'ifdr.chain.sub': 'Earlier and later instruments for the same deposit',
    'ifdr.chain.this': 'this instrument',
    'ifdr.chain.late': 'renewed after maturity',
    'ifdr.chain.single': 'This is the first instrument in its chain.',
    'ifdr.rel.title': 'Release requests',
    'ifdr.rel.empty': 'No release request for this instrument.',
    'ifdr.m.respond_t': 'Respond to discrepancy',
    'ifdr.m.respond_l': 'Your explanation',
    'ifdr.m.respond_ph': 'Explain the difference and what you have done about it (for example, a corrected receipt has been uploaded).',
    'ifdr.m.respond_hint': 'Your response goes to the verifying officer. Upload a corrected receipt as well if the document itself was wrong.',
    'ifdr.m.respond_min': 'Please write at least 10 characters.',
    'ifdr.m.respond_ok': 'Your response was sent to AICTE.',
    'ifdr.m.send': 'Send response',
    'ifdr.m.upload_t': 'Upload a document',
    'ifdr.m.kind': 'Document type',
    'ifdr.m.file': 'File (PDF, PNG or JPG)',
    'ifdr.m.file_req': 'Choose a file to upload.',
    'ifdr.m.upload_hint': 'Receipts are read automatically and checked against your form and the bank signature.',
    'ifdr.m.upload_ok': 'Document uploaded. AICTE has been informed.',
    'ifdr.m.upload_btn': 'Upload',
    'ifdr.m.rel_t': 'Request release / refund',
    'ifdr.m.rel_type': 'Type of request',
    'ifdr.m.rel_reason': 'Reason',
    'ifdr.m.rel_ph': 'For example: the deposit has completed its tenure and a fresh FDR has been lodged.',
    'ifdr.m.rel_min': 'Please give a reason of at least 15 characters.',
    'ifdr.m.rel_note': 'AICTE scrutinises the request against a checklist (tenure, discrepancies, lien, bank verification, dues). You can follow every stage and download the NOC once released.',
    'ifdr.m.rel_ok': 'Release request {ref} submitted.',
    'ifdr.m.rel_btn': 'Submit request',
    'ifdr.rt.release': 'Release of lien - the deposit is returned to the institution',
    'ifdr.rt.refund': 'Refund of security deposit',
    'ifdr.rt.discharge': 'Discharge on closure or withdrawal of approval',
    'ifdr.yes': 'Yes',
    'ifdr.stage.SUBMITTED': 'Submitted', 'ifdr.stage.SCRUTINY': 'Under scrutiny', 'ifdr.stage.RECOMMENDED': 'Recommended', 'ifdr.stage.APPROVED': 'Approved', 'ifdr.stage.RETURNED': 'Returned to you',
    'ifdr.no': 'No',
  },
  hi: {
    'ifdr.title': 'लिखत',
    'ifdr.my_fdrs': 'मेरी एफडीआर',
    'ifdr.no_id': 'कोई लिखत चयनित नहीं है। "मेरी एफडीआर" से कोई लिखत खोलें।',
    'ifdr.renew': 'इस एफडीआर का नवीनीकरण करें',
    'ifdr.request_release': 'रिलीज़ / वापसी का अनुरोध',
    'ifdr.upload': 'संशोधित दस्तावेज़ अपलोड करें',
    'ifdr.respond': 'उत्तर दें',
    'ifdr.respond_again': 'उत्तर में जोड़ें',
    'ifdr.submitted_on': '{d} को जमा की गई',
    'ifdr.held_with': 'बैंक',
    'ifdr.f.beneficiary': 'लाभार्थी',
    'ifdr.f.auto_renew': 'स्वतः नवीनीकरण',
    'ifdr.f.months': '{n} माह',
    'ifdr.f.pa': '{n}% वार्षिक',
    'ifdr.ladder.title': 'इस लिखत का सत्यापन कहाँ तक हुआ',
    'ifdr.ladder.here': 'यह लिखत',
    'ifdr.ladder.0': 'आपने विवरण घोषित किए हैं। अभी कोई जाँच नहीं हुई है।',
    'ifdr.ladder.1': 'अपलोड की गई रसीद आपकी घोषणा से मेल खाती है।',
    'ifdr.ladder.2': 'जारीकर्ता बैंक ने जमा और ग्रहणाधिकार की पुष्टि की है। सबसे मज़बूत प्रमाण।',
    'ifdr.ladder.next.0': 'रसीद की स्पष्ट प्रति अपलोड करें ताकि पोर्टल उसका मिलान आपके प्रपत्र से कर सके।',
    'ifdr.ladder.next.1': 'एआईसीटीई बैंक से जमा की पुष्टि करेगा। आपकी ओर से कोई कार्रवाई आवश्यक नहीं है।',
    'ifdr.ladder.next.2': 'आगे किसी सत्यापन की आवश्यकता नहीं है।',
    'ifdr.ladder.flagged': 'एक गंभीर विसंगति खुली है। उसके निपटान तक यह लिखत आपके कवरेज में नहीं गिनी जाएगी।',
    'ifdr.al.discrepancy_t': 'सुधार हेतु आपको लौटाई गई',
    'ifdr.al.discrepancy': 'इस लिखत को स्वीकार करने से पहले एआईसीटीई को स्पष्टीकरण चाहिए। नीचे दिए प्रत्येक बिंदु का उत्तर दें या संशोधित रसीद अपलोड करें।',
    'ifdr.al.open_t': '{n} बिंदुओं पर आपका उत्तर अपेक्षित है',
    'ifdr.al.open': 'कृपया नीचे सूचीबद्ध विसंगतियों का उत्तर दें।',
    'ifdr.al.verifying_t': 'सत्यापनाधीन',
    'ifdr.al.verifying': 'एआईसीटीई अधिकारी रसीद का बैंक रिकॉर्ड से मिलान कर रहे हैं। परिणाम की सूचना आपको दी जाएगी।',
    'ifdr.al.matured_t': 'यह जमा {n} दिन पहले परिपक्व हो चुकी है',
    'ifdr.al.matured': 'परिपक्व जमा एआईसीटीई को सुरक्षा नहीं देती। एस्केलेशन से बचने के लिए नवीनीकृत एफडीआर रसीद तुरंत जमा करें।',
    'ifdr.al.expiring_t': 'परिपक्वता {when}',
    'ifdr.al.expiring': 'प्रतिभूति जमा निरंतर बनाए रखने के लिए बैंक से नवीनीकरण कराएँ और {d} से पहले नई रसीद जमा करें।',
    'ifdr.al.renewal_pending_t': 'नवीनीकरण प्रस्तुत',
    'ifdr.al.renewal_pending': 'नवीनीकृत लिखत {ref} एआईसीटीई के पास सत्यापन हेतु है।',
    'ifdr.al.release_t': 'रिलीज़ अनुरोध प्रक्रियाधीन',
    'ifdr.al.release': 'अनुरोध {ref} "{stage}" चरण में है।',
    'ifdr.al.released_t': 'रिलीज़ की गई',
    'ifdr.al.released': 'एआईसीटीई ने यह जमा रिलीज़ कर दी है। अनापत्ति प्रमाणपत्र (एनओसी) रिलीज़ अनुरोध पर उपलब्ध है।',
    'ifdr.al.renewed_t': 'नवीनीकृत लिखत द्वारा प्रतिस्थापित',
    'ifdr.al.renewed': 'इस लिखत का स्थान {ref} ने ले लिया है।',
    'ifdr.al.rejected_t': 'अस्वीकृत',
    'ifdr.al.rejected': 'एआईसीटीई इस रसीद को स्वीकार नहीं कर सका। कारण नीचे इतिहास में देखें और वास्तविक, मान्य रसीद जमा करें।',
    'ifdr.al.invoked_t': 'एआईसीटीई द्वारा भुनाई गई',
    'ifdr.al.invoked': 'एआईसीटीई ने यह प्रतिभूति जमा भुना ली है। विवरण के लिए विनियमन ब्यूरो से संपर्क करें।',
    'ifdr.open': 'खोलें',
    'ifdr.disc.title': 'विसंगतियाँ',
    'ifdr.disc.sub': 'इस लिखत पर उठाए गए बिंदु',
    'ifdr.disc.raised': '{when} उठाई गई - {by}',
    'ifdr.disc.src.system': 'स्वचालित जाँच',
    'ifdr.disc.src.officer': 'एआईसीटीई अधिकारी',
    'ifdr.disc.src.bank': 'बैंक सत्यापन',
    'ifdr.disc.src.scheduler': 'दैनिक निगरानी',
    'ifdr.disc.your_resp': 'आपका उत्तर ({d})',
    'ifdr.disc.awaiting': 'उत्तर भेजा गया - एआईसीटीई की समीक्षा प्रतीक्षित',
    'ifdr.disc.resolved': '{d} को निपटाई गई',
    'ifdr.disc.waived': '{d} को छूट दी गई',
    'ifdr.disc.fix': 'कैसे सुधारें',
    'ifdr.cmp.title': 'सत्यापन जाँच',
    'ifdr.cmp.sub': 'आपके प्रपत्र की तुलना रसीद, बैंक-हस्ताक्षरित क्यूआर और बैंक रिकॉर्ड से',
    'ifdr.cmp.field': 'विवरण',
    'ifdr.cmp.claimed': 'आपका प्रपत्र',
    'ifdr.cmp.document': 'रसीद',
    'ifdr.cmp.qr': 'हस्ताक्षरित क्यूआर',
    'ifdr.cmp.bank': 'बैंक',
    'ifdr.cmp.empty': 'रसीद के विश्लेषण के बाद जाँच यहाँ दिखाई देंगी।',
    'ifdr.docs.title': 'दस्तावेज़',
    'ifdr.docs.empty': 'कोई दस्तावेज़ अपलोड नहीं',
    'ifdr.docs.view': 'देखें',
    'ifdr.docs.new_tab': 'नए टैब में खोलें',
    'ifdr.docs.signed': 'बैंक हस्ताक्षर सत्यापित',
    'ifdr.docs.unsigned': 'बैंक हस्ताक्षर नहीं',
    'ifdr.docs.bad_sig': 'हस्ताक्षर अमान्य',
    'ifdr.docs.flags': 'समीक्षा हेतु चिह्नित',
    'ifdr.docs.select': 'दस्तावेज़ यहाँ देखने के लिए उसे चुनें।',
    'ifdr.kind.fdr_certificate': 'एफडीआर रसीद',
    'ifdr.kind.renewal_certificate': 'नवीनीकृत एफडीआर रसीद',
    'ifdr.kind.bank_letter': 'बैंक पत्र',
    'ifdr.kind.supporting': 'सहायक दस्तावेज़',
    'ifdr.kind.noc': 'अनापत्ति प्रमाणपत्र',
    'ifdr.hist.title': 'अब तक की कार्यवाही',
    'ifdr.hist.empty': 'अभी कोई इतिहास नहीं',
    'ifdr.do.title': 'आप क्या कर सकते हैं',
    'ifdr.do.renew': 'जमा के परिपक्वता के निकट होने या परिपक्व होने पर नवीनीकृत रसीद जमा करें।',
    'ifdr.do.renew_no': 'सक्रिय लिखत के लिए परिपक्वता से 90 दिन के भीतर उपलब्ध।',
    'ifdr.do.renew_done': 'नवीनीकरण पहले ही प्रस्तुत किया जा चुका है।',
    'ifdr.do.release': 'एआईसीटीई से ग्रहणाधिकार हटाने या जमा वापसी का अनुरोध करें।',
    'ifdr.do.release_no': 'केवल स्वीकृत (सक्रिय) लिखत के लिए, जिस पर कोई खुला अनुरोध न हो।',
    'ifdr.do.upload': 'संशोधित रसीद, बैंक पत्र या सहायक दस्तावेज़ जोड़ें।',
    'ifdr.do.upload_no': 'दस्तावेज़ केवल सत्यापन के दौरान जोड़े जा सकते हैं।',
    'ifdr.do.verify': 'सार्वजनिक सत्यापन',
    'ifdr.do.verify_t': 'सार्वजनिक सत्यापन पृष्ठ पर कोई भी बैंक-हस्ताक्षरित क्यूआर की जाँच कर सकता है।',
    'ifdr.obs.title': 'एआईसीटीई के संदेश',
    'ifdr.obs.empty': 'इस लिखत पर एआईसीटीई का कोई संदेश नहीं।',
    'ifdr.chain.title': 'नवीनीकरण श्रृंखला',
    'ifdr.chain.sub': 'इसी जमा की पिछली और बाद की लिखतें',
    'ifdr.chain.this': 'यह लिखत',
    'ifdr.chain.late': 'परिपक्वता के बाद नवीनीकृत',
    'ifdr.chain.single': 'यह अपनी श्रृंखला की पहली लिखत है।',
    'ifdr.rel.title': 'रिलीज़ अनुरोध',
    'ifdr.rel.empty': 'इस लिखत के लिए कोई रिलीज़ अनुरोध नहीं।',
    'ifdr.m.respond_t': 'विसंगति का उत्तर दें',
    'ifdr.m.respond_l': 'आपका स्पष्टीकरण',
    'ifdr.m.respond_ph': 'अंतर का कारण और उस पर की गई कार्रवाई बताएँ (उदाहरण: संशोधित रसीद अपलोड कर दी गई है)।',
    'ifdr.m.respond_hint': 'आपका उत्तर सत्यापनकर्ता अधिकारी को जाएगा। यदि दस्तावेज़ में ही त्रुटि थी तो संशोधित रसीद भी अपलोड करें।',
    'ifdr.m.respond_min': 'कृपया कम से कम 10 अक्षर लिखें।',
    'ifdr.m.respond_ok': 'आपका उत्तर एआईसीटीई को भेज दिया गया।',
    'ifdr.m.send': 'उत्तर भेजें',
    'ifdr.m.upload_t': 'दस्तावेज़ अपलोड करें',
    'ifdr.m.kind': 'दस्तावेज़ का प्रकार',
    'ifdr.m.file': 'फ़ाइल (पीडीएफ, पीएनजी या जेपीजी)',
    'ifdr.m.file_req': 'अपलोड करने के लिए फ़ाइल चुनें।',
    'ifdr.m.upload_hint': 'रसीदें स्वतः पढ़ी जाती हैं और आपके प्रपत्र तथा बैंक हस्ताक्षर से जाँची जाती हैं।',
    'ifdr.m.upload_ok': 'दस्तावेज़ अपलोड हो गया। एआईसीटीई को सूचित कर दिया गया है।',
    'ifdr.m.upload_btn': 'अपलोड करें',
    'ifdr.m.rel_t': 'रिलीज़ / वापसी का अनुरोध',
    'ifdr.m.rel_type': 'अनुरोध का प्रकार',
    'ifdr.m.rel_reason': 'कारण',
    'ifdr.m.rel_ph': 'उदाहरण: जमा की अवधि पूर्ण हो गई है और नई एफडीआर जमा कर दी गई है।',
    'ifdr.m.rel_min': 'कृपया कम से कम 15 अक्षरों में कारण लिखें।',
    'ifdr.m.rel_note': 'एआईसीटीई जाँच-सूची (अवधि, विसंगतियाँ, ग्रहणाधिकार, बैंक सत्यापन, बकाया) के आधार पर अनुरोध की संवीक्षा करता है। आप हर चरण देख सकते हैं और रिलीज़ होने पर एनओसी डाउनलोड कर सकते हैं।',
    'ifdr.m.rel_ok': 'रिलीज़ अनुरोध {ref} प्रस्तुत किया गया।',
    'ifdr.m.rel_btn': 'अनुरोध प्रस्तुत करें',
    'ifdr.rt.release': 'ग्रहणाधिकार मुक्ति - जमा संस्थान को लौटाई जाती है',
    'ifdr.rt.refund': 'प्रतिभूति जमा की वापसी',
    'ifdr.rt.discharge': 'बंद होने या अनुमोदन वापसी पर उन्मोचन',
    'ifdr.yes': 'हाँ',
    'ifdr.stage.SUBMITTED': 'प्रस्तुत', 'ifdr.stage.SCRUTINY': 'संवीक्षाधीन', 'ifdr.stage.RECOMMENDED': 'अनुशंसित', 'ifdr.stage.APPROVED': 'अनुमोदित', 'ifdr.stage.RETURNED': 'आपको लौटाया गया',
    'ifdr.no': 'नहीं',
  },
});

// Discrepancy titles and "how to fix" advice for the institution (falls back to the server label).
extend({
  en: {
    'ifdr.dc.AMOUNT_MISMATCH': 'Amount differs from the receipt or bank record',
    'ifdr.dc.DATE_MISMATCH': 'Issue or maturity date differs',
    'ifdr.dc.FDR_NUMBER_MISMATCH': 'FDR number differs',
    'ifdr.dc.DEPOSITOR_MISMATCH': 'Depositor name differs',
    'ifdr.dc.AICTE_ID_MISMATCH': 'AICTE institution ID on the receipt does not match',
    'ifdr.dc.QR_INVALID': 'Bank signature on the receipt is invalid',
    'ifdr.dc.QR_MISSING': 'Receipt has no bank-signed QR code',
    'ifdr.dc.PDF_EDITED': 'Receipt PDF appears to have been edited',
    'ifdr.dc.DUPLICATE_FDR': 'The same FDR is pledged on another record',
    'ifdr.dc.DUPLICATE_FILE': 'The same file was uploaded for another record',
    'ifdr.dc.LIEN_NOT_MARKED': 'Bank reports no lien in favour of AICTE',
    'ifdr.dc.BANK_NOT_FOUND': 'Bank has no deposit with this FDR number',
    'ifdr.dc.BANK_CLOSED': 'Bank reports the deposit was closed or pre-closed',
    'ifdr.dc.MATURED_NOT_RENEWED': 'Matured and not yet renewed',
    'ifdr.dc.MISSING_DOCUMENT': 'Receipt or supporting document missing',
    'ifdr.dc.INSUFFICIENT_AMOUNT': 'Deposit below the required amount',
    'ifdr.dc.OTHER': 'Observation from AICTE',
    'ifdr.fx.AMOUNT_MISMATCH': 'Check the amount you typed against the receipt. If the receipt is right, explain; if the receipt is wrong, get a corrected one from the bank and upload it.',
    'ifdr.fx.DATE_MISMATCH': 'Confirm the issue and maturity dates printed on the receipt and explain any difference.',
    'ifdr.fx.FDR_NUMBER_MISMATCH': 'Confirm the FDR number exactly as printed by the bank.',
    'ifdr.fx.DEPOSITOR_MISMATCH': 'The deposit should be in the name of the institution or its trust/society. Explain or upload a bank letter.',
    'ifdr.fx.AICTE_ID_MISMATCH': 'Ask the bank to print your correct AICTE institution ID on the receipt and upload the corrected copy.',
    'ifdr.fx.QR_INVALID': 'Upload the original receipt as issued by the bank, without any editing or re-saving.',
    'ifdr.fx.QR_MISSING': 'If your bank issues signed receipts, upload that copy. Otherwise an officer will verify with the bank directly.',
    'ifdr.fx.PDF_EDITED': 'Upload the receipt exactly as downloaded from the bank. Do not edit, merge or re-save it in a PDF editor.',
    'ifdr.fx.DUPLICATE_FDR': 'One FDR can secure only one approval. Explain, or lodge a separate deposit.',
    'ifdr.fx.DUPLICATE_FILE': 'Upload the receipt that belongs to this deposit.',
    'ifdr.fx.LIEN_NOT_MARKED': 'Ask your bank to mark a lien in favour of the Member Secretary, AICTE, and upload the bank letter.',
    'ifdr.fx.BANK_NOT_FOUND': 'Check the FDR number and bank. Upload a bank letter confirming the deposit.',
    'ifdr.fx.BANK_CLOSED': 'A security deposit must not be closed without AICTE approval. Explain and lodge a fresh deposit.',
    'ifdr.fx.MATURED_NOT_RENEWED': 'Renew the deposit with your bank and submit the renewed receipt from this page.',
    'ifdr.fx.MISSING_DOCUMENT': 'Upload the missing receipt or supporting document.',
    'ifdr.fx.INSUFFICIENT_AMOUNT': 'Lodge an additional FDR for the balance amount.',
    'ifdr.fx.OTHER': 'Read the officer\'s note and respond with the information requested.',
  },
  hi: {
    'ifdr.dc.AMOUNT_MISMATCH': 'राशि रसीद या बैंक रिकॉर्ड से भिन्न है',
    'ifdr.dc.DATE_MISMATCH': 'जारी करने या परिपक्वता की तिथि भिन्न है',
    'ifdr.dc.FDR_NUMBER_MISMATCH': 'एफडीआर संख्या भिन्न है',
    'ifdr.dc.DEPOSITOR_MISMATCH': 'जमाकर्ता का नाम भिन्न है',
    'ifdr.dc.AICTE_ID_MISMATCH': 'रसीद पर एआईसीटीई संस्थान आईडी मेल नहीं खाती',
    'ifdr.dc.QR_INVALID': 'रसीद पर बैंक का हस्ताक्षर अमान्य है',
    'ifdr.dc.QR_MISSING': 'रसीद पर बैंक-हस्ताक्षरित क्यूआर कोड नहीं है',
    'ifdr.dc.PDF_EDITED': 'रसीद पीडीएफ में संपादन के संकेत हैं',
    'ifdr.dc.DUPLICATE_FDR': 'यही एफडीआर किसी अन्य रिकॉर्ड पर गिरवी है',
    'ifdr.dc.DUPLICATE_FILE': 'यही फ़ाइल किसी अन्य रिकॉर्ड के लिए अपलोड की गई थी',
    'ifdr.dc.LIEN_NOT_MARKED': 'बैंक के अनुसार एआईसीटीई के पक्ष में ग्रहणाधिकार अंकित नहीं है',
    'ifdr.dc.BANK_NOT_FOUND': 'इस एफडीआर संख्या की कोई जमा बैंक में नहीं है',
    'ifdr.dc.BANK_CLOSED': 'बैंक के अनुसार जमा बंद या समय-पूर्व बंद की गई',
    'ifdr.dc.MATURED_NOT_RENEWED': 'परिपक्व, पर अभी नवीनीकरण नहीं हुआ',
    'ifdr.dc.MISSING_DOCUMENT': 'रसीद या सहायक दस्तावेज़ अनुपलब्ध',
    'ifdr.dc.INSUFFICIENT_AMOUNT': 'जमा राशि अपेक्षित राशि से कम है',
    'ifdr.dc.OTHER': 'एआईसीटीई की टिप्पणी',
    'ifdr.fx.AMOUNT_MISMATCH': 'आपके द्वारा भरी गई राशि को रसीद से मिलाएँ। रसीद सही है तो स्पष्टीकरण दें; रसीद गलत है तो बैंक से संशोधित रसीद लेकर अपलोड करें।',
    'ifdr.fx.DATE_MISMATCH': 'रसीद पर छपी जारी करने और परिपक्वता की तिथियों की पुष्टि करें और किसी भी अंतर का कारण बताएँ।',
    'ifdr.fx.FDR_NUMBER_MISMATCH': 'बैंक द्वारा छपी एफडीआर संख्या ठीक वैसी ही दर्ज करें।',
    'ifdr.fx.DEPOSITOR_MISMATCH': 'जमा संस्थान या उसके ट्रस्ट/सोसाइटी के नाम पर होनी चाहिए। स्पष्टीकरण दें या बैंक पत्र अपलोड करें।',
    'ifdr.fx.AICTE_ID_MISMATCH': 'बैंक से रसीद पर सही एआईसीटीई संस्थान आईडी छपवाएँ और संशोधित प्रति अपलोड करें।',
    'ifdr.fx.QR_INVALID': 'बैंक द्वारा जारी मूल रसीद बिना किसी संपादन के अपलोड करें।',
    'ifdr.fx.QR_MISSING': 'यदि आपका बैंक हस्ताक्षरित रसीद देता है तो वह प्रति अपलोड करें, अन्यथा अधिकारी सीधे बैंक से सत्यापन करेंगे।',
    'ifdr.fx.PDF_EDITED': 'बैंक से डाउनलोड की गई रसीद को बिना संपादित किए, बिना जोड़े और बिना दोबारा सहेजे अपलोड करें।',
    'ifdr.fx.DUPLICATE_FDR': 'एक एफडीआर केवल एक अनुमोदन को सुरक्षित कर सकती है। स्पष्टीकरण दें या अलग जमा करें।',
    'ifdr.fx.DUPLICATE_FILE': 'इसी जमा से संबंधित रसीद अपलोड करें।',
    'ifdr.fx.LIEN_NOT_MARKED': 'बैंक से सदस्य सचिव, एआईसीटीई के पक्ष में ग्रहणाधिकार अंकित कराएँ और बैंक पत्र अपलोड करें।',
    'ifdr.fx.BANK_NOT_FOUND': 'एफडीआर संख्या और बैंक जाँचें। जमा की पुष्टि करने वाला बैंक पत्र अपलोड करें।',
    'ifdr.fx.BANK_CLOSED': 'प्रतिभूति जमा एआईसीटीई की अनुमति के बिना बंद नहीं की जा सकती। स्पष्टीकरण दें और नई जमा करें।',
    'ifdr.fx.MATURED_NOT_RENEWED': 'बैंक से जमा का नवीनीकरण कराएँ और इसी पृष्ठ से नवीनीकृत रसीद जमा करें।',
    'ifdr.fx.MISSING_DOCUMENT': 'अनुपलब्ध रसीद या सहायक दस्तावेज़ अपलोड करें।',
    'ifdr.fx.INSUFFICIENT_AMOUNT': 'शेष राशि के लिए अतिरिक्त एफडीआर जमा करें।',
    'ifdr.fx.OTHER': 'अधिकारी की टिप्पणी पढ़ें और माँगी गई जानकारी के साथ उत्तर दें।',
  },
});

// History titles (audit action codes)
extend({
  en: {
    'ifdr.ev.FDR_SUBMITTED': 'Submitted by the institution', 'ifdr.ev.RENEWAL_SUBMITTED': 'Renewal submitted',
    'ifdr.ev.FDR_PICKED': 'Taken up for verification', 'ifdr.ev.QR_VERIFIED': 'Bank signature verified',
    'ifdr.ev.QR_CHECK_FAILED': 'Bank signature check failed', 'ifdr.ev.BANK_VERIFIED': 'Confirmed by the bank',
    'ifdr.ev.BANK_CHECK_FAILED': 'Bank check reported a problem', 'ifdr.ev.FDR_ACCEPTED': 'Accepted by AICTE',
    'ifdr.ev.FDR_RETURNED': 'Returned for corrections', 'ifdr.ev.FDR_REJECTED': 'Rejected', 'ifdr.ev.FDR_INVOKED': 'Invoked by AICTE',
    'ifdr.ev.FDR_RENEWED': 'Renewed', 'ifdr.ev.FDR_UPDATED': 'Details updated', 'ifdr.ev.FDR_STATUS_CHANGED': 'Status changed',
    'ifdr.ev.DISCREPANCY_RAISED': 'Discrepancy raised', 'ifdr.ev.DISCREPANCY_RESPONDED': 'Institution responded',
    'ifdr.ev.DISCREPANCY_RESOLVED': 'Discrepancy resolved', 'ifdr.ev.DISCREPANCY_WAIVED': 'Discrepancy waived',
    'ifdr.ev.DOCUMENT_UPLOADED': 'Document uploaded', 'ifdr.ev.OBSERVATION_ADDED': 'Message from AICTE',
    'ifdr.ev.RELEASE_REQUESTED': 'Release requested', 'ifdr.ev.NOC_ISSUED': 'NOC issued', 'ifdr.ev.BANK_EVENT': 'Bank update',
    'ifdr.ev.other': 'Update',
  },
  hi: {
    'ifdr.ev.FDR_SUBMITTED': 'संस्थान द्वारा जमा', 'ifdr.ev.RENEWAL_SUBMITTED': 'नवीनीकरण प्रस्तुत',
    'ifdr.ev.FDR_PICKED': 'सत्यापन हेतु लिया गया', 'ifdr.ev.QR_VERIFIED': 'बैंक हस्ताक्षर सत्यापित',
    'ifdr.ev.QR_CHECK_FAILED': 'बैंक हस्ताक्षर जाँच विफल', 'ifdr.ev.BANK_VERIFIED': 'बैंक द्वारा पुष्टि',
    'ifdr.ev.BANK_CHECK_FAILED': 'बैंक जाँच में समस्या', 'ifdr.ev.FDR_ACCEPTED': 'एआईसीटीई द्वारा स्वीकृत',
    'ifdr.ev.FDR_RETURNED': 'सुधार हेतु लौटाई गई', 'ifdr.ev.FDR_REJECTED': 'अस्वीकृत', 'ifdr.ev.FDR_INVOKED': 'एआईसीटीई द्वारा भुनाई गई',
    'ifdr.ev.FDR_RENEWED': 'नवीनीकृत', 'ifdr.ev.FDR_UPDATED': 'विवरण अद्यतन', 'ifdr.ev.FDR_STATUS_CHANGED': 'स्थिति परिवर्तित',
    'ifdr.ev.DISCREPANCY_RAISED': 'विसंगति उठाई गई', 'ifdr.ev.DISCREPANCY_RESPONDED': 'संस्थान ने उत्तर दिया',
    'ifdr.ev.DISCREPANCY_RESOLVED': 'विसंगति निपटाई गई', 'ifdr.ev.DISCREPANCY_WAIVED': 'विसंगति में छूट',
    'ifdr.ev.DOCUMENT_UPLOADED': 'दस्तावेज़ अपलोड', 'ifdr.ev.OBSERVATION_ADDED': 'एआईसीटीई का संदेश',
    'ifdr.ev.RELEASE_REQUESTED': 'रिलीज़ का अनुरोध', 'ifdr.ev.NOC_ISSUED': 'एनओसी जारी', 'ifdr.ev.BANK_EVENT': 'बैंक अद्यतन',
    'ifdr.ev.other': 'अद्यतन',
  },
});

const id = getParam('id');
const { meta } = await initPage({
  roles: ['institution'],
  active: 'fdrs',
  title: 'ifdr.title',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'institution/dashboard.html' }, { label: 'ifdr.my_fdrs', href: 'institution/fdrs.html' }, { label: 'ifdr.title' }],
});

const root = $('#root');
const OPEN_REL = ['SUBMITTED', 'SCRUTINY', 'RECOMMENDED', 'APPROVED', 'RETURNED'];
const UPLOAD_OK = ['SUBMITTED', 'UNDER_VERIFICATION', 'DISCREPANCY'];
let fdr = null;
let selDocId = null;

const fileUrl = (p) => api.fileUrl(String(p || '').replace(/^\/api/, ''));
const btnHtml = (ic, label) => `${icon(ic, 16)}<span>${esc(label)}</span>`;

/* ------------------------------------------------------------------ derived state */
function successorPending(f) {
  const chain = f.chain || [];
  const i = chain.findIndex((c) => c.is_current);
  return i >= 0 ? chain.slice(i + 1).find((c) => c.status !== 'REJECTED') || null : null;
}
function openRelease(f) { return (f.releases || []).find((r) => OPEN_REL.includes(r.status)) || null; }
function canRenew(f) { return f.status === 'ACTIVE' && f.days_to_maturity <= 90 && !successorPending(f); }
function canRelease(f) { return f.status === 'ACTIVE' && !openRelease(f); }
function canUpload(f) { return UPLOAD_OK.includes(f.status); }
function openDiscs(f) { return (f.discrepancies || []).filter((d) => d.status === 'open'); }
function dcTitle(d) { return t(`ifdr.dc.${d.code}`, { _default: meta?.discrepancy_codes?.[d.code]?.label || d.code }); }

/* ------------------------------------------------------------------ head */
function headActions() {
  if (!fdr) return null;
  const out = [];
  if (canRenew(fdr)) out.push(el('a', { class: `btn ${fdr.days_to_maturity < 0 ? 'danger' : 'saffron'}`, href: site(`institution/submit.html?renew=${fdr.id}`), html: btnHtml('refresh', t('ifdr.renew')) }));
  if (canRelease(fdr)) out.push(el('button', { class: 'btn secondary', type: 'button', onclick: requestRelease, html: btnHtml('unlock', t('ifdr.request_release')) }));
  if (canUpload(fdr)) out.push(el('button', { class: 'btn secondary', type: 'button', onclick: () => uploadDoc(), html: btnHtml('upload', t('ifdr.upload')) }));
  return out;
}

/* ------------------------------------------------------------------ alerts */
function alertBox(tone, ic, title, text, action) {
  return el('div', { class: `alert ${tone}` }, el('span', { html: icon(ic, 20) }),
    el('div', { class: 'grow' }, el('div', { class: 'a-title' }, title), el('div', {}, text),
      action ? el('div', { class: 'mt-2' }, action) : null));
}

function alerts() {
  const f = fdr;
  const out = [];
  const open = openDiscs(f);
  const succ = successorPending(f);
  const rel = openRelease(f);
  if (f.status === 'DISCREPANCY') out.push(alertBox('danger', 'flag', t('ifdr.al.discrepancy_t'), t('ifdr.al.discrepancy')));
  else if (open.some((d) => !d.institution_response)) out.push(alertBox('warning', 'flag', t('ifdr.al.open_t', { n: open.filter((d) => !d.institution_response).length }), t('ifdr.al.open')));
  if (['SUBMITTED', 'UNDER_VERIFICATION'].includes(f.status)) out.push(alertBox('info', 'hourglass', t('ifdr.al.verifying_t'), t('ifdr.al.verifying')));
  if (f.status === 'ACTIVE' && !succ && f.days_to_maturity < 0) {
    out.push(alertBox('danger', 'alert', t('ifdr.al.matured_t', { n: -f.days_to_maturity }), t('ifdr.al.matured'),
      el('a', { class: 'btn danger sm', href: site(`institution/submit.html?renew=${f.id}`), html: btnHtml('refresh', t('ifdr.renew')) })));
  } else if (f.status === 'ACTIVE' && !succ && f.days_to_maturity <= 90) {
    out.push(alertBox('warning', 'clock', t('ifdr.al.expiring_t', { when: relDays(f.days_to_maturity) }), t('ifdr.al.expiring', { d: fmtDate(f.maturity_date) }),
      el('a', { class: 'btn saffron sm', href: site(`institution/submit.html?renew=${f.id}`), html: btnHtml('refresh', t('ifdr.renew')) })));
  }
  if (succ && f.status === 'ACTIVE') {
    out.push(alertBox('info', 'refresh', t('ifdr.al.renewal_pending_t'), t('ifdr.al.renewal_pending', { ref: succ.ref_no }),
      el('a', { class: 'btn secondary sm', href: site(`institution/fdr.html?id=${succ.id}`) }, `${t('ifdr.open')} ${succ.ref_no}`)));
  }
  if (rel) {
    out.push(alertBox(rel.status === 'RETURNED' ? 'warning' : 'info', 'unlock', t('ifdr.al.release_t'),
      t('ifdr.al.release', { ref: rel.ref_no, stage: t(`ifdr.stage.${rel.status}`, { _default: rel.status }) }),
      el('a', { class: 'btn secondary sm', href: site(`institution/release.html?id=${rel.id}`) }, `${t('ifdr.open')} ${rel.ref_no}`)));
  }
  if (f.status === 'RELEASED') {
    const r = (f.releases || []).find((x) => x.status === 'RELEASED');
    out.push(alertBox('success', 'check-circle', t('ifdr.al.released_t'), t('ifdr.al.released'),
      r ? el('a', { class: 'btn success sm', href: site(`institution/release.html?id=${r.id}`), html: btnHtml('file-check', r.ref_no) }) : null));
  }
  if (f.status === 'RENEWED' && f.successor_id) {
    const s = (f.chain || []).find((c) => c.id === f.successor_id);
    out.push(alertBox('info', 'refresh', t('ifdr.al.renewed_t'), t('ifdr.al.renewed', { ref: s ? s.ref_no : `#${f.successor_id}` }),
      el('a', { class: 'btn secondary sm', href: site(`institution/fdr.html?id=${f.successor_id}`) }, `${t('ifdr.open')} ${s ? s.ref_no : ''}`)));
  }
  if (f.status === 'REJECTED') out.push(alertBox('danger', 'x-circle', t('ifdr.al.rejected_t'), t('ifdr.al.rejected')));
  if (f.status === 'INVOKED') out.push(alertBox('danger', 'ban', t('ifdr.al.invoked_t'), t('ifdr.al.invoked')));
  return out.length ? el('div', { class: 'stack' }, out) : null;
}

/* ------------------------------------------------------------------ hero */
function heroCard() {
  const f = fdr;
  const live = !['RENEWED', 'RELEASED', 'REJECTED', 'INVOKED'].includes(f.status);
  const lv = Number(f.trust_level) || 0;
  const ladderIcons = ['user', 'file-check', 'shield-check'];
  const ladder = el('div', { class: 'trust-ladder ifdr-ladder' }, [0, 1, 2].map((i) => el('div', { class: `rung l${i} ${i <= lv ? 'on' : ''} ${i === lv ? 'current' : ''}` },
    el('div', { class: 'r-title', html: `${icon(ladderIcons[i], 15)}<span>${i} · ${esc(t(`trust.${i}`))}</span>` }),
    el('div', {}, t(`ifdr.ladder.${i}`)),
    i === lv ? el('span', { class: 'r-here' }, `● ${t('ifdr.ladder.here')}`) : null)));
  const facts = dl([
    [t('f.fdr_number'), `<span class="mono">${esc(f.fdr_number)}</span>`],
    [t('f.bank'), esc(f.bank ? f.bank.name : '—')],
    [t('f.branch'), esc(f.branch || '—')],
    [t('f.ifsc'), `<span class="mono">${esc(f.ifsc || '—')}</span>`],
    [t('f.issue_date'), fmtDate(f.issue_date)],
    [t('f.maturity_date'), `${fmtDate(f.maturity_date)} ${live ? maturityChip(f.days_to_maturity) : ''}`],
    [t('f.interest_rate'), f.interest_rate ? esc(t('ifdr.f.pa', { n: f.interest_rate })) : '—'],
    [t('f.tenure'), f.tenure_months ? esc(t('ifdr.f.months', { n: f.tenure_months })) : '—'],
    [t('f.depositor'), esc(f.depositor_name || '—')],
    [t('ifdr.f.beneficiary'), esc(f.beneficiary || '—')],
    [t('f.purpose'), esc(f.purpose || '—')],
    [t('f.lien'), lienBadge(f.lien_confirmed, f.lien_claimed)],
    [t('ifdr.f.auto_renew'), esc(f.auto_renew ? t('ifdr.yes') : t('ifdr.no'))],
  ], { cols: 3 });
  return el('section', { class: `card accent-top ${f.flagged ? 'accent-danger' : ''}` },
    el('div', { class: 'card-body ifdr-hero' },
      el('div', {},
        el('div', { class: 'ifdr-badges', html: `${statusBadge(f.display_status)} ${trustBadge(f.trust_level, f.flagged)}` }),
        el('div', { class: 'muted small' }, t('f.amount')),
        el('div', { class: 'ifdr-amt' }, fmtINR(f.amount)),
        el('div', { class: 'ifdr-bank' },
          el('div', { class: 'feature-icon', html: icon('bank', 22) }),
          el('div', {},
            el('div', { class: 'muted small' }, t('ifdr.held_with')),
            el('div', { style: { fontWeight: 700 } }, f.bank ? f.bank.name : '—'),
            el('div', { class: 'muted small mono' }, f.fdr_number))),
        el('div', { class: 'muted small mt-2', html: `${icon('clock', 13)} ${esc(t('ifdr.submitted_on', { d: fmtDateTime(f.submitted_at) }))}` })),
      facts),
    el('div', { class: 'card-foot', style: { display: 'block' } },
      el('div', { class: 'row between', style: { marginBottom: '10px' } },
        el('strong', { html: `${icon('layers', 16)} ${esc(t('ifdr.ladder.title'))}` })),
      ladder,
      el('div', { class: 'ifdr-ladder-note', html: `${icon(f.flagged ? 'flag' : 'info', 14)} ${esc(f.flagged ? t('ifdr.ladder.flagged') : t(`ifdr.ladder.next.${lv}`))}` })));
}

/* ------------------------------------------------------------------ discrepancies */
function discCard() {
  const list = (fdr.discrepancies || []).slice().sort((a, b) => (a.status === 'open' ? 0 : 1) - (b.status === 'open' ? 0 : 1));
  if (!list.length) return null;
  const upload = canUpload(fdr);
  return el('section', { class: 'card', 'aria-labelledby': 'disc-h' },
    el('div', { class: 'card-head' },
      el('h2', { id: 'disc-h', html: `${icon('flag', 18)}<span>${esc(t('ifdr.disc.title'))}</span>` }),
      el('span', { class: 'sub' }, t('ifdr.disc.sub'))),
    el('div', { class: 'card-body stack' }, list.map((d) => {
      const open = d.status === 'open';
      const src = t(`ifdr.disc.src.${d.source}`, { _default: d.source || '' });
      const days = daysBetween(d.raised_at, meta?.today);
      return el('div', { class: `ifdr-disc isev-${d.severity} ${open ? '' : 'done'}` },
        el('div', { class: 'd-head' },
          el('div', { class: 'd-title' }, dcTitle(d)),
          el('span', { html: open ? severityBadge(d.severity) : `<span class="badge b-success">${icon('check', 12)}${esc(t(d.status === 'waived' ? 'ifdr.disc.waived' : 'ifdr.disc.resolved', { d: fmtDate(d.resolved_at) }))}</span>` })),
        d.message ? el('div', { class: 'text-2 small mt-1' }, d.message) : null,
        el('div', { class: 'muted small mt-1' }, t('ifdr.disc.raised', { when: days === null ? fmtDate(d.raised_at) : relDays(-days, { past: 'ago' }), by: src })),
        open ? el('div', { class: 'd-fix', html: `<strong>${esc(t('ifdr.disc.fix'))}:</strong> ${esc(t(`ifdr.fx.${d.code}`, { _default: t('ifdr.fx.OTHER') }))}` }) : null,
        d.institution_response ? el('div', { class: 'd-resp' },
          el('div', { class: 'small', style: { fontWeight: 600 } }, t('ifdr.disc.your_resp', { d: fmtDateTime(d.responded_at) })),
          el('div', {}, d.institution_response),
          open ? el('div', { class: 'small muted mt-1', html: `${icon('hourglass', 12)} ${esc(t('ifdr.disc.awaiting'))}` }) : null) : null,
        !open && d.resolution_note ? el('div', { class: 'd-resp' }, d.resolution_note) : null,
        open ? el('div', { class: 'd-actions' },
          el('button', { class: `btn sm ${d.institution_response ? 'secondary' : ''}`, type: 'button', onclick: () => respond(d), html: btnHtml('send', d.institution_response ? t('ifdr.respond_again') : t('ifdr.respond')) }),
          upload ? el('button', { class: 'btn sm secondary', type: 'button', onclick: () => uploadDoc(), html: btnHtml('upload', t('ifdr.upload')) }) : null) : null);
    })));
}

/* ------------------------------------------------------------------ comparison */
function cmpFmt(v, field) {
  if (v === null || v === undefined || v === '') return '—';
  if (field === 'amount') return fmtINR(v);
  if (/date/.test(field)) return fmtDate(v);
  if (field === 'lien') return v === false || /^(no|false|none|not)/i.test(String(v)) ? t('ifdr.no') : `${t('ifdr.yes')}${typeof v === 'string' && !/^(yes|true)$/i.test(v) ? ` (${v})` : ''}`;
  return String(v);
}
function cmpNorm(v, field) {
  if (field === 'lien') return !(v === false || /^(no|false|none|not)/i.test(String(v)));
  if (field === 'amount') return Number(v);
  return String(v).trim().toUpperCase();
}
function cmpCell(val, claimed, field) {
  if (val === null || val === undefined || val === '') return el('td', { class: 'na' }, '—');
  const same = claimed === null || claimed === undefined || cmpNorm(val, field) === cmpNorm(claimed, field);
  return el('td', { class: same ? 'ok' : 'bad' }, `${same ? '✓ ' : '✗ '}${cmpFmt(val, field)}`);
}

function compareCard() {
  const rows = (fdr.comparison || []).filter((r) => r.document != null || r.qr != null || r.bank != null);
  const body = el('div', { class: 'card-body flush' });
  const card = el('section', { class: 'card', 'aria-labelledby': 'cmp-h' },
    el('div', { class: 'card-head' },
      el('h2', { id: 'cmp-h', html: `${icon('check-circle', 18)}<span>${esc(t('ifdr.cmp.title'))}</span>` }),
      el('span', { class: 'sub' }, t('ifdr.cmp.sub'))),
    body);
  if (!rows.length) { emptyState(body, { icon: 'scan', title: t('ifdr.cmp.empty') }); return card; }
  const fmt = cmpFmt;
  mount(body, el('div', { class: 'table-wrap' }, el('table', { class: 'table compare-table compact' },
    el('thead', {}, el('tr', {}, ['field', 'claimed', 'document', 'qr', 'bank'].map((k) => el('th', { scope: 'col' }, t(`ifdr.cmp.${k}`))))),
    el('tbody', {}, rows.map((r) => el('tr', {},
      el('td', { style: { fontWeight: 600 } }, t(`f.${r.field}`, { _default: r.label })),
      el('td', { class: r.field === 'fdr_number' || r.field === 'aicte_id' ? 'mono' : '' }, fmt(r.claimed, r.field)),
      cmpCell(r.document, r.claimed, r.field), cmpCell(r.qr, r.claimed, r.field), cmpCell(r.bank, r.claimed, r.field)))))));
  return card;
}

/* ------------------------------------------------------------------ documents */
function docsCard() {
  const docs = fdr.documents || [];
  const viewer = el('div', { class: 'ifdr-viewer' });
  const list = el('div', { class: 'list-divided ifdr-docs' });
  const card = el('section', { class: 'card', 'aria-labelledby': 'docs-h' },
    el('div', { class: 'card-head' },
      el('h2', { id: 'docs-h', html: `${icon('file-text', 18)}<span>${esc(t('ifdr.docs.title'))}</span>` }),
      canUpload(fdr) ? el('button', { class: 'btn sm secondary', type: 'button', onclick: () => uploadDoc(), html: btnHtml('upload', t('common.upload')) }) : null),
    list, el('div', { class: 'card-body' }, viewer));
  if (!docs.length) { emptyState(list, { icon: 'file', title: t('ifdr.docs.empty') }); viewer.remove(); return card; }
  if (!docs.some((d) => d.id === selDocId)) selDocId = docs[docs.length - 1].id;
  function show() {
    list.querySelectorAll('.list-item').forEach((n) => n.classList.toggle('sel', Number(n.dataset.id) === selDocId));
    const d = docs.find((x) => x.id === selDocId);
    if (!d) { mount(viewer, el('div', { class: 'muted small' }, t('ifdr.docs.select'))); return; }
    const src = fileUrl(d.file_url);
    mount(viewer,
      String(d.mime || '').startsWith('image/')
        ? el('img', { src, alt: `${t(`ifdr.kind.${d.kind}`, { _default: d.kind })} - ${d.filename}` })
        : el('iframe', { class: 'doc-frame', src, title: d.filename }),
      el('div', { class: 'row end mt-2' }, el('a', { class: 'btn sm ghost', href: src, target: '_blank', rel: 'noopener', html: btnHtml('arrow-up-right', t('ifdr.docs.new_tab')) })));
  }
  docs.slice().reverse().forEach((d) => {
    const sig = d.qr_valid === true ? `<span class="badge b-success">${icon('shield-check', 12)}${esc(t('ifdr.docs.signed'))}</span>`
      : d.qr_valid === false ? `<span class="badge b-danger">${icon('shield-alert', 12)}${esc(t('ifdr.docs.bad_sig'))}</span>`
        : (d.kind === 'fdr_certificate' || d.kind === 'renewal_certificate') ? `<span class="badge b-slate">${esc(t('ifdr.docs.unsigned'))}</span>` : '';
    const flags = d.tamper_flags ? ` <span class="badge b-orange">${icon('flag', 12)}${esc(t('ifdr.docs.flags'))}</span>` : '';
    const item = el('div', {
      class: 'list-item', tabindex: 0, role: 'button', dataset: { id: d.id }, 'aria-label': `${t('ifdr.docs.view')} ${d.filename}`,
      onclick: () => { selDocId = d.id; show(); },
      onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selDocId = d.id; show(); } },
    },
    el('div', { class: 'li-icon', html: icon(String(d.mime || '').startsWith('image/') ? 'camera' : 'file-text', 18) }),
    el('div', { class: 'li-main' },
      el('div', { class: 'li-title' }, t(`ifdr.kind.${d.kind}`, { _default: d.kind })),
      el('div', { class: 'li-sub' }, `${d.filename} · ${fmtBytes(d.size)} · ${fmtDateTime(d.uploaded_at)}`),
      sig || flags ? el('div', { class: 'mt-1', html: sig + flags }) : null),
    el('span', { class: 'btn sm ghost', html: btnHtml('eye', t('ifdr.docs.view')) }));
    list.appendChild(item);
  });
  show();
  return card;
}

/* ------------------------------------------------------------------ history */
function historyCard() {
  const body = el('div', { class: 'card-body' });
  const items = (fdr.timeline || [])
    .filter((e) => !(e.action === 'OBSERVATION_ADDED' && /internal/i.test(e.summary || '')) && e.action !== 'LOGIN')
    .slice().reverse()
    .map((e) => {
      const tone = /REJECT|FAILED|INVOKED|DISCREPANCY_RAISED|RETURNED/.test(e.action) ? 'danger'
        : /ACCEPTED|VERIFIED|RESOLVED|NOC|RENEWED/.test(e.action) ? 'success' : /PICKED|RESPONDED|UPLOADED/.test(e.action) ? '' : 'muted';
      const who = e.actor_name ? `${e.actor_name}${e.actor_role ? ` (${t(`role.${e.actor_role}`, { _default: e.actor_role })})` : ''}` : t('ifdr.disc.src.system');
      return { title: t(`ifdr.ev.${e.action}`, { _default: t('ifdr.ev.other') }), meta: `${fmtDateTime(e.at)} · ${who}`, body: e.summary, tone };
    });
  if (items.length) timeline(body, items); else emptyState(body, { icon: 'history', title: t('ifdr.hist.empty') });
  return el('section', { class: 'card', 'aria-labelledby': 'hist-h' },
    el('div', { class: 'card-head' }, el('h2', { id: 'hist-h', html: `${icon('history', 18)}<span>${esc(t('ifdr.hist.title'))}</span>` })),
    body);
}

/* ------------------------------------------------------------------ side cards */
function doCard() {
  const f = fdr;
  const succ = successorPending(f);
  const row = (ic, tone, name, text, btn) => el('div', { class: 'ifdr-act' },
    el('div', { class: `feature-icon ${tone}`, html: icon(ic, 20) }),
    el('div', { class: 'grow' }, el('div', { class: 'a-name' }, name), el('div', { class: 'small muted' }, text), btn ? el('div', { class: 'mt-2' }, btn) : null));
  const renew = canRenew(f);
  const rel = canRelease(f);
  const up = canUpload(f);
  return el('section', { class: 'card' },
    el('div', { class: 'card-head' }, el('h2', { html: `${icon('zap', 18)}<span>${esc(t('ifdr.do.title'))}</span>` })),
    el('div', { class: 'card-body' },
      row('refresh', renew ? 'saffron' : '', t('ifdr.renew'), renew ? t('ifdr.do.renew') : succ ? t('ifdr.do.renew_done') : t('ifdr.do.renew_no'),
        renew ? el('a', { class: 'btn sm saffron', href: site(`institution/submit.html?renew=${f.id}`), html: btnHtml('refresh', t('ifdr.renew')) }) : null),
      row('unlock', rel ? 'green' : '', t('ifdr.request_release'), rel ? t('ifdr.do.release') : t('ifdr.do.release_no'),
        rel ? el('button', { class: 'btn sm secondary', type: 'button', onclick: requestRelease, html: btnHtml('unlock', t('ifdr.request_release')) }) : null),
      row('upload', up ? 'violet' : '', t('ifdr.upload'), up ? t('ifdr.do.upload') : t('ifdr.do.upload_no'),
        up ? el('button', { class: 'btn sm secondary', type: 'button', onclick: () => uploadDoc(), html: btnHtml('upload', t('common.upload')) }) : null),
      row('qr', 'teal', t('ifdr.do.verify'), t('ifdr.do.verify_t'),
        el('a', { class: 'btn sm ghost', href: site('verify.html'), html: btnHtml('arrow-up-right', t('ifdr.do.verify')) }))));
}

function obsCard() {
  const obs = (fdr.observations || []).filter((o) => o.visibility !== 'internal');
  const body = el('div', { class: 'card-body' });
  if (!obs.length) mount(body, el('div', { class: 'muted small', html: `${icon('mail', 14)} ${esc(t('ifdr.obs.empty'))}` }));
  else {
    mount(body, obs.slice().reverse().map((o) => el('div', { class: 'ifdr-obs' },
      el('div', {}, o.text),
      el('div', { class: 'muted small mt-1' }, `${o.user ? `${o.user.name}${o.user.designation ? `, ${o.user.designation}` : ''}` : 'AICTE'} · ${fmtDateTime(o.created_at)}`))));
  }
  return el('section', { class: 'card' },
    el('div', { class: 'card-head' }, el('h2', { html: `${icon('mail', 18)}<span>${esc(t('ifdr.obs.title'))}</span>` }), obs.length ? el('span', { class: 'badge b-info' }, String(obs.length)) : null),
    body);
}

function chainCard() {
  const chain = fdr.chain || [];
  const body = el('div', { class: 'card-body' });
  if (chain.length <= 1) mount(body, el('div', { class: 'muted small', html: `${icon('git-branch', 14)} ${esc(t('ifdr.chain.single'))}` }));
  else {
    timeline(body, chain.map((c) => ({
      title: c.is_current ? el('span', {}, el('strong', { class: 'mono' }, c.ref_no), ` · ${t('ifdr.chain.this')}`)
        : el('a', { class: 'mono', href: site(`institution/fdr.html?id=${c.id}`) }, c.ref_no),
      meta: `${fmtINR(c.amount)} · ${fmtDate(c.issue_date)} → ${fmtDate(c.maturity_date)}`,
      body: el('div', { class: 't-body', html: `${statusBadge(c.display_status)}${c.renewed_late ? ` <span class="badge b-warning">${esc(t('ifdr.chain.late'))}</span>` : ''}` }),
      tone: c.status === 'ACTIVE' ? 'success' : c.status === 'REJECTED' ? 'danger' : c.is_current ? '' : 'muted',
    })));
  }
  return el('section', { class: 'card' },
    el('div', { class: 'card-head' }, el('h2', { html: `${icon('git-branch', 18)}<span>${esc(t('ifdr.chain.title'))}</span>` }), el('span', { class: 'sub' }, t('ifdr.chain.sub'))),
    body);
}

function releasesCard() {
  const rels = fdr.releases || [];
  const body = el('div', { class: 'list-divided' });
  if (!rels.length) mount(body, el('div', { class: 'card-body muted small' }, t('ifdr.rel.empty')));
  else {
    rels.forEach((r) => body.appendChild(el('a', { class: 'list-item', href: site(`institution/release.html?id=${r.id}`), style: { color: 'inherit', textDecoration: 'none' } },
      el('div', { class: 'li-icon', html: icon('stamp', 18) }),
      el('div', { class: 'li-main' },
        el('div', { class: 'li-title row', style: { gap: '8px' } }, el('span', { class: 'mono' }, r.ref_no), el('span', { html: releaseBadge(r.status) })),
        el('div', { class: 'li-sub' }, `${t(`rtype.${r.request_type}`, { _default: r.request_type })} · ${fmtDate(r.requested_at)}`)),
      el('span', { class: 'muted', html: icon('chevron-right', 18) }))));
  }
  return el('section', { class: 'card' },
    el('div', { class: 'card-head' }, el('h2', { html: `${icon('unlock', 18)}<span>${esc(t('ifdr.rel.title'))}</span>` })),
    body);
}

/* ------------------------------------------------------------------ dialogs */
function respond(d) {
  const ta = el('textarea', { class: 'textarea', id: 'resp-text', rows: 5, placeholder: t('ifdr.m.respond_ph') });
  const err = el('div', { class: 'error', hidden: true }, t('ifdr.m.respond_min'));
  modal({
    title: t('ifdr.m.respond_t'),
    body: el('div', { class: 'stack' },
      el('div', { class: 'alert warning' }, el('span', { html: icon('flag', 18) }),
        el('div', {}, el('div', { class: 'a-title' }, dcTitle(d)), d.message ? el('div', {}, d.message) : null)),
      el('div', { class: 'field' }, el('label', { for: 'resp-text' }, t('ifdr.m.respond_l'), el('span', { class: 'req' }, ' *')), ta, err,
        el('span', { class: 'hint' }, t('ifdr.m.respond_hint')))),
    actions: [
      { label: t('common.cancel') },
      {
        label: t('ifdr.m.send'), variant: 'primary',
        onClick: async (close, btn) => {
          const v = ta.value.trim();
          if (v.length < 10) { err.hidden = false; ta.classList.add('invalid'); ta.focus(); return false; }
          try {
            await api.post(`/discrepancies/${d.id}/respond`, { response: v });
          } catch (e) { toast(e.message || t('common.error'), 'error'); return false; }
          toast(t('ifdr.m.respond_ok'), 'success');
          load();
          return true;
        },
      },
    ],
  });
}

function uploadDoc() {
  const kinds = ['fdr_certificate', 'renewal_certificate', 'bank_letter', 'supporting'];
  const sel = el('select', { class: 'select', id: 'up-kind' }, kinds.map((k) => el('option', { value: k }, t(`ifdr.kind.${k}`))));
  const file = el('input', { class: 'input', type: 'file', id: 'up-file', accept: '.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg' });
  const err = el('div', { class: 'error', hidden: true }, t('ifdr.m.file_req'));
  modal({
    title: t('ifdr.m.upload_t'),
    body: el('div', { class: 'form-grid' },
      el('div', { class: 'field full' }, el('label', { for: 'up-kind' }, t('ifdr.m.kind')), sel),
      el('div', { class: 'field full' }, el('label', { for: 'up-file' }, t('ifdr.m.file'), el('span', { class: 'req' }, ' *')), file, err,
        el('span', { class: 'hint' }, t('ifdr.m.upload_hint')))),
    actions: [
      { label: t('common.cancel') },
      {
        label: t('ifdr.m.upload_btn'), variant: 'primary',
        onClick: async () => {
          const f = file.files && file.files[0];
          if (!f) { err.hidden = false; file.classList.add('invalid'); return false; }
          const fd = new FormData();
          fd.append('file', f, f.name);
          fd.append('kind', sel.value);
          try {
            const doc = await api.upload(`/fdrs/${fdr.id}/documents`, fd);
            if (doc && doc.id) selDocId = doc.id;
          } catch (e) { toast(e.message || t('common.error'), 'error'); return false; }
          toast(t('ifdr.m.upload_ok'), 'success');
          load();
          return true;
        },
      },
    ],
  });
}

function requestRelease() {
  const types = Object.keys(meta?.request_types || { release: 1, refund: 1, discharge: 1 });
  const sel = el('select', { class: 'select', id: 'rel-type' }, types.map((k) => el('option', { value: k }, t(`ifdr.rt.${k}`, { _default: meta?.request_types?.[k] || k }))));
  const ta = el('textarea', { class: 'textarea', id: 'rel-reason', rows: 4, placeholder: t('ifdr.m.rel_ph') });
  const err = el('div', { class: 'error', hidden: true }, t('ifdr.m.rel_min'));
  modal({
    title: t('ifdr.m.rel_t'),
    body: el('div', { class: 'stack' },
      el('div', { class: 'row', style: { gap: '10px' } },
        el('span', { class: 'mono', style: { fontWeight: 700 } }, fdr.ref_no),
        el('span', {}, `${fmtINR(fdr.amount)} · ${fdr.bank ? fdr.bank.name : ''}`),
        el('span', { html: maturityChip(fdr.days_to_maturity) })),
      el('div', { class: 'field' }, el('label', { for: 'rel-type' }, t('ifdr.m.rel_type')), sel),
      el('div', { class: 'field' }, el('label', { for: 'rel-reason' }, t('ifdr.m.rel_reason'), el('span', { class: 'req' }, ' *')), ta, err),
      el('div', { class: 'alert info' }, el('span', { html: icon('info', 18) }), el('div', { class: 'small' }, t('ifdr.m.rel_note')))),
    actions: [
      { label: t('common.cancel') },
      {
        label: t('ifdr.m.rel_btn'), variant: 'primary',
        onClick: async () => {
          const reason = ta.value.trim();
          if (reason.length < 15) { err.hidden = false; ta.classList.add('invalid'); ta.focus(); return false; }
          let rel;
          try {
            rel = await api.post('/releases', { fdr_id: fdr.id, request_type: sel.value, reason });
          } catch (e) { toast(e.message || t('common.error'), 'error'); return false; }
          toast(t('ifdr.m.rel_ok', { ref: rel.ref_no || '' }), 'success');
          setTimeout(() => { location.href = site(`institution/release.html?id=${rel.id}`); }, 700);
          return true;
        },
      },
    ],
  });
}

/* ------------------------------------------------------------------ render */
function render() {
  if (!fdr) return;
  setPageHead({
    title: { en: fdr.ref_no, hi: fdr.ref_no },
    subtitle: `${fdr.bank ? fdr.bank.name : ''} · ${t('f.fdr_number')} ${fdr.fdr_number} · ${fmtINR(fdr.amount)}`,
    breadcrumbs: [{ label: 'nav.dashboard', href: 'institution/dashboard.html' }, { label: 'ifdr.my_fdrs', href: 'institution/fdrs.html' }, { label: fdr.ref_no }],
    actions: headActions,
  });
  document.title = `${fdr.ref_no} · Nidhi Kavach`;
  mount(root,
    alerts(),
    heroCard(),
    el('div', { class: 'grid g-2-1' },
      el('div', { class: 'stack lg', style: { minWidth: 0 } }, discCard(), compareCard(), docsCard(), historyCard()),
      el('div', { class: 'stack lg', style: { minWidth: 0 } }, doCard(), obsCard(), chainCard(), releasesCard())));
}

async function load() {
  if (!id) {
    emptyState(root, { icon: 'file', title: t('ifdr.no_id'), action: el('a', { class: 'btn', href: site('institution/fdrs.html') }, t('ifdr.my_fdrs')) });
    return;
  }
  if (!fdr) loading(root);
  try {
    fdr = await api.get(`/fdrs/${encodeURIComponent(id)}`);
    render();
  } catch (err) {
    fdr = null;
    errorState(root, err, load);
  }
}

onLang(render);
load();
