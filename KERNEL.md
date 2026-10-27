# Frontend kernel reference (generated - read this instead of the kernel source)

Kernel files live in frontend/assets (css/theme.css, js/*.js). Import from pages with relative paths, e.g. `import { api, site } from '../assets/js/api.js'` in a subfolder page. Open a kernel file only when this reference is not enough (grep for the function name, read just that region).

## js/config.js
```js
```

## js/api.js
> API client. All calls go to `${apiBase}/api${path}`. Token = JWT in localStorage (Bearer header).
```js
export const siteBase = C.siteBase;
/** Absolute URL of a page/asset relative to the site root: site('officer/fdr.html?id=3'). */
export function site(path = '')
export function apiUrl(path, params)
export function getToken() { return store()?.getItem(TOKEN_KEY) || null; }
export function getStoredUser()
export function setSession(token, user)
export function updateStoredUser(user) { store()?.setItem(USER_KEY, JSON.stringify(user)); }
export function clearSession()
export class ApiError extends Error
/** Path of the current page relative to the site root, for ?next= redirects. */
export function currentRelativePath()
/**
* request(method, path, {params, body, form, responseType:'json'|'blob'|'text', noRedirect})
* - body  -> JSON;  form -> FormData (multipart)
* - 401   -> clears the session and redirects to login (unless noRedirect)
* - errors throw ApiError(status, message, data)
*/
export async function request(method, path, opts = {})
export const api = ...
export async function login(email, password)
export async function logout()
/** Landing page for a role, relative to the site root. */
export function homeFor(role)
```

## js/i18n.js
> English / Hindi strings. Pages add their own keys with extend({en:{...}, hi:{...}}). Markup: <span data-i18n="nav.dashboard">Dashboard</span>  (only on elements that contain plain text) <input data-i18n-placeholder="common.search">  data-i18n-title / data-i18n-aria likewise.
```js
export function getLang() { return lang; }
export function has(key) { return lookup(key) !== undefined; }
/** t('rel.in_days', {n: 5}) ; unknown key -> vars._default if given, else the key itself. */
export function t(key, vars)
/** Pick from a {en, hi} object (or return a plain string unchanged). */
export function tl(v)
export function extend(dicts)
export function apply(root = document)
export function setLang(l)
/** Call `fn(lang)` whenever the language changes (re-render JS-built content there). */
export function onLang(fn)
```

## js/ui.js
> UI helpers shared by every page. Keep pages thin: build DOM with el(), format with fmt*, show state with loading()/emptyState()/errorState(), tables with renderTable(), feedback with toast()/modal()/confirmDialog().
```js
/* ------------------------------------------------------------------ DOM */
export const $ = ...
export const $$ = ...
export function esc(s)
/** el('div', {class:'card', onclick: fn, html: '<b>raw</b>', dataset:{id:1}}, child1, 'text', [more]) */
export function el(tag, attrs = {}, ...children)
/** Element from an HTML string (single root). */
export function h(html)
export function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); return node; }
export function mount(node, ...children) { clear(node); appendChildren(node, children); return node; }
export function monthName(i, lang = getLang()) { return (MONTHS[lang] || MONTHS.en)[i]; }
/** Parse 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM:SS' WITHOUT timezone shifts (server sends IST wall-clock time). */
export function parseISO(s)
export function fmtDate(s)
export function fmtDateTime(s)
/** Days from a (to b), date-only. */
export function daysBetween(a, b)
/** 23 -> 'in 23 days', 0 -> 'today', -5 -> '5 days overdue' (or '5 days ago' with {past:'ago'}). */
export function relDays(n, opts = {})
/** ₹50,00,000 (Indian grouping). */
export function fmtINR(n)
/** ₹50 L / ₹1.25 Cr / ₹75,000 */
export function fmtINRShort(n)
export function fmtNum(n, digits = 0)
export function fmtPct(n, digits = 0)
export function fmtBytes(n)
export function initials(name = '')
/* ------------------------------------------------------------------ badges (return HTML strings) */
export function statusBadge(code)
export function releaseBadge(status)
export function trustBadge(level, flagged = false, opts = {})
export function riskBand(score)
export function riskBadge(score, band)
export function severityBadge(sev)
export function lienBadge(confirmed, claimed)
/** Days-to-maturity chip with colour. */
export function maturityChip(days)
export function toast(message, type = 'info', timeout = 4500)
/**
* modal({title, body: Node|string(html), size:'wide'|'xwide', actions:[{label, variant, onClick(close)->bool|Promise}], onClose})
* returns {close, root, body}. An action handler returning false keeps the modal open.
*/
export function modal({ title, body, size = '', actions = [], onClose, dismissible = true } = {})
export function confirmDialog(message, { title, confirmLabel, variant = 'primary' } = {})
/** Ask for text. Resolves the string, or null when cancelled. */
export function promptDialog({ title, label, placeholder = '', required = true, multiline = true, confirmLabel, variant = 'primary', value = '' } = {})
/** Put a button into a busy state while `fn` runs. */
export async function withBusy(btn, fn)
/* ------------------------------------------------------------------ states */
export function loading(container, text)
export function emptyState(container, { icon: ic = 'inbox', title, text, action } = {})
export function errorState(container, err, retry)
/**
* renderTable(container, {
*   columns: [{key, label, render(row)->html|Node, sortable, align:'right'|'center', width, className}],
*   rows, onRowClick(row), rowClass(row)->string, empty:{title,text,icon}, sort:{key,dir}, onSort(key,dir), compact
* })
*/
export function renderTable(container, opts)
/** Pagination footer. onChange(page). */
export function pagination(container, { page, pageSize, total, onChange })
/** tabs(container, [{key, label, count, render(panel)}], {active, onChange}) -> {select(key)} */
export function tabs(container, defs, { active, onChange } = {})
/** timeline(container, [{title, meta, body, tone:'success'|'danger'|'warning'|'muted'}]) */
export function timeline(container, items)
/** stepper(container, [{label, meta, state:'done'|'current'|'bad'|''}]) */
export function stepper(container, steps)
/** Definition grid: dl([['Label', value(html|Node)], ...], {cols:3}) -> Node */
export function dl(pairs, { cols = 2 } = {})
export function kpi({ label, value, sub, color = '', iconName, onClick, title })
/* ------------------------------------------------------------------ misc */
export function getParam(name) { return new URLSearchParams(location.search).get(name); }
export function setParams(obj, replace = true)
export function debounce(fn, ms = 300)
export function downloadBlob(blob, filename)
export function toCSV(columns, rows)
export async function copyText(text)
/** Read a <form> into a plain object (checkboxes -> boolean, number inputs -> number). */
export function formData(form)
export { icon };
```

## js/layout.js
> Page chrome: top bar (accessibility + language), brand bar, role navigation, prototype ribbon, page head, footer. Every page calls initPage() first: const { user, meta } = await initPage({ roles: ['officer','authority'], active: 'queue', title: 'nav.queue', subtitle: {en:'...', hi:'...'}, breadcrumbs: [{label:'nav.dashboard', href:'officer/dashboard.html'}, {label:'nav.queue'}], actions: someNode }); roles: null = public page. Labels accept an i18n key, an {en, hi} object or plain text. hrefs are site-relative.
```js
export function navFor(role)
export function setPageHead({ title, subtitle, breadcrumbs, actions } = {})
export async function initPage(opts = {})
export { NAVS };
```

## js/charts.js
> Chart helpers on top of Chart.js (load ../assets/vendor/chart.umd.min.js with a classic <script> first) plus a DOM calendar heatmap. Colours match theme.css.
```js
export const COLORS = ...
export const SERIES = ...
export const CATEGORY_COLORS = ...
export const TRUST_COLORS = ...
export const RISK_COLORS = ...
/** barChart(canvas, {labels, datasets:[{label, data, color}], horizontal, stacked, money, legend, onClick(index)}) */
export function barChart(canvas, { labels, datasets, horizontal = false, stacked = false, money = false, legend, onClick, maxBarThickness = 38 })
/** doughnutChart(canvas, {labels, data, colors, money, center:{value, label}, legend:'right'|'bottom', onClick(index)}) */
export function doughnutChart(canvas, { labels, data, colors, money = false, center, legend = 'right', onClick, cutout = '68%' })
/** lineChart(canvas, {labels, datasets:[{label, data, color, fill}], money}) */
export function lineChart(canvas, { labels, datasets, money = false, legend })
/**
* heatmap(container, {days:[{date, count, amount}], start:'YYYY-MM-DD', months:12, today:'YYYY-MM-DD', onClick(day)})
* Calendar of maturities: one block per month, one cell per day (Mon-Sun rows), colour by count.
*/
export function heatmap(container, { days = [], start, months = 12, today, onClick })
```

## js/icons.js
> Inline SVG icon set (24x24, stroke = currentColor). Usage: icon('shield', 18) -> SVG markup string.
```js
export function icon(name, size = 18, cls = '')
export function iconNames() { return Object.keys(P); }
// Brand mark: shield (navy) + saffron band + green tick + rupee. Used in header, login, favicon.
export function logoSvg(size = 56)
```

## css/theme.css - classes by section
Colours/spacing only via tokens (var(--nk-...)); token names are listed first.
Tokens: --nk-bg, --nk-border, --nk-border-strong, --nk-container, --nk-danger, --nk-danger-50, --nk-focus, --nk-font, --nk-green, --nk-gutter, --nk-info, --nk-info-50, --nk-link, --nk-mono, --nk-muted, --nk-navy, --nk-navy-2, --nk-orange, --nk-orange-50, --nk-primary, --nk-primary-100, --nk-primary-50, --nk-primary-600, --nk-primary-700, --nk-radius, --nk-radius-lg, --nk-radius-sm, --nk-saffron, --nk-saffron-50, --nk-saffron-600, --nk-shadow-1, --nk-shadow-2, --nk-shadow-3, --nk-slate, --nk-slate-50, --nk-success, --nk-success-50, --nk-surface, --nk-surface-2, --nk-teal, --nk-teal-50, --nk-text, --nk-text-2, --nk-violet, --nk-violet-50, --nk-warning, --nk-warning-50, --nk-warning-bd
- **GIGW-style high-contrast mode (toggled from the top bar)**: nk-contrast card kpi small muted text-2 mono num nowrap right hidden sr-only skip-link
- **layout chrome**: nk-container nk-topbar tb-left pill tb-right tb-sep tb-btn active nk-tricolor nk-brandbar nk-brand logo name en hi tag bb-divider bb-org l1 l2 l3 bb-right nk-simclock real nk-usermenu who n r avatar lg nk-bell count nk-nav nav-item icon nav-badge nav-toggle nav-items nk-prototype-ribbon nk-wake nk-pagehead subtitle ph-actions breadcrumb nk-main flush nk-footer f-grid f-bottom disclaimer
- **grid & spacing**: grid g-2 g-3 g-4 g-5 g-6 g-2-1 g-1-2 g-3-2 span-2 stack lg row between end nowrap grow mt-0 mb-0 section section-title
- **cards**: card card-head sub card-body flush card-foot accent-top accent-saffron accent-green accent-danger hoverable
- **KPI tiles**: kpi k-label k-value k-sub k-delta up clickable c-success c-teal c-saffron
- **Hero figure (e.g. protection gap)**: hero-figure hf-label hf-value hf-sub danger success
- **buttons**: btn disabled secondary active ghost success danger warning saffron outline-danger outline-success sm lg block icon-only spinner btn-group link-btn
- **forms**: form-grid cols-3 full field label req hint error input select textarea invalid autofilled sm input-icon icon input-group check filters dropzone over dz-icon
- **Smart search bar (natural language)**: smart-search ss-icon
- **badges & chips**: badge dot lg b-success st-active b-warning st-expiring b-danger st-matured st-rejected st-invoked b-info st-submitted b-violet st-under_verification b-orange st-discrepancy b-teal st-renewed b-primary st-release_requested b-slate st-released b-saffron
- **release stages**: rs-SUBMITTED rs-SCRUTINY rs-RECOMMENDED rs-APPROVED rs-RELEASED rs-RETURNED rs-REJECTED
- **trust ladder**: trust-0 trust-1 trust-2 trust-flag
- **risk / severity**: risk-low sev-low risk-medium sev-medium risk-high sev-high risk-critical sev-critical risk-score chip chips
- **tables**: table-wrap card table sortable sort-ind clickable row-danger row-warning num cell-main cell-sub compact table-footer pagination active
- **definition grid (label / value pairs)**: dl cols-3 cols-1
- **claimed vs document vs QR vs bank**: compare-table ok bad na
- **alerts / callouts**: alert icon a-title info success warning danger saffron
- **tabs**: tabs active count tab-panel
- **modal & toast**: modal-backdrop modal wide modal-head modal-body modal-foot modal-close toast-host toast success t-close
- **dropdown menu**: menu menu-sep menu-head
- **timeline & stepper**: timeline t-dot success t-title t-meta t-body stepper step s-circle s-label s-meta done current bad
- **trust ladder visual**: trust-ladder rung r-title on l0 l1 l2 current
- **meters**: meter warning lg gauge g-value
- **maturity heatmap (calendar)**: heatmap hm-month hm-title hm-grid hm-cell l1 past today hm-legend
- **states**: empty e-icon e-title spinner loading skeleton
- **misc components**: icon kbd code-box stat-inline v l list-plain list-divided list-item li-icon danger li-main li-title li-sub unread doc-frame feature-icon saffron tag-new verify-result valid invalid vr-head vr-icon chart-box
- **public landing helpers**: hero nk-container eyebrow lead
- **responsive**: grid g-6 g-5 g-4 nk-footer f-grid nk-brandbar bb-org bb-divider nk-nav nav-toggle nk-container nav-items open nav-item active g-2 g-3 g-2-1 g-1-2 g-3-2 span-2 span-3 form-grid cols-3 dl nk-usermenu who nk-simclock lbl nk-brand logo name en tag nk-topbar tb-left tb-text nk-pagehead hero-figure hf-value kpi k-value doc-frame modal-backdrop
- **print**: nk-topbar nk-nav nk-footer nk-prototype-ribbon nk-wake no-print toast-host ph-actions nk-bell nk-usermenu card kpi nk-pagehead

## Shared i18n keys (t('prefix.key')) - reuse these, add page keys with extend()
- **app**: name=Nidhi Kavach; name_hi=निधि कवच; tagline=Security Deposit & FDR Management Portal
- **org**: l1=Prototype for; l2=AICTE Regulation Bureau; l3=All India Council for Technical Educatio
- **top**: sih=SIH 2026; text=Smart India Hackathon 2026 prototype · P; skip=Skip to main content; font_dec=Decrease text size; font_reset=Reset text size; font_inc=Increase text size; contrast=High contrast
- **ribbon**: text=Prototype built for Smart India Hackatho
- **wake**: text=Connecting to the server… the free hosti
- **nav**: home=Home; verify=Verify FDR / NOC; how=How it works; demo=Demo guide; login=Sign in; dashboard=Dashboard; queue=Verification Queue; registry=FDR Registry; institutions=Institutions; releases=Release & Refund; alerts=Alerts; reports=Reports; analytics=Analytics; audit=Audit Trail; submit=Submit FDR; my_fdrs=My FDRs; notifications=Notifications; issue=Issue FDR; ledger=Deposit Ledger; users=Users; settings=Settings; menu=Menu
- **user**: signout=Sign out; notifications=Notifications; demo=Demo guide; signed_in_as=Signed in as
- **role**: admin=Administrator; officer=AICTE Officer; authority=Competent Authority; institution=Institution; bank=Bank Officer
- **clock**: demo_date=Demo date; simulated=Simulated date; real=Today
- **status**: submitted=Submitted; under_verification=Under verification; discrepancy=Discrepancy; active=Active; expiring=Expiring; matured=Matured; renewed=Renewed; release_requested=Release requested; released=Released; rejected=Rejected; invoked=Invoked
- **cat**: active=Active; expiring=Expiring (≤ 90 days); matured=Matured; renewed=Renewed; released=Released; pending=Pending action; rejected=Rejected / invoked
- **rtype**: release=Release; refund=Refund; discharge=Discharge
- **trust**: 0=Claimed; 1=Document matched; 2=Bank verified; 0.long=Claimed by institution; 1.long=Receipt matches the form; 2.long=Confirmed by the bank; flagged=Flagged
- **risk**: low=Low; medium=Medium; high=High; critical=Critical; label=Risk
- **sev**: low=Low; medium=Medium; high=High; critical=Critical
- **f**: ref_no=Reference; fdr_number=FDR number; institution=Institution; aicte_id=AICTE ID; bank=Bank; branch=Branch; ifsc=IFSC; amount=Amount; issue_date=Issue date; maturity_date=Maturity date; days_left=Days left; status=Status; trust=Trust level; risk=Risk; state=State; city=City; type=Type; depositor=Depositor; interest_rate=Interest rate; tenure=Tenure; purpose=Purpose; lien=Lien; submitted_at=Submitted; date=Date; actions=Actions; channel=Channel; recipient=Recipient; subject=Subject; severity=Severity; message=Message; note=Note; reason=Reason; stage=Stage; sla=SLA; required=Required; covered=Covered; shortfall=Shortfall
- **common**: search=Search; filters=Filters; clear=Clear; apply=Apply; all=All; view=View; open=Open; edit=Edit; save=Save; cancel=Cancel; close=Close; confirm=Confirm; submit=Submit; back=Back; next=Next; previous=Previous; download=Download; upload=Upload; print=Print; export_csv=Export CSV; refresh=Refresh; loading=Loading…; retry=Try again; no_records=No records found; no_records_hint=Try changing the filters.; error=Something went wrong; yes=Yes; no=No; unknown=Unknown; showing=Showing {from}–{to} of {total}; saved=Saved; copied=Copied; today=Today; details=Details; more=More; approve=Approve; reject=Reject; return=Return; marked=Marked; not_marked=Not marked; confirmed=Confirmed; not_checked=Not checked
- **rel**: today=today; tomorrow=tomorrow; yesterday=yesterday; in_days=in {n} days; days_ago={n} days ago; overdue={n} days overdue
- **unit**: lakh=L; crore=Cr
- **footer**: about=About the portal; about_text=Nidhi Kavach manages the complete lifecy; links=Quick links; help=Help; innovations=What is new; disclaimer=Prototype developed for Smart India Hack; updated=Last updated; helpdesk=Helpdesk (demo); accessibility=Accessibility: text size, high contrast 

## Page skeleton - copy frontend/notifications.html + notifications.js (small, complete example); frontend/styleguide.html shows the exact markup of every component.
