/* ===== صور المجتمع (Supabase: دخول + رفع + إعجاب + إبلاغ) ===== */
const SB_URL = 'https://wwtxsbvnnizuwdyrqzkf.supabase.co';
const SB_KEY = 'sb_publishable_LT2tqeb-ZJyMk7vRqLv85A_g3MjSvex';
const ADMIN_EMAIL = 'osidy2010@gmail.com';
const CM_CATS = { nature: 'الطبيعة', castles: 'القلاع والحصون', beaches: 'الشواطئ', wadis: 'الوديان', villages: 'القرى' };

document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  if (!window.supabase) { $('cm-msg').textContent = 'تعذّر تحميل الخدمة. تأكد من الاتصال بالإنترنت.'; return; }
  const sb = window.supabase.createClient(SB_URL, SB_KEY);
  let me = null, photos = [], liked = new Set(), cat = '', reported = new Set();
  const isAdmin = () => !!me && (me.email || '').toLowerCase() === ADMIN_EMAIL;
  const pub = (p) => `${SB_URL}/storage/v1/object/public/photos/${p}`;
  const nameOf = (u) => (u.user_metadata && u.user_metadata.name) || (u.email || '').split('@')[0] || 'زائر';
  const ago = (t) => { const d = (Date.now() - new Date(t)) / 864e5; return d < 1 ? 'اليوم' : d < 2 ? 'أمس' : d < 30 ? `قبل ${Math.floor(d)} يوم` : new Date(t).toLocaleDateString('ar'); };
  const open = (d) => (d.showModal ? d.showModal() : d.setAttribute('open', ''));
  const errAr = (e) => {
    const m = (e && e.message || '').toLowerCase();
    if (m.includes('invalid login')) return 'الإيميل أو كلمة المرور غير صحيحة.';
    if (m.includes('already registered') || m.includes('already been registered')) return 'هذا الإيميل مسجّل. سجّل الدخول.';
    if (m.includes('password')) return 'كلمة المرور قصيرة (6 أحرف على الأقل).';
    if (m.includes('email') && m.includes('confirm')) return 'تحتاج تأكيد الإيميل أولًا.';
    if (m.includes('rate') || m.includes('limit')) return 'محاولات كثيرة. انتظر قليلًا.';
    return 'حصل خطأ. حاول مرة ثانية.';
  };

  /* ---------- الحساب ---------- */
  function renderUser() {
    $('cm-user').innerHTML = me
      ? `<span>أهلًا ${esc(nameOf(me))}${isAdmin() ? ' (مشرف)' : ''}</span> <button type="button" class="cm-link" id="cm-out">خروج</button>`
      : `<button type="button" class="cm-link" id="cm-in">تسجيل الدخول</button>`;
    const o = $('cm-out'); if (o) o.onclick = async () => { await sb.auth.signOut(); };
    const i = $('cm-in'); if (i) i.onclick = () => authDlg();
  }
  function authDlg(then) {
    const d = $('cm-auth'); let mode = 'in';
    const draw = () => {
      d.innerHTML = `<form class="up-form" id="au-f" method="dialog">
        <h3>${mode === 'in' ? 'تسجيل الدخول' : 'حساب جديد'}</h3>
        ${mode === 'up' ? '<label>الاسم الذي يظهر على صورك<input id="au-n" autocomplete="name" required></label>' : ''}
        <label>الإيميل<input id="au-e" type="email" dir="ltr" autocomplete="email" required></label>
        <label>كلمة المرور<input id="au-p" type="password" dir="ltr" minlength="6" autocomplete="${mode === 'in' ? 'current-password' : 'new-password'}" required></label>
        <p class="up-msg" id="au-m" aria-live="polite"></p>
        <div class="btn-row"><button class="btn" type="submit">${mode === 'in' ? 'دخول' : 'إنشاء الحساب'}</button><button class="btn light" type="button" id="au-x">إغلاق</button></div>
        <button class="cm-link" type="button" id="au-s">${mode === 'in' ? 'ما عندك حساب؟ سجّل الآن' : 'عندك حساب؟ سجّل الدخول'}</button>
      </form>`;
      d.querySelector('#au-x').onclick = () => d.close();
      d.querySelector('#au-s').onclick = () => { mode = mode === 'in' ? 'up' : 'in'; draw(); };
      d.querySelector('#au-f').onsubmit = async (e) => {
        e.preventDefault();
        const m = d.querySelector('#au-m'); m.className = 'up-msg'; m.textContent = 'لحظة…';
        const email = d.querySelector('#au-e').value.trim(), password = d.querySelector('#au-p').value;
        const r = mode === 'in'
          ? await sb.auth.signInWithPassword({ email, password })
          : await sb.auth.signUp({ email, password, options: { data: { name: d.querySelector('#au-n').value.trim() } } });
        if (r.error) { m.textContent = errAr(r.error); return; }
        if (!r.data.session) { m.textContent = 'تم إنشاء الحساب. سجّل الدخول الآن.'; mode = 'in'; return; }
        d.close(); if (then) then();
      };
    };
    draw(); open(d);
  }

  /* ---------- التحميل ---------- */
  async function load() {
    $('cm-msg').textContent = 'جارٍ التحميل…';
    const { data, error } = await sb.from('photos').select('*, likes(count)').order('created_at', { ascending: false }).limit(300);
    if (error) { $('cm-msg').textContent = 'تعذّر تحميل الصور.'; return; }
    photos = (data || []).map(p => ({ ...p, n: (p.likes && p.likes[0] && p.likes[0].count) || 0 }));
    liked = new Set();
    if (me) {
      const r = await sb.from('likes').select('photo_id').eq('user_id', me.id);
      (r.data || []).forEach(x => liked.add(x.photo_id));
    }
    $('cm-msg').textContent = '';
    render();
  }
  const norm = (s) => (s || '').toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  function render() {
    const q = norm($('cm-q').value.trim());
    let list = photos.filter(p => (!cat || p.category === cat) && (!q || norm(p.place + ' ' + p.caption + ' ' + p.user_name).includes(q)));
    if ($('cm-sort').value === 'likes') list = list.slice().sort((a, b) => b.n - a.n);
    $('cm-grid').innerHTML = list.map(p => `
      <button type="button" class="cm-card${p.hidden ? ' is-hidden' : ''}" data-id="${p.id}">
        <img loading="lazy" src="${pub(p.path)}" alt="${esc(p.place)}">
        <span class="cm-likes">${liked.has(p.id) ? '♥' : '♡'} ${p.n}</span>
        <span class="cm-cap"><b>${esc(p.place)}</b><small>${esc(p.user_name)}</small></span>
      </button>`).join('');
    if (!list.length) $('cm-msg').textContent = photos.length ? 'لا توجد نتائج.' : 'كن أول من يشارك صورة!';
    else $('cm-msg').textContent = '';
  }
  $('cm-cats').innerHTML = `<button class="chip on" data-c="">الكل</button>` + Object.entries(CM_CATS).map(([k, v]) => `<button class="chip" data-c="${k}">${v}</button>`).join('');
  $('cm-cats').onclick = (e) => { const b = e.target.closest('[data-c]'); if (!b) return; cat = b.dataset.c; $('cm-cats').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); render(); };
  $('cm-q').addEventListener('input', render); $('cm-sort').addEventListener('change', render);
  $('cm-grid').onclick = (e) => { const c = e.target.closest('.cm-card'); if (c) view(c.dataset.id); };

  /* ---------- عرض الصورة ---------- */
  function view(id) {
    const p = photos.find(x => x.id === id); if (!p) return;
    const d = $('cm-view');
    const mine = me && p.user_id === me.id;
    d.innerHTML = `<div class="cm-v">
      <img src="${pub(p.path)}" alt="${esc(p.place)}">
      <div class="cm-v-info">
        <h3>${esc(p.place)}${p.hidden ? ' <small>(مخفية)</small>' : ''}</h3>
        ${p.caption ? `<p>${esc(p.caption)}</p>` : ''}
        <p class="muted">${esc(p.user_name)} • ${ago(p.created_at)} • ${esc(CM_CATS[p.category] || '')}</p>
        <div class="btn-row">
          <button class="btn" id="v-like" type="button">${liked.has(p.id) ? '♥' : '♡'} <span id="v-n">${p.n}</span></button>
          ${mine || isAdmin() ? '<button class="btn light" id="v-del" type="button">حذف</button>' : ''}
          ${isAdmin() ? `<button class="btn light" id="v-hide" type="button">${p.hidden ? 'إظهار' : 'إخفاء'}</button>` : ''}
          ${!mine ? '<button class="btn light" id="v-rep" type="button">إبلاغ</button>' : ''}
          <button class="btn light" id="v-x" type="button">إغلاق</button>
        </div>
        <p class="up-msg" id="v-m" aria-live="polite"></p>
      </div></div>`;
    const m = (t, ok) => { const x = d.querySelector('#v-m'); x.textContent = t; x.className = 'up-msg' + (ok ? ' ok' : ''); };
    d.querySelector('#v-x').onclick = () => d.close();
    d.querySelector('#v-like').onclick = async () => {
      if (!me) { d.close(); authDlg(() => view(id)); return; }
      if (liked.has(id)) { await sb.from('likes').delete().eq('photo_id', id).eq('user_id', me.id); liked.delete(id); p.n--; }
      else { const r = await sb.from('likes').insert({ photo_id: id }); if (r.error) return m('تعذّر الإعجاب.'); liked.add(id); p.n++; }
      d.querySelector('#v-like').innerHTML = `${liked.has(id) ? '♥' : '♡'} <span>${p.n}</span>`; render();
    };
    const del = d.querySelector('#v-del');
    if (del) del.onclick = async () => {
      if (!confirm('حذف هذه الصورة؟')) return;
      await sb.storage.from('photos').remove([p.path]);
      const r = await sb.from('photos').delete().eq('id', id);
      if (r.error) return m('تعذّر الحذف.');
      photos = photos.filter(x => x.id !== id); d.close(); render();
    };
    const hide = d.querySelector('#v-hide');
    if (hide) hide.onclick = async () => {
      const r = await sb.from('photos').update({ hidden: !p.hidden }).eq('id', id);
      if (r.error) return m('تعذّر التحديث.'); p.hidden = !p.hidden; d.close(); render();
    };
    const rep = d.querySelector('#v-rep');
    if (rep) rep.onclick = async () => {
      if (!me) { d.close(); authDlg(() => view(id)); return; }
      const r = await sb.from('reports').insert({ photo_id: id });
      if (r.error && !/duplicate/i.test(r.error.message)) return m('تعذّر الإبلاغ.');
      m('وصلنا بلاغك، شكرًا لك.', true); rep.disabled = true;
    };
    open(d);
  }
  $('cm-view').addEventListener('click', (e) => { if (e.target === $('cm-view')) $('cm-view').close(); });

  /* ---------- إضافة صورة ---------- */
  async function shrink(f) {
    const bm = await createImageBitmap(f);
    const k = Math.min(1, 1600 / Math.max(bm.width, bm.height));
    const c = document.createElement('canvas'); c.width = Math.round(bm.width * k); c.height = Math.round(bm.height * k);
    c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height);
    return new Promise(r => c.toBlob(r, 'image/jpeg', 0.82));
  }
  function addDlg() {
    if (!me) { authDlg(addDlg); return; }
    const d = $('cm-up'); let file = null;
    d.innerHTML = `<form class="up-form" id="ad-f" method="dialog">
      <h3>أضف صورتك</h3>
      <label class="up-pick">اختر الصورة<input type="file" id="ad-file" accept="image/*"></label>
      <div class="up-prev" id="ad-prev"></div>
      <label>اسم المكان<input id="ad-place" required maxlength="80"></label>
      <label>وصف بسيط (اختياري)<input id="ad-cap" maxlength="200"></label>
      <label>التصنيف<select id="ad-cat">${Object.entries(CM_CATS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
      <p class="muted" style="font-size:.85rem">بنشر صورتك تؤكد أنها من تصويرك، وتظهر باسمك للجميع.</p>
      <p class="up-msg" id="ad-m" aria-live="polite"></p>
      <div class="btn-row"><button class="btn" type="submit" id="ad-go">نشر</button><button class="btn light" type="button" id="ad-x">إغلاق</button></div>
    </form>`;
    const msg = (t, ok) => { const x = d.querySelector('#ad-m'); x.textContent = t; x.className = 'up-msg' + (ok ? ' ok' : ''); };
    d.querySelector('#ad-x').onclick = () => d.close();
    d.querySelector('#ad-file').onchange = (e) => {
      file = e.target.files[0]; const pv = d.querySelector('#ad-prev'); pv.innerHTML = '';
      if (file) { const im = new Image(); im.src = URL.createObjectURL(file); im.alt = ''; pv.appendChild(im); }
      if (file && window.readPhotoGps && !d.querySelector('#ad-place').value) {
        window.readPhotoGps(file).then(g => { const h = g && window.nearestDestination && window.nearestDestination(g, 25); if (h && !d.querySelector('#ad-place').value) d.querySelector('#ad-place').value = h.dest.name; }).catch(() => {});
      }
    };
    d.querySelector('#ad-f').onsubmit = async (e) => {
      e.preventDefault();
      if (!file) return msg('اختر صورة.');
      const go = d.querySelector('#ad-go'); go.disabled = true; msg('جارٍ الرفع…', true);
      try {
        const blob = await shrink(file);
        const path = `${me.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const up = await sb.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
        if (up.error) throw up.error;
        const r = await sb.from('photos').insert({ user_name: nameOf(me), place: d.querySelector('#ad-place').value.trim(), caption: d.querySelector('#ad-cap').value.trim() || null, category: d.querySelector('#ad-cat').value, path });
        if (r.error) { await sb.storage.from('photos').remove([path]); throw r.error; }
        d.close(); load();
      } catch (er) { msg('تعذّر النشر. حاول مرة ثانية.'); go.disabled = false; }
    };
    open(d);
  }
  $('cm-add').onclick = addDlg;

  sb.auth.onAuthStateChange((_ev, s) => { me = s ? s.user : null; renderUser(); load(); });
  sb.auth.getSession().then(({ data }) => { me = data.session ? data.session.user : null; renderUser(); load(); });
});
