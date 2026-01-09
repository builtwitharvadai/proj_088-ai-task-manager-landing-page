/**
 * Main Entry Point - AI Task Manager Landing Page
 * Initializes all components and manages application lifecycle
 * 
 * @module main
 */

import './styles/main.css';
import { initializeNavigation } from './js/navigation.js';
import { initializeHero } from './js/hero.js';
import { initializeFeatures } from './js/features.js';

/**
 * Application configuration
 */
const APP_CONFIG = Object.freeze({
  INIT_TIMEOUT: 10000,
  SELECTORS: {
    APP_ROOT: '#app',
  },
});

/**
 * Logger utility for structured logging
 */
const logger = {
  info(message, context = {}) {
    console.log('[Main]', message, context);
  },
  warn(message, context = {}) {
    console.warn('[Main]', message, context);
  },
  error(message, error, context = {}) {
    console.error('[Main]', message, {
      error: error.message,
      stack: error.stack,
      ...context,
    });
  },
};

/**
 * Initialize all application components
 */
async function initializeApp() {
  try {
    logger.info('Initializing application');

    // Check if app root exists
    const appRoot = document.querySelector(APP_CONFIG.SELECTORS.APP_ROOT);
    if (!appRoot) {
      logger.warn('App root element not found');
    }

    // Initialize components in parallel
    await Promise.allSettled([
      initializeNavigation(),
      initializeHero(),
      initializeFeatures(),
    ]);

    logger.info('Application initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize application', error);
  }
}

/**
 * Initialize on DOM ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}