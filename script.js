// ---------- Frases rotativas do hero ----------
document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroDesc = document.getElementById('heroDesc');
  const statements = document.querySelectorAll('#heroStatements p');
  let current = 0;

  if (prefersReduced) {
    heroDesc.classList.add('is-in');
  } else {
    setTimeout(() => heroDesc.classList.add('is-in'), 400);

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

  // ---------- Modal de projeto ----------
  function openModal(modal) {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(modal) {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.work-item[data-modal]').forEach(item => {
    const trigger = () => {
      const modal = document.getElementById(item.getAttribute('data-modal'));
      if (modal) openModal(modal);
    };
    item.addEventListener('click', (e) => {
      if (e.target.closest('.carousel-arrow') || e.target.closest('.carousel-dots') || e.target.closest('.behance-btn')) return;
      trigger();
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger(); }
    });
  });

  document.querySelectorAll('.project-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.project-modal.is-open').forEach(closeModal);
    }
  });

  // (Bloco antigo que cancelava o wheel e chamava scrollBy foi REMOVIDO.
  //  O scroll agora é tratado só pelo script inline no index.html.)

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
