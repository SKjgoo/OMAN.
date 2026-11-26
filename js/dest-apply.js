/* يطبّق تعديلات لوحة التحكم على DESTINATIONS (إضافة / تعديل / إخفاء) بعد data.js مباشرة */
(function () {
  try {
    var X = window.DEST_EXTRA; if (!X || typeof DESTINATIONS === 'undefined') return;
    var hide = X.hide || [], edit = X.edit || {};
    for (var i = DESTINATIONS.length - 1; i >= 0; i--) {
      var d = DESTINATIONS[i];
      if (hide.indexOf(d.id) > -1) { DESTINATIONS.splice(i, 1); continue; }
      if (edit[d.id]) Object.assign(d, edit[d.id]);
    }
    (X.add || []).forEach(function (n) {
      if (!n || !n.id || DESTINATIONS.some(function (d) { return d.id === n.id; })) return;
      n.desc = n.desc || []; n.highlights = n.highlights || []; n.tips = n.tips || [];
      n.bestTime = n.bestTime || ''; n.duration = n.duration || '';
      DESTINATIONS.push(n);
    });
  } catch (e) { if (window.console) console.warn('dest-apply', e); }
})();
