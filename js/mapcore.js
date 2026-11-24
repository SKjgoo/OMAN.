/* ============================================================
   أدوات الخريطة (Leaflet + OpenStreetMap)
   تحميله بعد leaflet.js و data.js و common.js
   ============================================================ */
const OMAN_BOUNDS = [[16.3, 51.8], [26.6, 60.0]];

/* مزوّدو الخرائط: إن فشل الأول (حجب أو شبكة) ننتقل تلقائياً للتالي */
const TILE_SOURCES = [
  { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', opt: { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">مساهمو OpenStreetMap</a>' } },
  { url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', opt: { maxZoom: 19, subdomains: 'abcd', attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>' } },
  { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', opt: { maxZoom: 18, attribution: 'Tiles © Esri' } }
];

function baseMap(elId, opts) {
  const map = L.map(elId, Object.assign({ scrollWheelZoom: false, zoomControl: true }, opts || {}));
  let idx = 0, layer = null, ok = 0, bad = 0, timer = null;
  function use(i) {
    if (layer) map.removeLayer(layer);
    idx = i; ok = 0; bad = 0;
    layer = L.tileLayer(TILE_SOURCES[i].url, TILE_SOURCES[i].opt).addTo(map);
    layer.on('tileload', () => { ok++; });
    layer.on('tileerror', () => {
      bad++;
      clearTimeout(timer);
      timer = setTimeout(() => { if (ok === 0 && bad >= 2 && idx < TILE_SOURCES.length - 1) use(idx + 1); }, 1500);
    });
  }
  use(0);
  /* الخريطة داخل حاوية كانت مخفية أو تغيّر حجمها: أعد الحساب */
  setTimeout(() => { try { map.invalidateSize(); } catch (e) { /* */ } }, 300);
  window.addEventListener('load', () => { try { map.invalidateSize(); } catch (e) { /* */ } });
  return map;
}

function pinIcon(cat) {
  return L.divIcon({
    className: 'pin-wrap',
    html: `<div class="pin pin-${cat}"></div>`,
    iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18]
  });
}

function popupHtml(d, opts) {
  const g = govById(d.gov);
  const hideMore = opts && opts.hideMore;
  return `
    <h4>${d.name}</h4>
    <p class="muted">محافظة ${g.name}</p>
    <p>${d.summary}</p>
    <div class="pop-actions">
      ${hideMore ? '' : `<a href="destination.html?id=${d.id}">التفاصيل</a>`}
      <a class="alt" href="${dirLink(d)}" target="_blank" rel="noopener">الاتجاهات إلى الموقع</a>
      ${d.vr ? `<a href="vr.html?id=${d.id}">جولة VR</a>` : ''}
    </div>`;
}

function addMarker(map, d, opts) {
  return L.marker([d.lat, d.lng], { icon: pinIcon(d.cat), title: d.name })
    .addTo(map)
    .bindPopup(popupHtml(d, opts), { maxWidth: 280 });
}
