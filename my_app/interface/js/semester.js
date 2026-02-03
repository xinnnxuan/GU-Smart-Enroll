import { changeSemester } from './sidebar.js';

document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.getElementById('semester-dropdown');
  if (!dropdown) return;

  const today = new Date(), y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
  let sem;
  if (m < 4 || (m === 4 && d <= 17))      sem = 'Spring';
  else if (m < 7 || (m === 7 && d <= 16)) sem = 'Summer';
  else                                    sem = 'Fall';

  ['Spring','Summer','Fall'].forEach(label => {
    const val = `${label} ${y}`;
    const o   = document.createElement('option');
    o.value   = val;
    o.text    = val;
    if (label === sem) o.selected = true;
    dropdown.append(o);
  });

  dropdown.addEventListener('change', e => {
    changeSemester(e.target.value);
  });

  changeSemester(dropdown.value);
});
