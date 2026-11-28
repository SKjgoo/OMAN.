/* ===== الصفحة الرئيسية ===== */
document.addEventListener('DOMContentLoaded', () => {
  /* وجهات مميزة */
  const ids = ['nizwa', 'wadi-shab', 'musandam-fjords', 'jabal-shams', 'wahiba-sands', 'grand-mosque'];
  const box = document.getElementById('featured');
  box.innerHTML = ids.map(destById).filter(Boolean).map(d =>
    `<a class="hm-card cat-${d.cat}" href="destination.html?id=${d.id}" data-img="images/${d.id}.jpg">
      <b>${d.name}</b>
      <span><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 00-7 7c0 5.300 7 13 7 13s7-7.700 7-13a7 7 0 00-7-7zm0 9.500A2.500 2.500 0 1112 6.500a2.500 2.500 0 010 5z"/></svg>${govById(d.gov).name}</span>
    </a>`).join('');
  loadPhotos(box);

  /* زر المزيد يفتح القائمة الجانبية */
  const more = document.getElementById('bn-more');
  if (more) more.addEventListener('click', () => {
    const b = document.querySelector('.menu-btn');
    if (b && getComputedStyle(b).display !== 'none') b.click();
    else location.href = 'governorates.html';
  });

  /* أيقونة بحث في الشريط العلوي */
  const tb = document.querySelector('.topbar');
  if (tb) tb.insertAdjacentHTML('beforeend', '<a class="tb-search" href="destinations.html?focus=1" aria-label="بحث"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></a>');
});
