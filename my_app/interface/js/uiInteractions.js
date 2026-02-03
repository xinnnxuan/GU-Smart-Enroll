
function toggleDayPanel(header) {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('.arrow');
    
    content.classList.toggle('show');
    arrow.style.transform = content.classList.contains('show') ? 'rotate(180deg)' : '';
}

function toggleFilterButton(button) {
    console.log('Toggling filter button:', button.textContent);
    button.classList.toggle('active');
    
    if (button.classList.contains('active')) {
        button.style.backgroundColor = '#f5f5f5';
        button.style.borderColor = '#142A50';
        button.style.color = '#142A50';
    } else {
        button.style.backgroundColor = 'white';
        button.style.borderColor = '#e0e0e0';
        button.style.color = '#333';
    }
}

function toggleDayButton(button) {
    console.log('Toggling day button:', button.textContent);
    button.classList.toggle('selected');
    
    if (button.classList.contains('selected')) {
        button.style.backgroundColor = '#142A50';
        button.style.color = 'white';
        button.style.borderColor = '#142A50';
    } else {
        button.style.backgroundColor = 'white';
        button.style.color = '#333';
        button.style.borderColor = '#e0e0e0';
    }
}