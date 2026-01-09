/**
 * Pricing Section Interactive Module
 * Handles CTA button click tracking, scroll animations, hover effects, and analytics
 * 
 * @module pricing
 * @generated-from: TASK-008
 * @dependencies: []
 */

/**
 * Configuration for pricing interactions
 */
const PRICING_CONFIG = Object.freeze({
  ANIMATION: {
    THRESHOLD: 0.15,
    ROOT_MARGIN: '0px 0px -100px 0px',
    STAGGER_DELAY: 100,
  },
  ANALYTICS: {
    CATEGORY: 'Pricing',
    ACTIONS: {
      CTA_CLICK: 'CTA Click',
      CARD_HOVER: 'Card Hover',
      SECTION_VIEW: 'Section View',
    },
  },
  SELECTORS: {
    SECTION: '.pricing',
    CARDS: '.pricing__card',
    CTA_BUTTONS: '.pricing__cta',
    CARD_RECOMMENDED: '.pricing__card--recommended',
  },
  CLASSES: {
    ANIMATED: 'pricing__card--animated',
    HOVER_ACTIVE: 'pricing__card--hover-active',
  },
});

/**
 * Analytics event tracking utility
 * Safely tracks events to analytics platforms (Google Analytics, etc.)
 * 
 * @param {Object} eventData - Event data to track
 * @param {string} eventData.category - Event category
 * @param {string} eventData.action - Event action
 * @param {string} eventData.label - Event label
 * @param {number} [eventData.value] - Optional event value
 */
function trackAnalyticsEvent({ category, action, label, value }) {
  try {
    // Google Analytics 4 (gtag)
    if (typeof window.gtag === 'function') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }

    // Google Analytics Universal (ga)
    if (typeof window.ga === 'function') {
      window.ga('send', 'event', category, action, label, value);
    }

    // Custom analytics endpoint fallback
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track(action, {
        category,
        label,
        value,
      });
    }

    // Console logging in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Analytics]', { category, action, label, value });
    }
  } catch (error) {
    console.error('[Pricing] Analytics tracking failed:', error);
  }
}

/**
 * Extracts pricing tier information from a card element
 * 
 * @param {HTMLElement} card - Pricing card element
 * @returns {Object} Tier information
 */
function extractTierInfo(card) {
  const titleElement = card.querySelector('.pricing__card-title');
  const priceElement = card.querySelector('.pricing__amount');
  const isRecommended = card.classList.contains('pricing__card--recommended');

  return {
    tier: titleElement?.textContent?.trim() || 'Unknown',
    price: priceElement?.textContent?.trim() || 'N/A',
    recommended: isRecommended,
  };
}

/**
 * Handles CTA button click events with analytics tracking
 * 
 * @param {Event} event - Click event
 */
function handleCtaClick(event) {
  const button = event.currentTarget;
  const card = button.closest(PRICING_CONFIG.SELECTORS.CARDS);

  if (!card) {
    console.warn('[Pricing] CTA button clicked outside of pricing card');
    return;
  }

  const tierInfo = extractTierInfo(card);
  const ctaText = button.textContent.trim();

  // Track analytics event
  trackAnalyticsEvent({
    category: PRICING_CONFIG.ANALYTICS.CATEGORY,
    action: PRICING_CONFIG.ANALYTICS.ACTIONS.CTA_CLICK,
    label: `${tierInfo.tier} - ${ctaText}`,
    value: tierInfo.recommended ? 1 : 0,
  });

  // Add visual feedback
  button.style.transform = 'scale(0.95)';
  setTimeout(() => {
    button.style.transform = '';
  }, 150);

  // Log for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Pricing] CTA clicked:', {
      tier: tierInfo.tier,
      price: tierInfo.price,
      recommended: tierInfo.recommended,
      ctaText,
    });
  }
}

/**
 * Handles card hover events with enhanced effects
 * 
 * @param {Event} event - Mouse event
 */
function handleCardHover(event) {
  const card = event.currentTarget;
  const tierInfo = extractTierInfo(card);

  // Add hover class for CSS transitions
  card.classList.add(PRICING_CONFIG.CLASSES.HOVER_ACTIVE);

  // Track hover analytics (throttled to avoid spam)
  if (!card.dataset.hoverTracked) {
    card.dataset.hoverTracked = 'true';

    trackAnalyticsEvent({
      category: PRICING_CONFIG.ANALYTICS.CATEGORY,
      action: PRICING_CONFIG.ANALYTICS.ACTIONS.CARD_HOVER,
      label: tierInfo.tier,
      value: tierInfo.recommended ? 1 : 0,
    });

    // Reset tracking flag after delay
    setTimeout(() => {
      delete card.dataset.hoverTracked;
    }, 3000);
  }
}

/**
 * Handles card hover leave events
 * 
 * @param {Event} event - Mouse event
 */
function handleCardHoverLeave(event) {
  const card = event.currentTarget;
  card.classList.remove(PRICING_CONFIG.CLASSES.HOVER_ACTIVE);
}

/**
 * Initializes scroll-triggered animations using Intersection Observer
 * 
 * @param {HTMLElement} section - Pricing section element
 */
function initializeScrollAnimations(section) {
  const cards = section.querySelectorAll(PRICING_CONFIG.SELECTORS.CARDS);

  if (cards.length === 0) {
    console.warn('[Pricing] No pricing cards found for animation');
    return;
  }

  // Check for Intersection Observer support
  if (!('IntersectionObserver' in window)) {
    console.warn('[Pricing] IntersectionObserver not supported, skipping animations');
    // Fallback: show all cards immediately
    cards.forEach((card) => {
      card.classList.add(PRICING_CONFIG.CLASSES.ANIMATED);
    });
    return;
  }

  const observerOptions = {
    threshold: PRICING_CONFIG.ANIMATION.THRESHOLD,
    rootMargin: PRICING_CONFIG.ANIMATION.ROOT_MARGIN,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animation for visual appeal
        setTimeout(() => {
          entry.target.classList.add(PRICING_CONFIG.CLASSES.ANIMATED);

          // Track section view on first card animation
          if (index === 0 && !section.dataset.viewTracked) {
            section.dataset.viewTracked = 'true';
            trackAnalyticsEvent({
              category: PRICING_CONFIG.ANALYTICS.CATEGORY,
              action: PRICING_CONFIG.ANALYTICS.ACTIONS.SECTION_VIEW,
              label: 'Pricing Section Viewed',
            });
          }
        }, index * PRICING_CONFIG.ANIMATION.STAGGER_DELAY);

        // Stop observing after animation
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all cards
  cards.forEach((card) => {
    observer.observe(card);
  });
}

/**
 * Attaches event listeners to CTA buttons
 * 
 * @param {HTMLElement} section - Pricing section element
 */
function attachCtaListeners(section) {
  const ctaButtons = section.querySelectorAll(PRICING_CONFIG.SELECTORS.CTA_BUTTONS);

  if (ctaButtons.length === 0) {
    console.warn('[Pricing] No CTA buttons found');
    return;
  }

  ctaButtons.forEach((button) => {
    button.addEventListener('click', handleCtaClick);
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Pricing] Attached listeners to ${ctaButtons.length} CTA buttons`);
  }
}

/**
 * Attaches hover effect listeners to pricing cards
 * 
 * @param {HTMLElement} section - Pricing section element
 */
function attachHoverListeners(section) {
  const cards = section.querySelectorAll(PRICING_CONFIG.SELECTORS.CARDS);

  if (cards.length === 0) {
    console.warn('[Pricing] No pricing cards found for hover effects');
    return;
  }

  cards.forEach((card) => {
    card.addEventListener('mouseenter', handleCardHover);
    card.addEventListener('mouseleave', handleCardHoverLeave);
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Pricing] Attached hover listeners to ${cards.length} cards`);
  }
}

/**
 * Cleans up event listeners and observers
 * 
 * @param {HTMLElement} section - Pricing section element
 */
function cleanup(section) {
  if (!section) return;

  // Remove CTA listeners
  const ctaButtons = section.querySelectorAll(PRICING_CONFIG.SELECTORS.CTA_BUTTONS);
  ctaButtons.forEach((button) => {
    button.removeEventListener('click', handleCtaClick);
  });

  // Remove hover listeners
  const cards = section.querySelectorAll(PRICING_CONFIG.SELECTORS.CARDS);
  cards.forEach((card) => {
    card.removeEventListener('mouseenter', handleCardHover);
    card.removeEventListener('mouseleave', handleCardHoverLeave);
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Pricing] Cleanup completed');
  }
}

/**
 * Initializes the pricing section with all interactive features
 * 
 * @returns {Function} Cleanup function
 */
function initializePricing() {
  const section = document.querySelector(PRICING_CONFIG.SELECTORS.SECTION);

  if (!section) {
    console.error('[Pricing] Pricing section not found in DOM');
    return () => {};
  }

  try {
    // Initialize all features
    attachCtaListeners(section);
    attachHoverListeners(section);
    initializeScrollAnimations(section);

    if (process.env.NODE_ENV !== 'production') {
      console.log('[Pricing] Initialization complete');
    }

    // Return cleanup function
    return () => cleanup(section);
  } catch (error) {
    console.error('[Pricing] Initialization failed:', error);
    return () => {};
  }
}

/**
 * Auto-initialize when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePricing);
} else {
  initializePricing();
}

// Export for module usage
export { initializePricing, trackAnalyticsEvent, PRICING_CONFIG };