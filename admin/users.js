// Admin · Users: list, filter, create, edit, activate / deactivate portal accounts.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang, apply } from '../assets/js/i18n.js';
import {
  $, $$, el, esc, icon, kpi, fmtDateTime, fmtNum, daysBetween, relDays, initials, loading, errorState,
  renderTable, pagination, modal, confirmDialog, toast, mount, debounce,
} from '../assets/js/ui.js';

extend({
  en: {
    'users.title': 'Users & access',
    'users.subtitle': 'Create accounts for AICTE staff, institutions and banks, set their role and switch access on or off',
    'users.add': 'Add user',
    'users.kpi_h': 'User summary',
    'users.k_total': 'All users',
    'users.k_total_sub': '{n} active right now',
    'users.k_staff': 'AICTE staff',
    'users.k_staff_sub': 'Officers, authority and admins',
    'users.k_inst': 'Institution users',
    'users.k_inst_sub': '{n} institutions covered',
    'users.k_bank': 'Bank users',
    'users.k_bank_sub': '{n} banks connected',
    'users.k_off': 'Deactivated',
    'users.k_off_sub': 'cannot sign in',
    'users.k_off_none': 'every account can sign in',
    'users.list_h': 'Portal users',
    'users.count': '{n} of {total} users',
    'users.f_role': 'Role',
    'users.f_status': 'Account status',
    'users.f_search': 'Name, email, organisation or designation',
    'users.all_roles': 'All roles',
    'users.all_status': 'Active and deactivated',
    'users.st_active': 'Active only',
    'users.st_inactive': 'Deactivated only',
    'users.clear': 'Clear filters',
    'users.c_user': 'User',
    'users.c_role': 'Role',
    'users.c_org': 'Organisation',
    'users.c_desig': 'Designation & phone',
    'users.c_active': 'Access',
    'users.c_login': 'Last sign-in',
    'users.never': 'Never signed in',
    'users.you': 'You',
    'users.on': 'Active',
    'users.off': 'Deactivated',
    'users.org_aicte': 'AICTE Regulation Bureau',
    'users.org_aicte_sub': 'AICTE, New Delhi',
    'users.empty': 'No users match these filters',
    'users.empty_text': 'Try another role or clear the search.',
    'users.self_lock': 'You cannot deactivate your own account',
    'users.edit_title': 'Edit user · {name}',
    'users.add_title': 'Add a new user',
    'users.add_intro': 'The new user can sign in straight away with the email and password below.',
    'users.l_name': 'Full name',
    'users.l_email': 'Email address',
    'users.l_role': 'Role',
    'users.l_inst': 'Institution',
    'users.l_bank': 'Bank',
    'users.l_desig': 'Designation',
    'users.l_phone': 'Mobile number',
    'users.l_pw': 'Initial password',
    'users.l_pw_new': 'New password',
    'users.l_active': 'Account is active (user can sign in)',
    'users.ph_name': 'e.g. Dr. Kavya Rao',
    'users.ph_email': 'name@institution.edu.in',
    'users.ph_desig': 'e.g. Registrar',
    'users.ph_phone': '+91 98765 43210',
    'users.choose_inst': 'Choose an institution…',
    'users.choose_bank': 'Choose a bank…',
    'users.choose_role': 'Choose a role…',
    'users.h_email_fixed': 'The email address is the sign-in ID and cannot be changed.',
    'users.h_pw': 'Leave blank to use the standard demo password (Demo@2026). At least 8 characters.',
    'users.h_pw_new': 'Leave blank to keep the current password. At least 8 characters.',
    'users.h_inst': 'The user will see and submit FDRs only for this institution.',
    'users.h_bank': 'The user will issue and confirm deposits only for this bank.',
    'users.h_role_staff': 'Staff roles see every institution. Choose carefully.',
    'users.e_name': 'Please enter the full name.',
    'users.e_email': 'Please enter a valid email address.',
    'users.e_role': 'Please choose a role.',
    'users.e_inst': 'Please choose the institution this user belongs to.',
    'users.e_bank': 'Please choose the bank this user works for.',
    'users.e_pw': 'The password must be at least 8 characters long.',
    'users.e_phone': 'Enter a 10-digit mobile number (with or without +91).',
    'users.e_fix': 'Please correct the highlighted fields.',
    'users.create': 'Create user',
    'users.save': 'Save changes',
    'users.created': '{name} can now sign in as {role}.',
    'users.updated': 'Changes to {name} have been saved.',
    'users.no_change': 'Nothing was changed.',
    'users.deact_q': 'Deactivate {name}? They will not be able to sign in until an administrator turns access back on.',
    'users.act_q': 'Turn access back on for {name}? They will be able to sign in again.',
    'users.deact_btn': 'Deactivate',
    'users.act_btn': 'Activate',
    'users.deact_title': 'Deactivate account',
    'users.act_title': 'Activate account',
    'users.deactivated': '{name} has been deactivated.',
    'users.activated': '{name} can sign in again.',
    'users.roles_h': 'Role-based access',
    'users.roles_sub': 'Each account sees only what its role allows. Every change here is written to the audit trail.',
    'users.r_users': '{n} users',
    'users.r_user1': '1 user',
    'users.p.officer': ['Verify submitted FDRs and raise discrepancies', 'Scrutinise and recommend releases', 'Receives level 1 escalations'],
    'users.p.authority': ['Approve releases and refunds', 'Invoke a deposit when required', 'Receives level 2 escalations'],
    'users.p.admin': ['Manage users and roles', 'Set SLA and escalation days', 'Demo clock and data reset'],
    'users.p.institution': ['Submit and renew its own FDRs', 'Answer discrepancies', 'Request release and download NOC'],
    'users.p.bank': ['Issue bank-signed FDR receipts', 'Confirm deposits and liens', 'Mark pre-closure and maturity'],
  },
  hi: {
    'users.title': 'उपयोगकर्ता एवं अभिगम',
    'users.subtitle': 'एआईसीटीई कर्मचारियों, संस्थानों और बैंकों के खाते बनाएँ, उनकी भूमिका तय करें और अभिगम चालू या बंद करें',
    'users.add': 'उपयोगकर्ता जोड़ें',
    'users.kpi_h': 'उपयोगकर्ता सारांश',
    'users.k_total': 'सभी उपयोगकर्ता',
    'users.k_total_sub': 'इस समय {n} सक्रिय',
    'users.k_staff': 'एआईसीटीई कर्मचारी',
    'users.k_staff_sub': 'अधिकारी, प्राधिकारी और प्रशासक',
    'users.k_inst': 'संस्थान उपयोगकर्ता',
    'users.k_inst_sub': '{n} संस्थान शामिल',
    'users.k_bank': 'बैंक उपयोगकर्ता',
    'users.k_bank_sub': '{n} बैंक जुड़े हुए',
    'users.k_off': 'निष्क्रिय',
    'users.k_off_sub': 'साइन इन नहीं कर सकते',
    'users.k_off_none': 'सभी खाते साइन इन कर सकते हैं',
    'users.list_h': 'पोर्टल उपयोगकर्ता',
    'users.count': '{total} में से {n} उपयोगकर्ता',
    'users.f_role': 'भूमिका',
    'users.f_status': 'खाते की स्थिति',
    'users.f_search': 'नाम, ईमेल, संगठन या पदनाम',
    'users.all_roles': 'सभी भूमिकाएँ',
    'users.all_status': 'सक्रिय और निष्क्रिय',
    'users.st_active': 'केवल सक्रिय',
    'users.st_inactive': 'केवल निष्क्रिय',
    'users.clear': 'फ़िल्टर हटाएँ',
    'users.c_user': 'उपयोगकर्ता',
    'users.c_role': 'भूमिका',
    'users.c_org': 'संगठन',
    'users.c_desig': 'पदनाम एवं फ़ोन',
    'users.c_active': 'अभिगम',
    'users.c_login': 'अंतिम साइन इन',
    'users.never': 'कभी साइन इन नहीं किया',
    'users.you': 'आप',
    'users.on': 'सक्रिय',
    'users.off': 'निष्क्रिय',
    'users.org_aicte': 'एआईसीटीई विनियमन ब्यूरो',
    'users.org_aicte_sub': 'एआईसीटीई, नई दिल्ली',
    'users.empty': 'इन फ़िल्टरों से कोई उपयोगकर्ता नहीं मिला',
    'users.empty_text': 'कोई अन्य भूमिका चुनें या खोज हटाएँ।',
    'users.self_lock': 'आप अपना स्वयं का खाता निष्क्रिय नहीं कर सकते',
    'users.edit_title': 'उपयोगकर्ता संपादित करें · {name}',
    'users.add_title': 'नया उपयोगकर्ता जोड़ें',
    'users.add_intro': 'नया उपयोगकर्ता नीचे दिए गए ईमेल और पासवर्ड से तुरंत साइन इन कर सकता है।',
    'users.l_name': 'पूरा नाम',
    'users.l_email': 'ईमेल पता',
    'users.l_role': 'भूमिका',
    'users.l_inst': 'संस्थान',
    'users.l_bank': 'बैंक',
    'users.l_desig': 'पदनाम',
    'users.l_phone': 'मोबाइल नंबर',
    'users.l_pw': 'प्रारंभिक पासवर्ड',
    'users.l_pw_new': 'नया पासवर्ड',
    'users.l_active': 'खाता सक्रिय है (उपयोगकर्ता साइन इन कर सकता है)',
    'users.ph_name': 'उदा. डॉ. काव्या राव',
    'users.ph_email': 'name@institution.edu.in',
    'users.ph_desig': 'उदा. कुलसचिव',
    'users.ph_phone': '+91 98765 43210',
    'users.choose_inst': 'संस्थान चुनें…',
    'users.choose_bank': 'बैंक चुनें…',
    'users.choose_role': 'भूमिका चुनें…',
    'users.h_email_fixed': 'ईमेल पता ही साइन-इन आईडी है, इसे बदला नहीं जा सकता।',
    'users.h_pw': 'मानक डेमो पासवर्ड (Demo@2026) के लिए खाली छोड़ें। कम से कम 8 अक्षर।',
    'users.h_pw_new': 'वर्तमान पासवर्ड रखने के लिए खाली छोड़ें। कम से कम 8 अक्षर।',
    'users.h_inst': 'उपयोगकर्ता केवल इसी संस्थान की एफडीआर देख और जमा कर सकेगा।',
    'users.h_bank': 'उपयोगकर्ता केवल इसी बैंक की जमाराशियाँ जारी और पुष्ट कर सकेगा।',
    'users.h_role_staff': 'कर्मचारी भूमिकाएँ सभी संस्थानों को देख सकती हैं। सावधानी से चुनें।',
    'users.e_name': 'कृपया पूरा नाम दर्ज करें।',
    'users.e_email': 'कृपया मान्य ईमेल पता दर्ज करें।',
    'users.e_role': 'कृपया भूमिका चुनें।',
    'users.e_inst': 'कृपया वह संस्थान चुनें जिससे यह उपयोगकर्ता संबद्ध है।',
    'users.e_bank': 'कृपया वह बैंक चुनें जिसमें यह उपयोगकर्ता कार्यरत है।',
    'users.e_pw': 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।',
    'users.e_phone': '10 अंकों का मोबाइल नंबर दर्ज करें (+91 सहित या रहित)।',
    'users.e_fix': 'कृपया चिह्नित फ़ील्ड ठीक करें।',
    'users.create': 'उपयोगकर्ता बनाएँ',
    'users.save': 'परिवर्तन सहेजें',
    'users.created': '{name} अब {role} के रूप में साइन इन कर सकते हैं।',
    'users.updated': '{name} में किए गए परिवर्तन सहेज लिए गए हैं।',
    'users.no_change': 'कोई परिवर्तन नहीं किया गया।',
    'users.deact_q': '{name} को निष्क्रिय करें? जब तक कोई प्रशासक अभिगम पुनः चालू नहीं करता, वे साइन इन नहीं कर सकेंगे।',
    'users.act_q': '{name} के लिए अभिगम पुनः चालू करें? वे फिर से साइन इन कर सकेंगे।',
    'users.deact_btn': 'निष्क्रिय करें',
    'users.act_btn': 'सक्रिय करें',
    'users.deact_title': 'खाता निष्क्रिय करें',
    'users.act_title': 'खाता सक्रिय करें',
    'users.deactivated': '{name} को निष्क्रिय कर दिया गया है।',
    'users.activated': '{name} फिर से साइन इन कर सकते हैं।',
    'users.roles_h': 'भूमिका-आधारित अभिगम',
    'users.roles_sub': 'प्रत्येक खाता केवल वही देखता है जिसकी उसकी भूमिका अनुमति देती है। यहाँ हर परिवर्तन ऑडिट ट्रेल में दर्ज होता है।',
    'users.r_users': '{n} उपयोगकर्ता',
    'users.r_user1': '1 उपयोगकर्ता',
    'users.p.officer': ['जमा की गई एफडीआर का सत्यापन और विसंगतियाँ दर्ज करना', 'रिलीज़ अनुरोधों की जाँच और अनुशंसा', 'स्तर 1 एस्केलेशन प्राप्त करते हैं'],
    'users.p.authority': ['रिलीज़ और वापसी का अनुमोदन', 'आवश्यकता होने पर जमा का अधिग्रहण', 'स्तर 2 एस्केलेशन प्राप्त करते हैं'],
    'users.p.admin': ['उपयोगकर्ता और भूमिकाएँ प्रबंधित करना', 'एसएलए और एस्केलेशन दिवस तय करना', 'डेमो घड़ी और डेटा रीसेट'],
    'users.p.institution': ['अपनी एफडीआर जमा और नवीनीकृत करना', 'विसंगतियों का उत्तर देना', 'रिलीज़ का अनुरोध और एनओसी डाउनलोड'],
    'users.p.bank': ['बैंक-हस्ताक्षरित एफडीआर रसीद जारी करना', 'जमा और ग्रहणाधिकार की पुष्टि', 'समयपूर्व समापन और परिपक्वता दर्ज करना'],
  },
});

const ROLES = ['officer', 'authority', 'admin', 'institution', 'bank'];
const STAFF = ['officer', 'authority', 'admin'];
const ROLE_BADGE = { officer: 'b-primary', authority: 'b-saffron', admin: 'b-violet', institution: 'b-teal', bank: 'b-info' };
const ROLE_ICON = { officer: 'shield-check', authority: 'stamp', admin: 'settings', institution: 'building', bank: 'bank' };
const ROLE_TONE = { officer: '', authority: 'saffron', admin: '', institution: '', bank: '' };
const PAGE_SIZE = 15;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const addBtn = el('button', { class: 'btn', type: 'button', id: 'add-user' });
const { user: me, meta } = await initPage({
  roles: ['admin'],
  active: 'users',
  title: 'users.title',
  subtitle: 'users.subtitle',
  breadcrumbs: [{ label: 'nav.settings', href: 'admin/settings.html' }, { label: 'nav.users' }],
  actions: addBtn,
});

const tableEl = $('#table');
const pagerEl = $('#pager');
const state = { users: null, filter: { role: '', status: '', q: '' }, page: 1, sort: { key: 'role', dir: 'asc' } };
let institutions = null; // lazy-loaded for the form

const roleBadge = (r) => `<span class="badge ${ROLE_BADGE[r] || 'b-slate'}">${icon(ROLE_ICON[r] || 'user', 12)}${esc(t(`role.${r}`, { _default: r }))}</span>`;
const list = (key) => { const v = t(key); return Array.isArray(v) ? v : []; };

$$('[data-icon]').forEach((n) => { n.innerHTML = icon(n.dataset.icon, 16); });

/* ------------------------------------------------------------------ KPIs + role cards */
function renderSummary() {
  const u = state.users || [];
  const by = (pred) => u.filter(pred).length;
  const active = by((x) => x.active);
  const inst = new Set(u.filter((x) => x.role === 'institution' && x.institution_id).map((x) => x.institution_id)).size;
  const banks = new Set(u.filter((x) => x.role === 'bank' && x.bank_id).map((x) => x.bank_id)).size;
  const off = u.length - active;
  const go = (role, status = '') => () => { setFilter({ role, status }); $('#table').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  mount($('#kpis'),
    kpi({ label: t('users.k_total'), value: fmtNum(u.length), sub: esc(t('users.k_total_sub', { n: fmtNum(active) })), color: 'info', iconName: 'users', onClick: go('') }),
    kpi({ label: t('users.k_staff'), value: fmtNum(by((x) => STAFF.includes(x.role))), sub: esc(t('users.k_staff_sub')), iconName: 'shield-check', onClick: go('staff') }),
    kpi({ label: t('users.k_inst'), value: fmtNum(by((x) => x.role === 'institution')), sub: esc(t('users.k_inst_sub', { n: fmtNum(inst) })), color: 'teal', iconName: 'building', onClick: go('institution') }),
    kpi({ label: t('users.k_bank'), value: fmtNum(by((x) => x.role === 'bank')), sub: esc(t('users.k_bank_sub', { n: fmtNum(banks) })), color: 'saffron', iconName: 'bank', onClick: go('bank') }),
    kpi({ label: t('users.k_off'), value: fmtNum(off), sub: esc(off ? t('users.k_off_sub') : t('users.k_off_none')), color: off ? 'danger' : 'success', iconName: 'ban', onClick: go('', 'inactive') }));
  mount($('#roles'), ROLES.map((r) => el('div', { class: 'card' },
    el('div', { class: 'card-body' },
      el('div', { class: 'r-head' },
        el('div', { class: `feature-icon ${ROLE_TONE[r]}`, html: icon(ROLE_ICON[r], 20) }),
        el('div', {},
          el('strong', {}, t(`role.${r}`)),
          el('span', { class: 'badge b-slate' }, (() => { const n = by((x) => x.role === r); return t(n === 1 ? 'users.r_user1' : 'users.r_users', { n: fmtNum(n) }); })()))),
      el('ul', {}, list(`users.p.${r}`).map((p) => el('li', {}, p)))))));
}

/* ------------------------------------------------------------------ filters */
function renderFilterControls() {
  const f = state.filter;
  mount($('#f-role'),
    el('option', { value: '' }, t('users.all_roles')),
    el('option', { value: 'staff', selected: f.role === 'staff' }, t('users.k_staff')),
    ROLES.map((r) => el('option', { value: r, selected: f.role === r }, t(`role.${r}`))));
  mount($('#f-status'),
    el('option', { value: '' }, t('users.all_status')),
    el('option', { value: 'active', selected: f.status === 'active' }, t('users.st_active')),
    el('option', { value: 'inactive', selected: f.status === 'inactive' }, t('users.st_inactive')));
  $('#f-q').value = f.q;
  $('#f-clear').disabled = !(f.role || f.status || f.q);
}

function setFilter(patch) {
  Object.assign(state.filter, patch);
  state.page = 1;
  renderFilterControls();
  renderTableArea();
}

$('#f-role').addEventListener('change', (e) => setFilter({ role: e.target.value }));
$('#f-status').addEventListener('change', (e) => setFilter({ status: e.target.value }));
$('#f-q').addEventListener('input', debounce((e) => { state.filter.q = e.target.value.trim(); state.page = 1; $('#f-clear').disabled = !(state.filter.role || state.filter.status || state.filter.q); renderTableArea(); }, 250));
$('#f-clear').addEventListener('click', () => setFilter({ role: '', status: '', q: '' }));

function orgOf(u) {
  if (u.role === 'institution') return { name: u.institution_name || '—', sub: u.institution_aicte_id ? `AICTE ID ${u.institution_aicte_id}` : '' };
  if (u.role === 'bank') return { name: u.bank_name || '—', sub: u.bank_code ? `${u.bank_code}` : '' };
  return { name: t('users.org_aicte'), sub: t('users.org_aicte_sub') };
}

function filtered() {
  const { role, status, q } = state.filter;
  const needle = q.toLowerCase();
  const rows = (state.users || []).filter((u) => {
    if (role === 'staff' ? !STAFF.includes(u.role) : role && u.role !== role) return false;
    if (status === 'active' && !u.active) return false;
    if (status === 'inactive' && u.active) return false;
    if (needle) {
      const hay = [u.name, u.email, u.designation, u.phone, u.institution_name, u.institution_aicte_id, u.bank_name, u.bank_code, t(`role.${u.role}`)].join(' ').toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
  const { key, dir } = state.sort;
  const mul = dir === 'asc' ? 1 : -1;
  const val = (u) => {
    if (key === 'role') return `${ROLES.indexOf(u.role)}-${u.name.toLowerCase()}`;
    if (key === 'org') return orgOf(u).name.toLowerCase();
    if (key === 'last_login_at') return u.last_login_at || '';
    return String(u[key] || '').toLowerCase();
  };
  return rows.sort((a, b) => (val(a) < val(b) ? -1 : val(a) > val(b) ? 1 : 0) * mul);
}

/* ------------------------------------------------------------------ table */
function activeSwitch(u) {
  const self = u.id === me.id;
  const input = el('input', { type: 'checkbox', checked: !!u.active, disabled: self, 'aria-label': `${t('users.c_active')}: ${u.name}` });
  input.addEventListener('change', () => toggleActive(u, input));
  return el('label', { class: 'us-switch', title: self ? t('users.self_lock') : '' },
    input, el('span', { class: 'track', 'aria-hidden': 'true' }), el('span', {}, u.active ? t('users.on') : t('users.off')));
}

function renderTableArea() {
  if (!state.users) return;
  const rows = filtered();
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (state.page > pages) state.page = pages;
  const slice = rows.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);
  $('#count').textContent = t('users.count', { n: fmtNum(total), total: fmtNum(state.users.length) });
  const today = meta?.today;
  renderTable(tableEl, {
    columns: [
      { key: 'name', label: t('users.c_user'), sortable: true, render: (u) => el('div', { class: 'us-user' },
        el('span', { class: `avatar ${u.active ? '' : 'off'}`, 'aria-hidden': 'true' }, initials(u.name)),
        el('div', { class: 'u-txt' },
          el('div', { class: 'cell-main' }, u.name, u.id === me.id ? el('span', { class: 'badge b-success', style: { marginLeft: '6px' } }, t('users.you')) : null),
          el('div', { class: 'cell-sub', html: esc(u.email).replace('@', '@<wbr>') }))) },
      { key: 'role', label: t('users.c_role'), sortable: true, render: (u) => roleBadge(u.role) },
      { key: 'org', label: t('users.c_org'), sortable: true, render: (u) => {
        const o = orgOf(u);
        const name = u.role === 'institution' && u.institution_id
          ? el('a', { href: site(`officer/institution.html?id=${u.institution_id}`), class: 'cell-main' }, o.name)
          : el('div', { class: 'cell-main' }, o.name);
        return el('div', {}, name, o.sub ? el('div', { class: 'cell-sub' }, o.sub) : null);
      } },
      { key: 'designation', label: t('users.c_desig'), sortable: true, render: (u) => el('div', {},
        el('div', {}, u.designation || '—'), u.phone ? el('div', { class: 'cell-sub nowrap' }, u.phone) : null) },
      { key: 'active', label: t('users.c_active'), render: activeSwitch },
      { key: 'last_login_at', label: t('users.c_login'), sortable: true, render: (u) => {
        if (!u.last_login_at) return `<span class="muted small">${esc(t('users.never'))}</span>`;
        const d = today ? daysBetween(today, u.last_login_at.slice(0, 10)) : null;
        return `<div class="nowrap">${esc(fmtDateTime(u.last_login_at))}</div>${d !== null ? `<div class="cell-sub">${esc(relDays(d, { past: 'ago' }))}</div>` : ''}`;
      } },
      { key: 'actions', label: '', align: 'right', render: (u) => el('button', {
        class: 'btn sm secondary', type: 'button', html: `${icon('edit', 14)}<span>${esc(t('common.edit'))}</span>`,
        'aria-label': `${t('common.edit')}: ${u.name}`, onclick: () => openForm(u),
      }) },
    ],
    rows: slice,
    rowClass: (u) => (u.active ? '' : 'us-inactive'),
    onRowClick: (u) => openForm(u),
    sort: state.sort,
    onSort: (key, dir) => { state.sort = { key, dir }; renderTableArea(); },
    empty: { icon: 'users', title: t('users.empty'), text: t('users.empty_text') },
  });
  if (total > PAGE_SIZE) pagination(pagerEl, { page: state.page, pageSize: PAGE_SIZE, total, onChange: (p) => { state.page = p; renderTableArea(); } });
  else mount(pagerEl);
}

/* ------------------------------------------------------------------ activate / deactivate */
async function toggleActive(u, input) {
  const want = input.checked;
  input.checked = !want; // revert until confirmed
  const ok = await confirmDialog(t(want ? 'users.act_q' : 'users.deact_q', { name: u.name }), {
    title: t(want ? 'users.act_title' : 'users.deact_title'),
    confirmLabel: t(want ? 'users.act_btn' : 'users.deact_btn'),
    variant: want ? 'success' : 'danger',
  });
  if (!ok) return;
  input.disabled = true;
  try {
    const updated = await api.patch(`/admin/users/${u.id}`, { active: want });
    Object.assign(u, updated || { active: want });
    toast(t(want ? 'users.activated' : 'users.deactivated', { name: u.name }), 'success');
    renderSummary();
    renderTableArea();
  } catch (err) {
    input.disabled = false;
    toast(err.message || t('common.error'), 'danger');
  }
}

/* ------------------------------------------------------------------ add / edit form */
async function loadInstitutions() {
  if (institutions) return institutions;
  const res = await api.get('/institutions', { page_size: 200 });
  institutions = (res.items || res || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  return institutions;
}

function field(id, labelKey, control, { req = false, hint = '', full = false } = {}) {
  return el('div', { class: `field ${full ? 'full' : ''}`, id: `${id}-wrap` },
    el('label', { for: id }, t(labelKey), req ? el('span', { class: 'req', 'aria-hidden': 'true' }, '*') : null),
    control,
    hint ? el('span', { class: 'hint', id: `${id}-hint` }, hint) : null,
    el('span', { class: 'error', id: `${id}-err`, role: 'alert' }));
}

async function openForm(u = null) {
  const isEdit = !!u;
  let insts = [];
  try { insts = await loadInstitutions(); } catch { insts = []; }
  const banks = meta?.banks || [];
  const name = el('input', { class: 'input', id: 'uf-name', value: u?.name || '', placeholder: t('users.ph_name'), autocomplete: 'off', required: true });
  const email = el('input', { class: 'input', id: 'uf-email', type: 'email', value: u?.email || '', placeholder: t('users.ph_email'), autocomplete: 'off', readonly: isEdit, required: true });
  const role = el('select', { class: 'select', id: 'uf-role', required: true },
    isEdit ? null : el('option', { value: '' }, t('users.choose_role')),
    ROLES.map((r) => el('option', { value: r, selected: u?.role === r }, t(`role.${r}`))));
  const inst = el('select', { class: 'select', id: 'uf-inst' },
    el('option', { value: '' }, t('users.choose_inst')),
    insts.map((i) => el('option', { value: i.id, selected: u?.institution_id === i.id }, `${i.name} · ${i.aicte_id}`)));
  const bank = el('select', { class: 'select', id: 'uf-bank' },
    el('option', { value: '' }, t('users.choose_bank')),
    banks.map((b) => el('option', { value: b.id, selected: u?.bank_id === b.id }, `${b.name} (${b.code})`)));
  const desig = el('input', { class: 'input', id: 'uf-desig', value: u?.designation || '', placeholder: t('users.ph_desig') });
  const phone = el('input', { class: 'input', id: 'uf-phone', type: 'tel', value: u?.phone || '', placeholder: t('users.ph_phone'), inputmode: 'tel' });
  const pw = el('input', { class: 'input', id: 'uf-pw', type: 'password', autocomplete: 'new-password', minlength: 8 });
  const active = el('input', { type: 'checkbox', id: 'uf-active', checked: isEdit ? !!u.active : true, disabled: isEdit && u.id === me.id });
  const serverErr = el('div', { class: 'alert danger hidden', role: 'alert' });
  const roleHint = el('span', { class: 'hint' });

  const body = el('form', { class: 'us-form', novalidate: true, onsubmit: (e) => e.preventDefault() },
    isEdit ? null : el('p', { class: 'text-2 mt-0' }, t('users.add_intro')),
    serverErr,
    el('div', { class: 'form-grid' },
      field('uf-name', 'users.l_name', name, { req: true }),
      field('uf-email', 'users.l_email', email, { req: true, hint: isEdit ? t('users.h_email_fixed') : '' }),
      (() => { const f = field('uf-role', 'users.l_role', role, { req: true }); f.insertBefore(roleHint, f.lastChild); return f; })(),
      field('uf-inst', 'users.l_inst', inst, { req: true, hint: t('users.h_inst') }),
      field('uf-bank', 'users.l_bank', bank, { req: true, hint: t('users.h_bank') }),
      field('uf-desig', 'users.l_desig', desig),
      field('uf-phone', 'users.l_phone', phone),
      field('uf-pw', isEdit ? 'users.l_pw_new' : 'users.l_pw', pw, { hint: t(isEdit ? 'users.h_pw_new' : 'users.h_pw') }),
      isEdit ? el('label', { class: 'check full', title: u.id === me.id ? t('users.self_lock') : '' }, active, t('users.l_active')) : null));

  const syncRole = () => {
    body.querySelector('#uf-inst-wrap').classList.toggle('hidden', role.value !== 'institution');
    body.querySelector('#uf-bank-wrap').classList.toggle('hidden', role.value !== 'bank');
    roleHint.textContent = STAFF.includes(role.value) ? t('users.h_role_staff') : '';
  };
  role.addEventListener('change', syncRole);
  if (isEdit && u.id === me.id) role.disabled = true;
  syncRole();

  const setErr = (ctrl, msg) => {
    ctrl.classList.toggle('invalid', !!msg);
    ctrl.setAttribute('aria-invalid', msg ? 'true' : 'false');
    const e = body.querySelector(`#${ctrl.id}-err`);
    if (e) e.textContent = msg || '';
  };
  [name, email, role, inst, bank, phone, pw].forEach((c) => c.addEventListener('input', () => setErr(c, '')));

  const validate = () => {
    const errs = [];
    const check = (ctrl, bad, key) => { setErr(ctrl, bad ? t(key) : ''); if (bad) errs.push(ctrl); };
    check(name, !name.value.trim(), 'users.e_name');
    check(email, !EMAIL_RE.test(email.value.trim()), 'users.e_email');
    check(role, !role.value, 'users.e_role');
    check(inst, role.value === 'institution' && !inst.value, 'users.e_inst');
    check(bank, role.value === 'bank' && !bank.value, 'users.e_bank');
    const digits = phone.value.replace(/[\s-]/g, '').replace(/^\+?91/, '');
    check(phone, phone.value.trim() && !/^[6-9]\d{9}$/.test(digits), 'users.e_phone');
    check(pw, pw.value && pw.value.length < 8, 'users.e_pw');
    return errs;
  };

  const submit = async () => {
    serverErr.classList.add('hidden');
    const errs = validate();
    if (errs.length) { errs[0].focus(); return false; }
    const payload = {
      name: name.value.trim(),
      role: role.value,
      designation: desig.value.trim(),
      phone: phone.value.trim(),
    };
    if (role.value === 'institution') payload.institution_id = Number(inst.value);
    if (role.value === 'bank') payload.bank_id = Number(bank.value);
    if (pw.value) payload.password = pw.value;
    try {
      if (isEdit) {
        if (u.id !== me.id) payload.active = active.checked;
        if (u.id === me.id) delete payload.role;
        const changed = Object.keys(payload).some((k) => k === 'password' || String(payload[k] ?? '') !== String(u[k] ?? ''));
        if (!changed) { toast(t('users.no_change'), 'info'); return true; }
        await api.patch(`/admin/users/${u.id}`, payload);
        toast(t('users.updated', { name: payload.name }), 'success');
      } else {
        payload.email = email.value.trim().toLowerCase();
        await api.post('/admin/users', payload);
        toast(t('users.created', { name: payload.name, role: t(`role.${payload.role}`) }), 'success');
        state.filter = { role: '', status: '', q: payload.email };
        renderFilterControls();
      }
      await load(true);
      return true;
    } catch (err) {
      serverErr.innerHTML = `${icon('alert-circle', 18)}<div>${esc(err.message || t('common.error'))}</div>`;
      serverErr.classList.remove('hidden');
      if (err.status === 409) setErr(email, err.message);
      return false;
    }
  };

  modal({
    title: isEdit ? t('users.edit_title', { name: u.name }) : t('users.add_title'),
    body,
    size: 'wide',
    actions: [
      { label: t('common.cancel'), variant: 'secondary' },
      { label: isEdit ? t('users.save') : t('users.create'), variant: 'primary', onClick: submit },
    ],
  });
  body.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); body.closest('.modal')?.querySelector('.modal-foot .btn.primary, .modal-foot .btn:last-child')?.click(); } });
}

/* ------------------------------------------------------------------ load */
async function load(quiet = false) {
  if (!quiet) loading(tableEl);
  try {
    state.users = await api.get('/admin/users');
    renderSummary();
    renderFilterControls();
    renderTableArea();
  } catch (err) {
    errorState(tableEl, err, () => load());
  }
}

function renderChrome() {
  addBtn.innerHTML = `${icon('plus', 16)}<span>${esc(t('users.add'))}</span>`;
}
addBtn.addEventListener('click', () => openForm());
renderChrome();
onLang(() => { renderChrome(); apply(); if (state.users) { renderSummary(); renderFilterControls(); renderTableArea(); } });
load();
