/**
 * THIRUMALA CONSTRUCTIONS & DEVELOPERS (Tirumala Nirmaan)
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

  // Global helper fallback: redirect to contact page form
  window.openEnquiry = function(projectName = '') {
    const target = projectName ? `contact.html?project=${encodeURIComponent(projectName)}#site-visit-form` : 'contact.html#site-visit-form';
    window.location.href = target;
  };

  // Auto-select Project in Contact Form if passed via URL parameter
  const projectSelect = document.getElementById('cProject');
  if (projectSelect) {
    const urlParams = new URLSearchParams(window.location.search);
    const projQuery = urlParams.get('project');
    if (projQuery) {
      const q = projQuery.toLowerCase();
      for (let i = 0; i < projectSelect.options.length; i++) {
        const optVal = projectSelect.options[i].value.toLowerCase();
        const optText = projectSelect.options[i].text.toLowerCase();
        if (optVal.includes(q) || optText.includes(q) || q.includes(optVal)) {
          projectSelect.selectedIndex = i;
          break;
        }
      }
    }
  }

  // Auto-center lone last project card on homepage Featured Developments
  function alignFeaturedLastCard() {
    const featuredGrid = document.querySelector('#featured-projects .projects-grid');
    if (!featuredGrid) return;

    const cards = Array.from(featuredGrid.querySelectorAll('.project-card'));
    cards.forEach(card => {
      card.style.gridColumn = '';
      card.style.justifySelf = '';
      card.style.maxWidth = '';
      card.style.width = '';
    });

    const visibleCards = cards.filter(card => {
      return card.style.display !== 'none' && window.getComputedStyle(card).display !== 'none';
    });

    if (visibleCards.length === 0) return;

    const lastCard = visibleCards[visibleCards.length - 1];
    const width = window.innerWidth;

    if (width >= 1024) {
      // 3 columns: if last row has exactly 1 card, center in column 2
      if (visibleCards.length % 3 === 1) {
        lastCard.style.gridColumn = '2';
      } else {
        lastCard.style.gridColumn = 'auto';
      }
    } else if (width >= 768) {
      // 2 columns: if last row has exactly 1 card, span and center
      if (visibleCards.length % 2 === 1) {
        lastCard.style.gridColumn = '1 / -1';
        lastCard.style.justifySelf = 'center';
        lastCard.style.width = '100%';
        lastCard.style.maxWidth = 'calc(50% - 1rem)';
      } else {
        lastCard.style.gridColumn = 'auto';
      }
    }
  }

  // Project Filtering (for projects.html and homepage tabs)
  const filterTabsGroups = document.querySelectorAll('.filter-tabs');

  filterTabsGroups.forEach(group => {
    const filterBtns = group.querySelectorAll('.filter-btn');
    const parentSection = group.closest('section') || document;
    const projectCards = parentSection.querySelectorAll('.project-card[data-category]');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = (btn.getAttribute('data-filter') || 'all').toLowerCase();

        projectCards.forEach(card => {
          const cat = (card.getAttribute('data-category') || '').toLowerCase();
          const status = (card.getAttribute('data-status') || '').toLowerCase();
          
          let match = false;
          if (filter === 'all') {
            match = true;
          } else if (filter === 'ongoing') {
            match = status === 'ongoing' || cat.includes('ongoing');
          } else if (filter === 'upcoming') {
            match = status === 'upcoming' || cat.includes('upcoming');
          } else if (filter === 'commercial') {
            match = status === 'commercial' || cat.includes('commercial');
          } else if (filter === 'completed') {
            match = status === 'completed' || cat.includes('completed');
          } else {
            match = cat.includes(filter) || status === filter;
          }

          if (match) {
            card.style.display = 'flex';
            card.style.animation = 'fadeInUp 0.35s ease forwards';
          } else {
            card.style.display = 'none';
          }
        });

        // Re-align featured developments grid after filtering
        alignFeaturedLastCard();
      });
    });
  });

  alignFeaturedLastCard();
  window.addEventListener('resize', alignFeaturedLastCard, { passive: true });

  // Interactive EMI Calculator
  const loanSlider = document.getElementById('loanAmount');
  const interestSlider = document.getElementById('interestRate');
  const tenureSlider = document.getElementById('loanTenure');

  const loanVal = document.getElementById('loanAmountVal');
  const interestVal = document.getElementById('interestRateVal');
  const tenureVal = document.getElementById('loanTenureVal');

  const emiOutput = document.getElementById('monthlyEMI');
  const principalOutput = document.getElementById('totalPrincipal');
  const interestOutput = document.getElementById('totalInterest');
  const totalPayableOutput = document.getElementById('totalPayable');

  function calculateEMI() {
    if (!loanSlider || !interestSlider || !tenureSlider) return;

    const principal = parseFloat(loanSlider.value);
    const annualRate = parseFloat(interestSlider.value);
    const tenureYears = parseFloat(tenureSlider.value);

    // Update displays
    if (loanVal) loanVal.textContent = `₹ ${(principal / 100000).toFixed(1)} Lakhs`;
    if (interestVal) interestVal.textContent = `${annualRate.toFixed(1)} %`;
    if (tenureVal) tenureVal.textContent = `${tenureYears} Years`;

    const monthlyRate = (annualRate / 12) / 100;
    const months = tenureYears * 12;

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    const totalInterestPayable = totalPayment - principal;

    if (emiOutput) emiOutput.textContent = `₹ ${Math.round(emi).toLocaleString('en-IN')}`;
    if (principalOutput) principalOutput.textContent = `₹ ${Math.round(principal).toLocaleString('en-IN')}`;
    if (interestOutput) interestOutput.textContent = `₹ ${Math.round(totalInterestPayable).toLocaleString('en-IN')}`;
    if (totalPayableOutput) totalPayableOutput.textContent = `₹ ${Math.round(totalPayment).toLocaleString('en-IN')}`;
  }

  if (loanSlider && interestSlider && tenureSlider) {
    loanSlider.addEventListener('input', calculateEMI);
    interestSlider.addEventListener('input', calculateEMI);
    tenureSlider.addEventListener('input', calculateEMI);
    calculateEMI(); // initial calculation
  }

  // Interactive Form Submissions (Mock with Toast Confirmation)
  const forms = document.querySelectorAll('form[data-ajax="lead"]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';
      
      if (submitBtn) {
        submitBtn.innerHTML = 'Submitting...';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        alert('Thank you for contacting Thirumala Constructions & Developers! Our senior consultant will call you shortly at the provided number.');
        form.reset();
        if (submitBtn) {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      }, 700);
    });
  });

  // Sticky Header Measurement & Dynamic Offset Handling
  const siteHeader = document.querySelector('.site-header');
  function updateStickyHeader() {
    if (siteHeader) {
      const h = siteHeader.offsetHeight;
      document.documentElement.style.setProperty('--site-header-h', `${h}px`);
    }
  }
  updateStickyHeader();
  window.addEventListener('resize', updateStickyHeader, { passive: true });
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
    updateStickyHeader();
  }, { passive: true });

  // ScrollSpy for Project Detail In-Page Navigation (.pdetail-subnav)
  const subnavLinks = document.querySelectorAll('.pdetail-subnav-link');
  if (subnavLinks.length > 0) {
    const sections = [];
    subnavLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const sec = document.querySelector(href);
        if (sec) sections.push({ link, sec, id: href });
      }
    });

    window.addEventListener('scroll', () => {
      const headerH = siteHeader ? siteHeader.offsetHeight : 70;
      const scrollPos = window.scrollY + headerH + 65;
      let currentLink = null;

      sections.forEach(({ link, sec }) => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentLink = link;
        }
      });

      if (currentLink) {
        subnavLinks.forEach(l => l.classList.remove('active'));
        currentLink.classList.add('active');

        // Auto-center active subnav link on mobile devices
        const subnavList = document.querySelector('.pdetail-subnav-list');
        if (subnavList) {
          const linkLeft = currentLink.offsetLeft;
          const linkWidth = currentLink.offsetWidth;
          const listWidth = subnavList.offsetWidth;
          if (linkLeft < subnavList.scrollLeft || linkLeft + linkWidth > subnavList.scrollLeft + listWidth) {
            subnavList.scrollTo({
              left: linkLeft - (listWidth / 2) + (linkWidth / 2),
              behavior: 'smooth'
            });
          }
        }
      }
    }, { passive: true });
  }

  // FAQ Accordion Toggle
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close other accordion items for clean single-expanded view
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherHeader = otherItem.querySelector('.faq-header');
          if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      if (isActive) {
        item.classList.remove('active');
        header.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });
});

