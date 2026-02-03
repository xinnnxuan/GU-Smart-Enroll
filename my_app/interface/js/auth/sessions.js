
const SESSION_KEY = 'smartenroll_user';
const TOKEN_KEY = 'smartenroll_token';

export function storeUserSession(userData, token) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, token || 'demo-token');
  } catch (error) {
    console.error('Error storing user session:', error);
    
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData));
      sessionStorage.setItem(TOKEN_KEY, token || 'demo-token');
    } catch (sessionError) {
      console.error('Error storing in session storage:', sessionError);
    }
  }
}

export function getCurrentUser() {
  try {
    const userData = localStorage.getItem(SESSION_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
    
    const sessionData = sessionStorage.getItem(SESSION_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
}

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
}

export function isAuthenticated() {
  return !!getCurrentUser();
}

export function clearUserSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

function getCurrentPageName() {
  
  const path = window.location.pathname;
  
  const filename = path.split('/').pop();
  
  return filename.split('.')[0] || 'index';
}

export function enforceAuthRoutes() {
  const currentPage = getCurrentPageName();
  const isAuthPage = currentPage === 'login' || currentPage === 'register' || currentPage === '';
  
  console.log('Current page:', currentPage);
  console.log('Is auth page:', isAuthPage);
  console.log('Is authenticated:', isAuthenticated());
  
  if (isAuthenticated()) {
    
    if (isAuthPage) {
      console.log('Redirecting to index.html because already authenticated');
      window.location.href = 'index.html';
    }
  } else {
    
    if (!isAuthPage && currentPage !== '') {
      console.log('Redirecting to login.html because not authenticated');
      window.location.href = 'login.html';
    }
  }
}

if (document.readyState === 'complete') {
  
  enforceAuthRoutes();
} else {
  
  document.addEventListener('DOMContentLoaded', enforceAuthRoutes);
}
