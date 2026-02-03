import { createContextMenu } from './contextMenu.js';
import { toggleDaySelection, getSelectedDays, clearDaySelections, addEventToGrid, validateTime } from './eventManagement.js';

export function addEventBlockListeners(eventBlock) {
    
    eventBlock.addEventListener('click', handleEventBlockClick);
    
    eventBlock.addEventListener('contextmenu', handleEventContextMenu);
}

function handleEventBlockClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (typeof openEventEditModal === 'function') {
        openEventEditModal(event.currentTarget);
    } else if (window.openEventEditModal) {
        window.openEventEditModal(event.currentTarget);
    }
}

function handleEventContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const { pageX: x, pageY: y, currentTarget: eventBlock } = event;
    createContextMenu(x, y, eventBlock);
}

export function setupSidebarTabListeners() {
    document.querySelectorAll('.sidebar-tabs a').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            const tabId = this.dataset.tab;
            if (!tabId) return;
            
            document.querySelectorAll('.sidebar-tabs a').forEach(t => {
                t.classList.remove('active');
            });
            
            this.classList.add('active');
            
            document.querySelectorAll('.sidebar .tab-content').forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
                tabContent.style.display = 'block';
            }
        });
    });
}

export function initializeEventListeners() {
    
    setupSidebarTabListeners();
    
    const addEventBtn = document.querySelector('.add-event-btn');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', function() {
            
            import('./eventManagement.js').then(module => {
                module.addEventFromForm();
            });
        });
    }
    
    const searchPrereqBtn = document.getElementById('search-prereq-btn');
    if (searchPrereqBtn) {
        searchPrereqBtn.addEventListener('click', function() {
            const searchInput = document.getElementById('prereq-search-input');
            if (searchInput && searchInput.value.trim()) {
                
                import('./prereqService.js').then(module => {
                    if (typeof module.searchPrerequisites === 'function') {
                        module.searchPrerequisites();
                    } else {
                        console.error('searchPrerequisites function not found in prereqService module');
                    }
                });
            }
        });
    }
    
    const searchCoursesBtn = document.getElementById('search-courses-btn');
    if (searchCoursesBtn) {
        searchCoursesBtn.addEventListener('click', function() {
            
            const subject = document.querySelector('#subject-search')?.value || '';
            const courseCode = document.querySelector('#course-code-search')?.value || '';
            const attributes = document.querySelector('#attributes-search')?.value || '';
            const instructor = document.querySelector('#instructor-input')?.value || '';
            const campus = document.querySelector('#campus-search')?.value || '';
            const methods = document.querySelector('#methods-search')?.value || '';

            const lowerDivision = document.querySelector('.filter-button:first-child')?.classList.contains('active');
            const upperDivision = document.querySelector('.filter-button:last-child')?.classList.contains('active');

            const searchParams = {
                subject: subject.trim(),
                courseCode: courseCode.trim(),
                attributes: attributes.trim(),
                instructor: instructor.trim(),
                campus: campus.trim(),
                methods: methods.trim(),
                lowerDivision,
                upperDivision
            };

            const coursesList = document.getElementById('courses-list');
            const sectionsList = document.getElementById('sections-list');
            if (coursesList) coursesList.innerHTML = '';
            if (sectionsList) sectionsList.innerHTML = '';

            if (coursesList) {
                coursesList.innerHTML = '<div class="loading">Searching courses...</div>';
            }

            if (typeof window.fetchData === 'function') {
                window.fetchData(searchParams);
            } else {
                console.error('fetchData function not found');
                if (coursesList) {
                    coursesList.innerHTML = '<div class="error">Search functionality is not available</div>';
                }
            }
        });
    }

    document.querySelectorAll('.day-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            toggleDaySelection(e.target);
        });
    });

    const addEventButton = document.querySelector('#RecurringEvents .search-btn');
    if (addEventButton) {
        addEventButton.addEventListener('click', handleEventSubmission);
    }
}

function handleEventSubmission(e) {
    e.preventDefault();
    
    const eventName = document.querySelector('#recurring-event-name').value.trim();
    const startTime = document.querySelector('#start-time-input').value.trim();
    const endTime = document.querySelector('#end-time-input').value.trim();
    const selectedDays = getSelectedDays();
    
    if (!eventName) {
        showError('Please enter an event name');
        return;
    }
    
    if (!startTime || !endTime) {
        showError('Please enter both start and end times');
        return;
    }
    
    if (selectedDays.length === 0) {
        showError('Please select at least one day');
        return;
    }
    
    const formattedStartTime = validateTime(startTime);
    const formattedEndTime = validateTime(endTime);
    
    if (!formattedStartTime || !formattedEndTime) {
        showError('Please enter valid times (e.g., 9:00 or 9:00am)');
        return;
    }
    
    addEventToGrid(eventName, formattedStartTime, formattedEndTime, selectedDays);
    
    clearEventForm();
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '14px';
    errorDiv.style.marginTop = '10px';
    
    const form = document.querySelector('#RecurringEvents .recurring-events-view');
    form.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

function clearEventForm() {
    document.querySelector('#recurring-event-name').value = '';
    document.querySelector('#start-time-input').value = '';
    document.querySelector('#end-time-input').value = '';
    clearDaySelections();
}
