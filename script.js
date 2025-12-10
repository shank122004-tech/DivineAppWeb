// Divine 3D Models Gallery - Complete JavaScript

// Configuration
const CONFIG = {
    GITHUB_USERNAME: "shank122004-tech",
    GITHUB_REPO: "DivineAppWeb",
    MODELS_JSON_URL: "https://github.com/shank122004-tech/DivineAppWeb/models.json",
    
    // Backend API URLs
    BACKEND_URL: "https://your-backend-url.com",
    REQUEST_UPLOAD_ENDPOINT: "/api/request-upload",
    COMPLETE_UPLOAD_ENDPOINT: "/api/complete-upload",
    
    // Auto-refresh settings
    AUTO_REFRESH_INTERVAL: 20000, // 20 seconds
    RETRY_DELAY: 5000, // 5 seconds for retry
    
    // UI Settings
    MAX_MODELS: 100,
    ITEMS_PER_ROW: 4,
    MOBILE_BREAKPOINT: 768,
    
    // Default models for initial state
    DEFAULT_MODELS: [
  {
    "id": "test_model_1",
    "name": "Divine Krishna Statue",
    "description": "Beautiful 3D model of Lord Krishna",
    "glbUrl": "https://shank122004-tech.github.io/DivineAppWeb/models/hanuman_gada@divinemantra.glb",
    "thumbnailUrl": "https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?w=400&h=300&fit=crop",
    "tags": ["hindu", "krishna", "divine", "statue"],
    "uploadDate": "2024-01-15",
    "fileSize": 4500000,
    "rating": 4.8,
    "downloadCount": 1250
  },
  {
    "id": "test_model_1",
    "name": "Divine Krishna Statue",
    "description": "Beautiful 3D model of Lord Krishna",
    "glbUrl": "https://shank122004-tech.github.io/DivineAppWeb/models/hanuman_gada@divinemantra.glb",
    "thumbnailUrl": "https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?w=400&h=300&fit=crop",
    "tags": ["hindu", "krishna", "divine", "statue"],
    "uploadDate": "2024-01-15",
    "fileSize": 4500000,
    "rating": 4.8,
    "downloadCount": 1250
  },
        {
            id: "sample-3",
            name: "Sacred Mandala",
            filename: "mandala_sacred.glb",
            url: "https://github.com/your-username/your-repo/raw/main/models/mandala.glb",
            thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop",
            category: "mandala",
            description: "Intricate sacred mandala pattern for spiritual visualization",
            source: "github",
            uploadDate: new Date().toISOString()
        }
    ]
};

// Global State
let state = {
    models: [],
    filteredModels: [],
    categories: new Set(['all']),
    searchQuery: '',
    selectedCategory: 'all',
    sortBy: 'name',
    isLoading: false,
    lastUpdate: null,
    currentUpload: null,
    autoRefreshInterval: null,
    retryCount: 0,
    maxRetries: 3
};

// DOM Elements Cache
let elements = {};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing Divine 3D Models Gallery...');
    
    try {
        // Cache DOM elements
        cacheElements();
        
        // Initialize UI
        initializeUI();
        
        // Set up event listeners
        setupEventListeners();
        
        // Load initial models
        await loadModels();
        
        // Start auto-refresh
        startAutoRefresh();
        
        // Update time display
        updateCurrentTime();
        setInterval(updateCurrentTime, 1000);
        
        console.log('✅ Application initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showNotification('Failed to initialize application', 'error');
    }
});

// Cache DOM Elements
function cacheElements() {
    elements = {
        // Loading
        loadingOverlay: document.getElementById('loadingOverlay'),
        
        // Header
        refreshTimer: document.getElementById('refreshTimer'),
        totalModels: document.getElementById('totalModels'),
        quickUploadBtn: document.getElementById('quickUploadBtn'),
        
        // Hero Section
        jsonSourceDisplay: document.getElementById('jsonSourceDisplay'),
        lastUpdateDisplay: document.getElementById('lastUpdateDisplay'),
        
        // Upload Section
        modelName: document.getElementById('modelName'),
        modelCategory: document.getElementById('modelCategory'),
        modelDescription: document.getElementById('modelDescription'),
        modelFile: document.getElementById('modelFile'),
        fileUploadArea: document.getElementById('fileUploadArea'),
        browseFileBtn: document.getElementById('browseFileBtn'),
        fileName: document.getElementById('fileName'),
        fileSize: document.getElementById('fileSize'),
        fileInfo: document.getElementById('fileInfo'),
        uploadBtn: document.getElementById('uploadBtn'),
        cancelUploadBtn: document.getElementById('cancelUploadBtn'),
        uploadProgress: document.getElementById('uploadProgress'),
        progressFill: document.getElementById('progressFill'),
        progressText: document.getElementById('progressText'),
        progressPercent: document.getElementById('progressPercent'),
        
        // Search and Filter
        searchInput: document.getElementById('searchInput'),
        clearSearch: document.getElementById('clearSearch'),
        categoryFilter: document.getElementById('categoryFilter'),
        sortBy: document.getElementById('sortBy'),
        refreshBtn: document.getElementById('refreshBtn'),
        
        // Models Grid
        modelsGrid: document.getElementById('modelsGrid'),
        emptyState: document.getElementById('emptyState'),
        loadingState: document.getElementById('loadingState'),
        visibleModels: document.getElementById('visibleModels'),
        totalModelsCount: document.getElementById('totalModelsCount'),
        loadSampleBtn: document.getElementById('loadSampleBtn'),
        
        // Info Panel
        lastChecked: document.getElementById('lastChecked'),
        nextRefresh: document.getElementById('nextRefresh'),
        jsonSource: document.getElementById('jsonSource'),
        lastUpdateTime: document.getElementById('lastUpdateTime'),
        
        // Footer
        currentTime: document.getElementById('currentTime'),
        
        // Modals
        previewModal: document.getElementById('previewModal'),
        modelViewer: document.getElementById('modelViewer'),
        modalTitle: document.getElementById('modalTitle'),
        modelInfoName: document.getElementById('modelInfoName'),
        modelInfoCategory: document.getElementById('modelInfoCategory'),
        modelInfoDesc: document.getElementById('modelInfoDesc'),
        modelInfoSource: document.getElementById('modelInfoSource'),
        modelInfoFileName: document.getElementById('modelInfoFileName'),
        modelInfoUrl: document.getElementById('modelInfoUrl'),
        closeModal: document.getElementById('closeModal'),
        downloadBtn: document.getElementById('downloadBtn'),
        copyUrlBtn: document.getElementById('copyUrlBtn'),
        closePreviewBtn: document.getElementById('closePreviewBtn'),
        
        // Upload Success Modal
        uploadSuccessModal: document.getElementById('uploadSuccessModal'),
        uploadedModelName: document.getElementById('uploadedModelName'),
        uploadedCategory: document.getElementById('uploadedCategory'),
        uploadedFileName: document.getElementById('uploadedFileName'),
        
        // Notifications
        notifications: document.getElementById('notifications')
    };
}

// Initialize UI
function initializeUI() {
    // Hide loading overlay after 1 second
    setTimeout(() => {
        elements.loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            elements.loadingOverlay.style.display = 'none';
        }, 300);
    }, 1000);
    
    // Initialize file upload area
    elements.fileUploadArea.addEventListener('click', () => elements.modelFile.click());
    elements.fileUploadArea.addEventListener('dragover', handleDragOver);
    elements.fileUploadArea.addEventListener('drop', handleFileDrop);
    elements.browseFileBtn.addEventListener('click', () => elements.modelFile.click());
    
    // Update UI state
    updateRefreshTimer();
    updateLastUpdateTime();
}

// Set up Event Listeners
function setupEventListeners() {
    // Search
    elements.searchInput.addEventListener('input', handleSearch);
    elements.clearSearch.addEventListener('click', clearSearch);
    
    // Filter and Sort
    elements.categoryFilter.addEventListener('change', handleCategoryFilter);
    elements.sortBy.addEventListener('change', handleSortChange);
    
    // Refresh Button
    elements.refreshBtn.addEventListener('click', () => loadModels(true));
    
    // Upload
    elements.modelFile.addEventListener('change', handleFileSelect);
    elements.uploadBtn.addEventListener('click', handleUpload);
    elements.cancelUploadBtn.addEventListener('click', resetUploadForm);
    elements.quickUploadBtn.addEventListener('click', () => {
        elements.fileUploadArea.scrollIntoView({ behavior: 'smooth' });
        elements.modelName.focus();
    });
    
    // Sample Models
    elements.loadSampleBtn.addEventListener('click', loadSampleModels);
    
    // Modal
    elements.closeModal.addEventListener('click', closePreviewModal);
    elements.closePreviewBtn.addEventListener('click', closePreviewModal);
    elements.downloadBtn.addEventListener('click', downloadCurrentModel);
    elements.copyUrlBtn.addEventListener('click', copyModelUrl);
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === elements.previewModal) {
            closePreviewModal();
        }
        if (e.target === elements.uploadSuccessModal) {
            closeUploadSuccessModal();
        }
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePreviewModal();
            closeUploadSuccessModal();
        }
    });
    
    // Window resize
    window.addEventListener('resize', handleResize);
}

// Load Models from GitHub
async function loadModels(forceRefresh = false) {
    if (state.isLoading && !forceRefresh) return;
    
    try {
        state.isLoading = true;
        showLoadingState(true);
        
        console.log('🌐 Fetching models from GitHub...');
        
        // Add cache busting for force refresh
        const url = forceRefresh 
            ? `${CONFIG.MODELS_JSON_URL}?_=${Date.now()}`
            : CONFIG.MODELS_JSON_URL;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const models = await response.json();
        
        if (!Array.isArray(models)) {
            throw new Error('Invalid JSON format: Expected array of models');
        }
        
        // Process models
        await processModels(models);
        
        // Update state
        state.lastUpdate = new Date();
        state.retryCount = 0;
        
        // Update UI
        updateLastUpdateTime();
        updateModelCount();
        updateCategories();
        filterAndRenderModels();
        
        // Show success notification
        if (forceRefresh) {
            showNotification(`${models.length} models loaded successfully`, 'success');
        }
        
        console.log(`✅ Loaded ${models.length} models from GitHub`);
        
    } catch (error) {
        console.error('❌ Failed to load models:', error);
        
        // Retry logic
        if (state.retryCount < state.maxRetries) {
            state.retryCount++;
            console.log(`🔄 Retrying... (${state.retryCount}/${state.maxRetries})`);
            
            setTimeout(() => loadModels(forceRefresh), CONFIG.RETRY_DELAY);
            showNotification(`Failed to load models. Retrying... (${state.retryCount}/${state.maxRetries})`, 'warning');
        } else {
            // Show error and load sample models
            showNotification('Failed to load models from GitHub. Loading sample models.', 'error');
            loadSampleModels();
        }
        
    } finally {
        state.isLoading = false;
        showLoadingState(false);
    }
}

// Process Models
async function processModels(models) {
    // Validate and normalize models
    const processedModels = models.map(model => ({
        id: model.id || `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: model.name || 'Unnamed Model',
        filename: model.filename || `${model.name.replace(/\s+/g, '_').toLowerCase()}.glb`,
        url: convertToRawGithubUrl(model.url || ''),
        thumbnail: model.thumbnail || getDefaultThumbnail(model.category),
        category: model.category || 'other',
        description: model.description || 'No description available',
        source: model.source || 'github',
        uploadDate: model.uploadDate || new Date().toISOString()
    })).filter(model => model.url); // Filter out models without URLs
    
    // Update state
    state.models = processedModels;
    state.filteredModels = [...processedModels];
    
    // Update categories
    processedModels.forEach(model => {
        state.categories.add(model.category);
    });
}

// Convert GitHub URL to Raw URL
function convertToRawGithubUrl(url) {
    if (!url) return '';
    
    try {
        // If already a raw URL, return as is
        if (url.includes('raw.githubusercontent.com')) {
            return url;
        }
        
        // Convert GitHub blob URL to raw URL
        if (url.includes('github.com') && url.includes('/blob/')) {
            return url
                .replace('github.com', 'raw.githubusercontent.com')
                .replace('/blob/', '/');
        }
        
        // Convert GitHub pages URL to raw URL
        if (url.includes('.github.io')) {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/').filter(p => p);
            const repo = pathParts[0] || CONFIG.GITHUB_REPO;
            const filePath = pathParts.slice(1).join('/');
            
            return `https://raw.githubusercontent.com/${CONFIG.GITHUB_USERNAME}/${repo}/main/${filePath}`;
        }
        
        return url;
    } catch (error) {
        console.error('Error converting GitHub URL:', error);
        return url;
    }
}

// Get Default Thumbnail
function getDefaultThumbnail(category) {
    const thumbnails = {
        hindu: 'https://images.unsplash.com/photo-1604617880299-c9c2f8a8f8b5?w=400&h=300&fit=crop',
        buddha: 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=400&h=300&fit=crop',
        sacred: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        meditation: 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=400&h=300&fit=crop',
        symbol: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop',
        statue: 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=400&h=300&fit=crop',
        mandala: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop',
        other: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop'
    };
    
    return thumbnails[category] || thumbnails.other;
}

// Filter and Render Models
function filterAndRenderModels() {
    let filtered = [...state.models];
    
    // Apply search filter
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(model =>
            model.name.toLowerCase().includes(query) ||
            model.description.toLowerCase().includes(query) ||
            model.category.toLowerCase().includes(query)
        );
    }
    
    // Apply category filter
    if (state.selectedCategory !== 'all') {
        filtered = filtered.filter(model => model.category === state.selectedCategory);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        switch (state.sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'newest':
                return new Date(b.uploadDate) - new Date(a.uploadDate);
            case 'category':
                return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });
    
    // Limit to max models
    filtered = filtered.slice(0, CONFIG.MAX_MODELS);
    
    // Update state
    state.filteredModels = filtered;
    
    // Render models
    renderModels(filtered);
    
    // Update UI
    updateVisibleModelCount();
    toggleEmptyState(filtered.length === 0);
}

// Render Models to Grid
function renderModels(models) {
    elements.modelsGrid.innerHTML = '';
    
    if (models.length === 0) {
        return;
    }
    
    models.forEach((model, index) => {
        const card = createModelCard(model, index);
        elements.modelsGrid.appendChild(card);
    });
}

// Create Model Card
function createModelCard(model, index) {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.dataset.id = model.id;
    
    // Add animation delay for staggered entrance
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Create card HTML
    card.innerHTML = `
        <div class="model-image">
            ${model.thumbnail ? 
                `<img src="${model.thumbnail}" alt="${model.name}" loading="lazy">` :
                `<i class="fas fa-cube"></i>`
            }
            <span class="model-badge">${model.category}</span>
        </div>
        <div class="model-content">
            <h3>${model.name}</h3>
            <p class="model-description">${model.description}</p>
            <div class="model-meta">
                <span class="model-category">${model.category}</span>
                <div class="model-actions">
                    <button class="model-action-btn preview-btn" title="Preview 3D">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="model-action-btn download-btn" title="Download GLB">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    const previewBtn = card.querySelector('.preview-btn');
    const downloadBtn = card.querySelector('.download-btn');
    
    previewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        previewModel(model);
    });
    
    downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadModel(model);
    });
    
    card.addEventListener('click', () => previewModel(model));
    
    return card;
}

// Preview Model
function previewModel(model) {
    // Update modal content
    elements.modalTitle.textContent = model.name;
    elements.modelInfoName.textContent = model.name;
    elements.modelInfoCategory.textContent = model.category;
    elements.modelInfoDesc.textContent = model.description;
    elements.modelInfoSource.textContent = model.source;
    elements.modelInfoFileName.textContent = model.filename;
    elements.modelInfoUrl.textContent = model.url;
    
    // Set model viewer source
    elements.modelViewer.src = model.url;
    
    // Store current model for download
    elements.downloadBtn.dataset.modelId = model.id;
    elements.copyUrlBtn.dataset.modelUrl = model.url;
    
    // Show modal
    elements.previewModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Preview Modal
function closePreviewModal() {
    elements.previewModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    elements.modelViewer.src = '';
}

// Download Current Model
function downloadCurrentModel() {
    const modelId = elements.downloadBtn.dataset.modelId;
    const model = state.models.find(m => m.id === modelId);
    
    if (model) {
        downloadModel(model);
    }
}

// Download Model
function downloadModel(model) {
    try {
        // Create download link
        const link = document.createElement('a');
        link.href = model.url;
        link.download = model.filename;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show notification
        showNotification(`Downloading ${model.name}...`, 'success');
        
    } catch (error) {
        console.error('Download failed:', error);
        showNotification('Download failed. Please try again.', 'error');
    }
}

// Copy Model URL
function copyModelUrl() {
    const url = elements.copyUrlBtn.dataset.modelUrl;
    
    navigator.clipboard.writeText(url)
        .then(() => {
            showNotification('URL copied to clipboard!', 'success');
        })
        .catch(err => {
            console.error('Failed to copy URL:', err);
            showNotification('Failed to copy URL', 'error');
        });
}

// Handle Search
function handleSearch(e) {
    state.searchQuery = e.target.value.trim();
    filterAndRenderModels();
    
    // Show/hide clear button
    elements.clearSearch.style.display = state.searchQuery ? 'block' : 'none';
}

// Clear Search
function clearSearch() {
    elements.searchInput.value = '';
    state.searchQuery = '';
    filterAndRenderModels();
    elements.clearSearch.style.display = 'none';
}

// Handle Category Filter
function handleCategoryFilter(e) {
    state.selectedCategory = e.target.value;
    filterAndRenderModels();
}

// Handle Sort Change
function handleSortChange(e) {
    state.sortBy = e.target.value;
    filterAndRenderModels();
}

// Update Categories Dropdown
function updateCategories() {
    elements.categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    Array.from(state.categories)
        .filter(cat => cat !== 'all')
        .sort()
        .forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            elements.categoryFilter.appendChild(option);
        });
    
    // Set selected category
    elements.categoryFilter.value = state.selectedCategory;
}

// Update Model Count
function updateModelCount() {
    const count = state.models.length;
    elements.totalModels.textContent = count;
    elements.totalModelsCount.textContent = count;
}

// Update Visible Model Count
function updateVisibleModelCount() {
    elements.visibleModels.textContent = state.filteredModels.length;
}

// Toggle Empty State
function toggleEmptyState(isEmpty) {
    if (isEmpty) {
        elements.emptyState.style.display = 'block';
        elements.modelsGrid.style.display = 'none';
    } else {
        elements.emptyState.style.display = 'none';
        elements.modelsGrid.style.display = 'grid';
    }
}

// Show Loading State
function showLoadingState(show) {
    if (show) {
        elements.loadingState.style.display = 'block';
        elements.modelsGrid.style.display = 'none';
        elements.emptyState.style.display = 'none';
    } else {
        elements.loadingState.style.display = 'none';
        elements.modelsGrid.style.display = 'grid';
    }
}

// Load Sample Models
function loadSampleModels() {
    state.models = CONFIG.DEFAULT_MODELS;
    state.filteredModels = [...CONFIG.DEFAULT_MODELS];
    state.categories = new Set(['all', ...CONFIG.DEFAULT_MODELS.map(m => m.category)]);
    
    updateModelCount();
    updateCategories();
    filterAndRenderModels();
    
    showNotification('Loaded sample models', 'info');
}

// Start Auto Refresh
function startAutoRefresh() {
    if (state.autoRefreshInterval) {
        clearInterval(state.autoRefreshInterval);
    }
    
    state.autoRefreshInterval = setInterval(() => {
        updateRefreshTimer();
        loadModels();
    }, CONFIG.AUTO_REFRESH_INTERVAL);
    
    console.log(`✅ Auto-refresh started (${CONFIG.AUTO_REFRESH_INTERVAL / 1000}s interval)`);
}

// Update Refresh Timer
function updateRefreshTimer() {
    const nextRefresh = CONFIG.AUTO_REFRESH_INTERVAL / 1000;
    elements.refreshTimer.textContent = `${nextRefresh}s`;
    elements.nextRefresh.textContent = `${nextRefresh}s`;
}

// Update Last Update Time
function updateLastUpdateTime() {
    const now = new Date();
    state.lastUpdate = now;
    
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString();
    
    elements.lastUpdateDisplay.textContent = `${dateString} ${timeString}`;
    elements.lastChecked.textContent = timeString;
    elements.lastUpdateTime.textContent = timeString;
    
    // Update JSON source display
    const sourceUrl = new URL(CONFIG.MODELS_JSON_URL);
    elements.jsonSourceDisplay.textContent = sourceUrl.hostname;
    elements.jsonSource.textContent = sourceUrl.hostname;
}

// Update Current Time
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    elements.currentTime.textContent = timeString;
}

// Handle File Select
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleSelectedFile(file);
    }
}

// Handle Drag Over
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.fileUploadArea.style.borderColor = 'var(--primary-color)';
    elements.fileUploadArea.style.background = 'rgba(102, 126, 234, 0.1)';
}

// Handle File Drop
function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    elements.fileUploadArea.style.borderColor = '';
    elements.fileUploadArea.style.background = '';
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.glb')) {
        handleSelectedFile(file);
    } else {
        showNotification('Please select a .glb file', 'error');
    }
}

// Handle Selected File
function handleSelectedFile(file) {
    // Validate file
    if (!file.name.endsWith('.glb')) {
        showNotification('Please select a .glb file', 'error');
        return;
    }
    
    // Update UI
    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatFileSize(file.size);
    elements.fileInfo.style.display = 'flex';
    
    // Enable upload button
    elements.uploadBtn.disabled = false;
    
    // Store file
    state.currentUpload = {
        file: file,
        name: elements.modelName.value || file.name.replace('.glb', ''),
        category: elements.modelCategory.value,
        description: elements.modelDescription.value || `Uploaded ${file.name}`
    };
}

// Format File Size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Handle Upload
async function handleUpload() {
    if (!state.currentUpload) {
        showNotification('Please select a file first', 'error');
        return;
    }
    
    const { file, name, category, description } = state.currentUpload;
    
    try {
        // Disable upload button
        elements.uploadBtn.disabled = true;
        elements.uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        
        // Show progress
        elements.uploadProgress.style.display = 'block';
        updateUploadProgress(0, 'Requesting upload URL...');
        
        // Step 1: Request presigned URL
        const uploadData = await requestPresignedUpload(file.name);
        
        if (!uploadData.uploadUrl || !uploadData.key) {
            throw new Error('Invalid response from server');
        }
        
        updateUploadProgress(25, 'Uploading file...');
        
        // Step 2: Upload file to storage
        await uploadGLBToStorage(uploadData.uploadUrl, file, (progress) => {
            const percent = 25 + (progress * 0.75);
            updateUploadProgress(percent, 'Uploading file...');
        });
        
        updateUploadProgress(100, 'Finalizing upload...');
        
        // Step 3: Finalize upload
        await finalizeUpload(uploadData.key, file.name, {
            name: name,
            category: category,
            description: description,
            thumbnail: getDefaultThumbnail(category)
        });
        
        // Show success
        showUploadSuccess(name, category, file.name);
        
        // Reset form
        resetUploadForm();
        
        // Refresh models after delay
        setTimeout(() => loadModels(true), 2000);
        
    } catch (error) {
        console.error('Upload failed:', error);
        showNotification(`Upload failed: ${error.message}`, 'error');
        
        // Reset button
        elements.uploadBtn.disabled = false;
        elements.uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Upload to Backend';
    } finally {
        elements.uploadProgress.style.display = 'none';
    }
}

// Update Upload Progress
function updateUploadProgress(percent, text) {
    elements.progressFill.style.width = `${percent}%`;
    elements.progressText.textContent = text;
    elements.progressPercent.textContent = `${Math.round(percent)}%`;
}

// Reset Upload Form
function resetUploadForm() {
    elements.modelName.value = '';
    elements.modelCategory.value = 'hindu';
    elements.modelDescription.value = '';
    elements.modelFile.value = '';
    elements.fileInfo.style.display = 'none';
    elements.uploadBtn.disabled = true;
    elements.uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Upload to Backend';
    elements.uploadProgress.style.display = 'none';
    
    state.currentUpload = null;
}

// Show Upload Success
function showUploadSuccess(name, category, filename) {
    elements.uploadedModelName.textContent = name;
    elements.uploadedCategory.textContent = category;
    elements.uploadedFileName.textContent = filename;
    
    elements.uploadSuccessModal.style.display = 'flex';
    setTimeout(() => {
        elements.uploadSuccessModal.style.opacity = '1';
    }, 10);
}

// Close Upload Success Modal
function closeUploadSuccessModal() {
    elements.uploadSuccessModal.style.opacity = '0';
    setTimeout(() => {
        elements.uploadSuccessModal.style.display = 'none';
    }, 300);
}

// Force Refresh Models
function forceRefreshModels() {
    closeUploadSuccessModal();
    loadModels(true);
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <div class="notification-content">
            <div class="notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    elements.notifications.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Handle Window Resize
function handleResize() {
    // Update grid columns based on screen size
    const isMobile = window.innerWidth < CONFIG.MOBILE_BREAKPOINT;
    elements.modelsGrid.style.gridTemplateColumns = isMobile 
        ? '1fr' 
        : 'repeat(auto-fill, minmax(300px, 1fr))';
}

// ========================================
// BACKEND UPLOAD FUNCTIONS
// ========================================

// 1) Request presigned URL
async function requestPresignedUpload(filename) {
    console.log('📤 Requesting presigned URL for:', filename);
    
    const response = await fetch(CONFIG.BACKEND_URL + CONFIG.REQUEST_UPLOAD_ENDPOINT, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ 
            filename: filename,
            timestamp: new Date().toISOString()
        })
    });
    
    if (!response.ok) {
        throw new Error(`Failed to request upload URL: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Presigned URL received:', data);
    return data;
}

// 2) Upload GLB bytes with progress
async function uploadGLBToStorage(uploadUrl, file, onProgress) {
    console.log('📤 Uploading file to storage:', file.name);
    
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = (e.loaded / e.total) * 100;
                if (onProgress) onProgress(percent);
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                console.log('✅ File uploaded successfully');
                resolve();
            } else {
                reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
        });
        
        xhr.addEventListener('error', () => {
            reject(new Error('Upload failed: Network error'));
        });
        
        xhr.addEventListener('abort', () => {
            reject(new Error('Upload was cancelled'));
        });
        
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.send(file);
    });
}

// 3) Finalize upload (backend signs GLB + updates models.json)
async function finalizeUpload(key, filename, meta = {}) {
    console.log('📝 Finalizing upload:', filename);
    
    const response = await fetch(CONFIG.BACKEND_URL + CONFIG.COMPLETE_UPLOAD_ENDPOINT, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ 
            key: key,
            filename: filename,
            ...meta,
            timestamp: new Date().toISOString()
        })
    });
    
    if (!response.ok) {
        throw new Error(`Failed to finalize upload: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Upload finalized:', data);
    return data;
}

// Export functions for external use
window.Divine3DGallery = {
    config: CONFIG,
    state: () => ({ ...state }),
    loadModels: (force) => loadModels(force),
    requestPresignedUpload,
    uploadGLBToStorage,
    finalizeUpload,
    showNotification,
    forceRefreshModels,
    closeUploadSuccessModal
};

console.log('✨ Divine 3D Models Gallery loaded successfully!');


