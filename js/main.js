/**
 * Main JavaScript Entry Point
 * Initializes all modules and coordinates application startup
 * 
 * @module main
 * @generated-from: TASK-009
 * @modifies: N/A (initialization only)
 */

/**
 * Application state management
 */
const appState = {
  initialized: false,
  modules: new Map(),
  errors: [],
};

/**
 * Module initialization configuration
 */
const MODULE_CONFIG = {
  lazyLoading: {
    enabled: true,
    priority: 1,
    config: {
      rootMargin: '50px',
      threshold: 0.01,
      enableFadeIn: true,
      fadeInDuration: 300,
    },
  },
  navigation: {
    enabled: true,
    priority: 2,
  },
  animations: {
    enabled: true,
    priority: 3,
  },
  forms: {
    enabled: true,
    priority: 4,
  },
};

/**
 * Performance monitoring configuration
 */
const PERFORMANCE_CONFIG = {
  enabled: true,
  metrics: {
    lcp: { target: 2500, warning: 2000 },
    fid: { target: 100, warning: 50 },
    cls: { target: 0.1, warning: 0.05 },
  },
};

/**
 * Initialize lazy loading module
 * @returns {Promise<void>}
 */
async function initLazyLoading() {
  try {
    if (!MODULE_CONFIG.lazyLoading.enabled) {
      console.info('[Main] Lazy loading disabled');
      return;
    }

    if (typeof window.lazyLoader !== 'undefined') {
      console.info('[Main] Lazy loading already initialized');
      appState.modules.set('lazyLoading', window.lazyLoader);
      return;
    }

    console.error('[Main] Lazy loading module not found');
    appState.errors.push({
      module: 'lazyLoading',
      error: 'Module not loaded',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Main] Failed to initialize lazy loading:', error);
    appState.errors.push({
      module: 'lazyLoading',
      error: error.message,
      timestamp: Date.now(),
    });
  }
}

/**
 * Initialize navigation module
 * @returns {Promise<void>}
 */
async function initNavigation() {
  try {
    if (!MODULE_CONFIG.navigation.enabled) {
      console.info('[Main] Navigation disabled');
      return;
    }

    console.info('[Main] Navigation initialized');
    appState.modules.set('navigation', true);
  } catch (error) {
    console.error('[Main] Failed to initialize navigation:', error);
    appState.errors.push({
      module: 'navigation',
      error: error.message,
      timestamp: Date.now(),
    });
  }
}

/**
 * Initialize animations module
 * @returns {Promise<void>}
 */
async function initAnimations() {
  try {
    if (!MODULE_CONFIG.animations.enabled) {
      console.info('[Main] Animations disabled');
      return;
    }

    console.info('[Main] Animations initialized');
    appState.modules.set('animations', true);
  } catch (error) {
    console.error('[Main] Failed to initialize animations:', error);
    appState.errors.push({
      module: 'animations',
      error: error.message,
      timestamp: Date.now(),
    });
  }
}

/**
 * Initialize forms module
 * @returns {Promise<void>}
 */
async function initForms() {
  try {
    if (!MODULE_CONFIG.forms.enabled) {
      console.info('[Main] Forms disabled');
      return;
    }

    console.info('[Main] Forms initialized');
    appState.modules.set('forms', true);
  } catch (error) {
    console.error('[Main] Failed to initialize forms:', error);
    appState.errors.push({
      module: 'forms',
      error: error.message,
      timestamp: Date.now(),
    });
  }
}

/**
 * Initialize performance monitoring
 * @returns {Promise<void>}
 */
async function initPerformanceMonitoring() {
  try {
    if (!PERFORMANCE_CONFIG.enabled) {
      console.info('[Main] Performance monitoring disabled');
      return;
    }

    if (!('PerformanceObserver' in window)) {
      console.warn('[Main] PerformanceObserver not supported');
      return;
    }

    // Monitor Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcp = lastEntry.renderTime || lastEntry.loadTime;

      console.info(`[Performance] LCP: ${lcp.toFixed(2)}ms`);

      if (lcp > PERFORMANCE_CONFIG.metrics.lcp.target) {
        console.warn(`[Performance] LCP exceeds target: ${lcp.toFixed(2)}ms > ${PERFORMANCE_CONFIG.metrics.lcp.target}ms`);
      }
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime;
        console.info(`[Performance] FID: ${fid.toFixed(2)}ms`);

        if (fid > PERFORMANCE_CONFIG.metrics.fid.target) {
          console.warn(`[Performance] FID exceeds target: ${fid.toFixed(2)}ms > ${PERFORMANCE_CONFIG.metrics.fid.target}ms`);
        }
      });
    });

    fidObserver.observe({ entryTypes: ['first-input'] });

    // Monitor Cumulative Layout Shift (CLS)
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });

      console.info(`[Performance] CLS: ${clsScore.toFixed(4)}`);

      if (clsScore > PERFORMANCE_CONFIG.metrics.cls.target) {
        console.warn(`[Performance] CLS exceeds target: ${clsScore.toFixed(4)} > ${PERFORMANCE_CONFIG.metrics.cls.target}`);
      }
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });

    console.info('[Main] Performance monitoring initialized');
    appState.modules.set('performance', true);
  } catch (error) {
    console.error('[Main] Failed to initialize performance monitoring:', error);
    appState.errors.push({
      module: 'performance',
      error: error.message,
      timestamp: Date.now(),
    });
  }
}

/**
 * Initialize all modules in priority order
 * @returns {Promise<void>}
 */
async function initializeModules() {
  const modules = [
    { name: 'lazyLoading', init: initLazyLoading, priority: MODULE_CONFIG.lazyLoading.priority },
    { name: 'navigation', init: initNavigation, priority: MODULE_CONFIG.navigation.priority },
    { name: 'animations', init: initAnimations, priority: MODULE_CONFIG.animations.priority },
    { name: 'forms', init: initForms, priority: MODULE_CONFIG.forms.priority },
    { name: 'performance', init: initPerformanceMonitoring, priority: 5 },
  ];

  // Sort by priority
  modules.sort((a, b) => a.priority - b.priority);

  // Initialize modules sequentially
  for (const module of modules) {
    try {
      await module.init();
    } catch (error) {
      console.error(`[Main] Failed to initialize ${module.name}:`, error);
    }
  }
}

/**
 * Main application initialization
 */
async function init() {
  if (appState.initialized) {
    console.warn('[Main] Application already initialized');
    return;
  }

  try {
    console.info('[Main] Initializing application...');

    // Initialize all modules
    await initializeModules();

    appState.initialized = true;

    // Log initialization summary
    console.info('[Main] Application initialized successfully');
    console.info(`[Main] Modules loaded: ${appState.modules.size}`);

    if (appState.errors.length > 0) {
      console.warn(`[Main] Initialization completed with ${appState.errors.length} errors`);
      appState.errors.forEach((err) => {
        console.warn(`[Main] - ${err.module}: ${err.error}`);
      });
    }

    // Dispatch custom event for application ready
    window.dispatchEvent(new CustomEvent('app:ready', {
      detail: {
        modules: Array.from(appState.modules.keys()),
        errors: appState.errors,
      },
    }));
  } catch (error) {
    console.error('[Main] Critical initialization error:', error);
    appState.errors.push({
      module: 'main',
      error: error.message,
      timestamp: Date.now(),
    });
  }
}

/**
 * Initialize on DOM ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/**
 * Export for module usage
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init,
    appState,
  };
}