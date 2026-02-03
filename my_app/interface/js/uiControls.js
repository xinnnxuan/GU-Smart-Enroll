
import { generateMockSections } from './mockdata.js';

export function updateCoursesListWithMockData() {
    const mockSections = generateMockSections({});
    const coursesList = document.getElementById('courses-list');
    
    if (!coursesList) {
        console.error('Courses list element not found');
        return;
    }
    
    coursesList.innerHTML = '';
    
    mockSections.forEach(section => {
        const courseItem = document.createElement('div');
        courseItem.className = 'course-item';
        courseItem.innerHTML = `
            <div class="course-header">
                <h3>${section.subject} ${section.course_code}-${section.section_number}</h3>
                <span class="seats-available">${section.seats_available}/${section.total_seats} seats</span>
            </div>
            <div class="course-details">
                <p><strong>Schedule:</strong> ${section.schedule}</p>
                <p><strong>Instructor:</strong> ${section.instructor}</p>
                <p><strong>Location:</strong> ${section.location}</p>
                <p><strong>Credits:</strong> ${section.credits}</p>
            </div>
            <button class="add-course-btn" onclick="addSectionToSchedule('${section.subject}', '${section.course_code}', '${section.section_number}')">
                Add to Schedule
            </button>
        `;
        coursesList.appendChild(courseItem);
    });
}

function setupInstructorAutocomplete() {
    console.log('Setting up instructor autocomplete');
    const instructorInput = document.getElementById('instructor-input');
    if (!instructorInput) {
        console.warn('Instructor input not found');
        return;
    }
    
    const mockInstructors = [
        "Dr. Smith", "Dr. Johnson", "Prof. Williams", "Prof. Brown", 
        "Dr. Jones", "Dr. Garcia", "Prof. Miller", "Prof. Davis",
        "Dr. Rodriguez", "Dr. Martinez", "Prof. Hernandez", "Prof. Lopez"
    ];
    
    console.log('Using mock instructors data:', mockInstructors);
    
    window.instructors = mockInstructors;
    
    setupCustomAutocomplete(instructorInput, mockInstructors);
}

function setupCustomAutocomplete(inputElement, items) {
    
    const container = document.createElement('div');
    container.className = 'autocomplete-container';

    inputElement.parentNode.insertBefore(container, inputElement.nextSibling);

    container.appendChild(inputElement);

    const dropdownList = document.createElement('div');
    dropdownList.className = 'autocomplete-list';
    container.appendChild(dropdownList);

    inputElement.addEventListener('input', function() {
        const value = this.value.toLowerCase();

        if (!value) {
            dropdownList.style.display = 'none';
            return;
        }

        const filteredItems = items.filter(item =>
            item.toLowerCase().includes(value)
        ).slice(0, 10); 

        if (filteredItems.length > 0) {
            dropdownList.innerHTML = '';

            filteredItems.forEach(item => {
                const element = document.createElement('div');
                element.className = 'autocomplete-item';
                element.innerHTML = highlightMatches(item, value);

                element.addEventListener('click', function() {
                    inputElement.value = item;
                    dropdownList.style.display = 'none';
                });

                dropdownList.appendChild(element);
            });

            dropdownList.style.display = 'block';
        } else {
            dropdownList.style.display = 'none';
        }
    });

    document.addEventListener('click', function(e) {
        if (!container.contains(e.target)) {
            dropdownList.style.display = 'none';
        }
    });

    inputElement.addEventListener('focus', function() {
        const value = this.value.toLowerCase();
        if (value) {
            
            this.dispatchEvent(new Event('input'));
        }
    });

    inputElement.addEventListener('keydown', function(e) {
        const items = dropdownList.querySelectorAll('.autocomplete-item');
        if (!items.length) return;

        const currentSelected = dropdownList.querySelector('.selected');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!currentSelected) {
                items[0].classList.add('selected');
            } else {
                const nextSibling = currentSelected.nextElementSibling;
                if (nextSibling) {
                    currentSelected.classList.remove('selected');
                    nextSibling.classList.add('selected');
                }
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentSelected) {
                const prevSibling = currentSelected.previousElementSibling;
                if (prevSibling) {
                    currentSelected.classList.remove('selected');
                    prevSibling.classList.add('selected');
                }
            }
        } else if (e.key === 'Enter') {
            if (currentSelected) {
                e.preventDefault();
                inputElement.value = currentSelected.textContent;
                dropdownList.style.display = 'none';
            }
        } else if (e.key === 'Escape') {
            dropdownList.style.display = 'none';
        }
    });
}

function highlightMatches(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

function resetButtonStyle(button) {
    button.style.cssText = `
        border: 1px solid #C4C8CE;
        color: #6c757d;
        background-color: transparent;
    `;
}

function setSelectedButtonStyle(button) {
    button.style.cssText = `
        border: 1px solid #002467;
        color: #ffffff;
        background-color: #002467;
    `;
}