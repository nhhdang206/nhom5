// ===== GEMINI AI INTEGRATION =====

class AIAssistant {
    constructor() {
        this.apiKey = '';
        this.loadApiKey();
        this.attachEvents();
    }

    loadApiKey() {
        const user = Storage.getCurrentUser();
        if (user && user.settings && user.settings.apiKey) {
            this.apiKey = user.settings.apiKey;
        }
    }

    attachEvents() {
        // AI Suggest Time button
        const aiSuggestBtn = document.getElementById('aiSuggestBtn');
        if (aiSuggestBtn) {
            aiSuggestBtn.addEventListener('click', () => {
                if (!this.apiKey) {
                    alert('⚠️ Chưa cài đặt API Key!\n\n1. Truy cập: https://makersuite.google.com/app/apikey\n2. Đăng nhập với Google Account\n3. Tạo API Key mới\n4. Copy và paste vào Settings → Gemini API Key\n5. Nhấn "Lưu"');
                    return;
                }
                this.suggestPomodoroTime();
            });
        }

        // AI Schedule button
        const aiScheduleBtn = document.getElementById('aiScheduleBtn');
        if (aiScheduleBtn) {
            aiScheduleBtn.addEventListener('click', () => {
                if (!this.apiKey) {
                    alert('⚠️ Chưa cài đặt API Key!\n\n1. Truy cập: https://makersuite.google.com/app/apikey\n2. Đăng nhập với Google Account\n3. Tạo API Key mới\n4. Copy và paste vào Settings → Gemini API Key\n5. Nhấn "Lưu"');
                    return;
                }
                document.getElementById('aiScheduleForm').style.display = 'block';
            });
        }

        // Generate Schedule button
        const generateBtn = document.getElementById('generateSchedule');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateSchedule());
        }

        // Save API Key button
        const saveApiKeyBtn = document.getElementById('saveApiKey');
        if (saveApiKeyBtn) {
            saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        }
    }

    async callGemini(prompt) {
        if (!this.apiKey) {
            alert('Vui lòng cài đặt API Key trong phần Cài đặt để sử dụng tính năng AI!');
            return null;
        }

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('API Error Response:', errorData);
                const errorMsg = errorData.error?.message || `API Error ${response.status}`;

                // If quota exceeded or model unavailable, use fallback response
                if (errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('404') || errorMsg.includes('not found')) {
                    console.log('Using fallback mock response due to API quota/availability');
                    return this.getAIFallbackResponse(prompt);
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                const text = data.candidates[0].content.parts[0].text;
                return text;
            } else {
                console.error('Unexpected response format:', data);
                throw new Error('Không thể phân tích phản hồi từ API');
            }

        } catch (error) {
            console.error('Gemini API Error:', error);

            // If it's a quota or availability error, use fallback instead of alerting
            if (error.message.includes('quota') || error.message.includes('429') || error.message.includes('not found')) {
                console.log('API quota exhausted, using fallback response');
                return this.getAIFallbackResponse(prompt);
            }

            alert('Lỗi AI:\n' + error.message);
            return null;
        }
    }

    getAIFallbackResponse(prompt) {
        // Fallback responses when API is unavailable
        if (prompt.includes('Pomodoro') || prompt.includes('thời gian')) {
            return '🤖 Gợi ý (Chế độ Demo):\n\nDựa trên kinh nghiệm của bạn, tôi gợi ý:\n- Thời gian tập trung: 25 phút (focus time)\n- Thời gian nghỉ: 5 phút (short break)\n- Sau 4 pomodoro: 15-20 phút (long break)\n\nĐây là cấu hình Pomodoro cổ điển rất hiệu quả!';
        } else if (prompt.includes('lịch học')) {
            return '🤖 Lịch học (Chế độ Demo):\n\n{\n  "monday": ["8:00-10:00 Môn 1", "10:15-12:00 Môn 2", "14:00-16:00 Môn 3"],\n  "advice": "Hãy duy trì thói quen học tập đều đặn để đạt kết quả tốt nhất."\n}\n\nLưu ý: Đây là gợi ý mẫu. Vui lòng tính phí gọi API hoặc chờ quota reset.';
        }
        return '🤖 Trợ lý AI (Chế độ Demo):\n\nAPI hiện không khả dụng do hạn mức quota đã hết. Vui lòng:\n1. Thiết lập thanh toán tại Google Cloud Console\n2. Hoặc chờ đến ngày hôm sau để quota tự động reset';
    }

    async suggestPomodoroTime() {
        const user = Storage.getCurrentUser();
        if (!user) return;

        const suggestionDiv = document.getElementById('aiSuggestionText');
        suggestionDiv.textContent = 'AI đang suy nghĩ...';
        suggestionDiv.classList.add('show');

        const prompt = `Bạn là chuyên gia về phương pháp Pomodoro. Dựa trên thông tin sau:
        - Người dùng đã học ${user.stats.totalMinutes} phút
        - Đã hoàn thành ${user.stats.totalSessions} phiên học
        - Streak hiện tại: ${user.streak} ngày
        
        Hãy gợi ý thời gian tập trung (focus time) và thời gian nghỉ (break time) tối ưu cho người dùng này.
        Trả lời ngắn gọn trong 2-3 câu, bao gồm cụ thể số phút nên đặt.`;

        const suggestion = await this.callGemini(prompt);

        if (suggestion) {
            suggestionDiv.textContent = '🤖 AI gợi ý: ' + suggestion;
        } else {
            suggestionDiv.textContent = 'Không thể lấy gợi ý từ AI. Vui lòng thử lại.';
            setTimeout(() => suggestionDiv.classList.remove('show'), 3000);
        }
    }

    async generateSchedule() {
        const request = document.getElementById('scheduleRequest').value.trim();

        if (!request) {
            alert('Vui lòng nhập yêu cầu của bạn!');
            return;
        }

        const loadingDiv = document.getElementById('scheduleLoading');
        const displayDiv = document.getElementById('scheduleDisplay');

        loadingDiv.style.display = 'flex';
        displayDiv.innerHTML = '';

        const prompt = `Bạn là trợ lý AI giúp học sinh/sinh viên lập lịch học tập.
        
        Yêu cầu của người dùng: "${request}"
        
        Hãy tạo một lịch học 7 ngày (Thứ 2 đến Chủ nhật) chi tiết, bao gồm:
        - Các môn học/chủ đề cần học
        - Thời gian cụ thể (ví dụ: 8:00-10:00)
        - Thời gian nghỉ
        - Lời khuyên để duy trì năng suất
        
        Trả lời theo định dạng JSON như sau:
        {
            "monday": ["8:00-10:00 Toán - Đại số", "10:15-12:00 Lý - Cơ học", "14:00-16:00 Hóa - Hữu cơ"],
            "tuesday": [...],
            ...
            "sunday": [...],
            "advice": "Lời khuyên chung"
        }
        
        Chỉ trả về JSON, không thêm text khác.`;

        const response = await this.callGemini(prompt);

        loadingDiv.style.display = 'none';

        if (!response) {
            displayDiv.innerHTML = '<p>Không thể tạo lịch. Vui lòng thử lại.</p>';
            return;
        }

        try {
            // Try to parse JSON from response
            let jsonStr = response.trim();
            // Remove markdown code blocks if present
            jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');

            const schedule = JSON.parse(jsonStr);
            this.displaySchedule(schedule);

            // Save schedule
            const user = Storage.getCurrentUser();
            if (user) {
                Storage.saveSchedule(user, {
                    name: `Lịch ${new Date().toLocaleDateString('vi-VN')}`,
                    data: schedule
                });
                this.loadSavedSchedules();
            }

        } catch (error) {
            console.error('Parse error:', error);
            // If JSON parsing fails, display as text
            displayDiv.innerHTML = `<div class="schedule-text">${response.replace(/\n/g, '<br>')}</div>`;
        }
    }

    displaySchedule(schedule) {
        const displayDiv = document.getElementById('scheduleDisplay');
        const days = {
            monday: 'Thứ 2',
            tuesday: 'Thứ 3',
            wednesday: 'Thứ 4',
            thursday: 'Thứ 5',
            friday: 'Thứ 6',
            saturday: 'Thứ 7',
            sunday: 'Chủ nhật'
        };

        let html = '';

        Object.keys(days).forEach(day => {
            if (schedule[day]) {
                html += `
                    <div class="schedule-day">
                        <h4>${days[day]}</h4>
                        ${schedule[day].map(item => `<div class="schedule-item">${item}</div>`).join('')}
                    </div>
                `;
            }
        });

        if (schedule.advice) {
            html += `
                <div class="schedule-advice" style="grid-column: 1 / -1; background: var(--bg-card); padding: var(--space-lg); border-radius: var(--radius-md); margin-top: var(--space-lg);">
                    <h4>💡 Lời khuyên:</h4>
                    <p>${schedule.advice}</p>
                </div>
            `;
        }

        displayDiv.innerHTML = html;
    }

    loadSavedSchedules() {
        const user = Storage.getCurrentUser();
        if (!user) return;

        const listDiv = document.getElementById('savedScheduleList');
        if (!listDiv) return;

        if (!user.schedules || user.schedules.length === 0) {
            listDiv.innerHTML = '<p style="color: var(--text-muted);">Chưa có lịch đã lưu</p>';
            return;
        }

        const html = user.schedules.map(schedule => `
            <div class="schedule-card" data-schedule-id="${schedule.id}">
                <div class="schedule-card-content">
                    <h4>${schedule.name}</h4>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">
                        ${new Date(schedule.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                </div>
                <div class="schedule-card-actions">
                    <button class="schedule-btn edit-schedule-btn" 
                            data-schedule-id="${schedule.id}"
                            title="Chỉnh sửa">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="schedule-btn delete-schedule-btn" 
                            data-schedule-id="${schedule.id}"
                            title="Xóa">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <path d="M10 11v6"/>
                            <path d="M14 11v6"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        listDiv.innerHTML = html;

        // Add click handlers for viewing schedule
        listDiv.querySelectorAll('.schedule-card-content').forEach(card => {
            card.addEventListener('click', () => {
                const scheduleCard = card.closest('.schedule-card');
                const scheduleId = scheduleCard.dataset.scheduleId;
                const schedule = user.schedules.find(s => s.id === scheduleId);
                if (schedule) {
                    this.displaySchedule(schedule.data);
                }
            });
        });

        // Add edit handlers
        listDiv.querySelectorAll('.edit-schedule-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const scheduleId = btn.dataset.scheduleId;
                this.editSchedule(scheduleId);
            });
        });

        // Add delete handlers
        listDiv.querySelectorAll('.delete-schedule-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const scheduleId = btn.dataset.scheduleId;
                this.deleteSchedule(scheduleId);
            });
        });
    }

    editSchedule(scheduleId) {
        const user = Storage.getCurrentUser();
        if (!user) return;

        const schedule = user.schedules.find(s => s.id === scheduleId);
        if (!schedule) return;

        // Show the manual schedule form
        const manualScheduleForm = document.getElementById('manualScheduleForm');
        const manualScheduleGrid = document.getElementById('manualScheduleGrid');
        const manualScheduleName = document.getElementById('manualScheduleName');

        if (!manualScheduleForm || !manualScheduleGrid || !manualScheduleName) return;

        // Set the schedule name
        manualScheduleName.value = schedule.name;

        // Clear existing grid
        manualScheduleGrid.innerHTML = '';

        // Days mapping
        const days = {
            monday: 'Thứ 2',
            tuesday: 'Thứ 3',
            wednesday: 'Thứ 4',
            thursday: 'Thứ 5',
            friday: 'Thứ 6',
            saturday: 'Thứ 7',
            sunday: 'Chủ nhật'
        };

        // Build grid HTML
        let gridHTML = '';
        Object.keys(days).forEach(dayKey => {
            const dayData = schedule.data[dayKey] || [];
            let slotsHTML = '';

            // Add existing slots
            dayData.forEach((slot, index) => {
                slotsHTML += `
                    <div class="manual-slot">
                        <input type="text" value="${this.escapeHtml(slot)}" class="slot-input">
                        <button type="button" class="slot-delete-btn" onclick="this.parentElement.remove()">×</button>
                    </div>
                `;
            });

            // Add empty slot if no slots
            if (dayData.length === 0) {
                slotsHTML += this.createSlotHTML(dayKey, '');
            }

            gridHTML += `
                <div class="manual-day-column" data-day="${dayKey}">
                    <h4 class="manual-day-title">${days[dayKey]}</h4>
                    <div class="manual-slots" data-day="${dayKey}">
                        ${slotsHTML}
                    </div>
                    <button type="button" class="add-slot-btn" data-day="${dayKey}">
                        <span>＋</span> Thêm
                    </button>
                </div>
            `;
        });

        manualScheduleGrid.innerHTML = gridHTML;

        // Re-attach event listeners for add buttons
        manualScheduleGrid.querySelectorAll('.add-slot-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const dayKey = btn.dataset.day;
                const slotsDiv = btn.previousElementSibling;
                slotsDiv.insertAdjacentHTML('beforeend', this.createSlotHTML(dayKey, ''));
            });
        });

        // Show the form
        manualScheduleForm.style.display = 'block';
        manualScheduleForm.dataset.editingScheduleId = scheduleId;

        // Update save button to save the edited schedule
        const saveBtn = document.getElementById('saveManualSchedule');
        saveBtn.innerHTML = '<span>💾</span> Cập nhật lịch học';
        const originalOnclick = saveBtn.onclick;
        
        saveBtn.onclick = (e) => {
            e.preventDefault();
            this.saveEditedSchedule(scheduleId, originalOnclick);
        };
    }

    saveEditedSchedule(scheduleId, restoreCallback) {
        const user = Storage.getCurrentUser();
        if (!user) return;

        const manualScheduleName = document.getElementById('manualScheduleName');
        const manualScheduleGrid = document.getElementById('manualScheduleGrid');
        const manualScheduleForm = document.getElementById('manualScheduleForm');

        const newName = manualScheduleName.value.trim();
        if (!newName) {
            alert('Tên lịch học không thể trống!');
            return;
        }

        // Get all the schedule data from the grid
        const scheduleData = {};
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        days.forEach(dayKey => {
            const slotsDiv = manualScheduleGrid.querySelector(`[data-day="${dayKey}"].manual-slots`);
            if (slotsDiv) {
                const slots = [];
                slotsDiv.querySelectorAll('.manual-slot').forEach(slot => {
                    const timeInput = slot.querySelector('.slot-time');
                    const subjectInput = slot.querySelector('.slot-subject');
                    const time = timeInput ? timeInput.value.trim() : '';
                    const subject = subjectInput ? subjectInput.value.trim() : '';
                    if (time || subject) {
                        slots.push((time && subject) ? `${time} - ${subject}` : (time || subject));
                    }
                });
                scheduleData[dayKey] = slots;
            }
        });

        // Update the schedule
        const schedule = user.schedules.find(s => s.id === scheduleId);
        if (schedule) {
            schedule.name = newName;
            schedule.data = scheduleData;
            Storage.updateUser(user.username, user);
            this.loadSavedSchedules();

            // Reset the form
            manualScheduleForm.style.display = 'none';
            delete manualScheduleForm.dataset.editingScheduleId;
            
            // Restore original save button
            const saveBtn = document.getElementById('saveManualSchedule');
            saveBtn.innerHTML = '<span>💾</span> Lưu lịch học';
            saveBtn.onclick = restoreCallback;

            alert('✅ Đã cập nhật lịch học thành công!');
        }
    }

    deleteSchedule(scheduleId) {
        const user = Storage.getCurrentUser();
        if (!user) return;

        if (!confirm('Bạn có chắc muốn xóa lịch học này? Hành động này không thể hoàn tác.')) {
            return;
        }

        const index = user.schedules.findIndex(s => s.id === scheduleId);
        if (index === -1) return;

        user.schedules.splice(index, 1);
        Storage.updateUser(user.username, user);
        this.loadSavedSchedules();

        alert('🗑️ Đã xóa lịch học thành công!');
    }

    saveApiKey() {
        const input = document.getElementById('apiKeyInput');
        const apiKey = input.value.trim();

        if (!apiKey) {
            alert('Vui lòng nhập API Key!');
            return;
        }

        const user = Storage.getCurrentUser();
        if (user) {
            user.settings.apiKey = apiKey;
            Storage.updateUser(user.username, user);
            this.apiKey = apiKey;

            alert('✅ Đã lưu API Key thành công!');
            input.type = 'password';
        }
    }

    createSlotHTML(dayKey, value) {
        // Parse value to extract time and subject
        let time = '';
        let subject = '';
        if (value) {
            // Try to split on " - " first, then on last space
            if (value.includes(' - ')) {
                const parts = value.split(' - ');
                time = parts[0].trim();
                subject = parts.slice(1).join(' - ').trim();
            } else {
                // Split on last space
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
            <div class="manual-slot">
                <input type="text" value="${this.escapeHtml(time)}" class="slot-time" placeholder="VD: 8:00-10:00">
                <input type="text" value="${this.escapeHtml(subject)}" class="slot-subject" placeholder="Môn học">
                <button type="button" class="slot-delete-btn" onclick="this.parentElement.remove()">×</button>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.AIAssistant = AIAssistant;
}
