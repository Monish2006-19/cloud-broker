// Create animated background stars
function createStars() {
    const stars = document.querySelector('.stars');
    const numStars = 100;
    
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: #fff;
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.8 + 0.2};
            animation: twinkle ${Math.random() * 4 + 2}s infinite ease-in-out alternate;
        `;
        stars.appendChild(star);
    }
    
    // Add CSS animation for twinkling
    const style = document.createElement('style');
    style.textContent = `
        @keyframes twinkle {
            0% { opacity: 0.2; transform: scale(1); }
            100% { opacity: 1; transform: scale(1.2); }
        }
    `;
    document.head.appendChild(style);
}

// Create floating particles
function createParticles() {
    const particles = document.querySelector('.particles');
    const numParticles = 50;
    
    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(0, 212, 255, 0.6);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 6 + 4}s infinite ease-in-out;
            animation-delay: ${Math.random() * 2}s;
        `;
        particles.appendChild(particle);
    }
    
    // Add CSS animation for floating
    const style = document.createElement('style');
    style.textContent += `
        @keyframes float {
            0%, 100% { 
                transform: translateY(0px) translateX(0px) rotate(0deg); 
                opacity: 0.3; 
            }
            25% { 
                transform: translateY(-20px) translateX(10px) rotate(90deg); 
                opacity: 0.7; 
            }
            50% { 
                transform: translateY(-40px) translateX(-10px) rotate(180deg); 
                opacity: 1; 
            }
            75% { 
                transform: translateY(-20px) translateX(-20px) rotate(270deg); 
                opacity: 0.7; 
            }
        }
    `;
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animate elements on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.game-card, .tournament-card, .community-stat');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.6s ease forwards';
                entry.target.style.opacity = '1';
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
    
    // Add slideInUp animation
    const style = document.createElement('style');
    style.textContent += `
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Add interactive game preview
function initGamePreview() {
    const gameScene = document.querySelector('.game-scene');
    const player = document.querySelector('.player');
    const enemy = document.querySelector('.enemy');
    const powerup = document.querySelector('.powerup');
    const healthBar = document.querySelector('.bar-fill');
    const score = document.querySelector('.score');
    
    let currentScore = 98750;
    let health = 75;
    
    // Animate game elements
    setInterval(() => {
        // Random score increase
        if (Math.random() > 0.7) {
            currentScore += Math.floor(Math.random() * 100) + 50;
            score.textContent = `SCORE: ${currentScore.toLocaleString()}`;
        }
        
        // Random health change
        if (Math.random() > 0.8) {
            health = Math.max(20, Math.min(100, health + (Math.random() > 0.5 ? 5 : -10)));
            healthBar.style.width = `${health}%`;
            healthBar.style.background = health > 50 ? 
                'var(--gradient-primary)' : 
                'linear-gradient(45deg, #ff4757, #ff6b35)';
        }
    }, 2000);
    
    // Click interactions
    if (player) {
        player.addEventListener('click', () => {
            player.style.transform = 'scale(1.2)';
            setTimeout(() => {
                player.style.transform = 'scale(1)';
            }, 200);
            currentScore += 500;
            score.textContent = `SCORE: ${currentScore.toLocaleString()}`;
        });
    }
    
    if (enemy) {
        enemy.addEventListener('click', () => {
            enemy.style.animation = 'none';
            enemy.style.transform = 'rotate(360deg) scale(0)';
            setTimeout(() => {
                enemy.style.animation = 'float 3s ease-in-out infinite';
                enemy.style.transform = 'scale(1)';
            }, 1000);
            currentScore += 1000;
            score.textContent = `SCORE: ${currentScore.toLocaleString()}`;
        });
    }
}

// Add button interactions
function initButtonEffects() {
    // Game buttons
    document.querySelectorAll('.btn-game').forEach(btn => {
        btn.addEventListener('click', function() {
            const games = ['Space Odyssey', 'Battle Legends', 'Speed Racers', 'Castle Defense'];
            const randomGame = games[Math.floor(Math.random() * games.length)];
            showNotification(`🎮 Loading ${randomGame}... This is a demo!`);
        });
    });
    
    // Tournament buttons
    document.querySelectorAll('.btn-tournament').forEach(btn => {
        btn.addEventListener('click', function() {
            const actions = ['Watching live stream...', 'Registration successful!', 'Joining tournament...'];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            showNotification(`🏆 ${randomAction} Demo via Cloud Broker!`);
        });
    });
    
    // Download buttons
    document.querySelectorAll('.btn-download').forEach(btn => {
        btn.addEventListener('click', function() {
            const platform = this.textContent.includes('PC') ? 'PC' : 
                            this.textContent.includes('Mobile') ? 'Mobile' : 'Console';
            showNotification(`📥 Download started for ${platform}! This is a demo deployment.`);
        });
    });
    
    // Hero buttons
    document.querySelector('.btn-primary').addEventListener('click', function() {
        showNotification('🚀 Starting epic gaming session! Demo deployed via Cloud Broker.');
        document.querySelector('#games').scrollIntoView({ behavior: 'smooth' });
    });
    
    document.querySelector('.btn-secondary').addEventListener('click', function() {
        showNotification('📺 Opening game trailer... This is a demo website!');
    });
}

// Notification system
function showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(45deg, #ff6b35, #f7931e);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
    
    // Add slide animations
    const style = document.createElement('style');
    style.textContent += `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Add typing effect to hero title
function initTypingEffect() {
    const titleMain = document.querySelector('.title-main');
    const titleSub = document.querySelector('.title-sub');
    
    if (titleMain && titleSub) {
        const mainText = titleMain.textContent;
        const subText = titleSub.textContent;
        
        titleMain.textContent = '';
        titleSub.textContent = '';
        
        let i = 0;
        function typeMain() {
            if (i < mainText.length) {
                titleMain.textContent += mainText.charAt(i);
                i++;
                setTimeout(typeMain, 100);
            } else {
                // Start typing subtitle
                let j = 0;
                function typeSub() {
                    if (j < subText.length) {
                        titleSub.textContent += subText.charAt(j);
                        j++;
                        setTimeout(typeSub, 100);
                    }
                }
                setTimeout(typeSub, 500);
            }
        }
        
        setTimeout(typeMain, 1000);
    }
}

// Header scroll effect
function initHeaderEffect() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(10, 10, 15, 0.98)';
            header.style.borderBottom = '1px solid rgba(0, 212, 255, 0.5)';
        } else {
            header.style.background = 'rgba(10, 10, 15, 0.95)';
            header.style.borderBottom = '1px solid rgba(0, 212, 255, 0.2)';
        }
    });
}

// Add tournament countdown
function initTournamentCountdown() {
    const countdownElement = document.querySelector('.tournament-card .tournament-meta span:last-child');
    if (countdownElement && countdownElement.textContent.includes('remaining')) {
        let timeLeft = 2 * 60 + 15; // 2h 15m in minutes
        
        setInterval(() => {
            timeLeft--;
            const hours = Math.floor(timeLeft / 60);
            const minutes = timeLeft % 60;
            countdownElement.textContent = `⏰ ${hours}h ${minutes}m remaining`;
            
            if (timeLeft <= 0) {
                countdownElement.textContent = '🏁 Tournament Finished!';
            }
        }, 60000); // Update every minute (sped up for demo)
    }
}

// Initialize all features
document.addEventListener('DOMContentLoaded', function() {
    createStars();
    createParticles();
    animateOnScroll();
    initGamePreview();
    initButtonEffects();
    initTypingEffect();
    initHeaderEffect();
    initTournamentCountdown();
    
    console.log('🎮 GameForge website loaded successfully!');
    console.log('🚀 Deployed via Cloud Broker C2C Pipeline');
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('🎉 Welcome to GameForge! Epic gaming awaits!');
    }, 2000);
});

// Add some Easter eggs
document.addEventListener('keydown', function(e) {
    // Konami Code: ↑↑↓↓←→←→BA
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    if (!window.konamiProgress) window.konamiProgress = 0;
    
    if (e.keyCode === konamiCode[window.konamiProgress]) {
        window.konamiProgress++;
        if (window.konamiProgress === konamiCode.length) {
            showNotification('🎊 KONAMI CODE ACTIVATED! You found the Easter egg!');
            document.body.style.animation = 'rainbow 2s infinite';
            window.konamiProgress = 0;
            
            const style = document.createElement('style');
            style.textContent += `
                @keyframes rainbow {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            setTimeout(() => {
                document.body.style.animation = '';
            }, 5000);
        }
    } else {
        window.konamiProgress = 0;
    }
});