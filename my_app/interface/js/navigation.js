
import { setupDropdown } from './dropdown.js';

let navigationInitialized = false;

export function initializeNavigation() {
    console.log('Initializing navigation...');

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.getAttribute('data-view');

            document.querySelectorAll('.nav-links a').forEach(navLink => {
                navLink.classList.remove('active');
            });

            this.classList.add('active');

            document.querySelectorAll('.view-container').forEach(container => {
                container.style.display = 'none';
            });

            const viewContainer = document.getElementById(view + '-view');
            if (viewContainer) {
                viewContainer.style.display = 'flex';

                if (view === 'registration') {
                    
                    const scheduleContainer = document.querySelector('.schedule-container');
                    if (scheduleContainer) {
                        scheduleContainer.style.display = 'flex';
                    }

                    const sidebar = document.querySelector('.sidebar');
                    if (sidebar) {
                        sidebar.style.display = 'block';
                    }
                }

                if (view === 'finals') {
                    
                    if (typeof initializeFinalsTab === 'function') {
                        setTimeout(() => {
                            initializeFinalsTab();
                        }, 0);
                    }
                }
            }
        });
    });

    document.addEventListener('click', e => {
        if (!e.target.matches('.nav-button, .export-button, .arrow, .semester-button')) {
            document.querySelectorAll('.dropdown-content, .export-dropdown, .semester-content').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });

    const exportButton = document.querySelector('.export-button');
    if (exportButton) {
        exportButton.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            document.querySelector('.export-dropdown')?.classList.toggle('show');
        });
    }

    const navButton = document.querySelector('.nav-button');
    if (navButton) {
        navButton.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            document.querySelector('.dropdown-content')?.classList.toggle('show');
        });
    }

    const semesterButton = document.querySelector('.semester-button');
    if (semesterButton) {
        semesterButton.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            document.querySelector('.semester-content')?.classList.toggle('show');
        });
    }
}

export function initializeDropdowns() {
    
    setupDropdown('.semester-button', '.semester-content', ['.export-dropdown', '#userDropdown']);

    setupDropdown('.export-button', '.export-dropdown', ['.semester-content', '#userDropdown']);

    setupDropdown('.user-dropdown .nav-button', '#userDropdown', ['.semester-content', '.export-dropdown']);

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.semester-button') &&
            !e.target.closest('.export-button') &&
            !e.target.closest('.user-dropdown')) {
            document.querySelectorAll('.semester-content, .export-dropdown, #userDropdown').forEach(dropdown => {
                dropdown.classList.remove('show');
                const button = dropdown.previousElementSibling;
                if (button) {
                    const arrow = button.querySelector('.arrow');
                    if (arrow) arrow.style.transform = 'rotate(0deg)';
                }
            });
        }
    });
}

export function setupSidebarTabs() {
    document.querySelectorAll('.sidebar-tabs a').forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.sidebar-tabs a').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

export function applyThemeToggle() {
    
}

export function configureDivisionButtons() {
    const divisionBtns = document.querySelectorAll('.division-btn');
    divisionBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            divisionBtns.forEach(otherBtn => {
                otherBtn.classList.remove('selected');
                resetButtonStyle(otherBtn);
            });
            this.classList.add('selected');
            setSelectedButtonStyle(this);
        });
    });
}

export function setupUserDropdown() {
    setupDropdown('.user-dropdown .nav-button', '#userDropdown', ['.export-dropdown']);
}

function changeSemester(semester) {
    const semesterButton = document.querySelector('.semester-button');
    if (semesterButton) {
        semesterButton.innerHTML = `${semester} <span class="arrow">▼</span>`;
    }
    const semesterContent = document.querySelector('.semester-content');
    if (semesterContent) semesterContent.classList.remove('show');
    console.log('Semester changed to:', semester);
    showToast(`Semester changed to ${semester}`);
}

window.showToast = function(message, duration = 3000) {
    try {
        if (typeof showNotification === 'function') {
            return showNotification(message, 'info', duration);
        }
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    } catch (error) {
        console.error('Error showing toast notification:', error);
    }
};

function setupMapView() {
    const floorPlanTab = document.querySelector('.floor-plan-tab');
    const scheduleTab = document.querySelector('.schedule-tab');
    const floorTree = document.querySelector('.floor-tree');
    const scheduleView = document.querySelector('.schedule-view');

    if (floorPlanTab && scheduleTab && floorTree && scheduleView) {
        const deactivateTabs = () => {
            floorPlanTab.classList.remove('active');
            scheduleTab.classList.remove('active');
            floorTree.style.display = 'none';
            scheduleView.style.display = 'none';
        };
        floorPlanTab.addEventListener('click', e => {
            e.preventDefault();
            deactivateTabs();
            floorPlanTab.classList.add('active');
            floorTree.style.display = 'block';
        });
        scheduleTab.addEventListener('click', e => {
            e.preventDefault();
            deactivateTabs();
            scheduleTab.classList.add('active');
            scheduleView.style.display = 'block';
        });
    }
}
