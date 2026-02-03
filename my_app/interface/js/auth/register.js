
import { storeUserSession, enforceAuthRoutes } from './sessions.js';
import { checkBackendConnection } from '../ui.js';

document.addEventListener('DOMContentLoaded', () => {
  
  enforceAuthRoutes();
  
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegistration);
  }
  
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('input', () => validateEmailLive(emailInput));
    emailInput.addEventListener('blur', () => validateEmailLive(emailInput, true));
  }
  
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  
  if (confirmPasswordInput && passwordInput) {
    confirmPasswordInput.addEventListener('input', () => {
      if (passwordInput.value !== confirmPasswordInput.value) {
        showFieldError('confirm-password', 'Passwords do not match');
      } else {
        clearFieldError('confirm-password');
      }
    });
  }
  
  checkBackendConnection().then(isConnected => {
    if (!isConnected) {
      showMessage('Backend server is not reachable. Running in demo mode.', 'info');
    }
  });
});

async function handleRegistration(event) {
  event.preventDefault();
  
  clearErrors();
  
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  if (!username) {
    showFieldError('username', 'Please enter a username');
    return;
  }
  
  if (!email) {
    showFieldError('email', 'Please enter your Gonzaga email');
    return;
  }
  
  if (!isValidGonzagaEmail(email)) {
    showFieldError('email', 'Please use a valid Gonzaga email address');
    return;
  }
  
  if (!password) {
    showFieldError('password', 'Please enter a password');
    return;
  }
  
  if (!isValidPassword(password)) {
    showFieldError('password', 'Password does not meet the requirements');
    return;
  }
  
  if (password !== confirmPassword) {
    showFieldError('confirm-password', 'Passwords do not match');
    return;
  }
  
  const submitButton = event.target.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Creating account...';
  
  try {
    
    const backendAvailable = await checkBackendConnection();
    
    if (backendAvailable) {
      
      const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001' : '';
      const response = await fetch(`${apiBase}/user_bp/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          email,
          password,
          name: username 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        showVerificationMessage(email);
        
        storeUserSession(data.user, data.token);
        
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 3000);
      } else {
        const errorData = await response.json();
        showMessage(errorData.message || 'Registration failed. Please try again.', 'error');
      }
    } else {
      
      handleDemoRegistration(username, email);
    }
  } catch (error) {
    console.error('Registration error:', error);
    showMessage('An error occurred during registration. Please try again.', 'error');
  } finally {
    
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}

function handleDemoRegistration(username, email) {
  
  const mockUser = {
    user_id: 'demo-123',
    username: username,
    name: username,
    email: email,
    role: 'student'
  };
  
  showVerificationMessage(email);
  
  storeUserSession(mockUser, 'demo-token-123');
  
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 3000);
}

function showVerificationMessage(email) {
  
  document.getElementById('register-form').innerHTML = `
    <div class="verification-info">
      <h3>Registration Successful!</h3>
      <p>We've sent a verification email to <strong>${email}</strong>.</p>
      <p>Please check your inbox and follow the instructions to verify your account.</p>
      <p>You will be redirected to the main app shortly...</p>
    </div>
  `;
}

function validateEmailLive(input, strict = false) {
  const email = input.value.trim();
  
  if (!email && !strict) {
    clearFieldError('email');
    return;
  }
  
  if (email && !isValidGonzagaEmail(email)) {
    if (strict || email.includes('@')) {
      showFieldError('email', 'Please use a valid Gonzaga email address');
    }
  } else {
    clearFieldError('email');
  }
}

function isValidGonzagaEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@(zagmail\.)?gonzaga\.edu$/.test(email);
}

function isValidPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}

function showMessage(message, type = 'error') {
  const messageContainer = document.getElementById('auth-message');
  if (messageContainer) {
    messageContainer.textContent = message;
    messageContainer.className = `auth-message ${type}-message`;
    messageContainer.style.display = 'block';
  }
}

function showFieldError(fieldId, message) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    const inputField = document.getElementById(fieldId);
    if (inputField) {
      inputField.classList.add('error');
    }
  }
}

function clearFieldError(fieldId) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
    
    const inputField = document.getElementById(fieldId);
    if (inputField) {
      inputField.classList.remove('error');
    }
  }
}

function clearErrors() {
  const messageContainer = document.getElementById('auth-message');
  if (messageContainer) {
    messageContainer.style.display = 'none';
  }
  
  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
  
  document.querySelectorAll('input.error').forEach(input => {
    input.classList.remove('error');
  });
} 