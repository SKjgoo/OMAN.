/* عارض دوران الخنجر: لقطات حقيقية من المجسّم مرتّبة من الواجهة إلى الجانب، تُدار بالسحب. */
const KhanjarView = (() => {
  const N = 9, SRC = (i) => 'images/khanjar/k' + i + '.webp?v=1';
  function create(box) {
    box.classList.add('kh-view');
    box.innerHTML = '<div class="kh-shadow"></div>' + Array.from({ length: N }, (_, i) => '<img alt="" draggable="false" src="' + SRC(i) + '">').join('');
    const imgs = [...box.querySelectorAll('img')];
    let p = 0, dir = 1, drag = false, lx = 0, idle = 0, alive = true, raf = 0, last = 0;
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function show() {
      const i = Math.min(N - 2, Math.floor(p)), f = p - i;
      imgs.forEach((im, k) => { im.style.opacity = k === i ? 1 : k === i + 1 ? f : 0; });
    }
    function loop(t) {
      if (!alive) return;
      const dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
      if (!drag && !reduce) {
        idle += dt;
        if (idle > 2) { p += dir * dt * 0.9; if (p >= N - 1) { p = N - 1; dir = -1; } if (p <= 0) { p = 0; dir = 1; } }
      }
      show(); raf = requestAnimationFrame(loop);
    }
    box.addEventListener('pointerdown', (e) => { drag = true; lx = e.clientX; idle = 0; box.setPointerCapture && box.setPointerCapture(e.pointerId); });
    box.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const w = box.clientWidth || 300; p = Math.max(0, Math.min(N - 1, p + (lx - e.clientX) / w * (N - 1) * 1.4)); lx = e.clientX; idle = 0;
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
