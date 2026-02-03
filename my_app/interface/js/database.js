
export async function fetchAllCourses() {
  try {
    
    const backendAvailable = await checkBackendConnection();
    if (!backendAvailable) {
      console.warn('Backend server is not available, using mock course data');
      return getMockCourses();
    }

    const response = await fetch('/api/db/courses');
    
    if (!response.ok) {
      throw new Error(`Error fetching courses: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    throw error;
  }
}

export async function fetchCourseSections(courseId) {
  try {
    
    const backendAvailable = await checkBackendConnection();
    if (!backendAvailable) {
      console.warn('Backend server is not available, using mock section data');
      return getMockSections(courseId);
    }

    const response = await fetch(`/api/db/sections/${courseId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching sections: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error(`Failed to fetch sections for course ${courseId}:`, error);
    throw error;
  }
}

export async function fetchAllProfessors() {
  try {
    
    const backendAvailable = await checkBackendConnection();
    if (!backendAvailable) {
      console.warn('Backend server is not available, using mock professor data');
      return getMockProfessors();
    }

    const response = await fetch('/api/db/professors');
    
    if (!response.ok) {
      throw new Error(`Error fetching professors: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Failed to fetch professors:', error);
    throw error;
  }
}

async function checkBackendConnection() {
  try {
    const response = await fetch('/api/health-check', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Backend connection check failed:', error);
    return false;
  }
}

function getMockCourses() {
  return [
    {
      code: "CPSC 121",
      title: "Computer Science I",
      credits: 3,
      description: "Introduction to problem solving, algorithm development and implementation using C++.",
      prerequisite: ""
    },
    {
      code: "CPSC 122",
      title: "Computer Science II",
      credits: 3,
      description: "Continuation of CPSC 121. Emphasis on data structures, recursion and object-oriented programming.",
      prerequisite: "CPSC 121"
    },
    {
      code: "CPSC 223",
      title: "Algorithms and Abstract Data Structures",
      credits: 3,
      description: "Study of data structures, algorithms, abstract data types and problem-solving techniques.",
      prerequisite: "CPSC 122"
    },
    {
      code: "MATH 157",
      title: "Calculus for Information Sciences",
      credits: 4,
      description: "Calculus concepts for students in information sciences and related fields.",
      prerequisite: ""
    },
    {
      code: "CPSC 224",
      title: "Software Development",
      credits: 3,
      description: "Practical experience in modern software development techniques.",
      prerequisite: "CPSC 122"
    }
  ];
}

function getMockSections(courseId) {
  const mockSectionsByCourse = {
    "CPSC 121": [
      {
        section: "01",
        course_id: "CPSC 121",
        term: "Fall 2025",
        instructor_id: "J. Smith",
        days: "MWF",
        time_slot: "10:00 AM - 10:50 AM",
        classroom: "Herak 315",
        rm: 15,
        act: 20,
        credits: 3
      },
      {
        section: "02",
        course_id: "CPSC 121",
        term: "Fall 2025",
        instructor_id: "M. Johnson",
        days: "TR",
        time_slot: "2:30 PM - 3:45 PM",
        classroom: "Herak 317",
        rm: 5,
        act: 30,
        credits: 3
      }
    ],
    "CPSC 122": [
      {
        section: "01",
        course_id: "CPSC 122",
        term: "Fall 2025",
        instructor_id: "P. Garcia",
        days: "MWF",
        time_slot: "11:00 AM - 11:50 AM",
        classroom: "Herak 315",
        rm: 10,
        act: 25,
        credits: 3
      }
    ]
  };
  
  return mockSectionsByCourse[courseId] || [];
}

function getMockProfessors() {
  return [
    {
      id: 1,
      name: "John Smith",
      department: "Computer Science",
      email: "jsmith@university.edu",
      office_hours: "MWF 1-3pm"
    },
    {
      id: 2,
      name: "Maria Johnson",
      department: "Computer Science",
      email: "mjohnson@university.edu",
      office_hours: "TR 10am-12pm"
    },
    {
      id: 3,
      name: "Paul Garcia",
      department: "Computer Science",
      email: "pgarcia@university.edu",
      office_hours: "MW 2-4pm"
    },
    {
      id: 4,
      name: "Sarah Lee",
      department: "Mathematics",
      email: "slee@university.edu",
      office_hours: "TR 1-3pm"
    }
  ];
} 