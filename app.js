// Key for localStorage persistence
const STORAGE_KEY = 'wedding_timeline_milestones';

// Default mock data when localStorage is empty
const DEFAULT_MILESTONES = [
    { id: 'm1', time: '18:00', title: 'Chegada dos Convidados', completed: false, order: 0 },
    { id: 'm2', time: '18:30', title: 'Início da Cerimônia', completed: false, order: 1 },
    { id: 'm3', time: '19:30', title: 'Sessão de Fotos', completed: false, order: 2 },
    { id: 'm4', time: '20:30', title: 'Jantar', completed: false, order: 3 }
];

// Current filter state: 'all' | 'pending' | 'completed'
let currentFilter = 'all';

// App state
let milestones = [];

// History stack for Undo feature
let historyStack = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadMilestones();
    renderApp();
});

// Load milestones from LocalStorage or initialize with defaults
function loadMilestones() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            milestones = JSON.parse(stored);
            ensureOrders();
        } else {
            milestones = [...DEFAULT_MILESTONES];
            saveMilestones();
        }
    } catch (e) {
        console.error('Error loading milestones from localStorage', e);
        milestones = [...DEFAULT_MILESTONES];
    }
}

// Ensure each milestone has an order property
function ensureOrders() {
    milestones.forEach((m, idx) => {
        if (typeof m.order !== 'number') {
            m.order = idx;
        }
    });
}

// Save milestones to LocalStorage
function saveMilestones() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(milestones));
    } catch (e) {
        console.error('Error saving milestones to localStorage', e);
    }
}

// Push current state snapshot into history for Undo
function pushHistory() {
    historyStack.push(JSON.stringify(milestones));
    if (historyStack.length > 20) historyStack.shift(); // keep last 20 states
    updateUndoButtonState();
}

// Undo last action
function undoLastAction() {
    if (historyStack.length === 0) return;
    const previousState = historyStack.pop();
    if (previousState) {
        milestones = JSON.parse(previousState);
        saveMilestones();
        renderApp();
    }
    updateUndoButtonState();
}

// Update state of Undo button
function updateUndoButtonState() {
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
        undoBtn.disabled = historyStack.length === 0;
    }
}

// Sort milestones chronologically or by order
function sortMilestones() {
    milestones.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
            return a.order - b.order;
        }
        return a.time.localeCompare(b.time);
    });
}

// Render entire UI
function renderApp() {
    sortMilestones();
    renderHeaderStats();
    renderProgressBar();
    renderMilestoneList();
    updateFilterButtons();
    updateUndoButtonState();
}

// Render header quick counts
function renderHeaderStats() {
    const total = milestones.length;
    const completedCount = milestones.filter(m => m.completed).length;
    const remainingCount = total - completedCount;

    const totalEl = document.getElementById('header-total-count');
    const completedEl = document.getElementById('header-completed-count');
    const remainingEl = document.getElementById('header-remaining-count');

    if (totalEl) totalEl.textContent = total;
    if (completedEl) completedEl.textContent = completedCount;
    if (remainingEl) remainingEl.textContent = remainingCount;
}

// Render Progress Indicator
function renderProgressBar() {
    const total = milestones.length;
    const completedCount = milestones.filter(m => m.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);

    const summaryText = document.getElementById('progress-summary-text');
    const percentageBadge = document.getElementById('progress-percentage-badge');
    const progressBar = document.getElementById('progress-bar');

    if (summaryText) summaryText.textContent = `${completedCount} de ${total} concluídos`;
    if (percentageBadge) percentageBadge.textContent = `${percentage}%`;
    if (progressBar) progressBar.style.width = `${percentage}%`;
}

// Filter button active state updates
function updateFilterButtons() {
    const btnAll = document.getElementById('filter-all');
    const btnPending = document.getElementById('filter-pending');
    const btnCompleted = document.getElementById('filter-completed');

    const activeClasses = ['bg-wedding-100', 'font-semibold', 'text-wedding-900'];
    const inactiveClasses = ['text-wedding-600', 'hover:text-wedding-900'];

    [btnAll, btnPending, btnCompleted].forEach(btn => {
        if (!btn) return;
        btn.classList.remove(...activeClasses);
        btn.classList.add(...inactiveClasses);
    });

    let activeBtn = btnAll;
    if (currentFilter === 'pending') activeBtn = btnPending;
    if (currentFilter === 'completed') activeBtn = btnCompleted;

    if (activeBtn) {
        activeBtn.classList.remove(...inactiveClasses);
        activeBtn.classList.add(...activeClasses);
    }
}

// Render milestones list based on filter
function renderMilestoneList() {
    const container = document.getElementById('milestones-container');
    if (!container) return;

    let filtered = milestones;
    if (currentFilter === 'pending') {
        filtered = milestones.filter(m => !m.completed);
    } else if (currentFilter === 'completed') {
        filtered = milestones.filter(m => m.completed);
    }

    if (filtered.length === 0) {
        let emptyMsg = 'Nenhum marco encontrado.';
        if (currentFilter === 'pending') emptyMsg = 'Parabéns! Todos os marcos foram concluídos.';
        if (currentFilter === 'completed') emptyMsg = 'Nenhum marco foi concluído ainda.';

        container.innerHTML = `
            <div class="text-center py-10 px-4 bg-white/50 rounded-2xl border border-dashed border-wedding-200">
                <p class="text-xs text-wedding-500 font-medium">${emptyMsg}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map((m, index) => `
        <div class="bg-white rounded-2xl p-4 border border-wedding-100 shadow-sm hover:shadow transition-all duration-200 flex items-center justify-between gap-3 animate-fade-in ${m.completed ? 'opacity-75 bg-wedding-50/50' : ''}">
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <!-- Checkbox button -->
                <button onclick="toggleMilestone('${m.id}')" aria-label="Marcar marco" class="flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${m.completed ? 'bg-wedding-600 border-wedding-600 text-white' : 'border-wedding-300 hover:border-wedding-500 bg-white'}">
                    ${m.completed ? `
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                        </svg>
                    ` : ''}
                </button>

                <!-- Time Badge -->
                <span class="flex-shrink-0 text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${m.completed ? 'bg-wedding-200/60 text-wedding-700 line-through' : 'bg-wedding-100 text-wedding-800'}">
                    ${m.time}
                </span>

                <!-- Title -->
                <span class="text-sm font-medium text-wedding-900 truncate ${m.completed ? 'line-through text-wedding-500' : ''}">
                    ${escapeHtml(m.title)}
                </span>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-1 flex-shrink-0">
                <!-- Reorder Up/Down -->
                <div class="flex flex-col gap-0.5 mr-1">
                    <button onclick="moveMilestone('${m.id}', -1)" aria-label="Mover para cima" ${index === 0 ? 'disabled class="text-wedding-200 cursor-not-allowed"' : 'class="text-wedding-400 hover:text-wedding-700"'}>
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"></path>
                        </svg>
                    </button>
                    <button onclick="moveMilestone('${m.id}', 1)" aria-label="Mover para baixo" ${index === filtered.length - 1 ? 'disabled class="text-wedding-200 cursor-not-allowed"' : 'class="text-wedding-400 hover:text-wedding-700"'}>
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                </div>

                <!-- Edit Button -->
                <button onclick="openEditModal('${m.id}')" aria-label="Editar marco" class="p-1.5 text-wedding-400 hover:text-wedding-700 hover:bg-wedding-100 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                </button>

                <!-- Delete Button -->
                <button onclick="deleteMilestone('${m.id}')" aria-label="Excluir marco" class="p-1.5 text-wedding-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Toggle milestone completion state
function toggleMilestone(id) {
    pushHistory();
    milestones = milestones.map(m => {
        if (m.id === id) {
            return { ...m, completed: !m.completed };
        }
        return m;
    });
    saveMilestones();
    renderApp();
}

// Delete milestone
function deleteMilestone(id) {
    pushHistory();
    milestones = milestones.filter(m => m.id !== id);
    // Reindex order
    milestones.forEach((m, idx) => m.order = idx);
    saveMilestones();
    renderApp();
}

// Move milestone up or down
function moveMilestone(id, direction) {
    const idx = milestones.findIndex(m => m.id === id);
    if (idx < 0) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= milestones.length) return;

    pushHistory();
    // Swap items
    const temp = milestones[idx];
    milestones[idx] = milestones[targetIdx];
    milestones[targetIdx] = temp;

    // Reassign order properties
    milestones.forEach((m, i) => m.order = i);

    saveMilestones();
    renderApp();
}

// Open Edit Modal
function openEditModal(id) {
    const m = milestones.find(item => item.id === id);
    if (!m) return;

    document.getElementById('edit-milestone-id').value = m.id;
    document.getElementById('edit-milestone-time').value = m.time;
    document.getElementById('edit-milestone-title').value = m.title;

    document.getElementById('edit-modal').classList.remove('hidden');
}

// Close Edit Modal
function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

// Save Edit
function handleSaveEdit(event) {
    event.preventDefault();
    const id = document.getElementById('edit-milestone-id').value;
    const time = document.getElementById('edit-milestone-time').value.trim();
    const title = document.getElementById('edit-milestone-title').value.trim();

    if (!id || !time || !title) return;

    pushHistory();
    milestones = milestones.map(m => {
        if (m.id === id) {
            return { ...m, time, title };
        }
        return m;
    });

    saveMilestones();
    closeEditModal();
    renderApp();
}

// Add new milestone
function handleAddMilestone(event) {
    event.preventDefault();
    const timeInput = document.getElementById('milestone-time');
    const titleInput = document.getElementById('milestone-title');

    if (!timeInput || !titleInput) return;

    const time = timeInput.value.trim();
    const title = titleInput.value.trim();

    if (!time || !title) return;

    pushHistory();
    const newMilestone = {
        id: 'm_' + Date.now(),
        time,
        title,
        completed: false,
        order: milestones.length
    };

    milestones.push(newMilestone);
    saveMilestones();

    // Reset form
    timeInput.value = '';
    titleInput.value = '';
    toggleAddForm(false);

    renderApp();
}

// Toggle visibility of Add Form
function toggleAddForm(show) {
    const form = document.getElementById('add-milestone-form');
    if (!form) return;

    if (typeof show === 'boolean') {
        if (show) form.classList.remove('hidden');
        else form.classList.add('hidden');
    } else {
        form.classList.toggle('hidden');
    }
}

// Apply Delay in Cascade to all pending milestones
function applyDelay(minutes) {
    pushHistory();
    milestones = milestones.map(m => {
        if (!m.completed) {
            return {
                ...m,
                time: addMinutesToTime(m.time, minutes)
            };
        }
        return m;
    });

    saveMilestones();
    renderApp();
}

// Helper to add minutes to HH:MM format
function addMinutesToTime(timeStr, minutesToAdd) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes + minutesToAdd;

    // Handle wrap-around midnight (24h)
    totalMinutes = (totalMinutes % (24 * 60) + 24 * 60) % (24 * 60);

    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    const formattedHours = String(newHours).padStart(2, '0');
    const formattedMinutes = String(newMinutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
}

// Set View Filter
function setFilter(filter) {
    currentFilter = filter;
    renderApp();
}

// Reset to default mock data
function resetToDefaults() {
    if (confirm('Deseja restaurar o cronograma para os dados de exemplo iniciais?')) {
        pushHistory();
        milestones = [...DEFAULT_MILESTONES];
        saveMilestones();
        renderApp();
    }
}

// Helper to escape HTML characters
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
