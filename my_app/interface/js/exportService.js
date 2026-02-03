
export { checkBackendConnection, fetchSections };

function exportToAppleCalendar(eventData = null) {
    if (!eventData) {
        eventData = collectScheduleData();
    }
    
    exportToCalendar(eventData, 'apple-calendar');
}

function exportToGoogleCalendar(eventData = null) {
    if (!eventData) {
        eventData = collectScheduleData();
    }
    
    exportToCalendar(eventData, 'google-calendar');
}

function collectScheduleData() {
    
    console.log('Collecting schedule data for export...');
    
    const courseBlocks = document.querySelectorAll('.course-block');
    console.log('Found course blocks:', courseBlocks.length);
    
    if (courseBlocks.length === 0) {
        
        const altCourseBlocks = document.querySelectorAll('.schedule-grid td div[style*="background-color"]');
        console.log('Alternative course blocks found:', altCourseBlocks.length);
        
        if (altCourseBlocks.length > 0) {
            
            return Array.from(altCourseBlocks).map(block => {
                
                const courseInfo = block.textContent.trim();
                const titleMatch = courseInfo.match(/^([A-Z]+ \d+)/);
                const title = titleMatch ? titleMatch[1] : 'Course';
                
                const cell = block.closest('td');
                const row = cell.parentElement;
                const dayIndex = Array.from(row.cells).indexOf(cell) - 1; 
                
                const timeCell = row.cells[0];
                const timeText = timeCell.textContent.trim();
                
                return {
                    title: title,
                    location: 'Gonzaga University',
                    description: courseInfo,
                    day: getDayFromIndex(dayIndex),
                    startTime: timeText,
                    endTime: incrementHour(timeText),
                    instructor: 'Instructor'
                };
            });
        }
    }
    
    if (courseBlocks.length > 0) {
        return Array.from(courseBlocks).map(block => {
            const title = block.querySelector('.course-title')?.textContent || 'Course';
            const location = block.querySelector('.course-location')?.textContent || 'Gonzaga University';
            const description = block.textContent.trim();
            
            const cell = block.closest('td');
            const row = cell.parentElement;
            const dayIndex = Array.from(row.cells).indexOf(cell) - 1; 
            
            const timeCell = row.cells[0];
            const startTime = timeCell.textContent.trim();
            
            let endTime;
            if (block.dataset.endTime) {
                endTime = block.dataset.endTime;
            } else {
                
                const rowspan = parseInt(cell.getAttribute('rowspan')) || 1;
                endTime = incrementHoursByCount(startTime, rowspan);
            }
            
            return {
                title: title,
                location: location,
                description: description,
                day: getDayFromIndex(dayIndex),
                startTime: startTime,
                endTime: endTime,
                instructor: block.querySelector('.course-instructor')?.textContent || 'Instructor'
            };
        });
    }
    
    return [];
}

function incrementHour(timeStr) {
    const [time, period] = timeStr.split(' ');
    let [hour] = time.split(':');
    hour = parseInt(hour);
    
    if (hour === 12) {
        return `1:00 ${period}`;
    }
    
    hour += 1;
    
    if (hour === 12) {
        const newPeriod = period === 'AM' ? 'PM' : 'AM';
        return `${hour}:00 ${newPeriod}`;
    }
    
    return `${hour}:00 ${period}`;
}

function incrementHoursByCount(timeStr, count) {
    let result = timeStr;
    for (let i = 0; i < count; i++) {
        result = incrementHour(result);
    }
    return result;
}

function getDayFromIndex(index) {
    const days = ['', 'MO', 'TU', 'WE', 'TH', 'FR']; 
    return days[index] || '';
}

function exportToCalendar(eventData, endpoint) {
    console.log(`Exporting to ${endpoint}...`);
    console.log('Export data:', eventData);
    
    if (!eventData || eventData.length === 0) {
        showErrorMessage('No courses added to schedule yet. Add courses before exporting.');
        return;
    }
    
    const currentSemester = document.querySelector('.semester-button').textContent.trim();
    
    if (endpoint === 'apple-calendar') {
        
        generateAndDownloadICS(eventData, currentSemester);
        return;
    }
    
    const exportData = {
        events: eventData,
        semester: currentSemester,
        user: {
            name: 'John Doe', 
            id: '123456789'   
        }
    };
    
    const loadingIndicator = showLoadingIndicator();
    
    const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001' : '';
    fetch(`${apiBase}/export_bp/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(exportData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Export response:', data);
        
        if (data.success) {
            showSuccessMessage(`Successfully exported to ${formatEndpointName(endpoint)}`);
            
            if (endpoint === 'google-calendar') {
                
                const url = 'https://calendar.google.com/calendar/r/eventedit';
                window.open(url, '_blank');
            }
        } else {
            showErrorMessage(`Failed to export: ${data.error || 'Unknown error'}`);
        }
    })
    .catch(error => {
        console.error('Export error:', error);
        showErrorMessage(`Error: ${error.message}`);
    })
    .finally(() => {
        
        hideLoadingIndicator(loadingIndicator);
    });
}

function exportToICalendar() {
    const events = collectScheduleData();
    
    if (events.length === 0) {
        alert('No courses to export.');
        return;
    }
    
    const currentSemester = document.querySelector('.semester-button').textContent.trim();
    
    const now = getCurrentTimestamp();
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Gonzaga University//Course Schedule//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ].join('\r\n');
    
    events.forEach(event => {
        icsContent += generateEventICS(event, now, currentSemester);
    });
    
    icsContent += '\r\nEND:VCALENDAR';
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `GU_Schedule_${currentSemester.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccessMessage('Schedule exported to iCalendar file');
}

function formatEndpointName(endpoint) {
    return endpoint.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function testExportConnection() {
    console.log('Testing export connection...');
    
    const sampleEvent = {
        name: 'Test Course',
        day: 'MO',
        start_time: '10:00 AM',
        end_time: '11:00 AM',
        location: 'Test Location'
    };
    
    const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001' : '';
    fetch(`${apiBase}/export_bp/apple-calendar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            events: [sampleEvent],
            semester: 'Spring 2025',
            user: {
                name: 'Test User',
                id: '999999999'
            }
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Apple Calendar Export Test Response:', data);
        if (data.success) {
            console.log('✅ Apple Calendar export connection successful!');
        } else {
            console.error('❌ Apple Calendar export connection failed:', data.error);
        }
    })
    .catch(error => {
        console.error('❌ Apple Calendar export connection error:', error);
    });
    
    fetch(`${apiBase}/export_bp/google-calendar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            events: [sampleEvent],
            semester: 'Spring 2025',
            user: {
                name: 'Test User',
                id: '999999999'
            }
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Google Calendar Export Test Response:', data);
        if (data.success) {
            console.log('✅ Google Calendar export connection successful!');
        } else {
            console.error('❌ Google Calendar export connection failed:', data.error);
        }
    })
    .catch(error => {
        console.error('❌ Google Calendar export connection error:', error);
    });
}

async function checkBackendConnection() {
    try {
        const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001' : '';
        const response = await fetch(`${apiBase}/health`);
        return response.ok;
    } catch (error) {
        console.error('Backend connection check failed:', error);
        return false;
    }
}

async function fetchSections(criteria = {}) {
    try {
        const queryString = constructQueryString(criteria);
        const response = await fetch(`${apiBase}/sections?${queryString}`);
        if (!response.ok) throw new Error('Failed to fetch sections');
        return await response.json();
    } catch (error) {
        console.error('Error fetching sections:', error);
        return [];
    }
}

function constructQueryString(criteria) {
    if (!criteria || Object.keys(criteria).length === 0) {
        return '';
    }
    
    const params = new URLSearchParams();
    
    Object.entries(criteria).forEach(([key, value]) => {
        if (value) {
            params.append(key, value);
        }
    });
    
    return `?${params.toString()}`;
}
