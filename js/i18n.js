/* ترجمة مدمجة للإنجليزية: تستبدل النصوص العربية بما يقابلها من القاموس (بدون خدمات خارجية) */
(function () {
  const D = window.I18N_EN || {};
  const keys = Object.keys(D).sort((a, b) => b.length - a.length);
  if (!keys.length) return;
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
  const AR = /[؀-ۿ]/;
  const re = new RegExp('(?<![\\u0621-\\u063F\\u0641-\\u065F\\u0670-\\u06D3])(?:' + keys.map(esc).join('|') + ')(?![\\u0621-\\u063F\\u0641-\\u065F\\u0670-\\u06D3])', 'g');
  const tr = (s) => (s && AR.test(s)) ? s.replace(re, (m) => D[m]) : s;
  const ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'data-label', 'data-stop'];
  const skipEl = (el) => !el || (el.closest && el.closest('script,style,textarea,.lang-pick,[translate="no"]'));
  function node(n) {
    if (n.nodeType === 3) {
      if (n.parentNode && !skipEl(n.parentNode)) { const v = tr(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
    } else if (n.nodeType === 1) {
      if (skipEl(n)) return;
      ATTRS.forEach((a) => { const v = n.getAttribute(a); if (v && AR.test(v)) { const t = tr(v); if (t !== v) n.setAttribute(a, t); } });
      if (n.tagName === 'OPTION' || n.tagName === 'BUTTON' || n.tagName === 'INPUT') { /* handled via text/attrs */ }
      if (n.tagName === 'INPUT' && /^(button|submit)$/.test(n.type) && AR.test(n.value)) n.value = tr(n.value);
      n.childNodes.forEach(node);
    }
  }
  function all() {
    if (document.title) document.title = tr(document.title);
    document.querySelectorAll('meta[name=description],meta[property="og:title"],meta[property="og:description"]').forEach((m) => { m.content = tr(m.content); });
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
