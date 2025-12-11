// script.js - Divine 3D Gallery - Complete with Auto-Signature Feature
'use strict';

// Configuration
const CONFIG = {
    DEFAULT_GITHUB_REPO: 'shank122004-tech/DivineAppWeb',
    DEFAULT_MODELS_PATH: 'models',
    ADMIN_PASSWORD: 'admin123',
    LOCAL_STORAGE_KEY: 'divine3d_gallery_data',
    CACHE_DURATION: 15 * 60 * 1000, // 15 minutes
    
    // GLB Security Configuration
    GLB_SECURITY: {
        FILENAME_SIGNATURE: "@divinemantra",
        INTERNAL_SIGNATURE: "DM-9937-SECURE-CODE"
    },
    
    // GitHub API Configuration
    GITHUB_API: {
        BASE_URL: 'https://api.github.com',
        RAW_CONTENT_URL: 'https://raw.githubusercontent.com',
        TOKEN: null // Add your GitHub token here for private repos
    },
    
    // Sample models for fallback
    SAMPLE_MODELS: [
        {
            id: 'sample_1',
            name: 'Divine Krishna Statue',
            description: 'Beautiful 3D model of Lord Krishna playing flute',
            category: 'Spiritual',
            tags: ['krishna', 'divine', 'statue', 'hindu'],
            glbUrl: 'https://shank122004-tech.github.io/DivineAppWeb/models/hanuman_gada@divinemantra.glb',
            thumbnailUrl: 'https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?w=400&h=300&fit=crop',
            fileSize: '4.5 MB',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            downloads: 1250,
            secure: true,
            source: 'github'
        }
    ]
};

// GLB Security Processor - Automatically adds signature to downloads
class GLBSecurityProcessor {
    constructor() {
        this.FILENAME_SIGNATURE = "@divinemantra";
        this.INTERNAL_SIGNATURE = "DM-9937-SECURE-CODE";
        this.MAGIC = 0x46546C67; // "glTF"
        this.CHUNK_JSON = 0x4E4F534A; // "JSON"
        this.CHUNK_BIN = 0x004E4942; // "BIN"
    }

    // Main method to secure a GLB file
    async secureGLBFile(originalUrl) {
        try {
            console.log('Securing GLB file:', originalUrl);
            
            // Download the original file
            const response = await fetch(originalUrl);
            if (!response.ok) {
                throw new Error(`Failed to download: ${response.status}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            
            // Add internal signature to GLB
            const securedBuffer = await this.addInternalSignature(arrayBuffer);
            
            // Create blob URL for download
            const securedBlob = new Blob([securedBuffer], { type: 'model/gltf-binary' });
            const securedUrl = URL.createObjectURL(securedBlob);
            
            console.log('GLB file secured successfully');
            return securedUrl;
            
        } catch (error) {
            console.error('GLB security error:', error);
            throw new Error(`Failed to secure file: ${error.message}`);
        }
    }

    // Add internal signature to GLB binary
    async addInternalSignature(arrayBuffer) {
        try {
            const dataView = new DataView(arrayBuffer);
            
            // Verify GLB magic number
            const magic = dataView.getUint32(0, true);
            if (magic !== this.MAGIC) {
                throw new Error('Invalid GLB file: incorrect magic number');
            }
            
            const version = dataView.getUint32(4, true);
            const totalLength = dataView.getUint32(8, true);
            
            // Parse chunks
            let offset = 12;
            let jsonChunk = null;
            let binChunk = null;
            
            // Find JSON and BIN chunks
            while (offset < totalLength) {
                const chunkLength = dataView.getUint32(offset, true);
                const chunkType = dataView.getUint32(offset + 4, true);
                
                if (chunkType === this.CHUNK_JSON) {
                    jsonChunk = {
                        offset: offset + 8,
                        length: chunkLength,
                        data: arrayBuffer.slice(offset + 8, offset + 8 + chunkLength)
                    };
                } else if (chunkType === this.CHUNK_BIN) {
                    binChunk = {
                        offset: offset + 8,
                        length: chunkLength,
                        data: arrayBuffer.slice(offset + 8, offset + 8 + chunkLength)
                    };
                }
                
                offset += 8 + chunkLength;
            }
            
            if (!jsonChunk) {
                throw new Error('No JSON chunk found in GLB file');
            }
            
            // Parse and modify JSON
            const jsonText = new TextDecoder().decode(jsonChunk.data);
            const gltf = JSON.parse(jsonText);
            
            // Add signature to asset metadata
            if (!gltf.asset) {
                gltf.asset = {};
            }
            gltf.asset.signature = this.INTERNAL_SIGNATURE;
            gltf.asset.generator = "Divine Mantra Auto-Secure v1.0";
            gltf.asset.version = "2.0";
            
            // Convert back to JSON
            const newJsonText = JSON.stringify(gltf);
            const newJsonData = new TextEncoder().encode(newJsonText);
            
            // Calculate padding for JSON chunk (must be multiple of 4)
            const jsonPadding = (4 - (newJsonData.length % 4)) % 4;
            const paddedJsonLength = newJsonData.length + jsonPadding;
            
            // Create new array buffer
            const headerLength = 12; // magic + version + length
            const chunkHeaderLength = 8; // chunk length + type
            
            let newTotalLength = headerLength;
            newTotalLength += chunkHeaderLength + paddedJsonLength;
            
            if (binChunk) {
                const binPadding = (4 - (binChunk.length % 4)) % 4;
                newTotalLength += chunkHeaderLength + binChunk.length + binPadding;
            }
            
            const newBuffer = new ArrayBuffer(newTotalLength);
            const newDataView = new DataView(newBuffer);
            
            // Write header
            newDataView.setUint32(0, this.MAGIC, true); // magic
            newDataView.setUint32(4, version, true); // version
            newDataView.setUint32(8, newTotalLength, true); // total length
            
            let writeOffset = 12;
            
            // Write JSON chunk
            newDataView.setUint32(writeOffset, paddedJsonLength, true);
            writeOffset += 4;
            newDataView.setUint32(writeOffset, this.CHUNK_JSON, true);
            writeOffset += 4;
            
            // Write JSON data
            new Uint8Array(newBuffer).set(newJsonData, writeOffset);
            writeOffset += newJsonData.length;
            
            // Add padding zeros
            for (let i = 0; i < jsonPadding; i++) {
                newDataView.setUint8(writeOffset + i, 0);
            }
            writeOffset += jsonPadding;
            
            // Write BIN chunk if exists
            if (binChunk) {
                const binPadding = (4 - (binChunk.length % 4)) % 4;
                const paddedBinLength = binChunk.length + binPadding;
                
                newDataView.setUint32(writeOffset, paddedBinLength, true);
                writeOffset += 4;
                newDataView.setUint32(writeOffset, this.CHUNK_BIN, true);
                writeOffset += 4;
                
                // Write BIN data
                const binArray = new Uint8Array(binChunk.data);
                new Uint8Array(newBuffer).set(binArray, writeOffset);
                writeOffset += binChunk.length;
                
                // Add padding zeros
                for (let i = 0; i < binPadding; i++) {
                    newDataView.setUint8(writeOffset + i, 0);
                }
            }
            
            console.log('Internal signature added successfully');
            return newBuffer;
            
        } catch (error) {
            console.error('Error adding internal signature:', error);
            throw error;
        }
    }

    // Verify if GLB already has signature
    async verifyGLBSignature(arrayBuffer) {
        try {
            const dataView = new DataView(arrayBuffer);
            
            // Check magic number
            const magic = dataView.getUint32(0, true);
            if (magic !== this.MAGIC) {
                return false;
            }
            
            // Find JSON chunk
            let offset = 12;
            const totalLength = dataView.getUint32(8, true);
            
            while (offset < totalLength) {
                const chunkLength = dataView.getUint32(offset, true);
                const chunkType = dataView.getUint32(offset + 4, true);
                
                if (chunkType === this.CHUNK_JSON) {
                    const jsonStart = offset + 8;
                    const jsonEnd = jsonStart + chunkLength;
                    
                    // Extract JSON data
                    const jsonSlice = arrayBuffer.slice(jsonStart, jsonEnd);
                    const jsonText = new TextDecoder().decode(jsonSlice);
                    
                    try {
                        const gltf = JSON.parse(jsonText);
                        return gltf.asset && gltf.asset.signature === this.INTERNAL_SIGNATURE;
                    } catch (parseError) {
                        return false;
                    }
                }
                
                offset += 8 + chunkLength;
            }
            
            return false;
        } catch (error) {
            console.error('Signature verification error:', error);
            return false;
        }
    }
}

// Initialize GLB processor
const glbProcessor = new GLBSecurityProcessor();

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
    autoRotateEnabled: true,
    viewMode: 'grid',
    githubConfig: {
        repo: CONFIG.DEFAULT_GITHUB_REPO,
        path: CONFIG.DEFAULT_MODELS_PATH,
        jsonUrl: '',
        autoRefresh: '15'
    },
    autoSecureDownloads: true
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

    // GitHub Import
    githubRepo: document.getElementById('githubRepo'),
    modelsPath: document.getElementById('modelsPath'),
    jsonUrl: document.getElementById('jsonUrl'),
    autoRefresh: document.getElementById('autoRefresh'),
    defaultCategory: document.getElementById('defaultCategory'),
    testConnection: document.getElementById('testConnection'),
    importModelsBtn: document.getElementById('importModelsBtn'),
    importStatus: document.getElementById('importStatus'),
    importDetails: document.getElementById('importDetails'),

    // Model Management
    adminModelsList: document.getElementById('adminModelsList'),
    modelsCount: document.getElementById('modelsCount'),
    exportModels: document.getElementById('exportModels'),
    clearAllModels: document.getElementById('clearAllModels'),

    // Security
    autoSecure: document.getElementById('autoSecure'),
    resetSecurity: document.getElementById('resetSecurity'),
    backupData: document.getElementById('backupData'),

    // Toast
    toastContainer: document.getElementById('toastContainer'),

    // FAB
    fabScrollTop: document.getElementById('fabScrollTop'),
    fabImport: document.getElementById('fabImport')
};

// Initialize Application
async function init() {
    try {
        showLoading(true);
        
        // Setup event listeners
        setupEventListeners();
        
        // Load saved data
        loadSavedData();
        
        // Load initial data
        await loadModels();
        
        // Update UI
        updateStats();
        populateCategories();
        renderModels();
        
        // Check admin status
        checkAdminStatus();
        
        State.isInitialized = true;
        
        // Show welcome message
        showToast('Welcome to Divine 3D Gallery! All downloads auto-secured.', 'success');
        
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
        
        // Try to load from GitHub
        await importFromGitHub();
        
        // If no models loaded, try sample models
        if (State.models.length === 0) {
            loadSampleModels();
        }
        
        // Update categories
        updateCategories();
        
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

async function importFromGitHub() {
    try {
        const { repo, path, jsonUrl } = State.githubConfig;
        
        if (!repo) {
            throw new Error('GitHub repository not configured');
        }
        
        let models = [];
        
        // If JSON URL is provided, use it
        if (jsonUrl) {
            models = await loadFromJsonUrl(jsonUrl);
        } else {
            // Otherwise scan the repository
            models = await scanGitHubRepository(repo, path);
        }
        
        // Process and validate models
        const processedModels = await Promise.all(
            models.map(async (model, index) => {
                const processedModel = {
                    id: model.id || `github_${Date.now()}_${index}`,
                    name: model.name || extractNameFromUrl(model.glbUrl) || 'Unnamed Model',
                    description: model.description || '',
                    category: model.category || State.githubConfig.defaultCategory || 'Spiritual',
                    tags: Array.isArray(model.tags) ? model.tags : [],
                    glbUrl: model.glbUrl,
                    thumbnailUrl: model.thumbnailUrl || getDefaultThumbnail(model.category),
                    fileSize: model.fileSize || await getFileSize(model.glbUrl),
                    createdAt: model.createdAt || new Date().toISOString(),
                    updatedAt: model.updatedAt || new Date().toISOString(),
                    downloads: model.downloadCount || model.downloads || 0,
                    secure: await checkGLBSecurity(model.glbUrl),
                    source: 'github',
                    rating: model.rating || 0
                };
                
                return processedModel;
            })
        );
        
        // Filter out invalid models
        State.models = processedModels.filter(model => model.glbUrl);
        
        showToast(`Imported ${State.models.length} models from GitHub`, 'success');
        
    } catch (error) {
        console.error('GitHub import error:', error);
        throw error;
    }
}

async function checkGLBSecurity(url) {
    try {
        // First check filename
        const hasFilenameSignature = url.includes(CONFIG.GLB_SECURITY.FILENAME_SIGNATURE);
        
        if (!hasFilenameSignature) {
            return false;
        }
        
        // Then check internal signature
        const response = await fetch(url);
        if (!response.ok) {
            return false;
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const hasInternalSignature = await glbProcessor.verifyGLBSignature(arrayBuffer);
        
        return hasInternalSignature;
        
    } catch (error) {
        console.warn('GLB security check error:', error);
        return false;
    }
}

async function loadFromJsonUrl(jsonUrl) {
    try {
        const response = await fetch(jsonUrl, {
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
            throw new Error('Invalid JSON format: expected array');
        }
        
        return data;
    } catch (error) {
        console.error('JSON load error:', error);
        throw error;
    }
}

async function scanGitHubRepository(repo, path) {
    try {
        const [owner, repoName] = repo.split('/');
        
        // Try to get repository contents
        const apiUrl = `${CONFIG.GITHUB_API.BASE_URL}/repos/${owner}/${repoName}/contents/${path}`;
        const headers = {};
        
        if (CONFIG.GITHUB_API.TOKEN) {
            headers.Authorization = `token ${CONFIG.GITHUB_API.TOKEN}`;
        }
        
        const response = await fetch(apiUrl, { headers });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const contents = await response.json();
        
        // Filter for GLB files
        const glbFiles = contents.filter(item => 
            item.type === 'file' && 
            item.name.toLowerCase().endsWith('.glb')
        );
        
        // Convert to model objects
        const models = glbFiles.map(file => {
            const rawUrl = `${CONFIG.GITHUB_API.RAW_CONTENT_URL}/${repo}/main/${path}/${file.name}`;
            
            return {
                id: `github_${file.sha}`,
                name: extractNameFromFilename(file.name),
                description: '',
                category: State.githubConfig.defaultCategory || 'Spiritual',
                tags: [],
                glbUrl: rawUrl,
                thumbnailUrl: '',
                fileSize: formatFileSize(file.size),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                downloads: 0,
                secure: file.name.includes(CONFIG.GLB_SECURITY.FILENAME_SIGNATURE),
                source: 'github'
            };
        });
        
        return models;
        
    } catch (error) {
        console.error('GitHub scan error:', error);
        throw error;
    }
}

async function getFileSize(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
            const size = response.headers.get('content-length');
            if (size) {
                return formatFileSize(parseInt(size));
            }
        }
    } catch (error) {
        console.warn('Failed to get file size:', error);
    }
    return 'Unknown';
}

function extractNameFromFilename(filename) {
    return filename
        .replace(CONFIG.GLB_SECURITY.FILENAME_SIGNATURE, '')
        .replace(/\.glb$/i, '')
        .replace(/[_-]/g, ' ')
        .trim()
        .replace(/\b\w/g, l => l.toUpperCase());
}

function extractNameFromUrl(url) {
    try {
        const filename = url.split('/').pop();
        return extractNameFromFilename(filename);
    } catch (error) {
        return 'Unnamed Model';
    }
}

function getDefaultThumbnail(category) {
    const thumbnails = {
        'Spiritual': 'https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?w=400&h=300&fit=crop',
        'Temple': 'https://images.unsplash.com/photo-1586773860418-dc22f8b874bc?w=400&h=300&fit=crop',
        'Deity': 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=400&h=300&fit=crop',
        'Symbol': 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&h=300&fit=crop'
    };
    
    return thumbnails[category] || thumbnails.Spiritual;
}

function loadSampleModels() {
    State.models = CONFIG.SAMPLE_MODELS;
    updateCategories();
    showToast('Loaded sample models. Configure GitHub import in Admin Panel.', 'info');
    filterAndSortModels();
    updateStats();
    populateCategories();
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            
            // Check if data is not too old
            const cacheTime = Date.now() - CONFIG.CACHE_DURATION;
            if (data.timestamp && new Date(data.timestamp).getTime() > cacheTime) {
                State.models = data.models || [];
                State.categories = new Set(data.categories || []);
                State.isAdmin = data.isAdmin || false;
                State.githubConfig = data.githubConfig || State.githubConfig;
                State.autoSecureDownloads = data.autoSecureDownloads !== false;
                
                // Update admin UI if needed
                if (State.isAdmin) {
                    showAdminDashboard();
                }
                
                // Update UI elements
                Elements.autoSecure.checked = State.autoSecureDownloads;
                
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
            githubConfig: State.githubConfig,
            autoSecureDownloads: State.autoSecureDownloads,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadSavedData() {
    try {
        // Load theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
        
        // Load GitHub config
        const savedConfig = localStorage.getItem('github_config');
        if (savedConfig) {
            State.githubConfig = { ...State.githubConfig, ...JSON.parse(savedConfig) };
        }
        
        // Update form fields
        if (Elements.githubRepo) {
            Elements.githubRepo.value = State.githubConfig.repo;
            Elements.modelsPath.value = State.githubConfig.path;
            Elements.jsonUrl.value = State.githubConfig.jsonUrl;
            Elements.autoRefresh.value = State.githubConfig.autoRefresh;
        }
        
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

function saveGitHubConfig() {
    try {
        State.githubConfig = {
            repo: Elements.githubRepo.value.trim(),
            path: Elements.modelsPath.value.trim(),
            jsonUrl: Elements.jsonUrl.value.trim(),
            autoRefresh: Elements.autoRefresh.value,
            defaultCategory: Elements.defaultCategory.value
        };
        
        localStorage.setItem('github_config', JSON.stringify(State.githubConfig));
        showToast('GitHub configuration saved', 'success');
        
    } catch (error) {
        console.error('Error saving GitHub config:', error);
        showToast('Failed to save configuration', 'error');
    }
}

// ============================================
// GLB DOWNLOAD WITH AUTO-SIGNATURE
// ============================================

async function downloadModel(model) {
    try {
        showToast(`Securing ${model.name} for download...`, 'info');
        
        let downloadUrl = model.glbUrl;
        let securedFilename = model.name.replace(/\s+/g, '_');
        
        if (State.autoSecureDownloads) {
            try {
                // Add internal signature to GLB
                const securedUrl = await glbProcessor.secureGLBFile(model.glbUrl);
                downloadUrl = securedUrl;
                
                // Add filename signature
                if (!securedFilename.includes(CONFIG.GLB_SECURITY.FILENAME_SIGNATURE)) {
                    securedFilename = `${securedFilename}${CONFIG.GLB_SECURITY.FILENAME_SIGNATURE}`;
                }
                
                showToast('GLB secured with Divine Mantra signature', 'success');
                
            } catch (securityError) {
                console.error('Security processing error:', securityError);
                showToast('Using original file (security processing failed)', 'warning');
            }
        }
        
        // Ensure .glb extension
        if (!securedFilename.toLowerCase().endsWith('.glb')) {
            securedFilename += '.glb';
        }
        
        // Create download link
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = securedFilename;
        a.style.display = 'none';
        a.rel = 'noopener noreferrer';
        
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            if (downloadUrl.startsWith('blob:')) {
                URL.revokeObjectURL(downloadUrl);
            }
        }, 100);
        
        // Update download count
        model.downloads = (model.downloads || 0) + 1;
        saveToLocalStorage();
        updateAdminModelList();
        
        showToast(`${model.name} downloaded successfully!`, 'success');
        
    } catch (error) {
        console.error('Download error:', error);
        showToast(`Failed to download: ${error.message}`, 'error');
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

function updateCategories() {
    State.categories.clear();
    State.models.forEach(model => {
        if (model.category) {
            State.categories.add(model.category);
        }
    });
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
    
    // Thumbnail or placeholder
    let thumbnailHTML = '';
    if (model.thumbnailUrl) {
        thumbnailHTML = `
            <img src="${model.thumbnailUrl}" 
                 alt="${model.name}" 
                 loading="lazy"
                 onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\"thumbnail-placeholder\">🎨</div>'">
        `;
    } else {
        thumbnailHTML = '<div class="thumbnail-placeholder">🎨</div>';
    }
    
    // Security badge
    const securityBadge = model.secure ? 
        '<span class="model-badge" style="left: auto; right: 1rem; background: var(--success);">🔒 Pre-Secured</span>' : 
        '<span class="model-badge" style="left: auto; right: 1rem; background: var(--info);">🔄 Auto-Secure</span>';
    
    card.innerHTML = `
        <div class="model-thumbnail">
            ${thumbnailHTML}
            <span class="model-badge">${model.category}</span>
            ${securityBadge}
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
                    <i class="fas fa-download"></i> ${State.autoSecureDownloads ? 'Download Secured' : 'Download'}
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
    updateAdminStatus('Ready');
}

function closeAdminPanel() {
    Elements.adminOverlay.classList.remove('active');
    document.body.style.overflow = '';
    Elements.importStatus.style.display = 'none';
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
                    ? `<img src="${model.thumbnailUrl}" alt="${model.name}" loading="lazy"
                         onerror="this.onerror=null;this.parentElement.innerHTML='<div style=\"width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(45deg,#8b5cf6,#3b82f6);color:white;\">🎨</div>'">`
                    : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(45deg,#8b5cf6,#3b82f6);color:white;">🎨</div>'
                }
            </div>
            <div class="model-info-small">
                <h6>${model.name}</h6>
                <span>${model.category} • ${model.downloads} downloads</span>
                <span style="color: ${model.secure ? 'var(--success)' : 'var(--warning)'}; font-size: 0.7rem;">
                    ${model.secure ? '🔒 Pre-Secured' : '⚠️ Auto-Secure on Download'}
                </span>
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

// ============================================
// GITHUB IMPORT FUNCTIONS
// ============================================

async function testGitHubConnection() {
    try {
        const repo = Elements.githubRepo.value.trim();
        if (!repo) {
            throw new Error('Please enter a GitHub repository');
        }
        
        updateAdminStatus('Testing connection...', 'loading');
        
        const [owner, repoName] = repo.split('/');
        if (!owner || !repoName) {
            throw new Error('Invalid repository format. Use: username/repository-name');
        }
        
        const apiUrl = `${CONFIG.GITHUB_API.BASE_URL}/repos/${owner}/${repoName}`;
        const headers = {};
        
        if (CONFIG.GITHUB_API.TOKEN) {
            headers.Authorization = `token ${CONFIG.GITHUB_API.TOKEN}`;
        }
        
        const response = await fetch(apiUrl, { headers });
        
        if (!response.ok) {
            throw new Error(`Repository not found or inaccessible (HTTP ${response.status})`);
        }
        
        const data = await response.json();
        
        updateAdminStatus('Connection successful!', 'success');
        showToast(`Connected to ${repo} successfully`, 'success');
        
        return data;
        
    } catch (error) {
        updateAdminStatus('Connection failed', 'error');
        showToast(`Connection failed: ${error.message}`, 'error');
        throw error;
    }
}

async function importModelsFromGitHub() {
    try {
        // Save configuration first
        saveGitHubConfig();
        
        updateAdminStatus('Starting import...', 'loading');
        Elements.importStatus.style.display = 'block';
        Elements.importDetails.innerHTML = '<p>Connecting to GitHub repository...</p>';
        
        // Test connection first
        await testGitHubConnection();
        
        Elements.importDetails.innerHTML += '<p>Scanning for GLB files...</p>';
        
        // Import models
        const previousCount = State.models.length;
        await importFromGitHub();
        
        const importedCount = State.models.length - previousCount;
        
        // Update UI
        updateStats();
        populateCategories();
        filterAndSortModels();
        updateAdminModelList();
        
        Elements.importDetails.innerHTML += `
            <p><strong>Import completed successfully!</strong></p>
            <p>Imported ${importedCount} new models</p>
            <p>Total models: ${State.models.length}</p>
            <p>Security: All downloads will be auto-secured with Divine Mantra signature</p>
        `;
        
        updateAdminStatus('Import completed', 'success');
        showToast(`Imported ${importedCount} models from GitHub`, 'success');
        
        // Auto-close status after 5 seconds
        setTimeout(() => {
            Elements.importStatus.style.display = 'none';
        }, 5000);
        
    } catch (error) {
        console.error('Import error:', error);
        Elements.importDetails.innerHTML += `<p style="color: var(--error);"><strong>Import failed:</strong> ${error.message}</p>`;
        updateAdminStatus('Import failed', 'error');
        showToast(`Import failed: ${error.message}`, 'error');
    }
}

function exportModelList() {
    try {
        const exportData = {
            timestamp: new Date().toISOString(),
            totalModels: State.models.length,
            models: State.models.map(model => ({
                name: model.name,
                category: model.category,
                description: model.description,
                glbUrl: model.glbUrl,
                secure: model.secure,
                downloads: model.downloads,
                createdAt: model.createdAt
            }))
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `divine_models_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Model list exported successfully', 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showToast('Failed to export model list', 'error');
    }
}

function clearAllModels() {
    if (confirm('Are you sure you want to clear all models? This action cannot be undone.')) {
        State.models = [];
        updateCategories();
        saveToLocalStorage();
        updateStats();
        populateCategories();
        filterAndSortModels();
        updateAdminModelList();
        showToast('All models cleared', 'info');
    }
}

function deleteModelFromGallery(modelId) {
    const index = State.models.findIndex(m => m.id === modelId);
    if (index === -1) return;
    
    const modelName = State.models[index].name;
    State.models.splice(index, 1);
    
    updateCategories();
    saveToLocalStorage();
    updateStats();
    populateCategories();
    filterAndSortModels();
    updateAdminModelList();
    
    showToast(`${modelName} deleted from gallery`, 'info');
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
    if (typeof bytes !== 'number') return 'Unknown';
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
// EVENT LISTENERS SETUP
// ============================================

function setupEventListeners() {
    // Theme toggle
    Elements.themeToggle.onclick = () => {
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    };
    
    // Header scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            Elements.mainHeader.classList.add('scrolled');
        } else {
            Elements.mainHeader.classList.remove('scrolled');
        }
        
        // Show/hide scroll to top FAB
        if (window.scrollY > 500) {
            Elements.fabScrollTop.classList.add('visible');
        } else {
            Elements.fabScrollTop.classList.remove('visible');
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
    Elements.fabImport.onclick = openAdminPanel;
    
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
    
    // GitHub Import
    Elements.testConnection.onclick = testGitHubConnection;
    Elements.importModelsBtn.onclick = importModelsFromGitHub;
    
    // Save GitHub config on change
    [Elements.githubRepo, Elements.modelsPath, Elements.jsonUrl, Elements.autoRefresh, Elements.defaultCategory]
        .forEach(element => {
            element.addEventListener('change', saveGitHubConfig);
        });
    
    // Model Management
    Elements.exportModels.onclick = exportModelList;
    Elements.clearAllModels.onclick = clearAllModels;
    
    // Security
    Elements.autoSecure.addEventListener('change', (e) => {
        State.autoSecureDownloads = e.target.checked;
        saveToLocalStorage();
        showToast(`Auto-secure downloads ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
        renderModels(); // Update button text
    });
    
    Elements.resetSecurity.onclick = () => {
        if (confirm('Reset all security settings to defaults?')) {
            State.autoSecureDownloads = true;
            Elements.autoSecure.checked = true;
            saveToLocalStorage();
            showToast('Security settings reset to defaults', 'success');
            renderModels();
        }
    };
    
    Elements.backupData.onclick = () => {
        saveToLocalStorage();
        showToast('All data backed up to local storage', 'success');
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
        } else if (Elements.previewViewer.webkitRequestFullscreen) {
            Elements.previewViewer.webkitRequestFullscreen();
        }
    };
    
    Elements.resetView.onclick = () => {
        Elements.previewViewer.cameraOrbit = '0deg 75deg 105%';
        Elements.previewViewer.fieldOfView = '30deg';
    };
    
    // Scroll to top
    Elements.fabScrollTop.onclick = scrollToTop;
    
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
        showToast('Failed to load 3D model. The file might be corrupted or inaccessible.', 'error');
    });
    
    // Initialize hero preview with first model
    if (Elements.heroPreview && State.models.length > 0) {
        Elements.heroPreview.src = State.models[0].glbUrl;
    }
    
    // Handle touch events for mobile
    document.addEventListener('touchstart', () => {}, { passive: true });
    
    // Prevent zoom on double tap for mobile
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
}

// ============================================
// INITIALIZE
// ============================================

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

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
if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

// Handle online/offline status
window.addEventListener('online', () => {
    showToast('Back online. Models syncing...', 'success');
    loadModels();
});

window.addEventListener('offline', () => {
    showToast('You are offline. Using cached models.', 'warning');
});
