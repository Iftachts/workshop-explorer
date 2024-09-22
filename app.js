let workshops = [];
let currentPage = 1;
const workshopsPerPage = 12;

function loadWorkshops() {
    console.log('Loading workshops...');
    Papa.parse('kenes2024_without_keywords.csv', {
        download: true,
        header: true,
        complete: function(results) {
            console.log('CSV parsing complete. Rows:', results.data.length);
            workshops = results.data;
            populateFilters();
            displayWorkshops(workshops);
            setupPagination();
        },
        error: function(error) {
            console.error('Error parsing CSV:', error);
        }
    });
}

function populateFilters() {
    const facilitators = new Set();
    const audiences = new Set();
    const types = new Set();

    workshops.forEach(workshop => {
        if (workshop['שם המנחה']) facilitators.add(workshop['שם המנחה']);
        if (workshop['קהל יעד']) audiences.add(workshop['קהל יעד']);
        if (workshop['אופי הסדנה']) types.add(workshop['אופי הסדנה']);
    });

    populateSelect('facilitator', facilitators, 'מנחים');
    populateSelect('audience', audiences, 'קהלי היעד');
    populateSelect('type', types, 'סוגי הסדנאות');
}

function populateSelect(id, options, categoryName) {
    const select = document.getElementById(id);
    select.innerHTML = `<option value="">כל ${categoryName}</option>`;
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

function displayWorkshops(workshopsToDisplay) {
    const workshopsContainer = document.getElementById('workshops');
    workshopsContainer.innerHTML = '';

    const startIndex = (currentPage - 1) * workshopsPerPage;
    const endIndex = startIndex + workshopsPerPage;
    const paginatedWorkshops = workshopsToDisplay.slice(startIndex, endIndex);

    paginatedWorkshops.forEach(workshop => {
        const workshopCard = document.createElement('div');
        workshopCard.className = 'workshop-card';
        workshopCard.innerHTML = `
            <p><strong>מספר הסדנה:</strong> ${workshop['מספר הסדנה'] || 'לא צוין'}</p>
            <h2>${workshop['שם הסדנה'] || 'ללא כותרת'}</h2>
            <p><strong>מנחה:</strong> ${workshop['שם המנחה'] || 'לא צוין'}</p>
            <p><strong>קהל יעד:</strong> ${workshop['קהל יעד'] || 'לא צוין'}</p>
            <p><strong>סוג הסדנה:</strong> ${workshop['אופי הסדנה'] || 'לא צוין'}</p>
            <p><strong>תיאור:</strong> ${workshop['תקציר'] || 'אין תיאור זמין'}</p>
        `;
        workshopsContainer.appendChild(workshopCard);
    });

    setupPagination();
}

function setupPagination() {
    const paginationContainer = document.getElementById('pagination');
    const totalPages = Math.ceil(workshops.length / workshopsPerPage);

    let paginationHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    paginationContainer.innerHTML = paginationHTML;

    paginationContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-btn')) {
            currentPage = parseInt(e.target.dataset.page);
            filterWorkshops();
        }
    });
}

function filterWorkshops() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const facilitator = document.getElementById('facilitator').value;
    const audience = document.getElementById('audience').value;
    const type = document.getElementById('type').value;
    const sortBy = document.getElementById('sort').value;

    let filteredWorkshops = workshops.filter(workshop => {
        return (
            (workshop['שם הסדנה'] && workshop['שם הסדנה'].toLowerCase().includes(searchTerm)) &&
            (!facilitator || workshop['שם המנחה'] === facilitator) &&
            (!audience || workshop['קהל יעד'] === audience) &&
            (!type || workshop['אופי הסדנה'] === type)
        );
    });

    if (sortBy) {
        filteredWorkshops.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return -1;
            if (a[sortBy] > b[sortBy]) return 1;
            return 0;
        });
    }

    displayWorkshops(filteredWorkshops);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded. Loading workshops...');
    loadWorkshops();
    document.getElementById('search').addEventListener('input', filterWorkshops);
    document.getElementById('facilitator').addEventListener('change', filterWorkshops);
    document.getElementById('audience').addEventListener('change', filterWorkshops);
    document.getElementById('type').addEventListener('change', filterWorkshops);
    document.getElementById('sort').addEventListener('change', filterWorkshops);
});

console.log('app.js loaded');
