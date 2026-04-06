/* ============================================================
   Solusi Optima Indonesia — Main Script
   ============================================================ */

'use strict';

/* ── Namespace ──────────────────────────────────────────────── */
const SOI = {};

/* ── DOM Ready ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  SOI.navbar.init();
  SOI.scrollReveal.init();
  SOI.portfolio.init();
  SOI.contact.init();
  SOI.smoothScroll.init();
  SOI.logoFallback.init();
});

/* ============================================================
   NAVBAR
   ============================================================ */
SOI.navbar = {
  el: null,
  hamburger: null,
  mobileMenu: null,

  init() {
    this.el          = document.getElementById('navbar');
    this.hamburger   = document.getElementById('nav-hamburger');
    this.mobileMenu  = document.getElementById('nav-mobile');

    if (!this.el) return;

    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    this.hamburger?.addEventListener('click', () => this.toggleMobile());
    this.mobileMenu?.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => this.closeMobile())
    );
    this.onScroll();
  },

  onScroll() {
    if (window.scrollY > 20) {
      this.el.classList.add('scrolled');
    } else {
      this.el.classList.remove('scrolled');
    }
  },

  toggleMobile() {
    const open = this.mobileMenu.classList.toggle('open');
    this.hamburger.classList.toggle('open', open);
    this.hamburger.setAttribute('aria-expanded', String(open));
  },

  closeMobile() {
    this.mobileMenu.classList.remove('open');
    this.hamburger.classList.remove('open');
    this.hamburger.setAttribute('aria-expanded', 'false');
  }
};

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
SOI.scrollReveal = {
  els: [],

  init() {
    this.els = document.querySelectorAll('.reveal');
    if (!this.els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    this.els.forEach(el => observer.observe(el));
  }
};

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
SOI.smoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const offset = 72; // navbar height
        const y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });
  }
};

/* ============================================================
   PORTFOLIO
   ============================================================ */
SOI.portfolio = {
  data: [],
  filtered: [],
  activeCategory: 'all',
  activeISO: 'all',
  searchQuery: '',

  async init() {
    try {
      const res = await fetch('data.json');
      if (!res.ok) throw new Error('Failed to load data.json');
      const json = await res.json();
      this.data = json.portfolio || [];
      this.filtered = [...this.data];
      this.render();
      this.bindControls();
    } catch (err) {
      console.error('Portfolio data error:', err);
      this.renderError();
    }
  },

  bindControls() {
    // Category filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.dataset.filter;
        this.activeISO = 'all';
        const isoSelect = document.getElementById('iso-filter');
        if (isoSelect) isoSelect.value = 'all';
        this.applyFilters();
      });
    });

    // ISO dropdown
    const isoSelect = document.getElementById('iso-filter');
    if (isoSelect) {
      isoSelect.addEventListener('change', () => {
        this.activeISO = isoSelect.value;
        if (this.activeISO !== 'all') {
          this.activeCategory = 'iso';
          document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.filter === 'iso');
          });
        }
        this.applyFilters();
      });
    }

    // Search
    const searchInput = document.getElementById('portfolio-search');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.searchQuery = searchInput.value.trim().toLowerCase();
          this.applyFilters();
        }, 220);
      });
    }
  },

  applyFilters() {
    this.filtered = this.data.filter(item => {
      // Category
      if (this.activeCategory === 'iso' && !item.category.includes('ISO')) return false;
      if (this.activeCategory === 'audit' && !item.category.includes('IT Audit')) return false;
      if (this.activeCategory === 'training' && !item.category.includes('Training')) return false;

      // ISO type
      if (this.activeISO !== 'all') {
        if (!item.isoType || item.isoType !== this.activeISO) return false;
      }

      // Search
      if (this.searchQuery) {
        const haystack = [
          item.company, item.category, item.description, item.isoType || '',
          ...(item.tags || [])
        ].join(' ').toLowerCase();
        if (!haystack.includes(this.searchQuery)) return false;
      }

      return true;
    });

    this.render();
  },

  render() {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    if (!this.filtered.length) {
      grid.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🔍</div>
          <p>No projects found matching your criteria.</p>
        </div>`;
      return;
    }

    grid.innerHTML = this.filtered.map((item, i) => this.cardHTML(item, i)).join('');
  },

  cardHTML(item, index) {
    const badgeClass = item.category.includes('ISO') ? 'badge-iso'
                     : item.category.includes('IT Audit') ? 'badge-audit'
                     : 'badge-train';
    const catLabel  = item.category.includes('ISO') ? 'ISO Consulting'
                    : item.category.includes('IT Audit') ? 'IT Audit'
                    : 'Training';
    const isoLine   = item.isoType
      ? `<div class="card-iso-type">${item.isoType}</div>`
      : '';
    const tags = (item.tags || [])
      .map(t => `<span class="card-tag">${t}</span>`)
      .join('');

    return `
      <article class="portfolio-card" style="animation-delay:${index * 0.05}s">
        <div class="card-top">
          <span class="card-cat-badge ${badgeClass}">${catLabel}</span>
          <span class="card-year">${item.year}</span>
        </div>
        <h3 class="card-company">${item.company}</h3>
        ${isoLine}
        <p class="card-desc">${item.description}</p>
        <div class="card-tags">${tags}</div>
      </article>`;
  },

  renderError() {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">⚠️</div>
        <p>Unable to load portfolio data. Please ensure data.json is present.</p>
      </div>`;
  }
};

/* ============================================================
   CONTACT FORM
   ============================================================ */
SOI.contact = {
  init() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Simulate form submission
      const btn = form.querySelector('.btn-submit');
      btn.textContent = 'Sending…';
      btn.disabled = true;

      setTimeout(() => {
        form.style.display = 'none';
        document.getElementById('form-success').style.display = 'block';
      }, 1200);
    });
  }
};

/* ============================================================
   LOGO FALLBACK
   ============================================================ */
SOI.logoFallback = {
  init() {
    document.querySelectorAll('img[data-logo]').forEach(img => {
      img.addEventListener('error', function() {
        this.style.display = 'none';
        const fallback = this.nextElementSibling;
        if (fallback) fallback.style.display = 'block';
      });
    });
  }
};
