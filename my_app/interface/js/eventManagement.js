import { parseTimeToHour, getDayIndex, getRandomCourseColor } from './utility.js';

let selectedDays = new Set();

export function toggleDaySelection(button) {
    console.log('Toggling day selection for:', button.dataset.day);
    const day = button.dataset.day;
    
    if (button.classList.contains('selected')) {
        button.classList.remove('selected');
        button.style.backgroundColor = 'white';
        button.style.color = '#333';
        button.style.borderColor = '#e0e0e0';
        selectedDays.delete(day);
    } else {
        button.classList.add('selected');
        button.style.backgroundColor = '#142A50';
        button.style.color = 'white';
        button.style.borderColor = '#142A50';
        selectedDays.add(day);
    }
    
    console.log('Selected days:', Array.from(selectedDays));
}

function initializeDayButtons() {
    console.log('Initializing day buttons');
    const buttons = document.querySelectorAll('.day-button');
    console.log('Found day buttons:', buttons.length);
    
    buttons.forEach(button => {
        
        button.removeAttribute('onclick');
        
        button.removeEventListener('click', handleDayButtonClick);
        
        button.addEventListener('click', handleDayButtonClick);
        console.log('Added click listener to button:', button.dataset.day);
    });
}

function handleDayButtonClick(e) {
    e.preventDefault(); 
    e.stopPropagation(); 
    console.log('Day button clicked:', e.currentTarget.dataset.day);
    toggleDaySelection(e.currentTarget);
}

function initializeEventForm() {
    console.log('Initializing event form');
    const addEventButton = document.getElementById('add-event-button');
    if (addEventButton) {
        
        addEventButton.removeEventListener('click', addEventFromForm);
        
        addEventButton.addEventListener('click', addEventFromForm);
        console.log('Add event button listener attached');
    }
}

export function initializeEvents() {
    console.log('Initializing events functionality');
    initializeDayButtons();
    initializeEventForm();
}

export function getSelectedDays() {
    return Array.from(selectedDays);
}

export function clearDaySelections() {
    selectedDays.clear();
    document.querySelectorAll('.day-button').forEach(button => {
        button.classList.remove('selected');
    });
}

export function addEventToGrid(eventName, formattedStartTime, formattedEndTime, selectedDays) {
    if (!eventName || !formattedStartTime || !formattedEndTime || !selectedDays || selectedDays.length === 0) {
        console.error('Missing required fields for adding event to grid');
        return;
    }

    const eventColor = getRandomEventColor(); 
    const eventId = generateUniqueId(); 
    
    console.log(`Adding event: ${eventName}, ${formattedStartTime}-${formattedEndTime}, Days: ${selectedDays.join(',')}`);
    
    try {
        
        selectedDays.forEach(day => {
            
            const dayIndex = getDayIndex(day);
            if (dayIndex === -1) {
                console.warn(`Invalid day: ${day}, skipping`);
                return;
            }
            
            const startHour = parseTimeToHour(formattedStartTime);
            const endHour = parseTimeToHour(formattedEndTime);
            if (startHour >= endHour) {
                console.warn('Start time must be before end time, skipping');
                return;
            }
            
            const eventBlock = document.createElement('div');
            eventBlock.className = 'event-block';
            eventBlock.dataset.eventId = eventId;
            eventBlock.dataset.eventName = eventName;
            eventBlock.dataset.day = day;
            eventBlock.dataset.startTime = formattedStartTime;
            eventBlock.dataset.endTime = formattedEndTime;
            eventBlock.dataset.startHour = startHour;
            eventBlock.dataset.endHour = endHour;
            eventBlock.dataset.color = eventColor;
            eventBlock.style.backgroundColor = eventColor;
            
            const duration = endHour - startHour;
            const height = duration * 60; 
            eventBlock.style.height = `${height}px`;
            
            const startOffset = (startHour - 8) * 60; 
            eventBlock.style.top = `${startOffset}px`;
            
            eventBlock.innerHTML = `
                <div class="event-name">${eventName}</div>
                <div class="event-time">${formattedStartTime} - ${formattedEndTime}</div>
            `;
            
            eventBlock.addEventListener('click', function(e) {
                e.stopPropagation();
                
                if (typeof openEventEditModal === 'function') {
                    openEventEditModal(eventBlock);
                } else if (typeof window.openEventEditModal === 'function') {
                    window.openEventEditModal(eventBlock);
                } else {
                    console.error('openEventEditModal function not found');
                    
                    const modal = document.getElementById('event-edit-modal');
                    if (modal) {
                        document.getElementById('edit-event-id').value = eventId;
                        document.getElementById('edit-event-name').value = eventName;
                        document.getElementById('edit-event-start').value = convertTimeForInput(formattedStartTime);
                        document.getElementById('edit-event-end').value = convertTimeForInput(formattedEndTime);
                        document.getElementById('edit-event-color').value = eventColor;
                        
                        modal.querySelectorAll('.weekday-btn').forEach(btn => {
                            btn.classList.remove('selected');
                            if (btn.dataset.day === day) {
                                btn.classList.add('selected');
                            }
                        });
                        
                        modal.classList.add('show');
                    }
                }
            });
            
            const scheduleTable = document.querySelector('.schedule-grid table');
            if (!scheduleTable) {
                console.error('Schedule grid table not found');
                return;
            }
            
            const rows = scheduleTable.querySelectorAll('tbody tr');
            if (!rows.length) {
                console.error('No rows found in schedule grid');
                return;
            }
            
            const firstRow = rows[0];
            const cell = firstRow.cells[dayIndex + 1];
            if (!cell) {
                console.error(`Cell not found for day index ${dayIndex}`);
                return;
            }
            
            cell.appendChild(eventBlock);
        });
        
        showNotification('Event added successfully', 'success');
        
        clearEventForm();
        
    } catch (error) {
        console.error('Error adding event to grid:', error);
        showNotification('Error adding event: ' + error.message, 'error');
    }
}

function convertTimeForInput(timeStr) {
    try {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours);
        
        if (period === 'PM' && hour !== 12) {
            hour += 12;
        } else if (period === 'AM' && hour === 12) {
            hour = 0;
        }
        
        return `${hour.toString().padStart(2, '0')}:${minutes}`;
    } catch (error) {
        console.error('Error converting time for input:', error);
        return '08:00'; 
    }
}

function getRandomEventColor() {
    const colors = [
        '#3498db', 
        '#2ecc71', 
        '#e74c3c', 
        '#f39c12', 
        '#9b59b6', 
        '#1abc9c', 
        '#34495e', 
        '#d35400', 
        '#c0392b', 
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}

function generateUniqueId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getDayIndex(day) {
    const days = { 'M': 0, 'T': 1, 'W': 2, 'R': 3, 'F': 4 };
    return days[day] !== undefined ? days[day] : -1;
}

function parseTimeToHour(timeStr) {
    try {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours);
        
        if (period === 'PM' && hour !== 12) {
            hour += 12;
        } else if (period === 'AM' && hour === 12) {
            hour = 0;
        }
        
        return hour + (parseInt(minutes) / 60);
    } catch (error) {
        console.error('Error parsing time to hour:', error);
        return 8; 
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button type="button" class="notification-close">×</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

function clearEventForm() {
    const eventNameInput = document.querySelector('#recurring-event-name');
    const startTimeInput = document.querySelector('#start-time-input');
    const endTimeInput = document.querySelector('#end-time-input');
    
    if (eventNameInput) eventNameInput.value = '';
    if (startTimeInput) startTimeInput.value = '';
    if (endTimeInput) endTimeInput.value = '';
    
    clearDaySelections();
}

initializeEvents();
document.addEventListener('DOMContentLoaded', initializeEvents);

document.addEventListener('click', function(e) {
    if (e.target.closest('[onclick*="openTab(\'RecurringEvents\'"]')) {
        console.log('RecurringEvents tab clicked');
        setTimeout(initializeEvents, 200); 
    }
});

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.target.id === 'RecurringEvents' && mutation.target.style.display !== 'none') {
            console.log('RecurringEvents tab became visible');
            initializeDayButtons();
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const recurringEventsTab = document.getElementById('RecurringEvents');
    if (recurringEventsTab) {
        observer.observe(recurringEventsTab, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
    }
});
