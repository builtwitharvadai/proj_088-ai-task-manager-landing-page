/**
 * Testimonials Section - Scroll Animations and Image Loading
 * 
 * Implements:
 * - Intersection Observer for scroll-triggered animations
 * - Lazy loading optimization for testimonial images
 * - Error handling for image loading failures
 * - Performance monitoring and logging
 * - Accessibility-compliant animations with reduced motion support
 * 
 * @module testimonials
 */

/**
 * Configuration for testimonials animations and behavior
 */
const TESTIMONIALS_CONFIG = Object.freeze({
  INTERSECTION_THRESHOLD: 0.15,
  INTERSECTION_ROOT_MARGIN: '0px 0px -50px 0px',
  ANIMATION_BASE_DELAY: 100,
  IMAGE_LOAD_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  ANIMATION_CLASS: 'testimonial-card--visible',
  ERROR_CLASS: 'testimonial-card__avatar--error',
  LOADING_CLASS: 'testimonial-card__avatar--loading',
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
    console.log('[Testimonials]', message, context);
  },

  /**
   * Log warning message with context
   * @param {string} message - Warning message
   * @param {Object} context - Additional context
   */
  warn(message, context = {}) {
    console.warn('[Testimonials]', message, context);
  },

  /**
   * Log error message with context
   * @param {string} message - Error message
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  error(message, error, context = {}) {
    console.error('[Testimonials]', message, {
      error: error.message,
      stack: error.stack,
      ...context,
    });
  },
};

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if reduced motion is preferred
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Calculate animation delay based on card index
 * @param {HTMLElement} card - Testimonial card element
 * @returns {number} Delay in milliseconds
 */
function getAnimationDelay(card) {
  const delayAttr = card.getAttribute('data-delay');
  return delayAttr ? parseInt(delayAttr, 10) : 0;
}

/**
 * Apply animation to testimonial card
 * @param {HTMLElement} card - Testimonial card element
 */
function animateCard(card) {
  if (prefersReducedMotion()) {
    card.classList.add(TESTIMONIALS_CONFIG.ANIMATION_CLASS);
    return;
  }

  const delay = getAnimationDelay(card);
  
  setTimeout(() => {
    card.classList.add(TESTIMONIALS_CONFIG.ANIMATION_CLASS);
    logger.info('Card animated', { delay });
  }, delay);
}

/**
 * Create intersection observer for scroll animations
 * @returns {IntersectionObserver} Configured observer instance
 */
function createScrollObserver() {
  const observerOptions = {
    threshold: TESTIMONIALS_CONFIG.INTERSECTION_THRESHOLD,
    rootMargin: TESTIMONIALS_CONFIG.INTERSECTION_ROOT_MARGIN,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const card = entry.target;
        animateCard(card);
        observer.unobserve(card);
      }
    });
  }, observerOptions);

  logger.info('Scroll observer created', observerOptions);
  return observer;
}

/**
 * Wait for specified duration
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Load image with timeout and retry logic
 * @param {HTMLImageElement} img - Image element to load
 * @param {number} attempt - Current attempt number
 * @returns {Promise<void>}
 */
async function loadImageWithRetry(img, attempt = 1) {
  const src = img.getAttribute('src');
  
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Image load timeout after ${TESTIMONIALS_CONFIG.IMAGE_LOAD_TIMEOUT}ms`));
    }, TESTIMONIALS_CONFIG.IMAGE_LOAD_TIMEOUT);

    const handleLoad = () => {
      clearTimeout(timeoutId);
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
      img.classList.remove(TESTIMONIALS_CONFIG.LOADING_CLASS);
      logger.info('Image loaded successfully', { src, attempt });
      resolve();
    };

    const handleError = () => {
      clearTimeout(timeoutId);
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
      reject(new Error('Image failed to load'));
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    // Trigger load if not already loading
    if (!img.complete) {
      img.classList.add(TESTIMONIALS_CONFIG.LOADING_CLASS);
      // Force reload by setting src again
      const currentSrc = img.src;
      img.src = '';
      img.src = currentSrc;
    } else if (img.naturalWidth > 0) {
      handleLoad();
    } else {
      handleError();
    }
  });
}

/**
 * Handle image loading with retry mechanism
 * @param {HTMLImageElement} img - Image element
 * @returns {Promise<void>}
 */
async function handleImageLoad(img) {
  const src = img.getAttribute('src');
  const alt = img.getAttribute('alt');

  for (let attempt = 1; attempt <= TESTIMONIALS_CONFIG.RETRY_ATTEMPTS; attempt++) {
    try {
      await loadImageWithRetry(img, attempt);
      return;
    } catch (error) {
      logger.warn('Image load attempt failed', {
        src,
        alt,
        attempt,
        maxAttempts: TESTIMONIALS_CONFIG.RETRY_ATTEMPTS,
        error: error.message,
      });

      if (attempt < TESTIMONIALS_CONFIG.RETRY_ATTEMPTS) {
        await delay(TESTIMONIALS_CONFIG.RETRY_DELAY * attempt);
      } else {
        // Final attempt failed - show error state
        img.classList.remove(TESTIMONIALS_CONFIG.LOADING_CLASS);
        img.classList.add(TESTIMONIALS_CONFIG.ERROR_CLASS);
        
        // Set fallback to a data URI placeholder
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e0e0e0"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="14"%3EImage Error%3C/text%3E%3C/svg%3E';
        
        logger.error('Image load failed after all retries', error, {
          src,
          alt,
          attempts: TESTIMONIALS_CONFIG.RETRY_ATTEMPTS,
        });
      }
    }
  }
}

/**
 * Optimize image loading for all testimonial avatars
 * @param {NodeList} images - Collection of image elements
 * @returns {Promise<void>}
 */
async function optimizeImageLoading(images) {
  const startTime = performance.now();
  
  const imagePromises = Array.from(images).map((img) => {
    // Skip if already loaded
    if (img.complete && img.naturalWidth > 0) {
      logger.info('Image already loaded', { src: img.src });
      return Promise.resolve();
    }
    
    return handleImageLoad(img);
  });

  try {
    await Promise.allSettled(imagePromises);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    logger.info('All images processed', {
      count: images.length,
      duration: `${duration.toFixed(2)}ms`,
    });
  } catch (error) {
    logger.error('Unexpected error in image loading', error);
  }
}

/**
 * Add hover effects to testimonial cards
 * @param {NodeList} cards - Collection of card elements
 */
function addHoverEffects(cards) {
  if (prefersReducedMotion()) {
    logger.info('Hover effects disabled due to reduced motion preference');
    return;
  }

  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  logger.info('Hover effects added', { count: cards.length });
}

/**
 * Initialize testimonials section
 * Sets up scroll animations, image loading, and interactive effects
 */
function initTestimonials() {
  const startTime = performance.now();
  
  try {
    // Find testimonials section
    const testimonialsSection = document.querySelector('.testimonials');
    
    if (!testimonialsSection) {
      logger.warn('Testimonials section not found');
      return;
    }

    // Get all testimonial cards
    const cards = testimonialsSection.querySelectorAll('.testimonial-card');
    
    if (cards.length === 0) {
      logger.warn('No testimonial cards found');
      return;
    }

    logger.info('Initializing testimonials', { cardCount: cards.length });

    // Set up scroll animations
    const observer = createScrollObserver();
    cards.forEach((card) => {
      observer.observe(card);
    });

    // Get all avatar images
    const images = testimonialsSection.querySelectorAll('.testimonial-card__avatar');
    
    if (images.length > 0) {
      // Optimize image loading
      optimizeImageLoading(images);
    } else {
      logger.warn('No testimonial images found');
    }

    // Add hover effects
    addHoverEffects(cards);

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    logger.info('Testimonials initialized successfully', {
      duration: `${duration.toFixed(2)}ms`,
      cards: cards.length,
      images: images.length,
    });

  } catch (error) {
    logger.error('Failed to initialize testimonials', error);
  }
}

/**
 * Initialize when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTestimonials);
} else {
  initTestimonials();
}

/**
 * Export for module usage
 */
export { initTestimonials };