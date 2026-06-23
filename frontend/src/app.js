// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const CIRCUITS_PATH = '/assets/circuits';

// Circuit data from circuits-information.csv (with location and round metadata)
const circuits = [
    { name: 'Sakhir', key: 63, asset: 'bahrain-1.svg', location: 'Bahrain', round: 'R01' },
    { name: 'Jeddah', key: 149, asset: 'jeddah.svg', location: 'Saudi Arabia', round: 'R02' },
    { name: 'Melbourne', key: 10, asset: 'melbourne.svg', location: 'Australia', round: 'R03' },
    { name: 'Baku', key: 144, asset: 'baku.svg', location: 'Azerbaijan', round: 'R04' },
    { name: 'Miami', key: 151, asset: 'miami.svg', location: 'United States', round: 'R05' },
    { name: 'Imola', key: 6, asset: 'imola.svg', location: 'Italy', round: 'R06' },
    { name: 'Monte Carlo', key: 22, asset: 'monaco.svg', location: 'Monaco', round: 'R07' },
    { name: 'Catalunya', key: 15, asset: 'catalunya.svg', location: 'Spain', round: 'R08' },
    { name: 'Montreal', key: 23, asset: 'montreal.svg', location: 'Canada', round: 'R09' },
    { name: 'Spielberg', key: 19, asset: 'spielberg.svg', location: 'Austria', round: 'R10' },
    { name: 'Silverstone', key: 2, asset: 'silverstone.svg', location: 'Great Britain', round: 'R11' },
    { name: 'Hungaroring', key: 4, asset: 'hungaroring.svg', location: 'Hungary', round: 'R12' },
    { name: 'Spa-Francorchamps', key: 7, asset: 'spa-francorchamps.svg', location: 'Belgium', round: 'R13' },
    { name: 'Zandvoort', key: 55, asset: 'zandvoort.svg', location: 'Netherlands', round: 'R14' },
    { name: 'Monza', key: 39, asset: 'monza.svg', location: 'Italy', round: 'R15' },
    { name: 'Singapore', key: 61, asset: 'marina-bay.svg', location: 'Singapore', round: 'R16' },
    { name: 'Suzuka', key: 46, asset: 'suzuka.svg', location: 'Japan', round: 'R17' },
    { name: 'Lusail', key: 150, asset: 'lusail.svg', location: 'Qatar', round: 'R18' },
    { name: 'Austin', key: 9, asset: 'austin.svg', location: 'United States', round: 'R19' },
    { name: 'Mexico City', key: 65, asset: 'mexico-city.svg', location: 'Mexico', round: 'R20' },
    { name: 'Interlagos', key: 14, asset: 'interlagos.svg', location: 'Brazil', round: 'R21' },
    { name: 'Las Vegas', key: 152, asset: 'las-vegas.svg', location: 'United States', round: 'R22' },
    { name: 'Yas Marina Circuit', key: 70, asset: 'yas-marina.svg', location: 'Abu Dhabi', round: 'R23' }
];

// State management
let currentCircuitIndex = 0;
let currentFilter = 'Race';

// Constructor Color Mapping
function getConstructorColor(teamName) {
    if (!teamName) return 'var(--border-color)';
    const name = teamName.toLowerCase();
    if (name.includes('red bull')) return 'var(--c-redbull)';
    if (name.includes('ferrari')) return 'var(--c-ferrari)';
    if (name.includes('mercedes')) return 'var(--c-mercedes)';
    if (name.includes('aston martin')) return 'var(--c-astonmartin)';
    if (name.includes('mclaren')) return 'var(--c-mclaren)';
    if (name.includes('alpine')) return 'var(--c-alpine)';
    if (name.includes('williams')) return 'var(--c-williams)';
    if (name.includes('haas')) return 'var(--c-haas)';
    if (name.includes('alfa romeo') || name.includes('sauber')) return 'var(--c-sauber)';
    if (name.includes('alphatauri') || name.includes('alpha tauri')) return 'var(--c-alphatauri)';
    return 'var(--f1-red)';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized');
    renderCircuitsList();
    setupNavigation();
    setupSessionTabs();
    updateDashboard();
});

// Render the left GP Schedule list
function renderCircuitsList() {
    const circuitsList = document.getElementById('circuitsList');
    if (!circuitsList) return;
    
    circuitsList.innerHTML = '';
    
    circuits.forEach((circuit, index) => {
        const item = document.createElement('div');
        item.className = `circuit-list-item ${index === currentCircuitIndex ? 'active' : ''}`;
        item.dataset.index = index;
        
        item.innerHTML = `
            <span class="round-num">${circuit.round}</span>
            <div class="circuit-info-mini">
                <span class="gp-name">${circuit.name}</span>
                <span class="gp-location">${circuit.location}</span>
            </div>
        `;
        
        item.addEventListener('click', () => {
            currentCircuitIndex = index;
            highlightActiveCircuitInList();
            updateDashboard();
        });
        
        circuitsList.appendChild(item);
    });
}

// Highlight the active circuit in the sidebar list
function highlightActiveCircuitInList() {
    const items = document.querySelectorAll('.circuit-list-item');
    items.forEach((item, index) => {
        if (index === currentCircuitIndex) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

// Update all components on the dashboard
function updateDashboard() {
    displayCurrentCircuit();
    loadWeather();
    loadDriverClassification();
}

// Display current active circuit
function displayCurrentCircuit() {
    const circuit = circuits[currentCircuitIndex];
    console.log('Displaying circuit:', circuit.name);
    
    // Update labels
    document.getElementById('circuitName').textContent = circuit.name;
    document.getElementById('circuitLocation').textContent = circuit.location;
    document.getElementById('activeRoundBadge').textContent = circuit.round;
    
    // Update circuit map image
    const circuitImage = document.getElementById('circuitImage');
    circuitImage.innerHTML = `
        <img src="${CIRCUITS_PATH}/${circuit.asset}" alt="${circuit.name}">
    `;
    
    // Handle image load error
    const img = circuitImage.querySelector('img');
    img.onerror = () => {
        console.error('Failed to load circuit image:', circuit.asset);
        circuitImage.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">Circuit map preview unavailable</p>';
    };
}

// Setup navigation arrows (prev/next GP)
function setupNavigation() {
    const prevButton = document.getElementById('prevCircuit');
    const nextButton = document.getElementById('nextCircuit');
    
    if (prevButton) {
        const prevHandler = () => {
            currentCircuitIndex = (currentCircuitIndex - 1 + circuits.length) % circuits.length;
            highlightActiveCircuitInList();
            updateDashboard();
        };
        prevButton.addEventListener('click', prevHandler);
        prevButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); prevHandler(); }
        });
    }
    
    if (nextButton) {
        const nextHandler = () => {
            currentCircuitIndex = (currentCircuitIndex + 1) % circuits.length;
            highlightActiveCircuitInList();
            updateDashboard();
        };
        nextButton.addEventListener('click', nextHandler);
        nextButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextHandler(); }
        });
    }
}

// Fetch and render weather telemetry
async function loadWeather() {
    const weatherWidget = document.getElementById('weatherWidget');
    if (!weatherWidget) return;
    
    weatherWidget.innerHTML = `
        <div class="weather-loading">
            <span class="pulse-dot"></span> Loading telemetry feed...
        </div>
    `;
    
    const circuit = circuits[currentCircuitIndex];
    
    try {
        const response = await fetch(`${API_BASE_URL}/season/weather/${circuit.key}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.length > 0) {
            // Display the latest weather reading
            const latest = data[data.length - 1];
            displayWeather(latest);
        } else {
            weatherWidget.innerHTML = `
                <div class="weather-empty">
                    <span>Weather telemetry unavailable for this circuit</span>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading weather data:', error);
        weatherWidget.innerHTML = `
            <div class="weather-empty">
                <span>Telemetry data stream offline</span>
            </div>
        `;
    }
}

// Render weather telemetry values
function displayWeather(weather) {
    const weatherWidget = document.getElementById('weatherWidget');
    if (!weatherWidget) return;
    
    const airTemp = weather.air_temperature !== null ? `${weather.air_temperature.toFixed(1)}°C` : 'N/A';
    const trackTemp = weather.track_temperature !== null ? `${weather.track_temperature.toFixed(1)}°C` : 'N/A';
    const humidity = weather.humidity !== null ? `${weather.humidity.toFixed(0)}%` : 'N/A';
    const windSpeed = weather.wind_speed !== null ? `${(weather.wind_speed * 3.6).toFixed(1)} km/h` : 'N/A';
    const rainText = weather.rainfall ? 'WET' : 'DRY';
    const rainClass = weather.rainfall ? 'rain-wet' : 'rain-dry';
    
    weatherWidget.innerHTML = `
        <div class="telemetry-grid">
            <div class="telemetry-card">
                <span class="telemetry-label">AIR TEMP</span>
                <span class="telemetry-value text-glow-red">${airTemp}</span>
            </div>
            <div class="telemetry-card">
                <span class="telemetry-label">TRACK TEMP</span>
                <span class="telemetry-value text-glow-red">${trackTemp}</span>
            </div>
            <div class="telemetry-card">
                <span class="telemetry-label">HUMIDITY</span>
                <span class="telemetry-value">${humidity}</span>
            </div>
            <div class="telemetry-card">
                <span class="telemetry-label">WIND SPEED</span>
                <span class="telemetry-value">${windSpeed}</span>
            </div>
            <div class="telemetry-card ${rainClass}">
                <span class="telemetry-label">TRACK STATE</span>
                <span class="telemetry-value">${rainText}</span>
            </div>
        </div>
    `;
}

// Load driver classification leaderboard
async function loadDriverClassification() {
    const classificationList = document.getElementById('classificationList');
    if (!classificationList) return;
    
    classificationList.innerHTML = `
        <div class="loading">
            <img src="/assets/icons/hard-tyre.png" class="loading-spinner" alt="Loading">
            <span>Updating timing data...</span>
        </div>
    `;
    
    const circuit = circuits[currentCircuitIndex];
    
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
        displayClassification(data);
    } catch (error) {
        console.error('Error loading classification:', error);
        classificationList.innerHTML = `
            <div class="error">
                <h4>DATA ACQUISITION ERROR</h4>
                <p>Failed to retrieve timing classification feed</p>
                <p style="font-size: 0.65rem; color: var(--text-muted);">${error.message}</p>
            </div>
        `;
    }
}

// Display classification items in the Timing Board list
function displayClassification(classificationRows) {
    const classificationList = document.getElementById('classificationList');
    if (!classificationList) return;
    
    classificationList.innerHTML = '';

    if (!classificationRows || classificationRows.length === 0) {
        classificationList.innerHTML = `
            <div class="loading">
                <span>NO DATA AVAILABLE FOR THIS SESSION TYPE</span>
            </div>
        `;
        return;
    }

    classificationRows.forEach(row => {
        const rowElement = createClassificationRow(row);
        classificationList.appendChild(rowElement);
    });
}

// Create a timing board row element
function createClassificationRow(row) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'leaderboard-row';
    
    // Fetch appropriate constructor brand color
    const teamColor = getConstructorColor(row.team_name);
    
    // Add constructor color accent line
    const accent = document.createElement('div');
    accent.className = 'constructor-accent';
    accent.style.backgroundColor = teamColor;
    rowDiv.appendChild(accent);

    // Position
    const position = document.createElement('span');
    position.className = 'driver-pos';
    position.textContent = row.position ?? '-';
    rowDiv.appendChild(position);

    // Car Number
    const carNumber = document.createElement('span');
    carNumber.className = 'driver-num';
    carNumber.textContent = `#${row.driver_number}`;
    rowDiv.appendChild(carNumber);

    // Driver details
    const mainInfo = document.createElement('div');
    mainInfo.className = 'driver-main-info';
    
    const nameGroup = document.createElement('div');
    nameGroup.className = 'driver-name-group';
    
    const driverName = document.createElement('span');
    driverName.className = 'driver-name';
    driverName.textContent = row.driver_name || `Driver #${row.driver_number}`;
    nameGroup.appendChild(driverName);
    mainInfo.appendChild(nameGroup);
    
    const teamBadge = document.createElement('span');
    teamBadge.className = 'team-badge';
    teamBadge.textContent = row.team_name || 'Independent';
    mainInfo.appendChild(teamBadge);
    
    rowDiv.appendChild(mainInfo);

    // Timing stats / status
    const timingStats = document.createElement('div');
    timingStats.className = 'timing-stats';
    
    if (row.dsq || row.dnf || row.dns) {
        const status = document.createElement('span');
        if (row.dsq) {
            status.className = 'status-badge dsq';
            status.textContent = 'DSQ';
        } else if (row.dnf) {
            status.className = 'status-badge dnf';
            status.textContent = 'DNF';
        } else if (row.dns) {
            status.className = 'status-badge dns';
            status.textContent = 'DNS';
        }
        timingStats.appendChild(status);
    } else {
        const gapTime = document.createElement('span');
        gapTime.className = 'gap-time';
        gapTime.textContent = formatGap(row);
        timingStats.appendChild(gapTime);
    }

    const lapsCount = document.createElement('span');
    lapsCount.className = 'laps-count';
    lapsCount.textContent = `LAPS: ${row.number_of_laps ?? 0}`;
    timingStats.appendChild(lapsCount);
    
    rowDiv.appendChild(timingStats);

    return rowDiv;
}

// Format gap helper
function formatGap(row) {
    if (row.position === 1 || row.gap_to_leader === 0) {
        return 'LEADER';
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

// Setup session segmented control tabs
function setupSessionTabs() {
    const tabs = document.querySelectorAll('.session-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active state from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active state to clicked tab
            tab.classList.add('active');
            
            // Set new session filter parameter and reload Timing Board
            currentFilter = tab.dataset.filter;
            console.log('Session type filter updated to:', currentFilter);
            loadDriverClassification();
        });
    });
}