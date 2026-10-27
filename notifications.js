// Reference page: shows the standard page pattern (initPage -> load -> render, i18n extend, states, pagination).
import { initPage } from './assets/js/layout.js';
import { api, site } from './assets/js/api.js';
import { t, extend, onLang } from './assets/js/i18n.js';
import { $, $$, el, esc, icon, fmtDateTime, loading, emptyState, errorState, pagination, mount, toast } from './assets/js/ui.js';

extend({
  en: {
    'ntf.title': 'Notifications',
    'ntf.subtitle': 'Reminders, escalations and decisions sent to you by the portal',
    'ntf.unread': 'Unread',
    'ntf.mark_all': 'Mark all as read',
    'ntf.empty': 'You are all caught up',
    'ntf.empty_text': 'New reminders and decisions will appear here.',
    'ntf.level.critical': 'Critical',
    'ntf.level.warning': 'Warning',
    'ntf.level.info': 'Info',
  },
  hi: {
    'ntf.title': 'सूचनाएँ',
    'ntf.subtitle': 'पोर्टल द्वारा भेजे गए अनुस्मारक, एस्केलेशन और निर्णय',
    'ntf.unread': 'अपठित',
    'ntf.mark_all': 'सभी को पढ़ा हुआ चिह्नित करें',
    'ntf.empty': 'कोई नई सूचना नहीं',
    'ntf.empty_text': 'नए अनुस्मारक और निर्णय यहाँ दिखाई देंगे।',
    'ntf.level.critical': 'गंभीर',
    'ntf.level.warning': 'चेतावनी',
    'ntf.level.info': 'सूचना',
  },
});

await initPage({
  roles: ['officer', 'authority', 'admin', 'institution', 'bank'],
  active: 'notifications',
  title: 'ntf.title',
  subtitle: 'ntf.subtitle',
});

const listEl = $('#list');
const pagerEl = $('#pager');
const readAllBtn = $('#read-all');
const PAGE_SIZE = 20;
let filter = 'all';
let page = 1;
let last = null;

function levelIcon(level) {
  if (level === 'critical') return ['danger', 'alert-circle'];
  if (level === 'warning') return ['warning', 'alert'];
  return ['', 'bell'];
}

function render() {
  if (!last) return;
  readAllBtn.innerHTML = `${icon('check', 15)} ${esc(t('ntf.mark_all'))}`;
  readAllBtn.disabled = !last.unread;
  $$('[data-filter]').forEach((b) => b.classList.toggle('active', b.dataset.filter === filter));
  if (!last.items.length) {
    emptyState(listEl, { icon: 'bell', title: t('ntf.empty'), text: t('ntf.empty_text') });
    mount(pagerEl);
    return;
  }
  mount(listEl, last.items.map((n) => {
    const [tone, ic] = levelIcon(n.level);
    const item = el('div', { class: `list-item ${n.status === 'sent' ? 'unread' : ''}` },
      el('div', { class: `li-icon ${tone}`, html: icon(ic, 18) }),
      el('div', { class: 'li-main' },
        el('div', { class: 'li-title' }, n.subject),
        n.body ? el('div', { class: 'text-2 small' }, n.body) : null,
        el('div', { class: 'li-sub' }, `${fmtDateTime(n.created_at)} · ${t(`ntf.level.${n.level}`, { _default: n.level })}`)),
      el('div', { class: 'row nowrap' },
        n.link ? el('a', { class: 'btn sm secondary', href: site(n.link) }, t('common.open')) : null,
        n.status === 'sent' ? el('button', {
          class: 'btn sm ghost', type: 'button', title: 'Mark as read', html: icon('check', 15),
          onclick: async () => {
            await api.post(`/notifications/${n.id}/read`);
            window.dispatchEvent(new Event('nk:notifications-changed'));
            load();
          },
        }) : null));
    return item;
  }));
  pagination(pagerEl, { page, pageSize: PAGE_SIZE, total: last.total, onChange: (p) => { page = p; load(); } });
}

async function load() {
  loading(listEl);
  try {
    last = await api.get('/notifications', { unread: filter === 'unread' ? 1 : undefined, page, page_size: PAGE_SIZE });
    render();
  } catch (err) {
    errorState(listEl, err, load);
  }
}

$$('[data-filter]').forEach((b) => b.addEventListener('click', () => { filter = b.dataset.filter; page = 1; load(); }));
readAllBtn.addEventListener('click', async () => {
  await api.post('/notifications/read-all');
  window.dispatchEvent(new Event('nk:notifications-changed'));
  toast(t('common.saved'), 'success');
  load();
});
onLang(render);
load();
