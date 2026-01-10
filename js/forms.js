/**
 * Form Validation Module
 * Provides real-time form validation with accessibility support
 * 
 * @module forms
 * @generated-from: task-id:TASK-008
 * @modifies: N/A (new file)
 * @dependencies: []
 */

/**
 * Email validation regex pattern
 * RFC 5322 compliant with practical constraints
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validation error messages
 */
const ERROR_MESSAGES = Object.freeze({
  EMAIL_REQUIRED: 'Email address is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  EMAIL_TOO_LONG: 'Email address is too long (maximum 254 characters)',
  GENERIC_REQUIRED: 'This field is required',
  GENERIC_INVALID: 'Please enter a valid value',
});

/**
 * Validation states
 */
const VALIDATION_STATE = Object.freeze({
  IDLE: 'idle',
  VALIDATING: 'validating',
  VALID: 'valid',
  INVALID: 'invalid',
});

/**
 * Debounce utility for input validation
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Validates email address format and length
 * @param {string} email - Email address to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
function validateEmail(email) {
  // Check if email is provided
  if (!email || email.trim().length === 0) {
    return {
      valid: false,
      error: ERROR_MESSAGES.EMAIL_REQUIRED,
    };
  }

  const trimmedEmail = email.trim();

  // Check email length (RFC 5321 maximum)
  if (trimmedEmail.length > 254) {
    return {
      valid: false,
      error: ERROR_MESSAGES.EMAIL_TOO_LONG,
    };
  }

  // Validate email format
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.EMAIL_INVALID,
    };
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Validates required field
 * @param {string} value - Field value to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
function validateRequired(value) {
  if (!value || value.trim().length === 0) {
    return {
      valid: false,
      error: ERROR_MESSAGES.GENERIC_REQUIRED,
    };
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Updates field UI state based on validation result
 * @param {HTMLElement} field - Input field element
 * @param {boolean} isValid - Validation state
 * @param {string|null} errorMessage - Error message to display
 */
function updateFieldState(field, isValid, errorMessage) {
  const errorElement = field.parentElement?.querySelector('.form-error');
  const fieldId = field.id || field.name;

  // Update field classes
  if (isValid) {
    field.classList.remove('error');
    field.classList.add('valid');
    field.setAttribute('aria-invalid', 'false');
  } else {
    field.classList.remove('valid');
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
  }

  // Update error message
  if (errorElement) {
    if (errorMessage) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'polite');
      
      // Link error to field for accessibility
      if (fieldId) {
        errorElement.id = `${fieldId}-error`;
        field.setAttribute('aria-describedby', errorElement.id);
      }
    } else {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
      errorElement.removeAttribute('role');
      field.removeAttribute('aria-describedby');
    }
  }
}

/**
 * Creates error message element if it doesn't exist
 * @param {HTMLElement} field - Input field element
 * @returns {HTMLElement} Error message element
 */
function ensureErrorElement(field) {
  const parent = field.parentElement;
  if (!parent) return null;

  let errorElement = parent.querySelector('.form-error');
  
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.style.display = 'none';
    parent.appendChild(errorElement);
  }

  return errorElement;
}

/**
 * Validates a single form field
 * @param {HTMLElement} field - Input field to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
function validateField(field) {
  const fieldType = field.type?.toLowerCase();
  const fieldValue = field.value;
  const isRequired = field.hasAttribute('required');

  // Email field validation
  if (fieldType === 'email') {
    return validateEmail(fieldValue);
  }

  // Required field validation
  if (isRequired) {
    return validateRequired(fieldValue);
  }

  // Field is optional and has no specific validation
  return {
    valid: true,
    error: null,
  };
}

/**
 * Handles real-time field validation on input
 * @param {Event} event - Input event
 */
function handleFieldInput(event) {
  const field = event.target;
  
  // Skip validation if field hasn't been touched yet
  if (!field.dataset.touched) {
    return;
  }

  const result = validateField(field);
  updateFieldState(field, result.valid, result.error);
}

/**
 * Handles field blur event (marks field as touched)
 * @param {Event} event - Blur event
 */
function handleFieldBlur(event) {
  const field = event.target;
  
  // Mark field as touched
  field.dataset.touched = 'true';
  
  // Validate on blur
  const result = validateField(field);
  updateFieldState(field, result.valid, result.error);
}

/**
 * Validates entire form
 * @param {HTMLFormElement} form - Form element to validate
 * @returns {{valid: boolean, errors: Object}} Validation result
 */
function validateForm(form) {
  const fields = form.querySelectorAll('input, textarea, select');
  const errors = {};
  let isValid = true;

  fields.forEach((field) => {
    // Mark all fields as touched
    field.dataset.touched = 'true';
    
    const result = validateField(field);
    const fieldName = field.name || field.id;

    if (!result.valid) {
      isValid = false;
      errors[fieldName] = result.error;
    }

    updateFieldState(field, result.valid, result.error);
  });

  return {
    valid: isValid,
    errors,
  };
}

/**
 * Handles form submission
 * @param {Event} event - Submit event
 */
function handleFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  
  // Validate form
  const validation = validateForm(form);
  
  if (!validation.valid) {
    // Focus first invalid field
    const firstInvalidField = form.querySelector('.error');
    if (firstInvalidField) {
      firstInvalidField.focus();
    }
    return;
  }

  // Disable submit button to prevent double submission
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.dataset.originalText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
  }

  // Get form data
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Simulate form submission (replace with actual API call)
  setTimeout(() => {
    console.log('Form submitted successfully:', data);
    
    // Show success message
    showFormFeedback(form, 'success', 'Thank you! Your submission has been received.');
    
    // Reset form
    form.reset();
    
    // Clear validation states
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach((field) => {
      field.classList.remove('valid', 'error');
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
      delete field.dataset.touched;
    });
    
    // Re-enable submit button
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.originalText || 'Submit';
    }
  }, 1500);
}

/**
 * Shows form feedback message
 * @param {HTMLFormElement} form - Form element
 * @param {string} type - Feedback type ('success' or 'error')
 * @param {string} message - Feedback message
 */
function showFormFeedback(form, type, message) {
  let feedbackElement = form.querySelector('.form-feedback');
  
  if (!feedbackElement) {
    feedbackElement = document.createElement('div');
    feedbackElement.className = 'form-feedback';
    form.insertBefore(feedbackElement, form.firstChild);
  }

  feedbackElement.className = `form-feedback form-feedback-${type}`;
  feedbackElement.textContent = message;
  feedbackElement.setAttribute('role', 'status');
  feedbackElement.setAttribute('aria-live', 'polite');
  feedbackElement.style.display = 'block';

  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      feedbackElement.style.display = 'none';
    }, 5000);
  }
}

/**
 * Initializes form validation for a single form
 * @param {HTMLFormElement} form - Form element to initialize
 */
function initializeForm(form) {
  // Ensure error elements exist for all fields
  const fields = form.querySelectorAll('input, textarea, select');
  fields.forEach((field) => {
    ensureErrorElement(field);
    
    // Set initial ARIA attributes
    field.setAttribute('aria-invalid', 'false');
  });

  // Create debounced input handler
  const debouncedInputHandler = debounce(handleFieldInput, 300);

  // Add event listeners
  fields.forEach((field) => {
    field.addEventListener('input', debouncedInputHandler);
    field.addEventListener('blur', handleFieldBlur);
  });

  // Add submit handler
  form.addEventListener('submit', handleFormSubmit);
}

/**
 * Initializes all forms on the page
 */
function initializeForms() {
  const forms = document.querySelectorAll('form[data-validate="true"]');
  
  forms.forEach((form) => {
    initializeForm(form);
  });
}

/**
 * Public API
 */
const FormValidator = Object.freeze({
  initialize: initializeForms,
  initializeForm,
  validateEmail,
  validateRequired,
  validateField,
  validateForm,
});

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeForms);
} else {
  initializeForms();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormValidator;
}