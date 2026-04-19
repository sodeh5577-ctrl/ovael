(() => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* -------- Scroll progress bar -------- */
  const progressBar = document.getElementById("progressBar");
  const updateProgress = () => {
    const scrolled = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (scrolled / max) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* -------- Cursor glow -------- */
  const glow = document.getElementById("cursorGlow");
  if (glow && !prefersReducedMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    window.addEventListener("mousemove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });
    const tick = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* -------- Generic reveal -------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || "0", 10);
          setTimeout(() => entry.target.classList.add("is-visible"), delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* -------- Letter reveal (staggered) -------- */
  document.querySelectorAll("[data-letter-reveal]").forEach((letter, i) => {
    letter.style.transitionDelay = i * 80 + "ms";
  });
  // Group letters by their parent so each heading animates independently
  const letterGroups = new Map();
  document.querySelectorAll("[data-letter-reveal]").forEach((el) => {
    const parent = el.closest("h1, h2, h3, .hero-title, .contact-title") || el.parentElement;
    if (!letterGroups.has(parent)) letterGroups.set(parent, []);
    letterGroups.get(parent).push(el);
  });
  letterGroups.forEach((letters) => {
    letters.forEach((letter, i) => {
      letter.style.transitionDelay = i * 70 + "ms";
    });
  });
  const letterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          letterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  document
    .querySelectorAll("[data-letter-reveal]")
    .forEach((el) => letterObserver.observe(el));

  /* -------- Split-word text reveal (progressive) -------- */
  const splitContainers = document.querySelectorAll(".huge-text");
  splitContainers.forEach((container) => {
    const words = container.querySelectorAll("[data-split-word]");
    const reveal = () => {
      const rect = container.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const start = viewportH * 0.85;
      const end = viewportH * 0.25;
      const progress = Math.min(
        1,
        Math.max(0, (start - rect.top) / (start - end))
      );
      const visibleCount = Math.floor(progress * words.length);
      words.forEach((w, i) => {
        w.classList.toggle("is-visible", i < visibleCount);
      });
    };
    reveal();
    window.addEventListener("scroll", reveal, { passive: true });
    window.addEventListener("resize", reveal);
  });

  /* -------- Hero parallax -------- */
  const parallaxEls = document.querySelectorAll("[data-parallax]");
  const applyParallax = () => {
    const y = window.scrollY;
    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax || "0.2");
      el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
    });
  };
  window.addEventListener("scroll", applyParallax, { passive: true });

  /* -------- Rotating orb & ring (scroll-driven) -------- */
  const rotateEls = document.querySelectorAll("[data-rotate]");
  const rotateReverseEls = document.querySelectorAll("[data-rotate-reverse]");
  const pinnedSection = document.querySelector(".pinned-section");
  const applyRotation = () => {
    if (!pinnedSection) return;
    const rect = pinnedSection.getBoundingClientRect();
    const progress = Math.min(
      1,
      Math.max(0, -rect.top / (pinnedSection.offsetHeight - window.innerHeight))
    );
    const deg = progress * 360;
    rotateEls.forEach((el) => {
      el.style.transform = `rotate(${deg}deg) scale(${1 + progress * 0.25})`;
    });
    rotateReverseEls.forEach((el) => {
      el.style.transform = `rotate(${-deg * 1.5}deg)`;
    });
  };
  window.addEventListener("scroll", applyRotation, { passive: true });
  applyRotation();

  /* -------- Pinned panel activation -------- */
  const panels = document.querySelectorAll(".panel");
  const panelObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      });
    },
    { threshold: 0.55 }
  );
  panels.forEach((p) => panelObserver.observe(p));

  /* -------- Gallery hues -------- */
  document.querySelectorAll("[data-hue]").forEach((el) => {
    el.style.setProperty("--h", el.dataset.hue);
  });

  /* -------- Gallery scroll scale -------- */
  const galleryImages = document.querySelectorAll(".gallery-img");
  const applyGalleryScale = () => {
    galleryImages.forEach((img) => {
      const rect = img.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - viewportH / 2) / viewportH;
      const scale = Math.max(0.92, 1 - distance * 0.12);
      img.style.transform = `scale(${scale})`;
    });
  };
  window.addEventListener("scroll", applyGalleryScale, { passive: true });
  applyGalleryScale();

  /* -------- Count-up numbers -------- */
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => counterObserver.observe(c));
})();
