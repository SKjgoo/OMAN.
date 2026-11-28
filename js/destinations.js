/* ===== صفحة الوجهات: بحث وفلترة ===== */
document.addEventListener('DOMContentLoaded', () => {
  const $q = document.getElementById('q');
  const $gov = document.getElementById('gov');
  const $vr = document.getElementById('vronly');
  const $cats = document.getElementById('cats');
  const $count = document.getElementById('count');
  const $res = document.getElementById('results');

  let activeCat = qs('cat') || '';

  $gov.innerHTML = '<option value="">كل المحافظات</option>' +
    GOVERNORATES.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
  if (qs('gov')) $gov.value = qs('gov');
  if (qs('q')) $q.value = qs('q');

  function renderChips() {
    $cats.innerHTML =
      `<button class="chip ${activeCat === '' ? 'on' : ''}" data-cat="">الكل</button>` +
      Object.entries(CATEGORIES).map(([k, c]) =>
        `<button class="chip ${activeCat === k ? 'on' : ''}" data-cat="${k}">${c.icon} ${c.label}</button>`).join('');
  }

  const normalize = (s) => (s || '').toString().toLowerCase()
    .replace(/[ً-ْـ]/g, '')   // إزالة التشكيل والتطويل
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

  const wideCard = (d) => `<a class="hm-card wide cat-${d.cat}" href="destination.html?id=${d.id}" data-img="images/${d.id}.jpg">${d.vr ? '<i class="vrb">VR 360°</i>' : ''}<b>${d.name}</b><span><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 00-7 7c0 5.300 7 13 7 13s7-7.700 7-13a7 7 0 00-7-7zm0 9.500A2.500 2.500 0 1112 6.500a2.500 2.500 0 010 5z"/></svg>${govById(d.gov).name}</span></a>`;
  function render() {
    const q = normalize($q.value.trim());
    const list = DESTINATIONS.filter(d => {
      if (activeCat && d.cat !== activeCat) return false;
      if ($gov.value && d.gov !== $gov.value) return false;
      if ($vr.checked && !d.vr) return false;
      if (q) {
        const hay = normalize([d.name, d.summary, d.desc.join(' '), govById(d.gov).name, CATEGORIES[d.cat].label].join(' '));
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    $count.textContent = `عدد النتائج: ${list.length}`;
    $res.innerHTML = list.length
      ? list.map(wideCard).join('')
      : '<div class="empty" style="grid-column:1/-1">لا توجد نتائج مطابقة. جرّب تغيير البحث أو الفلاتر.</div>';
    loadPhotos($res);
  }

  $cats.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    activeCat = b.dataset.cat;
    renderChips();
    render();
  });
  [$q, $gov, $vr].forEach(el => el.addEventListener('input', render));

  renderChips();
  render();
  if (qs('focus')) $q.focus();
});
