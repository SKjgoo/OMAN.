/* يعرض برامج الرحلات من data/programs.json (يُحدَّث من لوحة التحكم admin.html) */
(function () {
  var grid = document.querySelector('.prog-grid'); if (!grid) return;
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function render(list) {
    if (!Array.isArray(list) || !list.length) return;
    grid.textContent = '';
    list.forEach(function (p) {
      var a = el('article', 'card prog-card');
      var h = el('h3', null, p.title || ''); if (p.women) { var b = el('span', 'prog-tag', 'للنساء والعائلات'); h.appendChild(document.createTextNode(' ')); h.appendChild(b); }
      a.appendChild(h);
      if (p.note) a.appendChild(el('p', 'muted', p.note));
      var t = el('table', 'table-x'), tb = el('tbody');
      (p.days || []).forEach(function (d) { var r = el('tr'), c1 = el('td'), bb = el('b', null, d.d || ''); c1.appendChild(bb); r.appendChild(c1); r.appendChild(el('td', null, d.t || '')); tb.appendChild(r); });
      t.appendChild(tb); a.appendChild(t); grid.appendChild(a);
    });
  }
  fetch('data/programs.json?t=' + Math.floor(Date.now() / 60000)).then(function (r) { return r.ok ? r.json() : null; }).then(render).catch(function () { /* يبقى المحتوى الثابت */ });
})();
