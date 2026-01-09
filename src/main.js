/**
 * Main Application Entry Point
 * 
 * Initializes and coordinates all application modules including navigation,
 * hero section, features section, and workflow animations.
 */

import './styles/main.css';
import { initNavigation } from './js/navigation.js';
import { initHero } from './js/hero.js';
import { initFeatures } from './js/features.js';
import { initWorkflowAnimations } from './js/workflow.js';

/**
 * Initialize all application modules
 * @private
 */
function initApp() {
  try {
    // Initialize navigation
    initNavigation();
    
    // Initialize hero section
    initHero();
    
    // Initialize features section
    initFeatures();
    
    // Initialize workflow animations
    initWorkflowAnimations();
    
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