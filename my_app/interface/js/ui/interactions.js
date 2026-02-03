
export function toggleDayPanel(header) {
  const content = header.nextElementSibling;
  const arrow   = header.querySelector('.arrow');
  
  content.classList.toggle('show');
  arrow.classList.toggle('rotated', content.classList.contains('show'));
}

export function toggleFilterButton(button) {
  button.classList.toggle('active');
  if (button.classList.contains('active')) {
    setSelectedButtonStyle(button);
  } else {
    resetButtonStyle(button);
  }
}

export function toggleDayButton(button) {
  button.classList.toggle('selected');
  if (button.classList.contains('selected')) {
    setSelectedButtonStyle(button);
  } else {
    resetButtonStyle(button);
  }
}
