
function exportToPDF() {
    const scheduleContainer = document.getElementById('schedule-container');
    
    if (!scheduleContainer) {
        showErrorMessage('Schedule container not found');
        return;
    }
    
    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        
        loadPDFLibraries()
            .then(() => generatePDF(scheduleContainer))
            .catch(error => {
                console.error('Error loading PDF libraries:', error);
                showErrorMessage('Failed to load PDF export libraries');
            });
    } else {
        
        generatePDF(scheduleContainer);
    }
}

function loadPDFLibraries() {
    return new Promise((resolve, reject) => {
        
        const html2canvasScript = document.createElement('script');
        html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        html2canvasScript.onload = () => {
            
            const jsPDFScript = document.createElement('script');
            jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            jsPDFScript.onload = resolve;
            jsPDFScript.onerror = reject;
            document.head.appendChild(jsPDFScript);
        };
        html2canvasScript.onerror = reject;
        document.head.appendChild(html2canvasScript);
    });
}

function generatePDF(container) {
    showLoadingIndicator();
    
    const currentSemester = document.querySelector('.semester-button').textContent.trim();
    
    showNotification('Generating PDF...', 'info');
    
    html2canvas(container, {
        scale: 2, 
        logging: false,
        useCORS: true
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm'
        });
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        pdf.setFontSize(10);
        const today = new Date().toLocaleDateString();
        pdf.text(`Gonzaga University Schedule - ${currentSemester} (Generated on ${today})`, 10, pdfHeight + 10);
        
        pdf.save(`GU_Schedule_${currentSemester.replace(/\s+/g, '_')}.pdf`);
        
        hideLoadingIndicator(document.querySelector('.loading-indicator'));
        showSuccessMessage('Schedule exported to PDF successfully');
    }).catch(error => {
        console.error('Error generating PDF:', error);
        hideLoadingIndicator(document.querySelector('.loading-indicator'));
        showErrorMessage('Failed to generate PDF: ' + error.message);
    });
} 