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
    dots: [],
    lastOrderSignature: null,
    trackTransform: null,
    prevPositions: null,
    positionChanges: {},
    formationFrame: 0,
    raceStartFrameIdx: 0,
    mode: 'race'
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

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isSimulationOpen) {
            closeSimulation();
        }
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        if (!isSimulationOpen || !simulationData) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            computeTrackTransform();
            drawTrack();
            renderFrame(simState.currentFrame);
        }, 150);
    });

    const modeFormation = document.getElementById('simModeFormation');
    const modeRaceStart = document.getElementById('simModeRaceStart');

    if (modeFormation) {
        modeFormation.addEventListener('click', () => {
            if (!simulationData) return;
            simState.mode = 'formation';
            simState.currentFrame = simState.formationFrame;
            simState.prevPositions = null;
            simState.positionChanges = {};
            simState.lastOrderSignature = null;
            modeFormation.classList.add('sim-mode-active');
            if (modeRaceStart) modeRaceStart.classList.remove('sim-mode-active');
            stopPlayback();
            const leaderboardList = document.getElementById('simLeaderboardList');
            if (leaderboardList) leaderboardList.innerHTML = '';
            renderFrame(simState.currentFrame);
            startPlayback();
        });
    }

    if (modeRaceStart) {
        modeRaceStart.addEventListener('click', () => {
            if (!simulationData) return;
            simState.mode = 'race';
            simState.currentFrame = simState.raceStartFrameIdx;
            simState.prevPositions = null;
            simState.positionChanges = {};
            simState.lastOrderSignature = null;
            modeRaceStart.classList.add('sim-mode-active');
            if (modeFormation) modeFormation.classList.remove('sim-mode-active');
            stopPlayback();
            const leaderboardList = document.getElementById('simLeaderboardList');
            if (leaderboardList) leaderboardList.innerHTML = '';
            renderFrame(simState.currentFrame);
            startPlayback();
        });
    }

    setupSimulationControls();
}

async function openSimulation() {
    const overlay = document.getElementById('simulationOverlay');
    if (!overlay) return;

    isSimulationOpen = true;
    // Open first so the track container has real dimensions when we size the
    // canvas and project telemetry coordinates into it.
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    await loadSimulation();

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

    if (simRound) simRound.textContent = circuit.round;
    if (simTitle) simTitle.textContent = `${circuit.name} Grand Prix`;

    const simDots = document.getElementById('simDots');
    if (simDots) simDots.innerHTML = '<div class="sim-loading">Loading telemetry...</div>';

    try {
        const response = await fetch(`${SIMULATION_PATH}/simulation_${circuit.key}_2023.json?v=${Date.now()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        simulationData = await response.json();
        buildDots();
        simState.lastOrderSignature = null;
        simState.prevPositions = null;
        simState.positionChanges = {};
        computeTrackTransform();
        drawTrack();
        const startFrame = findRaceStartFrame(simulationData);
        simState.formationFrame = 0;
        simState.raceStartFrameIdx = startFrame;
        simState.mode = 'race';
        simState.currentFrame = startFrame;

        // Sync mode button states to defaults
        const mf = document.getElementById('simModeFormation');
        const mr = document.getElementById('simModeRaceStart');
        if (mf) mf.classList.remove('sim-mode-active');
        if (mr) mr.classList.add('sim-mode-active');

        renderFrame(startFrame);
    } catch (error) {
        console.error('Error loading simulation data:', error);
        if (simDots) {
            simDots.innerHTML = '<div class="sim-loading">Simulation data unavailable</div>';
        }
        simulationData = null;
    }
}

function driverInitials(name) {
    if (!name) return '???';
    const token = name.trim().split(/\s+/).pop();
    return token.slice(0, 3).toUpperCase();
}

// Compute an aspect-preserving mapping from the bundle's normalized [0,1]
// telemetry space into the track container's pixel box. Telemetry was
// normalized per-axis during ETL, so we rescale using the real coordinate
// ranges (from bounds) to undo that distortion, then letterbox-center it.
function computeTrackTransform() {
    const container = document.getElementById('simDots');
    if (!container || !simulationData) {
        simState.trackTransform = null;
        return;
    }
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const b = simulationData.bounds;
    const xrange = b.max_x - b.min_x;
    const yrange = b.max_y - b.min_y;
    if (cw <= 0 || ch <= 0 || xrange <= 0 || yrange <= 0) {
        simState.trackTransform = null;
        return;
    }

    const pad = 0.9; // breathing room around the track outline
    const scale = Math.min(cw / xrange, ch / yrange) * pad;
    const trackW = xrange * scale;
    const trackH = yrange * scale;

    simState.trackTransform = {
        cw,
        ch,
        trackW,
        trackH,
        offsetX: (cw - trackW) / 2,
        offsetY: (ch - trackH) / 2,
        flipY: true // telemetry Y points up; screen Y points down
    };
}

// Project a normalized [0,1] coordinate to container-relative percentages.
function projectNorm(nx, ny) {
    const t = simState.trackTransform;
    if (!t) return [nx * 100, ny * 100];
    const yy = t.flipY ? 1 - ny : ny;
    const left = ((t.offsetX + nx * t.trackW) / t.cw) * 100;
    const top = ((t.offsetY + yy * t.trackH) / t.ch) * 100;
    return [left, top];
}

// Render the track outline onto the canvas from the telemetry itself, so the
// live dots are guaranteed to sit on the line for every circuit.
function drawTrack() {
    const canvas = document.getElementById('simTrackCanvas');
    const container = document.getElementById('simDots');
    if (!canvas || !container || !simulationData) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    canvas.width = cw;
    canvas.height = ch;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, cw, ch);
    if (!simState.trackTransform) return;

    const frames = simulationData.frames;
    const stride = Math.max(1, Math.floor(frames.length / 800));
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';

    for (let f = 0; f < frames.length; f += stride) {
        const coords = frames[f].coords;
        for (let i = 0; i < coords.length; i++) {
            const c = coords[i];
            if (c && c[0] !== null && c[1] !== null) {
                const [lx, ty] = projectNorm(c[0], c[1]);
                ctx.beginPath();
                ctx.arc((lx / 100) * cw, (ty / 100) * ch, 1.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
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
        dot.textContent = driverInitials(driver.name);
        dot.setAttribute('title', `${driver.name} #${num}`);
        simDots.appendChild(dot);
        simState.dots.push(dot);
    });
}

// Detect the race start frame by skipping the pre-race window (formation lap +
// grid wait). The strategy: find the longest sustained "stopped" period (where
// most cars have near-zero inter-frame displacement), then return the first
// frame after it where most cars are moving again.
function findRaceStartFrame(data) {
    const frames = data.frames;
    const n = data.driver_numbers.length;
    const minDrivers = Math.max(1, Math.ceil(n * 0.6));
    // 0.003 ≈ 0.3% of the normalised axis per second; race-speed cars move 0.02+
    const MOVE = 0.003;

    // Step 1: build a boolean array — true if most drivers are moving that frame
    const isMoving = new Uint8Array(frames.length);
    for (let i = 1; i < frames.length; i++) {
        const prev = frames[i - 1].coords;
        const curr = frames[i].coords;
        let m = 0;
        for (let d = 0; d < n; d++) {
            const a = prev[d];
            const b = curr[d];
            if (!a || !b || a[0] === null || b[0] === null) continue;
            if (Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]) > MOVE) m++;
        }
        isMoving[i] = m >= minDrivers ? 1 : 0;
    }

    // Step 2: find the longest consecutive "stopped" run
    let bestStart = 0, bestLen = 0, runStart = 0, runLen = 0;
    for (let i = 0; i < frames.length; i++) {
        if (!isMoving[i]) {
            if (runLen === 0) runStart = i;
            runLen++;
            if (runLen > bestLen) { bestLen = runLen; bestStart = runStart; }
        } else {
            runLen = 0;
        }
    }

    // Step 3: first moving frame after the longest stop block — that's the start
    if (bestLen > 30) {
        const afterStop = bestStart + bestLen;
        for (let i = afterStop; i < frames.length; i++) {
            if (isMoving[i]) return i;
        }
    }

    // Fallback: first frame where most cars have valid coords
    for (let i = 0; i < frames.length; i++) {
        const valid = frames[i].coords.filter(c => c && c[0] !== null).length;
        if (valid >= minDrivers) return i;
    }
    return 0;
}

// Render the simulation at a (possibly fractional) frame index. This function
// is a pure renderer: it never writes back to simState.currentFrame, so the
// playback loop keeps full ownership of time accumulation.
function renderFrame(frameFloat) {
    if (!simulationData) return;

    const frames = simulationData.frames;
    if (!frames || frames.length === 0) return;

    frameFloat = Math.max(0, Math.min(frameFloat, frames.length - 1));
    const i0 = Math.floor(frameFloat);
    const i1 = Math.min(i0 + 1, frames.length - 1);
    const frac = frameFloat - i0;

    const frame = frames[i0];
    const nextFrame = frames[i1];
    const positions = frame.positions;
    const coords = frame.coords;
    const nextCoords = nextFrame.coords;

    // Update dots with linear interpolation between the two bracketing frames
    // so cars glide along the track instead of snapping once per second.
    simState.dots.forEach((dot, i) => {
        const a = coords[i];
        const b = nextCoords[i];
        const aValid = a && a[0] !== null && a[1] !== null;
        const bValid = b && b[0] !== null && b[1] !== null;

        let x = null;
        let y = null;
        if (aValid && bValid) {
            x = a[0] + (b[0] - a[0]) * frac;
            y = a[1] + (b[1] - a[1]) * frac;
        } else if (aValid) {
            x = a[0];
            y = a[1];
        } else if (bValid) {
            x = b[0];
            y = b[1];
        }

        if (x !== null) {
            const [left, top] = projectNorm(x, y);
            dot.style.left = `${left}%`;
            dot.style.top = `${top}%`;
            dot.style.opacity = '1';
        } else {
            dot.style.opacity = '0';
        }
    });

    renderLeaderboard(positions);

    // Update HUD
    const simTime = document.getElementById('simTime');
    const simLap = document.getElementById('simLap');
    const simLeader = document.getElementById('simLeader');
    const simProgressTime = document.getElementById('simProgressTime');
    const simProgressFill = document.getElementById('simProgressFill');

    if (simTime) {
        const start = new Date(simulationData.start_time);
        const tSeconds = frame.t + (nextFrame.t - frame.t) * frac;
        const current = new Date(start.getTime() + tSeconds * 1000);
        simTime.textContent = current.toISOString().substr(11, 8);
    }

    if (simLap) {
        const totalLaps = simulationData.total_laps || 57;
        let leaderLap = 0;
        if (frame.laps && frame.laps.length > 0) {
            const leaderIndex = positions.indexOf(1);
            if (leaderIndex >= 0 && frame.laps[leaderIndex] !== null) {
                leaderLap = frame.laps[leaderIndex];
            }
        }
        // At race start the leader's recorded lap may be null because the
        // first lap hasn't been crossed yet. Show 1 so the current lap is
        // always visible.
        const displayLap = leaderLap > 0 ? leaderLap : 1;
        simLap.textContent = `${displayLap} / ${totalLaps}`;
    }

    if (simLeader) {
        const leaderIndex = positions.indexOf(1);
        if (leaderIndex >= 0) {
            const leaderNum = simulationData.driver_numbers[leaderIndex];
            const leader = simulationData.drivers[String(leaderNum)];
            simLeader.textContent = driverInitials(leader.name);
        }
    }

    const progress = frames.length > 1 ? frameFloat / (frames.length - 1) : 0;
    if (simProgressTime) simProgressTime.textContent = `${Math.round(progress * 100)}%`;
    if (simProgressFill) simProgressFill.style.width = `${progress * 100}%`;
}

// Rebuild the F1 timing tower only when order changes; track position deltas
// for flash animations and change badges. Uses FLIP animation so rows glide
// smoothly to their new positions when a driver overtakes.
function renderLeaderboard(positions) {
    const leaderboardList = document.getElementById('simLeaderboardList');
    if (!leaderboardList) return;

    const indexed = simulationData.driver_numbers.map((num, i) => ({
        num,
        position: positions[i] ?? 99,
        driver: simulationData.drivers[String(num)]
    }));
    indexed.sort((a, b) => a.position - b.position);

    const signature = indexed.map(e => e.num).join(',');

    const now = performance.now();

    // Record position changes vs previous snapshot
    if (simState.prevPositions !== null) {
        indexed.forEach(entry => {
            if (entry.position === 99) return;
            const prev = simState.prevPositions[entry.num];
            if (prev !== undefined && prev !== entry.position) {
                const delta = prev - entry.position; // positive = moved up
                simState.positionChanges[entry.num] = { delta, ts: now };
            }
        });
    }
    const currentMap = {};
    indexed.forEach(e => { if (e.position !== 99) currentMap[e.num] = e.position; });
    simState.prevPositions = currentMap;

    if (signature === simState.lastOrderSignature) return;

    // --- FLIP: record old positions of existing rows ---
    const oldRows = [...leaderboardList.children];
    const oldTops = {};
    const wasPresent = new Set();
    oldRows.forEach(row => {
        const dn = parseInt(row.dataset.driverNum);
        if (!isNaN(dn)) {
            oldTops[dn] = row.getBoundingClientRect().top;
            wasPresent.add(dn);
        }
    });

    simState.lastOrderSignature = signature;

    // Expire badges older than 4 s
    Object.keys(simState.positionChanges).forEach(num => {
        if (now - simState.positionChanges[num].ts > 4000) {
            delete simState.positionChanges[num];
        }
    });

    // Rebuild rows
    leaderboardList.innerHTML = '';
    indexed.forEach(entry => {
        const isP1 = entry.position === 1;
        const chg = simState.positionChanges[entry.num];

        const row = document.createElement('div');
        row.className = `tower-row${isP1 ? ' tower-p1' : ''}`;
        row.dataset.driverNum = entry.num;
        if (chg && now - chg.ts < 3000) {
            row.classList.add(chg.delta > 0 ? 'gained' : 'lost');
        }
        if (!wasPresent.has(entry.num)) {
            row.classList.add('tower-new');
        }

        const stripe = document.createElement('div');
        stripe.className = 'tower-row-stripe';
        stripe.style.backgroundColor = entry.driver.team_color;
        row.appendChild(stripe);

        const posEl = document.createElement('span');
        posEl.className = 'tower-col-pos';
        posEl.textContent = entry.position === 99 ? '-' : entry.position;
        row.appendChild(posEl);

        const driverBlock = document.createElement('div');
        driverBlock.className = 'tower-driver-block';
        driverBlock.innerHTML = `<span class="tower-driver-code">${driverInitials(entry.driver.name)}</span><span class="tower-team-name">${entry.driver.team}</span>`;
        row.appendChild(driverBlock);

        const gapEl = document.createElement('span');
        gapEl.className = 'tower-col-gap';
        gapEl.textContent = isP1 ? 'LEADER' : (entry.position === 99 ? '-' : '');
        row.appendChild(gapEl);

        const chgEl = document.createElement('span');
        chgEl.className = 'tower-col-chg';
        if (chg && chg.delta !== 0 && now - chg.ts < 3000) {
            const badge = document.createElement('span');
            badge.className = `tower-chg-badge ${chg.delta > 0 ? 'up' : 'down'}`;
            badge.textContent = chg.delta > 0 ? `▲${chg.delta}` : `▼${Math.abs(chg.delta)}`;
            chgEl.appendChild(badge);
        }
        row.appendChild(chgEl);

        leaderboardList.appendChild(row);
    });

    // --- FLIP: apply inverse transform then animate to identity ---
    const newRows = [...leaderboardList.children];
    newRows.forEach(row => {
        const dn = parseInt(row.dataset.driverNum);
        if (isNaN(dn) || oldTops[dn] === undefined) return;
        const newTop = row.getBoundingClientRect().top;
        const delta = oldTops[dn] - newTop;
        if (Math.abs(delta) < 0.5) return;
        row.style.transition = 'none';
        row.style.transform = `translateY(${delta}px)`;
        // Force layout then animate
        void row.offsetHeight;
        row.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        row.style.transform = 'translateY(0)';
    });
}

function startPlayback() {
    if (simState.playing || !simulationData) return;
    simState.playing = true;
    simState.lastFrameTime = performance.now();
    updatePlayToggleState();
    tick();
}

function stopPlayback() {
    simState.playing = false;
    if (simState.animationFrameId) {
        cancelAnimationFrame(simState.animationFrameId);
        simState.animationFrameId = null;
    }
    updatePlayToggleState();
}

function togglePlayback() {
    if (!simulationData) {
        openSimulation();
        return;
    }
    if (simState.playing) {
        stopPlayback();
    } else {
        startPlayback();
    }
}

function updatePlayToggleState() {
    const btn = document.getElementById('simPlayToggleBtn');
    if (!btn) return;
    if (simState.playing) {
        btn.classList.add('playing');
        btn.setAttribute('aria-label', 'Pause');
    } else {
        btn.classList.remove('playing');
        btn.setAttribute('aria-label', 'Play');
    }
}

function restartSimulation() {
    if (!simulationData) return;
    stopPlayback();
    if (simState.mode === 'formation') {
        simState.currentFrame = 0;
    } else {
        simState.currentFrame = simState.raceStartFrameIdx;
    }
    simState.prevPositions = null;
    simState.positionChanges = {};
    simState.lastOrderSignature = null;
    // Force leaderboard rebuild
    const leaderboardList = document.getElementById('simLeaderboardList');
    if (leaderboardList) leaderboardList.innerHTML = '';
    renderFrame(simState.currentFrame);
}

function skipSimulation(seconds) {
    if (!simulationData) return;
    const frames = simulationData.frames;
    if (!frames || frames.length === 0) return;
    const interval = simulationData.frame_interval || 1;
    const frameDelta = seconds / interval;
    const wasPlaying = simState.playing;
    if (wasPlaying) {
        // Pause briefly so we don't fight the playback loop
        simState.playing = false;
        if (simState.animationFrameId) {
            cancelAnimationFrame(simState.animationFrameId);
            simState.animationFrameId = null;
        }
    }
    simState.currentFrame = Math.max(0, Math.min(frames.length - 1, simState.currentFrame + frameDelta));
    simState.prevPositions = null;
    simState.positionChanges = {};
    simState.lastOrderSignature = null;
    const leaderboardList = document.getElementById('simLeaderboardList');
    if (leaderboardList) leaderboardList.innerHTML = '';
    renderFrame(simState.currentFrame);
    if (wasPlaying) {
        simState.playing = true;
        simState.lastFrameTime = performance.now();
        tick();
    }
    updatePlayToggleState();
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
        renderFrame(simState.currentFrame);
        stopPlayback();
        return;
    }

    renderFrame(simState.currentFrame);
    simState.animationFrameId = requestAnimationFrame(tick);
}

function setupSimulationControls() {
    const playToggleBtn = document.getElementById('simPlayToggleBtn');
    const skipBackBtn = document.getElementById('simSkipBackBtn');
    const skipFwdBtn = document.getElementById('simSkipFwdBtn');
    const restartBtn = document.getElementById('simRestartBtn');
    const speedOptions = document.getElementById('simSpeedOptions');
    const progressTrack = document.getElementById('simProgressTrack');

    if (playToggleBtn) {
        playToggleBtn.addEventListener('click', togglePlayback);
    }

    if (skipBackBtn) {
        skipBackBtn.addEventListener('click', () => skipSimulation(-10));
    }

    if (skipFwdBtn) {
        skipFwdBtn.addEventListener('click', () => skipSimulation(10));
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', restartSimulation);
    }

    if (speedOptions) {
        speedOptions.addEventListener('click', (e) => {
            if (!e.target.classList.contains('speed-btn')) return;
            speedOptions.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            simulationSpeed = parseInt(e.target.dataset.speed, 10);
        });
    }

    // Click-to-seek on progress bar
    if (progressTrack) {
        progressTrack.addEventListener('click', (e) => {
            if (!simulationData || !simulationData.frames) return;
            const rect = progressTrack.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const targetFrame = Math.floor(pct * (simulationData.frames.length - 1));
            const wasPlaying = simState.playing;
            if (wasPlaying) {
                simState.playing = false;
                if (simState.animationFrameId) {
                    cancelAnimationFrame(simState.animationFrameId);
                    simState.animationFrameId = null;
                }
            }
            simState.currentFrame = targetFrame;
            simState.prevPositions = null;
            simState.positionChanges = {};
            simState.lastOrderSignature = null;
            const leaderboardList = document.getElementById('simLeaderboardList');
            if (leaderboardList) leaderboardList.innerHTML = '';
            renderFrame(simState.currentFrame);
            if (wasPlaying) {
                simState.playing = true;
                simState.lastFrameTime = performance.now();
                tick();
            }
            updatePlayToggleState();
        });
    }
}
