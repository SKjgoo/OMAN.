/* يطبّق تعديلات النصوص من لوحة التحكم (data/text-edits.js) على أي صفحة، حتى لو النص مولَّد بالجافاسكربت */
(function () {
  var E = window.TEXT_EDITS || {}, G = E.g || {};
  var page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
  var P = (E.p && E.p[page]) || {};
  if (!Object.keys(G).length && !Object.keys(P).length) return;
  var own = Object.prototype.hasOwnProperty;
  var SKIP = /^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/;
  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  function fix() {
    if (!document.body) return;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      var pe = n.parentNode, v = n.nodeValue;
      if (!pe || SKIP.test(pe.nodeName) || n.__n === v) continue;
      var k = norm(v); if (!k) continue;
      var to = own.call(P, k) ? P[k] : (own.call(G, k) ? G[k] : null);
      if (to === null) continue;
      var lead = v.match(/^\s*/)[0], tail = v.match(/\s*$/)[0];
      n.__o = k; n.__n = lead + to + tail; n.nodeValue = n.__n;
    }
  }
  var t = 0;
  function later() { if (t) return; t = setTimeout(function () { t = 0; fix(); }, 30); }
  function start() { fix(); try { new MutationObserver(later).observe(document.body, { childList: true, subtree: true, characterData: true }); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.addEventListener('load', fix);
})();
