// ===== LOCAL STORAGE MANAGER =====

const Storage = {
    // User Management
    getUsers() {
        return JSON.parse(localStorage.getItem('padoro_users') || '[]');
    },
    
    saveUsers(users) {
        localStorage.setItem('padoro_users', JSON.stringify(users));
    },
    
    getCurrentUser() {
        const username = localStorage.getItem('padoro_current_user');
        if (!username) return null;
        
        const users = this.getUsers();
        return users.find(u => u.username === username) || null;
    },
    
    setCurrentUser(username) {
        localStorage.setItem('padoro_current_user', username);
    },
    
    logout() {
        localStorage.removeItem('padoro_current_user');
    },
    
    // Check if username or email exists
    userExists(username, email) {
        const users = this.getUsers();
        return users.some(u => 
            u.username.toLowerCase() === username.toLowerCase() || 
            u.email.toLowerCase() === email.toLowerCase()
        );
    },
    
    // Find user by username or email
    findUser(identifier) {
        const users = this.getUsers();
        return users.find(u => 
            u.username.toLowerCase() === identifier.toLowerCase() || 
            u.email.toLowerCase() === identifier.toLowerCase()
        );
    },
    
    // Create new user
    createUser(username, email, password) {
        const users = this.getUsers();
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password, // In production, this should be hashed!
            createdAt: new Date().toISOString(),
            exp: 0,
            streak: 0,
            lastActive: new Date().toISOString(),
            settings: {
                focusTime: 25,
                shortBreak: 5,
                longBreak: 15,
                apiKey: ''
            },
            stats: {
                totalSessions: 0,
                totalMinutes: 0
            },
            pets: ['🐱'], // Default pet
            activePet: '🐱',
            schedules: [],
            history: [],
            feedbacks: [],
            tasks: [] // Individual tasks for Pomodoro sessions
        };
        
        users.push(newUser);
        this.saveUsers(users);
        return newUser;
    },
    
    // Update user data
    updateUser(username, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.username === username);
        
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            this.saveUsers(users);
            return users[index];
        }
        return null;
    },
    
    // Password Reset
    generateResetCode(email) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const resetData = {
            email,
            code,
            expires: Date.now() + 15 * 60 * 1000 // 15 minutes
        };
        
        localStorage.setItem('padoro_reset_code', JSON.stringify(resetData));
        
        // Simulate sending email (in production, this would be a real email)
        console.log(`[EMAIL SIMULATION] Reset code for ${email}: ${code}`);
        alert(`Mã xác thực của bạn là: ${code}\n(Trong ứng dụng thực, mã này sẽ được gửi qua email)`);
        
        return code;
    },
    
    verifyResetCode(code) {
        const resetData = JSON.parse(localStorage.getItem('padoro_reset_code') || 'null');
        
        if (!resetData) return false;
        if (Date.now() > resetData.expires) {
            localStorage.removeItem('padoro_reset_code');
            return false;
        }
        
        return resetData.code === code;
    },
    
    resetPassword(email, newPassword) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (index !== -1) {
            users[index].password = newPassword;
            this.saveUsers(users);
            localStorage.removeItem('padoro_reset_code');
            return true;
        }
        return false;
    },
    
    // User Stats
    updateStreak(user) {
        const now = new Date();
        const lastActive = new Date(user.lastActive);
        const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
            // Same day, keep streak
            return user.streak;
        } else if (daysDiff === 1) {
            // Next day, increase streak
            user.streak += 1;
        } else {
            // Broke streak
            user.streak = 1;
        }
        
        user.lastActive = now.toISOString();
        this.updateUser(user.username, user);
        return user.streak;
    },
    
    addExp(user, amount) {
        user.exp += amount;
        this.updateUser(user.username, user);
        return user.exp;
    },
    
    addSession(user, minutes) {
        user.stats.totalSessions += 1;
        user.stats.totalMinutes += minutes;
        
        // Add to history
        const today = new Date().toISOString().split('T')[0];
        const historyEntry = {
            date: today,
            minutes,
            exp: Math.floor(minutes / 5) // 1 EXP per 5 minutes
        };
        
        user.history.push(historyEntry);
        
        // Keep only last 30 days
        if (user.history.length > 30) {
            user.history = user.history.slice(-30);
        }
        
        this.updateUser(user.username, user);
    },
    
    // Schedule Management
    saveSchedule(user, schedule) {
        user.schedules.push({
            id: Date.now().toString(),
            name: schedule.name,
            data: schedule.data,
            createdAt: new Date().toISOString()
        });
        
        // Keep only last 10 schedules
        if (user.schedules.length > 10) {
            user.schedules = user.schedules.slice(-10);
        }
        
        this.updateUser(user.username, user);
    },
    
    // Pet Management
    buyPet(user, petIcon, cost) {
        if (user.exp < cost) return false;
        if (user.pets.includes(petIcon)) return false;
        
        user.exp -= cost;
        user.pets.push(petIcon);
        
        this.updateUser(user.username, user);
        return true;
    },
    
    setPet(user, petIcon) {
        if (!user.pets.includes(petIcon)) return false;
        
        user.activePet = petIcon;
        this.updateUser(user.username, user);
        return true;
    },
    
    // Feedback
    saveFeedback(user, feedback) {
        user.feedbacks.push({
            date: new Date().toISOString(),
            ...feedback
        });
        
        this.updateUser(user.username, user);
    },
    
    shouldShowFeedback(user) {
        const accountAge = Date.now() - new Date(user.createdAt).getTime();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        
        if (accountAge < oneWeek) return false;
        
        const lastFeedback = user.feedbacks[user.feedbacks.length - 1];
        if (!lastFeedback) return true;
        
        const timeSinceLastFeedback = Date.now() - new Date(lastFeedback.date).getTime();
        return timeSinceLastFeedback >= oneWeek;
    },
    
    // Task Management
    addTask(user, taskText) {
        const task = {
            id: Date.now().toString(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        user.tasks.push(task);
        this.updateUser(user.username, user);
        return task;
    },
    
    updateTask(user, taskId, updates) {
        const taskIndex = user.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return false;
        
        user.tasks[taskIndex] = { ...user.tasks[taskIndex], ...updates };
        this.updateUser(user.username, user);
        return user.tasks[taskIndex];
    },
    
    deleteTask(user, taskId) {
        const taskIndex = user.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return false;
        
        user.tasks.splice(taskIndex, 1);
        this.updateUser(user.username, user);
        return true;
    },
    
    getTasks(user) {
        return user.tasks || [];
    }
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.Storage = Storage;
}
