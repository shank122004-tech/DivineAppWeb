// ==============================
// DIVINE COSMIC UNIVERSE - Mobile First Edition
// ==============================

// Cosmic Configuration
const COSMIC_CONFIG = {
    DB_NAME: 'DivineCosmosDB',
    DB_VERSION: 2,
    STORE_NAME: 'cosmic_models',
    ADMIN_PASSWORD: "Shashank@122004",
    SECURITY_SIGNATURE: "DM-9937-COSMIC-SECURE",
    
    // Mobile-specific settings
    MOBILE_BREAKPOINT: 768,
    TOUCH_TIMEOUT: 300,
    
    // Cosmic Effects
    PARTICLE_COUNT: 100,
    STARS_COUNT: 80,
    GLOW_INTENSITY: 0.3
};

// Divine State
let cosmicDB = null;
let isDivineAdmin = false;
let divineParticles = [];
let isMobile = window.innerWidth < COSMIC_CONFIG.MOBILE_BREAKPOINT;

// DOM Elements
const elements = {
    adminLoginModal: document.getElementById('adminLoginModal'),
    adminPanel: document.getElementById('adminPanel'),
    mainWebsite: document.getElementById('mainWebsite'),
    adminAccessBtn: document.getElementById('adminAccessBtn'),
    closeModal: document.querySelector('.close-modal'),
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    adminPassword: document.getElementById('adminPassword'),
    loginError: document.getElementById('loginError'),
    modelsGrid: document.getElementById('modelsGrid'),
    adminModelsGrid: document.getElementById('adminModelsGrid'),
    emptyState: document.getElementById('emptyState'),
    uploadBtn: document.getElementById('uploadBtn'),
    addUrlBtn: document.getElementById('addUrlBtn'),
    modelName: document.getElementById('modelName'),
    urlModelName: document.getElementById('urlModelName'),
    modelThumbnail: document.getElementById('modelThumbnail'),
    modelFile: document.getElementById('modelFile'),
    glbUrl: document.getElementById('glbUrl'),
    thumbnailUrl: document.getElementById('thumbnailUrl'),
    modelTags: document.getElementById('modelTags'),
    uploadStatus: document.querySelector('.upload-status'),
    progressFill: document.querySelector('.progress-fill'),
    statusText: document.querySelector('.status-text'),
    statusPercent: document.querySelector('.status-percent'),
    portalCards: document.querySelectorAll('.portal-card'),
    portalContents: document.querySelectorAll('.portal-content'),
    exploreBtn: document.querySelector('.explore-btn')
};

// Divine Initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        detectMobile();
        setupMobileViewport();
        await initializeCosmos();
        setupCosmicEventListeners();
        initDivineParticles();
        initCosmicEffects();
        animateCounters();
        setupScrollAnimations();
        
        // Show welcome notification
        setTimeout(() => {
            showCosmicNotification('Cosmic interface initialized', 'success');
        }, 1000);
    } catch (error) {
        console.error('Cosmic initialization failed:', error);
        showCosmicNotification('Failed to initialize cosmos', 'error');
    }
});

// Detect Mobile Device
function detectMobile() {
    isMobile = window.innerWidth < COSMIC_CONFIG.MOBILE_BREAKPOINT;
    
    // Add mobile class to body
    if (isMobile) {
        document.body.classList.add('mobile-device');
    } else {
        document.body.classList.remove('mobile-device');
    }
}

// Setup Mobile Viewport
function setupMobileViewport() {
    // Prevent zoom on iOS
    let viewport = document.querySelector('meta[name="viewport"]');
    if (isMobile && viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
}

// Initialize Cosmic Universe
async function initializeCosmos() {
    await initCosmicDB();
    await loadCosmicModels();
}

// Initialize Cosmic Database
function initCosmicDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(COSMIC_CONFIG.DB_NAME, COSMIC_CONFIG.DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            cosmicDB = request.result;
            resolve();
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create cosmic models store
            if (!db.objectStoreNames.contains(COSMIC_CONFIG.STORE_NAME)) {
                const store = db.createObjectStore(COSMIC_CONFIG.STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                
                // Create cosmic indices
                store.createIndex('name', 'name', { unique: false });
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('uploadDate', 'uploadDate', { unique: false });
                store.createIndex('tags', 'tags', { multiEntry: true });
            }
        };
    });
}

// Setup Cosmic Event Listeners
function setupCosmicEventListeners() {
    // Divine Access Button
    elements.adminAccessBtn.addEventListener('click', () => {
        elements.adminLoginModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus on password input
        setTimeout(() => {
            elements.adminPassword.focus();
        }, 100);
    });
    
    // Close Modal
    elements.closeModal.addEventListener('click', () => {
        elements.adminLoginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetLoginForm();
    });
    
    // Login
    elements.loginBtn.addEventListener('click', handleDivineLogin);
    elements.adminPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleDivineLogin();
    });
    
    // Logout
    elements.logoutBtn.addEventListener('click', handleDivineLogout);
    
    // Upload Model
    elements.uploadBtn.addEventListener('click', handleCosmicUpload);
    
    // Add by URL
    elements.addUrlBtn.addEventListener('click', handleAddByURL);
    
    // Portal Navigation
    elements.portalCards.forEach(card => {
        card.addEventListener('click', () => {
            const portal = card.dataset.portal;
            switchPortal(portal);
        });
    });
    
    // Explore Button
    if (elements.exploreBtn) {
        elements.exploreBtn.addEventListener('click', () => {
            document.querySelector('.models-section').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
    // File Upload Drag & Drop
    setupDragAndDrop();
    
    // Close Modal on Outside Click
    window.addEventListener('click', (e) => {
        if (e.target === elements.adminLoginModal) {
            elements.adminLoginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            resetLoginForm();
        }
    });
    
    // Close Modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.adminLoginModal.style.display === 'block') {
                elements.adminLoginModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                resetLoginForm();
            }
        }
    });
    
    // Setup mobile-specific events
    if (isMobile) {
        setupMobileEvents();
    }
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
}

// Setup Mobile Events
function setupMobileEvents() {
    // Add touch feedback for buttons
    const buttons = document.querySelectorAll('.divine-button, .portal-card, .social-icon');
    buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
            button.classList.add('touch-active');
        });
        
        button.addEventListener('touchend', () => {
            setTimeout(() => {
                button.classList.remove('touch-active');
            }, 150);
        });
    });
    
    // Prevent long press context menu
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
            e.preventDefault();
        }
    });
}

// Handle Window Resize
function handleResize() {
    detectMobile();
    
    // Reinitialize particles on resize
    if (window.innerWidth !== window.innerHeight) {
        initDivineParticles();
    }
}

// Setup Drag & Drop
function setupDragAndDrop() {
    const uploadAreas = document.querySelectorAll('.upload-area');
    
    uploadAreas.forEach(area => {
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.style.borderColor = 'var(--cosmic-primary)';
            area.style.background = 'rgba(15, 15, 35, 0.8)';
        });
        
        area.addEventListener('dragleave', () => {
            area.style.borderColor = 'rgba(139, 92, 246, 0.3)';
            area.style.background = 'rgba(15, 15, 35, 0.4)';
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.style.borderColor = 'rgba(139, 92, 246, 0.3)';
            area.style.background = 'rgba(15, 15, 35, 0.4)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const input = area.parentElement.querySelector('input[type="file"]');
                if (input) {
                    input.files = files;
                    
                    // Show file name
                    const fileName = files[0].name;
                    area.querySelector('span').textContent = fileName.substring(0, 20) + (fileName.length > 20 ? '...' : '');
                    area.querySelector('i').className = 'fas fa-check-circle';
                    area.querySelector('i').style.color = '#00ff88';
                    
                    setTimeout(() => {
                        area.querySelector('i').className = 'fas fa-cloud-upload';
                        area.querySelector('i').style.color = '';
                        area.querySelector('span').textContent = 'Drop or select file';
                    }, 3000);
                }
            }
        });
    });
}

// Switch Portal
function switchPortal(portalId) {
    // Update active portal card
    elements.portalCards.forEach(card => {
        card.classList.remove('active');
        if (card.dataset.portal === portalId) {
            card.classList.add('active');
        }
    });
    
    // Show active portal content
    elements.portalContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${portalId}Portal`) {
            content.classList.add('active');
        }
    });
    
    // Special handling for manage portal
    if (portalId === 'manage') {
        loadAdminModels();
    }
}

// Divine Login Handler
function handleDivineLogin() {
    const password = elements.adminPassword.value.trim();
    
    if (password === COSMIC_CONFIG.ADMIN_PASSWORD) {
        isDivineAdmin = true;
        
        // Cosmic transition effect
        elements.adminLoginModal.style.opacity = '0';
        setTimeout(() => {
            elements.adminLoginModal.style.display = 'none';
            elements.adminPanel.style.display = 'block';
            elements.mainWebsite.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Load admin models
            loadAdminModels();
            
            // Show cosmic welcome
            showCosmicNotification('Welcome to Divine Administration Portal', 'success');
            
            // Add mobile-specific class
            if (isMobile) {
                document.body.classList.add('admin-mode');
            }
        }, 300);
        
        resetLoginForm();
    } else {
        elements.loginError.textContent = 'Invalid cosmic passcode';
        elements.loginError.style.opacity = '1';
        
        // Shake animation
        elements.adminPassword.style.animation = 'shake 0.5s';
        setTimeout(() => {
            elements.adminPassword.style.animation = '';
        }, 500);
    }
}

// Divine Logout Handler
function handleDivineLogout() {
    isDivineAdmin = false;
    
    // Cosmic transition
    elements.adminPanel.style.opacity = '0';
    setTimeout(() => {
        elements.adminPanel.style.display = 'none';
        elements.mainWebsite.style.display = 'block';
        elements.adminPanel.style.opacity = '1';
        
        // Remove mobile admin class
        if (isMobile) {
            document.body.classList.remove('admin-mode');
        }
        
        showCosmicNotification('Returned to cosmic website', 'warning');
    }, 300);
    
    resetUploadForm();
    resetURLForm();
}

// Reset Forms
function resetLoginForm() {
    elements.adminPassword.value = '';
    elements.loginError.textContent = '';
    elements.loginError.style.opacity = '0';
}

function resetUploadForm() {
    elements.modelName.value = '';
    elements.modelThumbnail.value = '';
    elements.modelFile.value = '';
    
    // Reset upload area text
    const uploadAreas = document.querySelectorAll('.upload-area span');
    uploadAreas.forEach(area => {
        if (!area.querySelector('i')) {
            area.textContent = 'Drop or select file';
        }
    });
}

function resetURLForm() {
    elements.urlModelName.value = '';
    elements.glbUrl.value = '';
    elements.thumbnailUrl.value = '';
    elements.modelTags.value = '';
}

// Cosmic Upload Handler
async function handleCosmicUpload() {
    const name = elements.modelName.value.trim();
    const thumbnailFile = elements.modelThumbnail.files[0];
    const glbFile = elements.modelFile.files[0];
    
    if (!name || !thumbnailFile || !glbFile) {
        showCosmicNotification('Please fill all cosmic fields', 'error');
        return;
    }
    
    // Validate file sizes for mobile
    if (isMobile) {
        const maxSize = 50 * 1024 * 1024; // 50MB max for mobile
        if (glbFile.size > maxSize) {
            showCosmicNotification('File too large for mobile upload (max 50MB)', 'error');
            return;
        }
    }
    
    try {
        showUploadStatus(true);
        updateCosmicProgress(10, 'Initializing cosmic transfer...');
        
        // Read thumbnail
        const thumbnail = await readFileAsDataURL(thumbnailFile);
        
        updateCosmicProgress(40, 'Processing divine model...');
        
        // Read GLB file
        const glbData = await readFileAsArrayBuffer(glbFile);
        
        updateCosmicProgress(80, 'Storing in cosmic database...');
        
        // Create cosmic model
        const model = {
            name,
            thumbnail,
            glbData: new Uint8Array(glbData),
            fileName: `${name.replace(/\s+/g, '_').toLowerCase()}_divine.glb`,
            type: 'upload',
            uploadDate: new Date().toISOString(),
            tags: ['divine', 'cosmic', 'uploaded'],
            fileSize: glbFile.size,
            securitySignature: COSMIC_CONFIG.SECURITY_SIGNATURE
        };
        
        // Save to cosmic database
        await saveCosmicModel(model);
        
        updateCosmicProgress(100, 'Cosmic upload complete!');
        
        setTimeout(() => {
            resetUploadForm();
            showUploadStatus(false);
            loadCosmicModels();
            loadAdminModels();
            showCosmicNotification('Model uploaded to cosmos!', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('Cosmic upload failed:', error);
        showUploadStatus(false);
        showCosmicNotification('Upload failed: ' + error.message, 'error');
    }
}

// Add by URL Handler
async function handleAddByURL() {
    const name = elements.urlModelName.value.trim();
    const glbUrl = elements.glbUrl.value.trim();
    const thumbnailUrl = elements.thumbnailUrl.value.trim();
    const tags = elements.modelTags.value.split(',').map(t => t.trim()).filter(t => t);
    
    // Validation
    if (!name || !glbUrl) {
        showCosmicNotification('Please provide name and GLB URL', 'error');
        return;
    }
    
    if (!glbUrl.startsWith('http') || !glbUrl.includes('://')) {
        showCosmicNotification('Invalid cosmic URL format', 'error');
        return;
    }
    
    try {
        showUploadStatus(true);
        updateCosmicProgress(20, 'Validating cosmic URL...');
        
        // Validate URL (HEAD request)
        const isValid = await validateGLBURL(glbUrl);
        if (!isValid) {
            throw new Error('URL does not point to valid GLB file');
        }
        
        updateCosmicProgress(80, 'Adding to cosmic library...');
        
        // Create URL model
        const model = {
            name,
            glbUrl,
            thumbnailUrl: thumbnailUrl || null,
            fileName: glbUrl.split('/').pop() || `${name}.glb`,
            type: 'url',
            uploadDate: new Date().toISOString(),
            tags: ['url', 'cosmic', ...tags],
            fileSize: 0, // Will be fetched later if needed
            securitySignature: COSMIC_CONFIG.SECURITY_SIGNATURE
        };
        
        // Save to database
        await saveCosmicModel(model);
        
        updateCosmicProgress(100, 'Added to cosmic collection!');
        
        setTimeout(() => {
            showUploadStatus(false);
            resetURLForm();
            loadCosmicModels();
            loadAdminModels();
            showCosmicNotification('Cosmic URL added successfully!', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('URL addition failed:', error);
        showUploadStatus(false);
        showCosmicNotification('Failed to add URL: ' + error.message, 'error');
    }
}

// Validate GLB URL (lightweight check)
async function validateGLBURL(url) {
    try {
        // Quick check for .glb extension
        if (!url.toLowerCase().endsWith('.glb')) {
            return false;
        }
        
        // For mobile, do a lightweight check
        if (isMobile) {
            return true; // Assume valid for mobile to save bandwidth
        }
        
        // For desktop, do a HEAD request
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

// File Reader Helpers
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

// Save Cosmic Model
function saveCosmicModel(model) {
    return new Promise((resolve, reject) => {
        const transaction = cosmicDB.transaction([COSMIC_CONFIG.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(COSMIC_CONFIG.STORE_NAME);
        const request = store.add(model);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Load Cosmic Models
async function loadCosmicModels() {
    const models = await getAllCosmicModels();
    renderCosmicModels(models, elements.modelsGrid, false);
}

// Load Admin Models
async function loadAdminModels() {
    const models = await getAllCosmicModels();
    renderCosmicModels(models, elements.adminModelsGrid, true);
}

// Get All Cosmic Models
function getAllCosmicModels() {
    return new Promise((resolve, reject) => {
        const transaction = cosmicDB.transaction([COSMIC_CONFIG.STORE_NAME], 'readonly');
        const store = transaction.objectStore(COSMIC_CONFIG.STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// Render Cosmic Models
function renderCosmicModels(models, container, isAdminView) {
    container.innerHTML = '';
    
    if (!models || models.length === 0) {
        if (container === elements.modelsGrid) {
            elements.emptyState.style.display = 'block';
        }
        return;
    }
    
    if (container === elements.modelsGrid) {
        elements.emptyState.style.display = 'none';
    }
    
    // Sort by upload date (newest first)
    models.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    
    models.forEach((model, index) => {
        const card = createCosmicModelCard(model, isAdminView);
        card.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(card);
    });
}

// Create Cosmic Model Card
function createCosmicModelCard(model, isAdminView) {
    const card = document.createElement('div');
    card.className = `divine-card model-card animate__animated animate__fadeInUp`;
    
    // Determine thumbnail source
    let thumbnailSrc = '';
    if (model.thumbnail) {
        thumbnailSrc = model.thumbnail;
    } else if (model.thumbnailUrl) {
        thumbnailSrc = model.thumbnailUrl;
    }
    
    const previewHtml = thumbnailSrc ? 
        `<img src="${thumbnailSrc}" alt="${model.name}" class="model-thumbnail" loading="lazy">` :
        `<div class="model-placeholder"><i class="fas fa-cube"></i></div>`;
    
    const tags = model.tags || ['cosmic'];
    const tagsHtml = tags.slice(0, 3).map(tag => 
        `<span class="model-tag">${tag}</span>`
    ).join('');
    
    const fileSize = model.fileSize ? formatFileSize(model.fileSize) : 'Unknown';
    const uploadDate = new Date(model.uploadDate).toLocaleDateString();
    
    card.innerHTML = `
        <div class="model-preview">
            ${previewHtml}
            <div class="model-type-badge">
                ${model.type === 'url' ? '<i class="fas fa-globe"></i> URL' : '<i class="fas fa-upload"></i> Upload'}
            </div>
        </div>
        <div class="model-info">
            <h3 class="model-name">${model.name}</h3>
            <div class="model-meta">
                <span class="meta-item">
                    <i class="fas fa-calendar"></i>
                    ${uploadDate}
                </span>
                <span class="meta-item">
                    <i class="fas fa-weight"></i>
                    ${fileSize}
                </span>
            </div>
            <div class="model-tags">
                ${tagsHtml}
            </div>
            <div class="model-badge">
                <i class="fas fa-shield-alt"></i>
                Divine Protection
            </div>
        </div>
        <button class="divine-button cosmic-btn download-btn" data-id="${model.id}">
            <span class="btn-aura"></span>
            <i class="fas fa-download"></i>
            Download GLB
        </button>
        ${isAdminView ? `
            <button class="delete-btn" data-id="${model.id}" title="Delete from cosmos">
                <i class="fas fa-trash"></i>
            </button>
        ` : ''}
    `;
    
    // Add event listeners
    const downloadBtn = card.querySelector('.download-btn');
    downloadBtn.addEventListener('click', () => downloadCosmicModel(model));
    
    if (isAdminView) {
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteCosmicModel(model.id));
    }
    
    return card;
}

// Download Cosmic Model
async function downloadCosmicModel(model) {
    try {
        showCosmicNotification('Initiating cosmic download...', 'warning');
        
        if (model.type === 'url' && model.glbUrl) {
            // For URL models, open in new tab for mobile
            if (isMobile) {
                window.open(model.glbUrl, '_blank');
            } else {
                const link = document.createElement('a');
                link.href = model.glbUrl;
                link.download = model.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            
        } else if (model.glbData) {
            // For uploaded models
            const blob = new Blob([model.glbData], { type: 'model/gltf-binary' });
            const url = URL.createObjectURL(blob);
            
            if (isMobile) {
                // For mobile, open in new tab
                window.open(url, '_blank');
            } else {
                const link = document.createElement('a');
                link.href = url;
                link.download = model.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
        
        showCosmicNotification('Cosmic download initiated!', 'success');
        
    } catch (error) {
        console.error('Cosmic download failed:', error);
        showCosmicNotification('Download failed: ' + error.message, 'error');
    }
}

// Delete Cosmic Model
async function deleteCosmicModel(id) {
    if (!confirm('Remove this model from the cosmos?')) {
        return;
    }
    
    try {
        await deleteModelFromCosmos(id);
        await loadCosmicModels();
        await loadAdminModels();
        showCosmicNotification('Model removed from cosmos', 'warning');
    } catch (error) {
        console.error('Deletion failed:', error);
        showCosmicNotification('Failed to delete: ' + error.message, 'error');
    }
}

// Delete from Cosmos
function deleteModelFromCosmos(id) {
    return new Promise((resolve, reject) => {
        const transaction = cosmicDB.transaction([COSMIC_CONFIG.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(COSMIC_CONFIG.STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Format File Size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Show/Hide Upload Status
function showUploadStatus(show) {
    if (show) {
        elements.uploadStatus.style.display = 'block';
        elements.uploadStatus.style.opacity = '1';
    } else {
        elements.uploadStatus.style.opacity = '0';
        setTimeout(() => {
            elements.uploadStatus.style.display = 'none';
            elements.progressFill.style.width = '0%';
            elements.statusPercent.textContent = '0%';
        }, 300);
    }
}

// Update Cosmic Progress
function updateCosmicProgress(percent, text) {
    elements.progressFill.style.width = `${percent}%`;
    elements.statusText.textContent = text;
    elements.statusPercent.textContent = `${percent}%`;
}

// Cosmic Effects
function initCosmicEffects() {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .touch-active {
            transform: scale(0.98) !important;
            opacity: 0.9 !important;
        }
        
        .model-tag {
            display: inline-block;
            background: rgba(139, 92, 246, 0.2);
            color: var(--cosmic-primary);
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            margin: 2px;
        }
        
        .model-meta {
            display: flex;
            gap: 10px;
            margin: 8px 0;
            font-size: 0.8rem;
            color: rgba(255,255,255,0.6);
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .model-type-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            padding: 4px 8px;
            border-radius: 10px;
            font-size: 0.7rem;
            color: var(--cosmic-secondary);
        }
    `;
    document.head.appendChild(style);
}

// Animate Counters
function animateCounters() {
    const counters = document.querySelectorAll('.cosmic-count');
    
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.count);
        if (isNaN(target)) return;
        
        const increment = target / 50;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        // Start animation when in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

// Setup Scroll Animations
function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => observer.observe(el));
}

// Divine Particles
function initDivineParticles() {
    const canvas = document.getElementById('divineCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Clear existing particles
    divineParticles = [];
    
    // Create particles (fewer on mobile)
    const particleCount = isMobile ? COSMIC_CONFIG.PARTICLE_COUNT / 2 : COSMIC_CONFIG.PARTICLE_COUNT;
    
    for (let i = 0; i < particleCount; i++) {
        divineParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5,
            speedX: (Math.random() * 0.5 - 0.25) * (isMobile ? 0.5 : 1),
            speedY: (Math.random() * 0.5 - 0.25) * (isMobile ? 0.5 : 1),
            color: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.3 + 0.1})`
        });
    }
    
    // Animation loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        divineParticles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
            
            // Draw subtle glow
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = particle.color.replace(')', ', 0.1)').replace('rgb', 'rgba');
            ctx.fill();
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initDivineParticles(); // Reinitialize particles
    });
}

// Cosmic Notifications
function showCosmicNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer') || createNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' :
                 type === 'error' ? 'fa-times-circle' :
                 type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="notification-message">${message}</div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 4 seconds on mobile, 5 seconds on desktop
    const timeout = isMobile ? 4000 : 5000;
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, timeout);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.className = 'cosmic-notifications';
    document.body.appendChild(container);
    return container;
}

// Add sample data function
async function addSampleData() {
    const sampleModels = [
        {
            name: "Divine Krishna Statue",
            type: "url",
            glbUrl: "https://example.com/models/krishna.glb",
            thumbnailUrl: "https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?w=400&h=300&fit=crop",
            fileName: "divine_krishna.glb",
            uploadDate: new Date().toISOString(),
            tags: ["divine", "hindu", "statue", "sacred"],
            fileSize: 5242880,
            securitySignature: COSMIC_CONFIG.SECURITY_SIGNATURE
        },
        {
            name: "Cosmic Buddha",
            type: "url",
            glbUrl: "https://example.com/models/buddha.glb",
            thumbnailUrl: "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=400&h=300&fit=crop",
            fileName: "cosmic_buddha.glb",
            uploadDate: new Date().toISOString(),
            tags: ["buddha", "meditation", "peace", "sacred"],
            fileSize: 4194304,
            securitySignature: COSMIC_CONFIG.SECURITY_SIGNATURE
        },
        {
            name: "Sacred Mandala",
            type: "url",
            glbUrl: "https://example.com/models/mandala.glb",
            thumbnailUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h-300&fit=crop",
            fileName: "sacred_mandala.glb",
            uploadDate: new Date().toISOString(),
            tags: ["mandala", "meditation", "geometry", "sacred"],
            fileSize: 3145728,
            securitySignature: COSMIC_CONFIG.SECURITY_SIGNATURE
        }
    ];
    
    for (const model of sampleModels) {
        try {
            await saveCosmicModel(model);
        } catch (error) {
            console.error('Failed to add sample model:', error);
        }
    }
    
    // Refresh the display
    await loadCosmicModels();
    showCosmicNotification('Sample cosmic data added', 'success');
}

// Export for debugging
window.DivineCosmos = {
    config: COSMIC_CONFIG,
    db: () => cosmicDB,
    models: getAllCosmicModels,
    addSampleData: addSampleData,
    isMobile: () => isMobile
};

// Add sample data on first load (optional - uncomment if needed)
// setTimeout(() => {
//     getAllCosmicModels().then(models => {
//         if (models.length === 0) {
//             addSampleData();
//         }
//     });
// }, 2000);