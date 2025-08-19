/* Year + back to top */
(() => {
  const y = document.getElementById('year');
  if (y && !y.textContent) y.textContent = new Date().getFullYear();

  const btn = document.querySelector('.toTop-btn');
  const toggle = () => btn?.classList.toggle('hidden', window.scrollY < 600);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
  btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* Header */
(() => {
  const header  = document.getElementById('siteHeader');
  const menuBtn = document.getElementById('menuBtn');
  const sheet   = document.getElementById('mobileSheet');
  const close   = document.getElementById('closeSheet');
  const navLinks= [...document.querySelectorAll('.nav-a')];

  const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 40);
  onScroll(); window.addEventListener('scroll', onScroll, { passive:true });

  // include branches in active highlight
  const sections = ['#inventory','#services','#about','#branches','#contact']
    .map(id=>document.querySelector(id)).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length){
    const map = new Map(navLinks.map(a => [a.getAttribute('href'), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const a = map.get('#' + en.target.id);
        if (a && en.isIntersecting){ navLinks.forEach(x=>x.classList.remove('active')); a.classList.add('active'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0.01 });
    sections.forEach(s => io.observe(s));
  }

  const setIcon = (open) => {
    const i = menuBtn.querySelector('i');
    if (!i) return;
    i.classList.toggle('fa-bars', !open);
    i.classList.toggle('fa-xmark', open);
  };

  const openSheet = () => {
    sheet.classList.add('show'); document.body.classList.add('noscroll');
    menuBtn.setAttribute('aria-expanded','true'); setIcon(true);
  };
  const closeSheet = () => {
    sheet.classList.remove('show'); document.body.classList.remove('noscroll');
    menuBtn.setAttribute('aria-expanded','false'); setIcon(false);
  };

  menuBtn?.addEventListener('click', () => sheet.classList.contains('show') ? closeSheet() : openSheet());
  close?.addEventListener('click', closeSheet);
  sheet?.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });
  sheet?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeSheet));
})();

/* Inventory filter (left in place in case you enable inputs later) */
(() => {
  const search = document.getElementById('search');
  const filter = document.getElementById('filter');
  const cards  = [...document.querySelectorAll('#grid .inv-card')];

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

  search?.addEventListener('input', apply);
  filter?.addEventListener('change', apply);
})();

/* Reveal on scroll */
(() => {
  const els = [...document.querySelectorAll('.reveal')];
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .12 });
  els.forEach(el => io.observe(el));
})();

/* Contact form polish + WhatsApp handoff */
(() => {
  const form = document.querySelector('#contact form[name="enquiry"]');
  if (!form) return;
  const status = document.getElementById('formStatus');

  // floating labels
  const sync = el => { const g = el.closest('.fgroup'); if (!g) return; g.classList.toggle('filled', !!el.value.trim()); };
  form.querySelectorAll('.finput').forEach(el => { sync(el); el.addEventListener('input',()=>sync(el)); el.addEventListener('blur',()=>sync(el)); });

  // light phone formatting
  const phone = form.querySelector('[name="phone"]');
  phone?.addEventListener('input', () => {
    let v = phone.value.replace(/[^\d+]/g, '');
    v = v.replace(/(\+\d{1,3})(\d+)/, '$1 $2');
    v = v.replace(/(\d{5})(\d)/, '$1 $2');
    phone.value = v;
  });

  // WhatsApp handoff to VK Motors
  form.addEventListener('submit', () => {
    const fd = new FormData(form);
    const name  = (fd.get('name')  || '').toString().trim();
    const ph    = (fd.get('phone') || '').toString().trim();
    const email = (fd.get('email') || '').toString().trim();
    const msg   = (fd.get('message') || '').toString().trim();

    const lines = [
      'VK Motors — New Enquiry',
      `Name: ${name || '-'}`,
      `Phone: ${ph || '-'}`,
      email ? `Email: ${email}` : null,
      msg ? `Message: ${msg}` : null
    ].filter(Boolean);

    const text = lines.join('\n');
    const waNumber = '+91 88663 32130';   
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    if (status) status.textContent = 'Sending… (WhatsApp opened)';
  });
})();
