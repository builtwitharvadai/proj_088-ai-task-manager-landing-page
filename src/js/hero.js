/**
 * Hero Section Interactive Features and Analytics
 * 
 * Implements CTA button click tracking, scroll animations, and conversion analytics
 * for the hero section. Provides comprehensive event tracking and user interaction
 * monitoring for optimization and A/B testing.
 * 
 * @module hero
 * @generated-from task-id:TASK-004
 * @modifies hero.html, hero.css
 */

/**
 * Analytics event types for hero section interactions
 * @enum {symbol}
 */
const HERO_EVENTS = Object.freeze({
  CTA_CLICK: Symbol('cta_click'),
  CTA_HOVER: Symbol('cta_hover'),
  SECTION_VIEW: Symbol('section_view'),
  SCROLL_DEPTH: Symbol('scroll_depth'),
});

/**
 * Configuration for hero section behavior
 * @type {Object}
 */
const HERO_CONFIG = Object.freeze({
  INTERSECTION_THRESHOLD: 0.5,
  SCROLL_DEPTH_THRESHOLDS: [25, 50, 75, 100],
  DEBOUNCE_DELAY: 150,
  ANIMATION_DURATION: 600,
  FEATURE_FLAG: 'hero_cta_button',
});

/**
 * State management for hero section
 * @type {Object}
 */
const heroState = {
  isVisible: false,
  hasTrackedView: false,
  trackedScrollDepths: new Set(),
  ctaClickCount: 0,
  sessionStartTime: Date.now(),
};

/**
 * Debounce utility for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Safely dispatches analytics events with error handling
 * @param {symbol} eventType - Type of event from HERO_EVENTS
 * @param {Object} eventData - Additional event metadata
 */
function trackAnalyticsEvent(eventType, eventData = {}) {
  try {
    const event = {
      type: eventType.description,
      timestamp: new Date().toISOString(),
      sessionDuration: Date.now() - heroState.sessionStartTime,
      ...eventData,
    };

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Hero Analytics]', event);
    }

    // Dispatch custom event for analytics integration
    const customEvent = new CustomEvent('hero:analytics', {
      detail: event,
      bubbles: true,
    });
    document.dispatchEvent(customEvent);

    // Integration point for external analytics (Google Analytics, Mixpanel, etc.)
    if (typeof window.gtag === 'function') {
      window.gtag('event', event.type, {
        event_category: 'hero_section',
        event_label: eventData.label || '',
        value: eventData.value || 0,
      });
    }
  } catch (error) {
    console.error('[Hero Analytics] Failed to track event:', error);
  }
}

/**
 * Handles CTA button click events with comprehensive tracking
 * @param {Event} event - Click event
 */
function handleCtaClick(event) {
  const target = event.currentTarget;
  
  try {
    heroState.ctaClickCount += 1;

    const clickData = {
      label: 'cta_button_click',
      value: heroState.ctaClickCount,
      buttonText: target.textContent.trim(),
      href: target.getAttribute('href'),
      timeToClick: Date.now() - heroState.sessionStartTime,
    };

    trackAnalyticsEvent(HERO_EVENTS.CTA_CLICK, clickData);

    // Add visual feedback
    target.classList.add('clicked');
    setTimeout(() => {
      target.classList.remove('clicked');
    }, HERO_CONFIG.ANIMATION_DURATION);
  } catch (error) {
    console.error('[Hero] CTA click handler error:', error);
  }
}

/**
 * Handles CTA button hover events for engagement tracking
 * @param {Event} _event - Hover event (unused but required for event listener)
 */
function handleCtaHover(_event) {
  try {
    trackAnalyticsEvent(HERO_EVENTS.CTA_HOVER, {
      label: 'cta_button_hover',
      timeToHover: Date.now() - heroState.sessionStartTime,
    });
  } catch (error) {
    console.error('[Hero] CTA hover handler error:', error);
  }
}

/**
 * Calculates scroll depth percentage for the hero section
 * @returns {number} Scroll depth percentage (0-100)
 */
function calculateScrollDepth() {
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return 0;

  const rect = heroSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const sectionHeight = rect.height;
  
  // Calculate how much of the section has been scrolled past
  const scrolledPast = Math.max(0, viewportHeight - rect.top);
  const scrollDepth = Math.min(100, (scrolledPast / sectionHeight) * 100);
  
  return Math.round(scrollDepth);
}

/**
 * Tracks scroll depth milestones for engagement analysis
 */
const trackScrollDepth = debounce(() => {
  try {
    const depth = calculateScrollDepth();
    
    HERO_CONFIG.SCROLL_DEPTH_THRESHOLDS.forEach((threshold) => {
      if (depth >= threshold && !heroState.trackedScrollDepths.has(threshold)) {
        heroState.trackedScrollDepths.add(threshold);
        
        trackAnalyticsEvent(HERO_EVENTS.SCROLL_DEPTH, {
          label: `scroll_depth_${threshold}`,
          value: threshold,
          timeToDepth: Date.now() - heroState.sessionStartTime,
        });
      }
    });
  } catch (error) {
    console.error('[Hero] Scroll depth tracking error:', error);
  }
}, HERO_CONFIG.DEBOUNCE_DELAY);

/**
 * Handles hero section visibility changes using Intersection Observer
 * @param {IntersectionObserverEntry[]} entries - Observer entries
 */
function handleIntersection(entries) {
  entries.forEach((entry) => {
    try {
      const isVisible = entry.isIntersecting;
      
      if (isVisible && !heroState.hasTrackedView) {
        heroState.isVisible = true;
        heroState.hasTrackedView = true;
        
        trackAnalyticsEvent(HERO_EVENTS.SECTION_VIEW, {
          label: 'hero_section_view',
          timeToView: Date.now() - heroState.sessionStartTime,
        });
        
        // Add animation class for entrance effects
        entry.target.classList.add('hero--visible');
      }
      
      heroState.isVisible = isVisible;
    } catch (error) {
      console.error('[Hero] Intersection handler error:', error);
    }
  });
}

/**
 * Initializes Intersection Observer for hero section visibility tracking
 * @returns {IntersectionObserver|null} Observer instance or null if unavailable
 */
function initializeIntersectionObserver() {
  const heroSection = document.querySelector('.hero');
  
  if (!heroSection) {
    console.warn('[Hero] Hero section not found in DOM');
    return null;
  }
  
  if (!('IntersectionObserver' in window)) {
    console.warn('[Hero] IntersectionObserver not supported');
    // Fallback: assume section is visible
    heroState.isVisible = true;
    return null;
  }
  
  try {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: HERO_CONFIG.INTERSECTION_THRESHOLD,
      rootMargin: '0px',
    });
    
    observer.observe(heroSection);
    return observer;
  } catch (error) {
    console.error('[Hero] Failed to initialize IntersectionObserver:', error);
    return null;
  }
}

/**
 * Checks feature flag status for CTA button visibility
 * @returns {boolean} True if CTA should be visible
 */
function isCtaEnabled() {
  // Check for feature flag in various sources
  const urlParams = new URLSearchParams(window.location.search);
  const urlFlag = urlParams.get(HERO_CONFIG.FEATURE_FLAG);
  
  if (urlFlag !== null) {
    return urlFlag === 'on' || urlFlag === 'true' || urlFlag === '1';
  }
  
  // Check localStorage for persistent flag override
  try {
    const storedFlag = localStorage.getItem(HERO_CONFIG.FEATURE_FLAG);
    if (storedFlag !== null) {
      return storedFlag === 'on';
    }
  } catch (error) {
    // localStorage might be unavailable
    console.warn('[Hero] localStorage unavailable for feature flag check');
  }
  
  // Default to enabled
  return true;
}

/**
 * Applies feature flag logic to CTA button
 */
function applyFeatureFlags() {
  const ctaButton = document.querySelector('.hero-cta');
  
  if (!ctaButton) {
    console.warn('[Hero] CTA button not found in DOM');
    return;
  }
  
  try {
    if (!isCtaEnabled()) {
      ctaButton.style.display = 'none';
      console.log('[Hero] CTA button hidden by feature flag');
    } else {
      ctaButton.style.display = '';
    }
  } catch (error) {
    console.error('[Hero] Feature flag application error:', error);
  }
}

/**
 * Attaches event listeners to hero section elements
 */
function attachEventListeners() {
  const ctaButton = document.querySelector('.hero-cta');
  
  if (!ctaButton) {
    console.warn('[Hero] CTA button not found, skipping event listeners');
    return;
  }
  
  try {
    // CTA click tracking
    ctaButton.addEventListener('click', handleCtaClick);
    
    // CTA hover tracking (once per session)
    let hasTrackedHover = false;
    ctaButton.addEventListener('mouseenter', () => {
      if (!hasTrackedHover) {
        hasTrackedHover = true;
        handleCtaHover();
      }
    });
    
    // Scroll depth tracking
    window.addEventListener('scroll', trackScrollDepth, { passive: true });
    
    // Initial scroll depth check
    trackScrollDepth();
  } catch (error) {
    console.error('[Hero] Failed to attach event listeners:', error);
  }
}

/**
 * Cleanup function for removing event listeners and observers
 * @param {IntersectionObserver|null} observer - Observer to disconnect
 */
function cleanup(observer) {
  try {
    const ctaButton = document.querySelector('.hero-cta');
    
    if (ctaButton) {
      ctaButton.removeEventListener('click', handleCtaClick);
    }
    
    window.removeEventListener('scroll', trackScrollDepth);
    
    if (observer) {
      observer.disconnect();
    }
  } catch (error) {
    console.error('[Hero] Cleanup error:', error);
  }
}

/**
 * Initializes hero section interactive features
 * Main entry point for the module
 */
function initializeHero() {
  try {
    // Apply feature flags first
    applyFeatureFlags();
    
    // Initialize visibility tracking
    const observer = initializeIntersectionObserver();
    
    // Attach event listeners
    attachEventListeners();
    
    // Setup cleanup on page unload
    window.addEventListener('beforeunload', () => cleanup(observer));
    
    console.log('[Hero] Initialization complete');
  } catch (error) {
    console.error('[Hero] Initialization failed:', error);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeHero);
} else {
  initializeHero();
}

// Export for testing and external usage
export {
  initializeHero,
  trackAnalyticsEvent,
  HERO_EVENTS,
  HERO_CONFIG,
};