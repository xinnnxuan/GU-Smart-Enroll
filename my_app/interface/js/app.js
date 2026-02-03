import { initializeFinalsTab } from './finals.js';
import {
  initializeNavigation,
  initializeDropdowns,
  setupSidebarTabs,
  configureDivisionButtons,
  setupUserDropdown
} from './navigation.js';
import {
  fetchCourses,
  fetchSections,
  fetchProfessors
} from './api.js';
import { initAutocomplete } from './ui/autocomplete.js';
import { showNotification } from './notifications.js';
import { 
  populateCoursesList,
  initializeEnrollmentButtons
} from './ui/enrollment.js';
import { getCurrentUser, isAuthenticated, enforceAuthRoutes, clearUserSession } from './auth/sessions.js';
import { checkBackendConnection } from './auth/api.js';

document.addEventListener('DOMContentLoaded', () => {
  
  if (!isAuthenticated()) {
    
    window.location.href = 'login.html';
    return;
  }

  initializeApp();
});

async function initializeApp() {
  try {
    
    initializeTabs();
    initializeSearch();
    await initializeAutocomplete();
    setupLogoutButtons();
    updateUserDisplay();
    
    const isConnected = await checkBackendConnection();
    if (!isConnected) {
      showNotification('Backend server is not available. Some features may be limited.', 'error');
    }
    
    openTab('Courses');
  } catch (error) {
    console.error('App initialization error:', error);
    showNotification('Error initializing application', 'error');
  }
}

function updateUserDisplay() {
  const user = getCurrentUser();
  if (!user) return;
  
  document.querySelectorAll('.student-name').forEach(el => {
    el.textContent = user.name || user.username || 'Student';
  });
  
  document.querySelectorAll('.student-id').forEach(el => {
    el.textContent = `ID: ${user.user_id || 'N/A'}`;
  });
}

function setupLogoutButtons() {
  document.querySelectorAll('a[href="#signout"], .logout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  });
}

async function handleLogout() {
  
  clearUserSession();
  
  showNotification('You have been logged out', 'info');
  
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}

export function openTab(tabName, event) {
  
  if (event) {
    event.preventDefault();
  }
  
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
    tab.style.display = 'none';
  });
  
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.classList.add('active');
    selectedTab.style.display = 'block';
  }
  
  document.querySelectorAll('.sidebar-tabs a').forEach(btn => {
    btn.classList.remove('active');
  });
  
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  } else {
    
    document.querySelector(`.sidebar-tabs a[data-tab="${tabName}"]`)?.classList.add('active');
  }

  if (tabName === 'Finals') {
    initializeFinalsTab();
  }
}

window.openTab = openTab;

async function fetchAndDisplayCourses(searchTerm = '') {
  try {
    
    const coursesList = document.getElementById('courses-list');
    if (!coursesList) return;
    
    coursesList.innerHTML = '<div class="loading">Loading courses...</div>';
    
    let response;
    if (searchTerm) {
      
      response = await fetchSections(searchTerm);
    } else {
      
      response = await fetchCourses();
    }
    
    coursesList.innerHTML = '';
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch courses');
    }
    
    const courses = response.data;
    
    if (!courses || courses.length === 0) {
      coursesList.innerHTML = '<div class="no-results">No courses found. Try a different search term.</div>';
      return;
    }
    
    populateCoursesList(coursesList, courses);
    
  } catch (error) {
    console.error('Error fetching courses:', error);
    const coursesList = document.getElementById('courses-list');
    if (coursesList) {
      coursesList.innerHTML = `<div class="error">Error loading courses: ${error.message}</div>`;
    }
  }
}

async function initializeAutocomplete() {
  try {
    
    const [coursesResponse, professorsResponse] = await Promise.all([
      fetchCourses(),
      fetchProfessors()
    ]);
    
    let subjects = [];
    if (coursesResponse.success && coursesResponse.data) {
      const subjectSet = new Set();
      coursesResponse.data.forEach(course => {
        const subject = course.subject || course.course_id?.split(' ')[0];
        if (subject) subjectSet.add(subject);
      });
      subjects = Array.from(subjectSet).map(subject => ({ id: subject, text: subject }));
    }
    
    let instructors = [];
    if (professorsResponse.success && professorsResponse.data) {
      instructors = professorsResponse.data.map(prof => {
        const name = prof.name || `${prof.first_name || ''} ${prof.last_name || ''}`.trim();
        return { id: prof.id || prof.professor_id, text: name };
      });
    }
    
    const attributes = [
      { id: 'core', text: 'Core Curriculum' },
      { id: 'writing', text: 'Writing Enriched' },
      { id: 'service', text: 'Service Learning' },
      { id: 'diversity', text: 'Cultural Diversity' },
      { id: 'global', text: 'Global Studies' },
      { id: 'research', text: 'Research Intensive' }
    ];
    
    const subjectInput = document.getElementById('subject-input');
    if (subjectInput && subjects.length > 0) {
      initAutocomplete(subjectInput, subjects, (id, text) => {
        console.log('Selected subject:', id, text);
        
      });
    }
    
    const instructorInput = document.getElementById('instructor-input');
    if (instructorInput && instructors.length > 0) {
      initAutocomplete(instructorInput, instructors, (id, text) => {
        console.log('Selected instructor:', id, text);
        
      });
    }
    
    const attributesInput = document.getElementById('attributes-input');
    if (attributesInput) {
      initAutocomplete(attributesInput, attributes, (id, text) => {
        console.log('Selected attribute:', id, text);
        
      });
    }
  } catch (error) {
    console.error('Error initializing autocomplete:', error);
  }
}

function initializeSearch() {
  const searchButton = document.getElementById('search-courses-btn');
  const searchInput = document.getElementById('course-code-search');
  
  if (searchButton && searchInput) {
    
    searchButton.addEventListener('click', () => {
      const searchTerm = searchInput.value.trim();
      fetchAndDisplayCourses(searchTerm);
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchButton.click();
      }
    });
  }
  
  initializeAutocomplete();
}

function initializeTabs() {
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', e => {
      const name = btn.getAttribute('data-tab');
      if (name) openTab(name, e);
    });
  });

  openTab('Courses');
}

export {
  isAuthenticated,
  enforceAuthRoutes
};

document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('semester-dropdown-btn');
  const menu = document.getElementById('semester-dropdown-menu');
  let selectedSemester = btn ? btn.textContent.trim() : '';

  if (btn && menu) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      btn.classList.toggle('active');
      menu.classList.toggle('show');
    });

    menu.querySelectorAll('a').forEach(option => {
      option.addEventListener('click', function(e) {
        e.preventDefault();
        
        menu.querySelectorAll('a').forEach(a => a.classList.remove('selected'));
        this.classList.add('selected');
        btn.childNodes[0].textContent = this.textContent + ' ';
        selectedSemester = this.getAttribute('data-semester');
        btn.classList.remove('active');
        menu.classList.remove('show');
        
      });
    });

    document.addEventListener('click', function(e) {
      if (!btn.contains(e.target) && !menu.contains(e.target)) {
        btn.classList.remove('active');
        menu.classList.remove('show');
      }
    });
  }
});
