
export { 
    createRegistrationSidebar, 
    openEventEditModal,
    addEventToScheduleGrid,
    convertTimeStringToDecimalHour,
    convertDecimalHourToTimeString
};

function createRegistrationSidebar() {
    console.log('Creating registration sidebar...');

    let sidebarTabs = document.querySelector('.sidebar-tabs');
    if (!sidebarTabs) {
        sidebarTabs = document.createElement('div');
        sidebarTabs.className = 'sidebar-tabs';

        const tabs = [
            { name: 'Course', id: 'Courses' },
            { name: 'Event', id: 'RecurringEvents' },
            { name: 'PreReq', id: 'PrereqSearch' },
            { name: 'Final', id: 'Finals' }
            
        ];

        tabs.forEach(tab => {
            const tabLink = document.createElement('a');
            tabLink.href = '#';
            tabLink.textContent = tab.name;
            tabLink.dataset.tab = tab.id;
            tabLink.addEventListener('click', function(e) {
                e.preventDefault();
                switchSidebarTab(tab.id);
            });
            sidebarTabs.appendChild(tabLink);
        });

        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.insertBefore(sidebarTabs, sidebar.firstChild);
        }
    }

    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
        console.error('Sidebar element not found');
        return;
    }

    const existingTabs = sidebar.querySelector('.sidebar-tabs');
    sidebar.innerHTML = '';
    if (existingTabs) {
        sidebar.appendChild(existingTabs);
    }

    sidebar.style.width = '350px';
    sidebar.style.minWidth = '350px';
    sidebar.style.maxWidth = '350px';

    const coursesTab = document.createElement('div');
    coursesTab.id = 'Courses';
    coursesTab.className = 'tab-content active';

    coursesTab.innerHTML = `
        <div class="search-form">

        <div class="form-group">
                <label for="subject-input">Subject</label>
                <input type="text" id="subject-input" placeholder="Subject" autocomplete="off">
        </div>

        <div class="form-group">
                <label for="course-code-input">Course Code</label>
                <input type="text" id="course-code-input" placeholder="Course code" autocomplete="off">
        </div>

            <div class="form-group">
                <label for="instructor-input">Instructor</label>
                <input type="text" id="instructor-input" placeholder="Instructor" autocomplete="off">
        </div>

            <button id="search-courses-btn" class="search-btn">
                <i class="fas fa-search"></i> Search Courses
            </button>
            <button id="next-semester-btn" class="next-semester-btn" style="width: 100%; margin-top: 15px; background-color: #142a50; height: 44px;">
                <i class="fas fa-search"></i> Next Semester
            </button>
        </div>

        <div id="sections-list" class="search-results">
            <div class="no-results">
                Enter search criteria above and click "Search Courses"
        </div>
        </div>
    `;

    sidebar.appendChild(coursesTab);

    addBackendStatusIndicator(coursesTab);

    setTimeout(() => {
        const nextSemesterButton = document.getElementById('next-semester-btn');
        if (nextSemesterButton) {
            nextSemesterButton.addEventListener('click', async function() {
                const userId = window.currentUserId || 1;
                const response = await fetch(`/user_bp/${userId}/next_semester_plan`);
                const plan = await response.json();

                let modal = document.getElementById('nextSemesterModal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'nextSemesterModal';
                    modal.className = 'modal';
                    modal.style.display = 'none';
                    modal.innerHTML = `
                      <div class="modal-content">
                        <span class="close" id="closeNextSemesterModal">&times;</span>
                        <h2>Recommended Courses for Next Semester</h2>
                        <div id="nextSemesterCourses"></div>
                      </div>`;
                    document.body.appendChild(modal);
                }

                let html = '<table style="width:100%;border-collapse:collapse;">';
                html += '<tr><th>Course</th><th>Credits</th><th>Type</th><th>Group</th></tr>';
                for (const item of plan) {
                    html += `<tr>
                        <td>${item.course_id}</td>
                        <td>${item.credits}</td>
                        <td>${item.type}</td>
                        <td>${item.group}</td>
                    </tr>`;
                }
                html += '</table>';

                document.getElementById('nextSemesterCourses').innerHTML = html;
                modal.style.display = 'block';

                document.getElementById('closeNextSemesterModal').onclick = function() {
                    modal.style.display = 'none';
                };
                window.onclick = function(event) {
                    if (event.target === modal) {
                        modal.style.display = 'none';
                    }
                };
            });
        }
    }, 150);

    setTimeout(() => {
        
        const searchBtn = document.getElementById('search-courses-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                console.log('Search button clicked');
                fetchCourses();
            });
        }

        const lowerDivBtn = document.querySelector('.division-btn');
        const upperDivBtn = document.querySelector('.division-btn');

        if (lowerDivBtn) {
            lowerDivBtn.addEventListener('click', function() {
                toggleDivisionButton(this, upperDivBtn);
            });
        }

        if (upperDivBtn) {
            upperDivBtn.addEventListener('click', function() {
                toggleDivisionButton(this, lowerDivBtn);
            });
        }

        const inputFields = coursesTab.querySelectorAll('input[type="text"]');
        inputFields.forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    searchBtn.click();
                }
            });
        });
    }, 100);

    const eventsTab = document.createElement('div');
    eventsTab.id = 'RecurringEvents';
    eventsTab.className = 'tab-content';

    eventsTab.innerHTML = `
        <div class="recurring-events-view">
            <div class="form-group">
                <input type="text"
                    id="event-name"
                    name="eventName"
                    placeholder="Event Name">
            </div>
            <div class="form-group">
                <div class="time-inputs">
                    <input type="time"
                        id="event-start-time"
                        name="eventStartTime"
                        placeholder="Start Time"
                        class="time-input">
                    <input type="time"
                        id="event-end-time"
                        name="eventEndTime"
                        placeholder="End Time"
                        class="time-input">
                </div>
            </div>
            <div class="form-group">
                <div class="day-selection">
                    <div class="weekday-buttons">
                        <button class="weekday-btn" data-day="M">M</button>
                        <button class="weekday-btn" data-day="T">T</button>
                        <button class="weekday-btn" data-day="W">W</button>
                        <button class="weekday-btn" data-day="R">R</button>
                        <button class="weekday-btn" data-day="F">F</button>
                    </div>
                </div>
            </div>
            <button class="add-event-btn">Add Event</button>
        </div>
    `;

    sidebar.appendChild(eventsTab);

    const prereqTab = document.createElement('div');
    prereqTab.id = 'PrereqSearch';
    prereqTab.className = 'tab-content';

    prereqTab.innerHTML = `
        <div class="prereq-search">
            <div class="form-group">
                <input type="text" id="prereq-search-input" placeholder="Course Code (e.g., CPSC 121)">
            </div>
            <button id="search-prereq-btn" class="search-btn">Show Prerequisite Tree</button>
        </div>
        <div id="prereq-results" class="prereq-results">
            <div class="prereq-info">
                Enter a course code above and click "Show Prerequisite Tree" to view prerequisites.
            </div>
        </div>
    `;

    sidebar.appendChild(prereqTab);

    const mapViewTab = document.createElement('div');
    mapViewTab.id = 'MapView';
    mapViewTab.className = 'tab-content';

    mapViewTab.innerHTML = `
        <h3>Campus Buildings</h3>
        <ul class="building-list">
            <li><a href="#" class="building-link" data-building="herak">Herak Center</a></li>
            <li><a href="#" class="building-link" data-building="jepson1">Jepson Center (First Floor)</a></li>
            <li><a href="#" class="building-link" data-building="jepsonB">Jepson Center (Basement)</a></li>
        </ul>
        <div class="map-placeholder">
            Select a building to view its floor plan
        </div>
    `;

    sidebar.appendChild(mapViewTab);

    switchSidebarTab('Courses');

    const registrationLink = document.querySelector('.nav-links a[href="#Registration"], .nav-links a[data-tab="Registration"]');
    if (registrationLink) {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        registrationLink.classList.add('active');
    }

    return true;
}

function generateTimeRows() {
    let rows = '';
    for (let hour = 8; hour <= 21; hour++) {
        const displayHour = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'pm' : 'am';
        rows += `
            <tr>
                <td class="time-column">${displayHour} ${ampm}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        `;
    }
    return rows;
}

function displaySections(sections) {
    const sectionsList = document.getElementById('sections-list');
    if (!sectionsList) return;

    if (!sections || sections.length === 0) {
        displayNoResults();
        return;
    }

    const courseGroups = {};

    const uniqueSectionIds = new Set();

    const uniqueSections = sections.filter(section => {
        
        const sectionId = `${section.subject}-${section.course_code}-${section.section_number}`;

        if (uniqueSectionIds.has(sectionId)) {
            return false;
        }

        uniqueSectionIds.add(sectionId);
        return true;
    });

    uniqueSections.forEach(section => {
        const courseKey = `${section.subject}-${section.course_code}`;
        if (!courseGroups[courseKey]) {
            courseGroups[courseKey] = [];
        }
        courseGroups[courseKey].push(section);
    });

    sectionsList.innerHTML = '';

    Object.entries(courseGroups).forEach(([courseKey, courseSections]) => {
        const [subject, courseCode] = courseKey.split('-');

        const courseItem = document.createElement('div');
        courseItem.className = 'course-item';

        const courseHeader = document.createElement('div');
        courseHeader.className = 'course-header';
        courseHeader.innerHTML = `
            <h3>${subject} ${courseCode}</h3>
            <div class="section-count">${courseSections.length} section${courseSections.length !== 1 ? 's' : ''}</div>
        `;
        courseItem.appendChild(courseHeader);

        const sectionList = document.createElement('div');
        sectionList.className = 'section-list';

        courseSections.forEach(section => {
            const sectionItem = document.createElement('div');
            sectionItem.className = 'section-item';

            sectionItem.innerHTML = `
                    <div class="section-header">
                        <h4>Section ${section.section_number}</h4>
                    </div>
                <p class="section-schedule"><strong>Schedule:</strong> ${section.schedule}</p>
                <p class="section-instructor"><strong>Instructor:</strong> ${section.instructor}</p>
                <p class="section-location"><strong>Location:</strong> ${section.location}</p>
                <p class="section-credits"><strong>Credits:</strong> ${section.credits}</p>
                    <div class="section-actions">
                        <button class="add-section-btn"
                        onclick="addSectionToSchedule('${section.subject}', '${section.course_code}', '${section.section_number}')">
                            Add to Schedule
                        </button>
                        <button class="search-prereq-btn"
                        onclick="displayPrerequisiteTree('${section.subject}${section.course_code}')">
                            View Prerequisites
                        </button>
                </div>
            `;
            sectionList.appendChild(sectionItem);
        });

        courseItem.appendChild(sectionList);
        sectionsList.appendChild(courseItem);
    });

    window.sectionsData = uniqueSections;
}

function getAvailabilityClass(section) {
    const ratio = section.seats_available / section.total_seats;
    if (section.seats_available === 0) return 'full';
    if (ratio < 0.2) return 'limited';
    return 'available';
}

function initializeRegistrationView() {
    console.log('Initializing Registration view directly');

    const result = createRegistrationSidebar();

    if (result) {
        const registrationView = document.getElementById('registration-view');
        if (registrationView) {
            registrationView.style.display = 'block';
            registrationView.classList.add('active');
        }
    }

    setTimeout(applyDirectAutocomplete, 500);

    ensureScheduleGridVisible();

    return result;
}

window.createRegistrationSidebar = createRegistrationSidebar;
window.displaySections = displaySections;
window.initializeRegistrationView = initializeRegistrationView;

document.addEventListener('DOMContentLoaded', function() {

    setTimeout(initializeRegistrationView, 10);

    setupSearchAutocomplete();

    ensureScheduleGridVisible();
    
    initializeEventEditModal();

    setTimeout(function() {
        setupWeekdayButtons();
    }, 500);

    setTimeout(function() {
        const searchPrereqBtn = document.getElementById('search-prereq-btn');
        if (searchPrereqBtn) {
            searchPrereqBtn.addEventListener('click', function() {
                const prereqInput = document.getElementById('prereq-search-input');
                if (prereqInput && prereqInput.value.trim()) {
                    import('./prereqService.js').then(module => {
                        if (typeof module.displayPrerequisiteTree === 'function') {
                            module.displayPrerequisiteTree(prereqInput.value.trim());
                        } else {
                            console.error('displayPrerequisiteTree function not found in prereqService module');
                        }
                    }).catch(error => {
                        console.error('Error importing prereqService:', error);
                    });
                } else {
                    alert('Please enter a valid course code (e.g., CPSC 121)');
                }
            });
        }
    }, 500);
});

function initializeEventEditModal() {
    const modal = document.getElementById('event-edit-modal');
    if (!modal) {
        console.warn('Event edit modal not found in the DOM');
        return;
    }
    
    console.log('Initializing event edit modal');
    
    const closeButton = modal.querySelector('.event-edit-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            modal.classList.remove('show');
        });
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    const colorOptions = modal.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('edit-event-color').value = this.dataset.color;
        });
    });
    
    const dayButtons = modal.querySelectorAll('.weekday-btn');
    dayButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            dayButtons.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

function setupSearchAutocomplete() {
    console.log('Setting up autocomplete for search inputs');

    let subjectInput = document.querySelector('#Courses input[placeholder="Subject"]');
    if (!subjectInput) {
        subjectInput = document.querySelector('#subject-input');
    }

    let courseCodeInput = document.querySelector('#Courses input[placeholder="Course code"]');
    if (!courseCodeInput) {
        courseCodeInput = document.querySelector('#course-code-input');
    }

    let instructorInput = document.querySelector('#Courses input[placeholder="Instructor"]');
    if (!instructorInput) {
        instructorInput = document.querySelector('#instructor-input');
    }

    console.log('Found inputs:', {
        subject: subjectInput,
        courseCode: courseCodeInput,
        instructor: instructorInput
    });

    const commonSubjects = [
        'ACCT', 'BIOL', 'BUSN', 'CHEM', 'COMM', 'CPSC',
        'ECON', 'ENGL', 'HIST', 'MATH', 'PHIL', 'PHYS',
        'POLS', 'PSYC', 'SOCI', 'SPAN', 'THEA'
    ];

    const commonCourseCodes = [
        '101', '102', '121', '122', '201', '202',
        '211', '221', '223', '260', '301', '302',
        '321', '322', '350', '401', '402', '421'
    ];

    const commonInstructors = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
        'Miller', 'Davis', 'Garcia', 'Wilson', 'Taylor',
        'Olivares', 'Anderson', 'Thomas', 'Jackson', 'White'
    ];

    if (subjectInput) {
        console.log('Setting up autocomplete for subject input');
        setupInputAutocomplete(subjectInput, commonSubjects);
    } else {
        
        setTimeout(() => {
            const delayedSubjectInput = document.querySelector('#Courses input[placeholder="Subject"]') ||
                                      document.querySelector('#subject-input');
            if (delayedSubjectInput) {
                console.log('Found subject input on delayed attempt');
                setupInputAutocomplete(delayedSubjectInput, commonSubjects);
            }
        }, 500);
    }

    if (courseCodeInput) {
        console.log('Setting up autocomplete for course code input');
        setupInputAutocomplete(courseCodeInput, commonCourseCodes);
    } else {
        setTimeout(() => {
            const delayedCourseCodeInput = document.querySelector('#Courses input[placeholder="Course code"]') ||
                                         document.querySelector('#course-code-input');
            if (delayedCourseCodeInput) {
                console.log('Found course code input on delayed attempt');
                setupInputAutocomplete(delayedCourseCodeInput, commonCourseCodes);
            }
        }, 500);
    }

    if (instructorInput) {
        console.log('Setting up autocomplete for instructor input');
        setupInputAutocomplete(instructorInput, commonInstructors);
    } else {
        setTimeout(() => {
            const delayedInstructorInput = document.querySelector('#Courses input[placeholder="Instructor"]') ||
                                         document.querySelector('#instructor-input');
            if (delayedInstructorInput) {
                console.log('Found instructor input on delayed attempt');
                setupInputAutocomplete(delayedInstructorInput, commonInstructors);
            }
        }, 500);
    }
}

function setupInputAutocomplete(inputElement, items) {
    console.log('Setting up autocomplete for', inputElement.placeholder || inputElement.id);

    if (inputElement.parentNode.classList.contains('autocomplete-container')) {
        console.log('Autocomplete already set up for this input');
        return;
    }

    const container = document.createElement('div');
    container.className = 'autocomplete-container';
    container.style.position = 'relative';
    container.style.width = '100%';

    container.dataset.autocomplete = 'active';

    inputElement.parentNode.insertBefore(container, inputElement);
    container.appendChild(inputElement);

    const autocompleteList = document.createElement('div');
    autocompleteList.className = 'autocomplete-list';
    autocompleteList.style.display = 'none';
    autocompleteList.style.position = 'absolute';
    autocompleteList.style.zIndex = '1000';
    autocompleteList.style.top = '100%';
    autocompleteList.style.left = '0';
    autocompleteList.style.right = '0';
    autocompleteList.style.maxHeight = '200px';
    autocompleteList.style.overflowY = 'auto';
    autocompleteList.style.backgroundColor = 'white';
    autocompleteList.style.border = '1px solid #4A90E2';
    autocompleteList.style.borderTop = 'none';
    autocompleteList.style.boxShadow = '0 6px 12px rgba(0,0,0,0.2)';

    container.appendChild(autocompleteList);

    let currentFocus = -1;

    inputElement.addEventListener('focus', function() {
        console.log('Input focused:', this.placeholder || this.id);

        showOptions(items.slice(0, 7));

        this.style.borderColor = '#4A90E2';
    });

    inputElement.addEventListener('input', function() {
        const value = this.value.trim();
        console.log('Input changed:', value);

        if (!value) {
            
            showOptions(items.slice(0, 7));
            return;
        }

        const matches = items.filter(item =>
            item.toLowerCase().includes(value.toLowerCase())
        );

        matches.sort((a, b) => {
            const aStartsWith = a.toLowerCase().startsWith(value.toLowerCase());
            const bStartsWith = b.toLowerCase().startsWith(value.toLowerCase());

            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            return a.localeCompare(b);
        });

        showOptions(matches.slice(0, 7), value);
    });

    function showOptions(options, highlightText = '') {
        console.log('Showing options:', options.length);

        autocompleteList.innerHTML = '';

        autocompleteList.style.display = 'block';

        if (options.length === 0) {
            const noMatch = document.createElement('div');
            noMatch.className = 'autocomplete-item';
            noMatch.style.padding = '12px 15px';
            noMatch.style.cursor = 'pointer';
            noMatch.style.borderBottom = '1px solid #f0f0f0';
            noMatch.textContent = 'No matches found';
            autocompleteList.appendChild(noMatch);
            return;
        }

        options.forEach(option => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.style.padding = '12px 15px';
            item.style.cursor = 'pointer';
            item.style.borderBottom = '1px solid #f0f0f0';

            if (highlightText) {
                const matchIndex = option.toLowerCase().indexOf(highlightText.toLowerCase());
                if (matchIndex !== -1) {
                    const before = option.substring(0, matchIndex);
                    const highlight = option.substring(matchIndex, matchIndex + highlightText.length);
                    const after = option.substring(matchIndex + highlightText.length);
                    item.innerHTML = before + '<strong style="color: #4A90E2; text-decoration: underline;">' + highlight + '</strong>' + after;
                } else {
                    item.textContent = option;
                }
            } else {
                item.textContent = option;
            }

            item.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#f0f7ff';
            });

            item.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });

            item.addEventListener('click', function() {
                console.log('Option selected:', option);
                inputElement.value = option;
                autocompleteList.style.display = 'none';

                if (inputElement.parentNode.parentNode.querySelector('button.search-btn')) {
                    setTimeout(() => {
                        console.log('Triggering search after selection');
                        fetchCourses();
                    }, 100);
                }
            });

            autocompleteList.appendChild(item);
        });
    }

    document.addEventListener('click', function(e) {
        if (e.target !== inputElement && !container.contains(e.target)) {
            autocompleteList.style.display = 'none';
        }
    });

    const searchButton = document.querySelector('#search-courses-btn');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            console.log('Search button clicked');
            
            document.querySelectorAll('.autocomplete-list').forEach(list => {
                list.style.display = 'none';
            });

            fetchCourses();
        });
    }
}

function createTabContentContainers() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    if (!document.getElementById('Courses')) {
        const coursesTab = document.createElement('div');
        coursesTab.id = 'Courses';
        coursesTab.className = 'tab-content';

        coursesTab.innerHTML = `
            <div class="search-form">
                <div class="form-group autocomplete-wrapper">
                    <label for="subject-input">Subject</label>
                    <input type="text" id="subject-input" placeholder="Subject">
                    <div class="autocomplete-dropdown" id="subject-dropdown"></div>
                </div>
                <div class="form-group autocomplete-wrapper">
                    <label for="course-code-input">Course Code</label>
                    <input type="text" id="course-code-input" placeholder="Course code">
                    <div class="autocomplete-dropdown" id="course-dropdown"></div>
                </div>
                <div class="form-group autocomplete-wrapper">
                    <label for="instructor-input">Instructor</label>
                    <input type="text" id="instructor-input" placeholder="Instructor">
                    <div class="autocomplete-dropdown" id="instructor-dropdown"></div>
                </div>
                <div class="level-buttons">
                    <button class="division-btn" data-level="lower">Lower Division</button>
                    <button class="division-btn" data-level="upper">Upper Division</button>
                    <button class="division-btn" data-level="graduate">Graduate</button>
                </div>
                <button id="search-courses-btn" class="search-btn">Search Courses</button>
                <button id="next-semester-btn" class="next-semester-btn" style="width: 100%;">Next Semester</button>
            </div>
            <div id="sections-list"></div>
        `;

        sidebar.appendChild(coursesTab);

        setTimeout(() => {
            applyDirectAutocomplete();
        }, 100);
    }

    if (!document.getElementById('RecurringEvents')) {
        const eventsTab = document.createElement('div');
        eventsTab.id = 'RecurringEvents';
        eventsTab.className = 'tab-content';

        eventsTab.innerHTML = `
            <div class="recurring-events-view">
                <div class="form-group">
                    <input type="text" placeholder="Event Name">
                </div>
                <div class="form-group">
                    <div class="time-inputs">
                        <input type="time" placeholder="Start Time" class="time-input">
                        <input type="time" placeholder="End Time" class="time-input">
                    </div>
                </div>
                <div class="form-group">
                    <div class="day-selection">
                        <div class="weekday-buttons">
                            <button class="weekday-btn" data-day="M">M</button>
                            <button class="weekday-btn" data-day="T">T</button>
                            <button class="weekday-btn" data-day="W">W</button>
                            <button class="weekday-btn" data-day="R">R</button>
                            <button class="weekday-btn" data-day="F">F</button>
                        </div>
                    </div>
                </div>
                <button class="add-event-btn">Add Event</button>
            </div>
        `;

        sidebar.appendChild(eventsTab);
    }

    if (!document.getElementById('PrereqSearch')) {
        const prereqTab = document.createElement('div');
        prereqTab.id = 'PrereqSearch';
        prereqTab.className = 'tab-content';

        prereqTab.innerHTML = `
            <div class="prereq-search">
                <div class="form-group">
                    <input type="text" id="prereq-search-input" placeholder="Course Code (e.g., CPSC 121)">
                </div>
                <button id="search-prereq-btn" class="search-btn">Search Prerequisites</button>
            </div>
            <div id="prereq-results" class="prereq-results">
                <div class="prereq-info">
                    Enter a course code above and click "Show Prerequisite Tree" to view prerequisites.
                </div>
            </div>
        `;

        sidebar.appendChild(prereqTab);
    }
}

function switchSidebarTab(tabId) {
    
    document.querySelectorAll('.sidebar-tabs a').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.sidebar .tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    const selectedTab = document.querySelector(`.sidebar-tabs a[data-tab="${tabId}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    const tabContent = document.getElementById(tabId);
    if (tabContent) {
        tabContent.classList.add('active');
        tabContent.style.display = 'block';
        
        if (tabId === 'RecurringEvents') {
            setTimeout(setupWeekdayButtons, 10);
        }
    }
}

function fetchCourses() {
    console.log('Fetching courses...');
    const subjectInput = document.querySelector('#Courses input[placeholder="Subject"]');
    const courseCodeInput = document.querySelector('#Courses input[placeholder="Course code"]');
    const instructorInput = document.querySelector('#Courses input[placeholder="Instructor"]');

    const criteria = {};
    if (subjectInput && subjectInput.value.trim()) {
        criteria.subject = subjectInput.value.trim().toUpperCase();
    }
    if (courseCodeInput && courseCodeInput.value.trim()) {
        criteria.course_code = courseCodeInput.value.trim();
    }
    if (instructorInput && instructorInput.value.trim()) {
        criteria.instructor = instructorInput.value.trim();
    }

    const sectionsList = document.getElementById('sections-list');
    if (sectionsList) {
        sectionsList.innerHTML = '<div class="loading-indicator"><div class="spinner"></div><p>Loading courses...</p></div>';
    }

    checkBackendConnection()
        .then(result => {
            if (result.connected) {
                
                fetchSectionsFromBackend(criteria)
                    .then(sections => {
                        displaySections(sections);
                    })
                    .catch(error => {
                        console.error('Error fetching sections:', error);
                        fallbackToMockData(criteria);
                    });
            } else {
                
                console.log('Backend unavailable, using mock data');
                fallbackToMockData(criteria);
            }
        });
}

function fetchSectionsFromBackend(criteria) {
    
    const queryParams = new URLSearchParams();
    if (criteria.subject) queryParams.append('subject', criteria.subject);
    if (criteria.course_code) queryParams.append('course_code', criteria.course_code);
    if (criteria.instructor) queryParams.append('instructor', criteria.instructor);

    const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001' : '';
    const url = `${apiBase}/sections_bp/search?${queryParams.toString()}`;
    console.log('Fetching from:', url);

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched sections:', data);
            return data.data || [];
        });
}

function fallbackToMockData(criteria) {
    console.log('Falling back to mock data with criteria:', criteria);
    
    if (typeof generateMockSections === 'function') {
        const mockSections = generateMockSections(criteria);
        displaySections(mockSections);

        if (typeof showNotification === 'function') {
            showNotification('Using sample course data (backend unavailable)', 'info');
        }
            } else {
        
        import('./mockdata.js')
            .then(module => {
                if (typeof module.generateMockSections === 'function') {
                    const mockSections = module.generateMockSections(criteria);
                    displaySections(mockSections);

                    if (typeof showNotification === 'function') {
                        showNotification('Using sample course data (backend unavailable)', 'info');
                    }
                } else {
                    displayConnectionError();
            }
        })
        .catch(error => {
                console.error('Error loading mock data:', error);
                displayConnectionError();
        });
    }
}

function displayConnectionError() {
    const sectionsList = document.getElementById('sections-list');
    if (sectionsList) {
        sectionsList.innerHTML = `
            <div class="No courses found">
                <p>No courses offered found</p>

            </div>
        `;

        document.getElementById('try-sample-data')?.addEventListener('click', () => {
            const criteria = {};
            
            const subjectInput = document.querySelector('#Courses input[placeholder="Subject"]');
            if (subjectInput && subjectInput.value.trim()) {
                criteria.subject = subjectInput.value.trim().toUpperCase();
            }

            fallbackToMockData(criteria);
        });
    }
}

window.fetchCourses = fetchCourses;

function addSectionToSchedule(subject, courseCode, sectionNumber) {
    console.log(`Adding ${subject} ${courseCode} section ${sectionNumber} to schedule`);

    const sections = window.sectionsData || [];
    const section = sections.find(s =>
        s.subject === subject &&
        s.course_code === courseCode &&
        s.section_number === sectionNumber
    );

    if (!section) {
        console.error('Section not found in data');
        alert('Error: Could not find section details');
        return;
    }

    const scheduleInfo = parseSchedule(section.schedule);
    if (!scheduleInfo) {
        console.error('Could not parse schedule:', section.schedule);
        alert('Error: Could not parse schedule information');
        return;
    }

    scheduleInfo.days.forEach(day => {
        addCourseToScheduleGrid(subject, courseCode, sectionNumber, day, scheduleInfo.startHour, scheduleInfo.endHour, section);
    });

    alert(`Added ${subject} ${courseCode} section ${sectionNumber} to your schedule`);
}

function parseSchedule(scheduleStr) {
    try {
        
        const [daysStr, timeStr] = scheduleStr.split(' ');
        if (!daysStr || !timeStr) return null;

        const days = [];
        for (let i = 0; i < daysStr.length; i++) {
            if (daysStr[i] === 'T' && daysStr[i + 1] === 'R') {
                
                days.push('T');
                days.push('R');
                i++; 
            } else {
                days.push(daysStr[i]);
            }
        }

        const times = timeStr.split(/\s*-\s*/);
        if (times.length !== 2) return null;

        const startTime = times[0].match(/(\d+):(\d+)([AP]M)/i);
        const endTime = times[1].match(/(\d+):(\d+)([AP]M)/i);

        if (!startTime || !endTime) return null;

        const startHour = parseTimeToDecimal(startTime[0]);
        const endHour = parseTimeToDecimal(endTime[0]);

        return { days, startHour, endHour };
    } catch (error) {
        console.error('Error parsing schedule:', error);
        return null;
    }
}

function parseTimeToDecimal(timeStr) {
    try {
        
        const parts = timeStr.match(/(\d+):(\d+)\s*([AP]M)/i);
        if (!parts) return null;

        let hours = parseInt(parts[1]);
        const minutes = parseInt(parts[2]);
        const isPM = parts[3].toUpperCase() === 'PM';

        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;

        return hours + (minutes / 60);
    } catch (error) {
        console.error('Error parsing time:', error);
        return null;
    }
}

function addCourseToScheduleGrid(subject, courseCode, sectionNumber, day, startHour, endHour, section) {
    
    const dayMap = { 'M': 1, 'T': 2, 'W': 3, 'R': 4, 'F': 5 };
    const colIndex = dayMap[day];

    if (!colIndex) {
        console.error('Invalid day:', day);
        return;
    }

    const rowIndex = Math.floor((startHour - 8) + 2);
    const durationHours = endHour - startHour;

    const scheduleTable = document.querySelector('.schedule-grid table');
    if (!scheduleTable) {
        console.error('Schedule table not found');
        return;
    }

    const cell = scheduleTable.rows[rowIndex]?.cells[colIndex];
    if (!cell) {
        console.error('Cell not found at row', rowIndex, 'col', colIndex);
        return;
    }

    cell.style.position = 'relative';

    const courseBlock = document.createElement('div');
    courseBlock.className = 'course-block';

    const courseColor = getRandomCourseColor(`${subject}${courseCode}`);

    const topOffset = (startHour % 1) * 60; 
    const heightPx = durationHours * 60; 

    courseBlock.style.cssText = `
        position: absolute;
        background-color: ${courseColor};
        color: white;
        width: 100%;
        left: 0;
        padding: 8px;
        border-radius: 4px;
        box-sizing: border-box;
        overflow: hidden;
        z-index: 1;
        top: ${topOffset}px;
        height: ${heightPx}px;
        display: flex;
        flex-direction: column;
        justify-content: center;
    `;

    courseBlock.innerHTML = `
        <div class="event-name" style="font-size: 18px; font-weight: bold; margin-bottom: 4px; text-align: center;">${subject} ${courseCode}</div>
        <div class="event-time" style="font-size: 12px; text-align: center;">${formatTimeForDisplay(startHour)} - ${formatTimeForDisplay(endHour)}</div>
    `;

    courseBlock.dataset.subject = subject;
    courseBlock.dataset.courseCode = courseCode;
    courseBlock.dataset.sectionNumber = sectionNumber;
    courseBlock.dataset.day = day;

    cell.appendChild(courseBlock);

    import('./eventListeners.js').then(module => {
        if (typeof module.addEventBlockListeners === 'function') {
            module.addEventBlockListeners(courseBlock);
        }
    });
}

function formatTimeForDisplay(decimalHour) {
    const hours = Math.floor(decimalHour);
    const minutes = Math.floor((decimalHour - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function getRandomCourseColor(courseCode) {
    
    let hash = 0;
    for (let i = 0; i < courseCode.length; i++) {
        hash = courseCode.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 45%)`;
}

window.addSectionToSchedule = addSectionToSchedule;
window.displayPrerequisiteTree = function(courseCode) {
    
    import('./prereqService.js').then(module => {
        if (typeof module.displayPrerequisiteTree === 'function') {
            module.displayPrerequisiteTree(courseCode);
        } else {
            console.error('displayPrerequisiteTree function not found in prereqService module');
        }
    }).catch(error => {
        console.error('Error importing prereqService:', error);
        alert('Error loading prerequisite service. Please try again.');
    });
};

function toggleDivisionButton(clickedButton, otherButton) {
    
    clickedButton.classList.toggle('selected');

    if (clickedButton.classList.contains('selected')) {
        clickedButton.style.backgroundColor = '#142A50';
        clickedButton.style.color = 'white';
        clickedButton.style.borderColor = '#142A50';

        if (otherButton && otherButton.classList.contains('selected')) {
            otherButton.classList.remove('selected');
            otherButton.style.backgroundColor = '';
            otherButton.style.color = '';
            otherButton.style.borderColor = '';
        }
    } else {
        
        clickedButton.style.backgroundColor = '';
        clickedButton.style.color = '';
        clickedButton.style.borderColor = '';
    }
}

function checkBackendConnection() {
    console.log('Checking backend connection status...');

    const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001' : '';
    return fetch(`${apiBase}/user_bp/login`, {
        method: 'OPTIONS', 
        cache: 'no-cache'
    })
    .then(response => {
        console.log('Backend connection response:', response.status);
        
        return { connected: true };
    })
    .catch(error => {
        console.error('Backend connection error:', error);
        return { connected: false, error: error };
    });
}

function addBackendStatusIndicator(coursesTab) {
    if (!coursesTab) return;

    const statusContainer = document.createElement('div');
    statusContainer.className = 'backend-status';
    statusContainer.innerHTML = `
        <span class="status-label">Backend Status:</span>
        <span id="backend-status" class="status-connecting">Checking...</span>
    `;
    coursesTab.appendChild(statusContainer);

    checkBackendConnection()
        .then(result => {
    const statusElement = document.getElementById('backend-status');
    if (!statusElement) return;

            if (result.connected) {
                statusElement.textContent = 'Connected';
                statusElement.className = 'status-connected';
                console.log('Backend connection established');
            } else {
                statusElement.textContent = 'Disconnected (Using Sample Data)';
                statusElement.className = 'status-disconnected';
                console.log('Using sample data due to backend connection failure');

                const mockMessage = document.createElement('div');
                mockMessage.className = 'mock-data-notice';
                mockMessage.innerHTML = `
                    <p>The application is running with sample data. Course registration features will be limited.</p>
                    <button id="refresh-connection" class="btn">Refresh Connection</button>
                `;
                coursesTab.appendChild(mockMessage);

                document.getElementById('refresh-connection')?.addEventListener('click', () => {
                    statusElement.textContent = 'Reconnecting...';
                    statusElement.className = 'status-connecting';
                    mockMessage.style.display = 'none';

                    checkBackendConnection()
                        .then(newResult => {
                            if (newResult.connected) {
                statusElement.textContent = 'Connected';
                                statusElement.className = 'status-connected';
                                
                                if (typeof showNotification === 'function') {
                                    showNotification('Successfully connected to the backend server', 'success');
                                }
            } else {
                                statusElement.textContent = 'Disconnected (Using Sample Data)';
                                statusElement.className = 'status-disconnected';
                                mockMessage.style.display = 'block';
                                
                                if (typeof showNotification === 'function') {
                                    showNotification('Still unable to connect to the backend. Using sample data.', 'error');
                                }
                            }
                        });
                });
            }
        });
}

function applyDirectAutocomplete() {
    console.log("Applying direct autocomplete to search inputs");

    const subjects = ["ACCT", "ADMN", "AERO", "AMST", "ANTH", "AORT", "ARAB", "ARTA", "ASTR", "BADM", "BIOE", "BIOL", "BLOC", "BMIS", "BMM", "BRCT", "BUSN", "CATH", "CHEM", "CHIN", "CLAS", "CMCN", "COGS", "COML", "COMM", "COSC", "CPSC", "CRJS", "CSCI", "DANC", "DAUS", "DATA", "DEBG", "ECON", "EDCE", "EDDI", "EDEL", "EDPE", "EDSP", "EDTE", "EDUC", "EECE", "EGNR", "ELED", "ELTD", "ENGL", "ENVS", "ETHN", "ETRM", "EURO", "EXSC", "FACE", "FILM", "FINA", "FREN", "GEOG", "GEOL", "GERM", "GLOB", "GNBH", "GREK", "GRGC", "GUWC", "HEAL", "HIST", "HONS", "HPHY", "HRMT", "IBUS", "INST", "INTE", "IRPS", "ITAL", "ITEC", "JAPN", "JOUR", "KORN", "LACE", "LATN", "LAW", "LBUS", "LIBR", "LSCI", "MAIC", "MATH", "MBA", "METL", "MFAT", "MFIN", "MGMT", "MILS", "MKTG", "MSBA", "MSCR", "MSIN", "MTAX", "MUSC", "NTAS", "NURS", "OPER", "PJMN", "PHIL", "PHYS", "POLS", "PRLS", "PSYC", "RELI", "SOCI", "SPAN", "SPED", "SPMT", "THEA", "UNIV", "WGST"];
    const courses = ["100", "101", "102", "110", "121", "122", "200", "201", "202", "211", "212", "221", "223", "224", "260", "300", "301", "302", "310", "311", "312", "320", "321", "322", "323", "324", "325", "330", "331", "332", "340", "341", "342", "350", "351", "352", "360", "361", "362", "400", "401", "402", "410", "411", "412", "420", "421", "422", "430", "431", "432", "440", "441", "442", "450", "451", "452", "460", "461", "462", "470", "471", "472", "480", "481", "482", "490", "491", "492", "499"];
    const instructors = ["Smith, John", "Johnson, Sarah", "Robert Johnson", "Emily Davis", "Michael Brown"];

    injectAutocompleteStyles();

    const subjectInput = document.querySelector('#Courses input[placeholder="Subject"]');
    const courseInput = document.querySelector('#Courses input[placeholder="Course code"]');
    const instructorInput = document.querySelector('#Courses input[placeholder="Instructor"]');

    console.log("Found inputs:", {
        subject: subjectInput,
        course: courseInput,
        instructor: instructorInput
    });

    if (subjectInput) {
        createDirectDropdown(subjectInput, 'subject-dropdown', subjects);
    }

    if (courseInput) {
        createDirectDropdown(courseInput, 'course-dropdown', courses);
    }

    if (instructorInput) {
        createDirectDropdown(instructorInput, 'instructor-dropdown', instructors);
    }
}

function createDirectDropdown(inputElement, dropdownId, items) {
    console.log(`Creating dropdown ${dropdownId} for`, inputElement);

    const parentElement = inputElement.parentElement;
    if (!parentElement) return;

    parentElement.style.position = 'relative';

    let dropdown = document.getElementById(dropdownId);
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = dropdownId;
        dropdown.className = 'autocomplete-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: white;
            border: 2px solid #4A90E2;
            border-radius: 0 0 4px 4px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 9999;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;
        parentElement.appendChild(dropdown);
    }

    inputElement.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        updateDropdown(dropdown, items, value);
    });

    inputElement.addEventListener('focus', function() {
        dropdown.style.display = 'block';
        updateDropdown(dropdown, items, this.value.toLowerCase());
    });

    document.addEventListener('click', function(event) {
        if (!inputElement.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });

    inputElement.addEventListener('keydown', function(e) {
        handleKeyboardNavigation(e, dropdown, inputElement);
    });
}

function updateDropdown(dropdown, items, query) {
    
    dropdown.innerHTML = '';

    const filteredItems = query
        ? items.filter(item => item.toLowerCase().includes(query))
        : items;

    if (filteredItems.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'autocomplete-item no-results';
        noResults.textContent = 'No matching items found';
        dropdown.appendChild(noResults);
        dropdown.style.display = 'block';
        return;
    }

    filteredItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'autocomplete-item';

        const itemText = item;
        const index = itemText.toLowerCase().indexOf(query);

        if (query && index !== -1) {
            const before = itemText.substring(0, index);
            const match = itemText.substring(index, index + query.length);
            const after = itemText.substring(index + query.length);

            itemElement.innerHTML = `${before}<strong style="color: #4A90E2; text-decoration: underline;">${match}</strong>${after}`;
            } else {
            itemElement.textContent = itemText;
        }

        itemElement.style.cssText = `
            padding: 10px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        `;

        itemElement.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#f5f9ff';
        });

        itemElement.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'white';
        });

        itemElement.addEventListener('click', function() {
            dropdown.style.display = 'none';
            inputElement.value = item;
        });

        dropdown.appendChild(itemElement);
    });

    dropdown.style.display = 'block';
}

function handleKeyboardNavigation(event, dropdown, inputElement) {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    const selected = dropdown.querySelector('.selected');
    let index = -1;

    if (selected) {
        for (let i = 0; i < items.length; i++) {
            if (items[i] === selected) {
                index = i;
                break;
            }
        }
    }

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            if (dropdown.style.display === 'none') {
                dropdown.style.display = 'block';
                updateDropdown(dropdown, items, inputElement.value.toLowerCase());
            } else {
                if (index < items.length - 1) {
                    if (selected) selected.classList.remove('selected');
                    items[index + 1].classList.add('selected');
                    items[index + 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
            break;

        case 'ArrowUp':
            event.preventDefault();
            if (index > 0) {
                if (selected) selected.classList.remove('selected');
                items[index - 1].classList.add('selected');
                items[index - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            break;

        case 'Enter':
            if (selected) {
                event.preventDefault();
                inputElement.value = selected.textContent;
                dropdown.style.display = 'none';
            }
            break;

        case 'Escape':
            dropdown.style.display = 'none';
            break;
    }
}

function injectAutocompleteStyles() {
    const styleId = 'autocomplete-direct-styles';

    if (!document.getElementById(styleId)) {
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = `
            .autocomplete-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background-color: white;
                border: 2px solid #4A90E2;
                border-radius: 0 0 4px 4px;
                max-height: 200px;
                overflow-y: auto;
                z-index: 9999;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }

            .autocomplete-item {
                padding: 10px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
            }

            .autocomplete-item:hover,
            .autocomplete-item.selected {
                background-color: #f5f9ff;
            }

            .autocomplete-item:last-child {
                border-bottom: none;
            }

            .autocomplete-item.no-results {
                padding: 10px;
                text-align: center;
                color: #666;
                font-style: italic;
            }

            body.dark-mode .autocomplete-dropdown {
                background-color: #2c3e50;
                border-color: #4A90E2;
            }

            body.dark-mode .autocomplete-item {
                border-bottom-color: #3a4a5c;
                color: #e0e0e0;
            }

            body.dark-mode .autocomplete-item:hover,
            body.dark-mode .autocomplete-item.selected {
                background-color: #3a4a5c;
            }

            body.dark-mode .autocomplete-item.no-results {
                color: #aaa;
            }

            .form-group {
                position: relative;
            }
        `;

        document.head.appendChild(styleElement);
        console.log("Injected autocomplete styles");
    }
}

function initializeFormHandlers() {
  
  const subjectInput    = document.getElementById('subject-input');
  const courseCodeInput = document.getElementById('course-code-input');
  const instructorInput = document.getElementById('instructor-input');
  const searchButton    = document.getElementById('search-courses-btn');

  const [undergradBtn, gradBtn] = document.querySelectorAll('.division-btn');
  let currentDivision = 'undergrad';

  const addEventButton = document.querySelector('#RecurringEvents .add-event-btn');
  const eventNameInput = document.querySelector('#RecurringEvents input[placeholder="Event Name"]');
  const [startTimeInput, endTimeInput] =
    document.querySelectorAll('#RecurringEvents input[type="time"]');
  const dayButtons = document.querySelectorAll('#RecurringEvents .weekday-btn');
  let selectedDays = [];

  undergradBtn.addEventListener('click', () => {
    undergradBtn.classList.add('active');
    gradBtn.classList.remove('active');
    currentDivision = 'undergrad';
  });

  gradBtn.addEventListener('click', () => {
    gradBtn.classList.add('active');
    undergradBtn.classList.remove('active');
    currentDivision = 'grad';
  });

  dayButtons.forEach(btn => btn.addEventListener('click', () => {
    btn.classList.toggle('selected');
    const day = btn.dataset.day;
    if (btn.classList.contains('selected')) selectedDays.push(day);
    else selectedDays = selectedDays.filter(d => d !== day);
  }));

  searchButton.addEventListener('click', () => {
    searchCourses({
      subject:    subjectInput.value,
      courseCode: courseCodeInput.value,
      instructor: instructorInput.value,
      division:   currentDivision,
      days:       selectedDays
    });
  });

  addEventButton.addEventListener('click', () => {
    const data = {
      name:      eventNameInput.value,
      startTime: startTimeInput.value,
      endTime:   endTimeInput.value,
      days:      selectedDays
    };
    if (validateEventData(data)) {
      addPersonalEvent(data);
      clearEventForm();
    } else {
      showNotification('Please fill in all event fields and select at least one day', 'error');
    }
  });
}
document.addEventListener('DOMContentLoaded', () => {
  createRegistrationSidebar();
  initializeFormHandlers();
});

function initializeAutocomplete(inputElement, dataFetchFunction) {
    let dropdown;
    let currentFocus = -1;

    const createDropdown = () => {
        
        if (dropdown) dropdown.remove();

        dropdown = document.createElement('div');
        dropdown.classList.add('autocomplete-dropdown');
        inputElement.parentNode.appendChild(dropdown);
    };

    const updateDropdown = (items) => {
        dropdown.innerHTML = '';

        if (items.length === 0) {
            const noResults = document.createElement('div');
            noResults.classList.add('no-results');
            noResults.textContent = 'No matches found';
            dropdown.appendChild(noResults);
        } else {
            items.forEach((item, index) => {
                const element = document.createElement('div');
                element.classList.add('autocomplete-item');
                element.textContent = item;

                element.addEventListener('click', () => {
                    inputElement.value = item;
                    closeDropdown();
                });

                dropdown.appendChild(element);
            });
        }

        dropdown.classList.add('show');
    };

    const closeDropdown = () => {
        if (dropdown) {
            dropdown.classList.remove('show');
            currentFocus = -1;
        }
    };

    inputElement.addEventListener('input', () => {
        const value = inputElement.value.trim();

        if (value.length === 0) {
            closeDropdown();
            return;
        }

        createDropdown();
        const matchingItems = dataFetchFunction(value);
        updateDropdown(matchingItems);
    });

    inputElement.addEventListener('keydown', (e) => {
        if (!dropdown || !dropdown.classList.contains('show')) return;

        const items = dropdown.querySelectorAll('.autocomplete-item');

        if (e.key === 'ArrowDown') {
            currentFocus++;
            if (currentFocus >= items.length) currentFocus = 0;
            setActive(items);
            e.preventDefault();
        }
        
        else if (e.key === 'ArrowUp') {
            currentFocus--;
            if (currentFocus < 0) currentFocus = items.length - 1;
            setActive(items);
            e.preventDefault();
        }
        
        else if (e.key === 'Enter' && currentFocus > -1) {
            e.preventDefault();
            if (items[currentFocus]) {
                inputElement.value = items[currentFocus].textContent;
                closeDropdown();
            }
        }
        
        else if (e.key === 'Escape') {
            closeDropdown();
        }
    });

    const setActive = (items) => {
        items.forEach(item => item.classList.remove('selected'));
        if (currentFocus >= 0 && currentFocus < items.length) {
            items[currentFocus].classList.add('selected');
            items[currentFocus].scrollIntoView({ block: 'nearest' });
        }
    };

    document.addEventListener('click', (e) => {
        if (e.target !== inputElement) {
            closeDropdown();
        }
    });
}

function getSubjects(query) {
    const subjects = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];
    return subjects.filter(subject => subject.toLowerCase().includes(query.toLowerCase()));
}

function getInstructors(query) {
    const instructors = ['John Smith', 'Jane Doe', 'Robert Johnson', 'Emily Davis', 'Michael Brown'];
    return instructors.filter(instructor => instructor.toLowerCase().includes(query.toLowerCase()));
}

function searchCourses(params) {
    
    console.log('Searching courses with params:', params);

    const resultsContainer = document.querySelector('.search-results');

    if (!params.subject && !params.courseCode && !params.instructor) {
        resultsContainer.innerHTML = '<div class="no-results-message">Please enter search criteria</div>';
        return;
    }

    resultsContainer.innerHTML = `
        <div class="search-results-message">Found 3 courses matching your criteria</div>
        <div class="course-item" draggable="true">
            <div class="course-header">
                <h3>CPSC 110</h3>
                <span class="course-credits">4 credits</span>
            </div>
            <p class="course-title">Computation, Programs, and Programming</p>
            <div class="course-details">
                <span class="course-instructor">John Smith</span>
                <span class="course-time">MWF 10:00-11:00</span>
            </div>
        </div>
        <div class="course-item" draggable="true">
            <div class="course-header">
                <h3>CPSC 121</h3>
                <span class="course-credits">4 credits</span>
            </div>
            <p class="course-title">Models of Computation</p>
            <div class="course-details">
                <span class="course-instructor">Jane Doe</span>
                <span class="course-time">TTh 14:00-15:30</span>
            </div>
        </div>
        <div class="course-item" draggable="true">
            <div class="course-header">
                <h3>CPSC 210</h3>
                <span class="course-credits">4 credits</span>
            </div>
            <p class="course-title">Software Construction</p>
            <div class="course-details">
                <span class="course-instructor">Robert Johnson</span>
                <span class="course-time">MWF 13:00-14:00</span>
            </div>
                    </div>
                `;

    initializeDragAndDrop();
}

function validateEventData(eventData) {
    return eventData.name && eventData.startTime && eventData.endTime && eventData.days.length > 0;
}

function addPersonalEvent(eventData) {
    console.log('Adding personal event:', eventData);
    
    if (!eventData.name || !eventData.startTime || !eventData.endTime || !eventData.days || eventData.days.length === 0) {
        showNotification('All fields and at least one day must be selected', 'error');
        return false;
    }
    
    const startTimeParts = eventData.startTime.split(':');
    const endTimeParts = eventData.endTime.split(':');
    
    if (startTimeParts.length !== 2 || endTimeParts.length !== 2) {
        showNotification('Invalid time format', 'error');
        return false;
    }
    
    const startHour = parseInt(startTimeParts[0]) + (parseInt(startTimeParts[1]) / 60);
    const endHour = parseInt(endTimeParts[0]) + (parseInt(endTimeParts[1]) / 60);
    
    eventData.days.forEach(day => {
        addEventToScheduleGrid(eventData.name, day, startHour, endHour);
    });
    
    showNotification(`Added ${eventData.name} to your schedule`, 'success');
    return true;
}

function addEventToScheduleGrid(eventName, day, startHour, endHour, customColor = null) {
    
    const dayMap = { 'M': 1, 'T': 2, 'W': 3, 'R': 4, 'F': 5 };
    const colIndex = dayMap[day];

    if (!colIndex) {
        console.error('Invalid day:', day);
        return;
    }

    const rowIndex = Math.floor((startHour - 8) + 2);
    const durationHours = endHour - startHour;

    const scheduleTable = document.querySelector('.schedule-grid table');
    if (!scheduleTable) {
        console.error('Schedule table not found');
        return;
    }

    const cell = scheduleTable.rows[rowIndex]?.cells[colIndex];
    if (!cell) {
        console.error('Cell not found at row', rowIndex, 'col', colIndex);
        return;
    }

    cell.style.position = 'relative';

    const eventBlock = document.createElement('div');
    eventBlock.className = 'personal-event-block';

    const eventColor = customColor || getRandomEventColor(eventName);

    const topOffset = (startHour % 1) * 60; 
    const heightPx = durationHours * 60; 

    eventBlock.style.cssText = `
        position: absolute;
        background-color: ${eventColor};
        color: white;
        width: 100%;
        left: 0;
        padding: 8px;
        border-radius: 4px;
        box-sizing: border-box;
        overflow: hidden;
        z-index: 1;
        top: ${topOffset}px;
        height: ${heightPx}px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        cursor: pointer;
    `;

    const eventId = 'event_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    eventBlock.innerHTML = `
        <div class="event-name" style="font-size: 18px; font-weight: bold; margin-bottom: 4px; text-align: center;">${eventName}</div>
        <div class="event-time" style="font-size: 12px; text-align: center;">${formatTimeForDisplay(startHour)} - ${formatTimeForDisplay(endHour)}</div>
    `;

    eventBlock.dataset.eventId = eventId;
    eventBlock.dataset.eventName = eventName;
    eventBlock.dataset.day = day;
    eventBlock.dataset.startHour = startHour;
    eventBlock.dataset.endHour = endHour;
    eventBlock.dataset.color = eventColor;
    eventBlock.dataset.type = 'personal';

    eventBlock.addEventListener('click', function(e) {
        e.stopPropagation();
        openEventEditModal(eventBlock);
    });

    cell.appendChild(eventBlock);
    
    return eventId;
}

function openEventEditModal(eventBlock) {
    const modal = document.getElementById('event-edit-modal');
    if (!modal) {
        console.error('Event edit modal not found');
        return;
    }
    
    const eventId = eventBlock.dataset.eventId;
    const eventName = eventBlock.dataset.eventName;
    const day = eventBlock.dataset.day;
    const startHour = parseFloat(eventBlock.dataset.startHour);
    const endHour = parseFloat(eventBlock.dataset.endHour);
    const color = eventBlock.dataset.color;
    
    console.log('Opening edit modal for event:', {
        name: eventName,
        day: day,
        startHour: startHour,
        endHour: endHour,
        color: color
    });
    
    document.getElementById('edit-event-id').value = eventId;
    document.getElementById('edit-event-name').value = eventName;
    document.getElementById('edit-event-color').value = color;
    
    document.getElementById('edit-event-start').value = convertDecimalHourToTimeString(startHour);
    document.getElementById('edit-event-end').value = convertDecimalHourToTimeString(endHour);
    
    const dayButtons = modal.querySelectorAll('.event-edit-weekdays .weekday-btn');
    dayButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    const matchingDayButton = Array.from(dayButtons).find(btn => btn.dataset.day === day);
    if (matchingDayButton) {
        matchingDayButton.classList.add('selected');
    } else {
        console.warn('No matching day button found for day:', day);
    }
    
    const colorOptions = modal.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === color) {
            option.classList.add('selected');
        }
    });
    
    modal.classList.add('show');
    
    setupEventEditListeners(eventBlock);
}

function setupEventEditListeners(eventBlock) {
    const modal = document.getElementById('event-edit-modal');
    
    document.querySelector('.event-edit-close').onclick = function() {
        modal.classList.remove('show');
    };
    
    document.querySelector('.event-delete-btn').onclick = function() {
        
        if (eventBlock && eventBlock.parentNode) {
            eventBlock.parentNode.removeChild(eventBlock);
        }
        
        modal.classList.remove('show');
    };
    
    document.querySelectorAll('.event-edit-weekdays .weekday-btn').forEach(btn => {
        
        btn.onclick = function() {
            
            document.querySelectorAll('.event-edit-weekdays .weekday-btn').forEach(b => {
                b.classList.remove('selected');
            });
            
            this.classList.add('selected');
        };
    });
    
    document.querySelectorAll('.event-color-options .color-option').forEach(option => {
        option.onclick = function() {
            
            document.querySelectorAll('.event-color-options .color-option').forEach(o => {
                o.classList.remove('selected');
            });
            
            this.classList.add('selected');
            
            document.getElementById('edit-event-color').value = this.dataset.color;
        };
    });
    
    document.querySelector('.event-duplicate-btn').onclick = function() {
        const eventName = document.getElementById('edit-event-name').value;
        const startTime = document.getElementById('edit-event-start').value;
        const endTime = document.getElementById('edit-event-end').value;
        const day = document.querySelector('.event-edit-weekdays .weekday-btn.selected')?.dataset.day;
        const color = document.getElementById('edit-event-color').value;
        
        if (!eventName || !startTime || !endTime || !day) {
            alert('Please fill in all fields and select a day');
            return;
        }
        
        const startHour = convertTimeStringToDecimalHour(startTime);
        const endHour = convertTimeStringToDecimalHour(endTime);
        
        addEventToScheduleGrid(`${eventName} (Copy)`, day, startHour, endHour, color);
        
        modal.classList.remove('show');
    };
    
    document.getElementById('event-edit-form').onsubmit = function(e) {
        e.preventDefault();
        
        const eventName = document.getElementById('edit-event-name').value;
        const startTime = document.getElementById('edit-event-start').value;
        const endTime = document.getElementById('edit-event-end').value;
        const day = document.querySelector('.event-edit-weekdays .weekday-btn.selected')?.dataset.day;
        const color = document.getElementById('edit-event-color').value;
        
        if (!eventName || !startTime || !endTime || !day) {
            alert('Please fill in all fields and select a day');
            return;
        }
        
        const startHour = convertTimeStringToDecimalHour(startTime);
        const endHour = convertTimeStringToDecimalHour(endTime);
        
        if (day !== eventBlock.dataset.day) {
            
            addEventToScheduleGrid(eventName, day, startHour, endHour, color);
            
            if (eventBlock.parentNode) {
                eventBlock.parentNode.removeChild(eventBlock);
            }
        } else {
            
            eventBlock.dataset.eventName = eventName;
            eventBlock.dataset.startHour = startHour;
            eventBlock.dataset.endHour = endHour;
            eventBlock.dataset.color = color;
            
            const nameElem = eventBlock.querySelector('.event-name');
            const timeElem = eventBlock.querySelector('.event-time');
            
            if (nameElem) nameElem.textContent = eventName;
            if (timeElem) timeElem.textContent = `${formatTimeForDisplay(startHour)} - ${formatTimeForDisplay(endHour)}`;
            
            const topOffset = (startHour % 1) * 60;
            const heightPx = (endHour - startHour) * 60;
            
            eventBlock.style.backgroundColor = color;
            eventBlock.style.top = `${topOffset}px`;
            eventBlock.style.height = `${heightPx}px`;
        }
        
        modal.classList.remove('show');
    };
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    };
}

function convertDecimalHourToTimeString(decimalHour) {
    const hours = Math.floor(decimalHour);
    const minutes = Math.round((decimalHour - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function convertTimeStringToDecimalHour(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + (minutes / 60);
}

function getRandomEventColor(eventName) {
    
    let hash = 0;
    for (let i = 0; i < eventName.length; i++) {
        hash = eventName.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 120) + 20; 
    return `hsl(${hue}, 80%, 50%)`;
}

function clearEventForm() {
    document.getElementById('event-name').value = '';
    document.getElementById('event-start-time').value = '';
    document.getElementById('event-end-time').value = '';

    document.querySelectorAll('.day-button.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function initializeDragAndDrop() {
    const courseItems = document.querySelectorAll('.course-item');
    const scheduleGrid = document.querySelector('.schedule-grid');

    courseItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.innerHTML);
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
    });

    if (scheduleGrid) {
        scheduleGrid.addEventListener('dragover', (e) => {
            e.preventDefault();
            const cell = e.target.closest('.schedule-cell');
            if (cell) {
                cell.classList.add('drop-hover');
            }
        });

        scheduleGrid.addEventListener('dragleave', (e) => {
            const cell = e.target.closest('.schedule-cell');
            if (cell) {
                cell.classList.remove('drop-hover');
            }
        });

        scheduleGrid.addEventListener('drop', (e) => {
            e.preventDefault();
            const cell = e.target.closest('.schedule-cell');
            if (cell) {
                cell.classList.remove('drop-hover');
                const data = e.dataTransfer.getData('text/plain');

                const courseBlock = document.createElement('div');
                courseBlock.classList.add('course-block');
                courseBlock.innerHTML = data;

                cell.appendChild(courseBlock);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    createRegistrationSidebar();
    initializeFormHandlers();

    if (document.querySelector('.nav-links a[data-view="registration"].active')) {
        ensureScheduleGridVisible();
    }
});

function ensureScheduleGridVisible() {
    console.log('Ensuring schedule grid visibility');

    const registrationView = document.getElementById('registration-view');
    if (!registrationView) {
        console.error('Registration view not found');
        return;
    }

    let scheduleContainer = registrationView.querySelector('.schedule-container');

    if (scheduleContainer) {
        scheduleContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 600px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            margin-left: 15px;
            visibility: visible;
            opacity: 1;
        `;

        registrationView.style.cssText = `
            display: flex;
            width: 100%;
            height: 100%;
            padding: 15px;
        `;
    }
}

function createScheduleGrid() {
    console.log('Creating schedule grid...');

    const registrationView = document.getElementById('registration-view');
    if (!registrationView) {
        console.error('Registration view not found');
        return;
    }

    const existingContainer = document.querySelector('.schedule-container');
    if (existingContainer) {
        existingContainer.remove();
    }

    const scheduleContainer = document.createElement('div');
    scheduleContainer.className = 'schedule-container';

    const scheduleGrid = document.createElement('div');
    scheduleGrid.className = 'schedule-grid';

    const table = document.createElement('table');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const cornerCell = document.createElement('th');
    headerRow.appendChild(cornerCell);

    ['M', 'T', 'W', 'R', 'F'].forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (let hour = 8; hour <= 19; hour++) {
        const row = document.createElement('tr');

        const timeCell = document.createElement('td');
        timeCell.className = 'time-label';
        timeCell.textContent = `${hour}:00`;
        row.appendChild(timeCell);

        for (let i = 0; i < 5; i++) {
            const cell = document.createElement('td');
            cell.dataset.hour = hour;
            cell.dataset.day = ['M', 'T', 'W', 'R', 'F'][i];
            row.appendChild(cell);
        }

        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    scheduleGrid.appendChild(table);
    scheduleContainer.appendChild(scheduleGrid);

    const contentContainer = registrationView.querySelector('.content-container');
    if (contentContainer) {
        contentContainer.appendChild(scheduleContainer);
    } else {
        console.error('Content container not found');
    }

    return scheduleContainer;
}

window.ensureScheduleGridVisible = ensureScheduleGridVisible;
window.createScheduleGrid = createScheduleGrid;

window.testPrereqFunction = function() {
    console.log('Testing prerequisite tree function');
    
    const testCourseCode = 'CPSC 325';
    alert(`Testing prerequisite tree for ${testCourseCode}`);

    window.displayPrerequisiteTree(testCourseCode);
};

(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(ensureScheduleGridVisible, 0);
        });
    } else {
        setTimeout(ensureScheduleGridVisible, 0);
    }
})();

document.addEventListener('click', function(e) {
    if (e.target && (e.target.href === 'registration.html' || e.target.dataset.tab === 'Registration')) {
        setTimeout(ensureScheduleGridVisible, 0);
    }
});

document.addEventListener('click', function(e) {
    if (e.target && e.target.matches('.nav-links a[data-view="registration"]')) {
        setTimeout(ensureScheduleGridVisible, 0);
    }
});

function setupWeekdayButtons() {
    console.log('Setting up weekday buttons');
    const dayButtons = document.querySelectorAll('.weekday-btn');
    let selectedDays = [];

    dayButtons.forEach(btn => {
        
        const newBtn = btn.cloneNode(true);
        if (btn.parentNode) {
            btn.parentNode.replaceChild(newBtn, btn);
        }

        newBtn.addEventListener('click', function() {
            console.log('Weekday button clicked:', this.dataset.day);
            this.classList.toggle('selected');
            
            const day = this.dataset.day;
            if (this.classList.contains('selected')) {
                selectedDays.push(day);
            } else {
                selectedDays = selectedDays.filter(d => d !== day);
            }
            
            console.log('Selected days:', selectedDays);
        });
    });

    const addEventButton = document.querySelector('#RecurringEvents .add-event-btn');
    if (addEventButton) {
        const newAddBtn = addEventButton.cloneNode(true);
        if (addEventButton.parentNode) {
            addEventButton.parentNode.replaceChild(newAddBtn, addEventButton);
        }

        newAddBtn.addEventListener('click', function() {
            const eventNameInput = document.querySelector('#RecurringEvents input[placeholder="Event Name"]');
            const timeInputs = document.querySelectorAll('#RecurringEvents input[type="time"]');
            
            const data = {
                name: eventNameInput ? eventNameInput.value : '',
                startTime: timeInputs[0] ? timeInputs[0].value : '',
                endTime: timeInputs[1] ? timeInputs[1].value : '',
                days: selectedDays
            };

            if (validateEventData(data)) {
                addPersonalEvent(data);
                clearEventForm();
                selectedDays = [];
                document.querySelectorAll('.weekday-btn.selected').forEach(btn => {
                    btn.classList.remove('selected');
                });
            } else {
                showNotification('Please fill in all event fields and select at least one day', 'error');
            }
        });
    }
}