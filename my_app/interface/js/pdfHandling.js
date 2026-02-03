
function openPDF(pdfPath) {
    const scheduleContainer = document.querySelector('.schedule-container, .schedule-grid');
    
    if (scheduleContainer) {
        
        const pdfViewer = document.createElement('embed');
        pdfViewer.src = pdfPath;
        pdfViewer.type = 'application/pdf';
        pdfViewer.style.width = '100%';
        pdfViewer.style.height = '100%';
        pdfViewer.style.minHeight = '600px';

        scheduleContainer.innerHTML = '';
        scheduleContainer.appendChild(pdfViewer);

        scheduleContainer.style.padding = '0';
        scheduleContainer.style.overflow = 'hidden';
    }
}

function openHerakPDF() {
    openPDF('Floor Plans/Herak Center.pdf');
}

function openJepsonFirstFloorPDF() {
    openPDF('Floor Plans/Jepson1stFloor.pdf');
}

function openJepsonBasementPDF() {
    openPDF('Floor Plans/JepsonBasementpdf.pdf');
}
