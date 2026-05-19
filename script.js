// Action Log Storage
let actionLogs = JSON.parse(localStorage.getItem('actionLogs')) || [];
let counter = parseInt(localStorage.getItem('counter')) || 0;
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCounterDisplay();
    renderTodos();
    renderLogs();
    logAction('Page Loaded', 'Website loaded at ' + new Date().toLocaleString());
});

// Logging function - Core functionality
function logAction(action, details) {
    const timestamp = new Date();
    const logEntry = {
        action: action,
        details: details,
        timestamp: timestamp.toLocaleString(),
        timeIso: timestamp.toISOString()
    };
    
    actionLogs.push(logEntry);
    localStorage.setItem('actionLogs', JSON.stringify(actionLogs));
    renderLogs();
}

// Counter Actions
function incrementCounter() {
    counter++;
    localStorage.setItem('counter', counter);
    updateCounterDisplay();
    logAction('Counter Incremented', `Counter is now ${counter}`);
}

function decrementCounter() {
    counter--;
    localStorage.setItem('counter', counter);
    updateCounterDisplay();
    logAction('Counter Decremented', `Counter is now ${counter}`);
}

function resetCounter() {
    const oldValue = counter;
    counter = 0;
    localStorage.setItem('counter', counter);
    updateCounterDisplay();
    logAction('Counter Reset', `Counter reset from ${oldValue} to 0`);
}

function updateCounterDisplay() {
    document.getElementById('counter').textContent = counter;
}

// Todo Actions
function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (!text) {
        showNotification('Please enter a todo!', 'warning');
        return;
    }
    
    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString()
    };
    
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));
    input.value = '';
    renderTodos();
    logAction('Todo Added', `Added: "${text}"`);
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
        logAction('Todo Toggled', `"${todo.text}" marked as ${todo.completed ? 'completed' : 'incomplete'}`);
    }
}

function deleteTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todos = todos.filter(t => t.id !== id);
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
        logAction('Todo Deleted', `Deleted: "${todo.text}"`);
    }
}

function renderTodos() {
    const list = document.getElementById('todoList');
    list.innerHTML = '';
    
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <span class="todo-text" onclick="toggleTodo(${todo.id})">${escapeHtml(todo.text)}</span>
            <button onclick="deleteTodo(${todo.id})" class="btn btn-danger btn-small">Delete</button>
        `;
        list.appendChild(li);
    });
}

// Color Changer
function changeColor() {
    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.background = randomColor;
    logAction('Background Changed', 'Background color changed to a random color');
}

// Text Logging
function logText() {
    const input = document.getElementById('textInput');
    const text = input.value.trim();
    
    if (!text) {
        showNotification('Please enter some text!', 'warning');
        return;
    }
    
    logAction('Text Logged', `User input: "${text}"`);
    input.value = '';
    showNotification('Text logged!', 'success');
}

// Notifications
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    logAction('Notification Shown', `${type.toUpperCase()}: ${message}`);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Page Info
function logPageInfo() {
    const info = {
        'User Agent': navigator.userAgent,
        'Language': navigator.language,
        'Platform': navigator.platform,
        'Screen Size': `${window.innerWidth}x${window.innerHeight}`,
        'Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        'Cookies Enabled': navigator.cookieEnabled,
        'Local Storage Available': !!localStorage,
    };
    
    let details = Object.entries(info)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' | ');
    
    logAction('Page Info Logged', details);
    showNotification('Page info logged!', 'success');
}

// Render Logs
function renderLogs() {
    const container = document.getElementById('logContainer');
    const count = document.getElementById('logCount');
    
    count.textContent = `${actionLogs.length} action${actionLogs.length !== 1 ? 's' : ''} logged`;
    
    if (actionLogs.length === 0) {
        container.innerHTML = '<div class="log-empty">No actions yet. Start by performing an action above!</div>';
        return;
    }
    
    container.innerHTML = actionLogs
        .slice()
        .reverse()
        .map((log, index) => `
            <div class="log-entry">
                <div class="log-timestamp">${log.timestamp}</div>
                <div class="log-message"><strong>${escapeHtml(log.action)}</strong>: ${escapeHtml(log.details)}</div>
            </div>
        `)
        .join('');
}

// Clear Logs
function clearLogs() {
    if (confirm('Are you sure you want to clear all logs? This cannot be undone.')) {
        actionLogs = [];
        todos = [];
        counter = 0;
        localStorage.clear();
        updateCounterDisplay();
        renderTodos();
        renderLogs();
        showNotification('All logs and data cleared!', 'success');
        logAction('All Data Cleared', 'User cleared all logs, todos, and counter');
    }
}

// Download Logs
function downloadLogs() {
    if (actionLogs.length === 0) {
        showNotification('No logs to download!', 'warning');
        return;
    }
    
    const csvContent = [
        ['Timestamp', 'Action', 'Details'],
        ...actionLogs.map(log => [
            log.timestamp,
            log.action,
            log.details
        ])
    ]
        .map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
        .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `action-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    logAction('Logs Downloaded', `Downloaded ${actionLogs.length} log entries as CSV`);
    showNotification('Logs downloaded!', 'success');
}

// Helper function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}