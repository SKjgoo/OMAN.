/* مقدمة قصيرة عند أول فتح للموقع (مرة واحدة في كل جلسة) */
(function () {
  try { if (sessionStorage.getItem('introSeen')) return; sessionStorage.setItem('introSeen', '1'); } catch (e) { /* */ }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var st = document.createElement('style');
  st.textContent = '#intro{position:fixed;inset:0;z-index:99999;background:linear-gradient(#8fc1ee,#e9f2fb);display:flex;align-items:center;justify-content:center;transition:opacity .6s ease}' +
    '#intro.out{opacity:0;pointer-events:none}#intro img{width:100%;height:100%;object-fit:contain;display:block}' +
    '#intro button{position:absolute;top:14px;inset-inline-end:14px;border:0;border-radius:20px;padding:6px 14px;background:rgba(0,0,0,.35);color:#fff;font:14px inherit;cursor:pointer}';
  document.head.appendChild(st);
  var box = document.createElement('div'); box.id = 'intro';
  var done = false;
  function close() { if (done) return; done = true; box.classList.add('out'); setTimeout(function () { box.remove(); }, 700); }
  var img = new Image(); img.alt = '';
  img.onload = function () {
    box.appendChild(img);
    var b = document.createElement('button'); b.textContent = 'تخطي'; b.onclick = close; box.appendChild(b);
    document.body.appendChild(box);
    setTimeout(close, 3400);
  };
  img.onerror = function () { /* بدون مقدمة */ };
  img.src = 'images/intro.gif?v=2';
  box.addEventListener('click', close);
})();
