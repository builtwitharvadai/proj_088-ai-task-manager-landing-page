/**
 * Navigation Module - Smooth Scroll and Mobile Menu
 * 
 * Handles smooth scroll navigation for anchor links, mobile hamburger menu
 * toggle with animations, active navigation link highlighting based on scroll
 * position, and keyboard navigation support.
 * 
 * @module navigation
 */

/**
 * Navigation state management
 */
const navigationState = {
  mobileMenuOpen: false,
  activeSection: null,
  scrolling: false,
  sections: [],
  navLinks: [],
};

/**
 * Configuration constants
 */
const CONFIG = {
  SCROLL_OFFSET: 80, // Offset for fixed header
  SCROLL_BEHAVIOR: 'smooth',
  ACTIVE_CLASS: 'active',
  MOBILE_MENU_CLASS: 'nav-menu-open',
  SCROLL_THROTTLE: 100, // ms
  INTERSECTION_THRESHOLD: 0.5,
};

/**
 * Initialize navigation functionality
 */
function initNavigation() {
  try {
    setupMobileMenu();
    setupSmoothScroll();
    setupActiveNavigation();
    setupKeyboardNavigation();
    setupAccessibility();
  } catch (error) {
    console.error('Navigation initialization failed:', error);
  }
}

/**
 * Setup mobile hamburger menu functionality
 */
function setupMobileMenu() {
  const navToggle = createMobileToggle();
  const navMenu = document.querySelector('.nav-menu');
  
  if (!navMenu) {
    console.warn('Navigation menu not found');
    return;
  }

  const nav = navMenu.closest('nav');
  if (nav && !nav.querySelector('.nav-toggle')) {
    nav.querySelector('.container').appendChild(navToggle);
  }

  navToggle.addEventListener('click', handleMobileMenuToggle);
  
  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    if (navigationState.mobileMenuOpen && 
        !event.target.closest('nav')) {
      closeMobileMenu();
    }
  });

  // Close menu when clicking nav links
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navigationState.mobileMenuOpen) {
        closeMobileMenu();
      }
    });
  });

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (window.innerWidth > 767 && navigationState.mobileMenuOpen) {
        closeMobileMenu();
      }
    }, 150);
  });
}

/**
 * Create mobile menu toggle button
 * @returns {HTMLButtonElement} Toggle button element
 */
function createMobileToggle() {
  const button = document.createElement('button');
  button.className = 'nav-toggle';
  button.setAttribute('aria-label', 'Toggle navigation menu');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'nav-menu');
  
  // Create hamburger icon
  for (let i = 0; i < 3; i++) {
    const span = document.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    button.appendChild(span);
  }
  
  return button;
}

/**
 * Handle mobile menu toggle
 */
function handleMobileMenuToggle() {
  if (navigationState.mobileMenuOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

/**
 * Open mobile menu with animation
 */
function openMobileMenu() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (!navToggle || !navMenu) return;

  navigationState.mobileMenuOpen = true;
  
  navToggle.setAttribute('aria-expanded', 'true');
  navMenu.setAttribute('data-visible', 'true');
  document.body.classList.add(CONFIG.MOBILE_MENU_CLASS);
  
  // Focus first menu item for accessibility
  const firstLink = navMenu.querySelector('.nav-link');
  if (firstLink) {
    setTimeout(() => firstLink.focus(), 300);
  }
}

/**
 * Close mobile menu with animation
 */
function closeMobileMenu() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (!navToggle || !navMenu) return;

  navigationState.mobileMenuOpen = false;
  
  navToggle.setAttribute('aria-expanded', 'false');
  navMenu.setAttribute('data-visible', 'false');
  document.body.classList.remove(CONFIG.MOBILE_MENU_CLASS);
}

/**
 * Setup smooth scroll for anchor links
 */
function setupSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', handleSmoothScroll);
  });
}

/**
 * Handle smooth scroll navigation
 * @param {Event} event - Click event
 */
function handleSmoothScroll(event) {
  const href = event.currentTarget.getAttribute('href');
  
  // Skip if href is just "#" or empty
  if (!href || href === '#') {
    event.preventDefault();
    return;
  }

  const targetId = href.substring(1);
  const targetElement = document.getElementById(targetId);
  
  if (!targetElement) {
    console.warn(`Target element not found: ${targetId}`);
    return;
  }

  event.preventDefault();
  
  const targetPosition = getScrollPosition(targetElement);
  
  navigationState.scrolling = true;
  
  window.scrollTo({
    top: targetPosition,
    behavior: CONFIG.SCROLL_BEHAVIOR,
  });

  // Update URL without triggering scroll
  if (history.pushState) {
    history.pushState(null, null, href);
  }

  // Reset scrolling flag after animation
  setTimeout(() => {
    navigationState.scrolling = false;
  }, 1000);

  // Update focus for accessibility
  targetElement.setAttribute('tabindex', '-1');
  targetElement.focus();
  targetElement.removeAttribute('tabindex');
}

/**
 * Calculate scroll position with offset
 * @param {HTMLElement} element - Target element
 * @returns {number} Scroll position
 */
function getScrollPosition(element) {
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - CONFIG.SCROLL_OFFSET;
  
  return Math.max(0, offsetPosition);
}

/**
 * Setup active navigation highlighting based on scroll position
 */
function setupActiveNavigation() {
  // Get all sections with IDs
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
  
  if (sections.length === 0 || navLinks.length === 0) {
    console.warn('No sections or nav links found for active navigation');
    return;
  }

  navigationState.sections = sections;
  navigationState.navLinks = navLinks;

  // Use Intersection Observer for efficient scroll detection
  const observerOptions = {
    root: null,
    rootMargin: `-${CONFIG.SCROLL_OFFSET}px 0px -50% 0px`,
    threshold: CONFIG.INTERSECTION_THRESHOLD,
  };

  const observer = new IntersectionObserver(handleIntersection, observerOptions);
  
  sections.forEach(section => observer.observe(section));

  // Fallback scroll listener for browsers without Intersection Observer
  if (!('IntersectionObserver' in window)) {
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveNavFallback, CONFIG.SCROLL_THROTTLE);
    });
  }
}

/**
 * Handle intersection observer callback
 * @param {IntersectionObserverEntry[]} entries - Intersection entries
 */
function handleIntersection(entries) {
  if (navigationState.scrolling) return;

  entries.forEach(entry => {
    if (entry.isIntersecting) {
      updateActiveNavLink(entry.target.id);
    }
  });
}

/**
 * Update active navigation link
 * @param {string} sectionId - Active section ID
 */
function updateActiveNavLink(sectionId) {
  if (navigationState.activeSection === sectionId) return;

  navigationState.activeSection = sectionId;

  navigationState.navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const linkSectionId = href ? href.substring(1) : '';
    
    if (linkSectionId === sectionId) {
      link.classList.add(CONFIG.ACTIVE_CLASS);
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove(CONFIG.ACTIVE_CLASS);
      link.removeAttribute('aria-current');
    }
  });
}

/**
 * Fallback active navigation update for browsers without Intersection Observer
 */
function updateActiveNavFallback() {
  if (navigationState.scrolling) return;

  const scrollPosition = window.pageYOffset + CONFIG.SCROLL_OFFSET + 10;
  
  let currentSection = null;
  
  navigationState.sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      currentSection = section.id;
    }
  });

  if (currentSection) {
    updateActiveNavLink(currentSection);
  }
}

/**
 * Setup keyboard navigation support
 */
function setupKeyboardNavigation() {
  const navMenu = document.querySelector('.nav-menu');
  const navToggle = document.querySelector('.nav-toggle');
  
  if (!navMenu) return;

  // Handle Escape key to close mobile menu
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigationState.mobileMenuOpen) {
      closeMobileMenu();
      if (navToggle) {
        navToggle.focus();
      }
    }
  });

  // Handle arrow key navigation in menu
  const navLinks = navMenu.querySelectorAll('.nav-link');
  
  navLinks.forEach((link, index) => {
    link.addEventListener('keydown', (event) => {
      let targetIndex = -1;
      
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        targetIndex = (index + 1) % navLinks.length;
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        targetIndex = (index - 1 + navLinks.length) % navLinks.length;
      } else if (event.key === 'Home') {
        event.preventDefault();
        targetIndex = 0;
      } else if (event.key === 'End') {
        event.preventDefault();
        targetIndex = navLinks.length - 1;
      }
      
      if (targetIndex !== -1) {
        navLinks[targetIndex].focus();
      }
    });
  });
}

/**
 * Setup accessibility features
 */
function setupAccessibility() {
  const navMenu = document.querySelector('.nav-menu');
  
  if (navMenu) {
    navMenu.setAttribute('id', 'nav-menu');
    navMenu.setAttribute('role', 'list');
  }

  // Add skip link functionality
  const skipLink = document.querySelector('a[href="#main"]');
  if (skipLink) {
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      const main = document.getElementById('main');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus();
        main.removeAttribute('tabindex');
      }
    });
  }

  // Announce navigation changes to screen readers
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  document.body.appendChild(liveRegion);

  // Store reference for announcements
  navigationState.liveRegion = liveRegion;
}

/**
 * Announce navigation change to screen readers
 * @param {string} message - Message to announce
 */
function announceNavigation(message) {
  if (navigationState.liveRegion) {
    navigationState.liveRegion.textContent = message;
    setTimeout(() => {
      navigationState.liveRegion.textContent = '';
    }, 1000);
  }
}

/**
 * Initialize on DOM ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation);
} else {
  initNavigation();
}

/**
 * Export for module usage
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initNavigation,
    closeMobileMenu,
    openMobileMenu,
  };
}