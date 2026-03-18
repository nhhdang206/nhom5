// ===== MANUAL SCHEDULE EDITOR =====

class ManualSchedule {
    constructor() {
        this.days = {
            monday: 'Thứ 2',
            tuesday: 'Thứ 3',
            wednesday: 'Thứ 4',
            thursday: 'Thứ 5',
            friday: 'Thứ 6',
            saturday: 'Thứ 7',
            sunday: 'Chủ nhật'
        };
        this.init();
    }

    init() {
        const container = document.getElementById('manualScheduleGrid');
        if (!container) return;

        this.renderGrid(container);
        this.attachSaveEvent();
        this.attachToggleEvent();
    }

    attachToggleEvent() {
        const toggleBtn = document.getElementById('manualScheduleToggle');
        const form = document.getElementById('manualScheduleForm');
        if (toggleBtn && form) {
            toggleBtn.addEventListener('click', () => {
                const isVisible = form.style.display !== 'none';
                form.style.display = isVisible ? 'none' : 'block';
                toggleBtn.querySelector('.toggle-icon').textContent = isVisible ? '▼' : '▲';
            });
        }
    }

    renderGrid(container) {
        let html = '';
        Object.keys(this.days).forEach(dayKey => {
            html += `
                <div class="manual-day-column" data-day="${dayKey}">
                    <h4 class="manual-day-title">${this.days[dayKey]}</h4>
                    <div class="manual-slots" data-day="${dayKey}">
                        ${this.createSlotHTML(dayKey, '')}
                    </div>
                    <button type="button" class="add-slot-btn" data-day="${dayKey}">
                        <span>＋</span> Thêm
                    </button>
                </div>
            `;
        });
        container.innerHTML = html;

        // Attach add-slot events
        container.querySelectorAll('.add-slot-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const day = btn.dataset.day;
                this.addSlot(day);
            });
        });

        // Attach remove events for initial slots
        this.attachRemoveEvents(container);
    }

    createSlotHTML(dayKey, value) {
        // Parse value to extract time and subject
        let time = '';
        let subject = '';
        if (value) {
            if (value.includes(' - ')) {
                const parts = value.split(' - ');
                time = parts[0].trim();
                subject = parts.slice(1).join(' - ').trim();
            } else {
                const lastSpace = value.lastIndexOf(' ');
                if (lastSpace > 0) {
                    time = value.substring(0, lastSpace).trim();
                    subject = value.substring(lastSpace + 1).trim();
                } else {
                    time = value.trim();
                }
            }
        }
        return `
            <div class="manual-slot-row">
                <div class="manual-slot-fields">
                    <input type="text" class="manual-slot-time" 
                           placeholder="VD: 8:00-10:00" 
                           value="${this.escapeHtml(time)}"
                           data-day="${dayKey}">
                    <input type="text" class="manual-slot-subject" 
                           placeholder="Môn học" 
                           value="${this.escapeHtml(subject)}"
                           data-day="${dayKey}">
                </div>
                <button type="button" class="remove-slot-btn" title="Xóa">✕</button>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addSlot(dayKey) {
        const slotsContainer = document.querySelector(`.manual-slots[data-day="${dayKey}"]`);
        if (!slotsContainer) return;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.createSlotHTML(dayKey, '');
        const newRow = wrapper.firstElementChild;
        slotsContainer.appendChild(newRow);

        // Attach remove event
        newRow.querySelector('.remove-slot-btn').addEventListener('click', () => {
            this.removeSlot(newRow, dayKey);
        });

        // Focus the time input
        newRow.querySelector('.manual-slot-time').focus();

        // Smooth entrance animation
        newRow.style.opacity = '0';
        newRow.style.transform = 'translateY(-8px)';
        requestAnimationFrame(() => {
            newRow.style.transition = 'all 0.25s ease';
            newRow.style.opacity = '1';
            newRow.style.transform = 'translateY(0)';
        });
    }

    removeSlot(row, dayKey) {
        const slotsContainer = document.querySelector(`.manual-slots[data-day="${dayKey}"]`);
        // Always keep at least 1 slot
        if (slotsContainer && slotsContainer.children.length <= 1) {
            row.querySelector('.manual-slot-input').value = '';
            return;
        }
        row.style.transition = 'all 0.2s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        setTimeout(() => row.remove(), 200);
    }

    attachRemoveEvents(container) {
        container.querySelectorAll('.remove-slot-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const row = btn.closest('.manual-slot-row');
                const timeInput = row.querySelector('.manual-slot-time');
                const dayKey = timeInput ? timeInput.dataset.day : null;
                if (dayKey) this.removeSlot(row, dayKey);
            });
        });
    }

    collectData() {
        const data = {};
        Object.keys(this.days).forEach(dayKey => {
            const rows = document.querySelectorAll(`.manual-slots[data-day="${dayKey}"] .manual-slot-row`);
            const items = [];
            rows.forEach(row => {
                const timeInput = row.querySelector('.manual-slot-time');
                const subjectInput = row.querySelector('.manual-slot-subject');
                const time = timeInput ? timeInput.value.trim() : '';
                const subject = subjectInput ? subjectInput.value.trim() : '';
                if (time || subject) {
                    items.push((time && subject) ? `${time} - ${subject}` : (time || subject));
                }
            });
            data[dayKey] = items;
        });
        return data;
    }

    attachSaveEvent() {
        const saveBtn = document.getElementById('saveManualSchedule');
        if (!saveBtn) return;

        saveBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('manualScheduleName');
            const name = nameInput ? nameInput.value.trim() : '';

            if (!name) {
                this.showMessage('❌ Vui lòng nhập tên lịch học!', 'error');
                if (nameInput) nameInput.focus();
                return;
            }

            const data = this.collectData();

            // Check if at least one slot has content
            const hasContent = Object.values(data).some(slots => slots.length > 0);
            if (!hasContent) {
                this.showMessage('❌ Vui lòng thêm ít nhất một hoạt động vào lịch!', 'error');
                return;
            }

            // Save using Storage
            const user = Storage.getCurrentUser();
            if (user) {
                Storage.saveSchedule(user, { name, data });

                // Reload saved schedules list
                if (window.ai && window.ai.loadSavedSchedules) {
                    window.ai.loadSavedSchedules();
                }

                // Display the schedule
                if (window.ai && window.ai.displaySchedule) {
                    window.ai.displaySchedule(data);
                }

                this.showMessage('✅ Đã lưu lịch học thành công!', 'success');

                // Reset form
                if (nameInput) nameInput.value = '';
                this.resetGrid();
            }
        });
    }

    showMessage(text, type) {
        const msgDiv = document.getElementById('manualScheduleMsg');
        if (!msgDiv) return;

        msgDiv.textContent = text;
        msgDiv.className = `manual-schedule-msg ${type}`;
        msgDiv.style.display = 'block';

        setTimeout(() => {
            msgDiv.style.display = 'none';
        }, 3000);
    }

    resetGrid() {
        const container = document.getElementById('manualScheduleGrid');
        if (container) this.renderGrid(container);
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.ManualSchedule = ManualSchedule;
}
