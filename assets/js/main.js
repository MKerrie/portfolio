// ========================================
// MAIN.JS - Portfolio Kerim Örgü
// ========================================

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initScrollEffects();
  initAnimations();
  initThemeToggle();
  initTouchEvents();
  setCurrentYear();
});

// ========================================
// NAVIGATION
// ========================================
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const navLinks = document.querySelectorAll('a[href^="#"]');

  // Scroll effect for navbar (throttled)
  let lastScroll = 0;
  let navTicking = false;
  window.addEventListener('scroll', () => {
    if (!navTicking) {
      requestAnimationFrame(() => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
          navbar.classList.add('shadow-xl');
        } else {
          navbar.classList.remove('shadow-xl');
        }
        lastScroll = currentScroll;
        navTicking = false;
      });
      navTicking = true;
    }
  }, { passive: true });

  // Open mobile menu
  function openMobileMenu() {
    mobileMenuBtn.classList.add('active');
    mobileMenu.classList.add('active');
    if (mobileOverlay) mobileOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
  }

  // Close mobile menu
  function closeMobileMenu() {
    mobileMenuBtn.classList.remove('active');
    mobileMenu.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
  }

  // Modern burger menu toggle
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const isActive = mobileMenuBtn.classList.contains('active');
      if (isActive) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  // Close button
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }

  // Close on overlay click
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  // Close on link click in mobile menu
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // Smooth scrolling for all anchor links
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;

      e.preventDefault();
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        // Close mobile menu if open
        closeMobileMenu();

        // Smooth scroll to target
        const navbarHeight = navbar.offsetHeight;
        const targetPosition = targetElement.offsetTop - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update active state
        updateActiveNavLink(targetId);
      }
    });
  });

  // Update active nav link on scroll (throttled)
  let activeNavTicking = false;
  window.addEventListener('scroll', () => {
    if (!activeNavTicking) {
      requestAnimationFrame(() => {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.pageYOffset + navbar.offsetHeight + 100;

        sections.forEach(section => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          const sectionId = '#' + section.getAttribute('id');

          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            updateActiveNavLink(sectionId);
          }
        });
        activeNavTicking = false;
      });
      activeNavTicking = true;
    }
  }, { passive: true });
}

function updateActiveNavLink(targetId) {
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    if (link.getAttribute('href') === targetId) {
      link.classList.add('text-primary-600');
      link.classList.remove('text-gray-700');
    } else {
      link.classList.remove('text-primary-600');
      link.classList.add('text-gray-700');
    }
  });
}

// ========================================
// SCROLL EFFECTS
// ========================================
function initScrollEffects() {
  // Back to top button
  const backToTop = document.getElementById('backToTop');

  let backToTopTicking = false;
  window.addEventListener('scroll', () => {
    if (!backToTopTicking) {
      requestAnimationFrame(() => {
        if (window.pageYOffset > 500) {
          backToTop.classList.remove('opacity-0', 'pointer-events-none');
          backToTop.classList.add('opacity-100');
        } else {
          backToTop.classList.add('opacity-0', 'pointer-events-none');
          backToTop.classList.remove('opacity-100');
        }
        backToTopTicking = false;
      });
      backToTopTicking = true;
    }
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Parallax effect for hero section (throttled)
  let parallaxTicking = false;
  window.addEventListener('scroll', () => {
    if (!parallaxTicking) {
      requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        if (scrolled < window.innerHeight) {
          const heroSection = document.querySelector('#home');
          if (heroSection) {
            const heroContent = heroSection.querySelector('.container');
            if (heroContent) {
              heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
              heroContent.style.opacity = 1 - (scrolled / 700);
            }
          }
        }
        parallaxTicking = false;
      });
      parallaxTicking = true;
    }
  }, { passive: true });
}

// ========================================
// ANIMATIONS
// ========================================
function initAnimations() {
  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all sections
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    observer.observe(section);
  });

  // Skill bars animation
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const skillBar = entry.target.querySelector('[class*="bg-gradient"]');
        if (skillBar && !skillBar.classList.contains('animated')) {
          skillBar.classList.add('animated');
          const width = skillBar.style.width;
          skillBar.style.width = '0%';

          setTimeout(() => {
            skillBar.style.width = width;
          }, 200);
        }
      }
    });
  }, { threshold: 0.5 });

  const skillCards = document.querySelectorAll('#skills .bg-gray-50');
  skillCards.forEach(card => skillObserver.observe(card));

  // Stats counter animation
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumbers = entry.target.querySelectorAll('[class*="text-3xl"]');
        statNumbers.forEach(stat => {
          if (!stat.classList.contains('counted')) {
            stat.classList.add('counted');
            animateCounter(stat);
          }
        });
      }
    });
  }, { threshold: 0.5 });

  const statsContainer = document.querySelector('#about .grid-cols-3');
  if (statsContainer) {
    statsObserver.observe(statsContainer);
  }

  // Project cards hover effect
  const projectCards = document.querySelectorAll('#projects .group');
  projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px)';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
}

function animateCounter(element) {
  const text = element.textContent;
  const hasPlus = text.includes('+');
  const number = parseInt(text.replace(/[^0-9]/g, ''));

  let current = 0;
  const increment = number / 50; // 50 steps
  const duration = 1500; // 1.5 seconds
  const stepTime = duration / 50;

  const counter = setInterval(() => {
    current += increment;

    if (current >= number) {
      current = number;
      clearInterval(counter);
    }

    if (text.includes('%')) {
      element.textContent = Math.floor(current) + '%';
    } else if (hasPlus) {
      element.textContent = Math.floor(current) + '+';
    } else {
      element.textContent = Math.floor(current);
    }
  }, stepTime);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function setCurrentYear() {
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// Smooth scroll polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
  const scrollToOptions = window.Element.prototype.scrollTo;

  window.Element.prototype.scrollTo = function(options) {
    if (typeof options !== 'object') {
      return scrollToOptions.apply(this, arguments);
    }

    const { top, left, behavior } = options;

    if (behavior === 'smooth') {
      window.scroll({
        top: top || 0,
        left: left || 0,
        behavior: 'smooth'
      });
    } else {
      scrollToOptions.call(this, options);
    }
  };
}

// ========================================
// DARK MODE TOGGLE
// ========================================
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const themeToggleMobile = document.getElementById('themeToggleMobile');
  const html = document.documentElement;

  // Check for saved theme preference or default to 'light' mode
  const currentTheme = localStorage.getItem('theme') || 'light';

  if (currentTheme === 'dark') {
    html.classList.add('dark');
    themeToggle.classList.add('dark-mode');
    themeToggleMobile.classList.add('dark-mode');
    updateIcon(themeToggle, true);
    updateIcon(themeToggleMobile, true);
  }

  // Toggle theme function
  function toggleTheme() {
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');

    // Save preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Update both toggles
    themeToggle.classList.toggle('dark-mode', isDark);
    themeToggleMobile.classList.toggle('dark-mode', isDark);
    updateIcon(themeToggle, isDark);
    updateIcon(themeToggleMobile, isDark);
  }

  // Update icon with smooth animation
  function updateIcon(button, isDark) {
    const icon = button.querySelector('i');
    const isMobile = button.id === 'themeToggleMobile';
    const iconSize = isMobile ? 'text-lg' : 'text-xl';

    // Exit animation (fade out + scale down)
    icon.style.animation = 'iconExit 0.3s ease-in-out forwards';

    setTimeout(() => {
      // Change icon while invisible
      if (isDark) {
        icon.className = `bi bi-moon-fill text-yellow-400 ${iconSize}`;
      } else {
        icon.className = `bi bi-sun-fill text-yellow-500 ${iconSize}`;
      }

      // Enter animation (fade in + scale up)
      icon.style.animation = 'iconEnter 0.3s ease-in-out forwards';

      // Clear animation after completion
      setTimeout(() => {
        icon.style.animation = '';
      }, 300);
    }, 300);

    // Update aria-pressed for accessibility
    button.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  }

  // Add visual click feedback
  function addClickFeedback(button) {
    button.style.transform = 'scale(0.9)';
    setTimeout(() => {
      button.style.transform = '';
    }, 150);
  }

  // Event listeners with click feedback
  themeToggle.addEventListener('click', () => {
    toggleTheme();
    addClickFeedback(themeToggle);
  });

  themeToggleMobile.addEventListener('click', () => {
    toggleTheme();
    addClickFeedback(themeToggleMobile);
  });
}

// ========================================
// TOUCH EVENTS FOR MOBILE
// ========================================
function initTouchEvents() {
  // Check if device supports touch
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isTouchDevice) {
    // Skill Flip Cards - Toggle on tap for mobile
    const skillCards = document.querySelectorAll('.skill-flip-card');

    skillCards.forEach(card => {
      let isFlipped = false;

      function toggleFlip(el) {
        isFlipped = !isFlipped;
        el.classList.toggle('flipped', isFlipped);
      }

      card.addEventListener('click', function(e) {
        e.preventDefault();
        toggleFlip(this);
      });

      // Keyboard support (Enter/Space)
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFlip(this);
        }
      });
    });

    // Prevent hover effects on touch devices
    document.body.classList.add('touch-device');

    // Smooth scroll behavior for mobile
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
          const offsetTop = target.offsetTop - 80; // Account for fixed header
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Handle orientation change
  window.addEventListener('orientationchange', function() {
    setTimeout(function() {
      window.scrollTo(0, window.pageYOffset);
    }, 100);
  });

  // Prevent zoom on input focus (iOS)
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.style.fontSize = '16px';
    });
  });
}

// ========================================
// VIEWPORT HEIGHT FIX FOR MOBILE
// ========================================
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set on load and resize
window.addEventListener('load', setViewportHeight);
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);

