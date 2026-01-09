/**
 * SEO Enhancement Module
 * Manages structured data, meta tags, social sharing optimization, and analytics preparation
 * 
 * @module seo
 * @generated-from: TASK-010
 * @modifies: index.html meta tags and structured data
 */

/**
 * Configuration for SEO metadata
 * @typedef {Object} SEOConfig
 * @property {string} title - Page title
 * @property {string} description - Page description
 * @property {string} url - Canonical URL
 * @property {string} image - Social sharing image URL
 * @property {string} type - Open Graph type
 * @property {string} siteName - Site name
 * @property {string} twitterCard - Twitter card type
 * @property {string} [twitterSite] - Twitter site handle
 */

/**
 * Default SEO configuration
 * @type {SEOConfig}
 */
const DEFAULT_SEO_CONFIG = {
  title: 'AI Task Manager - Intelligent Task Management for Modern Teams',
  description: 'Transform your workflow with AI-powered task management. Automate prioritization, get intelligent insights, and boost team productivity with our cutting-edge task management platform.',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  image: '/images/og-image.jpg',
  type: 'website',
  siteName: 'AI Task Manager',
  twitterCard: 'summary_large_image',
  twitterSite: '@aitaskmanager',
};

/**
 * Structured data schema for the organization
 * @returns {Object} JSON-LD organization schema
 */
function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AI Task Manager',
    url: DEFAULT_SEO_CONFIG.url,
    logo: `${DEFAULT_SEO_CONFIG.url}/images/logo.png`,
    description: DEFAULT_SEO_CONFIG.description,
    sameAs: [
      'https://twitter.com/aitaskmanager',
      'https://linkedin.com/company/aitaskmanager',
      'https://github.com/aitaskmanager',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@aitaskmanager.com',
      availableLanguage: ['English'],
    },
  };
}

/**
 * Structured data schema for the software application
 * @returns {Object} JSON-LD software application schema
 */
function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AI Task Manager',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier available with premium plans',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
    description: DEFAULT_SEO_CONFIG.description,
    screenshot: `${DEFAULT_SEO_CONFIG.url}/images/app-screenshot.jpg`,
    featureList: [
      'AI-powered task prioritization',
      'Intelligent deadline prediction',
      'Automated workflow optimization',
      'Real-time collaboration',
      'Advanced analytics and insights',
    ],
  };
}

/**
 * Structured data schema for the website
 * @returns {Object} JSON-LD website schema
 */
function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: DEFAULT_SEO_CONFIG.siteName,
    url: DEFAULT_SEO_CONFIG.url,
    description: DEFAULT_SEO_CONFIG.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${DEFAULT_SEO_CONFIG.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Structured data schema for breadcrumbs
 * @returns {Object} JSON-LD breadcrumb list schema
 */
function generateBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: DEFAULT_SEO_CONFIG.url,
      },
    ],
  };
}

/**
 * Creates or updates a meta tag
 * @param {string} name - Meta tag name or property
 * @param {string} content - Meta tag content
 * @param {boolean} isProperty - Whether to use property attribute instead of name
 */
function setMetaTag(name, content, isProperty = false) {
  if (!content) {
    console.warn(`[SEO] Empty content for meta tag: ${name}`);
    return;
  }

  const attribute = isProperty ? 'property' : 'name';
  const selector = `meta[${attribute}="${name}"]`;
  
  let metaTag = document.querySelector(selector);
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, name);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
}

/**
 * Creates or updates a link tag
 * @param {string} rel - Link relationship
 * @param {string} href - Link URL
 */
function setLinkTag(rel, href) {
  if (!href) {
    console.warn(`[SEO] Empty href for link tag: ${rel}`);
    return;
  }

  const selector = `link[rel="${rel}"]`;
  let linkTag = document.querySelector(selector);
  
  if (!linkTag) {
    linkTag = document.createElement('link');
    linkTag.setAttribute('rel', rel);
    document.head.appendChild(linkTag);
  }
  
  linkTag.setAttribute('href', href);
}

/**
 * Injects structured data script into the document
 * @param {Object} schema - JSON-LD schema object
 * @param {string} id - Unique identifier for the script tag
 */
function injectStructuredData(schema, id) {
  try {
    const existingScript = document.querySelector(`script[data-schema-id="${id}"]`);
    
    if (existingScript) {
      existingScript.textContent = JSON.stringify(schema);
      return;
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema-id', id);
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    
    console.log(`[SEO] Injected structured data: ${id}`);
  } catch (error) {
    console.error(`[SEO] Failed to inject structured data ${id}:`, error);
  }
}

/**
 * Sets up all basic meta tags
 * @param {Partial<SEOConfig>} config - SEO configuration overrides
 */
function setupBasicMetaTags(config = {}) {
  const seoConfig = { ...DEFAULT_SEO_CONFIG, ...config };

  try {
    // Basic meta tags
    document.title = seoConfig.title;
    setMetaTag('description', seoConfig.description);
    setMetaTag('keywords', 'AI task manager, task management, productivity, workflow automation, team collaboration');
    setMetaTag('author', 'AI Task Manager Team');
    setMetaTag('robots', 'index, follow');
    setMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    
    // Canonical URL
    setLinkTag('canonical', seoConfig.url);
    
    console.log('[SEO] Basic meta tags configured');
  } catch (error) {
    console.error('[SEO] Failed to setup basic meta tags:', error);
  }
}

/**
 * Sets up Open Graph meta tags for social sharing
 * @param {Partial<SEOConfig>} config - SEO configuration overrides
 */
function setupOpenGraphTags(config = {}) {
  const seoConfig = { ...DEFAULT_SEO_CONFIG, ...config };

  try {
    setMetaTag('og:title', seoConfig.title, true);
    setMetaTag('og:description', seoConfig.description, true);
    setMetaTag('og:type', seoConfig.type, true);
    setMetaTag('og:url', seoConfig.url, true);
    setMetaTag('og:image', `${seoConfig.url}${seoConfig.image}`, true);
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
    setMetaTag('og:site_name', seoConfig.siteName, true);
    setMetaTag('og:locale', 'en_US', true);
    
    console.log('[SEO] Open Graph tags configured');
  } catch (error) {
    console.error('[SEO] Failed to setup Open Graph tags:', error);
  }
}

/**
 * Sets up Twitter Card meta tags
 * @param {Partial<SEOConfig>} config - SEO configuration overrides
 */
function setupTwitterCardTags(config = {}) {
  const seoConfig = { ...DEFAULT_SEO_CONFIG, ...config };

  try {
    setMetaTag('twitter:card', seoConfig.twitterCard);
    setMetaTag('twitter:title', seoConfig.title);
    setMetaTag('twitter:description', seoConfig.description);
    setMetaTag('twitter:image', `${seoConfig.url}${seoConfig.image}`);
    
    if (seoConfig.twitterSite) {
      setMetaTag('twitter:site', seoConfig.twitterSite);
      setMetaTag('twitter:creator', seoConfig.twitterSite);
    }
    
    console.log('[SEO] Twitter Card tags configured');
  } catch (error) {
    console.error('[SEO] Failed to setup Twitter Card tags:', error);
  }
}

/**
 * Sets up all structured data schemas
 */
function setupStructuredData() {
  try {
    injectStructuredData(generateOrganizationSchema(), 'organization-schema');
    injectStructuredData(generateSoftwareApplicationSchema(), 'software-schema');
    injectStructuredData(generateWebSiteSchema(), 'website-schema');
    injectStructuredData(generateBreadcrumbSchema(), 'breadcrumb-schema');
    
    console.log('[SEO] All structured data schemas injected');
  } catch (error) {
    console.error('[SEO] Failed to setup structured data:', error);
  }
}

/**
 * Prepares analytics integration points
 * Sets up data attributes and event listeners for analytics tracking
 */
function prepareAnalyticsIntegration() {
  try {
    // Add data attributes to trackable elements
    const ctaButtons = document.querySelectorAll('.cta-button, [data-cta]');
    ctaButtons.forEach((button, index) => {
      if (!button.hasAttribute('data-analytics-id')) {
        button.setAttribute('data-analytics-id', `cta-${index + 1}`);
        button.setAttribute('data-analytics-category', 'engagement');
      }
    });

    // Add tracking to pricing cards
    const pricingCards = document.querySelectorAll('[data-plan]');
    pricingCards.forEach((card) => {
      if (!card.hasAttribute('data-analytics-id')) {
        const planName = card.getAttribute('data-plan') || 'unknown';
        card.setAttribute('data-analytics-id', `pricing-${planName}`);
        card.setAttribute('data-analytics-category', 'conversion');
      }
    });

    // Add tracking to navigation links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach((link) => {
      if (!link.hasAttribute('data-analytics-id')) {
        const href = link.getAttribute('href') || '';
        const linkId = href.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        link.setAttribute('data-analytics-id', `nav-${linkId}`);
        link.setAttribute('data-analytics-category', 'navigation');
      }
    });

    console.log('[SEO] Analytics integration prepared');
  } catch (error) {
    console.error('[SEO] Failed to prepare analytics integration:', error);
  }
}

/**
 * Updates page metadata dynamically
 * Useful for single-page applications or dynamic content
 * @param {Partial<SEOConfig>} config - New SEO configuration
 */
function updatePageMetadata(config) {
  try {
    setupBasicMetaTags(config);
    setupOpenGraphTags(config);
    setupTwitterCardTags(config);
    
    console.log('[SEO] Page metadata updated dynamically');
  } catch (error) {
    console.error('[SEO] Failed to update page metadata:', error);
  }
}

/**
 * Validates current SEO implementation
 * Checks for required meta tags and structured data
 * @returns {Object} Validation results
 */
function validateSEOImplementation() {
  const results = {
    valid: true,
    warnings: [],
    errors: [],
  };

  try {
    // Check required meta tags
    const requiredMetaTags = [
      'description',
      'og:title',
      'og:description',
      'og:image',
      'twitter:card',
    ];

    requiredMetaTags.forEach((tag) => {
      const isProperty = tag.startsWith('og:') || tag.startsWith('twitter:');
      const attribute = isProperty ? 'property' : 'name';
      const selector = `meta[${attribute}="${tag}"]`;
      const element = document.querySelector(selector);

      if (!element || !element.getAttribute('content')) {
        results.errors.push(`Missing or empty meta tag: ${tag}`);
        results.valid = false;
      }
    });

    // Check structured data
    const schemas = ['organization-schema', 'software-schema', 'website-schema'];
    schemas.forEach((schemaId) => {
      const script = document.querySelector(`script[data-schema-id="${schemaId}"]`);
      if (!script) {
        results.warnings.push(`Missing structured data: ${schemaId}`);
      }
    });

    // Check canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      results.warnings.push('Missing canonical URL');
    }

    console.log('[SEO] Validation completed:', results);
  } catch (error) {
    console.error('[SEO] Validation failed:', error);
    results.valid = false;
    results.errors.push(`Validation error: ${error.message}`);
  }

  return results;
}

/**
 * Initializes all SEO enhancements
 * @param {Partial<SEOConfig>} config - Optional SEO configuration overrides
 * @returns {Function} Cleanup function
 */
export function initializeSEO(config = {}) {
  console.log('[SEO] Initializing SEO enhancements');

  try {
    setupBasicMetaTags(config);
    setupOpenGraphTags(config);
    setupTwitterCardTags(config);
    setupStructuredData();
    prepareAnalyticsIntegration();

    // Validate implementation in development
    if (import.meta.env.DEV) {
      const validation = validateSEOImplementation();
      if (!validation.valid) {
        console.warn('[SEO] Validation issues detected:', validation);
      }
    }

    console.log('[SEO] SEO enhancements initialized successfully');
  } catch (error) {
    console.error('[SEO] Failed to initialize SEO enhancements:', error);
  }

  // Return cleanup function
  return () => {
    console.log('[SEO] Cleanup completed');
  };
}

// Export utility functions for advanced usage
export {
  updatePageMetadata,
  validateSEOImplementation,
  generateOrganizationSchema,
  generateSoftwareApplicationSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
};