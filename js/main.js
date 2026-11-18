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
    const target = projectName ? `contact?project=${encodeURIComponent(projectName)}#site-visit-form` : 'contact#site-visit-form';
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

  // Auto-center project cards (1 card, 2 cards, or lone last card in row)
  function alignProjectGrids() {
    const grids = document.querySelectorAll('.projects-grid');
    const width = window.innerWidth;

    grids.forEach(grid => {
      const cards = Array.from(grid.querySelectorAll('.project-card'));
      if (!cards.length) return;

      // Reset previous alignments and classes
      grid.classList.remove('is-centered-1', 'is-centered-2');
      grid.style.gridTemplateColumns = '';
      grid.style.justifyContent = '';

      cards.forEach(card => {
        card.style.gridColumn = '';
        card.style.justifySelf = '';
        card.style.maxWidth = '';
        card.style.width = '';
      });

      // Filter to cards currently visible
      const visibleCards = cards.filter(card => {
        const style = window.getComputedStyle(card);
        return card.style.display !== 'none' && style.display !== 'none' && style.visibility !== 'hidden';
      });

      const count = visibleCards.length;
      if (count === 0) return;

      if (width >= 1024) {
        // Desktop (>= 1024px, 3-column base)
        if (count === 1) {
          grid.classList.add('is-centered-1');
          grid.style.gridTemplateColumns = 'minmax(0, 390px)';
          grid.style.justifyContent = 'center';
        } else if (count === 2) {
          grid.classList.add('is-centered-2');
          grid.style.gridTemplateColumns = 'repeat(2, minmax(0, 390px))';
          grid.style.justifyContent = 'center';
        } else {
          grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
          grid.style.justifyContent = '';
          // If the last row has exactly 1 lone card (e.g. 4, 7, 10, 13, 16 cards), center it in column 2
          if (count % 3 === 1) {
            visibleCards[count - 1].style.gridColumn = '2';
          }
        }
      } else if (width >= 768) {
        // Tablet (768px - 1023px, 2-column base)
        if (count === 1) {
          grid.classList.add('is-centered-1');
          grid.style.gridTemplateColumns = 'minmax(0, 390px)';
          grid.style.justifyContent = 'center';
        } else {
          grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
          grid.style.justifyContent = '';
          // If odd number of cards (e.g. 3, 5, 7), center the last orphan card
          if (count % 2 === 1) {
            const lastCard = visibleCards[count - 1];
            lastCard.style.gridColumn = '1 / -1';
            lastCard.style.justifySelf = 'center';
            lastCard.style.width = '100%';
            lastCard.style.maxWidth = 'calc(50% - 1rem)';
          }
        }
      } else {
        // Mobile (< 768px): 1-column natural flow
        grid.style.gridTemplateColumns = '';
        grid.style.justifyContent = '';
      }
    });
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

        // Re-align project grids after filtering
        alignProjectGrids();
      });
    });
  });

  alignProjectGrids();
  window.addEventListener('resize', alignProjectGrids, { passive: true });

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

  // Real PHP Form Submission Handler (AJAX with Graceful Fallback)
  const forms = document.querySelectorAll('form[data-ajax="lead"], form.lead-capture-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalHtml = submitBtn ? submitBtn.innerHTML : 'Submit Request';
      
      // Ensure feedback element exists
      let feedback = form.querySelector('.form-feedback');
      if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'form-feedback';
        form.appendChild(feedback);
      }
      feedback.style.display = 'none';
      feedback.innerHTML = '';

      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
      }

      const actionUrl = form.getAttribute('action') || 'process-form.php';
      const formData = new FormData(form);
      if (!formData.has('ajax')) {
        formData.append('ajax', '1');
      }

      fetch(actionUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => {
        return response.json().then(data => ({
          status: response.status,
          ok: response.ok,
          data: data
        })).catch(() => ({
          status: response.status,
          ok: response.ok,
          data: { message: response.ok ? 'Thank you! Your request has been received.' : 'Submission error occurred.' }
        }));
      })
      .then(result => {
        if (result.ok && result.data.status !== 'error') {
          feedback.style.display = 'block';
          feedback.innerHTML = `
            <div style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 1.15rem 1.25rem; border-radius: 8px; margin-top: 1.25rem; display: flex; align-items: flex-start; gap: 0.75rem;">
              <i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 1.35rem; margin-top: 2px;"></i>
              <div>
                <strong style="font-size: 1rem; color: #065f46;">Request Received!</strong>
                <p style="margin: 0.35rem 0 0; font-size: 0.925rem; color: #047857; line-height: 1.5;">
                  ${result.data.message || 'Thank you for contacting Thirumala Constructions! Our senior civil engineer will call you shortly.'}
                </p>
              </div>
            </div>`;
          form.reset();
        } else {
          feedback.style.display = 'block';
          feedback.innerHTML = `
            <div style="background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; padding: 1rem 1.25rem; border-radius: 8px; margin-top: 1.25rem; display: flex; align-items: flex-start; gap: 0.75rem;">
              <i class="fa-solid fa-circle-exclamation" style="color: #ef4444; font-size: 1.35rem; margin-top: 2px;"></i>
              <div>
                <strong style="font-size: 0.95rem; color: #991b1b;">Please check your input:</strong>
                <p style="margin: 0.25rem 0 0; font-size: 0.9rem; color: #b91c1c;">
                  ${result.data.message || 'Please check the required fields and try again.'}
                </p>
              </div>
            </div>`;
        }
      })
      .catch(err => {
        console.warn('AJAX submission error, submitting via standard POST:', err);
        // Fallback to normal form submission if fetch completely fails (e.g. offline)
        form.submit();
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.innerHTML = originalHtml;
          submitBtn.disabled = false;
        }
      });
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

