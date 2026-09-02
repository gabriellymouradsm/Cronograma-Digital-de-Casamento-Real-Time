// Key for localStorage persistence
const STORAGE_KEY = 'wedding_timeline_milestones';

// Default mock data when localStorage is empty
const DEFAULT_MILESTONES = [
    { id: 'm1', time: '18:00', title: 'Chegada dos Convidados', completed: false },
    { id: 'm2', time: '18:30', title: 'Início da Cerimônia', completed: false },
    { id: 'm3', time: '19:30', title: 'Sessão de Fotos', completed: false },
    { id: 'm4', time: '20:30', title: 'Jantar', completed: false }
];

// Current filter state: 'all' | 'pending' | 'completed'
let currentFilter = 'all';

// App state
let milestones = [];

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
        } else {
            milestones = [...DEFAULT_MILESTONES];
            saveMilestones();
        }
    } catch (e) {
        console.error('Error loading milestones from localStorage', e);
        milestones = [...DEFAULT_MILESTONES];
    }
}

// Save milestones to LocalStorage
function saveMilestones() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(milestones));
    } catch (e) {
        console.error('Error saving milestones to localStorage', e);
    }
}

// Sort milestones chronologically
function sortMilestones() {
    milestones.sort((a, b) => a.time.localeCompare(b.time));
}

// Render entire UI
function renderApp() {
    sortMilestones();
    renderProgressBar();
    renderMilestoneList();
    updateFilterButtons();
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

    container.innerHTML = filtered.map(m => `
        <div class="bg-white rounded-2xl p-4 border border-wedding-100 shadow-sm hover:shadow transition-all duration-200 flex items-center justify-between gap-3 animate-fade-in ${m.completed ? 'opacity-75 bg-wedding-50/50' : ''}">
            <div class="flex items-center gap-3.5 flex-1 min-w-0">
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
    milestones = milestones.filter(m => m.id !== id);
    saveMilestones();
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

    const newMilestone = {
        id: 'm_' + Date.now(),
        time,
        title,
        completed: false
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
