// Officer instrument detail: header (amount, trust ladder, risk gauge), key facts, role/status actions, 8 tabs.
import { initPage, setPageHead } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang, getLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, mount, fmtINR, fmtINRShort, fmtDate, fmtDateTime, fmtBytes, statusBadge, releaseBadge, trustBadge,
  riskBadge, riskBand, severityBadge, lienBadge, maturityChip, toast, modal, confirmDialog, promptDialog, withBusy,
  loading, emptyState, errorState, renderTable, tabs, timeline, dl, getParam, setParams, copyText,
} from '../assets/js/ui.js';

const DC_CODES = ['AMOUNT_MISMATCH', 'DATE_MISMATCH', 'FDR_NUMBER_MISMATCH', 'DEPOSITOR_MISMATCH', 'AICTE_ID_MISMATCH', 'QR_INVALID', 'QR_MISSING', 'PDF_EDITED', 'DUPLICATE_FDR', 'DUPLICATE_FILE', 'LIEN_NOT_MARKED', 'BANK_NOT_FOUND', 'BANK_CLOSED', 'MATURED_NOT_RENEWED', 'MISSING_DOCUMENT', 'INSUFFICIENT_AMOUNT', 'OTHER'];

extend({
  en: {
    'fd.title': 'Instrument detail',
    'fd.subtitle': 'Fixed deposit receipt pledged with AICTE',
    'fd.no_id': 'No instrument selected',
    'fd.no_id_text': 'Open an instrument from the FDR Registry or the Verification Queue.',
    'fd.not_found': 'Instrument not found',
    'fd.not_found_text': 'It may have been removed, or the link is incorrect.',
    'fd.to_registry': 'Go to FDR Registry',
    'fd.back': 'Registry',
    'fd.print': 'Print',
    'fd.refresh': 'Refresh',
    'fd.refreshed': 'Latest details loaded.',
    // header
    'fd.amount_lbl': 'Deposit amount',
    'fd.tenure_rate': '{tenure} months at {rate}% p.a.',
    'fd.copy': 'Copy FDR number',
    'fd.copied': 'FDR number copied.',
    'fd.ladder': 'Trust ladder',
    'fd.rung0.t': 'Claimed', 'fd.rung0.d': 'Declared by the institution on the form',
    'fd.rung1.t': 'Document matched', 'fd.rung1.d': 'Receipt text matches the form',
    'fd.rung2.t': 'Bank verified', 'fd.rung2.d': 'Signed QR or bank API confirmed it',
    'fd.here': 'Now',
    'fd.flag_note': 'Flagged — open high or critical discrepancy',
    'fd.risk_title': 'Risk assessment',
    'fd.risk_score': 'Risk score',
    'fd.risk_line': 'Risk score {n} out of 100',
    'fd.risk_band': '{band} risk',
    'fd.risk_none': 'No risk factors — every check on this instrument is clean.',
    'fd.risk_explain': 'Each factor below adds points to the score (capped at 100).',
    'fd.renewal_of': 'Renewal of {ref}',
    // facts
    'fd.fact.issue': 'Issue date',
    'fd.fact.maturity': 'Maturity',
    'fd.fact.lien': 'Lien (bank)',
    'fd.fact.purpose': 'Purpose',
    'fd.fact.submitted': 'Submitted',
    'fd.fact.picked': 'Picked up by',
    'fd.fact.verified': 'Verified',
    'fd.not_yet': 'Not yet',
    'fd.by': 'by {name}',
    'fd.declared': 'Declared: {v}',
    // alerts
    'fd.al.forged': 'Forged receipt suspected',
    'fd.al.forged_text': 'The printed receipt differs from the bank-signed QR code ({fields}). The QR is signed with the bank\'s private key and cannot be edited, so the printed copy has been altered.',
    'fd.al.bank_closed': 'Bank reports this deposit is closed',
    'fd.al.bank_closed_text': '{bank} closed the deposit on {date}. Reason: {reason}. AICTE is no longer protected by this instrument.',
    'fd.al.bank_nf': 'Bank has no such deposit',
    'fd.al.dup': 'Receipt reused on another record',
    'fd.al.dup_text': 'The same receipt or FDR number is also used on:',
    'fd.al.matured': 'Matured without renewal',
    'fd.al.matured_text': 'This instrument matured {when} and no renewal has been accepted. AICTE is unprotected until a renewal is verified.',
    'fd.al.expiring': 'Maturity approaching',
    'fd.al.expiring_text': 'This instrument matures {when}. A renewal has not been accepted yet.',
    'fd.al.rejected': 'This instrument was rejected on {date}. It does not protect AICTE.',
    'fd.al.invoked': 'The deposit was invoked (encashed in favour of AICTE) on {date}.',
    'fd.al.renewed': 'This instrument was replaced by renewal {ref}.',
    'fd.al.released': 'Released to the institution on {date}. The NOC letter is in the Releases tab.',
    'fd.al.open_successor': 'Open the renewal',
    // actions
    'fd.act.workflow': 'Decision',
    'fd.act.checks': 'Verification checks',
    'fd.act.notes': 'Findings & notes',
    'fd.act.pickup': 'Pick up',
    'fd.act.takeover': 'Take over',
    'fd.act.verify_qr': 'Verify signed QR',
    'fd.act.verify_bank': 'Verify with bank',
    'fd.act.recheck': 'Re-check all',
    'fd.act.accept': 'Accept',
    'fd.act.return': 'Return to institution',
    'fd.act.reject': 'Reject',
    'fd.act.invoke': 'Invoke deposit',
    'fd.act.raise': 'Raise discrepancy',
    'fd.act.observe': 'Add observation',
    'fd.act.upload': 'Upload document',
    'fd.act.admin': 'Administrators can view instruments. Verification decisions are taken by AICTE officers and the Competent Authority.',
    'fd.next': 'Next step:',
    'fd.next.submitted': 'Pick up this instrument to start verification. It will be assigned to you.',
    'fd.next.verify_qr': 'Verify the bank-signed QR on the receipt, then confirm the deposit with the bank.',
    'fd.next.verify_bank': 'The receipt matches the form. Confirm the deposit with the bank to reach the top of the trust ladder.',
    'fd.next.critical': 'Open critical discrepancies block acceptance. Resolve them, return the instrument to the institution, or reject it.',
    'fd.next.accept': 'All checks are complete. Accept the instrument if everything is in order.',
    'fd.next.discrepancy': 'Returned to the institution — waiting for its response to the discrepancies.',
    'fd.next.responded': 'The institution has responded. Review the response, re-check and decide.',
    'fd.next.active': 'This instrument protects AICTE. Nightly bank checks keep its status current.',
    'fd.next.active_flag': 'The bank reports a problem with this deposit. Review the discrepancies; the Competent Authority may invoke the deposit.',
    'fd.next.release': 'A release request is in progress — see the Releases tab.',
    'fd.next.closed': 'This instrument is closed ({status}). No further action is needed.',
    // confirms / prompts
    'fd.cf.pickup': 'Pick up {ref} for verification? It will be assigned to you and move to “Under verification”.',
    'fd.cf.takeover': 'Take over verification of {ref} from {name}? The hand-over is recorded in the audit trail.',
    'fd.cf.accept_title': 'Accept instrument',
    'fd.cf.accept': 'Accept {ref} ({amount})? It becomes Active and starts protecting AICTE. The institution will be notified.',
    'fd.pr.return_title': 'Return to institution',
    'fd.pr.return_label': 'Note for the institution — what needs to be corrected',
    'fd.pr.reject_title': 'Reject instrument',
    'fd.pr.reject_label': 'Reason for rejection (shared with the institution). This cannot be undone.',
    'fd.pr.invoke_title': 'Invoke security deposit',
    'fd.pr.invoke_label': 'Reason for invoking {ref} ({amount}). The bank will be asked to encash the deposit in favour of AICTE. This cannot be undone.',
    'fd.ovr.title': 'Accept with override',
    'fd.ovr.text': 'Acceptance was blocked because this instrument has open critical discrepancies:',
    'fd.ovr.label': 'Override note — why it is safe to accept despite these findings',
    'fd.ovr.confirm': 'Accept with override',
    'fd.ovr.required': 'Please write a note explaining the override.',
    // toasts
    'fd.ok.pickup': '{ref} is now assigned to you for verification.',
    'fd.ok.takeover': 'You have taken over verification of {ref}.',
    'fd.ok.accept': '{ref} accepted — it is now Active and protecting AICTE.',
    'fd.ok.return': '{ref} returned to the institution with your note.',
    'fd.ok.reject': '{ref} rejected. The institution has been informed.',
    'fd.ok.invoke': '{ref} invoked. The deposit will be encashed in favour of AICTE.',
    'fd.ok.disc': 'Discrepancy raised. The risk score has been updated.',
    'fd.ok.obs': 'Observation added.',
    'fd.ok.resolved': 'Discrepancy marked as resolved.',
    'fd.ok.waived': 'Discrepancy waived.',
    'fd.ok.upload': 'Document uploaded and analysed.',
    'fd.ok.recheck': 'Re-check finished.',
    'fd.fail': 'Could not complete the action: {msg}',
    // raise discrepancy
    'fd.rd.title': 'Raise a discrepancy',
    'fd.rd.code': 'Discrepancy type',
    'fd.rd.sev': 'Severity',
    'fd.rd.sev_hint': 'Pre-set from the discrepancy type; change it if needed.',
    'fd.rd.msg': 'Details for the record',
    'fd.rd.msg_ph': 'e.g. Receipt shows maturity 18-04-2027 but the form says 18-04-2028',
    'fd.rd.submit': 'Raise discrepancy',
    // observation
    'fd.ob.title': 'Add an observation',
    'fd.ob.text': 'Observation',
    'fd.ob.vis': 'Who can see it',
    'fd.ob.internal': 'Internal — AICTE staff only',
    'fd.ob.shared': 'Shared — also visible to the institution',
    'fd.ob.submit': 'Add observation',
    'fd.ob.required': 'Please write the observation.',
    'fd.ob.badge.internal': 'Internal',
    'fd.ob.badge.shared': 'Shared with institution',
    'fd.ob.none': 'No observations yet',
    'fd.ob.none_text': 'Notes added by officers appear here.',
    // upload
    'fd.up.title': 'Upload a document',
    'fd.up.file': 'File (PDF, PNG or JPG)',
    'fd.up.kind': 'Document type',
    'fd.up.required': 'Choose a file to upload.',
    'fd.up.hint': 'Receipts are read automatically: text, bank-signed QR, tamper checks and duplicates.',
    'fd.kind.fdr_certificate': 'FDR receipt',
    'fd.kind.renewal_certificate': 'Renewal receipt',
    'fd.kind.bank_letter': 'Bank letter',
    'fd.kind.supporting': 'Supporting document',
    'fd.kind.noc': 'NOC letter',
    // tabs
    'fd.tab.overview': 'Overview',
    'fd.tab.document': 'Document',
    'fd.tab.verification': 'Verification',
    'fd.tab.discrepancies': 'Discrepancies',
    'fd.tab.observations': 'Observations',
    'fd.tab.chain': 'Renewal chain',
    'fd.tab.releases': 'Releases',
    'fd.tab.audit': 'Audit trail',
    // overview
    'fd.ov.details': 'Instrument details',
    'fd.f.beneficiary': 'Beneficiary',
    'fd.f.auto_renew': 'Auto-renewal',
    'fd.f.lien_claimed': 'Lien (declared)',
    'fd.f.lien_confirmed': 'Lien (bank)',
    'fd.f.workflow': 'Workflow status',
    'fd.f.validity': 'Validity',
    'fd.f.verified_by': 'Verified by',
    'fd.f.bank_confirmed': 'Bank confirmed',
    'fd.f.last_check': 'Last bank check',
    'fd.f.closed_at': 'Closed on',
    'fd.f.predecessor': 'Renews',
    'fd.f.successor': 'Renewed by',
    'fd.f.notes': 'Notes',
    'fd.f.picked': 'Picked up by',
    'fd.f.open_disc': 'Open discrepancies',
    'fd.val.VALID': 'Valid', 'fd.val.EXPIRING': 'Expiring soon', 'fd.val.MATURED': 'Matured', 'fd.val.CLOSED': 'Closed',
    'fd.months': '{n} months',
    'fd.pa': '{n}% p.a.',
    'fd.marked': 'Marked', 'fd.not_marked': 'Not marked', 'fd.marked_aicte': 'Marked · AICTE',
    // comparison
    'fd.cmp.title': 'Cross-check: claimed vs receipt vs bank',
    'fd.cmp.sub': 'Every detail the institution declared, compared with the receipt text, the bank-signed QR code and the bank\'s own record.',
    'fd.cmp.field': 'Field',
    'fd.cmp.claimed': 'Claimed by institution',
    'fd.cmp.document': 'Receipt text',
    'fd.cmp.qr': 'Bank-signed QR',
    'fd.cmp.bank': 'Bank record',
    'fd.cmp.result': 'Result',
    'fd.cmp.ok': 'Matches the claim',
    'fd.cmp.bad': 'Differs from the claim',
    'fd.cmp.na': 'Not available / not checked yet',
    'fd.cmp.explain': 'A ✗ in the signed-QR or bank column is strong evidence of an altered receipt: the QR is signed with the bank\'s private key and the bank record comes straight from the bank.',
    'fd.cmp.st.match': 'Match', 'fd.cmp.st.mismatch': 'Mismatch', 'fd.cmp.st.partial': 'Partly checked', 'fd.cmp.st.unknown': 'Not checked',
    'fd.cmp.f.fdr_number': 'FDR number', 'fd.cmp.f.amount': 'Amount', 'fd.cmp.f.issue_date': 'Date of issue', 'fd.cmp.f.maturity_date': 'Maturity date',
    'fd.cmp.f.depositor_name': 'Depositor', 'fd.cmp.f.aicte_id': 'AICTE institution ID', 'fd.cmp.f.lien': 'Lien in favour of AICTE',
    'fd.cmp.empty': 'No receipt has been analysed for this instrument yet.',
    // document
    'fd.doc.list': 'Documents',
    'fd.doc.none': 'No documents uploaded',
    'fd.doc.none_text': 'No receipt has been uploaded for this instrument yet.',
    'fd.doc.open_new': 'Open in new tab',
    'fd.doc.no_preview': 'Preview is not available for this file type.',
    'fd.doc.frame_title': 'Document viewer: {name}',
    'fd.doc.qr_ok': 'Signed QR valid',
    'fd.doc.qr_bad': 'QR invalid',
    'fd.doc.flags': '{n} tamper flag(s)',
    'fd.ex.title': 'Smart receipt reading',
    'fd.ex.engine': 'Read by',
    'fd.ex.engine.pdf-text': 'PDF text layer', 'fd.ex.engine.ocr-client': 'In-browser OCR', 'fd.ex.engine.qr-only': 'QR code only', 'fd.ex.engine.none': 'Not readable',
    'fd.ex.analysed': 'Analysed {at}',
    'fd.ex.fields': 'Fields read from the receipt',
    'fd.ex.no_fields': 'No fields could be read from this file.',
    'fd.ex.qr': 'Bank-signed QR code',
    'fd.ex.qr_valid': 'Genuine — signature verified',
    'fd.ex.qr_invalid': 'Signature check failed',
    'fd.ex.qr_missing': 'No signed QR code was found on this receipt.',
    'fd.ex.signed_by': 'Signed by {bank} · key {key}',
    'fd.ex.signed_payload': 'Details inside the signed QR',
    'fd.ex.tamper': 'Tamper checks',
    'fd.ex.no_tamper': 'No signs of editing were found.',
    'fd.ex.producer': 'Producer',
    'fd.ex.creator': 'Created with',
    'fd.ex.pages': 'Pages',
    'fd.ex.dups': 'Duplicate / reuse check',
    'fd.ex.no_dups': 'This receipt is not used on any other record.',
    'fd.ex.same_file': 'Same file uploaded for',
    'fd.ex.same_number': 'Same FDR number pledged on',
    'fd.ex.sha': 'File fingerprint (SHA-256)',
    'fd.ex.none': 'This document was not analysed (only receipts are read automatically).',
    'fd.exf.fdr_number': 'FDR number', 'fd.exf.amount': 'Amount', 'fd.exf.issue_date': 'Issue date', 'fd.exf.maturity_date': 'Maturity date',
    'fd.exf.depositor_name': 'Depositor', 'fd.exf.aicte_id': 'AICTE ID', 'fd.exf.ifsc': 'IFSC', 'fd.exf.branch': 'Branch',
    'fd.exf.interest_rate': 'Interest rate', 'fd.exf.tenure_months': 'Tenure', 'fd.exf.bank_name': 'Bank', 'fd.exf.lien_marked': 'Lien',
    'fd.tf.PDF_INCREMENTAL_UPDATE': 'PDF was modified after it was first created',
    'fd.tf.EDITOR_PRODUCER': 'Saved with a PDF editor ({x})',
    'fd.tf.TEXT_QR_CONFLICT': 'Printed details differ from the bank-signed QR',
    // verification
    'fd.vm.qr_signature': 'Bank-signed QR check',
    'fd.vm.bank_api': 'Bank verification API',
    'fd.vr.confirmed': 'Confirmed', 'fd.vr.mismatch': 'Mismatch', 'fd.vr.not_found': 'Not found at bank', 'fd.vr.closed': 'Closed at bank',
    'fd.vr.no_qr': 'No signed QR', 'fd.vr.invalid_signature': 'Invalid signature',
    'fd.ver.none': 'No verification has been run yet',
    'fd.ver.none_text': 'Use “Verify signed QR” or “Verify with bank” to run the checks.',
    'fd.ver.system': 'Automatic nightly check',
    'fd.ver.bank_rec': 'Record returned by the bank',
    'fd.ver.sig_ok': 'Bank\'s signed response verified',
    'fd.ver.sig_bad': 'Bank\'s signed response could not be verified',
    'fd.ver.diff': 'Differences found',
    'fd.ver.portal': 'portal',
    'fd.ver.other': 'source',
    'fd.ver.newest': 'Newest first · {n} check(s)',
    'fd.br.status': 'Deposit status', 'fd.br.holder': 'Holder', 'fd.br.lien': 'Lien', 'fd.br.lien_to': 'Lien in favour of',
    'fd.br.closed_at': 'Closed on', 'fd.br.reason': 'Reason', 'fd.br.found_no': 'The bank has no deposit with this number.',
    'fd.bst.active': 'Active', 'fd.bst.closed': 'Closed', 'fd.bst.matured': 'Matured', 'fd.bst.renewed': 'Renewed', 'fd.bst.encashed': 'Encashed',
    // discrepancies
    'fd.dc.none': 'No discrepancies',
    'fd.dc.none_text': 'Nothing has been flagged on this instrument.',
    'fd.dc.st.open': 'Open', 'fd.dc.st.resolved': 'Resolved', 'fd.dc.st.waived': 'Waived',
    'fd.dc.src.system': 'Found by receipt check', 'fd.dc.src.officer': 'Raised by officer', 'fd.dc.src.bank': 'Reported by bank',
    'fd.dc.src.nightly': 'Nightly bank check', 'fd.dc.src.scheduler': 'Nightly check',
    'fd.dc.raised': 'Raised {date}',
    'fd.dc.response': 'Institution response · {date}',
    'fd.dc.no_response': 'Awaiting the institution\'s response',
    'fd.dc.resolve': 'Resolve', 'fd.dc.waive': 'Waive',
    'fd.dc.resolve_title': 'Resolve discrepancy', 'fd.dc.resolve_label': 'Resolution note (how it was settled)',
    'fd.dc.waive_title': 'Waive discrepancy', 'fd.dc.waive_label': 'Why can this discrepancy be waived?',
    'fd.dc.closed_line': '{status} on {date}',
    'fd.dc.summary': '{open} open · {closed} closed',
    // chain
    'fd.ch.none': 'Not part of a renewal chain',
    'fd.ch.none_text': 'This is the first instrument; there are no renewals yet.',
    'fd.ch.gen': 'Generation {n}',
    'fd.ch.current': 'This instrument',
    'fd.ch.late': 'Renewed late',
    'fd.ch.explain': 'Each renewal replaces the previous receipt (oldest first). A late renewal means AICTE was unprotected for some days.',
    // releases
    'fd.rl.none': 'No release requests',
    'fd.rl.none_text': 'Release or refund requests for this instrument will appear here.',
    'fd.rl.ref': 'Request', 'fd.rl.requested': 'Requested', 'fd.rl.stage': 'Stage', 'fd.rl.sla': 'SLA', 'fd.rl.released': 'Released on', 'fd.rl.noc': 'NOC',
    'fd.rl.noc_open': 'View NOC', 'fd.rl.sla_left': '{h} h left', 'fd.rl.sla_breached': 'SLA breached',
    // audit
    'fd.au.explain': 'Every action on this instrument is written to the hash-chained, tamper-evident audit trail. Newest first.',
    'fd.aa.FDR_SUBMITTED': 'FDR submitted', 'fd.aa.RENEWAL_SUBMITTED': 'Renewal submitted', 'fd.aa.FDR_PICKED': 'Picked up for verification',
    'fd.aa.QR_VERIFIED': 'Signed QR verified', 'fd.aa.QR_CHECK_FAILED': 'Signed QR check failed', 'fd.aa.QR_INVALID': 'Invalid QR signature', 'fd.aa.QR_MISSING': 'No signed QR',
    'fd.aa.BANK_VERIFIED': 'Confirmed by the bank', 'fd.aa.BANK_CHECK_FAILED': 'Bank check failed', 'fd.aa.BANK_CLOSED': 'Bank reports deposit closed',
    'fd.aa.BANK_NOT_FOUND': 'Bank has no such deposit', 'fd.aa.BANK_EVENT': 'Bank event', 'fd.aa.BANK_ALERT': 'Bank alert', 'fd.aa.BANK_DEPOSIT_ISSUED': 'Deposit issued by the bank',
    'fd.aa.DISCREPANCY_RAISED': 'Discrepancy raised', 'fd.aa.DISCREPANCY_RESPONDED': 'Institution responded', 'fd.aa.DISCREPANCY_RESOLVED': 'Discrepancy resolved',
    'fd.aa.DISCREPANCY_WAIVED': 'Discrepancy waived', 'fd.aa.DOCUMENT_UPLOADED': 'Document uploaded', 'fd.aa.FDR_ACCEPTED': 'Accepted — now active',
    'fd.aa.FDR_RETURNED': 'Returned to the institution', 'fd.aa.FDR_REJECTED': 'Rejected', 'fd.aa.FDR_INVOKED': 'Deposit invoked', 'fd.aa.FDR_RENEWED': 'Replaced by renewal',
    'fd.aa.FDR_UPDATED': 'Details updated', 'fd.aa.FDR_STATUS_CHANGED': 'Status changed', 'fd.aa.OBSERVATION_ADDED': 'Observation added',
    'fd.aa.RELEASE_SUBMITTED': 'Release requested', 'fd.aa.RELEASE_REQUESTED': 'Release requested', 'fd.aa.RELEASE_STAGE': 'Release stage changed',
    'fd.aa.RELEASE_DONE': 'Released — NOC issued', 'fd.aa.RELEASE_REJECTED': 'Release request rejected', 'fd.aa.RELEASE_CHECKLIST': 'Release checklist updated',
    // risk reasons
    'fd.rr.TRUST_CLAIMED': 'Details are only claimed by the institution (not matched or bank-confirmed)',
    'fd.rr.TRUST_DOC_ONLY': 'Receipt matches the form, but the bank has not confirmed it yet',
    'fd.rr.HIGH_VALUE': 'High-value instrument (₹1 crore or more)',
    'fd.rr.TAMPER_SIGNS': 'Uploaded receipt shows signs of editing',
    'fd.rr.TAMPER_MINOR': 'Uploaded receipt has minor anomalies',
    'fd.rr.NO_DOCUMENT': 'No receipt uploaded',
    'fd.rr.LIEN_NOT_CONFIRMED': 'Bank reports no lien marked in favour of AICTE',
    'fd.rr.NEW_INSTITUTION': 'Institution is less than 3 years old',
    'fd.rr.CLOSURE': 'Institution has requested closure',
    'fd.rr.MATURED_UNRENEWED': 'Matured {n} days ago with no accepted renewal — AICTE is unprotected',
    'fd.rr.VERIFICATION_DELAY': 'Waiting {n} days for verification',
    'fd.rr.LATE_RENEWAL_HISTORY': 'Institution renewed late {n} time(s) before',
    'fd.rr.DISC': 'Open discrepancy: {x}',
    ...Object.fromEntries([
      ['AMOUNT_MISMATCH', 'Amount on the receipt / bank record differs from the amount declared'],
      ['DATE_MISMATCH', 'Issue or maturity date differs from the receipt / bank record'],
      ['FDR_NUMBER_MISMATCH', 'FDR number differs from the receipt / bank record'],
      ['DEPOSITOR_MISMATCH', 'Depositor name differs from the receipt / bank record'],
      ['AICTE_ID_MISMATCH', 'AICTE institution ID on the receipt does not match the institution'],
      ['QR_INVALID', 'QR signature is invalid — the receipt may be forged or altered'],
      ['QR_MISSING', 'Receipt has no digitally signed QR code'],
      ['PDF_EDITED', 'Receipt PDF shows signs of editing after it was issued'],
      ['DUPLICATE_FDR', 'The same FDR is already pledged on another record'],
      ['DUPLICATE_FILE', 'The same file was already uploaded for another record'],
      ['LIEN_NOT_MARKED', 'Bank reports no lien marked in favour of AICTE'],
      ['BANK_NOT_FOUND', 'Bank has no deposit with this FDR number'],
      ['BANK_CLOSED', 'Bank reports the deposit was closed / pre-closed'],
      ['MATURED_NOT_RENEWED', 'Instrument matured and no renewal has been submitted'],
      ['MISSING_DOCUMENT', 'Required receipt / supporting document is missing'],
      ['INSUFFICIENT_AMOUNT', 'Deposit is below the amount required for the institution'],
      ['OTHER', 'Other observation'],
    ].map(([k, v]) => [`fd.dc.code.${k}`, v])),
  },
  hi: {
    'fd.title': 'लिखत विवरण',
    'fd.subtitle': 'एआईसीटीई के पास गिरवी सावधि जमा रसीद',
    'fd.no_id': 'कोई लिखत चयनित नहीं',
    'fd.no_id_text': 'एफडीआर रजिस्टर या सत्यापन कतार से कोई लिखत खोलें।',
    'fd.not_found': 'लिखत नहीं मिला',
    'fd.not_found_text': 'हो सकता है इसे हटा दिया गया हो, या लिंक गलत हो।',
    'fd.to_registry': 'एफडीआर रजिस्टर पर जाएँ',
    'fd.back': 'रजिस्टर',
    'fd.print': 'प्रिंट करें',
    'fd.refresh': 'ताज़ा करें',
    'fd.refreshed': 'नवीनतम विवरण लोड किए गए।',
    'fd.amount_lbl': 'जमा राशि',
    'fd.tenure_rate': '{tenure} माह, {rate}% वार्षिक',
    'fd.copy': 'एफडीआर संख्या कॉपी करें',
    'fd.copied': 'एफडीआर संख्या कॉपी की गई।',
    'fd.ladder': 'विश्वास सीढ़ी',
    'fd.rung0.t': 'दावा', 'fd.rung0.d': 'संस्थान द्वारा प्रपत्र में घोषित',
    'fd.rung1.t': 'दस्तावेज़ मिलान', 'fd.rung1.d': 'रसीद का पाठ प्रपत्र से मेल खाता है',
    'fd.rung2.t': 'बैंक सत्यापित', 'fd.rung2.d': 'हस्ताक्षरित क्यूआर या बैंक एपीआई से पुष्टि',
    'fd.here': 'वर्तमान',
    'fd.flag_note': 'चिह्नित — उच्च या गंभीर विसंगति खुली है',
    'fd.risk_title': 'जोखिम आकलन',
    'fd.risk_score': 'जोखिम अंक',
    'fd.risk_line': 'जोखिम अंक: 100 में से {n}',
    'fd.risk_band': '{band} जोखिम',
    'fd.risk_none': 'कोई जोखिम कारक नहीं — इस लिखत की सभी जाँचें ठीक हैं।',
    'fd.risk_explain': 'नीचे दिया प्रत्येक कारक अंक जोड़ता है (अधिकतम 100)।',
    'fd.renewal_of': '{ref} का नवीनीकरण',
    'fd.fact.issue': 'जारी करने की तिथि',
    'fd.fact.maturity': 'परिपक्वता',
    'fd.fact.lien': 'लियन (बैंक)',
    'fd.fact.purpose': 'प्रयोजन',
    'fd.fact.submitted': 'प्रस्तुत',
    'fd.fact.picked': 'सत्यापन अधिकारी',
    'fd.fact.verified': 'सत्यापित',
    'fd.not_yet': 'अभी नहीं',
    'fd.by': '{name} द्वारा',
    'fd.declared': 'घोषित: {v}',
    'fd.al.forged': 'जाली रसीद का संदेह',
    'fd.al.forged_text': 'छपी रसीद बैंक-हस्ताक्षरित क्यूआर कोड से भिन्न है ({fields})। क्यूआर बैंक की निजी कुंजी से हस्ताक्षरित है और बदला नहीं जा सकता, अतः छपी प्रति में परिवर्तन किया गया है।',
    'fd.al.bank_closed': 'बैंक के अनुसार यह जमा बंद है',
    'fd.al.bank_closed_text': '{bank} ने {date} को जमा बंद कर दी। कारण: {reason}। यह लिखत अब एआईसीटीई को सुरक्षा नहीं देता।',
    'fd.al.bank_nf': 'बैंक में ऐसी कोई जमा नहीं है',
    'fd.al.dup': 'रसीद का किसी अन्य रिकॉर्ड पर पुन: उपयोग',
    'fd.al.dup_text': 'यही रसीद या एफडीआर संख्या इन रिकॉर्ड पर भी उपयोग हुई है:',
    'fd.al.matured': 'नवीनीकरण के बिना परिपक्व',
    'fd.al.matured_text': 'यह लिखत {when} परिपक्व हो गया और कोई नवीनीकरण स्वीकार नहीं हुआ। नवीनीकरण सत्यापित होने तक एआईसीटीई असुरक्षित है।',
    'fd.al.expiring': 'परिपक्वता निकट',
    'fd.al.expiring_text': 'यह लिखत {when} परिपक्व होगा। अभी तक नवीनीकरण स्वीकार नहीं हुआ है।',
    'fd.al.rejected': 'यह लिखत {date} को अस्वीकृत किया गया। यह एआईसीटीई को सुरक्षा नहीं देता।',
    'fd.al.invoked': 'यह जमा {date} को भुनाई गई (एआईसीटीई के पक्ष में नकदीकरण)।',
    'fd.al.renewed': 'इस लिखत को नवीनीकरण {ref} द्वारा प्रतिस्थापित किया गया।',
    'fd.al.released': '{date} को संस्थान को रिलीज़ किया गया। अनापत्ति पत्र "रिलीज़" टैब में है।',
    'fd.al.open_successor': 'नवीनीकरण खोलें',
    'fd.act.workflow': 'निर्णय',
    'fd.act.checks': 'सत्यापन जाँच',
    'fd.act.notes': 'निष्कर्ष एवं टिप्पणियाँ',
    'fd.act.pickup': 'सत्यापन हेतु लें',
    'fd.act.takeover': 'कार्यभार लें',
    'fd.act.verify_qr': 'हस्ताक्षरित क्यूआर जाँचें',
    'fd.act.verify_bank': 'बैंक से सत्यापित करें',
    'fd.act.recheck': 'सभी पुन: जाँचें',
    'fd.act.accept': 'स्वीकार करें',
    'fd.act.return': 'संस्थान को लौटाएँ',
    'fd.act.reject': 'अस्वीकार करें',
    'fd.act.invoke': 'जमा भुनाएँ',
    'fd.act.raise': 'विसंगति दर्ज करें',
    'fd.act.observe': 'टिप्पणी जोड़ें',
    'fd.act.upload': 'दस्तावेज़ अपलोड करें',
    'fd.act.admin': 'प्रशासक लिखत देख सकते हैं। सत्यापन संबंधी निर्णय एआईसीटीई अधिकारी और सक्षम प्राधिकारी लेते हैं।',
    'fd.next': 'अगला चरण:',
    'fd.next.submitted': 'सत्यापन आरंभ करने के लिए यह लिखत लें। यह आपको सौंपा जाएगा।',
    'fd.next.verify_qr': 'रसीद पर बैंक-हस्ताक्षरित क्यूआर जाँचें, फिर बैंक से जमा की पुष्टि करें।',
    'fd.next.verify_bank': 'रसीद प्रपत्र से मेल खाती है। विश्वास सीढ़ी के शीर्ष तक पहुँचने के लिए बैंक से जमा की पुष्टि करें।',
    'fd.next.critical': 'खुली गंभीर विसंगतियों के कारण स्वीकृति रुकी है। उनका समाधान करें, लिखत संस्थान को लौटाएँ या अस्वीकार करें।',
    'fd.next.accept': 'सभी जाँचें पूर्ण हैं। सब कुछ ठीक हो तो लिखत स्वीकार करें।',
    'fd.next.discrepancy': 'संस्थान को लौटाया गया — विसंगतियों पर उसके उत्तर की प्रतीक्षा है।',
    'fd.next.responded': 'संस्थान ने उत्तर दे दिया है। उत्तर की समीक्षा करें, पुन: जाँचें और निर्णय लें।',
    'fd.next.active': 'यह लिखत एआईसीटीई को सुरक्षा दे रहा है। रात्रिकालीन बैंक जाँच इसकी स्थिति अद्यतन रखती है।',
    'fd.next.active_flag': 'बैंक ने इस जमा में समस्या बताई है। विसंगतियों की समीक्षा करें; सक्षम प्राधिकारी जमा भुना सकते हैं।',
    'fd.next.release': 'रिलीज़ अनुरोध प्रक्रिया में है — "रिलीज़" टैब देखें।',
    'fd.next.closed': 'यह लिखत बंद है ({status})। किसी और कार्रवाई की आवश्यकता नहीं है।',
    'fd.cf.pickup': 'क्या {ref} को सत्यापन हेतु लेना है? यह आपको सौंपा जाएगा और "सत्यापनाधीन" हो जाएगा।',
    'fd.cf.takeover': 'क्या {name} से {ref} के सत्यापन का कार्यभार लेना है? यह हस्तांतरण लेखा-परीक्षा अभिलेख में दर्ज होगा।',
    'fd.cf.accept_title': 'लिखत स्वीकार करें',
    'fd.cf.accept': 'क्या {ref} ({amount}) स्वीकार करना है? यह सक्रिय होकर एआईसीटीई को सुरक्षा देगा। संस्थान को सूचित किया जाएगा।',
    'fd.pr.return_title': 'संस्थान को लौटाएँ',
    'fd.pr.return_label': 'संस्थान के लिए टिप्पणी — क्या सुधारना है',
    'fd.pr.reject_title': 'लिखत अस्वीकार करें',
    'fd.pr.reject_label': 'अस्वीकृति का कारण (संस्थान को दिखेगा)। यह कार्रवाई वापस नहीं ली जा सकती।',
    'fd.pr.invoke_title': 'प्रतिभूति जमा भुनाएँ',
    'fd.pr.invoke_label': '{ref} ({amount}) को भुनाने का कारण। बैंक से एआईसीटीई के पक्ष में जमा के नकदीकरण का अनुरोध किया जाएगा। यह कार्रवाई वापस नहीं ली जा सकती।',
    'fd.ovr.title': 'अधिभावी स्वीकृति',
    'fd.ovr.text': 'स्वीकृति रोकी गई क्योंकि इस लिखत पर गंभीर विसंगतियाँ खुली हैं:',
    'fd.ovr.label': 'अधिभावी टिप्पणी — इन निष्कर्षों के बावजूद स्वीकार करना सुरक्षित क्यों है',
    'fd.ovr.confirm': 'अधिभावी रूप से स्वीकार करें',
    'fd.ovr.required': 'कृपया अधिभावी स्वीकृति का कारण लिखें।',
    'fd.ok.pickup': '{ref} अब सत्यापन हेतु आपको सौंपा गया है।',
    'fd.ok.takeover': 'आपने {ref} के सत्यापन का कार्यभार ले लिया है।',
    'fd.ok.accept': '{ref} स्वीकृत — अब यह सक्रिय है और एआईसीटीई को सुरक्षा दे रहा है।',
    'fd.ok.return': '{ref} आपकी टिप्पणी के साथ संस्थान को लौटाया गया।',
    'fd.ok.reject': '{ref} अस्वीकृत। संस्थान को सूचित कर दिया गया है।',
    'fd.ok.invoke': '{ref} भुनाया गया। जमा का नकदीकरण एआईसीटीई के पक्ष में होगा।',
    'fd.ok.disc': 'विसंगति दर्ज की गई। जोखिम अंक अद्यतन कर दिया गया है।',
    'fd.ok.obs': 'टिप्पणी जोड़ी गई।',
    'fd.ok.resolved': 'विसंगति का समाधान दर्ज किया गया।',
    'fd.ok.waived': 'विसंगति माफ़ की गई।',
    'fd.ok.upload': 'दस्तावेज़ अपलोड और विश्लेषित किया गया।',
    'fd.ok.recheck': 'पुन: जाँच पूर्ण।',
    'fd.fail': 'कार्रवाई पूरी नहीं हो सकी: {msg}',
    'fd.rd.title': 'विसंगति दर्ज करें',
    'fd.rd.code': 'विसंगति का प्रकार',
    'fd.rd.sev': 'गंभीरता',
    'fd.rd.sev_hint': 'विसंगति के प्रकार से स्वतः भरी गई; आवश्यकता हो तो बदलें।',
    'fd.rd.msg': 'अभिलेख हेतु विवरण',
    'fd.rd.msg_ph': 'जैसे: रसीद पर परिपक्वता 18-04-2027 है जबकि प्रपत्र में 18-04-2028',
    'fd.rd.submit': 'विसंगति दर्ज करें',
    'fd.ob.title': 'टिप्पणी जोड़ें',
    'fd.ob.text': 'टिप्पणी',
    'fd.ob.vis': 'कौन देख सकता है',
    'fd.ob.internal': 'आंतरिक — केवल एआईसीटीई कर्मचारी',
    'fd.ob.shared': 'साझा — संस्थान को भी दिखेगी',
    'fd.ob.submit': 'टिप्पणी जोड़ें',
    'fd.ob.required': 'कृपया टिप्पणी लिखें।',
    'fd.ob.badge.internal': 'आंतरिक',
    'fd.ob.badge.shared': 'संस्थान के साथ साझा',
    'fd.ob.none': 'अभी कोई टिप्पणी नहीं',
    'fd.ob.none_text': 'अधिकारियों द्वारा जोड़ी गई टिप्पणियाँ यहाँ दिखेंगी।',
    'fd.up.title': 'दस्तावेज़ अपलोड करें',
    'fd.up.file': 'फ़ाइल (PDF, PNG या JPG)',
    'fd.up.kind': 'दस्तावेज़ का प्रकार',
    'fd.up.required': 'अपलोड के लिए फ़ाइल चुनें।',
    'fd.up.hint': 'रसीदें स्वतः पढ़ी जाती हैं: पाठ, बैंक-हस्ताक्षरित क्यूआर, छेड़छाड़ जाँच और दोहराव।',
    'fd.kind.fdr_certificate': 'एफडीआर रसीद',
    'fd.kind.renewal_certificate': 'नवीनीकरण रसीद',
    'fd.kind.bank_letter': 'बैंक पत्र',
    'fd.kind.supporting': 'सहायक दस्तावेज़',
    'fd.kind.noc': 'अनापत्ति पत्र',
    'fd.tab.overview': 'सारांश',
    'fd.tab.document': 'दस्तावेज़',
    'fd.tab.verification': 'सत्यापन',
    'fd.tab.discrepancies': 'विसंगतियाँ',
    'fd.tab.observations': 'टिप्पणियाँ',
    'fd.tab.chain': 'नवीनीकरण शृंखला',
    'fd.tab.releases': 'रिलीज़',
    'fd.tab.audit': 'लेखा-परीक्षा अभिलेख',
    'fd.ov.details': 'लिखत का विवरण',
    'fd.f.beneficiary': 'लाभार्थी',
    'fd.f.auto_renew': 'स्वत: नवीनीकरण',
    'fd.f.lien_claimed': 'लियन (घोषित)',
    'fd.f.lien_confirmed': 'लियन (बैंक)',
    'fd.f.workflow': 'कार्यप्रवाह स्थिति',
    'fd.f.validity': 'वैधता',
    'fd.f.verified_by': 'सत्यापनकर्ता',
    'fd.f.bank_confirmed': 'बैंक पुष्टि',
    'fd.f.last_check': 'अंतिम बैंक जाँच',
    'fd.f.closed_at': 'बंद होने की तिथि',
    'fd.f.predecessor': 'इसका नवीनीकरण',
    'fd.f.successor': 'इसके द्वारा नवीनीकृत',
    'fd.f.notes': 'टिप्पणी',
    'fd.f.picked': 'सत्यापन अधिकारी',
    'fd.f.open_disc': 'खुली विसंगतियाँ',
    'fd.val.VALID': 'वैध', 'fd.val.EXPIRING': 'शीघ्र परिपक्व', 'fd.val.MATURED': 'परिपक्व', 'fd.val.CLOSED': 'बंद',
    'fd.months': '{n} माह',
    'fd.pa': '{n}% वार्षिक',
    'fd.marked': 'अंकित', 'fd.not_marked': 'अंकित नहीं', 'fd.marked_aicte': 'अंकित · एआईसीटीई',
    'fd.cmp.title': 'मिलान: दावा बनाम रसीद बनाम बैंक',
    'fd.cmp.sub': 'संस्थान द्वारा घोषित प्रत्येक विवरण की तुलना रसीद के पाठ, बैंक-हस्ताक्षरित क्यूआर कोड और बैंक के अपने अभिलेख से।',
    'fd.cmp.field': 'विवरण',
    'fd.cmp.claimed': 'संस्थान का दावा',
    'fd.cmp.document': 'रसीद का पाठ',
    'fd.cmp.qr': 'बैंक-हस्ताक्षरित क्यूआर',
    'fd.cmp.bank': 'बैंक अभिलेख',
    'fd.cmp.result': 'परिणाम',
    'fd.cmp.ok': 'दावे से मेल खाता है',
    'fd.cmp.bad': 'दावे से भिन्न',
    'fd.cmp.na': 'उपलब्ध नहीं / अभी जाँचा नहीं गया',
    'fd.cmp.explain': 'हस्ताक्षरित क्यूआर या बैंक कॉलम में ✗ परिवर्तित रसीद का ठोस प्रमाण है: क्यूआर बैंक की निजी कुंजी से हस्ताक्षरित होता है और बैंक अभिलेख सीधे बैंक से आता है।',
    'fd.cmp.st.match': 'मेल', 'fd.cmp.st.mismatch': 'बेमेल', 'fd.cmp.st.partial': 'आंशिक जाँच', 'fd.cmp.st.unknown': 'जाँचा नहीं',
    'fd.cmp.f.fdr_number': 'एफडीआर संख्या', 'fd.cmp.f.amount': 'राशि', 'fd.cmp.f.issue_date': 'जारी करने की तिथि', 'fd.cmp.f.maturity_date': 'परिपक्वता तिथि',
    'fd.cmp.f.depositor_name': 'जमाकर्ता', 'fd.cmp.f.aicte_id': 'एआईसीटीई संस्थान आईडी', 'fd.cmp.f.lien': 'एआईसीटीई के पक्ष में लियन',
    'fd.cmp.empty': 'इस लिखत की कोई रसीद अभी तक विश्लेषित नहीं हुई है।',
    'fd.doc.list': 'दस्तावेज़',
    'fd.doc.none': 'कोई दस्तावेज़ अपलोड नहीं',
    'fd.doc.none_text': 'इस लिखत के लिए अभी तक कोई रसीद अपलोड नहीं हुई है।',
    'fd.doc.open_new': 'नए टैब में खोलें',
    'fd.doc.no_preview': 'इस प्रकार की फ़ाइल का पूर्वावलोकन उपलब्ध नहीं है।',
    'fd.doc.frame_title': 'दस्तावेज़ दर्शक: {name}',
    'fd.doc.qr_ok': 'हस्ताक्षरित क्यूआर वैध',
    'fd.doc.qr_bad': 'क्यूआर अमान्य',
    'fd.doc.flags': '{n} छेड़छाड़ संकेत',
    'fd.ex.title': 'स्मार्ट रसीद पठन',
    'fd.ex.engine': 'पठन विधि',
    'fd.ex.engine.pdf-text': 'पीडीएफ़ पाठ परत', 'fd.ex.engine.ocr-client': 'ब्राउज़र ओसीआर', 'fd.ex.engine.qr-only': 'केवल क्यूआर कोड', 'fd.ex.engine.none': 'पठनीय नहीं',
    'fd.ex.analysed': '{at} को विश्लेषित',
    'fd.ex.fields': 'रसीद से पढ़े गए विवरण',
    'fd.ex.no_fields': 'इस फ़ाइल से कोई विवरण नहीं पढ़ा जा सका।',
    'fd.ex.qr': 'बैंक-हस्ताक्षरित क्यूआर कोड',
    'fd.ex.qr_valid': 'वास्तविक — हस्ताक्षर सत्यापित',
    'fd.ex.qr_invalid': 'हस्ताक्षर जाँच विफल',
    'fd.ex.qr_missing': 'इस रसीद पर कोई हस्ताक्षरित क्यूआर कोड नहीं मिला।',
    'fd.ex.signed_by': '{bank} द्वारा हस्ताक्षरित · कुंजी {key}',
    'fd.ex.signed_payload': 'हस्ताक्षरित क्यूआर में दर्ज विवरण',
    'fd.ex.tamper': 'छेड़छाड़ जाँच',
    'fd.ex.no_tamper': 'संपादन का कोई संकेत नहीं मिला।',
    'fd.ex.producer': 'निर्माता सॉफ़्टवेयर',
    'fd.ex.creator': 'सृजक',
    'fd.ex.pages': 'पृष्ठ',
    'fd.ex.dups': 'दोहराव / पुन: उपयोग जाँच',
    'fd.ex.no_dups': 'यह रसीद किसी अन्य रिकॉर्ड पर उपयोग नहीं हुई है।',
    'fd.ex.same_file': 'यही फ़ाइल इसके लिए भी अपलोड हुई',
    'fd.ex.same_number': 'यही एफडीआर संख्या यहाँ भी गिरवी',
    'fd.ex.sha': 'फ़ाइल फ़िंगरप्रिंट (SHA-256)',
    'fd.ex.none': 'इस दस्तावेज़ का विश्लेषण नहीं हुआ (केवल रसीदें स्वतः पढ़ी जाती हैं)।',
    'fd.exf.fdr_number': 'एफडीआर संख्या', 'fd.exf.amount': 'राशि', 'fd.exf.issue_date': 'जारी करने की तिथि', 'fd.exf.maturity_date': 'परिपक्वता तिथि',
    'fd.exf.depositor_name': 'जमाकर्ता', 'fd.exf.aicte_id': 'एआईसीटीई आईडी', 'fd.exf.ifsc': 'आईएफ़एससी', 'fd.exf.branch': 'शाखा',
    'fd.exf.interest_rate': 'ब्याज दर', 'fd.exf.tenure_months': 'अवधि', 'fd.exf.bank_name': 'बैंक', 'fd.exf.lien_marked': 'लियन',
    'fd.tf.PDF_INCREMENTAL_UPDATE': 'पीडीएफ़ बनने के बाद उसमें परिवर्तन किया गया',
    'fd.tf.EDITOR_PRODUCER': 'पीडीएफ़ संपादक से सहेजी गई ({x})',
    'fd.tf.TEXT_QR_CONFLICT': 'छपा विवरण बैंक-हस्ताक्षरित क्यूआर से भिन्न है',
    'fd.vm.qr_signature': 'बैंक-हस्ताक्षरित क्यूआर जाँच',
    'fd.vm.bank_api': 'बैंक सत्यापन एपीआई',
    'fd.vr.confirmed': 'पुष्ट', 'fd.vr.mismatch': 'बेमेल', 'fd.vr.not_found': 'बैंक में नहीं मिला', 'fd.vr.closed': 'बैंक में बंद',
    'fd.vr.no_qr': 'हस्ताक्षरित क्यूआर नहीं', 'fd.vr.invalid_signature': 'अमान्य हस्ताक्षर',
    'fd.ver.none': 'अभी तक कोई सत्यापन नहीं हुआ',
    'fd.ver.none_text': 'जाँच के लिए "हस्ताक्षरित क्यूआर जाँचें" या "बैंक से सत्यापित करें" का उपयोग करें।',
    'fd.ver.system': 'स्वचालित रात्रिकालीन जाँच',
    'fd.ver.bank_rec': 'बैंक द्वारा लौटाया गया अभिलेख',
    'fd.ver.sig_ok': 'बैंक का हस्ताक्षरित उत्तर सत्यापित',
    'fd.ver.sig_bad': 'बैंक का हस्ताक्षरित उत्तर सत्यापित नहीं हो सका',
    'fd.ver.diff': 'पाए गए अंतर',
    'fd.ver.portal': 'पोर्टल',
    'fd.ver.other': 'स्रोत',
    'fd.ver.newest': 'नवीनतम पहले · {n} जाँच',
    'fd.br.status': 'जमा की स्थिति', 'fd.br.holder': 'धारक', 'fd.br.lien': 'लियन', 'fd.br.lien_to': 'लियन किसके पक्ष में',
    'fd.br.closed_at': 'बंद होने की तिथि', 'fd.br.reason': 'कारण', 'fd.br.found_no': 'बैंक में इस संख्या की कोई जमा नहीं है।',
    'fd.bst.active': 'सक्रिय', 'fd.bst.closed': 'बंद', 'fd.bst.matured': 'परिपक्व', 'fd.bst.renewed': 'नवीनीकृत', 'fd.bst.encashed': 'भुनाई गई',
    'fd.dc.none': 'कोई विसंगति नहीं',
    'fd.dc.none_text': 'इस लिखत पर कुछ भी चिह्नित नहीं किया गया है।',
    'fd.dc.st.open': 'खुली', 'fd.dc.st.resolved': 'समाधान हुआ', 'fd.dc.st.waived': 'माफ़',
    'fd.dc.src.system': 'रसीद जाँच में मिली', 'fd.dc.src.officer': 'अधिकारी द्वारा दर्ज', 'fd.dc.src.bank': 'बैंक द्वारा सूचित',
    'fd.dc.src.nightly': 'रात्रिकालीन बैंक जाँच', 'fd.dc.src.scheduler': 'रात्रिकालीन जाँच',
    'fd.dc.raised': '{date} को दर्ज',
    'fd.dc.response': 'संस्थान का उत्तर · {date}',
    'fd.dc.no_response': 'संस्थान के उत्तर की प्रतीक्षा',
    'fd.dc.resolve': 'समाधान करें', 'fd.dc.waive': 'माफ़ करें',
    'fd.dc.resolve_title': 'विसंगति का समाधान', 'fd.dc.resolve_label': 'समाधान टिप्पणी (कैसे निपटाया गया)',
    'fd.dc.waive_title': 'विसंगति माफ़ करें', 'fd.dc.waive_label': 'यह विसंगति क्यों माफ़ की जा सकती है?',
    'fd.dc.closed_line': '{date} को {status}',
    'fd.dc.summary': '{open} खुली · {closed} बंद',
    'fd.ch.none': 'नवीनीकरण शृंखला का भाग नहीं',
    'fd.ch.none_text': 'यह पहला लिखत है; अभी कोई नवीनीकरण नहीं हुआ है।',
    'fd.ch.gen': 'पीढ़ी {n}',
    'fd.ch.current': 'यह लिखत',
    'fd.ch.late': 'विलंब से नवीनीकृत',
    'fd.ch.explain': 'प्रत्येक नवीनीकरण पिछली रसीद का स्थान लेता है (सबसे पुराना पहले)। विलंबित नवीनीकरण का अर्थ है कि कुछ दिन एआईसीटीई असुरक्षित रहा।',
    'fd.rl.none': 'कोई रिलीज़ अनुरोध नहीं',
    'fd.rl.none_text': 'इस लिखत के रिलीज़ या वापसी अनुरोध यहाँ दिखेंगे।',
    'fd.rl.ref': 'अनुरोध', 'fd.rl.requested': 'अनुरोध तिथि', 'fd.rl.stage': 'चरण', 'fd.rl.sla': 'एसएलए', 'fd.rl.released': 'रिलीज़ तिथि', 'fd.rl.noc': 'अनापत्ति पत्र',
    'fd.rl.noc_open': 'अनापत्ति पत्र देखें', 'fd.rl.sla_left': '{h} घंटे शेष', 'fd.rl.sla_breached': 'एसएलए का उल्लंघन',
    'fd.au.explain': 'इस लिखत पर हर कार्रवाई हैश-शृंखलित, छेड़छाड़-प्रकट लेखा-परीक्षा अभिलेख में दर्ज होती है। नवीनतम पहले।',
    'fd.aa.FDR_SUBMITTED': 'एफडीआर प्रस्तुत', 'fd.aa.RENEWAL_SUBMITTED': 'नवीनीकरण प्रस्तुत', 'fd.aa.FDR_PICKED': 'सत्यापन हेतु लिया गया',
    'fd.aa.QR_VERIFIED': 'हस्ताक्षरित क्यूआर सत्यापित', 'fd.aa.QR_CHECK_FAILED': 'हस्ताक्षरित क्यूआर जाँच विफल', 'fd.aa.QR_INVALID': 'अमान्य क्यूआर हस्ताक्षर', 'fd.aa.QR_MISSING': 'हस्ताक्षरित क्यूआर नहीं',
    'fd.aa.BANK_VERIFIED': 'बैंक द्वारा पुष्टि', 'fd.aa.BANK_CHECK_FAILED': 'बैंक जाँच विफल', 'fd.aa.BANK_CLOSED': 'बैंक के अनुसार जमा बंद',
    'fd.aa.BANK_NOT_FOUND': 'बैंक में ऐसी जमा नहीं', 'fd.aa.BANK_EVENT': 'बैंक घटना', 'fd.aa.BANK_ALERT': 'बैंक चेतावनी', 'fd.aa.BANK_DEPOSIT_ISSUED': 'बैंक द्वारा जमा जारी',
    'fd.aa.DISCREPANCY_RAISED': 'विसंगति दर्ज', 'fd.aa.DISCREPANCY_RESPONDED': 'संस्थान ने उत्तर दिया', 'fd.aa.DISCREPANCY_RESOLVED': 'विसंगति का समाधान',
    'fd.aa.DISCREPANCY_WAIVED': 'विसंगति माफ़', 'fd.aa.DOCUMENT_UPLOADED': 'दस्तावेज़ अपलोड', 'fd.aa.FDR_ACCEPTED': 'स्वीकृत — अब सक्रिय',
    'fd.aa.FDR_RETURNED': 'संस्थान को लौटाया गया', 'fd.aa.FDR_REJECTED': 'अस्वीकृत', 'fd.aa.FDR_INVOKED': 'जमा भुनाई गई', 'fd.aa.FDR_RENEWED': 'नवीनीकरण द्वारा प्रतिस्थापित',
    'fd.aa.FDR_UPDATED': 'विवरण अद्यतन', 'fd.aa.FDR_STATUS_CHANGED': 'स्थिति बदली', 'fd.aa.OBSERVATION_ADDED': 'टिप्पणी जोड़ी गई',
    'fd.aa.RELEASE_SUBMITTED': 'रिलीज़ का अनुरोध', 'fd.aa.RELEASE_REQUESTED': 'रिलीज़ का अनुरोध', 'fd.aa.RELEASE_STAGE': 'रिलीज़ चरण बदला',
    'fd.aa.RELEASE_DONE': 'रिलीज़ — अनापत्ति पत्र जारी', 'fd.aa.RELEASE_REJECTED': 'रिलीज़ अनुरोध अस्वीकृत', 'fd.aa.RELEASE_CHECKLIST': 'रिलीज़ जाँच-सूची अद्यतन',
    'fd.rr.TRUST_CLAIMED': 'विवरण केवल संस्थान द्वारा दावा किए गए हैं (न मिलान हुआ, न बैंक पुष्टि)',
    'fd.rr.TRUST_DOC_ONLY': 'रसीद प्रपत्र से मेल खाती है, पर बैंक ने अभी पुष्टि नहीं की',
    'fd.rr.HIGH_VALUE': 'उच्च मूल्य का लिखत (₹1 करोड़ या अधिक)',
    'fd.rr.TAMPER_SIGNS': 'अपलोड की गई रसीद में संपादन के संकेत हैं',
    'fd.rr.TAMPER_MINOR': 'अपलोड की गई रसीद में छोटी विसंगतियाँ हैं',
    'fd.rr.NO_DOCUMENT': 'कोई रसीद अपलोड नहीं',
    'fd.rr.LIEN_NOT_CONFIRMED': 'बैंक के अनुसार एआईसीटीई के पक्ष में लियन अंकित नहीं',
    'fd.rr.NEW_INSTITUTION': 'संस्थान 3 वर्ष से कम पुराना है',
    'fd.rr.CLOSURE': 'संस्थान ने बंद करने का अनुरोध किया है',
    'fd.rr.MATURED_UNRENEWED': '{n} दिन पहले परिपक्व, कोई स्वीकृत नवीनीकरण नहीं — एआईसीटीई असुरक्षित',
    'fd.rr.VERIFICATION_DELAY': '{n} दिन से सत्यापन की प्रतीक्षा',
    'fd.rr.LATE_RENEWAL_HISTORY': 'संस्थान ने पहले {n} बार विलंब से नवीनीकरण किया',
    'fd.rr.DISC': 'खुली विसंगति: {x}',
    ...Object.fromEntries([
      ['AMOUNT_MISMATCH', 'रसीद / बैंक अभिलेख पर राशि घोषित राशि से भिन्न है'],
      ['DATE_MISMATCH', 'जारी करने या परिपक्वता की तिथि रसीद / बैंक अभिलेख से भिन्न है'],
      ['FDR_NUMBER_MISMATCH', 'एफडीआर संख्या रसीद / बैंक अभिलेख से भिन्न है'],
      ['DEPOSITOR_MISMATCH', 'जमाकर्ता का नाम रसीद / बैंक अभिलेख से भिन्न है'],
      ['AICTE_ID_MISMATCH', 'रसीद पर एआईसीटीई संस्थान आईडी संस्थान से मेल नहीं खाती'],
      ['QR_INVALID', 'क्यूआर हस्ताक्षर अमान्य है — रसीद जाली या परिवर्तित हो सकती है'],
      ['QR_MISSING', 'रसीद पर डिजिटल हस्ताक्षरित क्यूआर कोड नहीं है'],
      ['PDF_EDITED', 'रसीद की पीडीएफ़ में जारी होने के बाद संपादन के संकेत हैं'],
      ['DUPLICATE_FDR', 'यही एफडीआर किसी अन्य रिकॉर्ड पर पहले से गिरवी है'],
      ['DUPLICATE_FILE', 'यही फ़ाइल किसी अन्य रिकॉर्ड के लिए पहले अपलोड हो चुकी है'],
      ['LIEN_NOT_MARKED', 'बैंक के अनुसार एआईसीटीई के पक्ष में लियन अंकित नहीं है'],
      ['BANK_NOT_FOUND', 'बैंक में इस एफडीआर संख्या की कोई जमा नहीं है'],
      ['BANK_CLOSED', 'बैंक के अनुसार जमा बंद / समय-पूर्व बंद कर दी गई है'],
      ['MATURED_NOT_RENEWED', 'लिखत परिपक्व हो गया और कोई नवीनीकरण प्रस्तुत नहीं हुआ'],
      ['MISSING_DOCUMENT', 'आवश्यक रसीद / सहायक दस्तावेज़ उपलब्ध नहीं है'],
      ['INSUFFICIENT_AMOUNT', 'जमा राशि संस्थान के लिए आवश्यक राशि से कम है'],
      ['OTHER', 'अन्य टिप्पणी'],
    ].map(([k, v]) => [`fd.dc.code.${k}`, v])),
  },
});

const { user, meta } = await initPage({
  roles: ['officer', 'authority', 'admin'],
  active: 'registry',
  title: 'fd.title',
  subtitle: 'fd.subtitle',
  breadcrumbs: [{ label: 'nav.registry', href: 'officer/fdrs.html' }, { label: 'fd.title' }],
});

const root = $('#fd-root');
const fdrId = Number(getParam('id')) || 0;
const CAN_ACT = ['officer', 'authority'].includes(user?.role);
const IS_AUTHORITY = user?.role === 'authority';
const DECIDABLE = ['SUBMITTED', 'UNDER_VERIFICATION', 'DISCREPANCY'];
const CLOSED = ['RELEASED', 'REJECTED', 'RENEWED', 'INVOKED'];
const CERT_KINDS = ['fdr_certificate', 'renewal_certificate'];
const TAB_KEYS = ['overview', 'document', 'verification', 'discrepancies', 'observations', 'chain', 'releases', 'audit'];
let D = null;
let activeTab = TAB_KEYS.includes(getParam('tab')) ? getParam('tab') : 'overview';
let selDocId = null;

/* ------------------------------------------------------------------ small helpers */
const dash = '—';
const tx = (key, fallback, vars) => t(key, { _default: fallback ?? key, ...(vars || {}) });
const statusWord = (s) => tx(`status.${String(s || '').toLowerCase()}`, s);
const lg = (badgeHtml) => badgeHtml.replace('class="badge', 'class="badge lg');
const dcLabel = (code) => tx(`fd.dc.code.${code}`, meta?.discrepancy_codes?.[code]?.label || code);
const kindLabel = (k) => tx(`fd.kind.${k}`, k);
const fdrLink = (id, text) => el('a', { href: site(`officer/fdr.html?id=${id}`), class: 'mono' }, text);
const fileUrl = (docId) => api.fileUrl(`/documents/${docId}/file`);
const submittedBy = () => (D.timeline || []).find((e) => ['FDR_SUBMITTED', 'RENEWAL_SUBMITTED'].includes(e.action))?.actor_name || '';
const latestCert = () => [...(D.documents || [])].reverse().find((d) => CERT_KINDS.includes(d.kind));
const latestBank = () => [...(D.verifications || [])].reverse().find((v) => v.method === 'bank_api');
const openDiscs = () => (D.discrepancies || []).filter((d) => d.status === 'open');
const bandColor = (band) => ({ low: 'var(--nk-success)', medium: 'var(--nk-warning)', high: 'var(--nk-orange)', critical: 'var(--nk-danger)' }[band] || 'var(--nk-slate)');

function normV(field, v) {
  if (v === null || v === undefined || v === '') return null;
  if (field === 'amount') { const n = Math.round(Number(v)); return Number.isNaN(n) ? null : n; }
  if (field === 'lien') return typeof v === 'boolean' ? v : ['AICTE', 'TRUE', 'YES', 'MARKED', '1'].includes(String(v).trim().toUpperCase());
  return String(v).trim().toUpperCase().replace(/\s+/g, '');
}

function fmtV(field, v) {
  if (v === null || v === undefined || v === '') return dash;
  if (field === 'amount') return fmtINR(v);
  if (/_date$/.test(field)) return fmtDate(v);
  if (field === 'lien' || field === 'lien_marked') {
    if (typeof v === 'boolean') return v ? t('fd.marked') : t('fd.not_marked');
    return String(v).toUpperCase() === 'AICTE' ? t('fd.marked_aicte') : String(v);
  }
  if (field === 'interest_rate') return t('fd.pa', { n: v });
  if (field === 'tenure_months') return t('fd.months', { n: v });
  return String(v);
}

function riskReasonText(r) {
  const code = r.code || '';
  if (code.startsWith('DISC_')) {
    const dc = code.slice(5);
    if (getLang() === 'hi' && (meta?.discrepancy_codes || {})[dc]) return t('fd.rr.DISC', { x: dcLabel(dc) });
    return r.label;
  }
  const n = (String(r.label || '').match(/\d+/) || [])[0];
  return tx(`fd.rr.${code}`, r.label, { n });
}

function tamperText(f) {
  const x = (String(f.label || '').match(/\(([^)]+)\)/) || [])[1] || '';
  return tx(`fd.tf.${f.code}`, f.label, { x });
}

function actionLabel(a) {
  return tx(`fd.aa.${a}`, String(a || '').toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()));
}

function failToast(err) { toast(t('fd.fail', { msg: err?.message || t('common.error') }), 'error', 7000); }

function errStatus(err) { return err?.status ?? err?.data?.status; }

/* ------------------------------------------------------------------ load */
async function load({ silent = false } = {}) {
  if (!fdrId) {
    emptyState(root, { icon: 'search', title: t('fd.no_id'), text: t('fd.no_id_text'), action: el('a', { class: 'btn', href: site('officer/fdrs.html') }, t('fd.to_registry')) });
    return false;
  }
  if (!silent) loading(root);
  try {
    D = await api.get(`/fdrs/${fdrId}`);
    render();
    return true;
  } catch (err) {
    if (errStatus(err) === 404) {
      emptyState(root, { icon: 'search', title: t('fd.not_found'), text: t('fd.not_found_text'), action: el('a', { class: 'btn', href: site('officer/fdrs.html') }, t('fd.to_registry')) });
    } else if (silent && D) {
      failToast(err);
    } else {
      errorState(root, err, () => load());
    }
    return false;
  }
}

function apply(detail) { if (detail && detail.id) { D = detail; render(); } }

/* ------------------------------------------------------------------ render */
function render() {
  if (!D) return;
  document.title = `${D.ref_no} · ${t('app.name')}`;
  setPageHead({
    title: D.ref_no,
    subtitle: D.institution?.name || '',
    breadcrumbs: [{ label: 'nav.registry', href: 'officer/fdrs.html' }, { label: D.ref_no }],
    actions: headActions(),
  });
  mount(root, renderAlerts(), renderHeader(), renderFacts(), renderActions(), renderTabsCard());
}

function headActions() {
  const refresh = el('button', { class: 'btn secondary sm', type: 'button', html: `${icon('refresh', 15)} ${esc(t('fd.refresh'))}` });
  refresh.addEventListener('click', () => withBusy(refresh, async () => { if (await load({ silent: true })) toast(t('fd.refreshed'), 'success', 2500); }));
  return el('div', { class: 'row nowrap' },
    el('a', { class: 'btn secondary sm', href: site('officer/fdrs.html'), html: `${icon('arrow-left', 15)} ${esc(t('fd.back'))}` }),
    refresh,
    el('button', { class: 'btn ghost sm', type: 'button', onclick: () => window.print(), html: `${icon('print', 15)} ${esc(t('fd.print'))}` }));
}

/* ---------- alerts */
function alertBox(tone, ic, title, body) {
  return el('div', { class: `alert ${tone}`, role: tone === 'danger' ? 'alert' : null },
    el('span', { html: icon(ic, 20) }),
    el('div', { class: 'grow' }, title ? el('div', { class: 'a-title' }, title) : null, body));
}

function renderAlerts() {
  const box = el('div', { class: 'fd-alerts' });
  const st = D.status;
  const closedDate = fmtDate(D.closed_at);
  if (st === 'REJECTED') box.append(alertBox('danger', 'x-circle', null, t('fd.al.rejected', { date: closedDate })));
  if (st === 'INVOKED') box.append(alertBox('danger', 'ban', null, t('fd.al.invoked', { date: closedDate })));
  if (st === 'RELEASED') box.append(alertBox('info', 'unlock', null, t('fd.al.released', { date: closedDate })));
  if (st === 'RENEWED' && D.successor_id) {
    const succ = (D.chain || []).find((c) => c.id === D.successor_id);
    box.append(alertBox('info', 'refresh', null, el('span', {}, t('fd.al.renewed', { ref: succ?.ref_no || '' }), ' ',
      el('a', { href: site(`officer/fdr.html?id=${D.successor_id}`) }, t('fd.al.open_successor')))));
  }
  const ext = D.extraction || {};
  const conflict = (ext.tamper?.flags || []).some((f) => f.code === 'TEXT_QR_CONFLICT');
  if (conflict) {
    const fields = (D.comparison || []).filter((r) => r.qr !== null && r.qr !== undefined && r.document !== null && r.document !== undefined && normV(r.field, r.qr) !== normV(r.field, r.document))
      .map((r) => `${tx(`fd.cmp.f.${r.field}`, r.label)}: ${fmtV(r.field, r.document)} ≠ ${fmtV(r.field, r.qr)}`);
    box.append(alertBox('danger', 'shield-alert', t('fd.al.forged'), t('fd.al.forged_text', { fields: fields.join('; ') || dash })));
  }
  const bank = latestBank();
  if (bank && !CLOSED.includes(st)) {
    const resp = bank.details?.response || {};
    if (bank.result === 'closed') {
      box.append(alertBox('danger', 'alert-circle', t('fd.al.bank_closed'), t('fd.al.bank_closed_text', { bank: D.bank?.name || '', date: fmtDate(resp.closed_at), reason: resp.close_reason || dash })));
    } else if (bank.result === 'not_found') {
      box.append(alertBox('danger', 'alert-circle', t('fd.al.bank_nf'), bank.summary));
    }
  }
  const dups = [...(ext.duplicates?.same_file || []), ...(ext.duplicates?.same_fdr_number || [])];
  const seen = new Set();
  const uniq = dups.filter((d) => !seen.has(d.fdr_id) && seen.add(d.fdr_id));
  if (uniq.length) {
    box.append(alertBox('warning', 'copy', t('fd.al.dup'), el('div', {}, t('fd.al.dup_text'), ' ',
      uniq.map((d, i) => el('span', {}, i ? ', ' : '', fdrLink(d.fdr_id, d.ref_no), ` (${d.institution || ''})`)))));
  }
  if (['ACTIVE', 'RELEASE_REQUESTED'].includes(st) && !D.successor_id) {
    if (D.validity === 'MATURED') box.append(alertBox('warning', 'alert', t('fd.al.matured'), t('fd.al.matured_text', { when: t('rel.days_ago', { n: Math.abs(D.days_to_maturity) }) })));
    else if (D.validity === 'EXPIRING') box.append(alertBox('saffron', 'clock', t('fd.al.expiring'), t('fd.al.expiring_text', { when: relWhen(D.days_to_maturity) })));
  }
  return box;
}

function relWhen(n) {
  if (n === 0) return t('rel.today');
  if (n === 1) return t('rel.tomorrow');
  return t('rel.in_days', { n });
}

/* ---------- header card */
function idCell(ic, label, value, sub) {
  return el('div', {},
    el('div', { class: 'lbl', html: `${icon(ic, 13)} ${esc(label)}` }),
    el('div', { class: 'val' }, value),
    sub ? el('div', { class: 'sub' }, sub) : null);
}

function renderHeader() {
  const inst = D.institution || {};
  const pred = D.predecessor_id ? (D.chain || []).find((c) => c.id === D.predecessor_id) : null;
  const badges = el('div', { class: 'fd-badges', html: [lg(statusBadge(D.display_status)), trustBadge(D.trust_level, D.flagged), riskBadge(D.risk_score, D.risk_band)].join(' ') });
  if (pred) badges.append(el('span', { class: 'badge b-teal', html: `${icon('refresh', 12)} ${esc(t('fd.renewal_of', { ref: pred.ref_no }))}` }));
  const copyBtn = el('button', { class: 'fd-copy', type: 'button', title: t('fd.copy'), 'aria-label': t('fd.copy'), html: icon('copy', 14) });
  copyBtn.addEventListener('click', async () => { try { await copyText(D.fdr_number); toast(t('fd.copied'), 'success', 2000); } catch (e) { failToast(e); } });
  const tenure = D.tenure_months && D.interest_rate ? t('fd.tenure_rate', { tenure: D.tenure_months, rate: D.interest_rate }) : '';
  const main = el('div', { class: 'fd-main' },
    badges,
    el('div', { class: 'small muted', style: { marginTop: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.05em' } }, t('fd.amount_lbl')),
    el('div', { class: 'fd-amount' }, fmtINR(D.amount)),
    el('div', { class: 'fd-amount-sub' }, [fmtINRShort(D.amount), tenure].filter(Boolean).join(' · ')),
    el('div', { class: 'fd-ids' },
      idCell('building', t('f.institution'), inst.id ? el('a', { href: site(`officer/institution.html?id=${inst.id}`) }, inst.name) : (inst.name || dash),
        [inst.aicte_id, [inst.city, inst.state].filter(Boolean).join(', ')].filter(Boolean).join(' · ')),
      idCell('bank', t('f.bank'), D.bank?.name || dash, [D.branch, D.ifsc ? `IFSC ${D.ifsc}` : ''].filter(Boolean).join(' · ')),
      idCell('file-text', t('f.fdr_number'), el('span', {}, el('span', { class: 'mono' }, D.fdr_number), copyBtn), `${t('f.ref_no')}: ${D.ref_no}`)),
    renderLadder());
  return el('section', { class: 'card accent-top fd-head', 'aria-label': D.ref_no }, main, renderRisk());
}

function renderLadder() {
  const lv = Number(D.trust_level) || 0;
  const icons = ['user', 'file-check', 'shield-check'];
  const rungs = [0, 1, 2].map((i) => {
    const cur = i === lv;
    return el('div', { class: `rung l${i} ${i <= lv ? 'on' : ''} ${cur ? 'current' : ''} ${cur && D.flagged ? 'flag-current' : ''}`, 'aria-current': cur ? 'step' : null },
      cur ? el('span', { class: 'r-here' }, t('fd.here')) : null,
      el('div', { class: 'r-title', html: `${icon(icons[i], 15)} ${i} · ${esc(t(`fd.rung${i}.t`))}` }),
      el('div', {}, t(`fd.rung${i}.d`)));
  });
  return el('div', { class: 'fd-ladder-wrap' },
    el('div', { class: 'ladder-head' },
      el('h3', {}, t('fd.ladder')),
      D.flagged ? el('span', { class: 'badge trust-flag', html: `${icon('flag', 12)} ${esc(t('fd.flag_note'))}` }) : null),
    el('div', { class: 'trust-ladder', role: 'list', 'aria-label': t('fd.ladder') }, rungs));
}

function gauge(score, band) {
  const s = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const col = bandColor(band);
  const arc = 'M15 78 A60 60 0 0 1 135 78';
  const ticks = [30, 60, 80].map((p) => {
    const a = Math.PI * (1 - p / 100);
    const x1 = 75 + 51 * Math.cos(a), y1 = 78 - 51 * Math.sin(a), x2 = 75 + 69 * Math.cos(a), y2 = 78 - 69 * Math.sin(a);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" style="stroke:var(--nk-surface)" stroke-width="2.5"/>`;
  }).join('');
  return el('div', {
    class: 'gauge fd-gauge', role: 'img', 'aria-label': `${t('fd.risk_score')}: ${s} / 100 (${t(`risk.${band}`)})`,
    html: `<svg viewBox="0 0 150 86" aria-hidden="true"><path d="${arc}" fill="none" style="stroke:var(--nk-border)" stroke-width="14" stroke-linecap="round"/>`
      + (s > 0 ? `<path d="${arc}" fill="none" style="stroke:${col}" stroke-width="14" stroke-linecap="round" pathLength="100" stroke-dasharray="${s} 100"/>` : '')
      + `${ticks}</svg><div class="g-value" style="color:${col}">${s}</div>`,
  });
}

function renderRisk() {
  const band = D.risk_band || riskBand(D.risk_score) || 'low';
  const reasons = D.risk_reasons || [];
  return el('div', { class: 'fd-risk' },
    el('h3', {}, t('fd.risk_title')),
    el('div', { class: 'fd-risk-top' },
      gauge(D.risk_score, band),
      el('div', {},
        el('div', { html: `<span class="badge lg risk-${band}">${icon(band === 'low' ? 'shield-check' : 'shield-alert', 14)}${esc(t('fd.risk_band', { band: t(`risk.${band}`) }))}</span>` }),
        el('div', { class: 'small muted', style: { marginTop: '6px' } }, t('fd.risk_line', { n: D.risk_score ?? 0 })),
        reasons.length ? el('div', { class: 'small muted' }, t('fd.risk_explain')) : null)),
    reasons.length
      ? el('ul', { class: 'fd-reasons' }, reasons.map((r) => el('li', {}, el('span', { class: 'pts' }, `+${r.points}`), el('span', {}, riskReasonText(r)))))
      : el('div', { class: 'alert success', style: { marginTop: '14px' } }, el('span', { html: icon('check-circle', 18) }), el('div', {}, t('fd.risk_none'))));
}

/* ---------- key facts */
function fact(label, value, sub) {
  return el('div', {}, el('div', { class: 'lbl' }, label), el('div', { class: 'val' }, value), sub ? el('div', { class: 'sub' }, sub) : null);
}

function renderFacts() {
  const by = submittedBy();
  const lienClaimed = D.lien_claimed ? t('common.yes') : t('common.no');
  return el('section', { class: 'card', 'aria-label': t('fd.ov.details') },
    el('div', { class: 'fd-facts' },
      fact(t('fd.fact.issue'), fmtDate(D.issue_date)),
      fact(t('fd.fact.maturity'), fmtDate(D.maturity_date), CLOSED.includes(D.status) ? null : el('span', { html: maturityChip(D.days_to_maturity) })),
      fact(t('fd.fact.lien'), el('span', { html: lienBadge(D.lien_confirmed, D.lien_claimed) }), t('fd.declared', { v: lienClaimed })),
      fact(t('fd.fact.purpose'), D.purpose || dash),
      fact(t('fd.fact.submitted'), fmtDate(D.submitted_at), by ? t('fd.by', { name: by }) : null),
      fact(t('fd.fact.picked'), D.picked_by?.name || t('fd.not_yet'), D.picked_at ? fmtDateTime(D.picked_at) : null),
      fact(t('fd.fact.verified'), D.verified_at ? fmtDate(D.verified_at) : t('fd.not_yet'), D.verified_by?.name ? t('fd.by', { name: D.verified_by.name }) : null)));
}

/* ---------- actions */
function nextStepText() {
  const st = D.status;
  const critical = openDiscs().some((d) => d.severity === 'critical');
  const qrDone = (D.verifications || []).some((v) => v.method === 'qr_signature');
  if (st === 'SUBMITTED') return t('fd.next.submitted');
  if (st === 'UNDER_VERIFICATION') {
    if (critical) return t('fd.next.critical');
    if (D.trust_level >= 2) return t('fd.next.accept');
    if (!qrDone && latestCert()?.extraction?.qr?.found) return t('fd.next.verify_qr');
    return t('fd.next.verify_bank');
  }
  if (st === 'DISCREPANCY') return (D.discrepancies || []).some((d) => d.status === 'open' && d.institution_response) ? t('fd.next.responded') : t('fd.next.discrepancy');
  if (st === 'ACTIVE') return D.flagged ? t('fd.next.active_flag') : t('fd.next.active');
  if (st === 'RELEASE_REQUESTED') return t('fd.next.release');
  return t('fd.next.closed', { status: statusWord(st) });
}

function btn(label, ic, variant, handler) {
  const b = el('button', { class: `btn sm ${variant}`.trim(), type: 'button', html: `${icon(ic, 15)} ${esc(label)}` });
  b.addEventListener('click', () => handler(b));
  return b;
}

function group(label, buttons) {
  const list = buttons.filter(Boolean);
  if (!list.length) return null;
  return el('div', { class: 'grp', role: 'group', 'aria-label': label }, el('div', { class: 'grp-lbl' }, label), el('div', { class: 'grp-btns' }, list));
}

function renderActions() {
  const next = el('div', { class: 'fd-next' }, el('span', { html: icon('info', 18) }), el('div', {}, el('strong', {}, t('fd.next')), ' ', nextStepText()));
  if (!CAN_ACT) {
    return el('section', { class: 'card fd-actions-card' }, next,
      el('div', { class: 'card-body small text-2', html: `${icon('lock', 14)} ${esc(t('fd.act.admin'))}` }));
  }
  const st = D.status;
  const live = !CLOSED.includes(st);
  const me = user?.id;
  const takeover = ['UNDER_VERIFICATION', 'DISCREPANCY'].includes(st) && D.picked_by && D.picked_by.id !== me;
  const workflow = group(t('fd.act.workflow'), [
    st === 'SUBMITTED' ? btn(t('fd.act.pickup'), 'inbox', '', doPickup) : null,
    takeover ? btn(t('fd.act.takeover'), 'users', 'secondary', doPickup) : null,
    DECIDABLE.includes(st) ? btn(t('fd.act.accept'), 'check-circle', 'success', doAccept) : null,
    ['SUBMITTED', 'UNDER_VERIFICATION'].includes(st) ? btn(t('fd.act.return'), 'arrow-left', 'warning', doReturn) : null,
    DECIDABLE.includes(st) ? btn(t('fd.act.reject'), 'x-circle', 'danger', doReject) : null,
    IS_AUTHORITY && ['ACTIVE', 'RELEASE_REQUESTED'].includes(st) ? btn(t('fd.act.invoke'), 'ban', 'danger', doInvoke) : null,
  ]);
  const checks = group(t('fd.act.checks'), live ? [
    latestCert() ? btn(t('fd.act.verify_qr'), 'qr', 'secondary', (b) => doCheck(b, 'verify-qr')) : null,
    btn(t('fd.act.verify_bank'), 'bank', 'secondary', (b) => doCheck(b, 'verify-bank')),
    btn(t('fd.act.recheck'), 'refresh', 'ghost', doRecheck),
  ] : []);
  const notes = group(t('fd.act.notes'), [
    live ? btn(t('fd.act.raise'), 'flag', 'outline-danger', doRaise) : null,
    btn(t('fd.act.observe'), 'edit', 'secondary', doObserve),
    live ? btn(t('fd.act.upload'), 'upload', 'ghost', doUpload) : null,
  ]);
  return el('section', { class: 'card fd-actions-card', 'aria-label': t('fd.act.workflow') }, next,
    el('div', { class: 'card-body' }, el('div', { class: 'fd-actions' }, workflow, checks, notes)));
}

/* ---------- action handlers */
async function doPickup(b) {
  const isTake = D.status !== 'SUBMITTED';
  const ok = await confirmDialog(isTake ? t('fd.cf.takeover', { ref: D.ref_no, name: D.picked_by?.name || '' }) : t('fd.cf.pickup', { ref: D.ref_no }),
    { title: isTake ? t('fd.act.takeover') : t('fd.act.pickup'), confirmLabel: isTake ? t('fd.act.takeover') : t('fd.act.pickup') });
  if (!ok) return;
  await withBusy(b, async () => {
    try {
      apply(await api.post(`/fdrs/${D.id}/pickup`));
      toast(t(isTake ? 'fd.ok.takeover' : 'fd.ok.pickup', { ref: D.ref_no }), 'success');
    } catch (err) { failToast(err); }
  });
}

function verifTone(result) {
  if (result === 'confirmed') return 'success';
  if (result === 'no_qr') return 'warning';
  return 'error';
}

async function doCheck(b, path) {
  await withBusy(b, async () => {
    try {
      const res = await api.post(`/fdrs/${D.id}/${path}`);
      apply(res.fdr);
      const v = res.verification || {};
      toast(`${tx(`fd.vm.${v.method}`, v.method)}: ${v.summary || tx(`fd.vr.${v.result}`, v.result)}`, verifTone(v.result), 7000);
    } catch (err) { failToast(err); }
  });
}

async function doRecheck(b) {
  await withBusy(b, async () => {
    try {
      const res = await api.post(`/fdrs/${D.id}/recheck`);
      apply(res.fdr);
      const vs = res.verifications || [];
      const bad = vs.find((v) => v.result !== 'confirmed');
      toast(el('div', {}, el('strong', {}, t('fd.ok.recheck')), vs.map((v) => el('div', { class: 'small' }, `${tx(`fd.vm.${v.method}`, v.method)}: ${v.summary}`))),
        bad ? verifTone(bad.result) : 'success', 8000);
    } catch (err) { failToast(err); }
  });
}

async function doAccept(b) {
  // Open critical discrepancies block a plain accept (server answers 409) - go straight to the override dialog.
  if (openDiscs().some((d) => d.severity === 'critical')) { overrideDialog(null); return; }
  const ok = await confirmDialog(t('fd.cf.accept', { ref: D.ref_no, amount: fmtINR(D.amount) }), { title: t('fd.cf.accept_title'), confirmLabel: t('fd.act.accept'), variant: 'success' });
  if (!ok) return;
  let blocked = null;
  await withBusy(b, async () => {
    try {
      apply(await api.post(`/fdrs/${D.id}/decision`, { action: 'accept', note: '' }));
      toast(t('fd.ok.accept', { ref: D.ref_no }), 'success');
    } catch (err) {
      if (errStatus(err) === 409 && openDiscs().some((d) => d.severity === 'critical')) blocked = err;
      else failToast(err);
    }
  });
  if (blocked) overrideDialog(blocked);
}

function overrideDialog(err) {
  const crit = openDiscs().filter((d) => d.severity === 'critical');
  const ta = el('textarea', { class: 'textarea', id: 'fd-ovr-note', rows: 4, required: true });
  const errEl = el('div', { class: 'error', role: 'alert' });
  const body = el('div', { class: 'stack' },
    el('div', { class: 'alert danger' }, el('span', { html: icon('alert-circle', 18) }),
      el('div', {}, el('div', { class: 'a-title' }, t('fd.ovr.text')),
        el('ul', { style: { margin: '4px 0 0', paddingLeft: '18px' } }, crit.map((d) => el('li', {}, `${dcLabel(d.code)}${d.message ? ` — ${d.message}` : ''}`))))),
    err?.message ? el('div', { class: 'small text-2' }, err.message) : null,
    el('div', { class: 'field' }, el('label', { for: 'fd-ovr-note' }, t('fd.ovr.label'), ' ', el('span', { class: 'req' }, '*')), ta, errEl));
  modal({
    title: t('fd.ovr.title'), body, actions: [
      { label: t('common.cancel'), variant: 'secondary' },
      {
        label: t('fd.ovr.confirm'), variant: 'warning', onClick: async () => {
          const note = ta.value.trim();
          if (!note) { errEl.textContent = t('fd.ovr.required'); ta.classList.add('invalid'); ta.focus(); return false; }
          try {
            apply(await api.post(`/fdrs/${D.id}/decision`, { action: 'accept', note, override: true }));
            toast(t('fd.ok.accept', { ref: D.ref_no }), 'success');
            return true;
          } catch (e) { errEl.textContent = e.message; return false; }
        },
      },
    ],
  });
  setTimeout(() => ta.focus(), 50);
}

async function decideWithNote(b, action, titleKey, labelKey, okKey, variant) {
  const note = await promptDialog({ title: t(titleKey), label: t(labelKey), required: true, confirmLabel: t(`fd.act.${action}`), variant });
  if (note === null) return;
  await withBusy(b, async () => {
    try {
      apply(await api.post(`/fdrs/${D.id}/decision`, { action, note }));
      toast(t(okKey, { ref: D.ref_no }), action === 'reject' ? 'warning' : 'success');
    } catch (err) { failToast(err); }
  });
}

const doReturn = (b) => decideWithNote(b, 'return', 'fd.pr.return_title', 'fd.pr.return_label', 'fd.ok.return', 'warning');
const doReject = (b) => decideWithNote(b, 'reject', 'fd.pr.reject_title', 'fd.pr.reject_label', 'fd.ok.reject', 'danger');

async function doInvoke(b) {
  const reason = await promptDialog({ title: t('fd.pr.invoke_title'), label: t('fd.pr.invoke_label', { ref: D.ref_no, amount: fmtINR(D.amount) }), required: true, confirmLabel: t('fd.act.invoke'), variant: 'danger' });
  if (reason === null) return;
  await withBusy(b, async () => {
    try {
      apply(await api.post(`/fdrs/${D.id}/invoke`, { reason }));
      toast(t('fd.ok.invoke', { ref: D.ref_no }), 'warning', 7000);
    } catch (err) { failToast(err); }
  });
}

function doRaise() {
  const codes = Object.keys(meta?.discrepancy_codes || {}).length ? Object.keys(meta.discrepancy_codes) : DC_CODES;
  const sevs = meta?.severities || ['low', 'medium', 'high', 'critical'];
  const codeSel = el('select', { class: 'select', id: 'fd-rd-code' }, codes.map((c) => el('option', { value: c }, dcLabel(c))));
  const sevSel = el('select', { class: 'select', id: 'fd-rd-sev' }, sevs.map((s) => el('option', { value: s }, t(`sev.${s}`))));
  const msg = el('textarea', { class: 'textarea', id: 'fd-rd-msg', rows: 3, placeholder: t('fd.rd.msg_ph') });
  const errEl = el('div', { class: 'error', role: 'alert' });
  const syncSev = () => { sevSel.value = meta?.discrepancy_codes?.[codeSel.value]?.severity || 'medium'; };
  codeSel.addEventListener('change', syncSev);
  syncSev();
  const body = el('div', { class: 'form-grid' },
    el('div', { class: 'field full' }, el('label', { for: 'fd-rd-code' }, t('fd.rd.code')), codeSel),
    el('div', { class: 'field full' }, el('label', { for: 'fd-rd-sev' }, t('fd.rd.sev')), sevSel, el('span', { class: 'hint' }, t('fd.rd.sev_hint'))),
    el('div', { class: 'field full' }, el('label', { for: 'fd-rd-msg' }, t('fd.rd.msg')), msg, errEl));
  modal({
    title: t('fd.rd.title'), body, actions: [
      { label: t('common.cancel'), variant: 'secondary' },
      {
        label: t('fd.rd.submit'), variant: 'danger', onClick: async () => {
          try {
            await api.post(`/fdrs/${D.id}/discrepancies`, { code: codeSel.value, severity: sevSel.value, message: msg.value.trim() || undefined });
            activeTab = 'discrepancies';
            await load({ silent: true });
            toast(t('fd.ok.disc'), 'success');
            return true;
          } catch (e) { errEl.textContent = e.message; return false; }
        },
      },
    ],
  });
}

function doObserve() {
  const ta = el('textarea', { class: 'textarea', id: 'fd-ob-text', rows: 4 });
  const errEl = el('div', { class: 'error', role: 'alert' });
  const radio = (v, checked) => el('label', { class: 'check' }, el('input', { type: 'radio', name: 'fd-ob-vis', value: v, checked }), ' ', t(`fd.ob.${v}`));
  const body = el('div', { class: 'form-grid' },
    el('div', { class: 'field full' }, el('label', { for: 'fd-ob-text' }, t('fd.ob.text'), ' ', el('span', { class: 'req' }, '*')), ta, errEl),
    el('fieldset', { class: 'field full', style: { border: '0', padding: '0', margin: '0' } }, el('legend', { class: 'small', style: { fontWeight: '600', marginBottom: '4px' } }, t('fd.ob.vis')),
      radio('internal', true), radio('shared', false)));
  modal({
    title: t('fd.ob.title'), body, actions: [
      { label: t('common.cancel'), variant: 'secondary' },
      {
        label: t('fd.ob.submit'), onClick: async () => {
          const text = ta.value.trim();
          if (!text) { errEl.textContent = t('fd.ob.required'); ta.classList.add('invalid'); ta.focus(); return false; }
          const visibility = body.querySelector('input[name="fd-ob-vis"]:checked')?.value || 'internal';
          try {
            await api.post(`/fdrs/${D.id}/observations`, { text, visibility });
            activeTab = 'observations';
            await load({ silent: true });
            toast(t('fd.ok.obs'), 'success');
            return true;
          } catch (e) { errEl.textContent = e.message; return false; }
        },
      },
    ],
  });
  setTimeout(() => ta.focus(), 50);
}

function doUpload() {
  const file = el('input', { type: 'file', class: 'input', id: 'fd-up-file', accept: '.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg' });
  const kind = el('select', { class: 'select', id: 'fd-up-kind' }, ['fdr_certificate', 'renewal_certificate', 'bank_letter', 'supporting'].map((k) => el('option', { value: k }, kindLabel(k))));
  const errEl = el('div', { class: 'error', role: 'alert' });
  const body = el('div', { class: 'form-grid' },
    el('div', { class: 'field full' }, el('label', { for: 'fd-up-file' }, t('fd.up.file'), ' ', el('span', { class: 'req' }, '*')), file, el('span', { class: 'hint' }, t('fd.up.hint')), errEl),
    el('div', { class: 'field full' }, el('label', { for: 'fd-up-kind' }, t('fd.up.kind')), kind));
  modal({
    title: t('fd.up.title'), body, actions: [
      { label: t('common.cancel'), variant: 'secondary' },
      {
        label: t('common.upload'), onClick: async () => {
          if (!file.files?.length) { errEl.textContent = t('fd.up.required'); return false; }
          const fd = new FormData();
          fd.append('file', file.files[0]);
          fd.append('kind', kind.value);
          try {
            const doc = await api.upload(`/fdrs/${D.id}/documents`, fd);
            selDocId = doc?.id || null;
            activeTab = 'document';
            await load({ silent: true });
            toast(t('fd.ok.upload'), 'success');
            return true;
          } catch (e) { errEl.textContent = e.message; return false; }
        },
      },
    ],
  });
}

async function doResolve(b, disc, resolution) {
  const waive = resolution === 'waived';
  const note = await promptDialog({ title: t(waive ? 'fd.dc.waive_title' : 'fd.dc.resolve_title'), label: t(waive ? 'fd.dc.waive_label' : 'fd.dc.resolve_label'), required: true, confirmLabel: t(waive ? 'fd.dc.waive' : 'fd.dc.resolve'), variant: waive ? 'warning' : 'success' });
  if (note === null) return;
  await withBusy(b, async () => {
    try {
      await api.post(`/discrepancies/${disc.id}/resolve`, { resolution, note });
      await load({ silent: true });
      toast(t(waive ? 'fd.ok.waived' : 'fd.ok.resolved'), 'success');
    } catch (err) { failToast(err); }
  });
}

/* ------------------------------------------------------------------ tabs */
function renderTabsCard() {
  const holder = el('div');
  const card = el('section', { class: 'card fd-tabs-card' }, el('div', { class: 'card-body' }, holder));
  const n = (a) => (a || []).length;
  tabs(holder, [
    { key: 'overview', label: t('fd.tab.overview'), icon: 'eye', render: renderOverview },
    { key: 'document', label: t('fd.tab.document'), icon: 'file-text', count: n(D.documents), render: renderDocument },
    { key: 'verification', label: t('fd.tab.verification'), icon: 'shield-check', count: n(D.verifications), render: renderVerification },
    { key: 'discrepancies', label: t('fd.tab.discrepancies'), icon: 'flag', count: openDiscs().length || n(D.discrepancies), render: renderDiscrepancies },
    { key: 'observations', label: t('fd.tab.observations'), icon: 'edit', count: n(D.observations), render: renderObservations },
    { key: 'chain', label: t('fd.tab.chain'), icon: 'git-branch', count: n(D.chain) > 1 ? n(D.chain) : 0, render: renderChain },
    { key: 'releases', label: t('fd.tab.releases'), icon: 'unlock', count: n(D.releases), render: renderReleases },
    { key: 'audit', label: t('fd.tab.audit'), icon: 'history', count: n(D.timeline), render: renderAudit },
  ], { active: activeTab, onChange: (k) => { activeTab = k; setParams({ tab: k === 'overview' ? null : k }); } });
  return card;
}

function sectionHead(title, sub, extra) {
  return el('div', { class: 'row between', style: { alignItems: 'flex-start', marginBottom: '12px' } },
    el('div', {}, el('h3', { class: 'mb-0' }, title), sub ? el('div', { class: 'small muted', style: { marginTop: '2px' } }, sub) : null),
    extra || null);
}

/* ---------- overview */
function renderOverview(panel) {
  const inst = D.institution || {};
  const yesNo = (v) => (v ? t('common.yes') : t('common.no'));
  const chainItem = (id) => (D.chain || []).find((c) => c.id === id);
  const pairs = [
    [t('f.ref_no'), `<span class="mono">${esc(D.ref_no)}</span>`],
    [t('f.fdr_number'), `<span class="mono">${esc(D.fdr_number)}</span>`],
    [t('f.amount'), `<strong>${esc(fmtINR(D.amount))}</strong>`],
    [t('f.institution'), el('a', { href: site(`officer/institution.html?id=${inst.id}`) }, inst.name || dash)],
    [t('f.aicte_id'), esc(inst.aicte_id || dash)],
    [t('f.state'), esc([inst.city, inst.state].filter(Boolean).join(', ') || dash)],
    [t('f.bank'), esc(D.bank?.name || dash)],
    [t('f.branch'), esc(D.branch || dash)],
    [t('f.ifsc'), `<span class="mono">${esc(D.ifsc || dash)}</span>`],
    [t('f.issue_date'), esc(fmtDate(D.issue_date))],
    [t('f.maturity_date'), `${esc(fmtDate(D.maturity_date))} ${CLOSED.includes(D.status) ? '' : maturityChip(D.days_to_maturity)}`],
    [t('f.tenure'), esc(D.tenure_months ? t('fd.months', { n: D.tenure_months }) : dash)],
    [t('f.interest_rate'), esc(D.interest_rate ? t('fd.pa', { n: D.interest_rate }) : dash)],
    [t('f.depositor'), esc(D.depositor_name || dash)],
    [t('fd.f.beneficiary'), esc(D.beneficiary || dash)],
    [t('f.purpose'), esc(D.purpose || dash)],
    [t('fd.f.lien_claimed'), esc(yesNo(D.lien_claimed))],
    [t('fd.f.lien_confirmed'), lienBadge(D.lien_confirmed, D.lien_claimed)],
    [t('fd.f.auto_renew'), esc(yesNo(D.auto_renew))],
    [t('fd.f.workflow'), statusBadge(String(D.status || '').toLowerCase())],
    [t('fd.f.validity'), esc(tx(`fd.val.${D.validity}`, D.validity))],
    [t('f.trust'), trustBadge(D.trust_level, D.flagged)],
    [t('f.risk'), riskBadge(D.risk_score, D.risk_band)],
    [t('fd.f.open_disc'), esc(String(D.open_discrepancies ?? openDiscs().length))],
    [t('f.submitted_at'), esc(fmtDateTime(D.submitted_at))],
    [t('fd.f.picked'), esc(D.picked_by ? `${D.picked_by.name} · ${fmtDateTime(D.picked_at)}` : t('fd.not_yet'))],
    [t('fd.f.verified_by'), esc(D.verified_by ? `${D.verified_by.name} · ${fmtDateTime(D.verified_at)}` : t('fd.not_yet'))],
    [t('fd.f.bank_confirmed'), esc(D.bank_confirmed_at ? fmtDateTime(D.bank_confirmed_at) : t('fd.not_yet'))],
    [t('fd.f.last_check'), esc(D.last_bank_check_at ? fmtDateTime(D.last_bank_check_at) : t('fd.not_yet'))],
  ];
  if (D.closed_at) pairs.push([t('fd.f.closed_at'), esc(fmtDateTime(D.closed_at))]);
  if (D.predecessor_id) pairs.push([t('fd.f.predecessor'), fdrLink(D.predecessor_id, chainItem(D.predecessor_id)?.ref_no || `#${D.predecessor_id}`)]);
  if (D.successor_id) pairs.push([t('fd.f.successor'), fdrLink(D.successor_id, chainItem(D.successor_id)?.ref_no || `#${D.successor_id}`)]);
  if (D.notes) pairs.push([t('fd.f.notes'), esc(D.notes)]);
  mount(panel, el('div', { class: 'stack lg' },
    el('div', {}, sectionHead(t('fd.ov.details')), dl(pairs, { cols: 3 })),
    renderComparison()));
}

function renderComparison() {
  const rows = D.comparison || [];
  const wrap = el('div', {}, sectionHead(t('fd.cmp.title'), t('fd.cmp.sub')));
  if (!rows.length || rows.every((r) => r.status === 'unknown' && r.document == null && r.qr == null && r.bank == null)) {
    wrap.append(el('div', { class: 'alert info' }, el('span', { html: icon('info', 18) }), el('div', {}, t('fd.cmp.empty'))));
    return wrap;
  }
  const stCls = { match: 'b-success', mismatch: 'b-danger', partial: 'b-info', unknown: 'b-slate' };
  const cell = (r, key) => {
    const v = r[key];
    if (v === null || v === undefined || v === '') return `<td class="na"><span aria-hidden="true">—</span><span class="sr-only">${esc(t('fd.cmp.na'))}</span></td>`;
    const ok = normV(r.field, v) === normV(r.field, r.claimed);
    return `<td class="${ok ? 'ok' : 'bad'}"><span aria-hidden="true">${ok ? '✓' : '✗'}</span><span class="sr-only">${esc(t(ok ? 'fd.cmp.ok' : 'fd.cmp.bad'))}</span> <span class="cmp-v">${esc(fmtV(r.field, v))}</span></td>`;
  };
  const head = ['field', 'claimed', 'document', 'qr', 'bank', 'result'].map((k) => `<th scope="col">${esc(t(`fd.cmp.${k}`))}</th>`).join('');
  const body = rows.map((r) => `<tr class="${r.status === 'mismatch' ? 'row-danger' : ''}"><th scope="row" style="font-weight:600">${esc(tx(`fd.cmp.f.${r.field}`, r.label))}</th>`
    + `<td class="cmp-claimed cmp-v">${esc(fmtV(r.field, r.claimed))}</td>${cell(r, 'document')}${cell(r, 'qr')}${cell(r, 'bank')}`
    + `<td><span class="badge ${stCls[r.status] || 'b-slate'}">${esc(tx(`fd.cmp.st.${r.status}`, r.status))}</span></td></tr>`).join('');
  wrap.append(
    el('div', { class: 'table-wrap' }, el('table', { class: 'table compare-table compact', html: `<caption class="sr-only">${esc(t('fd.cmp.title'))}</caption><thead><tr>${head}</tr></thead><tbody>${body}</tbody>` })),
    el('div', { class: 'cmp-legend', style: { marginTop: '10px' } },
      el('span', { html: `<b style="color:var(--nk-success)">✓</b>${esc(t('fd.cmp.ok'))}` }),
      el('span', { html: `<b style="color:var(--nk-danger)">✗</b>${esc(t('fd.cmp.bad'))}` }),
      el('span', { html: `<b style="color:var(--nk-muted)">—</b>${esc(t('fd.cmp.na'))}` })),
    el('p', { class: 'small text-2', style: { margin: '8px 0 0' } }, t('fd.cmp.explain')));
  return wrap;
}

/* ---------- document */
function renderDocument(panel) {
  const docs = D.documents || [];
  if (!docs.length) {
    emptyState(panel, { icon: 'file', title: t('fd.doc.none'), text: t('fd.doc.none_text'), action: CAN_ACT && !CLOSED.includes(D.status) ? btn(t('fd.act.upload'), 'upload', '', doUpload) : null });
    return;
  }
  if (!docs.some((d) => d.id === selDocId)) selDocId = (latestCert() || docs[docs.length - 1]).id;
  const viewer = el('div');
  const extract = el('div');
  const list = el('div', { class: 'list-divided doc-list', role: 'listbox', 'aria-label': t('fd.doc.list') });
  const paint = () => {
    const doc = docs.find((d) => d.id === selDocId);
    [...list.children].forEach((n) => { const on = Number(n.dataset.id) === selDocId; n.classList.toggle('sel', on); n.setAttribute('aria-selected', on); });
    renderViewer(viewer, doc);
    renderExtraction(extract, doc);
  };
  docs.slice().reverse().forEach((d) => {
    const badges = [];
    if (d.qr_valid === true) badges.push(`<span class="badge b-success">${icon('shield-check', 12)}${esc(t('fd.doc.qr_ok'))}</span>`);
    else if (d.qr_valid === false && CERT_KINDS.includes(d.kind)) badges.push(`<span class="badge b-danger">${icon('shield-alert', 12)}${esc(t('fd.doc.qr_bad'))}</span>`);
    if (d.tamper_flags) badges.push(`<span class="badge b-orange">${icon('alert', 12)}${esc(t('fd.doc.flags', { n: d.tamper_flags }))}</span>`);
    const item = el('div', { class: 'list-item', role: 'option', tabindex: '0', dataset: { id: d.id } },
      el('div', { class: `li-icon ${d.tamper_flags ? 'warning' : d.qr_valid ? 'success' : ''}`, html: icon(d.mime?.startsWith('image/') ? 'camera' : d.kind === 'noc' ? 'stamp' : 'file-text', 18) }),
      el('div', { class: 'li-main' },
        el('div', { class: 'li-title' }, kindLabel(d.kind)),
        el('div', { class: 'li-sub', style: { wordBreak: 'break-all' } }, d.filename),
        el('div', { class: 'li-sub' }, `${fmtDateTime(d.uploaded_at)} · ${fmtBytes(d.size)}`),
        badges.length ? el('div', { class: 'row', style: { gap: '6px', marginTop: '4px' }, html: badges.join('') }) : null));
    const pick = () => { selDocId = d.id; paint(); };
    item.addEventListener('click', pick);
    item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    list.append(item);
  });
  const left = el('div', { class: 'stack' },
    el('div', { class: 'card', style: { boxShadow: 'none' } },
      el('div', { class: 'card-head' }, el('h3', {}, t('fd.doc.list')), CAN_ACT && !CLOSED.includes(D.status) ? btn(t('fd.act.upload'), 'upload', 'ghost', doUpload) : null),
      list));
  mount(panel, el('div', { class: 'stack lg' }, el('div', { class: 'grid g-1-2' }, left, viewer), extract));
  paint();
}

function renderViewer(box, doc) {
  if (!doc) { mount(box); return; }
  const url = fileUrl(doc.id);
  let view;
  if (doc.mime === 'application/pdf') view = el('iframe', { class: 'doc-frame', src: url, title: t('fd.doc.frame_title', { name: doc.filename }) });
  else if ((doc.mime || '').startsWith('image/')) view = el('img', { class: 'doc-img', src: url, alt: t('fd.doc.frame_title', { name: doc.filename }) });
  else view = el('div', { class: 'empty' }, el('div', { class: 'e-icon', html: icon('file', 26) }), el('div', {}, t('fd.doc.no_preview')));
  mount(box, el('div', { class: 'stack' },
    el('div', { class: 'row between' },
      el('div', { class: 'small text-2', style: { minWidth: '0', wordBreak: 'break-all' } }, el('strong', {}, kindLabel(doc.kind)), ` · ${doc.filename}`),
      el('a', { class: 'btn sm secondary', href: url, target: '_blank', rel: 'noopener', html: `${icon('arrow-up-right', 14)} ${esc(t('fd.doc.open_new'))}` })),
    view));
}

function renderExtraction(box, doc) {
  const ex = doc?.extraction;
  if (!ex) {
    mount(box, el('div', { class: 'alert info' }, el('span', { html: icon('info', 18) }), el('div', {}, t('fd.ex.none'))));
    return;
  }
  const FIELD_ORDER = ['fdr_number', 'amount', 'issue_date', 'maturity_date', 'depositor_name', 'aicte_id', 'bank_name', 'branch', 'ifsc', 'interest_rate', 'tenure_months', 'lien_marked'];
  const fields = ex.fields || {};
  const keys = FIELD_ORDER.filter((k) => fields[k] !== undefined && fields[k] !== null && fields[k] !== '');
  const fieldsCard = el('div', { class: 'card', style: { boxShadow: 'none' } },
    el('div', { class: 'card-head' }, el('h3', { html: `${icon('file-text', 16)} ${esc(t('fd.ex.fields'))}` })),
    keys.length
      ? el('div', { class: 'table-wrap', style: { border: '0', boxShadow: 'none' } }, el('table', { class: 'table compact kv-table', html: `<tbody>${keys.map((k) => `<tr><td>${esc(tx(`fd.exf.${k}`, k))}</td><td class="${['fdr_number', 'ifsc', 'aicte_id'].includes(k) ? 'mono' : ''}">${esc(fmtV(k, fields[k]))}</td></tr>`).join('')}</tbody>` }))
      : el('div', { class: 'card-body small muted' }, t('fd.ex.no_fields')),
    el('div', { class: 'card-foot small muted' }, `${t('fd.ex.engine')}: ${tx(`fd.ex.engine.${ex.engine}`, ex.engine)} · ${t('fd.ex.analysed', { at: fmtDateTime(ex.analysed_at) })}`));

  const qr = ex.qr || {};
  let qrBody;
  if (qr.found && qr.valid) {
    const p = qr.payload || {};
    const claimed = { fdr_number: D.fdr_number, amount: D.amount, issue_date: D.issue_date, maturity_date: D.maturity_date, depositor_name: D.depositor_name };
    const payloadPairs = [['fdr_number', p.fn], ['amount', p.amt], ['issue_date', p.iss], ['maturity_date', p.mat], ['depositor_name', p.hn], ['lien_marked', p.lien]]
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([f, v]) => {
        const bad = f in claimed && claimed[f] && normV(f, v) !== normV(f, claimed[f]);
        return [t(`fd.exf.${f}`), bad ? `<span style="color:var(--nk-danger);font-weight:700" title="${esc(t('fd.cmp.bad'))}">✗ ${esc(fmtV(f, v))}</span>` : esc(fmtV(f, v))];
      });
    qrBody = el('div', { class: 'stack' },
      el('div', { class: 'verify-result valid', style: { padding: '14px' } }, el('div', { class: 'vr-head' }, el('div', { class: 'vr-icon', html: icon('shield-check', 26) }),
        el('div', {}, el('div', { style: { fontWeight: '700' } }, t('fd.ex.qr_valid')), el('div', { class: 'small text-2' }, t('fd.ex.signed_by', { bank: qr.bank_name || qr.bank_code || '', key: qr.key_id || '' }))))),
      payloadPairs.length ? el('div', {}, el('div', { class: 'small muted', style: { fontWeight: '600', marginBottom: '6px' } }, t('fd.ex.signed_payload')), dl(payloadPairs, { cols: 2 })) : null);
  } else if (qr.found) {
    qrBody = el('div', { class: 'verify-result invalid', style: { padding: '14px' } }, el('div', { class: 'vr-head' }, el('div', { class: 'vr-icon', html: icon('shield-alert', 26) }),
      el('div', {}, el('div', { style: { fontWeight: '700' } }, t('fd.ex.qr_invalid')), qr.error ? el('div', { class: 'small text-2' }, qr.error) : null, qr.key_id ? el('div', { class: 'small text-2' }, `Key: ${qr.key_id}`) : null)));
  } else {
    qrBody = el('div', { class: 'alert warning' }, el('span', { html: icon('qr', 18) }), el('div', {}, t('fd.ex.qr_missing')));
  }
  const qrCard = el('div', { class: 'card', style: { boxShadow: 'none' } }, el('div', { class: 'card-head' }, el('h3', { html: `${icon('qr', 16)} ${esc(t('fd.ex.qr'))}` })), el('div', { class: 'card-body' }, qrBody));

  const tam = ex.tamper || {};
  const flags = tam.flags || [];
  const dups = ex.duplicates || {};
  const dupList = (arr) => el('ul', { class: 'list-plain', style: { margin: '4px 0 0', padding: '0', listStyle: 'none' } }, arr.map((d) => el('li', { style: { padding: '3px 0' } }, fdrLink(d.fdr_id, d.ref_no), ` · ${d.institution || ''} `, d.status ? el('span', { html: statusBadge(String(d.status).toLowerCase()) }) : null)));
  const anyDup = (dups.same_file || []).length || (dups.same_fdr_number || []).length;
  const tamperCard = el('div', { class: 'card', style: { boxShadow: 'none' } },
    el('div', { class: 'card-head' }, el('h3', { html: `${icon('search', 16)} ${esc(t('fd.ex.tamper'))}` })),
    el('div', { class: 'card-body stack' },
      flags.length
        ? el('div', { class: 'stack', style: { gap: '8px' } }, flags.map((f) => el('div', { class: 'row nowrap', style: { alignItems: 'flex-start', gap: '8px' } }, el('span', { html: severityBadge(f.severity) }), el('span', { class: 'small' }, tamperText(f)))))
        : el('div', { class: 'alert success' }, el('span', { html: icon('check-circle', 18) }), el('div', {}, t('fd.ex.no_tamper'))),
      el('div', { class: 'small text-2' },
        tam.producer ? el('div', {}, `${t('fd.ex.producer')}: `, el('span', { class: 'mono' }, tam.producer)) : null,
        tam.creator ? el('div', {}, `${t('fd.ex.creator')}: `, el('span', { class: 'mono' }, tam.creator)) : null,
        tam.pages ? el('div', {}, `${t('fd.ex.pages')}: ${tam.pages}`) : null),
      el('div', {}, el('div', { style: { fontWeight: '700', marginBottom: '6px' } }, t('fd.ex.dups')),
        anyDup
          ? el('div', { class: 'alert warning' }, el('span', { html: icon('copy', 18) }), el('div', { class: 'grow' },
            (dups.same_file || []).length ? el('div', {}, el('strong', {}, t('fd.ex.same_file')), dupList(dups.same_file)) : null,
            (dups.same_fdr_number || []).length ? el('div', { style: { marginTop: '6px' } }, el('strong', {}, t('fd.ex.same_number')), dupList(dups.same_fdr_number)) : null))
          : el('div', { class: 'small', style: { color: 'var(--nk-success)' }, html: `${icon('check', 14)} ${esc(t('fd.ex.no_dups'))}` })),
      ex.sha256 ? el('div', {}, el('div', { class: 'small muted', style: { marginBottom: '4px' } }, t('fd.ex.sha')), el('div', { class: 'code-box' }, ex.sha256)) : null));

  mount(box, el('div', {}, sectionHead(t('fd.ex.title')), el('div', { class: 'grid g-3' }, fieldsCard, qrCard, tamperCard)));
}

/* ---------- verification */
function mismatchList(ms) {
  if (!ms?.length) return null;
  return el('div', { class: 'small', style: { marginTop: '6px' } }, el('strong', {}, `${t('fd.ver.diff')}: `),
    ms.map((m, i) => {
      if (typeof m === 'string') return `${i ? '; ' : ''}${m}`;
      const field = m.field || '';
      const other = m.signed ?? m.bank ?? m.document ?? m.value;
      const label = tx(`fd.cmp.f.${field}`, m.label || field);
      return `${i ? '; ' : ''}${label}${m.portal !== undefined ? ` — ${t('fd.ver.portal')} ${fmtV(field, m.portal)}, ${t('fd.ver.other')} ${fmtV(field, other)}` : ''}`;
    }).join(''));
}

function bankRecord(v) {
  const det = v.details || {};
  const r = det.response || {};
  if (r.found === false) return el('div', { class: 'ver-rec small' }, t('fd.br.found_no'));
  const pairs = [
    [t('fd.br.status'), esc(tx(`fd.bst.${r.status}`, r.status || dash))],
    [t('f.amount'), esc(r.amount != null ? fmtINR(r.amount) : dash)],
    [t('f.issue_date'), esc(fmtDate(r.issue_date))],
    [t('f.maturity_date'), esc(fmtDate(r.maturity_date))],
    [t('fd.br.holder'), esc(r.holder_name || dash)],
    [t('fd.br.lien'), esc(r.lien_marked === true ? t('fd.marked') : r.lien_marked === false ? t('fd.not_marked') : dash)],
  ];
  if (r.lien_in_favour_of) pairs.push([t('fd.br.lien_to'), esc(r.lien_in_favour_of)]);
  if (r.closed_at) pairs.push([t('fd.br.closed_at'), esc(fmtDate(r.closed_at))]);
  if (r.close_reason) pairs.push([t('fd.br.reason'), esc(r.close_reason)]);
  const sig = det.signature_valid;
  return el('div', { class: 'ver-rec' },
    el('div', { class: 'row between', style: { marginBottom: '8px' } },
      el('strong', { class: 'small' }, t('fd.ver.bank_rec')),
      sig === undefined ? null : el('span', { html: sig ? `<span class="badge b-success">${icon('fingerprint', 12)}${esc(t('fd.ver.sig_ok'))}</span>` : `<span class="badge b-danger">${icon('fingerprint', 12)}${esc(t('fd.ver.sig_bad'))}</span>` })),
    dl(pairs, { cols: 3 }),
    mismatchList(det.mismatches));
}

function renderVerification(panel) {
  const vs = (D.verifications || []).slice().reverse();
  if (!vs.length) { emptyState(panel, { icon: 'shield', title: t('fd.ver.none'), text: t('fd.ver.none_text') }); return; }
  const resCls = { confirmed: 'b-success', mismatch: 'b-danger', not_found: 'b-danger', closed: 'b-danger', invalid_signature: 'b-danger', no_qr: 'b-warning' };
  const tone = { confirmed: 'success', no_qr: 'warning' };
  const items = vs.map((v) => {
    const det = v.details || {};
    const extra = v.method === 'bank_api' ? bankRecord(v)
      : el('div', {}, det.qr?.key_id ? el('div', { class: 'small text-2', style: { marginTop: '4px' } }, `${t('fd.ex.signed_by', { bank: D.bank?.name || '', key: det.qr.key_id })}`) : null,
        det.qr?.error ? el('div', { class: 'small', style: { color: 'var(--nk-danger)' } }, det.qr.error) : null, mismatchList(det.mismatches));
    return {
      title: el('span', { class: 'ver-head' },
        el('span', { class: 'ver-ic', html: icon(v.method === 'bank_api' ? 'bank' : 'qr', 15) }),
        el('span', {}, tx(`fd.vm.${v.method}`, v.method)),
        el('span', { html: `<span class="badge ${resCls[v.result] || 'b-slate'}">${esc(tx(`fd.vr.${v.result}`, v.result))}</span>` })),
      meta: `${v.performed_by?.name || t('fd.ver.system')} · ${fmtDateTime(v.performed_at)}`,
      body: el('div', { class: 't-body' }, el('div', {}, v.summary), extra),
      tone: tone[v.result] || 'danger',
    };
  });
  const box = el('div');
  mount(panel, el('div', {}, sectionHead(t('fd.tab.verification'), t('fd.ver.newest', { n: vs.length })), box));
  timeline(box, items);
}

/* ---------- discrepancies */
function renderDiscrepancies(panel) {
  const all = D.discrepancies || [];
  if (!all.length) { emptyState(panel, { icon: 'flag', title: t('fd.dc.none'), text: t('fd.dc.none_text') }); return; }
  const sevRank = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = all.slice().sort((a, b) => (a.status === 'open' ? 0 : 1) - (b.status === 'open' ? 0 : 1) || (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9) || String(b.raised_at).localeCompare(String(a.raised_at)));
  const openN = sorted.filter((d) => d.status === 'open').length;
  const list = el('div', { class: 'list-divided', style: { border: '1px solid var(--nk-border)', borderRadius: 'var(--nk-radius)' } }, sorted.map((d) => {
    const open = d.status === 'open';
    const stBadge = open ? `<span class="badge b-danger">${esc(t('fd.dc.st.open'))}</span>` : `<span class="badge ${d.status === 'waived' ? 'b-slate' : 'b-success'}">${esc(tx(`fd.dc.st.${d.status}`, d.status))}</span>`;
    const actions = open && CAN_ACT ? el('div', { class: 'row nowrap' },
      btn(t('fd.dc.resolve'), 'check', 'success', (b) => doResolve(b, d, 'resolved')),
      btn(t('fd.dc.waive'), 'x', 'secondary', (b) => doResolve(b, d, 'waived'))) : null;
    return el('div', { class: `list-item disc-item ${open ? '' : 'closed'}` },
      el('div', { class: `li-icon ${open ? (['critical', 'high'].includes(d.severity) ? 'danger' : 'warning') : 'success'}`, html: icon(open ? 'flag' : 'check-circle', 18) }),
      el('div', { class: 'li-main' },
        el('div', { class: 'row', style: { gap: '6px', marginBottom: '4px' }, html: `${severityBadge(d.severity)} ${stBadge}` }),
        el('div', { class: 'li-title' }, dcLabel(d.code)),
        d.message ? el('div', { class: 'small text-2' }, d.message) : null,
        el('div', { class: 'li-sub' }, `${tx(`fd.dc.src.${d.source}`, d.source)} · ${t('fd.dc.raised', { date: fmtDateTime(d.raised_at) })}`),
        d.institution_response
          ? el('div', { class: 'disc-resp' }, el('div', { class: 'small', style: { fontWeight: '700' } }, t('fd.dc.response', { date: fmtDateTime(d.responded_at) })), el('div', {}, d.institution_response))
          : (open ? el('div', { class: 'li-sub', style: { fontStyle: 'italic' } }, t('fd.dc.no_response')) : null),
        !open ? el('div', { class: 'disc-res' }, t('fd.dc.closed_line', { status: tx(`fd.dc.st.${d.status}`, d.status), date: fmtDateTime(d.resolved_at) }), d.resolution_note ? ` — ${d.resolution_note}` : '') : null),
      actions);
  }));
  mount(panel, el('div', {}, sectionHead(t('fd.tab.discrepancies'), t('fd.dc.summary', { open: openN, closed: all.length - openN }),
    CAN_ACT && !CLOSED.includes(D.status) ? btn(t('fd.act.raise'), 'flag', 'outline-danger', doRaise) : null), list));
}

/* ---------- observations */
function renderObservations(panel) {
  const obs = (D.observations || []).slice().reverse();
  const addBtn = CAN_ACT ? btn(t('fd.act.observe'), 'plus', 'secondary', doObserve) : null;
  if (!obs.length) { emptyState(panel, { icon: 'edit', title: t('fd.ob.none'), text: t('fd.ob.none_text'), action: addBtn }); return; }
  const list = el('div', { class: 'list-divided', style: { border: '1px solid var(--nk-border)', borderRadius: 'var(--nk-radius)' } }, obs.map((o) => el('div', { class: 'list-item' },
    el('div', { class: `li-icon ${o.visibility === 'shared' ? 'success' : ''}`, html: icon(o.visibility === 'shared' ? 'send' : 'lock', 18) }),
    el('div', { class: 'li-main' },
      el('div', { class: 'row', style: { gap: '8px', marginBottom: '4px' } },
        el('strong', { class: 'small' }, o.user?.name || dash),
        o.user?.designation ? el('span', { class: 'small muted' }, o.user.designation) : null,
        el('span', { html: o.visibility === 'shared' ? `<span class="badge b-teal">${esc(t('fd.ob.badge.shared'))}</span>` : `<span class="badge b-slate">${icon('lock', 11)}${esc(t('fd.ob.badge.internal'))}</span>` })),
      el('div', { style: { whiteSpace: 'pre-wrap' } }, o.text),
      el('div', { class: 'li-sub' }, fmtDateTime(o.created_at))))));
  mount(panel, el('div', {}, sectionHead(t('fd.tab.observations'), null, addBtn), list));
}

/* ---------- chain */
function renderChain(panel) {
  const chain = D.chain || [];
  if (chain.length <= 1) { emptyState(panel, { icon: 'git-branch', title: t('fd.ch.none'), text: t('fd.ch.none_text') }); return; }
  const box = el('div');
  mount(panel, el('div', {}, sectionHead(t('fd.tab.chain'), t('fd.ch.explain')), box));
  timeline(box, chain.map((c, i) => ({
    title: el('span', { class: 'row', style: { gap: '8px' } },
      el('span', { class: 'small muted' }, t('fd.ch.gen', { n: i + 1 })),
      c.is_current ? el('strong', { class: 'mono' }, c.ref_no) : fdrLink(c.id, c.ref_no),
      el('span', { html: statusBadge(c.display_status) }),
      c.renewed_late ? el('span', { class: 'badge b-orange', html: `${icon('clock', 12)}${esc(t('fd.ch.late'))}` }) : null,
      c.is_current ? el('span', { class: 'badge b-primary' }, t('fd.ch.current')) : null),
    body: el('div', { class: c.is_current ? 'chain-cur' : 'chain-card', style: { marginTop: '6px' } },
      el('div', { class: 'row', style: { gap: '18px' } },
        el('span', { class: 'stat-inline' }, el('span', { class: 'v' }, fmtINR(c.amount)), el('span', { class: 'l' }, t('f.amount'))),
        el('span', { class: 'stat-inline' }, el('span', { class: 'v', style: { fontSize: '.95rem' } }, `${fmtDate(c.issue_date)} → ${fmtDate(c.maturity_date)}`), el('span', { class: 'l' }, `${t('f.issue_date')} → ${t('f.maturity_date')}`)),
        el('span', { class: 'stat-inline' }, el('span', { class: 'v mono', style: { fontSize: '.9rem' } }, c.fdr_number), el('span', { class: 'l' }, t('f.fdr_number'))))),
    tone: c.is_current ? 'success' : c.renewed_late ? 'warning' : 'muted',
  })));
}

/* ---------- releases */
function renderReleases(panel) {
  const rels = D.releases || [];
  if (!rels.length) { emptyState(panel, { icon: 'unlock', title: t('fd.rl.none'), text: t('fd.rl.none_text') }); return; }
  const box = el('div');
  mount(panel, el('div', {}, sectionHead(t('fd.tab.releases')), box));
  renderTable(box, {
    columns: [
      { key: 'ref_no', label: t('fd.rl.ref'), render: (r) => `<div class="cell-main mono">${esc(r.ref_no)}</div><div class="cell-sub">${esc(tx(`rtype.${r.request_type}`, r.request_type))}</div>` },
      { key: 'requested_at', label: t('fd.rl.requested'), render: (r) => esc(fmtDateTime(r.requested_at)) },
      { key: 'status', label: t('fd.rl.stage'), render: (r) => releaseBadge(r.status) },
      { key: 'sla', label: t('fd.rl.sla'), render: (r) => (r.sla_breached ? `<span class="badge b-danger">${esc(t('fd.rl.sla_breached'))}</span>` : r.sla_hours_left != null ? `<span class="badge b-info">${esc(t('fd.rl.sla_left', { h: Math.round(r.sla_hours_left) }))}</span>` : dash) },
      { key: 'released_at', label: t('fd.rl.released'), render: (r) => esc(r.released_at ? fmtDate(r.released_at) : dash) },
      { key: 'noc', label: t('fd.rl.noc'), render: (r) => (r.noc_document_id ? el('a', { class: 'btn sm secondary', href: fileUrl(r.noc_document_id), target: '_blank', rel: 'noopener', onclick: (e) => e.stopPropagation(), html: `${icon('stamp', 14)} ${esc(t('fd.rl.noc_open'))}` }) : dash) },
      { key: 'open', label: '', align: 'right', render: (r) => el('a', { class: 'btn sm ghost', href: site(`officer/release.html?id=${r.id}`), onclick: (e) => e.stopPropagation(), html: `${esc(t('common.open'))} ${icon('chevron-right', 14)}` }) },
    ],
    rows: rels,
    onRowClick: (r) => { location.href = site(`officer/release.html?id=${r.id}`); },
  });
}

/* ---------- audit */
function auditTone(a) {
  if (/REJECT|INVOKE|CLOSED|NOT_FOUND|FAILED|INVALID|RAISED|ALERT/.test(a)) return 'danger';
  if (/RETURN|WAIVED|MISSING|SLA/.test(a)) return 'warning';
  if (/ACCEPT|VERIFIED|RESOLVED|DONE|ISSUED/.test(a)) return 'success';
  if (/OBSERVATION|UPDATED|CHECKLIST/.test(a)) return 'muted';
  return '';
}

function renderAudit(panel) {
  const tl = (D.timeline || []).slice().reverse();
  const box = el('div');
  mount(panel, el('div', {}, sectionHead(t('fd.tab.audit'), t('fd.au.explain')), box));
  timeline(box, tl.map((e) => ({
    title: actionLabel(e.action),
    meta: [e.actor_name, e.actor_role ? tx(`role.${e.actor_role}`, e.actor_role) : '', fmtDateTime(e.at)].filter(Boolean).join(' · '),
    body: e.summary,
    tone: auditTone(e.action || ''),
  })));
}

onLang(() => render());
load();
