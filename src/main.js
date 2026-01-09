/**
 * Main Application Entry Point
 * Initializes all components and manages application lifecycle
 */

import './styles/main.css';
import './styles/design-system.css';
import './styles/layout.css';
import './styles/typography.css';
import './styles/components.css';
import './styles/header.css';
import './styles/hero.css';
import './styles/features.css';
import './styles/workflow.css';
import './styles/testimonials.css';
import './styles/pricing.css';

import headerHtml from './components/header.html?raw';
import heroHtml from './components/hero.html?raw';
import featuresHtml from './components/features.html?raw';
import workflowHtml from './components/workflow.html?raw';
import testimonialsHtml from './components/testimonials.html?raw';
import pricingHtml from './components/pricing.html?raw';

import { initializeNavigation } from './js/navigation.js';
import { initializeHero } from './js/hero.js';
import { initializeFeatures } from './js/features.js';
import { initializeWorkflow } from './js/workflow.js';
import { initializeTestimonials } from './js/testimonials.js';
import { initializePricing } from './js/pricing.js';

/**
 * Injects HTML content into the application container
 */
function injectComponents() {
  const app = document.querySelector('#app');
  if (!app) {
    console.error('[Main] Application container #app not found');
    return;
  }

  app.innerHTML = `
    ${headerHtml}
    <main>
      ${heroHtml}
      ${featuresHtml}
      ${workflowHtml}
      ${testimonialsHtml}
      ${pricingHtml}
    </main>
  `;
}

/**
 * Initializes all interactive components
 * @returns {Function[]} Array of cleanup functions
 */
function initializeComponents() {
  const cleanupFunctions = [];

  try {
    cleanupFunctions.push(initializeNavigation());
    cleanupFunctions.push(initializeHero());
    cleanupFunctions.push(initializeFeatures());
    cleanupFunctions.push(initializeWorkflow());
    cleanupFunctions.push(initializeTestimonials());
    cleanupFunctions.push(initializePricing());

    console.log('[Main] All components initialized successfully');
  } catch (error) {
    console.error('[Main] Component initialization failed:', error);
  }

  return cleanupFunctions;
}

/**
 * Main application initialization
 */
function initializeApp() {
  injectComponents();
  const cleanupFunctions = initializeComponents();

  // Return cleanup function for hot module replacement
  return () => {
    cleanupFunctions.forEach((cleanup) => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });
  };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Hot Module Replacement support
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('[Main] Hot module replacement triggered');
    initializeApp();
  });
}