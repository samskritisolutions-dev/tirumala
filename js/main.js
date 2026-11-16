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
      });
    });
  });

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

  // Sticky header class toggle
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

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

