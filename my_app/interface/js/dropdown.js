
export function createExportDropdown() {
    return `
        <div class="export-dropdown">
            <a href="#" class="export-calendar">Export to Calendar</a>
            <a href="#" class="export-pdf">Export as PDF</a>
        </div>
    `;
}

export function createSemesterDropdown() {
    const semesters = [
        'Summer 2025', 'Spring 2025', 'Fall 2024',
        'Summer 2024', 'Spring 2024', 'Fall 2023',
        'Summer 2023', 'Spring 2023'
    ];

    return `
        <div class="semester-content">
            ${semesters.map(semester => `<a href="#">${semester}</a>`).join('')}
        </div>
    `;
}

export function setupDropdown(buttonSelector, dropdownSelector, closeOtherSelectors = []) {
    const button = document.querySelector(buttonSelector);
    const dropdown = document.querySelector(dropdownSelector);

    if (!button || !dropdown) {
        console.warn(`Dropdown setup failed: button (${buttonSelector}) or dropdown (${dropdownSelector}) not found`);
        return;
    }

    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    newButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        closeOtherSelectors.forEach(selector => {
            const otherDropdown = document.querySelector(selector);
            if (otherDropdown) {
                otherDropdown.classList.remove('show');
                resetDropdownArrow(otherDropdown.previousElementSibling);
            }
        });

        dropdown.classList.toggle('show');
        toggleDropdownArrow(newButton, dropdown);
    });

    dropdown.querySelectorAll('a').forEach(option => {
        option.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (buttonSelector.includes('semester')) {
                newButton.innerHTML = `${this.textContent} <span class="arrow">▼</span>`;
            }

            dropdown.classList.remove('show');
            resetDropdownArrow(newButton);

            const event = new CustomEvent('dropdownChange', {
                detail: { value: this.textContent }
            });
            newButton.dispatchEvent(event);
        });
    });
}

function toggleDropdownArrow(button, dropdown) {
    const arrow = button.querySelector('.arrow');
    if (arrow) {
        arrow.style.transform = dropdown.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
    }
}

function resetDropdownArrow(button) {
    const arrow = button?.querySelector('.arrow');
    if (arrow) {
        arrow.style.transform = 'rotate(0deg)';
    }
}