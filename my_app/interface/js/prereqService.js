
export function fetchPrerequisites(courseCode, includeAllLevels = true) {
    
    const prereqInfo = document.querySelector('.prereq-info');
    if (prereqInfo) {
        prereqInfo.innerHTML = '<p style="text-align: center; color: #666;">Loading prerequisite data...</p>';
    }

    console.log(`Fetching prerequisites for ${courseCode}, all levels: ${includeAllLevels}`);

    console.log('Using mock data directly instead of trying to connect to backend');
    return new Promise((resolve) => {
        
        setTimeout(() => {
            const mockData = generateMockPrereqData(courseCode);
            console.log('Using mock data:', mockData);
            resolve(mockData);
        }, 500);
    });

}

function generateMockPrereqData(courseCode) {
    
    const formattedCode = courseCode.replace(/\s+/g, '').toUpperCase();
    let displayCode = courseCode;

    if (/^[A-Z]{2,4}\d{3,4}$/.test(formattedCode)) {
        displayCode = formattedCode.replace(/([A-Z]+)(\d+)/, '$1 $2');
    }

    const courseTitles = {
        'CPSC 121': 'Models of Computation',
        'CPSC 200': 'Computer Science 200 Introduction',
        'CPSC 221': 'Algorithms and Data Structures',
        'CPSC 210': 'Software Construction',
        'CPSC 325': 'Computer Science 325',
        'CPSC 300': 'Computer Science 300 Intermediate',
        'CPSC 313': 'Operating Systems',
        'CPSC 320': 'Algorithms and Complexity',
        'MATH 100': 'Calculus I',
        'MATH 101': 'Calculus II',
        'MATH 200': 'Multivariate Calculus',
        'MATH 221': 'Matrix Algebra',
    };

    const match = formattedCode.match(/([A-Z]+)(\d+)/);
    if (!match) {
        return {
            nodes: [
                { id: displayCode, name: displayCode }
            ],
            edges: []
        };
    }

    const [, subject, number] = match;
    const level = Math.floor(parseInt(number) / 100) * 100;

    if (displayCode === 'CPSC 325') {
        return {
            nodes: [
                { id: 'CPSC 325', name: 'Computer Science 325' },
                { id: 'CPSC 200', name: 'Computer Science 200 Introduction' },
            ],
            edges: [
                { source: 'CPSC 200', target: 'CPSC 325', relation: 'and', min_grade: 'C' }
            ]
        };
    }

    if (displayCode === 'CPSC 221') {
        return {
            nodes: [
                { id: 'CPSC 221', name: 'Algorithms and Data Structures' },
                { id: 'CPSC 121', name: 'Models of Computation' },
                { id: 'CPSC 210', name: 'Software Construction' },
            ],
            edges: [
                { source: 'CPSC 121', target: 'CPSC 221', relation: 'and', min_grade: 'C' },
                { source: 'CPSC 210', target: 'CPSC 221', relation: 'and', min_grade: 'C' }
            ]
        };
    }

    const mockData = {
        nodes: [
            { id: displayCode, name: courseTitles[displayCode] || `${subject} ${number}` }
        ],
        edges: []
    };

    if (level >= 200) {
        
        const prereq = `${subject} ${level-100}`;
        mockData.nodes.push({
            id: prereq,
            name: courseTitles[prereq] || `${subject} ${level-100} Introduction`
        });

        mockData.edges.push({
            source: prereq,
            target: displayCode,
            relation: 'and',
            min_grade: 'C'
        });

        if (level >= 300) {
            const prereq2 = `${subject} 221`;
            const prereq3 = `MATH 221`;

            mockData.nodes.push({
                id: prereq2,
                name: courseTitles[prereq2] || `${subject} 221`
            });

            mockData.nodes.push({
                id: prereq3,
                name: courseTitles[prereq3] || 'Matrix Algebra'
            });

            mockData.edges.push({
                source: prereq2,
                target: displayCode,
                relation: 'or',
                min_grade: 'C'
            });

            mockData.edges.push({
                source: prereq3,
                target: displayCode,
                relation: 'or',
                min_grade: 'C'
            });
        }
    }

    console.log('Generated mock data:', mockData);
    return mockData;
}

export function displayPrerequisiteTree(courseCode) {
    fetchPrerequisites(courseCode)
        .then(data => {
            renderPrerequisiteTree(data);
            
            displayTreeInMainGrid(data, courseCode);
        })
        .catch(error => {
            console.error('Failed to display prerequisite tree:', error);
        });
}

export function renderPrerequisiteTree(data) {
    const prereqInfo = document.querySelector('.prereq-info');
    if (!prereqInfo) return;

    prereqInfo.innerHTML = '';

    if (!data || !data.nodes || data.nodes.length === 0) {
        prereqInfo.innerHTML = `
            <p style="color: #0c5460; background-color: #d1ecf1; padding: 10px; border-radius: 4px;">
                No prerequisites found for this course.
            </p>
        `;
        return;
    }

    const treeContainer = document.createElement('div');
    treeContainer.id = 'prereq-tree-container';
    treeContainer.style.width = '100%';
    treeContainer.style.marginTop = '20px';
    treeContainer.style.maxHeight = '400px'; 
    treeContainer.style.overflowY = 'auto';  
    prereqInfo.appendChild(treeContainer);

    const rootNode = findRootNode(data.nodes, data.edges);
    if (rootNode) {
        
        const treeHtml = buildSidebarTreeHtml(rootNode, data.nodes, data.edges);
        treeContainer.innerHTML = treeHtml;
    } else {
        treeContainer.innerHTML = '<p>Could not determine the root course.</p>';
    }

    addCourseList(data.nodes, data.edges, prereqInfo);
}

export function buildSidebarTreeHtml(node, allNodes, allEdges, level = 0) {
    if (!node) return '';

    const prereqEdges = allEdges.filter(edge => edge.target === node.id);

    const padding = level * 15;
    const backgroundColor = level === 0 ? '#f8f9fa' : (level % 2 === 0 ? '#f8f9fa' : '#f1f3f5');
    const borderColor = level === 0 ? '#142A50' : (level === 1 ? '#6c757d' : '#adb5bd');

    let html = `
        <div class="prereq-node-sidebar" style="padding: 10px;
                                             margin: 5px 0;
                                             border-radius: 4px;
                                             background-color: ${backgroundColor};
                                             border-left: 3px solid ${borderColor};
                                             margin-left: ${padding}px;">
            <div style="font-weight: ${level === 0 ? '600' : '500'};
                      font-size: ${level === 0 ? '14px' : '13px'};
                      color: ${level === 0 ? '#142A50' : '#333'};">
                ${node.id} - ${node.name}
            </div>
    `;

    if (prereqEdges.length > 0) {
        
        const groupedByRelation = {};
        prereqEdges.forEach(edge => {
            const relation = edge.relation || 'and';
            if (!groupedByRelation[relation]) {
                groupedByRelation[relation] = [];
            }
            groupedByRelation[relation].push(edge);
        });

        Object.entries(groupedByRelation).forEach(([relation, edges]) => {
            if (edges.length > 0) {
                
                const relationBgColor = relation.toLowerCase() === 'or' ? '#fff5f5' : '#f1f3f5';
                const relationBorderColor = relation.toLowerCase() === 'or' ? '#c92a2a' : '#ced4da';
                const relationTextColor = relation.toLowerCase() === 'or' ? '#c92a2a' : '#495057';

                html += `
                    <div style="margin: 5px 0;
                              padding: 5px 8px;
                              background-color: ${relationBgColor};
                              border-left: 2px solid ${relationBorderColor};
                              color: ${relationTextColor};
                              font-size: 12px;
                              border-radius: 3px;">
                        ${relation.toLowerCase() === 'or' ? 'Complete ONE of:' : 'Complete ALL of:'}
                    </div>
                `;

                edges.forEach(edge => {
                    const prereqNode = allNodes.find(n => n.id === edge.source);
                    if (prereqNode) {
                        html += buildSidebarTreeHtml(prereqNode, allNodes, allEdges, level + 1);
                    }
                });
            }
        });
    } else if (level > 0) {
        
        html += `<div style="font-size: 12px; color: #6c757d; margin-top: 2px;">No further prerequisites</div>`;
    }

    html += `</div>`;
    return html;
}

export function findRootNode(nodes, edges) {
    if (!nodes || !edges || nodes.length === 0) {
        return null;
    }

    const targetIds = new Set(edges.map(edge => edge.target));
    const sourceIds = new Set(edges.map(edge => edge.source));

    const potentialRoots = Array.from(targetIds).filter(id => !sourceIds.has(id));

    if (potentialRoots.length > 0) {
        
        return nodes.find(node => node.id === potentialRoots[0]);
    }

    const targetCounts = {};
    edges.forEach(edge => {
        targetCounts[edge.target] = (targetCounts[edge.target] || 0) + 1;
    });

    let maxCount = 0;
    let rootId = null;

    Object.entries(targetCounts).forEach(([id, count]) => {
        if (count > maxCount) {
            maxCount = count;
            rootId = id;
        }
    });

    if (rootId) {
        return nodes.find(node => node.id === rootId);
    }

    return nodes[0];
}

export function addCourseList(nodes, edges, container) {
    if (!nodes || nodes.length <= 1) return;

    const courseListContainer = document.createElement('div');
    courseListContainer.style.marginTop = '30px';
    courseListContainer.style.padding = '15px';
    courseListContainer.style.backgroundColor = '#f8f9fa';
    courseListContainer.style.borderRadius = '4px';

    courseListContainer.innerHTML = `
        <h4 style="margin-top: 0; color: #142A50; font-size: 16px; margin-bottom: 10px;">All Courses in This Tree</h4>
        <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Click any course to see its details:</div>
        <div class="course-list" style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${nodes.map(node => `
                <button onclick="displayPrerequisiteTree('${node.id}')" style="background-color: white; border: 1px solid #ddd; border-radius: 4px; padding: 6px 12px; font-size: 13px; cursor: pointer; color: #333; transition: all 0.2s;">
                    ${node.id}
                </button>
            `).join('')}
        </div>
    `;

    container.appendChild(courseListContainer);
}

export function displayTreeInMainGrid(data, courseCode) {
    
    window.currentPrereqData = data;
    window.currentCourseCode = courseCode;

    const contentContainer = document.querySelector('.content-container');
    if (!contentContainer) return;

    const scheduleGrid = document.querySelector('.schedule-grid');
    if (scheduleGrid) {
        scheduleGrid.style.display = 'none';
    }

    let mainTreeContainer = document.querySelector('#main-prereq-container');
    if (!mainTreeContainer) {
        mainTreeContainer = document.createElement('div');
        mainTreeContainer.id = 'main-prereq-container';
        mainTreeContainer.style.flex = '1';
        mainTreeContainer.style.backgroundColor = 'white';
        mainTreeContainer.style.borderRadius = '8px';
        mainTreeContainer.style.boxShadow = '0 1px 10px rgba(0,0,0,0.1)';
        mainTreeContainer.style.padding = '20px';
        mainTreeContainer.style.display = 'flex';
        mainTreeContainer.style.flexDirection = 'column';
        contentContainer.appendChild(mainTreeContainer);
    }

    mainTreeContainer.innerHTML = '';

    const headerDiv = document.createElement('div');
    headerDiv.style.display = 'flex';
    headerDiv.style.justifyContent = 'space-between';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.marginBottom = '20px';
    headerDiv.style.borderBottom = '1px solid #e0e0e0';
    headerDiv.style.paddingBottom = '15px';

    const titleDiv = document.createElement('div');
    titleDiv.innerHTML = `
        <h2 style="margin: 0; color: #142A50; font-size: 22px;">Prerequisite Tree for ${courseCode}</h2>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
            ${data.nodes.find(n => n.id === courseCode)?.name || 'Course Details'}
        </p>
    `;
    headerDiv.appendChild(titleDiv);

    const backButton = document.createElement('button');
    backButton.textContent = 'Return to Schedule';
    backButton.style.padding = '10px 15px';
    backButton.style.backgroundColor = '#f8f9fa';
    backButton.style.border = '1px solid #ddd';
    backButton.style.borderRadius = '4px';
    backButton.style.fontSize = '14px';
    backButton.style.cursor = 'pointer';
    backButton.style.fontWeight = '500';
    backButton.style.display = 'flex';
    backButton.style.alignItems = 'center';
    backButton.style.color = '#333';

    backButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px;">
            <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
        </svg>
        Return to Schedule
    `;

    backButton.addEventListener('click', function() {
        restoreScheduleGrid();
    });

    headerDiv.appendChild(backButton);
    mainTreeContainer.appendChild(headerDiv);

    const legendDiv = document.createElement('div');
    legendDiv.style.display = 'flex';
    legendDiv.style.gap = '15px';
    legendDiv.style.marginBottom = '20px';
    legendDiv.style.padding = '10px';
    legendDiv.style.backgroundColor = '#f8f9fa';
    legendDiv.style.borderRadius = '4px';

    legendDiv.innerHTML = `
        <div style="display: flex; align-items: center;">
            <div style="width: 12px; height: 12px; background-color: #fff5f5; border: 1px solid #c92a2a; border-radius: 2px; margin-right: 5px;"></div>
            <span style="font-size: 13px; color: #333;">OR Relationship (Complete ONE)</span>
        </div>
        <div style="display: flex; align-items: center;">
            <div style="width: 12px; height: 12px; background-color: #f1f3f5; border: 1px solid #ced4da; border-radius: 2px; margin-right: 5px;"></div>
            <span style="font-size: 13px; color: #333;">AND Relationship (Complete ALL)</span>
        </div>
    `;
    mainTreeContainer.appendChild(legendDiv);

    const treeScrollContainer = document.createElement('div');
    treeScrollContainer.style.flex = '1';
    treeScrollContainer.style.overflow = 'auto';
    treeScrollContainer.style.padding = '10px';
    treeScrollContainer.style.border = '1px solid #e0e0e0';
    treeScrollContainer.style.borderRadius = '4px';
    mainTreeContainer.appendChild(treeScrollContainer);

    const rootNode = findRootNode(data.nodes, data.edges);
    if (rootNode) {
        const treeHtml = buildEnhancedTreeHtml(rootNode, data.nodes, data.edges);
        treeScrollContainer.innerHTML = treeHtml;
    } else {
        treeScrollContainer.innerHTML = '<p>Could not determine the root course.</p>';
    }

    addCourseList(data.nodes, data.edges, mainTreeContainer);
}

export function buildEnhancedTreeHtml(node, allNodes, allEdges, level = 0) {
    if (!node) return '';

    const prereqEdges = allEdges.filter(edge => edge.target === node.id);

    const indentPadding = level * 30;

    let borderColor = level === 0 ? '#142A50' : (level === 1 ? '#6c757d' : '#adb5bd');
    let backgroundColor = level === 0 ? '#f8f9fa' : (level === 1 ? '#f1f3f5' : '#f8f9fa');
    let textColor = level === 0 ? '#142A50' : (level === 1 ? '#495057' : '#6c757d');

    let html = `
        <div class="prereq-node-enhanced" style="padding: 15px;
                                               margin: 10px 0 10px ${indentPadding}px;
                                               border-radius: 6px;
                                               background-color: ${backgroundColor};
                                               border-left: 5px solid ${borderColor};
                                               box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="font-weight: ${level === 0 ? '600' : '500'};
                        font-size: ${level === 0 ? '18px' : '16px'};
                        color: ${textColor};">
                ${node.id} - ${node.name}
            </div>
    `;

    if (prereqEdges.length > 0) {
        
        const groupedByRelation = {};
        prereqEdges.forEach(edge => {
            const relation = edge.relation || 'and';
            if (!groupedByRelation[relation]) {
                groupedByRelation[relation] = [];
            }
            groupedByRelation[relation].push(edge);
        });

        Object.entries(groupedByRelation).forEach(([relation, edges]) => {
            if (edges.length > 0) {
                const relationLabel = relation.toLowerCase() === 'or'
                    ? 'Complete ONE of the following:'
                    : 'Complete ALL of the following:';

                const relationBgColor = relation.toLowerCase() === 'or' ? '#fff5f5' : '#f1f3f5';
                const relationBorderColor = relation.toLowerCase() === 'or' ? '#c92a2a' : '#ced4da';
                const relationTextColor = relation.toLowerCase() === 'or' ? '#c92a2a' : '#495057';

                html += `
                    <div style="margin: 10px 0;
                                padding: 8px 12px;
                                background-color: ${relationBgColor};
                                border-left: 3px solid ${relationBorderColor};
                                color: ${relationTextColor};
                                font-size: 14px;
                                border-radius: 4px;">
                        ${relationLabel}
                    </div>
                `;

                edges.forEach(edge => {
                    const prereqNode = allNodes.find(n => n.id === edge.source);
                    if (prereqNode) {
                        html += buildEnhancedTreeHtml(prereqNode, allNodes, allEdges, level + 1);
                    }
                });
            }
        });
    } else if (level > 0) {
        
        html += `
            <div style="margin-top: 5px; font-size: 13px; color: #6c757d;">
                No further prerequisites
            </div>
        `;
    }

    html += `</div>`;
    return html;
}

export function restoreScheduleGrid() {
    
    const contentContainer = document.querySelector('.content-container');
    if (!contentContainer) return;

    const mainTreeContainer = document.querySelector('#main-prereq-container');
    if (mainTreeContainer) {
        mainTreeContainer.style.display = 'none';
    }

    const scheduleGrid = document.querySelector('.schedule-grid');
    if (scheduleGrid) {
        scheduleGrid.style.display = 'flex';
    }

    if (window.currentPrereqData && window.currentCourseCode) {
        
        const preReqTab = document.querySelector('.tab-button[onclick*="PreReqTree"]');
        if (preReqTab && !preReqTab.classList.contains('active')) {
            openTab('PreReqTree', { currentTarget: preReqTab });
        }

        const courseInput = document.querySelector('#PreReqTree input[placeholder*="Course Code"]');
        if (courseInput) {
            courseInput.value = window.currentCourseCode;
        }

        renderPrerequisiteTree(window.currentPrereqData);
    }
}

function searchPrerequisites() {
    const courseInput = document.querySelector('#PreReqTree input[placeholder*="Course Code"]');
    if (!courseInput) {
        console.error('Course input field not found');
        return;
    }

    const courseCode = courseInput.value.trim();
    if (!courseCode) {
        
        const prereqInfo = document.querySelector('.prereq-info');
        if (prereqInfo) {
            prereqInfo.innerHTML = `
                <div style="color: #721c24; background-color: #f8d7da; padding: 12px; border-radius: 4px; margin-top: 15px; border: 1px solid #f5c6cb;">
                    <p style="margin: 0; font-weight: 500;">Please enter a valid course code.</p>
                    <p style="margin-top: 5px; font-size: 13px;">Example: CPSC 325, MATH 231</p>
                </div>
            `;
        }
        return;
    }

    let formattedCode = courseCode.toUpperCase();
    if (/^[A-Z]{2,4}\d{3,4}$/.test(formattedCode)) {
        
        formattedCode = formattedCode.replace(/([A-Z]+)(\d+)/, '$1 $2');
    }

    const prereqInfo = document.querySelector('.prereq-info');
    if (prereqInfo) {
        prereqInfo.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="margin: 0; color: #666;">Loading prerequisite tree for ${formattedCode}...</p>
                <div style="display: inline-block; width: 20px; height: 20px; border: 3px solid #f3f3f3; border-top: 3px solid #142A50; border-radius: 50%; margin-top: 10px; animation: spin 1s linear infinite;"></div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }

    courseInput.value = formattedCode;

    console.log(`Searching prerequisites for ${formattedCode}`);

    fetchPrerequisites(formattedCode)
        .then(data => {
            console.log('Successfully fetched prerequisite data:', data);
            renderPrerequisiteTree(data);
        })
        .catch(error => {
            console.error('Error fetching prerequisite data:', error);
            if (prereqInfo) {
                prereqInfo.innerHTML = `
                    <div style="color: #721c24; background-color: #f8d7da; padding: 15px; border-radius: 4px; margin-top: 10px;">
                        <p style="margin: 0; font-weight: 500;">Error loading prerequisites</p>
                        <p style="margin-top: 8px;">Please check that "${formattedCode}" is a valid course code and try again.</p>
                        <p style="margin-top: 8px; font-size: 13px;">Technical details: ${error.message}</p>
                    </div>
                `;
            }
        });
}

function displayInMainArea() {
    const courseInput = document.querySelector('#PreReqTree input[placeholder*="Course Code"]');
    if (!courseInput || !courseInput.value.trim()) {
        alert('Please enter a valid course code first.');
        return;
    }

    const courseCode = courseInput.value.trim().toUpperCase();

    fetchPrerequisites(courseCode)
        .then(data => {
            
            displayTreeInMainGrid(data, courseCode);

            const prereqInfo = document.querySelector('.prereq-info');
            if (prereqInfo) {
                prereqInfo.innerHTML = `
                    <div style="background-color: #e7f5ff; padding: 12px; border-radius: 5px; border-left: 4px solid #4dabf7;">
                        <p style="margin: 0; color: #1864ab;">
                            <strong>${courseCode}</strong> prerequisite tree is now displayed in the main area.
                        </p>
                    </div>
                    <p style="font-size: 13px; color: #666; margin-top: 12px;">
                        You can return to the schedule view by clicking "Return to Schedule" in the main area.
                    </p>
                `;
            }
        })
        .catch(error => {
            console.error('Failed to display prerequisite tree in main area:', error);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    
    window.currentPrereqData = null;
    window.currentCourseCode = null;

    const searchButton = document.querySelector('#PreReqTree .search-btn');
    if (searchButton) {
        searchButton.addEventListener('click', searchPrerequisites);
    }

    const courseInput = document.querySelector('#PreReqTree input[placeholder*="Course Code"]');
    if (courseInput) {
        courseInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchPrerequisites();
            }
        });
    }

    if (typeof openTab === 'function') {
        const originalOpenTab = openTab;
        window.openTab = function(tabName, event) {
            
            originalOpenTab(tabName, event);

            if (tabName === 'PreReqTree' && window.currentPrereqData) {
                setTimeout(() => {
                    renderPrerequisiteTree(window.currentPrereqData);
                }, 100);
            }
        };
    }

    const originalDisplayInMainArea = window.displayInMainArea;
    if (originalDisplayInMainArea) {
        window.displayInMainArea = function() {
            originalDisplayInMainArea();

            const courseInput = document.querySelector('#PreReqTree input[placeholder*="Course Code"]');
            if (courseInput && courseInput.value) {
                window.currentCourseCode = courseInput.value.trim().toUpperCase();
            }
        };
    }
});

function handlePrereqTabChange(tabName) {
    
    if (tabName !== 'PreReqTree' && window.currentPrereqData) {
        
        const scheduleGrid = document.querySelector('.schedule-grid');
        if (scheduleGrid && scheduleGrid.style.display === 'none') {
            restoreScheduleGrid();
        }
    }

    if (tabName === 'PreReqTree' && window.currentPrereqData && window.currentCourseCode) {
        
        const courseInput = document.querySelector('#PreReqTree input[placeholder*="Course Code"]');
        if (courseInput) {
            courseInput.value = window.currentCourseCode;
        }

        setTimeout(() => {
            renderPrerequisiteTree(window.currentPrereqData);
        }, 100);
    }
}

const originalOpenTab = window.openTab || function() {};
window.openTab = function(tabName, event) {
    
    originalOpenTab(tabName, event);

    handlePrereqTabChange(tabName);
};

export { searchPrerequisites, displayInMainArea };