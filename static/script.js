// ==========================================================================
// FarmShield AI - Main Application Script
// A futuristic AI-powered agriculture platform built with Flask
// ==========================================================================

// --------------------------------------------------------------------------
// 26. GLOBAL ERROR HANDLER
// --------------------------------------------------------------------------
window.addEventListener('error', (e) => {
    console.error('FarmShield Error:', e.message);
});
window.addEventListener('unhandledrejection', (e) => {
    console.error('FarmShield Promise Error:', e.reason);
});

// --------------------------------------------------------------------------
// 1. INITIALIZATION & DOM READY
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => { 
    init(); 
});

function init() {
    try {
        initNavigation();
        initScrollAnimations();
        initParticles();
        initUpload();
        initFormMeters();
        initThemeToggle();
        init3DVisualization();
        loadHistory();
        initAIStatusPanel();
        
        const form = document.getElementById('assessmentForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                submitAssessment();
            });
        }

        const cropSelect = document.getElementById('cropSelect');
        const cropCustom = document.getElementById('cropCustom');
        if (cropSelect && cropCustom) {
            cropSelect.addEventListener('change', () => {
                if (cropSelect.value === 'Other') {
                    cropCustom.style.display = 'block';
                    cropCustom.setAttribute('required', 'true');
                } else {
                    cropCustom.style.display = 'none';
                    cropCustom.removeAttribute('required');
                }
            });
        }

        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn && !form) {
            analyzeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                submitAssessment();
            });
        }
    } catch (error) {
        console.error("Initialization error:", error);
    }
}

// --------------------------------------------------------------------------
// 2. NAVIGATION
// --------------------------------------------------------------------------
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    // Add 'scrolled' class when scrolled past 50px
    if (navbar) {
        window.addEventListener('scroll', debounce(() => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 10));
    }

    // Hamburger menu toggle
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when a link is clicked & smooth scroll
    if (navItems.length > 0) {
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetId = item.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    e.preventDefault();
                    smoothScrollTo(targetId.substring(1));
                    
                    if (hamburger && navLinks) {
                        hamburger.classList.remove('active');
                        navLinks.classList.remove('active');
                    }
                }
            });
        });
    }
}

// --------------------------------------------------------------------------
// 3. SCROLL ANIMATIONS
// --------------------------------------------------------------------------
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length === 0) return;

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        animatedElements.forEach(el => {
            el.classList.add('animate-in');
        });
    }
}

// --------------------------------------------------------------------------
// 4. PARTICLES
// --------------------------------------------------------------------------
function initParticles() {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    const particleCount = Math.floor(Math.random() * 6) + 15; // 15-20 particles
    const colors = ['#00d26a', '#ffffff', '#a8e6cf', '#dcedc1'];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 5 + 3; // 3-8px
        const posX = Math.random() * 100; // 0-100vw
        const posY = Math.random() * 100; // 0-100vh
        const opacity = Math.random() * 0.3 + 0.1; // 0.1-0.4
        const animDuration = Math.random() * 12 + 8; // 8-20s
        const delay = Math.random() * 5;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.opacity = opacity.toString();
        particle.style.animationDuration = `${animDuration}s`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.backgroundColor = color;
        particle.style.position = 'absolute';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        
        // Add basic floating animation if not handled in CSS
        if (!document.querySelector('style#particle-keyframes')) {
            const style = document.createElement('style');
            style.id = 'particle-keyframes';
            style.innerHTML = `
                @keyframes float-particle {
                    0% { transform: translateY(0) translateX(0); }
                    33% { transform: translateY(-20px) translateX(10px); }
                    66% { transform: translateY(10px) translateX(-15px); }
                    100% { transform: translateY(0) translateX(0); }
                }
                .particle {
                    animation: float-particle infinite ease-in-out;
                }
            `;
            document.head.appendChild(style);
        }

        heroSection.appendChild(particle);
    }
}

// --------------------------------------------------------------------------
// 5. FORM METERS
// --------------------------------------------------------------------------
function initFormMeters() {
    const moistureInput = document.getElementById('soilMoisture');
    const tempInput = document.getElementById('temperature');
    const humidityInput = document.getElementById('humidity');

    const moistureMeter = document.getElementById('moistureMeter');
    const tempDisplay = document.getElementById('tempDisplay');
    const humidityDisplay = document.getElementById('humidityValue');

    const moistureValue = document.getElementById('moistureValue');

    if (moistureInput && moistureMeter) {
        const updateMoisture = () => {
            const val = parseInt(moistureInput.value) || 0;
            moistureMeter.style.width = `${val}%`;
            if (moistureValue) moistureValue.textContent = `${val}%`;
            
            // Color coding
            if (val < 25) moistureMeter.style.backgroundColor = '#ff4d4d'; // red
            else if (val < 40) moistureMeter.style.backgroundColor = '#ffa64d'; // orange
            else if (val < 60) moistureMeter.style.backgroundColor = '#ffd24d'; // yellow
            else moistureMeter.style.backgroundColor = '#00d26a'; // green
        };
        moistureInput.addEventListener('input', updateMoisture);
        updateMoisture(); // initial
    }

    if (tempInput && tempDisplay) {
        const updateTemp = () => {
            const val = tempInput.value || 0;
            tempDisplay.textContent = `${val}°C`;
        };
        tempInput.addEventListener('input', updateTemp);
        updateTemp();
    }

    if (humidityInput && humidityDisplay) {
        const updateHumidity = () => {
            const val = humidityInput.value || 0;
            humidityDisplay.textContent = `${val}%`;
        };
        humidityInput.addEventListener('input', updateHumidity);
        updateHumidity();
    }
}

// --------------------------------------------------------------------------
// 6. IMAGE UPLOAD
// --------------------------------------------------------------------------
function initUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const imagePreview = document.getElementById('imagePreview');
    const fileInfo = document.getElementById('fileInfo');
    const removeImage = document.getElementById('removeImage');

    if (!uploadArea || !fileInput) return;

    // Trigger file input on click
    uploadArea.addEventListener('click', (e) => {
        if (e.target !== removeImage) {
            fileInput.click();
        }
    });

    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('dragover');
        }, false);
    });

    uploadArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }, false);

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length === 0) return;
        const file = files[0];
        
        // Validate type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showError("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
            return;
        }

        // Validate size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            showError("File is too large. Maximum size is 10MB.");
            return;
        }

        // Display preview
        const reader = new FileReader();
        reader.onload = function(e) {
            if (imagePreview) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            }
            if (fileInfo) {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                fileInfo.textContent = `${file.name} (${sizeMB} MB)`;
                fileInfo.style.display = 'block';
            }
            if (removeImage) {
                removeImage.style.display = 'inline-block';
            }
            uploadArea.classList.add('has-image');
            
            // Assign file to input manually if dragged (using DataTransfer)
            if (fileInput.files.length === 0) {
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInput.files = dt.files;
            }
        };
        reader.readAsDataURL(file);
    }

    if (removeImage) {
        removeImage.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.value = '';
            if (imagePreview) {
                imagePreview.src = '';
                imagePreview.style.display = 'none';
            }
            if (fileInfo) {
                fileInfo.textContent = '';
                fileInfo.style.display = 'none';
            }
            removeImage.style.display = 'none';
            uploadArea.classList.remove('has-image');
        });
    }
}

// --------------------------------------------------------------------------
// 7. FORM SUBMISSION & VALIDATION
// --------------------------------------------------------------------------
async function submitAssessment() {
    if (!validateForm()) return;

    const form = document.getElementById('assessmentForm');
    if (!form) return;

    showLoadingState();

    try {
        const formData = new FormData();
        const cropSelect = document.getElementById('cropSelect');
        const cropCustom = document.getElementById('cropCustom');
        let cropValue = cropSelect ? cropSelect.value : '';
        if (cropValue === 'Other' && cropCustom && cropCustom.value.trim()) {
            cropValue = cropCustom.value.trim();
        }
        formData.append('crop', cropValue);
        formData.append('stage', document.getElementById('stageSelect').value);
        formData.append('soil_moisture', document.getElementById('soilMoisture').value);
        formData.append('temperature', document.getElementById('temperature').value);
        formData.append('humidity', document.getElementById('humidity').value);
        
        const notes = document.getElementById('notes');
        if (notes && notes.value) {
            formData.append('notes', notes.value);
        }

        const fileInput = document.getElementById('fileInput');
        if (fileInput && fileInput.files.length > 0) {
            formData.append('leaf', fileInput.files[0]);
        }

        const response = await fetch('/api/assess', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        // Ensure minimum artificial delay for loading animation to complete
        setTimeout(() => {
            hideLoadingState();
            showAssessmentResult(data);
        }, 4000); // 4 seconds covers the staggered messages

    } catch (error) {
        hideLoadingState();
        showError("Failed to process assessment. " + error.message);
        console.error("Assessment error:", error);
    }
}

function validateForm() {
    const required = ['cropSelect', 'stageSelect', 'soilMoisture', 'temperature', 'humidity'];
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error-text').forEach(el => el.remove());
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

    required.forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.value) {
            isValid = false;
            el.classList.add('input-error');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-text';
            errorMsg.style.color = '#ff4d4d';
            errorMsg.style.fontSize = '12px';
            errorMsg.style.marginTop = '4px';
            errorMsg.textContent = 'This field is required';
            if (el.parentNode) {
                el.parentNode.appendChild(errorMsg);
            }
        }
    });

    if (!isValid) {
        showError("Please fill in all required fields.");
    }
    return isValid;
}

// --------------------------------------------------------------------------
// 8. LOADING STATE
// --------------------------------------------------------------------------
function showLoadingState() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.dataset.originalText = analyzeBtn.innerHTML;
    }

    let overlay = document.getElementById('processingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'processingOverlay';
        overlay.innerHTML = `
            <div class="processing-content">
                <div class="processing-spinner"></div>
                <div id="processingText">INITIALIZING AI ENGINE...</div>
                <div class="progress-bar-container">
                    <div id="processingProgress" class="progress-bar-fill"></div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Basic styles for overlay if not in css
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.color = '#00d26a';
        overlay.style.fontFamily = 'monospace';
    } else {
        overlay.style.display = 'flex';
    }

    const steps = [
        'INITIALIZING AI ENGINE...',
        'ANALYZING CROP DATA...',
        'PROCESSING IMAGE...',
        'ANALYZING ENVIRONMENT...',
        'CALCULATING IRRIGATION...',
        'GENERATING INSIGHTS...'
    ];

    const textEl = document.getElementById('processingText');
    const progressEl = document.getElementById('processingProgress');
    
    if (progressEl) {
        progressEl.style.width = '0%';
        progressEl.style.height = '4px';
        progressEl.style.backgroundColor = '#00d26a';
        progressEl.style.transition = 'width 600ms linear';
    }

    steps.forEach((step, index) => {
        setTimeout(() => {
            if (textEl) {
                textEl.textContent = step;
                textEl.classList.add('active');
                setTimeout(() => textEl.classList.replace('active', 'done'), 300);
            }
            if (progressEl) {
                progressEl.style.width = `${((index + 1) / steps.length) * 100}%`;
            }
        }, index * 600);
    });
}

function hideLoadingState() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = false;
        if (analyzeBtn.dataset.originalText) {
            analyzeBtn.innerHTML = analyzeBtn.dataset.originalText;
        }
    }

    const overlay = document.getElementById('processingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// --------------------------------------------------------------------------
// 9. SHOW ASSESSMENT RESULT
// --------------------------------------------------------------------------
function showAssessmentResult(data) {
    const resultsSection = document.getElementById('results');
    if (!resultsSection) return;

    resultsSection.classList.remove('hidden');
    resultsSection.style.display = 'block'; // ensure it's visible
    
    smoothScrollTo('results');

    // Staggered animations
    setTimeout(() => updateHealthScore(data), 200);
    setTimeout(() => updateDiseaseAnalysis(data), 400);
    setTimeout(() => updateIrrigationCard(data), 600);
    setTimeout(() => updateExplanation(data), 800);
    setTimeout(() => updateCropIntelligence(data), 1000);
    setTimeout(() => updateFarmingTechniques(data), 1200);
    setTimeout(() => updateCropProtection(data), 1400);
    setTimeout(() => updateEnvironmentalAnalytics(data), 1600);
    setTimeout(() => update3DVisualization(data), 1800);
    setTimeout(() => generateReport(data), 2000);
    setTimeout(() => loadHistory(), 2200);
    
    // Store latest data globally for report generation if needed
    window.latestAssessmentData = data;
}

// --------------------------------------------------------------------------
// 10. HEALTH SCORE
// --------------------------------------------------------------------------
function updateHealthScore(data) {
    let score = 80; // Start at 80
    
    const dc = data.disease_confidence || 0;
    if (dc > 70) score -= 25;
    else if (dc > 50) score -= 15;
    else if (dc > 30) score -= 5;

    const sm = data.soil_moisture || 0;
    if (sm < 20) score -= 15;
    else if (sm > 80) score -= 5;

    const temp = data.temperature || 0;
    if (temp > 40) score -= 10;
    else if (temp < 10) score -= 10;

    const hum = data.humidity || 0;
    if (hum > 90) score -= 5;

    if (data.irrigation === 'IRRIGATE') score -= 10;

    // Clamp 0-100
    score = Math.max(0, Math.min(100, score));

    const scoreValue = document.getElementById('scoreValue');
    if (scoreValue) {
        animateValue(scoreValue, 0, score, 1500);
    }

    const scoreLabel = document.getElementById('scoreLabel');
    let color = '#ff4d4d'; // default red
    if (scoreLabel) {
        if (score > 75) {
            scoreLabel.textContent = 'Excellent';
            color = '#00d26a';
        } else if (score > 50) {
            scoreLabel.textContent = 'Good';
            color = '#ffd24d';
        } else if (score > 25) {
            scoreLabel.textContent = 'Fair';
            color = '#ffa64d';
        } else {
            scoreLabel.textContent = 'Poor';
        }
        scoreLabel.style.color = color;
    }

    const scoreRing = document.getElementById('scoreRing');
    if (scoreRing) {
        const radius = scoreRing.r.baseVal.value || 90;
        const circumference = 2 * Math.PI * radius;
        scoreRing.style.strokeDasharray = `${circumference} ${circumference}`;
        
        // offset
        const offset = circumference - (score / 100 * circumference);
        
        scoreRing.style.stroke = color;
        scoreRing.style.transition = 'stroke-dashoffset 1.5s ease-out';
        
        // Trigger reflow
        scoreRing.getBoundingClientRect();
        scoreRing.style.strokeDashoffset = offset;
    }
}

// --------------------------------------------------------------------------
// 11. DISEASE ANALYSIS
// --------------------------------------------------------------------------
function updateDiseaseAnalysis(data) {
    const diseaseName = document.getElementById('diseaseName');
    if (diseaseName) diseaseName.textContent = data.disease || 'Unknown';

    const confidenceBar = document.getElementById('confidenceBar');
    const confidenceValue = document.getElementById('confidenceValue');
    const riskBadge = document.getElementById('riskBadge');

    const conf = data.disease_confidence || 0;
    
    if (confidenceValue) {
        animateValue(confidenceValue, 0, conf, 1000);
        setTimeout(() => confidenceValue.textContent += '%', 1050);
    }

    let color = '#00d26a';
    let risk = 'LOW';
    if (conf >= 70) {
        color = '#ff4d4d';
        risk = 'HIGH';
    } else if (conf >= 40) {
        color = '#ffa64d';
        risk = 'MODERATE';
    }

    if (confidenceBar) {
        confidenceBar.style.width = '0%';
        confidenceBar.style.backgroundColor = color;
        setTimeout(() => {
            confidenceBar.style.width = `${conf}%`;
        }, 100);
    }

    if (riskBadge) {
        riskBadge.textContent = risk;
        riskBadge.style.backgroundColor = color;
        riskBadge.style.color = '#fff';
    }

    if (data.disease && data.disease.toLowerCase().includes('no image')) {
        if (diseaseName) diseaseName.textContent = 'No visual symptoms provided';
        if (riskBadge) riskBadge.style.display = 'none';
        if (confidenceBar) confidenceBar.style.width = '0%';
    }
}

// --------------------------------------------------------------------------
// 12. IRRIGATION CARD
// --------------------------------------------------------------------------
function updateIrrigationCard(data) {
    const irrigationStatus = document.getElementById('irrigationStatus');
    const irrigationCard = document.getElementById('irrigationCard');
    
    if (irrigationStatus) {
        irrigationStatus.textContent = data.irrigation || 'UNKNOWN';
    }

    if (irrigationCard) {
        irrigationCard.classList.remove('irrigate', 'irrigate-soon', 'monitor', 'hold');
        
        const status = (data.irrigation || '').toLowerCase();
        if (status.includes('soon')) {
            irrigationCard.classList.add('irrigate-soon');
        } else if (status.includes('irrigate')) {
            irrigationCard.classList.add('irrigate');
        } else if (status.includes('monitor')) {
            irrigationCard.classList.add('monitor');
        } else if (status.includes('hold')) {
            irrigationCard.classList.add('hold');
        }
    }

    // Update display values
    const irrMoisture = document.getElementById('irrMoisture');
    if (irrMoisture) irrMoisture.textContent = `${data.soil_moisture}%`;
    const irrTemp = document.getElementById('irrTemp');
    if (irrTemp) irrTemp.textContent = `${data.temperature}°C`;
    const irrHumidity = document.getElementById('irrHumidity');
    if (irrHumidity) irrHumidity.textContent = `${data.humidity}%`;

    const dropIcon = document.getElementById('waterDropIcon');
    if (dropIcon) {
        dropIcon.classList.add('animate-drop');
        setTimeout(() => dropIcon.classList.remove('animate-drop'), 1000);
    }
}

// --------------------------------------------------------------------------
// 13. EXPLANATION
// --------------------------------------------------------------------------
function updateExplanation(data) {
    const expText = document.getElementById('explanationText');
    const safeNote = document.getElementById('safetyNote');
    
    if (expText) expText.textContent = data.explanation || 'No explanation available.';
    
    if (safeNote) {
        if (data.safety_note) {
            const noteSpan = safeNote.querySelector('span:last-child');
            if (noteSpan) noteSpan.textContent = data.safety_note;
            else safeNote.textContent = data.safety_note;
            safeNote.style.display = 'flex';
        } else {
            safeNote.style.display = 'none';
        }
    }

    const expCard = document.getElementById('explanationCard');
    if (expCard) {
        expCard.classList.add('animate-in');
    }
}

// --------------------------------------------------------------------------
// 14. CROP INTELLIGENCE
// --------------------------------------------------------------------------
function updateCropIntelligence(data) {
    const updateCard = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    updateCard('intelCrop', data.crop);
    updateCard('intelStage', data.stage);
    updateCard('intelTemp', `${data.temperature}°C`);
    updateCard('intelHumidity', `${data.humidity}%`);
    updateCard('intelMoisture', `${data.soil_moisture}%`);

    let waterStatus = 'Critical';
    if (data.soil_moisture > 60) waterStatus = 'Adequate';
    else if (data.soil_moisture > 40) waterStatus = 'Moderate';
    else if (data.soil_moisture > 20) waterStatus = 'Low';
    updateCard('intelWater', waterStatus);

    let risk = 'Low';
    if (data.disease_confidence > 70) risk = 'High';
    else if (data.disease_confidence > 40) risk = 'Moderate';
    updateCard('intelRisk', risk);

    updateCard('intelHealth', risk === 'High' ? 'Poor' : (risk === 'Moderate' ? 'Fair' : 'Good'));
}

// --------------------------------------------------------------------------
// 15. FARMING TECHNIQUES
// --------------------------------------------------------------------------
function updateFarmingTechniques(data) {
    const techniques = {
        'Rice': [
            { title: 'Water Management', desc: 'Maintain 2-5cm standing water during vegetative stage. Drain before harvest.', icon: '💧' },
            { title: 'Nutrient Management', desc: 'Apply nitrogen in splits. Use phosphorus at planting.', icon: '🌱' },
            { title: 'Weed Control', desc: 'Hand weeding or herbicide at 20-25 days after transplanting.', icon: '🌾' },
            { title: 'Pest Monitoring', desc: 'Scout for stem borers, leaf folders, and brown plant hoppers.', icon: '🔍' },
            { title: 'Disease Scouting', desc: 'Watch for blast, sheath blight, and bacterial leaf blight.', icon: '🩺' },
            { title: 'Spacing', desc: 'Maintain 20x15cm spacing for optimal tillering.', icon: '📏' }
        ],
        'Wheat': [
            { title: 'Irrigation Scheduling', desc: 'Critical irrigations at crown root, tillering, flowering, and grain filling.', icon: '💧' },
            { title: 'Nitrogen Management', desc: 'Split nitrogen application: 1/3 at sowing, 1/3 at first irrigation, 1/3 at second irrigation.', icon: '🌱' },
            { title: 'Weed Management', desc: 'Apply pre-emergence herbicides within 2-3 days of sowing.', icon: '🌾' },
            { title: 'Disease Monitoring', desc: 'Watch for rust, smut, and powdery mildew. Apply fungicides preventively.', icon: '🔍' },
            { title: 'Temperature Management', desc: 'Wheat is sensitive to terminal heat stress. Timely sowing is crucial.', icon: '🌡️' },
            { title: 'Harvesting', desc: 'Harvest at 14% grain moisture. Avoid delays to prevent shattering.', icon: '📏' }
        ],
        'Maize': [
            { title: 'Seed Selection', desc: 'Use certified hybrid seeds suited for your agro-climatic zone.', icon: '🌱' },
            { title: 'Fertilizer Application', desc: 'Apply 120:60:40 NPK kg/ha. Top dress nitrogen at knee-high stage.', icon: '💧' },
            { title: 'Weed Control', desc: 'Critical weed-free period is first 20-40 days. Use pre-emergence herbicide.', icon: '🌾' },
            { title: 'Pest Management', desc: 'Monitor for fall armyworm, stem borer, and aphids.', icon: '🔍' },
            { title: 'Irrigation', desc: 'Critical stages: tasseling, silking, and grain filling. Avoid waterlogging.', icon: '💧' },
            { title: 'Harvesting', desc: 'Harvest when husks turn brown and grain moisture is below 25%.', icon: '📏' }
        ],
        'Cotton': [
            { title: 'Spacing', desc: 'Maintain 90x60cm spacing for Bt cotton varieties.', icon: '📏' },
            { title: 'Pest Management', desc: 'Implement IPM. Scout for bollworms, whiteflies, and jassids.', icon: '🔍' },
            { title: 'Nutrient Management', desc: 'Apply 120:60:60 NPK. Use foliar sprays at flowering.', icon: '🌱' },
            { title: 'Defoliation', desc: 'Use defoliants 2-3 weeks before final picking for clean harvest.', icon: '🌾' },
            { title: 'Water Management', desc: 'Drip irrigation recommended. Critical stages: flowering and boll development.', icon: '💧' },
            { title: 'Growth Regulators', desc: 'Apply growth regulators to control excessive vegetative growth.', icon: '🩺' }
        ],
        'Tomato': [
            { title: 'Staking', desc: 'Stake or trellis plants for better air circulation and fruit quality.', icon: '📏' },
            { title: 'Pruning', desc: 'Remove suckers below first flower cluster for determinate varieties.', icon: '🌾' },
            { title: 'Disease Prevention', desc: 'Watch for early/late blight, fusarium wilt. Avoid overhead irrigation.', icon: '🔍' },
            { title: 'Fertilization', desc: 'Side dress with calcium nitrate to prevent blossom end rot.', icon: '🌱' },
            { title: 'Mulching', desc: 'Use plastic or organic mulch to conserve moisture and suppress weeds.', icon: '💧' },
            { title: 'Harvesting', desc: 'Harvest at breaker stage for distant markets, ripe for local markets.', icon: '🩺' }
        ],
        'Potato': [
            { title: 'Seed Treatment', desc: 'Treat seed tubers with fungicide before planting. Use certified seed.', icon: '🌱' },
            { title: 'Earthing Up', desc: 'Earth up at 30 and 45 days after planting to prevent greening.', icon: '🌾' },
            { title: 'Late Blight Management', desc: 'Apply mancozeb preventively. Use resistant varieties.', icon: '🔍' },
            { title: 'Irrigation', desc: 'Maintain uniform soil moisture. Avoid waterlogging. Critical at tuber initiation.', icon: '💧' },
            { title: 'Nutrient Management', desc: 'Apply 150:80:80 NPK. Use organic manure 2 weeks before planting.', icon: '🩺' },
            { title: 'Harvesting', desc: 'Desiccate haulms 10 days before harvest. Cure tubers in shade.', icon: '📏' }
        ]
    };

    const defaultTechniques = [
        { title: 'Soil Health', desc: 'Conduct soil testing annually. Maintain organic matter.', icon: '🌱' },
        { title: 'Water Management', desc: 'Monitor soil moisture regularly. Avoid over and under irrigation.', icon: '💧' },
        { title: 'Pest & Disease Monitoring', desc: 'Regular scouting. Use IPM practices. Consult local extension services.', icon: '🔍' },
        { title: 'Nutrient Management', desc: 'Follow soil-test based fertilizer recommendations.', icon: '🌾' },
        { title: 'Weed Management', desc: 'Timely weeding. Use mulching where possible.', icon: '🩺' },
        { title: 'Record Keeping', desc: 'Maintain field records for better decision making.', icon: '📏' }
    ];

    const list = document.getElementById('techniquesList');
    if (!list) return;

    list.innerHTML = ''; // clear

    const cropTechs = techniques[data.crop] || defaultTechniques;
    
    cropTechs.forEach((tech, idx) => {
        const card = document.createElement('div');
        card.className = 'tech-card animate-on-scroll';
        card.style.animationDelay = `${idx * 100}ms`;
        card.innerHTML = `
            <div class="tech-icon">${tech.icon}</div>
            <div class="tech-content">
                <h4>${tech.title}</h4>
                <p>${tech.desc}</p>
            </div>
        `;
        list.appendChild(card);
        
        // manually trigger animation
        setTimeout(() => card.classList.add('animate-in'), 50);
    });
}

// --------------------------------------------------------------------------
// 16. CROP PROTECTION
// --------------------------------------------------------------------------
function updateCropProtection(data) {
    const timeline = document.getElementById('protectionTimeline');
    if (!timeline) return;

    const steps = [
        { title: 'MONITOR', desc: 'Regularly inspect crop leaves, stems, and roots for signs of stress, discoloration, or pest damage.' },
        { title: 'PREVENT', desc: 'Maintain proper irrigation, nutrition, and field hygiene to prevent disease outbreaks.' },
        { title: 'PROTECT', desc: 'Apply recommended treatments promptly. Use IPM strategies and consult agricultural experts.' },
        { title: 'RECOVER', desc: 'If damage occurs, identify the cause quickly. Adjust management practices and seek guidance.' }
    ];

    timeline.innerHTML = '';

    steps.forEach((step, idx) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="timeline-marker">${idx + 1}</div>
            <div class="timeline-content">
                <h4>${step.title}</h4>
                <p>${step.desc}</p>
            </div>
        `;
        timeline.appendChild(item);
    });
}

// --------------------------------------------------------------------------
// 17. ENVIRONMENTAL ANALYTICS
// --------------------------------------------------------------------------
function updateEnvironmentalAnalytics(data) {
    const updateGauge = (id, textId, value, max, unit) => {
        const gauge = document.getElementById(id);
        if (!gauge) return;
        
        // Update SVG stroke-dashoffset based on percentage
        const radius = gauge.r.baseVal.value || 52;
        const circumference = 2 * Math.PI * radius;
        const percentage = Math.min(100, Math.max(0, (value / max) * 100));
        
        gauge.style.strokeDasharray = `${circumference} ${circumference}`;
        gauge.style.strokeDashoffset = circumference - (percentage / 100 * circumference);
        gauge.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
        
        const text = document.getElementById(textId);
        if (text) {
            animateValue(text, 0, value, 1000);
            setTimeout(() => { text.textContent = `${value}${unit}`; }, 1050);
        }
    };

    updateGauge('moistureGauge', 'gaugeMoistureValue', data.soil_moisture, 100, '%');
    updateGauge('tempGauge', 'gaugeTempValue', data.temperature, 50, '°C'); 
    updateGauge('humidityGauge', 'gaugeHumidityValue', data.humidity, 100, '%');

    const timeline = document.getElementById('stageTimeline');
    if (timeline) {
        const stages = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity', 'Harvest'];
        timeline.innerHTML = '';
        
        let currentPassed = true;
        stages.forEach(stage => {
            const item = document.createElement('div');
            item.className = 'stage-item';
            if (stage.toLowerCase() === (data.stage || '').toLowerCase()) {
                item.classList.add('current');
                currentPassed = false;
            } else if (currentPassed) {
                item.classList.add('passed');
            }
            item.textContent = stage;
            timeline.appendChild(item);
        });
    }
}

// --------------------------------------------------------------------------
// 18. 3D VISUALIZATION
// --------------------------------------------------------------------------
let scene, camera, renderer, plantGroup;
let isDragging = false, prevMouse = { x: 0, y: 0 };
let spherical = { theta: 0.3, phi: 1.05, radius: 9 };
let autoRotate = true;

function init3DVisualization() {
    const canvas = document.getElementById('vizCanvas');
    const fallback = document.getElementById('vizFallback');

    if (!canvas) return;

    if (!isWebGLAvailable() || typeof THREE === 'undefined') {
        canvas.style.display = 'none';
        if (fallback) { fallback.style.display = 'flex'; }
        return;
    }

    try {
        const container = canvas.parentElement;
        const w = container.clientWidth || 800;
        const h = container.clientHeight || 500;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x030f03);
        scene.fog = new THREE.Fog(0x030f03, 15, 40);

        camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
        updateCameraPosition();

        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;

        // Lighting — rich and dramatic
        const ambient = new THREE.AmbientLight(0x224422, 1.5);
        scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 2.5);
        sun.position.set(8, 15, 10);
        sun.castShadow = true;
        scene.add(sun);

        const fillLight = new THREE.DirectionalLight(0x00ff88, 0.6);
        fillLight.position.set(-8, 5, -5);
        scene.add(fillLight);

        const rimLight = new THREE.PointLight(0x00d26a, 1.5, 20);
        rimLight.position.set(0, 8, -6);
        scene.add(rimLight);

        // Grid floor
        const grid = new THREE.GridHelper(20, 20, 0x00d26a, 0x0a3d0a);
        grid.position.y = 0;
        scene.add(grid);

        // Glowing soil disc
        const soilGeo = new THREE.CylinderGeometry(3, 3.2, 0.3, 64);
        const soilMat = new THREE.MeshPhongMaterial({ color: 0x3d2210, shininess: 20 });
        const soil = new THREE.Mesh(soilGeo, soilMat);
        soil.receiveShadow = true;
        soil.position.y = 0;
        scene.add(soil);

        // Glowing ring around soil
        const ringGeo = new THREE.TorusGeometry(3.1, 0.05, 8, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d26a });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.1;
        scene.add(ring);

        plantGroup = new THREE.Group();
        scene.add(plantGroup);
        createDetailedPlant(0x00d26a);

        // Mouse interactivity
        setupMouseControls(canvas);

        // Responsive resize observer
        const resizeObserver = new ResizeObserver(() => {
            const nw = container.clientWidth;
            const nh = container.clientHeight;
            if (nw > 0 && nh > 0) {
                camera.aspect = nw / nh;
                camera.updateProjectionMatrix();
                renderer.setSize(nw, nh);
            }
        });
        resizeObserver.observe(container);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            if (autoRotate && !isDragging && plantGroup) {
                spherical.theta += 0.004;
                updateCameraPosition();
            }
            renderer.render(scene, camera);
        };
        animate();

    } catch (e) {
        console.warn('3D init failed:', e);
        canvas.style.display = 'none';
        if (fallback) fallback.style.display = 'flex';
    }
}

function updateCameraPosition() {
    if (!camera) return;
    const r = spherical.radius;
    const phi = spherical.phi;
    const theta = spherical.theta;
    camera.position.set(
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.cos(theta)
    );
    camera.lookAt(0, 3.5, 0);
}

function setupMouseControls(canvas) {
    // Drag to rotate
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        autoRotate = false;
        prevMouse = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = (e.clientX - prevMouse.x) * 0.01;
        const dy = (e.clientY - prevMouse.y) * 0.008;
        spherical.theta -= dx;
        spherical.phi = Math.max(0.2, Math.min(Math.PI / 2, spherical.phi + dy));
        updateCameraPosition();
        prevMouse = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => {
        isDragging = false;
        // Resume auto-rotate after 3s of inactivity
        setTimeout(() => { autoRotate = true; }, 3000);
    });

    // Touch support
    let lastTouch = null;
    canvas.addEventListener('touchstart', (e) => {
        isDragging = true;
        autoRotate = false;
        lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas.addEventListener('touchmove', (e) => {
        if (!isDragging || !lastTouch) return;
        const dx = (e.touches[0].clientX - lastTouch.x) * 0.012;
        const dy = (e.touches[0].clientY - lastTouch.y) * 0.01;
        spherical.theta -= dx;
        spherical.phi = Math.max(0.2, Math.min(Math.PI / 2, spherical.phi + dy));
        updateCameraPosition();
        lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas.addEventListener('touchend', () => {
        isDragging = false;
        setTimeout(() => { autoRotate = true; }, 3000);
    });

    // Scroll to zoom
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        spherical.radius = Math.max(3, Math.min(15, spherical.radius + e.deltaY * 0.02));
        updateCameraPosition();
    }, { passive: false });
}

function createDetailedPlant(colorHex) {
    if (!plantGroup) return;

    // Clear existing
    while (plantGroup.children.length > 0) {
        plantGroup.remove(plantGroup.children[0]);
    }

    // ── MATERIALS ───────────────────────────────────────────────────
    const trunkMat  = new THREE.MeshPhongMaterial({ color: 0x5c3a1e, shininess: 10 });          // brown trunk
    const branchMat = new THREE.MeshPhongMaterial({ color: 0x4a6741, shininess: 10 });           // dark green branch
    const leafMat   = new THREE.MeshPhongMaterial({ color: colorHex, shininess: 80,
                                                    side: THREE.DoubleSide, transparent: true,
                                                    opacity: 0.97 });
    const leafDarkMat = new THREE.MeshPhongMaterial({ color: darken(colorHex, 0.6),
                                                      shininess: 30, side: THREE.DoubleSide,
                                                      transparent: true, opacity: 0.9 });
    const soilTopMat = new THREE.MeshPhongMaterial({ color: 0x4a2e10 });

    // ── HELPERS ──────────────────────────────────────────────────────
    // Make a pointed oval leaf using PlaneGeometry — clear leaf silhouette
    function makeleaf(w, h) {
        const geo = new THREE.PlaneGeometry(w, h, 4, 8);
        // Pinch top and bottom vertices to create a pointed leaf tip shape
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            const yt = y / (h / 2); // normalized -1..1
            const taper = 1 - yt * yt * 0.7;  // wider in middle, pointed at tips
            pos.setX(i, pos.getX(i) * taper);
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
        return geo;
    }

    function darken(hex, factor) {
        const r = ((hex >> 16) & 0xff) * factor;
        const g = ((hex >> 8) & 0xff) * factor;
        const b = (hex & 0xff) * factor;
        return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
    }

    // Add a leaf at stem attachment point, angled outward and drooping slightly
    function addLeaf(attachX, attachY, attachZ, rotY, droop, scale) {
        const geo = makeleaf(0.55 * scale, 1.6 * scale);
        const leaf = new THREE.Mesh(geo, Math.random() > 0.4 ? leafMat : leafDarkMat);
        leaf.castShadow = true;
        // Move pivot to base of leaf
        leaf.geometry.translate(0, 0.8 * scale, 0);
        leaf.position.set(attachX, attachY, attachZ);
        leaf.rotation.y = rotY;
        leaf.rotation.z = droop;    // droop downward from horizontal
        leaf.rotation.x = -0.15;
        plantGroup.add(leaf);
    }

    // Add a branch stick
    function addBranch(x, y, z, rotZ, len) {
        const geo = new THREE.CylinderGeometry(0.05, 0.08, len, 6);
        const m = new THREE.Mesh(geo, branchMat);
        m.position.set(x, y + len / 2 * Math.sin(Math.abs(rotZ)), z);
        m.rotation.z = rotZ;
        plantGroup.add(m);
        return m;
    }

    // ── TRUNK ─────────────────────────────────────────────────────────
    const trunkGeo = new THREE.CylinderGeometry(0.22, 0.32, 4.5, 10);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2.25;
    trunk.castShadow = true;
    plantGroup.add(trunk);

    // Slight taper sub-segment to make trunk feel natural
    const trunkTop = new THREE.CylinderGeometry(0.12, 0.22, 1.5, 8);
    const trunkTopMesh = new THREE.Mesh(trunkTop, branchMat);
    trunkTopMesh.position.y = 5.0;
    plantGroup.add(trunkTopMesh);

    // ── BRANCHES with LEAVES ─────────────────────────────────────────
    // Each branch: a stick + a cluster of leaves at the end
    const branchDefs = [
        // [x, y, z, rotZ (lean angle), leafCount, leafSpread]
        [ 1.0, 1.5, 0,    -0.65, 5, 1.1],
        [-1.0, 1.5, 0,     0.65, 5, 1.1],
        [ 0.8, 2.5, 0.5,  -0.55, 4, 1.0],
        [-0.8, 2.5,-0.5,   0.55, 4, 1.0],
        [ 1.1, 3.4,-0.3,  -0.5,  4, 0.9],
        [-1.1, 3.4, 0.3,   0.5,  4, 0.9],
        [ 0.7, 4.2, 0.4,  -0.45, 3, 0.8],
        [-0.7, 4.2,-0.4,   0.45, 3, 0.8],
    ];

    branchDefs.forEach(([bx, by, bz, rotZ, leafCount, leafScale]) => {
        addBranch(bx * 0.5, by, bz * 0.5, rotZ, 0.9);
        // Tip of branch: where leaves spawn
        const tipX = bx + Math.sin(Math.abs(rotZ)) * 0.9 * Math.sign(bx);
        const tipY = by + Math.cos(Math.abs(rotZ)) * 0.9 * 0.5;
        const tipZ = bz;
        // Spray leaves radially around branch tip
        for (let i = 0; i < leafCount; i++) {
            const angle = (i / leafCount) * Math.PI * 2;
            const offX = Math.cos(angle) * 0.25;
            const offZ = Math.sin(angle) * 0.25;
            const droop = -Math.PI / 4 + (Math.random() - 0.5) * 0.5;
            addLeaf(tipX + offX, tipY, tipZ + offZ, angle, droop, leafScale);
        }
    });

    // ── CROWN: top cluster of leaves ─────────────────────────────────
    for (let i = 0; i < 14; i++) {
        const angle = (i / 14) * Math.PI * 2;
        const r = 0.5 + Math.random() * 0.5;
        const h = 5.5 + Math.random() * 1.2;
        const droop = -Math.PI / 3 + (Math.random() - 0.5) * 0.5;
        addLeaf(
            Math.cos(angle) * r,
            h,
            Math.sin(angle) * r,
            angle,
            droop,
            0.85 + Math.random() * 0.3
        );
    }
    // A few upright leaves at the very top
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        addLeaf(Math.cos(angle) * 0.2, 6.4, Math.sin(angle) * 0.2, angle, -0.1, 0.6);
    }

    // ── SOIL top disc ─────────────────────────────────────────────────
    const soilGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.12, 48);
    const soilTop = new THREE.Mesh(soilGeo, soilTopMat);
    soilTop.position.y = 0.05;
    soilTop.receiveShadow = true;
    plantGroup.add(soilTop);

    // ── STATUS SPOTS: coloured dots to indicate health ─────────────────
    // Bright dots on leaves when unhealthy — like disease spots
    if (colorHex === 0xff4d4d || colorHex === 0xffd24d) {
        const spotMat = new THREE.MeshBasicMaterial({ color: colorHex === 0xff4d4d ? 0xcc0000 : 0xcc8800 });
        for (let i = 0; i < 8; i++) {
            const sGeo = new THREE.SphereGeometry(0.07, 6, 6);
            const spot = new THREE.Mesh(sGeo, spotMat);
            const a = Math.random() * Math.PI * 2;
            const r = 0.5 + Math.random() * 1.5;
            spot.position.set(Math.cos(a) * r, 1.5 + Math.random() * 4, Math.sin(a) * r);
            plantGroup.add(spot);
        }
    }

    // ── FLOATING GLOW PARTICLES ───────────────────────────────────────
    for (let i = 0; i < 10; i++) {
        const pGeo = new THREE.SphereGeometry(0.04, 5, 5);
        const pMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.6 });
        const p = new THREE.Mesh(pGeo, pMat);
        const a = (i / 10) * Math.PI * 2;
        p.position.set(Math.cos(a) * (2 + Math.random()), 1.5 + Math.random() * 4.5, Math.sin(a) * (2 + Math.random()));
        p.userData.baseY = p.position.y;
        p.userData.speed = 0.4 + Math.random() * 0.6;
        p.userData.phase = Math.random() * Math.PI * 2;
        plantGroup.add(p);
    }
}

function update3DVisualization(data) {
    const vizSection = document.getElementById('visualization');
    if (vizSection) {
        vizSection.classList.remove('hidden');
        vizSection.style.display = 'block';
    }

    // Change color based on health/disease
    let colorHex = 0x00d26a; // Green = healthy
    if (data.disease_confidence > 70) colorHex = 0xff4d4d; // Red = high risk
    else if (data.disease_confidence > 40) colorHex = 0xffd24d; // Yellow = moderate

    // Defer initialization to next frame so the section has real dimensions
    requestAnimationFrame(() => {
        if (!scene || !plantGroup || !camera || !renderer) {
            init3DVisualization();
        }

        const canvas = document.getElementById('vizCanvas');
        if (canvas && camera && renderer) {
            const container = canvas.parentElement;
            if (container.clientWidth > 0 && container.clientHeight > 0) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        }

        createDetailedPlant(colorHex);
    });
}

// --------------------------------------------------------------------------
// 19. REPORT GENERATION
// --------------------------------------------------------------------------
function generateReport(data) {
    // Show report and visualization sections
    const vizSection = document.getElementById('visualization');
    if (vizSection) vizSection.classList.remove('hidden');
    const reportSection = document.getElementById('report');
    if (reportSection) reportSection.classList.remove('hidden');

    // Populate report fields
    const setReport = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setReport('reportDate', new Date().toLocaleString());
    setReport('reportCrop', data.crop || '—');
    setReport('reportStage', data.stage || '—');
    setReport('reportMoisture', `${data.soil_moisture}%`);
    setReport('reportTemp', `${data.temperature}°C`);
    setReport('reportHumidity', `${data.humidity}%`);
    setReport('reportDisease', data.disease || '—');
    setReport('reportConfidence', `${data.disease_confidence}%`);
    setReport('reportIrrigation', data.irrigation || '—');
    setReport('reportExplanation', data.explanation || '—');
    setReport('reportSafety', data.safety_note || '—');

    const downloadBtn = document.getElementById('downloadReport');
    if (downloadBtn) {
        // Remove old listener to avoid duplicates
        const newBtn = downloadBtn.cloneNode(true);
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
