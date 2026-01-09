/**
 * Performance Optimization Module
 * Implements lazy loading, performance monitoring, and web vitals tracking
 */

/**
 * Lazy Loading Implementation using Intersection Observer API
 */
class LazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.01,
      loadingClass: options.loadingClass || 'lazy-loading',
      loadedClass: options.loadedClass || 'lazy-loaded',
      errorClass: options.errorClass || 'lazy-error',
      ...options,
    };

    this.observer = null;
    this.images = new Set();
    this.loadedCount = 0;
    this.errorCount = 0;
  }

  /**
   * Initializes the Intersection Observer
   * @returns {boolean} Success status
   */
  initialize() {
    try {
      if (!('IntersectionObserver' in window)) {
        console.warn('[LazyLoader] IntersectionObserver not supported, loading all images immediately');
        this.loadAllImages();
        return false;
      }

      this.observer = new IntersectionObserver(
        (entries) => this.handleIntersection(entries),
        {
          rootMargin: this.options.rootMargin,
          threshold: this.options.threshold,
        }
      );

      console.log('[LazyLoader] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[LazyLoader] Initialization failed:', error);
      this.loadAllImages();
      return false;
    }
  }

  /**
   * Handles intersection observer entries
   * @param {IntersectionObserverEntry[]} entries
   */
  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        this.loadImage(img);
        this.observer.unobserve(img);
      }
    });
  }

  /**
   * Loads a single image
   * @param {HTMLImageElement} img
   */
  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (!src && !srcset) {
      console.warn('[LazyLoader] No data-src or data-srcset found:', img);
      return;
    }

    img.classList.add(this.options.loadingClass);

    const tempImg = new Image();

    tempImg.onload = () => {
      this.handleImageLoad(img, src, srcset);
    };

    tempImg.onerror = () => {
      this.handleImageError(img, src);
    };

    if (srcset) {
      tempImg.srcset = srcset;
    }
    if (src) {
      tempImg.src = src;
    }
  }

  /**
   * Handles successful image load
   * @param {HTMLImageElement} img
   * @param {string} src
   * @param {string} srcset
   */
  handleImageLoad(img, src, srcset) {
    if (srcset) {
      img.srcset = srcset;
    }
    if (src) {
      img.src = src;
    }

    img.classList.remove(this.options.loadingClass);
    img.classList.add(this.options.loadedClass);

    delete img.dataset.src;
    delete img.dataset.srcset;

    this.loadedCount++;
    console.log(`[LazyLoader] Image loaded successfully: ${src || srcset}`);
  }

  /**
   * Handles image load error
   * @param {HTMLImageElement} img
   * @param {string} src
   */
  handleImageError(img, src) {
    img.classList.remove(this.options.loadingClass);
    img.classList.add(this.options.errorClass);

    this.errorCount++;
    console.error(`[LazyLoader] Failed to load image: ${src}`);

    // Set alt text as fallback
    if (img.alt) {
      img.setAttribute('title', `Failed to load: ${img.alt}`);
    }
  }

  /**
   * Observes images with data-src or data-srcset attributes
   * @param {string} selector
   */
  observe(selector = 'img[data-src], img[data-srcset]') {
    try {
      const images = document.querySelectorAll(selector);

      if (images.length === 0) {
        console.log('[LazyLoader] No images found to observe');
        return;
      }

      images.forEach((img) => {
        this.images.add(img);
        if (this.observer) {
          this.observer.observe(img);
        } else {
          this.loadImage(img);
        }
      });

      console.log(`[LazyLoader] Observing ${images.length} images`);
    } catch (error) {
      console.error('[LazyLoader] Error observing images:', error);
    }
  }

  /**
   * Loads all images immediately (fallback for unsupported browsers)
   */
  loadAllImages() {
    const images = document.querySelectorAll('img[data-src], img[data-srcset]');
    images.forEach((img) => this.loadImage(img));
  }

  /**
   * Disconnects the observer and cleans up
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.images.clear();

    console.log(
      `[LazyLoader] Destroyed. Stats - Loaded: ${this.loadedCount}, Errors: ${this.errorCount}`
    );
  }

  /**
   * Gets loading statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      total: this.images.size,
      loaded: this.loadedCount,
      errors: this.errorCount,
      pending: this.images.size - this.loadedCount - this.errorCount,
    };
  }
}

/**
 * Web Vitals Tracking
 */
class WebVitalsTracker {
  constructor() {
    this.metrics = {
      FCP: null,
      LCP: null,
      FID: null,
      CLS: null,
      TTFB: null,
    };

    this.observers = [];
  }

  /**
   * Initializes web vitals tracking
   */
  initialize() {
    try {
      this.trackFCP();
      this.trackLCP();
      this.trackFID();
      this.trackCLS();
      this.trackTTFB();

      console.log('[WebVitals] Tracking initialized');
    } catch (error) {
      console.error('[WebVitals] Initialization failed:', error);
    }
  }

  /**
   * Tracks First Contentful Paint
   */
  trackFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.FCP = entry.startTime;
            console.log(`[WebVitals] FCP: ${entry.startTime.toFixed(2)}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('[WebVitals] FCP tracking not supported:', error);
    }
  }

  /**
   * Tracks Largest Contentful Paint
   */
  trackLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.LCP = lastEntry.renderTime || lastEntry.loadTime;
        console.log(`[WebVitals] LCP: ${this.metrics.LCP.toFixed(2)}ms`);
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('[WebVitals] LCP tracking not supported:', error);
    }
  }

  /**
   * Tracks First Input Delay
   */
  trackFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.FID = entry.processingStart - entry.startTime;
          console.log(`[WebVitals] FID: ${this.metrics.FID.toFixed(2)}ms`);
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('[WebVitals] FID tracking not supported:', error);
    }
  }

  /**
   * Tracks Cumulative Layout Shift
   */
  trackCLS() {
    try {
      let clsValue = 0;

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.CLS = clsValue;
            console.log(`[WebVitals] CLS: ${clsValue.toFixed(4)}`);
          }
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('[WebVitals] CLS tracking not supported:', error);
    }
  }

  /**
   * Tracks Time to First Byte
   */
  trackTTFB() {
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0];
      if (navigationEntry) {
        this.metrics.TTFB = navigationEntry.responseStart - navigationEntry.requestStart;
        console.log(`[WebVitals] TTFB: ${this.metrics.TTFB.toFixed(2)}ms`);
      }
    } catch (error) {
      console.warn('[WebVitals] TTFB tracking failed:', error);
    }
  }

  /**
   * Gets all tracked metrics
   * @returns {Object} Metrics object
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Logs all metrics to console
   */
  logMetrics() {
    console.group('[WebVitals] Performance Metrics');
    Object.entries(this.metrics).forEach(([key, value]) => {
      if (value !== null) {
        const formattedValue = key === 'CLS' ? value.toFixed(4) : `${value.toFixed(2)}ms`;
        console.log(`${key}: ${formattedValue}`);
      }
    });
    console.groupEnd();
  }

  /**
   * Cleans up observers
   */
  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    console.log('[WebVitals] Tracking destroyed');
  }
}

/**
 * Resource Preloading Utilities
 */
class ResourcePreloader {
  constructor() {
    this.preloadedResources = new Set();
  }

  /**
   * Preloads a critical resource
   * @param {string} href - Resource URL
   * @param {string} as - Resource type (script, style, image, font)
   * @param {Object} options - Additional options
   */
  preload(href, as, options = {}) {
    try {
      if (this.preloadedResources.has(href)) {
        console.log(`[Preloader] Resource already preloaded: ${href}`);
        return;
      }

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;

      if (options.type) {
        link.type = options.type;
      }

      if (options.crossorigin) {
        link.crossOrigin = options.crossorigin;
      }

      if (as === 'font') {
        link.crossOrigin = 'anonymous';
      }

      document.head.appendChild(link);
      this.preloadedResources.add(href);

      console.log(`[Preloader] Preloaded ${as}: ${href}`);
    } catch (error) {
      console.error(`[Preloader] Failed to preload ${href}:`, error);
    }
  }

  /**
   * Prefetches a resource for future navigation
   * @param {string} href - Resource URL
   */
  prefetch(href) {
    try {
      if (this.preloadedResources.has(href)) {
        return;
      }

      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;

      document.head.appendChild(link);
      this.preloadedResources.add(href);

      console.log(`[Preloader] Prefetched: ${href}`);
    } catch (error) {
      console.error(`[Preloader] Failed to prefetch ${href}:`, error);
    }
  }

  /**
   * Preconnects to an origin
   * @param {string} origin - Origin URL
   */
  preconnect(origin) {
    try {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;

      document.head.appendChild(link);

      console.log(`[Preloader] Preconnected to: ${origin}`);
    } catch (error) {
      console.error(`[Preloader] Failed to preconnect to ${origin}:`, error);
    }
  }
}

/**
 * Performance Monitor
 */
class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = new Map();
  }

  /**
   * Creates a performance mark
   * @param {string} name - Mark name
   */
  mark(name) {
    try {
      performance.mark(name);
      this.marks.set(name, performance.now());
      console.log(`[Performance] Mark: ${name}`);
    } catch (error) {
      console.error(`[Performance] Failed to create mark ${name}:`, error);
    }
  }

  /**
   * Measures time between two marks
   * @param {string} name - Measure name
   * @param {string} startMark - Start mark name
   * @param {string} endMark - End mark name
   * @returns {number|null} Duration in milliseconds
   */
  measure(name, startMark, endMark) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];

      if (measure) {
        this.measures.set(name, measure.duration);
        console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
        return measure.duration;
      }

      return null;
    } catch (error) {
      console.error(`[Performance] Failed to measure ${name}:`, error);
      return null;
    }
  }

  /**
   * Gets all measures
   * @returns {Object} Measures object
   */
  getMeasures() {
    return Object.fromEntries(this.measures);
  }

  /**
   * Clears all marks and measures
   */
  clear() {
    performance.clearMarks();
    performance.clearMeasures();
    this.marks.clear();
    this.measures.clear();
    console.log('[Performance] Cleared all marks and measures');
  }
}

// Export instances and classes
const lazyLoader = new LazyLoader();
const webVitalsTracker = new WebVitalsTracker();
const resourcePreloader = new ResourcePreloader();
const performanceMonitor = new PerformanceMonitor();

/**
 * Initializes all performance optimizations
 * @returns {Function} Cleanup function
 */
export function initializePerformance() {
  console.log('[Performance] Initializing performance optimizations');

  performanceMonitor.mark('performance-init-start');

  // Initialize lazy loading
  lazyLoader.initialize();
  lazyLoader.observe();

  // Initialize web vitals tracking
  webVitalsTracker.initialize();

  // Log metrics after page load
  if (document.readyState === 'complete') {
    setTimeout(() => webVitalsTracker.logMetrics(), 1000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => webVitalsTracker.logMetrics(), 1000);
    });
  }

  performanceMonitor.mark('performance-init-end');
  performanceMonitor.measure('performance-init', 'performance-init-start', 'performance-init-end');

  // Return cleanup function
  return () => {
    lazyLoader.destroy();
    webVitalsTracker.destroy();
    performanceMonitor.clear();
    console.log('[Performance] Cleanup completed');
  };
}

// Export individual components for advanced usage
export { LazyLoader, WebVitalsTracker, ResourcePreloader, PerformanceMonitor };

// Export singleton instances
export { lazyLoader, webVitalsTracker, resourcePreloader, performanceMonitor };