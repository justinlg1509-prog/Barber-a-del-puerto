/* ============================
   Barbería del Puerto — Script
   ============================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----- Year ----- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ----- Navbar scroll effect ----- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----- Mobile menu ----- */
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');

  const closeMenu = () => {
    if (!navMenu) return;
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };
  const openMenu = () => {
    if (!navMenu) return;
    navMenu.classList.add('active');
    navToggle.classList.add('active');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('active')) closeMenu();
      else openMenu();
    });

    // Close on link click
    navMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMenu);
    });

    // Close on click outside the <ul> (empty area of overlay)
    navMenu.addEventListener('click', (e) => {
      if (e.target === navMenu) closeMenu();
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) closeMenu();
    });

    // Close if window resizes above mobile breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navMenu.classList.contains('active')) closeMenu();
    });
  }

  /* ----- Services carousel ----- */
  const track   = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsBox = document.getElementById('carouselDots');

  if (track && prevBtn && nextBtn && dotsBox) {
    const cards = Array.from(track.children);
    let index = 0;

    const getVisibleCount = () => {
      const w = window.innerWidth;
      if (w <= 768) return 1;
      if (w <= 1024) return 2;
      return 3;
    };

    const buildDots = () => {
      dotsBox.innerHTML = '';
      const visible = getVisibleCount();
      const pages = Math.max(1, cards.length - visible + 1);
      for (let i = 0; i < pages; i++) {
        const btn = document.createElement('button');
        btn.setAttribute('aria-label', `Ir a página ${i+1}`);
        btn.addEventListener('click', () => { index = i; update(); });
        dotsBox.appendChild(btn);
      }
    };

    const update = () => {
      const visible = getVisibleCount();
      const maxIndex = Math.max(0, cards.length - visible);
      if (index > maxIndex) index = maxIndex;
      if (index < 0) index = 0;

      const card = cards[0];
      if (!card) return;
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap || 0);
      const cardWidth = card.getBoundingClientRect().width + gap;
      track.style.transform = `translateX(-${index * cardWidth}px)`;

      const dots = dotsBox.querySelectorAll('button');
      dots.forEach((d, i) => d.classList.toggle('active', i === index));

      prevBtn.disabled = index === 0;
      nextBtn.disabled = index >= maxIndex;
    };

    prevBtn.addEventListener('click', () => { index--; update(); });
    nextBtn.addEventListener('click', () => { index++; update(); });

    /* Touch swipe */
    let startX = 0, isDown = false;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDown = true; }, { passive: true });
    track.addEventListener('touchend', e => {
      if (!isDown) return;
      isDown = false;
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 50) {
        if (diff < 0) index++; else index--;
        update();
      }
    }, { passive: true });

    /* Autoplay */
    let timer = setInterval(() => {
      const visible = getVisibleCount();
      const maxIndex = Math.max(0, cards.length - visible);
      index = index >= maxIndex ? 0 : index + 1;
      update();
    }, 5000);

    const carouselEl = document.getElementById('carousel');
    carouselEl.addEventListener('mouseenter', () => clearInterval(timer));
    carouselEl.addEventListener('mouseleave', () => {
      timer = setInterval(() => {
        const visible = getVisibleCount();
        const maxIndex = Math.max(0, cards.length - visible);
        index = index >= maxIndex ? 0 : index + 1;
        update();
      }, 5000);
    });

    window.addEventListener('resize', () => { buildDots(); update(); });

    buildDots();
    update();
  }

  /* ----- Gallery Lightbox ----- */
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev  = document.getElementById('lightboxPrev');
  const lightboxNext  = document.getElementById('lightboxNext');
  const galleryItems  = document.querySelectorAll('#galleryGrid .gallery-item');
  const galleryImgs   = document.querySelectorAll('#galleryGrid .gallery-item img');
  let currentImg = 0;

  const openLightbox = (i) => {
    currentImg = i;
    lightboxImg.src = galleryImgs[i].src;
    lightboxImg.alt = galleryImgs[i].alt;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  const showImg = (dir) => {
    currentImg = (currentImg + dir + galleryImgs.length) % galleryImgs.length;
    lightboxImg.src = galleryImgs[currentImg].src;
    lightboxImg.alt = galleryImgs[currentImg].alt;
  };

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev)  lightboxPrev.addEventListener('click', () => showImg(-1));
  if (lightboxNext)  lightboxNext.addEventListener('click', () => showImg(1));
  if (lightbox) {
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  }
  document.addEventListener('keydown', e => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showImg(-1);
    if (e.key === 'ArrowRight') showImg(1);
  });

  /* ----- Reveal on scroll ----- */
  const revealEls = document.querySelectorAll('.about-grid, .service-card, .gallery-item, .schedule-grid, .contact-card, .section-header');
  revealEls.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ----- Lazy-load Google Maps iframe ----- */
  const mapContainer = document.getElementById('contactMap');
  if (mapContainer && 'IntersectionObserver' in window) {
    const mapObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const src = mapContainer.dataset.src;
          if (src) {
            const iframe = document.createElement('iframe');
            iframe.src = src;
            iframe.title = 'Mapa de Barbería del Puerto';
            iframe.loading = 'lazy';
            iframe.allowFullscreen = true;
            iframe.referrerPolicy = 'no-referrer-when-downgrade';
            iframe.addEventListener('load', () => {
              const placeholder = mapContainer.querySelector('.map-placeholder');
              if (placeholder) placeholder.style.display = 'none';
            });
            mapContainer.appendChild(iframe);
            obs.unobserve(mapContainer);
          }
        }
      });
    }, { rootMargin: '200px' });
    mapObserver.observe(mapContainer);
  } else if (mapContainer) {
    // Fallback for old browsers
    const iframe = document.createElement('iframe');
    iframe.src = mapContainer.dataset.src;
    iframe.title = 'Mapa de Barbería del Puerto';
    iframe.loading = 'lazy';
    mapContainer.appendChild(iframe);
  }

  /* ----- Cookie banner ----- */
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAccept = document.getElementById('cookieAccept');
  const cookieReject = document.getElementById('cookieReject');
  const COOKIE_KEY = 'bdp_cookie_consent';

  if (cookieBanner && !localStorage.getItem(COOKIE_KEY)) {
    setTimeout(() => cookieBanner.classList.add('show'), 1000);
  }
  const hideCookie = (value) => {
    localStorage.setItem(COOKIE_KEY, value);
    cookieBanner.classList.remove('show');
  };
  if (cookieAccept) cookieAccept.addEventListener('click', () => hideCookie('accepted'));
  if (cookieReject) cookieReject.addEventListener('click', () => hideCookie('rejected'));

  /* ----- Smooth offset for fixed header anchors ----- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offset = 80;
          const y = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    });
  });
});
