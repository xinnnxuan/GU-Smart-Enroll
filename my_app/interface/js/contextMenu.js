import { getCurrentEventValues, createEditDialog } from './eventEditing.js';
import { parseTimeToHour } from './utility.js';

let activeMenu = null;

export function createContextMenu(x, y, eventBlock) {
    removeExistingContextMenu();

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    menu.innerHTML = getContextMenuHTML();
    setupContextMenuActions(menu, eventBlock);

    document.body.appendChild(menu);
    closeMenuOnClickOutside(menu);
}

function removeExistingContextMenu() {
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();
}

function getContextMenuHTML() {
    return `
        <div class="menu-item edit">Edit Event</div>
        <div class="menu-item color">Change Color</div>
        <div class="menu-item duplicate">Duplicate</div>
        <div class="menu-item delete">Delete</div>
    `;
}

function setupContextMenuActions(menu, eventBlock) {
    menu.querySelector('.edit').addEventListener('click', () => handleEditEvent(eventBlock, menu));
    menu.querySelector('.color').addEventListener('click', () => handleChangeColor(eventBlock, menu));
    menu.querySelector('.duplicate').addEventListener('click', () => handleDuplicateEvent(eventBlock, menu));
    menu.querySelector('.delete').addEventListener('click', () => handleDeleteEvent(eventBlock, menu));
}

function handleEditEvent(eventBlock, menu) {
    const currentValues = getCurrentEventValues(eventBlock);
    const editDialog = createEditDialog(currentValues, eventBlock);

    document.body.appendChild(editDialog);
    menu.remove();
}

function handleChangeColor(eventBlock, menu) {
    removeExistingColorPicker();

    const colorPicker = document.createElement('div');
    colorPicker.className = 'color-picker';
    const colors = ['#808080', '#4A90E2', '#B41231', '#357ABD', '#002467', '#2ECC71', '#E67E22', '#9B59B6', '#E74C3C', '#1ABC9C'];

    colors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option';
        colorOption.style.backgroundColor = color;
        colorOption.addEventListener('click', () => applyColorToEvent(eventBlock, color, colorPicker, menu));
        colorPicker.appendChild(colorOption);
    });

    document.body.appendChild(colorPicker);
    menu.remove();
}

function removeExistingColorPicker() {
    const existingPicker = document.querySelector('.color-picker');
    if (existingPicker) existingPicker.remove();
}

function applyColorToEvent(eventBlock, color, colorPicker, menu) {
    eventBlock.style.backgroundColor = color;
    colorPicker.remove();
    menu.remove();
}

function handleDuplicateEvent(eventBlock, menu) {
    const duplicate = eventBlock.cloneNode(true);
    duplicate.querySelector('.event-name').textContent += ' (copy)';
    eventBlock.parentNode.insertBefore(duplicate, eventBlock.nextSibling);
    menu.remove();
}

function handleDeleteEvent(eventBlock, menu) {
    if (confirm('Are you sure you want to delete this event?')) {
        eventBlock.remove();
    }
    menu.remove();
}

function closeMenuOnClickOutside(menu) {
    if (activeMenu && !activeMenu.contains(menu)) {
        activeMenu.style.display = 'none';
        document.removeEventListener('click', closeMenuOnClickOutside);
        activeMenu = null;
    }
}

function setupContextMenu(eventBlock) {
    const menu = createContextMenu(eventBlock);
    addEventActionsToMenu(menu, eventBlock);
    document.body.appendChild(menu);
    closeMenuOnClickOutside(menu);
}

function addEventActionsToMenu(menu, eventBlock) {
    setupEditEventAction(menu, eventBlock);
    setupColorChangeAction(menu, eventBlock);
    setupDuplicateEventAction(menu, eventBlock);
    setupDeleteEventAction(menu, eventBlock);
    setupExportActions(menu, eventBlock);
}

function setupEditEventAction(menu, eventBlock) {
    const editItem = menu.querySelector('.edit');
    editItem.addEventListener('click', () => editEvent(eventBlock));
}

function editEvent(eventBlock) {
    const currentValues = getCurrentEventValues(eventBlock);
    const editDialog = createEditDialog(currentValues, eventBlock);
    document.body.appendChild(editDialog);
}

function setupColorChangeAction(menu, eventBlock) {
    const colors = ['#808080', '#4A90E2', '#B41231', '#357ABD', '#002467'];
    const colorPicker = document.createElement('div');
    colorPicker.className = 'color-picker';

    colors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option';
        colorOption.style.backgroundColor = color;
        colorOption.addEventListener('click', () => {
            eventBlock.style.backgroundColor = color;
            document.body.removeChild(colorPicker);
        });
        colorPicker.appendChild(colorOption);
    });

    document.body.appendChild(colorPicker);
}

function setupDuplicateEventAction(menu, eventBlock) {
    const duplicate = eventBlock.cloneNode(true);
    duplicate.querySelector('.event-name').textContent += ' (copy)';
    eventBlock.parentNode.insertBefore(duplicate, eventBlock.nextSibling);
}

function setupDeleteEventAction(menu, eventBlock) {
    menu.querySelector('.delete').addEventListener('click', () => eventBlock.remove());
}

function setupExportActions(menu, eventBlock) {
    const exportApple = document.createElement('button');
    exportApple.textContent = 'Export to Apple Calendar';
    exportApple.addEventListener('click', () => exportEvent(eventBlock, 'apple-calendar'));
    menu.appendChild(exportApple);

    const exportGoogle = document.createElement('button');
    exportGoogle.textContent = 'Export to Google Calendar';
    exportGoogle.addEventListener('click', () => exportEvent(eventBlock, 'google-calendar'));
    menu.appendChild(exportGoogle);
}

function exportEvent(eventBlock, calendarType) {
    const eventName = eventBlock.querySelector('.event-name').textContent;
    const eventTime = eventBlock.querySelector('.event-time').textContent;
    const [startTime, endTime] = eventTime.split(' - ');

    const eventData = {
        name: eventName,
        start_time: startTime,
        end_time: endTime
    };

    const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001' : '';
    fetch(`${apiBase}/export_bp/${calendarType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.success ? `Event exported to ${calendarType.replace('-', ' ')}` : `Failed to export: ${data.error}`);
    })
    .catch(error => {
        console.error('Export error:', error);
        alert('An error occurred while exporting.');
    });
}
