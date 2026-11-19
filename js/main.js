/**
 * TIRUMALA NIRMAAN
 * Main Interactive Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Drawer
  const mobileToggle = document.getElementById('mobileToggle');
  const drawerClose = document.getElementById('drawerClose');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');

  function openDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (drawerOverlay) drawerOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Sticky Header measurement & shadow
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  }, { passive: true });

  // =========================================================================
  // The 3 Showcase Sliders (High-Rise Apartments, Gated Villas, Commercial)
  // =========================================================================
  const heroSlider = document.getElementById('mainHeroSlider');
  if (heroSlider) {
    const slides = heroSlider.querySelectorAll('.hero-slide');
    const dots = heroSlider.querySelectorAll('.slider-dot');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const progressBar = document.getElementById('sliderProgressBar');

    let currentSlide = 0;
    const totalSlides = slides.length;
    const slideDuration = 6000; // 6 seconds per slide
    let slideTimer = null;
    let isPaused = false;

    function goToSlide(index) {
      if (index < 0) {
        currentSlide = totalSlides - 1;
      } else if (index >= totalSlides) {
        currentSlide = 0;
      } else {
        currentSlide = index;
      }

      // Update slide elements
      slides.forEach((slide, i) => {
        if (i === currentSlide) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });

      // Update dot indicators
      dots.forEach((dot, i) => {
        if (i === currentSlide) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });

      // Update active navigation links across header and mobile drawer
      const allNavLinks = document.querySelectorAll('[data-slide-target]');
      allNavLinks.forEach(link => {
        const target = parseInt(link.getAttribute('data-slide-target'), 10);
        if (target === currentSlide) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      resetProgress();
    }

    function nextSlide() {
      goToSlide(currentSlide + 1);
    }

    function prevSlide() {
      goToSlide(currentSlide - 1);
    }

    function resetProgress() {
      if (progressBar) {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        void progressBar.offsetWidth;
        if (!isPaused) {
          progressBar.style.transition = `width ${slideDuration}ms linear`;
          progressBar.style.width = '100%';
        }
      }

      clearInterval(slideTimer);
      slideTimer = setInterval(() => {
        if (!isPaused) {
          nextSlide();
        }
      }, slideDuration);
    }

    // Prev / Next Navigation Arrows
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextSlide();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevSlide();
      });
    }

    // Dot indicators
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const targetIndex = parseInt(dot.getAttribute('data-slide'), 10);
        if (!isNaN(targetIndex)) {
          goToSlide(targetIndex);
        }
      });
    });

    // Navigation links (Desktop navbar, mobile drawer, and footer)
    const slideTriggers = document.querySelectorAll('[data-slide-target]');
    slideTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        const target = parseInt(trigger.getAttribute('data-slide-target'), 10);
        if (!isNaN(target)) {
          e.preventDefault();
          goToSlide(target);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          closeDrawer();
        }
      });
    });

    // Pause on Hover
    heroSlider.addEventListener('mouseenter', () => {
      isPaused = true;
      if (progressBar) {
        const computedWidth = window.getComputedStyle(progressBar).width;
        progressBar.style.transition = 'none';
        progressBar.style.width = computedWidth;
      }
    });

    heroSlider.addEventListener('mouseleave', () => {
      isPaused = false;
      resetProgress();
    });

    // Touch Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    heroSlider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroSlider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const threshold = 40;
      if (touchEndX < touchStartX - threshold) {
        nextSlide();
      } else if (touchEndX > touchStartX + threshold) {
        prevSlide();
      }
    }

    // Keyboard navigation when at the top
    window.addEventListener('keydown', (e) => {
      if (window.scrollY < 500) {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
      }
    });

    // Start on first slide
    goToSlide(0);
  }

  // =========================================================================
  // Book a Site Visit Modal Logic
  // =========================================================================
  const visitModalOverlay = document.getElementById('visitModalOverlay');
  const visitModalClose = document.getElementById('visitModalClose');
  const openVisitBtn = document.getElementById('openVisitBtn');
  const drawerVisitBtn = document.getElementById('drawerVisitBtn');
  const openVisitTriggers = document.querySelectorAll('.open-visit-btn');
  const siteVisitForm = document.getElementById('siteVisitForm');
  const projectSelect = document.getElementById('visitProject');

  function openVisitModal(preselectedProject) {
    if (preselectedProject && projectSelect) {
      const options = Array.from(projectSelect.options);
      const match = options.find(o => o.value.toLowerCase().includes(preselectedProject.toLowerCase()));
      if (match) {
        projectSelect.value = match.value;
      }
    }
    if (visitModalOverlay) {
      visitModalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      const nameInput = document.getElementById('visitName');
      if (nameInput) setTimeout(() => nameInput.focus(), 150);
    }
    closeDrawer();
  }

  function closeVisitModal() {
    if (visitModalOverlay) {
      visitModalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (openVisitBtn) {
    openVisitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openVisitModal();
    });
  }

  if (drawerVisitBtn) {
    drawerVisitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openVisitModal();
    });
  }

  openVisitTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const proj = btn.getAttribute('data-project');
      openVisitModal(proj);
    });
  });

  if (visitModalClose) {
    visitModalClose.addEventListener('click', closeVisitModal);
  }

  if (visitModalOverlay) {
    visitModalOverlay.addEventListener('click', (e) => {
      if (e.target === visitModalOverlay) {
        closeVisitModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && visitModalOverlay?.classList.contains('open')) {
      closeVisitModal();
    }
  });

  // Handle Site Visit Form Submission -> WhatsApp Link
  if (siteVisitForm) {
    siteVisitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('visitName')?.value.trim() || '';
      const phone = document.getElementById('visitPhone')?.value.trim() || '';
      const project = projectSelect?.value || 'General Inquiry';
      const date = document.getElementById('visitDate')?.value || 'Flexible';

      const message = `Hello Tirumala Nirmaan, I would like to book a site visit.%0A%0A*Name:* ${encodeURIComponent(name)}%0A*Phone:* ${encodeURIComponent(phone)}%0A*Project:* ${encodeURIComponent(project)}%0A*Preferred Date:* ${encodeURIComponent(date)}`;

      const waUrl = `https://wa.me/919849306675?text=${message}`;
      window.open(waUrl, '_blank');
      closeVisitModal();
      siteVisitForm.reset();
    });
  }

  // Handle On-Page Site Visit Form Submission -> WhatsApp
  const onpageVisitForm = document.getElementById('onpageVisitForm');
  if (onpageVisitForm) {
    onpageVisitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('onpageName')?.value.trim() || '';
      const phone = document.getElementById('onpagePhone')?.value.trim() || '';
      const email = document.getElementById('onpageEmail')?.value.trim() || 'Not specified';
      const project = document.getElementById('onpageProject')?.value || 'All Developments';
      const date = document.getElementById('onpageDate')?.value || 'Flexible';

      const message = `Hello Tirumala Nirmaan, I would like to schedule a Site Visit:%0A%0A*Full Name:* ${encodeURIComponent(name)}%0A*Phone / WhatsApp:* ${encodeURIComponent(phone)}%0A*Email:* ${encodeURIComponent(email)}%0A*Property:* ${encodeURIComponent(project)}%0A*Preferred Date:* ${encodeURIComponent(date)}%0A%0APlease confirm my appointment.`;

      const waUrl = `https://wa.me/919849306675?text=${message}`;
      window.open(waUrl, '_blank');
      onpageVisitForm.reset();
    });
  }

  // =========================================================================
  // Section 5: Voices of Trust Carousel Logic (Director + 2 Testimonials)
  // =========================================================================
  const tSlides = document.querySelectorAll('.testimonial-slide');
  const tTabs = document.querySelectorAll('.t-pill-tab');
  const tPrevBtn = document.getElementById('tPrevBtn');
  const tNextBtn = document.getElementById('tNextBtn');
  const tSliderWrap = document.getElementById('testimonialSlider');

  if (tSlides.length > 0) {
    let currentTIndex = 0;
    let tTimer = null;

    function showTestimonial(index) {
      if (index < 0) index = tSlides.length - 1;
      if (index >= tSlides.length) index = 0;
      currentTIndex = index;

      tSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentTIndex);
      });

      tTabs.forEach((tab, i) => {
        const isActive = (i === currentTIndex);
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive);
      });
    }

    if (tPrevBtn) {
      tPrevBtn.addEventListener('click', () => {
        showTestimonial(currentTIndex - 1);
        resetTTimer();
      });
    }

    if (tNextBtn) {
      tNextBtn.addEventListener('click', () => {
        showTestimonial(currentTIndex + 1);
        resetTTimer();
      });
    }

    tTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const idx = parseInt(tab.getAttribute('data-tab'), 10);
        if (!isNaN(idx)) {
          showTestimonial(idx);
          resetTTimer();
        }
      });
    });

    function resetTTimer() {
      clearInterval(tTimer);
      tTimer = setInterval(() => {
        showTestimonial(currentTIndex + 1);
      }, 7000);
    }

    resetTTimer();

    if (tSliderWrap) {
      tSliderWrap.addEventListener('mouseenter', () => clearInterval(tTimer));
      tSliderWrap.addEventListener('mouseleave', resetTTimer);
    }
  }

  /* -------------------------------------------------------------------------
     8. OTHER BUSINESS VERTICALS (SATTVA-STYLE ARCHITECTURAL SLIDER)
     ------------------------------------------------------------------------- */
  const verticalsTrack = document.getElementById('verticalsTrack');
  const verticalsPrev = document.getElementById('verticalsPrev');
  const verticalsNext = document.getElementById('verticalsNext');
  const verticalsDotsContainer = document.getElementById('verticalsDots');

  if (verticalsTrack && verticalsPrev && verticalsNext) {
    const cards = verticalsTrack.querySelectorAll('.vertical-card');
    const dots = verticalsDotsContainer ? verticalsDotsContainer.querySelectorAll('.verticals-dot') : [];

    function getCardStep() {
      if (cards.length === 0) return 340;
      const firstCard = cards[0];
      const gap = parseFloat(getComputedStyle(verticalsTrack).gap) || 28;
      return firstCard.offsetWidth + gap;
    }

    function updateActiveDot() {
      if (!dots.length) return;
      const scrollLeft = verticalsTrack.scrollLeft;
      const step = getCardStep();
      const activeIdx = Math.min(Math.round(scrollLeft / step), dots.length - 1);

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIdx);
      });
    }

    verticalsNext.addEventListener('click', () => {
      const step = getCardStep();
      verticalsTrack.scrollBy({ left: step, behavior: 'smooth' });
    });

    verticalsPrev.addEventListener('click', () => {
      const step = getCardStep();
      verticalsTrack.scrollBy({ left: -step, behavior: 'smooth' });
    });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        const step = getCardStep();
        verticalsTrack.scrollTo({ left: i * step, behavior: 'smooth' });
      });
    });

    verticalsTrack.addEventListener('scroll', () => {
      updateActiveDot();
    }, { passive: true });
  }
});
