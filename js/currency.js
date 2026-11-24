/* محوّل العملات إلى الريال العُماني — يعمل بكل اللغات (النصوص هنا مدمجة، وأسماء العملات من Intl) */
(function () {
  var LB = {
    ar: ['محوّل العملات', 'المبلغ', 'من', 'إلى', 'تبديل الاتجاه', 'السعر', 'آخر تحديث', 'أسعار تقريبية (بدون اتصال)', 'إغلاق', 'ريال عُماني'],
    en: ['Currency converter', 'Amount', 'From', 'To', 'Swap', 'Rate', 'Updated', 'Approximate rates (offline)', 'Close', 'Omani rial'],
    de: ['Währungsrechner', 'Betrag', 'Von', 'Nach', 'Tauschen', 'Kurs', 'Aktualisiert', 'Ungefähre Kurse (offline)', 'Schließen', 'Omanischer Rial'],
    fr: ['Convertisseur de devises', 'Montant', 'De', 'Vers', 'Inverser', 'Taux', 'Mis à jour', 'Taux approximatifs (hors ligne)', 'Fermer', 'Rial omanais'],
    hi: ['मुद्रा परिवर्तक', 'राशि', 'से', 'में', 'उलटें', 'दर', 'अपडेट', 'अनुमानित दरें (ऑफ़लाइन)', 'बंद करें', 'ओमानी रियाल'],
    ru: ['Конвертер валют', 'Сумма', 'Из', 'В', 'Поменять', 'Курс', 'Обновлено', 'Примерный курс (офлайн)', 'Закрыть', 'Оманский риал'],
    ur: ['کرنسی کنورٹر', 'رقم', 'سے', 'میں', 'الٹ دیں', 'شرح', 'تازہ کاری', 'تقریباً شرحیں (آف لائن)', 'بند کریں', 'عمانی ریال'],
    'zh-CN': ['货币换算', '金额', '从', '到', '互换', '汇率', '更新于', '参考汇率（离线）', '关闭', '阿曼里亚尔'],
    es: ['Conversor de divisas', 'Importe', 'De', 'A', 'Invertir', 'Tipo', 'Actualizado', 'Tipos aproximados (sin conexión)', 'Cerrar', 'Rial omaní'],
    it: ['Convertitore di valute', 'Importo', 'Da', 'A', 'Inverti', 'Cambio', 'Aggiornato', 'Cambi approssimativi (offline)', 'Chiudi', 'Rial omanita'],
    tr: ['Para birimi çevirici', 'Tutar', 'Kaynak', 'Hedef', 'Yer değiştir', 'Kur', 'Güncelleme', 'Yaklaşık kurlar (çevrimdışı)', 'Kapat', 'Umman riyali'],
    id: ['Konverter mata uang', 'Jumlah', 'Dari', 'Ke', 'Tukar', 'Kurs', 'Diperbarui', 'Kurs perkiraan (offline)', 'Tutup', 'Rial Oman'],
    ja: ['通貨換算', '金額', '換算元', '換算先', '入れ替え', 'レート', '更新', '概算レート（オフライン）', '閉じる', 'オマーン・リアル'],
    ko: ['환율 계산기', '금액', '보내는 통화', '받는 통화', '바꾸기', '환율', '업데이트', '대략적인 환율(오프라인)', '닫기', '오만 리알'],
    bn: ['মুদ্রা রূপান্তর', 'পরিমাণ', 'থেকে', 'তে', 'অদলবদল', 'হার', 'আপডেট', 'আনুমানিক হার (অফলাইন)', 'বন্ধ', 'ওমানি রিয়াল'],
    ml: ['കറൻസി കൺവെർട്ടർ', 'തുക', 'നിന്ന്', 'ലേക്ക്', 'മാറ്റുക', 'നിരക്ക്', 'അപ്ഡേറ്റ്', 'ഏകദേശ നിരക്കുകൾ (ഓഫ്‌ലൈൻ)', 'അടയ്ക്കുക', 'ഒമാനി റിയാൽ'],
    fa: ['تبدیل ارز', 'مبلغ', 'از', 'به', 'جابه‌جایی', 'نرخ', 'به‌روزرسانی', 'نرخ تقریبی (آفلاین)', 'بستن', 'ریال عمان']
  };
  /* تقريبية: وحدات لكل 1 ريال عُماني (الريال مربوط بالدولار: 1 OMR = 2.6008 USD) */
  var FALL = { USD: 2.6008, EUR: 2.4, GBP: 2.05, AED: 9.55, SAR: 9.75, QAR: 9.47, KWD: 0.8, BHD: 0.98, JOD: 1.84, EGP: 125, INR: 220, PKR: 730, BDT: 315, LKR: 780, PHP: 150, IDR: 42000, MYR: 11, THB: 90, CNY: 18.5, JPY: 400, KRW: 3800, RUB: 210, TRY: 110, CAD: 3.6, AUD: 3.9, CHF: 2.1, IRR: 1090000, NPR: 350, ETB: 330 };
  var CODES = Object.keys(FALL);
  var DEF = { ar: 'SAR', en: 'USD', de: 'EUR', fr: 'EUR', hi: 'INR', ru: 'RUB', ur: 'PKR', 'zh-CN': 'CNY', es: 'EUR', it: 'EUR', tr: 'TRY', id: 'IDR', ja: 'JPY', ko: 'KRW', bn: 'BDT', ml: 'INR', fa: 'EUR' };
  var lang = 'ar'; try { lang = (typeof getLang === 'function' ? getLang() : localStorage.getItem('lang')) || 'ar'; } catch (e) { /* */ }
  var L = LB[lang] || LB.en;
  var rates = FALL, stamp = null, live = false;
  try { var c = JSON.parse(localStorage.getItem('fxCache') || 'null'); if (c && c.r && c.r.USD) { rates = c.r; stamp = c.t; live = true; } } catch (e) { /* */ }

  function name(code) {
    try { return new Intl.DisplayNames([lang === 'ar' ? 'ar' : lang], { type: 'currency' }).of(code); } catch (e) { return code; }
  }
  function fmt(n, max) {
    try { return new Intl.NumberFormat(lang === 'ar' ? 'ar-OM-u-nu-latn' : lang, { maximumFractionDigits: max }).format(n); } catch (e) { return String(n.toFixed(max)); }
  }
  function refresh() {
    if (stamp && Date.now() - stamp < 6 * 3600 * 1000) return;
    fetch('https://open.er-api.com/v6/latest/OMR').then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.rates && j.rates.USD) {
        var o = {}; CODES.forEach(function (k) { if (j.rates[k]) o[k] = j.rates[k]; });
        rates = Object.assign({}, FALL, o); stamp = Date.now(); live = true;
        try { localStorage.setItem('fxCache', JSON.stringify({ r: rates, t: stamp })); } catch (e) { /* */ }
        if (box) calc();
      }
    }).catch(function () { /* */ });
  }

  var box = null, amt, sel, out, info, dirOut = false; /* dirOut: من OMR إلى عملة */
  function open() {
    if (box) return;
    refresh();
    var dir = (lang === 'ar' || lang === 'ur' || lang === 'fa') ? 'rtl' : 'ltr';
    box = document.createElement('div'); box.className = 'fxw notranslate'; box.setAttribute('translate', 'no'); box.setAttribute('dir', dir);
    box.innerHTML = '<div class="fxc" role="dialog" aria-modal="true" aria-label="' + L[0] + '">' +
      '<button class="fxx" type="button" aria-label="' + L[8] + '">✕</button><h3>💱 ' + L[0] + '</h3>' +
      '<label>' + L[1] + '<input id="fx-amt" type="number" inputmode="decimal" min="0" step="any" value="100"></label>' +
      '<div class="fxrow"><label><span id="fx-l1">' + L[2] + '</span><select id="fx-sel"></select></label>' +
      '<button type="button" class="fxsw" id="fx-sw" aria-label="' + L[4] + '" title="' + L[4] + '">⇅</button></div>' +
      '<div class="fxres"><small id="fx-l2">' + L[3] + '</small><div id="fx-out" dir="ltr"></div></div>' +
      '<p class="fxinfo" id="fx-info"></p></div>';
    document.body.appendChild(box);
    amt = box.querySelector('#fx-amt'); sel = box.querySelector('#fx-sel'); out = box.querySelector('#fx-out'); info = box.querySelector('#fx-info');
    var d = DEF[lang] || 'USD';
    sel.innerHTML = CODES.map(function (k) { return '<option value="' + k + '"' + (k === d ? ' selected' : '') + '>' + k + ' — ' + name(k) + '</option>'; }).join('');
    amt.addEventListener('input', calc); sel.addEventListener('change', calc);
    box.querySelector('#fx-sw').addEventListener('click', function () { dirOut = !dirOut; calc(); });
    box.querySelector('.fxx').addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', esc);
    calc(); setTimeout(function () { amt.focus(); amt.select(); }, 50);
  }
  function esc(e) { if (e.key === 'Escape') close(); }
  function close() { if (box) { box.remove(); box = null; document.removeEventListener('keydown', esc); } }
  function calc() {
    var v = parseFloat(amt.value) || 0, k = sel.value, r = rates[k] || FALL[k];
    var l1 = box.querySelector('#fx-l1'), l2 = box.querySelector('#fx-l2');
    if (!dirOut) { /* العملة → ريال عُماني */
      l1.textContent = L[2]; l2.textContent = L[3] + ' · OMR — ' + L[9];
      out.textContent = fmt(v / r, 3) + ' OMR';
    } else { /* ريال عُماني → عملة */
      l1.textContent = L[3]; l2.textContent = L[2] + ' · OMR — ' + L[9];
      out.textContent = fmt(v * r, r > 500 ? 0 : 2) + ' ' + k;
    }
    var t = '1 OMR = ' + fmt(r, r > 500 ? 0 : 3) + ' ' + k;
    t += live && stamp ? ' · ' + L[6] + ': ' + new Date(stamp).toLocaleString(lang === 'ar' ? 'ar-OM-u-nu-latn' : lang) : ' · ' + L[7];
    info.textContent = t;
  }
  window.openCurrency = open;

  function mount() {
    document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-fx-open]'); if (b) { e.preventDefault(); open(); } });
    var rail = document.querySelector('#site-header .rail-spacer'); if (!rail) return;
    var a = document.createElement('button'); a.type = 'button'; a.className = 'rail-link fx-link notranslate'; a.setAttribute('translate', 'no');
    a.innerHTML = '<span aria-hidden="true">💱</span> ' + L[0]; a.setAttribute('data-fx-open', '');
    rail.parentNode.insertBefore(a, rail);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(mount, 0); }); else setTimeout(mount, 0);
})();
