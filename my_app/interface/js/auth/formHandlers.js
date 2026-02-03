import { initAuth, openAuthTab, showStatusMessage } from './ui.js';
import { loginUser, registerUser } from './api.js';
import { storeUserSession } from './sessions.js';

document.addEventListener('DOMContentLoaded', () => {
  
  initAuth();

  document.getElementById('login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    showStatusMessage('Connecting to server…', 'info');

    const usernameOrEmail = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const result = await loginUser(usernameOrEmail, password);
    if (result.success) {
      showStatusMessage('Login successful! Redirecting…', 'success');
      setTimeout(() => window.location.href = 'index.html', 1500);
    } else if (/Network error/.test(result.error)) {
      showStatusMessage('Cannot connect. Demo mode…', 'error');
      setTimeout(() => {
        
        const username = usernameOrEmail;
        const displayName = username.includes('@') ? username.split('@')[0] : username;
        const email = username.includes('@') ? username : `${username}@zagmail.gonzaga.edu`;
        
        storeUserSession({ 
          user_id: 'demo123', 
          name: displayName,
          email: email
        });
        window.location.href = 'index.html';
      }, 2000);
    } else {
      showStatusMessage(result.error, 'error');
    }
  });

  document.getElementById('register-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    showStatusMessage('Connecting to server…', 'info');

    const name     = document.getElementById('register-name').value;
    const username = document.getElementById('register-username').value;
    const email    = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    const result = await registerUser(username, email, password, name);
    if (result.success) {
      showStatusMessage('Registration successful! Please log in.', 'success');
      this.reset();
      openAuthTab('login-tab', document.querySelector('#login-btn'));
    } else {
      showStatusMessage(result.error, 'error');
    }
  });
});

window.openAuthTab = openAuthTab;
