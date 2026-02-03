
import { initializeFinalsTab } from './finals.js';
import {
    initializeNavigation,
    initializeDropdowns,
    setupSidebarTabs,
    applyThemeToggle,
    configureDivisionButtons,
    setupUserDropdown
} from './navigation.js';

window.openTab = openTab;

export function openTab(tabName, event) {
    console.log('openTab called', tabName);
    console.log('Opening tab:', tabName);

    if (tabName === 'Finals') {
        const regView = document.getElementById('registration-view');
        if (regView) regView.style.display = 'flex';
    }

    const tabContents = document.getElementsByClassName('tab-content');
    for (let content of tabContents) {
        content.style.display = 'none';
    }

    const tabButtons = document.getElementsByClassName('tab-button');
    for (let button of tabButtons) {
        button.classList.remove('active');
    }

    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.style.display = 'block';
        console.log('Tab content displayed:', tabName);
    } else {
        console.error('Tab content not found:', tabName);
    }

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    if (tabName === 'Finals') {
        setTimeout(() => {
            initializeFinalsTab();
        }, 0);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    document.querySelectorAll('[data-tab]').forEach(button => {
        button.addEventListener('click', (event) => {
            const tabName = button.getAttribute('data-tab');
            
            if (tabName === 'Finals') {
                const regView = document.getElementById('registration-view');
                if (regView) regView.style.display = 'flex';
            }
            if (tabName) {
                openTab(tabName, event);
            }
        });
    });

    const coursesTab = document.getElementById('Courses');
    if (coursesTab) {
        coursesTab.style.display = 'block';
        const coursesButton = document.querySelector('[data-tab="Courses"]');
        if (coursesButton) {
            coursesButton.classList.add('active');
        }
    }
});

window.openTab = openTab;

export function initializeTabs() {
    console.log('Initializing tabs...');

    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });

    const coursesTab = document.getElementById('Courses');
    if (coursesTab) {
        coursesTab.style.display = 'block';
        coursesTab.classList.add('active');
        console.log('Set Courses tab as default');
    }

    const coursesButton = document.querySelector('button[onclick*="openTab(\'Courses\'"]');
    if (coursesButton) {
        coursesButton.classList.add('active');
        coursesButton.style.color = '#142A50';
        coursesButton.style.fontWeight = '500';
    }
}

window.openTab = openTab;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        
        const viewContainers = document.getElementsByClassName('view-container');
        for (const container of viewContainers) {
            container.style.display = 'none';
        }

        const registrationView = document.getElementById('registration-view');
        if (registrationView) {
            registrationView.style.display = 'flex';
        }

        initializeTabs();
        initializeNavigation();
        initializeDropdowns();
        setupSidebarTabs();
        applyThemeToggle();
        configureDivisionButtons();
        setupUserDropdown();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});
