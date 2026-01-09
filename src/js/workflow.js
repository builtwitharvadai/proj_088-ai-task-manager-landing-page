/**
 * Workflow Section - Interactive Animations and Scroll Effects
 * 
 * Implements scroll-triggered animations using Intersection Observer API
 * for the 3-step workflow demonstration. Handles step-by-step reveal
 * animations, visual flow sequences, and interactive hover effects.
 * 
 * @module workflow
 */

/**
 * Configuration for workflow animations
 * @const {Object}
 */
const WORKFLOW_CONFIG = Object.freeze({
  // Intersection Observer thresholds
  OBSERVER_THRESHOLD: [0, 0.25, 0.5, 0.75, 1.0],
  OBSERVER_ROOT_MARGIN: '0px 0px -100px 0px',
  
  // Animation timing
  STEP_ANIMATION_DELAY: 200, // ms between each step animation
  CONNECTOR_ANIMATION_DELAY: 150, // ms delay for connector animation
  
  // CSS classes
  CLASSES: Object.freeze({
    ANIMATED: 'workflow__step--animated',
    VISIBLE: 'workflow__step--visible',
    CONNECTOR_ACTIVE: 'workflow__connector--active',
    STATIC: 'static',
  }),
  
  // Selectors
  SELECTORS: Object.freeze({
    WORKFLOW_SECTION: '.workflow',
    WORKFLOW_STEPS: '.workflow__step',
    WORKFLOW_CONNECTORS: '.workflow__connector',
    WORKFLOW_STEP_ICON: '.workflow__step-icon',
    WORKFLOW_STEP_NUMBER: '.workflow__step-number',
  }),
  
  // Performance optimization
  DEBOUNCE_DELAY: 100, // ms for resize events
  REDUCED_MOTION_QUERY: '(prefers-reduced-motion: reduce)',
});

/**
 * Main workflow animation controller
 * Manages intersection observers and animation sequences
 */
class WorkflowAnimationController {
  /**
   * @param {HTMLElement} workflowSection - The workflow section element
   */
  constructor(workflowSection) {
    if (!workflowSection) {
      throw new Error('Workflow section element is required');
    }
    
    this.workflowSection = workflowSection;
    this.steps = Array.from(
      workflowSection.querySelectorAll(WORKFLOW_CONFIG.SELECTORS.WORKFLOW_STEPS)
    );
    this.connectors = Array.from(
      workflowSection.querySelectorAll(WORKFLOW_CONFIG.SELECTORS.WORKFLOW_CONNECTORS)
    );
    
    this.observer = null;
    this.animationTimeouts = [];
    this.isAnimating = false;
    this.hasAnimated = false;
    this.prefersReducedMotion = false;
    
    this._checkReducedMotion();
    this._init();
  }
  
  /**
   * Check if user prefers reduced motion
   * @private
   */
  _checkReducedMotion() {
    const mediaQuery = window.matchMedia(WORKFLOW_CONFIG.REDUCED_MOTION_QUERY);
    this.prefersReducedMotion = mediaQuery.matches;
    
    // Listen for changes in motion preference
    mediaQuery.addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
      if (this.prefersReducedMotion && this.isAnimating) {
        this._skipAnimations();
      }
    });
  }
  
  /**
   * Initialize the workflow animations
   * @private
   */
  _init() {
    // Check for static mode (kill switch)
    if (this.workflowSection.classList.contains(WORKFLOW_CONFIG.CLASSES.STATIC)) {
      this._skipAnimations();
      return;
    }
    
    // Skip animations if user prefers reduced motion
    if (this.prefersReducedMotion) {
      this._skipAnimations();
      return;
    }
    
    this._setupIntersectionObserver();
    this._setupInteractiveEffects();
    this._setupResizeHandler();
  }
  
  /**
   * Setup Intersection Observer for scroll-triggered animations
   * @private
   */
  _setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: WORKFLOW_CONFIG.OBSERVER_ROOT_MARGIN,
      threshold: WORKFLOW_CONFIG.OBSERVER_THRESHOLD,
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25 && !this.hasAnimated) {
          this._triggerStepAnimations();
        }
      });
    }, options);
    
    this.observer.observe(this.workflowSection);
  }
  
  /**
   * Trigger sequential step animations
   * @private
   */
  _triggerStepAnimations() {
    if (this.isAnimating || this.hasAnimated) {
      return;
    }
    
    this.isAnimating = true;
    this.hasAnimated = true;
    
    this.steps.forEach((step, index) => {
      const delay = index * WORKFLOW_CONFIG.STEP_ANIMATION_DELAY;
      
      const timeout = setTimeout(() => {
        this._animateStep(step, index);
      }, delay);
      
      this.animationTimeouts.push(timeout);
    });
  }
  
  /**
   * Animate individual step with icon and connector
   * @private
   * @param {HTMLElement} step - The step element to animate
   * @param {number} index - The step index
   */
  _animateStep(step, index) {
    // Add visible class to trigger CSS animations
    step.classList.add(WORKFLOW_CONFIG.CLASSES.VISIBLE);
    
    // Animate step icon
    const icon = step.querySelector(WORKFLOW_CONFIG.SELECTORS.WORKFLOW_STEP_ICON);
    if (icon) {
      this._animateIcon(icon);
    }
    
    // Animate step number badge
    const numberBadge = step.querySelector(WORKFLOW_CONFIG.SELECTORS.WORKFLOW_STEP_NUMBER);
    if (numberBadge) {
      this._animateNumberBadge(numberBadge);
    }
    
    // Animate connector after step (if not last step)
    if (index < this.connectors.length) {
      const connectorTimeout = setTimeout(() => {
        this._animateConnector(this.connectors[index]);
      }, WORKFLOW_CONFIG.CONNECTOR_ANIMATION_DELAY);
      
      this.animationTimeouts.push(connectorTimeout);
    }
    
    // Mark animation as complete after last step
    if (index === this.steps.length - 1) {
      const completeTimeout = setTimeout(() => {
        this.isAnimating = false;
        step.classList.add(WORKFLOW_CONFIG.CLASSES.ANIMATED);
      }, WORKFLOW_CONFIG.CONNECTOR_ANIMATION_DELAY);
      
      this.animationTimeouts.push(completeTimeout);
    }
  }
  
  /**
   * Animate step icon with scale and rotation
   * @private
   * @param {HTMLElement} icon - The icon element
   */
  _animateIcon(icon) {
    icon.style.animation = 'workflowIconPulse 0.6s ease-out';
  }
  
  /**
   * Animate number badge with bounce effect
   * @private
   * @param {HTMLElement} badge - The number badge element
   */
  _animateNumberBadge(badge) {
    badge.style.animation = 'workflowBadgeBounce 0.5s ease-out';
  }
  
  /**
   * Animate connector with draw effect
   * @private
   * @param {HTMLElement} connector - The connector element
   */
  _animateConnector(connector) {
    connector.classList.add(WORKFLOW_CONFIG.CLASSES.CONNECTOR_ACTIVE);
  }
  
  /**
   * Skip all animations and show final state
   * @private
   */
  _skipAnimations() {
    this.steps.forEach((step) => {
      step.classList.add(WORKFLOW_CONFIG.CLASSES.VISIBLE);
      step.classList.add(WORKFLOW_CONFIG.CLASSES.ANIMATED);
    });
    
    this.connectors.forEach((connector) => {
      connector.classList.add(WORKFLOW_CONFIG.CLASSES.CONNECTOR_ACTIVE);
    });
    
    this.hasAnimated = true;
    this.isAnimating = false;
  }
  
  /**
   * Setup interactive hover and focus effects
   * @private
   */
  _setupInteractiveEffects() {
    this.steps.forEach((step) => {
      // Enhanced hover effect
      step.addEventListener('mouseenter', () => {
        if (!this.prefersReducedMotion) {
          this._handleStepHover(step, true);
        }
      });
      
      step.addEventListener('mouseleave', () => {
        if (!this.prefersReducedMotion) {
          this._handleStepHover(step, false);
        }
      });
      
      // Keyboard focus support
      step.addEventListener('focusin', () => {
        step.setAttribute('data-focused', 'true');
      });
      
      step.addEventListener('focusout', () => {
        step.removeAttribute('data-focused');
      });
    });
  }
  
  /**
   * Handle step hover interactions
   * @private
   * @param {HTMLElement} step - The step element
   * @param {boolean} isHovering - Whether the step is being hovered
   */
  _handleStepHover(step, isHovering) {
    const icon = step.querySelector(WORKFLOW_CONFIG.SELECTORS.WORKFLOW_STEP_ICON);
    
    if (icon) {
      if (isHovering) {
        icon.style.transform = 'scale(1.1) rotate(5deg)';
        icon.style.transition = 'transform 0.3s ease-out';
      } else {
        icon.style.transform = '';
        icon.style.transition = '';
      }
    }
  }
  
  /**
   * Setup resize handler with debouncing
   * @private
   */
  _setupResizeHandler() {
    let resizeTimeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this._handleResize();
      }, WORKFLOW_CONFIG.DEBOUNCE_DELAY);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Store cleanup function
    this._cleanupResize = () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }
  
  /**
   * Handle window resize events
   * @private
   */
  _handleResize() {
    // Recalculate positions if needed
    // Currently no action needed, but placeholder for future enhancements
  }
  
  /**
   * Cleanup and destroy the controller
   * @public
   */
  destroy() {
    // Clear all animation timeouts
    this.animationTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.animationTimeouts = [];
    
    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    // Cleanup resize handler
    if (this._cleanupResize) {
      this._cleanupResize();
    }
    
    // Reset state
    this.isAnimating = false;
    this.hasAnimated = false;
  }
}

/**
 * Initialize workflow animations when DOM is ready
 * @private
 */
function initWorkflowAnimations() {
  const workflowSection = document.querySelector(WORKFLOW_CONFIG.SELECTORS.WORKFLOW_SECTION);
  
  if (!workflowSection) {
    console.warn('Workflow section not found. Skipping workflow animations.');
    return null;
  }
  
  try {
    const controller = new WorkflowAnimationController(workflowSection);
    
    // Store controller instance for potential cleanup
    workflowSection._workflowController = controller;
    
    return controller;
  } catch (error) {
    console.error('Failed to initialize workflow animations:', error);
    return null;
  }
}

/**
 * Cleanup workflow animations
 * @public
 */
function cleanupWorkflowAnimations() {
  const workflowSection = document.querySelector(WORKFLOW_CONFIG.SELECTORS.WORKFLOW_SECTION);
  
  if (workflowSection && workflowSection._workflowController) {
    workflowSection._workflowController.destroy();
    workflowSection._workflowController = null;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWorkflowAnimations);
} else {
  initWorkflowAnimations();
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupWorkflowAnimations);

// Export for module usage
export { WorkflowAnimationController, initWorkflowAnimations, cleanupWorkflowAnimations };