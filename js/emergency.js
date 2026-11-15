/* ===== مساعد الطوارئ: تحديد الموقع ← المنطقة ← نوع الحالة ← خطوات + اتصال + مشاركة الموقع ===== */
(function () {
  'use strict';
  const EN = () => { try { return typeof getLang === 'function' && getLang() !== 'ar'; } catch (e) { return false; } };
  const T = (ar, en) => (EN() ? en : ar);
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const NUM = '9999';

  /* ---------- المحافظات ---------- */
  const GOV = {
    muscat: ['مسقط', 'Muscat'], dhofar: ['ظفار', 'Dhofar'], musandam: ['مسندم', 'Musandam'], buraimi: ['البريمي', 'Al Buraimi'],
    dakhiliyah: ['الداخلية', 'Ad Dakhiliyah'], 'north-batinah': ['شمال الباطنة', 'North Al Batinah'], 'south-batinah': ['جنوب الباطنة', 'South Al Batinah'],
    'north-sharqiyah': ['شمال الشرقية', 'North Ash Sharqiyah'], 'south-sharqiyah': ['جنوب الشرقية', 'South Ash Sharqiyah'],
    dhahirah: ['الظاهرة', 'Ad Dhahirah'], wusta: ['الوسطى', 'Al Wusta']
  };

  /* ---------- الولايات (إحداثيات تقريبية لأقرب ولاية؛ لا تُستخدم إلا لتحديد المنطقة) ---------- */
  const WIL = [
    ['مسقط', 'Muscat', 23.61, 58.59, 'muscat'], ['مطرح', 'Muttrah', 23.62, 58.57, 'muscat'], ['بوشر', 'Bawshar', 23.58, 58.40, 'muscat'],
    ['السيب', 'As Seeb', 23.67, 58.19, 'muscat'], ['العامرات', 'Al Amerat', 23.53, 58.50, 'muscat'], ['قريات', 'Quriyat', 23.26, 58.90, 'muscat'],
    ['صحار', 'Sohar', 24.35, 56.71, 'north-batinah'], ['شناص', 'Shinas', 24.74, 56.47, 'north-batinah'], ['لوى', 'Liwa', 24.53, 56.57, 'north-batinah'],
    ['صحم', 'Saham', 24.17, 56.88, 'north-batinah'], ['الخابورة', 'Al Khaburah', 23.97, 57.09, 'north-batinah'], ['السويق', 'As Suwayq', 23.85, 57.44, 'north-batinah'],
    ['الرستاق', 'Rustaq', 23.39, 57.42, 'south-batinah'], ['العوابي', 'Al Awabi', 23.30, 57.53, 'south-batinah'], ['نخل', 'Nakhal', 23.39, 57.83, 'south-batinah'],
    ['وادي المعاول', 'Wadi Al Maawil', 23.45, 57.63, 'south-batinah'], ['بركاء', 'Barka', 23.68, 57.89, 'south-batinah'], ['المصنعة', 'Al Musannah', 23.78, 57.64, 'south-batinah'],
    ['نزوى', 'Nizwa', 22.93, 57.53, 'dakhiliyah'], ['بهلاء', 'Bahla', 22.97, 57.30, 'dakhiliyah'], ['منح', 'Manah', 22.78, 57.54, 'dakhiliyah'],
    ['الحمراء', 'Al Hamra', 23.12, 57.29, 'dakhiliyah'], ['أدم', 'Adam', 22.38, 57.53, 'dakhiliyah'], ['إزكي', 'Izki', 22.93, 57.77, 'dakhiliyah'],
    ['سمائل', 'Samail', 23.30, 57.99, 'dakhiliyah'], ['بدبد', 'Bidbid', 23.41, 58.13, 'dakhiliyah'], ['الجبل الأخضر', 'Jabal Akhdar', 23.07, 57.64, 'dakhiliyah'],
    ['البريمي', 'Al Buraimi', 24.25, 55.79, 'buraimi'], ['محضة', 'Mahdah', 24.38, 55.95, 'buraimi'], ['السنينة', 'As Sunaynah', 24.17, 56.05, 'buraimi'],
    ['عبري', 'Ibri', 23.23, 56.52, 'dhahirah'], ['ينقل', 'Yanqul', 23.59, 56.54, 'dhahirah'], ['ضنك', 'Dank', 23.56, 56.25, 'dhahirah'],
    ['إبراء', 'Ibra', 22.69, 58.53, 'north-sharqiyah'], ['المضيبي', 'Al Mudhaibi', 22.58, 58.13, 'north-sharqiyah'], ['بدية', 'Bidiyah', 22.45, 58.80, 'north-sharqiyah'],
    ['القابل', 'Al Qabil', 22.57, 58.70, 'north-sharqiyah'], ['وادي بني خالد', 'Wadi Bani Khalid', 22.60, 59.03, 'north-sharqiyah'], ['دماء والطائيين', 'Dima Wa Al Taiyyin', 23.35, 58.70, 'north-sharqiyah'],
    ['صور', 'Sur', 22.57, 59.53, 'south-sharqiyah'], ['جعلان بني بو علي', 'Jalan Bani Bu Ali', 22.03, 59.33, 'south-sharqiyah'], ['الكامل والوافي', 'Al Kamil Wal Wafi', 22.20, 59.20, 'south-sharqiyah'],
    ['مصيرة', 'Masirah', 20.67, 58.90, 'south-sharqiyah'],
    ['هيما', 'Haima', 19.97, 56.28, 'wusta'], ['الدقم', 'Duqm', 19.67, 57.70, 'wusta'], ['محوت', 'Mahut', 20.42, 57.00, 'wusta'],
    ['صلالة', 'Salalah', 17.02, 54.09, 'dhofar'], ['طاقة', 'Taqah', 17.04, 54.40, 'dhofar'], ['مرباط', 'Mirbat', 16.99, 54.69, 'dhofar'],
    ['سدح', 'Sadah', 16.72, 55.03, 'dhofar'], ['رخيوت', 'Rakhyut', 16.75, 53.45, 'dhofar'], ['ضلكوت', 'Dhalkut', 16.70, 53.25, 'dhofar'],
    ['ثمريت', 'Thumrait', 17.67, 54.03, 'dhofar'], ['المزيونة', 'Al Mazyunah', 17.85, 52.65, 'dhofar'], ['مقشن', 'Muqshin', 19.40, 54.60, 'dhofar'],
    ['خصب', 'Khasab', 26.18, 56.25, 'musandam'], ['بخا', 'Bukha', 26.14, 56.14, 'musandam'], ['دبا', 'Dibba Al Baya', 25.62, 56.27, 'musandam'], ['مدحاء', 'Madha', 25.28, 56.33, 'musandam']
  ];

  /* ---------- مستشفيات كل محافظة (أسماء لبحث الخرائط؛ تحقّق من الجهة وساعات العمل) ---------- */
  const HOSP = {
    muscat: [['المستشفى السلطاني', 'Royal Hospital'], ['مستشفى خولة', 'Khoula Hospital'], ['مستشفى جامعة السلطان قابوس', 'Sultan Qaboos University Hospital'], ['مستشفى النهضة', 'Al Nahdha Hospital']],
    dhofar: [['مستشفى السلطان قابوس بصلالة', 'Sultan Qaboos Hospital, Salalah'], ['مستشفى طاقة', 'Taqah Hospital'], ['مستشفى مرباط', 'Mirbat Hospital']],
    musandam: [['مستشفى خصب', 'Khasab Hospital']],
    buraimi: [['مستشفى البريمي', 'Al Buraimi Hospital']],
    dakhiliyah: [['مستشفى نزوى', 'Nizwa Hospital'], ['مستشفى بهلاء', 'Bahla Hospital']],
    'north-batinah': [['مستشفى صحار', 'Sohar Hospital'], ['مستشفى شناص', 'Shinas Hospital'], ['مستشفى لوى', 'Liwa Hospital'], ['مستشفى صحم', 'Saham Hospital']],
    'south-batinah': [['مستشفى الرستاق', 'Rustaq Hospital'], ['مستشفى بركاء', 'Barka Hospital'], ['مستشفى المصنعة', 'Al Musannah Hospital']],
    'north-sharqiyah': [['مستشفى إبراء', 'Ibra Hospital'], ['مستشفى المضيبي', 'Al Mudhaibi Hospital']],
    'south-sharqiyah': [['مستشفى صور', 'Sur Hospital'], ['مستشفى جعلان بني بو علي', 'Jalan Bani Bu Ali Hospital'], ['مستشفى مصيرة', 'Masirah Hospital']],
    dhahirah: [['مستشفى عبري', 'Ibri Hospital'], ['مستشفى ينقل', 'Yanqul Hospital']],
    wusta: [['مستشفى هيما', 'Haima Hospital'], ['مستشفى الدقم', 'Duqm Hospital']]
  };

  /* ---------- أنواع الحالات ---------- */
  const TYPES = [
    {
      id: 'medical', ico: '✚', ar: 'حالة طبية', en: 'Medical emergency',
      near: [['مستشفى', 'Hospital'], ['صيدلية', 'Pharmacy']],
      steps: [
        ['اتصل بـ 9999 فورًا وقل: «حالة طبية»، وأعطِ موقعك وعدد المصابين.', 'Call 9999 now. Say "medical emergency", give your location and the number of patients.'],
        ['لا تحرّك المصاب إلا إذا كان في خطر مباشر (سيارة، نار، سيل)، خاصة مع الاشتباه بإصابة الرقبة أو الظهر.', 'Do not move the patient unless in immediate danger (traffic, fire, flood), especially with a suspected neck or back injury.'],
        ['إذا لا يستجيب ولا يتنفس طبيعيًا: اضغط بقوة وسرعة على منتصف الصدر (100–120 ضغطة في الدقيقة) حتى تصل الإسعاف.', 'If unresponsive and not breathing normally: push hard and fast on the centre of the chest (100–120 per minute) until help arrives.'],
        ['نزيف: اضغط مباشرة على الجرح بقماش نظيف ولا ترفعه لتتفقد.', 'Bleeding: press firmly on the wound with a clean cloth; do not lift it to check.'],
        ['ضربة شمس (حرارة عالية، دوخة، ارتباك، توقف التعرّق): انقله للظل، بلّل جسمه وروّحه، وأعطه رشفات ماء إن كان واعيًا.', 'Heat stroke (high temperature, dizziness, confusion, no sweating): move to shade, wet and fan the body, small sips of water if conscious.'],
        ['لدغة ثعبان أو عقرب: ابقَ هادئًا وساكنًا، أبقِ العضو بمستوى القلب أو أخفض، ولا تقطع الجرح ولا تمصّه، وتوجّه للمستشفى.', 'Snake or scorpion bite: stay calm and still, keep the limb at heart level or lower, do not cut or suck the wound, go to hospital.']
      ]
    },
    {
      id: 'traffic', ico: '🚗', ar: 'حادث سير', en: 'Road accident',
      near: [['مستشفى', 'Hospital'], ['مركز شرطة', 'Police station']],
      steps: [
        ['أوقف السيارة بأمان وشغّل الأضواء التحذيرية، وابتعد عن الطريق خلف الحاجز إن أمكن.', 'Stop safely, turn on hazard lights, and move away from the road behind a barrier if possible.'],
        ['اتصل بـ 9999 (الشرطة والإسعاف) وأعطِ الموقع والطريق واتجاه السير وعدد المصابين.', 'Call 9999 (police and ambulance). Give location, road, direction of travel and number of injured.'],
        ['لا تحرّك المصابين إلا لخطر مستمر مثل اشتعال النار.', 'Do not move the injured unless there is continuing danger such as fire.'],
        ['ضع المثلث العاكس خلف السيارة بمسافة كافية إن كان معك وكان الوقوف آمنًا.', 'Place the warning triangle well behind the car if you have one and it is safe to do so.'],
        ['صوّر المكان والسيارات والأضرار، واطلب تقرير الشرطة لأن شركة التأمين تطلبه عادة.', 'Photograph the scene, vehicles and damage, and ask for the police report; insurers normally require it.'],
        ['إذا كانت السيارة مستأجرة فبلّغ شركة التأجير.', 'If the car is rented, inform the rental company.']
      ]
    },
    {
      id: 'fire', ico: '🔥', ar: 'حريق', en: 'Fire',
      near: [['الدفاع المدني', 'Civil Defence'], ['مستشفى', 'Hospital']],
      steps: [
        ['ابتعد وأخرج الجميع فورًا، ولا ترجع لأخذ أي شيء.', 'Get everyone out and away at once. Do not go back for belongings.'],
        ['اتصل بـ 9999 (الدفاع المدني) وأعطِ الموقع بدقة.', 'Call 9999 (Civil Defence) and give the exact location.'],
        ['أغلق الأبواب خلفك لتبطئ انتشار النار، ولا تستخدم المصعد.', 'Close doors behind you to slow the fire. Do not use lifts.'],
        ['في الدخان: ازحف قرب الأرض وغطِّ أنفك وفمك بقماش مبلل.', 'In smoke: crawl low and cover your nose and mouth with a wet cloth.'],
        ['إذا اشتعلت ملابسك: توقف، استلقِ، وتدحرج.', 'If your clothes catch fire: stop, drop and roll.'],
        ['حريق صغير فقط: استخدم الطفاية بشرط أن يكون مخرجك خلفك. غير ذلك اخرج.', 'Small fire only: use an extinguisher with your exit behind you. Otherwise leave.'],
        ['حريق في البرية أو المخيم: ابتعد فورًا عن النار نحو مكان مكشوف خالٍ من النباتات وبلّغ.', 'Wild or camp fire: move away at once to open, bare ground away from vegetation, and report it.']
      ]
    },
    {
      id: 'lost', ico: '🧭', ar: 'تهت أو عالق (صحراء، جبل، وادي)', en: 'Lost or stuck (desert, mountain, wadi)',
      near: [['محطة وقود', 'Fuel station'], ['مركز شرطة', 'Police station']],
      steps: [
        ['أرسل موقعك الآن بالزر أدناه: الرسالة قد تُرسَل تلقائيًا عندما تلتقط إشارة.', 'Send your location now with the button below: the message may go out as soon as you catch a signal.'],
        ['اتصل بـ 9999. إن لم تجد شبكة فجرّب 112 فقد يعمل عبر أي شبكة متاحة.', 'Call 9999. With no network try 112; it can work over any available network.'],
        ['ابقَ قرب سيارتك (أسهل في العثور عليك) إلا إذا كان المكان خطرًا.', 'Stay near your vehicle (easier to find) unless the spot is dangerous.'],
        ['وفّر الماء، ابقَ في الظل، ولا تمشِ وقت الحر.', 'Ration water, stay in the shade, and do not walk in the heat.'],
        ['إشارة الاستغاثة المعروفة: ثلاث صفّارات أو ومضات أو أصوات متتالية، ثم انتظر.', 'Distress signal: three whistles, flashes or sounds in a row, then wait.'],
        ['سيارة عالقة في الرمل: لا تضغط على الوقود. خفّف ضغط الإطارات قليلًا وأزل الرمل أمام العجلات.', 'Stuck in sand: do not spin the wheels. Lower tyre pressure a little and clear sand in front of the wheels.'],
        ['سيل أو مطر في الجبال: اصعد لمكان مرتفع فورًا، ولا تعبر مجرى ماء يجري حتى لو بدا ضحلًا.', 'Flash flood or rain in the mountains: climb to high ground at once. Never cross running water, even if it looks shallow.']
      ]
    },
    {
      id: 'sea', ico: '🌊', ar: 'غرق أو مشكلة في البحر', en: 'Drowning or trouble at sea',
      near: [['مستشفى', 'Hospital'], ['مركز شرطة', 'Police station']],
      steps: [
        ['اتصل بـ 9999 وقل إنها حالة في البحر أو الشاطئ، وأعطِ موقعك.', 'Call 9999, say it is a sea or beach incident, and give your location.'],
        ['شخص يغرق: ارمِ له طوقًا أو حبلًا أو أي شيء يطفو، ولا تقفز بنفسك إلا إن كنت مدرّبًا.', 'Someone drowning: throw a ring, rope or anything that floats. Do not jump in unless trained.'],
        ['تيار الشاطئ يسحبك للخارج: لا تقاوم. اسبح موازيًا للشاطئ ثم عد، وارفع يدك واطلب المساعدة.', 'Caught in a rip current: do not fight it. Swim parallel to the shore, then back in; raise a hand and call for help.'],
        ['بعد إخراج الغريق: افتح مجرى التنفس، وإذا لا يتنفس فابدأ الإنعاش واستمر حتى وصول الإسعاف.', 'After rescue: open the airway; if not breathing begin resuscitation until help arrives.'],
        ['في الوديان والبرك: لا تقفز في ماء لا تعرف عمقه.', 'In wadis and pools: never jump into water of unknown depth.']
      ]
    },
    {
      id: 'police', ico: '🛡', ar: 'شرطة (سرقة، تهديد، فقدان أوراق)', en: 'Police (theft, threat, lost documents)',
      near: [['مركز شرطة', 'Police station']],
      steps: [
        ['اتصل بـ 9999 وأعطِ موقعك ووصفًا مختصرًا لما حدث.', 'Call 9999 with your location and a short description.'],
        ['انتقل لمكان آمن فيه ناس، ولا تواجه أو تطارد أحدًا.', 'Move somewhere safe with other people. Do not confront or chase anyone.'],
        ['اكتب ما تتذكره: الوقت، المكان، الأوصاف، وأرقام لوحات السيارات.', 'Write down what you remember: time, place, descriptions, number plates.'],
        ['فُقد جواز السفر: بلّغ الشرطة ثم سفارتك للحصول على وثيقة بديلة، واحتفظ بنسخة مصوّرة للجواز.', 'Lost passport: report to the police, then your embassy for a replacement; keep a photo copy of your passport.'],
        ['السرقة: اطلب محضر البلاغ لأن التأمين غالبًا يطلبه.', 'Theft: ask for the police report; travel insurance usually requires it.']
      ]
    }
  ];

  /* ---------- الحالة ---------- */
  const KEY = 'sosLast';
  let pos = null, region = null, manualGov = null, type = null, busy = false, root = null, lastFocus = null;

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function save(p) { try { localStorage.setItem(KEY, JSON.stringify({ lat: p.lat, lng: p.lng, acc: p.acc, ts: p.ts })); } catch (e) { /* */ } }

  const dist = (a, b) => (typeof distKm === 'function' ? distKm(a, b) : Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 100));
  function locate(p) {
    const inBox = p.lat > 16 && p.lat < 26.7 && p.lng > 51.5 && p.lng < 60.2;
    let best = null;
    WIL.forEach((w) => { const km = dist(p, { lat: w[2], lng: w[3] }); if (!best || km < best.km) best = { w, km }; });
    return { w: best.w, gov: best.w[4], km: best.km, outside: !inBox || best.km > 350 };
  }

  const gname = (id) => GOV[id] ? T(GOV[id][0], GOV[id][1]) : '';
  const wname = (w) => T(w[0], w[1]);
  const mapUrl = (p) => `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
  const nearUrl = (q, p) => `https://www.google.com/maps/search/${encodeURIComponent(q)}${p ? `/@${p.lat},${p.lng},13z` : ''}`;
  const ago = (ts) => { const m = Math.max(0, Math.round((Date.now() - ts) / 60000)); if (m < 1) return T('الآن', 'just now'); if (m < 60) return T(`قبل ${m} دقيقة`, `${m} min ago`); const h = Math.round(m / 60); return T(`قبل ${h} ساعة`, `${h} h ago`); };

  function message(p) {
    const ty = type ? type : null;
    const area = region ? `${region.w[0]} - ${GOV[region.gov][0]}` : (manualGov ? GOV[manualGov][0] : '');
    const areaEn = region ? `${region.w[1]} - ${GOV[region.gov][1]}` : (manualGov ? GOV[manualGov][1] : '');
    const loc = p ? `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)} (±${Math.round(p.acc || 0)} m) ${mapUrl(p)}` : '';
    return `🆘 ${ty ? ty.ar : 'طوارئ'}: أحتاج مساعدة.${area ? ' المنطقة: ' + area + '.' : ''}${loc ? ' موقعي: ' + loc : ''}\n` +
      `🆘 ${ty ? ty.en : 'Emergency'}: I need help.${areaEn ? ' Area: ' + areaEn + '.' : ''}${loc ? ' My location: ' + loc : ''}`;
  }

  /* ---------- العرض ---------- */
  function ensure() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'sosw'; root.hidden = true;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', T('مساعد الطوارئ', 'Emergency assistant'));
    root.innerHTML = '<div class="sosw-box"><button type="button" class="sosw-x" aria-label="' + T('إغلاق', 'Close') + '">✕</button><div class="sosw-body" tabindex="-1"></div></div>';
    document.body.appendChild(root);
    root.addEventListener('click', (e) => { if (e.target === root || e.target.closest('.sosw-x')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !root.hidden) close(); });
  }
  const body = () => root.querySelector('.sosw-body');

  function callBar() {
    return `<a class="sosw-call" href="tel:${NUM}" dir="ltr">📞 ${T('اتصل الآن', 'Call now')} ${NUM}</a>`;
  }

  function areaCard() {
    const govOpts = Object.keys(GOV).map((id) => `<option value="${id}" ${((region && region.gov) || manualGov) === id ? 'selected' : ''}>${esc(gname(id))}</option>`).join('');
    let h = '<div class="sosw-area">';
    if (pos && region) {
      h += region.outside
        ? `<p><b>${T('يبدو أنك خارج السلطنة، أو أن الإشارة غير دقيقة.', 'You seem to be outside Oman, or the signal is inaccurate.')}</b></p>`
        : `<p>${T('أنت الآن في', 'You are in')} <b>${esc(gname(region.gov))}</b> · ${T('قرب ولاية', 'near')} <b>${esc(wname(region.w))}</b></p>`;
      h += `<p class="sosw-coords" dir="ltr">${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)} · ±${Math.round(pos.acc || 0)} m${pos.cached ? ' · ' + ago(pos.ts) : ''}</p>`;
      if (pos.cached) h += `<p class="sosw-warn">${T('هذا آخر موقع محفوظ وليس موقعك الحالي.', 'This is your last saved position, not your current one.')}</p>`;
    } else if (manualGov) {
      h += `<p>${T('المنطقة المختارة:', 'Selected area:')} <b>${esc(gname(manualGov))}</b></p>`;
    }
    h += `<label class="sosw-sel">${T('غيّر المحافظة يدويًا', 'Choose governorate manually')} <select id="sosw-gov"><option value="">—</option>${govOpts}</select></label>`;
    h += '</div>';
    return h;
  }

  function viewHome(status) {
    const b = body();
    let h = `<h2>${T('مساعد الطوارئ', 'Emergency assistant')}</h2>${callBar()}`;
    h += `<p class="sosw-note">${T('في الخطر الحقيقي اتصل أولًا. هذا المساعد يجهّز لك الموقع والخطوات.', 'In real danger call first. This assistant prepares your location and the steps.')}</p>`;
    if (status === 'busy') h += `<p class="sosw-status">${T('جارٍ تحديد موقعك…', 'Finding your location…')}</p>`;
    else if (status) h += `<p class="sosw-warn">${esc(status)}</p>`;
    h += areaCard();
    h += `<div class="sosw-actions"><button type="button" class="btn small" id="sosw-loc">${T('حدّد موقعي', 'Locate me')}</button></div>`;
    h += `<h3>${T('ما نوع الحالة؟', 'What kind of emergency?')}</h3><div class="sosw-types">` +
      TYPES.map((t) => `<button type="button" class="sosw-type" data-t="${t.id}"><span class="sosw-ti">${t.ico}</span><span>${esc(T(t.ar, t.en))}</span></button>`).join('') + '</div>';
    b.innerHTML = h;
    b.querySelector('#sosw-loc').addEventListener('click', () => start(true));
    const sel = b.querySelector('#sosw-gov');
    sel.addEventListener('change', () => { manualGov = sel.value || null; if (manualGov && !pos) region = null; viewHome(); });
    b.querySelectorAll('.sosw-type').forEach((x) => x.addEventListener('click', () => { type = TYPES.find((t) => t.id === x.dataset.t); viewType(); }));
  }

  function viewType() {
    const b = body(), p = pos;
    const govId = (region && !region.outside && region.gov) || manualGov;
    let h = `<button type="button" class="sosw-back" id="sosw-back">${T('← رجوع', '← Back')}</button>`;
    h += `<h2>${type.ico} ${esc(T(type.ar, type.en))}</h2>${callBar()}`;
    if (govId) h += `<p class="sosw-area-line">${T('المنطقة:', 'Area:')} <b>${esc(gname(govId))}</b>${region && !region.outside && p ? ' · ' + esc(wname(region.w)) : ''}</p>`;
    h += `<h3>${T('افعل الآن', 'Do this now')}</h3><ol class="sosw-steps">${type.steps.map((s) => `<li>${esc(T(s[0], s[1]))}</li>`).join('')}</ol>`;
    /* مشاركة الموقع */
    const msg = message(p);
    h += `<h3>${T('أرسل موقعك', 'Send your location')}</h3>`;
    if (p) {
      h += `<div class="sosw-actions">
        <a class="btn small" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${T('واتساب', 'WhatsApp')}</a>
        <a class="btn small light" href="sms:?&body=${encodeURIComponent(msg)}">${T('رسالة نصية', 'SMS')}</a>
        <button type="button" class="btn small light" id="sosw-copy">${T('انسخ', 'Copy')}</button>
        ${navigator.share ? `<button type="button" class="btn small light" id="sosw-share">${T('مشاركة', 'Share')}</button>` : ''}
        <a class="btn small dark" href="${mapUrl(p)}" target="_blank" rel="noopener">${T('افتح في الخرائط', 'Open in Maps')}</a></div>
        <pre class="sosw-msg" dir="auto">${esc(msg)}</pre>`;
    } else {
      h += `<p class="sosw-warn">${T('لم نحصل على موقعك بعد. اضغط «حدّد موقعي» ثم أعد المحاولة، أو اذكر المنطقة للمُبلَّغ.', 'No position yet. Tap "Locate me", or tell the operator your area.')}</p>
        <div class="sosw-actions"><button type="button" class="btn small" id="sosw-loc2">${T('حدّد موقعي', 'Locate me')}</button></div>`;
    }
    /* أقرب الخدمات */
    h += `<h3>${T('أقرب الخدمات', 'Nearest services')}</h3><div class="sosw-actions">` +
      type.near.map((n) => `<a class="btn small light" href="${nearUrl(T(n[0], n[1]), p)}" target="_blank" rel="noopener">${esc(T(n[0], n[1]))}</a>`).join('') + '</div>';
    if (!p) h += `<p class="sosw-note">${T('بدون موقع، تُفتح الخرائط للبحث العام.', 'Without a position, Maps opens a general search.')}</p>`;
    /* مستشفيات المحافظة */
    if ((type.id === 'medical' || type.id === 'traffic' || type.id === 'sea') && govId && HOSP[govId]) {
      h += `<h3>${T('مستشفيات في', 'Hospitals in')} ${esc(gname(govId))}</h3><div class="sosw-hosp">` +
        HOSP[govId].map((x) => `<a href="${nearUrl(T(x[0], x[1]) + ' ' + T('عُمان', 'Oman'))}" target="_blank" rel="noopener">${esc(T(x[0], x[1]))}</a>`).join('') + '</div>' +
        `<p class="sosw-note">${T('الأسماء للتعريف؛ للحالات الحرجة اتصل بـ 9999 ولا تنتظر.', 'Names are for reference; in critical cases call 9999 and do not wait.')}</p>`;
    }
    h += `<p class="sosw-note">${T('المعلومات إرشادية ولا تغني عن تعليمات الجهات الرسمية.', 'Guidance only; it does not replace official instructions.')}</p>`;
    b.innerHTML = h;
    b.querySelector('#sosw-back').addEventListener('click', () => { type = null; viewHome(); });
    const l2 = b.querySelector('#sosw-loc2'); if (l2) l2.addEventListener('click', () => start(true, true));
    const cp = b.querySelector('#sosw-copy');
    if (cp) cp.addEventListener('click', async (e) => { try { await navigator.clipboard.writeText(msg); e.target.textContent = T('تم النسخ', 'Copied'); } catch (x) { e.target.textContent = T('انسخ النص يدويًا', 'Copy the text manually'); } });
    const sh = b.querySelector('#sosw-share'); if (sh) sh.addEventListener('click', () => navigator.share({ title: T('طوارئ', 'Emergency'), text: msg }).catch(() => {}));
    b.scrollTop = 0;
  }

  /* ---------- تحديد الموقع ---------- */
  const ERR = {
    1: ['لم تسمح للموقع بتحديد موقعك. فعّل إذن الموقع للمتصفح، أو اختر المحافظة يدويًا.', 'Location permission was denied. Allow it in your browser settings, or choose the governorate manually.'],
    2: ['تعذّر تحديد موقعك. اخرج لمكان مكشوف للسماء، أو اختر المحافظة يدويًا.', 'Could not find your position. Go somewhere with open sky, or choose the governorate manually.'],
    3: ['انتهت مهلة تحديد الموقع. حاول مجددًا أو اختر المحافظة يدويًا.', 'Location timed out. Try again or choose the governorate manually.']
  };
  function setPos(r) {
    pos = { lat: r.coords.latitude, lng: r.coords.longitude, acc: r.coords.accuracy, ts: Date.now() };
    save(pos); region = locate(pos); manualGov = null; busy = false;
  }
  function start(force, stayType) {
    if (busy) return;
    const again = () => (stayType && type ? viewType() : viewHome());
    if (!navigator.geolocation) { viewHome(T('متصفحك لا يدعم تحديد الموقع. اختر المحافظة يدويًا.', 'Your browser has no location support. Choose the governorate manually.')); return; }
    busy = true; viewHome('busy');
    const fail = (e) => {
      busy = false;
      const c = ERR[e && e.code] || ERR[2];
      const last = load();
      if (last && Date.now() - last.ts < 24 * 3600 * 1000) { pos = { lat: last.lat, lng: last.lng, acc: last.acc, ts: last.ts, cached: true }; region = locate(pos); }
      stayType && type ? viewType() : viewHome(T(c[0], c[1]));
    };
    navigator.geolocation.getCurrentPosition((r) => { setPos(r); again(); },
      (e) => {
        if (e && e.code === 1) return fail(e);
        navigator.geolocation.getCurrentPosition((r) => { setPos(r); again(); }, fail, { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 });
      }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  }

  /* ---------- فتح وإغلاق ---------- */
  function open() {
    ensure(); lastFocus = document.activeElement;
    root.hidden = false; document.documentElement.classList.add('sosw-lock');
    type = null; pos = null; region = null; busy = false;
    viewHome('busy'); busy = false; start(true);
    setTimeout(() => { const x = root.querySelector('.sosw-x'); if (x) x.focus(); }, 50);
  }
  function close() {
    if (!root) return; root.hidden = true; document.documentElement.classList.remove('sosw-lock');
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) { /* */ }
  }

  function init() {
    if (document.getElementById('sos-fab')) return;
    const f = document.createElement('button');
    f.type = 'button'; f.id = 'sos-fab'; f.className = 'sos-fab'; f.setAttribute('aria-label', T('طوارئ', 'Emergency'));
    f.innerHTML = `<span class="sos-fab-t">SOS</span><span class="sos-fab-s">${T('طوارئ', 'Emergency')}</span>`;
    f.addEventListener('click', open);
    document.body.appendChild(f);
    document.querySelectorAll('[data-sos-open]').forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); open(); }));
    if (/[?&]sos=1\b/.test(location.search)) open();
  }
  window.SOSAssistant = { open, close };
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
