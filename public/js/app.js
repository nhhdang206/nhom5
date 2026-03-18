// ===== MAIN APP =====

class App {
    constructor() {
        // Check authentication
        const currentUser = Storage.getCurrentUser();
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }

        this.init();
    }

    init() {
        // Show welcome overlay then dismiss
        this.initWelcomeScreen();

        // Initialize all modules
        this.initNavigation();
        this.initMusic();
        this.initEffects();

        // Initialize core features
        window.gamification = new Gamification();
        window.timer = new PomodoroTimer();
        window.ai = new AIAssistant();
        window.manualSchedule = new ManualSchedule();

        // Load saved schedules
        window.ai.loadSavedSchedules();

        // Logout handler
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                Storage.logout();
                window.location.href = 'index.html';
            }
        });
    }

    initWelcomeScreen() {
        const overlay = document.getElementById('welcomeOverlay');
        if (!overlay) return;

        const dismissWelcome = () => {
            overlay.classList.add('hide');
            // Remove from DOM after animation
            setTimeout(() => {
                overlay.remove();
            }, 900);
        };

        // Auto dismiss after 3.5 seconds
        setTimeout(dismissWelcome, 3500);

        // Click to skip
        overlay.addEventListener('click', dismissWelcome);
    }

    initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const views = document.querySelectorAll('.view');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const viewId = item.dataset.view;

                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Show corresponding view
                views.forEach(view => view.classList.remove('active'));
                const targetView = document.getElementById(`${viewId}View`);
                if (targetView) {
                    targetView.classList.add('active');
                }
            });
        });
    }

    initMusic() {
        const musicToggle = document.getElementById('musicToggle');
        const musicPlaylist = document.getElementById('musicPlaylist');
        const musicSelect = document.getElementById('musicSelect');
        const volumeControl = document.getElementById('volumeControl');
        const bgMusic = document.getElementById('bgMusic');

        let isPlaying = false;
        let currentPlaylist = [];

        // Load available music files
        this.loadMusicFiles(musicSelect);

        // Toggle playlist
        musicToggle.addEventListener('click', () => {
            const isVisible = musicPlaylist.style.display === 'block';
            musicPlaylist.style.display = isVisible ? 'none' : 'block';
        });

        // Music selection
        musicSelect.addEventListener('change', () => {
            const selected = musicSelect.value;

            if (!selected) {
                bgMusic.pause();
                isPlaying = false;
                return;
            }

            // Check if it's a custom file or predefined
            if (selected.startsWith('custom_')) {
                // Custom uploaded file
                const files = JSON.parse(localStorage.getItem('padoro_custom_music') || '[]');
                const file = files.find(f => f.id === selected);
                if (file) {
                    bgMusic.src = file.url;
                }
            } else if (selected.startsWith('local_')) {
                // Local file from public/music
                const fileName = selected.replace('local_', '');
                // Encode path for special characters but keep slashes
                const encodedPath = fileName.split('/').map(part => encodeURIComponent(part)).join('/');
                const filePath = `public/music/${encodedPath}`;

                // Check if it's HLS (.m3u8)
                if (fileName.endsWith('.m3u8')) {
                    // Use HLS.js for HLS streaming
                    if (Hls.isSupported()) {
                        // Destroy previous HLS instance if exists
                        if (window.hls) {
                            window.hls.destroy();
                        }

                        window.hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: false,
                        });

                        window.hls.loadSource(filePath);
                        window.hls.attachMedia(bgMusic);

                        window.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            bgMusic.volume = volumeControl.value / 100;
                            bgMusic.play().catch(err => {
                                console.log('Autoplay blocked. User needs to interact first.');
                            });
                        });

                        window.hls.on(Hls.Events.ERROR, (event, data) => {
                            console.error('HLS Error:', data);
                            if (data.fatal) {
                                alert('Lỗi phát nhạc HLS. Vui lòng thử lại!');
                            }
                        });
                    } else if (bgMusic.canPlayType('application/vnd.apple.mpegurl')) {
                        // Native HLS support (Safari)
                        bgMusic.src = filePath;
                    } else {
                        alert('Trình duyệt không hỗ trợ HLS streaming. Vui lòng dùng Chrome hoặc Safari!');
                        return;
                    }
                } else {
                    // Regular audio file
                    bgMusic.src = filePath;
                }
            } else {
                // Online fallback URLs
                const musicUrls = {
                    lofi1: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                    lofi2: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                    piano: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                    nature: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
                };
                bgMusic.src = musicUrls[selected] || '';
            }

            // Set volume and play for non-HLS files
            if (!selected.includes('.m3u8')) {
                bgMusic.volume = volumeControl.value / 100;

                // Try to play
                bgMusic.play().catch(err => {
                    console.log('Autoplay blocked. User needs to interact first.');
                });
            }

            isPlaying = true;
        });

        // Volume control
        volumeControl.addEventListener('input', () => {
            bgMusic.volume = volumeControl.value / 100;
        });

        // Update icon based on playing state
        bgMusic.addEventListener('play', () => {
            musicToggle.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        });

        bgMusic.addEventListener('pause', () => {
            musicToggle.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        });

        // Auto next song when current ends
        bgMusic.addEventListener('ended', () => {
            const currentIndex = musicSelect.selectedIndex;
            if (currentIndex < musicSelect.options.length - 1) {
                musicSelect.selectedIndex = currentIndex + 1;
                musicSelect.dispatchEvent(new Event('change'));
            }
        });
    }

    loadMusicFiles(selectElement) {
        // Clear existing options except the first one
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }

        // Add local music files
        const localMusicFiles = [
            'nhac/playlist.m3u8'
            // Add more files here as you add them to the folder
        ];

        if (localMusicFiles.length > 0) {
            const localGroup = document.createElement('optgroup');
            localGroup.label = '🎵 Nhạc local';

            localMusicFiles.forEach(file => {
                const option = document.createElement('option');
                option.value = `local_${file}`;
                // Clean up the display name
                let displayName = file
                    .replace('/playlist.m3u8', '')
                    .replace('.mp3', '')
                    .replace('nhac', 'Hôm Nay Tôi Buồn')
                    .trim();
                option.textContent = displayName || 'Nhạc';
                localGroup.appendChild(option);
            });

            selectElement.appendChild(localGroup);
        }

        // Add custom uploaded music
        const customMusic = JSON.parse(localStorage.getItem('padoro_custom_music') || '[]');
        if (customMusic.length > 0) {
            const customGroup = document.createElement('optgroup');
            customGroup.label = '📁 Nhạc tự thêm';

            customMusic.forEach(file => {
                const option = document.createElement('option');
                option.value = file.id;
                option.textContent = file.name;
                customGroup.appendChild(option);
            });

            selectElement.appendChild(customGroup);
        }

        // Add online music options
        const onlineGroup = document.createElement('optgroup');
        onlineGroup.label = '🌐 Nhạc online';

        const onlineOptions = [
            { value: 'lofi1', text: 'Lo-fi Study Beats 1' },
            { value: 'lofi2', text: 'Lo-fi Study Beats 2' },
            { value: 'piano', text: 'Piano Relaxing' },
            { value: 'nature', text: 'Ambient Nature' }
        ];

        onlineOptions.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            onlineGroup.appendChild(option);
        });

        selectElement.appendChild(onlineGroup);

        // Add upload handler
        const uploadInput = document.getElementById('customMusicUpload');
        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                // Check if audio file
                if (!file.type.startsWith('audio/')) {
                    alert('Vui lòng chọn file âm thanh!');
                    return;
                }

                // Create object URL  
                const url = URL.createObjectURL(file);
                const id = `custom_${Date.now()}`;

                // Save to localStorage
                const customMusic = JSON.parse(localStorage.getItem('padoro_custom_music') || '[]');
                customMusic.push({
                    id,
                    name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                    url,
                    fileName: file.name
                });
                localStorage.setItem('padoro_custom_music', JSON.stringify(customMusic));

                // Reload music list
                this.loadMusicFiles(musicSelect);

                // Auto select the new song
                musicSelect.value = id;
                musicSelect.dispatchEvent(new Event('change'));

                // Reset input
                e.target.value = '';

                alert(`✅ Đã thêm "${file.name}" vào danh sách!`);
            });
        }
    }

    initEffects() {
        const effectSelect = document.getElementById('effectSelect');

        // Initialize with default effect
        const savedEffect = localStorage.getItem('padoro_effect') || 'snow';
        effectSelect.value = savedEffect;

        window.fallingEffect = new FallingEffect(savedEffect);

        // Change effect
        effectSelect.addEventListener('change', () => {
            const effect = effectSelect.value;
            window.fallingEffect.changeEffect(effect);
            localStorage.setItem('padoro_effect', effect);
        });
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new App();
    });
} else {
    new App();
}

// Handle visibility change (check for daily rewards when user returns)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.gamification) {
        window.gamification.checkDailyRewards();
    }
});

// Prevent accidental page close if timer is running
window.addEventListener('beforeunload', (e) => {
    if (window.timer && window.timer.isRunning) {
        e.preventDefault();
        e.returnValue = 'Bạn đang có phiên học đang chạy. Bạn có chắc muốn thoát?';
        return e.returnValue;
    }
});

// Service Worker for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when you have a service worker file
        // navigator.serviceWorker.register('/sw.js');
    });
}
