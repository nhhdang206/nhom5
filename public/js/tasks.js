// ===== TASK MANAGEMENT =====

class TaskManager {
    constructor() {
        this.tasks = [];
        this.init();
    }

    init() {
        console.log('TaskManager initializing...');
        this.loadTasks();
        this.attachEvents();
        this.renderTasks();
        console.log('TaskManager initialized, tasks:', this.tasks);
    }

    loadTasks() {
        const user = Storage.getCurrentUser();
        if (user) {
            this.tasks = Storage.getTasks(user);
        }
    }

    saveTasks() {
        const user = Storage.getCurrentUser();
        if (user) {
            user.tasks = this.tasks;
            Storage.updateUser(user.username, user);
        }
    }

    attachEvents() {
        // Add task button
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                console.log('Add task button clicked');
                this.showTaskInput();
            });
        } else {
            console.warn('addTaskBtn not found in DOM');
        }

        // Save task button
        const saveTaskBtn = document.getElementById('saveTaskBtn');
        if (saveTaskBtn) {
            saveTaskBtn.addEventListener('click', () => this.saveTask());
        } else {
            console.warn('saveTaskBtn not found in DOM');
        }

        // Cancel task button
        const cancelTaskBtn = document.getElementById('cancelTaskBtn');
        if (cancelTaskBtn) {
            cancelTaskBtn.addEventListener('click', () => this.hideTaskInput());
        } else {
            console.warn('cancelTaskBtn not found in DOM');
        }

        // Enter key to save task (for both inputs)
        const newTaskTime = document.getElementById('newTaskTime');
        const newTaskSubject = document.getElementById('newTaskSubject');
        if (newTaskTime && newTaskSubject) {
            [newTaskTime, newTaskSubject].forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.saveTask();
                    }
                });
            });
        } else {
            console.warn('newTaskTime or newTaskSubject not found in DOM');
        }
    }

    showTaskInput() {
        const container = document.getElementById('taskInputContainer');
        const input = document.getElementById('newTaskInput');

        if (container && input) {
            container.style.display = 'block';
            input.focus();
        }
    }

    hideTaskInput() {
        const container = document.getElementById('taskInputContainer');
        const timeInput = document.getElementById('newTaskTime');
        const subjectInput = document.getElementById('newTaskSubject');

        if (container && timeInput && subjectInput) {
            container.style.display = 'none';
            timeInput.value = '';
            subjectInput.value = '';
        }
    }

    saveTask() {
        const timeInput = document.getElementById('newTaskTime');
        const subjectInput = document.getElementById('newTaskSubject');
        const taskTime = timeInput.value.trim();
        const taskSubject = subjectInput.value.trim();

        if (!taskTime || !taskSubject) {
            alert('Vui lòng nhập cả thời gian và môn học!');
            return;
        }

        // Add task
        const newTask = {
            id: Date.now().toString(),
            time: taskTime,
            subject: taskSubject,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.saveTasks();
        this.renderTasks();
        this.hideTaskInput();

        // Show success message
        this.showNotification('✅ Đã thêm nhiệm vụ thành công!');
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const taskItem = document.querySelector(`[data-task-id="${taskId}"]`);
        if (!taskItem) return;

        // Get current values
        const currentTime = task.time || '';
        const currentSubject = task.subject || '';

        // Replace content with inline edit fields
        const contentDiv = taskItem.querySelector('.task-content');
        const actionsDiv = taskItem.querySelector('.task-actions');

        // Hide actions temporarily
        actionsDiv.style.display = 'none';

        // Create edit fields
        contentDiv.innerHTML = `
            <div class="task-edit-inline">
                <input type="text" class="task-edit-time" value="${this.escapeHtml(currentTime)}" placeholder="Thời gian">
                <input type="text" class="task-edit-subject" value="${this.escapeHtml(currentSubject)}" placeholder="Môn học">
                <div class="task-edit-actions">
                    <button class="task-edit-save">💾</button>
                    <button class="task-edit-cancel">❌</button>
                </div>
            </div>
        `;

        // Focus on time input
        const timeInput = contentDiv.querySelector('.task-edit-time');
        timeInput.focus();

        // Handle save
        const saveBtn = contentDiv.querySelector('.task-edit-save');
        saveBtn.onclick = () => {
            const newTime = timeInput.value.trim();
            const newSubject = contentDiv.querySelector('.task-edit-subject').value.trim();

            if (!newTime || !newSubject) {
                alert('Vui lòng nhập cả thời gian và môn học!');
                return;
            }

            task.time = newTime;
            task.subject = newSubject;
            this.saveTasks();
            this.renderTasks();
            this.showNotification('✅ Đã cập nhật nhiệm vụ!');
        };

        // Handle cancel
        const cancelBtn = contentDiv.querySelector('.task-edit-cancel');
        cancelBtn.onclick = () => {
            this.renderTasks(); // Re-render to cancel edit
        };

        // Enter key to save
        [timeInput, contentDiv.querySelector('.task-edit-subject')].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') saveBtn.click();
            });
        });

        // Escape key to cancel
        [timeInput, contentDiv.querySelector('.task-edit-subject')].forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') cancelBtn.click();
            });
        });
    }

    deleteTask(taskId) {
        if (!confirm('Bạn có chắc muốn xóa nhiệm vụ này?')) return;

        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.showNotification('🗑️ Đã xóa nhiệm vụ!');
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;

        if (this.tasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-tasks">
                    <div class="empty-icon">📝</div>
                    <p>Chưa có nhiệm vụ nào</p>
                    <small>Nhấn "Thêm nhiệm vụ" để bắt đầu!</small>
                </div>
            `;
            return;
        }

        taskList.innerHTML = this.tasks.map(task => {
            // Migrate old tasks that still have 'text' field
            if (task.text && !task.time && !task.subject) {
                const parts = task.text.split(' - ', 2);
                task.time = parts[0] || '';
                task.subject = parts[1] || task.text;
                delete task.text;
            }

            const time = task.time || '';
            const subject = task.subject || '';

            return `
                <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                    <input type="checkbox"
                           class="task-checkbox"
                           ${task.completed ? 'checked' : ''}
                           onchange="taskManager.toggleTask('${task.id}')">
                    <div class="task-content">
                        <div class="task-time">${this.escapeHtml(time)}</div>
                        <div class="task-subject">${this.escapeHtml(subject)}</div>
                    </div>
                    <div class="task-actions">
                        <button class="task-btn edit" onclick="taskManager.editTask('${task.id}')" title="Chỉnh sửa">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="task-btn delete" onclick="taskManager.deleteTask('${task.id}')" title="Xóa">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <path d="M10 11v6"/>
                                <path d="M14 11v6"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(40, 167, 69, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 0.9rem;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize task manager when DOM is loaded
let taskManager;

function initializeTaskManager() {
    // Check if TaskManager class exists and Storage is available
    if (typeof Storage !== 'undefined' && !taskManager) {
        taskManager = new TaskManager();
    }
}

// Try to initialize immediately if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTaskManager);
} else {
    // DOM is already loaded
    initializeTaskManager();
}

// Also try initialization after a short delay as fallback
setTimeout(initializeTaskManager, 500);

// Export for global access
if (typeof window !== 'undefined') {
    window.TaskManager = TaskManager;
    window.initializeTaskManager = initializeTaskManager;
}