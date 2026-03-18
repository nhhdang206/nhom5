// ===== FALLING EFFECTS (Snow, Flowers, Leaves, Stars) =====

class FallingEffect {
    constructor(type = 'snow') {
        this.canvas = document.getElementById('fallingEffect');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.type = type;
        this.particles = [];
        this.animationId = null;

        this.effects = {
            snow: { char: '❄️', count: 50, speed: 1 },
            flowers: { char: '🌸', count: 30, speed: 0.8 },
            leaves: { char: '🍂', count: 40, speed: 1.2 },
            stars: { char: '⭐', count: 25, speed: 0.5 },
            none: null
        };

        this.resize();
        window.addEventListener('resize', () => this.resize());

        if (type !== 'none') {
            this.start();
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start() {
        if (this.type === 'none' || !this.effects[this.type]) {
            this.stop();
            return;
        }

        this.particles = [];
        const config = this.effects[this.type];

        for (let i = 0; i < config.count; i++) {
            this.particles.push(this.createParticle());
        }

        this.animate();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = [];
    }

    createParticle() {
        const config = this.effects[this.type];
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * -this.canvas.height,
            size: Math.random() * 20 + 10,
            speedY: Math.random() * config.speed + 0.5,
            speedX: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.6 + 0.4,
            rotation: Math.random() * 360
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const config = this.effects[this.type];

        this.particles.forEach((particle, index) => {
            // Update position
            particle.y += particle.speedY;
            particle.x += particle.speedX;
            particle.rotation += 1;

            // Reset if out of bounds
            if (particle.y > this.canvas.height) {
                this.particles[index] = this.createParticle();
            }

            // Draw particle
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.font = `${particle.size}px Arial`;
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation * Math.PI / 180);
            this.ctx.fillText(config.char, 0, 0);
            this.ctx.restore();
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    changeEffect(type) {
        this.type = type;
        this.stop();

        if (type !== 'none') {
            this.start();
        }
    }
}

// Initialize
let fallingEffect = null;

// Export for global access
if (typeof window !== 'undefined') {
    window.FallingEffect = FallingEffect;
}
