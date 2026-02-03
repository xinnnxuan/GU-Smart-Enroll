
import { fetchAllCourses, fetchCourseSections, fetchAllProfessors } from './database.js';
import { showNotification } from './notifications.js';

export function initializeDatabaseDemo(containerId = 'database-demo-container') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container with ID "${containerId}" not found`);
    return;
  }

  createDemoDashboard(container);
  
  setupEventListeners();
}

function createDemoDashboard(container) {
  container.innerHTML = `
    <div class="database-demo-wrapper">
      <h2>Database API Demo</h2>
      <p class="demo-description">
        This demo showcases the functionality of the database service API endpoints.
        Use the buttons below to fetch data from the database.
      </p>
      
      <div class="demo-controls">
        <button id="fetch-courses-btn" class="demo-btn">Fetch All Courses</button>
        <button id="fetch-sections-btn" class="demo-btn">Fetch Sections for Course</button>
        <button id="fetch-professors-btn" class="demo-btn">Fetch All Professors</button>
      </div>
      
      <div class="demo-course-select-container" style="display: none;">
        <label for="course-select">Select a Course:</label>
        <select id="course-select">
          <option value="">-- Select a course --</option>
        </select>
        <button id="load-sections-btn" class="demo-btn">Load Sections</button>
      </div>
      
      <div class="demo-results">
        <h3>Results <span id="result-count" class="result-count"></span></h3>
        <div id="results-container" class="results-container">
          <p class="empty-state">No data loaded yet. Use the buttons above to fetch data.</p>
        </div>
      </div>
    </div>
  `;
}

function setupEventListeners() {
  const fetchCoursesBtn = document.getElementById('fetch-courses-btn');
  const fetchSectionsBtn = document.getElementById('fetch-sections-btn');
  const fetchProfessorsBtn = document.getElementById('fetch-professors-btn');
  const courseSelectContainer = document.querySelector('.demo-course-select-container');
  const courseSelect = document.getElementById('course-select');
  const loadSectionsBtn = document.getElementById('load-sections-btn');
  
  if (fetchCoursesBtn) {
    fetchCoursesBtn.addEventListener('click', async () => {
      try {
        
        showResultsLoading();
        
        const courses = await fetchAllCourses();
        
        displayResults(courses, 'Courses');
        
        populateCourseSelect(courses);
        
        showNotification(`Successfully loaded ${courses.length} courses`, 'success');
      } catch (error) {
        displayError(error.message);
        showNotification(`Error loading courses: ${error.message}`, 'error');
      }
    });
  }
  
  if (fetchSectionsBtn) {
    fetchSectionsBtn.addEventListener('click', () => {
      
      courseSelectContainer.style.display = courseSelectContainer.style.display === 'none' ? 'block' : 'none';
    });
  }
  
  if (loadSectionsBtn && courseSelect) {
    loadSectionsBtn.addEventListener('click', async () => {
      const selectedCourse = courseSelect.value;
      if (!selectedCourse) {
        showNotification('Please select a course first', 'info');
        return;
      }
      
      try {
        
        showResultsLoading();
        
        const sections = await fetchCourseSections(selectedCourse);
        
        displayResults(sections, `Sections for ${selectedCourse}`);
        
        showNotification(`Successfully loaded ${sections.length} sections for ${selectedCourse}`, 'success');
      } catch (error) {
        displayError(error.message);
        showNotification(`Error loading sections: ${error.message}`, 'error');
      }
    });
  }
  
  if (fetchProfessorsBtn) {
    fetchProfessorsBtn.addEventListener('click', async () => {
      try {
        
        showResultsLoading();
        
        const professors = await fetchAllProfessors();
        
        displayResults(professors, 'Professors');
        
        showNotification(`Successfully loaded ${professors.length} professors`, 'success');
      } catch (error) {
        displayError(error.message);
        showNotification(`Error loading professors: ${error.message}`, 'error');
      }
    });
  }
}

function populateCourseSelect(courses) {
  const courseSelect = document.getElementById('course-select');
  if (!courseSelect) return;
  
  while (courseSelect.options.length > 1) {
    courseSelect.remove(1);
  }
  
  courses.forEach(course => {
    const option = document.createElement('option');
    option.value = course.code;
    option.textContent = `${course.code}: ${course.title}`;
    courseSelect.appendChild(option);
  });
  
  const courseSelectContainer = document.querySelector('.demo-course-select-container');
  if (courseSelectContainer) {
    courseSelectContainer.style.display = 'block';
  }
}

function showResultsLoading() {
  const resultsContainer = document.getElementById('results-container');
  const resultCount = document.getElementById('result-count');
  
  if (resultsContainer) {
    resultsContainer.innerHTML = `
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading data...</p>
    `;
  }
  
  if (resultCount) {
    resultCount.textContent = '';
  }
}

function displayResults(data, type) {
  const resultsContainer = document.getElementById('results-container');
  const resultCount = document.getElementById('result-count');
  
  if (!resultsContainer) return;
  
  if (!data || data.length === 0) {
    resultsContainer.innerHTML = `
      <p class="empty-state">No ${type.toLowerCase()} found.</p>
    `;
    if (resultCount) resultCount.textContent = '(0)';
    return;
  }
  
  if (resultCount) {
    resultCount.textContent = `(${data.length})`;
  }
  
  let tableHTML = `<table class="data-table"><thead><tr>`;
  
  const headers = Object.keys(data[0]);
  headers.forEach(header => {
    tableHTML += `<th>${formatHeader(header)}</th>`;
  });
  
  tableHTML += `</tr></thead><tbody>`;
  
  data.forEach(item => {
    tableHTML += `<tr>`;
    headers.forEach(header => {
      tableHTML += `<td>${item[header] || ''}</td>`;
    });
    tableHTML += `</tr>`;
  });
  
  tableHTML += `</tbody></table>`;
  
  resultsContainer.innerHTML = tableHTML;
}

function displayError(message) {
  const resultsContainer = document.getElementById('results-container');
  const resultCount = document.getElementById('result-count');
  
  if (resultsContainer) {
    resultsContainer.innerHTML = `
      <div class="error-message">
        <p>Error: ${message}</p>
      </div>
    `;
  }
  
  if (resultCount) {
    resultCount.textContent = '';
  }
}

function formatHeader(header) {
  return header
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
} 