let sectionsData = {};
let currentSectionIndex = 0;

function loadChecklist() {
  const savedProgress = JSON.parse(localStorage.getItem('checklistProgress') || '{}');
  const lastSection = localStorage.getItem('lastSection');
  if (lastSection && Object.keys(sectionsData).includes(lastSection)) {
    currentSectionIndex = Object.keys(sectionsData).indexOf(lastSection);
  }

  const sectionSelect = document.getElementById('section-select');
  sectionSelect.innerHTML = '';
  Object.keys(sectionsData).forEach((key, idx) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = key;
    sectionSelect.appendChild(opt);
  });

  sectionSelect.addEventListener('change', e => {
    currentSectionIndex = Object.keys(sectionsData).indexOf(e.target.value);
    localStorage.setItem('lastSection', e.target.value);
    renderSection();
  });

  document.getElementById('prev-section').addEventListener('click', () => {
    if (currentSectionIndex > 0) {
      currentSectionIndex--;
      localStorage.setItem('lastSection', Object.keys(sectionsData)[currentSectionIndex]);
      renderSection();
    }
  });

  document.getElementById('next-section').addEventListener('click', () => {
    if (currentSectionIndex < Object.keys(sectionsData).length - 1) {
      currentSectionIndex++;
      localStorage.setItem('lastSection', Object.keys(sectionsData)[currentSectionIndex]);
      renderSection();
    }
  });

  document.getElementById('reset-button').addEventListener('click', () => {
    if (confirm("Are you sure you want to reset all progress?")) {
      localStorage.removeItem('checklistProgress');
      localStorage.removeItem('lastSection');
      window.location.reload();
    }
  });

  renderSection();
  updateGlobalProgress();
  markCompletedSections();
}

function renderSection() {
  const sectionName = Object.keys(sectionsData)[currentSectionIndex];
  const section = sectionsData[sectionName];
  document.getElementById('section-select').value = sectionName;

  const container = document.getElementById('checklist-container');
  container.innerHTML = `<h2 class="section-title">${sectionName}</h2>`;

  const savedProgress = JSON.parse(localStorage.getItem('checklistProgress') || '{}');

  for (const [sub, items] of Object.entries(section)) {
    if (!items.length) continue;
    const div = document.createElement('div');
    div.className = 'subsection';
    const h3 = document.createElement('h3');
    h3.textContent = sub;
    div.appendChild(h3);

    const ul = document.createElement('ul');
    items.forEach((item, i) => {
      const li = document.createElement('li');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      const key = `${sectionName}_${sub}_${i}`;
      checkbox.checked = savedProgress[key] || false;
      checkbox.addEventListener('change', () => {
        savedProgress[key] = checkbox.checked;
        localStorage.setItem('checklistProgress', JSON.stringify(savedProgress));
        updateGlobalProgress();
        markCompletedSections();
      });
      li.appendChild(checkbox);
      li.appendChild(document.createTextNode(item));
      ul.appendChild(li);
    });

    div.appendChild(ul);
    container.appendChild(div);
  }
}

function updateGlobalProgress() {
  const savedProgress = JSON.parse(localStorage.getItem('checklistProgress') || '{}');
  let total = 0;
  let completed = 0;

  for (const section of Object.keys(sectionsData)) {
    for (const [sub, items] of Object.entries(sectionsData[section])) {
      total += items.length;
      items.forEach((_, i) => {
        const key = `${section}_${sub}_${i}`;
        if (savedProgress[key]) completed++;
      });
    }
  }

  const totalPct = total > 0 ? (completed / total) * 100 : 0;

  const fill = document.querySelector('.progress-fill');
  const text = document.querySelector('.progress-text');
  if (fill && text) {
    fill.style.width = `${totalPct.toFixed(2)}%`;
    text.textContent = `${totalPct.toFixed(2)}%`;
  }
}

function markCompletedSections() {
  const savedProgress = JSON.parse(localStorage.getItem('checklistProgress') || '{}');
  const sectionSelect = document.getElementById('section-select');

  Array.from(sectionSelect.options).forEach((option, i) => {
    const sectionName = option.value;
    let allChecked = true;

    outer: for (const [sub, items] of Object.entries(sectionsData[sectionName])) {
      for (let j = 0; j < items.length; j++) {
        const key = `${sectionName}_${sub}_${j}`;
        if (!savedProgress[key]) {
          allChecked = false;
          break outer;
        }
      }
    }

    option.textContent = allChecked ? `✅ ${sectionName}` : sectionName;
  });
}

fetch('sections.json')
  .then(res => res.json())
  .then(data => {
    sectionsData = data;
    loadChecklist();
  });