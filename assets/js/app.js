/* =========================
   Year + Back to Top
   ========================= */
(() => {
  const yearEl = document.getElementById('year');
  if (yearEl && !yearEl.textContent) yearEl.textContent = new Date().getFullYear();

  // Support either class (.toTop-btn) or id (#toTop)
  const btn = document.querySelector('.toTop-btn') || document.getElementById('toTop');
  if (!btn) return;

  const showAt = 450; // px
  const toggle = () => btn.classList.toggle('hidden', (window.scrollY || 0) < showAt);

  window.addEventListener('scroll', toggle, { passive: true });
  window.addEventListener('load', toggle);
  toggle();

  btn.addEventListener('click', () => {
    const scrollOpts = { top: 0, behavior: 'smooth' };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) scrollOpts.behavior = 'auto';
    window.scrollTo(scrollOpts);
  });
})();

/* =========================
   Header: sticky, mobile sheet, active link
   ========================= */
(() => {
  const header   = document.getElementById('siteHeader');
  const menuBtn  = document.getElementById('menuBtn');
  const sheet    = document.getElementById('mobileSheet');
  const closeBtn = document.getElementById('closeSheet');
  const navLinks = [...document.querySelectorAll('.nav-a')];

  if (header) {
    const onScroll = () => header.classList.toggle('is-solid', (window.scrollY || 0) > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', onScroll);
    onScroll();
  }

  // Active section highlight (stable midline check)
  const sections = ['inventory','services','about','branches','contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    const linkMap = new Map(navLinks.map(a => [a.getAttribute('href'), a]));
    let activeId = null;

    const io = new IntersectionObserver((entries) => {
      // Choose the section that crosses the viewport midline
      const mid = window.innerHeight / 2;
      let best = null, bestDelta = Infinity;

      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const rect = en.target.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const delta = Math.abs(center - mid);
        if (delta < bestDelta) { bestDelta = delta; best = en.target; }
      });

      if (best && best.id !== activeId) {
        activeId = best.id;
        navLinks.forEach(a => a.classList.remove('active'));
        const link = linkMap.get('#' + activeId);
        if (link) link.classList.add('active');
      }
    }, { rootMargin: '-20% 0px -55% 0px', threshold: 0.08 });

    sections.forEach(sec => io.observe(sec));
  }

  // Hamburger icon swap helper
  const setHamburgerIcon = (open) => {
    if (!menuBtn) return;
    const i = menuBtn.querySelector('i');
    if (!i) return;
    // Support both fa-bars-staggered and fa-bars
    const hasStaggered = i.classList.contains('fa-bars-staggered');
    if (open) {
      i.classList.add('fa-xmark');
      i.classList.remove(hasStaggered ? 'fa-bars-staggered' : 'fa-bars');
    } else {
      i.classList.remove('fa-xmark');
      i.classList.add(hasStaggered ? 'fa-bars-staggered' : 'fa-bars');
    }
  };

  const openSheet = () => {
    if (!sheet || !menuBtn) return;
    sheet.classList.add('show');
    document.body.classList.add('noscroll');
    menuBtn.setAttribute('aria-expanded','true');
    setHamburgerIcon(true);
  };
  const closeSheet = () => {
    if (!sheet || !menuBtn) return;
    sheet.classList.remove('show');
    document.body.classList.remove('noscroll');
    menuBtn.setAttribute('aria-expanded','false');
    setHamburgerIcon(false);
  };

  menuBtn?.addEventListener('click', () => {
    sheet?.classList.contains('show') ? closeSheet() : openSheet();
  });
  closeBtn?.addEventListener('click', closeSheet);
  sheet?.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });
  sheet?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeSheet));

  // Smooth anchor scroll with sticky header offset
  const headerOffset = () => {
    // Adjust this if your header height changes
    return header ? Math.min(88, header.offsetHeight + 10) : 78;
  };
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
      const opts = { top, behavior: 'smooth' };
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) opts.behavior = 'auto';
      window.scrollTo(opts);
    });
  });
})();

/* =========================
   Inventory filter (optional)
   ========================= */
(() => {
  const search = document.getElementById('search');
  const filter = document.getElementById('filter');
  const cards  = [...document.querySelectorAll('#grid .inv-card')];
  if (!cards.length) return;

  const apply = () => {
    const q = (search?.value || '').toLowerCase().trim();
    const cat = filter?.value || '';
    cards.forEach(card => {
      const name = (card.dataset.name || '').toLowerCase();
      const category = card.dataset.category || '';
      const match = (!q || name.includes(q)) && (!cat || category === cat);
      card.style.display = match ? '' : 'none';
    });
  };

  search?.addEventListener('input', apply, { passive: true });
  filter?.addEventListener('change', apply);
})();

/* =========================
   Reveal on scroll
   ========================= */
(() => {
  const els = [...document.querySelectorAll('.reveal')];
  if (!els.length || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  els.forEach(el => io.observe(el));

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('in'));
  }
})();

/* =========================
   Contact form polish + WhatsApp handoff
   ========================= */
(() => {
  const form = document.querySelector('#contact form[name="enquiry"]');
  if (!form) return;
  const status = document.getElementById('formStatus');

  // Floating labels sync
  const sync = (el) => {
    const g = el.closest('.fgroup');
    if (!g) return;
    g.classList.toggle('filled', !!el.value.trim());
  };
  form.querySelectorAll('.finput').forEach(el => {
    sync(el);
    el.addEventListener('input', () => sync(el));
    el.addEventListener('blur', () => sync(el));
  });

  // Light phone formatting
  const phone = form.querySelector('[name="phone"]');
  phone?.addEventListener('input', () => {
    // keep + and digits only for display
    let v = phone.value.replace(/[^\d+]/g, '');
    v = v.replace(/(\+\d{1,3})(\d+)/, '$1 $2');
    v = v.replace(/(\d{5})(\d)/, '$1 $2');
    phone.value = v;
  });

  // WhatsApp handoff to VK Motors (digits-only for wa.me)
  form.addEventListener('submit', () => {
    const fd    = new FormData(form);
    const name  = (fd.get('name')    || '').toString().trim();
    const ph    = (fd.get('phone')   || '').toString().trim();
    const email = (fd.get('email')   || '').toString().trim();
    const msg   = (fd.get('message') || '').toString().trim();

    const lines = [
      'VK Motors — New Enquiry',
      `Name: ${name || '-'}`,
      `Phone: ${ph || '-'}`,
      email ? `Email: ${email}` : null,
      msg ? `Message: ${msg}` : null
    ].filter(Boolean);

    const text = lines.join('\n');

    // wa.me must be digits ONLY (country code + number). No spaces or +.
    const waNumberDigits = '918866332130';
    const url = `https://wa.me/${waNumberDigits}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    if (status) status.textContent = 'Sending… (WhatsApp opened)';
  });
})();
