/* ترجمة مدمجة للإنجليزية: تستبدل النصوص العربية بما يقابلها من القاموس (بدون خدمات خارجية) */
(function () {
  const D = window.I18N_DICT || {};
  const keys = Object.keys(D).sort((a, b) => b.length - a.length);
  if (!keys.length) return;
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
  const AR = /[؀-ۿ]/;
  const re = new RegExp('(?<![\\u0621-\\u063F\\u0641-\\u065F\\u0670-\\u06D3])(?:' + keys.map(esc).join('|') + ')(?![\\u0621-\\u063F\\u0641-\\u065F\\u0670-\\u06D3])', 'g');
  let LG = 'en'; try { LG = getLang(); } catch (e) { /* */ }
  const KEEP_AR = /^(ur|fa|ar)/.test(LG);                    /* هذه اللغات تكتب الفاصلة العربية */
  const COMMA = /^zh/.test(LG) ? '、' : ', ';
  const fixComma = (t) => (KEEP_AR ? t : t.replace(/\s*،\s*/g, COMMA));
  const tr = (s) => (s && AR.test(s)) ? fixComma(s.replace(re, (m) => D[m])) : s;
  const seen = new WeakMap();   /* ما أنتجته الترجمة: لا تُعاد ترجمته (مهم للأردو والفارسية بحرف عربي) */
  const ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'data-label', 'data-stop'];
  const skipEl = (el) => !el || (el.closest && el.closest('script,style,textarea,.lang-pick,[translate="no"]'));
  function node(n) {
    if (n.nodeType === 3) {
      if (n.parentNode && !skipEl(n.parentNode)) { if (seen.get(n) === n.nodeValue) return; const v = tr(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; seen.set(n, v); }
    } else if (n.nodeType === 1) {
      if (skipEl(n)) return;
      ATTRS.forEach((a) => { const v = n.getAttribute(a); if (v && AR.test(v)) { const k = seen.get(n) || {}; if (k[a] === v) return; const t = tr(v); if (t !== v) n.setAttribute(a, t); k[a] = t; seen.set(n, k); } });
      if (n.tagName === 'OPTION' || n.tagName === 'BUTTON' || n.tagName === 'INPUT') { /* handled via text/attrs */ }
      if (n.tagName === 'INPUT' && /^(button|submit)$/.test(n.type) && AR.test(n.value)) n.value = tr(n.value);
      n.childNodes.forEach(node);
    }
  }
  function all() {
    if (document.title && seen.get(document) !== document.title) { const t = tr(document.title); document.title = t; seen.set(document, t); }
    document.querySelectorAll('meta[name=description],meta[property="og:title"],meta[property="og:description"]').forEach((m) => { if (seen.get(m) === m.content) return; const t = tr(m.content); m.content = t; seen.set(m, t); });
    if (document.body) node(document.body);
  }
  let busy = false;
  const mo = new MutationObserver((list) => {
    if (busy) return; busy = true;
    list.forEach((r) => {
      if (r.type === 'childList') r.addedNodes.forEach(node);
      else if (r.type === 'characterData') node(r.target);
      else if (r.type === 'attributes') node(r.target);
    });
    busy = false;
  });
  mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  document.addEventListener('DOMContentLoaded', all);
  window.addEventListener('load', all);
  window.I18N = { tr, all };
})();
