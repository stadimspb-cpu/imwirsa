// IMWIRSA — shared site behaviour

// Language toggle for bilingual commentary pages
document.querySelectorAll('.lang-toggle-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;
    document.querySelectorAll('.lang-toggle-btn').forEach((b) => b.classList.toggle('active', b === btn));
    document.querySelectorAll('[data-lang-content]').forEach((el) => {
      el.style.display = (el.dataset.langContent === lang) ? '' : 'none';
    });
    const anchor = document.getElementById('commentary-body');
    if (anchor) window.scrollTo({ top: anchor.offsetTop - 90, behavior: 'smooth' });
  });
});

// Footer language switcher (EN/RU). The site currently mixes two bilingual
// patterns:
//   1. In-page toggle — a <button class="lang-toggle-btn" data-lang="..">
//      that shows/hides [data-lang-content] blocks (Commentary pages,
//      the port questionnaire). Same URL, same file.
//   2. Separate-file toggle — an <a class="lang-toggle-btn" href="...">
//      linking page.html <-> page-ru.html (Home, Contact, Review section).
// The footer buttons live on every page regardless of which pattern that
// page uses, so they need to detect which one applies rather than assuming.
document.querySelectorAll('.footer-lang').forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetLang = btn.dataset.footerLang;
    if (!targetLang) return;

    // Pattern 1: an in-page toggle button already exists for this language —
    // just click it instead of navigating anywhere.
    const inPageBtn = document.querySelector(`button.lang-toggle-btn[data-lang="${targetLang}"]`);
    if (inPageBtn) {
      inPageBtn.click();
      return;
    }

    // Pattern 2: separate files. Derive the sibling URL for the current page
    // (page.html <-> page-ru.html) and jump there, preserving any #hash.
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const hash = window.location.hash || '';
    const isRuPage = /-ru\.html$/i.test(path);
    const basePage = isRuPage ? path.replace(/-ru\.html$/i, '.html') : path;
    const targetPage = targetLang === 'ru' ? basePage.replace(/\.html$/i, '-ru.html') : basePage;

    if (targetPage !== path) window.location.href = targetPage + hash;
  });

  // Reflect the current page's language as "active" on load, for both patterns.
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const isRuPage = /-ru\.html$/i.test(path);
  const htmlLang = document.documentElement.getAttribute('lang');
  const currentLang = isRuPage || htmlLang === 'ru' ? 'ru' : 'en';
  btn.classList.toggle('active', btn.dataset.footerLang === currentLang);
});

// Navbar background on scroll
const navbar = document.getElementById('navbar');
if (navbar) {
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll);
  onScroll();
}

// Mobile burger menu
const burger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
}

// Dropdown toggle (click-based, works for touch + keyboard; hover still works via CSS on desktop)
document.querySelectorAll('.nav-links > li').forEach((li) => {
  const link = li.querySelector(':scope > a');
  const dropdown = li.querySelector(':scope > .dropdown');
  if (!dropdown || !link) return;

  link.addEventListener('click', (e) => {
    // Only intercept on mobile widths, or if the top-level link has no real page (href="#")
    if (window.innerWidth <= 768) {
      e.preventDefault();
      const isOpen = li.classList.contains('open');
      document.querySelectorAll('.nav-links > li.open').forEach((el) => el.classList.remove('open'));
      if (!isOpen) li.classList.add('open');
    }
  });
});

// Close mobile menu when a real link inside dropdown is clicked
document.querySelectorAll('.dropdown a, .nav-links > li > a.no-dropdown').forEach((a) => {
  a.addEventListener('click', () => {
    if (navLinks) navLinks.classList.remove('open');
    if (burger) burger.classList.remove('active');
  });
});

// Scroll reveal animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

// Highlight active nav item based on current page
(() => {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const hrefPage = href.split('#')[0];
    if (hrefPage && hrefPage === path) a.classList.add('active');
  });
})();
