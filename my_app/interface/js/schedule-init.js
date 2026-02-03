
document.addEventListener('DOMContentLoaded', function() {
  console.log('Schedule initializer running');
  
  setupScheduleTabListener();
  
  checkAndInitializeIfOnScheduleTab();
});

function setupScheduleTabListener() {
  const scheduleTabButton = document.querySelector('.tab-button[data-tab="Schedule"]');
  if (!scheduleTabButton) {
    console.error('Schedule tab button not found');
    return;
  }
  
  scheduleTabButton.addEventListener('click', function() {
    console.log('Schedule tab button clicked from schedule-init.js');
    
    setTimeout(function() {
      initializeScheduleGridWithFallbacks();
    }, 10);
  });
}

function checkAndInitializeIfOnScheduleTab() {
  const activeTab = document.querySelector('.tab-button.active');
  if (activeTab && activeTab.getAttribute('data-tab') === 'Schedule') {
    console.log('Already on Schedule tab, initializing grid');
    initializeScheduleGridWithFallbacks();
  }
}

function initializeScheduleGridWithFallbacks() {
  console.log('Attempting to initialize schedule grid with fallbacks');
  
  if (typeof window.initializeScheduleGrid === 'function') {
    console.log('Using global initializeScheduleGrid function');
    try {
      window.initializeScheduleGrid();
      return;
    } catch (e) {
      console.error('Error with global initializeScheduleGrid:', e);
    }
  }
  
  if (typeof window.directInitializeScheduleGrid === 'function') {
    console.log('Using direct implementation from index.html');
    try {
      window.directInitializeScheduleGrid();
      return;
    } catch (e) {
      console.error('Error with directInitializeScheduleGrid:', e);
    }
  }
  
  console.log('Trying dynamic import of schedule modules');
  Promise.all([
    import('./schedule-grid.js').catch(() => null),
    import('./schedule.js').catch(() => null)
  ]).then(function(modules) {
    const gridModule = modules[0];
    const scheduleModule = modules[1];
    
    if (gridModule && typeof gridModule.initializeScheduleGrid === 'function') {
      console.log('Using schedule-grid.js module');
      gridModule.initializeScheduleGrid();
    } else if (scheduleModule && typeof scheduleModule.initializeScheduleGrid === 'function') {
      console.log('Using schedule.js module');
      scheduleModule.initializeScheduleGrid();
    } else {
      console.error('Could not find any schedule initialization function');
      
      inlineScheduleGridImplementation();
    }
  }).catch(function(error) {
    console.error('Error importing schedule modules:', error);
    
    inlineScheduleGridImplementation();
  });
}

function inlineScheduleGridImplementation() {
  console.log('Using inline implementation as last resort');
  
  const START_HOUR = 8; 
  const END_HOUR = 21;  
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  let container = document.querySelector('.schedule-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'schedule-container';
    
    const scheduleTab = document.getElementById('Schedule');
    if (scheduleTab) {
      scheduleTab.innerHTML = ''; 
      scheduleTab.appendChild(container);
    } else {
      const contentContainer = document.querySelector('.content-container');
      if (contentContainer) {
        contentContainer.appendChild(container);
      } else {
        document.body.appendChild(container); 
      }
    }
  }
  
  container.innerHTML = '';
  
  const grid = document.createElement('div');
  grid.className = 'schedule-grid';
  container.appendChild(grid);
  
  const headerRow = document.createElement('div');
  headerRow.className = 'grid-row';
  grid.appendChild(headerRow);
  
  const emptyHeader = document.createElement('div');
  emptyHeader.className = 'grid-header empty';
  headerRow.appendChild(emptyHeader);
  
  DAYS.forEach(function(day) {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'grid-header';
    dayHeader.textContent = day;
    headerRow.appendChild(dayHeader);
  });
  
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    const timeRow = document.createElement('div');
    timeRow.className = 'grid-row';
    grid.appendChild(timeRow);
    
    const timeLabel = document.createElement('div');
    timeLabel.className = 'time-label';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    timeLabel.textContent = displayHour + ':00 ' + period;
    timeRow.appendChild(timeLabel);
    
    for (let i = 0; i < DAYS.length; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.day = i;
      cell.dataset.hour = hour;
      timeRow.appendChild(cell);
    }
  }
  
  addTestCourse(grid);
  
  console.log('Inline schedule grid implementation complete');
}

function addTestCourse(grid) {
  
  const cell = grid.querySelector('.grid-cell[data-day="0"][data-hour="10"]');
  if (!cell) return;
  
  const course = document.createElement('div');
  course.className = 'course-block lecture';
  course.style.height = '100%';
  course.innerHTML = `
    <div class="course-title">TEST COURSE</div>
    <div class="course-time">10:00 AM - 10:50 AM</div>
    <div class="course-location">Test Room 101</div>
  `;
  
  course.addEventListener('click', function() {
    alert('Test course clicked!');
  });
  
  cell.appendChild(course);
}

window.initializeScheduleGridWithFallbacks = initializeScheduleGridWithFallbacks;
window.inlineScheduleGridImplementation = inlineScheduleGridImplementation; 