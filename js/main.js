/* ==========================================================
   EB DIAMOND — main.js
   1. Page-load sequence        5. Filters + product cards
   2. Navbar / back-to-top      6. Lightbox (angles of one piece)
   3. Scroll-fill text          7. Small helpers
   4. Parallax + reveal
   ========================================================== */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- PRODUCT DATA ----------
     To add a new piece: add one object here and drop the photos into
     images/ (full size) and images/thumbs/ (small, ~640px wide).
     `images` = every angle of the SAME piece. First one is the cover.
     cats: 'rings' | 'pendants' | 'engraving'                      */
  const PRODUCTS = [
    {
      id: 'radiant-engraved',
      title: 'Radiant solitaire, hand-engraved',
      cats: ['rings', 'engraving'],
      desc: 'A radiant-cut centre stone on a yellow gold band, with floral scrollwork engraved by hand along the shank.',
      images: ['radiant-engraved-front.jpg', 'radiant-engraved-side.jpg', 'radiant-engraved-end.jpg', 'radiant-engraved-top.jpg']
    },
    {
      id: 'lighter-case',
      title: 'Hand-engraved silver lighter case',
      cats: ['engraving'],
      desc: 'Leaf scrollwork cut by hand on a textured ground, with a faceted medallion at the centre. Front, back and in use.',
      images: ['lighter-front-1.jpg', 'lighter-back.jpg', 'lighter-front-2.jpg', 'lighter-lit.jpg']
    },
    {
      id: 'marquise-wave',
      title: 'Marquise solitaire, wave engraving',
      cats: ['rings', 'engraving'],
      desc: 'A marquise stone in a six-prong setting, with flowing wave engraving along the yellow gold band.',
      images: ['marquise-wave-front.jpg', 'marquise-wave-side.jpg']
    },
    {
      id: 'marquise-leaf',
      title: 'Marquise ring, leaf engraving',
      cats: ['rings', 'engraving'],
      desc: 'A hand-engraved leaf pattern runs up the shoulders into a sculpted, petal-shaped basket setting.',
      images: ['marquise-leaf-side.jpg', 'marquise-leaf-back.jpg']
    },
    {
      id: 'oval-solitaire',
      title: 'Oval solitaire, yellow gold',
      cats: ['rings'],
      desc: 'A clean oval solitaire on a slim yellow gold band, held by fine prongs.',
      images: ['oval-solitaire-gold.jpg']
    },
    {
      id: 'oval-marquise',
      title: 'Oval ring with marquise accents',
      cats: ['rings'],
      desc: 'An oval centre stone with marquise-cut accent stones set along the shoulders.',
      images: ['oval-marquise-accents-ring.jpg']
    },
    {
      id: 'marquise-band',
      title: 'Marquise ring on a stone-set band',
      cats: ['rings'],
      desc: 'A marquise centre stone on a yellow gold band set with round stones all the way around.',
      images: ['marquise-gold-band-ring.jpg']
    },
    {
      id: 'radiant-pave',
      title: 'Radiant ring with pavé band',
      cats: ['rings'],
      desc: 'A radiant-cut centre stone on a pavé-set band.',
      images: ['radiant-pave-ring.jpg']
    },
    {
      id: 'emerald-pave',
      title: 'Emerald-cut ring with pavé band',
      cats: ['rings'],
      desc: 'A step-cut centre stone held by four claws, on a fine pavé-set band.',
      images: ['emerald-cut-pave-ring.jpg']
    },
    {
      id: 'green-halo',
      title: 'Green stone ring with double halo',
      cats: ['rings'],
      desc: 'A green cushion-cut centre stone surrounded by two rows of round stones.',
      images: ['green-halo-ring.jpg']
    },
    {
      id: 'cross-pendant',
      title: 'Cross pendant, pavé set',
      cats: ['pendants'],
      desc: 'A yellow gold cross pendant with a pavé-set centre and a matching pavé bail.',
      images: ['cross-pendant.jpg']
    }
  ];

  const CAT_LABEL = { rings: 'Rings', pendants: 'Pendants', engraving: 'Hand engraving' };
  const IMG = n => 'images/' + n;
  const THUMB = n => 'images/thumbs/' + n;

  /* ================= 1. PAGE-LOAD SEQUENCE ================= */
  const ready = () => document.body.classList.add('is-ready');
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]).then(() => requestAnimationFrame(ready));
  } else {
    window.addEventListener('load', ready);
  }

  // hero slideshow (slow crossfade)
  const slides = $$('.hero-slides img');
  if (slides.length > 1 && !reduce) {
    let si = 0;
    setInterval(() => {
      slides[si].classList.remove('active');
      si = (si + 1) % slides.length;
      slides[si].classList.add('active');
    }, 5200);
  }

  /* ================= 2. NAVBAR / BACK TO TOP ================= */
  const nav = $('#mainNav');
  const toTop = $('.to-top');
  const sectionLinks = $$('.navbar .nav-link').filter(a => a.hash);
  const sections = sectionLinks.map(a => $(a.hash)).filter(Boolean);

  // close the mobile menu after tapping a link
  $$('#navMenu a').forEach(a => a.addEventListener('click', () => {
    const el = $('#navMenu');
    if (el && el.classList.contains('show') && window.bootstrap) bootstrap.Collapse.getOrCreateInstance(el).hide();
  }));
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* ================= 3. SCROLL-FILL TEXT =================
     Any element with .scroll-fill is split into words. As you scroll,
     each word's colour sweeps in from left to right.
     data-fill="pinned" → progress follows the tall .quote wrapper
     (text stays pinned while it fills). Otherwise it follows the
     element's own position in the viewport.                        */
  const fills = $$('.scroll-fill').map(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', words.join(' '));
    el.innerHTML = words.map(w => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
    return { el, words: $$('.w', el), pinned: el.dataset.fill === 'pinned', wrap: el.closest('.quote') };
  });

  const updateFills = vh => {
    fills.forEach(f => {
      let p;
      if (reduce) p = 1;
      else if (f.pinned && f.wrap) {
        const r = f.wrap.getBoundingClientRect();
        const raw = clamp(-r.top / (r.height - vh), 0, 1);
        p = clamp((raw - 0.06) / 0.78, 0, 1);         // fill finishes just before the pin releases
      } else {
        const r = f.el.getBoundingClientRect();
        p = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.42), 0, 1);
      }
      const n = f.words.length;
      f.words.forEach((w, i) => w.style.setProperty('--p', clamp(p * n - i, 0, 1).toFixed(3)));
    });
  };

  /* ================= 4. PARALLAX + REVEAL ================= */
  const parallax = $$('[data-parallax]');
  const updateParallax = vh => {
    if (reduce) return;
    parallax.forEach(el => {
      const anchor = el.parentElement.getBoundingClientRect();
      if (anchor.bottom < -200 || anchor.top > vh + 200) return;
      const offset = (anchor.top + anchor.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
  };

  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---- one rAF-throttled scroll handler drives everything ---- */
  let ticking = false;
  const update = () => {
    const y = window.scrollY, vh = window.innerHeight;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    if (toTop) toTop.classList.toggle('show', y > 700);
    updateFills(vh);
    updateParallax(vh);
    if (sections.length) {
      let current = null;
      sections.forEach(s => { if (s.getBoundingClientRect().top <= vh * 0.35) current = s.id; });
      sectionLinks.forEach(a => a.classList.toggle('active', a.hash === '#' + current));
    }
    ticking = false;
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', update);
  update();

  /* ================= 5. FILTERS + PRODUCT CARDS ================= */
  const grid = $('#productGrid');
  if (grid) {
    grid.innerHTML = PRODUCTS.map(p => {
      const alt = p.images[1] || null;
      return `
      <div class="col-6 col-lg-4 col-xl-3 p-item" data-cats="${p.cats.join(' ')}">
        <button class="p-card cut" type="button" data-id="${p.id}" aria-label="View ${p.title}">
          <img src="${THUMB(p.images[0])}" alt="${p.title}" loading="lazy">
          ${alt ? `<img class="alt" src="${THUMB(alt)}" alt="" loading="lazy">` : ''}
          ${p.images.length > 1 ? `<span class="p-count"><i class="bi bi-images"></i>${p.images.length} views</span>` : ''}
          <span class="p-meta"><strong class="p-title">${p.title}</strong><span>${CAT_LABEL[p.cats[0]]}</span></span>
        </button>
      </div>`;
    }).join('');

    $$('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
      const f = btn.dataset.filter;
      let n = 0;
      $$('.p-item', grid).forEach(item => {
        const show = f === 'all' || item.dataset.cats.split(' ').includes(f);
        item.classList.toggle('is-hidden', !show);
        item.classList.remove('pop');
        if (show) { void item.offsetWidth; item.style.animationDelay = (n++ * 70) + 'ms'; item.classList.add('pop'); }
      });
    }));
  }

  /* ================= 6. LIGHTBOX ================= */
  const lb = $('#lightbox');
  if (lb && grid) {
    const stage = $('.lb-stage', lb), img = $('.lb-img', lb), cat = $('.lb-cat', lb);
    const title = $('.lb-title', lb), desc = $('.lb-desc', lb), count = $('.lb-count', lb), thumbs = $('.lb-thumbs', lb);
    let cur = null, idx = 0, token = 0, lastFocus = null;

    const setImage = (i, instant) => {
      const list = cur.images;
      idx = (i + list.length) % list.length;
      const my = ++token;
      const swap = () => {
        const loader = new Image();
        loader.onload = () => {
          if (my !== token) return;
          img.src = loader.src;
          img.alt = `${cur.title}, view ${idx + 1} of ${list.length}`;
          img.classList.remove('swap');
        };
        loader.src = IMG(list[idx]);
      };
      if (instant) swap(); else { img.classList.add('swap'); setTimeout(swap, 180); }
      count.textContent = `${idx + 1} / ${list.length}`;
      $$('.lb-thumb', thumbs).forEach((t, k) => t.classList.toggle('active', k === idx));
      // warm the cache for the next angle
      if (list.length > 1) new Image().src = IMG(list[(idx + 1) % list.length]);
    };

    const open = id => {
      cur = PRODUCTS.find(p => p.id === id);
      if (!cur) return;
      lastFocus = document.activeElement;
      cat.textContent = cur.cats.map(c => CAT_LABEL[c]).join(', ');
      title.textContent = cur.title;
      desc.textContent = cur.desc;
      lb.classList.toggle('single', cur.images.length < 2);
      thumbs.innerHTML = cur.images.map((n, k) =>
        `<button class="lb-thumb" type="button" data-i="${k}" aria-label="Show view ${k + 1}"><img src="${THUMB(n)}" alt=""></button>`).join('');
      img.classList.add('swap');
      setImage(0, true);
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      $('.lb-close', lb).focus({ preventScroll: true });
    };
    const close = () => {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    };
    const go = d => { if (cur && cur.images.length > 1) setImage(idx + d); };

    grid.addEventListener('click', e => {
      const card = e.target.closest('.p-card');
      if (card) open(card.dataset.id);
    });
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => go(-1));
    $('.lb-next', lb).addEventListener('click', () => go(1));
    thumbs.addEventListener('click', e => {
      const t = e.target.closest('.lb-thumb');
      if (t) setImage(+t.dataset.i);
    });
    stage.addEventListener('click', e => { if (e.target === stage) close(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab') {                       // keep focus inside the dialog
        const f = $$('button, a[href]', lb).filter(el => el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // swipe on touch screens
    let tx = 0;
    stage.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* ================= 7. SMALL HELPERS ================= */
  $$('.js-year').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
