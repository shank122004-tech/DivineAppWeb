// script.js
'use strict';

// Configuration
const CONFIG = {
    MODELS_JSON_URL: 'https://raw.githubusercontent.com/shank122004-tech/DivineAppWeb/refs/heads/main/models.json',
    REFRESH_INTERVAL: 15000, // 15 seconds
    ADMIN_PASSWORD: 'admin123',
    GITHUB_REPO: 'shank122004-tech/DivineAppWeb',
    JSON_PATH: 'models.json',
    LOCAL_STORAGE_KEY: 'divine3d_gallery_data'
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
    currentPreviewModel: null
};

// DOM Elements
const Elements = {
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
    totalCategories: document.getElementById('totalCategories'),

    // Gallery
    galleryContainer: document.getElementById('galleryContainer'),
    gallerySearch: document.getElementById('gallerySearch'),
    categoryFilter: document.getElementById('categoryFilter'),
    clearFilters: document.getElementById('clearFilters'),
    sortSelect: document.getElementById('sortSelect'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    noResults: document.getElementById('noResults'),

    // Categories
    categoriesContainer: document.getElementById('categoriesContainer'),
    categoryControls: document.querySelector('.category-controls'),

    // Preview Modal
    previewModal: document.getElementById('previewModal'),
    closePreview: document.getElementById('closePreview'),
    previewViewer: document.getElementById('previewViewer'),
    previewTitle: document.getElementById('previewTitle'),
    previewName: document.getElementById('previewName'),
    previewCategory: document.getElementById('previewCategory'),
    previewDescription: document.getElementById('previewDescription'),
    downloadModel: document.getElementById('downloadModel'),
    copyUrl: document.getElementById('copyUrl'),
    shareModel: document.getElementById('shareModel'),
    rotateToggle: document.getElementById('rotateToggle'),
    fullscreenToggle: document.getElementById('fullscreenToggle'),
    arToggle: document.getElementById('arToggle'),

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
    modelName: document.getElementById('modelName'),
    modelDescription: document.getElementById('modelDescription'),
    modelCategory: document.getElementById('modelCategory'),
    modelTags: document.getElementById('modelTags'),
    thumbnailUrl: document.getElementById('thumbnailUrl'),
    addModelBtn: document.getElementById('addModelBtn'),
    previewModel: document.getElementById('previewModel'),
    adminModelsList: document.getElementById('adminModelsList'),
    githubUrl: document.getElementById('githubUrl'),
    githubToken: document.getElementById('githubToken'),
    jsonPath: document.getElementById('jsonPath'),
    pullJsonBtn: document.getElementById('pullJsonBtn'),
    pushJsonBtn: document.getElementById('pushJsonBtn'),
    githubStatus: document.getElementById('githubStatus'),

    // Toast
    toastContainer: document.getElementById('toastContainer'),

    // FAB
    fabBtn: document.getElementById('fabBtn'),

    // Loading Screen
    loadingScreen: document.getElementById('loadingScreen')
};

// Initialize Application
async function init() {
    try {
        // Load data from localStorage first
        loadFromLocalStorage();
        
        // Setup event listeners
        setupEventListeners();
        
        // Start auto-refresh
        startAutoRefresh();
        
        // Load initial data
        await loadModels();
        
        // Update UI
        updateStats();
        populateCategories();
        renderModels();
        
        // Hide loading screen
        setTimeout(() => {
            Elements.loadingScreen.style.opacity = '0';
            Elements.loadingScreen.style.visibility = 'hidden';
        }, 500);
        
        State.isInitialized = true;
        
        // Show welcome message
        showToast('Welcome to Divine 3D Gallery!', 'success');
        
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Failed to initialize gallery', 'error');
        
        // Hide loading screen on error too
        Elements.loadingScreen.style.opacity = '0';
        Elements.loadingScreen.style.visibility = 'hidden';
    }
}

// Data Loading Functions
async function loadModels() {
    try {
        State.isLoading = true;
        updateLoadingIndicator(true);
        
        const response = await fetch(CONFIG.MODELS_JSON_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format: expected array');
        }
        
        // Validate and process models
        State.models = data.map(model => ({
            id: model.id || generateId(),
            name: model.name || 'Unnamed Model',
            description: model.description || '',
            category: model.category || 'Uncategorized',
            tags: Array.isArray(model.tags) ? model.tags : [],
            glbUrl: convertToRawGithubUrl(model.glbUrl),
            thumbnailUrl: convertToRawGithubUrl(model.thumbnailUrl),
            createdAt: model.createdAt || new Date().toISOString(),
            updatedAt: model.updatedAt || new Date().toISOString()
        })).filter(model => model.glbUrl); // Filter out models without GLB URL
        
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
        
        State.isLoading = false;
        updateLoadingIndicator(false);
        
        console.log(`Loaded ${State.models.length} models`);
        
    } catch (error) {
        console.error('Error loading models:', error);
        showToast(`Failed to load models: ${error.message}`, 'error');
        
        // Fallback to localStorage if available
        if (State.models.length === 0 && localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY)) {
            showToast('Using cached data', 'info');
        }
        
        State.isLoading = false;
        updateLoadingIndicator(false);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            State.models = data.models || [];
            State.categories = new Set(data.categories || []);
            State.isAdmin = data.isAdmin || false;
            
            // Update admin UI if needed
            if (State.isAdmin) {
                showAdminDashboard();
            }
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
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

// GitHub URL Normalizer
function convertToRawGithubUrl(url) {
    if (!url) return '';
    
    // Already raw URL
    if (url.includes('raw.githubusercontent.com')) {
        return url;
    }
    
    // GitHub blob URL
    if (url.includes('github.com') && url.includes('/blob/')) {
        return url
            .replace('github.com', 'raw.githubusercontent.com')
            .replace('/blob/', '/');
    }
    
    // GitHub gist URL
    if (url.includes('gist.github.com')) {
        return url.replace('gist.github.com', 'gist.githubusercontent.com') + '/raw';
    }
    
    // Return as-is for other URLs
    return url;
}

// UI Update Functions
function updateStats() {
    Elements.totalModels.textContent = State.models.length;
    Elements.totalCategories.textContent = State.categories.size;
}

function populateCategories() {
    // Clear existing
    Elements.categoriesContainer.innerHTML = '';
    Elements.categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add category cards
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
    
    // Add category buttons
    Elements.categoryControls.innerHTML = '';
    
    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn active';
    allBtn.textContent = 'All Models';
    allBtn.onclick = () => filterByCategory('all');
    Elements.categoryControls.appendChild(allBtn);
    
    State.categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = category;
        btn.onclick = () => filterByCategory(category);
        Elements.categoryControls.appendChild(btn);
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
    
    const grid = document.createElement('div');
    grid.className = 'models-grid';
    
    State.filteredModels.forEach((model, index) => {
        const card = createModelCard(model, index);
        grid.appendChild(card);
    });
    
    Elements.galleryContainer.appendChild(grid);
}

function createModelCard(model, index) {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Thumbnail or placeholder
    const thumbnail = model.thumbnailUrl 
        ? `<img src="${model.thumbnailUrl}" alt="${model.name}" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'thumbnail-placeholder\\'>🎨</div>'">`
        : '<div class="thumbnail-placeholder">🎨</div>';
    
    card.innerHTML = `
        <div class="model-thumbnail">
            ${thumbnail}
            <span class="model-badge">${model.category}</span>
        </div>
        <div class="model-content">
            <div class="model-header">
                <h4 class="model-title">${model.name}</h4>
                <span class="model-category">${model.category}</span>
            </div>
            <p class="model-description">${model.description}</p>
            <div class="model-meta">
                <span>GLB</span>
                <span>${formatDate(model.createdAt)}</span>
            </div>
            <div class="model-actions">
                <button class="action-btn preview-btn">
                    <i class="fas fa-eye"></i> Preview
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

function updateLoadingIndicator(show) {
    if (show) {
        Elements.loadingIndicator.style.display = 'flex';
        Elements.refreshBtn.classList.add('loading');
    } else {
        Elements.loadingIndicator.style.display = 'none';
        Elements.refreshBtn.classList.remove('loading');
    }
}

// Filter and Sort Functions
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
            case 'date-new':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'date-old':
                return new Date(a.createdAt) - new Date(b.createdAt);
            default:
                return 0;
        }
    });
    
    State.filteredModels = filtered;
    renderModels();
}

function filterByCategory(category) {
    State.currentCategory = category;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if ((category === 'all' && btn.textContent === 'All Models') || 
            btn.textContent === category) {
            btn.classList.add('active');
        }
    });
    
    // Update filter select
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

// Preview Modal Functions
function openPreview(model) {
    State.currentPreviewModel = model;
    
    // Update modal content
    Elements.previewTitle.textContent = model.name;
    Elements.previewName.textContent = model.name;
    Elements.previewCategory.textContent = model.category;
    Elements.previewDescription.textContent = model.description || 'No description available.';
    
    // Load model in viewer
    Elements.previewViewer.src = model.glbUrl;
    
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

// Model Download Functions
async function downloadModel(model) {
    try {
        showToast(`Downloading ${model.name}...`, 'info');
        
        const response = await fetch(model.glbUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${model.name.replace(/\s+/g, '_')}.glb`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
        
        showToast(`${model.name} downloaded successfully!`, 'success');
        
    } catch (error) {
        console.error('Download error:', error);
        showToast(`Failed to download: ${error.message}`, 'error');
    }
}

async function copyModelUrl(model) {
    try {
        await navigator.clipboard.writeText(model.glbUrl);
        showToast('Model URL copied to clipboard!', 'success');
    } catch (error) {
        console.error('Copy error:', error);
        showToast('Failed to copy URL', 'error');
    }
}

async function shareModel(model) {
    try {
        if (navigator.share) {
            await navigator.share({
                title: model.name,
                text: model.description,
                url: window.location.href
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

// Admin Functions
function openAdminPanel() {
    Elements.adminOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAdminPanel() {
    Elements.adminOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function showAdminDashboard() {
    Elements.adminLogin.style.display = 'none';
    Elements.adminDashboard.style.display = 'block';
    updateAdminModelList();
}

function hideAdminDashboard() {
    Elements.adminDashboard.style.display = 'none';
    Elements.adminLogin.style.display = 'block';
    Elements.adminPassword.value = '';
    State.isAdmin = false;
    saveToLocalStorage();
}

function updateAdminModelList() {
    Elements.adminModelsList.innerHTML = '';
    
    State.models.forEach(model => {
        const item = document.createElement('div');
        item.className = 'admin-model-item';
        item.innerHTML = `
            <div class="model-thumb-small">
                ${model.thumbnailUrl 
                    ? `<img src="${model.thumbnailUrl}" alt="${model.name}" onerror="this.onerror=null;this.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(45deg,#667eea,#764ba2);color:white;\\'>🎨</div>'">`
                    : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(45deg,#667eea,#764ba2);color:white;">🎨</div>'
                }
            </div>
            <div class="model-info-small">
                <h6>${model.name}</h6>
                <span>${model.category} • ${formatDate(model.createdAt)}</span>
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
            openPreview(model);
        };
        
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteModelFromGallery(model.id);
        };
        
        Elements.adminModelsList.appendChild(item);
    });
}

async function addModelToGallery(modelData) {
    try {
        // Validate required fields
        if (!modelData.name || !modelData.glbUrl) {
            throw new Error('Name and GLB URL are required');
        }
        
        const newModel = {
            id: generateId(),
            name: modelData.name.trim(),
            description: modelData.description?.trim() || '',
            category: modelData.category?.trim() || 'Uncategorized',
            tags: modelData.tags ? modelData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
            glbUrl: convertToRawGithubUrl(modelData.glbUrl),
            thumbnailUrl: convertToRawGithubUrl(modelData.thumbnailUrl),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Add to state
        State.models.unshift(newModel);
        State.categories.add(newModel.category);
        
        // Update UI
        saveToLocalStorage();
        updateStats();
        populateCategories();
        filterAndSortModels();
        updateAdminModelList();
        
        showToast(`${newModel.name} added to gallery!`, 'success');
        
        // Clear form
        clearAddModelForm();
        
        return newModel;
        
    } catch (error) {
        console.error('Add model error:', error);
        showToast(`Failed to add model: ${error.message}`, 'error');
        throw error;
    }
}

function deleteModelFromGallery(modelId) {
    if (!confirm('Are you sure you want to delete this model?')) return;
    
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

// GitHub Sync Functions
async function pullFromGitHub() {
    try {
        Elements.githubStatus.className = 'github-status';
        Elements.githubStatus.textContent = 'Pulling from GitHub...';
        Elements.pullJsonBtn.disabled = true;
        
        const url = `https://api.github.com/repos/${CONFIG.GITHUB_REPO}/contents/${CONFIG.JSON_PATH}`;
        const headers = {};
        
        if (Elements.githubToken.value) {
            headers['Authorization'] = `token ${Elements.githubToken.value}`;
        }
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = atob(data.content);
        const models = JSON.parse(content);
        
        if (!Array.isArray(models)) {
            throw new Error('Invalid JSON format');
        }
        
        // Update state
        State.models = models;
        State.categories.clear();
        State.models.forEach(m => State.categories.add(m.category));
        
        // Update UI
        saveToLocalStorage();
        updateStats();
        populateCategories();
        filterAndSortModels();
        
        Elements.githubStatus.className = 'github-status success';
        Elements.githubStatus.textContent = `Successfully pulled ${models.length} models from GitHub`;
        
        showToast('Gallery updated from GitHub!', 'success');
        
    } catch (error) {
        console.error('Pull error:', error);
        Elements.githubStatus.className = 'github-status error';
        Elements.githubStatus.textContent = `Pull failed: ${error.message}`;
        showToast(`GitHub pull failed: ${error.message}`, 'error');
    } finally {
        Elements.pullJsonBtn.disabled = false;
    }
}

async function pushToGitHub() {
    try {
        if (!Elements.githubToken.value) {
            throw new Error('GitHub token is required for push');
        }
        
        Elements.githubStatus.className = 'github-status';
        Elements.githubStatus.textContent = 'Pushing to GitHub...';
        Elements.pushJsonBtn.disabled = true;
        
        // Get current file SHA
        const getUrl = `https://api.github.com/repos/${CONFIG.GITHUB_REPO}/contents/${CONFIG.JSON_PATH}`;
        const getResponse = await fetch(getUrl, {
            headers: {
                'Authorization': `token ${Elements.githubToken.value}`
            }
        });
        
        let sha = '';
        if (getResponse.ok) {
            const data = await getResponse.json();
            sha = data.sha;
        }
        
        // Prepare update
        const content = JSON.stringify(State.models, null, 2);
        const encodedContent = btoa(unescape(encodeURIComponent(content)));
        
        const updateData = {
            message: `Update models.json - ${new Date().toISOString()}`,
            content: encodedContent,
            sha: sha || undefined
        };
        
        // Push update
        const pushUrl = `https://api.github.com/repos/${CONFIG.GITHUB_REPO}/contents/${CONFIG.JSON_PATH}`;
        const pushResponse = await fetch(pushUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${Elements.githubToken.value}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!pushResponse.ok) {
            const error = await pushResponse.json();
            throw new Error(error.message || 'Push failed');
        }
        
        Elements.githubStatus.className = 'github-status success';
        Elements.githubStatus.textContent = 'Successfully pushed to GitHub!';
        
        showToast('Gallery pushed to GitHub!', 'success');
        
    } catch (error) {
        console.error('Push error:', error);
        Elements.githubStatus.className = 'github-status error';
        Elements.githubStatus.textContent = `Push failed: ${error.message}`;
        showToast(`GitHub push failed: ${error.message}`, 'error');
    } finally {
        Elements.pushJsonBtn.disabled = false;
    }
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${type.toUpperCase()}</div>
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

function clearAddModelForm() {
    Elements.modelName.value = '';
    Elements.modelDescription.value = '';
    Elements.modelCategory.value = '';
    Elements.modelTags.value = '';
    Elements.thumbnailUrl.value = '';
    Elements.modelFile.value = '';
}

// Event Listeners Setup
function setupEventListeners() {
    // Theme toggle
    Elements.themeToggle.onclick = () => {
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');
    };
    
    // Header scroll effect
    window.onscroll = () => {
        if (window.scrollY > 50) {
            Elements.mainHeader.classList.add('scrolled');
        } else {
            Elements.mainHeader.classList.remove('scrolled');
        }
    };
    
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
    
    Elements.searchInput.onkeyup = (e) => {
        if (e.key === 'Enter') {
            searchModels(Elements.searchInput.value);
        }
    };
    
    Elements.gallerySearch.onkeyup = (e) => {
        searchModels(Elements.gallerySearch.value);
    };
    
    // Filters
    Elements.categoryFilter.onchange = (e) => {
        filterByCategory(e.target.value);
    };
    
    Elements.clearFilters.onclick = () => {
        Elements.gallerySearch.value = '';
        Elements.categoryFilter.value = 'all';
        State.searchQuery = '';
        State.currentCategory = 'all';
        filterAndSortModels();
    };
    
    Elements.sortSelect.onchange = (e) => {
        sortModels(e.target.value);
    };
    
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
    
    Elements.loginBtn.onclick = () => {
        if (Elements.adminPassword.value === CONFIG.ADMIN_PASSWORD) {
            State.isAdmin = true;
            saveToLocalStorage();
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
    Elements.uploadArea.ondragover = (e) => {
        e.preventDefault();
        Elements.uploadArea.style.borderColor = 'var(--accent-primary)';
        Elements.uploadArea.style.background = 'rgba(139, 92, 246, 0.1)';
    };
    
    Elements.uploadArea.ondragleave = () => {
        Elements.uploadArea.style.borderColor = '';
        Elements.uploadArea.style.background = '';
    };
    
    Elements.uploadArea.ondrop = (e) => {
        e.preventDefault();
        Elements.uploadArea.style.borderColor = '';
        Elements.uploadArea.style.background = '';
        
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };
    
    Elements.modelFile.onchange = (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    };
    
    // Add model
    Elements.addModelBtn.onclick = async () => {
        if (!Elements.modelName.value || !Elements.modelFile.files[0]) {
            showToast('Please provide name and GLB file', 'error');
            return;
        }
        
        const modelData = {
            name: Elements.modelName.value,
            description: Elements.modelDescription.value,
            category: Elements.modelCategory.value,
            tags: Elements.modelTags.value,
            glbUrl: '', // Will be set from file
            thumbnailUrl: Elements.thumbnailUrl.value
        };
        
        await addModelToGallery(modelData);
    };
    
    // GitHub sync
    Elements.pullJsonBtn.onclick = pullFromGitHub;
    Elements.pushJsonBtn.onclick = pushToGitHub;
    
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
    
    Elements.copyUrl.onclick = () => {
        if (State.currentPreviewModel) {
            copyModelUrl(State.currentPreviewModel);
        }
    };
    
    Elements.shareModel.onclick = () => {
        if (State.currentPreviewModel) {
            shareModel(State.currentPreviewModel);
        }
    };
    
    Elements.rotateToggle.onclick = () => {
        const viewer = Elements.previewViewer;
        viewer.autoRotate = !viewer.autoRotate;
        Elements.rotateToggle.classList.toggle('active', viewer.autoRotate);
    };
    
    Elements.fullscreenToggle.onclick = () => {
        Elements.previewViewer.requestFullscreen();
    };
    
    Elements.arToggle.onclick = () => {
        Elements.previewViewer.activateAR();
    };
    
    // FAB
    Elements.fabBtn.onclick = openAdminPanel;
}

async function handleFileUpload(file) {
    try {
        if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
            showToast('Please upload a GLB or GLTF file', 'error');
            return;
        }
        
        showToast(`Uploading ${file.name}...`, 'info');
        
        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file);
        
        // For now, we'll just use the object URL
        // In a real app, you would upload to a server
        const modelName = Elements.modelName.value || file.name.replace(/\.[^/.]+$/, "");
        if (!Elements.modelName.value) {
            Elements.modelName.value = modelName;
        }
        
        // Update any existing model data
        // This is where you would handle the actual upload
        
        showToast(`${file.name} ready for submission`, 'success');
        
    } catch (error) {
        console.error('File upload error:', error);
        showToast('File upload failed', 'error');
    }
}

// Auto Refresh
function startAutoRefresh() {
    if (State.refreshInterval) {
        clearInterval(State.refreshInterval);
    }
    
    State.refreshInterval = setInterval(async () => {
        if (!State.isLoading && document.visibilityState === 'visible') {
            await loadModels();
            showToast('Gallery auto-updated', 'info');
        }
    }, CONFIG.REFRESH_INTERVAL);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
