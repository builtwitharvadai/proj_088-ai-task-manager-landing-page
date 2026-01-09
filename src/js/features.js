/**
 * Features Section - AI Task Manager Landing Page
 * Handles scroll animations, FontAwesome integration, and interactive card effects
 * 
 * @module features
 * @generated-from: TASK-005
 * @dependencies: ["Intersection Observer API", "FontAwesome"]
 */

/**
 * Configuration for features section behavior
 */
const FEATURES_CONFIG = Object.freeze({
  ANIMATION_THRESHOLD: 0.15,
  ANIMATION_ROOT_MARGIN: '0px 0px -50px 0px',
  ANIMATION_DELAY_INCREMENT: 150,
  ICON_LOAD_TIMEOUT: 5000,
  FEATURE_FLAG_CLASS: 'no-animations',
  SELECTORS: {
    SECTION: '.features',
    CARDS: '.feature-card',
    ICONS: '.feature-card__icon i',
    GRID: '.features__grid',
  },
  CLASSES: {
    VISIBLE: 'feature-card--visible',
    ANIMATED: 'feature-card--animated',
    ICON_LOADED: 'feature-card__icon--loaded',
    ICON_ERROR: 'feature-card__icon--error',
  },
  PERFORMANCE: {
    PASSIVE_EVENTS: { passive: true },
    DEBOUNCE_DELAY: 100,
  },
});

/**
 * Logger utility for structured logging
 */
const logger = {
  /**
   * Log info message with context
   * @param {string} message - Log message
   * @param {Object} context - Additional context
   */
  info(message, context = {}) {
    console.log('[Features]', message, context);
  },

  /**
   * Log warning message with context
   * @param {string} message - Warning message
   * @param {Object} context - Additional context
   */
  warn(message, context = {}) {
    console.warn('[Features]', message, context);
  },

  /**
   * Log error message with context
   * @param {string} message - Error message
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  error(message, error, context = {}) {
    console.error('[Features]', message, {
      error: error.message,
      stack: error.stack,
      ...context,
    });
  },
};

/**
 * Performance monitoring utility
 */
const performanceMonitor = {
  marks: new Map(),

  /**
   * Start performance measurement
   * @param {string} name - Measurement name
   */
  start(name) {
    const markName = `features-${name}-start`;
    performance.mark(markName);
    this.marks.set(name, markName);
  },

  /**
   * End performance measurement and log result
   * @param {string} name - Measurement name
   */
  end(name) {
    const startMark = this.marks.get(name);
    if (!startMark) {
      logger.warn('Performance mark not found', { name });
      return;
    }

    const endMark = `features-${name}-end`;
    performance.mark(endMark);

    try {
      const measureName = `features-${name}`;
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName)[0];

      logger.info('Performance measurement', {
        operation: name,
        duration: `${measure.duration.toFixed(2)}ms`,
      });

      // Cleanup
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
      this.marks.delete(name);
    } catch (error) {
      logger.error('Performance measurement failed', error, { name });
    }
  },
};

/**
 * Check if animations are enabled
 * @returns {boolean} True if animations should run
 */
function areAnimationsEnabled() {
  const featuresSection = document.querySelector(FEATURES_CONFIG.SELECTORS.SECTION);
  if (!featuresSection) return false;

  // Check feature flag
  if (featuresSection.classList.contains(FEATURES_CONFIG.FEATURE_FLAG_CLASS)) {
    logger.info('Animations disabled via feature flag');
    return false;
  }

  // Check user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    logger.info('Animations disabled due to user preference');
    return false;
  }

  return true;
}

/**
 * Initialize FontAwesome icon loading monitoring
 * @returns {Promise<void>} Resolves when icons are loaded or timeout occurs
 */
function initializeFontAwesome() {
  return new Promise((resolve) => {
    performanceMonitor.start('icon-loading');

    const icons = document.querySelectorAll(FEATURES_CONFIG.SELECTORS.ICONS);
    if (icons.length === 0) {
      logger.warn('No FontAwesome icons found');
      performanceMonitor.end('icon-loading');
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalIcons = icons.length;
    const timeout = setTimeout(() => {
      logger.warn('FontAwesome icon loading timeout', {
        loaded: loadedCount,
        total: totalIcons,
      });
      performanceMonitor.end('icon-loading');
      resolve();
    }, FEATURES_CONFIG.ICON_LOAD_TIMEOUT);

    /**
     * Check if icon is loaded by verifying computed styles
     * @param {HTMLElement} icon - Icon element
     * @returns {boolean} True if icon is loaded
     */
    function isIconLoaded(icon) {
      const styles = window.getComputedStyle(icon);
      const fontFamily = styles.getPropertyValue('font-family');
      return fontFamily.includes('Font Awesome') || fontFamily.includes('FontAwesome');
    }

    /**
     * Handle icon load completion
     * @param {HTMLElement} icon - Icon element
     * @param {boolean} success - Whether icon loaded successfully
     */
    function handleIconLoad(icon, success) {
      const iconContainer = icon.closest('.feature-card__icon');
      if (iconContainer) {
        iconContainer.classList.add(
          success
            ? FEATURES_CONFIG.CLASSES.ICON_LOADED
            : FEATURES_CONFIG.CLASSES.ICON_ERROR
        );
      }

      loadedCount++;
      if (loadedCount === totalIcons) {
        clearTimeout(timeout);
        logger.info('All FontAwesome icons loaded', {
          count: totalIcons,
        });
        performanceMonitor.end('icon-loading');
        resolve();
      }
    }

    // Check each icon
    icons.forEach((icon) => {
      // Check if already loaded
      if (isIconLoaded(icon)) {
        handleIconLoad(icon, true);
        return;
      }

      // Poll for icon load (FontAwesome loads asynchronously)
      const checkInterval = setInterval(() => {
        if (isIconLoaded(icon)) {
          clearInterval(checkInterval);
          handleIconLoad(icon, true);
        }
      }, 100);

      // Cleanup interval after timeout
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!isIconLoaded(icon)) {
          logger.error('Icon failed to load', new Error('Load timeout'), {
            classes: icon.className,
          });
          handleIconLoad(icon, false);
        }
      }, FEATURES_CONFIG.ICON_LOAD_TIMEOUT);
    });
  });
}

/**
 * Initialize scroll animations using Intersection Observer
 */
function initializeScrollAnimations() {
  if (!areAnimationsEnabled()) {
    // Add visible class immediately if animations disabled
    const cards = document.querySelectorAll(FEATURES_CONFIG.SELECTORS.CARDS);
    cards.forEach((card) => {
      card.classList.add(FEATURES_CONFIG.CLASSES.VISIBLE);
    });
    return;
  }

  performanceMonitor.start('scroll-animations-init');

  const cards = document.querySelectorAll(FEATURES_CONFIG.SELECTORS.CARDS);
  if (cards.length === 0) {
    logger.warn('No feature cards found for animation');
    performanceMonitor.end('scroll-animations-init');
    return;
  }

  // Create Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: FEATURES_CONFIG.ANIMATION_ROOT_MARGIN,
    threshold: FEATURES_CONFIG.ANIMATION_THRESHOLD,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const index = Array.from(cards).indexOf(card);

        // Stagger animation based on card index
        setTimeout(() => {
          card.classList.add(FEATURES_CONFIG.CLASSES.VISIBLE);
          card.classList.add(FEATURES_CONFIG.CLASSES.ANIMATED);

          logger.info('Card animated', {
            index,
            cardTitle: card.querySelector('.feature-card__title')?.textContent?.trim(),
          });
        }, index * FEATURES_CONFIG.ANIMATION_DELAY_INCREMENT);

        // Unobserve after animation
        observer.unobserve(card);
      }
    });
  }, observerOptions);

  // Observe all cards
  cards.forEach((card) => {
    observer.observe(card);
  });

  logger.info('Scroll animations initialized', {
    cardCount: cards.length,
    threshold: FEATURES_CONFIG.ANIMATION_THRESHOLD,
  });

  performanceMonitor.end('scroll-animations-init');
}

/**
 * Initialize hover effects enhancement
 */
function initializeHoverEffects() {
  const cards = document.querySelectorAll(FEATURES_CONFIG.SELECTORS.CARDS);
  if (cards.length === 0) {
    logger.warn('No feature cards found for hover effects');
    return;
  }

  cards.forEach((card) => {
    // Add pointer cursor
    card.style.cursor = 'pointer';

    // Enhanced focus handling for accessibility
    card.addEventListener(
      'focus',
      () => {
        card.setAttribute('data-focused', 'true');
      },
      FEATURES_CONFIG.PERFORMANCE.PASSIVE_EVENTS
    );

    card.addEventListener(
      'blur',
      () => {
        card.removeAttribute('data-focused');
      },
      FEATURES_CONFIG.PERFORMANCE.PASSIVE_EVENTS
    );
  });

  logger.info('Hover effects initialized', {
    cardCount: cards.length,
  });
}

/**
 * Initialize features section
 * Main entry point for features functionality
 */
async function initializeFeatures() {
  try {
    performanceMonitor.start('features-init');

    logger.info('Initializing features section');

    // Check if features section exists
    const featuresSection = document.querySelector(FEATURES_CONFIG.SELECTORS.SECTION);
    if (!featuresSection) {
      logger.warn('Features section not found in DOM');
      return;
    }

    // Initialize FontAwesome icons
    await initializeFontAwesome();

    // Initialize scroll animations
    initializeScrollAnimations();

    // Initialize hover effects
    initializeHoverEffects();

    logger.info('Features section initialized successfully');
    performanceMonitor.end('features-init');
  } catch (error) {
    logger.error('Failed to initialize features section', error);
    performanceMonitor.end('features-init');

    // Graceful degradation - ensure cards are visible
    const cards = document.querySelectorAll(FEATURES_CONFIG.SELECTORS.CARDS);
    cards.forEach((card) => {
      card.classList.add(FEATURES_CONFIG.CLASSES.VISIBLE);
    });
  }
}

/**
 * Initialize on DOM ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFeatures);
} else {
  // DOM already loaded
  initializeFeatures();
}

/**
 * Handle reduced motion preference changes
 */
const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
motionMediaQuery.addEventListener('change', (e) => {
  logger.info('Motion preference changed', {
    prefersReducedMotion: e.matches,
  });

  if (e.matches) {
    // User enabled reduced motion - make all cards visible immediately
    const cards = document.querySelectorAll(FEATURES_CONFIG.SELECTORS.CARDS);
    cards.forEach((card) => {
      card.classList.add(FEATURES_CONFIG.CLASSES.VISIBLE);
    });
  }
});

// Export for testing and external use
export { initializeFeatures, FEATURES_CONFIG };