// Institution: smart FDR submission - upload receipt -> portal reads it (PDF text / browser OCR + bank-signed QR) -> review -> declare & submit.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, mount, dl, stepper, toast, withBusy, statusBadge, trustBadge, severityBadge, maturityChip, fmtINR,
  fmtDate, fmtBytes, timeline, getParam, downloadBlob, daysBetween,
} from '../assets/js/ui.js';

extend({
  en: {
    'isub.title': 'Submit an FDR',
    'isub.subtitle': 'Upload the bank receipt - the portal reads it, checks the bank signature and fills the form for you',
    'isub.title_renew': 'Submit a renewed FDR',
    'isub.s1': 'Upload receipt', 'isub.s2': 'Review details', 'isub.s3': 'Declare & submit',
    'isub.renew.t': 'Renewal of {ref}',
    'isub.renew.text': '{amount} with {bank} · FDR {fdr} · matures {date}. Upload the renewed receipt issued by the bank; the old instrument is closed once AICTE accepts the new one.',
    'isub.renew.bad': 'This instrument cannot be renewed because it is no longer active. Submit a fresh FDR instead.',
    'isub.renew.err': 'The instrument to renew could not be loaded.',
    'isub.dz.title': 'Drop the FDR receipt here',
    'isub.dz.or': 'or click to browse',
    'isub.dz.formats': 'PDF from the bank, or a photo / scan (PNG, JPG) · up to 10 MB',
    'isub.dz.aria': 'Choose the FDR receipt file',
    'isub.bad_type': 'Please choose a PDF, PNG or JPG file.',
    'isub.too_big': 'The file is larger than 10 MB.',
    'isub.change': 'Choose another file',
    'isub.reading_pdf': 'Reading the receipt and checking the bank signature…',
    'isub.ocr.load': 'Preparing the text reader…',
    'isub.ocr.lang': 'Loading English language data…',
    'isub.ocr.run': 'Reading text from the photo…',
    'isub.ocr.done': 'Text read. Checking the bank signature…',
    'isub.ocr.fail': 'The text reader could not run in this browser. The bank-signed QR will still be checked.',
    'isub.extract_fail': 'The receipt could not be analysed: {msg}. You can still continue and fill in the details yourself.',
    'isub.found': 'What we found',
    'isub.sig.valid_t': 'Digitally signed by {bank}',
    'isub.sig.valid': 'The bank-signed QR is genuine (key {key}). Details below are taken from the bank\'s own record.',
    'isub.sig.invalid_t': 'Signature invalid',
    'isub.sig.invalid': 'The QR code on this receipt is not a valid bank signature. The receipt may be forged or altered. {err}',
    'isub.sig.none_t': 'No digital signature',
    'isub.sig.none': 'No bank-signed QR was found on this receipt. An officer will verify it with the bank manually.',
    'isub.fields': 'Details read from the receipt',
    'isub.fields_none': 'No text could be read from the receipt. Please type the details in the next step.',
    'isub.engine.pdf-text': 'Read from PDF text', 'isub.engine.ocr-client': 'Read with in-browser OCR', 'isub.engine.qr-only': 'Read from the QR code only', 'isub.engine.none': 'Nothing could be read',
    'isub.tamper_t': 'Possible tampering detected',
    'isub.tamper': 'Our checks found signs that this file was altered. You may still submit it, but it will be flagged for the verifying officer.',
    'isub.dup_t': 'Already used elsewhere',
    'isub.dup_file': 'This exact file was uploaded for {ref} ({inst}).',
    'isub.dup_fdr': 'FDR number already lodged as {ref} ({inst}, {status}).',
    'isub.aid_t': 'AICTE ID does not match',
    'isub.aid': 'The receipt is in favour of AICTE ID {doc}, but your institution\'s ID is {mine}.',
    'isub.demo.t': 'No receipt handy? Use a demo receipt',
    'isub.demo.text': 'A specimen receipt is issued just now for your institution by a demo bank.',
    'isub.demo.genuine': 'Genuine sample',
    'isub.demo.forged': 'Forged sample (to see fraud detection)',
    'isub.demo.download': 'Download the sample',
    'isub.demo.fail': 'The demo receipt could not be generated: {msg}',
    'isub.next_review': 'Continue to review',
    'isub.next_manual': 'Continue and fill in manually',
    'isub.back': 'Back',
    'isub.next_declare': 'Continue',
    'isub.form.t': 'Check the details',
    'isub.form.sub': 'Fields filled from the receipt are highlighted. Correct anything that is wrong - differences from the receipt are flagged for the officer.',
    'isub.f.bank_ph': 'Select the issuing bank',
    'isub.f.amount_hint': 'In rupees, without commas',
    'isub.f.notes': 'Notes for AICTE (optional)',
    'isub.f.notes_ph': 'Anything the verifying officer should know',
    'isub.f.rate': 'Interest rate (% p.a.)',
    'isub.f.tenure': 'Tenure (months)',
    'isub.src.qr': 'From the bank-signed QR',
    'isub.src.receipt': 'From receipt',
    'isub.differs': 'Differs from the receipt ({v})',
    'isub.differs_qr': 'Differs from the bank-signed record ({v})',
    'isub.diff_t': 'Your entries differ from the receipt',
    'isub.diff': 'Fields: {list}. You can submit, but the differences will be raised as discrepancies for the officer.',
    'isub.req': 'This field is required.',
    'isub.amount_bad': 'Enter an amount greater than zero.',
    'isub.mat_bad': 'Maturity date must be after the issue date.',
    'isub.fix_errors': 'Please correct the highlighted fields.',
    'isub.p.new': 'Security deposit - new institution approval',
    'isub.p.ext': 'Security deposit - extension of approval',
    'isub.p.intake': 'Security deposit - increase in intake',
    'isub.p.course': 'Security deposit - new course',
    'isub.p.renewal': 'Renewal of existing FDR',
    'isub.lien': 'Lien is marked in favour of AICTE',
    'isub.lien_help': 'A lien means the bank will not let the deposit be withdrawn or closed without AICTE\'s consent. AICTE accepts only lien-marked FDRs in favour of the Member Secretary, AICTE.',
    'isub.auto': 'The bank will auto-renew this deposit on maturity',
    'isub.auto_help': 'You must still upload the renewed receipt when it is issued.',
    'isub.sum.t': 'Summary of your submission',
    'isub.sum.file': 'Receipt file',
    'isub.sum.sig': 'Bank signature',
    'isub.sum.sig.valid': 'Valid - signed by {bank}',
    'isub.sum.sig.invalid': 'Invalid',
    'isub.sum.sig.none': 'Not present',
    'isub.sum.flags': 'Checks to note',
    'isub.sum.flags_none': 'None',
    'isub.sum.flags_n': '{n} item(s) will be reviewed by the officer',
    'isub.declare': 'I declare that the details above are true and complete, that the receipt is genuine and was issued by the bank named above, and that the deposit is held under lien in favour of AICTE. I understand that furnishing false information may lead to action under AICTE regulations.',
    'isub.declare_req': 'Please accept the declaration to submit.',
    'isub.submit': 'Submit FDR',
    'isub.submit_fail': 'Submission failed: {msg}',
    'isub.done.t': 'FDR submitted successfully',
    'isub.done.text': 'Keep this reference number for your records.',
    'isub.done.trust': 'Current trust level',
    'isub.done.flags': 'The portal noted {n} point(s) that the officer will check. You will be asked to respond if needed.',
    'isub.done.next': 'What happens next',
    'isub.done.n1': 'An AICTE officer picks up your submission for verification.',
    'isub.done.n2': 'The deposit and the lien are confirmed with the issuing bank.',
    'isub.done.n3': 'You are notified when it is accepted, or asked to respond to any discrepancy.',
    'isub.done.n4': 'We remind you before maturity so you can renew in time.',
    'isub.done.view': 'View FDR',
    'isub.done.another': 'Submit another',
    'isub.done.dash': 'Go to dashboard',
    'isub.help.t': 'How smart submission works',
    'isub.help.1': 'Upload the receipt exactly as issued by the bank (PDF), or a clear photo.',
    'isub.help.2': 'The portal reads the text, verifies the bank\'s digital signature in the QR code and checks for tampering and duplicates.',
    'isub.help.3': 'You confirm the auto-filled details and submit. Nothing is saved until you submit.',
    'isub.help.sig_t': 'Bank-signed QR receipts',
    'isub.help.sig': 'Participating banks print a QR code signed with their private key. Any change to the amount, dates or FDR number breaks the signature, so a genuine receipt is recognised instantly.',
    'isub.help.ladder_t': 'Trust ladder',
    'isub.help.ladder': 'Claimed → Document matched → Bank verified. The higher the level, the faster AICTE can accept your deposit.',
    'isub.help.privacy': 'Photos are read inside your browser; only the text and the file are sent to the portal.',
    'isub.yes': 'Yes', 'isub.no': 'No',
  },
  hi: {
    'isub.title': 'एफडीआर जमा करें',
    'isub.subtitle': 'बैंक रसीद अपलोड करें - पोर्टल उसे पढ़कर बैंक हस्ताक्षर जाँचता है और आपके लिए प्रपत्र भरता है',
    'isub.title_renew': 'नवीनीकृत एफडीआर जमा करें',
    'isub.s1': 'रसीद अपलोड करें', 'isub.s2': 'विवरण जाँचें', 'isub.s3': 'घोषणा एवं प्रस्तुति',
    'isub.renew.t': '{ref} का नवीनीकरण',
    'isub.renew.text': '{amount}, {bank} · एफडीआर {fdr} · परिपक्वता {date}। बैंक द्वारा जारी नवीनीकृत रसीद अपलोड करें; एआईसीटीई द्वारा नई लिखत स्वीकार होने पर पुरानी लिखत बंद हो जाएगी।',
    'isub.renew.bad': 'यह लिखत अब सक्रिय नहीं है, इसलिए इसका नवीनीकरण नहीं हो सकता। इसके स्थान पर नई एफडीआर जमा करें।',
    'isub.renew.err': 'नवीनीकरण हेतु लिखत लोड नहीं हो सकी।',
    'isub.dz.title': 'एफडीआर रसीद यहाँ छोड़ें',
    'isub.dz.or': 'या फ़ाइल चुनने के लिए क्लिक करें',
    'isub.dz.formats': 'बैंक की पीडीएफ, या फ़ोटो / स्कैन (पीएनजी, जेपीजी) · अधिकतम 10 एमबी',
    'isub.dz.aria': 'एफडीआर रसीद फ़ाइल चुनें',
    'isub.bad_type': 'कृपया पीडीएफ, पीएनजी या जेपीजी फ़ाइल चुनें।',
    'isub.too_big': 'फ़ाइल 10 एमबी से बड़ी है।',
    'isub.change': 'दूसरी फ़ाइल चुनें',
    'isub.reading_pdf': 'रसीद पढ़ी जा रही है और बैंक हस्ताक्षर की जाँच हो रही है…',
    'isub.ocr.load': 'पाठ पढ़ने वाला उपकरण तैयार हो रहा है…',
    'isub.ocr.lang': 'अंग्रेज़ी भाषा डेटा लोड हो रहा है…',
    'isub.ocr.run': 'फ़ोटो से पाठ पढ़ा जा रहा है…',
    'isub.ocr.done': 'पाठ पढ़ लिया गया। बैंक हस्ताक्षर की जाँच हो रही है…',
    'isub.ocr.fail': 'इस ब्राउज़र में पाठ पढ़ने वाला उपकरण नहीं चल सका। बैंक-हस्ताक्षरित क्यूआर की जाँच फिर भी होगी।',
    'isub.extract_fail': 'रसीद का विश्लेषण नहीं हो सका: {msg}। आप आगे बढ़कर विवरण स्वयं भर सकते हैं।',
    'isub.found': 'हमें क्या मिला',
    'isub.sig.valid_t': '{bank} द्वारा डिजिटल रूप से हस्ताक्षरित',
    'isub.sig.valid': 'बैंक-हस्ताक्षरित क्यूआर वास्तविक है (कुंजी {key})। नीचे दिए विवरण बैंक के अपने रिकॉर्ड से लिए गए हैं।',
    'isub.sig.invalid_t': 'हस्ताक्षर अमान्य',
    'isub.sig.invalid': 'इस रसीद का क्यूआर कोड मान्य बैंक हस्ताक्षर नहीं है। रसीद जाली या परिवर्तित हो सकती है। {err}',
    'isub.sig.none_t': 'डिजिटल हस्ताक्षर नहीं',
    'isub.sig.none': 'इस रसीद पर बैंक-हस्ताक्षरित क्यूआर नहीं मिला। अधिकारी बैंक से इसका मैन्युअल सत्यापन करेंगे।',
    'isub.fields': 'रसीद से पढ़े गए विवरण',
    'isub.fields_none': 'रसीद से कोई पाठ नहीं पढ़ा जा सका। कृपया अगले चरण में विवरण भरें।',
    'isub.engine.pdf-text': 'पीडीएफ पाठ से पढ़ा गया', 'isub.engine.ocr-client': 'ब्राउज़र ओसीआर से पढ़ा गया', 'isub.engine.qr-only': 'केवल क्यूआर कोड से पढ़ा गया', 'isub.engine.none': 'कुछ नहीं पढ़ा जा सका',
    'isub.tamper_t': 'छेड़छाड़ की आशंका',
    'isub.tamper': 'हमारी जाँच में इस फ़ाइल में परिवर्तन के संकेत मिले हैं। आप इसे फिर भी जमा कर सकते हैं, पर यह सत्यापनकर्ता अधिकारी के लिए चिह्नित होगी।',
    'isub.dup_t': 'अन्यत्र पहले से प्रयुक्त',
    'isub.dup_file': 'यही फ़ाइल {ref} ({inst}) के लिए अपलोड की जा चुकी है।',
    'isub.dup_fdr': 'यह एफडीआर संख्या पहले से {ref} ({inst}, {status}) के रूप में दर्ज है।',
    'isub.aid_t': 'एआईसीटीई आईडी मेल नहीं खाती',
    'isub.aid': 'रसीद एआईसीटीई आईडी {doc} के पक्ष में है, जबकि आपके संस्थान की आईडी {mine} है।',
    'isub.demo.t': 'रसीद उपलब्ध नहीं? डेमो रसीद का उपयोग करें',
    'isub.demo.text': 'डेमो बैंक द्वारा आपके संस्थान के लिए अभी एक नमूना रसीद जारी की जाती है।',
    'isub.demo.genuine': 'वास्तविक नमूना',
    'isub.demo.forged': 'जाली नमूना (धोखाधड़ी पहचान देखने हेतु)',
    'isub.demo.download': 'नमूना डाउनलोड करें',
    'isub.demo.fail': 'डेमो रसीद नहीं बन सकी: {msg}',
    'isub.next_review': 'जाँच हेतु आगे बढ़ें',
    'isub.next_manual': 'आगे बढ़ें और स्वयं भरें',
    'isub.back': 'पीछे',
    'isub.next_declare': 'आगे बढ़ें',
    'isub.form.t': 'विवरण जाँचें',
    'isub.form.sub': 'रसीद से भरे गए विवरण हाइलाइट हैं। जो गलत हो उसे सुधारें - रसीद से भिन्न प्रविष्टियाँ अधिकारी के लिए चिह्नित होंगी।',
    'isub.f.bank_ph': 'जारीकर्ता बैंक चुनें',
    'isub.f.amount_hint': 'रुपये में, बिना अल्पविराम के',
    'isub.f.notes': 'एआईसीटीई हेतु टिप्पणी (वैकल्पिक)',
    'isub.f.notes_ph': 'सत्यापनकर्ता अधिकारी के लिए कोई जानकारी',
    'isub.f.rate': 'ब्याज दर (% वार्षिक)',
    'isub.f.tenure': 'अवधि (माह)',
    'isub.src.qr': 'बैंक-हस्ताक्षरित क्यूआर से',
    'isub.src.receipt': 'रसीद से',
    'isub.differs': 'रसीद से भिन्न ({v})',
    'isub.differs_qr': 'बैंक-हस्ताक्षरित रिकॉर्ड से भिन्न ({v})',
    'isub.diff_t': 'आपकी प्रविष्टियाँ रसीद से भिन्न हैं',
    'isub.diff': 'विवरण: {list}। आप जमा कर सकते हैं, पर ये अंतर अधिकारी के लिए विसंगति के रूप में दर्ज होंगे।',
    'isub.req': 'यह विवरण आवश्यक है।',
    'isub.amount_bad': 'शून्य से अधिक राशि दर्ज करें।',
    'isub.mat_bad': 'परिपक्वता तिथि जारी करने की तिथि के बाद की होनी चाहिए।',
    'isub.fix_errors': 'कृपया हाइलाइट किए गए विवरण सुधारें।',
    'isub.p.new': 'प्रतिभूति जमा - नए संस्थान का अनुमोदन',
    'isub.p.ext': 'प्रतिभूति जमा - अनुमोदन का विस्तार',
    'isub.p.intake': 'प्रतिभूति जमा - प्रवेश क्षमता में वृद्धि',
    'isub.p.course': 'प्रतिभूति जमा - नया पाठ्यक्रम',
    'isub.p.renewal': 'मौजूदा एफडीआर का नवीनीकरण',
    'isub.lien': 'एआईसीटीई के पक्ष में ग्रहणाधिकार अंकित है',
    'isub.lien_help': 'ग्रहणाधिकार का अर्थ है कि बैंक एआईसीटीई की सहमति के बिना जमा की निकासी या उसे बंद नहीं होने देगा। एआईसीटीई केवल सदस्य सचिव, एआईसीटीई के पक्ष में ग्रहणाधिकार-अंकित एफडीआर स्वीकार करता है।',
    'isub.auto': 'परिपक्वता पर बैंक इस जमा का स्वतः नवीनीकरण करेगा',
    'isub.auto_help': 'नवीनीकृत रसीद जारी होने पर उसे अपलोड करना फिर भी आवश्यक है।',
    'isub.sum.t': 'आपकी प्रस्तुति का सारांश',
    'isub.sum.file': 'रसीद फ़ाइल',
    'isub.sum.sig': 'बैंक हस्ताक्षर',
    'isub.sum.sig.valid': 'मान्य - {bank} द्वारा हस्ताक्षरित',
    'isub.sum.sig.invalid': 'अमान्य',
    'isub.sum.sig.none': 'उपलब्ध नहीं',
    'isub.sum.flags': 'ध्यान देने योग्य जाँच',
    'isub.sum.flags_none': 'कोई नहीं',
    'isub.sum.flags_n': '{n} बिंदुओं की समीक्षा अधिकारी करेंगे',
    'isub.declare': 'मैं घोषणा करता/करती हूँ कि ऊपर दिए गए विवरण सत्य और पूर्ण हैं, रसीद वास्तविक है और ऊपर उल्लिखित बैंक द्वारा जारी की गई है, तथा जमा एआईसीटीई के पक्ष में ग्रहणाधिकार के अधीन है। मैं समझता/समझती हूँ कि गलत जानकारी देने पर एआईसीटीई विनियमों के अंतर्गत कार्रवाई हो सकती है।',
    'isub.declare_req': 'जमा करने के लिए कृपया घोषणा स्वीकार करें।',
    'isub.submit': 'एफडीआर जमा करें',
    'isub.submit_fail': 'प्रस्तुति विफल: {msg}',
    'isub.done.t': 'एफडीआर सफलतापूर्वक जमा हुई',
    'isub.done.text': 'यह संदर्भ संख्या अपने रिकॉर्ड हेतु सुरक्षित रखें।',
    'isub.done.trust': 'वर्तमान विश्वास स्तर',
    'isub.done.flags': 'पोर्टल ने {n} बिंदु दर्ज किए हैं जिनकी जाँच अधिकारी करेंगे। आवश्यकता होने पर आपसे उत्तर माँगा जाएगा।',
    'isub.done.next': 'आगे क्या होगा',
    'isub.done.n1': 'एआईसीटीई अधिकारी आपकी प्रस्तुति को सत्यापन हेतु लेंगे।',
    'isub.done.n2': 'जारीकर्ता बैंक से जमा और ग्रहणाधिकार की पुष्टि की जाएगी।',
    'isub.done.n3': 'स्वीकृत होने पर आपको सूचित किया जाएगा, या किसी विसंगति पर उत्तर माँगा जाएगा।',
    'isub.done.n4': 'परिपक्वता से पहले हम आपको याद दिलाएँगे ताकि आप समय पर नवीनीकरण करा सकें।',
    'isub.done.view': 'एफडीआर देखें',
    'isub.done.another': 'एक और जमा करें',
    'isub.done.dash': 'डैशबोर्ड पर जाएँ',
    'isub.help.t': 'स्मार्ट प्रस्तुति कैसे काम करती है',
    'isub.help.1': 'बैंक द्वारा जारी रसीद (पीडीएफ) ज्यों की त्यों, या उसकी स्पष्ट फ़ोटो अपलोड करें।',
    'isub.help.2': 'पोर्टल पाठ पढ़ता है, क्यूआर कोड में बैंक के डिजिटल हस्ताक्षर का सत्यापन करता है और छेड़छाड़ तथा दोहराव की जाँच करता है।',
    'isub.help.3': 'आप स्वतः भरे विवरण की पुष्टि कर जमा करते हैं। जमा करने तक कुछ भी सहेजा नहीं जाता।',
    'isub.help.sig_t': 'बैंक-हस्ताक्षरित क्यूआर रसीदें',
    'isub.help.sig': 'सहभागी बैंक अपनी निजी कुंजी से हस्ताक्षरित क्यूआर कोड छापते हैं। राशि, तिथि या एफडीआर संख्या में कोई भी परिवर्तन हस्ताक्षर को अमान्य कर देता है, इसलिए वास्तविक रसीद तुरंत पहचानी जाती है।',
    'isub.help.ladder_t': 'विश्वास सोपान',
    'isub.help.ladder': 'दावा → दस्तावेज़ मिलान → बैंक सत्यापित। स्तर जितना ऊँचा होगा, एआईसीटीई उतनी शीघ्रता से आपकी जमा स्वीकार कर सकेगा।',
    'isub.help.privacy': 'फ़ोटो आपके ब्राउज़र में ही पढ़ी जाती हैं; केवल पाठ और फ़ाइल पोर्टल को भेजी जाती है।',
    'isub.yes': 'हाँ', 'isub.no': 'नहीं',
  },
});

const renewId = getParam('renew');
const { user, meta } = await initPage({
  roles: ['institution'],
  active: 'submit',
  title: renewId ? 'isub.title_renew' : 'isub.title',
  subtitle: 'isub.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'institution/dashboard.html' }, { label: renewId ? 'isub.title_renew' : 'isub.title' }],
});

const MAX_BYTES = 10 * 1024 * 1024;
const PURPOSES = [
  ['new', 'Security deposit - new institution approval'],
  ['ext', 'Security deposit - extension of approval'],
  ['intake', 'Security deposit - increase in intake'],
  ['course', 'Security deposit - new course'],
  ['renewal', 'Renewal of existing FDR'],
];
const FIELDS = ['fdr_number', 'amount', 'issue_date', 'maturity_date', 'branch', 'ifsc', 'interest_rate', 'tenure_months', 'depositor_name'];
const panel = $('#panel');
const banks = meta?.banks || [];

const S = {
  step: 1,
  file: null,
  busy: null, // {text, pct}
  extraction: null,
  extractError: '',
  ocrText: '',
  ocrNote: '',
  demoBlob: null,
  demoKind: '',
  src: {}, // field -> {value, from:'qr'|'receipt'}
  vals: { bank_id: '', purpose: PURPOSES[0][1], lien_claimed: true, auto_renew: false, notes: '' },
  errors: {},
  declared: false,
  result: null,
  renew: null,
  institution: null,
};
if (renewId) S.vals.purpose = PURPOSES[4][1];

const btnHtml = (ic, label) => `${icon(ic, 16)}<span>${esc(label)}</span>`;
const bankById = (id) => banks.find((b) => String(b.id) === String(id));

/* ------------------------------------------------------------------ helpers */
function fmtVal(field, v) {
  if (v === null || v === undefined || v === '') return '—';
  if (field === 'amount') return fmtINR(v);
  if (/date/.test(field)) return fmtDate(v);
  if (field === 'interest_rate') return `${v}%`;
  return String(v);
}
function norm(field, v) {
  if (v === null || v === undefined) return '';
  if (field === 'amount' || field === 'interest_rate' || field === 'tenure_months') return v === '' ? '' : Number(v);
  return String(v).trim().toUpperCase().replace(/\s+/g, ' ');
}
function differs(field) {
  const s = S.src[field];
  if (!s || s.value === null || s.value === undefined || s.value === '') return false;
  const v = S.vals[field];
  if (v === '' || v === undefined || v === null) return false;
  return norm(field, v) !== norm(field, s.value);
}

function buildSources(x) {
  const src = {};
  const f = (x && x.fields) || {};
  const qr = x && x.qr && x.qr.valid ? x.qr.payload || {} : null;
  const put = (k, qv, dv) => {
    if (qr && qv !== undefined && qv !== null && qv !== '') src[k] = { value: qv, from: 'qr' };
    else if (dv !== undefined && dv !== null && dv !== '') src[k] = { value: dv, from: 'receipt' };
  };
  put('fdr_number', qr && qr.fn, f.fdr_number);
  put('amount', qr && qr.amt, f.amount);
  put('issue_date', qr && qr.iss, f.issue_date);
  put('maturity_date', qr && qr.mat, f.maturity_date);
  put('branch', qr && qr.br, f.branch);
  put('depositor_name', qr && qr.hn, f.depositor_name);
  put('ifsc', undefined, f.ifsc);
  put('interest_rate', undefined, f.interest_rate);
  put('tenure_months', undefined, f.tenure_months);
  // bank: QR bank code, else printed bank name, else IFSC prefix
  let bank = null;
  if (x && x.qr && x.qr.valid && x.qr.bank_code) bank = banks.find((b) => b.code === x.qr.bank_code);
  if (!bank && f.bank_name) bank = banks.find((b) => b.name.toLowerCase() === String(f.bank_name).toLowerCase());
  if (!bank && f.ifsc) bank = banks.find((b) => b.ifsc_prefix && String(f.ifsc).toUpperCase().startsWith(b.ifsc_prefix));
  if (bank) src.bank_id = { value: String(bank.id), from: x.qr && x.qr.valid ? 'qr' : 'receipt' };
  const lien = qr ? (qr.lien ? true : null) : (f.lien_marked !== undefined && f.lien_marked !== null ? !!f.lien_marked : null);
  if (lien !== null) src.lien_claimed = { value: lien, from: qr ? 'qr' : 'receipt' };
  return src;
}

function applySources() {
  S.src = buildSources(S.extraction);
  for (const [k, s] of Object.entries(S.src)) S.vals[k] = s.value;
}

/* ------------------------------------------------------------------ stepper + side */
function renderSteps() {
  const st = (n) => (S.step === 'done' || S.step > n ? 'done' : S.step === n ? 'current' : '');
  stepper($('#steps'), [{ label: t('isub.s1'), state: st(1) }, { label: t('isub.s2'), state: st(2) }, { label: t('isub.s3'), state: st(3) }]);
}

function renderSide() {
  mount($('#side'),
    el('section', { class: 'card isub-help' },
      el('div', { class: 'card-head' }, el('h2', { html: `${icon('sparkles', 18)}<span>${esc(t('isub.help.t'))}</span>` })),
      el('div', { class: 'card-body' },
        el('ol', {}, [1, 2, 3].map((i) => el('li', {}, t(`isub.help.${i}`)))),
        el('div', { class: 'muted small', html: `${icon('lock', 13)} ${esc(t('isub.help.privacy'))}` }))),
    el('section', { class: 'card accent-top' },
      el('div', { class: 'card-body stack' },
        el('div', { class: 'isub-feat' },
          el('div', { class: 'feature-icon green', html: icon('qr', 22) }),
          el('div', {}, el('strong', {}, t('isub.help.sig_t')), el('div', { class: 'small text-2 mt-1' }, t('isub.help.sig')))),
        el('div', { class: 'isub-feat' },
          el('div', { class: 'feature-icon', html: icon('layers', 22) }),
          el('div', {}, el('strong', {}, t('isub.help.ladder_t')), el('div', { class: 'small text-2 mt-1' }, t('isub.help.ladder')),
            el('div', { class: 'mt-2', html: `${trustBadge(0)} ${trustBadge(1)} ${trustBadge(2)}` }))))));
}

async function renderRenewBanner() {
  const box = $('#renew-banner');
  if (!renewId) return;
  try {
    S.renew = S.renew || await api.get(`/fdrs/${encodeURIComponent(renewId)}`);
  } catch (err) {
    mount(box, el('div', { class: 'alert danger' }, el('span', { html: icon('alert-circle', 20) }), el('div', {}, `${t('isub.renew.err')} ${err.message || ''}`)));
    return;
  }
  const f = S.renew;
  const ok = f.status === 'ACTIVE';
  mount(box, el('div', { class: `alert ${ok ? 'saffron' : 'danger'}` },
    el('span', { html: icon('refresh', 20) }),
    el('div', { class: 'grow' },
      el('div', { class: 'a-title' }, t('isub.renew.t', { ref: f.ref_no })),
      el('div', {}, t('isub.renew.text', { amount: fmtINR(f.amount), bank: f.bank ? f.bank.name : '', fdr: f.fdr_number, date: fmtDate(f.maturity_date) })),
      ok ? null : el('div', { class: 'mt-1', style: { fontWeight: 600 } }, t('isub.renew.bad'))),
    el('span', { html: `${statusBadge(f.display_status)} ${maturityChip(f.days_to_maturity)}` })));
}

/* ------------------------------------------------------------------ step 1 */
function sigBox(x) {
  const qr = x.qr || {};
  if (qr.found && qr.valid) {
    return el('div', { class: 'verify-result valid isub-sig' }, el('div', { class: 'vr-head' },
      el('div', { class: 'vr-icon', html: icon('shield-check', 24) }),
      el('div', {}, el('h3', { class: 'mb-0' }, t('isub.sig.valid_t', { bank: qr.bank_name || qr.bank_code || '' })),
        el('div', { class: 'text-2 small' }, t('isub.sig.valid', { key: qr.key_id || '' })))));
  }
  if (qr.found) {
    return el('div', { class: 'verify-result invalid isub-sig' }, el('div', { class: 'vr-head' },
      el('div', { class: 'vr-icon', html: icon('shield-alert', 24) }),
      el('div', {}, el('h3', { class: 'mb-0' }, t('isub.sig.invalid_t')),
        el('div', { class: 'text-2 small' }, t('isub.sig.invalid', { err: qr.error || '' })))));
  }
  return el('div', { class: 'verify-result isub-sig none' }, el('div', { class: 'vr-head' },
    el('div', { class: 'vr-icon', html: icon('alert', 24) }),
    el('div', {}, el('h3', { class: 'mb-0' }, t('isub.sig.none_t')), el('div', { class: 'text-2 small' }, t('isub.sig.none')))));
}

function foundPanel() {
  const x = S.extraction;
  const f = x.fields || {};
  const out = [el('h3', { html: `${icon('scan', 17)} ${esc(t('isub.found'))}` }), sigBox(x)];
  // AICTE id mismatch
  const aid = x.match && x.match.compared && x.match.compared.aicte_id;
  const docAid = aid && (aid.qr || aid.document);
  if (aid && aid.form && docAid && String(docAid) !== String(aid.form)) {
    out.push(el('div', { class: 'alert danger' }, el('span', { html: icon('alert-circle', 18) }),
      el('div', {}, el('div', { class: 'a-title' }, t('isub.aid_t')), t('isub.aid', { doc: docAid, mine: aid.form }))));
  }
  const flags = (x.tamper && x.tamper.flags) || [];
  if (flags.length) {
    out.push(el('div', { class: 'alert danger' }, el('span', { html: icon('flag', 18) }),
      el('div', { class: 'grow' }, el('div', { class: 'a-title' }, t('isub.tamper_t')), el('div', { class: 'small' }, t('isub.tamper')),
        el('ul', { class: 'list-plain mt-2 stack', style: { gap: '6px' } }, flags.map((fl) => el('li', { class: 'row nowrap', style: { gap: '8px', alignItems: 'flex-start' } },
          el('span', { html: severityBadge(fl.severity) }), el('span', {}, fl.label)))))));
  }
  const dups = x.duplicates || {};
  const dupItems = [
    ...(dups.same_file || []).map((d) => t('isub.dup_file', { ref: d.ref_no, inst: d.institution || '' })),
    ...(dups.same_fdr_number || []).map((d) => t('isub.dup_fdr', { ref: d.ref_no, inst: d.institution || '', status: t(`status.${String(d.status || '').toLowerCase()}`, { _default: d.status || '' }) })),
  ];
  if (dupItems.length) {
    out.push(el('div', { class: 'alert danger' }, el('span', { html: icon('copy', 18) }),
      el('div', {}, el('div', { class: 'a-title' }, t('isub.dup_t')), el('ul', { class: 'list-plain' }, dupItems.map((s) => el('li', {}, s))))));
  }
  const pairs = [
    f.bank_name ? [t('f.bank'), esc(f.bank_name)] : null,
    f.fdr_number ? [t('f.fdr_number'), `<span class="mono">${esc(f.fdr_number)}</span>`] : null,
    f.amount ? [t('f.amount'), fmtINR(f.amount)] : null,
    f.issue_date ? [t('f.issue_date'), fmtDate(f.issue_date)] : null,
    f.maturity_date ? [t('f.maturity_date'), fmtDate(f.maturity_date)] : null,
    f.depositor_name ? [t('f.depositor'), esc(f.depositor_name)] : null,
    f.aicte_id ? [t('f.aicte_id'), `<span class="mono">${esc(f.aicte_id)}</span>`] : null,
    f.ifsc ? [t('f.ifsc'), `<span class="mono">${esc(f.ifsc)}</span>`] : null,
    f.branch ? [t('f.branch'), esc(f.branch)] : null,
    f.interest_rate ? [t('f.interest_rate'), `${esc(f.interest_rate)}%`] : null,
    f.tenure_months ? [t('f.tenure'), esc(String(f.tenure_months))] : null,
    f.lien_marked !== undefined && f.lien_marked !== null ? [t('f.lien'), esc(f.lien_marked ? t('isub.yes') : t('isub.no'))] : null,
  ].filter(Boolean);
  out.push(el('div', {},
    el('div', { class: 'row between', style: { marginBottom: '8px' } },
      el('strong', {}, t('isub.fields')),
      el('span', { class: 'badge b-slate' }, t(`isub.engine.${x.engine}`, { _default: x.engine || '' }))),
    pairs.length ? dl(pairs, { cols: 3 }) : el('div', { class: 'muted small' }, t('isub.fields_none'))));
  return el('div', { class: 'stack isub-found' }, out);
}

function step1() {
  const input = el('input', { type: 'file', accept: '.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg', hidden: true, id: 'file-in' });
  input.addEventListener('change', () => { if (input.files && input.files[0]) pickFile(input.files[0]); });
  const parts = [];
  if (!S.file) {
    const dz = el('div', { class: 'dropzone', role: 'button', tabindex: 0, 'aria-label': t('isub.dz.aria') },
      el('div', { class: 'dz-icon', html: icon('upload', 24) }),
      el('div', {}, el('strong', {}, t('isub.dz.title')), ` ${t('isub.dz.or')}`),
      el('div', { class: 'muted small mt-1' }, t('isub.dz.formats')));
    dz.addEventListener('click', () => input.click());
    dz.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('over'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('over'));
    dz.addEventListener('drop', (e) => { e.preventDefault(); dz.classList.remove('over'); const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) pickFile(f); });
    parts.push(dz);
  } else {
    const isImg = S.file.type.startsWith('image/');
    parts.push(el('div', { class: 'isub-file' },
      el('div', { class: 'feature-icon', html: icon(isImg ? 'camera' : 'file-text', 22) }),
      el('div', { class: 'grow' }, el('div', { class: 'fname' }, S.file.name), el('div', { class: 'muted small' }, `${fmtBytes(S.file.size)} · ${isImg ? 'Image' : 'PDF'}`)),
      S.busy ? null : el('button', { class: 'btn sm secondary', type: 'button', onclick: () => input.click(), html: btnHtml('refresh', t('isub.change')) })));
  }
  parts.push(input);
  if (S.busy) {
    parts.push(el('div', { class: 'isub-progress' },
      el('div', { class: 'row between small' }, el('span', { class: 'row nowrap', style: { gap: '8px' } }, el('span', { class: 'spinner' }), S.busy.text),
        S.busy.pct !== null && S.busy.pct !== undefined ? el('strong', {}, `${Math.round(S.busy.pct)}%`) : null),
      el('div', { class: 'meter primary', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(S.busy.pct || 0)) },
        el('span', { style: { width: `${S.busy.pct === null || S.busy.pct === undefined ? 35 : S.busy.pct}%` } }))));
  }
  if (S.ocrNote) parts.push(el('div', { class: 'alert warning' }, el('span', { html: icon('alert', 18) }), el('div', {}, S.ocrNote)));
  if (S.extractError) parts.push(el('div', { class: 'alert danger' }, el('span', { html: icon('alert-circle', 18) }), el('div', {}, t('isub.extract_fail', { msg: S.extractError }))));
  if (S.extraction) parts.push(foundPanel());
  if (meta?.demo_mode && !S.busy) {
    const g = el('button', { class: 'btn sm success', type: 'button', html: btnHtml('shield-check', t('isub.demo.genuine')) });
    const fg = el('button', { class: 'btn sm outline-danger', type: 'button', html: btnHtml('shield-alert', t('isub.demo.forged')) });
    g.addEventListener('click', () => withBusy(g, () => useDemo('genuine')));
    fg.addEventListener('click', () => withBusy(fg, () => useDemo('forged')));
    parts.push(el('div', { class: 'isub-demo' },
      el('div', {}, el('div', { style: { fontWeight: 700 }, html: `${icon('sparkles', 16)} ${esc(t('isub.demo.t'))}` }), el('div', { class: 'muted small' }, t('isub.demo.text'))),
      el('div', { class: 'btns' }, g, fg,
        S.demoBlob ? el('button', { class: 'btn sm ghost', type: 'button', onclick: () => downloadBlob(S.demoBlob, `specimen-fdr-${S.demoKind}.pdf`), html: btnHtml('download', t('isub.demo.download')) }) : null)));
  }
  const canNext = S.file && !S.busy;
  parts.push(el('div', { class: 'isub-nav' }, el('span'),
    el('button', {
      class: 'btn', type: 'button', disabled: !canNext, onclick: () => go(2),
      html: btnHtml('arrow-right', S.extraction ? t('isub.next_review') : t('isub.next_manual')),
    })));
  mount(panel, el('div', { class: 'stack lg' }, parts));
}

async function pickFile(file) {
  const okType = /\.(pdf|png|jpe?g)$/i.test(file.name) || ['application/pdf', 'image/png', 'image/jpeg'].includes(file.type);
  if (!okType) { toast(t('isub.bad_type'), 'error'); return; }
  if (file.size > MAX_BYTES) { toast(t('isub.too_big'), 'error'); return; }
  let type = file.type;
  if (!type) type = /\.pdf$/i.test(file.name) ? 'application/pdf' : /\.png$/i.test(file.name) ? 'image/png' : 'image/jpeg';
  S.file = type === file.type ? file : new File([file], file.name, { type });
  S.extraction = null; S.extractError = ''; S.ocrText = ''; S.ocrNote = ''; S.src = {};
  S.vals = { bank_id: '', purpose: S.vals.purpose, lien_claimed: true, auto_renew: false, notes: S.vals.notes || '' };
  try {
    if (S.file.type.startsWith('image/')) await runOcr(S.file);
    S.busy = { text: t(S.ocrText ? 'isub.ocr.done' : 'isub.reading_pdf'), pct: null };
    renderStep();
    const fd = new FormData();
    fd.append('file', S.file, S.file.name);
    if (S.ocrText) fd.append('ocr_text', S.ocrText);
    S.extraction = await api.upload('/fdrs/extract', fd);
    applySources();
  } catch (err) {
    S.extractError = err.message || String(err);
  } finally {
    S.busy = null;
    renderStep();
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.Tesseract) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('OCR library failed to load'));
    document.head.appendChild(s);
  });
}

async function runOcr(file) {
  S.busy = { text: t('isub.ocr.load'), pct: 0 };
  renderStep();
  let worker = null;
  try {
    await loadScript(site('assets/vendor/tesseract/tesseract.min.js'));
    const progress = (m) => {
      if (!S.busy) return;
      const st = String(m.status || '');
      const text = st.includes('recogniz') ? t('isub.ocr.run') : st.includes('language') || st.includes('traineddata') ? t('isub.ocr.lang') : t('isub.ocr.load');
      const pct = st.includes('recogniz') ? 30 + (m.progress || 0) * 70 : (m.progress || 0) * 30;
      S.busy = { text, pct };
      const bar = panel.querySelector('.isub-progress');
      if (bar) {
        bar.querySelector('.row span:last-child')?.replaceChildren(document.createTextNode(text));
        const strong = bar.querySelector('strong');
        if (strong) strong.textContent = `${Math.round(pct)}%`;
        bar.querySelector('.meter > span').style.width = `${pct}%`;
      }
    };
    worker = await window.Tesseract.createWorker('eng', 1, {
      workerPath: site('assets/vendor/tesseract/worker.min.js'),
      corePath: site('assets/vendor/tesseract/core'),
      langPath: site('assets/vendor/tesseract/lang'),
      gzip: true,
      logger: progress,
    });
    const { data } = await worker.recognize(file);
    S.ocrText = (data && data.text ? data.text : '').trim();
  } catch (err) {
    S.ocrText = '';
    S.ocrNote = t('isub.ocr.fail');
  } finally {
    if (worker) { try { await worker.terminate(); } catch (e) { /* ignore */ } }
  }
}

async function useDemo(kind) {
  let blob;
  try {
    blob = await api.blob('/demo/sample-receipt', { kind });
  } catch (err) {
    toast(t('isub.demo.fail', { msg: err.message || '' }), 'error');
    return;
  }
  S.demoBlob = blob;
  S.demoKind = kind;
  await pickFile(new File([blob], 'sample.pdf', { type: 'application/pdf' }));
}

/* ------------------------------------------------------------------ step 2 */
function srcHint(field) {
  const s = S.src[field];
  if (!s) return null;
  if (differs(field)) {
    return el('span', { class: 'hint warn', html: `${icon('alert', 13)} ${esc(t(s.from === 'qr' ? 'isub.differs_qr' : 'isub.differs', { v: field === 'bank_id' ? (bankById(s.value)?.name || '') : fmtVal(field, s.value) }))}` });
  }
  return el('span', { class: 'hint src', html: `${icon(s.from === 'qr' ? 'shield-check' : 'scan', 13)} ${esc(t(s.from === 'qr' ? 'isub.src.qr' : 'isub.src.receipt'))}` });
}

function field(name, label, control, { req = false, full = false, extraHint } = {}) {
  const wrap = el('div', { class: `field ${full ? 'full' : ''}`, dataset: { field: name } },
    el('label', { for: `f-${name}` }, label, req ? el('span', { class: 'req' }, ' *') : null),
    control);
  const hintBox = el('div', { class: 'hint-box' });
  wrap.appendChild(hintBox);
  const refresh = () => {
    const parts = [];
    if (S.errors[name]) parts.push(el('span', { class: 'error' }, S.errors[name]));
    const h = srcHint(name);
    if (h) parts.push(h);
    if (extraHint) { const x = extraHint(); if (x) parts.push(x); }
    mount(hintBox, parts);
    control.classList.toggle('invalid', !!S.errors[name]);
    control.classList.toggle('autofilled', !!S.src[name] && !differs(name));
  };
  wrap._refresh = refresh;
  refresh();
  return wrap;
}

function inputCtl(name, type = 'text', attrs = {}) {
  const v = S.vals[name];
  const ctl = el('input', { class: 'input', id: `f-${name}`, name, type, value: v === undefined || v === null ? '' : String(v), ...attrs });
  ctl.addEventListener('input', () => { S.vals[name] = ctl.value; delete S.errors[name]; ctl.closest('.field')._refresh(); updateDiffAlert(); });
  return ctl;
}

function diffList() {
  return [...FIELDS, 'bank_id'].filter((k) => differs(k)).map((k) => (k === 'bank_id' ? t('f.bank') : labelFor(k)));
}
function labelFor(k) {
  return { fdr_number: t('f.fdr_number'), amount: t('f.amount'), issue_date: t('f.issue_date'), maturity_date: t('f.maturity_date'), branch: t('f.branch'), ifsc: t('f.ifsc'), interest_rate: t('isub.f.rate'), tenure_months: t('isub.f.tenure'), depositor_name: t('f.depositor') }[k] || k;
}
function updateDiffAlert() {
  const box = $('#diff-alert');
  if (!box) return;
  const list = diffList();
  mount(box, list.length ? el('div', { class: 'alert warning' }, el('span', { html: icon('alert', 18) }),
    el('div', {}, el('div', { class: 'a-title' }, t('isub.diff_t')), t('isub.diff', { list: list.join(', ') }))) : null);
}

function step2() {
  const bankSel = el('select', { class: 'select', id: 'f-bank_id', name: 'bank_id' },
    el('option', { value: '' }, t('isub.f.bank_ph')),
    banks.map((b) => el('option', { value: String(b.id), selected: String(S.vals.bank_id) === String(b.id) }, `${b.name} (${b.code})`)));
  bankSel.addEventListener('change', () => { S.vals.bank_id = bankSel.value; delete S.errors.bank_id; bankSel.closest('.field')._refresh(); updateDiffAlert(); });
  const purposeSel = el('select', { class: 'select', id: 'f-purpose', name: 'purpose' },
    PURPOSES.map(([k, v]) => el('option', { value: v, selected: S.vals.purpose === v }, t(`isub.p.${k}`))));
  purposeSel.addEventListener('change', () => { S.vals.purpose = purposeSel.value; });
  const amountCtl = inputCtl('amount', 'number', { min: 1, step: 1, inputmode: 'numeric' });
  const lien = el('input', { type: 'checkbox', id: 'f-lien', checked: !!S.vals.lien_claimed });
  lien.addEventListener('change', () => { S.vals.lien_claimed = lien.checked; });
  const auto = el('input', { type: 'checkbox', id: 'f-auto', checked: !!S.vals.auto_renew });
  auto.addEventListener('change', () => { S.vals.auto_renew = auto.checked; });
  const notes = el('textarea', { class: 'textarea', id: 'f-notes', rows: 3, placeholder: t('isub.f.notes_ph') }, S.vals.notes || '');
  notes.addEventListener('input', () => { S.vals.notes = notes.value; });

  const form = el('form', { class: 'form-grid', novalidate: true, onsubmit: (e) => { e.preventDefault(); next2(); } },
    field('bank_id', t('f.bank'), bankSel, { req: true }),
    field('fdr_number', t('f.fdr_number'), inputCtl('fdr_number', 'text', { autocomplete: 'off', spellcheck: 'false' }), { req: true }),
    field('amount', `${t('f.amount')} (₹)`, amountCtl, {
      req: true,
      extraHint: () => (S.vals.amount && Number(S.vals.amount) > 0 && !differs('amount') ? el('span', { class: 'hint' }, fmtINR(Number(S.vals.amount))) : (!S.src.amount ? el('span', { class: 'hint' }, t('isub.f.amount_hint')) : null)),
    }),
    field('depositor_name', t('f.depositor'), inputCtl('depositor_name')),
    field('issue_date', t('f.issue_date'), inputCtl('issue_date', 'date'), { req: true }),
    field('maturity_date', t('f.maturity_date'), inputCtl('maturity_date', 'date'), { req: true }),
    field('branch', t('f.branch'), inputCtl('branch')),
    field('ifsc', t('f.ifsc'), inputCtl('ifsc', 'text', { maxlength: 11, autocomplete: 'off' })),
    field('interest_rate', t('isub.f.rate'), inputCtl('interest_rate', 'number', { min: 0, max: 20, step: 0.01 })),
    field('tenure_months', t('isub.f.tenure'), inputCtl('tenure_months', 'number', { min: 1, max: 240, step: 1 })),
    el('div', { class: 'field full' }, el('label', { for: 'f-purpose' }, t('f.purpose')), purposeSel),
    el('div', { class: 'full isub-lien' },
      el('label', { class: 'check', for: 'f-lien' }, lien, el('strong', {}, t('isub.lien'))),
      el('div', { class: 'small text-2' }, t('isub.lien_help')),
      S.src.lien_claimed ? el('div', { class: 'small', style: { marginLeft: '25px', marginTop: '4px' } }, srcHint('lien_claimed')) : null),
    el('div', { class: 'full' },
      el('label', { class: 'check', for: 'f-auto' }, auto, t('isub.auto')),
      el('div', { class: 'small muted', style: { marginLeft: '25px' } }, t('isub.auto_help'))),
    el('div', { class: 'field full' }, el('label', { for: 'f-notes' }, t('isub.f.notes')), notes));

  mount(panel, el('div', { class: 'stack lg' },
    el('div', {}, el('h3', { class: 'mb-0' }, t('isub.form.t')), el('div', { class: 'muted small mt-1' }, t('isub.form.sub'))),
    el('div', { id: 'diff-alert' }),
    S.extraction ? el('div', { class: 'row', style: { gap: '8px' } }, sigMini(), S.file ? el('span', { class: 'muted small' }, S.file.name) : null) : null,
    form,
    el('div', { class: 'isub-nav' },
      el('button', { class: 'btn secondary', type: 'button', onclick: () => go(1), html: btnHtml('arrow-left', t('isub.back')) }),
      el('button', { class: 'btn', type: 'button', onclick: next2, html: btnHtml('arrow-right', t('isub.next_declare')) }))));
  updateDiffAlert();
}

function sigMini() {
  const qr = (S.extraction && S.extraction.qr) || {};
  if (qr.found && qr.valid) return el('span', { class: 'badge b-success', html: `${icon('shield-check', 13)}${esc(t('isub.sum.sig.valid', { bank: qr.bank_name || '' }))}` });
  if (qr.found) return el('span', { class: 'badge b-danger', html: `${icon('shield-alert', 13)}${esc(t('isub.sig.invalid_t'))}` });
  return el('span', { class: 'badge b-warning', html: `${icon('alert', 13)}${esc(t('isub.sig.none_t'))}` });
}

function validate() {
  const e = {};
  const v = S.vals;
  for (const k of ['bank_id', 'fdr_number', 'amount', 'issue_date', 'maturity_date']) if (!String(v[k] ?? '').trim()) e[k] = t('isub.req');
  if (!e.amount && !(Number(v.amount) > 0)) e.amount = t('isub.amount_bad');
  if (!e.issue_date && !e.maturity_date && daysBetween(v.issue_date, v.maturity_date) <= 0) e.maturity_date = t('isub.mat_bad');
  S.errors = e;
  return !Object.keys(e).length;
}

function next2() {
  if (!validate()) {
    panel.querySelectorAll('.field[data-field]').forEach((f) => f._refresh && f._refresh());
    toast(t('isub.fix_errors'), 'error');
    const first = panel.querySelector('.invalid');
    if (first) first.focus();
    return;
  }
  go(3);
}

/* ------------------------------------------------------------------ step 3 */
function reviewFlags() {
  const x = S.extraction;
  let n = diffList().length;
  if (x) {
    n += ((x.tamper && x.tamper.flags) || []).length;
    n += ((x.duplicates && x.duplicates.same_file) || []).length + ((x.duplicates && x.duplicates.same_fdr_number) || []).length;
    if (x.qr && x.qr.found && !x.qr.valid) n += 1;
  }
  return n;
}

function step3() {
  const v = S.vals;
  const qr = (S.extraction && S.extraction.qr) || {};
  const flags = reviewFlags();
  const purposeKey = (PURPOSES.find(([, p]) => p === v.purpose) || PURPOSES[0])[0];
  const sig = qr.found && qr.valid ? `<span class="badge b-success">${icon('shield-check', 12)}${esc(t('isub.sum.sig.valid', { bank: qr.bank_name || '' }))}</span>`
    : qr.found ? `<span class="badge b-danger">${esc(t('isub.sum.sig.invalid'))}</span>` : `<span class="badge b-warning">${esc(t('isub.sum.sig.none'))}</span>`;
  const declare = el('input', { type: 'checkbox', id: 'f-declare', checked: S.declared });
  const err = el('div', { class: 'error', hidden: true }, t('isub.declare_req'));
  declare.addEventListener('change', () => { S.declared = declare.checked; err.hidden = true; });
  const submitBtn = el('button', { class: 'btn saffron lg', type: 'button', html: btnHtml('send', t('isub.submit')) });
  submitBtn.addEventListener('click', () => {
    if (!declare.checked) { err.hidden = false; declare.focus(); return; }
    withBusy(submitBtn, submit);
  });
  mount(panel, el('div', { class: 'stack lg' },
    el('h3', { class: 'mb-0' }, t('isub.sum.t')),
    S.renew ? el('div', { class: 'alert saffron' }, el('span', { html: icon('refresh', 18) }), el('div', {}, t('isub.renew.t', { ref: S.renew.ref_no }))) : null,
    dl([
      [t('f.bank'), esc(bankById(v.bank_id)?.name || '—')],
      [t('f.fdr_number'), `<span class="mono">${esc(v.fdr_number)}</span>`],
      [t('f.amount'), `<strong>${fmtINR(Number(v.amount))}</strong>`],
      [t('f.issue_date'), fmtDate(v.issue_date)],
      [t('f.maturity_date'), fmtDate(v.maturity_date)],
      [t('f.depositor'), esc(v.depositor_name || '—')],
      [t('f.branch'), esc(v.branch || '—')],
      [t('f.ifsc'), `<span class="mono">${esc(v.ifsc || '—')}</span>`],
      [t('isub.f.rate'), v.interest_rate ? `${esc(v.interest_rate)}%` : '—'],
      [t('isub.f.tenure'), esc(v.tenure_months || '—')],
      [t('f.purpose'), esc(t(`isub.p.${purposeKey}`))],
      [t('f.lien'), esc(v.lien_claimed ? t('isub.yes') : t('isub.no'))],
      [t('isub.sum.file'), esc(S.file ? `${S.file.name} (${fmtBytes(S.file.size)})` : '—')],
      [t('isub.sum.sig'), sig],
      [t('isub.sum.flags'), flags ? `<span class="badge b-orange">${icon('flag', 12)}${esc(t('isub.sum.flags_n', { n: flags }))}</span>` : esc(t('isub.sum.flags_none'))],
    ], { cols: 3 }),
    el('div', { class: 'isub-declare' }, el('label', { class: 'check', for: 'f-declare' }, declare, el('span', {}, t('isub.declare'))), err),
    el('div', { class: 'isub-nav' },
      el('button', { class: 'btn secondary', type: 'button', onclick: () => go(2), html: btnHtml('arrow-left', t('isub.back')) }),
      submitBtn)));
}

async function submit() {
  const v = S.vals;
  const fd = new FormData();
  const put = (k, val) => { if (val !== undefined && val !== null && String(val).trim() !== '') fd.append(k, String(val).trim()); };
  put('bank_id', v.bank_id); put('fdr_number', v.fdr_number); put('amount', v.amount);
  put('issue_date', v.issue_date); put('maturity_date', v.maturity_date); put('branch', v.branch);
  put('ifsc', v.ifsc ? String(v.ifsc).toUpperCase() : ''); put('interest_rate', v.interest_rate); put('tenure_months', v.tenure_months);
  put('depositor_name', v.depositor_name); put('purpose', v.purpose); put('notes', v.notes);
  fd.append('lien_claimed', v.lien_claimed ? 'true' : 'false');
  fd.append('auto_renew', v.auto_renew ? 'true' : 'false');
  if (renewId) fd.append('renewal_of', renewId);
  if (S.ocrText) fd.append('ocr_text', S.ocrText);
  fd.append('file', S.file, S.file.name);
  try {
    S.result = await api.upload('/fdrs', fd);
  } catch (err) {
    toast(t('isub.submit_fail', { msg: err.message || '' }), 'error', 8000);
    return;
  }
  toast(t('isub.done.t'), 'success');
  go('done');
}

/* ------------------------------------------------------------------ done */
function stepDone() {
  const r = S.result;
  const open = (r.discrepancies || []).filter((d) => d.status === 'open').length;
  mount(panel, el('div', { class: 'stack lg' },
    el('div', { class: 'isub-done' },
      el('div', { class: 'big', html: icon('check', 38) }),
      el('h2', { class: 'mb-0' }, t('isub.done.t')),
      el('div', { class: 'ref mt-2' }, r.ref_no),
      el('div', { class: 'muted small' }, t('isub.done.text')),
      el('div', { class: 'row', style: { justifyContent: 'center', gap: '8px', marginTop: '12px' }, html: `${statusBadge(r.display_status)} ${trustBadge(r.trust_level, r.flagged)}` }),
      el('div', { class: 'small muted mt-1' }, `${t('isub.done.trust')}: ${t(`trust.${r.trust_level}.long`)}`)),
    open ? el('div', { class: 'alert warning' }, el('span', { html: icon('flag', 18) }), el('div', {}, t('isub.done.flags', { n: open }))) : null,
    el('div', {},
      el('h3', {}, t('isub.done.next')),
      el('div', { id: 'next-tl' })),
    el('div', { class: 'row', style: { justifyContent: 'center', gap: '10px' } },
      el('a', { class: 'btn', href: site(`institution/fdr.html?id=${r.id}`), html: btnHtml('eye', t('isub.done.view')) }),
      el('a', { class: 'btn secondary', href: site('institution/submit.html'), html: btnHtml('plus', t('isub.done.another')) }),
      el('a', { class: 'btn ghost', href: site('institution/dashboard.html'), html: btnHtml('dashboard', t('isub.done.dash')) }))));
  timeline($('#next-tl'), [
    { title: t('isub.done.n1'), tone: '' },
    { title: t('isub.done.n2'), tone: 'muted' },
    { title: t('isub.done.n3'), tone: 'muted' },
    { title: t('isub.done.n4'), tone: 'muted' },
  ]);
}

/* ------------------------------------------------------------------ flow */
function renderStep() {
  renderSteps();
  if (S.step === 1) step1();
  else if (S.step === 2) step2();
  else if (S.step === 3) step3();
  else stepDone();
}
function go(step) {
  S.step = step;
  renderStep();
  $('#steps').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function renderAll() {
  renderSide();
  renderRenewBanner();
  renderStep();
}

onLang(renderAll);
renderAll();
void user;
