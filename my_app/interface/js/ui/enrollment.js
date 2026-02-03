
import { enrollCourse } from '../api.js';
import { showNotification } from '../notifications.js';

export function createCourseElement(course) {
  const courseElement = document.createElement('div');
  courseElement.className = 'course-item';
  
  if (course.section_id) courseElement.dataset.sectionId = course.section_id;
  if (course.crn) courseElement.dataset.crn = course.crn;
  if (course.course_id) courseElement.dataset.courseId = course.course_id;
  if (course.term) courseElement.dataset.term = course.term;
  if (course.section) courseElement.dataset.section = course.section;
  
  const courseCode = course.course_id || course.id || `${course.subject} ${course.course_number}`;
  const instructorName = course.instructor || 'TBA';
  const seatsAvailable = course.seats_available !== undefined 
    ? `${course.seats_available}/${course.total_seats} seats` 
    : '';
  
  courseElement.innerHTML = `
    <div class="course-header">
      <h3>${courseCode}</h3>
      ${seatsAvailable ? `<span class="seats-available">${seatsAvailable}</span>` : ''}
    </div>
    <div class="course-details">
      <p><strong>Title:</strong> ${course.title || course.name || courseCode}</p>
      <p><strong>Schedule:</strong> ${course.schedule || course.days_times || 'TBA'}</p>
      <p><strong>Instructor:</strong> ${instructorName}</p>
      <p><strong>Location:</strong> ${course.location || course.building_room || 'TBA'}</p>
      <p><strong>Credits:</strong> ${course.credits || course.credit_hours || '3'}</p>
    </div>
    <button class="add-course-btn">Add to Schedule</button>
  `;
  
  const addButton = courseElement.querySelector('.add-course-btn');
  if (addButton) {
    if (course.section_id) addButton.dataset.sectionId = course.section_id;
    if (course.crn) addButton.dataset.crn = course.crn;
    if (course.course_id) addButton.dataset.courseId = course.course_id;
    if (course.term) addButton.dataset.term = course.term;
    if (course.section) addButton.dataset.section = course.section;
  }
  
  return courseElement;
}

export async function handleEnrollmentClick(event) {
  
  const btn = event.currentTarget;
  if (!btn) return;
  
  const sectionId = btn.dataset.sectionId;
  const crn = btn.dataset.crn;
  const courseId = btn.dataset.courseId;
  const term = btn.dataset.term;
  const section = btn.dataset.section;
  
  try {
    
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
      showNotification('You must be logged in to add courses', 'error');
      return;
    }
    
    const user = JSON.parse(userStr);
    const userId = user.user_id || user.id;
    
    const enrollmentOptions = {};
    if (sectionId) enrollmentOptions.sectionId = parseInt(sectionId, 10);
    if (crn) enrollmentOptions.crn = crn;
    if (courseId) enrollmentOptions.courseId = courseId;
    if (term) enrollmentOptions.term = term;
    if (section) enrollmentOptions.section = section;
    
    if (!sectionId && !crn && !(courseId && term && section)) {
      showNotification('Cannot add course: Insufficient section information', 'error');
      return;
    }
    
    btn.disabled = true;
    btn.textContent = 'Adding...';
    
    showNotification('Adding course to your schedule...', 'info');
    
    const result = await enrollCourse(userId, true, enrollmentOptions);
    
    if (result.success) {
      showNotification(result.message || 'Course added to your schedule!', 'success');
      
      btn.textContent = 'Added ✓';
      btn.classList.add('enrolled');
      
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    
    btn.disabled = false;
    btn.textContent = 'Add to Schedule';
    
    showNotification(`Error adding course: ${error.message}`, 'error');
  }
}

export function initializeEnrollmentButtons(courseElements = []) {
  
  const buttons = courseElements.length 
    ? courseElements.map(el => el.querySelector('.add-course-btn')).filter(Boolean)
    : document.querySelectorAll('.add-course-btn');
  
  buttons.forEach(btn => {
    
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', handleEnrollmentClick);
  });
}

export function populateCoursesList(container, courses) {
  if (!container || !courses || !courses.length) return;
  
  container.innerHTML = '';
  
  courses.forEach(course => {
    const courseElement = createCourseElement(course);
    container.appendChild(courseElement);
  });
  
  initializeEnrollmentButtons(
    Array.from(container.querySelectorAll('.course-item'))
  );
}

export function updateScheduleWithCourse(course) {
  
  const scheduleContainer = document.getElementById('schedule-container');
  if (!scheduleContainer) return;
  
  const days = parseCourseSchedule(course.schedule || course.days_times || '');
  
  days.forEach(day => {
    const courseBlock = createCourseBlock(course, day);
    scheduleContainer.appendChild(courseBlock);
  });
}

function parseCourseSchedule(scheduleString) {
  if (!scheduleString) return [];
  
  const parts = scheduleString.split(' ');
  if (parts.length < 3) return [];
  
  const dayStr = parts[0];
  const days = [];
  
  const timeRegex = /(\d+:\d+\s*(?:AM|PM))\s*-\s*(\d+:\d+\s*(?:AM|PM))/i;
  const timeMatch = scheduleString.match(timeRegex);
  
  const startTime = timeMatch ? timeMatch[1] : '';
  const endTime = timeMatch ? timeMatch[2] : '';
  
  for (let i = 0; i < dayStr.length; i++) {
    const dayChar = dayStr[i].toUpperCase();
    
    const dayMap = {
      'M': 'Monday',
      'T': 'Tuesday',
      'W': 'Wednesday',
      'R': 'Thursday',
      'F': 'Friday'
    };
    
    if (dayMap[dayChar]) {
      days.push({
        day: dayChar,
        dayName: dayMap[dayChar],
        startTime,
        endTime
      });
    }
  }
  
  return days;
}

function createCourseBlock(course, dayInfo) {
  const block = document.createElement('div');
  block.className = 'course-block';
  block.dataset.days = dayInfo.day;
  block.dataset.startTime = dayInfo.startTime;
  block.dataset.endTime = dayInfo.endTime;
  
  if (course.section_id) block.dataset.sectionId = course.section_id;
  if (course.crn) block.dataset.crn = course.crn;
  if (course.course_id) block.dataset.courseId = course.course_id;
  if (course.term) block.dataset.term = course.term;
  if (course.section) block.dataset.section = course.section;
  
  block.style.backgroundColor = getRandomCourseColor(course.course_id || '');
  
  block.innerHTML = `
    <div class="event-name">${course.course_id || course.title || 'Course'}</div>
    <div class="event-time">${dayInfo.startTime} - ${dayInfo.endTime}</div>
    <div class="event-location">${course.location || course.building_room || 'TBA'}</div>
    <button class="course-delete-btn" title="Remove from schedule">×</button>
  `;
  
  positionCourseBlock(block, dayInfo);
  
  return block;
}

function positionCourseBlock(block, dayInfo) {
  
  const dayIndex = { 'M': 1, 'T': 2, 'W': 3, 'R': 4, 'F': 5 }[dayInfo.day] || 0;
  
}

function getRandomCourseColor(courseId) {
  
  let hash = 0;
  for (let i = 0; i < courseId.length; i++) {
    hash = courseId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
}

export function add_class_enrollment() {
  
  const coursesTab = document.getElementById('Courses');
  if (coursesTab) {
    coursesTab.style.display = 'block';
    coursesTab.classList.add('active');
  }
  
  const subjectSelect = document.getElementById('subject-select');
  if (subjectSelect) {
    subjectSelect.focus();
    subjectSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    if (typeof showNotification === 'function') {
      showNotification('Select a subject and enter course details to search for available classes', 'info');
    }
  } else {
    
    const searchInput = document.getElementById('course-code-search');
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      searchInput.value = '';
      
      if (typeof showNotification === 'function') {
        showNotification('Enter a course code to search for available classes', 'info');
      }
    }
  }
  
  const searchButton = document.getElementById('search-courses-btn');
  if (searchButton) {
    
    searchButton.classList.add('highlight-animation');
    setTimeout(() => {
      searchButton.classList.remove('highlight-animation');
    }, 2000);
  }
} 