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
let simulationSpeed = 1;
let isSimulationOpen = false;

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
    setupSimulation();
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
    if (isSimulationOpen) {
        loadSimulation();
    }
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
            <div class="telemetry-card" style="--card-index:0">
                <span class="telemetry-label">AIR TEMP</span>
                <span class="telemetry-value text-glow-red">${airTemp}</span>
            </div>
            <div class="telemetry-card" style="--card-index:1">
                <span class="telemetry-label">TRACK TEMP</span>
                <span class="telemetry-value text-glow-red">${trackTemp}</span>
            </div>
            <div class="telemetry-card" style="--card-index:2">
                <span class="telemetry-label">HUMIDITY</span>
                <span class="telemetry-value">${humidity}</span>
            </div>
            <div class="telemetry-card" style="--card-index:3">
                <span class="telemetry-label">WIND SPEED</span>
                <span class="telemetry-value">${windSpeed}</span>
            </div>
            <div class="telemetry-card ${rainClass}" style="--card-index:4">
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

    classificationRows.forEach((row, index) => {
        const rowElement = createClassificationRow(row, index);
        classificationList.appendChild(rowElement);
    });
}

// Create a timing board row element
function createClassificationRow(row, index = 0) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'leaderboard-row';
    rowDiv.style.setProperty('--row-index', index);
    
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
/* ═══════════════════════════════════════════════════════════════════════
   RACE SIMULATION OVERLAY
   ═══════════════════════════════════════════════════════════════════════ */

let simulationData = null;
let simState = {
    playing: false,
    currentFrame: 0,
    lastFrameTime: 0,
    animationFrameId: null,
    dots: []
};
const SIMULATION_PATH = '/simulation';

function setupSimulation() {
    const simulateBtn = document.getElementById('simulateBtn');
    const closeBtn = document.getElementById('simCloseBtn');
    const overlay = document.getElementById('simulationOverlay');

    if (simulateBtn) {
        simulateBtn.addEventListener('click', openSimulation);
        simulateBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openSimulation();
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeSimulation);
    }

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.classList.contains('simulation-backdrop')) {
                closeSimulation();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isSimulationOpen) {
            closeSimulation();
        }
    });

    setupSimulationControls();
}

async function openSimulation() {
    const overlay = document.getElementById('simulationOverlay');
    if (!overlay) return;

    isSimulationOpen = true;
    await loadSimulation();
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const closeBtn = document.getElementById('simCloseBtn');
    if (closeBtn) closeBtn.focus();

    startPlayback();
}

function closeSimulation() {
    const overlay = document.getElementById('simulationOverlay');
    if (!overlay) return;

    stopPlayback();
    isSimulationOpen = false;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

async function loadSimulation() {
    const circuit = circuits[currentCircuitIndex];
    const simRound = document.getElementById('simRound');
    const simTitle = document.getElementById('simTitle');
    const simCircuitImage = document.getElementById('simCircuitImage');

    if (simRound) simRound.textContent = circuit.round;
    if (simTitle) simTitle.textContent = `${circuit.name} Grand Prix`;
    if (simCircuitImage) {
        simCircuitImage.src = `${CIRCUITS_PATH}/${circuit.asset}`;
        simCircuitImage.alt = circuit.name;
    }

    const simDots = document.getElementById('simDots');
    if (simDots) simDots.innerHTML = '<div class="sim-loading">Loading telemetry...</div>';

    try {
        const response = await fetch(`${SIMULATION_PATH}/simulation_${circuit.key}_2023.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        simulationData = await response.json();
        buildDots();
        simState.currentFrame = 0;
        renderFrame(0);
    } catch (error) {
        console.error('Error loading simulation data:', error);
        if (simDots) {
            simDots.innerHTML = '<div class="sim-loading">Simulation data unavailable</div>';
        }
        simulationData = null;
    }
}

function buildDots() {
    const simDots = document.getElementById('simDots');
    if (!simDots || !simulationData) return;

    simDots.innerHTML = '';
    simState.dots = [];

    simulationData.driver_numbers.forEach((num) => {
        const driver = simulationData.drivers[String(num)];
        const dot = document.createElement('div');
        dot.className = 'sim-dot';
        dot.style.backgroundColor = driver.team_color;
        dot.style.color = driver.team_color;
        dot.setAttribute('title', `${driver.name} #${num}`);
        simDots.appendChild(dot);
        simState.dots.push(dot);
    });
}

function renderFrame(frameIndex) {
    if (!simulationData) return;

    const frames = simulationData.frames;
    if (!frames || frames.length === 0) return;

    frameIndex = Math.max(0, Math.min(frameIndex, frames.length - 1));
    simState.currentFrame = frameIndex;

    const frame = frames[frameIndex];
    const positions = frame.positions;
    const coords = frame.coords;

    // Update dots
    simState.dots.forEach((dot, i) => {
        const coord = coords[i];
        if (coord && coord[0] !== null && coord[1] !== null) {
            dot.style.left = `${coord[0] * 100}%`;
            dot.style.top = `${coord[1] * 100}%`;
            dot.style.opacity = '1';
        } else {
            dot.style.opacity = '0';
        }
    });

    // Build leaderboard sorted by position
    const leaderboardList = document.getElementById('simLeaderboardList');
    if (leaderboardList) {
        const indexed = simulationData.driver_numbers.map((num, i) => ({
            num,
            position: positions[i] || 99,
            driver: simulationData.drivers[String(num)]
        }));
        indexed.sort((a, b) => a.position - b.position);

        leaderboardList.innerHTML = '';
        indexed.forEach((entry, i) => {
            const row = document.createElement('div');
            row.className = 'sim-leaderboard-row';
            row.style.setProperty('--row-index', i);
            const gap = entry.position === 1 ? 'LEADER' : '';
            row.innerHTML = `
                <span class="sim-row-pos">${entry.position}</span>
                <span class="sim-row-driver">${entry.driver.name.split(' ').pop().toUpperCase()}</span>
                <span class="sim-row-team">${entry.driver.team}</span>
                <span class="sim-row-gap">${gap}</span>
            `;
            leaderboardList.appendChild(row);
        });
    }

    // Update HUD
    const simTime = document.getElementById('simTime');
    const simLeader = document.getElementById('simLeader');
    const simProgressTime = document.getElementById('simProgressTime');
    const simProgressFill = document.getElementById('simProgressFill');

    if (simTime) {
        const start = new Date(simulationData.start_time);
        const current = new Date(start.getTime() + frame.t * 1000);
        simTime.textContent = current.toISOString().substr(11, 8);
    }

    if (simLeader) {
        const leaderIndex = positions.indexOf(1);
        if (leaderIndex >= 0) {
            const leaderNum = simulationData.driver_numbers[leaderIndex];
            const leader = simulationData.drivers[String(leaderNum)];
            simLeader.textContent = leader.name.split(' ').pop().toUpperCase();
        }
    }

    const progress = frames.length > 1 ? frameIndex / (frames.length - 1) : 0;
    if (simProgressTime) simProgressTime.textContent = `${Math.round(progress * 100)}%`;
    if (simProgressFill) simProgressFill.style.width = `${progress * 100}%`;
}

function startPlayback() {
    if (simState.playing || !simulationData) return;
    simState.playing = true;
    simState.lastFrameTime = performance.now();

    const playBtn = document.getElementById('simPlayBtn');
    const pauseBtn = document.getElementById('simPauseBtn');
    if (playBtn) playBtn.classList.add('active');
    if (pauseBtn) pauseBtn.classList.remove('active');

    tick();
}

function stopPlayback() {
    simState.playing = false;
    if (simState.animationFrameId) {
        cancelAnimationFrame(simState.animationFrameId);
        simState.animationFrameId = null;
    }

    const playBtn = document.getElementById('simPlayBtn');
    const pauseBtn = document.getElementById('simPauseBtn');
    if (playBtn) playBtn.classList.remove('active');
    if (pauseBtn) pauseBtn.classList.add('active');
}

function tick() {
    if (!simState.playing || !simulationData) return;

    const now = performance.now();
    const elapsed = (now - simState.lastFrameTime) / 1000;
    simState.lastFrameTime = now;

    const frames = simulationData.frames;
    const interval = simulationData.frame_interval;
    const framesToAdvance = elapsed * simulationSpeed / interval;
    simState.currentFrame += framesToAdvance;

    if (simState.currentFrame >= frames.length - 1) {
        simState.currentFrame = frames.length - 1;
        renderFrame(Math.floor(simState.currentFrame));
        stopPlayback();
        return;
    }

    renderFrame(Math.floor(simState.currentFrame));
    simState.animationFrameId = requestAnimationFrame(tick);
}

function setupSimulationControls() {
    const playBtn = document.getElementById('simPlayBtn');
    const pauseBtn = document.getElementById('simPauseBtn');
    const speedOptions = document.getElementById('simSpeedOptions');

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (!isSimulationOpen) {
                openSimulation();
            } else {
                startPlayback();
            }
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            stopPlayback();
        });
    }

    if (speedOptions) {
        speedOptions.addEventListener('click', (e) => {
            if (!e.target.classList.contains('speed-btn')) return;
            speedOptions.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            simulationSpeed = parseInt(e.target.dataset.speed, 10);
        });
    }
}
