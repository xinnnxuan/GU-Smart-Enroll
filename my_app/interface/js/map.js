
window.openMapTab = function(tabId, event) {
    console.log('Switching to tab:', tabId); 
    if (event) {
        event.preventDefault();
    }

    const tabButtons = document.querySelectorAll('.map-tab-button');
    const tabContents = document.querySelectorAll('.map-tab-content');
    const mapContainer = document.querySelector('.map-container');

    tabButtons.forEach(button => {
        button.classList.remove('active');
        button.style.color = '#333';
    });
    tabContents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });

    const selectedButton = document.querySelector(`.map-tab-button[onclick*="${tabId}"]`);
    const selectedContent = document.getElementById(tabId);

    if (selectedButton && selectedContent) {
        console.log('Found elements:', { button: selectedButton, content: selectedContent }); 
        selectedButton.classList.add('active');
        selectedButton.style.color = '#142A50';
        selectedContent.style.display = 'block';
        selectedContent.classList.add('active');

        if (tabId === 'WeekdayTab' && mapContainer) {
            mapContainer.innerHTML = `
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2689.418973710349!2d-117.40477662402845!3d47.66729508951068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x549e185c5df3f945%3A0xaf7c8489928f20!2sGonzaga%20University!5e0!3m2!1sen!2sus!4v1716416889721!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style="border: 0;"
                    allowfullscreen=""
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade">
                </iframe>`;
        }
    } else {
        console.error('Could not find elements for tab:', tabId); 
    }
};

window.openHerakPDF = function() {
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        mapContainer.innerHTML = `<embed src="./assets/Floor Plans/Herak Center.pdf" type="application/pdf" width="100%" height="100%" style="min-height:500px; border-radius:8px;" />`;
    }
};

window.openJepsonFirstFloorPDF = function() {
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        mapContainer.innerHTML = `<embed src="./assets/Floor Plans/Jepson1stFloor.pdf" type="application/pdf" width="100%" height="100%" style="min-height:500px; border-radius:8px;" />`;
    }
};

window.openJepsonBasementPDF = function() {
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        mapContainer.innerHTML = `<embed src="./assets/Floor Plans/JepsonBasementpdf.pdf" type="application/pdf" width="100%" height="100%" style="min-height:500px; border-radius:8px;" />`;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    
    const mapView = document.getElementById('map-view');
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                if (mapView.classList.contains('active')) {
                    initializeMapView();
                }
            }
        });
    });

    observer.observe(mapView, {
        attributes: true
    });

    function initializeMapView() {
        setupBuildingButtons();
        setupFloorPlanButtons();
        setupMapControls();
        initializeMap();
        setupScheduleAccordion();
    }

    function setupBuildingButtons() {
        const buildingButtons = document.querySelectorAll('.building-btn');
        buildingButtons.forEach(button => {
            button.addEventListener('click', function() {
                
                buildingButtons.forEach(btn => btn.classList.remove('active'));
                
                this.classList.add('active');
                
                loadBuildingMap(this.dataset.building);
            });
        });
    }

    function setupFloorPlanButtons() {
        const floorPlanButtons = document.querySelectorAll('.floor-plan-btn');
        floorPlanButtons.forEach(button => {
            button.addEventListener('click', function() {
                
                floorPlanButtons.forEach(btn => btn.classList.remove('active'));
                
                this.classList.add('active');
                
                loadFloorPlan(this.dataset.building, this.dataset.floor);
            });
        });
    }

    function setupMapControls() {
        const zoomInBtn = document.querySelector('.zoom-in-btn');
        const zoomOutBtn = document.querySelector('.zoom-out-btn');
        const resetBtn = document.querySelector('.reset-btn');

        zoomInBtn.addEventListener('click', function() {
            zoomMap(1);
        });

        zoomOutBtn.addEventListener('click', function() {
            zoomMap(-1);
        });

        resetBtn.addEventListener('click', function() {
            resetMapView();
        });
    }

    function initializeMap() {
        
        console.log('Map initialized');
    }

    function loadBuildingMap(buildingId) {
        
        console.log('Loading building map:', buildingId);
    }

    function loadFloorPlan(buildingId, floorNumber) {
        
        console.log('Loading floor plan:', buildingId, floorNumber);
    }

    function zoomMap(direction) {
        
        console.log('Zooming map:', direction > 0 ? 'in' : 'out');
    }

    function resetMapView() {
        
        console.log('Resetting map view');
    }

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            document.body.classList.toggle('dark-mode');
        });
    }

    function setupScheduleAccordion() {
        const headers = document.querySelectorAll('.accordion-header');
        headers.forEach(header => {
            header.addEventListener('click', function() {
                const expanded = this.getAttribute('aria-expanded') === 'true';
                if (expanded) {
                    this.setAttribute('aria-expanded', 'false');
                    this.parentElement.querySelector('.accordion-content').style.display = 'none';
                } else {
                    this.setAttribute('aria-expanded', 'true');
                    this.parentElement.querySelector('.accordion-content').style.display = 'block';
                }
            });
        });
    }

    function showPdfInMapContainer(pdfPath) {
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.innerHTML = `<embed src="${pdfPath}" type="application/pdf" width="100%" height="100%" style="min-height:500px; border-radius:8px;" />`;
        }
    }

    const jepsonBtn = document.querySelector('.floor-plan-btn[data-plan="Jepson1"]');
    if (jepsonBtn) {
        jepsonBtn.addEventListener('click', function() {
            showPdfInMapContainer('assets/Floor Plans/Jepson1stFloor.pdf');
        });
    }
    
    const jepsonBasementBtn = document.querySelector('.floor-plan-btn[data-plan="JepsonB"]');
    if (jepsonBasementBtn) {
        jepsonBasementBtn.addEventListener('click', function() {
            showPdfInMapContainer('assets/Floor Plans/JepsonBasementpdf.pdf');
        });
    }
    
    const herakBtn = document.querySelector('.floor-plan-btn[data-plan="Herak1"]');
    if (herakBtn) {
        herakBtn.addEventListener('click', function() {
            showPdfInMapContainer('assets/Floor Plans/Herak Center.pdf');
        });
    }
}); 