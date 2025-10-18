// Interactive features for the demo website
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Cloud Broker Demo Website Loaded!');
    
    // Add click effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            // Add temporary highlight effect
            this.classList.add('glow-effect');
            setTimeout(() => {
                this.classList.remove('glow-effect');
            }, 2000);
            
            // Log interaction
            console.log('Feature card clicked:', this.querySelector('h3').textContent);
        });
    });
    
    // Update deployment info
    updateDeploymentInfo();
    
    // Add status indicators
    addStatusIndicators();
    
    // Performance monitoring
    measurePageLoad();
});

function updateDeploymentInfo() {
    const deploymentTime = new Date().toLocaleString();
    const urlElement = document.getElementById('current-url');
    const dateElement = document.getElementById('current-date');
    
    if (dateElement) {
        dateElement.textContent = deploymentTime;
    }
    
    if (urlElement) {
        urlElement.textContent = window.location.href;
        urlElement.style.color = '#28a745';
        urlElement.style.fontWeight = 'bold';
    }
    
    console.log('📊 Deployment info updated:', {
        time: deploymentTime,
        url: window.location.href,
        userAgent: navigator.userAgent
    });
}

function addStatusIndicators() {
    // Add online status indicator
    const statusBadge = document.querySelector('.status-badge');
    if (statusBadge) {
        statusBadge.addEventListener('click', function() {
            this.textContent = '🔥 System Online & Ready!';
            this.style.background = '#17a2b8';
            setTimeout(() => {
                this.textContent = '✅ Successfully Deployed!';
                this.style.background = '#28a745';
            }, 2000);
        });
    }
    
    // Add connection test
    testConnectivity();
}

function testConnectivity() {
    const startTime = Date.now();
    
    // Simple connectivity test
    fetch(window.location.href)
        .then(response => {
            const loadTime = Date.now() - startTime;
            console.log(`🌐 Connectivity test: ${response.status} - ${loadTime}ms`);
            
            // Add performance indicator to page
            const perfIndicator = document.createElement('div');
            perfIndicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #28a745;
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 1000;
                opacity: 0.9;
            `;
            perfIndicator.textContent = `⚡ Load time: ${loadTime}ms`;
            document.body.appendChild(perfIndicator);
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                perfIndicator.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(perfIndicator);
                }, 1000);
            }, 5000);
        })
        .catch(error => {
            console.error('❌ Connectivity test failed:', error);
        });
}

function measurePageLoad() {
    window.addEventListener('load', function() {
        const loadTime = Date.now() - performance.timing.navigationStart;
        console.log(`📈 Page load time: ${loadTime}ms`);
        
        // Send analytics data (demo)
        const analytics = {
            loadTime: loadTime,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        
        console.log('📊 Analytics data:', analytics);
    });
}

// Add demo interactions
function addDemoInteractions() {
    // Add a demo button
    const demoButton = document.createElement('button');
    demoButton.textContent = '🎮 Test Deployment Features';
    demoButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        border: none;
        padding: 15px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-weight: bold;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
    `;
    
    demoButton.addEventListener('click', function() {
        alert('🎉 Demo Feature Activated!\n\n✅ Container App: Running\n✅ Public URL: Active\n✅ Azure Resources: Deployed\n✅ Faculty Demo: Ready!');
    });
    
    document.body.appendChild(demoButton);
}

// Initialize demo interactions after page load
setTimeout(addDemoInteractions, 2000);