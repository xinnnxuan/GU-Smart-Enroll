
export function setupFinalsTabSwitching() {
    console.log('Setting up Finals tab switching...');

    const fallBtn = document.getElementById('fall-btn');
    const springBtn = document.getElementById('spring-btn');

    if (!fallBtn || !springBtn) {
        console.error('Required Finals elements not found');
        return;
    }

    const newFallBtn = fallBtn.cloneNode(true);
    const newSpringBtn = springBtn.cloneNode(true);
    fallBtn.parentNode.replaceChild(newFallBtn, fallBtn);
    springBtn.parentNode.replaceChild(newSpringBtn, springBtn);

    newFallBtn.addEventListener('click', () => {
        newFallBtn.classList.add('active');
        newSpringBtn.classList.remove('active');
        updateFinalsDisplay('fall');
    });

    newSpringBtn.addEventListener('click', () => {
        newSpringBtn.classList.add('active');
        newFallBtn.classList.remove('active');
        updateFinalsDisplay('spring');
    });

    updateFinalsDisplay('fall');
}

export function showFinalsTab() {
    const finalsTab = document.getElementById('Finals');
    const finalsButton = document.querySelector('.tab-button[onclick*="Finals"]');

    if (finalsTab && finalsButton) {
        
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
            tab.classList.remove('active');
        });

        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
            button.style.color = '#333';
        });

        finalsTab.style.display = 'block';
        finalsTab.classList.add('active');

        finalsButton.classList.add('active');
        finalsButton.style.color = '#142A50';

        const fallBtn = document.getElementById('fall-btn');
        if (fallBtn && !fallBtn.classList.contains('active')) {
            fallBtn.click();
        }
    }
}

export function initializeFinalsTab() {
    console.log('initializeFinalsTab called');
    console.log('Initializing Finals tab');

    const isFullScreenMode = document.getElementById('finals-view') && document.getElementById('finals-view').style.display === 'flex';
    const finalsContainer = isFullScreenMode ?
        document.getElementById('finals-view') :
        document.getElementById('Finals');

    if (!finalsContainer) {
        console.error('Finals container not found, trying to create it');
        
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            
            const newFinalsTab = document.createElement('div');
            newFinalsTab.id = 'Finals';
            newFinalsTab.className = 'tab-content';
            sidebar.appendChild(newFinalsTab);
            
            console.log('Finals container created');
            
            setTimeout(initializeFinalsTab, 0);
            return;
        } else {
            console.error('Sidebar not found, cannot create Finals tab');
            return;
        }
    }

    console.log('Finals container found with ID:', finalsContainer.id);
    console.log('Current children count:', finalsContainer.children.length);

    if (finalsContainer.children.length === 0) {
        console.log('Creating Finals content from scratch');
        finalsContainer.innerHTML = `
            <div class="finals-header">
                <h2 class="finals-title">Fall Finals Schedule</h2>
                <p class="finals-subtitle">Undergraduate Courses Only</p>
                
                <div class="semester-toggle">
                    <button id="fall-btn" class="semester-switch active">Fall</button>
                    <button id="spring-btn" class="semester-switch">Spring</button>
                </div>
            </div>
            
            <div class="finals-content">
                <div class="fall-finals" style="display: block;">
                    <div class="finals-table-container">
                        <table class="finals-table">
                            <thead>
                                <tr>
                                    <th>CLASSES SCHEDULED:</th>
                                    <th>WILL BE HELD:</th>
                                    <th>FALL 2024</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Fall Finals data will be inserted here -->
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="spring-finals" style="display: none;">
                    <div class="finals-table-container">
                        <table class="finals-table">
                            <thead>
                                <tr>
                                    <th>CLASSES SCHEDULED:</th>
                                    <th>WILL BE HELD:</th>
                                    <th>SPRING 2025</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Spring Finals data will be inserted here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="finals-info-box">
                <h3>Finals Schedule Information</h3>
                <p>This schedule shows when your final exams will be based on your regular class meeting times.</p>
                <p>If you have any conflicts, please contact your professor as soon as possible.</p>
            </div>
        `;
        console.log('Finals content created');
    } else {
        console.log('Finals content already exists');
    }

    const styles = `
        .finals-header {
            margin-bottom: 20px;
        }
        .semester-toggle {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        .semester-switch {
            padding: 8px 16px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-size: 14px;
            flex: 1;
        }
        .semester-switch.active {
            background: #142A50;
            color: white;
            border-color: #142A50;
        }
        .finals-title {
            font-size: 18px;
            font-weight: 500;
            color: #142A50;
            margin-bottom: 5px;
            text-align: center;
        }
        .finals-subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 20px;
            text-align: center;
        }
        .finals-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 12px;
        }
        .finals-table th,
        .finals-table td {
            padding: 8px;
            border: 1px solid #e0e0e0;
            text-align: left;
        }
        .finals-table th {
            background: #f8f9fa;
            font-weight: 500;
        }
        .finals-info-box {
            margin-top: 20px;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 4px;
            font-size: 12px;
        }
        .finals-info-box h3 {
            margin-top: 0;
            font-size: 14px;
            color: #142A50;
        }
    `;

    if (!document.getElementById('finals-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'finals-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        console.log('Finals styles added to document');
    }

    try {
        setupFinalsTabSwitching();
        console.log('Finals tab switching set up');
    } catch (error) {
        console.error('Error setting up finals tab switching:', error);
    }

    try {
        populateFallFinalsData();
        populateSpringFinalsData();
        console.log('Finals data populated');
    } catch (error) {
        console.error('Error populating finals data:', error);
    }

    updateFinalsDisplay('fall');
    console.log('Finals tab initialization complete');
    
    finalsContainer.style.display = 'block';
}

function updateFinalsDisplay(semester) {
    console.log('Updating finals display to:', semester);
    
    const fallFinalsElement = document.querySelector('.fall-finals');
    const springFinalsElement = document.querySelector('.spring-finals');
    
    if (!fallFinalsElement || !springFinalsElement) {
        console.error('Finals elements not found');
        console.log('Re-initializing Finals tab content');
        
        const finalsContainer = document.getElementById('Finals');
        if (finalsContainer) {
            
            finalsContainer.innerHTML = '';
            
            finalsContainer.innerHTML = `
                <div class="finals-header">
                    <h2 class="finals-title">Fall Finals Schedule</h2>
                    <p class="finals-subtitle">Undergraduate Courses Only</p>
                    
                    <div class="semester-toggle">
                        <button id="fall-btn" class="semester-switch active">Fall</button>
                        <button id="spring-btn" class="semester-switch">Spring</button>
                    </div>
                </div>
                
                <div class="finals-content">
                    <div class="fall-finals" style="display: block;">
                        <div class="finals-table-container">
                            <table class="finals-table">
                                <thead>
                                    <tr>
                                        <th>CLASSES SCHEDULED:</th>
                                        <th>WILL BE HELD:</th>
                                        <th>FALL 2024</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Fall Finals data will be inserted here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="spring-finals" style="display: none;">
                        <div class="finals-table-container">
                            <table class="finals-table">
                                <thead>
                                    <tr>
                                        <th>CLASSES SCHEDULED:</th>
                                        <th>WILL BE HELD:</th>
                                        <th>SPRING 2025</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Spring Finals data will be inserted here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="finals-info-box">
                    <h3>Finals Schedule Information</h3>
                    <p>This schedule shows when your final exams will be based on your regular class meeting times.</p>
                    <p>If you have any conflicts, please contact your professor as soon as possible.</p>
                </div>
            `;
            
            populateFallFinalsData();
            populateSpringFinalsData();
            setupFinalsTabSwitching();
            
            return; 
        }
    }
    
    if (semester === 'fall') {
        fallFinalsElement.style.display = 'block';
        springFinalsElement.style.display = 'none';
        const titleElement = document.querySelector('.finals-title');
        if (titleElement) {
            titleElement.textContent = 'Fall Finals Schedule';
        }
    } else {
        fallFinalsElement.style.display = 'none';
        springFinalsElement.style.display = 'block';
        const titleElement = document.querySelector('.finals-title');
        if (titleElement) {
            titleElement.textContent = 'Spring Finals Schedule';
        }
    }
}

function populateFallFinalsData() {
    const fallFinalsTable = document.querySelector('.fall-finals tbody');
    if (!fallFinalsTable) return;
    
    const fallData = [
        ['Study Day', 'no classes, no exams', 'Monday, Dec 9, 2024'],
        ['MWF 8:00 am', '8:00 to 10:00 am', 'Tuesday, Dec 10, 2024'],
        ['TR 9:00, 9:25 am', '10:30 am to 12:30 pm', 'Tuesday, Dec 10, 2024'],
        ['MWF 11:00 am', '1:00 to 3:00 pm', 'Tuesday, Dec 10, 2024'],
        ['TR 1:50, 2:10, 2:40 pm', '3:30 to 5:30 pm', 'Tuesday, Dec 10, 2024'],
        ['MWF 3:10 pm', '6:00 to 8:00 pm', 'Tuesday, Dec 10, 2024'],
        ['MWF 9:00 am', '8:00 to 10:00 am', 'Wednesday, Dec 11, 2024'],
        ['TR 10:50 am', '10:30 am to 12:30 pm', 'Wednesday, Dec 11, 2024'],
        ['TR 3:15 pm', '1:00 to 3:00 pm', 'Wednesday, Dec 11, 2024'],
        ['MWF 2:10 pm', '3:30 to 5:30 pm', 'Wednesday, Dec 11, 2024'],
        ['MWF 4:10 pm', '6:00 to 8:00 pm', 'Wednesday, Dec 11, 2024'],
        ['MWF 10:00 am', '8:00 to 10:00 am', 'Thursday, Dec 12, 2024'],
        ['TR 8:00 am', '10:30 am to 12:30 pm', 'Thursday, Dec 12, 2024'],
        ['MWF 1:10 pm', '1:00 to 3:00 pm', 'Thursday, Dec 12, 2024'],
        ['TR 12:25 pm', '3:30 to 5:30 pm', 'Thursday, Dec 12, 2024'],
        ['TR 4:10, 4:40 pm', '6:00 to 8:00 pm', 'Thursday, Dec 12, 2024'],
        ['M or W 6:00 pm', '8:00 to 10:00 am', 'Friday, Dec 13, 2024'],
        ['T or R 6:00 pm', '10:30 am to 12:30 pm', 'Friday, Dec 13, 2024'],
        ['Arranged', '1:00 to 3:00 pm', 'Friday, Dec 13, 2024']
    ];
    
    let fallHtml = '';
    fallData.forEach(row => {
        fallHtml += `
            <tr>
                <td>${row[0]}</td>
                <td>${row[1]}</td>
                <td>${row[2]}</td>
            </tr>
        `;
    });
    
    fallHtml += `
        <tr>
            <td colspan="2">Grades are due from the Faculty by 4pm the Wednesday after finals week</td>
            <td>Wednesday, Dec 18, 2024</td>
        </tr>
    `;
    
    fallFinalsTable.innerHTML = fallHtml;
}

function populateSpringFinalsData() {
    const springFinalsTable = document.querySelector('.spring-finals tbody');
    if (!springFinalsTable) return;
    
    const springData = [
        ['Study Day', 'no classes, no exams', 'Monday, May 5, 2025'],
        ['MWF 8:00 am', '8:00 to 10:00 am', 'Tuesday, May 6, 2025'],
        ['TR 9:00, 9:25 am', '10:30 am to 12:30 pm', 'Tuesday, May 6, 2025'],
        ['MWF 11:00 am', '1:00 to 3:00 pm', 'Tuesday, May 6, 2025'],
        ['TR 1:50, 2:10, 2:40 pm', '3:30 to 5:30 pm', 'Tuesday, May 6, 2025'],
        ['MWF 3:10 pm', '6:00 to 8:00 pm', 'Tuesday, May 6, 2025'],
        ['MWF 9:00 am', '8:00 to 10:00 am', 'Wednesday, May 7, 2025'],
        ['TR 10:50 am', '10:30 am to 12:30 pm', 'Wednesday, May 7, 2025'],
        ['TR 3:15 pm', '1:00 to 3:00 pm', 'Wednesday, May 7, 2025'],
        ['MWF 2:10 pm', '3:30 to 5:30 pm', 'Wednesday, May 7, 2025'],
        ['MWF 4:10 pm', '6:00 to 8:00 pm', 'Wednesday, May 7, 2025'],
        ['MWF 10:00 am', '8:00 to 10:00 am', 'Thursday, May 8, 2025'],
        ['TR 8:00 am', '10:30 am to 12:30 pm', 'Thursday, May 8, 2025'],
        ['MWF 1:10 pm', '1:00 to 3:00 pm', 'Thursday, May 8, 2025'],
        ['TR 12:25 pm', '3:30 to 5:30 pm', 'Thursday, May 8, 2025'],
        ['TR 4:10, 4:40 pm', '6:00 to 8:00 pm', 'Thursday, May 8, 2025'],
        ['M or W 6:00 pm', '8:00 to 10:00 am', 'Friday, May 9, 2025'],
        ['T or R 6:00 pm', '10:30 am to 12:30 pm', 'Friday, May 9, 2025'],
        ['Arranged', '1:00 to 3:00 pm', 'Friday, May 9, 2025']
    ];
    
    let springHtml = '';
    springData.forEach(row => {
        springHtml += `
            <tr>
                <td>${row[0]}</td>
                <td>${row[1]}</td>
                <td>${row[2]}</td>
            </tr>
        `;
    });
    
    springHtml += `
        <tr>
            <td colspan="2">Grades are due from the Faculty by 4pm the Wednesday after finals week</td>
            <td>Wednesday, May 14, 2025</td>
        </tr>
    `;
    
    springFinalsTable.innerHTML = springHtml;
}

function initializeSearch() {
    const searchInput = document.getElementById('finals-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        filterFinals(this.value.trim().toLowerCase());
    });
}

function getAllFinals(semester) {
    const container = semester === 'fall' ? 
        document.querySelector('.fall-finals tbody') : 
        document.querySelector('.spring-finals tbody');
        
    return container ? container.querySelectorAll('tr') : [];
}

function filterFinals(searchTerm) {
    const rows = getAllFinals(document.getElementById('fall-btn').classList.contains('active') ? 'fall' : 'spring');
    
    if (!rows.length) return;
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm) || searchTerm === '') {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Finals module loaded, checking if initialization is needed');
    
    setTimeout(() => {
        const finalsTab = document.getElementById('Finals');
        const finalsButton = document.querySelector('a[data-tab="Finals"]');

        if (finalsTab && finalsTab.children.length === 0) {
            console.log('Empty Finals tab found, initializing');
            initializeFinalsTab();
        }

        if (finalsTab && finalsTab.classList.contains('active')) {
            console.log('Active Finals tab found, initializing');
            initializeFinalsTab();
        }

    }, 500);
});