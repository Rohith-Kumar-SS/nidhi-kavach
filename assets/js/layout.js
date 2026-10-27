// Page chrome: top bar (accessibility + language), brand bar, role navigation, prototype ribbon, page head, footer.
// Every page calls initPage() first:
//   const { user, meta } = await initPage({ roles: ['officer','authority'], active: 'queue',
//       title: 'nav.queue', subtitle: {en:'...', hi:'...'}, breadcrumbs: [{label:'nav.dashboard', href:'officer/dashboard.html'}, {label:'nav.queue'}],
//       actions: someNode });
// roles: null = public page. Labels accept an i18n key, an {en, hi} object or plain text. hrefs are site-relative.
import { api, getToken, getStoredUser, updateStoredUser, site, homeFor, logout, currentRelativePath } from './api.js';
import { t, tl, apply as applyI18n, setLang, getLang, onLang } from './i18n.js';
import { el, esc, mount, fmtDate, initials, $ } from './ui.js';
import { icon, logoSvg } from './icons.js';

const NAVS = {
  public: [
    ['home', 'index.html', 'nav.home'],
    ['verify', 'verify.html', 'nav.verify'],
    ['how', 'index.html#how', 'nav.how'],
    ['demo', 'demo.html', 'nav.demo'],
  ],
  officer: [
    ['dashboard', 'officer/dashboard.html', 'nav.dashboard'],
    ['queue', 'officer/queue.html', 'nav.queue'],
    ['registry', 'officer/fdrs.html', 'nav.registry'],
    ['institutions', 'officer/institutions.html', 'nav.institutions'],
    ['releases', 'officer/releases.html', 'nav.releases'],
    ['alerts', 'officer/alerts.html', 'nav.alerts'],
    ['reports', 'officer/reports.html', 'nav.reports'],
    ['analytics', 'officer/analytics.html', 'nav.analytics'],
    ['audit', 'officer/audit.html', 'nav.audit'],
  ],
  admin: [
    ['dashboard', 'officer/dashboard.html', 'nav.dashboard'],
    ['registry', 'officer/fdrs.html', 'nav.registry'],
    ['releases', 'officer/releases.html', 'nav.releases'],
    ['alerts', 'officer/alerts.html', 'nav.alerts'],
    ['audit', 'officer/audit.html', 'nav.audit'],
    ['users', 'admin/users.html', 'nav.users'],
    ['settings', 'admin/settings.html', 'nav.settings'],
    ['demo', 'demo.html', 'nav.demo'],
  ],
  institution: [
    ['dashboard', 'institution/dashboard.html', 'nav.dashboard'],
    ['submit', 'institution/submit.html', 'nav.submit'],
    ['fdrs', 'institution/fdrs.html', 'nav.my_fdrs'],
    ['releases', 'institution/releases.html', 'nav.releases'],
    ['notifications', 'notifications.html', 'nav.notifications'],
  ],
  bank: [
    ['dashboard', 'bank/dashboard.html', 'nav.dashboard'],
    ['issue', 'bank/issue.html', 'nav.issue'],
    ['ledger', 'bank/deposits.html', 'nav.ledger'],
    ['notifications', 'notifications.html', 'nav.notifications'],
  ],
};

export function navFor(role) {
  if (role === 'officer' || role === 'authority') return 'officer';
  if (role === 'admin') return 'admin';
  if (role === 'institution' || role === 'bank') return role;
  return 'public';
}

const FONT_STEPS = ['13.5px', '15px', '16.5px', '18px'];
let state = {};
let unreadTimer = null;

function halt() { return new Promise(() => {}); }

function ensureSlot(id, tag, where) {
  let node = document.getElementById(id);
  if (!node) {
    node = el(tag, { id });
    if (where === 'start') document.body.prepend(node);
    else if (where === 'end') document.body.append(node);
    else where.before(node);
  }
  return node;
}

/* ---------------------------------------------------------------- header */
function topbar() {
  const fs = (() => { try { return localStorage.getItem('nk_font_scale') || '15px'; } catch (e) { return '15px'; } })();
  const setFont = (v) => {
    document.documentElement.style.fontSize = v;
    try { localStorage.setItem('nk_font_scale', v); } catch (e) { /* ignore */ }
  };
  const step = (d) => {
    const cur = FONT_STEPS.indexOf(document.documentElement.style.fontSize || fs);
    const i = Math.min(FONT_STEPS.length - 1, Math.max(0, (cur < 0 ? 1 : cur) + d));
    setFont(FONT_STEPS[i]);
  };
  const lang = getLang();
  return el('div', { class: 'nk-topbar' }, el('div', { class: 'nk-container' },
    el('div', { class: 'tb-left' },
      el('span', { class: 'pill' }, t('top.sih')),
      el('span', { class: 'tb-text' }, t('top.text'))),
    el('div', { class: 'tb-right' },
      el('a', { class: 'tb-btn', href: '#main' }, t('top.skip')),
      el('span', { class: 'tb-sep' }),
      el('button', { class: 'tb-btn', type: 'button', title: t('top.font_dec'), 'aria-label': t('top.font_dec'), onclick: () => step(-1) }, 'A-'),
      el('button', { class: 'tb-btn', type: 'button', title: t('top.font_reset'), 'aria-label': t('top.font_reset'), onclick: () => setFont('15px') }, 'A'),
      el('button', { class: 'tb-btn', type: 'button', title: t('top.font_inc'), 'aria-label': t('top.font_inc'), onclick: () => step(1) }, 'A+'),
      el('span', { class: 'tb-sep' }),
      el('button', {
        class: 'tb-btn', type: 'button', title: t('top.contrast'), 'aria-label': t('top.contrast'), html: icon('contrast', 15),
        onclick: () => {
          const on = document.documentElement.classList.toggle('nk-contrast');
          try { localStorage.setItem('nk_contrast', on ? '1' : '0'); } catch (e) { /* ignore */ }
        },
      }),
      el('span', { class: 'tb-sep' }),
      el('button', { class: `tb-btn ${lang === 'en' ? 'active' : ''}`, type: 'button', lang: 'en', onclick: () => setLang('en') }, 'English'),
      el('button', { class: `tb-btn ${lang === 'hi' ? 'active' : ''}`, type: 'button', lang: 'hi', onclick: () => setLang('hi') }, 'हिंदी'))));
}

function simClock(meta, user) {
  if (!meta || !meta.today) return null;
  const staff = user && ['officer', 'authority', 'admin'].includes(user.role);
  const chip = el(staff ? 'a' : 'span', {
    class: `nk-simclock ${meta.simulated ? '' : 'real'}`,
    href: staff ? site('demo.html#clock') : null,
    title: meta.simulated ? `${t('clock.simulated')} (real: ${fmtDate(meta.real_today)})` : t('clock.demo_date'),
    html: `${icon('calendar', 14)}<span class="lbl">${esc(meta.simulated ? t('clock.simulated') : t('clock.real'))}:</span> ${esc(fmtDate(meta.today))}`,
  });
  return chip;
}

function userMenu(user) {
  const btn = el('button', { type: 'button', 'aria-haspopup': 'true', 'aria-expanded': 'false' },
    el('span', { class: 'avatar' }, initials(user.name)),
    el('span', { class: 'who' },
      el('div', { class: 'n' }, user.name),
      el('div', { class: 'r' }, user.institution_name || user.bank_name || t(`role.${user.role}`))),
    el('span', { html: icon('chevron-down', 16) }));
  const staff = ['officer', 'authority', 'admin'].includes(user.role);
  const menu = el('div', { class: 'menu', hidden: true, role: 'menu' },
    el('div', { class: 'menu-head' }, el('div', {}, t('user.signed_in_as')), el('strong', { style: { color: 'var(--nk-text)' } }, user.email), el('div', {}, t(`role.${user.role}`))),
    el('div', { class: 'menu-sep' }),
    el('a', { href: site(homeFor(user.role)), role: 'menuitem', html: `${icon('dashboard', 16)}<span>${esc(t('nav.dashboard'))}</span>` }),
    el('a', { href: site('notifications.html'), role: 'menuitem', html: `${icon('bell', 16)}<span>${esc(t('user.notifications'))}</span>` }),
    staff ? el('a', { href: site('demo.html'), role: 'menuitem', html: `${icon('play', 16)}<span>${esc(t('user.demo'))}</span>` }) : null,
    el('a', { href: site('verify.html'), role: 'menuitem', html: `${icon('qr', 16)}<span>${esc(t('nav.verify'))}</span>` }),
    el('div', { class: 'menu-sep' }),
    el('button', { type: 'button', role: 'menuitem', onclick: () => logout(), html: `${icon('logout', 16)}<span>${esc(t('user.signout'))}</span>` }));
  const wrap = el('div', { class: 'nk-usermenu' }, btn, menu);
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    btn.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
  return wrap;
}

function bell() {
  const a = el('a', { class: 'nk-bell', href: site('notifications.html'), 'aria-label': t('user.notifications'), title: t('user.notifications'), html: icon('bell', 19) });
  const count = el('span', { class: 'count', hidden: true });
  a.appendChild(count);
  const refresh = async () => {
    try {
      const r = await api.get('/notifications/unread-count', null, { noRedirect: true });
      count.textContent = r.count > 99 ? '99+' : String(r.count);
      count.hidden = !r.count;
    } catch (e) { /* ignore */ }
  };
  refresh();
  clearInterval(unreadTimer);
  unreadTimer = setInterval(refresh, 60000);
  window.addEventListener('nk:notifications-changed', refresh);
  return a;
}

function brandbar(user, meta) {
  const right = el('div', { class: 'bb-right' });
  if (user) {
    const clock = simClock(meta, user);
    if (clock) right.appendChild(clock);
    right.appendChild(bell());
    right.appendChild(userMenu(user));
  } else {
    if (meta && meta.today) right.appendChild(simClock(meta, null));
    right.appendChild(el('a', { class: 'btn', href: site('login.html'), html: `${icon('login', 16)}<span>${esc(t('nav.login'))}</span>` }));
  }
  return el('div', { class: 'nk-brandbar' }, el('div', { class: 'nk-container' },
    el('a', { class: 'nk-brand', href: site(user ? homeFor(user.role) : 'index.html'), 'aria-label': 'Nidhi Kavach home' },
      el('span', { html: logoSvg(56) }),
      el('span', { class: 'name' },
        el('span', { class: 'en' }, 'Nidhi Kavach'),
        el('span', { class: 'hi', lang: 'hi' }, 'निधि कवच'),
        el('span', { class: 'tag' }, t('app.tagline')))),
    el('span', { class: 'bb-divider' }),
    el('div', { class: 'bb-org' },
      el('div', { class: 'l1' }, t('org.l1')),
      el('div', { class: 'l2' }, t('org.l2')),
      el('div', { class: 'l3' }, t('org.l3'))),
    right));
}

function navbar(navKey, active, user) {
  const items = (NAVS[navKey] || NAVS.public).map(([key, href, label]) => el('a', {
    class: `nav-item ${key === active ? 'active' : ''}`, href: site(href), 'aria-current': key === active ? 'page' : null,
  }, t(label)));
  if (navKey === 'public' && user) {
    items.push(el('a', { class: 'nav-item', href: site(homeFor(user.role)), html: `${icon('dashboard', 16)}<span>${esc(t('nav.dashboard'))}</span>` }));
  }
  const nav = el('nav', { class: 'nk-nav', 'aria-label': 'Main' });
  const toggle = el('button', { class: 'nav-toggle', type: 'button', 'aria-expanded': 'false', html: `${icon('menu', 20)}<span>${esc(t('nav.menu'))}</span>` });
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.appendChild(el('div', { class: 'nk-container' }, toggle, el('div', { class: 'nav-items' }, items)));
  return nav;
}

function ribbon() {
  return el('div', { class: 'nk-prototype-ribbon', role: 'note' }, el('div', { class: 'nk-container' },
    el('span', { html: icon('info', 15) }), el('span', {}, t('ribbon.text'))));
}

function wakeBanner() {
  const b = el('div', { class: 'nk-wake', hidden: true, role: 'status' }, el('div', { class: 'nk-container' },
    el('span', { class: 'spinner', style: { width: '16px', height: '16px', borderWidth: '2px' } }), el('span', {}, t('wake.text'))));
  window.addEventListener('nk:slow', () => { b.hidden = false; });
  window.addEventListener('nk:fast', () => { b.hidden = true; });
  return b;
}

/* ---------------------------------------------------------------- page head */
function labelOf(v) { return tl(v); }

export function setPageHead({ title, subtitle, breadcrumbs, actions } = {}) {
  if (title !== undefined) state.title = title;
  if (subtitle !== undefined) state.subtitle = subtitle;
  if (breadcrumbs !== undefined) state.breadcrumbs = breadcrumbs;
  if (actions !== undefined) state.actions = actions;
  renderPageHead();
}

function renderPageHead() {
  const slot = document.getElementById('nk-pagehead');
  if (!slot) return;
  if (!state.title) { slot.hidden = true; return; }
  slot.hidden = false;
  const titleText = labelOf(state.title);
  document.title = `${titleText} · Nidhi Kavach`;
  const crumbs = state.breadcrumbs && state.breadcrumbs.length
    ? el('ol', { class: 'breadcrumb' }, state.breadcrumbs.map((b) => el('li', {}, b.href ? el('a', { href: site(b.href) }, labelOf(b.label)) : el('span', {}, labelOf(b.label)))))
    : null;
  let actionsNode = state.actions;
  if (typeof actionsNode === 'function') actionsNode = actionsNode();
  mount(slot, el('div', { class: 'nk-pagehead' }, el('div', { class: 'nk-container' },
    el('div', {}, crumbs, el('h1', {}, titleText), state.subtitle ? el('div', { class: 'subtitle' }, labelOf(state.subtitle)) : null),
    actionsNode ? el('div', { class: 'ph-actions' }, actionsNode) : null)));
}

/* ---------------------------------------------------------------- footer */
function footer(user, meta) {
  const year = (meta && meta.today ? meta.today.slice(0, 4) : '2026');
  const apiDocs = `${(window.NK_CONFIG && window.NK_CONFIG.apiBase) || ''}/api/docs`;
  return el('footer', { class: 'nk-footer' }, el('div', { class: 'nk-container' },
    el('div', { class: 'f-grid' },
      el('div', {},
        el('div', { class: 'row', style: { marginBottom: '10px' } }, el('span', { html: logoSvg(40) }),
          el('div', {}, el('div', { style: { color: '#fff', fontWeight: 800, fontSize: '1.1rem' } }, 'Nidhi Kavach'), el('div', { lang: 'hi', style: { color: '#ffd3a6' } }, 'निधि कवच'))),
        el('p', { class: 'mb-0' }, t('footer.about_text'))),
      el('div', {}, el('h4', {}, t('footer.links')), el('ul', {},
        el('li', {}, el('a', { href: site('index.html') }, t('nav.home'))),
        el('li', {}, el('a', { href: site('verify.html') }, t('nav.verify'))),
        el('li', {}, el('a', { href: site('demo.html') }, t('nav.demo'))),
        el('li', {}, user ? el('a', { href: site(homeFor(user.role)) }, t('nav.dashboard')) : el('a', { href: site('login.html') }, t('nav.login'))))),
      el('div', {}, el('h4', {}, t('footer.innovations')), el('ul', {},
        el('li', {}, 'Bank-signed QR receipts (Ed25519)'),
        el('li', {}, 'Automatic receipt reading & tamper checks'),
        el('li', {}, 'Risk-ranked verification queue'),
        el('li', {}, 'Protection-gap dashboard'),
        el('li', {}, 'Hash-chained audit trail'))),
      el('div', {}, el('h4', {}, t('footer.help')), el('ul', {},
        el('li', {}, `${t('footer.helpdesk')}: helpdesk@nidhikavach.example`),
        el('li', {}, el('a', { href: apiDocs, target: '_blank', rel: 'noopener' }, 'API documentation (OpenAPI)')),
        el('li', {}, t('footer.accessibility'))))),
    el('div', { class: 'disclaimer' }, t('footer.disclaimer')),
    el('div', { class: 'f-bottom' },
      el('span', {}, `© ${year} Nidhi Kavach · SIH26265 prototype · v${(window.NK_CONFIG && window.NK_CONFIG.version) || '1.0.0'}`),
      el('span', {}, `${t('footer.updated')}: ${fmtDate(meta && meta.today)}`))));
}

/* ---------------------------------------------------------------- main entry */
function renderChrome() {
  const { user, meta, navKey, active } = state;
  const header = ensureSlot('nk-header', 'header', 'start');
  mount(header, el('a', { class: 'skip-link', href: '#main' }, t('top.skip')), topbar(), el('div', { class: 'nk-tricolor' }),
    brandbar(user, meta), navbar(navKey, active, user), ribbon(), wakeBanner());
  const main = document.getElementById('main') || document.querySelector('main');
  if (main && !main.id) main.id = 'main';
  if (main) main.setAttribute('tabindex', '-1');
  if (main && !document.getElementById('nk-pagehead')) main.before(el('div', { id: 'nk-pagehead' }));
  renderPageHead();
  const foot = ensureSlot('nk-footer', 'div', 'end');
  mount(foot, footer(user, meta));
  applyI18n(document);
}

function setFavicon() {
  if (document.querySelector('link[rel="icon"]')) return;
  const svg = logoSvg(64).replace('class="logo" ', 'xmlns="http://www.w3.org/2000/svg" ');
  document.head.appendChild(el('link', { rel: 'icon', href: `data:image/svg+xml,${encodeURIComponent(svg)}` }));
}

export async function initPage(opts = {}) {
  const { roles = null, active = '', nav, title, subtitle, breadcrumbs, actions } = opts;
  document.documentElement.lang = getLang();
  setFavicon();
  let user = null;
  let meta = null;
  const token = getToken();

  if (roles) {
    if (!token) {
      location.href = site(`login.html?next=${encodeURIComponent(currentRelativePath())}`);
      return halt();
    }
    const [me, m] = await Promise.all([
      api.get('/auth/me'),
      api.get('/meta', null, { noRedirect: true }).catch(() => null),
    ]);
    user = me;
    meta = m;
    if (user.role !== 'admin' && !roles.includes(user.role)) {
      location.href = site(homeFor(user.role));
      return halt();
    }
    updateStoredUser(user);
  } else {
    user = token ? getStoredUser() : null;
  }

  state = { user, meta, active, navKey: nav || navFor(user && user.role), title, subtitle, breadcrumbs, actions };
  renderChrome();
  onLang(() => renderChrome());
  // Public pages render at once (the hosted API may still be waking up) and fill the date chip later.
  const metaPromise = meta ? Promise.resolve(meta) : api.get('/meta', null, { noRedirect: true })
    .then((m) => { state.meta = m; renderChrome(); return m; })
    .catch(() => null);
  return { user, meta, metaPromise };
}

export { NAVS };
