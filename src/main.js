import './styles/main.css';
import { initializeNavigation } from './js/navigation.js';
import { initializeHero } from './js/hero.js';
import { initializeFeatures } from './js/features.js';
import { initializeWorkflow } from './js/workflow.js';
import { initializeTestimonials } from './js/testimonials.js';
import { initializePricing } from './js/pricing.js';
import { initializePerformance } from './js/performance.js';
import { initializeSEO } from './js/seo.js';

// Load HTML components
async function loadComponents() {
  const components = [
    { id: 'header', path: '/src/components/header.html' },
    { id: 'hero', path: '/src/components/hero.html' },
    { id: 'features', path: '/src/components/features.html' },
    { id: 'workflow', path: '/src/components/workflow.html' },
    { id: 'testimonials', path: '/src/components/testimonials.html' },
    { id: 'pricing', path: '/src/components/pricing.html' },
    { id: 'footer', path: '/src/components/footer.html' },
  ];

  try {
    await Promise.all(
      components.map(async ({ id, path }) => {
        const response = await fetch(path);
        const html = await response.text();
        const element = document.getElementById(id);
        if (element) {
          element.innerHTML = html;
        }
      })
    );
  } catch (error) {
    console.error('Error loading components:', error);
  }
}

// Initialize all modules
async function initializeApp() {
  try {
    await loadComponents();

    // Initialize performance optimizations
    const performanceCleanup = initializePerformance();

    // Initialize SEO enhancements
    const seoCleanup = initializeSEO();

    // Initialize component modules
    initializeNavigation();
    initializeHero();
    initializeFeatures();
    initializeWorkflow();
    initializeTestimonials();
    initializePricing();

    console.log('Application initialized successfully');

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      performanceCleanup();
      seoCleanup();
    });
  } catch (error) {
    console.error('Error initializing application:', error);
  }
}

// Start the application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}