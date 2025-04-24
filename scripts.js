const API_URL = 'https://api.baserow.io/api/database/rows/table/370623/';
const TOKEN = 'b6ogrOm3B28TAbvwz4kElRoP8stNxrJg';
let allData = [];

async function fetchData() {
  const res = await fetch(API_URL + '?user_field_names=true', {
    headers: { Authorization: `Token ${TOKEN}` },
  });
  const data = await res.json();
  allData = data.results;
  renderCards();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB');
}

function renderCards() {
  const container = document.getElementById('cards-container');
  const searchVal = document.getElementById('search').value.toLowerCase();
  const sortVal = document.getElementById('sort').value;
  let filtered = allData.filter(row => row.Account && row.Account.toLowerCase().includes(searchVal));

  if (sortVal === 'expiry') {
    filtered.sort((a, b) => new Date(a['Expiry date']) - new Date(b['Expiry date']));
  } else if (sortVal === 'users') {
    const parseUsers = val => parseInt(typeof val === 'object' && val.value ? val.value : val || '0');
    filtered.sort((a, b) => parseUsers(a.Users) - parseUsers(b.Users));
  }

  container.innerHTML = '';
  filtered.forEach(row => {
    const userText = typeof row.Users === 'object' && row.Users.value ? row.Users.value : row.Users || '';
    const userCount = parseInt(userText);
    let userClass = '';
    if (!isNaN(userCount)) userClass = `user-count-${userCount}`;

    const card = document.createElement('div');
    card.className = 'card';
    card.id = `card-${row.id}`;
    card.innerHTML = `
      <div class="field-box">
        <span id="span-account-${row.id}" class="account">${row.Account}</span>
        <input id="account-${row.id}" value="${row.Account}" class="account" />
      </div>
      <div class="field-box">
        <span id="span-pass-${row.id}">${row.Pass || ''}</span>
        <input value="${row.Pass || ''}" id="pass-${row.id}" />
      </div>
      <div class="field-box">
        <span id="span-users-${row.id}" class="user-count-text ${userClass}">${userText}</span>
        <input value="${userText}" id="users-${row.id}" class="user-input ${userClass}" />
      </div>
      <div class="field-box">
        <span id="span-expiry-${row.id}">${formatDate(row['Expiry date'])}</span>
        <input type="date" value="${row['Expiry date'] ? new Date(row['Expiry date']).toISOString().split('T')[0] : ''}" id="expiry-${row.id}" />
      </div>
      <div class="field-box">
        <span id="span-other-${row.id}">${row['Other info'] || ''}</span>
        <input value="${row['Other info'] || ''}" id="other-${row.id}" />
      </div>
      <div class="actions">
        <button onclick='toggleEdit(${row.id})'>Edit</button>
        <button class="save-btn" id="save-btn-${row.id}" onclick='saveEdit(${row.id})'>Save</button>
        <button onclick='deleteRow(${row.id})'>Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function toggleEdit(id) {
  const card = document.getElementById(`card-${id}`);
  if (card) card.classList.add('editing');

  ["account", "pass", "users", "expiry", "other"].forEach(field => {
    const input = document.getElementById(`${field}-${id}`);
    const span = document.getElementById(`span-${field}-${id}`);
    if (input && span) {
      input.style.display = 'inline-block';
      span.style.display = 'none';
    }
  });

  const saveBtn = document.getElementById(`save-btn-${id}`);
  if (saveBtn) saveBtn.style.display = 'inline-block';
}

async function saveEdit(id) {
  const updatedRow = {
    field_2789447: document.getElementById(`account-${id}`).value,
    field_2789616: document.getElementById(`pass-${id}`).value,
    field_2789620: document.getElementById(`users-${id}`).value,
    field_4029902: document.getElementById(`expiry-${id}`).value.split('/').reverse().join('-'),
    field_4029903: document.getElementById(`other-${id}`).value,
  };

  await fetch(API_URL + id + '/', {
    method: 'PATCH',
    headers: {
      Authorization: `Token ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedRow)
  });

  fetchData();
}

async function deleteRow(id) {
  await fetch(API_URL + id + '/', {
    method: 'DELETE',
    headers: { Authorization: `Token ${TOKEN}` }
  });
  fetchData();
}

fetchData();