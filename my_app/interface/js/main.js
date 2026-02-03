import { addEventFromForm } from './schedule.js';
import { exportToCalendar } from './export.js';
import { addEventBlockListeners } from './eventListeners.js';
import { editEventOnSchedule } from './eventEditing.js';
import {
    initializeNavigation,
    initializeDropdowns,
    setupSidebarTabs,
    applyThemeToggle,
    configureDivisionButtons,
    setupUserDropdown
} from './navigation.js';

function initializeDefaultViews() {
    
    const registrationView = document.getElementById('registration-view');
    if (registrationView) {
        registrationView.style.display = 'block';
        registrationView.classList.add('active');
    }

    const coursesTab = document.querySelector('.sidebar-tabs a[data-tab="Courses"]');
    const coursesContent = document.getElementById('Courses');
    if (coursesTab && coursesContent) {
        coursesTab.classList.add('active');
        coursesContent.style.display = 'block';
        coursesContent.classList.add('active');
    }

    document.querySelectorAll('.tab-content').forEach(content => {
        if (content.id !== 'Courses') {
            content.style.display = 'none';
            content.classList.remove('active');
        }
    });

    const scheduleContainer = document.querySelector('.schedule-container');
    if (scheduleContainer) {
        scheduleContainer.style.display = 'flex';
    }

    const semesterButton = document.querySelector('.semester-button');
    if (semesterButton && !semesterButton.textContent.trim()) {
        semesterButton.innerHTML = 'Spring 2025 <span class="arrow">▼</span>';
    }
}

function initApp() {
    console.log('Initializing application...');

    const addEventBtn = document.querySelector('#add-event-button');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', addEventFromForm);
    }

    const exportBtn = document.querySelector('#export-button');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCalendar);
    }

    document.querySelectorAll('.event-block').forEach(block => {
        addEventBlockListeners(block);
    });

    setupTabChangeHandlers();

    import('./eventListeners.js').then(module => {
        if (typeof module.initializeEventListeners === 'function') {
            module.initializeEventListeners();
        }
    });

}

function forceSwitchToRegistration() {
    console.log('Forcing switch to Registration view...');

    document.querySelectorAll(".tab-content, .main-content-view").forEach(content => {
        if (content.id !== 'registration-view' && content.id !== 'Courses') {
            content.style.display = "none";
            content.classList.remove("active");
        }
    });

    if (typeof createRegistrationSidebar === 'function') {
        createRegistrationSidebar();
    }

    const registrationTab = document.querySelector('.nav-links a[href="#Registration"], .nav-links a[data-tab="Registration"]');
    if (registrationTab) {
        
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            link.style.color = '';
        });

        registrationTab.classList.add('active');
        registrationTab.style.color = '#142A50';

        if (typeof openTab === 'function') {
            openTab('Registration', { currentTarget: registrationTab });
        } else {
            
            document.querySelectorAll('.main-content-view').forEach(view => {
                if (view.id !== 'registration-view') {
                    view.style.display = 'none';
                    view.classList.remove('active');
                }
            });

            const registrationView = document.getElementById('registration-view');
            if (registrationView) {
                registrationView.classList.add('active');
                registrationView.style.display = 'block';
            }
        }
    }

    document.querySelector('.sidebar').style.display = 'block';

    initSidebarTabs();
}

document.addEventListener('DOMContentLoaded', initApp);
window.editEventOnSchedule = editEventOnSchedule;

import { initializeFinalsTab } from './finals.js';

document.addEventListener('DOMContentLoaded', function () {
    console.log('Main application initialization starting...');

    initializeNavigation();
    initializeDropdowns();
    setupSidebarTabs();
    applyThemeToggle();
    configureDivisionButtons();
    setupUserDropdown();

    initializeFinalsTab();

    initializeEventEditModal();
    
    if (typeof initThemeToggle === 'function') initThemeToggle();
    if (typeof checkBackendConnection === 'function') checkBackendConnection();

    setupTabChangeHandlers();

    const searchButton = document.querySelector('#Courses .search-btn');
    if (searchButton) {
        if (typeof fetchData === 'function') {
            searchButton.addEventListener('click', fetchData);
        } else {
            setTimeout(() => {
                if (typeof fetchData === 'function') {
                    searchButton.addEventListener('click', fetchData);
                } else {
                    searchButton.onclick = function () {
                        const criteria = {};
                        const subjectInput = document.querySelector('#Courses input[placeholder="Subject"]');
                        if (subjectInput && subjectInput.value.trim()) {
                            criteria.subject = subjectInput.value.trim().toUpperCase();
                        }
                        if (typeof generateMockSections === 'function') {
                            const mockData = generateMockSections(criteria);
                            if (typeof displaySections === 'function') {
                                displaySections(mockData);
                            }
                        } else {
                            alert('Search functionality requires the course.js script. Criteria: ' + JSON.stringify(criteria));
                        }
                    };
                }
            }, 1000);
        }
    }

    const addEventButton = document.querySelector('#RecurringEvents .search-btn');
    if (addEventButton && typeof addEventFromForm === 'function') {
        addEventButton.addEventListener('click', addEventFromForm);
    }

    document.querySelectorAll('#RecurringEvents .weekday-btn').forEach(button => {
        button.addEventListener('click', function () {
            this.classList.toggle('selected');
        });
    });

    const inputFields = document.querySelectorAll('#Courses input[type="text"]');
    inputFields.forEach(input => {
        input.addEventListener('keypress', function (event) {
            if (event.key === 'Enter' && typeof fetchData === 'function') fetchData();
        });
    });

    setTimeout(forceSwitchToRegistration, 300);

    console.log('Application initialized successfully');
});

function setupTabChangeHandlers() {
    
    const registrationTab = document.querySelector('.nav-links a[href="#Registration"], .nav-links a[data-tab="Registration"]');
    if (registrationTab) {
        registrationTab.addEventListener('click', function(e) {
            e.preventDefault();

            if (typeof openTab === 'function') {
                openTab('Registration', { currentTarget: this });
            }
        });
    }

}

function handleFinalsTabClick(tabButton) {
    
}

window.forceSwitchToRegistration = null;  
window.handleFinalsTabClick = null;  

function initSidebarTabs() {
    const sidebarTabs = document.querySelector('.sidebar-tabs');
    if (!sidebarTabs) {
        console.warn('Sidebar tabs container not found, creating it');
        createSidebarTabs();
    } else {
        
        sidebarTabs.style.display = 'flex';

        const courseTab = sidebarTabs.querySelector('a[data-tab="Courses"]');
        if (courseTab) {
            courseTab.classList.add('active');

            const courseContent = document.getElementById('Courses');
            if (courseContent) {
                document.querySelectorAll('.sidebar .tab-content').forEach(content => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                });
                courseContent.classList.add('active');
                courseContent.style.display = 'block';
            }
        }
    }
}

function createSidebarTabs() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'sidebar-tabs';

    const tabs = [
        { name: 'Courses', id: 'Courses' },
        { name: 'Events', id: 'RecurringEvents' },
        { name: 'PreReq', id: 'PrereqSearch' },
        { name: 'Finals', id: 'Finals' }
    ];

    tabs.forEach(tab => {
        const tabLink = document.createElement('a');
        tabLink.href = '#';
        tabLink.textContent = tab.name;
        tabLink.dataset.tab = tab.id;

        tabLink.addEventListener('click', function(e) {
            e.preventDefault();

            document.querySelectorAll('.sidebar-tabs a').forEach(t => {
                t.classList.remove('active');
            });

            this.classList.add('active');

            document.querySelectorAll('.sidebar .tab-content').forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });

            const tabContent = document.getElementById(tab.id);
            if (tabContent) {
                tabContent.classList.add('active');
                tabContent.style.display = 'block';

                if (tab.id === 'Finals') {
                    console.log('Initializing Finals tab from click handler in main.js');
                    
                    if (!document.getElementById('debug-finals-button')) {
                        const debugButton = document.createElement('button');
                        debugButton.id = 'debug-finals-button';
                        debugButton.textContent = 'Reinitialize Finals';
                        debugButton.style.position = 'fixed';
                        debugButton.style.bottom = '10px';
                        debugButton.style.right = '10px';
                        debugButton.style.zIndex = '9999';
                        debugButton.style.background = '#142A50';
                        debugButton.style.color = 'white';
                        debugButton.style.border = 'none';
                        debugButton.style.padding = '8px 12px';
                        debugButton.style.borderRadius = '4px';
                        debugButton.style.cursor = 'pointer';
                        debugButton.onclick = function() {
                            const finalsTab = document.getElementById('Finals');
                            if (finalsTab) {
                                console.log('Manually reinitializing Finals tab');
                                finalsTab.innerHTML = '';
                                import('./finals.js').then(module => {
                                    if (typeof module.initializeFinalsTab === 'function') {
                                        module.initializeFinalsTab();
                                    }
                                });
                            }
                        };
                        document.body.appendChild(debugButton);
                    }

                    import('./finals.js').then(module => {
                        if (typeof module.initializeFinalsTab === 'function') {
                            module.initializeFinalsTab();
                        }
                    });
                }
            } else {
                console.error(`Tab content element for ${tab.id} not found`);

                const newTabContent = document.createElement('div');
                newTabContent.id = tab.id;
                newTabContent.className = 'tab-content active';
                newTabContent.style.display = 'block';

                sidebar.appendChild(newTabContent);

                if (tab.id === 'Finals') {
                    console.log('Creating and initializing Finals tab');
                    import('./finals.js').then(module => {
                        if (typeof module.initializeFinalsTab === 'function') {
                            module.initializeFinalsTab();
                        }
                    });
                }
            }
        });

        tabsContainer.appendChild(tabLink);
    });

    sidebar.insertBefore(tabsContainer, sidebar.firstChild);

    tabs.forEach(tab => {
        if (!document.getElementById(tab.id)) {
            console.log(`Creating missing tab content container for ${tab.id}`);
            const newTabContent = document.createElement('div');
            newTabContent.id = tab.id;
            newTabContent.className = 'tab-content';
            newTabContent.style.display = 'none';
            sidebar.appendChild(newTabContent);
        }
    });

    const firstTab = tabsContainer.querySelector('a');
    if (firstTab) {
        firstTab.classList.add('active');

        const firstTabContent = document.getElementById(tabs[0].id);
        if (firstTabContent) {
            firstTabContent.classList.add('active');
            firstTabContent.style.display = 'block';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const addClassLink = document.getElementById('addClassLink');
    const addClassModal = document.getElementById('addClassModal');
    const addClassSubmit = document.getElementById('addClassSubmit');
    const addClassCancel = document.getElementById('addClassCancel');
    const addClassError = document.getElementById('addClassError');

    if (addClassLink && addClassModal) {
        addClassLink.addEventListener('click', function(e) {
            e.preventDefault();
            addClassModal.style.display = 'flex';
            addClassError.style.display = 'none';
            document.getElementById('addClassSubject').value = '';
            document.getElementById('addClassCode').value = '';
            document.getElementById('addClassSection').value = '';
            document.getElementById('addClassTerm').value = '';
            loadEnrolledCoursesTable(window.currentUserId || 1);
        });
    }
    if (addClassCancel && addClassModal) {
        addClassCancel.addEventListener('click', function() {
            addClassModal.style.display = 'none';
        });
    }
    if (addClassSubmit) {
        addClassSubmit.addEventListener('click', async function() {
            const subject = document.getElementById('addClassSubject').value.trim();
            const code = document.getElementById('addClassCode').value.trim();
            const section = document.getElementById('addClassSection').value.trim();
            const term = document.getElementById('addClassTerm').value.trim();
            addClassError.style.display = 'none';
            if (!subject || !code || !section || !term) {
                addClassError.textContent = 'Please fill in all fields.';
                addClassError.style.display = 'block';
                return;
            }
            
            const user_id = window.currentUserId || 1;
            const course_id = subject + ' ' + code;

            try {
                
                let response = await fetch('/user_bp/add_class', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id,
                        in_process: false,
                        course_id,
                        term,
                        section
                    })
                });

                let result = await response.json();

                if (result.error && result.error.includes("not found")) {
                    console.log("Exact section not found, looking for alternatives in the same term...");

                    const sectionsResponse = await fetch(`/sections_bp/search?course_id=${encodeURIComponent(course_id)}&term=${encodeURIComponent(term)}`);
                    const sectionsResult = await sectionsResponse.json();

                    if (sectionsResult && sectionsResult.data && sectionsResult.data.length > 0) {
                        
                        const altSection = sectionsResult.data[0].section_number;

                        if (confirm(`Section ${section} not found for ${course_id} in ${term}. Would you like to add section ${altSection} instead?`)) {
                            response = await fetch('/user_bp/add_class', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    user_id,
                                    in_process: false,
                                    course_id,
                                    term,
                                    section: altSection
                                })
                            });
                            result = await response.json();
                        }
                    } else {
                        
                        console.log("No sections found in same term, looking in other terms...");

                        const allTermsResponse = await fetch(`/sections_bp/search?course_id=${encodeURIComponent(course_id)}`);
                        const allTermsResult = await allTermsResponse.json();

                        if (allTermsResult && allTermsResult.data && allTermsResult.data.length > 0) {
                            
                            const sortedSections = allTermsResult.data.sort((a, b) => {
                                
                                return b.term.localeCompare(a.term);
                            });

                            const altTerm = sortedSections[0].term;
                            const altSection = sortedSections[0].section_number;

                            if (confirm(`No sections for ${course_id} found in ${term}. Would you like to add section ${altSection} from ${altTerm} instead?`)) {
                                response = await fetch('/user_bp/add_class', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        user_id,
                                        in_process: false,
                                        course_id,
                                        term: altTerm,
                                        section: altSection
                                    })
                                });
                                result = await response.json();
                            }
                        }
                    }
                }

                if (result.success) {
                    alert(result.success);
                    addClassModal.style.display = 'none';
                    
                    loadEnrolledCoursesTable(user_id);
                } else {
                    addClassError.textContent = result.error || 'Unknown error.';
                    addClassError.style.display = 'block';
                }
            } catch (err) {
                console.error("Error adding class:", err);

                if (confirm("Backend appears to be unavailable. Would you like to use mock data to demonstrate the fallback functionality?")) {
                    
                    if (course_id === "CPSC 260" && term === "FALL 2023") {
                        if (confirm(`Section ${section} not found for ${course_id} in ${term}. Would you like to add section 01 instead?`)) {
                            
                            alert(`Successfully added ${course_id} section 01 for ${term}`);
                            addClassModal.style.display = 'none';

                            const mockData = [
                                { course_id: "CPSC 121", section: "01", term: "Fall 2025" },
                                { course_id: "CPSC 122", section: "01", term: "Fall 2025" },
                                { course_id: course_id, section: "01", term: term }
                            ];

                            let html = '<table style="width:100%;border-collapse:collapse;background:#f8f9fa;"><tr style="background:#142A50;color:#fff;"><th style="padding:6px;">Course</th><th style="padding:6px;">Section</th><th style="padding:6px;">Term</th></tr>';
                            for (const s of mockData) {
                                html += `<tr style="text-align:center;">
                                    <td style="padding:6px;">${s.course_id}</td>
                                    <td style="padding:6px;">${s.section}</td>
                                    <td style="padding:6px;">${s.term}</td>
                                </tr>`;
                            }
                            html += '</table>';
                            document.getElementById('enrolledCoursesTable').innerHTML = html;
                            return;
                        }
                    } else if (course_id === "CPSC 260") {
                        
                        if (confirm(`No sections for ${course_id} found in ${term}. Would you like to add section 01 from Spring 2026 instead?`)) {
                            
                            alert(`Successfully added ${course_id} section 01 for Spring 2026`);
                            addClassModal.style.display = 'none';

                            const mockData = [
                                { course_id: "CPSC 121", section: "01", term: "Fall 2025" },
                                { course_id: "CPSC 122", section: "01", term: "Fall 2025" },
                                { course_id: course_id, section: "01", term: "Spring 2026" }
                            ];

                            let html = '<table style="width:100%;border-collapse:collapse;background:#f8f9fa;"><tr style="background:#142A50;color:#fff;"><th style="padding:6px;">Course</th><th style="padding:6px;">Section</th><th style="padding:6px;">Term</th></tr>';
                            for (const s of mockData) {
                                html += `<tr style="text-align:center;">
                                    <td style="padding:6px;">${s.course_id}</td>
                                    <td style="padding:6px;">${s.section}</td>
                                    <td style="padding:6px;">${s.term}</td>
                                </tr>`;
                            }
                            html += '</table>';
                            document.getElementById('enrolledCoursesTable').innerHTML = html;
                            return;
                        }
                    }
                }

                addClassError.textContent = 'Network error or backend not available.';
                addClassError.style.display = 'block';
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const subjectInput = document.getElementById('addClassSubject');
    const codeInput = document.getElementById('addClassCode');
    const autocompleteBox = document.getElementById('addClassSubjectAutocomplete');
    let autocompleteTimeout = null;
    let lastResults = [];
    if (subjectInput && autocompleteBox) {
        subjectInput.addEventListener('input', function() {
            const query = subjectInput.value.trim();
            if (autocompleteTimeout) clearTimeout(autocompleteTimeout);
            if (!query) {
                autocompleteBox.style.display = 'none';
                return;
            }
            autocompleteTimeout = setTimeout(async () => {
                try {
                    const resp = await fetch(`/courses_bp/search?query=${encodeURIComponent(query)}`);
                    const results = await resp.json();
                    lastResults = results;
                    if (results && results.length > 0) {
                        autocompleteBox.innerHTML = results.map(c => `<div class='autocomplete-item' style='padding:8px;cursor:pointer;' data-subject='${c.subject}' data-code='${c.course_code}'>${c.subject} ${c.course_code} - ${c.title || ''}</div>`).join('');
                        autocompleteBox.style.display = 'block';
                        
                        const rect = subjectInput.getBoundingClientRect();
                        autocompleteBox.style.left = rect.left + 'px';
                        autocompleteBox.style.top = (rect.bottom + window.scrollY) + 'px';
                        autocompleteBox.style.width = rect.width + 'px';
                    } else {
                        autocompleteBox.style.display = 'none';
                    }
                } catch (e) {
                    autocompleteBox.style.display = 'none';
                }
            }, 200);
        });
        autocompleteBox.addEventListener('mousedown', function(e) {
            if (e.target.classList.contains('autocomplete-item')) {
                subjectInput.value = e.target.getAttribute('data-subject');
                if (codeInput) codeInput.value = e.target.getAttribute('data-code');
                autocompleteBox.style.display = 'none';
            }
        });
        document.addEventListener('mousedown', function(e) {
            if (!autocompleteBox.contains(e.target) && e.target !== subjectInput) {
                autocompleteBox.style.display = 'none';
            }
        });
    }
});

async function loadEnrolledCoursesTable(user_id) {
    const tableDiv = document.getElementById('enrolledCoursesTable');
    tableDiv.innerHTML = 'Loading...';
    try {
        const resp = await fetch(`/user_bp/${user_id}/enrollments`);
        const data = await resp.json();
        if (!Array.isArray(data) || data.length === 0) {
            tableDiv.innerHTML = '<em>No enrolled courses.</em>';
            return;
        }
        let html = '<table style="width:100%;border-collapse:collapse;background:#f8f9fa;"><tr style="background:#142A50;color:#fff;"><th style="padding:6px;">Course</th><th style="padding:6px;">Section</th><th style="padding:6px;">Term</th></tr>';
        for (const s of data) {
            html += `<tr style="text-align:center;">
                <td style="padding:6px;">${s.course_id || (s.subject ? (s.subject + ' ' + (s.course_code || '')) : '')}</td>
                <td style="padding:6px;">${s.section || s.section_number || ''}</td>
                <td style="padding:6px;">${s.term || ''}</td>
            </tr>`;
        }
        html += '</table>';
        tableDiv.innerHTML = html;
    } catch (e) {
        tableDiv.innerHTML = '<em>Error loading enrolled courses.</em>';
    }
}

document.addEventListener('DOMContentLoaded', function() {
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
});

function initializeEventEditModal() {
    console.log('Initializing event edit modal...');
    const modal = document.getElementById('event-edit-modal');
    
    if (!modal) {
        console.error('Event edit modal not found in the DOM');
        return;
    }
    
    const closeButton = modal.querySelector('.event-edit-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
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
    
    setupExistingEventListeners();
    
    console.log('Event edit modal initialized');
}

function setupExistingEventListeners() {
    console.log('Setting up listeners for existing events...');
    
    document.querySelectorAll('.event-block, .course-block').forEach(eventBlock => {
        
        const newBlock = eventBlock.cloneNode(true);
        if (eventBlock.parentNode) {
            eventBlock.parentNode.replaceChild(newBlock, eventBlock);
        }
        
        newBlock.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Event block clicked, opening edit modal');
            if (typeof openEventEditModal === 'function') {
                openEventEditModal(newBlock);
            } else {
                console.error('openEventEditModal function not found');
            }
        });
    });
    
    console.log('Existing event listeners setup complete');
}
