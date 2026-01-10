/**
 * Lazy Loading Module
 * Implements Intersection Observer API for efficient image lazy loading
 * with responsive image support, fallbacks, and error handling
 * 
 * @module lazy-loading
 * @generated-from: TASK-009
 * @modifies: index.html images
 */

/**
 * Configuration for lazy loading behavior
 * @typedef {Object} LazyLoadConfig
 * @property {number} rootMargin - Margin around viewport for early loading (px)
 * @property {number} threshold - Visibility threshold (0-1)
 * @property {string} placeholderClass - CSS class for placeholder state
 * @property {string} loadingClass - CSS class during loading
 * @property {string} loadedClass - CSS class after successful load
 * @property {string} errorClass - CSS class on load failure
 * @property {boolean} enableFadeIn - Enable fade-in animation
 * @property {number} fadeInDuration - Fade-in duration in ms
 */

/**
 * Default configuration
 * @type {LazyLoadConfig}
 */
const DEFAULT_CONFIG = {
  rootMargin: '50px',
  threshold: 0.01,
  placeholderClass: 'lazy-placeholder',
  loadingClass: 'lazy-loading',
  loadedClass: 'lazy-loaded',
  errorClass: 'lazy-error',
  enableFadeIn: true,
  fadeInDuration: 300,
};

/**
 * LazyLoader class for managing image lazy loading
 */
class LazyLoader {
  /**
   * @param {Partial<LazyLoadConfig>} config - Configuration options
   */
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.observer = null;
    this.images = new Set();
    this.loadedImages = new WeakMap();
    this.retryAttempts = new WeakMap();
    this.maxRetries = 3;
    
    this.init();
  }

  /**
   * Initialize the lazy loader
   * @private
   */
  init() {
    if (!this.isIntersectionObserverSupported()) {
      console.warn('[LazyLoader] Intersection Observer not supported, loading all images immediately');
      this.loadAllImagesImmediately();
      return;
    }

    this.createObserver();
    this.observeImages();
    this.setupMutationObserver();
  }

  /**
   * Check if Intersection Observer is supported
   * @private
   * @returns {boolean}
   */
  isIntersectionObserverSupported() {
    return (
      'IntersectionObserver' in window &&
      'IntersectionObserverEntry' in window &&
      'intersectionRatio' in window.IntersectionObserverEntry.prototype
    );
  }

  /**
   * Create Intersection Observer instance
   * @private
   */
  createObserver() {
    const options = {
      root: null,
      rootMargin: this.config.rootMargin,
      threshold: this.config.threshold,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
        }
      });
    }, options);
  }

  /**
   * Find and observe all lazy-loadable images
   * @private
   */
  observeImages() {
    const images = document.querySelectorAll('img[data-src], img[data-srcset]');
    
    images.forEach((img) => {
      if (!this.images.has(img)) {
        this.images.add(img);
        this.observer.observe(img);
        this.applyPlaceholder(img);
      }
    });
  }

  /**
   * Setup MutationObserver to watch for dynamically added images
   * @private
   */
  setupMutationObserver() {
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches('img[data-src], img[data-srcset]')) {
              this.images.add(node);
              this.observer.observe(node);
              this.applyPlaceholder(node);
            }
            
            const nestedImages = node.querySelectorAll('img[data-src], img[data-srcset]');
            nestedImages.forEach((img) => {
              if (!this.images.has(img)) {
                this.images.add(img);
                this.observer.observe(img);
                this.applyPlaceholder(img);
              }
            });
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Apply placeholder styling to image
   * @private
   * @param {HTMLImageElement} img
   */
  applyPlaceholder(img) {
    img.classList.add(this.config.placeholderClass);
    
    if (!img.src && !img.getAttribute('src')) {
      const placeholder = this.generatePlaceholder(img);
      img.src = placeholder;
    }
  }

  /**
   * Generate placeholder data URL
   * @private
   * @param {HTMLImageElement} img
   * @returns {string}
   */
  generatePlaceholder(img) {
    const width = img.getAttribute('width') || 100;
    const height = img.getAttribute('height') || 100;
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="sans-serif" font-size="14">
          Loading...
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  /**
   * Load image when it enters viewport
   * @private
   * @param {HTMLImageElement} img
   */
  async loadImage(img) {
    if (this.loadedImages.has(img)) {
      return;
    }

    this.observer.unobserve(img);
    img.classList.remove(this.config.placeholderClass);
    img.classList.add(this.config.loadingClass);

    try {
      await this.loadImageWithRetry(img);
      this.onImageLoaded(img);
    } catch (error) {
      this.onImageError(img, error);
    }
  }

  /**
   * Load image with retry logic
   * @private
   * @param {HTMLImageElement} img
   * @returns {Promise<void>}
   */
  async loadImageWithRetry(img) {
    const attempts = this.retryAttempts.get(img) || 0;
    
    try {
      await this.loadImageSource(img);
      this.retryAttempts.delete(img);
    } catch (error) {
      if (attempts < this.maxRetries) {
        this.retryAttempts.set(img, attempts + 1);
        const delay = Math.min(1000 * Math.pow(2, attempts), 5000);
        await this.sleep(delay);
        return this.loadImageWithRetry(img);
      }
      throw error;
    }
  }

  /**
   * Load image source and srcset
   * @private
   * @param {HTMLImageElement} img
   * @returns {Promise<void>}
   */
  loadImageSource(img) {
    return new Promise((resolve, reject) => {
      const dataSrc = img.getAttribute('data-src');
      const dataSrcset = img.getAttribute('data-srcset');
      const dataSizes = img.getAttribute('data-sizes');

      if (!dataSrc && !dataSrcset) {
        reject(new Error('No data-src or data-srcset attribute found'));
        return;
      }

      const tempImg = new Image();

      tempImg.onload = () => {
        if (dataSrcset) {
          img.srcset = dataSrcset;
          img.removeAttribute('data-srcset');
        }
        
        if (dataSizes) {
          img.sizes = dataSizes;
          img.removeAttribute('data-sizes');
        }
        
        if (dataSrc) {
          img.src = dataSrc;
          img.removeAttribute('data-src');
        }

        resolve();
      };

      tempImg.onerror = () => {
        reject(new Error(`Failed to load image: ${dataSrc || dataSrcset}`));
      };

      if (dataSrcset) {
        tempImg.srcset = dataSrcset;
      }
      
      if (dataSrc) {
        tempImg.src = dataSrc;
      }
    });
  }

  /**
   * Handle successful image load
   * @private
   * @param {HTMLImageElement} img
   */
  onImageLoaded(img) {
    this.loadedImages.set(img, true);
    img.classList.remove(this.config.loadingClass);
    img.classList.add(this.config.loadedClass);

    if (this.config.enableFadeIn) {
      this.applyFadeIn(img);
    }

    img.dispatchEvent(new CustomEvent('lazyloaded', {
      bubbles: true,
      detail: { src: img.src },
    }));
  }

  /**
   * Apply fade-in animation
   * @private
   * @param {HTMLImageElement} img
   */
  applyFadeIn(img) {
    img.style.opacity = '0';
    img.style.transition = `opacity ${this.config.fadeInDuration}ms ease-in-out`;
    
    requestAnimationFrame(() => {
      img.style.opacity = '1';
    });
  }

  /**
   * Handle image load error
   * @private
   * @param {HTMLImageElement} img
   * @param {Error} error
   */
  onImageError(img, error) {
    console.error('[LazyLoader] Failed to load image:', error.message, img);
    
    img.classList.remove(this.config.loadingClass);
    img.classList.add(this.config.errorClass);
    
    img.alt = img.alt || 'Failed to load image';
    
    img.dispatchEvent(new CustomEvent('lazyerror', {
      bubbles: true,
      detail: { error: error.message },
    }));
  }

  /**
   * Sleep utility for retry delays
   * @private
   * @param {number} ms
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Fallback: Load all images immediately without lazy loading
   * @private
   */
  loadAllImagesImmediately() {
    const images = document.querySelectorAll('img[data-src], img[data-srcset]');
    
    images.forEach((img) => {
      const dataSrc = img.getAttribute('data-src');
      const dataSrcset = img.getAttribute('data-srcset');
      const dataSizes = img.getAttribute('data-sizes');

      if (dataSrcset) {
        img.srcset = dataSrcset;
        img.removeAttribute('data-srcset');
      }
      
      if (dataSizes) {
        img.sizes = dataSizes;
        img.removeAttribute('data-sizes');
      }
      
      if (dataSrc) {
        img.src = dataSrc;
        img.removeAttribute('data-src');
      }
    });
  }

  /**
   * Manually trigger loading of specific image
   * @public
   * @param {HTMLImageElement} img
   */
  loadImageNow(img) {
    if (this.observer && this.images.has(img)) {
      this.loadImage(img);
    }
  }

  /**
   * Refresh and observe new images
   * @public
   */
  refresh() {
    this.observeImages();
  }

  /**
   * Destroy the lazy loader and clean up
   * @public
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    this.images.clear();
    this.loadedImages = new WeakMap();
    this.retryAttempts = new WeakMap();
  }
}

/**
 * Initialize lazy loading on DOM ready
 */
function initLazyLoading(config = {}) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      return new LazyLoader(config);
    });
  } else {
    return new LazyLoader(config);
  }
}

/**
 * Export for module usage
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LazyLoader, initLazyLoading };
}

/**
 * Auto-initialize if not in module context
 */
if (typeof window !== 'undefined' && !window.lazyLoader) {
  window.lazyLoader = initLazyLoading();
}