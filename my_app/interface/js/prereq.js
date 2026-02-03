
import { showNotification } from './notifications.js';

export async function fetchPrereqTree(courseCode) {
    try {
        const response = await fetch(`/api/graph?course_code=${encodeURIComponent(courseCode)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch prerequisites');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching prerequisites:', error);
        showNotification('Error fetching prerequisites. Please try again.', 'error');
        throw error;
    }
}

export async function visualizePrereqTree(courseCode, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found');
        return;
    }
    container.innerHTML = '<div class="loading">Loading prerequisites...</div>';
    try {
        const data = await fetchPrereqTree(courseCode);
        container.innerHTML = '';
        const pills = new Set();
        container.appendChild(renderPrereqNode(data, pills));
        container.appendChild(renderCoursePills(Array.from(pills)));
    } catch (error) {
        container.innerHTML = '<div class="error">Error loading prerequisites. Please try again.</div>';
    }
}

function renderPrereqNode(node, pills) {
    if (node.type === 'AND' || node.type === 'OR') {
        const group = document.createElement('div');
        group.className = node.type === 'AND' ? 'prereq-and-group' : 'prereq-or-group';
        group.innerHTML = `<div class="prereq-group-label">${node.label || (node.type === 'AND' ? 'Complete ALL' : 'Complete ONE of the following')}</div>`;
        node.requirements.forEach(child => group.appendChild(renderPrereqNode(child, pills)));
        return group;
    } else {
        pills.add(node.course_code);
        const card = document.createElement('div');
        card.className = 'prereq-card';
        card.innerHTML = `<div class="prereq-title">${node.course_code} - ${node.course_title}</div>`;
        if (!node.prerequisites || node.prerequisites.length === 0) {
            card.innerHTML += `<div class="prereq-none">No further prerequisites</div>`;
        } else {
            node.prerequisites.forEach(child => card.appendChild(renderPrereqNode(child, pills)));
        }
        return card;
    }
}

function renderCoursePills(courses) {
    const pillsDiv = document.createElement('div');
    pillsDiv.className = 'prereq-pills';
    courses.forEach(code => {
        const pill = document.createElement('button');
        pill.className = 'prereq-pill';
        pill.textContent = code;
        pill.onclick = () => {
            const el = document.querySelector(`.prereq-title:contains('${code}')`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        pillsDiv.appendChild(pill);
    });
    return pillsDiv;
}

function getMockPrereqData(courseCode) {
    return {
        nodes: [
            {
                id: courseCode,
                name: courseCode,
                type: 'course',
                level: 0,
                isRoot: true
            },
            {
                id: 'MATH231',
                name: 'MATH 231',
                type: 'course',
                level: 1
            },
            {
                id: 'CPSC121',
                name: 'CPSC 121',
                type: 'course',
                level: 1
            }
        ],
        edges: [
            {
                from: courseCode,
                to: 'MATH231',
                type: 'AND'
            },
            {
                from: courseCode,
                to: 'CPSC121',
                type: 'AND'
            }
        ]
    };
}

function createPrereqGraph(data, container) {
    
    container.innerHTML = '';

    if (!data || (!data.nodes?.length && !data.edges?.length)) {
        container.innerHTML = `
            <div class="no-prerequisites">
                <p>No prerequisites found for this course.</p>
            </div>
        `;
        return;
    }

    const graph = document.createElement('div');
    graph.className = 'prereq-graph';

    const rootNode = data.nodes.find(n => n.isRoot);
    if (rootNode) {
        graph.appendChild(createNode(rootNode, data));
    }

    container.appendChild(graph);
}

function createNode(node, data) {
    const nodeElement = document.createElement('div');
    nodeElement.className = 'prereq-node';
    if (node.isRoot) nodeElement.classList.add('current-course');

    nodeElement.innerHTML = `
        <div class="course-code">${node.name}</div>
    `;

    const childEdges = data.edges.filter(e => e.from === node.id);
    if (childEdges.length > 0) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'prereq-children';

        childEdges.forEach(edge => {
            const childNode = data.nodes.find(n => n.id === edge.to);
            if (childNode) {
                const childElement = createNode(childNode, data);
                const arrow = document.createElement('div');
                arrow.className = 'prereq-arrow';
                childrenContainer.appendChild(arrow);
                childrenContainer.appendChild(childElement);
            }
        });

        nodeElement.appendChild(childrenContainer);
    }

    return nodeElement;
}

export function initializePrerequisitesTab() {
    const searchForm = document.getElementById('prereq-search-form');
    const courseInput = document.getElementById('prereq-course-input');
    const exampleButtons = document.querySelectorAll('.prereq-example-btn');
    const graphContainer = document.getElementById('prereq-graph-container');

    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const courseCode = courseInput.value.trim().toUpperCase();
            if (!courseCode) {
                showNotification('Please enter a course code', 'error');
                return;
            }

            graphContainer.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading prerequisite data...</p>
                </div>
            `;

            try {
                
                const response = await fetch(`/api_bp/graph?course_code=${encodeURIComponent(courseCode)}`);
                let data;
                
                if (!response.ok) {
                    console.log('Backend not available, using mock data');
                    data = getMockPrereqData(courseCode);
                } else {
                    data = await response.json();
                }

                createPrereqGraph(data, graphContainer);
            } catch (error) {
                console.error('Error fetching prerequisites:', error);
                
                const mockData = getMockPrereqData(courseCode);
                createPrereqGraph(mockData, graphContainer);
            }
        });
    }

    exampleButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (courseInput && searchForm) {
                courseInput.value = button.textContent;
                searchForm.dispatchEvent(new Event('submit'));
            }
        });
    });
}

async function checkBackendConnection() {
  try {
    const response = await fetch('/api/health-check', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch (error) {
    console.error('Backend connection check failed:', error);
    return false;
  }
}

function getMockPrerequisiteData(courseCode) {
  const normalized = courseCode.toUpperCase().replace(/\s+/g, '');
  const mockDataset = {
    "CPSC310": {
      course: { code: "CPSC 310", title: "Introduction to Software Engineering" },
      prerequisites: [
        { code: "CPSC 210", title: "Software Construction" },
        { code: "CPSC 213", title: "Introduction to Computer Systems" },
        { code: "CPSC 221", title: "Basic Algorithms and Data Structures" }
      ]
    },
    "CPSC210": {
      course: { code: "CPSC 210", title: "Software Construction" },
      prerequisites: [
        { code: "CPSC 110", title: "Computation, Programs, and Programming" }
      ]
    }
    
  };
  return mockDataset[normalized] || null;
}
