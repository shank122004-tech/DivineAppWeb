// ==============================
// DIVINE COSMIC UNIVERSE - Auto-Refresh Edition
// GitHub Hosted GLB Models System
// ==============================

// Divine Configuration
const DIVINE_CONFIG = {
    DB_NAME: 'DivineCosmosDB',
    DB_VERSION: 2,
    STORE_NAME: 'divine_models',
    SECURITY_SIGNATURE: "DM-9937-COSMIC-SECURE",
    // GitHub Configuration
    GITHUB_USERNAME: "shank122004-tech",
    GITHUB_REPO: "DivineAppWeb",
    MODELS_JSON_URL: "https://shank122004-tech.github.io/DivineAppWeb/models.json",
    
    // Auto-Refresh Settings
    POLL_INTERVAL_MS: 60000, // 60 seconds
    RETRY_DELAY_MS: 10000,   // 10 seconds for retry
    CHECK_ON_FOCUS: true,    // Check when tab gains focus
    CHECK_ON_VISIBILITY: true, // Check when page becomes visible
    
    // Cache Settings
    CACHE_DURATION: 300000,  // 5 minutes
    ENABLE_CONDITIONAL_REQUESTS: true,
    
    // Mobile settings
    MOBILE_BREAKPOINT: 768,
    PARTICLE_COUNT: 150,
    
    // Default models for first-time visitors
    DEFAULT_MODELS: []
};

// Global State
let divineDB = null;
let isMobile = false;
let allModels = [];
let filteredModels = [];

// Auto-Refresh State
let refreshState = {
    lastETag: null,
    lastModified: null,
    lastChecked: null,
    nextCheck: null,
    isChecking: false,
    checkInterval: null,
    modelsCache: null,
    cacheTimestamp: null
};

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
        
        // Load initial models with auto-refresh
        await initializeAutoRefresh();
        
        // Hide loading overlay
        setTimeout(() => {
            showLoading(false);
            showNotification('🌟 Divine Cosmos Ready - Auto-Refresh Active', 'success');
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
        exploreBtn: document.querySelector('.explore-btn'),
        
        // Modals
        modelPreviewModal: document.getElementById('modelPreviewModal'),
        
        // Model Grids
        modelsGrid: document.getElementById('modelsGrid'),
        emptyState: document.getElementById('emptyState'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        
        // Auto-Refresh Elements
        refreshStatus: document.getElementById('refreshStatus'),
        refreshIndicator: document.getElementById('refreshIndicator'),
        manualRefreshBtn: document.getElementById('manualRefreshBtn'),
        retryLoadBtn: document.getElementById('retryLoadBtn'),
        lastChecked: document.getElementById('lastChecked'),
        nextCheck: document.getElementById('nextCheck'),
        loadInfo: document.getElementById('loadInfo'),
        
        // Search and Filter
        searchModels: document.getElementById('searchModels'),
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
}

// ==============================
// AUTO-REFRESH SYSTEM
// ==============================

async function initializeAutoRefresh() {
    console.log('🔄 Initializing auto-refresh system...');
    
    // Update status display
    updateRefreshStatus('Initializing...');
    
    // Load initial models
    await loadModelsFromGitHub();
    
    // Start periodic checking
    startAutoRefresh();
    
    // Set up focus/visibility checks
    if (DIVINE_CONFIG.CHECK_ON_FOCUS) {
        window.addEventListener('focus', handleFocusCheck);
    }
    
    if (DIVINE_CONFIG.CHECK_ON_VISIBILITY) {
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }
}

async function loadModelsFromGitHub(forceRefresh = false) {
    if (refreshState.isChecking && !forceRefresh) {
        console.log('⚠️ Already checking for updates, skipping...');
        return;
    }
    
    try {
        refreshState.isChecking = true;
        showRefreshIndicator(true);
        
        const now = new Date();
        refreshState.lastChecked = now;
        
        // Update last checked display
        if (elements.lastChecked) {
            elements.lastChecked.textContent = formatTimeAgo(now);
        }
        
        // Prepare fetch options with conditional requests
        const fetchOptions = {
            method: 'GET',
            headers: {},
            cache: 'no-cache'
        };
        
        // Add conditional request headers if we have them
        if (DIVINE_CONFIG.ENABLE_CONDITIONAL_REQUESTS) {
            if (refreshState.lastETag) {
                fetchOptions.headers['If-None-Match'] = refreshState.lastETag;
            }
            if (refreshState.lastModified) {
                fetchOptions.headers['If-Modified-Since'] = refreshState.lastModified;
            }
        }
        
        // Add cache busting for non-conditional requests
        if (!DIVINE_CONFIG.ENABLE_CONDITIONAL_REQUESTS || !refreshState.lastETag) {
            const url = new URL(DIVINE_CONFIG.MODELS_JSON_URL);
            url.searchParams.set('_', Date.now());
            var fetchUrl = url.toString();
        } else {
            var fetchUrl = DIVINE_CONFIG.MODELS_JSON_URL;
        }
        
        console.log('🌐 Fetching models from:', fetchUrl);
        
        const response = await fetch(fetchUrl, fetchOptions);
        
        // Handle 304 Not Modified (no changes)
        if (response.status === 304) {
            console.log('✅ No changes detected (304)');
            showNotification('Models are up to date', 'info');
            
            // Update cache timestamp
            refreshState.cacheTimestamp = Date.now();
            updateNextCheckTime();
            
            return false;
        }
        
        // Handle 200 OK (new data)
        if (response.ok) {
            const models = await response.json();
            
            // Save ETag and Last-Modified for next request
            const etag = response.headers.get('ETag');
            const lastModified = response.headers.get('Last-Modified');
            
            if (etag) refreshState.lastETag = etag;
            if (lastModified) refreshState.lastModified = lastModified;
            
            console.log(`✅ Loaded ${models.length} models from GitHub`);
            
            // Process and render models
            await processAndRenderModels(models);
            
            // Update cache
            refreshState.modelsCache = models;
            refreshState.cacheTimestamp = Date.now();
            
            // Show success notification
            showNotification(`${models.length} models loaded successfully`, 'success');
            
            updateNextCheckTime();
            return true;
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('❌ Failed to load models:', error);
        
        // Try to use cache if available
        if (refreshState.modelsCache && refreshState.cacheTimestamp) {
            const cacheAge = Date.now() - refreshState.cacheTimestamp;
            if (cacheAge < DIVINE_CONFIG.CACHE_DURATION) {
                console.log('🔄 Using cached models...');
                await processAndRenderModels(refreshState.modelsCache);
                showNotification('Using cached models (offline mode)', 'warning');
                return false;
            }
        }
        
        // Show error notification
        showNotification(`Failed to load models: ${error.message}`, 'error');
        
        // Show empty state with retry button
        if (elements.emptyState) {
            elements.emptyState.style.display = 'block';
        }
        
        if (elements.modelsGrid) {
            elements.modelsGrid.innerHTML = '';
        }
        
        return false;
        
    } finally {
        refreshState.isChecking = false;
        showRefreshIndicator(false);
        
        // Update next check time
        updateNextCheckTime();
    }
}

async function processAndRenderModels(models) {
    if (!models || !Array.isArray(models)) {
        console.error('Invalid models data:', models);
        return;
    }
    
    // Normalize and validate models
    const normalizedModels = models.map(normalizeModel).filter(model => {
        // Basic validation
        return model && model.name && model.glbUrl;
    });
    
    console.log(`🔄 Processing ${normalizedModels.length} valid models...`);
    
    // Update model count
    updateModelCount(normalizedModels.length);
    
    // Update global state
    allModels = normalizedModels;
    filteredModels = [...allModels];
    
    // Render models
    renderModels(allModels, elements.modelsGrid);
    
    // Update UI state
    if (elements.emptyState) {
        elements.emptyState.style.display = normalizedModels.length === 0 ? 'block' : 'none';
    }
    
    if (elements.loadingSpinner) {
        elements.loadingSpinner.style.display = 'none';
    }
    
    // Animate new models if they exist
    animateNewModels();
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
        // Default thumbnail based on name
        normalized.thumbnailUrl = getDefaultThumbnail(model.name);
    }
    
    // Ensure fileName
    if (!normalized.fileName && normalized.glbUrl) {
        normalized.fileName = normalized.glbUrl.split('/').pop() || 
                             `${model.name.replace(/\s+/g, '_').toLowerCase()}.glb`;
    }
    
    // Ensure tags array
    if (!normalized.tags || !Array.isArray(normalized.tags)) {
        normalized.tags = ['divine', 'github'];
    } else {
        // Add github tag if not present
        if (!normalized.tags.includes('github')) {
            normalized.tags.push('github');
        }
    }
    
    // Ensure source
    if (!normalized.source) {
        normalized.source = 'github';
    }
    
    // Ensure uploadDate
    if (!normalized.uploadDate) {
        normalized.uploadDate = new Date().toISOString();
    }
    
    // Ensure description
    if (!normalized.description) {
        normalized.description = `Divine 3D model: ${model.name}`;
    }
    
    // Generate unique ID if not present
    if (!normalized.id) {
        normalized.id = 'github_' + Math.random().toString(36).substr(2, 9);
    }
    
    return normalized;
}

function startAutoRefresh() {
    // Clear any existing interval
    if (refreshState.checkInterval) {
        clearInterval(refreshState.checkInterval);
    }
    
    // Start new interval
    refreshState.checkInterval = setInterval(async () => {
        console.log('🔄 Auto-refresh check...');
        await loadModelsFromGitHub();
    }, DIVINE_CONFIG.POLL_INTERVAL_MS);
    
    console.log(`✅ Auto-refresh started (${DIVINE_CONFIG.POLL_INTERVAL_MS / 1000}s interval)`);
    updateNextCheckTime();
}

function updateNextCheckTime() {
    if (!refreshState.lastChecked) return;
    
    const nextCheck = new Date(refreshState.lastChecked.getTime() + DIVINE_CONFIG.POLL_INTERVAL_MS);
    refreshState.nextCheck = nextCheck;
    
    if (elements.nextCheck) {
        const secondsLeft = Math.floor((nextCheck - new Date()) / 1000);
        if (secondsLeft > 0) {
            elements.nextCheck.textContent = `${secondsLeft}s`;
        } else {
            elements.nextCheck.textContent = 'Soon';
        }
    }
}

function updateRefreshStatus(status) {
    if (elements.refreshStatus) {
        const statusText = elements.refreshStatus.querySelector('span');
        if (statusText) {
            statusText.textContent = status;
        }
    }
}

function showRefreshIndicator(show) {
    if (elements.refreshIndicator) {
        if (show) {
            elements.refreshIndicator.classList.add('active');
        } else {
            elements.refreshIndicator.classList.remove('active');
        }
    }
}

function handleFocusCheck() {
    console.log('🔄 Tab focused, checking for updates...');
    loadModelsFromGitHub();
}

function handleVisibilityChange() {
    if (!document.hidden) {
        console.log('🔄 Page visible, checking for updates...');
        loadModelsFromGitHub();
    }
}

function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) {
        return 'Just now';
    } else if (diffSec < 3600) {
        const min = Math.floor(diffSec / 60);
        return `${min} minute${min !== 1 ? 's' : ''} ago`;
    } else if (diffSec < 86400) {
        const hours = Math.floor(diffSec / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

// ==============================
// MODEL RENDERING
// ==============================

function renderModels(models, container) {
    if (!container) return;
    
    // Store current scroll position if we're updating
    const wasScrolled = container.scrollTop > 0;
    const scrollPos = container.scrollTop;
    
    container.innerHTML = '';
    
    if (!models || models.length === 0) {
        container.innerHTML = `
            <div class="cosmic-empty">
                <div class="empty-orb">
                    <i class="fas fa-cloud"></i>
                </div>
                <h3>No Divine Models Found</h3>
                <p>Add models to GitHub repository to see them here</p>
            </div>
        `;
        return;
    }
    
    models.forEach((model, index) => {
        const card = createModelCard(model);
        card.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(card);
    });
    
    // Restore scroll position
    if (wasScrolled) {
        container.scrollTop = scrollPos;
    }
}

function createModelCard(model) {
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
    }
    
    // Tags
    const tags = model.tags || ['divine', 'github'];
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
    
    // URL display
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
                    style="width: 100%; height: 100%;"
                    crossorigin="anonymous">
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
                <i class="fas fa-sync-alt"></i>
                Auto-Updated
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
    `;
    
    // Add event listeners
    const previewBtn = card.querySelector('.preview-btn');
    const downloadBtn = card.querySelector('.download-btn');
    const modelViewer = card.querySelector('model-viewer');
    
    previewBtn.addEventListener('click', () => previewModel(model));
    downloadBtn.addEventListener('click', () => downloadModel(model));
    
    // Handle model-viewer errors
    if (modelViewer) {
        modelViewer.addEventListener('error', (e) => {
            console.error('Model viewer error:', e);
            modelViewer.innerHTML = `
                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);color:white;flex-direction:column;gap:10px;">
                    <i class="fas fa-exclamation-triangle" style="font-size:2rem;"></i>
                    <span>3D Model Failed to Load</span>
                    <button class="divine-button outline-btn" onclick="downloadModel(${JSON.stringify(model)})" style="margin-top:10px;">
                        <i class="fas fa-download"></i>
                        Download Instead
                    </button>
                </div>
            `;
        });
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

function animateNewModels() {
    // Add animation class to new models
    const newCards = elements.modelsGrid.querySelectorAll('.model-card');
    newCards.forEach(card => {
        card.classList.add('fade-in-up');
        
        // Add pulse animation for newly added models
        if (!card.dataset.animated) {
            card.dataset.animated = 'true';
            card.classList.add('new-model');
        }
    });
}

// ==============================
// MODEL PREVIEW & DOWNLOAD
// ==============================

function previewModel(model) {
    if (!model.glbUrl) {
        showNotification('No GLB URL available for preview', 'error');
        return;
    }
    
    // Update preview modal
    elements.previewModelName.textContent = model.name;
    elements.modelViewer.src = model.glbUrl;
    elements.previewModelSource.textContent = 'GitHub';
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
        showNotification('Preparing download...', 'warning');
        
        if (!model.glbUrl) {
            throw new Error('No download URL available');
        }
        
        // For GitHub URLs, ensure we have the raw URL
        let downloadUrl = model.glbUrl;
        if (model.source === 'github') {
            downloadUrl = convertToRawGithubUrl(downloadUrl);
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = model.fileName || `${model.name.replace(/\s+/g, '_').toLowerCase()}.glb`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Update download count
        await updateDownloadCount(model.id);
        
        showNotification('Download initiated!', 'success');
        
    } catch (error) {
        console.error('Download failed:', error);
        showNotification(`Download failed: ${error.message}`, 'error');
    }
}

function convertToRawGithubUrl(url) {
    try {
        const urlObj = new URL(url);
        
        // Handle GitHub Pages URL
        if (urlObj.hostname.endsWith('.github.io')) {
            const hostParts = urlObj.hostname.split('.');
            const username = hostParts[0];
            
            const pathParts = urlObj.pathname.split('/').filter(p => p);
            const repo = pathParts[0] || DIVINE_CONFIG.GITHUB_REPO;
            const filePath = pathParts.slice(1).join('/') || '';
            
            return `https://raw.githubusercontent.com/${username}/${repo}/main/${filePath}`;
        }
        
        // Handle GitHub blob URL
        if (urlObj.hostname === 'github.com' && urlObj.pathname.includes('/blob/')) {
            const path = urlObj.pathname.replace('/blob/', '/');
            return `https://raw.githubusercontent.com${path}`;
        }
        
        // Already a raw URL
        if (urlObj.hostname === 'raw.githubusercontent.com') {
            return url;
        }
        
        return url;
    } catch (error) {
        console.error('URL conversion error:', error);
        return url;
    }
}

// ==============================
// DATABASE FUNCTIONS (for caching)
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
            
            if (!db.objectStoreNames.contains(DIVINE_CONFIG.STORE_NAME)) {
                const store = db.createObjectStore(DIVINE_CONFIG.STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                
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
    if (bytes === 0 || !bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function truncateUrl(url, maxLength) {
    if (!url || url.length <= maxLength) return url || '';
    
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
    
    const lowerName = (modelName || '').toLowerCase();
    for (const [key, thumbnail] of Object.entries(thumbnails)) {
        if (lowerName.includes(key)) {
            return thumbnail;
        }
    }
    
    // Default cosmic thumbnail
    return 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop';
}

// ==============================
// EVENT LISTENERS
// ==============================

function setupEventListeners() {
    // Explore Button
    if (elements.exploreBtn) {
        elements.exploreBtn.addEventListener('click', () => {
            document.getElementById('modelsSection').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
    // Manual Refresh Button
    if (elements.manualRefreshBtn) {
        elements.manualRefreshBtn.addEventListener('click', async () => {
            showNotification('Checking for updates...', 'info');
            await loadModelsFromGitHub(true);
        });
    }
    
    // Retry Load Button
    if (elements.retryLoadBtn) {
        elements.retryLoadBtn.addEventListener('click', async () => {
            showNotification('Retrying to load models...', 'info');
            await loadModelsFromGitHub(true);
        });
    }
    
    // Close Modals
    elements.closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === elements.modelPreviewModal) {
            closeModal();
        }
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Model Search
    if (elements.searchModels) {
        elements.searchModels.addEventListener('input', (e) => {
            filterModels(e.target.value);
        });
    }
    
    // Filter Tags
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
            const modelId = elements.downloadPreviewBtn.dataset.modelId;
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

function closeModal() {
    elements.modelPreviewModal.style.display = 'none';
    document.body.style.overflow = 'auto';
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
    
    renderModels(filteredModels, elements.modelsGrid);
}

function filterModelsByTag(tag) {
    if (tag === 'all') {
        filteredModels = [...allModels];
    } else {
        filteredModels = allModels.filter(model => 
            model.tags && model.tags.some(t => t.toLowerCase() === tag.toLowerCase())
        );
    }
    
    renderModels(filteredModels, elements.modelsGrid);
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
        // Update download count in localStorage
        let downloadStats = JSON.parse(localStorage.getItem('divine_download_stats') || '{}');
        downloadStats.total = (downloadStats.total || 0) + 1;
        downloadStats[modelId] = (downloadStats[modelId] || 0) + 1;
        localStorage.setItem('divine_download_stats', JSON.stringify(downloadStats));
        
        // Update total download counter
        const totalDownloads = downloadStats.total || 0;
        const downloadCounter = document.querySelector('.cosmic-count[data-count="0"]');
        if (downloadCounter && downloadCounter.parentElement.querySelector('.stat-label').textContent.includes('Downloads')) {
            downloadCounter.textContent = totalDownloads;
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
    refreshState: () => refreshState,
    models: () => allModels,
    isMobile: () => isMobile,
    reloadModels: () => loadModelsFromGitHub(true),
    showNotification: showNotification,
    manualRefresh: () => loadModelsFromGitHub(true)
};

console.log('✨ Divine Cosmos Script Loaded Successfully!');
