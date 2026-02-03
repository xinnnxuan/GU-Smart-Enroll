
export async function fetchStudentRequirements(studentId, majorProgram, coreProgram = 'University Core Requirements') {
  try {
    
    const backendAvailable = await checkBackendConnection();
    if (!backendAvailable) {
      console.warn('Backend server is not available, using mock requirements data');
      return getMockRequirementsData(studentId, majorProgram);
    }

    const params = new URLSearchParams({
      student_id: studentId,
      major_program: majorProgram
    });
    
    if (coreProgram) {
      params.append('core_program', coreProgram);
    }

    const response = await fetch(`/requirements_bp/student-requirements?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching requirements: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch student requirements:', error);
    throw error;
  }
}

export function displayRequirements(requirementsData, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID "${containerId}" not found`);
    return;
  }

  const requirementsContainer = document.createElement('div');
  requirementsContainer.className = 'requirements-container';

  const coreSection = createRequirementSection(
    'Core Requirements', 
    requirementsData.core_requirements,
    true
  );
  requirementsContainer.appendChild(coreSection);

  const majorSection = createRequirementSection(
    'Major Requirements', 
    requirementsData.major_requirements,
    false
  );
  requirementsContainer.appendChild(majorSection);

  container.innerHTML = '';
  container.appendChild(requirementsContainer);
}

function createRequirementSection(title, requirements, isCore) {
  const section = document.createElement('div');
  section.className = 'requirements-section';
  
  const titleEl = document.createElement('h2');
  titleEl.textContent = title;
  section.appendChild(titleEl);
  
  if (Object.keys(requirements).length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'empty-requirements';
    emptyMsg.textContent = 'No requirements found.';
    section.appendChild(emptyMsg);
    return section;
  }
  
  let totalRequired = 0;
  let totalTaken = 0;
  
  Object.values(requirements).forEach(req => {
    totalRequired += req.required_credits;
    totalTaken += req.taken_credits;
  });
  
  const percent = Math.min(100, Math.round((totalTaken / totalRequired) * 100)) || 0;
  
  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress-container';
  
  const progressSummary = document.createElement('div');
  progressSummary.className = 'progress-summary';
  progressSummary.innerHTML = `
    <span class="progress-percentage">${percent}%</span>
    <span class="progress-details">${totalTaken}/${totalRequired} credits</span>
  `;
  
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  
  const progressFill = document.createElement('div');
  progressFill.className = 'progress-fill';
  progressFill.style.width = `${percent}%`;
  
  if (percent >= 75) {
    progressFill.classList.add('progress-high');
  } else if (percent >= 50) {
    progressFill.classList.add('progress-medium');
  } else {
    progressFill.classList.add('progress-low');
  }
  
  progressBar.appendChild(progressFill);
  progressContainer.appendChild(progressSummary);
  progressContainer.appendChild(progressBar);
  section.appendChild(progressContainer);
  
  const groups = document.createElement('div');
  groups.className = 'requirement-groups';
  
  const sortedRequirements = Object.entries(requirements)
    .sort(([, a], [, b]) => a.json_id - b.json_id);
  
  sortedRequirements.forEach(([groupName, groupData]) => {
    const groupEl = createRequirementGroup(groupName, groupData, isCore);
    groups.appendChild(groupEl);
  });
  
  section.appendChild(groups);
  return section;
}

function createRequirementGroup(groupName, groupData, isCore) {
  const group = document.createElement('div');
  group.className = 'requirement-group';
  
  const header = document.createElement('div');
  header.className = 'requirement-header';
  
  const percent = Math.min(100, Math.round((groupData.taken_credits / groupData.required_credits) * 100)) || 0;
  
  header.innerHTML = `
    <div class="requirement-title">
      <h3>${groupName}</h3>
      <span class="requirement-id">Group ${groupData.json_id}</span>
    </div>
    <div class="requirement-progress">
      <div class="progress-bar small">
        <div class="progress-fill ${percent >= 100 ? 'complete' : ''}" style="width: ${percent}%"></div>
      </div>
      <span class="credits-info">${groupData.taken_credits}/${groupData.required_credits} credits</span>
    </div>
  `;
  
  group.appendChild(header);
  
  const content = document.createElement('div');
  content.className = 'requirement-content';
  
  if (groupData.taken_courses_in_group.length > 0) {
    const takenSection = document.createElement('div');
    takenSection.className = 'taken-courses';
    takenSection.innerHTML = `
      <h4>Completed Courses:</h4>
      <div class="course-list">
        ${groupData.taken_courses_in_group.map(course => 
          `<span class="course-tag">${course}</span>`
        ).join('')}
      </div>
    `;
    content.appendChild(takenSection);
  }
  
  const availableSection = document.createElement('div');
  availableSection.className = 'available-courses';
  
  if (typeof groupData.available_courses === 'string') {
    
    availableSection.innerHTML = `
      <h4>Requirement:</h4>
      <p class="core-requirement">${groupData.available_courses}</p>
      ${groupData.expected_attribute ? 
        `<p class="core-attribute">Courses must have the "${groupData.expected_attribute}" attribute</p>` : 
        ''}
    `;
  } else if (groupData.available_courses.length > 0) {
    
    availableSection.innerHTML = `
      <h4>Available Courses:</h4>
      <div class="course-list">
        ${groupData.available_courses.map(course => 
          `<span class="course-tag available">${course}</span>`
        ).join('')}
      </div>
    `;
  } else {
    
    availableSection.innerHTML = `
      <h4>Available Courses:</h4>
      <p class="no-courses">No additional courses available.</p>
    `;
  }
  
  content.appendChild(availableSection);
  
  if (!isCore && groupData.double_count_groups.length > 0) {
    const doubleCountInfo = document.createElement('div');
    doubleCountInfo.className = 'double-count-info';
    doubleCountInfo.innerHTML = `
      <h4>Double Count Info:</h4>
      <p>Courses in this group can count toward groups: ${groupData.double_count_groups.join(', ')}</p>
    `;
    content.appendChild(doubleCountInfo);
  }
  
  group.appendChild(content);
  return group;
}

export function initializeRequirements() {
  const requirementsContainer = document.getElementById('requirements-container');
  const majorSelector = document.getElementById('major-selector');
  const loadRequirementsBtn = document.getElementById('load-requirements-btn');
  
  if (!requirementsContainer || !loadRequirementsBtn) {
    console.warn('Requirements UI elements not found');
    return;
  }
  
  loadRequirementsBtn.addEventListener('click', async () => {
    try {
      
      requirementsContainer.innerHTML = `
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading your degree requirements...</p>
      `;
      
      const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
      const studentId = user.id || 1; 
      
      const majorProgram = majorSelector ? 
        majorSelector.value : 
        'B.S. Computer Science - Data Science Concentration';
      
      const requirementsData = await fetchStudentRequirements(studentId, majorProgram);
      
      displayRequirements(requirementsData, 'requirements-container');
    } catch (error) {
      console.error('Failed to load requirements:', error);
      requirementsContainer.innerHTML = `
        <div class="error-message">
          <p>Failed to load requirements: ${error.message}</p>
          <p>Please try again later.</p>
        </div>
      `;
    }
  });
}

async function checkBackendConnection() {
  try {
    const response = await fetch('/api/health-check', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Backend connection check failed:', error);
    return false;
  }
}

function getMockRequirementsData(studentId, majorProgram) {
  return {
    "core_requirements": {
      "First-Year Seminar": {
        "json_id": 1,
        "required_credits": 3,
        "taken_credits": 3,
        "remaining_credits": 0,
        "taken_courses_in_group": ["ENGL 101"],
        "available_courses": "CORE 3",
        "expected_attribute": "First-Year Seminar"
      },
      "Theology & Religious Studies Core": {
        "json_id": 2,
        "required_credits": 6,
        "taken_credits": 3,
        "remaining_credits": 3,
        "taken_courses_in_group": ["RELI 110"],
        "available_courses": "CORE 6",
        "expected_attribute": "Theology & Religious Studies"
      },
      "Philosophy Core": {
        "json_id": 3,
        "required_credits": 6,
        "taken_credits": 3,
        "remaining_credits": 3,
        "taken_courses_in_group": ["PHIL 101"],
        "available_courses": "CORE 6",
        "expected_attribute": "Philosophy"
      },
      "Mathematics Core": {
        "json_id": 4,
        "required_credits": 3,
        "taken_credits": 3,
        "remaining_credits": 0,
        "taken_courses_in_group": ["MATH 157"],
        "available_courses": "CORE 3",
        "expected_attribute": "Mathematics"
      },
      "Writing Core": {
        "json_id": 5,
        "required_credits": 3,
        "taken_credits": 3,
        "remaining_credits": 0,
        "taken_courses_in_group": ["ENGL 101"],
        "available_courses": "CORE 3",
        "expected_attribute": "Writing"
      }
    },
    "major_requirements": {
      "Computer Science Foundation": {
        "json_id": 1,
        "required_credits": 21,
        "taken_credits": 12,
        "remaining_credits": 9,
        "taken_courses_in_group": ["CPSC 121", "CPSC 122", "CPSC 223", "CPSC 224"],
        "available_courses": ["CPSC 260", "CPSC 326", "CPSC 346"],
        "double_count_groups": []
      },
      "Mathematics Requirements": {
        "json_id": 2,
        "required_credits": 9,
        "taken_credits": 6,
        "remaining_credits": 3,
        "taken_courses_in_group": ["MATH 157", "MATH 231"],
        "available_courses": ["MATH 258"],
        "double_count_groups": [4]
      },
      "Data Science Concentration": {
        "json_id": 3,
        "required_credits": 12,
        "taken_credits": 3,
        "remaining_credits": 9,
        "taken_courses_in_group": ["CPSC 310"],
        "available_courses": ["CPSC 320", "CPSC 321", "CPSC 330", "CPSC 421"],
        "double_count_groups": []
      },
      "Electives": {
        "json_id": 4,
        "required_credits": 9,
        "taken_credits": 3,
        "remaining_credits": 6,
        "taken_courses_in_group": ["MATH 231"],
        "available_courses": ["CPSC 351", "CPSC 423", "CPSC 447", "MATH 258"],
        "double_count_groups": [2]
      }
    }
  };
}

document.addEventListener('DOMContentLoaded', () => {
  initializeRequirements();
}); 