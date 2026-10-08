        downloadBtn.parentNode.replaceChild(newBtn, downloadBtn);
        
        newBtn.addEventListener('click', () => {
            document.body.classList.add('printing');
            window.print();
            setTimeout(() => document.body.classList.remove('printing'), 1000);
        });
    }
}

// --------------------------------------------------------------------------
// 20. HISTORY
// --------------------------------------------------------------------------
async function loadHistory() {
    const historyGrid = document.getElementById('historyGrid');
    if (!historyGrid) return;

    try {
        const response = await fetch('/api/history');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        historyGrid.innerHTML = '';

        if (!data || data.length === 0) {
            historyGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">No history available yet.</p>';
            updateDashboardMetrics(0, 0, 0, 0);
            return;
        }

        let healthyCount = 0;
        let alertCount = 0;
        let totalHealthIndex = 0;

        data.forEach(item => {
            // Metrics calculation
            const conf = item.disease_confidence || 0;
            if (conf < 40) healthyCount++;
            
            const irrig = (item.irrigation || '').toUpperCase();
            if (irrig.includes('IRRIGATE')) alertCount++;

            // Dummy health index for average
            totalHealthIndex += Math.max(0, 100 - conf);

            // Create card
            const card = document.createElement('div');
            card.className = 'history-card animate-on-scroll fade-up animate-in';
            card.innerHTML = `
                <div class="hist-date">${formatDate(item.timestamp)}</div>
                <div class="hist-crop"><strong>${item.crop || 'Unknown'}</strong> (${item.stage || '-'})</div>
                <div class="hist-disease">Disease: ${item.disease || 'None'} (${conf}%)</div>
                <div class="hist-irrig">Irrigation: ${item.irrigation || '-'}</div>
                <button class="btn-secondary view-details-btn" style="margin-top: 10px; padding: 5px 10px; font-size: 12px; width: 100%;">View Details</button>
            `;
            
            const viewBtn = card.querySelector('.view-details-btn');
            viewBtn.addEventListener('click', () => {
                showAssessmentResult(item);
                smoothScrollTo('results');
            });
            
            historyGrid.appendChild(card);
        });

        const avgHealth = Math.round(totalHealthIndex / data.length);
        updateDashboardMetrics(data.length, healthyCount, alertCount, avgHealth);

    } catch (error) {
        console.warn("Could not load history:", error);
        historyGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff4d4d;">Failed to load history.</p>';
    }
}

function updateDashboardMetrics(total, healthy, alerts, avgHealth) {
    const setMetric = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    setMetric('totalAnalyses', total);
    setMetric('healthyCrops', healthy);
    setMetric('irrigationAlerts', alerts);
    setMetric('avgHealth', avgHealth + '%');
}

// --------------------------------------------------------------------------
// 21. AI STATUS PANEL
// --------------------------------------------------------------------------
function initAIStatusPanel() {
    const dots = document.querySelectorAll('.status-dot');
    if (dots.length === 0) return;

    let currentIndex = 0;
    
    setInterval(() => {
        dots.forEach(dot => dot.classList.remove('active', 'pulsing'));
        
        const currentDot = dots[currentIndex];
        if (currentDot) {
            currentDot.classList.add('active', 'pulsing');
        }
        
        currentIndex = (currentIndex + 1) % dots.length;
    }, 2000);
}

// --------------------------------------------------------------------------
// 22. THEME TOGGLE
// --------------------------------------------------------------------------
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('farmshield_theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '☀️'; // Sun icon for light mode switch
    } else {
        document.documentElement.setAttribute('data-theme', '');
        themeToggle.innerHTML = '🌙'; // Moon icon for dark mode switch
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', '');
            localStorage.setItem('farmshield_theme', 'light');
            themeToggle.innerHTML = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('farmshield_theme', 'dark');
            themeToggle.innerHTML = '☀️';
        }
    });
}

// --------------------------------------------------------------------------
// 23. ERROR HANDLING
// --------------------------------------------------------------------------
function showError(message) {
    const errorCard = document.getElementById('errorCard');
    const errorMessage = document.getElementById('errorMessage');
    const errorClose = document.getElementById('errorClose');
    
    if (errorMessage) errorMessage.textContent = message;
    
    if (errorCard) {
        errorCard.style.display = 'flex';
        // Trigger reflow for CSS animation if any
        errorCard.getBoundingClientRect();
        errorCard.classList.add('show');
        
        // Auto hide
        setTimeout(() => {
            errorCard.classList.remove('show');
            setTimeout(() => errorCard.style.display = 'none', 300);
        }, 8000);
        
        if (errorClose) {
            errorClose.onclick = () => {
                errorCard.classList.remove('show');
                setTimeout(() => errorCard.style.display = 'none', 300);
            };
        }
    } else {
        alert(message);
    }
}

// --------------------------------------------------------------------------
// 24. UTILITY FUNCTIONS
// --------------------------------------------------------------------------
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function formatDate(isoString) {
    if (!isoString) return '';
    try {
        const d = new Date(isoString);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch(e) {
        return isoString;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}
