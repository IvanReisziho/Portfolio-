// ---------- Frases rotativas do hero ----------
document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroDesc = document.getElementById('heroDesc');
  const statements = document.querySelectorAll('#heroStatements p');
  let current = 0;

  if (prefersReduced) {
    if (heroDesc) heroDesc.classList.add('is-in');
  } else {
    setTimeout(() => { if (heroDesc) heroDesc.classList.add('is-in'); }, 400);

    if (statements.length > 1) {
      setInterval(() => {
        statements[current].classList.remove('is-active');
        current = (current + 1) % statements.length;
        statements[current].classList.add('is-active');
      }, 2600);
    }
  }

  // ---------- Scroll reveal ----------
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (prefersReduced) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  }

  // ---------- Botão de ativar/desativar áudio (vídeos sobrepostos) ----------
  document.querySelectorAll('.mute-toggle').forEach(btn => {
    const card = btn.closest('.showcase-card');
    const video = card ? card.querySelector('video') : null;
    if (!video) return;
    btn.addEventListener('click', () => {
      video.muted = !video.muted;
      btn.setAttribute('aria-pressed', String(!video.muted));
      btn.setAttribute('aria-label', video.muted ? 'Ativar áudio' : 'Desativar áudio');
    });
  });

  // ---------- Vídeos: play no hover, pause ao sair ----------
  document.querySelectorAll('.video-card video').forEach(video => {
    const card = video.closest('.video-card');
    card.addEventListener('mouseenter', () => { video.play().catch(()=>{}); });
    card.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
  });

  // ---------- Carrosséis (cards de projeto + modal) ----------
  function initCarousel(el) {
    const imgs = Array.from(el.querySelectorAll(':scope > img'));
    const dotsWrap = el.querySelector('.carousel-dots');
    let idx = 0;

    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      imgs.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', `Ver imagem ${i + 1}`);
        if (i === 0) dot.classList.add('is-active');
        dot.addEventListener('click', (e) => { e.stopPropagation(); show(i); });
        dotsWrap.appendChild(dot);
      });
    }

    function show(i) {
      idx = (i + imgs.length) % imgs.length;
      imgs.forEach((img, n) => img.classList.toggle('is-active', n === idx));
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach((d, n) => d.classList.toggle('is-active', n === idx));
      }
    }

    const prevBtn = el.querySelector('.carousel-arrow.prev');
    const nextBtn = el.querySelector('.carousel-arrow.next');
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); show(idx - 1); stopAutoplay(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); show(idx + 1); stopAutoplay(); startAutoplay(); });

    // ---------- Autoplay (avança sozinho a cada 4.5s, pausa no hover) ----------
    let autoplayTimer = null;
    function startAutoplay() {
      if (imgs.length < 2) return;
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(() => show(idx + 1), 4500);
    }
    function stopAutoplay() {
      clearInterval(autoplayTimer);
    }
    el.addEventListener('mouseenter', stopAutoplay);
    el.addEventListener('mouseleave', startAutoplay);

    show(0);
    startAutoplay();
  }
  document.querySelectorAll('.frame.carousel').forEach(initCarousel);

  // ---------- Galerias de projeto em janelas flutuantes ----------
  let previousFocus = null;
  let activeModal = null;
  let savedScroll = 0;

  function openModal(modal) {
    if (!modal || activeModal) return;
    previousFocus = document.activeElement;
    savedScroll = window.scrollY;
    activeModal = modal;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    const inner = modal.querySelector('.project-modal-inner');
    if (inner) inner.scrollTop = 0;
    document.body.classList.add('project-modal-open');
    modal.querySelector('.modal-close')?.focus({ preventScroll: true });
  }

  function closeModal() {
    if (!activeModal) return;
    const modal = activeModal;
    activeModal = null;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('project-modal-open');
    window.scrollTo({ top: savedScroll, behavior: 'instant' });
    if (previousFocus?.focus) previousFocus.focus({ preventScroll: true });
  }

  document.querySelectorAll('.work-item[data-modal]').forEach(item => {
    const open = () => openModal(document.getElementById(item.dataset.modal));
    item.addEventListener('click', open);
    item.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });

  document.querySelectorAll('.project-modal').forEach(modal => {
    modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
    modal.addEventListener('click', event => {
      if (event.target === modal) closeModal();
    });
  });

  document.addEventListener('keydown', event => {
    if (!activeModal) return;
    if (event.key === 'Escape') { closeModal(); return; }
    if (event.key !== 'Tab') return;
    const elements = [...activeModal.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled);
    if (!elements.length) return;
    const first = elements[0], last = elements[elements.length-1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  document.querySelectorAll('.project-image img').forEach(img => {
    img.addEventListener('error', () => {
      img.hidden = true;
      const error = img.parentElement.querySelector('.image-error');
      if (error) error.hidden = false;
    });
  });

  // ---------- Menu suspenso (mobile) ----------
  const navToggle = document.getElementById('navToggle');
  const navDropdown = document.getElementById('navDropdown');

  if (navToggle && navDropdown) {
    const closeMenu = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navDropdown.classList.remove('is-open');
    };
    navToggle.addEventListener('click', () => {
      const isOpen = navDropdown.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    navDropdown.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }
});
