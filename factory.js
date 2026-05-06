/* HyperForge One — film page interactivity */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Film progress bar ---------- */
  const bar = document.getElementById('filmProgress');
  if (bar) {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = pct + '%';
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Reveal observer ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        if (delay) setTimeout(() => el.classList.add('is-visible'), delay);
        else el.classList.add('is-visible');
        io.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Count-up ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (reduce) { el.textContent = target.toLocaleString(); return; }
    const dur = 1800;
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
    }, { threshold: 0.45 });
    counters.forEach((c) => co.observe(c));
  }

  /* ---------- Master plan timeline scrubber ---------- */
  const timeline = document.getElementById('masterTimeline');
  const tlFill = document.getElementById('tlFill');
  const phases = Array.from(document.querySelectorAll('.tl-phase'));
  const mpBlocks = Array.from(document.querySelectorAll('.mp-block'));

  // Order: 2027 → 2028 → 2029 → 2030. The mp-block list assigns each block a year.
  const yearOrder = ['2027', '2028', '2029', '2030'];
  const phasePcts = [0, 0.33, 0.66, 1];

  if (timeline && tlFill) {
    const onScroll = () => {
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress: starts when timeline top reaches 70% viewport, ends when it reaches 20%.
      const start = vh * 0.7;
      const end = vh * 0.2;
      const span = start - end;
      const progress = Math.max(0, Math.min(1, (start - rect.top) / span));

      tlFill.style.width = (progress * 100) + '%';

      // Activate phases as the fill passes their position
      phases.forEach((p, i) => {
        const t = phasePcts[i] !== undefined ? phasePcts[i] : i / (phases.length - 1);
        if (progress >= t - 0.02) p.classList.add('is-active');
        else p.classList.remove('is-active');
      });

      // Light up mp-blocks based on which years are reached
      const reachedYears = new Set();
      phases.forEach((p, i) => {
        if (p.classList.contains('is-active')) {
          for (let j = 0; j <= i; j++) reachedYears.add(yearOrder[j]);
        }
      });
      mpBlocks.forEach((b) => {
        const y = b.dataset.y;
        b.classList.toggle('is-on', reachedYears.has(y));
      });
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }
})();
