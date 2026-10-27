// Sign-in page: brand panel, sign-in form (show/hide password, busy state, inline errors),
// demo accounts grouped by role (one click signs in), ?next= (site-relative only), ?as=<email> auto sign-in,
// and a "Continue as" card when a session already exists.
import { initPage } from './assets/js/layout.js';
import { api, site, login, homeFor, clearSession, getToken } from './assets/js/api.js';
import { t, extend, onLang } from './assets/js/i18n.js';
import { logoSvg } from './assets/js/icons.js';
import { $, el, esc, icon, mount, loading, errorState, withBusy, toast, getParam, setParams, initials } from './assets/js/ui.js';

extend({
  en: {
    'login.title': 'Sign in',
    'login.subtitle': 'Access the security deposit and FDR portal with your official or demo account',
    'login.after': 'After you sign in',
    'login.can_inst': 'Institutions', 'login.can_inst_d': 'Submit FDRs, follow verification and request releases',
    'login.can_off': 'AICTE officers', 'login.can_off_d': 'Verify deposits in a risk-ranked queue and watch maturities',
    'login.can_auth': 'Competent authority', 'login.can_auth_d': 'Approve releases and act on escalations',
    'login.can_bank': 'Banks', 'login.can_bank_d': 'Issue signed receipts and confirm liens to AICTE',
    'login.secure_t': 'Your session is protected',
    'login.secure': 'Signed sessions, role-based access, every action recorded in a tamper-evident audit trail.',
    'login.form_title': 'Sign in to your account',
    'login.form_intro': 'Use the email address registered with the portal.',
    'login.email': 'Email address',
    'login.email_ph': 'name@institution.edu.in',
    'login.password': 'Password',
    'login.show': 'Show',
    'login.hide': 'Hide',
    'login.show_aria': 'Show password',
    'login.hide_aria': 'Hide password',
    'login.submit': 'Sign in',
    'login.forgot': 'Forgot your password? Contact the portal administrator.',
    'login.or': 'or',
    'login.use_demo': 'Use a demo account',
    'login.verify_link': 'Only checking a receipt? Verify it without signing in',
    'login.err_email': 'Enter a valid email address.',
    'login.err_pw': 'Enter your password.',
    'login.err_bad': 'The email or password is incorrect. Please check and try again.',
    'login.err_network': 'Could not reach the server. Check your connection and try again.',
    'login.err_title': 'Sign-in failed',
    'login.welcome': 'Welcome, {name}',
    'login.as_progress': 'Signing you in as {email}…',
    'login.next_note': 'Sign in to continue to the page you requested.',
    'login.me_title': 'You are already signed in',
    'login.me_intro': 'Continue where you left off, or sign out to use another account.',
    'login.continue': 'Continue as {name}',
    'login.signout': 'Sign out',
    'login.signed_out': 'You have been signed out.',
    'login.demo_title': 'Demo accounts',
    'login.demo_sub': 'One click signs you in — each role sees a different portal.',
    'login.demo_pw': 'Password for all: {pw}',
    'login.demo_signin': 'Sign in',
    'login.demo_signin_aria': 'Sign in as {name}',
    'login.demo_error': 'Demo accounts could not be loaded',
    'login.g_institution': 'Submit and track their own deposits',
    'login.g_officer': 'Verify deposits and manage the registry',
    'login.g_authority': 'Approves releases, receives escalations',
    'login.g_bank': 'Issue FDRs and confirm lien and status',
    'login.g_admin': 'Users, settings and the demo clock',
  },
  hi: {
    'login.title': 'साइन इन',
    'login.subtitle': 'अपने आधिकारिक या डेमो खाते से सुरक्षा जमा एवं एफडीआर पोर्टल का उपयोग करें',
    'login.after': 'साइन इन के बाद आप कर सकेंगे',
    'login.can_inst': 'संस्थान', 'login.can_inst_d': 'एफडीआर प्रस्तुत करें, सत्यापन देखें और रिलीज़ का अनुरोध करें',
    'login.can_off': 'एआईसीटीई अधिकारी', 'login.can_off_d': 'जोखिम-क्रमित कतार में जमा सत्यापित करें और परिपक्वता पर नज़र रखें',
    'login.can_auth': 'सक्षम प्राधिकारी', 'login.can_auth_d': 'रिलीज़ अनुमोदित करें और एस्केलेशन पर कार्रवाई करें',
    'login.can_bank': 'बैंक', 'login.can_bank_d': 'हस्ताक्षरित रसीदें जारी करें और एआईसीटीई ग्रहणाधिकार की पुष्टि करें',
    'login.secure_t': 'आपका सत्र सुरक्षित है',
    'login.secure': 'हस्ताक्षरित सत्र, भूमिका-आधारित पहुँच, और हर कार्रवाई छेड़छाड़-रोधी ऑडिट ट्रेल में दर्ज।',
    'login.form_title': 'अपने खाते में साइन इन करें',
    'login.form_intro': 'पोर्टल पर पंजीकृत ईमेल पते का उपयोग करें।',
    'login.email': 'ईमेल पता',
    'login.email_ph': 'name@institution.edu.in',
    'login.password': 'पासवर्ड',
    'login.show': 'दिखाएँ',
    'login.hide': 'छिपाएँ',
    'login.show_aria': 'पासवर्ड दिखाएँ',
    'login.hide_aria': 'पासवर्ड छिपाएँ',
    'login.submit': 'साइन इन करें',
    'login.forgot': 'पासवर्ड भूल गए? पोर्टल प्रशासक से संपर्क करें।',
    'login.or': 'अथवा',
    'login.use_demo': 'डेमो खाते का उपयोग करें',
    'login.verify_link': 'केवल रसीद जाँचनी है? बिना साइन इन किए सत्यापित करें',
    'login.err_email': 'मान्य ईमेल पता दर्ज करें।',
    'login.err_pw': 'अपना पासवर्ड दर्ज करें।',
    'login.err_bad': 'ईमेल या पासवर्ड ग़लत है। कृपया जाँचकर पुनः प्रयास करें।',
    'login.err_network': 'सर्वर से संपर्क नहीं हो सका। अपना कनेक्शन जाँचकर पुनः प्रयास करें।',
    'login.err_title': 'साइन इन नहीं हो सका',
    'login.welcome': 'स्वागत है, {name}',
    'login.as_progress': '{email} के रूप में साइन इन किया जा रहा है…',
    'login.next_note': 'अनुरोधित पृष्ठ पर जाने के लिए साइन इन करें।',
    'login.me_title': 'आप पहले से साइन इन हैं',
    'login.me_intro': 'जहाँ छोड़ा था वहीं से जारी रखें, या किसी अन्य खाते के लिए साइन आउट करें।',
    'login.continue': '{name} के रूप में जारी रखें',
    'login.signout': 'साइन आउट',
    'login.signed_out': 'आप साइन आउट हो गए हैं।',
    'login.demo_title': 'डेमो खाते',
    'login.demo_sub': 'एक क्लिक में साइन इन — हर भूमिका को अलग पोर्टल दिखता है।',
    'login.demo_pw': 'सभी का पासवर्ड: {pw}',
    'login.demo_signin': 'साइन इन',
    'login.demo_signin_aria': '{name} के रूप में साइन इन करें',
    'login.demo_error': 'डेमो खाते लोड नहीं हो सके',
    'login.g_institution': 'अपनी जमाएँ प्रस्तुत करें और उन पर नज़र रखें',
    'login.g_officer': 'जमाओं का सत्यापन और रजिस्टर का प्रबंधन',
    'login.g_authority': 'रिलीज़ अनुमोदन, एस्केलेशन प्राप्ति',
    'login.g_bank': 'एफडीआर जारी करना, ग्रहणाधिकार व स्थिति की पुष्टि',
    'login.g_admin': 'उपयोगकर्ता, सेटिंग्स और डेमो घड़ी',
  },
});

const { user } = await initPage({
  roles: null,
  active: '',
  title: 'login.title',
  subtitle: 'login.subtitle',
  breadcrumbs: [{ label: 'nav.home', href: 'index.html' }, { label: 'login.title' }],
});

let me = getToken() ? user : null;
let demo;            // undefined = loading, null = failed, object = loaded
let lastError = null;
let pwVisible = false;
let autoAs = getParam('as');

/** ?next= accepted only when it is a site-relative path (no scheme, no protocol-relative URL, no backslashes). */
function safeNext() {
  const raw = (getParam('next') || '').trim();
  if (!raw) return null;
  if (raw.includes('://') || raw.startsWith('//') || raw.includes('\\') || /^[a-z][a-z0-9+.-]*:/i.test(raw)) return null;
  const path = raw.replace(/^\/+/, '');
  if (!path || /^login\.html/i.test(path)) return null;
  return path;
}
function goAfterLogin(u) { location.href = site(safeNext() || homeFor(u.role)); }

const ROLE_ICON = { institution: ['building', 'saffron'], officer: ['shield-check', ''], authority: ['stamp', 'green'], bank: ['bank', 'teal'], admin: ['settings', 'violet'] };
const ROLE_ORDER = ['institution', 'officer', 'authority', 'bank', 'admin'];

/* ---------------------------------------------------------------- brand panel */
function renderBrand() {
  const can = [['building', 'can_inst'], ['shield-check', 'can_off'], ['stamp', 'can_auth'], ['bank', 'can_bank']];
  mount($('#brand'),
    el('div', { class: 'b-top' },
      el('div', { class: 'b-logo', html: logoSvg(56), 'aria-hidden': 'true' }),
      el('div', {},
        el('div', { class: 'b-name', lang: 'en' }, 'Nidhi Kavach'),
        el('div', { class: 'b-name-hi', lang: 'hi' }, t('app.name_hi')),
        el('div', { class: 'b-tag' }, t('app.tagline')))),
    el('div', {},
      el('h2', {}, t('login.after')),
      el('ul', { class: 'lg-can' }, can.map(([ic, k]) => el('li', {},
        el('span', { class: 'ic', html: icon(ic, 18), 'aria-hidden': 'true' }),
        el('div', {}, el('div', { class: 'r' }, t(`login.${k}`)), el('div', { class: 'd' }, t(`login.${k}_d`))))))),
    el('div', { class: 'lg-secure', html: `${icon('lock', 18)}<div><b>${esc(t('login.secure_t'))}</b>${esc(t('login.secure'))}</div>` }));
}

/* ---------------------------------------------------------------- form / continue card */
function errorText(e) {
  if (!e) return '';
  if (e.status === 401) return t('login.err_bad');
  if (!e.status) return t('login.err_network');
  return e.message || t('common.error');
}
function renderError() {
  const box = $('#err');
  if (!box) return;
  if (!lastError) { box.hidden = true; box.innerHTML = ''; return; }
  box.hidden = false;
  box.className = 'alert danger';
  box.innerHTML = `${icon('alert-circle', 18)}<div><div class="a-title">${esc(t('login.err_title'))}</div>${esc(errorText(lastError))}</div>`;
}

async function doLogin(email, password, btn) {
  lastError = null;
  renderError();
  await withBusy(btn, async () => {
    try {
      const u = await login(email, password);
      toast(t('login.welcome', { name: u.name }), 'success', 2500);
      goAfterLogin(u);
      await new Promise((r) => setTimeout(r, 4000));   // keep the button busy while the next page loads
    } catch (e) {
      lastError = e;
      renderError();
      const pw = $('#lg-password');
      if (pw && e.status === 401) { pw.select(); pw.focus(); }
    }
  });
}

function setFieldError(input, msg) {
  const id = `${input.id}-err`;
  let node = document.getElementById(id);
  input.classList.toggle('invalid', !!msg);
  if (msg) {
    if (!node) { node = el('span', { class: 'error', id }); input.closest('.field').appendChild(node); }
    node.textContent = msg;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', id);
  } else {
    if (node) node.remove();
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }
}

function renderForm() {
  const area = $('#form-area');
  const prevEmail = $('#lg-email')?.value ?? (autoAs || '');
  const prevPw = $('#lg-password')?.value ?? '';
  const emailIn = el('input', { class: 'input', id: 'lg-email', type: 'email', name: 'email', autocomplete: 'username', required: true, placeholder: t('login.email_ph'), value: prevEmail, spellcheck: 'false' });
  const pwIn = el('input', { class: 'input', id: 'lg-password', type: pwVisible ? 'text' : 'password', name: 'password', autocomplete: 'current-password', required: true, value: prevPw });
  const toggle = el('button', {
    class: 'btn secondary', type: 'button', 'aria-controls': 'lg-password', 'aria-pressed': String(pwVisible),
    'aria-label': t(pwVisible ? 'login.hide_aria' : 'login.show_aria'),
    html: `${icon(pwVisible ? 'eye' : 'eye', 16)}<span>${esc(t(pwVisible ? 'login.hide' : 'login.show'))}</span>`,
    onclick: () => {
      pwVisible = !pwVisible;
      pwIn.type = pwVisible ? 'text' : 'password';
      toggle.setAttribute('aria-pressed', String(pwVisible));
      toggle.setAttribute('aria-label', t(pwVisible ? 'login.hide_aria' : 'login.show_aria'));
      toggle.lastChild.textContent = t(pwVisible ? 'login.hide' : 'login.show');
      pwIn.focus();
    },
  });
  const submit = el('button', { class: 'btn lg block', type: 'submit', id: 'lg-submit', html: `${icon('login', 18)}<span>${esc(t('login.submit'))}</span>` });
  const form = el('form', { id: 'login-form', novalidate: true },
    el('div', { class: 'lg-fields' },
      el('div', { class: 'field' },
        el('label', { for: 'lg-email' }, t('login.email'), el('span', { class: 'req', 'aria-hidden': 'true' }, '*')),
        el('div', { class: 'input-icon' }, el('span', { html: icon('mail', 16) }), emailIn)),
      el('div', { class: 'field lg-pw' },
        el('label', { for: 'lg-password' }, t('login.password'), el('span', { class: 'req', 'aria-hidden': 'true' }, '*')),
        el('div', { class: 'input-group' }, pwIn, toggle)),
      submit,
      el('div', { class: 'lg-row muted' }, el('span', {}, t('login.forgot')))));
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const email = emailIn.value.trim();
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setFieldError(emailIn, okEmail ? '' : t('login.err_email'));
    setFieldError(pwIn, pwIn.value ? '' : t('login.err_pw'));
    if (!okEmail) { emailIn.focus(); return; }
    if (!pwIn.value) { pwIn.focus(); return; }
    doLogin(email, pwIn.value, submit);
  });
  emailIn.addEventListener('input', () => setFieldError(emailIn, ''));
  pwIn.addEventListener('input', () => setFieldError(pwIn, ''));

  mount(area,
    el('h2', { id: 'form-title' }, t('login.form_title')),
    el('p', { class: 'intro' }, t('login.form_intro')),
    safeNext() ? el('div', { class: 'alert info', html: `${icon('info', 18)}<div>${esc(t('login.next_note'))}</div>` }) : null,
    el('div', { id: 'err', role: 'alert', hidden: true }),
    form,
    el('div', { class: 'lg-or' }, t('login.or')),
    el('div', { class: 'stack' },
      demo && demo.enabled ? el('a', { class: 'btn secondary block', href: '#demo', html: `${icon('users', 16)} ${esc(t('login.use_demo'))}` }) : null,
      el('a', { class: 'btn ghost block', href: site('verify.html'), html: `${icon('qr', 16)} ${esc(t('login.verify_link'))}` })));
  renderError();
}

function renderMe() {
  const org = me.institution_name || me.bank_name || me.designation || '';
  const cont = el('button', { class: 'btn lg block', type: 'button', html: `${icon('arrow-right', 18)}<span>${esc(t('login.continue', { name: me.name }))}</span>`, onclick: () => goAfterLogin(me) });
  const out = el('button', {
    class: 'btn secondary block', type: 'button', html: `${icon('logout', 16)}<span>${esc(t('login.signout'))}</span>`,
    onclick: (ev) => withBusy(ev.currentTarget, async () => {
      try { await api.post('/auth/logout', {}, { noRedirect: true }); } catch (e) { /* session may already be gone */ }
      clearSession();
      setParams({ as: null });
      try { sessionStorage.setItem('nk-login-signed-out', '1'); } catch (e) { /* ignore */ }
      location.reload();
    }),
  });
  mount($('#form-area'),
    el('h2', { id: 'form-title' }, t('login.me_title')),
    el('p', { class: 'intro' }, t('login.me_intro')),
    el('div', { class: 'lg-me' },
      el('span', { class: 'avatar lg', 'aria-hidden': 'true' }, initials(me.name)),
      el('div', { style: 'min-width:0' },
        el('div', { class: 'n' }, me.name),
        el('div', { class: 's' }, [t(`role.${me.role}`, { _default: me.role }), org].filter(Boolean).join(' · ')),
        el('div', { class: 's mono' }, me.email))),
    el('div', { class: 'lg-me-actions' }, cont, out));
}

function renderMain() { if (me && !autoAs) renderMe(); else renderForm(); }

/* ---------------------------------------------------------------- demo accounts */
function renderDemo() {
  const section = $('#demo');
  const list = $('#demo-list');
  if (demo === undefined) { loading(list); return; }
  if (demo === null) {
    $('#demo-sub').textContent = '';
    $('#demo-pw').hidden = true;
    errorState(list, { message: t('login.demo_error') }, loadDemo);
    return;
  }
  if (!demo.enabled || !demo.accounts?.length) { section.hidden = true; return; }
  section.hidden = false;
  $('#demo-sub').textContent = t('login.demo_sub');
  const pwBadge = $('#demo-pw');
  pwBadge.hidden = false;
  pwBadge.innerHTML = `${icon('key', 13)} ${esc(t('login.demo_pw', { pw: demo.password }))}`;
  const groups = ROLE_ORDER.map((r) => [r, demo.accounts.filter((a) => a.role === r)]).filter(([, a]) => a.length);
  const others = demo.accounts.filter((a) => !ROLE_ORDER.includes(a.role));
  if (others.length) groups.push(['other', others]);
  mount(list, el('div', { class: 'lg-demo-cols' }, groups.map(([role, accts]) => {
    const [ic, tone] = ROLE_ICON[role] || ['user', ''];
    return el('div', { class: 'lg-group' },
      el('div', { class: 'lg-group-head' },
        el('div', { class: `feature-icon ${tone}`, html: icon(ic, 18) }),
        el('div', { class: 'grow', style: 'min-width:0' },
          el('h3', {}, t(`role.${role}`, { _default: role })),
          el('div', { class: 'gd' }, t(`login.g_${role}`, { _default: '' }))),
        el('span', { class: 'badge b-slate' }, String(accts.length))),
      accts.map((a) => {
        const sub = a.organisation && !a.designation?.includes(a.organisation) ? `${a.designation} · ${a.organisation}` : a.designation;
        return el('div', { class: 'list-item lg-acct' },
          el('span', { class: 'avatar', 'aria-hidden': 'true' }, initials(a.name)),
          el('div', { class: 'li-main' },
            el('div', { class: 'li-title' }, a.name),
            el('div', { class: 'li-sub' }, sub || ''),
            el('div', { class: 'mono' }, a.email)),
          el('button', {
            class: 'btn sm', type: 'button', 'aria-label': t('login.demo_signin_aria', { name: a.name }),
            html: `${icon('login', 14)}<span>${esc(t('login.demo_signin'))}</span>`,
            onclick: (ev) => {
              const btn = ev.currentTarget;
              if (me) { me = null; autoAs = a.email; renderMain(); }
              const em = $('#lg-email'); const pw = $('#lg-password');
              if (em) em.value = a.email;
              if (pw) pw.value = demo.password;
              doLogin(a.email, demo.password, btn);
            },
          }));
      }));
  })));
}

async function loadDemo() {
  demo = undefined;
  renderDemo();
  try { demo = await api.get('/auth/demo-accounts', null, { noRedirect: true }); } catch (e) { demo = null; }
  renderDemo();
  renderMain();
  if (autoAs && demo !== undefined) startAutoAs();
}

let autoStarted = false;
function startAutoAs() {
  if (autoStarted) return;
  autoStarted = true;
  const email = autoAs.trim();
  if (!demo || !demo.enabled) { $('#lg-password')?.focus(); return; }
  const em = $('#lg-email'); const pw = $('#lg-password');
  if (em) em.value = email;
  if (pw) pw.value = demo.password;
  toast(t('login.as_progress', { email }), 'info', 2500);
  doLogin(email, demo.password, $('#lg-submit'));
}

function renderAll() { renderBrand(); renderMain(); renderDemo(); }
renderAll();
try { if (sessionStorage.getItem('nk-login-signed-out')) { sessionStorage.removeItem('nk-login-signed-out'); toast(t('login.signed_out'), 'success'); } } catch (e) { /* ignore */ }
if (!me && !autoAs) $('#lg-email')?.focus({ preventScroll: true });
loadDemo();
onLang(renderAll);
