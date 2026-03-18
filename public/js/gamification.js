// ===== GAMIFICATION SYSTEM =====

class Gamification {
    constructor() {
        this.user = Storage.getCurrentUser();
        if (!this.user) {
            window.location.href = 'index.html';
            return;
        }

        this.init();
    }

    init() {
        // Update streak
        Storage.updateStreak(this.user);

        // Update display
        this.updateDisplay();

        // Load shop items
        this.loadShop();

        // Load history
        this.loadHistory();

        // Initialize pet
        this.initPet();

        // Check for weekly feedback
        this.checkWeeklyFeedback();

        // Check for daily rewards
        this.checkDailyRewards();
    }

    updateDisplay() {
        // Reload user data
        this.user = Storage.getCurrentUser();

        // Update header stats
        document.getElementById('streakDays').textContent = this.user.streak;
        document.getElementById('totalExp').textContent = this.user.exp;
        document.getElementById('userName').textContent = this.user.username;

        // Update shop balance
        const shopBalance = document.getElementById('shopBalance');
        if (shopBalance) {
            shopBalance.textContent = this.user.exp;
        }

        // Update settings
        const settingsUsername = document.getElementById('settingsUsername');
        const settingsEmail = document.getElementById('settingsEmail');
        if (settingsUsername) settingsUsername.textContent = this.user.username;
        if (settingsEmail) settingsEmail.textContent = this.user.email;
    }

    loadShop() {
        const shopGrid = document.getElementById('shopGrid');
        if (!shopGrid) return;

        const shopItems = [
            { icon: '🐱', name: 'Mèo', price: 0, default: true },
            { icon: '🐶', name: 'Chó', price: 100 },
            { icon: '🐰', name: 'Thỏ', price: 150 },
            { icon: '🐼', name: 'Gấu trúc', price: 200 },
            { icon: '🦊', name: 'Cáo', price: 250 },
            { icon: '🐨', name: 'Koala', price: 300 },
            { icon: '🐯', name: 'Hổ', price: 400 },
            { icon: '🦁', name: 'Sư tử', price: 500 },
            { icon: '🐲', name: 'Rồng', price: 1000 },
            { icon: '🦄', name: 'Kỳ lân', price: 2000 }
        ];

        const html = shopItems.map(item => {
            const owned = this.user.pets.includes(item.icon);
            const canAfford = this.user.exp >= item.price;

            return `
                <div class="shop-item ${owned ? 'owned' : ''}" data-pet="${item.icon}" data-price="${item.price}">
                    <div class="shop-item-icon">${item.icon}</div>
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-price">
                        ${owned ? '✅ Đã sở hữu' : (canAfford ? `${item.price} EXP` : `🔒 ${item.price} EXP`)}
                    </div>
                </div>
            `;
        }).join('');

        shopGrid.innerHTML = html;

        // Add click handlers
        shopGrid.querySelectorAll('.shop-item').forEach(item => {
            item.addEventListener('click', () => {
                const petIcon = item.dataset.pet;
                const price = parseInt(item.dataset.price);

                if (item.classList.contains('owned')) {
                    // Set as active pet
                    Storage.setPet(this.user, petIcon);
                    this.user = Storage.getCurrentUser();
                    this.updatePetDisplay();
                    alert(`✅ Đã chọn ${petIcon} làm thú cưng!`);
                } else {
                    // Try to buy
                    if (Storage.buyPet(this.user, petIcon, price)) {
                        this.user = Storage.getCurrentUser();
                        this.updateDisplay();
                        this.loadShop();
                        this.showReward(`🎉 Bạn đã mua ${petIcon}!`, 0);
                    } else {
                        alert(`❌ Không đủ EXP! Bạn cần ${price} EXP nhưng chỉ có ${this.user.exp} EXP.`);
                    }
                }
            });
        });
    }

    loadHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        if (!this.user.history || this.user.history.length === 0) {
            historyList.innerHTML = '<p style="color: var(--text-muted);">Chưa có lịch sử học tập</p>';
            return;
        }

        const html = this.user.history.slice().reverse().map(entry => `
            <div class="history-item">
                <h4>${new Date(entry.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                <p>⏱️ ${entry.minutes} phút học tập</p>
                <p>⭐ +${entry.exp} EXP</p>
            </div>
        `).join('');

        historyList.innerHTML = html;
    }

    initPet() {
        const petContainer = document.getElementById('petContainer');
        const pet = document.getElementById('pet');
        const petToggle = document.getElementById('petToggle');

        if (!petContainer || !pet) return;

        // Set active pet
        this.updatePetDisplay();

        // Toggle visibility
        let petVisible = localStorage.getItem('padoro_pet_visible') !== 'false';

        if (!petVisible) {
            pet.classList.add('hidden');
        }

        petToggle.addEventListener('click', () => {
            petVisible = !petVisible;
            pet.classList.toggle('hidden');
            localStorage.setItem('padoro_pet_visible', petVisible);
        });

        // Make pet draggable (optional enhancement)
        this.makePetDraggable(petContainer);
    }

    updatePetDisplay() {
        const petSprite = document.getElementById('petSprite');
        const petName = document.getElementById('petName');

        if (petSprite && this.user.activePet) {
            petSprite.textContent = this.user.activePet;
        }

        if (petName) {
            const names = {
                '🐱': 'Mèo',
                '🐶': 'Chó',
                '🐰': 'Thỏ',
                '🐼': 'Gấu trúc',
                '🦊': 'Cáo',
                '🐨': 'Koala',
                '🐯': 'Hổ',
                '🦁': 'Sư tử',
                '🐲': 'Rồng',
                '🦄': 'Kỳ lân'
            };
            petName.textContent = names[this.user.activePet] || 'Pet';
        }
    }

    makePetDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            if (e.target.id === 'petToggle') return;

            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;

            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
            element.style.right = 'auto';
            element.style.bottom = 'auto';
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    checkWeeklyFeedback() {
        if (!Storage.shouldShowFeedback(this.user)) return;

        const modal = document.getElementById('feedbackModal');
        if (!modal) return;

        // Show after 2 seconds
        setTimeout(() => {
            modal.classList.add('show');
        }, 2000);

        // Handle form submission
        const form = document.getElementById('feedbackForm');
        const skipBtn = document.getElementById('skipFeedback');
        let selectedRating = 0;

        // Star rating
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.rating);

                document.querySelectorAll('.star').forEach(s => {
                    s.classList.remove('active');
                    if (parseInt(s.dataset.rating) <= selectedRating) {
                        s.classList.add('active');
                    }
                });
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const goals = document.getElementById('feedbackGoals').value;
            const progress = document.getElementById('feedbackProgress').value;

            if (!goals || !progress || selectedRating === 0) {
                alert('Vui lòng điền đầy đủ thông tin và chọn số sao!');
                return;
            }

            const feedback = {
                goals,
                progress,
                rating: selectedRating
            };

            Storage.saveFeedback(this.user, feedback);

            modal.classList.remove('show');

            // Reward for feedback
            Storage.addExp(this.user, 50);
            this.user = Storage.getCurrentUser();
            this.updateDisplay();
            this.showReward('🎉 Cảm ơn phản hồi của bạn! +50 EXP', 50);
        });

        skipBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }

    checkDailyRewards() {
        const lastReward = localStorage.getItem('padoro_last_reward');
        const today = new Date().toISOString().split('T')[0];

        if (lastReward === today) return;

        // Check if user has used app for > 30 minutes today
        const todayHistory = this.user.history.find(h => h.date === today);

        if (todayHistory && todayHistory.minutes >= 30) {
            // Grant daily reward
            const reward = 20 + (this.user.streak * 5); // Base 20 + streak bonus
            Storage.addExp(this.user, reward);
            this.user = Storage.getCurrentUser();
            this.updateDisplay();

            localStorage.setItem('padoro_last_reward', today);

            this.showReward(`🎁 Phần thưởng hàng ngày! +${reward} EXP (Streak bonus: ${this.user.streak}x)`, reward);
        }
    }

    showReward(message, expGained) {
        const modal = document.getElementById('rewardModal');
        const rewardMessage = document.getElementById('rewardMessage');
        const closeBtn = document.getElementById('closeReward');

        if (!modal) return;

        rewardMessage.innerHTML = `
            <p>${message}</p>
            ${expGained > 0 ? `<p style="font-size: 2rem; margin-top: 1rem;">+${expGained} ⭐</p>` : ''}
        `;

        modal.classList.add('show');

        closeBtn.onclick = () => {
            modal.classList.remove('show');
        };

        // Auto close after 5 seconds
        setTimeout(() => {
            modal.classList.remove('show');
        }, 5000);
    }
}

// Export
if (typeof window !== 'undefined') {
    window.Gamification = Gamification;
}
