import { fetchCoursesBySearch } from '../auth/api.js';
import { initializeAutocompleteFields } from '../ui/controls.js';

let currentCourses = [];
let selectedFilters = {
    subject: '',
    courseCode: '',
    instructor: '',
    attributes: [],
    campus: '',
    levels: []
};

export function initializeSearchSection() {
    console.log('Initializing search section...');
    
    setupAutocompleteFields();
    
    setupEventListeners();
    
    performSearch();
}

function setupAutocompleteFields() {
    console.log('Setting up autocomplete fields...');
    
    try {
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => initializeAutocompleteFields(handleFilterChange));
        } else {
            initializeAutocompleteFields(handleFilterChange);
        }
    } catch (error) {
        console.error('Error setting up autocomplete fields:', error);
        displayMessage('Error setting up search filters. Please refresh the page.', 'error');
    }
}

function setupEventListeners() {
    console.log('Setting up search event listeners...');
    
    const searchButton = document.getElementById('course-search-button');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            performSearch();
        });
    }
    
    const courseCodeInput = document.getElementById('course-code-input');
    if (courseCodeInput) {
        courseCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    const clearFiltersButton = document.getElementById('clear-filters-button');
    if (clearFiltersButton) {
        clearFiltersButton.addEventListener('click', clearFilters);
    }
    
    const advancedFiltersToggle = document.getElementById('advanced-filters-toggle');
    const advancedFiltersContainer = document.getElementById('advanced-filters-container');
    
    if (advancedFiltersToggle && advancedFiltersContainer) {
        advancedFiltersToggle.addEventListener('click', () => {
            const isVisible = advancedFiltersContainer.classList.toggle('show');
            advancedFiltersToggle.textContent = isVisible 
                ? 'Hide Advanced Filters' 
                : 'Show Advanced Filters';
        });
    }
    
    const levelCheckboxes = document.querySelectorAll('.level-checkbox');
    levelCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateSelectedLevels();
        });
    });
}

function updateSelectedLevels() {
    const checkboxes = document.querySelectorAll('.level-checkbox:checked');
    selectedFilters.levels = Array.from(checkboxes).map(cb => cb.value);
    console.log('Selected levels updated:', selectedFilters.levels);
}

function handleFilterChange(filterId, value) {
    console.log(`Filter changed: ${filterId} = ${value}`);
    
    switch (filterId) {
        case 'subject':
            selectedFilters.subject = value;
            break;
        case 'instructor':
            selectedFilters.instructor = value;
            break;
        case 'attributes':
            if (!selectedFilters.attributes.includes(value)) {
                selectedFilters.attributes.push(value);
                updateAttributeChips();
            }
            break;
        case 'campus':
            selectedFilters.campus = value;
            break;
        default:
            console.warn(`Unknown filter ID: ${filterId}`);
    }
}

function updateAttributeChips() {
    const container = document.getElementById('attribute-chips-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    selectedFilters.attributes.forEach(attr => {
        const chip = document.createElement('div');
        chip.className = 'attribute-chip';
        chip.innerHTML = `
            ${attr}
            <span class="remove-chip" data-attribute="${attr}">&times;</span>
        `;
        container.appendChild(chip);
        
        const removeButton = chip.querySelector('.remove-chip');
        removeButton.addEventListener('click', (e) => {
            const attribute = e.target.dataset.attribute;
            selectedFilters.attributes = selectedFilters.attributes.filter(a => a !== attribute);
            updateAttributeChips();
        });
    });
    
    container.style.display = selectedFilters.attributes.length > 0 ? 'flex' : 'none';
}

function clearFilters() {
    console.log('Clearing all filters...');
    
    selectedFilters = {
        subject: '',
        courseCode: '',
        instructor: '',
        attributes: [],
        campus: '',
        levels: []
    };
    
    const subjectInput = document.getElementById('subject-input');
    const courseCodeInput = document.getElementById('course-code-input');
    const instructorInput = document.getElementById('instructor-input');
    const campusInput = document.getElementById('campus-input');
    
    if (subjectInput) subjectInput.value = '';
    if (courseCodeInput) courseCodeInput.value = '';
    if (instructorInput) instructorInput.value = '';
    if (campusInput) campusInput.value = '';
    
    const levelCheckboxes = document.querySelectorAll('.level-checkbox');
    levelCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    selectedFilters.attributes = [];
    updateAttributeChips();
    
    performSearch();
}

async function performSearch() {
    const resultsContainer = document.getElementById('course-results-container');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = `
        <div class="loading-indicator">
            <div class="spinner"></div>
            <p>Connecting to backend server...</p>
            <p class="loading-subtitle">Retrieving course data...</p>
        </div>
    `;

    try {
        
        const selectedFilters = {
            subject: document.getElementById('subjects-dropdown')?.value || '',
            courseCode: document.getElementById('course-number-input')?.value || '',
            instructor: document.getElementById('instructors-dropdown')?.value || '',
            attributes: document.getElementById('attributes-dropdown')?.value || '',
            campus: document.getElementById('campus-dropdown')?.value || '',
            levels: Array.from(document.querySelectorAll('.division-btn.selected')).map(btn => btn.dataset.level)
        };

        console.log('Search parameters:', selectedFilters);

        const courses = await fetchCoursesBySearch(
            selectedFilters.subject,
            selectedFilters.courseCode,
            selectedFilters.instructor,
            selectedFilters.attributes,
            selectedFilters.campus,
            selectedFilters.levels
        );

        console.log('Courses received:', courses);
        
        renderCoursesList(courses);
    } catch (error) {
        console.error('Error performing search:', error);
        resultsContainer.innerHTML = `
            <div class="error-message">
                <p>Error: ${error.message}</p>
                <p>Could not fetch courses. Please try again.</p>
            </div>
        `;
    }
}

function renderCoursesList(courses) {
    const resultsContainer = document.getElementById('course-results-container');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';

    if (!courses || courses.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>No courses found matching your search criteria.</p>
                <p>Try adjusting your filters or search terms.</p>
            </div>
        `;
        return;
    }

    const coursesList = courses.map(course => `
        <div class="course-item">
            <div class="course-header">
                <h3>${course.subject} ${course.courseNumber} - ${course.title}</h3>
                <span class="course-credits">${course.credits} Credits</span>
            </div>
            <div class="section-list">
                ${course.sections.map(section => `
                    <div class="section-item">
                        <div class="section-header">
                            <h4>Section ${section.crn}</h4>
                            <span class="availability ${section.available > 0 ? 'available' : 'full'}">
                                ${section.available}/${section.total} seats available
                            </span>
                        </div>
                        <div class="section-details">
                            <p><strong>Instructor:</strong> ${section.instructor}</p>
                            <p><strong>Schedule:</strong> ${section.schedule}</p>
                            <p><strong>Location:</strong> ${section.location}</p>
                        </div>
                        <div class="section-actions">
                            <button class="add-section-btn" data-crn="${section.crn}">
                                Add to Schedule
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    resultsContainer.innerHTML = coursesList;

    document.querySelectorAll('.add-section-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const crn = e.target.dataset.crn;
            console.log('Adding section to schedule:', crn);
            
        });
    });
}

function addCourseToSchedule(crn) {
    console.log(`Adding course with CRN ${crn} to schedule`);
    
    displayMessage(`Course ${crn} added to your schedule`, 'success');
}

function showCourseDetails(crn) {
    console.log(`Showing details for course with CRN ${crn}`);
    
    const course = currentCourses.find(c => c.crn === crn);
    if (!course) {
        displayMessage('Course details not found', 'error');
        return;
    }
    
    alert(`Course Details for ${course.subject} ${course.code} - ${course.title}\n\nMore detailed view coming soon!`);
}

window.fetchCoursesBySearch = fetchCoursesBySearch; 