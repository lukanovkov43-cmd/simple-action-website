// Game State
let gameState = {
    points: parseInt(localStorage.getItem('clickerPoints')) || 0,
    totalClicks: parseInt(localStorage.getItem('totalClicks')) || 0,
    pointsPerClick: 1,
    combo: 1,
    comboTimer: null,
    actionLogs: JSON.parse(localStorage.getItem('clickerLogs')) || [],
    upgrades: [
        { id: 'double', name: '2x Multiplier', cost: 50, owned: parseInt(localStorage.getItem('upgrade_double')) || 0, multiplier: 2 },
        { id: 'triple', name: '3x Multiplier', cost: 150, owned: parseInt(localStorage.getItem('upgrade_triple')) || 0, multiplier: 3 },
        { id: 'ten', name: '10x Multiplier', cost: 500, owned: parseInt(localStorage.getItem('upgrade_ten')) || 0, multiplier: 10 },
    ],
    autoClickers: [
        { id: 'ac1', name: 'Bot Tier 1', cost: 100, owned: parseInt(localStorage.getItem('auto_tier1')) || 0, pointsPerSecond: 1 },
        { id: 'ac2', name: 'Bot Tier 2', cost: 500, owned: parseInt(localStorage.getItem('auto_tier2')) || 0, pointsPerSecond: 5 },
        { id: 'ac3', name: 'Bot Tier 3', cost: 2000, owned: parseInt(localStorage.getItem('auto_tier3')) || 0, pointsPerSecond: 20 },
        { id: 'ac4', name: 'Bot Tier 4', cost: 10000, owned: parseInt(localStorage.getItem('auto_tier4')) || 0, pointsPerSecond: 100 },
    ]
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    calculatePointsPerClick();
    renderUpgrades();
    renderAutoClickers();
    updateStats();
    renderLogs();
    logAction('Game Started', 'Click Master loaded');
    startAutoClickers();
});

// Main Click Handler
function click() {
    const points = gameState.pointsPerClick * gameState.combo;
    gameState.points += points;
    gameState.totalClicks += 1;
    
    // Update combo
    clearTimeout(gameState.comboTimer);
    gameState.combo += 1;
    gameState.comboTimer = setTimeout(() => {
        gameState.combo = 1;
        updateStats();
    }, 5000);
    
    // Floating points animation
    createFloatingPoint(points);
    
    // Save state
    saveGameState();
    updateStats();
    logAction('Click', `+${points} points (Combo: ${gameState.combo}x)`);
}

// Create floating points animation
function createFloatingPoint(points) {
    const container = document.getElementById('floatingPointsContainer');
    const point = document.createElement('div');
    point.className = 'floating-point';
    point.textContent = `+${points}`;
    point.style.left = (Math.random() * window.innerWidth) + 'px';
    point.style.top = window.innerHeight + 'px';
    
    // Random colors
    const colors = ['#667eea', '#43e97b', '#ffa502', '#ff6b6b', '#f5576c'];
    point.style.color = colors[Math.floor(Math.random() * colors.length)];
    
    container.appendChild(point);
    setTimeout(() => point.remove(), 2000);
}

// Calculate points per click based on upgrades
function calculatePointsPerClick() {
    gameState.pointsPerClick = 1;
    gameState.upgrades.forEach(upgrade => {
        if (upgrade.owned > 0) {
            gameState.pointsPerClick *= Math.pow(upgrade.multiplier, upgrade.owned);
        }
    });
}

// Buy Upgrade
function buyUpgrade(upgradeId) {
    const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
    if (gameState.points >= upgrade.cost) {
        gameState.points -= upgrade.cost;
        upgrade.owned += 1;
        localStorage.setItem(`upgrade_${upgradeId}`, upgrade.owned);
        calculatePointsPerClick();
        saveGameState();
        renderUpgrades();
        updateStats();
        logAction('Upgrade Purchased', `${upgrade.name} (Total owned: ${upgrade.owned})`);
    }
}

// Render Upgrades
function renderUpgrades() {
    const container = document.getElementById('upgradesList');
    container.innerHTML = gameState.upgrades.map(upgrade => {
        const canAfford = gameState.points >= upgrade.cost;
        return `
            <div class="upgrade-item ${canAfford ? 'affordable' : 'unaffordable'}">
                <div class="upgrade-info">
                    <div class="upgrade-name">${upgrade.name}</div>
                    <div class="upgrade-cost">Cost: ${upgrade.cost} points</div>
                </div>
                <div class="upgrade-owned">${upgrade.owned}</div>
                <button onclick="buyUpgrade('${upgrade.id}')" class="buy-btn" ${!canAfford ? 'disabled' : ''}>Buy</button>
            </div>
        `;
    }).join('');
}

// Buy Auto Clicker
function buyAutoClicker(clickerId) {
    const clicker = gameState.autoClickers.find(c => c.id === clickerId);
    if (gameState.points >= clicker.cost) {
        gameState.points -= clicker.cost;
        clicker.owned += 1;
        localStorage.setItem(`auto_${clickerId}`, clicker.owned);
        saveGameState();
        renderAutoClickers();
        updateStats();
        logAction('Auto Clicker Purchased', `${clicker.name} (Total owned: ${clicker.owned})`);
    }
}

// Render Auto Clickers
function renderAutoClickers() {
    const container = document.getElementById('autoClickersList');
    container.innerHTML = gameState.autoClickers.map(clicker => {
        const canAfford = gameState.points >= clicker.cost;
        return `
            <div class="auto-clicker-item ${canAfford ? 'affordable' : 'unaffordable'}">
                <div class="auto-clicker-info">
                    <div class="auto-clicker-name">${clicker.name}</div>
                    <div class="auto-clicker-cost">Cost: ${clicker.cost} | +${clicker.pointsPerSecond}/sec</div>
                </div>
                <div class="auto-clicker-owned">${clicker.owned}</div>
                <button onclick="buyAutoClicker('${clicker.id}')" class="buy-btn" ${!canAfford ? 'disabled' : ''}>Buy</button>
            </div>
        `;
    }).join('');
}

// Start Auto Clickers
function startAutoClickers() {
    setInterval(() => {
        let totalAutoPoints = 0;
        gameState.autoClickers.forEach(clicker => {
            totalAutoPoints += clicker.pointsPerSecond * clicker.owned;
        });
        if (totalAutoPoints > 0) {
            gameState.points += totalAutoPoints;
            saveGameState();
            updateStats();
        }
    }, 1000);
}

// Update Stats Display
function updateStats() {
    document.getElementById('points').textContent = formatNumber(gameState.points);
    document.getElementById('pointsPerClick').textContent = formatNumber(gameState.pointsPerClick);
    document.getElementById('totalClicks').textContent = gameState.totalClicks;
    document.getElementById('combo').textContent = gameState.combo + 'x';
    
    const comboElement = document.getElementById('comboDisplay');
    if (gameState.combo > 1) {
        comboElement.textContent = `🔥 COMBO: ${gameState.combo}x!`;
    } else {
        comboElement.textContent = '';
    }
}

// Format large numbers
function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(0);
}

// Save Game State
function saveGameState() {
    localStorage.setItem('clickerPoints', gameState.points);
    localStorage.setItem('totalClicks', gameState.totalClicks);
    localStorage.setItem('clickerLogs', JSON.stringify(gameState.actionLogs));
}

// Log Action
function logAction(action, details) {
    const timestamp = new Date();
    const logEntry = {
        action: action,
        details: details,
        timestamp: timestamp.toLocaleTimeString(),
        iso: timestamp.toISOString()
    };
    gameState.actionLogs.push(logEntry);
    if (gameState.actionLogs.length > 100) {
        gameState.actionLogs.shift();
    }
    localStorage.setItem('clickerLogs', JSON.stringify(gameState.actionLogs));
    renderLogs();
}

// Render Logs
function renderLogs() {
    const container = document.getElementById('logContainer');
    const count = document.getElementById('logCount');
    
    count.textContent = `${gameState.actionLogs.length} action${gameState.actionLogs.length !== 1 ? 's' : ''} logged`;
    
    if (gameState.actionLogs.length === 0) {
        container.innerHTML = '<div class="log-empty">Start clicking to see your actions!</div>';
        return;
    }
    
    container.innerHTML = gameState.actionLogs
        .slice()
        .reverse()
        .map(log => `
            <div class="log-entry">
                <div class="log-timestamp">${log.timestamp}</div>
                <div class="log-message"><strong>${log.action}</strong>: ${log.details}</div>
            </div>
        `)
        .join('');
}

// Download Game Data
function downloadGameData() {
    const data = {
        points: gameState.points,
        totalClicks: gameState.totalClicks,
        upgrades: gameState.upgrades,
        autoClickers: gameState.autoClickers,
        exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `click-master-save-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    logAction('Save Downloaded', `Downloaded game progress with ${gameState.points} points`);
}

// Reset Game
function resetGame() {
    if (confirm('Are you sure? This will reset everything!')) {
        localStorage.clear();
        location.reload();
    }
}