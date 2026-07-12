// IMWIRSA — shared site behaviour

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
