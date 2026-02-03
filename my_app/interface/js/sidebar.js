
function ensureSidebarVisible() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.style.display = 'block';
        sidebar.style.backgroundColor = 'white';
        sidebar.style.zIndex = '10';
        console.log('Sidebar visibility enforced');
        
        const tabButtons = sidebar.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.style.display = 'block';
            button.style.color = button.classList.contains('active') ? '#142A50' : '#333';
        });
        
        const activeTab = sidebar.querySelector('.tab-content.active');
        if (activeTab) {
            activeTab.style.display = 'block';
        }
        
        const debugEl = document.getElementById('debug-sidebar');
        if (debugEl) {
            debugEl.style.display = 'block';
            debugEl.style.backgroundColor = '#f8f9fa';
            debugEl.style.color = '#333';
            debugEl.style.padding = '8px';
            debugEl.style.borderRadius = '4px';
            debugEl.style.margin = '0 0 15px 0';
        }
    }
    
    const scheduleGrid = document.querySelector('.schedule-grid');
    if (scheduleGrid) {
        scheduleGrid.style.display = 'flex';
    }
    
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(header => {
        if (header.textContent.toLowerCase().includes('registration')) {
            header.style.display = 'none';
        }
    });
    
    document.querySelectorAll('p').forEach(p => {
        if (p.textContent.toLowerCase().includes('content for registration')) {
            p.style.display = 'none';
        }
    });
}

function toggleFilterButton(button) {
    console.log('Toggling filter button:', button.textContent);
    button.classList.toggle('active');
    
    if (button.classList.contains('active')) {
        button.style.backgroundColor = '#f5f5f5';
        button.style.borderColor = '#142A50';
        button.style.color = '#142A50';
    } else {
        button.style.backgroundColor = 'white';
        button.style.borderColor = '#e0e0e0';
        button.style.color = '#333';
    }
    
    if (typeof updateDebug === 'function') {
        updateDebug('toggleFilterButton', `'${button.textContent}'`);
    }
}

function toggleDayButton(button) {
    console.log('Toggling day button:', button.textContent);
    button.classList.toggle('selected');
    
    if (button.classList.contains('selected')) {
        button.style.backgroundColor = '#142A50';
        button.style.color = 'white';
        button.style.borderColor = '#142A50';
    } else {
        button.style.backgroundColor = 'white';
        button.style.color = '#333';
        button.style.borderColor = '#e0e0e0';
    }
    
    if (typeof updateDebug === 'function') {
        updateDebug('toggleDayButton', `'${button.textContent}'`);
    }
}

function toggleTreeItem(header) {
    var content = header.nextElementSibling;
    var arrow = header.querySelector('.arrow');
    
    console.log('Toggling tree item:', header.textContent.trim());
    
    if (content.style.display === "block") {
        content.style.display = "none";
        arrow.style.transform = "";
    } else {
        content.style.display = "block";
        arrow.style.transform = "rotate(180deg)";
    }
    
    if (typeof updateDebug === 'function') {
        updateDebug('toggleTreeItem', `'${header.textContent.trim()}'`);
    }
}

function changeSemester(semester) {
    console.log('Changing semester to:', semester);
    
    var button = document.querySelector('.semester-button');
    if (button) {
        button.innerHTML = semester + ' <span class="arrow">▼</span>';
    }
    
    if (typeof updateDebug === 'function') {
        updateDebug('changeSemester', `'${semester}'`);
    }
}

function createBuildingTree() {
    return `
        <div class="tree-item">
            <div class="tree-header" onclick="toggleTreeItem(this)">
                <span class="building-name">Jepson</span>
                <span class="arrow">▼</span>
            </div>
            <div class="tree-content" style="display: none;">
                <div class="tree-subitem">Lower-level</div>
                <div class="tree-subitem">First floor</div>
                <div class="tree-subitem">Second floor</div>
            </div>
        </div>
        <div class="tree-item">
            <div class="tree-header" onclick="toggleTreeItem(this)">
                <span class="building-name">Herak</span>
                <span class="arrow">▼</span>
            </div>
            <div class="tree-content" style="display: none;"></div>
        </div>
    `;
}

function createWeekdayPanels() {
    const days = {
        Monday: "No classes this day!",
        Tuesday: "MATH 231 - Calculus (2)",
        Wednesday: "No classes this day!",
        Thursday: "MATH 231 - Calculus (2)",
        Friday: "No classes this day!"
    };

    return `
        <div class="weekday-panels">
            ${Object.entries(days).map(([day, content]) => `
                <div class="day-panel">
                    <div class="day-header" onclick="toggleDayPanel(this)">
                        <span>${day}</span>
                        <span class="arrow">▼</span>
                    </div>
                    <div class="day-content">${content}</div>
                </div>
            `).join('')}
        </div>
    `;
}
