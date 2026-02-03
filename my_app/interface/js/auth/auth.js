import { loginUser, registerUser } from './api.js';
import { saveUserSession } from './sessions.js';
import { openAuthTab, showStatusMessage, initAuthUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();

  document.getElementById('login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    showStatusMessage('Connecting…', 'info');
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    const res = await loginUser(u, p);
    if (res.success) {
      saveUserSession(res.data);
      showStatusMessage('Success! Redirecting…', 'success');
      setTimeout(() => window.location.href = 'index.html', 1000);
    } else {
      showStatusMessage(res.error, 'error');
    }
  });

  document.getElementById('register-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    showStatusMessage('Connecting…', 'info');
    const name  = document.getElementById('register-name').value;
    const user  = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const pass  = document.getElementById('register-password').value;
    const res   = await registerUser(user, email, pass, name);
    if (res.success) {
      showStatusMessage('Registered! Please log in.', 'success');
      e.target.reset();
      openAuthTab('login-tab', document.querySelector('.tab-button'));
    } else {
      showStatusMessage(res.error, 'error');
    }
  });
});

window.openAuthTab = openAuthTab;
