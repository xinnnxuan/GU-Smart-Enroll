import { getAuthToken } from './sessions.js';
import config from '../../config.js';

const API_BASE = config.apiBaseUrl || '';

const IS_DEV_MODE = true;

export async function checkBackendConnection() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_BASE}/user_bp/login`, {
      method: 'OPTIONS',
      cache: 'no-cache',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('Backend connection check failed:', error.message);
    return false;
  }
}

export async function loginUser(username, password) {
  try {
    const isConnected = await checkBackendConnection();
    
    if (!isConnected) {
      console.log('Backend unavailable, using demo mode');
      
      const displayName = username.includes('@') ? username.split('@')[0] : username;
      const email = username.includes('@') ? username : `${username}@zagmail.gonzaga.edu`;
      
      return {
        success: true,
        user: {
          user_id: 'demo123',
          name: displayName,
          username: username,
          email: email
        },
        token: 'demo-token'
      };
    }
    
    const response = await fetch(`${API_BASE}/user_bp/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        username: username,
        password: password 
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } else {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Login failed. Please check your credentials.'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    
    const displayName = username.includes('@') ? username.split('@')[0] : username;
    const email = username.includes('@') ? username : `${username}@zagmail.gonzaga.edu`;
    
    return {
      success: true,
      user: {
        user_id: 'demo123',
        name: displayName,
        username: username,
        email: email
      },
      token: 'demo-token'
    };
  }
}

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE}/user_bp/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }
  
  return response.json();
}

export async function logoutUser() {
  const token = getAuthToken();
  
  if (!token) return;
  
  try {
    await fetch(`${API_BASE}/user_bp/logout`, {
    method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.warn('Logout error:', error);
  }
}

export async function getUserProfile() {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }
  
  const response = await fetch(`${API_BASE}/user_bp/user`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  
  return response.json();
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  const headers = {
    ...options.headers || {},
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    } catch {
      throw new Error(`API error: ${response.status}`);
    }
  }
  
  return response.json();
}

export async function fetchCourses() {
  try {
  const res = await fetch(`${API_BASE}/courses_bp/`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export async function fetchSections(courseId) {
  try {
  const res = await fetch(
    `${API_BASE}/courses_bp/sections/${encodeURIComponent(courseId)}`
  );
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export async function fetchProfessors() {
  try {
    const res = await fetch(`${API_BASE}/courses_bp/professors`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export async function fetchPrereq(courseCode, includeAllLevels = true) {
  try {
    const url = `${API_BASE}/api_bp/graph?course=${encodeURIComponent(courseCode)}&all=${includeAllLevels}`;
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Status ${res.status}`);
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export async function fetchPrereqTree(courseCode) {
  return {
    course_code: courseCode,
    course_title: "Demo Course",
    prerequisites: [
      {
        type: "AND",
        label: "Complete ALL",
        requirements: [
          {
            type: "OR",
            label: "Complete ONE of the following",
            requirements: [
              {
                course_code: "CPSC 121",
                course_title: "Computer Science I",
                prerequisites: []
              },
              {
                course_code: "ENSC 201",
                course_title: "Programming for Engineers",
                prerequisites: []
              }
            ]
          }
        ]
      }
    ]
  };
}

export async function enrollCourse(userId, sectionId, options = {}) {
  return { success: true, message: "Enrolled in course (demo mode)" };
}

export async function searchSections(filters = {}) {
  const params = new URLSearchParams();
  if (filters.subject)    params.append('subject',     filters.subject);
  if (filters.courseCode) params.append('course_code', filters.courseCode);
  if (filters.attribute)  params.append('attribute',   filters.attribute);
  if (filters.instructor) params.append('instructor',  filters.instructor);

  const res = await fetch(`/sections_bp/search?${params}`);
  return res.ok
    ? { success: true, data: await res.json() }
    : { success: false, error: `Status ${res.status}` };
}

export async function exportToAppleCalendar(eventData) {
  try {
    const res = await fetch(`${API_BASE}/export_bp/apple-calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: eventData })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export async function exportToGoogleCalendar(eventData) {
  try {
    const res = await fetch(`${API_BASE}/export_bp/google-calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: eventData })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export async function fetchSubjects() {
  try {
    const result = await apiRequest('/courses/subjects');
    return result.subjects;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return getMockSubjects();
  }
}

export async function fetchAttributes() {
  try {
    const result = await apiRequest('/courses/attributes');
    return result.attributes;
  } catch (error) {
    console.error('Error fetching attributes:', error);
    return getMockAttributes();
  }
}

export async function fetchCampuses() {
  try {
    const result = await apiRequest('/courses/campuses');
    return result.campuses;
  } catch (error) {
    console.error('Error fetching campuses:', error);
    return getMockCampuses();
  }
}

export async function fetchInstructors() {
  try {
    const result = await apiRequest('/courses/instructors');
    return result.instructors;
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return getMockInstructors();
  }
}

function getMockSubjects() {
  return [
    { code: 'ACCT', name: 'Accounting' },
    { code: 'BUSN', name: 'Business' },
    { code: 'CHEM', name: 'Chemistry' },
    { code: 'CPSC', name: 'Computer Science' },
    { code: 'ECON', name: 'Economics' },
    { code: 'ENGL', name: 'English' },
    { code: 'HIST', name: 'History' },
    { code: 'MATH', name: 'Mathematics' },
    { code: 'PHIL', name: 'Philosophy' },
    { code: 'PHYS', name: 'Physics' },
    { code: 'PSYC', name: 'Psychology' },
    { code: 'RELI', name: 'Religious Studies' }
  ];
}

function getMockAttributes() {
  return [
    { code: 'CORE', description: 'Core Curriculum' },
    { code: 'WRIT', description: 'Writing Enriched' },
    { code: 'GLBL', description: 'Global Studies' },
    { code: 'SOSC', description: 'Social Sciences' },
    { code: 'NSCI', description: 'Natural Sciences' },
    { code: 'FNRT', description: 'Fine Arts' },
    { code: 'ETHC', description: 'Ethics' }
  ];
}

function getMockCampuses() {
  return [
    { code: 'MAIN', name: 'Main Campus' },
    { code: 'FLRN', name: 'Florence, Italy' },
    { code: 'ONLN', name: 'Online' }
  ];
}

function getMockInstructors() {
  return [
    { id: 1, name: "Dr. Smith, John" },
    { id: 2, name: "Dr. Johnson, Maria" },
    { id: 3, name: "Dr. Williams, David" },
    { id: 4, name: "Dr. Brown, Patricia" },
    { id: 5, name: "Dr. Jones, Michael" },
    { id: 6, name: "Dr. Garcia, Linda" },
    { id: 7, name: "Dr. Miller, Robert" },
    { id: 8, name: "Dr. Davis, Barbara" },
    { id: 9, name: "Dr. Rodriguez, James" },
    { id: 10, name: "Dr. Martinez, Elizabeth" },
    { id: 11, name: "Dr. Hernandez, William" },
    { id: 12, name: "Dr. Lopez, Jennifer" },
    { id: 13, name: "Dr. Wilson, Thomas" },
    { id: 14, name: "Dr. Anderson, Margaret" },
    { id: 15, name: "Dr. Thomas, Christopher" },
    { id: 16, name: "Prof. Moore, Jessica" },
    { id: 17, name: "Prof. Martin, Daniel" },
    { id: 18, name: "Prof. Lee, Dorothy" },
    { id: 19, name: "Prof. Perez, Matthew" },
    { id: 20, name: "Prof. Thompson, Sarah" }
  ];
}

function getMockCourses() {
  return [
    {
            id: "CPSC325",
            title: "Object-Oriented Programming",
      subject: "CPSC",
            courseNumber: "325",
      credits: 3,
            sections: [
                {
                    crn: "12345",
                    instructor: "Dr. Smith",
                    schedule: "MWF 10:00-10:50",
                    location: "Herak 235",
                    available: 15,
                    total: 30
                }
            ]
    },
    {
            id: "CPSC321",
            title: "Database Management",
      subject: "CPSC",
            courseNumber: "321",
      credits: 3,
            sections: [
                {
                    crn: "12346",
                    instructor: "Dr. Johnson",
                    schedule: "TR 11:00-12:15",
                    location: "Herak 236",
                    available: 10,
                    total: 25
                }
            ]
        }
    ];
}

export async function fetchCoursesBySearch(subject, courseCode, instructor, attributes, campus, levels) {
    console.log('Search parameters:', { subject, courseCode, instructor, attributes, campus, levels });
    
    try {
        const url = new URL(`${API_BASE}/sections_bp/search`);
        
        if (subject) url.searchParams.append('subject', subject);
        if (courseCode) url.searchParams.append('course_code', courseCode);
        if (instructor) url.searchParams.append('instructor', instructor);
        if (attributes) url.searchParams.append('attribute', attributes);
        if (campus) url.searchParams.append('campus', campus);
        if (levels && levels.length > 0) url.searchParams.append('levels', levels.join(','));
        
        const response = await fetch(url);
        
        if (!response.ok) {
            console.log('Backend not available, using mock data');
            return getMockCourses();
        }
        
        return await response.json();
    } catch (error) {
        console.log('Error fetching courses, using mock data:', error);
        return getMockCourses();
    }
}

window.fetchCoursesBySearch = fetchCoursesBySearch;
