/**
 * Main JavaScript Entry Point
 * 
 * Initializes all interactive features including navigation, animations,
 * and form validation. Handles page load events with proper error handling
 * and performance optimization.
 * 
 * @module main
 * @generated-from: task-id:TASK-008
 * @modifies: N/A (new file)
 * @dependencies: ["js/navigation.js", "js/animations.js", "js/forms.js"]
 */

/**
 * Application state management
 */
const appState = {
  initialized: false,
  modules: {
    navigation: false,
    animations: false,
    forms: false,
  },
  errors: [],
};

/**
 * Configuration constants
 */
const CONFIG = Object.freeze({
  INIT_TIMEOUT: 5000, // Maximum time for initialization
  RETRY_DELAY: 1000, // Delay before retry on error
  MAX_RETRIES: 3, // Maximum initialization retries
  DEBUG: false, // Enable debug logging
});

/**
 * Logger utility with structured logging
 */
const logger = {
  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} context - Additional context
   */
  info(message, context = {}) {
    if (CONFIG.DEBUG) {
      console.info('[Main]', message, context);
    }
  },

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} context - Additional context
   */
  warn(message, context = {}) {
    console.warn('[Main]', message, context);
  },

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  error(message, error, context = {}) {
    console.error('[Main]', message, {
      error: error.message,
      stack: error.stack,
      ...context,
    });
    
    // Track error in state
    appState.errors.push({
      message,
      error: error.message,
      timestamp: new Date().toISOString(),
      context,
    });
  },
};

/**
 * Performance monitoring utility
 */
const performance = {
  marks: new Map(),

  /**
   * Start performance measurement
   * @param {string} name - Measurement name
   */
  start(name) {
    this.marks.set(name, Date.now());
  },

  /**
   * End performance measurement and log duration
   * @param {string} name - Measurement name
   */
  end(name) {
    const startTime = this.marks.get(name);
    if (startTime) {
      const duration = Date.now() - startTime;
      logger.info(`Performance: ${name}`, { duration: `${duration}ms` });
      this.marks.delete(name);
    }
  },
};

/**
 * Initialize navigation module
 * @returns {Promise<boolean>} Success status
 */
async function initializeNavigation() {
  try {
    performance.start('navigation-init');
    
    // Navigation module auto-initializes, just verify it's loaded
    if (typeof window.initNavigation === 'function') {
      // Already initialized by navigation.js
      logger.info('Navigation module loaded');
    } else {
      logger.warn('Navigation module not found, features may be limited');
    }
    
    appState.modules.navigation = true;
    performance.end('navigation-init');
    return true;
  } catch (error) {
    logger.error('Navigation initialization failed', error);
    appState.modules.navigation = false;
    return false;
  }
}

/**
 * Initialize animations module
 * @returns {Promise<boolean>} Success status
 */
async function initializeAnimations() {
  try {
    performance.start('animations-init');
    
    // Animations module auto-initializes, just verify it's loaded
    if (typeof window.AnimationManager !== 'undefined') {
      logger.info('Animations module loaded');
    } else {
      logger.warn('Animations module not found, scroll animations disabled');
    }
    
    appState.modules.animations = true;
    performance.end('animations-init');
    return true;
  } catch (error) {
    logger.error('Animations initialization failed', error);
    appState.modules.animations = false;
    return false;
  }
}

/**
 * Initialize forms module
 * @returns {Promise<boolean>} Success status
 */
async function initializeForms() {
  try {
    performance.start('forms-init');
    
    // Forms module auto-initializes, just verify it's loaded
    if (typeof window.FormValidator !== 'undefined') {
      logger.info('Forms module loaded');
    } else {
      logger.warn('Forms module not found, form validation disabled');
    }
    
    appState.modules.forms = true;
    performance.end('forms-init');
    return true;
  } catch (error) {
    logger.error('Forms initialization failed', error);
    appState.modules.forms = false;
    return false;
  }
}

/**
 * Initialize all modules with error recovery
 * @returns {Promise<void>}
 */
async function initializeModules() {
  performance.start('total-init');
  
  const initPromises = [
    initializeNavigation(),
    initializeAnimations(),
    initializeForms(),
  ];

  try {
    const results = await Promise.allSettled(initPromises);
    
    // Log results
    results.forEach((result, index) => {
      const moduleName = ['navigation', 'animations', 'forms'][index];
      if (result.status === 'rejected') {
        logger.error(`Module ${moduleName} failed to initialize`, result.reason);
      }
    });

    // Check if at least one module initialized successfully
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    if (successCount === 0) {
      throw new Error('All modules failed to initialize');
    }

    logger.info('Modules initialized', {
      success: successCount,
      total: results.length,
    });
  } catch (error) {
    logger.error('Critical initialization failure', error);
    throw error;
  } finally {
    performance.end('total-init');
  }
}

/**
 * Setup global error handlers
 */
function setupErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', event.reason, {
      promise: event.promise,
    });
    event.preventDefault();
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    logger.error('Global error', event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
}

/**
 * Setup performance monitoring
 */
function setupPerformanceMonitoring() {
  // Monitor page load performance
  if ('performance' in window && 'getEntriesByType' in window.performance) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.getEntriesByType('navigation')[0];
        if (perfData) {
          logger.info('Page load performance', {
            domContentLoaded: `${Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart)}ms`,
            loadComplete: `${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`,
            domInteractive: `${Math.round(perfData.domInteractive - perfData.fetchStart)}ms`,
          });
        }
      }, 0);
    });
  }
}

/**
 * Setup accessibility features
 */
function setupAccessibility() {
  // Add skip to main content link if not present
  const skipLink = document.querySelector('a[href="#main"]');
  if (!skipLink) {
    const link = document.createElement('a');
    link.href = '#main';
    link.className = 'skip-link';
    link.textContent = 'Skip to main content';
    link.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 100;
    `;
    link.addEventListener('focus', () => {
      link.style.top = '0';
    });
    link.addEventListener('blur', () => {
      link.style.top = '-40px';
    });
    document.body.insertBefore(link, document.body.firstChild);
  }

  // Ensure main content has proper landmark
  const main = document.querySelector('main');
  if (main && !main.id) {
    main.id = 'main';
  }
}

/**
 * Initialize application with retry logic
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<void>}
 */
async function initializeApp(retryCount = 0) {
  if (appState.initialized) {
    logger.warn('Application already initialized');
    return;
  }

  try {
    logger.info('Initializing application', { attempt: retryCount + 1 });

    // Setup error handlers first
    setupErrorHandlers();

    // Setup performance monitoring
    setupPerformanceMonitoring();

    // Setup accessibility features
    setupAccessibility();

    // Initialize modules with timeout
    const initPromise = initializeModules();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Initialization timeout')), CONFIG.INIT_TIMEOUT);
    });

    await Promise.race([initPromise, timeoutPromise]);

    appState.initialized = true;
    logger.info('Application initialized successfully');

    // Dispatch custom event for other scripts
    window.dispatchEvent(new CustomEvent('app:initialized', {
      detail: { modules: appState.modules },
    }));
  } catch (error) {
    logger.error('Application initialization failed', error, {
      attempt: retryCount + 1,
    });

    // Retry logic
    if (retryCount < CONFIG.MAX_RETRIES) {
      logger.info('Retrying initialization', {
        delay: CONFIG.RETRY_DELAY,
        attempt: retryCount + 2,
      });
      
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
      return initializeApp(retryCount + 1);
    }

    // Max retries reached
    logger.error('Maximum initialization retries reached', error);
    
    // Dispatch failure event
    window.dispatchEvent(new CustomEvent('app:init-failed', {
      detail: { error: error.message, attempts: retryCount + 1 },
    }));
  }
}

/**
 * Cleanup function for page unload
 */
function cleanup() {
  logger.info('Cleaning up application');
  
  // Clear any timers or intervals
  performance.marks.clear();
  
  // Dispatch cleanup event
  window.dispatchEvent(new CustomEvent('app:cleanup'));
}

/**
 * Initialize on DOM ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeApp().catch(error => {
      logger.error('Fatal initialization error', error);
    });
  });
} else {
  // DOM already loaded
  initializeApp().catch(error => {
    logger.error('Fatal initialization error', error);
  });
}

/**
 * Cleanup on page unload
 */
window.addEventListener('unload', cleanup);

/**
 * Export for module usage and testing
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeApp,
    appState,
    logger,
  };
}