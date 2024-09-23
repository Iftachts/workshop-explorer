let workshops = [];
let currentPage = 1;
const workshopsPerPage = 12;
let fuse; // Fuse.js instance for fuzzy search

function loadWorkshops() {
    console.log('Loading workshops...');
    Papa.parse('kenes2024_without_keywords.csv', {
        download: true,
        header: true,
        complete: function(results) {
            console.log('CSV parsing complete. Rows:', results.data.length);
            workshops = results.data;
            initializeFuseSearch();
            populateFilters();
            displayWorkshops(workshops);
            setupPagination();
        },
        error: function(error) {
            console.error('Error parsing CSV:', error);
        }
    });
}

function initializeFuseSearch() {
    const options = {
        keys: ['מספר הסדנה', 'שם הסדנה', 'שם המנחה', 'קהל יעד', 'אופי הסדנה', 'תקציר'],
        threshold: 0.3,
        includeScore: true
    };
    fuse = new Fuse(workshops, options);
}

function populateFilters() {
    const audiences = new Set();
    const types = new Set();
    const workshopNames = new Set();

    workshops.forEach(workshop => {
        if (workshop['קהל יעד']) audiences.add(workshop['קהל יעד']);
        if (workshop['אופי הסדנה']) types.add(workshop['אופי הסדנה']);
        if (workshop['מספר הסדנה'] && workshop['שם הסדנה']) {
            workshopNames.add(`${workshop['מספר הסדנה']}: ${workshop['שם הסדנה']}`);
        }
    });

    populateSelect('audience', audiences, 'קהלי היעד');
    populateSelect('type', types, 'סוגי הסדנאות');
    populateSelect('workshop-name', workshopNames, 'שמות הסדנאות');
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
            <div class="workshop-header">
                <h2><span class="workshop-number">${workshop['מספר הסדנה'] || 'לא צוין'}</span>: ${workshop['שם הסדנה'] || 'ללא כותרת'}</h2>
                <p><strong>מנחה:</strong> ${workshop['שם המנחה'] || 'לא צוין'}</p>
                <button class="expand-btn">הצג פרטים נוספים</button>
            </div>
            <div class="workshop-details">
                <p><strong>קהל יעד:</strong> ${workshop['קהל יעד'] || 'לא צוין'}</p>
                <p><strong>סוג הסדנה:</strong> ${workshop['אופי הסדנה'] || 'לא צוין'}</p>
                <p><strong>תיאור:</strong> ${workshop['תקציר'] || 'אין תיאור זמין'}</p>
            </div>
        `;
        workshopsContainer.appendChild(workshopCard);

        const expandBtn = workshopCard.querySelector('.expand-btn');
        const detailsDiv = workshopCard.querySelector('.workshop-details');
        expandBtn.addEventListener('click', () => {
            detailsDiv.classList.toggle('expanded');
            expandBtn.textContent = detailsDiv.classList.contains('expanded') ? 'הסתר פרטים' : 'הצג פרטים נוספים';
        });
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
    const audience = document.getElementById('audience').value;
    const type = document.getElementById('type').value;
    const workshopName = document.getElementById('workshop-name').value;
    const sortBy = document.getElementById('sort').value;

    let filteredWorkshops = workshops;

    if (searchTerm) {
        const fuseResults = fuse.search(searchTerm);
        filteredWorkshops = fuseResults.map(result => result.item);
    }

    filteredWorkshops = filteredWorkshops.filter(workshop => {
        const fullWorkshopName = `${workshop['מספר הסדנה']}: ${workshop['שם הסדנה']}`;
        return (
            (!audience || workshop['קהל יעד'] === audience) &&
            (!type || workshop['אופי הסדנה'] === type) &&
            (!workshopName || fullWorkshopName === workshopName)
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
    document.getElementById('audience').addEventListener('change', filterWorkshops);
    document.getElementById('type').addEventListener('change', filterWorkshops);
    document.getElementById('workshop-name').addEventListener('change', filterWorkshops);
    document.getElementById('sort').addEventListener('change', filterWorkshops);
});

console.log('app.js loaded');
