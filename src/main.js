/**
 * Main application entry point
 * Initializes the landing page application and sets up global functionality
 * 
 * @module main
 * @generated-from task-id:TASK-001
 */

import './style.css'

/**
 * Application initialization
 * Sets up the landing page with proper error handling and logging
 */
const initializeApp = () => {
  try {
    // Verify DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupApplication)
    } else {
      setupApplication()
    }
  } catch (error) {
    handleInitializationError(error)
  }
}

/**
 * Sets up the application after DOM is ready
 * Configures event listeners and initializes components
 */
const setupApplication = () => {
  try {
    logApplicationStart()
    
    // Verify critical DOM elements exist
    const appRoot = document.querySelector('#app')
    if (!appRoot) {
      throw new Error('Application root element #app not found')
    }

    // Set up global error handlers
    setupErrorHandlers()
    
    // Log successful initialization
    console.info('[App] Application initialized successfully', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    })
  } catch (error) {
    handleInitializationError(error)
  }
}

/**
 * Logs application startup information
 * Provides diagnostic information for debugging
 */
const logApplicationStart = () => {
  console.info('[App] Starting AI Task Manager Landing Page', {
    environment: import.meta.env.MODE,
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
}

/**
 * Sets up global error handlers for unhandled errors
 * Ensures errors are logged and don't crash the application
 */
const setupErrorHandlers = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[App] Unhandled promise rejection:', {
      reason: event.reason,
      promise: event.promise,
      timestamp: new Date().toISOString()
    })
    
    // Prevent default browser behavior
    event.preventDefault()
  })

  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('[App] Global error caught:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      timestamp: new Date().toISOString()
    })
  })
}

/**
 * Handles initialization errors with proper logging
 * Provides fallback behavior when initialization fails
 * 
 * @param {Error} error - The error that occurred during initialization
 */
const handleInitializationError = (error) => {
  console.error('[App] Failed to initialize application:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })

  // Attempt to display error to user if possible
  try {
    const appRoot = document.querySelector('#app')
    if (appRoot) {
      appRoot.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #dc2626;">
          <h1>Application Error</h1>
          <p>Failed to initialize the application. Please refresh the page.</p>
          <p style="font-size: 0.875rem; color: #6b7280; margin-top: 1rem;">
            Error: ${error.message}
          </p>
        </div>
      `
    }
  } catch (_displayError) {
    // If we can't display the error, just log it
    console.error('[App] Could not display error to user')
  }
}

// Initialize the application
initializeApp()