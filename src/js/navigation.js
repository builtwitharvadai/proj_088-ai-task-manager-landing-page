/**
 * Navigation Module
 * Handles mobile menu toggle, smooth scroll navigation, active section highlighting,
 * and scroll event handling for sticky header effects.
 * 
 * @module navigation
 * @generated-from: TASK-003
 * @modifies: DOM navigation elements
 * @dependencies: []
 */

(function () {
  'use strict';

  // Configuration constants
  const CONFIG = Object.freeze({
    SCROLL_OFFSET: 80,
    SCROLL_DURATION: 800,
    THROTTLE_DELAY: 100,
    ACTIVE_THRESHOLD: 100,
    MOBILE_BREAKPOINT: 768,
    STICKY_THRESHOLD: 50,
  });

  // DOM element cache
  const elements = {
    header: null,
    navToggle: null,
    mobileMenu: null,
    navLinks: null,
    mobileMenuLinks: null,
    scrollLinks: null,
  };

  // State management
  const state = {
    isMobileMenuOpen: false,
    isScrolling: false,
    lastScrollY: 0,
    activeSection: null,
    resizeTimeout: null,
  };

  /**
   * Initialize the navigation module
   * Sets up event listeners and caches DOM elements
   */
  function init() {
    try {
      cacheElements();
      validateElements();
      setupEventListeners();
      updateActiveSection();
      handleStickyHeader();
      
      console.info('[Navigation] Module initialized successfully');
    } catch (error) {
      console.error('[Navigation] Initialization failed:', {
        error: error.message,
        stack: error.stack,
      });
      throw new Error('Navigation initialization failed', { cause: error });
    }
  }

  /**
   * Cache DOM elements for performance
   */
  function cacheElements() {
    elements.header = document.querySelector('.header');
    elements.navToggle = document.querySelector('.nav-toggle');
    elements.mobileMenu = document.getElementById('mobile-menu');
    elements.navLinks = document.querySelectorAll('.nav-link');
    elements.mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
    elements.scrollLinks = document.querySelectorAll('[data-scroll-to]');
  }

  /**
   * Validate that required DOM elements exist
   * @throws {Error} If required elements are missing
   */
  function validateElements() {
    const requiredElements = {
      header: elements.header,
      navToggle: elements.navToggle,
      mobileMenu: elements.mobileMenu,
    };

    const missingElements = Object.entries(requiredElements)
      .filter(([_key, element]) => !element)
      .map(([key]) => key);

    if (missingElements.length > 0) {
      throw new Error(
        `Required navigation elements not found: ${missingElements.join(', ')}`
      );
    }
  }

  /**
   * Set up all event listeners
   */
  function setupEventListeners() {
    // Mobile menu toggle
    elements.navToggle.addEventListener('click', handleMenuToggle);

    // Smooth scroll for all navigation links
    elements.scrollLinks.forEach((link) => {
      link.addEventListener('click', handleSmoothScroll);
    });

    // Scroll event for active section and sticky header
    window.addEventListener('scroll', throttle(handleScroll, CONFIG.THROTTLE_DELAY));

    // Resize event for mobile menu cleanup
    window.addEventListener('resize', throttle(handleResize, CONFIG.THROTTLE_DELAY));

    // Close mobile menu when clicking outside
    document.addEventListener('click', handleOutsideClick);

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNav);
  }

  /**
   * Handle mobile menu toggle
   * @param {Event} event - Click event
   */
  function handleMenuToggle(event) {
    event.preventDefault();
    event.stopPropagation();

    try {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
      updateMobileMenuState();

      console.debug('[Navigation] Mobile menu toggled:', {
        isOpen: state.isMobileMenuOpen,
      });
    } catch (error) {
      console.error('[Navigation] Menu toggle failed:', {
        error: error.message,
      });
    }
  }

  /**
   * Update mobile menu DOM state
   */
  function updateMobileMenuState() {
    const { navToggle, mobileMenu } = elements;
    const { isMobileMenuOpen } = state;

    // Update ARIA attributes
    navToggle.setAttribute('aria-expanded', String(isMobileMenuOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isMobileMenuOpen));

    // Update classes
    if (isMobileMenuOpen) {
      mobileMenu.classList.add('active');
      navToggle.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      mobileMenu.classList.remove('active');
      navToggle.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  /**
   * Handle smooth scroll navigation
   * @param {Event} event - Click event
   */
  function handleSmoothScroll(event) {
    const targetId = event.currentTarget.getAttribute('data-scroll-to');
    
    if (!targetId) {
      return;
    }

    event.preventDefault();

    try {
      const targetElement = document.getElementById(targetId);

      if (!targetElement) {
        console.warn('[Navigation] Target section not found:', targetId);
        return;
      }

      // Close mobile menu if open
      if (state.isMobileMenuOpen) {
        state.isMobileMenuOpen = false;
        updateMobileMenuState();
      }

      // Calculate scroll position
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = targetPosition - CONFIG.SCROLL_OFFSET;

      // Perform smooth scroll
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Update active state
      state.activeSection = targetId;
      updateActiveLinks();

      console.debug('[Navigation] Scrolled to section:', {
        targetId,
        position: offsetPosition,
      });
    } catch (error) {
      console.error('[Navigation] Smooth scroll failed:', {
        error: error.message,
        targetId,
      });
    }
  }

  /**
   * Handle scroll events
   */
  function handleScroll() {
    if (state.isScrolling) {
      return;
    }

    state.isScrolling = true;

    requestAnimationFrame(() => {
      try {
        handleStickyHeader();
        updateActiveSection();
        state.isScrolling = false;
      } catch (error) {
        console.error('[Navigation] Scroll handler failed:', {
          error: error.message,
        });
        state.isScrolling = false;
      }
    });
  }

  /**
   * Handle sticky header behavior
   */
  function handleStickyHeader() {
    const currentScrollY = window.pageYOffset;
    const { header } = elements;

    if (!header) {
      return;
    }

    // Add/remove sticky class based on scroll position
    if (currentScrollY > CONFIG.STICKY_THRESHOLD) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    state.lastScrollY = currentScrollY;
  }

  /**
   * Update active section based on scroll position
   */
  function updateActiveSection() {
    const scrollPosition = window.pageYOffset + CONFIG.ACTIVE_THRESHOLD;
    const sections = Array.from(elements.scrollLinks)
      .map((link) => link.getAttribute('data-scroll-to'))
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    let newActiveSection = null;

    // Find the current section
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionTop = section.offsetTop;

      if (scrollPosition >= sectionTop) {
        newActiveSection = section.id;
        break;
      }
    }

    // Update if changed
    if (newActiveSection !== state.activeSection) {
      state.activeSection = newActiveSection;
      updateActiveLinks();
    }
  }

  /**
   * Update active state on navigation links
   */
  function updateActiveLinks() {
    const { activeSection } = state;

    // Update desktop nav links
    elements.navLinks.forEach((link) => {
      const targetId = link.getAttribute('data-scroll-to');
      if (targetId === activeSection) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    // Update mobile nav links
    elements.mobileMenuLinks.forEach((link) => {
      const targetId = link.getAttribute('data-scroll-to');
      if (targetId === activeSection) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    clearTimeout(state.resizeTimeout);

    state.resizeTimeout = setTimeout(() => {
      try {
        // Close mobile menu on desktop breakpoint
        if (window.innerWidth >= CONFIG.MOBILE_BREAKPOINT && state.isMobileMenuOpen) {
          state.isMobileMenuOpen = false;
          updateMobileMenuState();
        }

        console.debug('[Navigation] Resize handled:', {
          width: window.innerWidth,
        });
      } catch (error) {
        console.error('[Navigation] Resize handler failed:', {
          error: error.message,
        });
      }
    }, 150);
  }

  /**
   * Handle clicks outside mobile menu
   * @param {Event} event - Click event
   */
  function handleOutsideClick(event) {
    if (!state.isMobileMenuOpen) {
      return;
    }

    const { navToggle, mobileMenu } = elements;
    const isClickInside = navToggle.contains(event.target) || mobileMenu.contains(event.target);

    if (!isClickInside) {
      state.isMobileMenuOpen = false;
      updateMobileMenuState();
    }
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleKeyboardNav(event) {
    // Close mobile menu on Escape key
    if (event.key === 'Escape' && state.isMobileMenuOpen) {
      event.preventDefault();
      state.isMobileMenuOpen = false;
      updateMobileMenuState();
      elements.navToggle.focus();
    }
  }

  /**
   * Throttle function execution
   * @param {Function} func - Function to throttle
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Throttled function
   */
  function throttle(func, delay) {
    let lastCall = 0;
    return function throttled(...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
    };
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for testing purposes
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      init,
      handleMenuToggle,
      handleSmoothScroll,
      updateActiveSection,
    };
  }
})();