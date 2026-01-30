// Configuration
const API_BASE_URL = 'http://localhost:8000';
const CIRCUITS_PATH = '../assets/circuits';

// Circuit data from info.csv
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
    loadFilteredSessions();
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
        loadFilteredSessions();
    });
    
    nextButton.addEventListener('click', () => {
        currentCircuitIndex = (currentCircuitIndex + 1) % circuits.length;
        displayCurrentCircuit();
        loadFilteredSessions();
    });
}

// Load filtered sessions from API
async function loadFilteredSessions() {
    const sessionList = document.getElementById('sessionList');
    const circuit = circuits[currentCircuitIndex];
    
    // Show loading state
    sessionList.innerHTML = '<div class="loading">Loading sessions...</div>';
    
    console.log('Loading sessions for:', {
        circuit: circuit.name,
        circuit_key: circuit.key,
        session_type: currentFilter
    });
    
    try {
        const response = await fetch(`${API_BASE_URL}/season/ft_session`, {
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
        console.log('Received sessions:', data);
        displaySessions(data);
    } catch (error) {
        console.error('Error loading filtered sessions:', error);
        sessionList.innerHTML = `
            <div class="error">
                <p>Failed to load session data</p>
                <p style="font-size: 0.8rem;">Error: ${error.message}</p>
                <p style="font-size: 0.8rem;">Make sure the backend is running on ${API_BASE_URL}</p>
            </div>
        `;
    }
}
// Display sessions in the left sidebar
function displaySessions(sessions) {
    const sessionList = document.getElementById('sessionList');
    sessionList.innerHTML = '';

    if (!sessions || sessions.length === 0) {
        sessionList.innerHTML = `
            <div class="loading">
                No sessions found for this filter
            </div>
        `;
        return;
    }

    sessions.forEach(session => {
        const sessionItem = createSessionItem(session);
        sessionList.appendChild(sessionItem);
    });
}

// Create a session item element
function createSessionItem(session) {
    const item = document.createElement('div');
    item.className = 'session-item';

    // Title
    const title = document.createElement('h3');
    title.textContent = session.session_name;
    item.appendChild(title);

    // Session Type Badge
    const sessionType = document.createElement('span');
    sessionType.className = 'session-type';
    sessionType.textContent = session.session_type;
    item.appendChild(sessionType);

    // Circuit Info
    const circuitRow = document.createElement('div');
    circuitRow.className = 'info-row';
    circuitRow.innerHTML = `
        <span class="info-label">Circuit:</span>
        <span class="info-value">${session.circuit_short_name}</span>
    `;
    item.appendChild(circuitRow);

    // Location Info
    const locationRow = document.createElement('div');
    locationRow.className = 'info-row';
    locationRow.innerHTML = `
        <span class="info-label">Location:</span>
        <span class="info-value">${session.location}</span>
    `;
    item.appendChild(locationRow);

    // Country Info
    const countryRow = document.createElement('div');
    countryRow.className = 'info-row';
    countryRow.innerHTML = `
        <span class="info-label">Country:</span>
        <span class="info-value">${session.country_name}</span>
    `;
    item.appendChild(countryRow);

    // Date Start
    const dateStart = new Date(session.date_start);
    const dateStartRow = document.createElement('div');
    dateStartRow.className = 'info-row';
    dateStartRow.innerHTML = `
        <span class="info-label">Start:</span>
        <span class="info-value">${dateStart.toLocaleDateString()} ${dateStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
    `;
    item.appendChild(dateStartRow);

    // Date End
    const dateEnd = new Date(session.date_end);
    const dateEndRow = document.createElement('div');
    dateEndRow.className = 'info-row';
    dateEndRow.innerHTML = `
        <span class="info-label">End:</span>
        <span class="info-value">${dateEnd.toLocaleDateString()} ${dateEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
    `;
    item.appendChild(dateEndRow);

    return item;
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
            
            // Load filtered sessions
            loadFilteredSessions();
        });
    });
}