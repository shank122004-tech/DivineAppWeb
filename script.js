// ==============================
// DIVINE COSMIC UNIVERSE - Complete Edition
// GitHub Hosted GLB Models System
// ==============================

// Divine Configuration
const DIVINE_CONFIG = {
    DB_NAME: 'DivineCosmosDB',
    DB_VERSION: 2,
    STORE_NAME: 'divine_models',
    ADMIN_PASSWORD: "Shashank@122004",
    SECURITY_SIGNATURE: "DM-9937-COSMIC-SECURE",
    
    // GitHub Configuration
    GITHUB_USERNAME: "shank122004-tech",
    GITHUB_REPO: "DivineAppWeb",
    MODELS_JSON_URL: "https://shank122004-tech.github.io/DivineAppWeb/models.json",
    
    // Mobile settings
    MOBILE_BREAKPOINT: 768,
    PARTICLE_COUNT: 150,
    
    // Sample models for first-time visitors
    SAMPLE_MODELS: [
        {
            id: 1,
            name: "Sacred Krishna Statue",
            type: "github",
            source: "github",
            glbUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
            thumbnailUrl: "https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?w=400&h=300&fit=crop",
            fileName: "sacred_krishna.glb",
            uploadDate: new Date().toISOString(),
            tags: ["divine", "hindu", "krishna", "sacred"],
            fileSize: 5242880,
            description: "A divine statue of Lord Krishna playing flute",
            securitySignature: "DM-9937-COSMIC-SECURE"
        },
        {
            id: 2,
            name: "Cosmic Buddha",
            type: "github",
            source: "github",
            glbUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
            thumbnailUrl: "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=400&h=300&fit=crop",
            fileName: "cosmic_buddha.glb",
            uploadDate: new Date().toISOString(),
            tags: ["buddha", "meditation", "peace", "sacred"],
            fileSize: 4194304,
            description: "Meditating Buddha statue for spiritual visualization",
            securitySignature: "DM-9937-COSMIC-SECURE"
        },
        {
            id: 3,
            name: "Divine Lotus Mandala",
            type: "github",
            source: "github",
            glbUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
            thumbnailUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop",
            fileName: "lotus_mandala.glb",
            uploadDate: new Date().toISOString(),
            tags: ["mandala", "lotus", "meditation", "geometry"],
            fileSize: 3145728,
            description: "Sacred geometric pattern for meditation",
            securitySignature: "DM-9937-COSMIC-SECURE"
        },
        {
            id: 4,
            name: "Shiva Nataraja",
            type: "github",
            source: "github",
            glbUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
            thumbnailUrl: "https://images.unsplash.com/photo-1604617880299-c9c2f8a8f8b5?w=400&h=300&fit=crop",
            fileName: "shiva_nataraja.glb",
            uploadDate: new Date().toISOString(),
            tags: ["shiva", "hindu", "dance", "sacred"],
            fileSize: 6291456,
            description: "Lord Shiva as the cosmic dancer Nataraja",
            securitySignature: "DM-9937-COSMIC-SECURE"
        },
        {
            id: 5,
            name: "Golden Buddha",
            type: "github",
            source: "github",
            glbUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
            thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
            fileName: "golden_buddha.glb",
            uploadDate: new Date().toISOString(),
            tags: ["buddha", "gold", "meditation", "peace"],
            fileSize: 7340032,
            description: "Golden Buddha statue for meditation and peace",
            securitySignature: "DM-9937-COSMIC-SECURE"
        }
    ]
};

// Global State
let divineDB = null;
let isDivineAdmin = false;
let isMobile = false;
let allModels = [];
let filteredModels = [];

// DOM Elements Cache
let elements = {};

// ==============================
// INITIALIZATION
// ==============================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Divine Cosmos Initializing...');
    
    try {
        // Show loading overlay
        showLoading(true);
        
        // Cache DOM elements
        cacheElements();
        
        // Detect mobile
        detectMobile();
        
        // Initialize everything
        await initializeDivineCosmos();
        setupEventListeners();
        initCosmicEffects();
        animateCounters();
        setupScrollAnimations();
        
        // Load and render all models
        await loadAndRenderModels();
        
        // Hide loading overlay
        setTimeout(() => {
            showLoading(false);
            showNotification('🌟 Divine Cosmos Ready', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('Cosmic initialization failed:', error);
        showNotification('Failed to initialize cosmos', 'error');
        showLoading(false);
    }
});

function cacheElements() {
    elements = {
        // Main Website
        mainWebsite: document.getElementById('mainWebsite'),
        adminAccessBtn: document.getElementById('adminAccessBtn'),
        exploreBtn: document.querySelector('.explore-btn'),
        requestManifestationBtn: document.getElementById('requestManifestationBtn'),
        
        // Modals
        adminLoginModal: document.getElementById('adminLoginModal'),
        modelPreviewModal: document.getElementById('modelPreviewModal'),
        
        // Login Elements
        adminPassword: document.getElementById('adminPassword'),
        loginBtn: document.getElementById('loginBtn'),
        logoutBtn: document.getElementById('logoutBtn'),
        loginError: document.getElementById('loginError'),
        
        // Admin Panel
        adminPanel: document.getElementById('adminPanel'),
        
        // Model Grids
        modelsGrid: document.getElementById('modelsGrid'),
        adminModelsGrid: document.getElementById('adminModelsGrid'),
        emptyState: document.getElementById('emptyState'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        totalModelsCount: document.getElementById('totalModelsCount'),
        
        // Upload Portal
        modelName: document.getElementById('modelName'),
        modelThumbnail: document.getElementById('modelThumbnail'),
        modelFile: document.getElementById('modelFile'),
        modelTags: document.getElementById('modelTags'),
        modelDescription: document.getElementById('modelDescription'),
        uploadBtn: document.getElementById('uploadBtn'),
        
        // GitHub Portal
        githubModelName: document.getElementById('githubModelName'),
        githubGlbUrl: document.getElementById('githubGlbUrl'),
        githubThumbnailUrl: document.getElementById('githubThumbnailUrl'),
        githubModelTags: document.getElementById('githubModelTags'),
        convertToGhPages: document.getElementById('convertToGhPages'),
        validateGithubUrlBtn: document.getElementById('validateGithubUrlBtn'),
        addGithubUrlBtn: document.getElementById('addGithubUrlBtn'),
        githubValidationResult: document.getElementById('githubValidationResult'),
        
        // Management Portal
        modelSearch: document.getElementById('modelSearch'),
        searchModels: document.getElementById('searchModels'),
        filterBtns: document.querySelectorAll('.filter-btn'),
        filterTags: document.querySelectorAll('.filter-tag'),
        
        // Model Preview
        previewModelName: document.getElementById('previewModelName'),
        modelViewer: document.getElementById('modelViewer'),
        previewModelSource: document.getElementById('previewModelSource'),
        previewModelUrl: document.getElementById('previewModelUrl'),
        previewModelDate: document.getElementById('previewModelDate'),
        previewModelTags: document.getElementById('previewModelTags'),
        previewModelDesc: document.getElementById('previewModelDesc'),
        downloadPreviewBtn: document.getElementById('downloadPreviewBtn'),
        closePreviewBtn: document.querySelector('.close-preview-btn'),
        
        // Upload Status
        uploadStatus: document.querySelector('.upload-status'),
        progressFill: document.querySelector('.progress-fill'),
        statusText: document.querySelector('.status-text'),
        statusPercent: document.querySelector('.status-percent'),
        
        // Portal Navigation
        portalCards: document.querySelectorAll('.portal-card'),
        portalContents: document.querySelectorAll('.portal-content'),
        
        // Close Buttons
        closeModalBtns: document.querySelectorAll('.close-modal, .divine-close'),
        
        // Statistics
        totalDownloads: document.getElementById('totalDownloads'),
        todayDownloads: document.getElementById('todayDownloads'),
        popularModel: document.getElementById('popularModel')
    };
}

function detectMobile() {
    isMobile = window.innerWidth < DIVINE_CONFIG.MOBILE_BREAKPOINT;
    document.body.classList.toggle('mobile-device', isMobile);
}

async function initializeDivineCosmos() {
    await initDivineDB();
    setupDragAndDrop();
}

// ==============================
// DATABASE FUNCTIONS
// ==============================

function initDivineDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DIVINE_CONFIG.DB_NAME, DIVINE_CONFIG.DB_VERSION);
        
        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            divineDB = request.result;
            console.log('✅ Divine Database initialized');
            resolve();
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(DIVINE_CONFIG.STORE_NAME)) {
                const store = db.createObjectStore(DIVINE_CONFIG.STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                
                // Create indexes
                store.createIndex('name', 'name', { unique: false });
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('source', 'source', { unique: false });
                store.createIndex('uploadDate', 'uploadDate', { unique: false });
                store.createIndex('tags', 'tags', { multiEntry: true });
                
                console.log('✅ Created object store:', DIVINE_CONFIG.STORE_NAME);
            }
        };
        
        request.onblocked = () => {
            console.warn('IndexedDB open blocked; close other tabs using site.');
        };
    });
}

function saveModel(model) {
    return new Promise((resolve, reject) => {
        if (!divineDB) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const transaction = divineDB.transaction([DIVINE_CONFIG.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(DIVINE_CONFIG.STORE_NAME);
        const request = store.add(model);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function updateModel(id, updates) {
    return new Promise((resolve, reject) => {
        if (!divineDB) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const transaction = divineDB.transaction([DIVINE_CONFIG.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(DIVINE_CONFIG.STORE_NAME);
        
        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => {
            const existingModel = getRequest.result;
            if (!existingModel) {
                reject(new Error('Model not found'));
                return;
            }
            
            const updatedModel = { ...existingModel, ...updates, id };
            const putRequest = store.put(updatedModel);
            
            putRequest.onsuccess = () => resolve(putRequest.result);
            putRequest.onerror = () => reject(putRequest.error);
        };
        
        getRequest.onerror = () => reject(getRequest.error);
    });
}

function deleteModel(id) {
    return new Promise((resolve, reject) => {
        if (!divineDB) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const transaction = divineDB.transaction([DIVINE_CONFIG.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(DIVINE_CONFIG.STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function getAllModels() {
    return new Promise((resolve, reject) => {
        if (!divineDB) {
            resolve([]);
            return;
        }
        
        const transaction = divineDB.transaction([DIVINE_CONFIG.STORE_NAME], 'readonly');
        const store = transaction.objectStore(DIVINE_CONFIG.STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// ==============================
// MODEL MANAGEMENT
// ==============================

async function loadAndRenderModels() {
    try {
        // Show loading spinner
        if (elements.loadingSpinner) {
            elements.loadingSpinner.style.display = 'block';
        }
        
        // Load models from multiple sources
        const [localModels, remoteModels] = await Promise.all([
            getAllModels(),
            loadRemoteModels()
        ]);
        
        // Merge models (remote models take precedence)
        const mergedModels = mergeModels(remoteModels, localModels);
        
        // If no models, add sample models
        if (mergedModels.length === 0) {
            for (const model of DIVINE_CONFIG.SAMPLE_MODELS) {
                await saveModel(model);
            }
            allModels = DIVINE_CONFIG.SAMPLE_MODELS;
        } else {
            allModels = mergedModels;
        }
        
        filteredModels = [...allModels];
        
        // Update stats
        updateModelCount(allModels.length);
        
        // Render models
        renderModels(allModels, elements.modelsGrid, false);
        
        // Update admin grid if in admin mode
        if (isDivineAdmin) {
            renderModels(allModels, elements.adminModelsGrid, true);
            if (elements.totalModelsCount) {
                elements.totalModelsCount.textContent = allModels.length;
            }
        }
        
        // Hide loading spinner
        if (elements.loadingSpinner) {
            elements.loadingSpinner.style.display = 'none';
        }
        
        // Show/hide empty state
        if (elements.emptyState) {
            elements.emptyState.style.display = allModels.length === 0 ? 'block' : 'none';
        }
        
    } catch (error) {
        console.error('Failed to load models:', error);
        showNotification('Failed to load divine models', 'error');
        
        if (elements.loadingSpinner) {
            elements.loadingSpinner.style.display = 'none';
        }
    }
}

function renderModels(models, container, isAdminView) {
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!models || models.length === 0) {
        return;
    }
    
    models.forEach((model, index) => {
        const card = createModelCard(model, isAdminView);
        card.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(card);
    });
}

function createModelCard(model, isAdminView) {
    const card = document.createElement('div');
    card.className = 'divine-card model-card animate-on-scroll';
    card.dataset.id = model.id;
    card.dataset.source = model.source;
    card.dataset.tags = model.tags ? model.tags.join(',') : '';
    
    // Normalize model data
    const normalizedModel = normalizeModel(model);
    const thumbnailSrc = normalizedModel.thumbnailUrl;
    const glbUrl = normalizedModel.glbUrl;
    
    // Source badge
    let sourceBadge = '';
    if (model.source === 'github') {
        sourceBadge = '<div class="model-source-badge github-badge"><i class="fab fa-github"></i> GitHub</div>';
    } else if (model.source === 'upload') {
        sourceBadge = '<div class="model-source-badge upload-badge"><i class="fas fa-upload"></i> Local</div>';
    } else {
        sourceBadge = '<div class="model-source-badge url-badge"><i class="fas fa-globe"></i> URL</div>';
    }
    
    // Tags
    const tags = model.tags || ['divine'];
    const tagsHtml = tags.slice(0, 3).map(tag => 
        `<span class="model-tag">${tag}</span>`
    ).join('');
    
    // File size
    const fileSize = model.fileSize ? formatFileSize(model.fileSize) : 'Unknown';
    const uploadDate = new Date(model.uploadDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // URL display - NEW FEATURE
    const urlDisplay = glbUrl ? 
        `<div class="model-url">
            <i class="fas fa-link"></i>
            <span class="url-text">${truncateUrl(glbUrl, 40)}</span>
        </div>` : '';
    
    card.innerHTML = `
        <div class="model-preview">
            ${glbUrl ? `
                <model-viewer 
                    src="${glbUrl}"
                    alt="${model.name}"
                    auto-rotate
                    camera-controls
                    shadow-intensity="1"
                    environment-image="neutral"
                    loading="lazy"
                    style="width: 100%; height: 100%;">
                </model-viewer>
            ` : `
                <img src="${thumbnailSrc}" alt="${model.name}" loading="lazy">
            `}
            ${sourceBadge}
        </div>
        <div class="model-info">
            <h3 class="model-name">${model.name}</h3>
            ${model.description ? `<p class="model-description">${model.description.substring(0, 80)}${model.description.length > 80 ? '...' : ''}</p>` : ''}
            ${urlDisplay}
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
        <div class="model-actions">
            <button class="divine-button outline-btn preview-btn" data-id="${model.id}">
                <i class="fas fa-eye"></i>
                Preview
            </button>
            <button class="divine-button cosmic-btn download-btn" data-id="${model.id}">
                <i class="fas fa-download"></i>
                Download
            </button>
        </div>
        ${isAdminView ? `
            <button class="delete-btn" data-id="${model.id}" title="Remove from cosmos">
                <i class="fas fa-trash"></i>
            </button>
        ` : ''}
    `;
    
    // Add event listeners
    const previewBtn = card.querySelector('.preview-btn');
    const downloadBtn = card.querySelector('.download-btn');
    
    previewBtn.addEventListener('click', () => previewModel(model));
    downloadBtn.addEventListener('click', () => downloadModel(model));
    
    if (isAdminView) {
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteModelFromUI(model.id));
    }
    
    // Add click to copy URL functionality
    const urlElement = card.querySelector('.model-url');
    if (urlElement) {
        urlElement.addEventListener('click', (e) => {
            if (e.target.closest('.model-url')) {
                copyToClipboard(glbUrl);
            }
        });
    }
    
    return card;
}

function normalizeModel(model) {
    // Ensure consistent field names
    const normalized = { ...model };
    
    // Normalize GLB URL
    if (model.glbUrl) {
        normalized.glbUrl = model.glbUrl;
    } else if (model.src) {
        normalized.glbUrl = model.src;
    } else if (model.url) {
        normalized.glbUrl = model.url;
    }
    
    // Normalize thumbnail URL
    if (model.thumbnailUrl) {
        normalized.thumbnailUrl = model.thumbnailUrl;
    } else if (model.thumbnail) {
        normalized.thumbnailUrl = model.thumbnail;
    } else if (model.image) {
        normalized.thumbnailUrl = model.image;
    } else {
        // Default thumbnail
        normalized.thumbnailUrl = getDefaultThumbnail(model.name);
    }
    
    // Ensure fileName
    if (!normalized.fileName && normalized.glbUrl) {
        normalized.fileName = normalized.glbUrl.split('/').pop() || `${model.name.replace(/\s+/g, '_').toLowerCase()}.glb`;
    }
    
    // Ensure tags array
    if (!normalized.tags || !Array.isArray(normalized.tags)) {
        normalized.tags = ['divine'];
    }
    
    return normalized;
}

function previewModel(model) {
    if (!model.glbUrl) {
        showNotification('No GLB URL available for preview', 'error');
        return;
    }
    
    // Update preview modal
    elements.previewModelName.textContent = model.name;
    elements.modelViewer.src = model.glbUrl;
    elements.previewModelSource.textContent = model.source === 'github' ? 'GitHub' : 
                                             model.source === 'upload' ? 'Local Upload' : 'External URL';
    elements.previewModelUrl.textContent = model.glbUrl;
    elements.previewModelDate.textContent = new Date(model.uploadDate).toLocaleDateString();
    elements.previewModelTags.textContent = model.tags ? model.tags.join(', ') : 'No tags';
    elements.previewModelDesc.textContent = model.description || 'No description available';
    
    // Set download button data
    elements.downloadPreviewBtn.dataset.modelId = model.id;
    
    // Show modal
    elements.modelPreviewModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

async function downloadModel(model) {
    try {
        showNotification('Preparing divine download...', 'warning');
        
        if (!model.glbUrl) {
            throw new Error('No download URL available');
        }
        
        // For GitHub URLs, use the raw URL
        let downloadUrl = model.glbUrl;
        if (model.source === 'github') {
            downloadUrl = convertToRawGithubUrl(downloadUrl);
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = model.fileName || `${model.name.replace(/\s+/g, '_').toLowerCase()}.glb`;
        link.target = '_blank';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Update download count
        await updateDownloadCount(model.id);
        
        showNotification('Divine download initiated!', 'success');
        
    } catch (error) {
        console.error('Download failed:', error);
        showNotification(`Download failed: ${error.message}`, 'error');
    }
}

async function deleteModelFromUI(modelId) {
    if (!confirm('Remove this divine model from the cosmos?')) {
        return;
    }
    
    try {
        await deleteModel(modelId);
        
        // Remove from local arrays
        allModels = allModels.filter(m => m.id !== modelId);
        filteredModels = filteredModels.filter(m => m.id !== modelId);
        
        // Update UI
        updateModelCount(allModels.length);
        renderModels(allModels, elements.modelsGrid, false);
        
        if (isDivineAdmin) {
            renderModels(allModels, elements.adminModelsGrid, true);
            if (elements.totalModelsCount) {
                elements.totalModelsCount.textContent = allModels.length;
            }
        }
        
        showNotification('Model removed from divine cosmos', 'warning');
        
    } catch (error) {
        console.error('Deletion failed:', error);
        showNotification('Failed to delete model', 'error');
    }
}

// ==============================
// URL DISPLAY FUNCTIONS
// ==============================

function truncateUrl(url, maxLength) {
    if (url.length <= maxLength) return url;
    
    const start = url.substring(0, Math.floor(maxLength / 2) - 3);
    const end = url.substring(url.length - Math.floor(maxLength / 2) + 3);
    return start + '...' + end;
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('URL copied to clipboard!', 'success');
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('URL copied to clipboard!', 'success');
    }
}

// ==============================
// REMOTE MODELS LOADING
// ==============================

async function loadRemoteModels() {
    try {
        const timestamp = Date.now();
        const url = `${DIVINE_CONFIG.MODELS_JSON_URL}?_=${timestamp}`;
        
        console.log('🌐 Loading remote models from:', url);
        
        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const models = await response.json();
        console.log(`✅ Loaded ${models.length} remote models`);
        return Array.isArray(models) ? models.map(normalizeModel) : [];
        
    } catch (error) {
        console.warn('Could not load remote models:', error.message);
        return [];
    }
}

function mergeModels(remoteModels, localModels) {
    const merged = [...remoteModels];
    const remoteUrls = new Set(remoteModels.map(m => m.glbUrl || m.id));
    
    // Add local models that aren't in remote
    for (const localModel of localModels) {
        const normalized = normalizeModel(localModel);
        if (!remoteUrls.has(normalized.glbUrl || normalized.id)) {
            merged.push(normalized);
        }
    }
    
    // Remove duplicates by ID and URL
    const uniqueMap = new Map();
    for (const model of merged) {
        const key = model.glbUrl || model.id;
        if (key && !uniqueMap.has(key)) {
            uniqueMap.set(key, model);
        }
    }
    
    return Array.from(uniqueMap.values());
}

// ==============================
// GITHUB URL HANDLING
// ==============================

function convertToRawGithubUrl(url) {
    try {
        const urlObj = new URL(url);
        
        // Convert GitHub blob URL to raw URL
        if (urlObj.hostname === 'github.com') {
            const pathParts = urlObj.pathname.split('/');
            if (pathParts[2] === 'blob') {
                const user = pathParts[1];
                const repo = pathParts[2];
                const branch = pathParts[4];
                const filePath = pathParts.slice(5).join('/');
                return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filePath}`;
            }
        }
        
        // Convert GitHub Pages to raw if possible
        if (urlObj.hostname.endsWith('.github.io')) {
            const parts = urlObj.hostname.split('.');
            const user = parts[0];
            const repo = urlObj.pathname.split('/')[1] || DIVINE_CONFIG.GITHUB_REPO;
            const filePath = urlObj.pathname.split('/').slice(2).join('/');
            return `https://raw.githubusercontent.com/${user}/${repo}/main/${filePath}`;
        }
        
        return url;
    } catch {
        return url;
    }
}

function convertToGithubPagesUrl(url) {
    try {
        const urlObj = new URL(url);
        
        // Convert raw GitHub to GitHub Pages
        if (urlObj.hostname === 'raw.githubusercontent.com') {
            const pathParts = urlObj.pathname.split('/');
            const user = pathParts[1];
            const repo = pathParts[2];
            const filePath = pathParts.slice(4).join('/');
            return `https://${user}.github.io/${repo}/${filePath}`;
        }
        
        // Convert GitHub blob to GitHub Pages
        if (urlObj.hostname === 'github.com') {
            const pathParts = urlObj.pathname.split('/');
            if (pathParts[2] === 'blob') {
                const user = pathParts[1];
                const repo = pathParts[2];
                const filePath = pathParts.slice(5).join('/');
                return `https://${user}.github.io/${repo}/${filePath}`;
            }
        }
        
        return url;
    } catch {
        return url;
    }
}

async function validateGithubUrl(url) {
    const validationResult = elements.githubValidationResult;
    validationResult.className = 'validation-result';
    validationResult.textContent = 'Validating URL...';
    
    try {
        // Convert to raw URL for validation
        const rawUrl = convertToRawGithubUrl(url);
        
        // Try to fetch the file
        const response = await fetch(rawUrl, { method: 'HEAD' });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Check content type
        const contentType = response.headers.get('content-type') || '';
        const isGlb = contentType.includes('model/gltf-binary') || 
                      rawUrl.toLowerCase().endsWith('.glb');
        
        if (!isGlb) {
            throw new Error('URL does not point to a GLB file');
        }
        
        // Success
        validationResult.className = 'validation-result success';
        validationResult.innerHTML = `
            <i class="fas fa-check-circle"></i> 
            Valid GLB file found!
            <br><small>Content-Type: ${contentType}</small>
        `;
        
        return { valid: true, rawUrl, contentType };
        
    } catch (error) {
        validationResult.className = 'validation-result error';
        validationResult.innerHTML = `
            <i class="fas fa-times-circle"></i> 
            Validation failed: ${error.message}
        `;
        return { valid: false, error: error.message };
    }
}

async function addGithubModel() {
    const name = elements.githubModelName.value.trim();
    const url = elements.githubGlbUrl.value.trim();
    const thumbnailUrl = elements.githubThumbnailUrl.value.trim();
    const tags = elements.githubModelTags.value.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
    
    if (!name || !url) {
        showNotification('Please provide model name and GitHub URL', 'error');
        return;
    }
    
    // Validate URL
    const validation = await validateGithubUrl(url);
    if (!validation.valid) {
        showNotification('Invalid GitHub URL', 'error');
        return;
    }
    
    try {
        showUploadStatus(true);
        updateProgress(30, 'Processing divine model...');
        
        // Convert to GitHub Pages URL if checkbox is checked
        let finalUrl = url;
        if (elements.convertToGhPages.checked) {
            finalUrl = convertToGithubPagesUrl(url);
        }
        
        // Create model object
        const model = {
            name,
            type: 'github',
            source: 'github',
            glbUrl: finalUrl,
            thumbnailUrl: thumbnailUrl || getDefaultThumbnail(name),
            fileName: url.split('/').pop() || `${name.replace(/\s+/g, '_').toLowerCase()}.glb`,
            uploadDate: new Date().toISOString(),
            tags: ['github', 'divine', ...tags],
            fileSize: 0,
            description: `Divine model hosted on GitHub: ${name}`,
            securitySignature: DIVINE_CONFIG.SECURITY_SIGNATURE
        };
        
        updateProgress(70, 'Saving to cosmic database...');
        
        // Save to database
        const modelId = await saveModel(model);
        model.id = modelId;
        
        // Add to local arrays
        allModels.unshift(model);
        filteredModels.unshift(model);
        
        updateProgress(100, 'Model added successfully!');
        
        // Update UI
        setTimeout(() => {
            showUploadStatus(false);
            updateModelCount(allModels.length);
            renderModels(allModels, elements.modelsGrid, false);
            
            if (isDivineAdmin) {
                renderModels(allModels, elements.adminModelsGrid, true);
                if (elements.totalModelsCount) {
                    elements.totalModelsCount.textContent = allModels.length;
                }
            }
            
            // Reset form
            resetGithubForm();
            
            showNotification('Divine model added to cosmos!', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('Failed to add GitHub model:', error);
        showUploadStatus(false);
        showNotification(`Failed to add model: ${error.message}`, 'error');
    }
}

function getDefaultThumbnail(modelName) {
    const thumbnails = {
        'krishna': 'https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?w=400&h=300&fit=crop',
        'buddha': 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=400&h=300&fit=crop',
        'mandala': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop',
        'lotus': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        'shiva': 'https://images.unsplash.com/photo-1604617880299-c9c2f8a8f8b5?w=400&h=300&fit=crop',
        'hanuman': 'https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?w=400&h=300&fit=crop',
        'ganesha': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        'meditation': 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=400&h=300&fit=crop'
    };
    
    const lowerName = modelName.toLowerCase();
    for (const [key, thumbnail] of Object.entries(thumbnails)) {
        if (lowerName.includes(key)) {
            return thumbnail;
        }
    }
    
    // Default cosmic thumbnail
    return 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop';
}

// ==============================
// FILE UPLOAD HANDLING
// ==============================

async function handleFileUpload() {
    const name = elements.modelName.value.trim();
    const thumbnailFile = elements.modelThumbnail.files[0];
    const glbFile = elements.modelFile.files[0];
    const tags = elements.modelTags.value.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
    const description = elements.modelDescription.value.trim();
    
    if (!name || !thumbnailFile || !glbFile) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    // Mobile file size limit
    if (isMobile && glbFile.size > 50 * 1024 * 1024) {
        showNotification('File too large for mobile upload (max 50MB)', 'error');
        return;
    }
    
    try {
        showUploadStatus(true);
        updateProgress(10, 'Processing files...');
        
        // Read thumbnail as Data URL
        const thumbnail = await readFileAsDataURL(thumbnailFile);
        
        updateProgress(40, 'Reading GLB file...');
        
        // Read GLB file
        const glbData = await readFileAsArrayBuffer(glbFile);
        
        updateProgress(70, 'Creating divine model...');
        
        // Create model object
        const model = {
            name,
            type: 'upload',
            source: 'upload',
            thumbnail,
            glbData: new Uint8Array(glbData),
            fileName: `${name.replace(/\s+/g, '_').toLowerCase()}_divine.glb`,
            uploadDate: new Date().toISOString(),
            tags: ['uploaded', 'divine', 'local', ...tags],
            fileSize: glbFile.size,
            description: description || `Locally uploaded divine model: ${name}`,
            securitySignature: DIVINE_CONFIG.SECURITY_SIGNATURE
        };
        
        updateProgress(90, 'Saving to cosmic database...');
        
        // Save to database
        const modelId = await saveModel(model);
        model.id = modelId;
        
        // Add to local arrays
        allModels.unshift(model);
        filteredModels.unshift(model);
        
        updateProgress(100, 'Upload complete!');
        
        // Update UI
        setTimeout(() => {
            showUploadStatus(false);
            updateModelCount(allModels.length);
            renderModels(allModels, elements.modelsGrid, false);
            
            if (isDivineAdmin) {
                renderModels(allModels, elements.adminModelsGrid, true);
                if (elements.totalModelsCount) {
                    elements.totalModelsCount.textContent = allModels.length;
                }
            }
            
            // Reset form
            resetUploadForm();
            
            showNotification('Divine model uploaded successfully!', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('Upload failed:', error);
        showUploadStatus(false);
        showNotification(`Upload failed: ${error.message}`, 'error');
    }
}

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

// ==============================
// UI HELPERS
// ==============================

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
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
    
    // Auto-remove after timeout
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

function updateProgress(percent, text) {
    if (!elements.progressFill || !elements.statusText || !elements.statusPercent) return;
    
    elements.progressFill.style.width = `${percent}%`;
    elements.statusText.textContent = text;
    elements.statusPercent.textContent = `${percent}%`;
}

function updateModelCount(count) {
    // Update counter animation
    const counters = document.querySelectorAll('.cosmic-count[data-count]');
    counters.forEach(counter => {
        if (counter.dataset.count === "0") {
            counter.textContent = count;
        }
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function resetUploadForm() {
    elements.modelName.value = '';
    elements.modelThumbnail.value = '';
    elements.modelFile.value = '';
    elements.modelTags.value = '';
    elements.modelDescription.value = '';
    
    const uploadAreas = document.querySelectorAll('.upload-area span');
    uploadAreas.forEach(area => {
        area.textContent = 'Drop or select file';
    });
}

function resetGithubForm() {
    elements.githubModelName.value = '';
    elements.githubGlbUrl.value = '';
    elements.githubThumbnailUrl.value = '';
    elements.githubModelTags.value = '';
    elements.githubValidationResult.className = 'validation-result';
    elements.githubValidationResult.textContent = '';
}

function switchPortal(portalId) {
    // Update portal cards
    elements.portalCards.forEach(card => {
        card.classList.remove('active');
        if (card.dataset.portal === portalId) {
            card.classList.add('active');
        }
    });
    
    // Update portal contents
    elements.portalContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${portalId}Portal`) {
            content.classList.add('active');
        }
    });
}

// ==============================
// EVENT LISTENERS
// ==============================

function setupEventListeners() {
    // Admin Access
    if (elements.adminAccessBtn) {
        elements.adminAccessBtn.addEventListener('click', () => {
            elements.adminLoginModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                if (elements.adminPassword) elements.adminPassword.focus();
            }, 100);
        });
    }
    
    // Explore Button
    if (elements.exploreBtn) {
        elements.exploreBtn.addEventListener('click', () => {
            document.getElementById('modelsSection').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
    // Request Manifestation
    if (elements.requestManifestationBtn) {
        elements.requestManifestationBtn.addEventListener('click', () => {
            elements.adminLoginModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close Modals
    elements.closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === elements.adminLoginModal || e.target === elements.modelPreviewModal) {
            closeModal();
        }
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Login
    if (elements.loginBtn) {
        elements.loginBtn.addEventListener('click', handleLogin);
    }
    
    if (elements.adminPassword) {
        elements.adminPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }
    
    // Logout
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // File Upload
    if (elements.uploadBtn) {
        elements.uploadBtn.addEventListener('click', handleFileUpload);
    }
    
    // GitHub URL
    if (elements.validateGithubUrlBtn) {
        elements.validateGithubUrlBtn.addEventListener('click', () => {
            const url = elements.githubGlbUrl.value.trim();
            if (url) {
                validateGithubUrl(url);
            }
        });
    }
    
    if (elements.addGithubUrlBtn) {
        elements.addGithubUrlBtn.addEventListener('click', addGithubModel);
    }
    
    // Portal Navigation
    elements.portalCards.forEach(card => {
        card.addEventListener('click', () => {
            const portal = card.dataset.portal;
            switchPortal(portal);
        });
    });
    
    // Model Search (Main)
    if (elements.searchModels) {
        elements.searchModels.addEventListener('input', (e) => {
            filterModels(e.target.value);
        });
    }
    
    // Model Search (Admin)
    if (elements.modelSearch) {
        elements.modelSearch.addEventListener('input', (e) => {
            filterModelsAdmin(e.target.value);
        });
    }
    
    // Filter Buttons (Admin)
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterModelsAdmin(elements.modelSearch.value, btn.dataset.filter);
        });
    });
    
    // Filter Tags (Main)
    elements.filterTags.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterTags.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterModelsByTag(btn.dataset.tag);
        });
    });
    
    // Preview Modal Download
    if (elements.downloadPreviewBtn) {
        elements.downloadPreviewBtn.addEventListener('click', () => {
            const modelId = parseInt(elements.downloadPreviewBtn.dataset.modelId);
            const model = allModels.find(m => m.id === modelId);
            if (model) {
                downloadModel(model);
            }
        });
    }
    
    // Preview Modal Close
    if (elements.closePreviewBtn) {
        elements.closePreviewBtn.addEventListener('click', () => {
            elements.modelPreviewModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Window resize
    window.addEventListener('resize', () => {
        detectMobile();
        initDivineParticles();
    });
    
    // Scroll animations
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
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
                    area.querySelector('span').textContent = 
                        fileName.substring(0, 20) + (fileName.length > 20 ? '...' : '');
                    
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

function closeModal() {
    elements.adminLoginModal.style.display = 'none';
    elements.modelPreviewModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    resetLoginForm();
}

function resetLoginForm() {
    elements.adminPassword.value = '';
    elements.loginError.textContent = '';
    elements.loginError.style.opacity = '0';
}

// ==============================
// AUTHENTICATION
// ==============================

function handleLogin() {
    const password = elements.adminPassword.value.trim();
    
    if (password === DIVINE_CONFIG.ADMIN_PASSWORD) {
        isDivineAdmin = true;
        
        // Transition to admin panel
        elements.adminLoginModal.style.opacity = '0';
        setTimeout(() => {
            elements.adminLoginModal.style.display = 'none';
            elements.adminPanel.style.display = 'block';
            elements.mainWebsite.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Load admin models
            renderModels(allModels, elements.adminModelsGrid, true);
            if (elements.totalModelsCount) {
                elements.totalModelsCount.textContent = allModels.length;
            }
            
            showNotification('Welcome to Divine Administration Portal', 'success');
            
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

function handleLogout() {
    isDivineAdmin = false;
    
    elements.adminPanel.style.opacity = '0';
    setTimeout(() => {
        elements.adminPanel.style.display = 'none';
        elements.mainWebsite.style.display = 'block';
        elements.adminPanel.style.opacity = '1';
        
        if (isMobile) {
            document.body.classList.remove('admin-mode');
        }
        
        showNotification('Returned to divine website', 'warning');
    }, 300);
    
    resetUploadForm();
    resetGithubForm();
}

// ==============================
// FILTERING & SEARCH
// ==============================

function filterModels(searchTerm = '') {
    filteredModels = allModels.filter(model => {
        // Search term filter
        const matchesSearch = !searchTerm || 
            model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (model.tags && model.tags.some(tag => 
                tag.toLowerCase().includes(searchTerm.toLowerCase())
            )) ||
            (model.description && model.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (model.glbUrl && model.glbUrl.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesSearch;
    });
    
    renderModels(filteredModels, elements.modelsGrid, false);
}

function filterModelsByTag(tag) {
    if (tag === 'all') {
        filteredModels = [...allModels];
    } else {
        filteredModels = allModels.filter(model => 
            model.tags && model.tags.some(t => t.toLowerCase() === tag.toLowerCase())
        );
    }
    
    renderModels(filteredModels, elements.modelsGrid, false);
}

function filterModelsAdmin(searchTerm = '', filter = 'all') {
    filteredModels = allModels.filter(model => {
        // Search term filter
        const matchesSearch = !searchTerm || 
            model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (model.tags && model.tags.some(tag => 
                tag.toLowerCase().includes(searchTerm.toLowerCase())
            )) ||
            (model.description && model.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (model.glbUrl && model.glbUrl.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Source filter
        const matchesFilter = filter === 'all' || model.source === filter;
        
        return matchesSearch && matchesFilter;
    });
    
    // Update admin grid
    if (isDivineAdmin) {
        renderModels(filteredModels, elements.adminModelsGrid, true);
    }
}

// ==============================
// ANIMATIONS & EFFECTS
// ==============================

function initCosmicEffects() {
    initDivineParticles();
    
    // Add shake animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
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
    const particleCount = isMobile ? 
        DIVINE_CONFIG.PARTICLE_COUNT / 2 : 
        DIVINE_CONFIG.PARTICLE_COUNT;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            color: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.3 + 0.1})`
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            // Move particle
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Bounce off walls
            if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
            
            // Draw glow
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = particle.color.replace(')', ', 0.05)').replace('rgb', 'rgba');
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function animateCounters() {
    const counters = document.querySelectorAll('.cosmic-count[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.count);
        if (isNaN(target)) return;
        
        let current = 0;
        const increment = target / 100;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        // Start animation when counter is in view
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
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => observer.observe(el));
}

// ==============================
// UPDATE DOWNLOAD COUNT
// ==============================

async function updateDownloadCount(modelId) {
    try {
        const model = allModels.find(m => m.id === modelId);
        if (model) {
            // Update download count in model
            model.downloadCount = (model.downloadCount || 0) + 1;
            
            // Update in database
            await updateModel(modelId, { downloadCount: model.downloadCount });
            
            // Update total download counter
            const totalDownloads = allModels.reduce((sum, m) => sum + (m.downloadCount || 0), 0);
            const downloadCounter = document.querySelector('.cosmic-count[data-count="0"]');
            if (downloadCounter && downloadCounter.parentElement.querySelector('.stat-label').textContent.includes('Downloads')) {
                downloadCounter.textContent = totalDownloads;
            }
            
            // Update admin statistics
            if (isDivineAdmin && elements.totalDownloads) {
                elements.totalDownloads.textContent = totalDownloads;
                
                // Update today's downloads (simplified)
                const today = new Date().toDateString();
                const todayDownloads = allModels.reduce((sum, m) => {
                    const lastDownload = m.lastDownload ? new Date(m.lastDownload).toDateString() : null;
                    return sum + (lastDownload === today ? (m.downloadCount || 0) : 0);
                }, 0);
                if (elements.todayDownloads) {
                    elements.todayDownloads.textContent = todayDownloads;
                }
                
                // Update most popular model
                const popular = allModels.reduce((max, m) => 
                    (m.downloadCount || 0) > (max.downloadCount || 0) ? m : max
                , allModels[0] || {});
                if (elements.popularModel) {
                    elements.popularModel.textContent = popular.name || 'None';
                }
            }
        }
    } catch (error) {
        console.error('Failed to update download count:', error);
    }
}

// ==============================
// EXPORT FOR DEBUGGING
// ==============================

window.DivineCosmos = {
    config: DIVINE_CONFIG,
    db: () => divineDB,
    models: () => allModels,
    isAdmin: () => isDivineAdmin,
    isMobile: () => isMobile,
    reloadModels: loadAndRenderModels,
    showNotification: showNotification
};

console.log('✨ Divine Cosmos Script Loaded Successfully!');
