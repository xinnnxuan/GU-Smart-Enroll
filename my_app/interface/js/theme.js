
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeToggleText(isDark);
  updateLogoImage(isDark);
}

function updateThemeToggleText(isDark) {
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  });
}

function updateLogoImage(isDark) {
  const logoImg = document.querySelector('.logo img');
  if (!logoImg) return;
  logoImg.src = isDark
    ? './assets/GU Logo/IMG_4570.jpg'
    : './assets/GU Logo/IMG_4571.jpg';
}

function initTheme() {
  const stored  = localStorage.getItem('theme');
  const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark  = stored === 'dark' || (!stored && prefers);

  document.body.classList.toggle('dark-mode', isDark);
  updateThemeToggleText(isDark);
  updateLogoImage(isDark);

  document.querySelectorAll('.theme-toggle')
    .forEach(btn => btn.addEventListener('click', toggleTheme));
}

document.addEventListener('DOMContentLoaded', initTheme);
