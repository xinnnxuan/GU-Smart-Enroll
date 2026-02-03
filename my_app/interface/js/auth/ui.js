import { getCurrentUser, clearUserSession as clearSession } from './sessions.js';
import { showNotification } from '../notifications.js'; 
import { fetchSections } from './api.js';
import { updateCoursesList } from '../ui/controls.js';

export function logoutUser() {
  clearSession();
  showStatusMessage('You have been logged out.', 'info');
  window.location.href = 'login.html';
}

export function clearUserSession() {
  console.warn('ui.js clearUserSession is deprecated, use sessions.js version instead');
  clearSession();
}

export function checkBackendConnection() {
  const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001' : '';
  return fetch(`${apiBase}/user_bp/login`, {
    method: 'OPTIONS',
    cache: 'no-cache',
    
    signal: AbortSignal.timeout(3000)
  })
    .then(response => response.ok)
    .catch(error => {
      console.warn('Backend connection check failed:', error.message);
      return false;
    });
}

export function openAuthTab(tabId, buttonElement) {
  
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  
  if (buttonElement) {
    buttonElement.classList.add('active');
  }
  
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => {
    content.classList.remove('active');
    content.style.display = 'none';
  });
  
  const selectedTab = document.getElementById(tabId);
  if (selectedTab) {
    selectedTab.classList.add('active');
    selectedTab.style.display = 'block';
  }
}

export function initAuth() {
  updateUserInterface();
  document.querySelectorAll('a[href="#signout"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      logoutUser();
    });
  });

  const isLoginPage = window.location.href.includes('login.html');
  
  if (isLoginPage) {
    checkBackendConnection().then(ok => {
      const statusEl = document.getElementById('status-message');
      if (statusEl) {
        if (!ok) {
          statusEl.innerHTML = `
            <strong>Backend server not detected.</strong><br>
            <p style="font-size:0.8em;margin-top:5px;">
              Running in demo mode. Ensure backend is up on port 5001.
            </p>`;
          statusEl.className = 'status-message info';
          statusEl.style.display = 'block';
        } else {
          statusEl.innerHTML = `
            <strong>Backend server connected.</strong><br>
            <p style="font-size:0.8em;margin-top:5px;">
              You can log in with your credentials.
            </p>`;
          statusEl.className = 'status-message success';
          statusEl.style.display = 'block';
          setTimeout(() => {
            statusEl.style.display = 'none';
          }, 5000);
        }
      }
    }).catch(error => {
      console.error('Error checking backend:', error);
      const statusEl = document.getElementById('status-message');
      if (statusEl) {
        statusEl.innerHTML = `
          <strong>Error checking backend connection.</strong><br>
          <p style="font-size:0.8em;margin-top:5px;">
            Running in demo mode. Login with any credentials.
          </p>`;
        statusEl.className = 'status-message info';
        statusEl.style.display = 'block';
      }
    });
  }
}

export function updateUserInterface() {
  const user = getCurrentUser();
  const onLoginPage = window.location.pathname.includes('login.html') || 
                     window.location.pathname.endsWith('/login') ||
                     window.location.pathname.includes('register.html') ||
                     window.location.pathname.endsWith('/register');

  if (user) {
    document.querySelectorAll('.student-name').forEach(el => {
      el.textContent = user.name || 'Student';
    });
    document.querySelectorAll('.student-id').forEach(el => {
      el.textContent = `ID: ${user.user_id || ''}`;
    });
    if (onLoginPage) {
      console.log('User is logged in, redirecting to index.html');
      window.location.href = 'index.html';
    }
  } else if (!onLoginPage) {
    console.log('User is not logged in, redirecting to login.html');
    window.location.href = 'login.html';
  }
}

export function showStatusMessage(message, type = 'info') {
  console.log(`Status message: ${type} - ${message}`);
  
  if (typeof showNotification === 'function') {
    showNotification(message, type);
    return;
  }
  
  const statusEl = document.querySelector('.status-message');
  if (statusEl) {
    
    statusEl.classList.remove('success', 'error', 'info');
    statusEl.classList.add(type);
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 5000);
  } else {
    
    alert(`${type.toUpperCase()}: ${message}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('search-courses-btn');
  if (searchButton) {
    searchButton.addEventListener('click', async () => {
      const codeInput = document.getElementById('course-code-search');
      if (!codeInput) return;
      
      const code = codeInput.value.trim();
      try {
        const sections = await fetchSections(code);
        updateCoursesList(sections);
      } catch (err) {
        console.error('Failed to load sections:', err);
        showStatusMessage('Error loading course sections', 'error');
      }
    });
  }
});

export function showContent(containerId, content) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = content;
  }
}

export function createAlert(type, message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  
  const container = document.querySelector('.content-container') || document.body;
  container.insertBefore(alertDiv, container.firstChild);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

export function showLoadingSpinner(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    `;
  }
}

export function hideLoadingSpinner(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    const spinner = container.querySelector('.loading-spinner');
    if (spinner) {
      spinner.remove();
    }
  }
}
