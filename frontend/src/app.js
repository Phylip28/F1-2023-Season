// Configuration
const API_BASE_URL = 'http://localhost:8000';
const CIRCUITS_PATH = '/assets/circuits';

// Circuit data from circuits-information.csv
const circuits = [
    { name: 'Sakhir', key: 63, asset: 'bahrain-1.svg' },
    { name: 'Jeddah', key: 149, asset: 'jeddah.svg' },
    { name: 'Melbourne', key: 10, asset: 'melbourne.svg' },
    { name: 'Baku', key: 144, asset: 'baku.svg' },
    { name: 'Miami', key: 151, asset: 'miami.svg' },
    { name: 'Imola', key: 6, asset: 'imola.svg' },
    { name: 'Monte Carlo', key: 22, asset: 'monaco.svg' },
    { name: 'Catalunya', key: 15, asset: 'catalunya.svg' },
    { name: 'Montreal', key: 23, asset: 'montreal.svg' },
    { name: 'Spielberg', key: 19, asset: 'spielberg.svg' },
    { name: 'Silverstone', key: 2, asset: 'silverstone.svg' },
    { name: 'Hungaroring', key: 4, asset: 'hungaroring.svg' },
    { name: 'Spa-Francorchamps', key: 7, asset: 'spa-francorchamps.svg' },
    { name: 'Zandvoort', key: 55, asset: 'zandvoort.svg' },
    { name: 'Monza', key: 39, asset: 'monza.svg' },
    { name: 'Singapore', key: 61, asset: 'marina-bay.svg' },
    { name: 'Suzuka', key: 46, asset: 'suzuka.svg' },
    { name: 'Lusail', key: 150, asset: 'lusail.svg' },
    { name: 'Austin', key: 9, asset: 'austin.svg' },
    { name: 'Mexico City', key: 65, asset: 'mexico-city.svg' },
    { name: 'Interlagos', key: 14, asset: 'interlagos.svg' },
    { name: 'Las Vegas', key: 152, asset: 'las-vegas.svg' },
    { name: 'Yas Marina Circuit', key: 70, asset: 'yas-marina.svg' }
];

// State management
let currentCircuitIndex = 0;
let currentFilter = 'Race';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized');
    setupNavigation();
    setupFilterDropdown();
    displayCurrentCircuit();
    loadDriverClassification();
});

// Display current circuit
function displayCurrentCircuit() {
    const circuit = circuits[currentCircuitIndex];
    
    console.log('Displaying circuit:', circuit.name);
    
    // Update circuit name
    document.getElementById('circuitName').textContent = circuit.name;
    
    // Update circuit counter
    document.getElementById('circuitCounter').textContent = 
        `${currentCircuitIndex + 1} / ${circuits.length}`;
    
    // Update circuit image
    const circuitImage = document.getElementById('circuitImage');
    circuitImage.innerHTML = `
        <img src="${CIRCUITS_PATH}/${circuit.asset}" alt="${circuit.name}">
    `;
    
    // Handle image load error
    const img = circuitImage.querySelector('img');
    img.onerror = () => {
        console.error('Failed to load circuit image:', circuit.asset);
        circuitImage.innerHTML = '<p style="color: #888;">Circuit image not available</p>';
    };
}

// Setup navigation arrows
function setupNavigation() {
    const prevButton = document.getElementById('prevCircuit');
    const nextButton = document.getElementById('nextCircuit');
    
    prevButton.addEventListener('click', () => {
        currentCircuitIndex = (currentCircuitIndex - 1 + circuits.length) % circuits.length;
        displayCurrentCircuit();
        loadDriverClassification();
    });
    
    nextButton.addEventListener('click', () => {
        currentCircuitIndex = (currentCircuitIndex + 1) % circuits.length;
        displayCurrentCircuit();
        loadDriverClassification();
    });
}

// Load driver classification from API
async function loadDriverClassification() {
    const classificationList = document.getElementById('classificationList');
    const circuit = circuits[currentCircuitIndex];
    
    // Show loading state with spinner
    classificationList.innerHTML = `
        <div class="loading">
            <img src="/assets/icons/hard-tyre.png" class="loading-spinner" alt="Loading">
            <span>Loading classification...</span>
        </div>
    `;
    
    console.log('Loading classification for:', {
        circuit: circuit.name,
        circuit_key: circuit.key,
        session_type: currentFilter
    });
    
    try {
        const response = await fetch(`${API_BASE_URL}/season/classification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                circuit_key: circuit.key,
                session_type: currentFilter
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received classification:', data);
        displayClassification(data);
    } catch (error) {
        console.error('Error loading classification:', error);
        classificationList.innerHTML = `
            <div class="error">
                <p>Failed to load classification data</p>
                <p style="font-size: 0.8rem;">Error: ${error.message}</p>
                <p style="font-size: 0.8rem;">Make sure the backend is running on ${API_BASE_URL}</p>
            </div>
        `;
    }
}

// Display classification rows in the left sidebar
function displayClassification(classificationRows) {
    const classificationList = document.getElementById('classificationList');
    classificationList.innerHTML = '';

    if (!classificationRows || classificationRows.length === 0) {
        classificationList.innerHTML = `
            <div class="loading">
                <span>No classification data found for this selection</span>
            </div>
        `;
        return;
    }

    classificationRows.forEach(row => {
        const classificationItem = createClassificationItem(row);
        classificationList.appendChild(classificationItem);
    });
}

// Create a classification item element
function createClassificationItem(row) {
    const item = document.createElement('div');
    item.className = 'classification-item';

    // Header with position and driver info
    const header = document.createElement('div');
    header.className = 'classification-header';

    const position = document.createElement('span');
    position.className = 'driver-position';
    position.textContent = row.position ?? '-';
    
    const title = document.createElement('h3');
    title.textContent = row.driver_name || `Driver #${row.driver_number}`;
    
    const sessionType = document.createElement('span');
    sessionType.className = 'session-type';
    sessionType.textContent = row.session_type;
    
    header.appendChild(position);
    header.appendChild(title);
    header.appendChild(sessionType);
    item.appendChild(header);

    const carNumberRow = document.createElement('div');
    carNumberRow.className = 'info-row';
    carNumberRow.innerHTML = `
        <span class="info-label">Car:</span>
        <span class="info-value">#${row.driver_number}</span>
    `;
    item.appendChild(carNumberRow);

    const teamRow = document.createElement('div');
    teamRow.className = 'info-row';
    teamRow.innerHTML = `
        <span class="info-label">Team:</span>
        <span class="info-value">${row.team_name || 'Unknown'}</span>
    `;
    item.appendChild(teamRow);

    const lapsRow = document.createElement('div');
    lapsRow.className = 'info-row';
    lapsRow.innerHTML = `
        <span class="info-label">Laps:</span>
        <span class="info-value">${row.number_of_laps ?? '-'}</span>
    `;
    item.appendChild(lapsRow);

    const gapRow = document.createElement('div');
    gapRow.className = 'info-row';
    gapRow.innerHTML = `
        <span class="info-label">Gap:</span>
        <span class="info-value">${formatGap(row)}</span>
    `;
    item.appendChild(gapRow);

    const statusRow = document.createElement('div');
    statusRow.className = 'info-row';
    statusRow.innerHTML = `
        <span class="info-label">Status:</span>
        <span class="info-value">${formatStatus(row)}</span>
    `;
    item.appendChild(statusRow);

    return item;
}

function formatGap(row) {
    if (row.position === 1 || row.gap_to_leader === 0) {
        return 'Leader';
    }

    if (row.gap_to_leader === null || row.gap_to_leader === undefined) {
        return '-';
    }

    if (typeof row.gap_to_leader === 'string') {
        const parsed = Number(row.gap_to_leader);
        if (Number.isNaN(parsed)) {
            return row.gap_to_leader;
        }

        return `+${parsed.toFixed(3)}s`;
    }

    return `+${Number(row.gap_to_leader).toFixed(3)}s`;
}

function formatStatus(row) {
    if (row.dsq) {
        return 'Disqualified';
    }

    if (row.dns) {
        return 'Did not start';
    }

    if (row.dnf) {
        return 'Did not finish';
    }

    return 'Finished';
}

// Setup filter dropdown
function setupFilterDropdown() {
    const filterButton = document.getElementById('filterButton');
    const filterOptions = document.getElementById('filterOptions');
    const filterText = document.getElementById('filterText');
    const optionButtons = document.querySelectorAll('.filter-option');
    
    // Set initial filter text
    filterText.textContent = currentFilter;
    
    // Toggle dropdown
    filterButton.addEventListener('click', (e) => {
        e.stopPropagation();
        filterOptions.classList.toggle('show');
        filterButton.classList.toggle('open');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!filterButton.contains(e.target) && !filterOptions.contains(e.target)) {
            filterOptions.classList.remove('show');
            filterButton.classList.remove('open');
        }
    });
    
    // Handle filter option selection
    optionButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all options
            optionButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to selected option
            button.classList.add('active');
            
            // Update filter text and current filter
            const filterValue = button.dataset.filter;
            filterText.textContent = filterValue;
            currentFilter = filterValue;
            
            console.log('Filter changed to:', currentFilter);
            
            // Close dropdown
            filterOptions.classList.remove('show');
            filterButton.classList.remove('open');
            
            // Load filtered classification
            loadDriverClassification();
        });
    });
}