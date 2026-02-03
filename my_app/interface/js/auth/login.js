
import { storeUserSession, enforceAuthRoutes } from './sessions.js';
import { checkBackendConnection } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  
  enforceAuthRoutes();
  
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  const forgotPasswordLink = document.getElementById('forgot-password');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      showMessage('Password reset functionality coming soon!', 'info');
    });
  }
  
  checkBackendConnection().then(isConnected => {
    if (!isConnected) {
      showMessage('Backend server is not reachable. Running in demo mode.', 'info');
      
      const statusMsg = document.getElementById('status-message');
      if (statusMsg) {
        statusMsg.innerHTML += `
          <p style="font-size:0.8em;margin-top:5px;">
            You can log in using any username or email with any password.
          </p>`;
      }
    }
  }).catch(error => {
    console.error('Error checking backend connection:', error);
    showMessage('Could not verify backend connection. Demo mode available.', 'info');
  });
  
  const usernameField = document.getElementById('username');
  const usernameLabel = usernameField ? document.querySelector('label[for="username"]') : null;
  
  if (usernameField) {
    usernameField.placeholder = "Username or Email";
  }
  
  if (usernameLabel) {
    usernameLabel.textContent = "Username or Email";
  }
});

async function handleLogin(event) {
  event.preventDefault();
  
  clearErrors();
  
  const username = document.getElementById('username')?.value?.trim() || '';
  const password = document.getElementById('password')?.value || '';
  const rememberMe = document.getElementById('remember')?.checked || false;
  
  if (!username) {
    showFieldError('username', 'Please enter your username or email');
    return;
  }
  
  if (!password) {
    showFieldError('password', 'Please enter your password');
    return;
  }
  
  const submitButton = event.target.querySelector('button[type="submit"]');
  const originalText = submitButton?.textContent || 'Sign in';
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Signing in...';
  }
  
  try {
    
    let backendAvailable = false;
    try {
      backendAvailable = await checkBackendConnection();
    } catch (error) {
      console.warn('Error checking backend connection:', error);
      backendAvailable = false;
    }
    
    if (backendAvailable) {
      
      try {
        const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001' : '';
        const response = await fetch(`${apiBase}/user_bp/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
          const data = await response.json();
          
          storeUserSession(data.user, data.token);
          
          showMessage('Login successful! Redirecting...', 'success');
          
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1000);
        } else {
          const errorData = await response.json();
          showMessage(errorData.message || 'Login failed. Please check your credentials.', 'error');
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        
        handleDemoLogin(username);
      }
    } else {
      
      handleDemoLogin(username);
    }
  } catch (error) {
    console.error('Login error:', error);
    showMessage('An error occurred during login. Falling back to demo mode...', 'error');
    handleDemoLogin(username);
  } finally {
    
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }
}

function handleDemoLogin(username) {
  
  const mockUser = {
    user_id: 'demo-123',
    username: username,
    
    name: username.includes('@') ? username.split('@')[0] : username,
    
    email: username.includes('@') ? username : `${username}@zagmail.gonzaga.edu`,
    role: 'student'
  };
  
  storeUserSession(mockUser, 'demo-token-123');
  
  showMessage('Demo login successful! Redirecting to app...', 'success');
  
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1500);
}

function showMessage(message, type = 'error') {
  const messageContainer = document.getElementById('auth-message') || 
                          document.getElementById('status-message');
  if (messageContainer) {
    messageContainer.textContent = message;
    messageContainer.className = `auth-message ${type}-message`;
    if (messageContainer.id === 'status-message') {
      messageContainer.className = `status-message ${type}`;
    }
    messageContainer.style.display = 'block';
  }
}

function showFieldError(fieldId, message) {
  const errorElement = document.getElementById(`${fieldId}-error`) || 
                      document.createElement('div');
                      
  if (!document.getElementById(`${fieldId}-error`) && document.getElementById(fieldId)) {
    errorElement.id = `${fieldId}-error`;
    errorElement.className = 'field-error';
    document.getElementById(fieldId).parentNode.appendChild(errorElement);
  }
  
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    const inputField = document.getElementById(fieldId);
    if (inputField) {
      inputField.classList.add('error');
      inputField.focus();
    }
  }
}

function clearErrors() {
  
  const messageContainer = document.getElementById('auth-message') || 
                          document.getElementById('status-message');
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