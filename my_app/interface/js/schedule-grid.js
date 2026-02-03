
const START_HOUR = 8; 
const END_HOUR = 21;  
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function initializeScheduleGrid() {
  console.log('Initializing simplified schedule grid...');
  
  let container = document.querySelector('.schedule-container');
  if (!container) {
    console.log('Creating new schedule container...');
    container = document.createElement('div');
    container.className = 'schedule-container';
    
    const contentContainer = document.querySelector('.content-container');
    if (contentContainer) {
      contentContainer.appendChild(container);
    } else {
      console.error('Could not find content container to append schedule to');
      
      const scheduleTab = document.getElementById('Schedule');
      if (scheduleTab) {
        scheduleTab.appendChild(container);
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
  
  DAYS.forEach(day => {
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
    timeLabel.textContent = formatTime(hour);
    timeRow.appendChild(timeLabel);
    
    for (let i = 0; i < DAYS.length; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.day = i;
      cell.dataset.hour = hour;
      timeRow.appendChild(cell);
    }
  }
  
  addTestCourseBlock(grid);
  
  console.log('Schedule grid initialized successfully');
  
  const scheduleTab = document.getElementById('Schedule');
  if (scheduleTab) {
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
      tab.style.display = 'none';
    });
    
    scheduleTab.classList.add('active');
    scheduleTab.style.display = 'block';
    
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const scheduleButton = document.querySelector('.tab-button[data-tab="Schedule"]');
    if (scheduleButton) {
      scheduleButton.classList.add('active');
    }
  }
}

function formatTime(hour) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
}

function addTestCourseBlock(grid) {
  
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
  
  course.addEventListener('click', () => {
    alert('Test course clicked!');
  });
  
  cell.appendChild(course);
}

document.addEventListener('DOMContentLoaded', () => {
  
  const scheduleBtn = document.querySelector('.tab-button[data-tab="Schedule"]');
  if (scheduleBtn) {
    scheduleBtn.addEventListener('click', () => {
      console.log('Schedule button clicked directly');
      setTimeout(initializeScheduleGrid, 50);
    });
  }
  
  window.initializeScheduleGrid = initializeScheduleGrid;
}); 

export function createScheduleGrid() {
  const container = document.getElementById('schedule-container');
  if (!container) return;
  
  container.classList.remove('show-pdf');

  container.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'schedule-grid';

  const days = ['', 'M', 'T', 'W', 'R', 'F'];
  const times = [
    '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm',
    '4pm', '5pm', '6pm', '7pm', '8pm', '9pm'
  ];

  days.forEach((day, i) => {
    const cell = document.createElement('div');
    cell.className = day ? 'grid-header' : '';
    cell.textContent = day;
    if (i > 0) {
      cell.setAttribute('data-day-index', i - 1);
      cell.style.cursor = 'pointer';
      cell.addEventListener('click', function() {
        const dayIdx = i - 1;
        cell.classList.toggle('day-toggled');
        
        const allCells = container.querySelectorAll(`.grid-cell[data-day-index='${dayIdx}']`);
        allCells.forEach(c => c.classList.toggle('day-toggled'));
      });
    }
    grid.appendChild(cell);
  });

  times.forEach((time, rowIdx) => {
    
    const timeCell = document.createElement('div');
    timeCell.className = 'time-label';
    timeCell.textContent = time;
    grid.appendChild(timeCell);

    for (let i = 0; i < 5; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.setAttribute('data-day-index', i);
      grid.appendChild(cell);
    }
  });

  container.appendChild(grid);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createScheduleGrid);
} else {
  createScheduleGrid();
}

window.createScheduleGrid = createScheduleGrid; 