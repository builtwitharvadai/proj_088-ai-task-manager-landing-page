/**
 * Animations Module - Scroll-triggered animations using Intersection Observer API
 * 
 * Implements performance-optimized scroll animations with:
 * - Intersection Observer for efficient scroll detection
 * - CSS class-based animations with smooth transitions
 * - Proper cleanup and memory management
 * - Fallback support for older browsers
 * - Configurable animation options
 * 
 * @module animations
 */

/**
 * Animation configuration with sensible defaults
 */
const ANIMATION_CONFIG = {
  // Intersection Observer options
  rootMargin: '0px 0px -100px 0px', // Trigger 100px before element enters viewport
  threshold: 0.15, // Trigger when 15% of element is visible
  
  // Animation classes
  animateClass: 'animate-in',
  visibleClass: 'is-visible',
  
  // Selectors for elements to animate
  selectors: [
    '.feature-card',
    '.workflow-step',
    '.testimonial-card',
    '.pricing-card',
    '.hero-section',
    '.features-section',
    '.workflow-section',
    '.testimonials-section',
    '.pricing-section'
  ],
  
  // Stagger delay for sequential animations (ms)
  staggerDelay: 100,
  
  // Enable/disable animations based on user preferences
  respectReducedMotion: true
};

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if reduced motion is preferred
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if Intersection Observer is supported
 * @returns {boolean} True if supported
 */
function isIntersectionObserverSupported() {
  return 'IntersectionObserver' in window &&
         'IntersectionObserverEntry' in window &&
         'intersectionRatio' in window.IntersectionObserverEntry.prototype;
}

/**
 * Animation Manager Class
 * Handles scroll-triggered animations with Intersection Observer
 */
class AnimationManager {
  constructor(config = {}) {
    this.config = { ...ANIMATION_CONFIG, ...config };
    this.observer = null;
    this.animatedElements = new Set();
    this.isInitialized = false;
    
    // Bind methods to maintain context
    this.handleIntersection = this.handleIntersection.bind(this);
    this.init = this.init.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  /**
   * Initialize the animation system
   * Sets up Intersection Observer and prepares elements
   */
  init() {
    if (this.isInitialized) {
      console.warn('[Animations] Already initialized');
      return;
    }

    // Check if animations should be disabled
    if (this.config.respectReducedMotion && prefersReducedMotion()) {
      console.info('[Animations] Reduced motion preferred - animations disabled');
      this.showAllElements();
      return;
    }

    // Check browser support
    if (!isIntersectionObserverSupported()) {
      console.warn('[Animations] Intersection Observer not supported - showing all elements');
      this.showAllElements();
      return;
    }

    try {
      this.setupObserver();
      this.prepareElements();
      this.isInitialized = true;
      console.info('[Animations] Initialized successfully');
    } catch (error) {
      console.error('[Animations] Initialization failed:', error);
      this.showAllElements();
    }
  }

  /**
   * Set up the Intersection Observer
   */
  setupObserver() {
    const options = {
      root: null, // Use viewport as root
      rootMargin: this.config.rootMargin,
      threshold: this.config.threshold
    };

    this.observer = new IntersectionObserver(this.handleIntersection, options);
  }

  /**
   * Prepare elements for animation
   * Finds all elements matching selectors and sets up initial state
   */
  prepareElements() {
    const elements = this.getAnimatableElements();
    
    if (elements.length === 0) {
      console.warn('[Animations] No elements found to animate');
      return;
    }

    elements.forEach((element, index) => {
      // Add animation class for CSS transitions
      element.classList.add(this.config.animateClass);
      
      // Set stagger delay as CSS custom property
      if (this.config.staggerDelay > 0) {
        const delay = index * this.config.staggerDelay;
        element.style.setProperty('--animation-delay', `${delay}ms`);
      }
      
      // Start observing the element
      this.observer.observe(element);
    });

    console.info(`[Animations] Prepared ${elements.length} elements for animation`);
  }

  /**
   * Get all elements that should be animated
   * @returns {Element[]} Array of elements to animate
   */
  getAnimatableElements() {
    const elements = [];
    
    this.config.selectors.forEach(selector => {
      try {
        const found = document.querySelectorAll(selector);
        elements.push(...Array.from(found));
      } catch (error) {
        console.error(`[Animations] Invalid selector: ${selector}`, error);
      }
    });

    return elements;
  }

  /**
   * Handle intersection events
   * @param {IntersectionObserverEntry[]} entries - Intersection entries
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      // Element is entering viewport
      if (entry.isIntersecting) {
        this.animateElement(entry.target);
      }
    });
  }

  /**
   * Animate an element by adding the visible class
   * @param {Element} element - Element to animate
   */
  animateElement(element) {
    // Skip if already animated
    if (this.animatedElements.has(element)) {
      return;
    }

    try {
      // Add visible class to trigger CSS animation
      element.classList.add(this.config.visibleClass);
      
      // Mark as animated
      this.animatedElements.add(element);
      
      // Stop observing this element (one-time animation)
      if (this.observer) {
        this.observer.unobserve(element);
      }
      
      // Log for debugging
      console.debug('[Animations] Animated element:', element.className);
    } catch (error) {
      console.error('[Animations] Failed to animate element:', error);
    }
  }

  /**
   * Show all elements immediately (fallback for unsupported browsers)
   */
  showAllElements() {
    const elements = this.getAnimatableElements();
    
    elements.forEach(element => {
      element.classList.add(this.config.visibleClass);
      element.style.removeProperty('--animation-delay');
    });

    console.info('[Animations] Showing all elements immediately');
  }

  /**
   * Destroy the animation manager and clean up resources
   */
  destroy() {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Disconnect observer
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      // Clear animated elements set
      this.animatedElements.clear();

      // Remove animation classes from all elements
      const elements = this.getAnimatableElements();
      elements.forEach(element => {
        element.classList.remove(this.config.animateClass, this.config.visibleClass);
        element.style.removeProperty('--animation-delay');
      });

      this.isInitialized = false;
      console.info('[Animations] Destroyed successfully');
    } catch (error) {
      console.error('[Animations] Cleanup failed:', error);
    }
  }

  /**
   * Refresh animations - useful for dynamically added content
   */
  refresh() {
    if (!this.isInitialized) {
      console.warn('[Animations] Cannot refresh - not initialized');
      return;
    }

    console.info('[Animations] Refreshing animations');
    this.prepareElements();
  }
}

/**
 * Global animation manager instance
 */
let animationManager = null;

/**
 * Initialize animations when DOM is ready
 */
function initAnimations() {
  // Prevent multiple initializations
  if (animationManager) {
    console.warn('[Animations] Already initialized globally');
    return;
  }

  try {
    animationManager = new AnimationManager();
    animationManager.init();
  } catch (error) {
    console.error('[Animations] Failed to initialize:', error);
  }
}

/**
 * Clean up animations
 */
function destroyAnimations() {
  if (animationManager) {
    animationManager.destroy();
    animationManager = null;
  }
}

/**
 * Refresh animations for dynamically added content
 */
function refreshAnimations() {
  if (animationManager) {
    animationManager.refresh();
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  // DOM already loaded
  initAnimations();
}

// Clean up on page unload
window.addEventListener('unload', destroyAnimations);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AnimationManager,
    initAnimations,
    destroyAnimations,
    refreshAnimations
  };
}