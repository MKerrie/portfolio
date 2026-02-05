// ========================================
// ULTRA MODERN ANIMATIONS.JS
// Premium Animation System - Performance Optimized
// ========================================

// Performance utilities
const throttle = (fn, wait) => {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
};

const debounce = (fn, delay) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
};

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', function() {
  // Critical animations first
  initScrollRevealAnimations();
  initStaggerAnimations();
  initCounters();

  // Non-critical animations - defer if possible
  if (!prefersReducedMotion) {
    requestAnimationFrame(() => {
      initParallaxEffects();
      initMagneticElements();
      initTiltEffect();
      initTypewriterEffect();
      initSmoothScroll();
      initScrollProgress();

      // Heavy animations - use requestIdleCallback if available
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          initCursorFollower();
          initParticles();
        }, { timeout: 2000 });
      } else {
        setTimeout(() => {
          initCursorFollower();
          initParticles();
        }, 1000);
      }
    });
  }
});

// ========================================
// SCROLL REVEAL ANIMATIONS
// ========================================
function initScrollRevealAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const delay = element.dataset.delay || 0;

        setTimeout(() => {
          element.classList.add('active');
          element.classList.add('reveal-active');
        }, delay);

        revealObserver.unobserve(element);
      }
    });
  }, observerOptions);

  // Observe reveal elements
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el, index) => {
    el.dataset.delay = index * 100;
    revealObserver.observe(el);
  });

  // Observe cards
  document.querySelectorAll('.reveal-card').forEach((card, index) => {
    card.dataset.delay = index * 150;
    revealObserver.observe(card);
  });

  // Observe sections
  document.querySelectorAll('section').forEach((section, index) => {
    if (!section.classList.contains('reveal')) {
      section.classList.add('reveal-element');
      section.dataset.delay = 0;
      revealObserver.observe(section);
    }
  });
}

// ========================================
// PARALLAX EFFECTS
// ========================================
function initParallaxEffects() {
  const heroSection = document.querySelector('#home');
  if (!heroSection) return;

  const heroContent = heroSection.querySelector('.hero-content');
  const heroBackground = heroSection.querySelector('.hero-background');
  const floatingElements = document.querySelectorAll('.floating-element');

  // Add will-change for better performance
  if (heroContent) heroContent.style.willChange = 'transform, opacity';
  if (heroBackground) heroBackground.style.willChange = 'transform';
  floatingElements.forEach(el => el.style.willChange = 'transform');

  let ticking = false;

  const updateParallax = () => {
    const scrolled = window.pageYOffset;

    // Hero parallax - only when visible
    if (scrolled < window.innerHeight) {
      if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.4}px)`;
        heroContent.style.opacity = Math.max(0, 1 - (scrolled / 700));
      }

      if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.2}px)`;
      }
    }

    // Floating elements parallax
    floatingElements.forEach((el, i) => {
      el.style.transform = `translateY(${Math.sin(scrolled * 0.01 + i) * 20}px)`;
    });

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}

// ========================================
// MAGNETIC ELEMENTS
// ========================================
function initMagneticElements() {
  const magneticElements = document.querySelectorAll('.magnetic, .magnetic-button');

  magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });
}

// ========================================
// 3D TILT EFFECT
// ========================================
function initTiltEffect() {
  const tiltElements = document.querySelectorAll('.tilt-card, .project-card');

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;

      el.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(1.02, 1.02, 1.02)
      `;

      // Move shine effect
      const shine = el.querySelector('.shine-overlay');
      if (shine) {
        shine.style.background = `
          radial-gradient(
            circle at ${x}px ${y}px,
            rgba(255,255,255,0.2) 0%,
            transparent 80%
          )
        `;
      }
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });
}

// ========================================
// TYPEWRITER EFFECT
// ========================================
function initTypewriterEffect() {
  const typewriterElements = document.querySelectorAll('.typewriter-text');

  typewriterElements.forEach(el => {
    const text = el.dataset.text || el.textContent;
    const speed = parseInt(el.dataset.speed) || 80;
    el.textContent = '';
    el.style.opacity = '1';

    let charIndex = 0;

    function typeChar() {
      if (charIndex < text.length) {
        el.textContent += text.charAt(charIndex);
        charIndex++;
        setTimeout(typeChar, speed);
      } else {
        // Add blinking cursor
        el.classList.add('typing-done');
      }
    }

    // Start typing when element is visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(typeChar, 500);
          observer.unobserve(el);
        }
      });
    });

    observer.observe(el);
  });

  // Rotating text effect
  const rotatingTexts = document.querySelectorAll('.rotating-text');
  rotatingTexts.forEach(el => {
    const texts = JSON.parse(el.dataset.texts || '[]');
    if (texts.length === 0) return;

    let currentIndex = 0;

    function rotateText() {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-20px)';

      setTimeout(() => {
        currentIndex = (currentIndex + 1) % texts.length;
        el.textContent = texts[currentIndex];
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 300);
    }

    setInterval(rotateText, 3000);
  });
}

// ========================================
// CUSTOM CURSOR
// ========================================
function initCursorFollower() {
  // Skip on mobile, tablet, and touch devices
  if (window.innerWidth < 1024) return;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) return;

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  const cursorDot = document.createElement('div');
  cursorDot.className = 'custom-cursor-dot';
  document.body.appendChild(cursorDot);

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let dotX = 0, dotY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;
    dotX += (mouseX - dotX) * 0.25;
    dotY += (mouseY - dotY) * 0.25;

    cursor.style.left = cursorX - 20 + 'px';
    cursor.style.top = cursorY - 20 + 'px';
    cursorDot.style.left = dotX - 4 + 'px';
    cursorDot.style.top = dotY - 4 + 'px';

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Hover effects
  const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-flip-card, input, textarea');

  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-hover');
      cursorDot.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-hover');
      cursorDot.classList.remove('cursor-hover');
    });
  });

  // Hide on mouse leave window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorDot.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorDot.style.opacity = '1';
  });
}

// ========================================
// SMOOTH SCROLL
// ========================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      const navbar = document.getElementById('navbar');
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const targetPosition = targetElement.offsetTop - navbarHeight;

      smoothScrollTo(targetPosition, 1000);
    });
  });
}

function smoothScrollTo(target, duration) {
  const start = window.pageYOffset;
  const distance = target - start;
  const startTime = performance.now();

  function animation(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing: easeInOutCubic
    const easeProgress = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    window.scrollTo(0, start + distance * easeProgress);

    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

// ========================================
// SCROLL PROGRESS BAR
// ========================================
function initScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  progressBar.style.cssText = 'width:0%;will-change:width;';
  document.body.appendChild(progressBar);

  let ticking = false;

  const updateProgress = () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.pageYOffset / windowHeight) * 100;
    progressBar.style.width = scrolled + '%';
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });
}

// ========================================
// PARTICLE SYSTEM
// ========================================
function initParticles() {
  const particlesContainer = document.querySelector('#particlesCanvas');
  if (!particlesContainer) return;

  // Skip on mobile and tablet for better performance (only desktop 1024px+)
  if (window.innerWidth < 1024) return;

  const ctx = particlesContainer.getContext('2d');
  particlesContainer.width = window.innerWidth;
  particlesContainer.height = window.innerHeight;

  const particles = [];
  // Reduce particles on smaller screens
  const particleCount = window.innerWidth < 1024 ? 25 : 40;

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * particlesContainer.width;
      this.y = Math.random() * particlesContainer.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > particlesContainer.width) this.speedX *= -1;
      if (this.y < 0 || this.y > particlesContainer.height) this.speedY *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(16, 185, 129, ${this.opacity})`;
      ctx.fill();
    }
  }

  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Connect particles
  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.1 * (1 - distance / 150)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, particlesContainer.width, particlesContainer.height);

    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    connectParticles();
    requestAnimationFrame(animate);
  }

  animate();

  // Resize handler (debounced)
  window.addEventListener('resize', debounce(() => {
    particlesContainer.width = window.innerWidth;
    particlesContainer.height = window.innerHeight;
  }, 250));
}

// ========================================
// COUNTER ANIMATION
// ========================================
function initCounters() {
  const counters = document.querySelectorAll('.counter-number');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.dataset.target);
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Easing
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(target * easeProgress);

          counter.textContent = current;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
          }
        }

        requestAnimationFrame(updateCounter);
        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));
}

// ========================================
// STAGGER ANIMATIONS
// ========================================
function initStaggerAnimations() {
  const staggerContainers = document.querySelectorAll('.stagger-container');

  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.querySelectorAll('.stagger-item');
        items.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('animate');
          }, index * 100);
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  staggerContainers.forEach(container => staggerObserver.observe(container));

  // Auto-detect stagger items without container
  const standaloneItems = document.querySelectorAll('.stagger-item:not(.stagger-container .stagger-item)');
  const itemObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        itemObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  standaloneItems.forEach(item => itemObserver.observe(item));
}

// ========================================
// NAVBAR SCROLL EFFECT
// ========================================
// Navbar scroll effect (throttled with rAF)
{
  let lastScroll = 0;
  let navbarTicking = false;
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (!navbarTicking) {
      requestAnimationFrame(() => {
        const currentScroll = window.pageYOffset;
        if (navbar) {
          if (currentScroll > 50) {
            navbar.classList.add('scrolled');
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
          } else {
            navbar.classList.remove('scrolled');
            navbar.style.boxShadow = '';
          }
        }
        lastScroll = currentScroll;
        navbarTicking = false;
      });
      navbarTicking = true;
    }
  }, { passive: true });
}

