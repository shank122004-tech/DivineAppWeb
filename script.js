// ==============================
// DIVINE COSMIC UNIVERSE - Complete Edition
// ==============================

// Cosmic Configuration
const COSMIC_CONFIG = {
    DB_NAME: 'DivineCosmosDB',
    DB_VERSION: 2,
    STORE_NAME: 'cosmic_models',
    ADMIN_PASSWORD: "Shashank@122004",
    SECURITY_SIGNATURE: "DM-9937-COSMIC-SECURE",
    
    // Cloudflare Worker Configuration
    CLOUDFLARE_WORKER_URL: "https://wispy-leaf-81cb.shank122004.workers.dev",
    CLOUDFLARE_ADMIN_SECRET: "DivineCosmosSecret2024",
    MODELS_JSON_URL: "https://wispy-leaf-81cb.shank122004.workers.dev/models.json",
    
    // Mobile settings
    MOBILE_BREAKPOINT: 768,
    PARTICLE_COUNT: 100,
    
    // Polling intervals
    POLL_INTERVAL: 10000,
    INITIAL_POLL_DELAY: 3000
};

// Global State
let cosmicDB = null;
let isDivineAdmin = false;
let isMobile = false;
let cloudflarePollingInterval = null;
let cloudflareModels = [];

// DOM Elements Cache
let elements = {};

// ==============================
// INITIALIZATION
// ==============================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Divine Cosmos Initializing...');
    
    try {
        // Cache DOM elements
        cacheElements();
        
        // Detect mobile
        detectMobile();
        
        // Initialize everything
        await initializeCosmos();
        setupEventListeners();
        initCosmicEffects();
        animateCounters();
        setupScrollAnimations();
        
        // Start Cloudflare polling
        setTimeout(() => {
            startCloudflarePolling();
        }, COSMIC_CONFIG.INITIAL_POLL_DELAY);
        
        // Show welcome
        setTimeout(() => {
            showCosmicNotification('Cosmic interface initialized', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('Cosmic initialization failed:', error);
        showCosmicNotification('Failed to initialize cosmos', 'error');
    }
});

function cacheElements() {
    elements = {
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
        addCloudflareBtn: document.getElementById('addCloudflareBtn'),
        refreshCloudflareBtn: document.getElementById('refreshCloudflareBtn'),
        modelName: document.getElementById('modelName'),
        urlModelName: document.getElementById('urlModelName'),
        cfModelName: document.getElementById('cfModelName'),
        modelThumbnail: document.getElementById('modelThumbnail'),
        modelFile: document.getElementById('modelFile'),
        glbUrl: document.getElementById('glbUrl'),
        cfGlbUrl: document.getElementById('cfGlbUrl'),
        thumbnailUrl: document.getElementById('thumbnailUrl'),
        cfThumbnailUrl: document.getElementById('cfThumbnailUrl'),
        modelTags: document.getElementById('modelTags'),
        cfModelTags: document.getElementById('cfModelTags'),
        syncToAll: document.getElementById('syncToAll'),
        cloudflareStatus: document.getElementById('cloudflareStatus'),
        cloudModelCount: document.getElementById('cloudModelCount'),
        uploadStatus: document.querySelector('.upload-status'),
        progressFill: document.querySelector('.progress-fill'),
        statusText: document.querySelector('.status-text'),
        statusPercent: document.querySelector('.status-percent'),
        portalCards: document.querySelectorAll('.portal-card'),
        portalContents: document.querySelectorAll('.portal-content'),
        exploreBtn: document.querySelector('.explore-btn'),
        modalCloseBtns: document.querySelectorAll('.divine-close, .close-modal')
    };
}

function detectMobile() {
    isMobile = window.innerWidth < COSMIC_CONFIG.MOBILE_BREAKPOINT;
    if (isMobile) {
        document.body.classList.add('mobile-device');
    } else {
        document.body.classList.remove('mobile-device');
    }
}

async function initializeCosmos() {
    await initCosmicDB();
    await fetchAndRenderAllModels();
}

// ==============================
// DATABASE FUNCTIONS
// ==============================

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
            
            if (!db.objectStoreNames.contains(COSMIC_CONFIG.STORE_NAME)) {
                const store = db.createObjectStore(COSMIC_CONFIG.STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                
                store.createIndex('name', 'name', { unique: false });
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('uploadDate', 'uploadDate', { unique: false });
                store.createIndex('tags', 'tags', { multiEntry: true });
                store.createIndex('source', 'source', { unique: false });
                store.createIndex('cloudflareId', 'cloudflareId', { unique: false });
            }
        };
    });
}

function saveCosmicModel(model) {
    return new Promise((resolve, reject) => {
        const transaction = cosmicDB.transaction([COSMIC_CONFIG.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(COSMIC_CONFIG.STORE_NAME);
        const request = store.add(model);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function updateCosmicModel(id, updates) {
    return new Promise((resolve, reject) => {
        const transaction = cosmicDB.transaction([COSMIC_CONFIG.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(COSMIC_CONFIG.STORE_NAME);
        
        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => {
            const existingModel = getRequest.result;
            const updatedModel = { ...existingModel, ...updates, id };
            
            const putRequest = store.put(updatedModel);
            putRequest.onsuccess = () => resolve(putRequest.result);
            putRequest.onerror = () => reject(putRequest.error);
        };
        
        getRequest.onerror = () => reject(getRequest.error);
    });
}

function deleteModelFromCosmos(id) {
    return new Promise((resolve, reject) => {
        const transaction = cosmicDB.transaction([COSMIC_CONFIG.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(COSMIC_CONFIG.STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function getAllCosmicModels() {
    return new Promise((resolve, reject) => {
        const transaction = cosmicDB.transaction([COSMIC_CONFIG.STORE_NAME], 'readonly');
        const store = transaction.objectStore(COSMIC_CONFIG.STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// ==============================
// EVENT LISTENERS
// ==============================

function setupEventListeners() {
    // Divine Access Button
    if (elements.adminAccessBtn) {
        elements.adminAccessBtn.addEventListener('click', () => {
            console.log('Divine Access clicked');
            elements.adminLoginModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                if (elements.adminPassword) elements.adminPassword.focus();
            }, 100);
        });
    }
    
    // Close Modal
    elements.modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Login
    if (elements.loginBtn) {
        elements.loginBtn.addEventListener('click', handleDivineLogin);
    }
    
    if (elements.adminPassword) {
        elements.adminPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleDivineLogin();
        });
    }
    
    // Logout
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleDivineLogout);
    }
    
    // Upload Model
    if (elements.uploadBtn) {
        elements.uploadBtn.addEventListener('click', handleCosmicUpload);
    }
    
    // Add by URL
    if (elements.addUrlBtn) {
        elements.addUrlBtn.addEventListener('click', handleAddByURL);
    }
    
    // Cloudflare Add
    if (elements.addCloudflareBtn) {
        elements.addCloudflareBtn.addEventListener('click', handleCloudflareAdd);
    }
    
    // Refresh Cloudflare
    if (elements.refreshCloudflareBtn) {
        elements.refreshCloudflareBtn.addEventListener('click', async () => {
            await fetchAndRenderAllModels();
            showCosmicNotification('Cloudflare models refreshed', 'success');
        });
    }
    
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
            closeModal();
        }
    });
    
    // Close Modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.adminLoginModal.style.display === 'block') {
                closeModal();
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        detectMobile();
        if (window.innerWidth !== window.innerHeight) {
            initDivineParticles();
        }
    });
}

function closeModal() {
    if (elements.adminLoginModal) {
        elements.adminLoginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetLoginForm();
    }
}

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

// ==============================
// AUTHENTICATION HANDLERS
// ==============================

function handleDivineLogin() {
    const password = elements.adminPassword.value.trim();
    
    if (password === COSMIC_CONFIG.ADMIN_PASSWORD) {
        isDivineAdmin = true;
        
        elements.adminLoginModal.style.opacity = '0';
        setTimeout(() => {
            elements.adminLoginModal.style.display = 'none';
            elements.adminPanel.style.display = 'block';
            elements.mainWebsite.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            loadAdminModels();
            updateCloudflareStatus();
            
            showCosmicNotification('Welcome to Divine Administration Portal', 'success');
            
            if (isMobile) {
                document.body.classList.add('admin-mode');
            }
        }, 300);
        
        resetLoginForm();
    } else {
        elements.loginError.textContent = 'Invalid cosmic passcode';
        elements.loginError.style.opacity = '1';
        
        elements.adminPassword.style.animation = 'shake 0.5s';
        setTimeout(() => {
            elements.adminPassword.style.animation = '';
        }, 500);
    }
}

function handleDivineLogout() {
    isDivineAdmin = false;
    
    elements.adminPanel.style.opacity = '0';
    setTimeout(() => {
        elements.adminPanel.style.display = 'none';
        elements.mainWebsite.style.display = 'block';
        elements.adminPanel.style.opacity = '1';
        
        if (isMobile) {
            document.body.classList.remove('admin-mode');
        }
        
        showCosmicNotification('Returned to cosmic website', 'warning');
    }, 300);
    
    resetUploadForm();
    resetURLForm();
    resetCloudflareForm();
}

function resetLoginForm() {
    if (elements.adminPassword) elements.adminPassword.value = '';
    if (elements.loginError) {
        elements.loginError.textContent = '';
        elements.loginError.style.opacity = '0';
    }
}

function resetUploadForm() {
    if (elements.modelName) elements.modelName.value = '';
    if (elements.modelThumbnail) elements.modelThumbnail.value = '';
    if (elements.modelFile) elements.modelFile.value = '';
    
    const uploadAreas = document.querySelectorAll('.upload-area span');
    uploadAreas.forEach(area => {
        if (!area.querySelector('i')) {
            area.textContent = 'Drop or select file';
        }
    });
}

function resetURLForm() {
    if (elements.urlModelName) elements.urlModelName.value = '';
    if (elements.glbUrl) elements.glbUrl.value = '';
    if (elements.thumbnailUrl) elements.thumbnailUrl.value = '';
    if (elements.modelTags) elements.modelTags.value = '';
}

function resetCloudflareForm() {
    if (elements.cfModelName) elements.cfModelName.value = '';
    if (elements.cfGlbUrl) elements.cfGlbUrl.value = '';
    if (elements.cfThumbnailUrl) elements.cfThumbnailUrl.value = '';
    if (elements.cfModelTags) elements.cfModelTags.value = '';
    if (elements.syncToAll) elements.syncToAll.checked = true;
}

// ==============================
// UPLOAD HANDLERS - MODIFIED TO SYNC TO ALL USERS
// ==============================

async function handleCosmicUpload() {
    const name = elements.modelName.value.trim();
    const thumbnailFile = elements.modelThumbnail.files[0];
    const glbFile = elements.modelFile.files[0];
    
    if (!name || !thumbnailFile || !glbFile) {
        showCosmicNotification('Please fill all cosmic fields', 'error');
        return;
    }
    
    if (isMobile) {
        const maxSize = 50 * 1024 * 1024;
        if (glbFile.size > maxSize) {
            showCosmicNotification('File too large for mobile upload (max 50MB)', 'error');
            return;
        }
    }
    
    try {
        showUploadStatus(true);
        updateCosmicProgress(10, 'Initializing cosmic transfer...');
        
        const thumbnail = await readFileAsDataURL(thumbnailFile);
        
        updateCosmicProgress(40, 'Processing divine model...');
        
        const glbData = await readFileAsArrayBuffer(glbFile);
        
        updateCosmicProgress(80, 'Storing in cosmic database...');
        
        const model = {
            name,
            thumbnail,
            glbData: new Uint8Array(glbData),
            fileName: `${name.replace(/\s+/g, '_').toLowerCase()}_divine.glb`,
            type: 'upload',
            source: 'local',
            uploadDate: new Date().toISOString(),
            tags: ['divine', 'cosmic', 'uploaded'],
            fileSize: glbFile.size,
            securitySignature: COSMIC_CONFIG.SECURITY_SIGNATURE
        };
        
        // First save locally
        const localId = await saveCosmicModel(model);
        
        // Now sync to Cloudflare for all users
        updateCosmicProgress(90, 'Syncing to all users...');
        
        // Convert file to base64 for Cloudflare storage
        const reader = new FileReader();
        reader.readAsDataURL(glbFile);
        
        reader.onload = async () => {
            try {
                const cloudflareModel = {
                    name: model.name,
                    glbData: reader.result.split(',')[1], // Remove data URL prefix
                    thumbnail: model.thumbnail,
                    fileName: model.fileName,
                    type: 'upload',
                    source: 'cloudflare',
                    uploadDate: model.uploadDate,
                    tags: model.tags,
                    fileSize: model.fileSize,
                    securitySignature: COSMIC_CONFIG.SECURITY_SIGNATURE
                };
                
                // Upload to Cloudflare
                const cloudflareId = await uploadToCloudflare(cloudflareModel);
                
                // Update local model with cloudflareId
                await updateCosmicModel(localId, { cloudflareId });
                
                updateCosmicProgress(100, 'Cosmic sync complete!');
                
                setTimeout(() => {
                    resetUploadForm();
                    showUploadStatus(false);
                    fetchAndRenderAllModels();
                    loadAdminModels();
                    showCosmicNotification('Model uploaded and shared with all users!', 'success');
                }, 1000);
                
            } catch (error) {
                console.error('Cloudflare sync failed:', error);
                updateCosmicProgress(100, 'Local upload complete');
                setTimeout(() => {
                    resetUploadForm();
                    showUploadStatus(false);
                    fetchAndRenderAllModels();
                    loadAdminModels();
                    showCosmicNotification('Uploaded locally (Cloudflare sync failed)', 'warning');
                }, 1000);
            }
        };
        
    } catch (error) {
        console.error('Cosmic upload failed:', error);
        showUploadStatus(false);
        showCosmicNotification('Upload failed: ' + error.message, 'error');
    }
}

async function handleAddByURL() {
    const name = elements.urlModelName.value.trim();
    const glbUrl = elements.glbUrl.value.trim();
    const thumbnailUrl = elements.thumbnailUrl.value.trim();
    const tags = elements.modelTags.value.split(',').map(t => t.trim()).filter(t => t);
    
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
        
        const isValid = await validateGLBURL(glbUrl);
        if (!isValid) {
            throw new Error('URL does not point to valid GLB file');
        }
        
        updateCosmicProgress(80, 'Adding to cosmic library...');
        
        const model = {
            name,
            glbUrl,
            thumbnailUrl: thumbnailUrl || null,
            fileName: glbUrl.split('/').pop() || `${name}.glb`,
            type: 'url',
            source: 'external',
            uploadDate: new Date().toISOString(),
            tags: ['url', 'cosmic', ...tags],
            fileSize: 0,
            securitySignature: COSMIC_CONFIG.SECURITY_SIGNATURE
        };
        
        // Save locally
        const localId = await saveCosmicModel(model);
        
        // Also sync to Cloudflare for all users
        updateCosmicProgress(90, 'Syncing to all users...');
        
        const cloudflareModel = {
            ...model,
            source: 'cloudflare'
        };
        
        const cloudflareId = await syncURLToCloudflare(cloudflareModel);
        
        // Update local model with cloudflareId
        await updateCosmicModel(localId, { cloudflareId });
        
        updateCosmicProgress(100, 'Added and synced to all users!');
        
        setTimeout(() => {
            showUploadStatus(false);
            resetURLForm();
            fetchAndRenderAllModels();
            loadAdminModels();
            showCosmicNotification('Cosmic URL added and shared with all users!', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('URL addition failed:', error);
        showUploadStatus(false);
        showCosmicNotification('Failed to add URL: ' + error.message, 'error');
    }
}

async function handleCloudflareAdd() {
    const name = elements.cfModelName.value.trim();
    const glbUrl = elements.cfGlbUrl.value.trim();
    const thumbnailUrl = elements.cfThumbnailUrl.value.trim();
    const tags = elements.cfModelTags.value.split(',').map(t => t.trim()).filter(t => t);
    const syncToAll = elements.syncToAll.checked;
    
    if (!name || !glbUrl) {
        showCosmicNotification('Please provide name and GLB URL', 'error');
        return;
    }
    
    if (!isLikelyGlbUrl(glbUrl)) {
        showCosmicNotification('URL does not appear to be a GLB file', 'error');
        return;
    }
    
    try {
        showUploadStatus(true);
        updateCosmicProgress(20, 'Validating Cloudflare URL...');
        
        const isValid = await probeUrlHEAD(glbUrl);
        if (!isValid) {
            throw new Error('GLB URL validation failed');
        }
        
        updateCosmicProgress(50, 'Building cosmic model...');
        
        const model = buildModelFromInputs(name, glbUrl, thumbnailUrl, tags);
        
        updateCosmicProgress(80, 'Saving locally...');
        
        const localId = await saveCosmicModel(model);
        
        if (syncToAll) {
            updateCosmicProgress(90, 'Syncing to all users...');
            
            const cloudId = await syncURLToCloudflare(model);
            
            model.cloudflareId = cloudId;
            await updateCosmicModel(localId, model);
        }
        
        updateCosmicProgress(100, 'Cosmic sync complete!');
        
        setTimeout(() => {
            showUploadStatus(false);
            resetCloudflareForm();
            fetchAndRenderAllModels();
            loadAdminModels();
            
            if (syncToAll) {
                showCosmicNotification('Model synced to all users via Cloudflare!', 'success');
            } else {
                showCosmicNotification('Model added locally', 'success');
            }
        }, 1000);
        
    } catch (error) {
        console.error('Cloudflare addition failed:', error);
        showUploadStatus(false);
        showCosmicNotification('Failed to sync: ' + error.message, 'error');
    }
}

// ==============================
// CLOUDFLARE FUNCTIONS
// ==============================

async function uploadToCloudflare(model) {
    try {
        const response = await fetch(`${COSMIC_CONFIG.CLOUDFLARE_WORKER_URL}/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-secret': COSMIC_CONFIG.CLOUDFLARE_ADMIN_SECRET
            },
            body: JSON.stringify(model)
        });
        
        if (!response.ok) {
            throw new Error(`Worker responded with ${response.status}`);
        }
        
        const result = await response.json();
        return result.id || Date.now().toString();
        
    } catch (error) {
        console.warn('Cloudflare upload failed:', error);
        throw error;
    }
}

async function syncURLToCloudflare(model) {
    try {
        const response = await fetch(`${COSMIC_CONFIG.CLOUDFLARE_WORKER_URL}/sync-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-secret': COSMIC_CONFIG.CLOUDFLARE_ADMIN_SECRET
            },
            body: JSON.stringify(model)
        });
        
        if (!response.ok) {
            throw new Error(`Worker responded with ${response.status}`);
        }
        
        const result = await response.json();
        return result.id || Date.now().toString();
        
    } catch (error) {
        console.warn('Cloudflare URL sync failed:', error);
        throw error;
    }
}

function isLikelyGlbUrl(url) {
    const glbExtensions = ['.glb', '.gltf'];
    const urlLower = url.toLowerCase();
    return glbExtensions.some(ext => urlLower.includes(ext)) || 
           urlLower.includes('glb') || 
           urlLower.includes('model/gltf-binary');
}

async function probeUrlHEAD(url) {
    try {
        if (isMobile) {
            return true;
        }
        
        const response = await fetch(url, { 
            method: 'HEAD',
            mode: 'no-cors'
        });
        
        return true;
    } catch {
        return url.startsWith('http') && url.includes('://');
    }
}

function buildModelFromInputs(name, glbUrl, thumbnailUrl, tags) {
    return {
        name,
        glbUrl,
        thumbnailUrl: thumbnailUrl || `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=400&h=300&fit=crop`,
        fileName: glbUrl.split('/').pop() || `${name.replace(/\s+/g, '_').toLowerCase()}.glb`,
        type: 'url',
        source: 'cloudflare',
        uploadDate: new Date().toISOString(),
        tags: ['cloudflare', 'dynamic', ...tags],
        fileSize: 0,
        securitySignature: COSMIC_CONFIG.SECURITY_SIGNATURE,
        syncDate: new Date().toISOString()
    };
}

async function fetchAndRenderAllModels() {
    try {
        const [localModels, cloudflareModels] = await Promise.all([
            getAllCosmicModels(),
            fetchCloudflareModels()
        ]);
        
        this.cloudflareModels = cloudflareModels;
        
        const mergedModels = mergeModels(localModels, cloudflareModels);
        
        renderCosmicModels(mergedModels, elements.modelsGrid, false);
        
        if (isDivineAdmin && elements.adminModelsGrid) {
            renderCosmicModels(mergedModels, elements.adminModelsGrid, true);
        }
        
        updateCloudflareStatus();
        
        return mergedModels;
        
    } catch (error) {
        console.error('Failed to fetch and render models:', error);
        
        // Fallback: just show local models
        const localModels = await getAllCosmicModels();
        renderCosmicModels(localModels, elements.modelsGrid, false);
        
        if (isDivineAdmin && elements.adminModelsGrid) {
            renderCosmicModels(localModels, elements.adminModelsGrid, true);
        }
        
        return localModels;
    }
}

async function fetchCloudflareModels() {
    try {
        const response = await fetch(COSMIC_CONFIG.MODELS_JSON_URL, {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch models.json: ${response.status}`);
        }
        
        const models = await response.json();
        return Array.isArray(models) ? models : [];
        
    } catch (error) {
        console.warn('Failed to fetch Cloudflare models:', error);
        return [];
    }
}

function mergeModels(localModels, cloudflareModels) {
    const mergedModels = [...localModels];
    
    cloudflareModels.forEach(cloudModel => {
        const existingIndex = mergedModels.findIndex(m => 
            m.name === cloudModel.name || 
            (m.cloudflareId && m.cloudflareId === cloudModel.id)
        );
        
        if (existingIndex >= 0) {
            mergedModels[existingIndex] = {
                ...mergedModels[existingIndex],
                ...cloudModel,
                source: 'cloudflare',
                updatedFromCloud: true
            };
        } else {
            mergedModels.push({
                ...cloudModel,
                source: 'cloudflare'
            });
        }
    });
    
    mergedModels.sort((a, b) => 
        new Date(b.uploadDate || b.syncDate) - new Date(a.uploadDate || a.syncDate)
    );
    
    return mergedModels;
}

function startCloudflarePolling() {
    if (cloudflarePollingInterval) {
        clearInterval(cloudflarePollingInterval);
    }
    
    fetchAndRenderAllModels();
    
    cloudflarePollingInterval = setInterval(() => {
        fetchAndRenderAllModels();
    }, COSMIC_CONFIG.POLL_INTERVAL);
}

function updateCloudflareStatus() {
    if (elements.cloudModelCount) {
        elements.cloudModelCount.textContent = cloudflareModels.length;
    }
}

// ==============================
// MODEL MANAGEMENT
// ==============================

function renderCosmicModels(models, container, isAdminView) {
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!models || models.length === 0) {
        if (container === elements.modelsGrid && elements.emptyState) {
            elements.emptyState.style.display = 'block';
        }
        return;
    }
    
    if (container === elements.modelsGrid && elements.emptyState) {
        elements.emptyState.style.display = 'none';
    }
    
    models.forEach((model, index) => {
        const card = createCosmicModelCard(model, isAdminView);
        card.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(card);
    });
}

function createCosmicModelCard(model, isAdminView) {
    const card = document.createElement('div');
    card.className = `divine-card model-card animate__animated animate__fadeInUp`;
    
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
    const uploadDate = new Date(model.uploadDate || model.syncDate).toLocaleDateString();
    
    let sourceBadge = '';
    if (model.source === 'cloudflare') {
        sourceBadge = '<div class="model-source-badge cloudflare-badge"><i class="fas fa-cloud"></i> Cloudflare</div>';
    } else if (model.source === 'external') {
        sourceBadge = '<div class="model-source-badge"><i class="fas fa-globe"></i> URL</div>';
    } else {
        sourceBadge = '<div class="model-source-badge"><i class="fas fa-upload"></i> Local</div>';
    }
    
    card.innerHTML = `
        <div class="model-preview">
            ${previewHtml}
            <div class="model-type-badge">
                ${sourceBadge}
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
                ${model.source === 'cloudflare' ? '<span class="meta-item"><i class="fas fa-sync-alt"></i> Live</span>' : ''}
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
    
    const downloadBtn = card.querySelector('.download-btn');
    downloadBtn.addEventListener('click', () => downloadCosmicModel(model));
    
    if (isAdminView) {
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteCosmicModel(model.id, model.cloudflareId));
    }
    
    return card;
}

async function downloadCosmicModel(model) {
    try {
        showCosmicNotification('Initiating cosmic download...', 'warning');
        
        let downloadUrl = null;
        
        if (model.type === 'url' && model.glbUrl) {
            downloadUrl = model.glbUrl;
        } else if (model.glbData && model.cloudflareId) {
            // Try to download from Cloudflare first
            try {
                const response = await fetch(`${COSMIC_CONFIG.CLOUDFLARE_WORKER_URL}/download/${model.cloudflareId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.glbUrl) {
                        downloadUrl = data.glbUrl;
                    }
                }
            } catch (error) {
                console.warn('Failed to get Cloudflare download URL:', error);
            }
        }
        
        if (!downloadUrl && model.glbData) {
            // Fallback to local download
            const blob = new Blob([model.glbData], { type: 'model/gltf-binary' });
            const url = URL.createObjectURL(blob);
            downloadUrl = url;
        }
        
        if (downloadUrl) {
            if (isMobile) {
                window.open(downloadUrl, '_blank');
            } else {
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = model.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            
            // Clean up blob URL if we created one
            if (downloadUrl.startsWith('blob:')) {
                setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
            }
            
            showCosmicNotification('Cosmic download initiated!', 'success');
        } else {
            throw new Error('No download source available');
        }
        
    } catch (error) {
        console.error('Cosmic download failed:', error);
        showCosmicNotification('Download failed: ' + error.message, 'error');
    }
}

async function deleteCosmicModel(id, cloudflareId = null) {
    if (!confirm('Remove this model from the cosmos?')) {
        return;
    }
    
    try {
        // Delete from local database
        await deleteModelFromCosmos(id);
        
        // Also delete from Cloudflare if it has a cloudflareId
        if (cloudflareId) {
            try {
                await fetch(`${COSMIC_CONFIG.CLOUDFLARE_WORKER_URL}/delete/${cloudflareId}`, {
                    method: 'DELETE',
                    headers: {
                        'x-admin-secret': COSMIC_CONFIG.CLOUDFLARE_ADMIN_SECRET
                    }
                });
            } catch (error) {
                console.warn('Failed to delete from Cloudflare:', error);
            }
        }
        
        await fetchAndRenderAllModels();
        showCosmicNotification('Model removed from cosmos', 'warning');
    } catch (error) {
        console.error('Deletion failed:', error);
        showCosmicNotification('Failed to delete: ' + error.message, 'error');
    }
}

async function loadAdminModels() {
    const models = await getAllCosmicModels();
    const mergedModels = mergeModels(models, cloudflareModels);
    renderCosmicModels(mergedModels, elements.adminModelsGrid, true);
}

// ==============================
// UTILITY FUNCTIONS
// ==============================

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

async function validateGLBURL(url) {
    try {
        if (!url.toLowerCase().endsWith('.glb')) {
            return false;
        }
        
        if (isMobile) {
            return true;
        }
        
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function showUploadStatus(show) {
    if (!elements.uploadStatus) return;
    
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

function updateCosmicProgress(percent, text) {
    if (!elements.progressFill || !elements.statusText || !elements.statusPercent) return;
    
    elements.progressFill.style.width = `${percent}%`;
    elements.statusText.textContent = text;
    elements.statusPercent.textContent = `${percent}%`;
}

function switchPortal(portalId) {
    elements.portalCards.forEach(card => {
        card.classList.remove('active');
        if (card.dataset.portal === portalId) {
            card.classList.add('active');
        }
    });
    
    elements.portalContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${portalId}Portal`) {
            content.classList.add('active');
        }
    });
    
    if (portalId === 'manage') {
        loadAdminModels();
    }
    
    if (portalId === 'cloudflare') {
        updateCloudflareStatus();
    }
}

// ==============================
// COSMIC EFFECTS & ANIMATIONS
// ==============================

function initCosmicEffects() {
    initDivineParticles();
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
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
        }
        
        .model-source-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            color: var(--cosmic-secondary);
        }
        
        .cloudflare-badge {
            color: var(--cloudflare-orange);
        }
        
        .model-source-badge i {
            font-size: 0.8rem;
        }
        
        .btn-sparkles {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            gap: 2px;
            opacity: 0;
        }
        
        .divine-button:hover .btn-sparkles {
            opacity: 1;
            animation: sparkle 0.6s ease;
        }
        
        @keyframes sparkle {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
        }
    `;
    document.head.appendChild(style);
}

function initDivineParticles() {
    const canvas = document.getElementById('divineCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = isMobile ? COSMIC_CONFIG.PARTICLE_COUNT / 2 : COSMIC_CONFIG.PARTICLE_COUNT;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5,
            speedX: (Math.random() * 0.5 - 0.25) * (isMobile ? 0.5 : 1),
            speedY: (Math.random() * 0.5 - 0.25) * (isMobile ? 0.5 : 1),
            color: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.3 + 0.1})`
        });
    }
    
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = particle.color.replace(')', ', 0.1)').replace('rgb', 'rgba');
            ctx.fill();
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

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

// ==============================
// NOTIFICATIONS
// ==============================

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
    
    const timeout = isMobile ? 4000 : 5000;
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, timeout);
    
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

// ==============================
// EXPORT FOR DEBUGGING
// ==============================

window.DivineCosmos = {
    config: COSMIC_CONFIG,
    db: () => cosmicDB,
    models: getAllCosmicModels,
    cloudflareModels: () => cloudflareModels,
    isMobile: () => isMobile,
    fetchCloudflareModels: fetchAndRenderAllModels,
    showNotification: showCosmicNotification
};

// ==============================
// SAMPLE DATA (Optional)
// ==============================

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
            thumbnailUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop",
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
            // Also sync to Cloudflare for all users
            await syncURLToCloudflare(model);
        } catch (error) {
            console.error('Failed to add sample model:', error);
        }
    }
    
    await fetchAndRenderAllModels();
    showCosmicNotification('Sample cosmic data added and shared with all users', 'success');
}

// Uncomment to add sample data on first load
// setTimeout(() => {
//     getAllCosmicModels().then(models => {
//         if (models.length === 0) {
//             addSampleData();
//         }
//     });
// }, 2000);

console.log('✨ Divine Cosmos Script Loaded Successfully!');
