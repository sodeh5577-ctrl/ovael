/* SAMO · OVAEL AI — interactive layer */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Progress bar ---------- */
  const progressBar = document.getElementById('progressBar');
  if (progressBar) {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      progressBar.style.width = pct + '%';
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Cursor glow ---------- */
  const glow = document.getElementById('cursorGlow');
  if (glow && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let cx = tx, cy = ty;
    document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
    const tick = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Letter-reveal stagger by group ---------- */
  const letterGroups = new Map();
  document.querySelectorAll('[data-letter-reveal]').forEach((el) => {
    const parent = el.closest('h1, h2, h3, .hero-title, .cta-title') || el.parentElement;
    if (!letterGroups.has(parent)) letterGroups.set(parent, []);
    letterGroups.get(parent).push(el);
  });
  letterGroups.forEach((letters) => {
    letters.forEach((l, i) => { l.style.transitionDelay = (i * 60) + 'ms'; });
  });

  /* ---------- Reveal observer ---------- */
  const revealEls = document.querySelectorAll('.reveal, [data-letter-reveal], [data-split-word]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        if (delay > 0) {
          setTimeout(() => el.classList.add('is-visible'), delay);
        } else {
          el.classList.add('is-visible');
        }
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Count-up ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (reduceMotion) { el.textContent = target.toLocaleString(); return; }
    const dur = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { runCounter(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Parallax (orb) ---------- */
  const orb = document.querySelector('.hero-orb');
  if (orb && !reduceMotion) {
    const onScroll = () => {
      const y = window.scrollY;
      orb.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
    };
    document.addEventListener('scroll', onScroll, { passive: true });
  }
})();
