// Particle Network Background Animation
class ParticleNetwork {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 80;
        this.maxDistance = 150;
        this.mouse = { x: null, y: null, radius: 150 };
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach((particle, i) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // Mouse interaction
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    particle.vx -= Math.cos(angle) * force * 0.2;
                    particle.vy -= Math.sin(angle) * force * 0.2;
                }
            }
            
            // Limit velocity
            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            if (speed > 2) {
                particle.vx = (particle.vx / speed) * 2;
                particle.vy = (particle.vy / speed) * 2;
            }
            
            // Draw particle with glow
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.radius * 3
            );
            gradient.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(0, 102, 255, 0.4)');
            gradient.addColorStop(1, 'rgba(0, 102, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = particle.x - p2.x;
                const dy = particle.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.maxDistance) {
                    const opacity = (1 - distance / this.maxDistance) * 0.3;
                    const gradient = this.ctx.createLinearGradient(
                        particle.x, particle.y, p2.x, p2.y
                    );
                    gradient.addColorStop(0, `rgba(0, 240, 255, ${opacity})`);
                    gradient.addColorStop(1, `rgba(168, 85, 247, ${opacity})`);
                    
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Trends Chart
class TrendsChart {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.data = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'],
            totalThreats: [12, 19, 15, 25, 22, 30, 28, 35],
            criticalThreats: [3, 5, 4, 8, 6, 10, 9, 12]
        };
        this.animationProgress = 0;
        this.resize();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.width = rect.width;
        this.height = rect.height;
    }
    
    animate() {
        if (this.animationProgress < 1) {
            this.animationProgress += 0.02;
            this.draw();
            requestAnimationFrame(() => this.animate());
        } else {
            this.draw();
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        const padding = 40;
        const chartWidth = this.width - padding * 2;
        const chartHeight = this.height - padding * 2;
        const maxValue = Math.max(...this.data.totalThreats);
        const stepX = chartWidth / (this.data.labels.length - 1);
        
        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(this.width - padding, y);
            this.ctx.stroke();
        }
        
        // Draw total threats line with gradient fill
        this.drawLine(
            this.data.totalThreats,
            maxValue,
            padding,
            chartHeight,
            stepX,
            '#00f0ff',
            '#0066ff'
        );
        
        // Draw critical threats line with gradient fill
        this.drawLine(
            this.data.criticalThreats,
            maxValue,
            padding,
            chartHeight,
            stepX,
            '#ff3366',
            '#ff0044'
        );
        
        // Draw labels
        this.ctx.fillStyle = 'rgba(139, 146, 167, 0.8)';
        this.ctx.font = '12px Inter';
        this.ctx.textAlign = 'center';
        this.data.labels.forEach((label, i) => {
            const x = padding + stepX * i;
            this.ctx.fillText(label, x, this.height - 15);
        });
    }
    
    drawLine(data, maxValue, padding, chartHeight, stepX, color1, color2) {
        const points = data.map((value, i) => ({
            x: padding + stepX * i,
            y: padding + chartHeight - (value / maxValue) * chartHeight * this.animationProgress
        }));
        
        // Create gradient for fill
        const gradient = this.ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
        gradient.addColorStop(0, color1 + '40');
        gradient.addColorStop(1, color1 + '00');
        
        // Draw fill area
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, padding + chartHeight);
        points.forEach(point => {
            this.ctx.lineTo(point.x, point.y);
        });
        this.ctx.lineTo(points[points.length - 1].x, padding + chartHeight);
        this.ctx.closePath();
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw line with glow
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        
        // Create smooth curve using quadratic curves
        for (let i = 0; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        this.ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        
        // Glow effect
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = color1;
        this.ctx.strokeStyle = color1;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Draw points
        points.forEach(point => {
            const pointGradient = this.ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, 6
            );
            pointGradient.addColorStop(0, color1);
            pointGradient.addColorStop(1, color2);
            
            this.ctx.fillStyle = pointGradient;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
}

// Animate security score on load
function animateScore() {
    const scoreNumber = document.querySelector('.score-number');
    const targetScore = 90;
    let currentScore = 0;
    const duration = 2000;
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        currentScore = Math.floor(targetScore * easeOutQuart);
        
        scoreNumber.textContent = currentScore;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// Animate metrics on load
function animateMetrics() {
    const metricValues = document.querySelectorAll('.metric-value');
    const targets = [24, 158, 138];
    
    metricValues.forEach((element, index) => {
        let current = 0;
        const target = targets[index];
        const duration = 2000;
        const startTime = Date.now();
        
        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            
            current = Math.floor(target * easeOutQuart);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        update();
    });
}

// Add hover effects to action cards
function initActionCards() {
    const actionCards = document.querySelectorAll('.action-card');
    
    actionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Add smooth transition to action cards
document.querySelectorAll('.action-card').forEach(card => {
    card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle background
    const particlesCanvas = document.getElementById('particlesCanvas');
    new ParticleNetwork(particlesCanvas);
    
    // Initialize trends chart
    const trendsCanvas = document.getElementById('trendsChart');
    new TrendsChart(trendsCanvas);
    
    // Animate numbers
    setTimeout(() => {
        animateScore();
        animateMetrics();
    }, 300);
    
    // Initialize action cards
    initActionCards();
});

// Add parallax effect to background on mouse move
document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    
    document.querySelector('.animated-background').style.transform = 
        `translate(${moveX}px, ${moveY}px)`;
});
