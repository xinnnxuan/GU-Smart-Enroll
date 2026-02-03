import { showContent, createAlert, showLoadingSpinner, hideLoadingSpinner } from '../auth/ui.js';
import { fetchSubjects, fetchAttributes, fetchCampuses, fetchInstructors, fetchCoursesBySearch } from '../auth/api.js';
import { initAutocomplete } from './autocomplete.js';

let subjectsData = [];
let attributesData = [];
let campusesData = [];
let instructorsData = [];

export function initializeCoursesTab() {
  console.log("Initializing Courses tab");
  
  const searchButton = document.getElementById('course-search-button');
  const resetButton = document.getElementById('course-search-reset');
  
  if (searchButton) {
    searchButton.addEventListener('click', handleCourseSearch);
  } else {
    console.error("Course search button not found");
  }
  
  if (resetButton) {
    resetButton.addEventListener('click', resetSearchFilters);
  } else {
    console.error("Course reset button not found");
  }
  
  const divisionButtons = document.querySelectorAll('.division-btn');
  divisionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      
      btn.classList.toggle('selected');
    });
  });
  
  document.querySelector('#Courses').classList.add('active');
  document.querySelector('.tab-button[data-tab="Courses"]').classList.add('active');
  
  loadDropdownOptions();
}

async function loadDropdownOptions() {
  try {
    console.log("Loading dropdown options...");
    
    document.getElementById('subjects-dropdown-container').classList.add('loading');
    document.getElementById('attributes-dropdown-container').classList.add('loading');
    document.getElementById('campus-dropdown-container').classList.add('loading');
    document.getElementById('instructors-dropdown-container').classList.add('loading');
    
    const subjects = await fetchSubjects();
    const attributes = await fetchAttributes();
    const campuses = await fetchCampuses();
    const instructors = await fetchInstructors();
    
    subjectsData = subjects || [];
    attributesData = attributes || [];
    campusesData = campuses || [];
    instructorsData = instructors || [];
    
    console.log("Dropdown options loaded:", {
      subjects: subjectsData.length,
      attributes: attributesData.length,
      campuses: campusesData.length,
      instructors: instructorsData.length
    });
    
    if (subjectsData.length === 0) {
      console.warn("No subjects data loaded, using hardcoded subjects");
      subjectsData = [
        { code: 'CPSC', name: 'Computer Science' },
        { code: 'MATH', name: 'Mathematics' },
        { code: 'ENGL', name: 'English' }
      ];
    }
    
    if (attributesData.length === 0) {
      console.warn("No attributes data loaded, using hardcoded attributes");
      attributesData = [
        { code: 'CORE', name: 'Core Curriculum' },
        { code: 'WRIT', name: 'Writing Enriched' }
      ];
    }
    
    if (campusesData.length === 0) {
      console.warn("No campuses data loaded, using hardcoded campuses");
      campusesData = [
        { code: 'MAIN', name: 'Main Campus' },
        { code: 'ONLN', name: 'Online' }
      ];
    }
    
    if (instructorsData.length === 0) {
      console.warn("No instructors data loaded, using hardcoded instructors");
      instructorsData = [
        { id: 1, name: "Dr. Smith, John" },
        { id: 2, name: "Dr. Johnson, Maria" }
      ];
    }
    
    initializeAutocompleteFields();
    
  } catch (error) {
    console.error('Error loading dropdown options:', error);
    createAlert('error', 'Failed to load search options. Please try again later.');
    
    subjectsData = [
      { code: 'CPSC', name: 'Computer Science' },
      { code: 'MATH', name: 'Mathematics' },
      { code: 'ENGL', name: 'English' }
    ];
    attributesData = [
      { code: 'CORE', name: 'Core Curriculum' },
      { code: 'WRIT', name: 'Writing Enriched' }
    ];
    campusesData = [
      { code: 'MAIN', name: 'Main Campus' },
      { code: 'ONLN', name: 'Online' }
    ];
    instructorsData = [
      { id: 1, name: "Dr. Smith, John" },
      { id: 2, name: "Dr. Johnson, Maria" }
    ];
    
    initializeAutocompleteFields();
  } finally {
    
    document.getElementById('subjects-dropdown-container').classList.remove('loading');
    document.getElementById('attributes-dropdown-container').classList.remove('loading');
    document.getElementById('campus-dropdown-container').classList.remove('loading');
    document.getElementById('instructors-dropdown-container').classList.remove('loading');
  }
}

function populateSubjectsDropdown(subjects) {
  const dropdown = document.getElementById('subjects-dropdown');
  if (!dropdown) {
    console.error('Subjects dropdown not found');
    return;
  }
  
  dropdown.innerHTML = '<option value="">All Subjects</option>';
  
  subjects.forEach(subject => {
    const option = document.createElement('option');
    option.value = subject.code;
    option.textContent = `${subject.code} - ${subject.name}`;
    dropdown.appendChild(option);
  });
}

function populateAttributesDropdown(attributes) {
  const dropdown = document.getElementById('attributes-dropdown');
  if (!dropdown) {
    console.error('Attributes dropdown not found');
    return;
  }
  
  dropdown.innerHTML = '<option value="">All Attributes</option>';
  
  attributes.forEach(attribute => {
    const option = document.createElement('option');
    option.value = attribute.code;
    option.textContent = attribute.name;
    dropdown.appendChild(option);
  });
}

function populateCampusesDropdown(campuses) {
  const dropdown = document.getElementById('campus-dropdown');
  if (!dropdown) {
    console.error('Campus dropdown not found');
      return;
    }
  
  dropdown.innerHTML = '<option value="">All Campuses</option>';
  
  campuses.forEach(campus => {
    const option = document.createElement('option');
    option.value = campus.code;
    option.textContent = campus.name;
    dropdown.appendChild(option);
  });
}

function populateInstructorsDropdown(instructors) {
  const dropdown = document.getElementById('instructors-dropdown');
  if (!dropdown) {
    console.error('Instructors dropdown not found');
      return;
    }

  dropdown.innerHTML = '<option value="">All Instructors</option>';
  
  instructors.forEach(instructor => {
    const option = document.createElement('option');
    option.value = instructor.id;
    option.textContent = instructor.name;
    dropdown.appendChild(option);
  });
}

function initializeAutocompleteFields() {
  console.log('Initializing autocomplete fields');
  
  try {
    
    console.log('Setting up autocomplete for dropdown fields');
    
    if (typeof initAutocomplete !== 'function') {
      console.error('initAutocomplete function not found! Make sure autocomplete.js is loaded.');
      
      import('../ui/autocomplete.js').then(module => {
        console.log('Dynamically imported autocomplete.js');
        setupAutocompleteFields(module.initAutocomplete);
      }).catch(err => {
        console.error('Failed to import autocomplete.js:', err);
      });
    } else {
      
      console.log('initAutocomplete function found, setting up fields');
      setupAutocompleteFields(initAutocomplete);
    }
  } catch (error) {
    console.error('Error setting up autocomplete:', error);
  }
}

function setupAutocompleteFields(autocompleteFunction) {
  
  const subjectsArray = [];
  const attributesArray = [];
  const campusesArray = [];
  const instructorsArray = [];
  
  subjectsArray.push({ id: 'debug', text: 'Test Subject' });
  attributesArray.push({ id: 'debug', text: 'Test Attribute' });
  campusesArray.push({ id: 'debug', text: 'Test Campus' });
  instructorsArray.push({ id: 'debug', text: 'Test Instructor' });
  
  if (window.subjectsData && window.subjectsData.length) {
    console.log(`Using ${window.subjectsData.length} existing subjects for autocomplete`);
    window.subjectsData.forEach(subject => {
      subjectsArray.push({ 
        id: subject.code, 
        text: `${subject.code} - ${subject.name}` 
      });
    });
  } else {
    console.log('No subjects data found, fetching from API');
    fetchSubjects().then(subjects => {
      if (subjects && subjects.length) {
        window.subjectsData = subjects;
        subjects.forEach(subject => {
          subjectsArray.push({ 
            id: subject.code, 
            text: `${subject.code} - ${subject.name}` 
          });
        });
        
        const subjectsInput = document.getElementById('subjects-dropdown');
        if (subjectsInput) {
          autocompleteFunction(subjectsInput, subjectsArray, (id, text) => {
            console.log(`Selected subject: ${id} (${text})`);
          });
        }
      }
    }).catch(err => {
      console.error('Error fetching subjects:', err);
    });
  }
  
  if (window.attributesData && window.attributesData.length) {
    window.attributesData.forEach(attr => {
      attributesArray.push({ id: attr.code, text: attr.name });
    });
  } else {
    fetchAttributes().then(attributes => {
      if (attributes && attributes.length) {
        window.attributesData = attributes;
        attributes.forEach(attr => {
          attributesArray.push({ id: attr.code, text: attr.name });
        });
        
        const attributesInput = document.getElementById('attributes-dropdown');
        if (attributesInput) {
          autocompleteFunction(attributesInput, attributesArray, (id, text) => {
            console.log(`Selected attribute: ${id} (${text})`);
          });
        }
      }
    }).catch(err => {
      console.error('Error fetching attributes:', err);
    });
  }
  
  if (window.campusesData && window.campusesData.length) {
    window.campusesData.forEach(campus => {
      campusesArray.push({ id: campus.code, text: campus.name });
    });
  } else {
    fetchCampuses().then(campuses => {
      if (campuses && campuses.length) {
        window.campusesData = campuses;
        campuses.forEach(campus => {
          campusesArray.push({ id: campus.code, text: campus.name });
        });
        
        const campusesInput = document.getElementById('campuses-dropdown');
        if (campusesInput) {
          autocompleteFunction(campusesInput, campusesArray, (id, text) => {
            console.log(`Selected campus: ${id} (${text})`);
          });
        }
      }
    }).catch(err => {
      console.error('Error fetching campuses:', err);
    });
  }
  
  if (window.instructorsData && window.instructorsData.length) {
    window.instructorsData.forEach(instructor => {
      instructorsArray.push({ 
        id: instructor.id, 
        text: `${instructor.lastName}, ${instructor.firstName}` 
      });
    });
  } else {
    fetchInstructors().then(instructors => {
      if (instructors && instructors.length) {
        window.instructorsData = instructors;
        instructors.forEach(instructor => {
          instructorsArray.push({ 
            id: instructor.id, 
            text: `${instructor.lastName}, ${instructor.firstName}` 
          });
        });
        
        const instructorsInput = document.getElementById('instructors-dropdown');
        if (instructorsInput) {
          autocompleteFunction(instructorsInput, instructorsArray, (id, text) => {
            console.log(`Selected instructor: ${id} (${text})`);
          });
        }
      }
    }).catch(err => {
      console.error('Error fetching instructors:', err);
    });
  }
  
  const subjectsInput = document.getElementById('subjects-dropdown');
  if (subjectsInput) {
    console.log('Setting up subjects autocomplete dropdown');
    
    if (subjectsArray.length < 5) {
      subjectsArray.push(
        { id: 'CHEM', text: 'CHEM - Chemistry' },
        { id: 'BIOL', text: 'BIOL - Biology' },
        { id: 'CSCI', text: 'CSCI - Computer Science' },
        { id: 'MATH', text: 'MATH - Mathematics' }
      );
    }
    autocompleteFunction(subjectsInput, subjectsArray, (id, text) => {
      console.log(`Selected subject: ${id} (${text})`);
    });
  }
  
  const attributesInput = document.getElementById('attributes-dropdown');
  if (attributesInput) {
    console.log('Setting up attributes autocomplete dropdown');
    
    if (attributesArray.length < 5) {
      attributesArray.push(
        { id: 'CORE', text: 'Core Curriculum' },
        { id: 'WI', text: 'Writing Intensive' },
        { id: 'SL', text: 'Service Learning' },
        { id: 'CAPA', text: 'Fine Arts' }
      );
    }
    autocompleteFunction(attributesInput, attributesArray, (id, text) => {
      console.log(`Selected attribute: ${id} (${text})`);
    });
  }
  
  const campusesInput = document.getElementById('campuses-dropdown');
  if (campusesInput) {
    console.log('Setting up campuses autocomplete dropdown');
    
    if (campusesArray.length < 3) {
      campusesArray.push(
        { id: 'MAIN', text: 'Main Campus' },
        { id: 'FLOR', text: 'Florence, Italy' },
        { id: 'ONLN', text: 'Online' }
      );
    }
    autocompleteFunction(campusesInput, campusesArray, (id, text) => {
      console.log(`Selected campus: ${id} (${text})`);
    });
  }
  
  const instructorsInput = document.getElementById('instructors-dropdown');
  if (instructorsInput) {
    console.log('Setting up instructors autocomplete dropdown');
    
    if (instructorsArray.length < 5) {
      instructorsArray.push(
        { id: '1001', text: 'Smith, John' },
        { id: '1002', text: 'Davis, Sarah' },
        { id: '1003', text: 'Johnson, Michael' },
        { id: '1004', text: 'Wilson, Emily' }
      );
    }
    autocompleteFunction(instructorsInput, instructorsArray, (id, text) => {
      console.log(`Selected instructor: ${id} (${text})`);
    });
  }
}

async function handleCourseSearch() {
  try {
    
    const resultsContainer = document.getElementById('course-results-container');
    resultsContainer.innerHTML = '';
    showLoadingSpinner('course-results-container');
    
    const subjectsInput = document.getElementById('subjects-dropdown');
    const attributesInput = document.getElementById('attributes-dropdown');
    const campusInput = document.getElementById('campus-dropdown');
    const instructorsInput = document.getElementById('instructors-dropdown');
    
    const subject = subjectsInput ? (subjectsInput.dataset.selectedId || getSubjectCodeFromText(subjectsInput.value)) : '';
    const attributes = attributesInput ? (attributesInput.dataset.selectedId || getAttributeCodeFromText(attributesInput.value)) : '';
    const campus = campusInput ? (campusInput.dataset.selectedId || getCampusCodeFromText(campusInput.value)) : '';
    const instructor = instructorsInput ? (instructorsInput.dataset.selectedId || getInstructorIdFromText(instructorsInput.value)) : '';
    
    const courseCode = document.getElementById('course-number-input').value;
    
    const levels = [];
    const levelButtons = document.querySelectorAll('.division-btn.selected');
    levelButtons.forEach(button => {
      levels.push(button.getAttribute('data-level'));
    });
    
    console.log('Search parameters:', { subject, courseCode, instructor, attributes, campus, levels });
    
    const searchParams = {
      subject,
      courseCode,
      instructor,
      attributes,
      campus,
      levels
    };
    
    const courses = await fetchCoursesBySearch(searchParams);
    console.log('Search results:', courses.length, 'courses found');
    
    displaySearchResults(courses);
    
  } catch (error) {
    console.error('Error searching courses:', error);
    createAlert('error', 'Failed to search courses. Please try again later.');
  } finally {
    hideLoadingSpinner('course-results-container');
  }
}

function getSubjectCodeFromText(text) {
  if (!text) return '';
  
  const match = text.match(/^([A-Z]{2,4})\s*-/);
  if (match) return match[1];
  
  const subject = subjectsData.find(s => 
    s.code.toLowerCase() === text.toLowerCase() || 
    s.name.toLowerCase() === text.toLowerCase()
  );
  
  return subject ? subject.code : text;
}

function getAttributeCodeFromText(text) {
  if (!text) return '';
  
  const attribute = attributesData.find(a => 
    a.name.toLowerCase() === text.toLowerCase()
  );
  
  return attribute ? attribute.code : text;
}

function getCampusCodeFromText(text) {
  if (!text) return '';
  
  const campus = campusesData.find(c => 
    c.name.toLowerCase() === text.toLowerCase()
  );
  
  return campus ? campus.code : text;
}

function getInstructorIdFromText(text) {
  if (!text) return '';
  
  const instructor = instructorsData.find(i => 
    i.name.toLowerCase() === text.toLowerCase()
  );
  
  return instructor ? instructor.id : text;
}

function displaySearchResults(courses) {
  const resultsContainer = document.getElementById('course-results-container');
  resultsContainer.innerHTML = '';
  
  if (!courses || courses.length === 0) {
    resultsContainer.innerHTML = '<div class="no-results">No courses match your search criteria.</div>';
    return;
  }
  
  const seen = new Set();
  const uniqueCourses = courses.filter(course => {
    const key = course.crn || course.section || course.section_number;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const table = document.createElement('table');
  table.className = 'courses-table';
  
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>CRN</th>
      <th>Course</th>
      <th>Title</th>
      <th>Section</th>
      <th>Instructor</th>
      <th>Schedule</th>
      <th>Location</th>
      <th>Seats</th>
      <th>Actions</th>
    </tr>
  `;
  table.appendChild(thead);
  
  const tbody = document.createElement('tbody');
  
  uniqueCourses.forEach(course => {
    const row = document.createElement('tr');
    
    if (course.seatsAvailable === 0) {
      row.classList.add('closed-section');
    }
    
    const availabilityText = course.seatsAvailable === 0 
      ? `CLOSED (0/${course.seatsTotal})`
      : `${course.seatsAvailable}/${course.seatsTotal}`;
    
    row.innerHTML = `
      <td>${course.crn}</td>
      <td>${course.subject} ${course.code}</td>
      <td>${course.title}</td>
      <td>${course.section}</td>
      <td>${course.instructor}</td>
      <td>${course.schedule}</td>
      <td>${course.location}</td>
      <td>${availabilityText}</td>
      <td>
        <button class="btn btn-sm btn-primary view-details-btn" data-crn="${course.crn}">
          <i class="fas fa-info-circle"></i> Details
        </button>
        <button class="btn btn-sm btn-success add-to-cart-btn ${course.seatsAvailable === 0 ? 'disabled' : ''}" 
                data-crn="${course.crn}" ${course.seatsAvailable === 0 ? 'disabled' : ''}>
          <i class="fas fa-plus"></i> Add
        </button>
      </td>
    `;
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  resultsContainer.appendChild(table);
  
  setupCourseActionButtons();
}

function setupCourseActionButtons() {
  
  document.querySelectorAll('.view-details-btn').forEach(button => {
    button.addEventListener('click', () => {
      const crn = button.getAttribute('data-crn');
      showCourseDetails(crn);
    });
  });
  
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', () => {
      const crn = button.getAttribute('data-crn');
      if (!button.classList.contains('disabled')) {
        addCourseToCart(crn);
      }
    });
  });
}

function showCourseDetails(crn) {
  console.log(`Showing details for course with CRN: ${crn}`);
  
  createAlert('info', `Course details feature coming soon. CRN: ${crn}`);
}

function addCourseToCart(crn) {
  console.log(`Adding course with CRN: ${crn} to cart`);
  
  createAlert('success', `Course added to shopping cart. CRN: ${crn}`);
}

function resetSearchFilters() {
  
  document.getElementById('subjects-dropdown').value = '';
  document.getElementById('subjects-dropdown').dataset.selectedId = '';
  
  document.getElementById('attributes-dropdown').value = '';
  document.getElementById('attributes-dropdown').dataset.selectedId = '';
  
  document.getElementById('campus-dropdown').value = '';
  document.getElementById('campus-dropdown').dataset.selectedId = '';
  
  document.getElementById('instructors-dropdown').value = '';
  document.getElementById('instructors-dropdown').dataset.selectedId = '';
  
  document.getElementById('course-number-input').value = '';
  
  document.querySelectorAll('.division-btn.selected').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  document.getElementById('course-results-container').innerHTML = '';
  
  const instructionEl = document.createElement('div');
  instructionEl.className = 'start-instruction';
  instructionEl.innerHTML = `
    <p>Use the search filters above to find available course sections.</p>
    <p>You can search by subject, course code, instructor, and more.</p>
  `;
  document.getElementById('course-results-container').appendChild(instructionEl);
  
  createAlert('info', 'Search filters have been reset.');
}

export function updateCoursesList(sections) {
  if (!sections || sections.length === 0) {
    document.getElementById('course-results-container').innerHTML = 
      '<div class="no-results">No courses found matching your search criteria.</div>';
    return;
  }
  
  displaySearchResults(sections);
}
