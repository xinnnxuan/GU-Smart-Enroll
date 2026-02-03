
export function openPDF(pdfPath) {
  const container = document.querySelector('.schedule-container');
  if (!container) return;

  container.innerHTML = `<embed
    src="${pdfPath}"
    type="application/pdf"
    class="pdf-viewer"
  >`;

  container.classList.add('show-pdf');
}
