/**
 * Main Application Entry Point
 * Initializes all components and manages application lifecycle
 */

import './styles/main.css';
import './styles/design-system.css';
import './styles/typography.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/header.css';
import './styles/hero.css';
import './styles/features.css';
import './styles/workflow.css';

import { initNavigation } from './js/navigation.js';
import { initHero } from './js/hero.js';
import { initFeatures } from './js/features.js';
import { initWorkflow } from './js/workflow.js';
import { initTestimonials } from './js/testimonials.js';

/**
 * Load HTML component into target element
 * @param {string} componentPath - Path to HTML component file
 * @param {string} targetSelector - CSS selector for target element
 * @returns {Promise<void>}
 */
async function loadComponent(componentPath, targetSelector) {
  try {
    const response = await fetch(componentPath);
    if (!response.ok) {
      throw new Error(`Failed to load ${componentPath}: ${response.status}`);
    }
    const html = await response.text();
    const target = document.querySelector(targetSelector);
    if (target) {
      target.innerHTML = html;
    } else {
      console.warn(`Target element not found: ${targetSelector}`);
    }
  } catch (error) {
    console.error(`Error loading component ${componentPath}:`, error);
  }
}

/**
 * Initialize all application components
 */
async function initApp() {
  try {
    // Load HTML components
    await Promise.all([
      loadComponent('/src/components/header.html', 'header'),
      loadComponent('/src/components/hero.html', '#hero'),
      loadComponent('/src/components/features.html', '#features'),
      loadComponent('/src/components/workflow.html', '#workflow'),
    ]);

    // Initialize JavaScript modules
    initNavigation();
    initHero();
    initFeatures();
    initWorkflow();
    initTestimonials();

    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}