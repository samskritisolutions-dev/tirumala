/**
 * TIRUMALA NIRMAAN - LUXURY ARCHITECTURAL JAVASCRIPT (v9.0)
 * Handles Hero Showcase Slider, Theme Switcher, Filters, Carousels & Modals
 */

document.addEventListener('DOMContentLoaded', () => {

  // Locked Luxury Colour Palette: Deep Navy, Silver & White
  const htmlRoot = document.documentElement;
  htmlRoot.setAttribute('data-theme', 'deep-navy');

  // =========================================================================
  // 2. Sticky Header & Floating Contact Visibility on Scroll (Show after 300px)
  // =========================================================================
  const siteHeader = document.getElementById('siteHeader');
  const floatingActions = document.querySelector('.floating-actions');

  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY > 30) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }

    // Show floating WhatsApp and Call buttons only after scrolling 300px
    if (scrollY > 300) {
      floatingActions?.classList.add('visible');
    } else {
      floatingActions?.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check on load

  // =========================================================================
  // 3. Mobile Navigation Drawer
  // =========================================================================
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerClose = document.getElementById('drawerClose');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openDrawer() {
    mobileDrawer?.classList.add('active');
    drawerOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer?.classList.remove('active');
    drawerOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  mobileToggle?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawerOverlay?.addEventListener('click', closeDrawer);
  mobileNavLinks.forEach(link => link.addEventListener('click', closeDrawer));

  // =========================================================================
  // 4. Cinematic Hero Showcase Slider (Smooth Auto-play, Arrows & Mobile Swipe)
  // =========================================================================
  const heroSlider = document.getElementById('mainHeroSlider');
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const progressBar = document.getElementById('sliderProgressBar');

  let currentSlide = 0;
  const slideCount = slides.length;
  const slideDuration = 6000; // 6 seconds
  let slideInterval = null;
  let progressStartTime = 0;
  let animFrameId = null;

  function updateProgressBar() {
    const elapsed = Date.now() - progressStartTime;
    const progress = Math.min((elapsed / slideDuration) * 100, 100);
    if (progressBar) progressBar.style.width = `${progress}%`;

    if (elapsed < slideDuration) {
      animFrameId = requestAnimationFrame(updateProgressBar);
    }
  }

  function resetProgressBar() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (progressBar) progressBar.style.width = '0%';
    progressStartTime = Date.now();
    animFrameId = requestAnimationFrame(updateProgressBar);
  }

  function goToSlide(index) {
    if (slideCount === 0) return;
    if (index < 0) index = slideCount - 1;
    if (index >= slideCount) index = 0;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // Synchronize active menu link with current slide
    const allNavLinks = document.querySelectorAll('[data-slide-target]');
    allNavLinks.forEach(link => {
      const target = parseInt(link.getAttribute('data-slide-target'), 10);
      link.classList.toggle('active', target === index);
    });

    currentSlide = index;
    resetProgressBar();
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    progressStartTime = Date.now();
    animFrameId = requestAnimationFrame(updateProgressBar);
    slideInterval = setInterval(nextSlide, slideDuration);
  }

  function stopAutoplay() {
    if (slideInterval) clearInterval(slideInterval);
    if (animFrameId) cancelAnimationFrame(animFrameId);
  }

  prevBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    prevSlide();
    startAutoplay();
  });

  nextBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    nextSlide();
    startAutoplay();
  });

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(dot.getAttribute('data-slide') || '0', 10);
      goToSlide(idx);
      startAutoplay();
    });
  });

  // Direct slide switching from header and mobile drawer navigation links
  const slideTriggers = document.querySelectorAll('[data-slide-target]');
  slideTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const target = parseInt(trigger.getAttribute('data-slide-target'), 10);
      if (!isNaN(target)) {
        e.preventDefault();
        goToSlide(target);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        startAutoplay();
        closeDrawer();
      }
    });
  });

  // Touch Swipe for Mobile Hero Slider (Precise clientX/clientY detection)
  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping = false;

  heroSlider?.addEventListener('touchstart', e => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
  }, { passive: true });

  heroSlider?.addEventListener('touchend', e => {
    if (!isSwiping || !e.changedTouches || e.changedTouches.length === 0) return;
    isSwiping = false;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Minimum 35px horizontal movement, larger than vertical deviation
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      startAutoplay();
    }
  }, { passive: true });

  // Pause autoplay only when hovering over actionable controls, not entire window
  const heroControls = document.querySelectorAll('.slider-arrow, .slider-dots, .hero-slide .btn-slider-sm, .hero-slide .btn-slider-sm-outline');
  heroControls.forEach(ctrl => {
    ctrl.addEventListener('mouseenter', stopAutoplay);
    ctrl.addEventListener('mouseleave', startAutoplay);
  });

  if (slides.length > 0) {
    goToSlide(0);
    startAutoplay();
  }

  // =========================================================================
  // 5. Signature Developments Portfolio Filter
  // =========================================================================
  const devTabs = document.querySelectorAll('.dev-tab');
  const devCards = document.querySelectorAll('.dev-card');

  devTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      devTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter') || 'all';

      devCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // =========================================================================
  // 6. Lifestyle & Amenities Filter
  // =========================================================================
  const amenityTabs = document.querySelectorAll('.amenity-tab');
  const amenityCards = document.querySelectorAll('.amenity-card');

  amenityTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      amenityTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter') || 'all';

      amenityCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // =========================================================================
  // 7. Infrastructure & Landmark Developments Horizontal Carousel
  // =========================================================================
  const infraWrap = document.getElementById('infraTrackWrap') || document.querySelector('.infra-track-wrap');
  const infraPrev = document.getElementById('infraPrev');
  const infraNext = document.getElementById('infraNext');

  if (infraWrap && infraPrev && infraNext) {
    const getScrollAmount = () => {
      const card = infraWrap.querySelector('.infra-card');
      return card ? card.offsetWidth + 28 : 380;
    };

    infraPrev.addEventListener('click', (e) => {
      e.preventDefault();
      infraWrap.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    infraNext.addEventListener('click', (e) => {
      e.preventDefault();
      infraWrap.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    // Desktop Mouse Drag-to-Scroll
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    infraWrap.addEventListener('mousedown', (e) => {
      isDown = true;
      infraWrap.style.cursor = 'grabbing';
      startX = e.pageX - infraWrap.offsetLeft;
      scrollLeft = infraWrap.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        infraWrap.style.cursor = 'grab';
      }
    });

    infraWrap.addEventListener('mouseleave', () => {
      isDown = false;
      infraWrap.style.cursor = 'grab';
    });

    infraWrap.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - infraWrap.offsetLeft;
      const walk = (x - startX) * 1.5;
      infraWrap.scrollLeft = scrollLeft - walk;
    });
  }

  // =========================================================================
  // 8. Other Business Verticals Carousel (Smooth Scroll, Snap, Loop & Drag)
  // =========================================================================
  const vertContainer = document.getElementById('verticalsSliderContainer') || document.querySelector('.verticals-slider-container');
  const verticalsPrev = document.getElementById('verticalsPrev');
  const verticalsNext = document.getElementById('verticalsNext');
  const verticalsDots = document.querySelectorAll('.verticals-dot');

  if (vertContainer) {
    const cards = Array.from(vertContainer.querySelectorAll('.vertical-card'));

    const getScrollStep = () => {
      const card = cards[0];
      return card ? card.offsetWidth + 24 : 344;
    };

    const updateActiveDot = () => {
      const scrollLeft = vertContainer.scrollLeft;
      const maxScroll = vertContainer.scrollWidth - vertContainer.clientWidth;
      let activeIndex = 0;

      if (maxScroll > 10 && scrollLeft >= maxScroll - 25) {
        activeIndex = cards.length - 1;
      } else {
        let minDiff = Infinity;
        cards.forEach((card, idx) => {
          const cardLeft = card.offsetLeft - vertContainer.offsetLeft;
          const diff = Math.abs(cardLeft - scrollLeft);
          if (diff < minDiff) {
            minDiff = diff;
            activeIndex = idx;
          }
        });
      }

      verticalsDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeIndex);
      });
    };

    // Next button: scrolls to next card or wraps to start
    verticalsNext?.addEventListener('click', (e) => {
      e.preventDefault();
      const scrollLeft = vertContainer.scrollLeft;
      const maxScroll = vertContainer.scrollWidth - vertContainer.clientWidth;

      if (scrollLeft >= maxScroll - 20) {
        // At end -> smooth wrap back to start
        vertContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Find next card to the right
        const nextCard = cards.find(card => (card.offsetLeft - vertContainer.offsetLeft) > scrollLeft + 20);
        if (nextCard) {
          vertContainer.scrollTo({ left: nextCard.offsetLeft - vertContainer.offsetLeft, behavior: 'smooth' });
        } else {
          vertContainer.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
        }
      }
    });

    // Prev button: scrolls to prev card or wraps to end
    verticalsPrev?.addEventListener('click', (e) => {
      e.preventDefault();
      const scrollLeft = vertContainer.scrollLeft;
      const maxScroll = vertContainer.scrollWidth - vertContainer.clientWidth;

      if (scrollLeft <= 15) {
        // At start -> smooth wrap to end
        vertContainer.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        // Find previous card to the left
        const prevCards = cards.filter(card => (card.offsetLeft - vertContainer.offsetLeft) < scrollLeft - 20);
        if (prevCards.length > 0) {
          const prevCard = prevCards[prevCards.length - 1];
          vertContainer.scrollTo({ left: prevCard.offsetLeft - vertContainer.offsetLeft, behavior: 'smooth' });
        } else {
          vertContainer.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    });

    // Dot click navigation
    verticalsDots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        if (cards[idx]) {
          const targetLeft = cards[idx].offsetLeft - vertContainer.offsetLeft;
          vertContainer.scrollTo({ left: targetLeft, behavior: 'smooth' });
        }
      });
    });

    // Scroll listener with RAF throttling
    let isScrollTicking = false;
    vertContainer.addEventListener('scroll', () => {
      if (!isScrollTicking) {
        window.requestAnimationFrame(() => {
          updateActiveDot();
          isScrollTicking = false;
        });
        isScrollTicking = true;
      }
    }, { passive: true });

    // Desktop Mouse Drag-to-Scroll (free of smooth-scroll lag and ghost images)
    let isVertDown = false;
    let startVertX = 0;
    let scrollVertLeft = 0;

    vertContainer.addEventListener('mousedown', (e) => {
      isVertDown = true;
      vertContainer.style.cursor = 'grabbing';
      vertContainer.style.scrollBehavior = 'auto'; // Instant response during mouse drag
      vertContainer.style.scrollSnapType = 'none'; // Disable snapping while dragging
      startVertX = e.pageX - vertContainer.offsetLeft;
      scrollVertLeft = vertContainer.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (isVertDown) {
        isVertDown = false;
        vertContainer.style.cursor = 'grab';
        vertContainer.style.scrollBehavior = 'smooth';
        vertContainer.style.scrollSnapType = 'x mandatory';
        updateActiveDot();
      }
    });

    vertContainer.addEventListener('mouseleave', () => {
      if (isVertDown) {
        isVertDown = false;
        vertContainer.style.cursor = 'grab';
        vertContainer.style.scrollBehavior = 'smooth';
        vertContainer.style.scrollSnapType = 'x mandatory';
        updateActiveDot();
      }
    });

    vertContainer.addEventListener('mousemove', (e) => {
      if (!isVertDown) return;
      e.preventDefault();
      const x = e.pageX - vertContainer.offsetLeft;
      const walk = (x - startVertX);
      vertContainer.scrollLeft = scrollVertLeft - walk;
    });

    // Initial dot sync
    updateActiveDot();
  }

  // =========================================================================
  // 9. Voices of Trust Testimonials Slider
  // =========================================================================
  const tSlides = document.querySelectorAll('.testimonial-slide');
  const tTabs = document.querySelectorAll('.t-pill-tab');
  const tPrev = document.getElementById('tPrevBtn');
  const tNext = document.getElementById('tNextBtn');

  let currentTSlide = 0;
  const totalTSlides = tSlides.length;

  function showTSlide(index) {
    if (index < 0) index = totalTSlides - 1;
    if (index >= totalTSlides) index = 0;

    tSlides.forEach((s, i) => s.classList.toggle('active', i === index));
    tTabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === index);
      tab.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    currentTSlide = index;
  }

  tPrev?.addEventListener('click', () => showTSlide(currentTSlide - 1));
  tNext?.addEventListener('click', () => showTSlide(currentTSlide + 1));

  tTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.getAttribute('data-tab') || '0', 10);
      showTSlide(idx);
    });
  });

  // =========================================================================
  // 10. Modals: Site Visit & Cinematic Video Walkthrough
  // =========================================================================
  const visitModalOverlay = document.getElementById('visitModalOverlay');
  const visitModalClose = document.getElementById('visitModalClose');
  const openVisitBtns = document.querySelectorAll('.open-visit-btn');
  const visitProjectSelect = document.getElementById('visitProject');

  function openVisitModal(projectPrefill) {
    if (projectPrefill && visitProjectSelect) {
      for (let i = 0; i < visitProjectSelect.options.length; i++) {
        if (visitProjectSelect.options[i].value.toLowerCase().includes(projectPrefill.toLowerCase())) {
          visitProjectSelect.selectedIndex = i;
          break;
        }
      }
    }
    visitModalOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeVisitModal() {
    visitModalOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  openVisitBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const proj = btn.getAttribute('data-project') || '';
      openVisitModal(proj);
    });
  });

  visitModalClose?.addEventListener('click', closeVisitModal);
  visitModalOverlay?.addEventListener('click', (e) => {
    if (e.target === visitModalOverlay) closeVisitModal();
  });

  // Cinematic Video Modal
  const videoModalOverlay = document.getElementById('videoModalOverlay');
  const videoModalClose = document.getElementById('videoModalClose');
  const openVideoBtns = document.querySelectorAll('.open-video-modal');

  function openVideoModal() {
    videoModalOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    videoModalOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  openVideoBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openVideoModal();
    });
  });

  videoModalClose?.addEventListener('click', closeVideoModal);
  videoModalOverlay?.addEventListener('click', (e) => {
    if (e.target === videoModalOverlay) closeVideoModal();
  });

  // ESC key to close any active modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeVisitModal();
      closeVideoModal();
      closeDrawer();
    }
  });

  // =========================================================================
  // 11. WhatsApp Form Submission Handlers
  // =========================================================================
  function handleWhatsAppBooking(name, phone, email, project, date) {
    const phoneClean = (phone || '').replace(/\D/g, '');
    let msg = `*New Site Visit Request - Tirumala Nirmaan*%0A`;
    msg += `--------------------------------%0A`;
    msg += `*Name:* ${encodeURIComponent(name)}%0A`;
    msg += `*Phone:* ${encodeURIComponent(phone)}%0A`;
    if (email) msg += `*Email:* ${encodeURIComponent(email)}%0A`;
    msg += `*Interested Property:* ${encodeURIComponent(project)}%0A`;
    if (date) msg += `*Preferred Date:* ${encodeURIComponent(date)}%0A`;
    msg += `--------------------------------%0A`;
    msg += `Requested via thirumalaconstructions.com`;

    const waUrl = `https://wa.me/919849306675?text=${msg}`;
    window.open(waUrl, '_blank');
  }

  // On-page Visit Form
  const onpageForm = document.getElementById('onpageVisitForm');
  onpageForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('onpageName')?.value;
    const phone = document.getElementById('onpagePhone')?.value;
    const email = document.getElementById('onpageEmail')?.value;
    const project = document.getElementById('onpageProject')?.value;
    const date = document.getElementById('onpageDate')?.value;

    handleWhatsAppBooking(name, phone, email, project, date);
  });

  // Modal Visit Form
  const modalForm = document.getElementById('siteVisitForm');
  modalForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('visitName')?.value;
    const phone = document.getElementById('visitPhone')?.value;
    const project = document.getElementById('visitProject')?.value;
    const date = document.getElementById('visitDate')?.value;

    handleWhatsAppBooking(name, phone, '', project, date);
    closeVisitModal();
  });


  // =========================================================================
  // Full-Width Video Hero Playback & Audio Controls (Sattva Inspired)
  // =========================================================================
  const heroVideo = document.getElementById('heroVideo');
  const heroMuteToggle = document.getElementById('heroMuteToggle');
  const heroMuteIcon = document.getElementById('heroMuteIcon');
  const heroMuteText = document.getElementById('heroMuteText');
  const heroPlayToggle = document.getElementById('heroPlayToggle');
  const heroPlayIcon = document.getElementById('heroPlayIcon');
  const heroPlayText = document.getElementById('heroPlayText');

  if (heroVideo) {
    // Ensure autoplay starts properly
    heroVideo.play().catch(() => {
      // Autoplay with sound restricted, ensure muted
      heroVideo.muted = true;
      heroVideo.play().catch(() => {});
    });

    // Mute / Unmute Toggle
    heroMuteToggle?.addEventListener('click', () => {
      if (heroVideo.muted) {
        heroVideo.muted = false;
        if (heroMuteIcon) heroMuteIcon.className = 'fa-solid fa-volume-high';
        if (heroMuteText) heroMuteText.textContent = 'Mute';
      } else {
        heroVideo.muted = true;
        if (heroMuteIcon) heroMuteIcon.className = 'fa-solid fa-volume-xmark';
        if (heroMuteText) heroMuteText.textContent = 'Unmute';
      }
    });

    // Pause / Play Toggle
    heroPlayToggle?.addEventListener('click', () => {
      if (heroVideo.paused) {
        heroVideo.play();
        if (heroPlayIcon) heroPlayIcon.className = 'fa-solid fa-pause';
        if (heroPlayText) heroPlayText.textContent = 'Pause';
      } else {
        heroVideo.pause();
        if (heroPlayIcon) heroPlayIcon.className = 'fa-solid fa-play';
        if (heroPlayText) heroPlayText.textContent = 'Play';
      }
    });
  }

});
