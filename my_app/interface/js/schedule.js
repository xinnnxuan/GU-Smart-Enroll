import { addEventBlockListeners } from './eventListeners.js';
import { parseTimeToHour } from './utility.js';

export { addEventFromForm };

function addEventToSchedule(eventName, days, startTime, endTime) {
    const { startHour, startMinute, endHour, endMinute } = parseTime(startTime, endTime);
    const selectedDays = getSelectedDays();

    selectedDays.forEach(dayIndex => {
        const startCell = getStartCell(startHour, dayIndex);
        if (startCell) {
            const eventBlock = createEventBlock(eventName, startTime, endTime, startMinute, endMinute, startHour);
            addEventBlockListeners(eventBlock);
            startCell.style.position = 'relative';
            startCell.appendChild(eventBlock);
        }
    });
}

function parseTime(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    return { startHour, startMinute, endHour, endMinute };
}

function getSelectedDays() {
    return Array.from(document.querySelectorAll('.weekday-btn.selected')).map(btn => {
        return ['M', 'T', 'W', 'R', 'F'].indexOf(btn.textContent) + 1;
    });
}

function getStartCell(startHour, dayIndex) {
    const startRowIndex = startHour - 8 + 2; 
    return document.querySelector(`table tr:nth-child(${startRowIndex}) td:nth-child(${dayIndex + 1})`);
}

function createEventBlock(eventName, startTime, endTime, startMinute, endMinute, startHour) {
    const eventBlock = document.createElement('div');
    eventBlock.className = 'event-block';

    const duration = ((endHour - startHour) * 60) + (endMinute - startMinute);
    eventBlock.style.top = `${(startMinute / 60) * 60}px`;
    eventBlock.style.height = `${duration}px`;
    eventBlock.style.zIndex = '1';

    eventBlock.innerHTML = `
        <div class="event-name">${eventName}</div>
        <div class="event-time">${startTime} - ${endTime}</div>
    `;

    return eventBlock;
}

function addEventFromForm() {
    try {
        console.log("Adding event from form");
        
        const eventName = document.querySelector('#RecurringEvents input[placeholder="Event Name"]').value.trim();
        const eventLocation = document.querySelector('#RecurringEvents input[placeholder="Location (optional)"]').value.trim();
        const startTime = document.querySelector('#RecurringEvents input[type="time"][placeholder="Start Time"]').value;
        const endTime = document.querySelector('#RecurringEvents input[type="time"][placeholder="End Time"]').value;
        
        console.log("Form values:", { eventName, eventLocation, startTime, endTime });
        
        if (!eventName) {
            showNotification("Please enter an event name", "error");
            return;
        }
        
        if (!startTime || !endTime) {
            showNotification("Please enter both start and end times", "error");
            return;
        }
        
        const selectedDays = [];
        document.querySelectorAll('#RecurringEvents .weekday-btn.selected').forEach(btn => {
            selectedDays.push(btn.textContent.trim());
        });
        
        console.log("Selected days:", selectedDays);
        
        if (selectedDays.length === 0) {
            showNotification("Please select at least one day for your event", "error");
            return;
        }
        
        const formatTime = (timeStr) => {
            if (!timeStr) return '';
            const [hours, minutes] = timeStr.split(':');
            let hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12 || 12;
            return `${hour}:${minutes} ${ampm}`;
        };
        
        const formattedStartTime = formatTime(startTime);
        const formattedEndTime = formatTime(endTime);
        
        console.log("Formatted times:", { formattedStartTime, formattedEndTime });
        
        const startHour = parseTimeToHour(formattedStartTime);
        const endHour = parseTimeToHour(formattedEndTime);
        
        console.log("Grid hours:", { startHour, endHour });
        
        if (startHour >= endHour) {
            showNotification("End time must be after start time", "error");
            return;
        }
        
        const color = getRandomCourseColor();
        
        const registrationView = document.getElementById('registration-view');
        if (registrationView) {
            registrationView.style.display = 'block';
        }
        
        selectedDays.forEach(day => {
            const dayIndex = getDayIndex(day);
            if (dayIndex !== -1) {
                addCourseToGrid(
                    dayIndex,
                    startHour,
                    endHour,
                    eventName,
                    eventLocation || "N/A",
                    "Personal Event",
                    color
                );
            }
        });
        
        showNotification(`Added "${eventName}" to your schedule`, "success");
        
        document.querySelector('#RecurringEvents input[placeholder="Event Name"]').value = "";
        document.querySelector('#RecurringEvents input[placeholder="Location (optional)"]').value = "";
        document.querySelector('#RecurringEvents input[type="time"][placeholder="Start Time"]').value = "";
        document.querySelector('#RecurringEvents input[type="time"][placeholder="End Time"]').value = "";
        
        document.querySelectorAll('#RecurringEvents .weekday-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });
        
    } catch (error) {
        console.error("Error adding event from form:", error);
        showNotification("Error adding event: " + error.message, "error");
    }
}