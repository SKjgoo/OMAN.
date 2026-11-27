/* عارض دوران الخنجر: لقطات حقيقية من المجسّم مرتّبة من الواجهة إلى الجانب، تُدار بالسحب. */
const KhanjarView = (() => {
  const N = 9, SRC = (i) => 'images/khanjar/k' + i + '.webp?v=1';
  function create(box) {
    box.classList.add('kh-view');
    box.innerHTML = '<div class="kh-shadow"></div>' + Array.from({ length: N }, (_, i) => '<img alt="" draggable="false" src="' + SRC(i) + '">').join('');
    const imgs = [...box.querySelectorAll('img')];
    let p = 0, tp = 0, vel = 0, dir = 1, drag = false, lx = 0, idle = 0, alive = true, raf = 0, last = 0;
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function show() {
      const i = Math.min(N - 2, Math.floor(p)), f = p - i;
      imgs.forEach((im, k) => { im.style.opacity = k === i ? 1 : k === i + 1 ? f : 0; });
    }
    function loop(t) {
      if (!alive) return;
      const dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
      if (!drag) {
        if (Math.abs(vel) > 0.01) { tp = Math.max(0, Math.min(N - 1, tp + vel * dt)); vel *= Math.pow(0.04, dt); }   // انزلاق بعد الرفع
        else if (!reduce) {
          idle += dt;
          if (idle > 2) { tp += dir * dt * 0.8; if (tp >= N - 1) { tp = N - 1; dir = -1; } if (tp <= 0) { tp = 0; dir = 1; } }
        }
      }
      p += (tp - p) * Math.min(1, dt * 14);                                                                     // تنعيم الحركة
      show(); raf = requestAnimationFrame(loop);
    }
    box.addEventListener('pointerdown', (e) => { drag = true; vel = 0; box._t = performance.now(); lx = e.clientX; idle = 0; box.setPointerCapture && box.setPointerCapture(e.pointerId); });
    box.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const w = box.clientWidth || 300, now = performance.now(), d = (lx - e.clientX) / w * (N - 1) * 1.4; tp = Math.max(0, Math.min(N - 1, tp + d)); vel = d / Math.max(0.008, (now - (box._t || now)) / 1000) * 0.6; box._t = now; lx = e.clientX; idle = 0;
      if (e.cancelable) e.preventDefault();
    });
    const up = () => { drag = false; idle = 0; };
    box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
    box.style.touchAction = 'pan-y';
    show(); raf = requestAnimationFrame(loop);
    return { stop() { alive = false; cancelAnimationFrame(raf); }, name: 'الخنجر العُماني' };
  }
  return { create };
})();
