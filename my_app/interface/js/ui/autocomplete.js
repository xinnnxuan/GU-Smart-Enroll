
export function initAutocomplete(inputElement, options, onSelect) {
  if (!inputElement || !options || !Array.isArray(options)) {
    console.error('Invalid parameters for autocomplete initialization');
    return;
  }

  console.log(`Initializing autocomplete for ${inputElement.id} with ${options.length} options`);
  
  let listContainer = inputElement.parentElement.querySelector('.autocomplete-list');
  if (!listContainer) {
    listContainer = document.createElement('div');
    listContainer.className = 'autocomplete-list';
    inputElement.parentElement.appendChild(listContainer);
  }

  let activeIndex = -1;
  
  inputElement.addEventListener('input', () => {
    const query = inputElement.value.trim().toLowerCase();
    
    if (query.length === 0) {
      
      showResults(options.slice(0, 10));
    } else {
      
      const filteredOptions = options.filter(option => 
        option.text.toLowerCase().includes(query)
      ).slice(0, 10); 
      
      showResults(filteredOptions, query);
    }
  });
  
  inputElement.addEventListener('focus', () => {
    if (inputElement.value.trim() === '') {
      showResults(options.slice(0, 10)); 
    }
  });
  
  document.addEventListener('click', (e) => {
    if (!inputElement.contains(e.target) && !listContainer.contains(e.target)) {
      setTimeout(() => {
        listContainer.style.display = 'none';
      }, 150);
    }
  });
  
  inputElement.addEventListener('keydown', (e) => {
    const items = listContainer.querySelectorAll('.autocomplete-item');
    if (!items.length) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      updateActiveItem(items);
    } 
    
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActiveItem(items);
    }
    
    else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      items[activeIndex].click();
    }
    
    else if (e.key === 'Escape') {
      listContainer.style.display = 'none';
      activeIndex = -1;
    }
  });
  
  function updateActiveItem(items) {
    
    items.forEach(item => item.classList.remove('active'));
    
    if (activeIndex >= 0 && items[activeIndex]) {
      items[activeIndex].classList.add('active');
      items[activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }
  
  function showResults(results, query = '') {
    
    listContainer.innerHTML = '';
    
    if (!results || results.length === 0) {
      listContainer.style.display = 'none';
      activeIndex = -1;
      return;
    }
    
    results.forEach((result, index) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      
      if (query) {
        const text = result.text;
        const lowerText = text.toLowerCase();
        const matchIndex = lowerText.indexOf(query.toLowerCase());
        
        if (matchIndex >= 0) {
          const beforeMatch = text.substring(0, matchIndex);
          const match = text.substring(matchIndex, matchIndex + query.length);
          const afterMatch = text.substring(matchIndex + query.length);
          
          item.innerHTML = `${beforeMatch}<strong>${match}</strong>${afterMatch}`;
        } else {
          item.textContent = text;
        }
      } else {
        item.textContent = result.text;
      }
      
      item.addEventListener('click', () => {
        inputElement.value = result.text;
        inputElement.dataset.selectedId = result.id;
        listContainer.style.display = 'none';
        activeIndex = -1;
        
        if (onSelect && typeof onSelect === 'function') {
          onSelect(result.id, result.text);
        }
        
        const event = new Event('change', { bubbles: true });
        inputElement.dispatchEvent(event);
      });
      
      listContainer.appendChild(item);
    });
    
    listContainer.style.display = 'block';
    activeIndex = -1;
  }
  
  inputElement.setAttribute('data-autocomplete', 'true');
  
  if (inputElement.value.trim()) {
    inputElement.dispatchEvent(new Event('input'));
  }
} 