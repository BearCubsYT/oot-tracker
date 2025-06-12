const itemsMax = {
  'Deku Sticks': 30,
  'Deku Nuts': 40,
  'Deku Seeds': 50,
  'Bombs': 40,
  'Bombchus': 50,
  'Arrows': 50,
  'Rupees': 500,
  'Magic Beans': 30,
  'Wallet': 500,
  'Bomb Bag': 40,
  'Bullet Bag': 50,
  'Quiver': 50,
  'Magic Meter': 48
};

function loadTracker() {
  const tbody = document.getElementById('item-tracker-body');
  tbody.innerHTML = '';
  for (let [item, max] of Object.entries(itemsMax)) {
    const saved = parseInt(localStorage.getItem(`tracker_${item}`)) || 0;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item}</td>
      <td><input type="number" id="track-${item}" value="${saved}" min="0" max="${max}"/> / ${max}</td>
    `;
    tbody.appendChild(row);

    const input = row.querySelector('input');
    input.addEventListener('change', () => {
      let val = parseInt(input.value) || 0;
      val = Math.max(0, Math.min(max, val));
      input.value = val;
      localStorage.setItem(`tracker_${item}`, val);
    });
  }
}

loadTracker();