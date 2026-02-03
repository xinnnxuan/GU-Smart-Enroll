import { generateMockSections } from './mockdata.js';
import { fetchSections, checkBackendConnection } from './exportService.js';
import { updateCoursesListWithMockData } from './uiControls.js';
import { editEventOnSchedule } from './eventEditing.js';
import { parseTimeToHour, getDayIndex, getRandomCourseColor } from './utility.js';

window.sectionsData = [];

window.fetchData = fetchData;

function fetchData(searchParams = {}) {
    
    const criteria = {};
    
    if (searchParams.subject) {
        criteria.subject = searchParams.subject.toUpperCase();
    }
    
    if (searchParams.courseCode) {
        criteria.course_code = searchParams.courseCode;
    }
    
    if (searchParams.attributes) {
        criteria.attribute = searchParams.attributes;
    }
    
    if (searchParams.instructor) {
        criteria.instructor = searchParams.instructor;
    }

    if (searchParams.campus) {
        criteria.campus = searchParams.campus;
    }

    if (searchParams.methods) {
        criteria.methods = searchParams.methods;
    }

    if (searchParams.lowerDivision && !searchParams.upperDivision) {
        criteria.level = 'lower';
    } else if (!searchParams.lowerDivision && searchParams.upperDivision) {
        criteria.level = 'upper';
    }
    
    const coursesList = document.getElementById('courses-list');
    if (coursesList) {
        coursesList.innerHTML = '<div class="loading">Searching courses...</div>';
    }
    
    if (Object.keys(criteria).length > 0) {
        try {
            fetchSections(criteria)
                .then(sections => {
                    if (sections && sections.length > 0) {
                        displayResults(sections);
                    } else {
                        displayNoResults();
                    }
                })
                .catch(error => {
                    console.error('Error fetching sections:', error);
                    displayError();
                });
        } catch (error) {
            console.error('Error in fetchSections:', error);
            
            const mockSections = generateMockSections(criteria);
            displayResults(mockSections);
        }
    } else {
        
        const mockSections = generateMockSections();
        displayResults(mockSections);
    }
}

function displayResults(sections) {
    const coursesList = document.getElementById('courses-list');
    if (!coursesList) return;

    if (!sections || sections.length === 0) {
        displayNoResults();
        return;
    }

    const courseGroups = sections.reduce((groups, section) => {
        const courseKey = `${section.subject} ${section.courseCode}`;
        if (!groups[courseKey]) {
            groups[courseKey] = [];
        }
        groups[courseKey].push(section);
        return groups;
    }, {});

    coursesList.innerHTML = '';

    Object.entries(courseGroups).forEach(([courseKey, courseSections]) => {
        const courseItem = document.createElement('div');
        courseItem.className = 'course-item';
        
        const section = courseSections[0]; 
        courseItem.innerHTML = `
            <div class="course-header">
                <h3>${section.subject} ${section.courseCode}</h3>
                <span class="course-credits">${section.credits} credits</span>
            </div>
            <p class="course-title">${section.title || 'Course Title Not Available'}</p>
            <div class="course-sections">
                <h4>Available Sections:</h4>
                <ul class="sections-list">
                    ${courseSections.map(sect => `
                        <li class="section-item" data-section="${sect.sectionNumber}">
                            <div class="section-header">
                                <span class="section-number">Section ${sect.sectionNumber}</span>
                                <span class="section-availability ${getAvailabilityClass(sect)}">${sect.availability || 'Unknown'}</span>
                            </div>
                            <div class="section-details">
                                <span class="section-instructor">${sect.instructor || 'TBA'}</span>
                                <span class="section-schedule">${sect.schedule || 'TBA'}</span>
                            </div>
                            <button class="add-section-btn" onclick="addSectionToSchedule('${sect.subject}', '${sect.courseCode}', '${sect.sectionNumber}')">
                                Add to Schedule
                            </button>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        
        coursesList.appendChild(courseItem);
    });
}

function displayNoResults() {
    const coursesList = document.getElementById('courses-list');
    if (coursesList) {
        coursesList.innerHTML = `
            <div class="no-results">
                <p>No courses found matching your search criteria.</p>
                <p>Try adjusting your search terms or filters.</p>
            </div>
        `;
    }
}

function displayError() {
    const coursesList = document.getElementById('courses-list');
    if (coursesList) {
        coursesList.innerHTML = `
            <div class="error">
                <p>An error occurred while searching for courses.</p>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

function getAvailabilityClass(section) {
    if (!section.availability) return 'unknown';
    const availability = section.availability.toLowerCase();
    if (availability.includes('open')) return 'available';
    if (availability.includes('wait')) return 'waitlist';
    return 'closed';
}

function addSectionToSchedule(subject, courseCode, sectionNumber) {
    console.log(`Adding section to schedule: ${subject} ${courseCode} ${sectionNumber}`);
    
    const sectionData = findSectionByNumber(subject, courseCode, sectionNumber);
    
    if (!sectionData) {
        console.error(`Section ${sectionNumber} of ${subject} ${courseCode} not found.`);
        showNotification(`Section ${sectionNumber} of ${subject} ${courseCode} not found.`, 'error');
        return;
    }
    
    const scheduleInfo = sectionData.schedule;
    if (!scheduleInfo || scheduleInfo === 'TBA' || scheduleInfo === 'Not specified') {
        showNotification(`Schedule information not available for ${subject} ${courseCode} ${sectionNumber}.`, 'info');
        return;
    }
    
    const existingCourses = document.querySelectorAll('.course-block');
    for (const courseEl of existingCourses) {
        if (courseEl.getAttribute('data-section') === sectionNumber && 
            courseEl.getAttribute('data-course') === `${subject} ${courseCode}`) {
            showNotification(`${subject} ${courseCode} ${sectionNumber} is already in your schedule.`, 'info');
            return;
        }
    }
    
    try {
        
        const firstSpaceIndex = scheduleInfo.indexOf(' ');
        if (firstSpaceIndex === -1) {
            showNotification(`Invalid schedule format: ${scheduleInfo}`, 'error');
            return;
        }
        
        const days = scheduleInfo.substring(0, firstSpaceIndex).trim();
        let timeRange = scheduleInfo.substring(firstSpaceIndex + 1).trim();
        
        const timeMatch = timeRange.match(/(\d+:\d+\s*(?:AM|PM))\s*-\s*(\d+:\d+\s*(?:AM|PM))/i);
        if (!timeMatch) {
            showNotification(`Could not parse time information: ${timeRange}`, 'error');
            return;
        }
        
        const startTime = timeMatch[1].trim();
        const endTime = timeMatch[2].trim();
        
        const courseKey = `${subject} ${courseCode}`;
        
        if (window.courseColorMap && window.courseColorMap[courseKey]) {
            console.log(`Clearing existing color for ${courseKey} to ensure unique color assignment`);
            delete window.courseColorMap[courseKey];
        }
        
        const courseColor = getRandomCourseColor(courseKey);
        console.log(`Color selected for ${courseKey}: ${courseColor}`);
        
        for (const day of days) {
            const dayIndex = getDayIndex(day);
            if (dayIndex === -1) continue;
            
            const startHour = parseTimeToHour(startTime);
            const endHour = parseTimeToHour(endTime);
            
            if (isNaN(startHour) || isNaN(endHour)) {
                showNotification(`Invalid time format: ${timeRange}`, 'error');
                return;
            }
            
            const timeRow = findTimeRow(startTime);
            if (!timeRow) {
                showNotification(`Could not find time slot for ${startTime}`, 'info');
                continue;
            }
            
            const colIndex = dayIndex + 1;
            
            const cell = timeRow.cells[colIndex];
            if (!cell) {
                console.error(`Cell not found for day index ${dayIndex} at time ${startTime}`);
                continue;
            }
            
            const existingBlock = cell.querySelector('.course-block');
            if (existingBlock) {
                const existingCourse = existingBlock.getAttribute('data-course');
                showNotification(`Time conflict with ${existingCourse}`, 'error');
                return;
            }
            
            const courseBlock = document.createElement('div');
            courseBlock.className = 'course-block';
            
            courseBlock.style.backgroundColor = courseColor;
            console.log(`Applied color ${courseColor} to course block for ${courseKey}`);
            
            const durationHours = endHour - startHour;
            
            courseBlock.style.position = 'absolute';
            courseBlock.style.left = '0';
            courseBlock.style.top = '0';
            courseBlock.style.width = '100%';
            courseBlock.style.height = `${durationHours * 100}%`;
            
            courseBlock.setAttribute('data-course', courseKey);
            courseBlock.setAttribute('data-section', sectionNumber);
            
            let creditValue = sectionData.credits;
            if (typeof creditValue === 'string') {
                creditValue = parseInt(creditValue, 10);
            }
            if (isNaN(creditValue) || creditValue <= 0) {
                creditValue = 3;
            }
            
            courseBlock.setAttribute('data-credits', creditValue);
            courseBlock.setAttribute('data-start-time', startTime);
            courseBlock.setAttribute('data-end-time', endTime);
            courseBlock.setAttribute('data-day', day);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'course-delete-btn';
            deleteButton.innerHTML = '×'; 
            deleteButton.title = `Remove ${courseKey}`;
            
            deleteButton.addEventListener('click', function(e) {
                e.stopPropagation();
                removeCourseFromSchedule(subject, courseCode, sectionNumber);
            });
            
            const courseContent = `
                <div class="event-name">${courseKey}</div>
                <div class="event-time">${startTime} - ${endTime}</div>
                <div class="event-location">${sectionData.location || 'TBA'}</div>
            `;
            
            courseBlock.innerHTML = courseContent;
            
            courseBlock.appendChild(deleteButton);
            
            courseBlock.addEventListener('dblclick', function() {
                removeCourseFromSchedule(subject, courseCode, sectionNumber, day);
            });
            
            cell.style.position = 'relative';
            cell.appendChild(courseBlock);
            
            courseBlock.classList.add('highlight-animation');
            setTimeout(() => {
                courseBlock.classList.remove('highlight-animation');
            }, 1500);
        }
        
        updateCreditCount();
        
        showNotification(`${courseKey} added to schedule.`, 'success');
    } catch (error) {
        console.error('Error adding course to schedule:', error);
        showNotification('Error adding course to schedule. Please try again.', 'error');
    }
}

function removeCourseFromSchedule(subject, courseCode, sectionNumber, day = null) {
    const courseKey = `${subject} ${courseCode}`;
    
    const confirmMessage = day 
        ? `Remove ${courseKey} on ${getDayName(day)} from your schedule?`
        : `Remove ${courseKey} from your schedule?`;
    
    if (confirm(confirmMessage)) {
        let removed = false;
        
        const courseBlocks = document.querySelectorAll('.course-block');
        courseBlocks.forEach(block => {
            const blockCourse = block.getAttribute('data-course');
            const blockSection = block.getAttribute('data-section');
            const blockDay = block.getAttribute('data-day');
            
            if (blockCourse === courseKey && 
                blockSection === sectionNumber && 
                (!day || blockDay === day)) {
                block.remove();
                removed = true;
            }
        });
        
        if (removed) {
            
            updateCreditCount();
            
            const remainingBlocks = document.querySelectorAll(`.course-block[data-course="${courseKey}"]`);
            if (remainingBlocks.length === 0 && window.courseColorMap) {
                
                console.log(`Clearing color mapping for ${courseKey} since all instances are removed`);
                delete window.courseColorMap[courseKey];
            }
            
            const dayText = day ? ` on ${getDayName(day)}` : '';
            showNotification(`${courseKey} removed from schedule${dayText}.`, 'info');
        }
    }
}

function updateCreditCount() {
    
    const courseBlocks = document.querySelectorAll('.course-block');
    
    const courseCredits = new Map();
    
    courseBlocks.forEach(block => {
        const course = block.getAttribute('data-course');
        const section = block.getAttribute('data-section');
        
        const courseKey = `${course}-${section}`;
        
        if (courseCredits.has(courseKey)) {
            return;
        }
        
        let credits = block.getAttribute('data-credits');
        
        if (credits) {
            
            credits = parseInt(credits, 10);
            
            if (isNaN(credits)) {
                credits = 3;
            }
        } else {
            
            credits = 3;
        }
        
        courseCredits.set(courseKey, credits);
    });
    
    let totalCredits = 0;
    courseCredits.forEach(credits => {
        totalCredits += credits;
    });
    
    const creditDisplay = document.querySelector('.credits-display');
    if (creditDisplay) {
        creditDisplay.textContent = `${totalCredits} Credits`;
        
        if (totalCredits > 18) {
            creditDisplay.style.color = '#dc3545'; 
        } else if (totalCredits >= 15) {
            creditDisplay.style.color = '#28a745'; 
        } else {
            creditDisplay.style.removeProperty('color'); 
        }
    }
    
    console.log(`Credit count updated: ${totalCredits} credits (${courseCredits.size} unique courses)`);
}

function findSectionByNumber(subject, courseCode, sectionNumber) {
    
    if (!window.sectionsData || !Array.isArray(window.sectionsData)) {
        console.error('No sections data available');
        return null;
    }
    
    const section = window.sectionsData.find(s => 
        s.subject === subject && 
        s.course_code === courseCode && 
        s.section_number === sectionNumber
    );
    
    if (!section) {
        console.log(`Section not found: ${subject} ${courseCode} ${sectionNumber}`);
        console.log('Available sections:', window.sectionsData);
    }
    
    return section;
}