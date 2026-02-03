
export function getDayIndex(day) {
    const dayMap = {
        'M': 0,
        'T': 1,
        'W': 2,
        'R': 3,
        'F': 4
    };
    return dayMap[day] || -1;
}

export function getDayName(day) {
    const dayNames = {
        'M': 'Monday',
        'T': 'Tuesday',
        'W': 'Wednesday',
        'R': 'Thursday',
        'F': 'Friday'
    };
    return dayNames[day] || day;
}

export function getRandomCourseColor(courseId = null) {
    
    const colors = [
        '#4285f4', 
        '#ea4335', 
        '#fbbc05', 
        '#34a853', 
        '#8b5cf6', 
        '#ec4899', 
        '#06b6d4', 
        '#84cc16', 
        '#f59e0b', 
        '#3b82f6', 
        '#ef4444', 
        '#10b981', 
        '#6366f1', 
        '#14b8a6', 
        '#f97316', 
        '#a855f7'  
    ];
    
    if (!window.courseColorMap) {
        window.courseColorMap = {};
        console.log("Initialized new course color map as object");
    }
    
    if (!courseId) {
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    console.log(`Getting color for course: "${courseId}"`);
    
    if (window.courseColorMap[courseId]) {
        console.log(`Using existing color for ${courseId}: ${window.courseColorMap[courseId]}`);
        return window.courseColorMap[courseId];
    }
    
    const usedColors = Object.values(window.courseColorMap);
    console.log("Currently used colors:", usedColors);
    
    const availableColors = colors.filter(color => !usedColors.includes(color));
    
    let selectedColor;
    if (availableColors.length > 0) {
        
        selectedColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        console.log(`Selected unused color for ${courseId}: ${selectedColor}`);
    } else {
        
        selectedColor = colors[Math.floor(Math.random() * colors.length)];
        console.log(`All colors used, selected random color for ${courseId}: ${selectedColor}`);
    }
    
    window.courseColorMap[courseId] = selectedColor;
    console.log(`Assigned color for ${courseId}: ${selectedColor}`);
    console.log("Updated course color map:", window.courseColorMap);
    
    return selectedColor;
}

export function findTimeRow(timeText) {
    try {
        
        const timeParts = timeText.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
        if (!timeParts) return null;
        
        let hours = parseInt(timeParts[1], 10);
        const minutes = timeParts[2] ? parseInt(timeParts[2], 10) : 0;
        const period = timeParts[3] ? timeParts[3].toUpperCase() : null;
        
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        const totalMinutes = hours * 60 + minutes;
        
        const timeRows = Array.from(document.querySelectorAll('.schedule-grid tbody tr'));
        if (!timeRows.length) {
            console.error('No time rows found in schedule grid');
            return null;
        }
        
        for (const row of timeRows) {
            const timeCell = row.querySelector('td:first-child');
            if (!timeCell) continue;
            
            const cellText = timeCell.textContent.trim();
            const cellTimeParts = cellText.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
            
            if (cellTimeParts) {
                let cellHours = parseInt(cellTimeParts[1], 10);
                const cellMinutes = cellTimeParts[2] ? parseInt(cellTimeParts[2], 10) : 0;
                const cellPeriod = cellTimeParts[3] ? cellTimeParts[3].toUpperCase() : null;
                
                if (cellPeriod === 'PM' && cellHours < 12) cellHours += 12;
                if (cellPeriod === 'AM' && cellHours === 12) cellHours = 0;
                
                const cellTotalMinutes = cellHours * 60 + cellMinutes;
                
                if (cellHours === hours && Math.abs(cellMinutes - minutes) < 15) {
                    console.log(`Found exact time match: ${cellText} for ${timeText}`);
                    return row;
                }
            }
        }
        
        let closestRow = null;
        let smallestDifference = Infinity;
        
        for (const row of timeRows) {
            const timeCell = row.querySelector('td:first-child');
            if (!timeCell) continue;
            
            const cellText = timeCell.textContent.trim();
            const cellTimeParts = cellText.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
            
            if (cellTimeParts) {
                let cellHours = parseInt(cellTimeParts[1], 10);
                const cellMinutes = cellTimeParts[2] ? parseInt(cellTimeParts[2], 10) : 0;
                const cellPeriod = cellTimeParts[3] ? cellTimeParts[3].toUpperCase() : null;
                
                if (cellPeriod === 'PM' && cellHours < 12) cellHours += 12;
                if (cellPeriod === 'AM' && cellHours === 12) cellHours = 0;
                
                const cellTotalMinutes = cellHours * 60 + cellMinutes;
                
                if (cellTotalMinutes <= totalMinutes) {
                    const difference = totalMinutes - cellTotalMinutes;
                    
                    if (difference < smallestDifference) {
                        smallestDifference = difference;
                        closestRow = row;
                    }
                }
            }
        }
        
        if (closestRow) {
            const timeCell = closestRow.querySelector('td:first-child');
            console.log(`Found closest time match: ${timeCell.textContent.trim()} for ${timeText} (difference: ${smallestDifference} minutes)`);
        } else {
            console.warn(`No suitable time row found for ${timeText}`);
        }
        
        return closestRow;
    } catch (error) {
        console.error('Error finding time row:', error);
        return null;
    }
}

export function getNextMonday() {
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilMonday = currentDay === 0 ? 1 : 8 - currentDay;
    today.setDate(today.getDate() + daysUntilMonday);
    return today;
}

export function formatDateForICS(date, hours, minutes) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
        'T',
        String(hours).padStart(2, '0'),
        String(minutes).padStart(2, '0'),
        '00'
    ].join('');
}

export function parseTimeToHour(timeString) {
    try {
        let normalizedTime = timeString.trim().replace(/\s+/g, ' ');
        normalizedTime = normalizedTime.replace(/(\d+:\d+)([AaPp][Mm])/, '$1 $2');
        const timeMatch = normalizedTime.match(/(\d+):(\d+)\s*([AaPp][Mm])?/i);
        if (!timeMatch) return NaN;

        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const period = timeMatch[3] ? timeMatch[3].toUpperCase() : null;

        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return hours + (minutes / 60);
    } catch (error) {
        console.error('Error parsing time:', error, timeString);
        return NaN;
    }
}

export function getCurrentTimestamp() {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function parseSemester(semester) {
    const parts = semester.split(' ');
    return {
        season: parts[0],
        year: parseInt(parts[1])
    };
}

export function getSemesterDates(year, season) {
    let startDate, endDate;
    if (season === 'Spring') {
        startDate = new Date(year, 0, 15);
        endDate = new Date(year, 4, 15);
    } else if (season === 'Fall') {
        startDate = new Date(year, 7, 20);
        endDate = new Date(year, 11, 15);
    } else if (season === 'Summer') {
        startDate = new Date(year, 4, 20);
        endDate = new Date(year, 7, 10);
    } else {
        startDate = new Date();
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 4);
    }
    return { startDate, endDate };
}

export function formatDateString(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('');
}

export function formatTimeForICS(timeStr) {
    let hours = 0;
    let minutes = 0;
    const ampmMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (ampmMatch) {
        hours = parseInt(ampmMatch[1]);
        minutes = parseInt(ampmMatch[2]);
        if (ampmMatch[3]?.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampmMatch[3]?.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`;
}

export function getNextWeekday(day) {
    const dayMap = { MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6, SU: 0 };
    const targetDay = dayMap[day];
    const today = new Date();
    const daysUntil = (targetDay - today.getDay() + 7) % 7;
    today.setDate(today.getDate() + daysUntil);
    return today;
}

export function formatEndpointName(endpoint) {
    return endpoint
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function parseTime(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    return { startHour, startMinute, endHour, endMinute };
}
