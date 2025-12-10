// script.js - Divine 3D Gallery
'use strict';

// Configuration
const CONFIG = {
    MODELS_JSON_URL: 'https://raw.githubusercontent.com/shank122004-tech/DivineAppWeb/main/models.json',
    REFRESH_INTERVAL: 15000, // 15 seconds
    ADMIN_PASSWORD: 'admin123',
    GITHUB_REPO: 'shank122004-tech/DivineAppWeb',
    JSON_PATH: 'models.json',
    LOCAL_STORAGE_KEY: 'divine3d_gallery_data',
    
    // GLB Security Configuration
    GLB_SECURITY: {
        FILENAME_SIGNATURE: "@divinemantra",
        INTERNAL_SIGNATURE: "DM-9937-SECURE-CODE"
    },
    
    // Fallback sample models
    SAMPLE_MODELS: [
        {
            id: 'sample_1',
            name: 'Divine Krishna Statue',
            description: 'Beautiful 3D model of Lord Krishna playing flute',
            category: 'Spiritual',
            tags: ['krishna', 'divine', 'statue', 'hindu'],
            glbUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
            thumbnailUrl: 'https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?w=400&h=300&fit=crop',
            fileSize: '4.5 MB',
            createdAt: '2024-01-15',
            updatedAt: '2024-01-15',
            downloads: 1250,
            rating: 4.8
        },
        {
            id: 'sample_2',
            name: 'Meditation Buddha',
            description: 'Peaceful Buddha statue in meditation pose',
            category: 'Spiritual',
            tags: ['buddha', 'meditation', 'peace', 'statue'],
            glbUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
            thumbnailUrl: 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=400&h=300&fit=crop',
            fileSize: '3.2 MB',
            createdAt: '2024-01-14',
            updatedAt: '2024-01-14',
            downloads: 980,
            rating: 4.9
        }
    ]
};

// State Management
const State = {
    models: [],
    categories: new Set(),
    filteredModels: [],
    currentCategory: 'all',
    searchQuery: '',
    sortBy: 'name-asc',
    isAdmin: false,
    isInitialized: false,
    isLoading: false,
    refreshInterval: null,
    currentPreviewModel: null,
    uploadedFile: null,
    autoRotateEnabled: true,
    viewMode: 'grid'
};

// DOM Elements
const Elements = {
    // Loading
    loadingScreen: document.getElementById('loadingScreen'),
    
    // Header
    themeToggle: document.getElementById('themeToggle'),
    adminBtn: document.getElementById('adminBtn'),
    adminOverlay: document.getElementById('adminOverlay'),
    refreshBtn: document.getElementById('refreshBtn'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    navToggle: document.getElementById('navToggle'),
    navLinks: document.getElementById('navLinks'),
    mainHeader: document.querySelector('.main-header'),

    // Hero
    totalModels: document.getElementById('totalModels'),
    heroPreview: document.getElementById('hero-preview'),
    uploadGuideBtn: document.getElementById('uploadGuideBtn'),

    // Gallery
    galleryContainer: document.getElementById('galleryContainer'),
    gallerySearch: document.getElementById('gallerySearch'),
    categoryFilter: document.getElementById('categoryFilter'),
    clearFilters: document.getElementById('clearFilters'),
    sortSelect: document.getElementById('sortSelect'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    noResults: document.getElementById('noResults'),
    viewBtns: document.querySelectorAll('.view-btn'),

    // Categories
    categoriesContainer: document.getElementById('categoriesContainer'),

    // Preview Modal
    previewModal: document.getElementById('previewModal'),
    closePreview: document.getElementById('closePreview'),
    previewViewer: document.getElementById('previewViewer'),
    previewTitle: document.getElementById('previewTitle'),
    previewSubtitle: document.getElementById('previewSubtitle'),
    previewName: document.getElementById('previewName'),
    previewCategory: document.getElementById('previewCategory'),
    previewSize: document.getElementById('previewSize'),
    previewDate: document.getElementById('previewDate'),
    previewDescription: document.getElementById('previewDescription'),
    previewTags: document.getElementById('previewTags'),
    downloadModel: document.getElementById('downloadModel'),
    copyUrl: document.getElementById('copyUrl'),
    shareModel: document.getElementById('shareModel'),
    rotateToggle: document.getElementById('rotateToggle'),
    fullscreenToggle: document.getElementById('fullscreenToggle'),
    arToggle: document.getElementById('arToggle'),
    resetView: document.getElementById('resetView'),

    // Admin Panel
    closeAdmin: document.getElementById('closeAdmin'),
    adminLogin: document.getElementById('adminLogin'),
    adminDashboard: document.getElementById('adminDashboard'),
    adminPassword: document.getElementById('adminPassword'),
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    adminStatus: document.getElementById('adminStatus'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),

    // Admin Forms
    uploadArea: document.getElementById('uploadArea'),
    modelFile: document.getElementById('modelFile'),
    fileInfo: document.getElementById('fileInfo'),
    fileName: document.getElementById('fileName'),
    fileSize: document.getElementById('fileSize'),
    fileStatus: document.getElementById('fileStatus'),
    removeFile: document.getElementById('removeFile'),
    modelName: document.getElementById('modelName'),
    modelDescription: document.getElementById('modelDescription'),
    modelCategory: document.getElementById('modelCategory'),
    modelTags: document.getElementById('modelTags'),
    thumbnailUrl: document.getElementById('thumbnailUrl'),
    addModelBtn: document.getElementById('addModelBtn'),
    clearForm: document.getElementById('clearForm'),
    adminModelsList: document.getElementById('adminModelsList'),
    modelsCount: document.getElementById('modelsCount'),
    resetSecurity: document.getElementById('resetSecurity'),
    exportData: document.getElementById('exportData'),

    // Toast
    toastContainer: document.getElementById('toastContainer'),

    // FAB
    fabUpload: document.getElementById('fabUpload'),
    fabScrollTop: document.getElementById('fabScrollTop')
};

// Initialize Application
async function init() {
    try {
        showLoading(true);
        
        // Setup event listeners
        setupEventListeners();
        
        // Load initial data
        await loadModels();
        
        // Update UI
        updateStats();
        populateCategories();
        renderModels();
        
        // Start auto-refresh
        startAutoRefresh();
        
        // Check admin status
        checkAdminStatus();
        
        State.isInitialized = true;
        
        // Show welcome message
        showToast('Welcome to Divine 3D Gallery! Explore sacred models.', 'success');
        
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Failed to initialize gallery', 'error');
        
        // Load sample models as fallback
        loadSampleModels();
    } finally {
        showLoading(false);
    }
}

// ============================================
// DATA LOADING FUNCTIONS
// ============================================

async function loadModels() {
    try {
        State.isLoading = true;
        updateLoadingIndicator(true);
        
        console.log('Loading models from:', CONFIG.MODELS_JSON_URL);
        
        const response = await fetch(CONFIG.MODELS_JSON_URL, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format: expected array');
        }
        
        // Process and validate models
        State.models = await Promise.all(
            data.map(async (model, index) => {
                const processedModel = {
                    id: model.id || `model_${Date.now()}_${index}`,
                    name: model.name || 'Unnamed Model',
                    description: model.description || '',
                    category: model.category || model.tags?.[0] || 'Uncategorized',
                    tags: Array.isArray(model.tags) ? model.tags : [],
                    glbUrl: model.glbUrl,
                    thumbnailUrl: model.thumbnailUrl || '',
                    fileSize: model.fileSize || 'Unknown',
                    createdAt: model.createdAt || model.uploadDate || new Date().toISOString(),
                    updatedAt: model.updatedAt || model.uploadDate || new Date().toISOString(),
                    downloads: model.downloadCount || model.downloads || 0,
                    rating: model.rating || 0
                };
                
                // Validate GLB URL
                if (!processedModel.glbUrl) {
                    console.warn('Model missing GLB URL:', processedModel.name);
                }
                
                return processedModel;
            })
        ).then(models => models.filter(model => model.glbUrl)); // Filter out models without GLB URL
        
        // Update categories
        State.categories.clear();
        State.models.forEach(model => {
            if (model.category) {
                State.categories.add(model.category);
            }
        });
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Update filtered models
        filterAndSortModels();
        
        console.log(`Successfully loaded ${State.models.length} models`);
        
    } catch (error) {
        console.error('Error loading models:', error);
        showToast(`Failed to load models: ${error.message}`, 'error');
        
        // Fallback to localStorage or sample models
        if (!loadFromLocalStorage()) {
            loadSampleModels();
        }
    } finally {
        State.isLoading = false;
        updateLoadingIndicator(false);
    }
}

function loadSampleModels() {
    State.models = CONFIG.SAMPLE_MODELS;
    State.categories.clear();
    State.models.forEach(model => {
        if (model.category) {
            State.categories.add(model.category);
        }
    });
    
    showToast('Loaded sample models. Add your own via Admin Panel.', 'info');
    filterAndSortModels();
    updateStats();
    populateCategories();
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            
            // Check if data is not too old (7 days)
            const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            if (data.timestamp && new Date(data.timestamp).getTime() > oneWeekAgo) {
                State.models = data.models || [];
                State.categories = new Set(data.categories || []);
                State.isAdmin = data.isAdmin || false;
                
                // Update admin UI if needed
                if (State.isAdmin) {
                    showAdminDashboard();
                }
                
                filterAndSortModels();
                updateStats();
                populateCategories();
                
                console.log('Loaded from localStorage:', State.models.length, 'models');
                return true;
            }
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
    return false;
}

function saveToLocalStorage() {
    try {
        const data = {
            models: State.models,
            categories: Array.from(State.categories),
            isAdmin: State.isAdmin,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// ============================================
// GLB SECURITY SYSTEM
// ============================================

function checkFilenameSignature(filename) {
    return filename.includes(CONFIG.GLB_SECURITY.FILENAME_SIGNATURE);
}

async function checkInternalGLBSignature(file) {
    return new Promise((resolve) => {
        try {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const arrayBuffer = e.target.result;
                    const dataView = new DataView(arrayBuffer);
                    
                    // Check GLB magic number
                    const magic = dataView.getUint32(0, true);
                    if (magic !== 0x46546C67) { // "glTF"
                        resolve(false);
                        return;
                    }
                    
                    // Try to find JSON chunk
                    const length = dataView.getUint32(8, true);
                    let offset = 12;
                    
                    for (let i = 0; i < 2; i++) { // Check first 2 chunks
                        if (offset >= length) break;
                        
                        const chunkLength = dataView.getUint32(offset, true);
                        const chunkType = dataView.getUint32(offset + 4, true);
                        
                        if (chunkType === 0x4E4F534A) { // "JSON"
                            const jsonChunk = new Uint8Array(arrayBuffer, offset + 8, chunkLength);
                            const jsonText = new TextDecoder().decode(jsonChunk);
                            
                            try {
                                const gltf = JSON.parse(jsonText);
                                // Check for internal signature
                                const hasValidSignature = gltf.asset && 
                                                        gltf.asset.signature === CONFIG.GLB_SECURITY.INTERNAL_SIGNATURE;
                                resolve(hasValidSignature);
                                return;
                            } catch (parseError) {
                                console.warn('Failed to parse GLB JSON:', parseError);
                            }
                        }
                        
                        offset += 8 + chunkLength;
                    }
                    
                    resolve(false);
                } catch (error) {
                    console.warn('GLB signature check error:', error);
                    resolve(false);
                }
            };
            
            reader.onerror = () => resolve(false);
            reader.readAsArrayBuffer(file);
            
        } catch (error) {
            console.warn('GLB check setup error:', error);
            resolve(false);
        }
    });
}

async function validateGLBFile(file) {
    try {
        // Check file extension
        if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
            throw new Error('File must be GLB or GLTF format');
        }
        
        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            throw new Error('File size must be less than 50MB');
        }
        
        // Check filename signature
        if (!checkFilenameSignature(file.name)) {
            throw new Error(`Filename must contain "${CONFIG.GLB_SECURITY.FILENAME_SIGNATURE}"`);
        }
        
        // Check internal signature
        const hasValidSignature = await checkInternalGLBSignature(file);
        if (!hasValidSignature) {
            throw new Error('Invalid GLB signature. File must be created with Divine Mantra tools.');
        }
        
        return true;
        
    } catch (error) {
        throw error;
    }
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

function updateStats() {
    Elements.totalModels.textContent = State.models.length;
}

function updateLoadingIndicator(show) {
    if (show) {
        Elements.loadingIndicator.style.display = 'flex';
        Elements.refreshBtn.classList.add('loading');
    } else {
        Elements.loadingIndicator.style.display = 'none';
        Elements.refreshBtn.classList.remove('loading');
    }
}

function showLoading(show) {
    if (show) {
        Elements.loadingScreen.style.opacity = '1';
        Elements.loadingScreen.style.visibility = 'visible';
    } else {
        Elements.loadingScreen.style.opacity = '0';
        Elements.loadingScreen.style.visibility = 'hidden';
    }
}

function populateCategories() {
    // Clear existing
    Elements.categoriesContainer.innerHTML = '';
    Elements.categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add "All" category first
    const allCategory = document.createElement('div');
    allCategory.className = 'category-card';
    allCategory.innerHTML = `
        <div class="category-icon">✨</div>
        <div class="category-name">All Models</div>
        <div class="category-count">${State.models.length} models</div>
    `;
    allCategory.onclick = () => filterByCategory('all');
    Elements.categoriesContainer.appendChild(allCategory);
    
    // Add actual categories
    State.categories.forEach(category => {
        const count = State.models.filter(m => m.category === category).length;
        
        // Category card
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-icon">🎨</div>
            <div class="category-name">${category}</div>
            <div class="category-count">${count} models</div>
        `;
        card.onclick = () => filterByCategory(category);
        Elements.categoriesContainer.appendChild(card);
        
        // Filter option
        const option = document.createElement('option');
        option.value = category;
        option.textContent = `${category} (${count})`;
        Elements.categoryFilter.appendChild(option);
    });
}

function renderModels() {
    if (State.isLoading) return;
    
    Elements.galleryContainer.innerHTML = '';
    
    if (State.filteredModels.length === 0) {
        Elements.noResults.style.display = 'block';
        Elements.loadingIndicator.style.display = 'none';
        return;
    }
    
    Elements.noResults.style.display = 'none';
    
    const container = document.createElement('div');
    container.className = State.viewMode === 'grid' ? 'models-grid' : 'models-list';
    
    State.filteredModels.forEach((model, index) => {
        const card = createModelCard(model, index);
        container.appendChild(card);
    });
    
    Elements.galleryContainer.appendChild(container);
}

function createModelCard(model, index) {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Check if model has secure signature
    const isSecure = model.glbUrl && model.glbUrl.includes(CONFIG.GLB_SECURITY.FILENAME_SIGNATURE);
    
    // Thumbnail or placeholder
    let thumbnailHTML = '';
    if (model.thumbnailUrl) {
        thumbnailHTML = `
            <img src="${model.thumbnailUrl}" 
                 alt="${model.name}" 
                 onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\"thumbnail-placeholder\">🎨</div>'">
        `;
    } else {
        thumbnailHTML = '<div class="thumbnail-placeholder">🎨</div>';
    }
    
    card.innerHTML = `
        <div class="model-thumbnail">
            ${thumbnailHTML}
            <span class="model-badge">${model.category}</span>
            ${isSecure ? '<span class="model-badge" style="left: auto; right: 1rem; background: var(--success);">🔒 Secure</span>' : ''}
        </div>
        <div class="model-content">
            <div class="model-header">
                <h4 class="model-title">${model.name}</h4>
                <span class="model-category">${model.category}</span>
            </div>
            <p class="model-description">${model.description}</p>
            <div class="model-meta">
                <span>${model.fileSize}</span>
                <span>${formatDate(model.createdAt)}</span>
                <span>${model.downloads.toLocaleString()} downloads</span>
            </div>
            <div class="model-actions">
                <button class="action-btn preview-btn">
                    <i class="fas fa-eye"></i> Preview 3D
                </button>
                <button class="action-btn download-btn">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const previewBtn = card.querySelector('.preview-btn');
    const downloadBtn = card.querySelector('.download-btn');
    
    previewBtn.onclick = (e) => {
        e.stopPropagation();
        openPreview(model);
    };
    
    downloadBtn.onclick = (e) => {
        e.stopPropagation();
        downloadModel(model);
    };
    
    card.onclick = () => openPreview(model);
    
    return card;
}

// ============================================
// FILTER AND SORT FUNCTIONS
// ============================================

function filterAndSortModels() {
    let filtered = [...State.models];
    
    // Apply search filter
    if (State.searchQuery) {
        const query = State.searchQuery.toLowerCase();
        filtered = filtered.filter(model => 
            model.name.toLowerCase().includes(query) ||
            model.description.toLowerCase().includes(query) ||
            model.category.toLowerCase().includes(query) ||
            model.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }
    
    // Apply category filter
    if (State.currentCategory !== 'all') {
        filtered = filtered.filter(model => model.category === State.currentCategory);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        switch (State.sortBy) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'popular':
                return b.downloads - a.downloads;
            default:
                return 0;
        }
    });
    
    State.filteredModels = filtered;
    renderModels();
}

function filterByCategory(category) {
    State.currentCategory = category;
    Elements.categoryFilter.value = category;
    filterAndSortModels();
    scrollToSection('gallery');
}

function searchModels(query) {
    State.searchQuery = query;
    filterAndSortModels();
}

function sortModels(sortBy) {
    State.sortBy = sortBy;
    filterAndSortModels();
}

function clearFilters() {
    State.searchQuery = '';
    State.currentCategory = 'all';
    State.sortBy = 'name-asc';
    
    Elements.gallerySearch.value = '';
    Elements.categoryFilter.value = 'all';
    Elements.sortSelect.value = 'name-asc';
    
    filterAndSortModels();
}

// ============================================
// PREVIEW MODAL FUNCTIONS
// ============================================

function openPreview(model) {
    State.currentPreviewModel = model;
    
    // Update modal content
    Elements.previewTitle.textContent = model.name;
    Elements.previewSubtitle.textContent = model.category;
    Elements.previewName.textContent = model.name;
    Elements.previewCategory.textContent = model.category;
    Elements.previewSize.textContent = model.fileSize;
    Elements.previewDate.textContent = formatDate(model.createdAt);
    Elements.previewDescription.textContent = model.description || 'No description available.';
    
    // Update tags
    Elements.previewTags.innerHTML = '';
    if (model.tags && model.tags.length > 0) {
        model.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            Elements.previewTags.appendChild(tagElement);
        });
    }
    
    // Load model in viewer
    Elements.previewViewer.src = model.glbUrl;
    
    // Reset viewer controls
    Elements.previewViewer.autoRotate = State.autoRotateEnabled;
    Elements.rotateToggle.classList.toggle('active', State.autoRotateEnabled);
    
    // Show modal
    Elements.previewModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePreview() {
    Elements.previewModal.classList.remove('active');
    document.body.style.overflow = '';
    Elements.previewViewer.src = '';
    State.currentPreviewModel = null;
}

// ============================================
// MODEL DOWNLOAD FUNCTIONS
// ============================================

async function downloadModel(model) {
    try {
        showToast(`Downloading ${model.name}...`, 'info');
        
        // Check if model has secure signature
        if (!model.glbUrl.includes(CONFIG.GLB_SECURITY.FILENAME_SIGNATURE)) {
            showToast('Warning: This model is not verified', 'warning');
        }
        
        // Create download link
        const a = document.createElement('a');
        a.href = model.glbUrl;
        a.download = `${model.name.replace(/\s+/g, '_')}_${CONFIG.GLB_SECURITY.FILENAME_SIGNATURE}.glb`;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
        }, 100);
        
        // Update download count
        model.downloads = (model.downloads || 0) + 1;
        saveToLocalStorage();
        
        showToast(`${model.name} download started!`, 'success');
        
    } catch (error) {
        console.error('Download error:', error);
        showToast(`Failed to download: ${error.message}`, 'error');
    }
}

async function copyModelUrl() {
    if (!State.currentPreviewModel) return;
    
    try {
        await navigator.clipboard.writeText(State.currentPreviewModel.glbUrl);
        showToast('Model URL copied to clipboard!', 'success');
    } catch (error) {
        console.error('Copy error:', error);
        showToast('Failed to copy URL', 'error');
    }
}

async function shareModel() {
    if (!State.currentPreviewModel) return;
    
    try {
        if (navigator.share) {
            await navigator.share({
                title: State.currentPreviewModel.name,
                text: State.currentPreviewModel.description,
                url: window.location.href + '#preview'
            });
        } else {
            await navigator.clipboard.writeText(window.location.href);
            showToast('Link copied to clipboard!', 'success');
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Share error:', error);
            showToast('Failed to share', 'error');
        }
    }
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

function openAdminPanel() {
    Elements.adminOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateAdminModelList();
}

function closeAdminPanel() {
    Elements.adminOverlay.classList.remove('active');
    document.body.style.overflow = '';
    clearUploadForm();
}

function showAdminDashboard() {
    Elements.adminLogin.style.display = 'none';
    Elements.adminDashboard.style.display = 'block';
    State.isAdmin = true;
    saveToLocalStorage();
    updateAdminStatus('Ready');
}

function hideAdminDashboard() {
    Elements.adminDashboard.style.display = 'none';
    Elements.adminLogin.style.display = 'block';
    Elements.adminPassword.value = '';
    State.isAdmin = false;
    saveToLocalStorage();
}

function checkAdminStatus() {
    if (State.isAdmin) {
        showAdminDashboard();
    }
}

function updateAdminModelList() {
    Elements.adminModelsList.innerHTML = '';
    Elements.modelsCount.textContent = State.models.length;
    
    State.models.forEach((model, index) => {
        const item = document.createElement('div');
        item.className = 'admin-model-item';
        item.innerHTML = `
            <div class="model-thumb-small">
                ${model.thumbnailUrl 
                    ? `<img src="${model.thumbnailUrl}" alt="${model.name}" 
                         onerror="this.onerror=null;this.parentElement.innerHTML='<div style=\"width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(45deg,#8b5cf6,#3b82f6);color:white;\">🎨</div>'">`
                    : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(45deg,#8b5cf6,#3b82f6);color:white;">🎨</div>'
                }
            </div>
            <div class="model-info-small">
                <h6>${model.name}</h6>
                <span>${model.category} • ${model.downloads} downloads</span>
            </div>
            <div class="model-actions-small">
                <button class="action-btn-small preview-btn" title="Preview">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn-small delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        const previewBtn = item.querySelector('.preview-btn');
        const deleteBtn = item.querySelector('.delete-btn');
        
        previewBtn.onclick = (e) => {
            e.stopPropagation();
            closeAdminPanel();
            setTimeout(() => openPreview(model), 300);
        };
        
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Delete "${model.name}"? This action cannot be undone.`)) {
                deleteModelFromGallery(model.id);
            }
        };
        
        Elements.adminModelsList.appendChild(item);
    });
}

async function handleFileUpload(file) {
    try {
        updateAdminStatus('Validating file...');
        
        // Validate file
        await validateGLBFile(file);
        
        // Show file info
        Elements.fileInfo.style.display = 'flex';
        Elements.fileName.textContent = file.name;
        Elements.fileSize.textContent = formatFileSize(file.size);
        Elements.fileStatus.textContent = '✓ Secure';
        Elements.fileStatus.className = 'status-valid';
        
        State.uploadedFile = file;
        
        // Auto-fill model name from filename
        if (!Elements.modelName.value) {
            const name = file.name
                .replace(CONFIG.GLB_SECURITY.FILENAME_SIGNATURE, '')
                .replace(/\.glb$/i, '')
                .replace(/[_-]/g, ' ')
                .trim();
            Elements.modelName.value = name.charAt(0).toUpperCase() + name.slice(1);
        }
        
        updateAdminStatus('File validated successfully');
        showToast('File is secure and ready for upload', 'success');
        
    } catch (error) {
        console.error('File validation error:', error);
        Elements.fileInfo.style.display = 'flex';
        Elements.fileName.textContent = file.name;
        Elements.fileSize.textContent = formatFileSize(file.size);
        Elements.fileStatus.textContent = '✗ Invalid';
        Elements.fileStatus.className = 'status-invalid';
        
        updateAdminStatus('File validation failed');
        showToast(`File validation failed: ${error.message}`, 'error');
        
        State.uploadedFile = null;
    }
}

async function addModelToGallery() {
    try {
        if (!State.uploadedFile) {
            throw new Error('Please upload a GLB file first');
        }
        
        if (!Elements.modelName.value.trim()) {
            throw new Error('Please enter a model name');
        }
        
        updateAdminStatus('Adding model to gallery...');
        
        // In a real implementation, you would upload the file to a server
        // For now, we'll create a local URL
        const objectUrl = URL.createObjectURL(State.uploadedFile);
        
        const newModel = {
            id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: Elements.modelName.value.trim(),
            description: Elements.modelDescription.value.trim(),
            category: Elements.modelCategory.value || 'Spiritual',
            tags: Elements.modelTags.value.split(',').map(t => t.trim()).filter(t => t),
            glbUrl: objectUrl, // In production, this would be a server URL
            thumbnailUrl: Elements.thumbnailUrl.value.trim() || '',
            fileSize: formatFileSize(State.uploadedFile.size),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            downloads: 0,
            rating: 0
        };
        
        // Add to beginning of array
        State.models.unshift(newModel);
        State.categories.add(newModel.category);
        
        // Update UI
        saveToLocalStorage();
        updateStats();
        populateCategories();
        filterAndSortModels();
        updateAdminModelList();
        
        // Clear form
        clearUploadForm();
        
        updateAdminStatus('Model added successfully');
        showToast(`${newModel.name} added to gallery!`, 'success');
        
        // Auto-close panel after success
        setTimeout(() => {
            closeAdminPanel();
        }, 1500);
        
    } catch (error) {
        console.error('Add model error:', error);
        updateAdminStatus('Failed to add model');
        showToast(`Failed to add model: ${error.message}`, 'error');
    }
}

function deleteModelFromGallery(modelId) {
    const index = State.models.findIndex(m => m.id === modelId);
    if (index === -1) return;
    
    const modelName = State.models[index].name;
    State.models.splice(index, 1);
    
    // Recalculate categories
    State.categories.clear();
    State.models.forEach(m => State.categories.add(m.category));
    
    // Update UI
    saveToLocalStorage();
    updateStats();
    populateCategories();
    filterAndSortModels();
    updateAdminModelList();
    
    showToast(`${modelName} deleted from gallery`, 'info');
}

function clearUploadForm() {
    Elements.modelName.value = '';
    Elements.modelDescription.value = '';
    Elements.modelTags.value = '';
    Elements.thumbnailUrl.value = '';
    Elements.modelFile.value = '';
    Elements.fileInfo.style.display = 'none';
    State.uploadedFile = null;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || 'ℹ'}</div>
        <div class="toast-content">
            <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    };
    
    Elements.toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateAdminStatus(message, type = 'ready') {
    const icon = Elements.adminStatus.querySelector('i');
    const text = Elements.adminStatus.querySelector('span');
    
    text.textContent = message;
    
    if (type === 'loading') {
        icon.className = 'fas fa-circle status-loading';
    } else if (type === 'error') {
        icon.className = 'fas fa-circle';
        icon.style.color = 'var(--error)';
    } else if (type === 'success') {
        icon.className = 'fas fa-circle';
        icon.style.color = 'var(--success)';
    } else {
        icon.className = 'fas fa-circle status-ready';
    }
}

// ============================================
// AUTO REFRESH
// ============================================

function startAutoRefresh() {
    if (State.refreshInterval) {
        clearInterval(State.refreshInterval);
    }
    
    State.refreshInterval = setInterval(async () => {
        if (!State.isLoading && document.visibilityState === 'visible') {
            console.log('Auto-refreshing models...');
            await loadModels();
        }
    }, CONFIG.REFRESH_INTERVAL);
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

function setupEventListeners() {
    // Theme toggle
    Elements.themeToggle.onclick = () => {
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    };
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    }
    
    // Header scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            Elements.mainHeader.classList.add('scrolled');
        } else {
            Elements.mainHeader.classList.remove('scrolled');
        }
        
        // Show/hide scroll to top FAB
        if (window.scrollY > 500) {
            Elements.fabScrollTop.style.opacity = '1';
            Elements.fabScrollTop.style.visibility = 'visible';
            Elements.fabScrollTop.style.transform = 'translateY(0)';
        } else {
            Elements.fabScrollTop.style.opacity = '0';
            Elements.fabScrollTop.style.visibility = 'hidden';
            Elements.fabScrollTop.style.transform = 'translateY(20px)';
        }
    });
    
    // Navigation
    Elements.navToggle.onclick = () => {
        Elements.navLinks.classList.toggle('active');
    };
    
    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
        if (!Elements.navToggle.contains(e.target) && !Elements.navLinks.contains(e.target)) {
            Elements.navLinks.classList.remove('active');
        }
    });
    
    // Search
    Elements.searchBtn.onclick = () => {
        searchModels(Elements.searchInput.value);
    };
    
    Elements.searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchModels(Elements.searchInput.value);
        }
    });
    
    Elements.gallerySearch.addEventListener('input', (e) => {
        searchModels(e.target.value);
    });
    
    // Filters
    Elements.categoryFilter.addEventListener('change', (e) => {
        filterByCategory(e.target.value);
    });
    
    Elements.clearFilters.onclick = clearFilters;
    
    Elements.sortSelect.addEventListener('change', (e) => {
        sortModels(e.target.value);
    });
    
    // View mode
    Elements.viewBtns.forEach(btn => {
        btn.onclick = () => {
            Elements.viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            State.viewMode = btn.dataset.view;
            renderModels();
        };
    });
    
    // Refresh
    Elements.refreshBtn.onclick = async () => {
        Elements.refreshBtn.classList.add('loading');
        await loadModels();
        Elements.refreshBtn.classList.remove('loading');
        showToast('Models refreshed!', 'success');
    };
    
    // Admin
    Elements.adminBtn.onclick = openAdminPanel;
    Elements.closeAdmin.onclick = closeAdminPanel;
    Elements.fabUpload.onclick = openAdminPanel;
    
    Elements.loginBtn.onclick = () => {
        if (Elements.adminPassword.value === CONFIG.ADMIN_PASSWORD) {
            showAdminDashboard();
            showToast('Admin panel unlocked!', 'success');
        } else {
            showToast('Incorrect password', 'error');
        }
    };
    
    Elements.logoutBtn.onclick = () => {
        hideAdminDashboard();
        showToast('Logged out from admin panel', 'info');
    };
    
    // Admin tabs
    Elements.tabBtns.forEach(btn => {
        btn.onclick = () => {
            // Update active tab
            Elements.tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding pane
            const tabId = btn.dataset.tab;
            Elements.tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === `${tabId}Tab`) {
                    pane.classList.add('active');
                }
            });
        };
    });
    
    // File upload
    Elements.uploadArea.onclick = () => Elements.modelFile.click();
    Elements.modelFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    Elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        Elements.uploadArea.style.borderColor = 'var(--accent-purple)';
        Elements.uploadArea.style.background = 'rgba(139, 92, 246, 0.1)';
    });
    
    Elements.uploadArea.addEventListener('dragleave', () => {
        Elements.uploadArea.style.borderColor = '';
        Elements.uploadArea.style.background = '';
    });
    
    Elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        Elements.uploadArea.style.borderColor = '';
        Elements.uploadArea.style.background = '';
        
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
    
    Elements.removeFile.onclick = () => {
        Elements.fileInfo.style.display = 'none';
        Elements.modelFile.value = '';
        State.uploadedFile = null;
    };
    
    // Add model
    Elements.addModelBtn.onclick = addModelToGallery;
    Elements.clearForm.onclick = clearUploadForm;
    
    // Security actions
    Elements.resetSecurity.onclick = () => {
        if (confirm('Reset all security settings to defaults?')) {
            showToast('Security settings reset', 'info');
        }
    };
    
    Elements.exportData.onclick = () => {
        const dataStr = JSON.stringify(State.models, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'divine_models_export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Data exported successfully', 'success');
    };
    
    // Preview modal
    Elements.closePreview.onclick = closePreview;
    Elements.previewModal.onclick = (e) => {
        if (e.target === Elements.previewModal) {
            closePreview();
        }
    };
    
    Elements.downloadModel.onclick = () => {
        if (State.currentPreviewModel) {
            downloadModel(State.currentPreviewModel);
        }
    };
    
    Elements.copyUrl.onclick = copyModelUrl;
    Elements.shareModel.onclick = shareModel;
    
    Elements.rotateToggle.onclick = () => {
        State.autoRotateEnabled = !State.autoRotateEnabled;
        Elements.previewViewer.autoRotate = State.autoRotateEnabled;
        Elements.rotateToggle.classList.toggle('active', State.autoRotateEnabled);
        showToast(`Auto-rotate ${State.autoRotateEnabled ? 'enabled' : 'disabled'}`, 'info');
    };
    
    Elements.fullscreenToggle.onclick = () => {
        if (Elements.previewViewer.requestFullscreen) {
            Elements.previewViewer.requestFullscreen();
        }
    };
    
    Elements.resetView.onclick = () => {
        Elements.previewViewer.cameraOrbit = '0deg 75deg 105%';
        Elements.previewViewer.fieldOfView = '30deg';
    };
    
    // Scroll to top
    Elements.fabScrollTop.onclick = scrollToTop;
    
    // Upload guide
    if (Elements.uploadGuideBtn) {
        Elements.uploadGuideBtn.onclick = () => {
            scrollToSection('upload');
            showToast('Check upload requirements below', 'info');
        };
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // ESC to close modals
        if (e.key === 'Escape') {
            if (Elements.previewModal.classList.contains('active')) {
                closePreview();
            }
            if (Elements.adminOverlay.classList.contains('active')) {
                closeAdminPanel();
            }
        }
        
        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            Elements.searchInput.focus();
        }
        
        // Ctrl/Cmd + K to open admin
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openAdminPanel();
        }
    });
    
    // Handle model viewer errors
    Elements.previewViewer.addEventListener('error', (e) => {
        console.error('Model viewer error:', e);
        showToast('Failed to load 3D model', 'error');
    });
    
    // Initialize hero preview with sample model
    if (Elements.heroPreview && CONFIG.SAMPLE_MODELS.length > 0) {
        Elements.heroPreview.src = CONFIG.SAMPLE_MODELS[0].glbUrl;
    }
}

// ============================================
// INITIALIZE
// ============================================

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Expose key functions to global scope for HTML event handlers
window.openPreview = openPreview;
window.downloadModel = downloadModel;
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.scrollToSection = scrollToSection;
window.scrollToTop = scrollToTop;
window.clearFilters = clearFilters;
window.filterByCategory = filterByCategory;

// Service Worker for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}
