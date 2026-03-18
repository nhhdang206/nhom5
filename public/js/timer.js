// ===== POMODORO TIMER =====

class PomodoroTimer {
    constructor() {
        this.mode = 'focus'; // focus, short, long
        this.timeLeft = 25 * 60; // seconds
        this.totalTime = 25 * 60;
        this.isRunning = false;
        this.interval = null;

        this.settings = {
            focus: 25,
            short: 5,
            long: 15
        };

        this.sessions = {
            today: 0,
            minutes: 0,
            exp: 0
        };

        this.init();
    }

    init() {
        // Load user settings
        const user = Storage.getCurrentUser();
        if (user && user.settings) {
            this.settings.focus = user.settings.focusTime || 25;
            this.settings.short = user.settings.shortBreak || 5;
            this.settings.long = user.settings.longBreak || 15;

            // Update inputs
            document.getElementById('focusTime').value = this.settings.focus;
            document.getElementById('shortBreak').value = this.settings.short;
            document.getElementById('longBreak').value = this.settings.long;
        }

        // Set initial time
        this.setMode('focus');
        this.updateDisplay();
        this.attachEvents();
        this.updateProgress();
    }

    attachEvents() {
        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.setMode(mode);

                // Update active state
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Control buttons
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());

        // Settings inputs
        document.getElementById('focusTime').addEventListener('change', (e) => {
            this.settings.focus = parseInt(e.target.value);
            this.saveSettings();
            if (this.mode === 'focus' && !this.isRunning) {
                this.setMode('focus');
            }
        });

        document.getElementById('shortBreak').addEventListener('change', (e) => {
            this.settings.short = parseInt(e.target.value);
            this.saveSettings();
            if (this.mode === 'short' && !this.isRunning) {
                this.setMode('short');
            }
        });

        document.getElementById('longBreak').addEventListener('change', (e) => {
            this.settings.long = parseInt(e.target.value);
            this.saveSettings();
            if (this.mode === 'long' && !this.isRunning) {
                this.setMode('long');
            }
        });
    }

    setMode(mode) {
        this.mode = mode;

        const timeMap = {
            focus: this.settings.focus,
            short: this.settings.short,
            long: this.settings.long
        };

        this.totalTime = timeMap[mode] * 60;
        this.timeLeft = this.totalTime;
        this.updateDisplay();
        this.updateProgress();
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;

        // Update UI
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'inline-flex';

        // Start countdown
        this.interval = setInterval(() => {
            this.timeLeft--;

            if (this.timeLeft <= 0) {
                this.complete();
            } else {
                this.updateDisplay();
                this.updateProgress();
            }
        }, 1000);
    }

    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        clearInterval(this.interval);

        // Update UI
        document.getElementById('startBtn').style.display = 'inline-flex';
        document.getElementById('pauseBtn').style.display = 'none';
    }

    reset() {
        this.pause();
        this.setMode(this.mode);
    }

    complete() {
        this.pause();

        // Play sound notification (optional)
        this.playNotification();

        // If it was a focus session, record it
        if (this.mode === 'focus') {
            const minutes = this.settings.focus;
            this.sessions.today++;
            this.sessions.minutes += minutes;
            const exp = Math.floor(minutes / 5);
            this.sessions.exp += exp;

            // Update stats display
            this.updateSessionStats();

            // Save to user data
            const user = Storage.getCurrentUser();
            if (user) {
                Storage.addSession(user, minutes);
                Storage.addExp(user, exp);
                Storage.updateStreak(user);

                // Update header stats
                if (window.gamification) {
                    window.gamification.updateDisplay();
                }
            }

            // Show reward if milestone reached
            this.checkMilestones();

            // Auto-switch to break
            this.setMode('short');
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('[data-mode="short"]').classList.add('active');
        } else {
            // Break is over, back to focus
            this.setMode('focus');
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('[data-mode="focus"]').classList.add('active');
        }

        // Show completion message
        const message = this.mode === 'focus' ?
            '🎉 Hoàn thành! Giờ nghỉ ngơi một chút!' :
            '✨ Hết giờ nghỉ! Sẵn sàng tập trung lại!';

        this.showNotification(message);
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;

        document.getElementById('timerMinutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('timerSeconds').textContent = String(seconds).padStart(2, '0');

        // Update page title
        document.title = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} - Padoro`;
    }

    updateProgress() {
        const progress = document.getElementById('timerProgress');
        if (!progress) return;

        const percentage = (this.timeLeft / this.totalTime);
        const circumference = 2 * Math.PI * 90; // radius = 90
        const offset = circumference * (1 - percentage);

        progress.style.strokeDasharray = `${circumference} ${circumference}`;
        progress.style.strokeDashoffset = offset;

        // Add gradient
        if (!document.getElementById('timerGradient')) {
            const svg = document.querySelector('.timer-circle');
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.id = 'timerGradient';
            gradient.innerHTML = `
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            `;
            defs.appendChild(gradient);
            svg.appendChild(defs);
        }
    }

    updateSessionStats() {
        document.getElementById('todaySessions').textContent = this.sessions.today;
        document.getElementById('todayMinutes').textContent = this.sessions.minutes;
        document.getElementById('todayExp').textContent = this.sessions.exp;
    }

    saveSettings() {
        const user = Storage.getCurrentUser();
        if (user) {
            user.settings.focusTime = this.settings.focus;
            user.settings.shortBreak = this.settings.short;
            user.settings.longBreak = this.settings.long;
            Storage.updateUser(user.username, user);
        }
    }

    playNotification() {
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Padoro', {
                body: this.mode === 'focus' ? 'Hoàn thành phiên tập trung!' : 'Hết giờ nghỉ!',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23667eea"/></svg>'
            });
        }

        // Audio notification (simple beep)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    showNotification(message) {
        // Create a temporary notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            font-size: 1.1rem;
            font-weight: 500;
            animation: slideInDown 0.5s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutUp 0.5s ease-out';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    checkMilestones() {
        const user = Storage.getCurrentUser();
        if (!user) return;

        // Check for milestone rewards
        if (user.stats.totalSessions === 10) {
            window.gamification.showReward('🎉 10 phiên học đầu tiên! +50 EXP', 50);
        } else if (user.stats.totalSessions === 50) {
            window.gamification.showReward('🏆 50 phiên học! +200 EXP', 200);
        } else if (user.stats.totalSessions === 100) {
            window.gamification.showReward('🌟 100 phiên học! +500 EXP', 500);
        }

        // Check streak milestones
        if (user.streak === 7) {
            window.gamification.showReward('🔥 Streak 7 ngày! +100 EXP', 100);
        } else if (user.streak === 30) {
            window.gamification.showReward('🔥🔥 Streak 30 ngày! +300 EXP', 300);
        }
    }
}

// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideOutUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%);
        }
    }
`;
document.head.appendChild(style);

// Export
if (typeof window !== 'undefined') {
    window.PomodoroTimer = PomodoroTimer;
}
